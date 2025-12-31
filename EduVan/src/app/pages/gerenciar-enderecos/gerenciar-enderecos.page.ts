import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { EditarEnderecoPage } from '../editar-endereco/editar-endereco.page';

@Component({
  selector: 'app-gerenciar-enderecos',
  templateUrl: './gerenciar-enderecos.page.html',
  styleUrls: ['./gerenciar-enderecos.page.scss'],
  standalone: false,
})
export class GerenciarEnderecosPage implements OnInit {
  enderecos: any[] = [];
  user: any;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.user = this.authService.getCurrentUserValue();
    console.log('Usuário:', this.user);
    await this.carregarEnderecos();
  }

  async carregarEnderecos() {
    const loading = await this.loadingController.create({
      message: 'Carregando...',
    });
    await loading.present();

    try {
      console.log('Buscando endereços para aluno:', this.user.id);
      
      // Chamada direta à API
      const resposta = await this.apiService.getEnderecosByAluno(this.user.id).toPromise();
      console.log('Resposta da API:', resposta);
      
      this.enderecos = resposta || [];
      console.log('Endereços carregados:', this.enderecos);

    } catch (error) {
      console.error('Erro:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os endereços.');
    } finally {
      await loading.dismiss();
    }
  }

  async adicionarEndereco() {
    console.log('Abrindo modal para adicionar endereço');
    
    const modal = await this.modalController.create({
      component: EditarEnderecoPage,
      componentProps: {
        endereco: null
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.carregarEnderecos();
      }
    });

    await modal.present();
  }

  async editarEndereco(endereco: any) {
    console.log('Editando endereço:', endereco);
    
    const modal = await this.modalController.create({
      component: EditarEnderecoPage,
      componentProps: {
        endereco: endereco
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.carregarEnderecos();
      }
    });

    await modal.present();
  }

  async excluirEndereco(endereco: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `Excluir "${endereco.nome}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo...',
            });
            await loading.present();

            try {
              await this.apiService.deletarEndereco(endereco.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Endereço excluído!');
              this.carregarEnderecos();
            } catch (error) {
              console.error('Erro ao excluir:', error);
              this.mostrarAlerta('Erro', 'Não foi possível excluir.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  fechar() {
    this.modalController.dismiss({ reload: true });
  }

  formatarCoordenadas(latitude: number, longitude: number): string {
    if (!latitude || !longitude) return 'Não informado';
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}