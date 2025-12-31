package br.cefetmg.eduvan.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {
    private Integer id;
    private String nome;
    private Double latitude;
    private Double longitude;
    private String descricao;
    private Integer idAluno; // Isso deve mapear para id_aluno no banco
}