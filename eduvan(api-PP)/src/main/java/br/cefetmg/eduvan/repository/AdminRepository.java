package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Admin;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface AdminRepository {
    @SqlQuery("SELECT u.*, m.cnh FROM usuario u JOIN motorista m ON u.id = m.id JOIN admin a ON u.id = a.id WHERE u.tipo = 'admin'")
    @RegisterBeanMapper(Admin.class)
    List<Admin> findAll();

    @SqlQuery("SELECT u.*, m.cnh FROM usuario u JOIN motorista m ON u.id = m.id JOIN admin a ON u.id = a.id WHERE u.id = :id")
    @RegisterBeanMapper(Admin.class)
    Admin findById(@Bind("id") int id);

    @SqlUpdate("DELETE FROM usuario WHERE id = :id AND tipo = 'admin'")
    void delete(@Bind("id") int id);

    @SqlUpdate("UPDATE FROM motorista WHERE id = :id set tipo = 'admin'")
    void tornarAdmin(@Bind("id") int id);
}