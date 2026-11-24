package br.com.arremate.exception;

import org.springframework.http.HttpStatus;

public class TelefoneInvalidoException extends ApiException {
    public TelefoneInvalidoException() {
        super(HttpStatus.BAD_REQUEST, "telefone_invalido");
    }
}
