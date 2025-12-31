package br.cefetmg.eduvan.service;

import br.cefetmg.eduvan.model.Agendamento;
import br.cefetmg.eduvan.model.Rota;
import br.cefetmg.eduvan.model.RotaAgendamento;
import br.cefetmg.eduvan.repository.AgendamentoRepository;
import br.cefetmg.eduvan.repository.RotaAgendamentoRepository;
import br.cefetmg.eduvan.repository.RotaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RotaService {
    private final RotaRepository rotaRepository;
    private final RotaAgendamentoRepository rotaAgendamentoRepository;
    private final AgendamentoRepository agendamentoRepository;

    // Método para remover um agendamento de uma rota
    public void removerAgendamentoDaRota(int idRota, int idAgendamento) {
        rotaAgendamentoRepository.delete(idRota, idAgendamento);
    }

    // Método para obter agendamentos de uma rota
    public List<RotaAgendamento> getAgendamentosDaRota(int idRota) {
        return rotaAgendamentoRepository.findByRotaId(idRota);
    }

    // Método para obter agendamentos disponíveis para uma data
    public List<Agendamento> getAgendamentosDisponiveis(String data) {
        List<Agendamento> todosAgendamentos = agendamentoRepository.findAll();

        return todosAgendamentos.stream()
                .filter(a -> a.getDataAgendada().toString().equals(data))
                .collect(Collectors.toList());
    }

    // Método para obter agendamentos por horário e data
    public List<Agendamento> getAgendamentosPorHorarioEData(int idHorario, String data) {
        // Você precisará implementar este método no AgendamentoRepository
        List<Agendamento> todosAgendamentos = agendamentoRepository.findAll();

        return todosAgendamentos.stream()
                .filter(a -> a.getIdHorario() == idHorario &&
                        a.getDataAgendada().toString().equals(data))
                .collect(Collectors.toList());
    }

    // Método para deletar todos os agendamentos de uma rota
    public void deletarAgendamentosDaRota(int idRota) {
        rotaAgendamentoRepository.deleteByRotaId(idRota);
    }

    public RotaService(RotaRepository rotaRepository,
            RotaAgendamentoRepository rotaAgendamentoRepository,
            AgendamentoRepository agendamentoRepository) {
        this.rotaRepository = rotaRepository;
        this.rotaAgendamentoRepository = rotaAgendamentoRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    // Método para criar rota com agendamentos
    public Rota criarRotaComAgendamentos(Rota rota, List<Integer> agendamentosIds) {
        // Primeiro cria a rota
        int rotaId = rotaRepository.insert(rota);
        rota.setId(rotaId);

        // Depois associa os agendamentos à rota
        for (int i = 0; i < agendamentosIds.size(); i++) {
            this.adicionarAgendamentoARota(rotaId, agendamentosIds.get(i), i + 1);
        }

        return rota;
    }

    // No RotaService.java, adicione este método de validação:
    public void validarAlunoDisponivelNoHorario(int idAluno, String data, int idHorario) {
        boolean alunoEmRota = rotaRepository.isAlunoEmRotaNoHorario(idAluno, data, idHorario);
        if (alunoEmRota) {
            throw new RuntimeException("Aluno já está cadastrado em uma rota para este horário e data");
        }
    }

    // Atualize o método adicionarAgendamentoARota para incluir a validação:
    public void adicionarAgendamentoARota(int idRota, int idAgendamento, int ordem) {
        try {
            System.out.println("Tentando adicionar agendamento à rota:");
            System.out.println("ID Rota: " + idRota);
            System.out.println("ID Agendamento: " + idAgendamento);
            System.out.println("Ordem: " + ordem);

            // Buscar informações do agendamento
            Agendamento agendamento = agendamentoRepository.findById(idAgendamento);
            if (agendamento == null) {
                throw new RuntimeException("Agendamento não encontrado: " + idAgendamento);
            }

            // Buscar informações da rota
            Rota rota = rotaRepository.findById(idRota);
            if (rota == null) {
                throw new RuntimeException("Rota não encontrada: " + idRota);
            }

            // Validar se aluno já está em outra rota no mesmo horário
            validarAlunoDisponivelNoHorario(
                    agendamento.getIdAluno(),
                    rota.getData().toString(),
                    rota.getIdHorario());

            RotaAgendamento rotaAgendamento = new RotaAgendamento();
            rotaAgendamento.setIdRota(idRota);
            rotaAgendamento.setIdAgendamento(idAgendamento);
            rotaAgendamento.setOrdem(ordem);

            rotaAgendamentoRepository.insert(rotaAgendamento);
            System.out.println("Agendamento adicionado à rota com sucesso!");

        } catch (Exception e) {
            System.err.println("Erro ao adicionar agendamento à rota: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}