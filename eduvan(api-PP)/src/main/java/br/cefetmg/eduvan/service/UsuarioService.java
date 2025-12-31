package br.cefetmg.eduvan.service;

import br.cefetmg.eduvan.model.Admin;
import br.cefetmg.eduvan.model.Aluno;
import br.cefetmg.eduvan.model.Motorista;
import br.cefetmg.eduvan.model.Usuario;
import br.cefetmg.eduvan.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Aluno createAluno(Aluno aluno) {
        try {
            // Primeiro insere na tabela usuario
            int id = usuarioRepository.insert(aluno);
            aluno.setId(id);
            
            // Depois insere na tabela aluno
            usuarioRepository.insertAluno(id);
            
            return aluno;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criar aluno: " + e.getMessage());
        }
    }

    @Transactional
    public Motorista createMotorista(Motorista motorista) {
        try {
            // Primeiro insere na tabela usuario
            int id = usuarioRepository.insert(motorista);
            motorista.setId(id);
            
            // Depois insere na tabela motorista
            usuarioRepository.insertMotorista(id, motorista.getCnh());
            
            return motorista;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criar motorista: " + e.getMessage());
        }
    }

    @Transactional
    public Admin createAdmin(Admin admin) {
        try {
            // Primeiro cria como motorista
            Motorista motorista = createMotorista(admin);
            admin.setId(motorista.getId());
            
            // Depois insere na tabela admin
            usuarioRepository.insertAdmin(admin.getId());
            
            return admin;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criar admin: " + e.getMessage());
        }
    }

    // Método auxiliar para verificar se email já existe
    public boolean emailExists(String email) {
        return usuarioRepository.findByEmail(email) != null;
    }

    // ========== NOVOS MÉTODOS PARA VALIDAÇÃO DE ACESSO ==========
    
    public void aprovarUsuario(int id) {
        usuarioRepository.aprovarUsuario(id);
    }

    public void rejeitarUsuario(int id, String motivo) {
        usuarioRepository.rejeitarUsuario(id, motivo);
    }

    public void suspenderUsuario(int id, String motivo) {
        usuarioRepository.suspenderUsuario(id, motivo);
    }

    public void ativarUsuario(int id) {
        usuarioRepository.ativarUsuario(id);
    }

    public List<Usuario> getUsuariosPendentes() {
        return usuarioRepository.findByStatus("pending");
    }

    public List<Usuario> getUsuariosAprovados() {
        return usuarioRepository.findByStatus("approved");
    }

    public List<Usuario> getUsuariosRejeitados() {
        return usuarioRepository.findByStatus("rejected");
    }

    public List<Usuario> getUsuariosSuspensos() {
        return usuarioRepository.findByStatus("suspended");
    }

    // Método para buscar usuário por ID
    public Usuario getUsuarioById(int id) {
        return usuarioRepository.findById(id);
    }
}