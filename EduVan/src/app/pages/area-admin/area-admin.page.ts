import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-area-admin',
  templateUrl: './area-admin.page.html',
  styleUrls: ['./area-admin.page.scss'],
  standalone: false,
})
export class AreaAdminPage implements OnInit {
  sidebarOpen = false;
  activeArea = 'home';
  user: any;

  // Estatísticas para a página inicial
  totalAlunos: number = 0;
  totalVans: number = 0;
  totalMotoristas: number = 0;
  rotasHoje: number = 0;

  // Variáveis para gerenciamento de vans
  vans: any[] = [];
  motoristas: any[] = [];
  novaVanForm: FormGroup;
  editarVanForm: FormGroup;
  motivoForm: FormGroup;
  showVanForm = false;
  showEditarForm = false;
  isLoadingVans = false;
  vanEditando: any = null;

  // Variáveis para gerenciamento de alunos
  alunos: any[] = [];
  alunosExpandidos: Set<number> = new Set();
  enderecosAlunos: Map<number, any[]> = new Map();
  agendamentosAlunos: Map<number, any[]> = new Map();
  horarios: Map<number, any> = new Map();
  isLoadingAlunos = false;

  // Variáveis para gerenciamento de presença
  alunosSelecionados: Set<number> = new Set();
  vanSelecionada: any = null;
  presencasRegistradas: any[] = [];
  isLoadingPresenca = false;
  dataSelecionada: string = new Date().toISOString().split('T')[0];

  // Variáveis para atribuição de vans
  atribuicoesDoDia: any[] = [];
  atribuicaoSelecionada: any = {
    idMotorista: null,
    idVan: null,
    data: null
  };
  dataAtribuicao: string = new Date().toISOString().split('T')[0];
  isLoadingAtribuicao: boolean = false;

  // Variáveis para validação de acesso
  usuariosPendentes: any[] = [];
  usuariosAprovados: any[] = [];
  usuariosRejeitados: any[] = [];
  usuariosSuspensos: any[] = [];
  isLoadingValidacao: boolean = false;
  filtroStatus: string = 'pendentes';
  usuarioSelecionado: any = null;
  detalhesUsuario: any = null;
  motivoRejeicao: string = '';

  // No início da classe, adicione estas propriedades:
  vansParaLista: any[] = [];
  vanSelecionadaLista: any = null;
  rotasDaVanLista: any[] = [];
  agendamentosPorRotaLista: Map<number, any[]> = new Map();
  rotaExpandidaLista: number | null = null;
  isLoadingListaPresencas: boolean = false;

  // Variáveis para edição de atribuições
  atribuicaoEditando: any = null;

  // Variáveis para detalhes de motoristas
  motoristaExpandido: number | null = null;
  motoristaSelecionado: any = null;

  // Variáveis para controle das abas
  abaAtual: string = 'criar';
  mostrarDetalhesMotoristas: boolean = false;

  // Variáveis para controle das abas de presença
  abaPresenca: string = 'registrar';
  rotaExpandida: number | null = null;
  rotasDoDia: any[] = [];
  agendamentosPorRota: Map<number, any[]> = new Map();

  // Variáveis para edição de rota
  rotaEditando: any = null;
  agendamentosDisponiveisEdicao: any[] = [];
  agendamentosSelecionadosEdicao: Set<number> = new Set();
  isLoadingAgendamentosEdicao: boolean = false;

  // Adicione estas variáveis na classe AreaAdminPage
  horariosDisponiveis: any[] = [];
  horarioSelecionado: any = null;
  agendamentosPorHorario: Map<number, any[]> = new Map();
  rotasPorHorario: Map<number, any[]> = new Map();

  vanSelecionadaId: number | null = null;

  rotasDaVan: any[] = [];
  horariosOcupados: Set<number> = new Set();

  // No início da classe, adicione:
  alunosIndisponiveis: Set<number> = new Set();
  isLoadingAlunosIndisponiveis: boolean = false;

  // Variáveis para controle de alunos indisponíveis na edição
  alunosIndisponiveisEdicao: Set<number> = new Set();
  isLoadingAlunosIndisponiveisEdicao: boolean = false;

  // Variáveis para agrupamento por proximidade
  alunosAgrupadosPorProximidade: any[] = [];
  isCalculandoProximidade: boolean = false;
  raioProximidade: number; // em km

  minAlunosPorGrupo: number = 2;

  // Variáveis para Mural de Avisos
  avisos: any[] = [];
  novoAvisoForm: FormGroup;
  avisoEditando: any = null;
  isLoadingAvisos: boolean = false;
  categoriasAvisos: string[] = ['Geral', 'Urgente', 'Informação', 'Manutenção', 'Rotas', 'Outros'];

  @ViewChild('secaoMotivo', { static: false }) secaoMotivo!: ElementRef;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.novaVanForm = this.fb.group({
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{4}$/)]],
      capacidade: ['', [Validators.required, Validators.min(1), Validators.max(50)]]
    });

    this.editarVanForm = this.fb.group({
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{4}$/)]],
      capacidade: ['', [Validators.required, Validators.min(1), Validators.max(50)]]
    });

    this.motivoForm = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.raioProximidade = 2; // Raio padrão de 2km

    this.novoAvisoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      mensagem: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['Geral', [Validators.required]],
      prioridade: ['media', [Validators.required]],
      dataExpiracao: ['']
    });
  }

  async carregarMotoristasParaPresenca() {
    try {
      this.motoristas = await this.apiService.getMotoristas().toPromise() || [];

      console.log('Motoristas carregados (incluindo admins):', this.motoristas);

      const adminAtual = this.motoristas.find(m => m.id === this.user?.id);
      if (!adminAtual && this.user) {
        this.motoristas.push({
          id: this.user.id,
          nome: `${this.user.nome} (Você - Admin)`,
          email: this.user.email,
          telefone: this.user.telefone,
          tipo: 'admin'
        });
      }

    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar a lista de motoristas.');
    }
  }

  async carregarEstatisticas() {
    try {
      const [alunos, vans, motoristas, rotas] = await Promise.all([
        this.apiService.getAlunos().toPromise(),
        this.apiService.getVans().toPromise(),
        this.apiService.getMotoristas().toPromise(),
        this.apiService.getAgendamentosHoje().toPromise()
      ]);

      this.totalAlunos = alunos?.length || 0;
      this.totalVans = vans?.length || 0;
      this.totalMotoristas = motoristas?.length || 0;
      this.rotasHoje = rotas?.length || 0;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async adicionarVan() {
    if (this.novaVanForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Adicionando van...'
      });
      await loading.present();

      try {
        const vanData = {
          placa: this.novaVanForm.value.placa.toUpperCase(),
          capacidade: parseInt(this.novaVanForm.value.capacidade)
        };

        console.log('Enviando dados da van:', vanData);
        const novaVan = await this.apiService.criarVan(vanData).toPromise();
        console.log('Van criada com sucesso:', novaVan);

        this.mostrarAlerta('Sucesso', 'Van adicionada com sucesso!');
        this.novaVanForm.reset();
        this.showVanForm = false;
        await this.carregarVans();
      } catch (error: any) {
        console.error('Erro ao adicionar van:', error);
        let mensagem = 'Não foi possível adicionar a van.';

        if (error.error) {
          if (typeof error.error === 'string') {
            mensagem = error.error;
          } else if (error.error.message) {
            mensagem = error.error.message;
          }
        }

        this.mostrarAlerta('Erro', mensagem);
      } finally {
        await loading.dismiss();
      }
    }
  }

  async excluirVan(van: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a van ${van.placa}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo van...'
            });
            await loading.present();

            try {
              await this.apiService.deletarVan(van.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Van excluída com sucesso!');
              await this.carregarVans();
            } catch (error: any) {
              console.error('Erro ao excluir van:', error);
              let mensagem = 'Não foi possível excluir a van.';

              if (error.error) {
                if (typeof error.error === 'string') {
                  mensagem = error.error;
                } else if (error.error.message) {
                  mensagem = error.error.message;
                }
              }

              this.mostrarAlerta('Erro', mensagem);
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  toggleVanForm() {
    this.showVanForm = !this.showVanForm;
    this.showEditarForm = false;
    this.vanEditando = null;
    if (!this.showVanForm) {
      this.novaVanForm.reset();
    }
  }

  // Métodos para gerenciamento de alunos
  async carregarAlunos() {
    this.isLoadingAlunos = true;
    const loading = await this.loadingController.create({
      message: 'Carregando alunos...'
    });
    await loading.present();

    try {
      this.alunos = await this.apiService.getAlunos().toPromise() || [];
      console.log('Alunos carregados:', this.alunos);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os alunos.');
    } finally {
      this.isLoadingAlunos = false;
      await loading.dismiss();
    }
  }

  async toggleAlunoExpandido(alunoId: number) {
    if (this.alunosExpandidos.has(alunoId)) {
      this.alunosExpandidos.delete(alunoId);
    } else {
      this.alunosExpandidos.add(alunoId);
      await this.carregarDetalhesAluno(alunoId);
    }
  }

  async carregarDetalhesAluno(alunoId: number) {
    try {
      // Carregar endereços do aluno
      const enderecos = await this.apiService.getEnderecosByAluno(alunoId).toPromise() || [];
      this.enderecosAlunos.set(alunoId, enderecos);

      // Carregar agendamentos do aluno
      const agendamentos = await this.apiService.getAgendamentosByAluno(alunoId).toPromise() || [];
      this.agendamentosAlunos.set(alunoId, agendamentos);

      // Carregar horários dos agendamentos
      for (const agendamento of agendamentos) {
        if (agendamento.idHorario && !this.horarios.has(agendamento.idHorario)) {
          const horario = await this.apiService.getHorarioById(agendamento.idHorario).toPromise();
          this.horarios.set(agendamento.idHorario, horario);
        }
      }

    } catch (error) {
      console.error('Erro ao carregar detalhes do aluno:', error);
    }
  }

  getEnderecoPrincipal(alunoId: number): any {
    const enderecos = this.enderecosAlunos.get(alunoId) || [];
    return enderecos.length > 0 ? enderecos[0] : null;
  }

  getAgendamentoRecente(alunoId: number): any {
    const agendamentos = this.agendamentosAlunos.get(alunoId) || [];
    if (agendamentos.length === 0) return null;

    // Ordenar por data mais recente
    return agendamentos.sort((a, b) =>
      new Date(b.dataAgendada).getTime() - new Date(a.dataAgendada).getTime()
    )[0];
  }

  getHorarioAgendamento(agendamento: any): string {
    if (!agendamento || !agendamento.idHorario) return 'N/A';
    const horario = this.horarios.get(agendamento.idHorario);
    return horario ? horario.horario : 'N/A';
  }

  async excluirAluno(aluno: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o aluno ${aluno.nome}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo aluno...'
            });
            await loading.present();

            try {
              await this.apiService.deletarUsuario(aluno.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Aluno excluído com sucesso!');
              await this.carregarAlunos();
            } catch (error) {
              console.error('Erro ao excluir aluno:', error);
              this.mostrarAlerta('Erro', 'Não foi possível excluir o aluno.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Métodos para gerenciamento de presença
  async carregarPresencas() {
    this.isLoadingPresenca = true;
    try {
      this.vans = await this.apiService.getVans().toPromise() || [];

      await this.carregarMotoristasParaPresenca();

      this.atribuicaoSelecionada.idMotorista = null;

      this.alunos = await this.apiService.getAlunos().toPromise() || [];

    } catch (error) {
      console.error('Erro ao carregar dados de presença:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os dados.');
    } finally {
      this.isLoadingPresenca = false;
    }
  }

  toggleAlunoSelecionado(alunoId: number) {
    if (this.alunosSelecionados.has(alunoId)) {
      this.alunosSelecionados.delete(alunoId);
    } else {
      // Verificar se a van está cheia
      if (this.vanSelecionada && this.alunosSelecionados.size >= this.vanSelecionada.capacidade) {
        this.mostrarAlerta('Van Cheia', `A van ${this.vanSelecionada.placa} já está na capacidade máxima de ${this.vanSelecionada.capacidade} passageiros.`);
        return;
      }
      this.alunosSelecionados.add(alunoId);
    }
  }

  getAlunoPorId(alunoId: number): any {
    return this.alunos.find(aluno => aluno.id === alunoId);
  }

  isAlunoSelecionado(alunoId: number): boolean {
    return this.alunosSelecionados.has(alunoId);
  }

  async registrarPresencas() {
    if (!this.vanSelecionada) {
      this.mostrarAlerta('Seleção Necessária', 'Selecione uma van primeiro.');
      return;
    }

    if (this.alunosSelecionados.size === 0) {
      this.mostrarAlerta('Seleção Necessária', 'Selecione pelo menos um aluno.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando presenças...'
    });
    await loading.present();

    try {
      const hoje = this.dataSelecionada;

      // Registrar presença para cada aluno selecionado
      for (const alunoId of this.alunosSelecionados) {
        const aluno = this.getAlunoPorId(alunoId);

        const presencaData = {
          idAluno: alunoId,
          idVan: this.vanSelecionada.id,
          presente: true,
          data: hoje,
          observacao: `Presença registrada em ${hoje} para van ${this.vanSelecionada.placa}`
        };

        await this.apiService.criarAviso(presencaData).toPromise();
      }

      this.mostrarAlerta('Sucesso', `Presenças registradas com sucesso para ${this.alunosSelecionados.size} alunos na van ${this.vanSelecionada.placa}.`);

      // Limpar seleções
      this.alunosSelecionados.clear();
      this.vanSelecionada = null;

    } catch (error) {
      console.error('Erro ao registrar presenças:', error);
      this.mostrarAlerta('Erro', 'Não foi possível registrar as presenças.');
    } finally {
      await loading.dismiss();
    }
  }

  async cancelarPresenca(alunoId: number) {
    const alert = await this.alertController.create({
      header: 'Cancelar Presença',
      message: 'Tem certeza que deseja cancelar a presença deste aluno?',
      buttons: [
        {
          text: 'Manter',
          role: 'cancel'
        },
        {
          text: 'Cancelar Presença',
          handler: async () => {
            this.alunosSelecionados.delete(alunoId);
            this.mostrarAlerta('Presença Cancelada', 'A presença do aluno foi cancelada.');
          }
        }
      ]
    });

    await alert.present();
  }

  limparSelecoes() {
    this.alunosSelecionados.clear();
    this.vanSelecionada = null;
    this.mostrarAlerta('Seleções Limpas', 'Todas as seleções foram limpas.');
  }

  limparSelecaoUsuario() {
    this.usuarioSelecionado = null;
    this.detalhesUsuario = null;
    this.motivoRejeicao = '';
    if (this.motivoForm) this.motivoForm.reset();
  }

  async salvarAtribuicao() {
    if (!this.atribuicaoSelecionada.idMotorista || !this.atribuicaoSelecionada.idVan) {
      this.mostrarAlerta('Campos obrigatórios', 'Selecione um motorista e uma van.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Salvando atribuição...'
    });
    await loading.present();

    try {
      const dadosAtribuicao = {
        idMotorista: this.atribuicaoSelecionada.idMotorista,
        idVan: this.atribuicaoSelecionada.idVan,
        data: this.dataAtribuicao
      };

      // Verificar se já existe atribuição para este motorista na data
      const atribuicaoExistente = this.atribuicoesDoDia.find(a =>
        a.idMotorista === dadosAtribuicao.idMotorista && a.data === dadosAtribuicao.data
      );

      if (atribuicaoExistente) {
        this.mostrarAlerta('Atenção', 'Este motorista já tem uma van atribuída para esta data.');
        return;
      }

      // Verificar se a van já está atribuída na data
      const vanAtribuida = this.atribuicoesDoDia.find(a =>
        a.idVan === dadosAtribuicao.idVan && a.data === dadosAtribuicao.data
      );

      if (vanAtribuida) {
        this.mostrarAlerta('Atenção', 'Esta van já está atribuída para esta data.');
        return;
      }

      // Salvar a atribuição
      const novaAtribuicao = await this.apiService.criarRota(dadosAtribuicao).toPromise();
      this.mostrarAlerta('Sucesso', 'Van atribuída com sucesso!');

      // Recarregar a lista
      await this.carregarAtribuicoes();

    } catch (error) {
      console.error('Erro ao salvar atribuição:', error);
      this.mostrarAlerta('Erro', 'Não foi possível salvar a atribuição.');
    } finally {
      await loading.dismiss();
    }
  }

  async excluirAtribuicao(atribuicao: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja remover a atribuição da van ${this.getVanPorId(atribuicao.idVan)?.placa} do motorista ${this.getMotoristaPorId(atribuicao.idMotorista)?.nome}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo atribuição...'
            });
            await loading.present();

            try {
              await this.apiService.deletarRota(atribuicao.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Atribuição removida com sucesso!');
              await this.carregarAtribuicoes();
            } catch (error) {
              console.error('Erro ao excluir atribuição:', error);
              this.mostrarAlerta('Erro', 'Não foi possível remover a atribuição.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getMotoristaPorId(id: number): any {
    return this.motoristas.find(m => m.id === id);
  }

  getVanPorId(id: number): any {
    return this.vans.find(v => v.id === id);
  }

  async editarAluno(aluno: any) {
    const alert = await this.alertController.create({
      header: 'Editar Aluno',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          value: aluno.nome,
          placeholder: 'Nome'
        },
        {
          name: 'email',
          type: 'email',
          value: aluno.email,
          placeholder: 'Email'
        },
        {
          name: 'telefone',
          type: 'tel',
          value: aluno.telefone,
          placeholder: 'Telefone'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: async (data) => {
            const loading = await this.loadingController.create({
              message: 'Salvando alterações...'
            });
            await loading.present();

            try {
              const alunoData = {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                // Mantenha os outros campos necessários
                tipo: aluno.tipo,
                senha: aluno.senha // Se necessário
              };

              console.log('Enviando dados para atualização:', alunoData);

              await this.apiService.atualizarUsuario(aluno.id, alunoData).toPromise();

              this.mostrarAlerta('Sucesso', 'Aluno atualizado com sucesso!');
              await this.carregarAlunos();
            } catch (error: any) {
              console.error('Erro completo ao atualizar aluno:', error);

              let mensagem = 'Não foi possível atualizar o aluno.';
              if (error.error) {
                if (typeof error.error === 'string') {
                  mensagem = error.error;
                } else if (error.error.message) {
                  mensagem = error.error.message;
                } else if (error.error.error) {
                  mensagem = error.error.error;
                }
              }

              this.mostrarAlerta('Erro', mensagem);
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async carregarDetalhesUsuario(usuarioId: number) {
    try {
      this.detalhesUsuario = await this.apiService.getUsuarioById(usuarioId).toPromise();
    } catch (error) {
      console.error('Erro ao carregar detalhes do usuário:', error);
    }
  }

  getStatusBadgeColor(status: string): string {
    if (!status) return 'warning';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'aprovado':
        return 'success';
      case 'rejected':
      case 'rejeitado':
        return 'danger';
      case 'pending':
      case 'pendente':
        return 'warning';
      case 'suspended':
      case 'suspenso':
        return 'medium';
      default:
        return 'warning';
    }
  }

  getStatusText(status: string): string {
    if (!status) return 'Pendente';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'aprovado':
        return 'Aprovado';
      case 'rejected':
      case 'rejeitado':
        return 'Rejeitado';
      case 'pending':
      case 'pendente':
        return 'Pendente';
      case 'suspended':
      case 'suspenso':
        return 'Suspenso';
      default:
        return 'Pendente';
    }
  }

  async aprovarUsuarioRejeitado(usuario: any) {
    await this.aprovarUsuario(usuario);
  }

  // Método para aprovar usuário
  async aprovarUsuario(usuario: any) {
    const loading = await this.loadingController.create({
      message: 'Aprovando usuário...'
    });
    await loading.present();

    try {
      await this.apiService.aprovarUsuario(usuario.id).toPromise();
      this.mostrarAlerta('Sucesso', 'Usuário aprovado com sucesso!');
      await this.carregarValidacaoAcesso();
    } catch (error: any) {
      console.error('Erro ao aprovar usuário:', error);
      let mensagem = 'Não foi possível aprovar o usuário.';
      if (error.error) {
        if (typeof error.error === 'string') {
          mensagem = error.error;
        } else if (error.error.message) {
          mensagem = error.error.message;
        }
      }
      this.mostrarAlerta('Erro', mensagem);
    } finally {
      await loading.dismiss();
    }
  }

  // Método utilitário para mostrar alertas
  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Método para mostrar aviso de funcionalidade em desenvolvimento
  mostrarEmDesenvolvimento() {
    this.mostrarAlerta('Funcionalidade em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.');
  }

  // Logout do usuário
  logout() {
    try {
      this.authService.logout();
    } catch (e) {
      console.warn('Logout: erro ao chamar authService.logout()', e);
    }
    this.router.navigate(['/inicio']);
  }

  getUsuariosFiltrados(): any[] {
    switch (this.filtroStatus) {
      case 'pendentes': return this.usuariosPendentes;
      case 'aprovados': return this.usuariosAprovados;
      case 'rejeitados': return this.usuariosRejeitados;
      case 'suspensos': return this.usuariosSuspensos;
      default: return [];
    }
  }

  onSegmentChange(event: any) {
    this.filtroStatus = event.detail.value || 'pendentes';
    this.limparSelecaoUsuario();
  }

  async selecionarUsuario(usuario: any, scrollParaMotivo: boolean = false) {
    this.usuarioSelecionado = usuario;
    this.motivoRejeicao = '';
    await this.carregarDetalhesUsuario(usuario.id);

    if (scrollParaMotivo && this.secaoMotivo) {
      setTimeout(() => {
        this.secaoMotivo.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  async rejeitarUsuario() {
    if (this.motivoRejeicao && this.motivoRejeicao.length >= 10 && this.usuarioSelecionado) {
      const loading = await this.loadingController.create({ message: 'Rejeitando usuário...' });
      await loading.present();
      try {
        await this.apiService.rejeitarUsuario(this.usuarioSelecionado.id, this.motivoRejeicao).toPromise();
        this.mostrarAlerta('Sucesso', 'Usuário rejeitado com sucesso!');
        await this.carregarValidacaoAcesso();
      } catch (error) {
        console.error('Erro ao rejeitar usuário:', error);
        this.mostrarAlerta('Erro', 'Não foi possível rejeitar o usuário.');
      } finally {
        await loading.dismiss();
      }
    } else {
      this.mostrarAlerta('Erro', 'Informe um motivo válido com pelo menos 10 caracteres.');
    }
  }

  async suspenderUsuario(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Suspender Usuário',
      inputs: [
        {
          name: 'motivo',
          type: 'text',
          placeholder: 'Motivo da suspensão (mínimo 10 caracteres)',
          attributes: { required: true, minlength: 10 }
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Suspender',
          handler: async (data) => {
            if (!data.motivo || data.motivo.length < 10) {
              this.mostrarAlerta('Erro', 'Informe um motivo com pelo menos 10 caracteres.');
              return false;
            }
            const loading = await this.loadingController.create({ message: 'Suspendendo usuário...' });
            await loading.present();
            try {
              await this.apiService.suspenderUsuario(usuario.id, data.motivo).toPromise();
              this.mostrarAlerta('Sucesso', 'Usuário suspenso com sucesso!');
              await this.carregarValidacaoAcesso();
              return true;
            } catch (error) {
              console.error('Erro ao suspender usuário:', error);
              this.mostrarAlerta('Erro', 'Não foi possível suspender o usuário.');
              return false;
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async ativarUsuario(usuario: any) {
    const loading = await this.loadingController.create({ message: 'Ativando usuário...' });
    await loading.present();
    try {
      await this.apiService.ativarUsuario(usuario.id).toPromise();
      this.mostrarAlerta('Sucesso', 'Usuário ativado com sucesso!');
      await this.carregarValidacaoAcesso();
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      this.mostrarAlerta('Erro', 'Não foi possível ativar o usuário.');
    } finally {
      await loading.dismiss();
    }
  }

  async testarConexaoAPI() {
    try {
      console.log('=== TESTE DE CONEXÃO COM API ===');

      // Testar conexão básica
      const health = await this.apiService.testarConexao().toPromise();
      console.log('✅ Health check:', health);

      // Testar endpoint de usuários
      const usuarios = await this.apiService.getUsuarios().toPromise();
      console.log('✅ Usuários carregados:', usuarios?.length);

      if (usuarios && usuarios.length > 0) {
        console.log('📋 Primeiro usuário:', usuarios[0]);

        // Testar se podemos fazer um UPDATE simples
        const usuarioTeste = usuarios[0];
        console.log('🔄 Testando atualização simples...');

        try {
          const resultado = await this.apiService.atualizarUsuario(usuarioTeste.id, {
            nome: usuarioTeste.nome, // manter o mesmo nome
            status: 'aprovado'
          }).toPromise();
          console.log('✅ Update simples funcionou:', resultado);
        } catch (updateError) {
          console.error('❌ Update simples falhou:', updateError);
        }
      }

    } catch (error) {
      console.error('❌ Erro geral no teste de conexão:', error);
      this.mostrarAlerta('Erro de Conexão',
        'Não foi possível conectar com a API. Verifique:\n\n' +
        '1. A API está rodando?\n' +
        '2. A URL está correta?\n' +
        '3. O CORS está habilitado?'
      );
    }
  }

  async carregarValidacaoAcesso() {
    this.isLoadingValidacao = true;
    const loading = await this.loadingController.create({
      message: 'Carregando usuários...'
    });

    try {
      await loading.present();

      // Carregar usuários por status específico
      const [pendentes, aprovados, rejeitados, suspensos] = await Promise.all([
        this.apiService.getUsuariosPendentes().toPromise(),
        this.apiService.getUsuariosAprovados().toPromise(),
        this.apiService.getUsuariosRejeitados().toPromise(),
        this.apiService.getUsuariosSuspensos().toPromise()
      ]);

      console.log('Usuários carregados por status:');
      console.log('Pendentes:', pendentes);
      console.log('Aprovados:', aprovados);
      console.log('Rejeitados:', rejeitados);
      console.log('Suspensos:', suspensos);

      // Atribuir os resultados
      this.usuariosPendentes = Array.isArray(pendentes) ? pendentes : [];
      this.usuariosAprovados = Array.isArray(aprovados) ? aprovados : [];
      this.usuariosRejeitados = Array.isArray(rejeitados) ? rejeitados : [];
      this.usuariosSuspensos = Array.isArray(suspensos) ? suspensos : [];

      console.log('Total de usuários:');
      console.log(`Pendentes: ${this.usuariosPendentes.length}`);
      console.log(`Aprovados: ${this.usuariosAprovados.length}`);
      console.log(`Rejeitados: ${this.usuariosRejeitados.length}`);
      console.log(`Suspensos: ${this.usuariosSuspensos.length}`);

      this.limparSelecaoUsuario();

    } catch (error) {
      console.error('Erro ao carregar validação de acesso:', error);

      // Fallback: carregar todos os usuários e filtrar localmente
      console.log('Tentando fallback: carregar todos os usuários...');
      try {
        const todosUsuarios = await this.apiService.getTodosUsuarios().toPromise();
        if (Array.isArray(todosUsuarios)) {
          this.usuariosPendentes = todosUsuarios.filter(u =>
            !u.status || u.status === 'pending' || u.status === 'pendente'
          );
          this.usuariosAprovados = todosUsuarios.filter(u =>
            u.status === 'approved' || u.status === 'aprovado'
          );
          this.usuariosRejeitados = todosUsuarios.filter(u =>
            u.status === 'rejected' || u.status === 'rejeitado'
          );
          this.usuariosSuspensos = todosUsuarios.filter(u =>
            u.status === 'suspended' || u.status === 'suspenso'
          );
        }
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        this.mostrarAlerta('Erro', 'Não foi possível carregar os usuários. Verifique a conexão com a API.');
      }
    } finally {
      this.isLoadingValidacao = false;
      await loading.dismiss();
    }
  }

  async testarEndpointUsuarios() {
    const loading = await this.loadingController.create({
      message: 'Testando endpoints...'
    });
    await loading.present();

    try {
      console.log('=== TESTE COMPLETO DE ENDPOINTS ===');

      // Testar endpoints específicos
      const endpoints = [
        '/usuarios/status/pendente',
        '/usuarios/status/aprovado',
        '/usuarios/status/rejeitado',
        '/usuarios/status/suspenso',
        '/usuarios'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.apiService.testarEndpoint(endpoint).toPromise();
          console.log(`✅ ${endpoint}:`, response);
        } catch (error) {
          console.error(`❌ ${endpoint}:`, error);
        }
      }

      this.mostrarAlerta('Teste Concluído', 'Verifique o console para os resultados dos endpoints.');

    } catch (error) {
      console.error('Erro no teste:', error);
      this.mostrarAlerta('Erro', 'Falha ao testar endpoints.');
    } finally {
      await loading.dismiss();
    }
  }

  // Variáveis para gerenciar presenças
  agendamentosDisponiveis: any[] = [];
  agendamentosSelecionados: Set<number> = new Set();
  isLoadingAgendamentos: boolean = false;

  // Método para remover agendamento específico
  removerAgendamentoSelecionado(agendamentoId: number) {
    this.agendamentosSelecionados.delete(agendamentoId);
  }

  // Métodos para verificar disponibilidade
  isMotoristaAtribuido(motoristaId: number): boolean {
    return this.atribuicoesDoDia.some(a => a.idMotorista === motoristaId);
  }

  isVanAtribuida(vanId: number): boolean {
    return this.atribuicoesDoDia.some(a => a.idVan === vanId);
  }

  // Métodos para seleção
  onMotoristaSelecionado() {
    // Lógica adicional quando motorista é selecionado
  }

  onVanSelecionada() {
    // Lógica adicional quando van é selecionada
  }

  // Métodos para edição
  editarAtribuicao(atribuicao: any) {
    this.atribuicaoEditando = { ...atribuicao }; // Cria uma cópia
  }

  async salvarEdicaoAtribuicao() {
    if (!this.atribuicaoEditando.idMotorista || !this.atribuicaoEditando.idVan) {
      this.mostrarAlerta('Campos obrigatórios', 'Selecione um motorista e uma van.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Atualizando atribuição...'
    });
    await loading.present();

    try {
      await this.apiService.atualizarRota(this.atribuicaoEditando.id, this.atribuicaoEditando).toPromise();
      this.mostrarAlerta('Sucesso', 'Atribuição atualizada com sucesso!');
      await this.carregarAtribuicoes();
    } catch (error) {
      console.error('Erro ao atualizar atribuição:', error);
      this.mostrarAlerta('Erro', 'Não foi possível atualizar a atribuição.');
    } finally {
      await loading.dismiss();
    }
  }

  cancelarEdicaoAtribuicao() {
    this.atribuicaoEditando = null;
  }

  // No método carregarAtribuicoes(), atualize para incluir o admin
  async carregarAtribuicoes() {
    this.isLoadingAtribuicao = true;
    const loading = await this.loadingController.create({
      message: 'Carregando dados...'
    });
    await loading.present();

    try {
      console.log('Carregando motoristas...');
      // Carregar motoristas (incluindo admins)
      this.motoristas = await this.apiService.getMotoristas().toPromise() || [];

      // Adicionar o admin atual à lista de motoristas se não estiver incluído
      if (this.user && this.user.tipo === 'admin') {
        const adminJaNaLista = this.motoristas.some(m => m.id === this.user.id);
        if (!adminJaNaLista) {
          this.motoristas.unshift({
            id: this.user.id,
            nome: `${this.user.nome} (Você)`,
            cnh: this.user.cnh || 'Admin',
            tipo: 'admin'
          });
        }
      }

      console.log('Motoristas carregados:', this.motoristas);

      console.log('Carregando vans...');
      // Carregar vans
      this.vans = await this.apiService.getVans().toPromise() || [];
      console.log('Vans carregadas:', this.vans);

      console.log('Carregando atribuições para data:', this.dataAtribuicao);
      // Carregar atribuições do dia com detalhes
      this.atribuicoesDoDia = await this.apiService.getRotasComDetalhes(this.dataAtribuicao).toPromise() || [];
      console.log('Atribuições carregadas:', this.atribuicoesDoDia);

      // Resetar formulário
      this.atribuicaoSelecionada = {
        idMotorista: null,
        idVan: null,
        data: this.dataAtribuicao
      };

      this.atribuicaoEditando = null;

    } catch (error) {
      console.error('Erro ao carregar dados de atribuição:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os dados para atribuição.');
    } finally {
      this.isLoadingAtribuicao = false;
      await loading.dismiss();
    }
  }

  // Método para verificar se é o usuário atual
  isUsuarioAtual(motoristaId: number): boolean {
    return this.user && motoristaId === this.user.id;
  }

  // Método para verificar se o admin pode editar/excluir uma atribuição
  podeGerenciarAtribuicao(atribuicao: any): boolean {
    // Admin pode gerenciar qualquer atribuição, ou se for a sua própria
    return this.user?.tipo === 'admin' || this.isUsuarioAtual(atribuicao.idMotorista);
  }

  // Método separado para salvar após confirmação
  async salvarAtribuicaoConfirmada() {
    const loading = await this.loadingController.create({
      message: 'Salvando atribuição...'
    });
    await loading.present();

    try {
      const dadosAtribuicao = {
        idMotorista: this.atribuicaoSelecionada.idMotorista,
        idVan: this.atribuicaoSelecionada.idVan,
        data: this.dataAtribuicao
      };

      // Verificar se já existe atribuição para este motorista na data
      const atribuicaoExistente = this.atribuicoesDoDia.find(a =>
        a.idMotorista === dadosAtribuicao.idMotorista && a.data === dadosAtribuicao.data
      );

      if (atribuicaoExistente) {
        this.mostrarAlerta('Atenção', 'Este motorista já tem uma van atribuída para esta data.');
        return;
      }

      // Verificar se a van já está atribuída na data
      const vanAtribuida = this.atribuicoesDoDia.find(a =>
        a.idVan === dadosAtribuicao.idVan && a.data === dadosAtribuicao.data
      );

      if (vanAtribuida) {
        this.mostrarAlerta('Atenção', 'Esta van já está atribuída para esta data.');
        return;
      }

      // Salvar a atribuição
      const novaAtribuicao = await this.apiService.criarRota(dadosAtribuicao).toPromise();

      const mensagem = this.isUsuarioAtual(this.atribuicaoSelecionada.idMotorista)
        ? 'Van atribuída a você com sucesso!'
        : 'Van atribuída com sucesso!';

      this.mostrarAlerta('Sucesso', mensagem);

      // Recarregar a lista
      await this.carregarAtribuicoes();

    } catch (error) {
      console.error('Erro ao salvar atribuição:', error);
      this.mostrarAlerta('Erro', 'Não foi possível salvar a atribuição.');
    } finally {
      await loading.dismiss();
    }
  }

  // Método para atribuir van automaticamente ao admin
  async atribuirVanParaMim() {
    if (!this.user) {
      this.mostrarAlerta('Erro', 'Usuário não identificado.');
      return;
    }

    // Verificar se já existe uma van atribuída ao admin
    if (this.isMotoristaAtribuido(this.user.id)) {
      this.mostrarAlerta('Atenção', 'Você já tem uma van atribuída para esta data.');
      return;
    }

    // Encontrar uma van disponível
    const vanDisponivel = this.vans.find(van => !this.isVanAtribuida(van.id));

    if (!vanDisponivel) {
      this.mostrarAlerta('Atenção', 'Não há vans disponíveis para esta data.');
      return;
    }

    // Preencher automaticamente o formulário
    this.atribuicaoSelecionada.idMotorista = this.user.id;
    this.atribuicaoSelecionada.idVan = vanDisponivel.id;

    // Mostrar confirmação
    const confirm = await this.alertController.create({
      header: 'Confirmar Atribuição Automática',
      message: `Deseja atribuir a van ${vanDisponivel.placa} a você mesmo para a data ${this.dataAtribuicao}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.salvarAtribuicaoConfirmada();
          }
        }
      ]
    });

    await confirm.present();
  }



  // Método para obter informações completas do motorista
  getDetalhesMotorista(motoristaId: number): string {
    const motorista = this.getMotoristaPorId(motoristaId);
    if (!motorista) return '';

    let detalhes = `Email: ${motorista.email}\n`;
    detalhes += `Telefone: ${motorista.telefone}\n`;
    detalhes += `CNH: ${motorista.cnh || 'Não informada'}\n`;
    detalhes += `Tipo: ${motorista.tipo || 'motorista'}\n`;
    detalhes += `Status: ${this.getStatusText(motorista.status)}`;

    return detalhes;
  }



  // Método para expandir/recolher detalhes do motorista
  toggleDetalhesMotorista(motoristaId: number) {
    if (this.motoristaExpandido === motoristaId) {
      this.motoristaExpandido = null;
      this.motoristaSelecionado = null;
    } else {
      this.motoristaExpandido = motoristaId;
      this.motoristaSelecionado = this.getMotoristaPorId(motoristaId);
    }
  }

  // Método para mudar entre abas
  mudarAba(event: any) {
    this.abaAtual = event.detail.value;
  }

  // Método para mostrar/ocultar detalhes dos motoristas
  toggleDetalhesMotoristas() {
    this.mostrarDetalhesMotoristas = !this.mostrarDetalhesMotoristas;
  }

  // Método simplificado para selecionar motorista
  selecionarMotorista(motoristaId: number) {
    if (this.isMotoristaAtribuido(motoristaId)) {
      this.mostrarAlerta('Atenção', 'Este motorista já tem uma van atribuída para esta data.');
      return;
    }

    this.atribuicaoSelecionada.idMotorista = motoristaId;
  }

  // Método simplificado para texto do motorista
  getTextoMotorista(motorista: any): string {
    let texto = motorista.nome;
    return texto;
  }


  // Método para expandir/recolher detalhes da rota
  toggleDetalhesRota(rotaId: number) {
    if (this.rotaExpandida === rotaId) {
      this.rotaExpandida = null;
    } else {
      this.rotaExpandida = rotaId;
    }
  }


  // Método para excluir rota
  async excluirRota(rota: any) {
    const confirm = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a rota da van ${rota.placaVan} com ${this.getQuantidadeAlunosRota(rota.id)} aluno(s)?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo rota...'
            });
            await loading.present();

            try {
              await this.apiService.deletarRota(rota.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Rota excluída com sucesso!');
              await this.carregarListaPresencas();
            } catch (error) {
              console.error('Erro ao excluir rota:', error);
              this.mostrarAlerta('Erro', 'Não foi possível excluir a rota.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  // Método para cancelar edição da rota
  cancelarEdicaoRota() {
    this.rotaEditando = null;
    this.agendamentosSelecionadosEdicao.clear();
    this.agendamentosDisponiveisEdicao = [];
  }

  // Método para obter agendamento por ID na edição
  getAgendamentoPorIdEdicao(agendamentoId: number): any {
    return this.agendamentosDisponiveisEdicao.find(a => a.id === agendamentoId);
  }

  // Método para remover agendamento específico na edição
  removerAgendamentoEdicao(agendamentoId: number) {
    this.agendamentosSelecionadosEdicao.delete(agendamentoId);
  }

  // Método para salvar edição da rota
  async salvarEdicaoRota() {
    if (!this.rotaEditando || this.agendamentosSelecionadosEdicao.size === 0) {
      this.mostrarAlerta('Dados Incompletos', 'Selecione pelo menos um agendamento.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Salvando alterações...'
    });
    await loading.present();

    try {
      // Primeiro, remover todos os agendamentos atuais da rota
      try {
        await this.apiService.deletarAgendamentosDaRota(this.rotaEditando.id).toPromise();
      } catch (error) {
        console.warn('Erro ao deletar agendamentos da rota (pode ser normal se não houver agendamentos):', error);
      }

      // Depois, adicionar os novos agendamentos
      const agendamentosIds = Array.from(this.agendamentosSelecionadosEdicao);

      for (let i = 0; i < agendamentosIds.length; i++) {
        try {
          await this.apiService.adicionarAgendamentoARota(
            this.rotaEditando.id,
            agendamentosIds[i],
            i + 1
          ).toPromise();
        } catch (error) {
          console.error('Erro ao adicionar agendamento à rota:', error);
        }
      }

      this.mostrarAlerta('Sucesso', `Rota atualizada com ${agendamentosIds.length} aluno(s)!`);
      this.cancelarEdicaoRota();

      // Recarregar a lista de presenças
      await this.carregarListaPresencas();

    } catch (error) {
      console.error('Erro ao salvar edição da rota:', error);
      this.mostrarAlerta('Erro', 'Não foi possível salvar as alterações da rota.');
    } finally {
      await loading.dismiss();
    }
  }

  async carregarAgendamentosDisponiveis() {
    if (!this.dataSelecionada) {
      this.mostrarAlerta('Data Necessária', 'Selecione uma data primeiro.');
      return;
    }

    // Se temos horário selecionado, carrega apenas os agendamentos daquele horário
    if (this.horarioSelecionado) {
      this.isLoadingAgendamentos = true;
      try {
        this.agendamentosDisponiveis = this.agendamentosPorHorario.get(this.horarioSelecionado.id) || [];

        console.log('Agendamentos do horário:', this.agendamentosDisponiveis);

        if (this.agendamentosDisponiveis.length === 0) {
          this.mostrarAlerta('Info', 'Nenhum aluno agendado para este horário.');
        }
      } catch (error) {
        console.error('Erro ao carregar agendamentos do horário:', error);
        this.mostrarAlerta('Erro', 'Não foi possível carregar os alunos deste horário.');
      } finally {
        this.isLoadingAgendamentos = false;
      }
    } else {
      // Comportamento original - carrega todos os agendamentos do dia
      this.isLoadingAgendamentos = true;
      try {
        this.agendamentosDisponiveis = await this.apiService.getAgendamentosDisponiveis(this.dataSelecionada).toPromise() || [];
        console.log('Agendamentos disponíveis:', this.agendamentosDisponiveis);

        if (this.agendamentosDisponiveis.length === 0) {
          this.mostrarAlerta('Info', 'Nenhum agendamento encontrado para esta data.');
        }
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        this.mostrarAlerta('Erro', 'Não foi possível carregar os agendamentos disponíveis.');
      } finally {
        this.isLoadingAgendamentos = false;
      }
    }
  }

  // Método para obter agendamentos do horário selecionado
  getAgendamentosDoHorario(): any[] {
    if (!this.horarioSelecionado) return [];
    return this.agendamentosPorHorario.get(this.horarioSelecionado.id) || [];
  }


  // Método para atualizar a data selecionada - CORRIGIDO
  atualizarDataSelecionada(event: any) {
    this.dataSelecionada = event.detail.value || new Date().toISOString().split('T')[0];
  }

  // Método para obter rotas de um horário específico
  getRotasDoHorario(horarioId: number): any[] {
    return this.rotasPorHorario.get(horarioId) || [];
  }

  // Método para obter agendamentos de uma rota específica
  getAgendamentosDaRota(rotaId: number): any[] {
    return this.agendamentosPorRota.get(rotaId) || [];
  }

  // Método para obter quantidade de alunos em uma rota
  getQuantidadeAlunosRota(rotaId: number): number {
    const agendamentos = this.getAgendamentosDaRota(rotaId);
    return agendamentos.length;
  }

  // Método para verificar se há rotas para exibir
  temRotasParaExibir(): boolean {
    for (const horario of this.horariosDisponiveis) {
      if (this.getRotasDoHorario(horario.id).length > 0) {
        return true;
      }
    }
    return false;
  }

  async carregarHorariosDisponiveis() {
    if (!this.dataSelecionada) {
      this.mostrarAlerta('Data Necessária', 'Selecione uma data primeiro.');
      return;
    }

    try {
      this.horariosDisponiveis = await this.apiService.getHorariosDisponiveis(this.dataSelecionada).toPromise() || [];

      if (this.horariosDisponiveis.length === 0) {
        this.mostrarAlerta('Info', 'Nenhum horário cadastrado no sistema.');
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os horários.');
    }
  }



  // Método para calcular capacidade restante de uma van
  getCapacidadeRestante(van: any): number {
    return van.capacidade - this.agendamentosSelecionados.size;
  }

  // Método para carregar vans
  async carregarVansParaPresenca() {
    try {
      this.vans = await this.apiService.getVans().toPromise() || [];
      console.log('Vans carregadas:', this.vans);
    } catch (error) {
      console.error('Erro ao carregar vans:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar as vans.');
    }
  }

  // No ngOnInit, carregar horários automaticamente
  async ngOnInit() {
    this.user = this.authService.getCurrentUserValue();
    await this.carregarEstatisticas();
    // Carregar horários automaticamente quando entrar na área de admin
    await this.carregarTodosHorarios();
  }

  // Método para carregar todos os horários automaticamente
  async carregarTodosHorarios() {
    try {
      this.horariosDisponiveis = await this.apiService.getTodosHorarios().toPromise() || [];
      console.log('Horários carregados automaticamente:', this.horariosDisponiveis);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      // Não mostrar alerta para não incomodar o usuário
    }
  }

  // Método quando seleciona van
  selecionarVan(van: any) {
    // Se já está selecionada, desseleciona
    if (this.vanSelecionada?.id === van.id) {
      this.vanSelecionada = null;
    } else {
      // Seleciona a nova van
      this.vanSelecionada = van;
    }

    // Limpar seleções de horário e alunos quando muda a van
    this.horarioSelecionado = null;
    this.agendamentosSelecionados.clear();
    this.agendamentosDisponiveis = [];

    console.log('Van selecionada:', this.vanSelecionada?.placa || 'Nenhuma');
  }

  // Método para limpar seleção da van
  limparSelecaoVan() {
    this.vanSelecionadaId = null;
    this.vanSelecionada = null;
    this.horarioSelecionado = null;
    this.agendamentosSelecionados.clear();
    this.agendamentosDisponiveis = [];
    console.log('Seleção da van limpa');
  }

  // No método limparSelecoesPresenca, atualize para:
  limparSelecoesPresenca() {
    this.dataSelecionada = new Date().toISOString().split('T')[0];
    this.vanSelecionadaId = null;
    this.vanSelecionada = null;
    this.horarioSelecionado = null;
    this.agendamentosSelecionados.clear();
    this.agendamentosDisponiveis = [];
    this.mostrarAlerta('Seleções Limpas', 'Todas as seleções foram resetadas.');
  }

  // No método limparSelecoesAposMudancaData, atualize:
  limparSelecoesAposMudancaData() {
    this.vanSelecionadaId = null;
    this.vanSelecionada = null;
    this.horarioSelecionado = null;
    this.agendamentosSelecionados.clear();
    this.agendamentosDisponiveis = [];

    // Carregar vans quando a data é selecionada
    if (this.dataSelecionada) {
      this.carregarVansParaPresenca();
    }
  }

  // Método para obter texto de status do horário
  getStatusHorario(horario: any): string {
    if (!this.isHorarioDisponivel(horario)) {
      return '⛔ Ocupado';
    }
    return '✅ Disponível';
  }

  // No area-admin.page.ts, adicione este método alternativo
  async adicionarAgendamentoARotaAlternativo(idRota: number, idAgendamento: number, ordem: number): Promise<boolean> {
    try {
      const dados = {
        idRota: idRota,
        idAgendamento: idAgendamento,
        ordem: ordem
      };

      console.log('Tentando vincular agendamento à rota:', dados);

      // Tentativa com fetch direto para debug
      const response = await fetch(`http://localhost:8080/api/rota-agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
      });

      if (response.ok) {
        console.log('Agendamento vinculado com sucesso!');
        return true;
      } else {
        console.error('Erro ao vincular agendamento:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Erro fatal ao vincular agendamento:', error);
      return false;
    }
  }

  // Substitua o método carregarRotasDaVan() por este:
  async carregarRotasDaVan() {
    if (!this.vanSelecionada || !this.dataSelecionada) return;

    try {
      this.rotasDaVan = await this.apiService.getRotasPorVanEData(
        this.vanSelecionada.id,
        this.dataSelecionada
      ).toPromise() || [];

      // Atualizar horários ocupados
      this.horariosOcupados.clear();
      this.rotasDaVan.forEach(rota => {
        if (rota.idHorario) {
          this.horariosOcupados.add(rota.idHorario);
        }
      });

      console.log('Rotas da van:', this.rotasDaVan);
      console.log('Horários ocupados:', Array.from(this.horariosOcupados));

    } catch (error) {
      console.error('Erro ao carregar rotas da van:', error);
    }
  }

  // Método atualizado para verificar tanto no frontend quanto no backend
  isHorarioDisponivel(horario: any): boolean {
    if (!this.vanSelecionada || !horario) return true;

    // Verificação local (cache)
    const ocupadoLocalmente = this.horariosOcupados.has(horario.id);

    return !ocupadoLocalmente;
  }

  // Novo método para verificação robusta no backend
  async verificarDisponibilidadeBackend(horario: any): Promise<boolean> {
    if (!this.vanSelecionada || !horario || !this.dataSelecionada) {
      return true;
    }

    try {
      const ocupada = await this.apiService.isVanOcupadaNoHorario(
        this.vanSelecionada.id,
        this.dataSelecionada,
        horario.id
      ).toPromise();

      return !ocupada;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade no backend:', error);
      return this.isHorarioDisponivel(horario); // Fallback para verificação local
    }
  }


  // Método atualizado com validação final no backend
  // Método atualizado com validação final no backend E seleção de motorista
  async criarRotaComPresencas() {
    if (!this.vanSelecionada || !this.dataSelecionada || !this.horarioSelecionado || this.agendamentosSelecionados.size === 0) {
      this.mostrarAlerta('Dados Incompletos', 'Selecione uma van, data, horário e pelo menos um aluno.');
      return;
    }

    // VALIDAÇÃO: Admin deve selecionar um motorista
    if (!this.atribuicaoSelecionada.idMotorista) {
      this.mostrarAlerta('Seleção Necessária', 'Selecione o motorista que conduzirá esta rota.');
      return;
    }

    // VALIDAÇÃO FINAL NO BACKEND (importante!)
    const disponivel = await this.verificarDisponibilidadeBackend(this.horarioSelecionado);
    if (!disponivel) {
      this.mostrarAlerta(
        'Conflito de Horário',
        `A van ${this.vanSelecionada.placa} já tem uma rota cadastrada para este horário. 
      Por favor, selecione outro horário.`
      );
      return;
    }

    // VALIDAÇÃO: Verificar se há alunos indisponíveis na seleção
    const alunosIndisponiveisNaSelecao = Array.from(this.agendamentosSelecionados)
      .filter(agendamentoId => !this.isAlunoDisponivel(agendamentoId))
      .map(agendamentoId => this.getAgendamentoPorId(agendamentoId)?.nomeAluno)
      .filter(nome => nome);

    if (alunosIndisponiveisNaSelecao.length > 0) {
      this.mostrarAlerta(
        'Alunos Indisponíveis',
        `Os seguintes alunos já estão em outras rotas neste horário:\n\n• ${alunosIndisponiveisNaSelecao.join('\n• ')}\n\nRemova-os da seleção para continuar.`
      );
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Criando rota...'
    });
    await loading.present();

    try {
      // Dados da rota - CORREÇÃO: usa o motorista selecionado pelo admin
      const rotaData = {
        idMotorista: this.atribuicaoSelecionada.idMotorista, // ← ALTERADO: usa motorista selecionado
        idVan: this.vanSelecionada.id,
        data: this.dataSelecionada,
        idHorario: this.horarioSelecionado.id
      };

      console.log('Enviando dados da rota:', rotaData);
      console.log('Motorista selecionado:', this.getNomeMotorista(this.atribuicaoSelecionada.idMotorista));

      // Primeiro criar a rota
      const novaRota = await this.apiService.criarRota(rotaData).toPromise();
      console.log('Rota criada:', novaRota);

      // Depois associar os agendamentos à rota
      const agendamentosIds = Array.from(this.agendamentosSelecionados);

      console.log('Agendamentos a serem vinculados:', agendamentosIds);

      for (let i = 0; i < agendamentosIds.length; i++) {
        try {
          await this.apiService.adicionarAgendamentoARota(
            novaRota.id,
            agendamentosIds[i],
            i + 1
          ).toPromise();
          console.log(`Agendamento ${agendamentosIds[i]} vinculado com sucesso`);
        } catch (error) {
          console.error('Erro ao adicionar agendamento à rota:', error);
        }
      }

      const motoristaNome = this.getNomeMotorista(this.atribuicaoSelecionada.idMotorista);

      this.mostrarAlerta(
        'Sucesso',
        `Rota criada com sucesso!\n\n` +
        `Motorista: ${motoristaNome}\n` +
        `Van: ${this.vanSelecionada.placa}\n` +
        `Horário: ${this.horarioSelecionado.horario}\n` +
        `Alunos: ${this.agendamentosSelecionados.size}`
      );

      // ATUALIZAR CACHE LOCAL - IMPORTANTE!
      this.horariosOcupados.add(this.horarioSelecionado.id);

      // Recarregar rotas da van para garantir sincronização
      await this.carregarRotasDaVan();

      // Limpar seleções
      this.limparSelecoesPresenca();

    } catch (error: any) {
      console.error('Erro ao criar rota:', error);

      let mensagemErro = 'Não foi possível criar a rota.';

      if (error.error) {
        if (typeof error.error === 'string') {
          mensagemErro = error.error;
        } else if (error.error.message) {
          mensagemErro = error.error.message;
        }
      }

      this.mostrarAlerta('Erro', mensagemErro);
    } finally {
      await loading.dismiss();
    }
  }

  getNomeMotorista(motoristaId: number): string {
    const motorista = this.motoristas.find(m => m.id === motoristaId);
    if (!motorista) return 'Motorista não encontrado';

    let nome = motorista.nome;
    if (motorista.tipo === 'admin') {
      nome += ' (Admin)';
    }
    if (motorista.id === this.user?.id) {
      nome += ' - Você';
    }
    return nome;
  }

  // Atualize para recarregar os dados quando a van mudar
  onVanSelecionadaChange(event: any) {
    const vanId = event.detail.value;
    this.vanSelecionadaId = vanId;

    // Encontrar o objeto van completo baseado no ID
    this.vanSelecionada = this.vans.find(van => van.id === vanId) || null;

    if (this.vanSelecionada) {
      // Limpar seleções de horário e alunos quando muda a van
      this.horarioSelecionado = null;
      this.agendamentosSelecionados.clear();
      this.agendamentosDisponiveis = [];

      // CARREGAR ROTAS DA VAN SELECIONADA
      if (this.dataSelecionada) {
        this.carregarRotasDaVan();
      }

      console.log('Van selecionada:', this.vanSelecionada.placa);
    }
  }

  // Método para obter texto descritivo do status
  getDescricaoStatusHorario(horario: any): string {
    if (!this.isHorarioDisponivel(horario)) {
      return 'Van já possui rota cadastrada neste horário';
    }
    return 'Clique para buscar alunos deste horário';
  }

  // Método para obter ícone do horário
  getIconeHorario(horario: any): string {
    return this.isHorarioDisponivel(horario) ? 'time' : 'lock-closed';
  }

  // Método para obter cor do ícone do horário
  getCorIconeHorario(horario: any): string {
    return this.isHorarioDisponivel(horario) ? 'success' : 'danger';
  }

  // Método para obter o status do aluno
  getStatusAluno(agendamentoId: number): string {
    return this.isAlunoDisponivel(agendamentoId) ? 'disponivel' : 'indisponivel';
  }

  // Método para obter a cor do badge do aluno
  getCorBadgeAluno(agendamentoId: number): string {
    return this.isAlunoDisponivel(agendamentoId) ? 'success' : 'danger';
  }

  // Método para obter o texto do status do aluno
  getTextoStatusAluno(agendamentoId: number): string {
    return this.isAlunoDisponivel(agendamentoId) ? 'Disponível' : 'Já em outra rota';
  }

  // Atualize para impedir seleção de alunos indisponíveis
  toggleAgendamentoSelecionado(agendamentoId: number) {
    // Verificar se o aluno está disponível
    if (!this.isAlunoDisponivel(agendamentoId)) {
      const agendamento = this.getAgendamentoPorId(agendamentoId);
      this.mostrarAlerta(
        'Aluno Indisponível',
        `O aluno ${agendamento.nomeAluno} já está cadastrado em outra rota para este horário.`
      );
      return;
    }

    if (this.agendamentosSelecionados.has(agendamentoId)) {
      this.agendamentosSelecionados.delete(agendamentoId);
    } else {
      // Verificar se a van está cheia
      if (this.vanSelecionada && this.agendamentosSelecionados.size >= this.vanSelecionada.capacidade) {
        this.mostrarAlerta('Van Cheia', `A van ${this.vanSelecionada.placa} já está na capacidade máxima de ${this.vanSelecionada.capacidade} passageiros.`);
        return;
      }
      this.agendamentosSelecionados.add(agendamentoId);
    }
  }

  // Método para selecionar uma van na lista
  async selecionarVanLista(van: any) {
    this.vanSelecionadaLista = van;
    this.rotasDaVanLista = [];
    this.agendamentosPorRotaLista.clear();
    this.rotaExpandidaLista = null;

    console.log('Van selecionada para lista:', van.placa);

    await this.carregarRotasDaVanLista();
  }

  // Método para carregar rotas da van selecionada
  async carregarRotasDaVanLista() {
    if (!this.vanSelecionadaLista || !this.dataSelecionada) return;

    try {
      this.rotasDaVanLista = await this.apiService.getRotasPorVanEData(
        this.vanSelecionadaLista.id,
        this.dataSelecionada
      ).toPromise() || [];

      console.log('Rotas da van para lista:', this.rotasDaVanLista);

      // Carregar agendamentos para cada rota
      for (const rota of this.rotasDaVanLista) {
        await this.carregarAgendamentosDaRotaLista(rota.id);
      }

    } catch (error) {
      console.error('Erro ao carregar rotas da van para lista:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar as rotas da van selecionada.');
    }
  }

  // Método para carregar agendamentos de uma rota específica
  async carregarAgendamentosDaRotaLista(rotaId: number) {
    try {
      const agendamentos = await this.apiService.getAgendamentosDaRota(rotaId).toPromise() || [];
      this.agendamentosPorRotaLista.set(rotaId, agendamentos);
      console.log(`Agendamentos da rota ${rotaId}:`, agendamentos);
    } catch (error) {
      console.error(`Erro ao carregar agendamentos da rota ${rotaId}:`, error);
      this.agendamentosPorRotaLista.set(rotaId, []);
    }
  }

  // Método para expandir/recolher detalhes da rota na lista
  toggleDetalhesRotaLista(rotaId: number) {
    if (this.rotaExpandidaLista === rotaId) {
      this.rotaExpandidaLista = null;
    } else {
      this.rotaExpandidaLista = rotaId;

      // Garantir que os agendamentos estão carregados
      const agendamentos = this.agendamentosPorRotaLista.get(rotaId);
      if (!agendamentos || agendamentos.length === 0) {
        this.carregarAgendamentosDaRotaLista(rotaId);
      }
    }
  }

  // Método para obter agendamentos de uma rota
  getAgendamentosDaRotaLista(rotaId: number): any[] {
    return this.agendamentosPorRotaLista.get(rotaId) || [];
  }

  // Método para obter quantidade de alunos em uma rota
  getQuantidadeAlunosRotaLista(rotaId: number): number {
    const agendamentos = this.getAgendamentosDaRotaLista(rotaId);
    return agendamentos.length;
  }

  // Método para obter informações do motorista
  getMotoristaInfo(rota: any): string {
    if (rota.nomeMotorista) {
      return rota.nomeMotorista;
    }

    if (rota.idMotorista === this.user?.id) {
      return `${this.user.nome} (Você)`;
    }

    return `Motorista ID: ${rota.idMotorista}`;
  }

  // Método para excluir uma rota da lista
  async excluirRotaLista(rota: any) {
    const confirm = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a rota da van ${this.vanSelecionadaLista?.placa} no horário ${rota.horario} com ${this.getQuantidadeAlunosRotaLista(rota.id)} aluno(s)?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo rota...'
            });
            await loading.present();

            try {
              await this.apiService.deletarRota(rota.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Rota excluída com sucesso!');

              // Recarregar a lista
              await this.carregarRotasDaVanLista();

            } catch (error) {
              console.error('Erro ao excluir rota:', error);
              this.mostrarAlerta('Erro', 'Não foi possível excluir a rota.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  // Método para limpar seleção na lista
  limparSelecaoLista() {
    this.vanSelecionadaLista = null;
    this.rotasDaVanLista = [];
    this.agendamentosPorRotaLista.clear();
    this.rotaExpandidaLista = null;
  }

  // Atualize o método para carregar dados quando mudar para a aba de lista
  mudarAbaPresenca(event: any) {
    this.abaPresenca = event.detail.value;
    if (this.abaPresenca === 'lista') {
      this.carregarListaPresencas();
    } else {
      // Se voltar para a aba de registrar, limpa as seleções da lista
      this.limparSelecaoLista();
    }
  }

  // Atualize para recarregar a lista quando a data mudar
  onDataPresencaChange(event: any) {
    this.dataSelecionada = event.detail.value || new Date().toISOString().split('T')[0];

    // Limpar seleções quando a data muda
    this.limparSelecoesAposMudancaData();

    // Recarregar rotas da van quando a data mudar
    if (this.vanSelecionada) {
      this.carregarRotasDaVan();
    }

    // Se estiver na aba de lista, recarregar a lista
    if (this.abaPresenca === 'lista') {
      this.carregarListaPresencas();
    }
  }

  async carregarListaPresencas() {
    console.log('=== INICIANDO carregarListaPresencas ===');

    if (!this.dataSelecionada) {
      console.log('❌ Data não selecionada');
      this.mostrarAlerta('Data Necessária', 'Selecione uma data primeiro.');
      return;
    }

    this.isLoadingListaPresencas = true;

    try {
      console.log('📅 Data selecionada:', this.dataSelecionada);

      // 1. Carregar todas as vans
      console.log('🚐 Carregando vans...');
      this.vansParaLista = await this.apiService.getVans().toPromise() || [];
      console.log('✅ Vans carregadas:', this.vansParaLista.length, this.vansParaLista);

      // 2. Limpar seleções anteriores
      this.vanSelecionadaLista = null;
      this.rotasDaVanLista = [];
      this.agendamentosPorRotaLista.clear();
      this.rotaExpandidaLista = null;

      console.log('✅ Lista de presenças carregada com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar lista de presenças:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar a lista de presenças.');
    } finally {
      this.isLoadingListaPresencas = false;
      console.log('=== FINALIZANDO carregarListaPresencas ===');
    }
  }

  async testarEndpointsListaPresenca() {
    console.log('=== TESTANDO ENDPOINTS DA LISTA ===');

    try {
      // Testar endpoint de vans
      console.log('1. Testando /vans...');
      const vans = await this.apiService.getVans().toPromise();
      console.log('✅ Vans:', vans);

      // Testar endpoint de horários
      console.log('2. Testando /horarios...');
      const horarios = await this.apiService.getTodosHorarios().toPromise();
      console.log('✅ Horários:', horarios);

      // Testar endpoint específico de rotas por van (se tiver uma van)
      if (vans && vans.length > 0) {
        const vanTeste = vans[0];
        console.log(`3. Testando /rotas/van/${vanTeste.id}/data/${this.dataSelecionada}...`);
        try {
          const rotas = await this.apiService.getRotasPorVanEData(vanTeste.id, this.dataSelecionada).toPromise();
          console.log('✅ Rotas da van:', rotas);
        } catch (error) {
          console.error('❌ Erro no endpoint de rotas por van:', error);
        }
      }

    } catch (error) {
      console.error('❌ Erro geral no teste:', error);
    }
  }

  // Adicione este método para ajudar no debug:
  async testarEdicaoRota(rota: any) {
    console.log('=== TESTANDO EDIÇÃO DE ROTA ===');
    console.log('Rota:', rota);

    try {
      // Testar endpoint de agendamentos da rota
      console.log('1. Testando getAgendamentosDaRota...');
      const agendamentos = await this.apiService.getAgendamentosDaRota(rota.id).toPromise();
      console.log('Agendamentos da rota:', agendamentos);

      // Testar endpoint de agendamentos disponíveis
      console.log('2. Testando getAgendamentosDisponiveis...');
      const disponiveis = await this.apiService.getAgendamentosDisponiveis(this.dataSelecionada).toPromise();
      console.log('Agendamentos disponíveis:', disponiveis);

      this.mostrarAlerta('Teste Concluído', 'Verifique o console para os resultados.');
    } catch (error) {
      console.error('Erro no teste:', error);
      this.mostrarAlerta('Erro no Teste', 'Verifique o console para detalhes.');
    }
  }

  async editarRota(rota: any) {
    console.log('🔄 Iniciando edição da rota:', rota);

    const loading = await this.loadingController.create({
      message: 'Carregando dados da rota...'
    });
    await loading.present();

    try {
      this.rotaEditando = { ...rota };
      this.agendamentosSelecionadosEdicao.clear();
      this.agendamentosDisponiveisEdicao = [];
      this.alunosIndisponiveisEdicao.clear();

      // Carregar agendamentos atuais da rota
      console.log('📋 Carregando agendamentos atuais da rota...');
      const agendamentosAtuais = await this.apiService.getAgendamentosDaRota(rota.id).toPromise() || [];
      console.log('Agendamentos atuais:', agendamentosAtuais);

      // Adicionar agendamentos atuais à seleção
      agendamentosAtuais.forEach((agendamento: any) => {
        const agendamentoId = agendamento.idAgendamento || agendamento.id;
        if (agendamentoId) {
          this.agendamentosSelecionadosEdicao.add(agendamentoId);
          console.log(`✅ Adicionado agendamento ${agendamentoId} à seleção`);
        }
      });

      // Carregar agendamentos disponíveis para esta data
      console.log('📅 Carregando agendamentos disponíveis...');
      await this.carregarAgendamentosParaEdicao();

      // Verificar alunos indisponíveis
      await this.verificarAlunosIndisponiveisEdicao();

      this.mostrarAlerta('Sucesso', 'Rota carregada para edição!');

    } catch (error) {
      console.error('❌ Erro ao carregar rota para edição:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os dados da rota para edição.');
    } finally {
      await loading.dismiss();
    }
  }

  // Método para verificar alunos indisponíveis na edição
  async verificarAlunosIndisponiveisEdicao() {
    if (!this.rotaEditando || !this.rotaEditando.data || !this.rotaEditando.idHorario) {
      return;
    }

    this.isLoadingAlunosIndisponiveisEdicao = true;
    this.alunosIndisponiveisEdicao.clear();

    try {
      // Para cada agendamento disponível, verificar se o aluno já está em outra rota (excluindo a rota atual)
      for (const agendamento of this.agendamentosDisponiveisEdicao) {
        try {
          // Se o aluno já está selecionado na rota atual, não é considerado indisponível
          if (this.agendamentosSelecionadosEdicao.has(agendamento.id)) {
            continue;
          }

          const alunoCadastrado = await this.apiService.isAlunoCadastradoEmRota(
            agendamento.idAluno,
            this.rotaEditando.data,
            this.rotaEditando.idHorario
          ).toPromise();

          if (alunoCadastrado) {
            this.alunosIndisponiveisEdicao.add(agendamento.id);
            console.log(`❌ Aluno ${agendamento.idAluno} (${agendamento.nomeAluno}) já está em outra rota`);
          }
        } catch (error) {
          console.error(`Erro ao verificar aluno ${agendamento.idAluno}:`, error);
        }
      }

      console.log('Alunos indisponíveis na edição:', Array.from(this.alunosIndisponiveisEdicao));

    } catch (error) {
      console.error('Erro ao verificar alunos indisponíveis na edição:', error);
    } finally {
      this.isLoadingAlunosIndisponiveisEdicao = false;
    }
  }

  // Método para verificar se um aluno está disponível na edição
  isAlunoDisponivelEdicao(agendamentoId: number): boolean {
    // Se o aluno já está selecionado, sempre está disponível (para permitir remover)
    if (this.agendamentosSelecionadosEdicao.has(agendamentoId)) {
      return true;
    }
    return !this.alunosIndisponiveisEdicao.has(agendamentoId);
  }

  // Método para obter informações do horário do agendamento
  getHorarioAgendamentoEdicao(agendamento: any): string {
    if (!agendamento || !agendamento.idHorario) return 'N/A';

    // Buscar no array de horários disponíveis
    const horario = this.horariosDisponiveis.find(h => h.id === agendamento.idHorario);
    return horario ? horario.horario : 'N/A';
  }

  // Método para obter status do aluno na edição
  getStatusAlunoEdicao(agendamentoId: number): string {
    return this.isAlunoDisponivelEdicao(agendamentoId) ? 'disponivel' : 'indisponivel';
  }

  // Método para obter cor do badge na edição
  getCorBadgeAlunoEdicao(agendamentoId: number): string {
    return this.isAlunoDisponivelEdicao(agendamentoId) ? 'success' : 'danger';
  }

  // Método para obter texto do status na edição
  getTextoStatusAlunoEdicao(agendamentoId: number): string {
    if (this.agendamentosSelecionadosEdicao.has(agendamentoId)) {
      return 'Selecionado';
    }
    return this.isAlunoDisponivelEdicao(agendamentoId) ? 'Disponível' : 'Já em outra rota';
  }

  // Atualize o método toggleAgendamentoEdicao
  toggleAgendamentoEdicao(agendamentoId: number) {
    // Verificar se o aluno está disponível (exceto se já está selecionado)
    if (!this.agendamentosSelecionadosEdicao.has(agendamentoId) && !this.isAlunoDisponivelEdicao(agendamentoId)) {
      const agendamento = this.getAgendamentoPorIdEdicao(agendamentoId);
      this.mostrarAlerta(
        'Aluno Indisponível',
        `O aluno ${agendamento.nomeAluno} já está cadastrado em outra rota para este horário.`
      );
      return;
    }

    if (this.agendamentosSelecionadosEdicao.has(agendamentoId)) {
      this.agendamentosSelecionadosEdicao.delete(agendamentoId);
      console.log(`➖ Removido agendamento ${agendamentoId} da seleção`);
    } else {
      // Verificar se a van está cheia
      const capacidadeVan = this.getVanPorId(this.rotaEditando.idVan)?.capacidade || 0;
      if (this.agendamentosSelecionadosEdicao.size >= capacidadeVan) {
        this.mostrarAlerta('Van Cheia', `A van já está na capacidade máxima de ${capacidadeVan} passageiros.`);
        return;
      }
      this.agendamentosSelecionadosEdicao.add(agendamentoId);
      console.log(`➕ Adicionado agendamento ${agendamentoId} à seleção`);
    }
  }

  async carregarAgendamentosParaEdicao() {
    if (!this.rotaEditando) {
      console.log('❌ Nenhuma rota em edição');
      return;
    }

    this.isLoadingAgendamentosEdicao = true;

    try {
      console.log('📋 Buscando agendamentos disponíveis para a data:', this.rotaEditando.data);

      // Buscar agendamentos do mesmo horário para mostrar informações consistentes
      if (this.rotaEditando.idHorario) {
        this.agendamentosDisponiveisEdicao = await this.apiService
          .getAgendamentosPorHorarioEData(this.rotaEditando.idHorario, this.rotaEditando.data)
          .toPromise() || [];
      } else {
        // Fallback: buscar todos os agendamentos da data
        this.agendamentosDisponiveisEdicao = await this.apiService
          .getAgendamentosDisponiveis(this.rotaEditando.data)
          .toPromise() || [];
      }

      console.log('✅ Agendamentos disponíveis para edição:', this.agendamentosDisponiveisEdicao);

      if (this.agendamentosDisponiveisEdicao.length === 0) {
        console.log('ℹ️ Nenhum agendamento disponível para esta data');
        this.mostrarAlerta('Info', 'Nenhum agendamento disponível para esta data.');
      }

    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos para edição:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os agendamentos disponíveis.');
    } finally {
      this.isLoadingAgendamentosEdicao = false;
    }
  }

  // Método para selecionar grupo inteiro
  selecionarGrupo(grupo: any) {
    const capacidadeVan = this.vanSelecionada?.capacidade || 0;
    const vagasDisponiveis = capacidadeVan - this.agendamentosSelecionados.size;

    if (grupo.quantidade > vagasDisponiveis) {
      this.mostrarAlerta('Capacidade Insuficiente',
        `O grupo tem ${grupo.quantidade} alunos, mas só há ${vagasDisponiveis} vagas disponíveis na van.`);
      return;
    }

    let adicionados = 0;
    grupo.agendamentos.forEach((agendamento: any) => {
      if (this.isAlunoDisponivel(agendamento.id) && !this.agendamentosSelecionados.has(agendamento.id)) {
        this.agendamentosSelecionados.add(agendamento.id);
        adicionados++;
      }
    });

    if (adicionados > 0) {
      this.mostrarAlerta('Sucesso', `Grupo selecionado! ${adicionados} aluno(s) adicionado(s) à rota.`);
    }
  }

  // Método para desselecionar grupo inteiro
  desselecionarGrupo(grupo: any) {
    let removidos = 0;
    grupo.agendamentos.forEach((agendamento: any) => {
      if (this.agendamentosSelecionados.has(agendamento.id)) {
        this.agendamentosSelecionados.delete(agendamento.id);
        removidos++;
      }
    });

    if (removidos > 0) {
      this.mostrarAlerta('Info', `Grupo removido! ${removidos} aluno(s) removido(s) da rota.`);
    }
  }

  // Método para verificar se grupo está completamente selecionado
  isGrupoCompletamenteSelecionado(grupo: any): boolean {
    return grupo.agendamentos.every((agendamento: any) =>
      this.agendamentosSelecionados.has(agendamento.id)
    );
  }

  // Método para verificar se grupo está parcialmente selecionado
  isGrupoParcialmenteSelecionado(grupo: any): boolean {
    return grupo.agendamentos.some((agendamento: any) =>
      this.agendamentosSelecionados.has(agendamento.id)
    ) && !this.isGrupoCompletamenteSelecionado(grupo);
  }

  // Método auxiliar para calcular raio máximo do grupo
  calcularRaioMaximoGrupo(grupo: any[], centro: { lat: number, lng: number }): number {
    let raioMaximo = 0;

    grupo.forEach(agendamento => {
      const coords = this.getCoordenadasAgendamento(agendamento);
      if (coords) {
        const distancia = this.calcularDistancia(centro.lat, centro.lng, coords.lat, coords.lng);
        raioMaximo = Math.max(raioMaximo, distancia);
      }
    });

    return raioMaximo;
  }

  // Método quando o raio de proximidade muda



  // Método melhorado para calcular proximidade
  async calcularProximidadeAutomatica() {
    if (this.agendamentosDisponiveis.length === 0) {
      this.mostrarAlerta('Atenção', 'Nenhum agendamento disponível para calcular proximidade.');
      return;
    }

    this.isCalculandoProximidade = true;

    try {
      console.log('🧮 Calculando proximidade entre alunos...');
      console.log(`📏 Raio definido: ${this.raioProximidade}km`);

      // Agrupar alunos por proximidade
      this.alunosAgrupadosPorProximidade = this.agruparAlunosPorProximidade(this.agendamentosDisponiveis);

      if (this.alunosAgrupadosPorProximidade.length > 0) {
        const totalAlunosAgrupados = this.alunosAgrupadosPorProximidade.reduce(
          (total, grupo) => total + grupo.quantidade, 0
        );

        this.mostrarAlerta('Sucesso',
          `Foram formados ${this.alunosAgrupadosPorProximidade.length} grupos por proximidade, ` +
          `agrupando ${totalAlunosAgrupados} de ${this.agendamentosDisponiveis.length} alunos.`);
      } else {
        this.mostrarAlerta('Info',
          'Não foi possível formar grupos por proximidade. ' +
          'Verifique se os alunos possuem endereços com coordenadas cadastradas.');
      }

    } catch (error) {
      console.error('Erro ao calcular proximidade:', error);
      this.mostrarAlerta('Erro', 'Não foi possível calcular a proximidade entre os alunos.');
    } finally {
      this.isCalculandoProximidade = false;
    }
  }


  // Método atualizado para selecionar horário
  async selecionarHorario(horario: any) {
    // Verificar disponibilidade no backend antes de permitir seleção
    const disponivel = await this.verificarDisponibilidadeBackend(horario);

    if (!disponivel) {
      this.mostrarAlerta(
        'Horário Indisponível',
        `A van ${this.vanSelecionada.placa} já possui uma rota cadastrada para o horário ${horario.horario}.`
      );
      return;
    }

    // Se estiver disponível, prossegue com a seleção
    this.horarioSelecionado = horario;
    this.agendamentosSelecionados.clear();
    this.agendamentosDisponiveis = [];
    this.alunosAgrupadosPorProximidade = [];

    console.log('Horário selecionado:', horario.horario);

    // Carregar automaticamente os alunos do horário selecionado
    await this.carregarAlunosDoHorario();
  }

  // Método para verificar quais alunos já estão em rotas no horário
  async verificarAlunosIndisponiveis() {
    if (!this.dataSelecionada || !this.horarioSelecionado) return;

    this.isLoadingAlunosIndisponiveis = true;
    this.alunosIndisponiveis.clear();

    try {
      // Para cada agendamento disponível, verificar se o aluno já está em outra rota
      for (const agendamento of this.agendamentosDisponiveis) {
        try {
          const alunoCadastrado = await this.apiService.isAlunoCadastradoEmRota(
            agendamento.idAluno,
            this.dataSelecionada,
            this.horarioSelecionado.id
          ).toPromise();

          if (alunoCadastrado) {
            this.alunosIndisponiveis.add(agendamento.id);
            console.log(`Aluno ${agendamento.idAluno} (${agendamento.nomeAluno}) já está em outra rota`);
          }
        } catch (error) {
          console.error(`Erro ao verificar aluno ${agendamento.idAluno}:`, error);
        }
      }

      console.log('Alunos indisponíveis:', Array.from(this.alunosIndisponiveis));
    } catch (error) {
      console.error('Erro ao verificar alunos indisponíveis:', error);
    } finally {
      this.isLoadingAlunosIndisponiveis = false;
    }
  }

  // Método para verificar se um aluno específico está disponível
  isAlunoDisponivel(agendamentoId: number): boolean {
    return !this.alunosIndisponiveis.has(agendamentoId);
  }

  // Método para obter agendamento por ID
  getAgendamentoPorId(agendamentoId: number): any {
    return this.agendamentosDisponiveis.find(a => a.id === agendamentoId);
  }

  // Calcular centro geométrico de um conjunto de pontos
  calcularCentroGeometrico(pontos: { lat: number, lng: number }[]): { lat: number, lng: number } {
    if (pontos.length === 0) return { lat: 0, lng: 0 };
    if (pontos.length === 1) return pontos[0];

    const somaLat = pontos.reduce((sum, ponto) => sum + ponto.lat, 0);
    const somaLng = pontos.reduce((sum, ponto) => sum + ponto.lng, 0);

    return {
      lat: somaLat / pontos.length,
      lng: somaLng / pontos.length
    };
  }

  // Calcular raio máximo de um cluster
  calcularRaioMaximoCluster(pontos: any[], centro: { lat: number, lng: number }): number {
    let raioMaximo = 0;

    for (const ponto of pontos) {
      const distancia = this.calcularDistancia(
        centro.lat, centro.lng,
        ponto.coords.lat, ponto.coords.lng
      );
      raioMaximo = Math.max(raioMaximo, distancia);
    }

    return raioMaximo;
  }

  // Método para otimizar automaticamente o agrupamento
  otimizarAgrupamento() {
    console.log('🚀 Otimizando agrupamento...');

    // Tentar diferentes raios para encontrar o melhor agrupamento
    const raiosTeste = [0.5, 1, 1.5, 2, 3, 5];
    let melhorConfiguracao = { raio: this.raioProximidade, grupos: this.alunosAgrupadosPorProximidade };
    let melhorPontuacao = this.calcularPontuacaoAgrupamento(this.alunosAgrupadosPorProximidade);

    for (const raio of raiosTeste) {
      const gruposTeste = this.agruparAlunosPorProximidadeComRaio(this.agendamentosDisponiveis, raio);
      const pontuacao = this.calcularPontuacaoAgrupamento(gruposTeste);

      if (pontuacao > melhorPontuacao) {
        melhorPontuacao = pontuacao;
        melhorConfiguracao = { raio, grupos: gruposTeste };
      }
    }

    this.raioProximidade = melhorConfiguracao.raio;
    this.alunosAgrupadosPorProximidade = melhorConfiguracao.grupos;

    this.mostrarAlerta('Otimizado',
      `Agrupamento otimizado com raio de ${melhorConfiguracao.raio}km. ` +
      `Pontuação: ${melhorPontuacao.toFixed(2)}`);
  }

  // Método auxiliar para agrupar com raio específico
  agruparAlunosPorProximidadeComRaio(agendamentos: any[], raio: number): any[] {
    const raioOriginal = this.raioProximidade;
    this.raioProximidade = raio;
    const grupos = this.agruparAlunosPorProximidade(agendamentos);
    this.raioProximidade = raioOriginal;
    return grupos;
  }

  // Calcular pontuação de qualidade do agrupamento
  calcularPontuacaoAgrupamento(grupos: any[]): number {
    if (grupos.length === 0) return 0;

    let pontuacao = 0;

    grupos.forEach(grupo => {
      // Pontuar grupos com boa densidade
      if (grupo.densidade > 10) pontuacao += 2;
      else if (grupo.densidade > 5) pontuacao += 1;

      // Pontuar grupos com tamanho ideal (3-5 alunos)
      if (grupo.quantidade >= 3 && grupo.quantidade <= 5) pontuacao += 2;
      else if (grupo.quantidade >= 2) pontuacao += 1;

      // Penalizar grupos com raio muito grande
      if (grupo.raioMaximo > 5) pontuacao -= 1;
    });

    // Penalizar muitos grupos muito pequenos
    const gruposPequenos = grupos.filter(g => g.quantidade === 1).length;
    pontuacao -= gruposPequenos * 0.5;

    return pontuacao;
  }

  // Método auxiliar para converter graus para radianos
  grausParaRadianos(graus: number): number {
    return graus * (Math.PI / 180);
  }

  // Algoritmo de agrupamento conservador - garante que TODOS estejam dentro do raio
  agruparAlunosPorProximidadeConservador(agendamentos: any[]): any[] {
    if (agendamentos.length === 0) return [];

    console.log('📍 Iniciando agrupamento conservador...');

    // Filtrar agendamentos com coordenadas válidas
    const agendamentosComCoordenadas = agendamentos.filter(agendamento => {
      const coords = this.getCoordenadasAgendamento(agendamento);
      return coords !== null && !isNaN(coords.lat) && !isNaN(coords.lng);
    });

    console.log(`📍 ${agendamentosComCoordenadas.length} agendamentos com coordenadas válidas`);

    const grupos: any[] = [];
    const processados = new Set<number>();

    for (let i = 0; i < agendamentosComCoordenadas.length; i++) {
      const agendamentoAtual = agendamentosComCoordenadas[i];

      if (processados.has(agendamentoAtual.id)) continue;

      const coordsAtual = this.getCoordenadasAgendamento(agendamentoAtual);
      if (!coordsAtual) continue;

      // Encontrar todos os agendamentos dentro do raio
      const grupo = [agendamentoAtual];
      processados.add(agendamentoAtual.id);

      for (let j = 0; j < agendamentosComCoordenadas.length; j++) {
        if (i === j) continue;

        const agendamentoVizinho = agendamentosComCoordenadas[j];
        if (processados.has(agendamentoVizinho.id)) continue;

        const coordsVizinho = this.getCoordenadasAgendamento(agendamentoVizinho);
        if (!coordsVizinho) continue;

        const distancia = this.calcularDistancia(
          coordsAtual.lat, coordsAtual.lng,
          coordsVizinho.lat, coordsVizinho.lng
        );

        // VERIFICAÇÃO RIGOROSA: só adiciona se estiver dentro do raio
        if (distancia <= this.raioProximidade) {
          // Verificar se o novo ponto está dentro do raio de TODOS os pontos do grupo
          const dentroDoRaioDeTodos = this.estaDentroDoRaioDeTodos(agendamentoVizinho, grupo);

          if (dentroDoRaioDeTodos) {
            grupo.push(agendamentoVizinho);
            processados.add(agendamentoVizinho.id);
            console.log(`✅ Adicionado ${agendamentoVizinho.nomeAluno} ao grupo (distância: ${distancia.toFixed(2)}km)`);
          } else {
            console.log(`❌ ${agendamentoVizinho.nomeAluno} não adicionado - fora do raio de algum membro do grupo`);
          }
        }
      }

      if (grupo.length > 0) {
        const centro = this.calcularCentroGeometrico(grupo.map(ag => this.getCoordenadasAgendamento(ag)!));
        const raioMaximo = this.calcularRaioMaximoGrupo(grupo, centro);

        grupos.push({
          id: `grupo-${grupos.length + 1}`,
          agendamentos: grupo,
          coordenadasCentro: centro,
          quantidade: grupo.length,
          raioMaximo: raioMaximo,
          densidade: grupo.length / (Math.PI * Math.pow(raioMaximo, 2))
        });

        console.log(`📊 Grupo ${grupos.length} formado com ${grupo.length} aluno(s), raio máximo: ${raioMaximo.toFixed(2)}km`);
      }
    }

    // Ordenar por tamanho de grupo
    grupos.sort((a, b) => b.quantidade - a.quantidade);

    console.log(`✅ Formados ${grupos.length} grupos conservadores`);
    return grupos;
  }

  // Verificar se um agendamento está dentro do raio de TODOS os membros do grupo
  estaDentroDoRaioDeTodos(agendamento: any, grupo: any[]): boolean {
    const coordsNovo = this.getCoordenadasAgendamento(agendamento);
    if (!coordsNovo) return false;

    for (const membro of grupo) {
      const coordsMembro = this.getCoordenadasAgendamento(membro);
      if (!coordsMembro) return false;

      const distancia = this.calcularDistancia(
        coordsNovo.lat, coordsNovo.lng,
        coordsMembro.lat, coordsMembro.lng
      );

      if (distancia > this.raioProximidade) {
        console.log(`❌ ${agendamento.nomeAluno} está a ${distancia.toFixed(2)}km de ${membro.nomeAluno} - fora do raio!`);
        return false;
      }
    }

    return true;
  }

  // Validar se as coordenadas são realistas
  validarCoordenadas(lat: number, lng: number): boolean {
    // Coordenadas aproximadas do Brasil
    const latMin = -33.5, latMax = 5.5;
    const lngMin = -74.0, lngMax = -34.0;

    const valida = lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;

    if (!valida) {
      console.warn(`❌ Coordenadas fora do Brasil: (${lat}, ${lng})`);
    }

    return valida;
  }

  // Gerar coordenadas realistas para teste
  gerarCoordenadasRealistas(id: number): { lat: number, lng: number } {
    // Base em São Paulo com variação realista
    const baseLat = -23.55;
    const baseLng = -46.63;

    // Variação de até ~5km (0.05 graus ≈ 5.5km)
    const variacaoLat = ((id % 20) - 10) * 0.005; // -0.05 a +0.05
    const variacaoLng = ((id % 15) - 7) * 0.005;  // -0.035 a +0.035

    return {
      lat: baseLat + variacaoLat,
      lng: baseLng + variacaoLng
    };
  }

  // Método para testar distâncias entre coordenadas
  testarDistanciaCoordenadas() {
    console.log('=== TESTE DE DISTÂNCIA ENTRE COORDENADAS ===');

    // Teste com as coordenadas problemáticas que você mencionou
    const coord1 = { lat: -23.55052000, lng: -46.63330800 }; // São Paulo - Centro
    const coord2 = { lat: -23.66894000, lng: -46.68718457 }; // São Paulo - Zona Sul

    const distancia = this.calcularDistancia(coord1.lat, coord1.lng, coord2.lat, coord2.lng);

    console.log('Coordenada 1 (Centro):', coord1);
    console.log('Coordenada 2 (Zona Sul):', coord2);
    console.log(`Distância calculada: ${distancia.toFixed(2)}km`);
    console.log(`Raio atual do grupo: ${this.raioProximidade}km`);
    console.log(`Estariam no mesmo grupo? ${distancia <= this.raioProximidade ? 'SIM ⚠️' : 'NÃO ✅'}`);

    // Mostrar resultado para o usuário
    this.mostrarAlerta('Teste de Distância',
      `📍 Coordenada 1: ${coord1.lat.toFixed(6)}, ${coord1.lng.toFixed(6)} (Centro)\n` +
      `📍 Coordenada 2: ${coord2.lat.toFixed(6)}, ${coord2.lng.toFixed(6)} (Zona Sul)\n\n` +
      `📏 Distância calculada: ${distancia.toFixed(2)}km\n` +
      `🎯 Raio do grupo: ${this.raioProximidade}km\n\n` +
      `Estariam no mesmo grupo? ${distancia <= this.raioProximidade ? 'SIM ⚠️ (PROBLEMA!)' : 'NÃO ✅ (CORRETO)'}`);
  }

  // Método para testar distâncias entre agendamentos reais
  testarDistanciasAgendamentos() {
    if (this.agendamentosDisponiveis.length < 2) {
      this.mostrarAlerta('Atenção', 'É necessário ter pelo menos 2 agendamentos para testar distâncias.');
      return;
    }

    console.log('=== TESTE DE DISTÂNCIAS ENTRE AGENDAMENTOS ===');

    // Pegar os primeiros 3 agendamentos para teste
    const agendamentosTeste = this.agendamentosDisponiveis.slice(0, 3);

    let resultados = '📊 TESTE DE DISTÂNCIAS ENTRE AGENDAMENTOS:\n\n';

    for (let i = 0; i < agendamentosTeste.length; i++) {
      for (let j = i + 1; j < agendamentosTeste.length; j++) {
        const ag1 = agendamentosTeste[i];
        const ag2 = agendamentosTeste[j];

        const coords1 = this.getCoordenadasAgendamento(ag1);
        const coords2 = this.getCoordenadasAgendamento(ag2);

        if (coords1 && coords2) {
          const distancia = this.calcularDistancia(coords1.lat, coords1.lng, coords2.lat, coords2.lng);

          resultados += `📍 ${ag1.nomeAluno} → ${ag2.nomeAluno}\n`;
          resultados += `   Distância: ${distancia.toFixed(2)}km\n`;
          resultados += `   No mesmo grupo? ${distancia <= this.raioProximidade ? 'SIM' : 'NÃO'}\n\n`;

          console.log(`📍 ${ag1.nomeAluno} → ${ag2.nomeAluno}: ${distancia.toFixed(2)}km`);
        }
      }
    }

    resultados += `🎯 Raio do grupo: ${this.raioProximidade}km`;

    this.mostrarAlerta('Distâncias entre Agendamentos', resultados);
  }

  // Debug detalhado do processo de agrupamento
  debugAgrupamentoDetalhado() {
    console.log('=== DEBUG DETALHADO DO AGRUPAMENTO ===');
    console.log(`Total de agendamentos: ${this.agendamentosDisponiveis.length}`);
    console.log(`Raio de proximidade: ${this.raioProximidade}km`);

    // Mostrar coordenadas de todos os agendamentos
    this.agendamentosDisponiveis.forEach((ag, index) => {
      const coords = this.getCoordenadasAgendamento(ag);
      console.log(`${index + 1}. ${ag.nomeAluno}: (${coords?.lat}, ${coords?.lng})`);
    });

    // Mostrar matriz de distâncias
    console.log('=== MATRIZ DE DISTÂNCIAS ===');
    for (let i = 0; i < Math.min(5, this.agendamentosDisponiveis.length); i++) {
      let linha = '';
      for (let j = 0; j < Math.min(5, this.agendamentosDisponiveis.length); j++) {
        if (i === j) {
          linha += '0.00 ';
        } else {
          const coords1 = this.getCoordenadasAgendamento(this.agendamentosDisponiveis[i]);
          const coords2 = this.getCoordenadasAgendamento(this.agendamentosDisponiveis[j]);
          if (coords1 && coords2) {
            const distancia = this.calcularDistancia(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
            linha += `${distancia.toFixed(2)} `;
          } else {
            linha += 'N/A ';
          }
        }
      }
      console.log(linha);
    }

    this.mostrarAlerta('Debug Agrupamento',
      'Verifique o console do navegador para detalhes completos do agrupamento.');
  }

  // Método ULTRA conservador - só agrupa se estiverem MUITO próximos
  agruparAlunosPorProximidadeUltraConservador(agendamentos: any[]): any[] {
    if (agendamentos.length === 0) return [];

    console.log('📍 Iniciando agrupamento ULTRA conservador...');

    const agendamentosComCoordenadas = agendamentos.filter(agendamento => {
      const coords = this.getCoordenadasAgendamento(agendamento);
      return coords !== null && !isNaN(coords.lat) && !isNaN(coords.lng);
    });

    const grupos: any[] = [];
    const processados = new Set<number>();

    // Reduzir o raio pela METADE para ser mais conservador
    const raioConservador = this.raioProximidade * 0.5;
    console.log(`🎯 Usando raio conservador: ${raioConservador.toFixed(2)}km`);

    for (let i = 0; i < agendamentosComCoordenadas.length; i++) {
      const agendamentoAtual = agendamentosComCoordenadas[i];

      if (processados.has(agendamentoAtual.id)) continue;

      const coordsAtual = this.getCoordenadasAgendamento(agendamentoAtual);
      if (!coordsAtual) continue;

      const grupo = [agendamentoAtual];
      processados.add(agendamentoAtual.id);

      for (let j = 0; j < agendamentosComCoordenadas.length; j++) {
        if (i === j) continue;

        const agendamentoVizinho = agendamentosComCoordenadas[j];
        if (processados.has(agendamentoVizinho.id)) continue;

        const coordsVizinho = this.getCoordenadasAgendamento(agendamentoVizinho);
        if (!coordsVizinho) continue;

        const distancia = this.calcularDistancia(
          coordsAtual.lat, coordsAtual.lng,
          coordsVizinho.lat, coordsVizinho.lng
        );

        // USANDO RAIO CONSERVADOR
        if (distancia <= raioConservador) {
          grupo.push(agendamentoVizinho);
          processados.add(agendamentoVizinho.id);
          console.log(`✅ Adicionado ${agendamentoVizinho.nomeAluno} (distância: ${distancia.toFixed(2)}km)`);
        }
      }

      if (grupo.length > 0) {
        const centro = this.calcularCentroGeometrico(grupo.map(ag => this.getCoordenadasAgendamento(ag)!));
        const raioMaximo = this.calcularRaioMaximoGrupo(grupo, centro);

        grupos.push({
          id: `grupo-${grupos.length + 1}`,
          agendamentos: grupo,
          coordenadasCentro: centro,
          quantidade: grupo.length,
          raioMaximo: raioMaximo
        });
      }
    }

    console.log(`✅ Formados ${grupos.length} grupos ultra conservadores`);
    return grupos;
  }

  // Método para usar o agrupamento ultra conservador
  usarAgrupamentoUltraConservador() {
    console.log('🔄 Usando agrupamento ULTRA conservador...');
    this.alunosAgrupadosPorProximidade = this.agruparAlunosPorProximidadeUltraConservador(this.agendamentosDisponiveis);
    this.mostrarAlerta('Agrupamento Atualizado', 'Usando algoritmo ULTRA conservador com raio reduzido pela metade.');
  }

  // Método CORRETO e TESTADO para calcular distância entre coordenadas
  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // console.log(`📍 Calculando distância entre (${lat1}, ${lon1}) e (${lat2}, ${lon2})`);

    const R = 6371; // Raio da Terra em km

    // Converter graus para radianos
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    // Fórmula de Haversine
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    // console.log(`📏 Distância calculada: ${distancia.toFixed(2)}km`);

    return distancia;
  }

  // Verificar sanidade das distâncias calculadas
  verificarSanidadeDistancias() {
    console.log('=== VERIFICAÇÃO DE SANIDADE DAS DISTÂNCIAS ===');

    if (this.agendamentosDisponiveis.length < 2) {
      console.log('❌ Não há agendamentos suficientes para verificação');
      return;
    }

    // Testar com pares conhecidos
    const testes = [
      {
        coord1: { lat: -23.550520, lng: -46.633308 }, // Centro SP
        coord2: { lat: -23.563210, lng: -46.654321 }, // ~3km
        esperado: 2.5
      },
      {
        coord1: { lat: -23.550520, lng: -46.633308 }, // Centro SP  
        coord2: { lat: -23.668940, lng: -46.687184 }, // ~14km
        esperado: 14.0
      }
    ];

    testes.forEach((teste, index) => {
      const calculado = this.calcularDistancia(
        teste.coord1.lat, teste.coord1.lng,
        teste.coord2.lat, teste.coord2.lng
      );

      const diferenca = Math.abs(calculado - teste.esperado);
      const aceitavel = diferenca < 1.0; // Diferença aceitável de 1km

      console.log(`Teste ${index + 1}:`);
      console.log(`  Calculado: ${calculado.toFixed(2)}km`);
      console.log(`  Esperado: ${teste.esperado}km`);
      console.log(`  Diferença: ${diferenca.toFixed(2)}km`);
      console.log(`  ${aceitavel ? '✅ ACEITÁVEL' : '❌ PROBLEMA'}`);
    });

    // Verificar distâncias entre agendamentos reais
    console.log('=== DISTÂNCIAS ENTRE AGENDAMENTOS REAIS ===');
    const agendamentosParaTeste = this.agendamentosDisponiveis.slice(0, 5);

    for (let i = 0; i < agendamentosParaTeste.length; i++) {
      for (let j = i + 1; j < agendamentosParaTeste.length; j++) {
        const ag1 = agendamentosParaTeste[i];
        const ag2 = agendamentosParaTeste[j];

        const coords1 = this.getCoordenadasAgendamento(ag1);
        const coords2 = this.getCoordenadasAgendamento(ag2);

        if (coords1 && coords2) {
          const distancia = this.calcularDistancia(
            coords1.lat, coords1.lng,
            coords2.lat, coords2.lng
          );

          console.log(`📍 ${ag1.nomeAluno} ↔ ${ag2.nomeAluno}: ${distancia.toFixed(2)}km`);
        }
      }
    }
  }

  // Método SIMPLES para debug das coordenadas que vêm da API
  debugCoordenadasAPI() {
    console.log('=== DEBUG COORDENADAS DA API ===');

    this.agendamentosDisponiveis.forEach((agendamento, index) => {
      console.log(`Agendamento ${index + 1} (ID: ${agendamento.id}):`);
      console.log('  Nome:', agendamento.nomeAluno);
      console.log('  Endereço:', agendamento.nomeEndereco);
      console.log('  Objeto COMPLETO:', agendamento);
      console.log('  Latitude:', agendamento.latitude, '(tipo:', typeof agendamento.latitude, ')');
      console.log('  Longitude:', agendamento.longitude, '(tipo:', typeof agendamento.longitude, ')');
      console.log('---');
    });
  }

  async carregarAlunosDoHorario() {
    if (!this.horarioSelecionado || !this.dataSelecionada) {
      this.mostrarAlerta('Seleção Necessária', 'Selecione um horário primeiro.');
      return;
    }

    this.isLoadingAgendamentos = true;

    try {
      console.log('📋 Carregando alunos do horário:', this.horarioSelecionado.horario);

      // Carregar agendamentos
      this.agendamentosDisponiveis = await this.apiService
        .getAgendamentosPorHorarioEData(this.horarioSelecionado.id, this.dataSelecionada)
        .toPromise() || [];

      console.log('✅ Agendamentos carregados:', this.agendamentosDisponiveis);

      // DEBUG IMEDIATO - verificar coordenadas
      this.debugCoordenadasAPI();

      // Verificar alunos indisponíveis
      await this.verificarAlunosIndisponiveis();

      // Calcular proximidade
      await this.calcularProximidadeAutomatica();

    } catch (error) {
      console.error('❌ Erro ao carregar alunos do horário:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os alunos deste horário.');
    } finally {
      this.isLoadingAgendamentos = false; // ← CORRIGIDO: era isLoadingAgunos
    }
  }

  // Método que estava funcionando antes
  getCoordenadasAgendamento(agendamento: any): { lat: number, lng: number } | null {
    try {
      console.log(`📍 Buscando coordenadas para agendamento ${agendamento.id}`);

      // 1. Tentar obter coordenadas diretamente do agendamento
      if (agendamento.latitude !== null && agendamento.latitude !== undefined &&
        agendamento.longitude !== null && agendamento.longitude !== undefined) {
        const lat = parseFloat(agendamento.latitude);
        const lng = parseFloat(agendamento.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          console.log(`✅ Coordenadas encontradas no agendamento: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }

      // 2. Tentar obter coordenadas do endereço (se existir objeto endereco)
      if (agendamento.endereco && agendamento.endereco.latitude && agendamento.endereco.longitude) {
        const lat = parseFloat(agendamento.endereco.latitude);
        const lng = parseFloat(agendamento.endereco.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          console.log(`✅ Coordenadas encontradas no endereço: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }

      // 3. Se não encontrou coordenadas, tentar geocoding pelo nome do endereço
      if (agendamento.nomeEndereco) {
        console.log(`📍 Tentando geocoding para: ${agendamento.nomeEndereco}`);
        const coordenadasGeocode = this.fazerGeocodingSimulado(agendamento.nomeEndereco);
        if (coordenadasGeocode) {
          console.log(`✅ Coordenadas obtidas via geocoding: ${coordenadasGeocode.lat}, ${coordenadasGeocode.lng}`);
          return coordenadasGeocode;
        }
      }

      // 4. Se nada funcionou, usar coordenadas padrão baseadas no ID (para teste)
      const coordenadasPadrao = this.gerarCoordenadasPadrao(agendamento.id);
      console.log(`⚠️ Usando coordenadas padrão para agendamento ${agendamento.id}: ${coordenadasPadrao.lat}, ${coordenadasPadrao.lng}`);

      return coordenadasPadrao;

    } catch (error) {
      console.error(`❌ Erro ao obter coordenadas do agendamento ${agendamento.id}:`, error);

      // Fallback: coordenadas padrão
      const coordenadasPadrao = this.gerarCoordenadasPadrao(agendamento.id);
      return coordenadasPadrao;
    }
  }

  // Método para geocoding simulado
  fazerGeocodingSimulado(endereco: string): { lat: number, lng: number } | null {
    // Coordenadas aproximadas para endereços comuns (substitua por seus valores reais)
    const enderecosConhecidos: { [key: string]: { lat: number, lng: number } } = {
      'campus': { lat: -22.8945, lng: -43.1239 },
      'centro': { lat: -22.9068, lng: -43.1729 },
      'zona sul': { lat: -22.9862, lng: -43.2385 },
      'zona norte': { lat: -22.8233, lng: -43.3333 },
      'zona oeste': { lat: -22.8900, lng: -43.6000 },
      // Adicione mais endereços conhecidos aqui
    };

    const enderecoLower = endereco.toLowerCase();
    for (const [key, coords] of Object.entries(enderecosConhecidos)) {
      if (enderecoLower.includes(key)) {
        return coords;
      }
    }

    return null;
  }

  // Método para gerar coordenadas padrão baseadas no ID (para teste/demonstração)
  gerarCoordenadasPadrao(id: number): { lat: number, lng: number } {
    // Usar o ID para gerar coordenadas consistentes mas diferentes para cada agendamento
    const baseLat = -23.5505; // Latitude base (ex: São Paulo)
    const baseLng = -46.6333; // Longitude base (ex: São Paulo)

    // Variação pequena baseada no ID para não ficarem todos no mesmo ponto
    const variacaoLat = (id % 100) * 0.001; // Variação de ~0.1 graus
    const variacaoLng = (id % 50) * 0.001;  // Variação de ~0.05 graus

    return {
      lat: baseLat + variacaoLat,
      lng: baseLng + variacaoLng
    };
  }

  // Algoritmo de agrupamento por COMPONENTES CONEXAS - que estava funcionando
  agruparAlunosPorProximidade(agendamentos: any[]): any[] {
    if (agendamentos.length === 0) return [];

    console.log('📍 Iniciando agrupamento por COMPONENTES CONEXAS...');

    // Filtrar agendamentos com coordenadas válidas
    const agendamentosComCoordenadas = agendamentos.filter(agendamento => {
      const coords = this.getCoordenadasAgendamento(agendamento);
      const valido = coords !== null && !isNaN(coords.lat) && !isNaN(coords.lng);
      if (!valido) {
        console.warn(`❌ Agendamento ${agendamento.id} sem coordenadas válidas`);
      }
      return valido;
    });

    console.log(`📍 ${agendamentosComCoordenadas.length} de ${agendamentos.length} agendamentos com coordenadas válidas`);

    if (agendamentosComCoordenadas.length === 0) {
      return [];
    }

    // Criar grafo de conexões
    const n = agendamentosComCoordenadas.length;
    const adjacencias: number[][] = Array(n).fill(0).map(() => []);
    const visitado: boolean[] = Array(n).fill(false);
    const grupos: any[][] = [];

    // Construir grafo de adjacências
    for (let i = 0; i < n; i++) {
      const coordsI = this.getCoordenadasAgendamento(agendamentosComCoordenadas[i]);
      if (!coordsI) continue;

      for (let j = i + 1; j < n; j++) {
        const coordsJ = this.getCoordenadasAgendamento(agendamentosComCoordenadas[j]);
        if (!coordsJ) continue;

        const distancia = this.calcularDistancia(
          coordsI.lat, coordsI.lng,
          coordsJ.lat, coordsJ.lng
        );

        // DEBUG: Log de distâncias problemáticas
        if (distancia < 10 && distancia > this.raioProximidade) {
          console.log(`📏 ${agendamentosComCoordenadas[i].nomeAluno} ↔ ${agendamentosComCoordenadas[j].nomeAluno}: ${distancia.toFixed(2)}km (MAIOR que raio ${this.raioProximidade}km)`);
        }

        if (distancia <= this.raioProximidade) {
          adjacencias[i].push(j);
          adjacencias[j].push(i);
          console.log(`🔗 Conectado: ${agendamentosComCoordenadas[i].nomeAluno} ↔ ${agendamentosComCoordenadas[j].nomeAluno} (${distancia.toFixed(2)}km)`);
        }
      }
    }

    // Busca em profundidade para encontrar componentes conexas
    const dfs = (i: number, componente: any[]) => {
      visitado[i] = true;
      componente.push(agendamentosComCoordenadas[i]);

      for (const vizinho of adjacencias[i]) {
        if (!visitado[vizinho]) {
          dfs(vizinho, componente);
        }
      }
    };

    // Encontrar todas as componentes conexas
    for (let i = 0; i < n; i++) {
      if (!visitado[i]) {
        const componente: any[] = [];
        dfs(i, componente);

        if (componente.length > 0) {
          grupos.push(componente);
        }
      }
    }

    // Converter para formato de grupos
    const gruposFormatados = grupos.map((grupo, index) => {
      const centro = this.calcularCentroGeometrico(grupo.map(ag => this.getCoordenadasAgendamento(ag)!));
      const raioMaximo = this.calcularRaioMaximoGrupo(grupo, centro);

      return {
        id: `grupo-${index + 1}`,
        agendamentos: grupo,
        coordenadasCentro: centro,
        quantidade: grupo.length,
        raioMaximo: raioMaximo,
        densidade: grupo.length / (Math.PI * Math.pow(Math.max(raioMaximo, 0.1), 2))
      };
    });

    // Ordenar grupos por tamanho
    gruposFormatados.sort((a, b) => b.quantidade - a.quantidade);

    console.log(`✅ Formados ${gruposFormatados.length} grupos`);
    gruposFormatados.forEach((grupo, index) => {
      console.log(`   Grupo ${index + 1}: ${grupo.quantidade} aluno(s), raio máximo: ${grupo.raioMaximo.toFixed(2)}km`);
    });

    return gruposFormatados;
  }

  // Variáveis para controle da interface (adicione no início da classe)
  mostrarListaCompleta: boolean = false;
  grupoExpandido: string | null = null;

  // Métodos para controle da interface (adicione na classe)

  /**
   * Alternar entre mostrar/ocultar lista completa de alunos
   */
  toggleListaCompleta() {
    this.mostrarListaCompleta = !this.mostrarListaCompleta;
    console.log(`📋 Lista completa ${this.mostrarListaCompleta ? 'aberta' : 'fechada'}`);
  }

  /**
   * Expandir/recolher detalhes de um grupo específico
   */
  toggleDetalhesGrupo(grupoId: string) {
    if (this.grupoExpandido === grupoId) {
      this.grupoExpandido = null;
      console.log(`📂 Recolhendo detalhes do grupo ${grupoId}`);
    } else {
      this.grupoExpandido = grupoId;
      console.log(`📂 Expandindo detalhes do grupo ${grupoId}`);
    }
  }

  /**
   * Limpar seleção de todos os grupos
   */
  limparSelecaoGrupos() {
    const alunosRemovidos = this.agendamentosSelecionados.size;
    this.agendamentosSelecionados.clear();
    console.log(`🗑️ Limpando seleção de ${alunosRemovidos} alunos`);
    this.mostrarAlerta('Seleção Limpa', 'Todos os grupos foram removidos da seleção.');
  }

  /**
   * Selecionar todos os grupos possíveis respeitando a capacidade da van
   */
  selecionarTodosGrupos() {
    const capacidadeVan = this.vanSelecionada?.capacidade || 0;
    let vagasDisponiveis = capacidadeVan - this.agendamentosSelecionados.size;
    let gruposSelecionados = 0;
    let alunosAdicionados = 0;

    console.log(`🚀 Iniciando seleção em lote. Vagas disponíveis: ${vagasDisponiveis}`);

    // Ordenar grupos por quantidade de alunos (maiores primeiro)
    const gruposOrdenados = [...this.alunosAgrupadosPorProximidade].sort((a, b) =>
      b.quantidade - a.quantidade
    );

    gruposOrdenados.forEach(grupo => {
      // Pular grupos já completamente selecionados
      if (this.isGrupoCompletamenteSelecionado(grupo)) {
        console.log(`⏭️ Grupo ${grupo.id} já selecionado, pulando`);
        return;
      }

      const alunosDisponiveis = this.getAlunosDisponiveisGrupo(grupo);

      if (alunosDisponiveis > 0 && alunosDisponiveis <= vagasDisponiveis) {
        console.log(`✅ Selecionando grupo ${grupo.id} com ${alunosDisponiveis} alunos`);
        this.selecionarGrupo(grupo);
        gruposSelecionados++;
        alunosAdicionados += alunosDisponiveis;
        vagasDisponiveis -= alunosDisponiveis;
      } else if (alunosDisponiveis > 0) {
        console.log(`❌ Grupo ${grupo.id} tem ${alunosDisponiveis} alunos mas só há ${vagasDisponiveis} vagas`);
      }
    });

    if (alunosAdicionados > 0) {
      this.mostrarAlerta('Seleção em Lote Concluída',
        `${alunosAdicionados} aluno(s) adicionado(s) de ${gruposSelecionados} grupo(s)!\n\n` +
        `Vagas restantes na van: ${vagasDisponiveis}`);
    } else {
      this.mostrarAlerta('Informação',
        'Não há grupos disponíveis para seleção ou a van está cheia.');
    }
  }

  /**
   * Limpar seleção individual (todos os alunos)
   */
  limparSelecao() {
    const alunosRemovidos = this.agendamentosSelecionados.size;
    this.agendamentosSelecionados.clear();
    console.log(`🗑️ Limpando seleção de ${alunosRemovidos} alunos`);
    this.mostrarAlerta('Seleção Limpa', 'Todos os alunos foram removidos da seleção.');
  }

  /**
   * Obter descrição amigável do grupo
   */
  getDescricaoGrupo(grupo: any): string {
    if (grupo.quantidade === 1) {
      return 'Aluno individual';
    } else if (grupo.raioMaximo && grupo.raioMaximo < 1) {
      return `Grupo muito próximo (${grupo.raioMaximo.toFixed(1)}km)`;
    } else if (grupo.raioMaximo && grupo.raioMaximo <= 2) {
      return `Grupo próximo (${grupo.raioMaximo.toFixed(1)}km)`;
    } else {
      return `Grupo de ${grupo.quantidade} alunos próximos`;
    }
  }

  /**
   * Obter cor do ícone do aluno no grupo
   */
  getCorIconeAlunoGrupo(agendamentoId: number): string {
    if (!this.isAlunoDisponivel(agendamentoId)) {
      return 'danger';
    } else if (this.agendamentosSelecionados.has(agendamentoId)) {
      return 'success';
    } else {
      return 'medium';
    }
  }

  /**
   * Obter total de alunos agrupados
   */
  getTotalAlunosAgrupados(): number {
    return this.alunosAgrupadosPorProximidade.reduce((total, grupo) => total + grupo.quantidade, 0);
  }

  /**
   * Obter alunos disponíveis em um grupo
   */
  getAlunosDisponiveisGrupo(grupo: any): number {
    return grupo.agendamentos.filter((ag: any) =>
      this.isAlunoDisponivel(ag.id) && !this.agendamentosSelecionados.has(ag.id)
    ).length;
  }

  // Método para obter descrição do raio atual
  getDescricaoRaio(): string {
    if (this.raioProximidade <= 1) {
      return 'Grupos muito próximos (bairro)';
    } else if (this.raioProximidade <= 3) {
      return 'Grupos próximos (vizinhança)';
    } else if (this.raioProximidade <= 5) {
      return 'Grupos médios (região)';
    } else {
      return 'Grupos amplos (cidade)';
    }
  }

  // Método para obter cor do raio
  getCorRaio(): string {
    if (this.raioProximidade <= 1) {
      return 'success';
    } else if (this.raioProximidade <= 3) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  /**
   * Sugerir raio otimizado baseado na distribuição dos alunos
   */
  sugerirRaioOtimizado() {
    if (this.agendamentosDisponiveis.length === 0) {
      this.mostrarAlerta('Atenção', 'Nenhum agendamento disponível para sugerir raio.');
      return;
    }

    console.log('💡 Calculando raio otimizado...');

    // Coletar todas as distâncias entre alunos
    const distancias: number[] = [];
    const agendamentosComCoordenadas = this.agendamentosDisponiveis.filter(ag =>
      this.getCoordenadasAgendamento(ag)
    );

    for (let i = 0; i < agendamentosComCoordenadas.length; i++) {
      for (let j = i + 1; j < agendamentosComCoordenadas.length; j++) {
        const coords1 = this.getCoordenadasAgendamento(agendamentosComCoordenadas[i]);
        const coords2 = this.getCoordenadasAgendamento(agendamentosComCoordenadas[j]);

        if (coords1 && coords2) {
          const distancia = this.calcularDistancia(
            coords1.lat, coords1.lng,
            coords2.lat, coords2.lng
          );
          distancias.push(distancia);
        }
      }
    }

    if (distancias.length === 0) {
      this.mostrarAlerta('Informação', 'Não foi possível calcular distâncias entre os alunos.');
      return;
    }

    // Ordenar distâncias
    distancias.sort((a, b) => a - b);

    // Calcular estatísticas
    const media = distancias.reduce((sum, d) => sum + d, 0) / distancias.length;
    const mediana = distancias[Math.floor(distancias.length / 2)];
    const percentil25 = distancias[Math.floor(distancias.length * 0.25)];
    const percentil75 = distancias[Math.floor(distancias.length * 0.75)];

    console.log('📊 Estatísticas de distância:');
    console.log(`   Média: ${media.toFixed(2)}km`);
    console.log(`   Mediana: ${mediana.toFixed(2)}km`);
    console.log(`   25º percentil: ${percentil25.toFixed(2)}km`);
    console.log(`   75º percentil: ${percentil75.toFixed(2)}km`);

    // Sugerir raio baseado na mediana e percentis
    let raioSugerido: number;

    if (agendamentosComCoordenadas.length <= 5) {
      // Poucos alunos - usar raio mais amplo
      raioSugerido = Math.min(5, Math.max(2, mediana * 1.5));
    } else if (agendamentosComCoordenadas.length <= 15) {
      // Número médio de alunos - balancear
      raioSugerido = Math.min(3, Math.max(1, percentil75 * 1.2));
    } else {
      // Muitos alunos - usar raio mais restrito
      raioSugerido = Math.min(2, Math.max(0.5, percentil25 * 1.5));
    }

    // Arredondar para 0.5km mais próximo
    raioSugerido = Math.round(raioSugerido * 2) / 2;

    // Limitar entre 0.5km e 5km
    raioSugerido = Math.max(0.5, Math.min(5, raioSugerido));

    console.log(`🎯 Raio sugerido: ${raioSugerido}km`);

    // Mostrar confirmação
    const confirm = this.alertController.create({
      header: 'Raio Otimizado Sugerido',
      message: `Baseado na distribuição dos ${agendamentosComCoordenadas.length} alunos, sugerimos um raio de ${raioSugerido}km.\n\n` +
        `Isso deve criar grupos eficientes considerando as distâncias entre os alunos.\n\n` +
        `Deseja aplicar este raio?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aplicar',
          handler: () => {
            this.raioProximidade = raioSugerido;
            console.log(`✅ Raio aplicado: ${this.raioProximidade}km`);
            this.calcularProximidadeAutomatica();
            this.mostrarAlerta('Sucesso', `Raio otimizado de ${raioSugerido}km aplicado!`);
          }
        }
      ]
    });

    confirm.then(alert => alert.present());
  }


  onRaioProximidadeChange() {
    console.log(`🎯 Configuração alterada - Raio: ${this.raioProximidade}km, Mínimo: ${this.minAlunosPorGrupo} alunos`);

    // Forçar atualização da view
    this.changeDetectorRef.detectChanges();

    this.calcularProximidadeAutomatica();
  }

  /**
   * Método para debug da funcionalidade de vans
   */
  async debugVans() {
    console.log('=== DEBUG GERENCIAR VANS ===');

    console.log('1. Área ativa:', this.activeArea);
    console.log('2. Sidebar aberta:', this.sidebarOpen);
    console.log('3. Vans carregadas:', this.vans.length);
    console.log('4. Vans array:', this.vans);
    console.log('5. Loading state:', this.isLoadingVans);
    console.log('6. Show van form:', this.showVanForm);
    console.log('7. Van editando:', this.vanEditando);

    // Testar chamada da API
    try {
      console.log('8. Testando API de vans...');
      const vansAPI = await this.apiService.getVans().toPromise();
      console.log('✅ API response:', vansAPI);
    } catch (error) {
      console.error('❌ Erro na API:', error);
    }
  }

  async carregarVans() {
    console.log('🔄 carregarVans() chamado');
    this.isLoadingVans = true;

    const loading = await this.loadingController.create({
      message: 'Carregando vans...'
    });
    await loading.present();

    try {
      console.log('📡 Fazendo requisição para API...');
      this.vans = await this.apiService.getVans().toPromise() || [];
      console.log('✅ Vans carregadas:', this.vans);
      console.log('✅ Quantidade de vans:', this.vans.length);
    } catch (error) {
      console.error('❌ Erro ao carregar vans:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar as vans.');
    } finally {
      this.isLoadingVans = false;
      await loading.dismiss();
      console.log('🏁 carregarVans() finalizado');
    }
  }

  /**
   * Debug do método editarVan
   */
  debugEditarVan(van: any) {
    console.log('=== DEBUG EDITAR VAN ===');
    console.log('Van clicada:', van);
    console.log('showVanForm antes:', this.showVanForm);
    console.log('showEditarForm antes:', this.showEditarForm);
    console.log('vanEditando antes:', this.vanEditando);
    console.log('Formulário válido:', this.editarVanForm.valid);

    // Chamar o método original
    this.editarVan(van);

    // Verificar depois
    setTimeout(() => {
      console.log('showVanForm depois:', this.showVanForm);
      console.log('showEditarForm depois:', this.showEditarForm);
      console.log('vanEditando depois:', this.vanEditando);
      console.log('Valores do formulário:', this.editarVanForm.value);
    }, 100);
  }

  editarVan(van: any) {
    console.log('🔄 Iniciando edição da van:', van);

    this.vanEditando = { ...van }; // Criar cópia para não modificar o original
    this.showEditarForm = true;
    this.showVanForm = false;

    // Preencher o formulário com os dados da van
    this.editarVanForm.patchValue({
      placa: van.placa,
      capacidade: van.capacidade.toString()
    });

    console.log('✅ Formulário preenchido:', this.editarVanForm.value);
    console.log('✅ Van em edição:', this.vanEditando);
  }

  async salvarEdicao() {
    console.log('💾 Tentando salvar edição...');

    if (this.editarVanForm.valid && this.vanEditando) {
      console.log('✅ Formulário válido, van em edição:', this.vanEditando);

      const loading = await this.loadingController.create({
        message: 'Salvando alterações...'
      });
      await loading.present();

      try {
        const vanData = {
          placa: this.editarVanForm.value.placa.toUpperCase(),
          capacidade: parseInt(this.editarVanForm.value.capacidade)
        };

        console.log('📤 Enviando dados para API:', vanData);
        console.log('🆔 ID da van:', this.vanEditando.id);

        await this.apiService.atualizarVan(this.vanEditando.id, vanData).toPromise();

        this.mostrarAlerta('Sucesso', 'Van atualizada com sucesso!');
        this.cancelarEdicao();
        await this.carregarVans(); // Recarregar a lista

      } catch (error: any) {
        console.error('❌ Erro ao atualizar van:', error);
        let mensagem = 'Não foi possível atualizar a van.';

        if (error.error) {
          if (typeof error.error === 'string') {
            mensagem = error.error;
          } else if (error.error.message) {
            mensagem = error.error.message;
          }
        }

        this.mostrarAlerta('Erro', mensagem);
      } finally {
        await loading.dismiss();
      }
    } else {
      console.error('❌ Formulário inválido ou van não selecionada');
      console.log('Form válido:', this.editarVanForm.valid);
      console.log('Van editando:', this.vanEditando);
      this.mostrarAlerta('Erro', 'Dados inválidos para edição.');
    }
  }

  cancelarEdicao() {
    console.log('❌ Cancelando edição...');
    this.showEditarForm = false;
    this.vanEditando = null;
    this.editarVanForm.reset();
    console.log('✅ Edição cancelada');
  }

  /**
   * Carregar avisos do mural
   */
  async carregarAvisos() {
    this.isLoadingAvisos = true;
    const loading = await this.loadingController.create({
      message: 'Carregando avisos...'
    });
    await loading.present();

    try {
      this.avisos = await this.apiService.getAvisos().toPromise() || [];
      console.log('Avisos carregados:', this.avisos);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os avisos.');
    } finally {
      this.isLoadingAvisos = false;
      await loading.dismiss();
    }
  }

  /**
   * Editar aviso
   */
  editarAviso(aviso: any) {
    this.avisoEditando = { ...aviso };
    this.novoAvisoForm.patchValue({
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      categoria: aviso.categoria,
      prioridade: aviso.prioridade,
      dataExpiracao: aviso.dataExpiracao ? aviso.dataExpiracao.split('T')[0] : ''
    });
  }

  /**
   * Salvar edição do aviso
   */
  async salvarEdicaoAviso() {
    if (this.novoAvisoForm.valid && this.avisoEditando) {
      const loading = await this.loadingController.create({
        message: 'Atualizando aviso...'
      });
      await loading.present();

      try {
        const avisoData = {
          ...this.novoAvisoForm.value,
          dataExpiracao: this.novoAvisoForm.value.dataExpiracao
            ? new Date(this.novoAvisoForm.value.dataExpiracao).toISOString()
            : null
        };

        await this.apiService.atualizarAviso(this.avisoEditando.id, avisoData).toPromise();

        this.mostrarAlerta('Sucesso', 'Aviso atualizado com sucesso!');
        this.cancelarEdicaoAviso();
        await this.carregarAvisos();

      } catch (error: any) {
        console.error('Erro ao atualizar aviso:', error);
        this.mostrarAlerta('Erro', 'Não foi possível atualizar o aviso.');
      } finally {
        await loading.dismiss();
      }
    }
  }

  /**
   * Cancelar edição do aviso
   */
  cancelarEdicaoAviso() {
    this.avisoEditando = null;
    this.novoAvisoForm.reset({
      categoria: 'Geral',
      prioridade: 'media'
    });
  }

  /**
   * Excluir aviso
   */
  async excluirAviso(aviso: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o aviso "${aviso.titulo}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo aviso...'
            });
            await loading.present();

            try {
              await this.apiService.deletarAviso(aviso.id).toPromise();
              this.mostrarAlerta('Sucesso', 'Aviso excluído com sucesso!');
              await this.carregarAvisos();
            } catch (error) {
              console.error('Erro ao excluir aviso:', error);
              this.mostrarAlerta('Erro', 'Não foi possível excluir o aviso.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Obter cor da prioridade
   */
  getCorPrioridade(prioridade: string): string {
    switch (prioridade) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baixa': return 'success';
      default: return 'medium';
    }
  }

  /**
   * Obter ícone da categoria
   */
  getIconeCategoria(categoria: string): string {
    switch (categoria) {
      case 'Urgente': return 'warning';
      case 'Manutenção': return 'construct';
      case 'Rotas': return 'bus';
      case 'Informação': return 'information-circle';
      default: return 'megaphone';
    }
  }

  /**
   * Verificar se aviso está expirado
   */
  isAvisoExpirado(aviso: any): boolean {
    if (!aviso.dataExpiracao) return false;
    return new Date(aviso.dataExpiracao) < new Date();
  }

  /**
   * Formatar data para exibição
   */
  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  toggleArea(area: string) {
    console.log('Mudando para área:', area);
    this.activeArea = area;

    if (area === 'vans') {
      console.log('Carregando vans...');
      this.carregarVans();
      this.cancelarEdicao();
    } else if (area === 'alunos') {
      console.log('Carregando alunos...');
      this.carregarAlunos();
    } else if (area === 'presenca') {
      console.log('Carregando presenças...');
      this.carregarPresencas();
    } else if (area === 'home') {
      console.log('Carregando estatísticas...');
      this.carregarEstatisticas();
    } else if (area === 'validacao') {
      console.log('Carregando validação de acesso...');
      this.carregarValidacaoAcesso();
    } else if (area === 'atribuir-van') {
      console.log('Carregando atribuição de vans...');
      this.carregarAtribuicoes();
    } else if (area === 'mural') {
      console.log('Carregando mural de avisos...');
      this.carregarAvisos();
      this.cancelarEdicaoAviso();
    }

    console.log('Área ativa:', this.activeArea);
  }

  async criarAviso() {
    if (this.novoAvisoForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Publicando aviso...'
      });
      await loading.present();

      try {
        const formValue = this.novoAvisoForm.value;

        console.log('📝 Dados do formulário:', formValue);

        // ✅ CORRIGIDO: Data de expiração é obrigatória
        if (!formValue.dataExpiracao) {
          this.mostrarAlerta('Erro', 'Data de expiração é obrigatória.');
          await loading.dismiss();
          return;
        }

        const avisoData = {
          titulo: formValue.titulo,
          mensagem: formValue.mensagem,
          categoria: formValue.categoria,
          prioridade: formValue.prioridade,
          dataPublicacao: new Date().toISOString(),
          dataExpiracao: new Date(formValue.dataExpiracao).toISOString(),
          autor: this.user.nome,
          idUsuario: this.user.id,
          status: 'ativo',
          conteudo: formValue.titulo + ': ' + formValue.mensagem, // Para compatibilidade
          dataPostagem: new Date().toISOString() // Para compatibilidade
        };

        console.log('📤 Enviando para API:', avisoData);

        const novoAviso = await this.apiService.criarAviso(avisoData).toPromise();
        console.log('✅ Resposta da API:', novoAviso);

        this.mostrarAlerta('Sucesso', 'Aviso publicado com sucesso!');

        // Resetar formulário
        this.novoAvisoForm.reset({
          categoria: 'Geral',
          prioridade: 'media'
        });

        // Recarregar lista
        await this.carregarAvisos();

      } catch (error: any) {
        console.error('❌ Erro completo ao criar aviso:', error);
        console.error('❌ Status do erro:', error.status);
        console.error('❌ Mensagem do erro:', error.message);
        console.error('❌ Error object:', JSON.stringify(error, null, 2));

        let mensagem = 'Não foi possível publicar o aviso. Erro interno do servidor.';

        if (error.error) {
          if (typeof error.error === 'string') {
            mensagem = error.error;
          } else if (error.error.message) {
            mensagem = error.error.message;
          } else if (error.error.error) {
            mensagem = error.error.error;
          }
        }

        this.mostrarAlerta('Erro', mensagem);
      } finally {
        await loading.dismiss();
      }
    } else {
      console.log('❌ Formulário inválido:', this.novoAvisoForm.errors);
      console.log('❌ Campos:', this.novoAvisoForm.value);
      this.mostrarAlerta('Formulário Inválido', 'Preencha todos os campos obrigatórios corretamente.');
    }
  }

}