import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const notInPast: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const chosen = new Date(control.value).getTime();
    return chosen < Date.now() ? { past: true } : null;
}