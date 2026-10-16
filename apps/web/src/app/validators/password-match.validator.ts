import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;

    return password === confirm ? null : { mismatch: true };
}