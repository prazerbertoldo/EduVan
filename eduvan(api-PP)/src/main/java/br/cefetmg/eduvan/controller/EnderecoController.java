package br.cefetmg.eduvan.controller;

import br.cefetmg.eduvan.model.Endereco;
import br.cefetmg.eduvan.repository.EnderecoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataAccessException;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
public class EnderecoController {
    private final EnderecoRepository enderecoRepository;

    public EnderecoController(EnderecoRepository enderecoRepository) {
        this.enderecoRepository = enderecoRepository;
    }

    // Endpoints de teste
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("✅ Endpoint /test acessado com sucesso!");
        return ResponseEntity.ok("CORS está funcionando! EnderecoController OK.");
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        System.out.println("✅ Endpoint /health acessado com sucesso!");
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("message", "EnderecoController está funcionando");
        response.put("service", "enderecos");
        return ResponseEntity.ok(response);
    }

    // Método principal para criar endereço
    @PostMapping
    public ResponseEntity<?> createEndereco(@RequestBody Endereco endereco) {
        try {
            System.out.println("🎯 === RECEBENDO REQUISIÇÃO POST /api/enderecos ===");
            System.out.println("📦 Dados recebidos: " + endereco);
            System.out.println("👤 ID Aluno: " + endereco.getIdAluno());
            System.out.println("📛 Nome: " + endereco.getNome());
            System.out.println("📍 Latitude: " + endereco.getLatitude());
            System.out.println("📍 Longitude: " + endereco.getLongitude());
            System.out.println("📝 Descrição: " + endereco.getDescricao());

            // Validações
            if (endereco.getNome() == null || endereco.getNome().trim().isEmpty()) {
                System.out.println("❌ Erro: Nome vazio");
                return ResponseEntity.badRequest().body("Nome do endereço é obrigatório");
            }
            if (endereco.getLatitude() == null || endereco.getLongitude() == null) {
                System.out.println("❌ Erro: Coordenadas vazias");
                return ResponseEntity.badRequest().body("Coordenadas são obrigatórias");
            }
            if (endereco.getIdAluno() == null) {
                System.out.println("❌ Erro: ID Aluno vazio");
                return ResponseEntity.badRequest().body("ID do aluno é obrigatório");
            }

            System.out.println("💾 Tentando inserir no banco de dados...");
            int id = enderecoRepository.insert(endereco);
            System.out.println("✅ SUCESSO: Endereço inserido com ID: " + id);

            endereco.setId(id);
            return ResponseEntity.ok(endereco);

        } catch (Exception e) {
            System.err.println("💥 ERRO CRÍTICO NO ENDERECO CONTROLLER:");
            System.err.println("🔴 Tipo: " + e.getClass().getName());
            System.err.println("🔴 Mensagem: " + e.getMessage());
            System.err.println("🔴 StackTrace:");
            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body("Erro interno: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEndereco(@PathVariable int id) {
        try {
            Endereco endereco = enderecoRepository.findById(id);
            if (endereco == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(endereco);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao buscar endereço: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllEnderecos() {
        try {
            List<Endereco> enderecos = enderecoRepository.findAll();
            return ResponseEntity.ok(enderecos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao buscar endereços: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEndereco(@PathVariable int id, @RequestBody Endereco endereco) {
        try {
            // Verificar se o endereço existe
            Endereco existing = enderecoRepository.findById(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            endereco.setId(id);
            enderecoRepository.update(endereco);
            return ResponseEntity.ok(endereco);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao atualizar endereço: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEndereco(@PathVariable int id) {
        try {
            // Verificar se o endereço existe
            Endereco existing = enderecoRepository.findById(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            enderecoRepository.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao deletar endereço: " + e.getMessage());
        }
    }

    // Endpoint de teste POST
    @PostMapping("/test-post")
    public ResponseEntity<?> testPost(@RequestBody Map<String, Object> data) {
        System.out.println("✅ POST /test-post recebido: " + data);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "POST está funcionando");
        response.put("received", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/aluno/{idAluno}")
    public ResponseEntity<?> getEnderecosByAluno(@PathVariable int idAluno) {
        try {
            System.out.println("🔍 Buscando endereços para o aluno ID: " + idAluno);

            List<Endereco> enderecos = enderecoRepository.findByAlunoId(idAluno);
            System.out.println("✅ Endereços encontrados: " + enderecos.size());

            if (enderecos.isEmpty()) {
                System.out.println("⚠️ Nenhum endereço encontrado para aluno ID: " + idAluno);
            } else {
                enderecos.forEach(e -> System.out.println(" - " + e.getNome() + " (ID: " + e.getId() + ")"));
            }

            return ResponseEntity.ok(enderecos);
        } catch (Exception e) {
            System.err.println("❌ Erro ao buscar endereços do aluno " + idAluno + ": " + e.getMessage());
            return ResponseEntity.internalServerError().body("Erro ao buscar endereços do aluno: " + e.getMessage());
        }
    }
}