package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Aluno;
import br.cefetmg.eduvan.model.Usuario;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface AlunoRepository {
    @SqlQuery("SELECT u.* FROM usuario u WHERE u.tipo = 'aluno'")
    @RegisterBeanMapper(Aluno.class)
    List<Aluno> findAll();

    @SqlQuery("SELECT u.* FROM usuario u WHERE u.id = :id AND u.tipo = 'aluno'")
    @RegisterBeanMapper(Aluno.class)
    Aluno findById(@Bind("id") int id);

    @SqlUpdate("DELETE FROM usuario WHERE id = :id AND tipo = 'aluno'")
    void delete(@Bind("id") int id);

    // Adicione este método para criar usuários com herança
    @SqlUpdate("INSERT INTO usuario (nome, email, senha, telefone, tipo) " +
            "VALUES (:nome, :email, :senha, :telefone, :tipo)")
    @GetGeneratedKeys
    int insertUsuario(@BindBean Usuario usuario);

    // Método para criar aluno (já existe na tabela usuario, precisa inserir na
    // tabela aluno)
    @SqlUpdate("INSERT INTO aluno (id) VALUES (:id)")
    void insertAluno(@Bind("id") int id);

    // Método para criar motorista
    @SqlUpdate("INSERT INTO motorista (id, cnh) VALUES (:id, :cnh)")
    void insertMotorista(@Bind("id") int id, @Bind("cnh") String cnh);
}