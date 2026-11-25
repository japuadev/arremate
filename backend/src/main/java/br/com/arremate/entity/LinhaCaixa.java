package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "linha_caixa")
public class LinhaCaixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    private int posicao;

    // "entrou" ou "saiu"
    private String tipo;

    private String descricao;

    // BigDecimal para dinheiro: não perde centavos como o double
    private BigDecimal valor;

    private LocalDate data;

    // Opcional: "venda", "material", "contas"... (ver PlanilhaService)
    private String categoria;

    protected LinhaCaixa() {
    }

    public LinhaCaixa(Long usuarioId, int posicao, String tipo, String descricao, BigDecimal valor, LocalDate data, String categoria) {
        this.usuarioId = usuarioId;
        this.posicao = posicao;
        this.tipo = tipo;
        this.descricao = descricao;
        this.valor = valor;
        this.data = data;
        this.categoria = categoria;
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

    public String getTipo() {
        return tipo;
    }

    public String getDescricao() {
        return descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getData() {
        return data;
    }

    public String getCategoria() {
        return categoria;
    }
}
