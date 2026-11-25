package br.com.arremate.dto;

// Resposta padrão de gravação: { "ok": true }
public record OkDTO(boolean ok) {

    public static OkDTO sucesso() {
        return new OkDTO(true);
    }
}
