package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Aviso;
import br.cefetmg.eduvan.repository.AvisoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/avisos")
public class AvisoController {
    private static final Logger logger = LoggerFactory.getLogger(AvisoController.class);
    
    private final AvisoRepository avisoRepository;

    public AvisoController(AvisoRepository avisoRepository) {
        this.avisoRepository = avisoRepository;
    }

    @PostMapping
    public ResponseEntity<?> createAviso(@RequestBody Aviso aviso) {
        try {
            logger.info("Recebendo requisição para criar aviso: {}", aviso);
            
            // Validar campos obrigatórios
            if (aviso.getTitulo() == null || aviso.getTitulo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Título é obrigatório");
            }
            if (aviso.getMensagem() == null || aviso.getMensagem().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mensagem é obrigatória");
            }
            if (aviso.getDataExpiracao() == null) {
                return ResponseEntity.badRequest().body("Data de expiração é obrigatória");
            }
            if (aviso.getIdUsuario() == null) {
                return ResponseEntity.badRequest().body("ID do usuário é obrigatório");
            }

            // Definir valores padrão
            if (aviso.getDataPublicacao() == null) {
                aviso.setDataPublicacao(LocalDateTime.now());
            }
            if (aviso.getDataPostagem() == null) {
                aviso.setDataPostagem(LocalDateTime.now());
            }
            if (aviso.getStatus() == null) {
                aviso.setStatus("ativo");
            }
            if (aviso.getCategoria() == null) {
                aviso.setCategoria("Geral");
            }
            if (aviso.getPrioridade() == null) {
                aviso.setPrioridade("media");
            }
            if (aviso.getAutor() == null) {
                aviso.setAutor("Sistema");
            }
            
            // Combinar título e mensagem no conteúdo para compatibilidade
            if (aviso.getConteudo() == null) {
                aviso.setConteudo(aviso.getTitulo() + ": " + aviso.getMensagem());
            }
            
            logger.info("Dados do aviso após processamento: {}", aviso);
            
            int id = avisoRepository.insert(aviso);
            aviso.setId(id);
            
            logger.info("Aviso criado com sucesso, ID: {}", id);
            return ResponseEntity.ok(aviso);
            
        } catch (DataAccessException e) {
            logger.error("Erro de acesso a dados ao criar aviso: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erro de acesso ao banco de dados: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Erro inesperado ao criar aviso: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erro interno do servidor: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllAvisos() {
        try {
            List<Aviso> avisos = avisoRepository.findAll();
            return ResponseEntity.ok(avisos);
        } catch (Exception e) {
            logger.error("Erro ao buscar avisos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erro ao buscar avisos");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAviso(@PathVariable int id) {
        try {
            Aviso aviso = avisoRepository.findById(id);
            if (aviso == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(aviso);
        } catch (Exception e) {
            logger.error("Erro ao buscar aviso {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erro ao buscar aviso");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAviso(@PathVariable int id, @RequestBody Aviso aviso) {
        try {
            aviso.setId(id);
            // Atualizar conteúdo combinado
            if (aviso.getTitulo() != null && aviso.getMensagem() != null) {
                aviso.setConteudo(aviso.getTitulo() + ": " + aviso.getMensagem());
            }
            avisoRepository.update(aviso);
            Aviso avisoAtualizado = avisoRepository.findById(id);
            return ResponseEntity.ok(avisoAtualizado);
        } catch (Exception e) {
            logger.error("Erro ao atualizar aviso {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erro ao atualizar aviso");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAviso(@PathVariable int id) {
        try {
            avisoRepository.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Erro ao deletar aviso {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erro ao deletar aviso");
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> getAvisosByUsuario(@PathVariable int idUsuario) {
        try {
            List<Aviso> avisos = avisoRepository.findByUsuarioId(idUsuario);
            return ResponseEntity.ok(avisos);
        } catch (Exception e) {
            logger.error("Erro ao buscar avisos do usuário {}: {}", idUsuario, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erro ao buscar avisos do usuário");
        }
    }
}