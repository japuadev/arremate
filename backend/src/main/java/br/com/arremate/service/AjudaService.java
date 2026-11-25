package br.com.arremate.service;

import br.com.arremate.dto.TextoDTO;
import br.com.arremate.exception.ApiException;
import br.com.arremate.exception.DadoInvalidoException;
import br.com.arremate.service.ia.GeminiCliente;
import br.com.arremate.service.ia.InstrucoesAjuda;
import br.com.arremate.service.ia.LimiteDePedidos;
import br.com.arremate.service.ia.MascaraDadosSensiveis;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

// Tela Ajuda: a pessoa conta o problema e a IA responde em passos curtos.
// Este serviço confere o texto, esconde dados sensíveis, respeita o limite por pessoa e
// chama o Gemini. Quem confere o formato da resposta antes de mostrar é o front.
@Service
public class AjudaService {

    static final int MAX_TEXTO = 1000;
    static final int MAX_PASSO = 300;

    private final GeminiCliente gemini;
    private final LimiteDePedidos limite;

    public AjudaService(GeminiCliente gemini, LimiteDePedidos limite) {
        this.gemini = gemini;
        this.limite = limite;
    }

    public JsonNode perguntar(Long usuarioId, String texto) {
        exigirChave();
        String relato = conferir(texto, MAX_TEXTO, "texto_invalido");
        limite.registrar(usuarioId);
        return gemini.gerarJson(InstrucoesAjuda.PERGUNTAR, InstrucoesAjuda.relato(MascaraDadosSensiveis.mascarar(relato)));
    }

    public TextoDTO outroJeito(Long usuarioId, String texto, String passo) {
        exigirChave();
        String relato = conferir(texto, MAX_TEXTO, "texto_invalido");
        String oPasso = conferir(passo, MAX_PASSO, "passo_invalido");
        limite.registrar(usuarioId);
        JsonNode dado = gemini.gerarJson(InstrucoesAjuda.OUTRO_JEITO,
                InstrucoesAjuda.relatoComPasso(MascaraDadosSensiveis.mascarar(relato), MascaraDadosSensiveis.mascarar(oPasso)));
        String explicacao = dado.path("texto").asString("").trim();
        if (explicacao.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ia_formato");
        }
        return new TextoDTO(explicacao);
    }

    // Sem chave, o front fica sabendo logo e passa a usar a versão simulada.
    private void exigirChave() {
        if (!gemini.configurado()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ia_nao_configurada");
        }
    }

    private static String conferir(String texto, int maximo, String erro) {
        if (texto == null || texto.isBlank() || texto.length() > maximo) {
            throw new DadoInvalidoException(erro);
        }
        return texto.trim();
    }
}
