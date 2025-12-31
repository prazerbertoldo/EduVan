import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUserValue();
  
  if (!user) {
    return router.createUrlTree(['/login-admin']);
  }

  if (user.tipo !== 'admin') {
    return router.createUrlTree(['/acesso-negado']);
  }

  return true;
};