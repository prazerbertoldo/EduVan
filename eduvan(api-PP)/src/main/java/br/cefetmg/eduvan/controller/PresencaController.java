package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Agendamento;
import br.cefetmg.eduvan.model.Rota;
import br.cefetmg.eduvan.model.RotaAgendamento;
import br.cefetmg.eduvan.service.RotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/presencas")
public class PresencaController {
    private final RotaService rotaService;

    public PresencaController(RotaService rotaService) {
        this.rotaService = rotaService;
    }

    // Endpoint para criar uma rota com agendamentos (presenças)
    @PostMapping("/rota-com-agendamentos")
    public ResponseEntity<?> criarRotaComAgendamentos(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> rotaData = (Map<String, Object>) request.get("rota");
            List<Integer> agendamentosIds = (List<Integer>) request.get("agendamentosIds");
            
            Rota rota = new Rota();
            rota.setIdMotorista((Integer) rotaData.get("idMotorista"));
            rota.setIdVan((Integer) rotaData.get("idVan"));
            rota.setData(java.time.LocalDate.parse((String) rotaData.get("data")));
            
            Rota rotaCriada = rotaService.criarRotaComAgendamentos(rota, agendamentosIds);
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Rota criada com sucesso com " + agendamentosIds.size() + " agendamentos",
                "rota", rotaCriada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erro ao criar rota: " + e.getMessage()));
        }
    }

    // Endpoint para obter agendamentos disponíveis para uma data
    @GetMapping("/agendamentos-disponiveis/{data}")
    public ResponseEntity<List<Agendamento>> getAgendamentosDisponiveis(@PathVariable String data) {
        try {
            List<Agendamento> agendamentos = rotaService.getAgendamentosDisponiveis(data);
            return ResponseEntity.ok(agendamentos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint para obter agendamentos de uma rota específica
    @GetMapping("/rota/{idRota}/agendamentos")
    public ResponseEntity<List<RotaAgendamento>> getAgendamentosDaRota(@PathVariable int idRota) {
        try {
            List<RotaAgendamento> agendamentos = rotaService.getAgendamentosDaRota(idRota);
            return ResponseEntity.ok(agendamentos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}