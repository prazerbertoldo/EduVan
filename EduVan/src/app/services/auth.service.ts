import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _currentUser = new BehaviorSubject<any>(null);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.checkToken();
  }

  checkToken() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this._currentUser.next(user);
      this._isAuthenticated.next(true);
    }
  }

  get isAuthenticated() {
    return this._isAuthenticated.asObservable();
  }

  get currentUser() {
    return this._currentUser.asObservable();
  }

  async login(email: string, senha: string, tipoRequerido: string): Promise<{ success: boolean; message: string }> {
    try {
      const usuarios: any[] = await this.apiService.getUsuarios().toPromise();
      const usuario = usuarios.find(u => u.email === email && u.senha === senha);
      
      if (usuario) {
        // Verificar se o tipo do usuário corresponde ao tipo requerido
        if (usuario.tipo !== tipoRequerido) {
          return { 
            success: false, 
            message: `Acesso permitido apenas para usuários do tipo ${tipoRequerido}. Seu tipo é: ${usuario.tipo}` 
          };
        }
        
        this._currentUser.next(usuario);
        this._isAuthenticated.next(true);
        localStorage.setItem('user', JSON.stringify(usuario));
        return { success: true, message: 'Login realizado com sucesso!' };
      }
      
      // Modo offline: verificar se há usuário salvo
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email === email && user.senha === senha) {
            if (user.tipo !== tipoRequerido) {
              return { 
                success: false, 
                message: `Acesso permitido apenas para usuários do tipo ${tipoRequerido}. Seu tipo é: ${user.tipo}` 
              };
            }
            this._currentUser.next(user);
            this._isAuthenticated.next(true);
            return { success: true, message: 'Login realizado com sucesso!' };
          }
        } catch (e) {
          console.error('Erro ao verificar usuário offline:', e);
        }
      }
      
      return { success: false, message: 'Email ou senha incorretos' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro ao conectar com o servidor' };
    }
  }

  async cadastrar(usuario: any): Promise<boolean> {
    try {
      // Verificar se o email já existe
      const usuarios: any[] = await this.apiService.getUsuarios().toPromise();
      const emailExists = usuarios.some(u => u.email === usuario.email);
      
      if (emailExists) {
        throw new Error('Email já cadastrado');
      }

      // Criar novo usuário
      const novoUsuario = await this.apiService.criarUsuario(usuario).toPromise();
      
      // Fazer login automaticamente após o cadastro
      const loginResult = await this.login(usuario.email, usuario.senha, usuario.tipo);
      return loginResult.success;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  logout() {
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getCurrentUserValue(): any {
    return this._currentUser.value;
  }

  // Método para verificar se o usuário atual tem um tipo específico
  hasUserType(tipo: string): boolean {
    const user = this.getCurrentUserValue();
    return user && user.tipo === tipo;
  }
}