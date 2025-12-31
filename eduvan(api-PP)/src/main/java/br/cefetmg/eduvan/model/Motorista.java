package br.cefetmg.eduvan.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class Motorista extends Usuario {
    private String cnh;
}