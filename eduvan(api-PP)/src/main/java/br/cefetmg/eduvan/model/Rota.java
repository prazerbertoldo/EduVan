package br.cefetmg.eduvan.model;

import lombok.Data;
import java.time.LocalDate;
//import java.util.List;

// No arquivo Rota.java, adicione o campo idHorario
@Data
public class Rota {
    private Integer id;
    private Integer idMotorista;
    private Integer idVan;
    private LocalDate data;
    private Integer idHorario; // ← ADICIONE ESTE CAMPO

    // Campos para joins
    private String nomeMotorista;
    private String placaVan;
    private String horario; // Para exibição
}