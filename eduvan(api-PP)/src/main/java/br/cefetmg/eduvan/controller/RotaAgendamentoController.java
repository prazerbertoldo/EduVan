package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.RotaAgendamento;
import br.cefetmg.eduvan.repository.RotaAgendamentoRepository;
import br.cefetmg.eduvan.service.RotaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rota-agendamentos")
public class RotaAgendamentoController {
    private final RotaService rotaService;
    private final RotaAgendamentoRepository rotaAgendamentoRepository;

    public RotaAgendamentoController(RotaService rotaService,
            RotaAgendamentoRepository rotaAgendamentoRepository) {
        this.rotaService = rotaService;
        this.rotaAgendamentoRepository = rotaAgendamentoRepository;
    }

    // CORREÇÃO: Aceitar JSON no corpo da requisição
    @PostMapping
    public void vincularAgendamento(@RequestBody Map<String, Object> requestBody) {
        Integer idRota = (Integer) requestBody.get("idRota");
        Integer idAgendamento = (Integer) requestBody.get("idAgendamento");
        Integer ordem = (Integer) requestBody.get("ordem");

        if (idRota != null && idAgendamento != null && ordem != null) {
            rotaService.adicionarAgendamentoARota(idRota, idAgendamento, ordem);
        }
    }

    // Método alternativo mais robusto
    @PostMapping("/vincular")
    public void vincularAgendamento(@RequestBody RotaAgendamentoRequest request) {
        rotaService.adicionarAgendamentoARota(request.getIdRota(), request.getIdAgendamento(), request.getOrdem());
    }

    @GetMapping("/rota/{idRota}")
    public List<RotaAgendamento> getAgendamentosPorRota(@PathVariable int idRota) {
        return rotaService.getAgendamentosDaRota(idRota);
    }

    @GetMapping
    public List<RotaAgendamento> getAllRotaAgendamentos() {
        return rotaAgendamentoRepository.findAll();
    }

    @DeleteMapping("/rota/{idRota}")
    public void deletarAgendamentosDaRota(@PathVariable int idRota) {
        rotaService.deletarAgendamentosDaRota(idRota);
    }

    @DeleteMapping
    public void desvincularAgendamento(@RequestParam int idRota, @RequestParam int idAgendamento) {
        rotaService.removerAgendamentoDaRota(idRota, idAgendamento);
    }

    // Classe auxiliar para receber os dados
    public static class RotaAgendamentoRequest {
        private int idRota;
        private int idAgendamento;
        private int ordem;

        // Getters e Setters
        public int getIdRota() {
            return idRota;
        }

        public void setIdRota(int idRota) {
            this.idRota = idRota;
        }

        public int getIdAgendamento() {
            return idAgendamento;
        }

        public void setIdAgendamento(int idAgendamento) {
            this.idAgendamento = idAgendamento;
        }

        public int getOrdem() {
            return ordem;
        }

        public void setOrdem(int ordem) {
            this.ordem = ordem;
        }
    }

    @GetMapping("/rota/{idRota}/agendamentos")
    public List<RotaAgendamento> getAgendamentosComDetalhesPorRota(@PathVariable int idRota) {
        return rotaAgendamentoRepository.findAgendamentosComDetalhesByRotaId(idRota);
    }
}