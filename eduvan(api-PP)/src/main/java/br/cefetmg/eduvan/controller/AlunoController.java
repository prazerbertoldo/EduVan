package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Aluno;
import br.cefetmg.eduvan.repository.AlunoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {
    private final AlunoRepository alunoRepository;

    public AlunoController(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    @GetMapping("/{id}")
    public Aluno getAluno(@PathVariable int id) {
        return alunoRepository.findById(id);
    }

    @GetMapping
    public List<Aluno> getAllAlunos() {
        return alunoRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public void deleteAluno(@PathVariable int id) {
        alunoRepository.delete(id);
    }
}