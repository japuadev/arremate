package br.com.arremate.controller;

import br.com.arremate.dto.CodigoEnviadoDTO;
import br.com.arremate.dto.ConfirmarCodigoDTO;
import br.com.arremate.dto.PedirCodigoDTO;
import br.com.arremate.dto.SessaoDTO;
import br.com.arremate.dto.UsuarioDTO;
import br.com.arremate.entity.Sessao;
import br.com.arremate.entity.Usuario;
import br.com.arremate.interceptor.AutenticacaoInterceptor;
import br.com.arremate.mapper.UsuarioMapper;
import br.com.arremate.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    // Público: pede o código por SMS
    @PostMapping("/codigo")
    public CodigoEnviadoDTO pedirCodigo(@RequestBody PedirCodigoDTO dto) {
        String telefone = service.pedirCodigo(dto.telefone());
        return new CodigoEnviadoDTO(telefone, true);
    }

    // Público: confere o código e devolve o token
    @PostMapping("/confirmar")
    public SessaoDTO confirmar(@RequestBody ConfirmarCodigoDTO dto) {
        Sessao sessao = service.confirmarCodigo(dto.telefone(), dto.codigo());
        return UsuarioMapper.paraSessaoDTO(sessao);
    }

    // Protegido: mostra quem é o dono do token (serve para testar o login)
    @GetMapping("/sessao")
    public UsuarioDTO sessao(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario) {
        return UsuarioMapper.paraDTO(usuario);
    }

    // Protegido: encerra a sessão atual
    @PostMapping("/sair")
    public ResponseEntity<Void> sair(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_TOKEN) String token) {
        service.sair(token);
        return ResponseEntity.noContent().build();
    }
}
