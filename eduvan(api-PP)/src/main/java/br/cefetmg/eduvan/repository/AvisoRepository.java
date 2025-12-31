package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Aviso;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.dao.DataAccessException;

import java.util.List;

public interface AvisoRepository {
    
    @SqlUpdate("INSERT INTO aviso (titulo, mensagem, categoria, prioridade, data_publicacao, data_expiracao, autor, status, conteudo, data_postagem, id_usuario) " +
               "VALUES (:titulo, :mensagem, :categoria, :prioridade, :dataPublicacao, :dataExpiracao, :autor, :status, :conteudo, :dataPostagem, :idUsuario)")
    @GetGeneratedKeys
    int insert(@BindBean Aviso aviso) throws DataAccessException;

    @SqlQuery("SELECT * FROM aviso WHERE id = :id")
    @RegisterBeanMapper(Aviso.class)
    Aviso findById(@Bind("id") int id) throws DataAccessException;

    @SqlQuery("SELECT * FROM aviso ORDER BY data_publicacao DESC")
    @RegisterBeanMapper(Aviso.class)
    List<Aviso> findAll() throws DataAccessException;

    @SqlQuery("SELECT * FROM aviso WHERE id_usuario = :idUsuario ORDER BY data_publicacao DESC")
    @RegisterBeanMapper(Aviso.class)
    List<Aviso> findByUsuarioId(@Bind("idUsuario") int idUsuario) throws DataAccessException;

    @SqlUpdate("UPDATE aviso SET " +
               "titulo = :titulo, " +
               "mensagem = :mensagem, " +
               "categoria = :categoria, " +
               "prioridade = :prioridade, " +
               "data_expiracao = :dataExpiracao, " +
               "conteudo = :conteudo " +
               "WHERE id = :id")
    void update(@BindBean Aviso aviso) throws DataAccessException;

    @SqlUpdate("DELETE FROM aviso WHERE id = :id")
    void delete(@Bind("id") int id) throws DataAccessException;
}