package br.cefetmg.eduvan.config;

import br.cefetmg.eduvan.repository.*;
import org.jdbi.v3.core.Jdbi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JRepositoryConfig {

    @Bean
    public UsuarioRepository usuarioRepository(Jdbi jdbi) {
        return jdbi.onDemand(UsuarioRepository.class);
    }

    @Bean
    public AlunoRepository alunoRepository(Jdbi jdbi) {
        return jdbi.onDemand(AlunoRepository.class);
    }

    @Bean
    public MotoristaRepository motoristaRepository(Jdbi jdbi) {
        return jdbi.onDemand(MotoristaRepository.class);
    }

    @Bean
    public AdminRepository adminRepository(Jdbi jdbi) {
        return jdbi.onDemand(AdminRepository.class);
    }

    @Bean
    public VanRepository vanRepository(Jdbi jdbi) {
        return jdbi.onDemand(VanRepository.class);
    }

    @Bean
    public EnderecoRepository enderecoRepository(Jdbi jdbi) {
        return jdbi.onDemand(EnderecoRepository.class);
    }

    @Bean
    public HorarioRepository horarioRepository(Jdbi jdbi) {
        return jdbi.onDemand(HorarioRepository.class);
    }

    @Bean
    public AgendamentoRepository agendamentoRepository(Jdbi jdbi) {
        return jdbi.onDemand(AgendamentoRepository.class);
    }

    @Bean
    public RotaRepository rotaRepository(Jdbi jdbi) {
        return jdbi.onDemand(RotaRepository.class);
    }

    @Bean
    public PresencaRepository presencaRepository(Jdbi jdbi) {
        return jdbi.onDemand(PresencaRepository.class);
    }

    @Bean
    public AvisoRepository avisoRepository(Jdbi jdbi) {
        return jdbi.onDemand(AvisoRepository.class);
    }

    @Bean
    public RotaAgendamentoRepository rotaAgendamentoRepository(Jdbi jdbi) {
        return jdbi.onDemand(RotaAgendamentoRepository.class);
    }
}