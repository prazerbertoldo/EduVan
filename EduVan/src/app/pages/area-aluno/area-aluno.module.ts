import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AreaAlunoPageRoutingModule } from './area-aluno-routing.module';
import { AreaAlunoPage } from './area-aluno.page';
import { EditarEnderecoPage } from '../editar-endereco/editar-endereco.page'; // ← ADICIONE ESTA LINHA

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AreaAlunoPageRoutingModule
  ],
  declarations: [AreaAlunoPage],
  providers: [EditarEnderecoPage] // ← ADICIONE AQUI TAMBÉM
})
export class AreaAlunoPageModule {}