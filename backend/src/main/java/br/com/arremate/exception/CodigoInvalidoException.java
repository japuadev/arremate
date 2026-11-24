package br.com.arremate.exception;

import org.springframework.http.HttpStatus;

// Código errado, expirado, já usado ou nunca pedido. O front recebe sempre o mesmo erro.
public class CodigoInvalidoException extends ApiException {
    public CodigoInvalidoException() {
        super(HttpStatus.UNAUTHORIZED, "codigo_invalido");
    }
}
