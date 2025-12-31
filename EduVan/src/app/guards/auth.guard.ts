// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated.pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
      }
      
      const user = authService.getCurrentUserValue();
      const routePath = route.routeConfig?.path;
      
      // Só verifica o tipo se a rota for específica
      if (routePath && routePath.startsWith('home-')) {
        const requiredType = routePath.replace('home-', '');
        
        if (user?.tipo !== requiredType) {
          // Redireciona para home em vez de mostrar erro
          return router.createUrlTree(['/home']);
        }
      }
      
      return true;
    })
  );
};