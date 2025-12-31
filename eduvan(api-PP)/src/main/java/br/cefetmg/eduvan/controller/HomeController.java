package br.cefetmg.eduvan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class HomeController {

    @GetMapping
    public ResponseEntity<String> welcome() {
        return ResponseEntity.ok("Bem-vindo ao sistema EduVan - Gestão de Transporte Escolar");
    }
}