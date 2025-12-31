import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  
  standalone: false // Padrão (pode omitir)
})
export class InicioPage {
  constructor(private router: Router) {
    this.checkDarkMode()
  }

  goToLogin(tipo: string) {
    this.router.navigate([`login-${tipo}`]);
  }

  goToCadastro() {
    this.router.navigate(['cadastro']);
  }

  isDarkMode = false;

  checkDarkMode() {
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Ouvir mudanças no tema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
    });
  }

  getLogoPath(): string {
    return this.isDarkMode 
      ? 'assets/icon/eduvan-dark.png' 
      : 'assets/icon/eduvan-light.jpg';
  }
}

