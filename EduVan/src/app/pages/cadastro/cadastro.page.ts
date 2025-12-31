import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage {
  cadastroForm: FormGroup;
  showCnhField = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      telefone: ['', Validators.required],
      tipo: ['', Validators.required],
      cnh: ['']
    });

    this.cadastroForm.get('tipo')?.valueChanges.subscribe(value => {
      this.showCnhField = value === '2'; // 2 = motorista
      if (this.showCnhField) {
        this.cadastroForm.get('cnh')?.setValidators([Validators.required]);
      } else {
        this.cadastroForm.get('cnh')?.clearValidators();
      }
      this.cadastroForm.get('cnh')?.updateValueAndValidity();
    });
  }

  async onSubmit() {
    if (this.cadastroForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Cadastrando usuário...'
      });
      await loading.present();

      try {
        const usuarioData = {
          nome: this.cadastroForm.value.nome,
          email: this.cadastroForm.value.email,
          senha: this.cadastroForm.value.senha,
          telefone: this.cadastroForm.value.telefone,
          tipo: this.getTipoUsuario(this.cadastroForm.value.tipo),
          cnh: this.cadastroForm.value.cnh || null
        };

        // Verificar se email já existe
        const emailExists = await this.verificarEmailExistente(usuarioData.email);
        if (emailExists) {
          await this.mostrarAlerta('Erro', 'Este email já está cadastrado.');
          return;
        }

        // Criar usuário na API
        await this.apiService.criarUsuario(usuarioData).toPromise();

        await this.mostrarAlerta('Sucesso', 'Usuário cadastrado com sucesso!');
        this.router.navigate(['/login-aluno']);

      } catch (error: any) {
        console.error('Erro no cadastro:', error);
        let mensagemErro = 'Erro ao cadastrar usuário.';
        
        if (error.error && error.error.message) {
          mensagemErro = error.error.message;
        } else if (error.status === 0) {
          mensagemErro = 'Erro de conexão com o servidor. Verifique se a API está rodando.';
        }

        await this.mostrarAlerta('Erro', mensagemErro);
      } finally {
        await loading.dismiss();
      }
    }
  }

  private getTipoUsuario(tipoValue: string): string {
    switch (tipoValue) {
      case '1': return 'aluno';
      case '2': return 'motorista';
      case '3': return 'admin';
      default: return 'aluno';
    }
  }

  private async verificarEmailExistente(email: string): Promise<boolean> {
    try {
      const usuarios: any[] = await this.apiService.getUsuarios().toPromise();
      return usuarios.some(usuario => usuario.email === email);
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Validação de CPF (mantida como opção alternativa)
  formatarCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    this.cadastroForm.get('cpf')?.setValue(value);
  }
}