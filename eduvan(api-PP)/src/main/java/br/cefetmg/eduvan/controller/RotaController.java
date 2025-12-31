package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Rota;
import br.cefetmg.eduvan.repository.RotaRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rotas")
public class RotaController {
    private final RotaRepository rotaRepository;

    public RotaController(RotaRepository rotaRepository) {
        this.rotaRepository = rotaRepository;
    }

    @GetMapping("/{id}")
    public Rota getRota(@PathVariable int id) {
        return rotaRepository.findById(id);
    }

    @GetMapping("/motorista/{idMotorista}")
    public List<Rota> getRotasByMotorista(@PathVariable int idMotorista) {
        return rotaRepository.findByMotoristaId(idMotorista);
    }

    @GetMapping("/data/{data}")
    public List<Rota> getRotasByData(@PathVariable String data) {
        return rotaRepository.findByData(data);
    }

    @GetMapping
    public List<Rota> getAllRotas() {
        return rotaRepository.findAll();
    }

    @PutMapping("/{id}")
    public void updateRota(@PathVariable int id, @RequestBody Rota rota) {
        rota.setId(id);
        rotaRepository.update(rota);
    }

    @DeleteMapping("/{id}")
    public void deleteRota(@PathVariable int id) {
        rotaRepository.delete(id);
    }

    @GetMapping("/data/{data}/detalhes")
    public List<Rota> getRotasByDataComDetalhes(@PathVariable String data) {
        return rotaRepository.findByDataComDetalhes(data);
    }

    // NOVO: Verificar se van está disponível para horário
    @GetMapping("/van/{idVan}/data/{data}/horario/{idHorario}/disponivel")
    public boolean isVanDisponivel(@PathVariable int idVan, @PathVariable String data, @PathVariable int idHorario) {
        List<Rota> rotas = rotaRepository.findByVanDataHorario(idVan, data, idHorario);
        return rotas.isEmpty();
    }

    // No RotaController.java, adicione este método:
    @GetMapping("/van/{idVan}/data/{data}/horario/{idHorario}/ocupada")
    public boolean isVanOcupadaNoHorario(@PathVariable int idVan, @PathVariable String data,
            @PathVariable int idHorario) {
        int count = rotaRepository.countByVanDataHorario(idVan, data, idHorario);
        return count > 0;
    }

    // No RotaController.java, atualize o método createRota:
    @PostMapping
    public ResponseEntity<?> createRota(@RequestBody Rota rota) {
        // Verificar se já existe rota para esta van no mesmo horário e data
        int count = rotaRepository.countByVanDataHorario(
                rota.getIdVan(),
                rota.getData().toString(),
                rota.getIdHorario());

        if (count > 0) {
            return ResponseEntity.badRequest()
                    .body("Já existe uma rota para esta van no horário selecionado");
        }

        // Se não existe, cria a rota
        int id = rotaRepository.insert(rota);
        rota.setId(id);
        return ResponseEntity.ok(rota);
    }

    // No RotaController.java, adicione este método:
    @GetMapping("/aluno/{idAluno}/data/{data}/horario/{idHorario}/cadastrado")
    public boolean isAlunoCadastradoEmRota(@PathVariable int idAluno,
            @PathVariable String data,
            @PathVariable int idHorario) {
        return rotaRepository.isAlunoEmRotaNoHorario(idAluno, data, idHorario);
    }

    @GetMapping("/van/{idVan}/data/{data}")
    public List<Rota> getRotasByVanAndData(@PathVariable int idVan, @PathVariable String data) {
        return rotaRepository.findByVanAndDataComDetalhes(idVan, data);
    }

    
}