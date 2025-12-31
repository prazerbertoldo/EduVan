package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Endereco;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface EnderecoRepository {
    
    @SqlUpdate("INSERT INTO endereco (nome, latitude, longitude, descricao, id_aluno) " +
               "VALUES (:nome, :latitude, :longitude, :descricao, :idAluno)")
    @GetGeneratedKeys("id")
    int insert(@BindBean Endereco endereco);

    @SqlQuery("SELECT * FROM endereco WHERE id = :id")
    @RegisterBeanMapper(Endereco.class)
    Endereco findById(@Bind("id") int id);

    @SqlQuery("SELECT * FROM endereco WHERE id_aluno = :idAluno ORDER BY nome")
    @RegisterBeanMapper(Endereco.class)
    List<Endereco> findByAlunoId(@Bind("idAluno") int idAluno);

    @SqlQuery("SELECT * FROM endereco ORDER BY nome")
    @RegisterBeanMapper(Endereco.class)
    List<Endereco> findAll();

    @SqlUpdate("UPDATE endereco SET nome = :nome, latitude = :latitude, longitude = :longitude, " +
               "descricao = :descricao, id_aluno = :idAluno WHERE id = :id")
    void update(@BindBean Endereco endereco);

    @SqlUpdate("DELETE FROM endereco WHERE id = :id")
    void delete(@Bind("id") int id);
}