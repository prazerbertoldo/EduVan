import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginMotoristaPage } from './login-motorista.page';

const routes: Routes = [
  {
    path: '',
    component: LoginMotoristaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginMotoristaPageRoutingModule {}