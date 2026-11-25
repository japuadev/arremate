package br.com.arremate.dto;

import java.math.BigDecimal;

// { "tipo": "entrou", "descricao": "3 calças", "valor": 50, "data": "24/11/2026", "categoria": "venda" }
// "categoria" é opcional: pode faltar ou vir null.
public record LinhaCaixaDTO(String tipo, String descricao, BigDecimal valor, String data, String categoria) {
}
