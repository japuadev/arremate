package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "linha_estoque")
public class LinhaEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    private int posicao;

    private String peca;

    private int quantidade;

    private LocalDate data;

    protected LinhaEstoque() {
    }

    public LinhaEstoque(Long usuarioId, int posicao, String peca, int quantidade, LocalDate data) {
        this.usuarioId = usuarioId;
        this.posicao = posicao;
        this.peca = peca;
        this.quantidade = quantidade;
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

    public String getPeca() {
        return peca;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public LocalDate getData() {
        return data;
    }
}
