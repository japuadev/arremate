package br.com.arremate.dto;

// Entrada de POST /auth/confirmar: { "telefone": "81999887766", "codigo": "1234" }
public record ConfirmarCodigoDTO(String telefone, String codigo) {
}
