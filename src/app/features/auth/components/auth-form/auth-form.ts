import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-form.html',
  styleUrls: ['./auth-form.css']
})
export class AuthForm {
  @Input() formGroup!: FormGroup;
  @Input() isLoading: boolean = false;
  @Input() errorMessages: string[] = [];
  @Output() submitForm = new EventEmitter<void>();

  onSubmit() {
    this.submitForm.emit();
  }

  getControlError(controlName: string): string | null {
    const control = this.formGroup.get(controlName);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors?.['minlength']) {
        return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
      }
      if (control.errors?.['pattern']) {
        return 'Invalid format';
      }
    }
    return null;
  }
}