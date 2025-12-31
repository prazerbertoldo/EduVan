package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Presenca;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface PresencaRepository {
    @SqlUpdate("INSERT INTO presenca (id_aluno, id_rota, presente) VALUES (:idAluno, :idRota, :presente)")
    @GetGeneratedKeys
    int insert(@BindBean Presenca presenca);

    @SqlQuery("SELECT * FROM presenca WHERE id = :id")
    @RegisterBeanMapper(Presenca.class)
    Presenca findById(@Bind("id") int id);

    @SqlQuery("SELECT * FROM presenca WHERE id_aluno = :idAluno")
    @RegisterBeanMapper(Presenca.class)
    List<Presenca> findByAlunoId(@Bind("idAluno") int idAluno);

    @SqlQuery("SELECT * FROM presenca WHERE id_rota = :idRota")
    @RegisterBeanMapper(Presenca.class)
    List<Presenca> findByRotaId(@Bind("idRota") int idRota);

    @SqlQuery("SELECT * FROM presenca")
    @RegisterBeanMapper(Presenca.class)
    List<Presenca> findAll();

    @SqlUpdate("UPDATE presenca SET presente = :presente WHERE id = :id")
    void updatePresenca(@Bind("id") int id, @Bind("presente") boolean presente);

    @SqlUpdate("DELETE FROM presenca WHERE id = :id")
    void delete(@Bind("id") int id);
}