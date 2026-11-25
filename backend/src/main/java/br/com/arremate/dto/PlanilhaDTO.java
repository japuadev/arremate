package br.com.arremate.dto;

import java.util.List;

// Corpo de PUT /planilhas/{id} e resposta de GET /planilhas/{id}: { "linhas": [ ... ] }
// O tipo T muda conforme a planilha (LinhaEstoqueDTO, LinhaCaixaDTO ou LinhaPedidoDTO).
public record PlanilhaDTO<T>(List<T> linhas) {
}
