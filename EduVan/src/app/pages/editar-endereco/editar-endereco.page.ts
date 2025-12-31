import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Leaflet
declare const L: any;

@Component({
  selector: 'app-editar-endereco',
  templateUrl: './editar-endereco.page.html',
  styleUrls: ['./editar-endereco.page.scss'],
  standalone: false
})
export class EditarEnderecoPage implements OnInit, AfterViewInit, OnDestroy {
  enderecoForm: FormGroup;
  endereco: any;
  coordenadas: any = { lat: null, lng: null };
  resultadosBusca: any[] = [];
  enderecoSelecionado: string = '';
  user: any;

  // Mapa
  private map: any;
  private marker: any;
  private mapInicializado = false;

  // Busca
  private searchSubject = new Subject<string>();
  public buscando = false;
  public mostrarMapa = false;
  public carregandoMapa = false;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.enderecoForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      enderecoPesquisa: ['']
    });
  }

  async ngOnInit() {
    this.user = this.authService.getCurrentUserValue();

    if (this.endereco) {
      this.enderecoForm.patchValue({
        nome: this.endereco.nome,
        descricao: this.endereco.descricao
      });
      this.coordenadas = {
        lat: this.endereco.latitude,
        lng: this.endereco.longitude
      };
      this.enderecoSelecionado = `${this.endereco.latitude}, ${this.endereco.longitude}`;
    }

    // Configurar o debounce para a busca
    this.searchSubject.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      switchMap(searchText => this.buscarEnderecoAPI(searchText))
    ).subscribe({
      next: (resultados) => {
        this.resultadosBusca = resultados;
        this.buscando = false;
      },
      error: (error) => {
        console.error('Erro na busca:', error);
        this.buscando = false;
      }
    });
  }

  ngAfterViewInit() {
    console.log('View inicializada');
  }

  // Método para inicializar mapa
  private async inicializarMapa() {
    console.log('Inicializando mapa...');

    // Aguardar para garantir que o DOM está pronto
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const mapElement = document.getElementById('map');
      console.log('Elemento do mapa:', mapElement);

      if (!mapElement) {
        console.error('Elemento do mapa não encontrado!');
        return;
      }

      // Se o mapa já existe, apenas redimensionar e retornar
      if (this.map && this.mapInicializado) {
        console.log('Mapa já existe, redimensionando...');
        setTimeout(() => {
          this.redimensionarMapa();
        }, 100);
        return;
      }

      console.log('Criando novo mapa...');

      // Obter localização do usuário ou usar padrão
      let lat, lng;

      try {
        const userLocation = await this.obterLocalizacaoUsuario();
        if (userLocation) {
          lat = userLocation.lat;
          lng = userLocation.lng;
          console.log('Usando localização do usuário:', lat, lng);
        } else {
          throw new Error('Não foi possível obter localização');
        }
      } catch (error) {
        // Fallback para coordenadas padrão
        lat = this.coordenadas.lat || -15.77972;
        lng = this.coordenadas.lng || -47.92972;
        console.log('Usando localização padrão:', lat, lng);
      }

      // Criar mapa
      this.map = L.map('map').setView([lat, lng], 15);

      // Adicionar camada do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Adicionar marcador se tiver coordenadas
      if (this.coordenadas.lat && this.coordenadas.lng) {
        this.adicionarMarcador(this.coordenadas.lat, this.coordenadas.lng);
      }

      // Evento de clique
      this.map.on('click', (e: any) => {
        this.onMapClick(e);
      });

      this.mapInicializado = true;
      console.log('Mapa criado com sucesso!');

      // Redimensionar após um tempo para garantir que está visível
      setTimeout(() => {
        this.redimensionarMapa();
      }, 500);

    } catch (error) {
      console.error('Erro crítico ao criar mapa:', error);
      this.mostrarAlerta('Erro', 'Não foi possível carregar o mapa. Recarregue a página.');
    }
  }

  // CORREÇÃO: Método para redimensionar o mapa
  private redimensionarMapa() {
    if (this.map) {
      try {
        // Pequeno delay para garantir que o container está visível
        setTimeout(() => {
          this.map.invalidateSize();
          console.log('Mapa redimensionado com sucesso');
        }, 50);
      } catch (error) {
        console.error('Erro ao redimensionar mapa:', error);
      }
    }
  }

  // Obter localização do usuário
  private obterLocalizacaoUsuario(): Promise<{ lat: number, lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000
        }
      );
    });
  }

  // CORREÇÃO: Método para alternar para mapa
  async alternarParaMapa() {
    console.log('Alternando para mapa...');
    this.mostrarMapa = true;
    this.carregandoMapa = true;

    // Aguardar a transição do DOM
    await new Promise(resolve => setTimeout(resolve, 150));

    // Inicializar ou redimensionar mapa
    if (!this.mapInicializado) {
      console.log('Inicializando mapa pela primeira vez...');
      await this.inicializarMapa();
    } else {
      console.log('Mapa já inicializado, redimensionando...');
      // Aguardar um pouco mais para garantir que o container está visível
      await new Promise(resolve => setTimeout(resolve, 200));
      this.redimensionarMapa();
    }

    this.carregandoMapa = false;
  }

  // CORREÇÃO: Método para voltar para busca
  alternarParaBusca() {
    console.log('Alternando para busca');
    this.mostrarMapa = false;
    // Não precisamos fazer nada com o mapa quando mudamos para busca
  }

  // Segment change
  onSegmentChange(event: any) {
    const value = event.detail.value;
    console.log('Segment changed:', value);

    if (value === 'mapa') {
      this.alternarParaMapa();
    } else {
      this.alternarParaBusca();
    }
  }

  // Clique no mapa
  private async onMapClick(e: any) {
    console.log('Clique no mapa:', e.latlng);
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    this.adicionarMarcador(lat, lng);
    this.coordenadas = { lat, lng };

    await this.buscarEnderecoPorCoordenadas(lat, lng);
  }

  // Adicionar marcador
  private adicionarMarcador(lat: number, lng: number) {
    if (!this.map) {
      console.error('Mapa não disponível');
      return;
    }

    // Remover marcador anterior
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Adicionar novo marcador
    this.marker = L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup('Localização selecionada')
      .openPopup();

    // Centralizar
    this.map.setView([lat, lng], 16);
  }

  // Buscar endereço por coordenadas
  private async buscarEnderecoPorCoordenadas(lat: number, lng: number) {
    const loading = await this.loadingController.create({
      message: 'Obtendo endereço...'
    });
    await loading.present();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data && data.display_name) {
          this.enderecoSelecionado = data.display_name;
          this.enderecoForm.get('enderecoPesquisa')?.setValue(this.enderecoSelecionado);

          if (!this.enderecoForm.get('nome')?.value) {
            const nomeSugerido = this.gerarNomeSugerido(data);
            this.enderecoForm.get('nome')?.setValue(nomeSugerido);
          }
        }
      }
    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      this.mostrarAlerta('Aviso', `Localização selecionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      await loading.dismiss();
    }
  }

  // Resto dos métodos permanecem iguais...
  private async buscarEnderecoAPI(enderecoPesquisa: string): Promise<any[]> {
    if (!enderecoPesquisa || enderecoPesquisa.length < 3) {
      return [];
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoPesquisa)}&limit=5&countrycodes=br`
      );

      if (response.ok) {
        const resultados = await response.json();
        return resultados || [];
      }
      return [];
    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    }
  }

  onInputChange(event: any) {
    const searchText = event.target.value;

    if (!searchText || searchText.length < 3) {
      this.resultadosBusca = [];
      this.buscando = false;
      return;
    }

    this.buscando = true;
    this.searchSubject.next(searchText);
  }

  onInputClear() {
    this.resultadosBusca = [];
    this.buscando = false;
  }

  async buscarEnderecoManual() {
    const enderecoPesquisa = this.enderecoForm.get('enderecoPesquisa')?.value;
    if (!enderecoPesquisa || enderecoPesquisa.length < 3) {
      this.mostrarAlerta('Atenção', 'Digite pelo menos 3 caracteres para buscar.');
      return;
    }

    this.buscando = true;
    try {
      this.resultadosBusca = await this.buscarEnderecoAPI(enderecoPesquisa);
      if (this.resultadosBusca.length === 0) {
        this.mostrarAlerta('Aviso', 'Nenhum endereço encontrado.');
      }
    } catch (error) {
      console.error('Erro na busca manual:', error);
    } finally {
      this.buscando = false;
    }
  }

  async selecionarEndereco(resultado: any) {
    const lat = parseFloat(resultado.lat);
    const lng = parseFloat(resultado.lon);

    this.coordenadas = { lat, lng };
    this.enderecoSelecionado = resultado.display_name;
    this.enderecoForm.get('enderecoPesquisa')?.setValue(this.enderecoSelecionado);
    this.resultadosBusca = [];

    // Mostrar mapa com a localização selecionada
    this.mostrarMapa = true;
    setTimeout(async () => {
      if (!this.mapInicializado) {
        await this.inicializarMapa();
      }
      this.adicionarMarcador(lat, lng);
      this.redimensionarMapa();
    }, 100);

    if (!this.enderecoForm.get('nome')?.value) {
      this.enderecoForm.get('nome')?.setValue('Meu Endereço');
    }
  }

  formatarEndereco(resultado: any): string {
    return resultado.display_name;
  }

  gerarNomeSugerido(resultado: any): string {
    return 'Meu Endereço';
  }

  async usarLocalizacaoAtual() {
    if (!navigator.geolocation) {
      this.mostrarAlerta('Erro', 'Geolocalização não suportada.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Obtendo localização...'
    });
    await loading.present();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.coordenadas = { lat, lng };
        this.mostrarMapa = true;

        setTimeout(async () => {
          if (!this.mapInicializado) {
            await this.inicializarMapa();
          }
          this.adicionarMarcador(lat, lng);
          this.redimensionarMapa();
          await this.buscarEnderecoPorCoordenadas(lat, lng);
        }, 100);

        await loading.dismiss();
      },
      (error) => {
        loading.dismiss();
        this.mostrarAlerta('Erro', 'Não foi possível obter a localização.');
      }
    );
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  cancelar() {
    this.modalController.dismiss({ success: false });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.mapInicializado = false;
  }

  async salvarEndereco() {
    if (!this.enderecoForm.valid) {
      this.mostrarAlerta('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (!this.coordenadas.lat || !this.coordenadas.lng) {
      this.mostrarAlerta('Atenção', 'Selecione um endereço.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Salvando endereço...'
    });
    await loading.present();

    try {
      const enderecoData = {
        id: this.endereco?.id,
        nome: this.enderecoForm.value.nome,
        descricao: this.enderecoForm.value.descricao,
        latitude: this.coordenadas.lat,
        longitude: this.coordenadas.lng,
        idAluno: this.user.id
      };

      console.log('Dados do endereço a serem enviados:', enderecoData);

      let resultado;
      if (this.endereco?.id) {
        console.log('Atualizando endereço existente...');
        resultado = await this.apiService.atualizarEndereco(enderecoData).toPromise();
      } else {
        console.log('Criando novo endereço...');
        resultado = await this.apiService.criarEndereco(enderecoData).toPromise();
      }

      console.log('Resposta da API:', resultado);
      this.mostrarAlerta('Sucesso', 'Endereço salvo com sucesso!');
      this.modalController.dismiss({ success: true, endereco: resultado });
    } catch (error: any) { // Corrige o tipo do error
      console.error('Erro detalhado ao salvar endereço:');
      console.error('Tipo:', error?.name);
      console.error('Mensagem:', error?.message);
      console.error('Status:', error?.status);
      console.error('URL:', error?.url);
      console.error('Erro completo:', error);

      let mensagemErro = 'Não foi possível salvar o endereço.';

      if (error?.status === 500) {
        mensagemErro = 'Erro interno no servidor. Tente novamente.';
      } else if (error?.status === 400) {
        mensagemErro = 'Dados inválidos. Verifique as informações.';
      } else if (error?.status === 0) {
        mensagemErro = 'Erro de conexão. Verifique se o servidor está rodando.';
      }

      this.mostrarAlerta('Erro', mensagemErro);
    } finally {
      await loading.dismiss();
    }
  }

  
}