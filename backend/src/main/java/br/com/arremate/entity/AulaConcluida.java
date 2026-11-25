package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "aula_concluida")
public class AulaConcluida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "aula_id")
    private String aulaId;

    @Column(name = "concluida_em")
    private LocalDateTime concluidaEm;

    protected AulaConcluida() {
    }

    public AulaConcluida(Long usuarioId, String aulaId) {
        this.usuarioId = usuarioId;
        this.aulaId = aulaId;
        this.concluidaEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getAulaId() {
        return aulaId;
    }

    public LocalDateTime getConcluidaEm() {
        return concluidaEm;
    }
}
