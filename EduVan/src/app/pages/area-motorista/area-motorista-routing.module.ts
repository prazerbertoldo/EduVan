import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreaMotoristaPage } from './area-motorista.page';

const routes: Routes = [
  {
    path: '',
    component: AreaMotoristaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AreaMotoristaPageRoutingModule {}
