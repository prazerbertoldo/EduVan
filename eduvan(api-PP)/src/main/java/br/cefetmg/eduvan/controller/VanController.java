package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Van;
import br.cefetmg.eduvan.repository.VanRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vans")
public class VanController {
    private final VanRepository vanRepository;

    public VanController(VanRepository vanRepository) {
        this.vanRepository = vanRepository;
    }

    @PostMapping
    public Van createVan(@RequestBody Van van) {
        int id = vanRepository.insert(van);
        van.setId(id);
        return van;
    }

    @GetMapping("/{id}")
    public Van getVan(@PathVariable int id) {
        return vanRepository.findById(id);
    }

    @GetMapping
    public List<Van> getAllVans() {
        return vanRepository.findAll();
    }

    @PutMapping("/{id}")
    public void updateVan(@PathVariable int id, @RequestBody Van van) {
        van.setId(id);
        vanRepository.update(van);
    }

    @DeleteMapping("/{id}")
    public void deleteVan(@PathVariable int id) {
        vanRepository.delete(id);
    }
}