package br.cefetmg.eduvan.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Aviso {
    private Integer id;
    private String titulo; // ✅ ADICIONADO: campo que está no frontend
    private String mensagem; // ✅ ADICIONADO: campo que está no frontend
    private String conteudo; // ✅ MANTIDO: para compatibilidade
    private String categoria; // ✅ ADICIONADO: campo que está no frontend
    private String prioridade; // ✅ ADICIONADO: campo que está no frontend
    private LocalDateTime dataPublicacao; // ✅ ADICIONADO: campo que está no frontend
    private LocalDateTime dataExpiracao; // ✅ ADICIONADO: campo que está no frontend (obrigatório)
    private LocalDateTime dataPostagem; // ✅ MANTIDO: para compatibilidade
    private Integer idUsuario;
    private String autor; // ✅ ADICIONADO: campo que está no frontend
    private String status; // ✅ ADICIONADO: campo que está no frontend
}