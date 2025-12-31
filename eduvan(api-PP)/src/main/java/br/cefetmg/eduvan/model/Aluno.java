package br.cefetmg.eduvan.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class Aluno extends Usuario {
    // Pode adicionar atributos específicos do aluno aqui
}