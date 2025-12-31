package br.cefetmg.eduvan.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class Agendamento {
    private int id;
    private int idAluno;
    private int idHorario;
    private int idEndereco;
    private LocalDate dataAgendada;
    
    // Campos para joins
    private String nomeAluno;
    private String emailAluno;
    private String nomeEndereco;
    private String descricaoEndereco;
    private LocalTime horario;
    
    // Campos para coordenadas ← ADICIONE ESTES
    private Double latitude;
    private Double longitude;
}