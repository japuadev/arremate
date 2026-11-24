package br.com.arremate.exception;

import org.springframework.http.HttpStatus;

// Exceção base da API. O TratadorDeErros transforma em { "erro": codigo } com o status informado.
// Os módulos criam exceções filhas, por exemplo: new ApiException(HttpStatus.UNAUTHORIZED, "codigo_invalido").
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String codigo;

    public ApiException(HttpStatus status, String codigo) {
        super(codigo);
        this.status = status;
        this.codigo = codigo;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCodigo() {
        return codigo;
    }
}
