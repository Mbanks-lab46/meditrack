IF DB_ID('MediTrack') IS NULL
    CREATE DATABASE MediTrack;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'meditrack_app')
    CREATE LOGIN meditrack_app WITH PASSWORD = 'App_Passw0rd_Local!',
CHECK_POLICY = ON;
GO

USE MediTrack;
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'meditrack_app')
BEGIN
    CREATE USER meditrack_app FOR LOGIN meditrack_app;
    ALTER ROLE db_datareader ADD MEMBER meditrack_app;
    ALTER ROLE db_datawriter ADD MEMBER meditrack_app;
    ALTER ROLE db_ddladmin  ADD MEMBER meditrack_app;
END
GO

USE MediTrack;
SELECT * FROM dbo.Users;
