package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Horario;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface HorarioRepository {
    @SqlUpdate("INSERT INTO horario (horario) VALUES (:horario)")
    @GetGeneratedKeys
    int insert(@BindBean Horario horario);

    @SqlUpdate("UPDATE horario SET horario = :horario WHERE id = :id")
    void update(@BindBean Horario horario);

    @SqlUpdate("DELETE FROM horario WHERE id = :id")
    void delete(@Bind("id") int id);

     @SqlQuery("SELECT * FROM horario ORDER BY horario")
    @RegisterBeanMapper(Horario.class)
    List<Horario> findAll();
    
    @SqlQuery("SELECT * FROM horario WHERE id = :id")
    @RegisterBeanMapper(Horario.class)
    Horario findById(@Bind("id") int id);
}