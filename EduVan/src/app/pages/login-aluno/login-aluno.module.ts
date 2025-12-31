import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginAlunoPageRoutingModule } from './login-aluno-routing.module';
import { LoginAlunoPage } from './login-aluno.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginAlunoPageRoutingModule
  ],
  declarations: [LoginAlunoPage]
})
export class LoginAlunoPageModule {}