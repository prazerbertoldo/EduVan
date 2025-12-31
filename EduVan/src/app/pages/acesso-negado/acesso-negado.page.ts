import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-acesso-negado',
  templateUrl: './acesso-negado.page.html',
  styleUrls: ['./acesso-negado.page.scss'],
})
export class AcessoNegadoPage {
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUserValue();
  }

  voltar() {
    this.router.navigate(['/login']);
  }
}