package br.cefetmg.eduvan.model;

import lombok.Data;

@Data
public class Presenca {
    private Integer id;
    private Integer idAluno;
    private Integer idRota;
    private Boolean presente;
    
}