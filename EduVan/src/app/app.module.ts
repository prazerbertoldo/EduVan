import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';

// Importe apenas os módulos, não os componentes
import { AreaAdminPageModule } from './pages/area-admin/area-admin.module';
import { AreaAlunoPageModule } from './pages/area-aluno/area-aluno.module';
import { AreaMotoristaPageModule } from './pages/area-motorista/area-motorista.module';
import { CadastroPageModule } from './pages/cadastro/cadastro.module';
import { InicioPageModule } from './pages/inicio/inicio.module';
import { LoginAdminPageModule } from './pages/login-admin/login-admin.module';
import { LoginAlunoPageModule } from './pages/login-aluno/login-aluno.module';
import { LoginMotoristaPageModule } from './pages/login-motorista/login-motorista.module';
import { GerenciarEnderecosPageModule } from './pages/gerenciar-enderecos/gerenciar-enderecos.module';
import { EditarEnderecoPageModule } from './pages/editar-endereco/editar-endereco.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    GoogleMapsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}