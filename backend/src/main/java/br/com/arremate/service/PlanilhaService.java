package br.com.arremate.service;

import br.com.arremate.dto.LinhaCaixaDTO;
import br.com.arremate.dto.LinhaEstoqueDTO;
import br.com.arremate.dto.LinhaPedidoDTO;
import br.com.arremate.entity.LinhaCaixa;
import br.com.arremate.entity.LinhaEstoque;
import br.com.arremate.entity.LinhaPedido;
import br.com.arremate.exception.DadoInvalidoException;
import br.com.arremate.mapper.PlanilhaMapper;
import br.com.arremate.repository.LinhaCaixaRepository;
import br.com.arremate.repository.LinhaEstoqueRepository;
import br.com.arremate.repository.LinhaPedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

// As três planilhas funcionam igual: o front manda a lista inteira e ela substitui a anterior.
// Primeiro valida todas as linhas e só depois grava, tudo numa transação.
@Service
public class PlanilhaService {

    public static final Set<String> TIPOS_CAIXA = Set.of("entrou", "saiu");
    public static final Set<String> SITUACOES = Set.of("A fazer", "Pronto", "Entregue");

    private static final int MAXIMO_LINHAS = 1000;
    private static final int TAMANHO_MAXIMO_TEXTO = 100;
    private static final int QUANTIDADE_MAXIMA = 1_000_000;
    private static final BigDecimal VALOR_MAXIMO = new BigDecimal("99999999.99"); // limite do DECIMAL(10,2)

    private final LinhaEstoqueRepository estoqueRepository;
    private final LinhaCaixaRepository caixaRepository;
    private final LinhaPedidoRepository pedidoRepository;

    public PlanilhaService(LinhaEstoqueRepository estoqueRepository,
                           LinhaCaixaRepository caixaRepository,
                           LinhaPedidoRepository pedidoRepository) {
        this.estoqueRepository = estoqueRepository;
        this.caixaRepository = caixaRepository;
        this.pedidoRepository = pedidoRepository;
    }

    // ---------- Estoque ----------

    public List<LinhaEstoqueDTO> buscarEstoque(Long usuarioId) {
        return estoqueRepository.findByUsuarioIdOrderByPosicao(usuarioId).stream()
                .map(PlanilhaMapper::paraDTO)
                .toList();
    }

    @Transactional
    public void salvarEstoque(Long usuarioId, List<LinhaEstoqueDTO> linhas) {
        validarLista(linhas);
        List<LinhaEstoque> novas = new ArrayList<>();
        for (int i = 0; i < linhas.size(); i++) {
            LinhaEstoqueDTO dto = linhas.get(i);
            if (dto == null) {
                throw new DadoInvalidoException("linha_invalida");
            }
            novas.add(new LinhaEstoque(
                    usuarioId, i,
                    validarTexto(dto.peca(), "peca_invalida"),
                    validarQuantidade(dto.quantidade(), 0), // no estoque pode zerar
                    validarData(dto.data())
            ));
        }
        estoqueRepository.apagarDoUsuario(usuarioId);
        estoqueRepository.saveAll(novas);
    }

    // ---------- Caixa ----------

    public List<LinhaCaixaDTO> buscarCaixa(Long usuarioId) {
        return caixaRepository.findByUsuarioIdOrderByPosicao(usuarioId).stream()
                .map(PlanilhaMapper::paraDTO)
                .toList();
    }

    @Transactional
    public void salvarCaixa(Long usuarioId, List<LinhaCaixaDTO> linhas) {
        validarLista(linhas);
        List<LinhaCaixa> novas = new ArrayList<>();
        for (int i = 0; i < linhas.size(); i++) {
            LinhaCaixaDTO dto = linhas.get(i);
            if (dto == null) {
                throw new DadoInvalidoException("linha_invalida");
            }
            novas.add(new LinhaCaixa(
                    usuarioId, i,
                    validarOpcao(dto.tipo(), TIPOS_CAIXA, "tipo_invalido"),
                    validarTexto(dto.descricao(), "descricao_invalida"),
                    validarValor(dto.valor()),
                    validarData(dto.data())
            ));
        }
        caixaRepository.apagarDoUsuario(usuarioId);
        caixaRepository.saveAll(novas);
    }

    // ---------- Pedidos ----------

    public List<LinhaPedidoDTO> buscarPedidos(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByPosicao(usuarioId).stream()
                .map(PlanilhaMapper::paraDTO)
                .toList();
    }

    @Transactional
    public void salvarPedidos(Long usuarioId, List<LinhaPedidoDTO> linhas) {
        validarLista(linhas);
        List<LinhaPedido> novas = new ArrayList<>();
        for (int i = 0; i < linhas.size(); i++) {
            LinhaPedidoDTO dto = linhas.get(i);
            if (dto == null) {
                throw new DadoInvalidoException("linha_invalida");
            }
            novas.add(new LinhaPedido(
                    usuarioId, i,
                    validarTexto(dto.cliente(), "cliente_invalido"),
                    validarTexto(dto.peca(), "peca_invalida"),
                    validarQuantidade(dto.quantidade(), 1), // pedido tem pelo menos 1 peça
                    validarOpcao(dto.situacao(), SITUACOES, "situacao_invalida"),
                    validarData(dto.data())
            ));
        }
        pedidoRepository.apagarDoUsuario(usuarioId);
        pedidoRepository.saveAll(novas);
    }

    // ---------- Validações usadas pelas três planilhas ----------

    // A lista pode vir vazia (o usuário apagou tudo), mas não pode faltar
    private void validarLista(List<?> linhas) {
        if (linhas == null) {
            throw new DadoInvalidoException("linhas_invalidas");
        }
        if (linhas.size() > MAXIMO_LINHAS) {
            throw new DadoInvalidoException("planilha_muito_grande");
        }
    }

    // Obrigatório, até 100 letras
    private String validarTexto(String texto, String codigoErro) {
        if (texto == null || texto.isBlank() || texto.trim().length() > TAMANHO_MAXIMO_TEXTO) {
            throw new DadoInvalidoException(codigoErro);
        }
        return texto.trim();
    }

    private int validarQuantidade(Integer quantidade, int minimo) {
        if (quantidade == null || quantidade < minimo || quantidade > QUANTIDADE_MAXIMA) {
            throw new DadoInvalidoException("quantidade_invalida");
        }
        return quantidade;
    }

    private String validarOpcao(String valor, Set<String> aceitos, String codigoErro) {
        if (valor == null || !aceitos.contains(valor)) {
            throw new DadoInvalidoException(codigoErro);
        }
        return valor;
    }

    // Maior que zero; arredonda para centavos (50.555 vira 50.56)
    private BigDecimal validarValor(BigDecimal valor) {
        if (valor == null || valor.signum() <= 0) {
            throw new DadoInvalidoException("valor_invalido");
        }
        BigDecimal emCentavos = valor.setScale(2, RoundingMode.HALF_UP);
        if (emCentavos.compareTo(VALOR_MAXIMO) > 0) {
            throw new DadoInvalidoException("valor_invalido");
        }
        return emCentavos;
    }

    // "24/11/2026" vira LocalDate
    private LocalDate validarData(String data) {
        if (data == null) {
            throw new DadoInvalidoException("data_invalida");
        }
        try {
            return LocalDate.parse(data.trim(), PlanilhaMapper.FORMATO_DATA);
        } catch (DateTimeParseException e) {
            throw new DadoInvalidoException("data_invalida");
        }
    }
}
