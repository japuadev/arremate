package br.com.arremate.dto;

// Resposta de POST /auth/codigo: { "telefone": "81999887766", "enviado": true }
public record CodigoEnviadoDTO(String telefone, boolean enviado) {
}
