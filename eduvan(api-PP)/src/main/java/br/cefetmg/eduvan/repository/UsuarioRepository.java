package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Usuario;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface UsuarioRepository {
    @SqlUpdate("INSERT INTO usuario (nome, email, senha, telefone, tipo, status) " +
               "VALUES (:nome, :email, :senha, :telefone, :tipo, 'pending')")
    @GetGeneratedKeys
    int insert(@BindBean Usuario usuario);

    @SqlQuery("SELECT * FROM usuario WHERE id = :id")
    @RegisterBeanMapper(Usuario.class)
    Usuario findById(@Bind("id") int id);

    @SqlQuery("SELECT * FROM usuario")
    @RegisterBeanMapper(Usuario.class)
    List<Usuario> findAll();

    @SqlQuery("SELECT * FROM usuario WHERE email = :email")
    @RegisterBeanMapper(Usuario.class)
    Usuario findByEmail(@Bind("email") String email);

    @SqlUpdate("UPDATE usuario SET nome = :nome, email = :email, senha = :senha, " +
               "telefone = :telefone, tipo = :tipo WHERE id = :id")
    void update(@BindBean Usuario usuario);

    @SqlUpdate("DELETE FROM usuario WHERE id = :id")
    void delete(@Bind("id") int id);

    // Métodos para herança
    @SqlUpdate("INSERT INTO aluno (id) VALUES (:id)")
    void insertAluno(@Bind("id") int id);

    @SqlUpdate("INSERT INTO motorista (id, cnh) VALUES (:id, :cnh)")
    void insertMotorista(@Bind("id") int id, @Bind("cnh") String cnh);

    @SqlUpdate("INSERT INTO admin (id) VALUES (:id)")
    void insertAdmin(@Bind("id") int id);

    // ========== NOVOS MÉTODOS PARA VALIDAÇÃO DE ACESSO ==========
    
    @SqlUpdate("UPDATE usuario SET status = 'approved', data_aprovacao = CURRENT_TIMESTAMP, motivo_status = NULL WHERE id = :id")
    void aprovarUsuario(@Bind("id") int id);

    @SqlUpdate("UPDATE usuario SET status = 'rejected', data_rejeicao = CURRENT_TIMESTAMP, motivo_status = :motivo WHERE id = :id")
    void rejeitarUsuario(@Bind("id") int id, @Bind("motivo") String motivo);

    @SqlUpdate("UPDATE usuario SET status = 'suspended', data_suspensao = CURRENT_TIMESTAMP, motivo_status = :motivo WHERE id = :id")
    void suspenderUsuario(@Bind("id") int id, @Bind("motivo") String motivo);

    @SqlUpdate("UPDATE usuario SET status = 'approved', data_aprovacao = CURRENT_TIMESTAMP, motivo_status = NULL WHERE id = :id")
    void ativarUsuario(@Bind("id") int id);

    @SqlQuery("SELECT * FROM usuario WHERE status = :status")
    @RegisterBeanMapper(Usuario.class)
    List<Usuario> findByStatus(@Bind("status") String status);
}