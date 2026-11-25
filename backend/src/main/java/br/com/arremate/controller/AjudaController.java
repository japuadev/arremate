package br.com.arremate.controller;

import br.com.arremate.dto.OutroJeitoDTO;
import br.com.arremate.dto.PerguntaAjudaDTO;
import br.com.arremate.dto.TextoDTO;
import br.com.arremate.entity.Usuario;
import br.com.arremate.interceptor.AutenticacaoInterceptor;
import br.com.arremate.service.AjudaService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

// Tela Ajuda do app. Rotas protegidas: só quem entrou no app usa a IA.
@RestController
@RequestMapping("/ajuda")
public class AjudaController {

    private final AjudaService service;

    public AjudaController(AjudaService service) {
        this.service = service;
    }

    // Devolve o JSON da IA como veio: { foraDoEscopo, urgente, passos, dica } ou { foraDoEscopo, mensagem }.
    @PostMapping("/perguntar")
    public JsonNode perguntar(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario,
                              @RequestBody PerguntaAjudaDTO dto) {
        return service.perguntar(usuario.getId(), dto.texto());
    }

    @PostMapping("/outro-jeito")
    public TextoDTO outroJeito(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario,
                               @RequestBody OutroJeitoDTO dto) {
        return service.outroJeito(usuario.getId(), dto.texto(), dto.passo());
    }
}
