package br.com.arremate.controller;

import br.com.arremate.dto.OkDTO;
import br.com.arremate.dto.ProgressoDTO;
import br.com.arremate.entity.Usuario;
import br.com.arremate.interceptor.AutenticacaoInterceptor;
import br.com.arremate.service.ProgressoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Rotas protegidas: o interceptor já conferiu o token e entrega o usuário logado.
@RestController
@RequestMapping("/progresso")
public class ProgressoController {

    private final ProgressoService service;

    public ProgressoController(ProgressoService service) {
        this.service = service;
    }

    @PutMapping
    public OkDTO salvar(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario,
                        @RequestBody ProgressoDTO dto) {
        service.salvar(usuario.getId(), dto);
        return OkDTO.sucesso();
    }

    @GetMapping
    public ProgressoDTO buscar(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario) {
        return service.buscar(usuario.getId());
    }
}
