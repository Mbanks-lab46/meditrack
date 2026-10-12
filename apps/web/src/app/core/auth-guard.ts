import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};
