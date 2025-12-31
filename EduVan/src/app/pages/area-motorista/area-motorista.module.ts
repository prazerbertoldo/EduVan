import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AreaMotoristaPageRoutingModule } from './area-motorista-routing.module';
import { AreaMotoristaPage } from './area-motorista.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AreaMotoristaPageRoutingModule
  ],
  declarations: [AreaMotoristaPage] // Componente declarado aqui
})
export class AreaMotoristaPageModule {}
