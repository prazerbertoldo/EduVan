package br.cefetmg.eduvan.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Usuario {
    private Integer id;
    private String nome;
    private String email;
    private String senha;
    private String telefone;
    private String tipo;
    private String status;
    private String motivoStatus;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataAprovacao;
    private LocalDateTime dataRejeicao;
    private LocalDateTime dataSuspensao;
}