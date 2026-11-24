package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Sessao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Um usuário pode ter várias sessões (um celular, um computador...)
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private String token;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    protected Sessao() {
    }

    public Sessao(Usuario usuario) {
        this.usuario = usuario;
        this.token = UUID.randomUUID().toString(); // texto aleatório e impossível de adivinhar
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getToken() {
        return token;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
