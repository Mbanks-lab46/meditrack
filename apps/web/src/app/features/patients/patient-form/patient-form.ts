import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PatientsService } from '../patients';

@Component({
  selector: 'app-patient-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.scss',
})
export class PatientForm implements OnInit {
  readonly id = input<string>();
  private api = inject(PatientsService);
  private router = inject(Router);
  saving = signal(false);
  error = signal<string | null>(null);

  ptForm = inject(FormBuilder).nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: ['', Validators.required],
    gender: [''],
    phone: [''],
    email: ['', [Validators.required, Validators.email]]
  });

  
  ngOnInit(): void {
    const id = this.id();
    if (id) this.api.get(+id).subscribe((p) => this.ptForm.patchValue(p));
  }

  save() {
    this.saving.set(true);
    const rawData = this.ptForm.getRawValue();

    const body = { ...rawData, gender: rawData.gender || undefined, phone: rawData.phone || undefined, email: rawData.email || undefined };
    const id = this.id();
    const request = id ? this.api.update(+id, body) : this.api.create(body);
    request.subscribe({
      next: (p) => this.router.navigate(['/patients', p.id]),
      error: (e) => {
        this.error.set(e.error?.message ?? 'Failed Save.');
        this.saving.set(false);
      }
    })
  }
}
