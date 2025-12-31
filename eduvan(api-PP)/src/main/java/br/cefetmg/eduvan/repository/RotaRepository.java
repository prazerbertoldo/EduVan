package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Rota;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface RotaRepository {

    @SqlQuery("SELECT * FROM rota WHERE id = :id")
    @RegisterBeanMapper(Rota.class)
    Rota findById(@Bind("id") int id);

    @SqlQuery("SELECT * FROM rota WHERE id_motorista = :idMotorista")
    @RegisterBeanMapper(Rota.class)
    List<Rota> findByMotoristaId(@Bind("idMotorista") int idMotorista);

    @SqlQuery("SELECT * FROM rota WHERE data = :data")
    @RegisterBeanMapper(Rota.class)
    List<Rota> findByData(@Bind("data") String data);

    @SqlQuery("SELECT * FROM rota")
    @RegisterBeanMapper(Rota.class)
    List<Rota> findAll();

    @SqlUpdate("DELETE FROM rota WHERE id = :id")
    void delete(@Bind("id") int id);

    @SqlQuery("SELECT r.*, u.nome as nomeMotorista, v.placa as placaVan, h.horario as horario " +
            "FROM rota r " +
            "JOIN usuario u ON r.id_motorista = u.id " +
            "JOIN van v ON r.id_van = v.id " +
            "JOIN horario h ON r.id_horario = h.id " +
            "WHERE r.data = :data")
    @RegisterBeanMapper(Rota.class)
    List<Rota> findByDataComDetalhes(@Bind("data") String data);

    // NOVO: Buscar rotas por van, data e horário
    @SqlQuery("SELECT * FROM rota WHERE id_van = :idVan AND data = :data AND id_horario = :idHorario")
    @RegisterBeanMapper(Rota.class)
    List<Rota> findByVanDataHorario(@Bind("idVan") int idVan, @Bind("data") String data,
            @Bind("idHorario") int idHorario);

    // NOVO: Buscar todas as rotas de uma van em uma data
    @SqlQuery("SELECT r.*, h.horario as horario FROM rota r JOIN horario h ON r.id_horario = h.id WHERE r.id_van = :idVan AND r.data = :data")
    @RegisterBeanMapper(Rota.class)
    List<Rota> findByVanAndData(@Bind("idVan") int idVan, @Bind("data") String data);

    @SqlUpdate("INSERT INTO rota (id_motorista, id_van, data, id_horario) VALUES (:idMotorista, :idVan, :data, :idHorario)")
    @GetGeneratedKeys
    int insert(@BindBean Rota rota);

    @SqlUpdate("UPDATE rota SET id_motorista = :idMotorista, id_van = :idVan, data = :data, id_horario = :idHorario WHERE id = :id")
    void update(@BindBean Rota rota);

    // No RotaRepository.java, adicione este método:
    @SqlQuery("SELECT COUNT(*) FROM rota WHERE id_van = :idVan AND data = :data AND id_horario = :idHorario")
    int countByVanDataHorario(@Bind("idVan") int idVan, @Bind("data") String data, @Bind("idHorario") int idHorario);

    // No RotaRepository.java, adicione este método:
    @SqlQuery("SELECT COUNT(*) > 0 FROM rota_agendamento ra " +
            "JOIN rota r ON ra.id_rota = r.id " +
            "JOIN agendamento a ON ra.id_agendamento = a.id " +
            "WHERE a.id_aluno = :idAluno AND r.data = :data AND r.id_horario = :idHorario")
    boolean isAlunoEmRotaNoHorario(@Bind("idAluno") int idAluno,
            @Bind("data") String data,
            @Bind("idHorario") int idHorario);

    @SqlQuery("SELECT r.*, u.nome as nomeMotorista, v.placa as placaVan, h.horario as horario " +
            "FROM rota r " +
            "LEFT JOIN usuario u ON r.id_motorista = u.id " +
            "JOIN van v ON r.id_van = v.id " +
            "JOIN horario h ON r.id_horario = h.id " +
            "WHERE r.id_van = :idVan AND r.data = :data " +
            "ORDER BY h.horario")
    @RegisterBeanMapper(Rota.class)
    List<Rota> findByVanAndDataComDetalhes(@Bind("idVan") int idVan, @Bind("data") String data);


}