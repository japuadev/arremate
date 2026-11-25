package br.com.arremate.dto;

import java.util.List;
import java.util.Map;

// Corpo de PUT /perfil e resposta de GET /perfil (mesmo formato do front):
// {
//   "nome": "Maria", "negocio": "Facção da Maria", "tipo": "faccao", "peca": "jeans",
//   "trilhas": ["organizar", "proteger", "dinheiro", "formalizar"],
//   "niveis": { "organizar": 1, "formalizar": 3, "dinheiro": 2, "proteger": 1 },
//   "diagnosticoFeito": true
// }
public record PerfilDTO(
        String nome,
        String negocio,
        String tipo,
        String peca,
        List<String> trilhas,
        Map<String, Integer> niveis,
        Boolean diagnosticoFeito
) {
}
