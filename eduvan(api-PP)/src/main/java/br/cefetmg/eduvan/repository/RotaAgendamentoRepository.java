package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.RotaAgendamento;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface RotaAgendamentoRepository {
    @SqlUpdate("INSERT INTO rota_agendamento (id_rota, id_agendamento, ordem) VALUES (:idRota, :idAgendamento, :ordem)")
    void insert(@BindBean RotaAgendamento rotaAgendamento);

    @SqlQuery("SELECT * FROM rota_agendamento WHERE id_rota = :idRota ORDER BY ordem")
    @RegisterBeanMapper(RotaAgendamento.class)
    List<RotaAgendamento> findByRotaId(@Bind("idRota") int idRota);

    @SqlQuery("SELECT * FROM rota_agendamento WHERE id_agendamento = :idAgendamento")
    @RegisterBeanMapper(RotaAgendamento.class)
    List<RotaAgendamento> findByAgendamentoId(@Bind("idAgendamento") int idAgendamento);

    @SqlUpdate("DELETE FROM rota_agendamento WHERE id_rota = :idRota AND id_agendamento = :idAgendamento")
    void delete(@Bind("idRota") int idRota, @Bind("idAgendamento") int idAgendamento);

    @SqlUpdate("DELETE FROM rota_agendamento WHERE id_rota = :idRota")
    void deleteByRotaId(@Bind("idRota") int idRota);

    @SqlQuery("SELECT * FROM rota_agendamento")
    @RegisterBeanMapper(RotaAgendamento.class)
    List<RotaAgendamento> findAll();

    @SqlQuery("SELECT ra.*, a.id_aluno, a.id_horario, a.id_endereco, a.data_agendada, " +
            "u.nome as nomeAluno, u.email as emailAluno, " +
            "e.nome as nomeEndereco, e.descricao as descricaoEndereco " +
            "FROM rota_agendamento ra " +
            "JOIN agendamento a ON ra.id_agendamento = a.id " +
            "JOIN usuario u ON a.id_aluno = u.id " +
            "LEFT JOIN endereco e ON a.id_endereco = e.id " +
            "WHERE ra.id_rota = :idRota " +
            "ORDER BY ra.ordem")
    @RegisterBeanMapper(value = RotaAgendamento.class)
    List<RotaAgendamento> findAgendamentosComDetalhesByRotaId(@Bind("idRota") int idRota);
}