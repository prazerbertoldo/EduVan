import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginMotoristaPageRoutingModule } from './login-motorista-routing.module';
import { LoginMotoristaPage } from './login-motorista.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Adicione esta linha
    IonicModule,
    LoginMotoristaPageRoutingModule
  ],
  declarations: [LoginMotoristaPage]
})
export class LoginMotoristaPageModule {}
