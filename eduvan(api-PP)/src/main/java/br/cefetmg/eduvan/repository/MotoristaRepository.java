package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Motorista;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface MotoristaRepository {
    @SqlQuery("SELECT u.*, m.cnh FROM usuario u JOIN motorista m ON u.id = m.id WHERE u.tipo = 'motorista'")
    @RegisterBeanMapper(Motorista.class)
    List<Motorista> findAll();

    @SqlQuery("SELECT u.*, m.cnh FROM usuario u JOIN motorista m ON u.id = m.id WHERE u.id = :id AND u.tipo = 'motorista'")
    @RegisterBeanMapper(Motorista.class)
    Motorista findById(@Bind("id") int id);

    @SqlUpdate("DELETE FROM usuario WHERE id = :id AND tipo = 'motorista'")
    void delete(@Bind("id") int id);

    @SqlQuery("SELECT u.*, m.cnh FROM usuario u JOIN motorista m ON u.id = m.id WHERE u.tipo IN ('motorista', 'admin')")
    @RegisterBeanMapper(Motorista.class)
    List<Motorista> findAllMotoristasEAdmins();
}