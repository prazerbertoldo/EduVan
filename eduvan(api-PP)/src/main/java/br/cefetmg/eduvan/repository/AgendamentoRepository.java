package br.cefetmg.eduvan.repository;

import br.cefetmg.eduvan.model.Agendamento;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

public interface AgendamentoRepository {
        @SqlUpdate("INSERT INTO agendamento (id_aluno, id_horario, id_endereco, data_agendada) " +
                        "VALUES (:idAluno, :idHorario, :idEndereco, :dataAgendada)")
        @GetGeneratedKeys
        int insert(@BindBean Agendamento agendamento);

        @SqlQuery("SELECT * FROM agendamento WHERE id = :id")
        @RegisterBeanMapper(Agendamento.class)
        Agendamento findById(@Bind("id") int id);

        @SqlQuery("SELECT * FROM agendamento WHERE id_aluno = :idAluno")
        @RegisterBeanMapper(Agendamento.class)
        List<Agendamento> findByAlunoId(@Bind("idAluno") int idAluno);

        @SqlQuery("SELECT * FROM agendamento WHERE data_agendada = CURRENT_DATE")
        @RegisterBeanMapper(Agendamento.class)
        List<Agendamento> findAgendamentosHoje();

        @SqlQuery("SELECT * FROM agendamento")
        @RegisterBeanMapper(Agendamento.class)
        List<Agendamento> findAll();

        @SqlUpdate("UPDATE agendamento SET id_aluno = :idAluno, id_horario = :idHorario, " +
                        "id_endereco = :idEndereco, data_agendada = :dataAgendada WHERE id = :id")
        void update(@BindBean Agendamento agendamento);

        @SqlUpdate("DELETE FROM agendamento WHERE id = :id")
        void delete(@Bind("id") int id);

        // Adicione estes métodos ao AgendamentoRepository existente

        @SqlQuery("SELECT a.*, u.nome as nomeAluno, e.nome as nomeEndereco, h.horario as horario " +
                        "FROM agendamento a " +
                        "JOIN usuario u ON a.id_aluno = u.id " +
                        "JOIN endereco e ON a.id_endereco = e.id " +
                        "JOIN horario h ON a.id_horario = h.id " +
                        "WHERE a.data_agendada = :data")
        @RegisterBeanMapper(Agendamento.class)
        List<Agendamento> findByData(@Bind("data") String data);

        @SqlQuery("SELECT a.*, u.nome as nomeAluno, u.email as emailAluno, " +
                        "e.nome as nomeEndereco, e.descricao as descricaoEndereco, h.horario as horario " +
                        "FROM agendamento a " +
                        "JOIN usuario u ON a.id_aluno = u.id " +
                        "JOIN endereco e ON a.id_endereco = e.id " +
                        "JOIN horario h ON a.id_horario = h.id " +
                        "WHERE a.id_horario = :idHorario AND a.data_agendada = :data")
        @RegisterBeanMapper(Agendamento.class)
        List<Agendamento> findByHorarioAndData(@Bind("idHorario") int idHorario, @Bind("data") String data);

        @SqlQuery("SELECT a.*, u.nome as nomeAluno, u.email as emailAluno, " +
                        "e.nome as nomeEndereco, e.descricao as descricaoEndereco, " +
                        "e.latitude as latitude, e.longitude as longitude, " + // ← ADICIONE ESTAS LINHAS
                        "h.horario as horario " +
                        "FROM agendamento a " +
                        "JOIN usuario u ON a.id_aluno = u.id " +
                        "LEFT JOIN endereco e ON a.id_endereco = e.id " +
                        "JOIN horario h ON a.id_horario = h.id " +
                        "WHERE a.id_horario = :idHorario AND a.data_agendada = :data " +
                        "ORDER BY u.nome")
        @RegisterBeanMapper(Agendamento.class)
        List<Agendamento> findByHorarioAndDataComDetalhes(@Bind("idHorario") int idHorario, @Bind("data") String data);

}