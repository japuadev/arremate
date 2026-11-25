package br.com.arremate.controller;

import br.com.arremate.dto.LinhaCaixaDTO;
import br.com.arremate.dto.LinhaEstoqueDTO;
import br.com.arremate.dto.LinhaPedidoDTO;
import br.com.arremate.dto.OkDTO;
import br.com.arremate.dto.PlanilhaDTO;
import br.com.arremate.entity.Usuario;
import br.com.arremate.interceptor.AutenticacaoInterceptor;
import br.com.arremate.service.PlanilhaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// O contrato usa PUT /planilhas/:id, com id = estoque, caixa ou pedidos.
// Cada planilha tem campos diferentes, então cada uma tem a sua rota (mesmos endereços do contrato).
// Um id diferente desses três cai em 404 rota_nao_encontrada.
@RestController
@RequestMapping("/planilhas")
public class PlanilhaController {

    private final PlanilhaService service;

    public PlanilhaController(PlanilhaService service) {
        this.service = service;
    }

    @PutMapping("/estoque")
    public OkDTO salvarEstoque(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario,
                               @RequestBody PlanilhaDTO<LinhaEstoqueDTO> dto) {
        service.salvarEstoque(usuario.getId(), dto.linhas());
        return OkDTO.sucesso();
    }

    @GetMapping("/estoque")
    public PlanilhaDTO<LinhaEstoqueDTO> buscarEstoque(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario) {
        return new PlanilhaDTO<>(service.buscarEstoque(usuario.getId()));
    }

    @PutMapping("/caixa")
    public OkDTO salvarCaixa(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario,
                             @RequestBody PlanilhaDTO<LinhaCaixaDTO> dto) {
        service.salvarCaixa(usuario.getId(), dto.linhas());
        return OkDTO.sucesso();
    }

    @GetMapping("/caixa")
    public PlanilhaDTO<LinhaCaixaDTO> buscarCaixa(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario) {
        return new PlanilhaDTO<>(service.buscarCaixa(usuario.getId()));
    }

    @PutMapping("/pedidos")
    public OkDTO salvarPedidos(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario,
                               @RequestBody PlanilhaDTO<LinhaPedidoDTO> dto) {
        service.salvarPedidos(usuario.getId(), dto.linhas());
        return OkDTO.sucesso();
    }

    @GetMapping("/pedidos")
    public PlanilhaDTO<LinhaPedidoDTO> buscarPedidos(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Usuario usuario) {
        return new PlanilhaDTO<>(service.buscarPedidos(usuario.getId()));
    }
}
