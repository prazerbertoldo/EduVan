import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreaAdminPage } from './area-admin.page';

const routes: Routes = [
  { 
    path: '',
    component: AreaAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AreaAdminPageRoutingModule {}