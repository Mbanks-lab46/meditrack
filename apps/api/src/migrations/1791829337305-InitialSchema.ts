import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1791829337305 implements MigrationInterface {
    name = 'InitialSchema1791829337305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Appointments" ("Id" int NOT NULL IDENTITY(1,1), "PatientId" int NOT NULL, "ProviderName" nvarchar(100) NOT NULL, "ScheduledAt" datetime2 NOT NULL, "DurationMinutes" int NOT NULL CONSTRAINT "DF_e115d84774fef6a58c956ab0a8e" DEFAULT 30, "Reason" nvarchar(500), "Status" nvarchar(20) NOT NULL CONSTRAINT "DF_79c0f3b47cb4470a1cc14ebd243" DEFAULT 'scheduled', "CreatedAt" datetime2 NOT NULL CONSTRAINT "DF_d3d56e24f826242ec9c8f3adbf8" DEFAULT getdate(), CONSTRAINT "PK_4d4fd685913af7bea8c68340983" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE INDEX "IX_Appointments_PatientId_ScheduledAt" ON "Appointments" ("PatientId", "ScheduledAt") `);
        await queryRunner.query(`CREATE TABLE "Patients" ("Id" int NOT NULL IDENTITY(1,1), "FirstName " nvarchar(100) NOT NULL, "LastName" nvarchar(100) NOT NULL, "DateOfBirth" date NOT NULL, "Gender" nvarchar(20), "Phone" nvarchar(30), "Email" nvarchar(256), "CreatedAt" datetime2 NOT NULL CONSTRAINT "DF_9c93cdff9760a1aeffbb348e9f8" DEFAULT getdate(), "UpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_35f86eedd96339799264172d1dd" DEFAULT getdate(), CONSTRAINT "PK_00d9d670a1284cedf255178ebdb" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("Id" int NOT NULL IDENTITY(1,1), "Email" nvarchar(256) NOT NULL, "PasswordHash" nvarchar(255) NOT NULL, "FullName" nvarchar(100) NOT NULL, "Role" nvarchar(20) NOT NULL CONSTRAINT "DF_9688086cdc36904b1bb838ac1ef" DEFAULT 'staff', "CreatedAt" datetime2 NOT NULL CONSTRAINT "DF_0aacbc61aa36d6a82383817a94d" DEFAULT getdate(), CONSTRAINT "UQ_884fdf47515c24dbbf6d89c2d84" UNIQUE ("Email"), CONSTRAINT "PK_329bb2946729a51bd2b19a5159f" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD CONSTRAINT "FK_84af79fb20c75a666f8fed3efd5" FOREIGN KEY ("PatientId") REFERENCES "Patients"("Id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP CONSTRAINT "FK_84af79fb20c75a666f8fed3efd5"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Patients"`);
        await queryRunner.query(`DROP INDEX "IX_Appointments_PatientId_ScheduledAt" ON "Appointments"`);
        await queryRunner.query(`DROP TABLE "Appointments"`);
    }

}
