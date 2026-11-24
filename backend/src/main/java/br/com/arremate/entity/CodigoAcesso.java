package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "codigo_acesso")
public class CodigoAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String telefone;

    private String codigo;

    @Column(name = "expira_em")
    private LocalDateTime expiraEm;

    private boolean usado;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    protected CodigoAcesso() {
    }

    public CodigoAcesso(String telefone, String codigo, int minutosValidade) {
        this.telefone = telefone;
        this.codigo = codigo;
        this.criadoEm = LocalDateTime.now();
        this.expiraEm = criadoEm.plusMinutes(minutosValidade);
        this.usado = false;
    }

    public boolean estaExpirado() {
        return LocalDateTime.now().isAfter(expiraEm);
    }

    public void marcarComoUsado() {
        this.usado = true;
    }

    public Long getId() {
        return id;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getCodigo() {
        return codigo;
    }

    public LocalDateTime getExpiraEm() {
        return expiraEm;
    }

    public boolean isUsado() {
        return usado;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
