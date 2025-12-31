package br.cefetmg.eduvan.service;

import br.cefetmg.eduvan.model.Presenca;
import br.cefetmg.eduvan.repository.PresencaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PresencaService {
    private final PresencaRepository presencaRepository;

    public PresencaService(PresencaRepository presencaRepository) {
        this.presencaRepository = presencaRepository;
    }

    public void registrarPresenca(int idAluno, int idRota, boolean presente) {
        // Verifica se já existe registro de presença
        List<Presenca> presencas = presencaRepository.findByRotaId(idRota);
        
        Presenca presencaExistente = presencas.stream()
                .filter(p -> p.getIdAluno().equals(idAluno))
                .findFirst()
                .orElse(null);
        
        if (presencaExistente != null) {
            // Atualiza presença existente
            presencaRepository.updatePresenca(presencaExistente.getId(), presente);
        } else {
            // Cria nova presença
            Presenca novaPresenca = new Presenca();
            novaPresenca.setIdAluno(idAluno);
            novaPresenca.setIdRota(idRota);
            novaPresenca.setPresente(presente);
            presencaRepository.insert(novaPresenca);
        }
    }
    
    public List<Presenca> getPresencasPorRota(int idRota) {
        return presencaRepository.findByRotaId(idRota);
    }
    
    public List<Presenca> getPresencasPorAluno(int idAluno) {
        return presencaRepository.findByAlunoId(idAluno);
    }
}
