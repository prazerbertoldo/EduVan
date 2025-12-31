import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { AlertController, LoadingController, ModalController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-area-aluno',
  templateUrl: './area-aluno.page.html',
  styleUrls: ['./area-aluno.page.scss'],
  standalone: false,
})
export class AreaAlunoPage implements OnInit {
  activeSegment = 'home';
  agendamentoForm!: FormGroup;
  user: any;
  enderecos: any[] = [];
  avisos: any[] = [];
  agendamentos: any[] = [];
  agendamentosHoje: any[] = [];
  horarios: any[] = [];
  vanInfo: any = {
    placa: 'ABC-1234',
    motorista: 'João Silva'
  };

  // Adicione estas flags para controle de carregamento
  carregandoEnderecos = false;
  dadosCarregados = false;
  enderecoExpandido: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router,
    private modalController: ModalController,
    private menuController: MenuController
  ) {
    this.inicializarFormularios();
  }

  async ngOnInit() {
    this.user = this.authService.getCurrentUserValue();
    console.log('👤 Usuário carregado:', this.user);
    await this.carregarDados();
  }

  async carregarDados() {
    const loading = await this.loadingController.create({
      message: 'Carregando dados...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('🔄 Iniciando carregamento de dados...');

      // Carregar dados em paralelo para melhor performance
      const [enderecos, avisos, agendamentos, horarios] = await Promise.all([
        this.carregarEnderecos(),
        this.apiService.getAvisos().toPromise().catch(() => []),
        this.apiService.getAgendamentosByAluno(this.user.id).toPromise().catch(() => []),
        this.apiService.getHorarios().toPromise().catch(() => [])
      ]);

      this.enderecos = enderecos || [];
      this.avisos = avisos || [];
      this.agendamentos = agendamentos || [];
      this.horarios = horarios || [];

      console.log('✅ Dados carregados:');
      console.log('📍 Endereços:', this.enderecos.length);
      console.log('📢 Avisos:', this.avisos.length);
      console.log('📅 Agendamentos:', this.agendamentos.length);
      console.log('⏰ Horários:', this.horarios.length);

      // Filtrar agendamentos de hoje
      this.filtrarAgendamentosHoje();

      this.dadosCarregados = true;

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os dados.');
    } finally {
      await loading.dismiss();
    }
  }

  // MÉTODO: Carregar endereços separadamente com debug
  async carregarEnderecos(): Promise<any[]> {
    try {
      this.carregandoEnderecos = true;
      console.log(`📍 Buscando endereços para aluno ID: ${this.user.id}`);

      const enderecos = await this.apiService.getEnderecosByAluno(this.user.id).toPromise();
      console.log('📍 Endereços encontrados:', enderecos);

      return enderecos || [];
    } catch (error) {
      console.error('❌ Erro ao carregar endereços:', error);
      return [];
    } finally {
      this.carregandoEnderecos = false;
    }
  }

  // MÉTODO: Recarregar endereços quando entrar na aba de agendamento
  async segmentChanged(ev: any) {
    const novoSegmento = ev.detail.value;
    this.activeSegment = novoSegmento;

    console.log(`🔄 Mudando para segmento: ${novoSegmento}`);

    // Se for para agendamento e não tem endereços, recarregar
    if (novoSegmento === 'agendamento' && this.enderecos.length === 0) {
      console.log('🔄 Segmento agendamento ativo - recarregando endereços...');
      this.enderecos = await this.carregarEnderecos();
    }
  }

  navigateToSegment(segment: string) {
    console.log(`🔄 Navegando para segmento: ${segment}`);
    this.activeSegment = segment;

    // Recarregar endereços se necessário
    if (segment === 'agendamento' && this.enderecos.length === 0) {
      console.log('🔄 Navegação para agendamento - carregando endereços...');
      this.carregarEnderecos().then(enderecos => {
        this.enderecos = enderecos;
      });
    }

    this.closeMenu();
  }

  async closeMenu() {
    await this.menuController.close();
  }

  async cancelarAgendamento(agendamento: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Cancelamento',
      message: 'Tem certeza que deseja cancelar este agendamento?',
      buttons: [
        {
          text: 'Manter',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cancelar Agendamento',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cancelando agendamento...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              await this.apiService.deletarAgendamento(agendamento.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Agendamento cancelado com sucesso!');
              await this.carregarDados();
            } catch (error) {
              console.error('Erro ao cancelar agendamento:', error);
              this.mostrarAlerta('Erro', 'Não foi possível cancelar o agendamento.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getNomeEndereco(idEndereco: number): string {
    const endereco = this.enderecos.find(e => e.id === idEndereco);
    return endereco ? `${endereco.nome} - ${endereco.descricao}` : 'Endereço não encontrado';
  }

  formatarData(data: string): string {
    if (!data) return 'Data inválida';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarHorario(horarioId: number): string {
    const horario = this.horarios.find(h => h.id === horarioId);
    return horario && horario.horario ? horario.horario.substring(0, 5) : 'Horário não encontrado';
  }

  isAgendamentoFuturo(agendamento: any): boolean {
    if (!agendamento.dataAgendada) return false;
    const hoje = new Date();
    const dataAgendamento = new Date(agendamento.dataAgendada);
    return dataAgendamento >= hoje;
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-aluno']);
  }

  getDataMinima(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

  // MÉTODOS PARA GERENCIAR ENDEREÇOS DIRETAMENTE NA PÁGINA
  formatarCoordenadasEndereco(latitude: number, longitude: number): string {
    if (!latitude || !longitude) return 'Não informado';
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  async adicionarEndereco() {
    console.log('➕ Adicionando novo endereço');

    try {
      // Importação lazy do componente
      const { EditarEnderecoPage } = await import('../editar-endereco/editar-endereco.page');

      const modal = await this.modalController.create({
        component: EditarEnderecoPage,
        componentProps: {
          endereco: null
        }
      });

      modal.onDidDismiss().then(async (result) => {
        console.log('📝 Modal fechado:', result);
        if (result.data && result.data.success) {
          console.log('🔄 Recarregando endereços após adição...');
          await this.carregarEnderecos();
        }
      });

      await modal.present();
    } catch (error) {
      console.error('❌ Erro ao abrir modal de endereço:', error);
      this.mostrarAlerta('Erro', 'Não foi possível abrir o editor de endereços.');
    }
  }

  async excluirEndereco(endereco: any) {
    console.log('🗑️ Excluindo endereço:', endereco);

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o endereço "${endereco.nome}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo endereço...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              await this.apiService.deletarEndereco(endereco.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Endereço excluído com sucesso!');
              await this.carregarEnderecos();
            } catch (error) {
              console.error('Erro ao excluir endereço:', error);
              this.mostrarAlerta('Erro', 'Não foi possível excluir o endereço.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  filtrarAgendamentosHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    this.agendamentosHoje = this.agendamentos.filter(ag =>
      ag.dataAgendada && ag.dataAgendada.split('T')[0] === hoje
    );
  }

  private inicializarFormularios() {
    this.agendamentoForm = this.fb.group({
      endereco: ['', Validators.required],
      horario: ['', Validators.required],
      data: ['', Validators.required]
    });
  }

  async agendarTransporte() {
    if (this.agendamentoForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Agendando transporte...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const agendamentoData = {
          idAluno: this.user.id,
          idEndereco: this.agendamentoForm.value.endereco,
          idHorario: this.agendamentoForm.value.horario,
          dataAgendada: this.agendamentoForm.value.data
        };

        console.log('📤 Enviando agendamento:', agendamentoData);
        await this.apiService.criarAgendamento(agendamentoData).toPromise();

        this.mostrarAlerta('Sucesso', 'Transporte agendado com sucesso!');
        this.agendamentoForm.reset();

        // Recarregar agendamentos
        await this.carregarDados();

      } catch (error) {
        console.error('❌ Erro ao agendar transporte:', error);
        this.mostrarAlerta('Erro', 'Não foi possível agendar o transporte.');
      } finally {
        await loading.dismiss();
      }
    } else {
      console.log('❌ Formulário inválido:', this.agendamentoForm.errors);
      this.mostrarAlerta('Atenção', 'Preencha todos os campos obrigatórios.');
    }
  }

  // Método para gerenciar endereços do menu
  async gerenciarEnderecosFromMenu() {
    await this.closeMenu();
    this.activeSegment = 'meus-enderecos';
  }

  // Método para gerenciar endereços (mantido para compatibilidade)
  async gerenciarEnderecos() {
    this.activeSegment = 'meus-enderecos';
  }

  async editarEndereco(endereco: any) {
    console.log('✏️ Editando endereço:', endereco);

    try {
      // Importação lazy do componente
      const { EditarEnderecoPage } = await import('../editar-endereco/editar-endereco.page');

      const modal = await this.modalController.create({
        component: EditarEnderecoPage,
        componentProps: {
          endereco: endereco // Passa o endereço completo para edição
        }
      });

      modal.onDidDismiss().then(async (result) => {
        console.log('📝 Modal de edição fechado:', result);
        if (result.data && result.data.success) {
          console.log('🔄 Recarregando endereços após edição...');
          await this.carregarEnderecos();
          this.mostrarAlerta('Sucesso', 'Endereço atualizado com sucesso!');
        }
      });

      await modal.present();
    } catch (error) {
      console.error('❌ Erro ao abrir modal de edição:', error);
      this.mostrarAlerta('Erro', 'Não foi possível abrir o editor de endereços.');
    }
  }

  // Método para expandir/recolher endereço
  toggleEndereco(index: number) {
    if (this.enderecoExpandido === index) {
      // Se já está expandido, recolhe
      this.enderecoExpandido = null;
    } else {
      // Expande o novo item
      this.enderecoExpandido = index;
    }
    console.log('🔍 Endereço expandido:', this.enderecoExpandido);
  }
}