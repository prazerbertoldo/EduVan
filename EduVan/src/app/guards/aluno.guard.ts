import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AlunoGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUserValue();
  
  if (!user) {
    return router.createUrlTree(['/login-aluno']);
  }

  if (user.tipo !== 'aluno') {
    return router.createUrlTree(['/acesso-negado']);
  }

  return true;
};