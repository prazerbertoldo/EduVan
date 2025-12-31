package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Admin;
import br.cefetmg.eduvan.model.Aluno;
import br.cefetmg.eduvan.model.Motorista;
import br.cefetmg.eduvan.model.Usuario;
import br.cefetmg.eduvan.repository.UsuarioRepository;
import br.cefetmg.eduvan.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    // Agora injetamos ambos: repository e service
    public UsuarioController(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    // Endpoint genérico para usuários (apenas para consulta)
    @PostMapping
    public Usuario createUsuario(@RequestBody Usuario usuario) {
        int id = usuarioRepository.insert(usuario);
        usuario.setId(id);
        return usuario;
    }

    // Endpoints específicos para cada tipo de usuário
    @PostMapping("/alunos")
    public Aluno createAluno(@RequestBody Aluno aluno) {
        if (usuarioService.emailExists(aluno.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        return usuarioService.createAluno(aluno);
    }

    @PostMapping("/motoristas")
    public Motorista createMotorista(@RequestBody Motorista motorista) {
        if (usuarioService.emailExists(motorista.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        return usuarioService.createMotorista(motorista);
    }

    @PostMapping("/admins")
    public Admin createAdmin(@RequestBody Admin admin) {
        if (usuarioService.emailExists(admin.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        return usuarioService.createAdmin(admin);
    }

    // Os outros métodos permanecem iguais...
    @GetMapping("/{id}")
    public Usuario getUsuario(@PathVariable int id) {
        return usuarioRepository.findById(id);
    }

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    // No UsuarioController.java, adicione este método:
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUsuario(@PathVariable int id, @RequestBody Usuario usuario) {
        try {
            usuario.setId(id);
            usuarioRepository.update(usuario);
            return ResponseEntity.ok().body(Map.of("message", "Usuário atualizado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao atualizar usuário: " + e.getMessage()));
        }
    }

    // No UsuarioController.java, adicione estes endpoints:

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> aprovarUsuario(@PathVariable int id) {
        try {
            usuarioService.aprovarUsuario(id);
            return ResponseEntity.ok().body(Map.of("message", "Usuário aprovado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao aprovar usuário: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejeitarUsuario(@PathVariable int id, @RequestBody Map<String, String> request) {
        try {
            String motivo = request.get("motivo");
            usuarioService.rejeitarUsuario(id, motivo);
            return ResponseEntity.ok().body(Map.of("message", "Usuário rejeitado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao rejeitar usuário: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspenderUsuario(@PathVariable int id, @RequestBody Map<String, String> request) {
        try {
            String motivo = request.get("motivo");
            usuarioService.suspenderUsuario(id, motivo);
            return ResponseEntity.ok().body(Map.of("message", "Usuário suspenso com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao suspender usuário: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> ativarUsuario(@PathVariable int id) {
        try {
            usuarioService.ativarUsuario(id);
            return ResponseEntity.ok().body(Map.of("message", "Usuário ativado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao ativar usuário: " + e.getMessage()));
        }
    }

    // Endpoint para buscar usuários por status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Usuario>> getUsuariosPorStatus(@PathVariable String status) {
        try {
            List<Usuario> usuarios;
            switch (status.toLowerCase()) {
                case "pending":
                case "pendente":
                    usuarios = usuarioService.getUsuariosPendentes();
                    break;
                case "approved":
                case "aprovado":
                    usuarios = usuarioService.getUsuariosAprovados();
                    break;
                case "rejected":
                case "rejeitado":
                    usuarios = usuarioService.getUsuariosRejeitados();
                    break;
                case "suspended":
                case "suspenso":
                    usuarios = usuarioService.getUsuariosSuspensos();
                    break;
                default:
                    usuarios = usuarioService.getUsuariosPendentes();
            }
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}