package br.com.arremate.exception;

import br.com.arremate.dto.ErroDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

// Captura os erros de todos os controllers e devolve sempre no formato { "erro": "..." }.
@RestControllerAdvice
public class TratadorDeErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorDeErros.class);

    // Erros de regra de negócio lançados pelos services
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErroDTO> tratarApi(ApiException e) {
        return responder(e.getStatus(), e.getCodigo());
    }

    // JSON mal escrito ou campo com tipo errado
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroDTO> tratarCorpoInvalido(HttpMessageNotReadableException e) {
        return responder(HttpStatus.BAD_REQUEST, "corpo_invalido");
    }

    // Rota que não existe
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroDTO> tratarRotaInexistente(NoResourceFoundException e) {
        return responder(HttpStatus.NOT_FOUND, "rota_nao_encontrada");
    }

    // Rota existe, mas com outro método (ex.: GET em rota que só aceita PUT)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroDTO> tratarMetodo(HttpRequestMethodNotSupportedException e) {
        return responder(HttpStatus.METHOD_NOT_ALLOWED, "metodo_nao_permitido");
    }

    // Qualquer outro erro inesperado
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroDTO> tratarGeral(Exception e) {
        log.error("Erro inesperado", e);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "erro_servidor");
    }

    private ResponseEntity<ErroDTO> responder(HttpStatus status, String codigo) {
        return ResponseEntity.status(status).body(new ErroDTO(codigo));
    }
}
