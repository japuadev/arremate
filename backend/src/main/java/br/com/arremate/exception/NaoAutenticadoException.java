package br.com.arremate.exception;

import org.springframework.http.HttpStatus;

// Pedido sem token, com token errado ou de uma sessão já encerrada.
public class NaoAutenticadoException extends ApiException {
    public NaoAutenticadoException() {
        super(HttpStatus.UNAUTHORIZED, "nao_autenticado");
    }
}
