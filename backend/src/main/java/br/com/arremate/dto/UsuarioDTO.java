package br.com.arremate.dto;

import java.time.LocalDateTime;

// Resposta de GET /auth/sessao: dados de quem está logado
public record UsuarioDTO(Long id, String telefone, LocalDateTime criadoEm) {
}
