package br.cefetmg.eduvan.model;

import lombok.Data;

@Data
public class Van {
    private Integer id;
    private String placa;
    private Integer capacidade;
}