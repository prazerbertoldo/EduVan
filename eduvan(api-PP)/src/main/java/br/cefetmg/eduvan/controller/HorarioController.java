package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Horario;
import br.cefetmg.eduvan.repository.HorarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {
    private final HorarioRepository horarioRepository;

    public HorarioController(HorarioRepository horarioRepository) {
        this.horarioRepository = horarioRepository;
    }

    @GetMapping
    public List<Horario> getAllHorarios() {
        return horarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public Horario getHorario(@PathVariable int id) {
        return horarioRepository.findById(id);
    }

    @PostMapping
    public Horario createHorario(@RequestBody Horario horario) {
        int id = horarioRepository.insert(horario);
        horario.setId(id);
        return horario;
    }
}