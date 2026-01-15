import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  error = '';
  isSubmitting = false;
  form: FormGroup;

  // Modal state
  showSuccessModal = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  private getPasswordClientError(password: string): string | null {
    if (!password || password.length < 6) {
      return 'Password is required (min 6 chars).';
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(password);

    if (!hasLower) return 'Password must have at least one lowercase letter.';
    if (!hasUpper) return 'Password must have at least one uppercase letter.';
    if (!hasDigit) return 'Password must have at least one number.';
    if (!hasNonAlphanumeric) return 'Password must have at least one special character (non-alphanumeric).';

    return null;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigateByUrl('/login');
  }

  submit(): void {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.get('email')?.value ?? '';
    const password = this.form.get('password')?.value ?? '';
    const confirmPassword = this.form.get('confirmPassword')?.value ?? '';

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    const pwError = this.getPasswordClientError(password);
    if (pwError) {
      this.error = pwError;
      return;
    }

    this.isSubmitting = true;

    this.auth.register(email, password).subscribe({
      next: () => {
        this.isSubmitting = false;

        // Show a site-styled modal instead of a browser alert
        this.successMessage = 'Registration successful. Please log in.';
        this.showSuccessModal = true;

        // Optional: clear form so user can’t double submit
        this.form.reset();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = JSON.stringify(err?.error) || 'Registration failed';
      }
    });
  }
}
