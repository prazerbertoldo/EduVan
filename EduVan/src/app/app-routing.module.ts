// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AlunoGuard } from './guards/aluno.guard';
import { MotoristaGuard } from './guards/motorista.guard';
import { AdminGuard } from './guards/admin.guard';


const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', loadChildren: () => import('./pages/inicio/inicio.module').then(m => m.InicioPageModule) },
  { path: 'cadastro', loadChildren: () => import('./pages/cadastro/cadastro.module').then(m => m.CadastroPageModule) },
  { path: 'login-aluno', loadChildren: () => import('./pages/login-aluno/login-aluno.module').then(m => m.LoginAlunoPageModule) },
  { path: 'login-motorista', loadChildren: () => import('./pages/login-motorista/login-motorista.module').then(m => m.LoginMotoristaPageModule) },
  { path: 'login-admin', loadChildren: () => import('./pages/login-admin/login-admin.module').then(m => m.LoginAdminPageModule) },
   { 
    path: 'area-aluno', 
    loadChildren: () => import('./pages/area-aluno/area-aluno.module').then(m => m.AreaAlunoPageModule),
    canActivate: [AlunoGuard] // Só alunos podem acessar
  },
  { 
    path: 'area-motorista', 
    loadChildren: () => import('./pages/area-motorista/area-motorista.module').then(m => m.AreaMotoristaPageModule),
    canActivate: [MotoristaGuard] // Só motoristas podem acessar
  },
  { 
    path: 'area-admin', 
    loadChildren: () => import('./pages/area-admin/area-admin.module').then(m => m.AreaAdminPageModule),
    canActivate: [AdminGuard] // Só admins podem acessar
  },
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./pages/cadastro/cadastro.module').then( m => m.CadastroPageModule)
  },
  {
    path: 'login-aluno',
    loadChildren: () => import('./pages/login-aluno/login-aluno.module').then( m => m.LoginAlunoPageModule)
  },
  {
    path: 'login-motorista',
    loadChildren: () => import('./pages/login-motorista/login-motorista.module').then( m => m.LoginMotoristaPageModule)
  },
  {
    path: 'login-admin',
    loadChildren: () => import('./pages/login-admin/login-admin.module').then( m => m.LoginAdminPageModule)
  },
  {
    path: 'area-aluno',
    loadChildren: () => import('./pages/area-aluno/area-aluno.module').then( m => m.AreaAlunoPageModule)
  },
  {
    path: 'area-motorista',
    loadChildren: () => import('./pages/area-motorista/area-motorista.module').then( m => m.AreaMotoristaPageModule)
  },
  {
    path: 'area-admin',
    loadChildren: () => import('./pages/area-admin/area-admin.module').then( m => m.AreaAdminPageModule)
  },
  {
    path: 'editar-endereco',
    loadChildren: () => import('./pages/editar-endereco/editar-endereco.module').then(m => m.EditarEnderecoPageModule),
    canActivate: [AlunoGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}