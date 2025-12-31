import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AreaAdminPageRoutingModule } from './area-admin-routing.module';
import { AreaAdminPage } from './area-admin.page';

@NgModule({
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AreaAdminPageRoutingModule
  ],
  declarations: [AreaAdminPage]
})
export class AreaAdminPageModule {}