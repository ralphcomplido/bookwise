import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  error = '';
  isSubmitting = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    // ✅ fb is initialized now, safe to use
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const email = this.form.get('email')?.value ?? '';
    const password = this.form.get('password')?.value ?? '';

    this.auth.login(email, password).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Login successful (token saved).');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = err?.error?.title ?? err?.error ?? 'Login failed';
      }
    });
  }
}
