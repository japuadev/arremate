package br.com.arremate.dto;

// Entrada de POST /auth/codigo: { "telefone": "81999887766" }
public record PedirCodigoDTO(String telefone) {
}
