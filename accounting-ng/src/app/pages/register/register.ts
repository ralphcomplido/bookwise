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

    this.isSubmitting = true;

    this.auth.register(email, password).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Registration successful. Please log in.');
        this.router.navigateByUrl('/login');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = JSON.stringify(err?.error) || 'Registration failed';
      }
    });
  }
}
