import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { passwordMatch } from '../../validators/password-match.validator';
import { AuthService } from '../../core/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);
  busy = signal(false);
  error = signal<string | null>(null);

  regForm = inject(FormBuilder).nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(10)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordMatch },
  );

  submit() {
    this.busy.set(true);
    this.error.set(null);
    const { fullName, email, password } = this.regForm.getRawValue();
    this.auth.register(fullName, email, password).subscribe({
      next: () => this.router.navigate(['/patients']),
      error: (e: HttpErrorResponse) => {
        this.error.set(
          e.status === 409 ? 'That email is already registered.' : 'Could not create the account.',
        );
        this.busy.set(false);
      },
    });
  }
}
