import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout, tap } from 'rxjs/operators';

const API_URL = 'http://localhost:8080/api';
const TIMEOUT = 10000;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Métodos para rotas
  getRotasPorData(data: string): Observable<any> {
    return this.http.get(`${API_URL}/rotas/data/${data}`, { headers: this.getHeaders() });
  }
  deletarRota(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/rotas/${id}`, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS PARA USUÁRIOS ==========
  getUsuarios(): Observable<any> {
    return this.http.get(`${API_URL}/usuarios`, { headers: this.getHeaders() });
  }

  // Adicione este método para validação de acesso
  getTodosUsuarios(): Observable<any> {
    return this.http.get(`${API_URL}/usuarios`, { headers: this.getHeaders() });
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/usuarios/${id}`, { headers: this.getHeaders() });
  }

  getUsuarioByEmail(email: string): Observable<any> {
    return this.http.get(`${API_URL}/usuarios/email/${email}`, { headers: this.getHeaders() });
  }

  criarUsuario(usuario: any): Observable<any> {
    console.log('Enviando para API - criarUsuario:', usuario);
    return this.http.post(`${API_URL}/usuarios`, usuario, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta da API - criarUsuario:', response)),
      catchError(error => {
        console.error('Erro da API - criarUsuario:', error);
        return throwError(error);
      })
    );
  }

  deletarUsuario(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/usuarios/${id}`, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS PARA ENDEREÇOS ==========
  getEnderecos(): Observable<any> {
    return this.http.get(`${API_URL}/enderecos`, { headers: this.getHeaders() });
  }

  getEnderecoById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/enderecos/${id}`, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS PARA AVISOS ==========
 

  getAvisoById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/avisos/${id}`, { headers: this.getHeaders() });
  }

  getAvisosByUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/avisos/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS PARA AGENDAMENTOS ==========
  getAgendamentos(): Observable<any> {
    return this.http.get(`${API_URL}/agendamentos`, { headers: this.getHeaders() });
  }

  getAgendamentoById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/agendamentos/${id}`, { headers: this.getHeaders() });
  }

  getAgendamentosByAluno(idAluno: number): Observable<any> {
    return this.http.get(`${API_URL}/agendamentos/aluno/${idAluno}`, { headers: this.getHeaders() });
  }

  getAgendamentosHoje(): Observable<any> {
    return this.http.get(`${API_URL}/agendamentos/hoje`, { headers: this.getHeaders() });
  }

  criarAgendamento(agendamento: any): Observable<any> {
    return this.http.post(`${API_URL}/agendamentos`, agendamento, { headers: this.getHeaders() });
  }

  atualizarAgendamento(id: number, agendamento: any): Observable<any> {
    return this.http.put(`${API_URL}/agendamentos/${id}`, agendamento, { headers: this.getHeaders() });
  }

  deletarAgendamento(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/agendamentos/${id}`, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS PARA HORÁRIOS ==========
  getHorarios(): Observable<any> {
    return this.http.get(`${API_URL}/horarios`, { headers: this.getHeaders() });
  }

  getHorarioById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/horarios/${id}`, { headers: this.getHeaders() });
  }

  criarHorario(horario: any): Observable<any> {
    return this.http.post(`${API_URL}/horarios`, horario, { headers: this.getHeaders() });
  }

  atualizarHorario(id: number, horario: any): Observable<any> {
    return this.http.put(`${API_URL}/horarios/${id}`, horario, { headers: this.getHeaders() });
  }

  deletarHorario(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/horarios/${id}`, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS PARA TESTE ==========
  testarConexao(): Observable<any> {
    console.log('Testando conexão com API:', `${API_URL}/health`);

    return this.http.get(`${API_URL}/health`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      timeout(TIMEOUT),
      tap(response => console.log('Resposta da API:', response)),
      catchError(this.handleError)
    );
  }

  testarEndpoint(endpoint: string): Observable<any> {
    console.log('Testando endpoint:', `${API_URL}${endpoint}`);
    return this.http.get(`${API_URL}${endpoint}`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta da API:', response)),
      catchError(error => {
        console.error('Erro no endpoint:', error);
        return throwError(error);
      })
    );
  }

  getVanById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/vans/${id}`, { headers: this.getHeaders() });
  }

  criarVan(van: any): Observable<any> {
    console.log('Criando van:', van);
    return this.http.post(`${API_URL}/vans`, van, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('Van criada com sucesso:', response);
        this.salvarVanLocalmente(response);
      }),
      catchError(error => {
        console.error('Erro ao criar van:', error);
        return throwError(error);
      })
    );
  }

  atualizarVan(id: number, van: any): Observable<any> {
    console.log('Atualizando van ID:', id, 'Dados:', van);
    return this.http.put(`${API_URL}/vans/${id}`, van, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Van atualizada com sucesso:', response)),
      catchError(error => {
        console.error('Erro ao atualizar van:', error);
        return throwError(error);
      })
    );
  }

  deletarVan(id: number): Observable<any> {
    console.log('Deletando van ID:', id);
    return this.http.delete(`${API_URL}/vans/${id}`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Van deletada com sucesso:', response)),
      catchError(error => {
        console.error('Erro ao deletar van:', error);
        return throwError(error);
      })
    );
  }

  // ========== MÉTODOS PARA MOTORISTAS ==========

  getMotoristaById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/motoristas/${id}`, { headers: this.getHeaders() });
  }

  criarMotorista(motorista: any): Observable<any> {
    console.log('Criando motorista:', motorista);
    return this.http.post(`${API_URL}/motoristas`, motorista, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta criarMotorista:', response)),
      catchError(error => {
        console.error('Erro criarMotorista:', error);
        return throwError(error);
      })
    );
  }

  // ========== MÉTODOS PARA ALUNOS ==========
  getAlunos(): Observable<any> {
    return this.http.get(`${API_URL}/alunos`, { headers: this.getHeaders() });
  }

  getAlunoById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/alunos/${id}`, { headers: this.getHeaders() });
  }

  criarAluno(aluno: any): Observable<any> {
    console.log('Criando aluno:', aluno);
    return this.http.post(`${API_URL}/alunos`, aluno, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta criarAluno:', response)),
      catchError(error => {
        console.error('Erro criarAluno:', error);
        return throwError(error);
      })
    );
  }

  // ========== MÉTODOS DEBUG ==========
  testarEndpointAlunos(): Observable<any> {
    console.log('Testando endpoint /alunos');
    const testeData = { id: 999 };
    return this.http.post(`${API_URL}/alunos`, testeData, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta /alunos:', response)),
      catchError(error => {
        console.error('Erro /alunos:', error);
        return throwError(error);
      })
    );
  }

  testarEndpointMotoristas(): Observable<any> {
    console.log('Testando endpoint /motoristas');
    const testeData = { id: 998, cnh: 'CNH-12345678901' };
    return this.http.post(`${API_URL}/motoristas`, testeData, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta /motoristas:', response)),
      catchError(error => {
        console.error('Erro /motoristas:', error);
        return throwError(error);
      })
    );
  }

  // Métodos para gerenciamento local de vans
  private salvarVanLocalmente(van: any): void {
    const vans = this.carregarVansLocais();
    vans.push(van);
    localStorage.setItem('vans', JSON.stringify(vans));
  }

  private carregarVansLocais(): any[] {
    const vansSalvas = localStorage.getItem('vans');
    return vansSalvas ? JSON.parse(vansSalvas) : [];
  }

  // Métodos para rotas (atribuições)
  getRotas(): Observable<any> {
    return this.http.get(`${API_URL}/rotas`, { headers: this.getHeaders() });
  }

  getRotaById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/rotas/${id}`, { headers: this.getHeaders() });
  }

  getRotasPorMotorista(idMotorista: number): Observable<any> {
    return this.http.get(`${API_URL}/rotas/motorista/${idMotorista}`, { headers: this.getHeaders() });
  }

  getTipoUsuario(tipoValue: string): string {
    switch (tipoValue) {
      case '1': return 'aluno';
      case '2': return 'motorista';
      default: return 'aluno';
    }
  }

  // No api.service.ts, adicione este método:
  cadastrarUsuario(usuarioData: any): Observable<any> {
    console.log('Cadastrando usuário:', usuarioData);

    // Decide para qual endpoint enviar baseado no tipo
    if (usuarioData.tipo === 'aluno') {
      return this.criarAluno(usuarioData);
    } else if (usuarioData.tipo === 'motorista') {
      return this.criarMotorista(usuarioData);
    } else {
      return throwError(() => new Error('Tipo de usuário inválido'));
    }
  }

  atualizarUsuario(id: number, usuario: any): Observable<any> {
    console.log('Atualizando usuário ID:', id, 'Dados:', usuario);
    return this.http.put(`${API_URL}/usuarios/${id}`, usuario, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta da atualização:', response)),
      catchError(error => {
        console.error('Erro ao atualizar usuário:', error);
        return throwError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro completo:', error);
    console.error('URL:', error.url);
    console.error('Status:', error.status);
    console.error('Mensagem:', error.message);
    console.error('Erro completo:', JSON.stringify(error, null, 2));

    if (error.status === 0) {
      return throwError(() => new Error(
        `Erro de conexão com a API. Verifique:\n` +
        `1. A API está rodando na porta 8080?\n` +
        `2. CORS está habilitado na API?\n` +
        `3. URL: ${error.url}`
      ));
    } else {
      let errorMessage = `Erro ${error.status}: ${error.message}`;
      if (error.error && typeof error.error === 'object') {
        errorMessage += `\nDetalhes: ${JSON.stringify(error.error)}`;
      } else if (error.error) {
        errorMessage += `\nDetalhes: ${error.error}`;
      }
      errorMessage += `\nURL: ${error.url}`;

      return throwError(() => new Error(errorMessage));
    }
  }

  // ========== MÉTODOS PARA VALIDAÇÃO DE ACESSO ==========
  getUsuariosPendentes(): Observable<any> {
    return this.http.get(`${API_URL}/usuarios/status/pendente`, { headers: this.getHeaders() });
  }

  getUsuariosAprovados(): Observable<any> {
    return this.http.get(`${API_URL}/usuarios/status/aprovado`, { headers: this.getHeaders() });
  }

  getUsuariosRejeitados(): Observable<any> {
    return this.http.get(`${API_URL}/usuarios/status/rejeitado`, { headers: this.getHeaders() });
  }

  getUsuariosSuspensos(): Observable<any> {
    return this.http.get(`${API_URL}/usuarios/status/suspenso`, { headers: this.getHeaders() });
  }

  aprovarUsuario(id: number): Observable<any> {
    console.log('🔄 Aprovando usuário ID:', id);
    return this.http.put(`${API_URL}/usuarios/${id}/approve`, {}, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Usuário aprovado:', response)),
      catchError(error => {
        console.error('❌ Erro ao aprovar usuário:', error);
        // Fallback: atualização direta
        return this.http.put(`${API_URL}/usuarios/${id}`,
          { status: 'approved', dataAprovacao: new Date().toISOString() },
          { headers: this.getHeaders() }
        );
      })
    );
  }

  rejeitarUsuario(id: number, motivo: string): Observable<any> {
    console.log('🔄 Rejeitando usuário ID:', id);
    return this.http.put(`${API_URL}/usuarios/${id}/reject`, { motivo }, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Usuário rejeitado:', response)),
      catchError(error => {
        console.error('❌ Erro ao rejeitar usuário:', error);
        // Fallback: atualização direta
        return this.http.put(`${API_URL}/usuarios/${id}`,
          { status: 'rejected', motivoStatus: motivo, dataRejeicao: new Date().toISOString() },
          { headers: this.getHeaders() }
        );
      })
    );
  }

  suspenderUsuario(id: number, motivo: string): Observable<any> {
    console.log('🔄 Suspendo usuário ID:', id);
    return this.http.put(`${API_URL}/usuarios/${id}/suspend`, { motivo }, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Usuário suspenso:', response)),
      catchError(error => {
        console.error('❌ Erro ao suspender usuário:', error);
        // Fallback: atualização direta
        return this.http.put(`${API_URL}/usuarios/${id}`,
          { status: 'suspended', motivoStatus: motivo, dataSuspensao: new Date().toISOString() },
          { headers: this.getHeaders() }
        );
      })
    );
  }

  ativarUsuario(id: number): Observable<any> {
    console.log('🔄 Ativando usuário ID:', id);
    return this.http.put(`${API_URL}/usuarios/${id}/activate`, {}, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Usuário ativado:', response)),
      catchError(error => {
        console.error('❌ Erro ao ativar usuário:', error);
        // Fallback: atualização direta
        return this.http.put(`${API_URL}/usuarios/${id}`,
          { status: 'approved', dataAprovacao: new Date().toISOString() },
          { headers: this.getHeaders() }
        );
      })
    );
  }

  // Métodos para presenças/agendamentos
  getAgendamentosDisponiveis(data: string): Observable<any> {
    return this.http.get(`${API_URL}/presencas/agendamentos-disponiveis/${data}`, { headers: this.getHeaders() });
  }

  // Métodos para atribuição de vans
  getRotasComDetalhes(data: string): Observable<any> {
    return this.http.get(`${API_URL}/rotas/data/${data}/detalhes`, { headers: this.getHeaders() });
  }

  atualizarRota(id: number, rota: any): Observable<any> {
    return this.http.put(`${API_URL}/rotas/${id}`, rota, { headers: this.getHeaders() });
  }

  // Método para obter motoristas (se não existir)
  getMotoristas(): Observable<any> {
    return this.http.get(`${API_URL}/motoristas`, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS PARA ENDEREÇOS ==========
  // Substitua estes métodos que estão no final do arquivo:

  criarEndereco(endereco: any): Observable<any> {
    return this.http.post(`${API_URL}/enderecos`, endereco, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Endereço criado:', response)),
      catchError(error => {
        console.error('Erro ao criar endereço:', error);
        return throwError(error);
      })
    );
  }

  atualizarEndereco(endereco: any): Observable<any> {
    return this.http.put(`${API_URL}/enderecos/${endereco.id}`, endereco, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Endereço atualizado:', response)),
      catchError(error => {
        console.error('Erro ao atualizar endereço:', error);
        return throwError(error);
      })
    );
  }

  deletarEndereco(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/enderecos/${id}`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Endereço deletado:', response)),
      catchError(error => {
        console.error('Erro ao deletar endereço:', error);
        return throwError(error);
      })
    );
  }

  getEnderecosByAluno(idAluno: number): Observable<any> {
    return this.http.get(`${API_URL}/enderecos/aluno/${idAluno}`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Endereços do aluno:', response)),
      catchError(error => {
        console.error('Erro ao buscar endereços do aluno:', error);
        // Retorna array vazio em caso de erro para não quebrar a aplicação
        return of([]);
      })
    );
  }

  // Método para criar rota com agendamentos
  criarRotaComAgendamentos(dados: any): Observable<any> {
    return this.http.post(`${API_URL}/presencas/rota-com-agendamentos`, dados, {
      headers: this.getHeaders()
    });
  }

  // Método para deletar agendamentos de uma rota
  deletarAgendamentosDaRota(idRota: number): Observable<any> {
    return this.http.delete(`${API_URL}/rota-agendamentos/rota/${idRota}`, {
      headers: this.getHeaders()
    });
  }

  // No api.service.ts, adicione estes métodos:

  // Método para buscar rotas por horário e data
  getRotasPorHorarioEData(idHorario: number, data: string): Observable<any> {
    return this.http.get(`${API_URL}/rotas/horario/${idHorario}/data/${data}`, {
      headers: this.getHeaders()
    });
  }



  // Método para buscar horários disponíveis
  getHorariosDisponiveis(data: string): Observable<any> {
    return this.http.get(`${API_URL}/horarios/disponiveis/${data}`, {
      headers: this.getHeaders()
    });
  }


  // No api.service.ts, adicione estes métodos:

  // Verificar se van está disponível para horário
  isVanDisponivel(idVan: number, data: string, idHorario: number): Observable<boolean> {
    return this.http.get<boolean>(`${API_URL}/rotas/van/${idVan}/data/${data}/horario/${idHorario}/disponivel`, {
      headers: this.getHeaders()
    });
  }


  // Método atualizado para criar rota com horário
  criarRotaComHorario(rota: any): Observable<any> {
    return this.http.post(`${API_URL}/rotas`, rota, { headers: this.getHeaders() });
  }

  // No api.service.ts, use o método criarRota existente
  // (não precisa do criarRotaComHorario se já temos criarRota)

  // Método para criar rota
  criarRota(rota: any): Observable<any> {
    console.log('Enviando para API - criarRota:', rota);
    return this.http.post(`${API_URL}/rotas`, rota, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Resposta da API - criarRota:', response)),
      catchError(error => {
        console.error('Erro da API - criarRota:', error);
        return throwError(error);
      })
    );
  }

  // No api.service.ts, atualize este método:
  adicionarAgendamentoARota(idRota: number, idAgendamento: number, ordem: number): Observable<any> {
    const dados = {
      idRota: idRota,
      idAgendamento: idAgendamento,
      ordem: ordem
    };

    console.log('Enviando para rota-agendamentos:', dados);

    return this.http.post(`${API_URL}/rota-agendamentos`, dados, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Resposta adicionarAgendamentoARota:', response)),
      catchError(error => {
        console.error('Erro ao adicionar agendamento à rota:', error);
        return throwError(error);
      })
    );
  }

  // Métodos para Rotas
  getRotasPorVanEData(idVan: number, data: string): Observable<any> {
    return this.http.get(`${API_URL}/rotas/van/${idVan}/data/${data}`, {
      headers: this.getHeaders()
    });
  }

  // Métodos para Agendamentos da Rota
  getAgendamentosDaRota(idRota: number): Observable<any> {
    return this.http.get(`${API_URL}/rota-agendamentos/rota/${idRota}/agendamentos`, {
      headers: this.getHeaders()
    });
  }

  // Métodos para Horários
  getTodosHorarios(): Observable<any> {
    return this.http.get(`${API_URL}/horarios`, {
      headers: this.getHeaders()
    });
  }

  // Métodos para Verificação de Aluno
  isAlunoCadastradoEmRota(idAluno: number, data: string, idHorario: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${API_URL}/rotas/aluno/${idAluno}/data/${data}/horario/${idHorario}/cadastrado`,
      { headers: this.getHeaders() }
    );
  }

  // Método para verificar disponibilidade da van
  isVanOcupadaNoHorario(idVan: number, data: string, idHorario: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${API_URL}/rotas/van/${idVan}/data/${data}/horario/${idHorario}/ocupada`,
      { headers: this.getHeaders() }
    );
  }

  getVans(): Observable<any> {
    console.log('🔄 Buscando vans da API...');
    return this.http.get(`${API_URL}/vans`, { headers: this.getHeaders() }).pipe(
      timeout(TIMEOUT),
      tap(response => console.log('✅ Resposta getVans:', response)),
      catchError(error => {
        console.error('❌ Erro ao buscar vans:', error);
        console.warn('⚠️ Erro ao buscar vans, usando dados locais:', error);
        const vansLocais = this.carregarVansLocais();
        return of(vansLocais);
      })
    );
  }

  // No api.service.ts, verifique se este método existe:
  getAgendamentosPorHorarioEData(idHorario: number, data: string): Observable<any> {
    return this.http.get(`${API_URL}/agendamentos/horario/${idHorario}/data/${data}`, {
      headers: this.getHeaders()
    });
  }

// Mural de Avisos - MÉTODOS CORRIGIDOS
getAvisos(): Observable<any[]> {
  return this.http.get<any[]>(`${API_URL}/avisos`, { headers: this.getHeaders() });
}

criarAviso(avisoData: any): Observable<any> {
  return this.http.post<any>(`${API_URL}/avisos`, avisoData, { headers: this.getHeaders() });
}

atualizarAviso(id: number, avisoData: any): Observable<any> {
  return this.http.put<any>(`${API_URL}/avisos/${id}`, avisoData, { headers: this.getHeaders() });
}

deletarAviso(id: number): Observable<any> {
  return this.http.delete<any>(`${API_URL}/avisos/${id}`, { headers: this.getHeaders() });
}

}