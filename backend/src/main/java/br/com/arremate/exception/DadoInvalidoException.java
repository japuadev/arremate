package br.com.arremate.exception;

import org.springframework.http.HttpStatus;

// Algum campo do corpo veio com valor que não é aceito. O código diz qual (ex.: "tipo_invalido").
public class DadoInvalidoException extends ApiException {
    public DadoInvalidoException(String codigo) {
        super(HttpStatus.BAD_REQUEST, codigo);
    }
}
