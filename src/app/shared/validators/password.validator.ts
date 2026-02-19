import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
  static strength(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    
    if (!value) return null;

    const errors: ValidationErrors = {};
    
    if (value.length < 6) {
      errors['minLength'] = { requiredLength: 6, actualLength: value.length };
    }
    
    if (!/\d/.test(value)) {
      errors['requiresNumber'] = true;
    }
    
    if (!/[a-z]/.test(value)) {
      errors['requiresLowercase'] = true;
    }
    
    if (!/[A-Z]/.test(value)) {
      errors['requiresUppercase'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  }

  static match(passwordKey: string, confirmPasswordKey: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordKey)?.value;
      const confirmPassword = formGroup.get(confirmPasswordKey)?.value;
      
      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      
      return null;
    };
  }
}