import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GerenciarEnderecosPage } from './gerenciar-enderecos.page';

const routes: Routes = [
  {
    path: '',
    component: GerenciarEnderecosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenciarEnderecosPageRoutingModule {}