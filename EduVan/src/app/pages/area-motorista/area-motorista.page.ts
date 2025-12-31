import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

// Importações do OpenLayers
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';
import LineString from 'ol/geom/LineString';

@Component({
  selector: 'app-area-motorista',
  templateUrl: './area-motorista.page.html',
  styleUrls: ['./area-motorista.page.scss'],
  standalone: false,
})
export class AreaMotoristaPage implements OnInit, OnDestroy {
  isMobile = false;
  sidebarOverlayOpen = false;
  sidebarOpen = false;
  activeArea = 'home';
  user: any;

  // NOVA PROPRIEDADE: Data atual
  dataHoje: Date = new Date();
  dataHojeFormatada: string = '';

  // Estatísticas
  totalAlunos: number = 0;
  minhasRotasHoje: number = 0;

  // NOVO: Placa da van
  placaVan: string = 'Carregando...';
  vanInfo: any = null;

  // NOVO: Contagem de rotas por horário
  rotasByHorarioCount: any = new Map();

  // NOVO: Total de horários disponíveis (para comparação)
  totalHorariosDisponiveis: number = 0;

  // Variáveis para alunos
  alunos: any[] = [];
  isLoadingAlunos: boolean = false;

  // Variáveis para a van do motorista
  minhaVan: any = null;
  isLoadingVan: boolean = false;

  // Variáveis para rotas organizadas por horário
  minhasRotasHojeLista: any[] = [];
  rotasByHorario: any = new Map();
  horariosDisponiveis: any[] = [];
  isLoadingRotas: boolean = false;

  // Variáveis para mapa
  mapaVisivel: boolean = false;
  rotaSelecionadaMapa: any = null;
  detalhesRota: any = null;
  agendamentosDaRota: any[] = [];

  // OpenLayers
  private map: Map | null = null;

  todasVans: any[] = [];

  // NOVO: Variáveis para exibição no template
  infoVan: string = '';
  infoHorario: string = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.user = this.authService.getCurrentUserValue();

    // Formatar data atual para YYYY-MM-DD (igual ao banco)
    const hoje = new Date();
    this.dataHojeFormatada = hoje.toISOString().split('T')[0];

