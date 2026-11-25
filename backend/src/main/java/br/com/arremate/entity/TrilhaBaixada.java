package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "trilha_baixada")
public class TrilhaBaixada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "trilha_id")
    private String trilhaId;

    protected TrilhaBaixada() {
    }

    public TrilhaBaixada(Long usuarioId, String trilhaId) {
        this.usuarioId = usuarioId;
        this.trilhaId = trilhaId;
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getTrilhaId() {
        return trilhaId;
    }
}
