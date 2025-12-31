import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-motorista',
  templateUrl: './login-motorista.page.html',
  styleUrls: ['./login-motorista.page.scss'],
  standalone: false
})
export class LoginMotoristaPage {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  isDarkMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Autenticando...'
      });
      await loading.present();

      try {
        // Especificar que queremos login apenas para motoristas
        const result = await this.authService.login(
          this.loginForm.value.email,
          this.loginForm.value.password,
          'motorista' // Tipo requerido: motorista
        );

        await loading.dismiss();

        if (result.success) {
          this.router.navigate(['/area-motorista']);
        } else {
          this.showErrorAlert(result.message);
        }
      } catch (error: any) {
        await loading.dismiss();
        this.showErrorAlert(error.message || 'Erro ao conectar com o servidor');
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Erro',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  voltarParaInicio() {
    this.router.navigate(['/inicio']);
  }

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