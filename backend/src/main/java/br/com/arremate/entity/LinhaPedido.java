package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "linha_pedido")
public class LinhaPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    private int posicao;

    private String cliente;

    private String peca;

    private int quantidade;

    // "A fazer", "Pronto" ou "Entregue"
    private String situacao;

    private LocalDate data;

    protected LinhaPedido() {
    }

    public LinhaPedido(Long usuarioId, int posicao, String cliente, String peca, int quantidade,
                       String situacao, LocalDate data) {
        this.usuarioId = usuarioId;
        this.posicao = posicao;
        this.cliente = cliente;
        this.peca = peca;
        this.quantidade = quantidade;
        this.situacao = situacao;
        this.data = data;
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public int getPosicao() {
        return posicao;
    }

    public String getCliente() {
        return cliente;
    }

    public String getPeca() {
        return peca;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public String getSituacao() {
        return situacao;
    }

    public LocalDate getData() {
        return data;
    }
}
