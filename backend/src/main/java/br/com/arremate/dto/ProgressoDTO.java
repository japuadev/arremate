package br.com.arremate.dto;

import java.util.Map;

// Corpo de PUT /progresso e resposta de GET /progresso (mesmo formato do front):
// {
//   "aulas": { "o1": true, "f1": true },
//   "golpe": { "melhor": 7, "total": 8 },
//   "baixadas": { "organizar": true }
// }
public record ProgressoDTO(
        Map<String, Boolean> aulas,
        GolpeDTO golpe,
        Map<String, Boolean> baixadas
) {
}
