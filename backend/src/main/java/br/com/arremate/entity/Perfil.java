package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class Perfil {

    // Mesmo id do usuário (um perfil por usuário), por isso não é gerado automaticamente
    @Id
    @Column(name = "usuario_id")
    private Long usuarioId;

    private String nome;

    private String negocio;

    private String tipo;

    private String peca;

    @Column(name = "diagnostico_feito")
    private boolean diagnosticoFeito;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    protected Perfil() {
    }

    public Perfil(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void atualizar(String nome, String negocio, String tipo, String peca, boolean diagnosticoFeito) {
        this.nome = nome;
        this.negocio = negocio;
        this.tipo = tipo;
        this.peca = peca;
        this.diagnosticoFeito = diagnosticoFeito;
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getNome() {
        return nome;
    }

    public String getNegocio() {
        return negocio;
    }

    public String getTipo() {
        return tipo;
    }

    public String getPeca() {
        return peca;
    }

    public boolean isDiagnosticoFeito() {
        return diagnosticoFeito;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
