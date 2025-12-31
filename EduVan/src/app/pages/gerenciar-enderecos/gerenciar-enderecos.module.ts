import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GerenciarEnderecosPageRoutingModule } from './gerenciar-enderecos-routing.module';
import { GerenciarEnderecosPage } from './gerenciar-enderecos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GerenciarEnderecosPageRoutingModule
  ],
  declarations: [GerenciarEnderecosPage]
})
export class GerenciarEnderecosPageModule {}