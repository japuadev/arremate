package br.com.arremate.mapper;

import br.com.arremate.dto.LinhaCaixaDTO;
import br.com.arremate.dto.LinhaEstoqueDTO;
import br.com.arremate.dto.LinhaPedidoDTO;
import br.com.arremate.entity.LinhaCaixa;
import br.com.arremate.entity.LinhaEstoque;
import br.com.arremate.entity.LinhaPedido;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;

public class PlanilhaMapper {

    // Formato de data do front: dia/mês/ano. STRICT recusa datas que não existem, como 31/02/2026.
    public static final DateTimeFormatter FORMATO_DATA =
            DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(ResolverStyle.STRICT);

    public static LinhaEstoqueDTO paraDTO(LinhaEstoque linha) {
        return new LinhaEstoqueDTO(
                linha.getPeca(),
                linha.getQuantidade(),
                formatar(linha.getData())
        );
    }

    public static LinhaCaixaDTO paraDTO(LinhaCaixa linha) {
        return new LinhaCaixaDTO(
                linha.getTipo(),
                linha.getDescricao(),
                linha.getValor(),
                formatar(linha.getData())
        );
    }

    public static LinhaPedidoDTO paraDTO(LinhaPedido linha) {
        return new LinhaPedidoDTO(
                linha.getCliente(),
                linha.getPeca(),
                linha.getQuantidade(),
                linha.getSituacao(),
                formatar(linha.getData())
        );
    }

    private static String formatar(LocalDate data) {
        return data.format(FORMATO_DATA);
    }
}
