package br.com.arremate.dto;

// Resposta de POST /auth/confirmar: { "telefone": "81999887766", "token": "..." }
public record SessaoDTO(String telefone, String token) {
}