    this.checkMobileMode();
    window.addEventListener('resize', () => this.checkMobileMode());
    await this.carregarDadosIniciais();
  }

  ngOnDestroy() {
    // Limpar o mapa quando o componente for destruído
    if (this.map) {
      this.map.setTarget(undefined);
      this.map = null;
    }
  }

  async carregarDadosIniciais() {
    // 1. Primeiro carregar TODAS as vans
    await this.carregarTodasVans();

    // 2. Carregar estatísticas gerais
    await this.carregarEstatisticas();

    // 3. Carregar horários disponíveis
    await this.carregarHorariosDisponiveis();

    // 4. Carregar as rotas DE HOJE do motorista logado
    await this.carregarMinhasRotasHoje();

    // 5. AGORA determinar qual van usar HOJE (depois de carregar as rotas)
    await this.determinarVanDoDia();

    // 6. Calcular estatísticas de rotas
    this.calcularEstatisticasRotas();
  }

  async carregarTodasVans() {
    try {
      this.todasVans = await this.apiService.getVans().toPromise() || [];
      console.log('Vans carregadas:', this.todasVans);
    } catch (error) {
      console.error('Erro ao carregar vans:', error);
    }
  }

  // NOVO: Método para determinar qual van usar hoje baseado nas rotas DE HOJE
  async determinarVanDoDia() {
    console.log('Determinando van do dia...');

    if (this.minhasRotasHojeLista.length === 0) {
      this.placaVan = 'Sem rotas para hoje';
      this.vanInfo = null;
      console.log('Nenhuma rota encontrada para hoje');
      return;
    }

    // Pegar o ID da van da primeira rota DE HOJE
    const primeiraRotaHoje = this.minhasRotasHojeLista[0];

    // IMPORTANTE: Verificar qual campo contém o ID da van
    const idVanNaRota = primeiraRotaHoje.idVan || primeiraRotaHoje.id_van || primeiraRotaHoje.vanId;

    if (!idVanNaRota) {
      this.placaVan = 'Van não especificada na rota';
      this.vanInfo = null;
      console.log('Van não especificada na rota');
      return;
    }

    // Buscar a van pelo ID
    const vanEncontrada = this.todasVans.find(van =>
      van.id == idVanNaRota ||
      van.id === idVanNaRota
    );

    if (vanEncontrada) {
      this.vanInfo = vanEncontrada;
      this.placaVan = vanEncontrada.placa || 'Sem placa';
      console.log('Van atribuída com sucesso:', this.placaVan);
    } else {
      this.placaVan = `Van ID ${idVanNaRota} (não encontrada no sistema)`;
      this.vanInfo = null;
      console.log('Van não encontrada no sistema');
    }
  }

  async carregarEstatisticas() {
    try {
      const [alunos, minhasRotas] = await Promise.all([
        this.apiService.getAlunos().toPromise(),
        this.apiService.getRotasPorMotorista(this.user.id).toPromise()
      ]);

      this.totalAlunos = alunos?.length || 0;
      this.minhasRotasHoje = minhasRotas?.length || 0;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  calcularEstatisticasRotas() {
    // Resetar contagem
    this.rotasByHorarioCount = new Map();

    // Contar rotas por horário
    this.minhasRotasHojeLista.forEach(rota => {
      const horarioId = rota.idHorario || rota.id_horario || rota.horarioId;
      if (horarioId) {
        const currentCount = this.rotasByHorarioCount.get(horarioId) || 0;
        this.rotasByHorarioCount.set(horarioId, currentCount + 1);
      }
    });

    // Atualizar total de horários disponíveis
    this.totalHorariosDisponiveis = this.horariosDisponiveis.length;
  }

  getRotasEmTodosHorarios(): boolean {
    if (this.totalHorariosDisponiveis === 0) return false;

    for (const horario of this.horariosDisponiveis) {
      if (!this.rotasByHorarioCount.has(horario.id) || this.rotasByHorarioCount.get(horario.id) === 0) {
        return false;
      }
    }
    return true;
  }

  getStatusRotas(): string {
    const totalRotasHoje = this.minhasRotasHojeLista.length;
    const totalHorarios = this.horariosDisponiveis.length;

    if (totalRotasHoje >= totalHorarios && this.getRotasEmTodosHorarios()) {
      return `✅ Todas as ${totalHorarios} rotas/horários preenchidos`;
    } else if (totalRotasHoje >= totalHorarios) {
      return `⚠️ ${totalRotasHoje} rotas (atingiu número de horários, mas não em todos)`;
    } else {
      return `📋 ${totalRotasHoje} de ${totalHorarios} rotas/horários`;
    }
  }

  async carregarHorariosDisponiveis() {
    try {
      this.horariosDisponiveis = await this.apiService.getTodosHorarios().toPromise() || [];
      console.log('Horários disponíveis:', this.horariosDisponiveis);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  }

  async carregarMinhasRotasHoje() {
    if (!this.user) return;

    this.isLoadingRotas = true;
    try {
      console.log('Carregando rotas para motorista ID:', this.user.id);
      console.log('Data de hoje para filtro:', this.dataHojeFormatada);

      const todasMinhasRotas = await this.apiService.getRotasPorMotorista(
        this.user.id
      ).toPromise() || [];

      console.log('TODAS as rotas do motorista:', todasMinhasRotas);

      // Filtrar rotas de hoje
      this.minhasRotasHojeLista = todasMinhasRotas.filter((rota: any) => {
        const rotaData = rota.data || rota.data_rota || rota.dataRota;
        return rotaData === this.dataHojeFormatada;
      });

      console.log('Rotas FILTRADAS para hoje:', this.minhasRotasHojeLista);

      // Organizar por horário
      this.organizarRotasByHorario();

    } catch (error) {
      console.error('Erro ao carregar minhas rotas:', error);
    } finally {
      this.isLoadingRotas = false;
    }
  }

  organizarRotasByHorario() {
    this.rotasByHorario = new Map();

    this.minhasRotasHojeLista.forEach(rota => {
      const horarioId = rota.idHorario || rota.id_horario || rota.horarioId;
      if (horarioId) {
        if (!this.rotasByHorario.has(horarioId)) {
          this.rotasByHorario.set(horarioId, []);
        }
        this.rotasByHorario.get(horarioId)!.push(rota);
      }
    });

    console.log('Rotas organizadas por horário:', this.rotasByHorario);
  }

  getRotasDoHorario(horarioId: number): any[] {
    return this.rotasByHorario.get(horarioId) || [];
  }

  getHorarioById(horarioId: number): any {
    return this.horariosDisponiveis.find(h => h.id === horarioId);
  }

  // NOVO: Método para obter placa da van da rota atual
  getPlacaVan(): string {
    if (!this.detalhesRota) return 'Não atribuída';

    const vanId = this.detalhesRota.id_van || this.detalhesRota.idVan;
    const van = this.todasVans.find(v => v.id === vanId);
    return van?.placa || 'Não atribuída';
  }

  // NOVO: Método para obter horário da rota atual
  getHorarioRota(): string {
    if (!this.detalhesRota) return 'Não definido';

    const horarioId = this.detalhesRota.id_horario || this.detalhesRota.idHorario;
    const horario = this.getHorarioById(horarioId);
    return horario?.horario || 'Não definido';
  }

  getDetalhesVan(): string {
    if (!this.vanInfo) return 'Informações não disponíveis';

    let detalhes = '';
    if (this.vanInfo.modelo) detalhes += `Modelo: ${this.vanInfo.modelo}`;
    if (this.vanInfo.cor) detalhes += ` | Cor: ${this.vanInfo.cor}`;
    if (this.vanInfo.ano) detalhes += ` | Ano: ${this.vanInfo.ano}`;
    if (this.vanInfo.capacidade) detalhes += ` | Capacidade: ${this.vanInfo.capacidade}`;

    return detalhes || 'Sem detalhes adicionais';
  }

  atualizarPlacaVan() {
    console.warn('Método atualizarPlacaVan() está obsoleto. Use determinarVanDoDia()');
  }

  async carregarAlunos() {
    this.isLoadingAlunos = true;
    const loading = await this.loadingController.create({
      message: 'Carregando alunos...'
    });
    await loading.present();

    try {
      this.alunos = await this.apiService.getAlunos().toPromise() || [];
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os alunos.');
    } finally {
      this.isLoadingAlunos = false;
      await loading.dismiss();
    }
  }

  // Método melhorado para visualizar rota no mapa
  async visualizarRotaNoMapa(rota: any) {
    const loading = await this.loadingController.create({
      message: 'Carregando mapa e detalhes da rota...'
    });
    await loading.present();

    try {
      this.rotaSelecionadaMapa = rota;

      // Carregar detalhes da rota e agendamentos
      await this.carregarDetalhesRotaMelhorado(rota.id);

      // Verificar se há agendamentos
      if (this.agendamentosDaRota.length === 0) {
        await loading.dismiss();
        this.mostrarAlerta(
          'Sem agendamentos',
          'Esta rota não possui agendamentos associados. Nenhum ponto de parada para exibir no mapa.'
        );
        return;
      }

      this.mapaVisivel = true;

      // Aguardar um pouco para garantir que o DOM esteja atualizado
      setTimeout(() => {
        this.inicializarMapaOpenLayers();
      }, 100);

    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar o mapa.');
    } finally {
      await loading.dismiss();
    }
  }

  // MÉTODO MELHORADO para carregar detalhes da rota
  async carregarDetalhesRotaMelhorado(rotaId: number) {
    try {
      // 1. Carregar detalhes da rota
      this.detalhesRota = await this.apiService.getRotaById(rotaId).toPromise();
      console.log('Detalhes da rota:', this.detalhesRota);

      // 2. Limpar agendamentos anteriores
      this.agendamentosDaRota = [];

      // 3. Carregar rota-agendamentos da tabela 'rota_agendamento'
      console.log('Carregando rota-agendamentos para rota ID:', rotaId);
      
      try {
        // Primeiro, precisamos de um endpoint que busque os rota_agendamentos
        // Se não existir, podemos usar este método alternativo
        const rotaAgendamentos = await this.getRotaAgendamentosAlternativo(rotaId);
        
        if (rotaAgendamentos && rotaAgendamentos.length > 0) {
          console.log('Rota-agendamentos encontrados:', rotaAgendamentos.length);
          
          // Processar cada rota-agendamento
          for (const ra of rotaAgendamentos) {
            console.log('Processando rota-agendamento:', ra);
            await this.carregarAgendamentoCompleto(ra.id_agendamento || ra.idAgendamento, ra.ordem);
          }
        } else {
          console.log('Nenhum rota-agendamento encontrado, tentando método alternativo...');
          // Tentar método alternativo para agendamentos
          await this.carregarAgendamentosPorDataHorario(rotaId);
        }
      } catch (error) {
        console.error('Erro ao carregar rota-agendamentos:', error);
        await this.carregarAgendamentosPorDataHorario(rotaId);
      }

      // Ordenar por ordem se houver
      this.agendamentosDaRota.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

      console.log('Agendamentos da rota processados:', this.agendamentosDaRota);
      console.log('Total de agendamentos:', this.agendamentosDaRota.length);

      // Atualizar informações para exibição
      this.infoVan = this.getPlacaVan();
      this.infoHorario = this.getHorarioRota();

    } catch (error) {
      console.error('Erro ao carregar detalhes da rota:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar os detalhes da rota.');
    }
  }

  // Método alternativo para buscar rota_agendamentos
  async getRotaAgendamentosAlternativo(rotaId: number): Promise<any[]> {
    try {
      // Se você tiver um endpoint específico para rota_agendamentos
      // Se não, podemos tentar buscar todos e filtrar
      const todosAgendamentos = await this.apiService.getAgendamentos().toPromise() || [];
      
      // Para simular, vamos buscar agendamentos que têm data igual à da rota
      if (this.detalhesRota && this.detalhesRota.data) {
        return todosAgendamentos.filter((ag: any) => {
          const dataAgendamento = ag.data_agendada || ag.dataAgendada;
          return dataAgendamento === this.detalhesRota.data;
        }).map((ag: any, index: number) => ({
          id_agendamento: ag.id,
          ordem: index + 1
        }));
      }
      return [];
    } catch (error) {
      console.error('Erro no método alternativo:', error);
      return [];
    }
  }

  // Carregar agendamentos por data e horário
  async carregarAgendamentosPorDataHorario(rotaId: number) {
    if (!this.detalhesRota) return;

    try {
      const dataRota = this.detalhesRota.data;
      const horarioId = this.detalhesRota.id_horario || this.detalhesRota.idHorario;
      
      console.log('Buscando agendamentos para:', { dataRota, horarioId });

      // Buscar todos os agendamentos
      const todosAgendamentos = await this.apiService.getAgendamentos().toPromise() || [];
      
      // Filtrar por data e horário
      const agendamentosFiltrados = todosAgendamentos.filter((ag: any) => {
        const dataAg = ag.data_agendada || ag.dataAgendada;
        const horarioAg = ag.id_horario || ag.idHorario;
        
        return dataAg === dataRota && horarioAg === horarioId;
      });

      console.log('Agendamentos filtrados:', agendamentosFiltrados.length);

      // Processar cada agendamento
      for (let i = 0; i < agendamentosFiltrados.length; i++) {
        await this.carregarAgendamentoCompleto(agendamentosFiltrados[i].id, i + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos por data/horário:', error);
    }
  }

  // Carregar agendamento completo com aluno e endereço
  async carregarAgendamentoCompleto(agendamentoId: number, ordem: number) {
    try {
      console.log('Carregando agendamento ID:', agendamentoId);
      
      // Carregar agendamento
      const agendamento = await this.apiService.getAgendamentoById(agendamentoId).toPromise();
      
      if (!agendamento) {
        console.warn('Agendamento não encontrado:', agendamentoId);
        return;
      }

      console.log('Agendamento encontrado:', agendamento);

      // Carregar aluno
      let aluno = null;
      const alunoId = agendamento.id_aluno || agendamento.idAluno;
      if (alunoId) {
        try {
          aluno = await this.apiService.getAlunoById(alunoId).toPromise();
          console.log('Aluno carregado:', aluno?.nome);
        } catch (error) {
          console.error('Erro ao carregar aluno:', error);
        }
      }

      // Carregar endereço - ESSENCIAL PARA O MAPA
      let endereco = null;
      const enderecoId = agendamento.id_endereco || agendamento.idEndereco;
      if (enderecoId) {
        try {
          endereco = await this.apiService.getEnderecoById(enderecoId).toPromise();
          console.log('Endereço carregado:', endereco);
          
          // Verificar se tem coordenadas
          if (endereco && endereco.latitude && endereco.longitude) {
            console.log('Coordenadas encontradas:', endereco.latitude, endereco.longitude);
          } else {
            console.warn('Endereço sem coordenadas:', endereco);
          }
        } catch (error) {
          console.error('Erro ao carregar endereço:', error);
        }
      }

      // Adicionar à lista
      this.agendamentosDaRota.push({
        ...agendamento,
        aluno: aluno,
        endereco: endereco,
        ordem: ordem
      });

    } catch (error) {
      console.error('Erro ao carregar agendamento completo:', error);
    }
  }

  // Método para inicializar o mapa OpenLayers - OTIMIZADO
  async inicializarMapaOpenLayers() {
    console.log('Inicializando mapa com', this.agendamentosDaRota.length, 'agendamentos');
    
    if (!this.agendamentosDaRota || this.agendamentosDaRota.length === 0) {
      this.mostrarAlerta('Sem pontos', 'Não há agendamentos para esta rota.');
      return;
    }

    try {
      // Destruir mapa anterior se existir
      if (this.map) {
        this.map.setTarget(undefined);
        this.map = null;
      }

      // Criar array de coordenadas dos pontos de parada
      const coordinates: number[][] = [];
      const pointFeatures: Feature[] = [];

      // Filtrar apenas agendamentos com coordenadas válidas
      const agendamentosComCoordenadas = this.agendamentosDaRota.filter(ag => 
        ag.endereco && 
        ag.endereco.latitude && 
        ag.endereco.longitude &&
        !isNaN(Number(ag.endereco.latitude)) &&
        !isNaN(Number(ag.endereco.longitude))
      );

      if (agendamentosComCoordenadas.length === 0) {
        this.mostrarAlerta('Sem coordenadas', 'Nenhum endereço possui coordenadas válidas para exibir no mapa.');
        return;
      }

      console.log('Agendamentos com coordenadas válidas:', agendamentosComCoordenadas.length);

      // Processar cada agendamento com coordenadas
      agendamentosComCoordenadas.forEach((agendamento, index) => {
        try {
          const lat = Number(agendamento.endereco.latitude);
          const lng = Number(agendamento.endereco.longitude);
          
          console.log(`Coordenadas ${index + 1}:`, { lat, lng });

          const coord = fromLonLat([lng, lat]);
          coordinates.push([coord[0], coord[1]]);

          // Criar feature para o ponto
          const point = new Feature({
            geometry: new Point(coord),
            name: `Parada ${agendamento.ordem}: ${agendamento.aluno?.nome || 'Aluno'}`,
            aluno: agendamento.aluno?.nome || 'Aluno não identificado',
            endereco: agendamento.endereco.nome || 'Endereço não informado',
            ordem: agendamento.ordem || index + 1
          });

          pointFeatures.push(point);
        } catch (error) {
          console.error('Erro ao processar coordenadas do agendamento:', agendamento, error);
        }
      });

      if (coordinates.length === 0) {
        this.mostrarAlerta('Erro', 'Não foi possível processar as coordenadas dos endereços.');
        return;
      }

      // Criar source para os pontos
      const vectorSource = new VectorSource({
        features: pointFeatures
      });

      // Criar layer para os pontos
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
          const ordem = feature.get('ordem');
          return new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({ color: '#4285F4' }),
              stroke: new Stroke({ color: '#fff', width: 3 })
            }),
            text: new Text({
              text: ordem.toString(),
              fill: new Fill({ color: '#fff' }),
              font: 'bold 14px Arial',
              offsetY: -20
            })
          });
        }
      });

      // Criar layer para a linha da rota (apenas se houver mais de um ponto)
      let lineLayer: VectorLayer | null = null;
      if (coordinates.length > 1) {
        const lineCoordinates = coordinates.map(coord => [coord[0], coord[1]]);
        const lineFeature = new Feature({
          geometry: new LineString(lineCoordinates),
          name: 'Rota do trajeto'
        });

        const lineSource = new VectorSource({
          features: [lineFeature]
        });

        lineLayer = new VectorLayer({
          source: lineSource,
          style: new Style({
            stroke: new Stroke({
              color: '#FF5722',
              width: 4,
              lineDash: [10, 10]
            })
          })
        });
      }

      // Calcular bounding box para ajustar a view
      const extent = vectorSource.getExtent();

      // Criar o mapa
      this.map = new Map({
        target: 'map-container',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          ...(lineLayer ? [lineLayer] : []),
          vectorLayer
        ],
        view: new View({
          center: coordinates.length > 0 ? coordinates[0] : [0, 0],
          zoom: 13
        })
      });

      // Ajustar view para mostrar todos os pontos
      this.map.getView().fit(extent, {
        padding: [100, 100, 100, 100],
        duration: 1500,
        maxZoom: 15
      });

      // Adicionar interação para mostrar informações
      this.map.on('click', (event) => {
        const feature = this.map!.forEachFeatureAtPixel(event.pixel, (feat) => feat);

        if (feature) {
          const info = `
            <strong>${feature.get('name')}</strong><br/>
            <strong>Aluno:</strong> ${feature.get('aluno')}<br/>
            <strong>Endereço:</strong> ${feature.get('endereco')}<br/>
            <strong>Ordem na rota:</strong> ${feature.get('ordem')}
          `;

          this.mostrarAlerta('Informações da Parada', info);
        }
      });

      // Mudar cursor quando passar sobre um ponto
      this.map.on('pointermove', (event) => {
        const pixel = this.map!.getEventPixel(event.originalEvent);
        const hit = this.map!.hasFeatureAtPixel(pixel);
        (this.map!.getTarget() as HTMLElement).style.cursor = hit ? 'pointer' : '';
      });

      console.log('Mapa inicializado com sucesso!');

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      this.mostrarAlerta('Erro', 'Não foi possível inicializar o mapa. Verifique o console para detalhes.');
    }
  }

  fecharMapa() {
    this.mapaVisivel = false;
    this.rotaSelecionadaMapa = null;
    this.detalhesRota = null;
    this.agendamentosDaRota = [];
    this.infoVan = '';
    this.infoHorario = '';

    // Destruir o mapa
    if (this.map) {
      this.map.setTarget(undefined);
      this.map = null;
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

  // Logout
  logout() {
    try {
      this.authService.logout();
    } catch (e) {
      console.warn('Logout: erro ao chamar authService.logout()', e);
    }
    this.router.navigate(['/inicio']);
  }

  checkMobileMode() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile && this.sidebarOpen) {
      this.sidebarOpen = false;
      this.sidebarOverlayOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarOverlayOpen = this.sidebarOpen && this.isMobile;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.sidebarOpen = false;
      this.sidebarOverlayOpen = false;
    }
  }

  toggleArea(area: string) {
    this.closeSidebar();
    this.activeArea = area;

    if (area === 'alunos') {
      this.carregarAlunos();
    } else if (area === 'rotas') {
      this.carregarMinhasRotasHoje();
    } else if (area === 'home') {
      this.carregarDadosIniciais();
    }
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}