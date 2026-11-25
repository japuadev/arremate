package br.com.arremate.dto;

// { "cliente": "Dona Josefa", "peca": "camisa", "quantidade": 20, "situacao": "A fazer", "data": "24/11/2026" }
public record LinhaPedidoDTO(String cliente, String peca, Integer quantidade, String situacao, String data) {
}
