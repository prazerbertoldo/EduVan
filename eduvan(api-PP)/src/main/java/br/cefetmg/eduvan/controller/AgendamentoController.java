package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Agendamento;
import br.cefetmg.eduvan.repository.AgendamentoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {
    private final AgendamentoRepository agendamentoRepository;

    public AgendamentoController(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    @GetMapping("/data/{data}")
    public List<Agendamento> getAgendamentosPorData(@PathVariable String data) {
        return agendamentoRepository.findByData(data);
    }

    // Outros métodos existentes...
    @PostMapping
    public Agendamento createAgendamento(@RequestBody Agendamento agendamento) {
        int id = agendamentoRepository.insert(agendamento);
        agendamento.setId(id);
        return agendamento;
    }

    @GetMapping("/{id}")
    public Agendamento getAgendamento(@PathVariable int id) {
        return agendamentoRepository.findById(id);
    }

    @GetMapping("/aluno/{idAluno}")
    public List<Agendamento> getAgendamentosByAluno(@PathVariable int idAluno) {
        return agendamentoRepository.findByAlunoId(idAluno);
    }

    @GetMapping("/hoje")
    public List<Agendamento> getAgendamentosHoje() {
        return agendamentoRepository.findAgendamentosHoje();
    }

    @GetMapping
    public List<Agendamento> getAllAgendamentos() {
        return agendamentoRepository.findAll();
    }

    @PutMapping("/{id}")
    public void updateAgendamento(@PathVariable int id, @RequestBody Agendamento agendamento) {
        agendamento.setId(id);
        agendamentoRepository.update(agendamento);
    }

    @DeleteMapping("/{id}")
    public void deleteAgendamento(@PathVariable int id) {
        agendamentoRepository.delete(id);
    }

    @GetMapping("/horario/{idHorario}/data/{data}")
    public List<Agendamento> getAgendamentosPorHorarioEData(@PathVariable int idHorario,
            @PathVariable String data) {
        // Use o método que INCLUI as coordenadas
        return agendamentoRepository.findByHorarioAndDataComDetalhes(idHorario, data);
    }

}