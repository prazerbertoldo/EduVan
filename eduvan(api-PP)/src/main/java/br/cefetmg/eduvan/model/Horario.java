package br.cefetmg.eduvan.model;

import lombok.Data;
import java.time.LocalTime;

@Data
public class Horario {
    private int id;
    private LocalTime horario;
}