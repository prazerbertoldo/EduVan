import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginAlunoPage } from './login-aluno.page';

const routes: Routes = [
  {
    path: '',
    component: LoginAlunoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginAlunoPageRoutingModule {}
