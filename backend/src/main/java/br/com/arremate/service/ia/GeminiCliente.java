package br.com.arremate.service.ia;

import br.com.arremate.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;

// Chama o Gemini (Gemini Developer API) pela REST, sem biblioteca extra.
// A chave vem de arremate.ia.chave (variável de ambiente GEMINI_API_KEY) e vai só no
// cabeçalho x-goog-api-key, daqui para o Google. Nunca aparece no navegador nem no registro.
// As instruções vão em "systemInstruction"; o texto da pessoa, separado, em "contents".
@Component
public class GeminiCliente {

    private static final Logger log = LoggerFactory.getLogger(GeminiCliente.class);

    // Pouca criatividade: respostas estáveis e fiéis às instruções.
    private static final double TEMPERATURA = 0.3;

    private final String chave;
    private final String modelo;
    private final String url;
    private final Duration tempoLimite;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper json = JsonMapper.builder().build();

    public GeminiCliente(@Value("${arremate.ia.chave:}") String chave,
                         @Value("${arremate.ia.modelo}") String modelo,
                         @Value("${arremate.ia.url}") String url,
                         @Value("${arremate.ia.tempo-limite-segundos:15}") int tempoLimiteSegundos) {
        this.chave = chave == null ? "" : chave.trim();
        this.modelo = modelo;
        this.url = url;
        this.tempoLimite = Duration.ofSeconds(tempoLimiteSegundos);
    }

    public boolean configurado() {
        return !chave.isEmpty();
    }

    /** Manda instrução e texto ao modelo e devolve o objeto JSON da resposta (ainda sem validar). */
    public JsonNode gerarJson(String instrucao, String texto) {
        if (!configurado()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ia_nao_configurada");
        }
        HttpRequest pedido = HttpRequest.newBuilder(URI.create(url + "/models/" + modelo + ":generateContent"))
                .timeout(tempoLimite)
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", chave)
                .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(corpo(instrucao, texto))))
                .build();

        HttpResponse<String> resposta;
        try {
            resposta = http.send(pedido, HttpResponse.BodyHandlers.ofString());
        } catch (HttpTimeoutException e) {
            throw new ApiException(HttpStatus.GATEWAY_TIMEOUT, "ia_tempo_esgotado");
        } catch (IOException e) {
            log.warn("Gemini fora do ar: {}", e.getMessage());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ia_indisponivel");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ia_indisponivel");
        }

        if (resposta.statusCode() == 429) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "ia_limite");
        }
        if (resposta.statusCode() / 100 != 2) {
            // Só o status vai para o registro: o corpo pode repetir o texto da pessoa.
            log.warn("Gemini respondeu com status {}", resposta.statusCode());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ia_indisponivel");
        }
        return lerResposta(resposta.body());
    }

    private ObjectNode corpo(String instrucao, String texto) {
        ObjectNode corpo = json.createObjectNode();
        corpo.putObject("systemInstruction").putArray("parts").addObject().put("text", instrucao);
        ObjectNode conteudo = corpo.putArray("contents").addObject();
        conteudo.put("role", "user");
        conteudo.putArray("parts").addObject().put("text", texto);
        ObjectNode config = corpo.putObject("generationConfig");
        config.put("temperature", TEMPERATURA);
        config.put("responseMimeType", "application/json");
        return corpo;
    }

    // O Gemini devolve o JSON pedido como texto, dentro de candidates[0].content.parts[0].text.
    JsonNode lerResposta(String corpo) {
        try {
            String texto = json.readTree(corpo)
                    .path("candidates").path(0).path("content").path("parts").path(0).path("text")
                    .asString("");
            JsonNode dado = json.readTree(texto);
            if (dado == null || !dado.isObject()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "ia_formato");
            }
            return dado;
        } catch (JacksonException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ia_formato");
        }
    }
}
