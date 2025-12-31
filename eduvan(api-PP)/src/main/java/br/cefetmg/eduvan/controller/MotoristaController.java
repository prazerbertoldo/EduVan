package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Motorista;
import br.cefetmg.eduvan.repository.MotoristaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motoristas")
public class MotoristaController {
    private final MotoristaRepository motoristaRepository;

    public MotoristaController(MotoristaRepository motoristaRepository) {
        this.motoristaRepository = motoristaRepository;
    }

    @GetMapping("/{id}")
    public Motorista getMotorista(@PathVariable int id) {
        return motoristaRepository.findById(id);
    }

    @GetMapping
    public List<Motorista> getAllMotoristas() {
        return motoristaRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public void deleteMotorista(@PathVariable int id) {
        motoristaRepository.delete(id);
    }
}