package br.com.arremate.exception;

import org.springframework.http.HttpStatus;

// O usuário ainda não salvou nenhum perfil.
public class PerfilNaoEncontradoException extends ApiException {
    public PerfilNaoEncontradoException() {
        super(HttpStatus.NOT_FOUND, "perfil_nao_encontrado");
    }
}
