import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const MotoristaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUserValue();
  
  if (!user) {
    return router.createUrlTree(['/login-motorista']);
  }

  if (user.tipo !== 'motorista') {
    return router.createUrlTree(['/acesso-negado']);
  }

  return true;
};