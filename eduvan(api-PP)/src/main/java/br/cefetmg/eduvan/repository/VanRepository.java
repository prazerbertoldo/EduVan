package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Van;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface VanRepository {
    @SqlUpdate("INSERT INTO van (placa, capacidade) VALUES (:placa, :capacidade)")
    @GetGeneratedKeys
    int insert(@BindBean Van van);

    @SqlQuery("SELECT * FROM van WHERE id = :id")
    @RegisterBeanMapper(Van.class)
    Van findById(@Bind("id") int id);

    @SqlQuery("SELECT * FROM van")
    @RegisterBeanMapper(Van.class)
    List<Van> findAll();

    @SqlUpdate("UPDATE van SET placa = :placa, capacidade = :capacidade WHERE id = :id")
    void update(@BindBean Van van);

    @SqlUpdate("DELETE FROM van WHERE id = :id")
    void delete(@Bind("id") int id);
}