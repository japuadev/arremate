package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "treino_golpe")
public class TreinoGolpe {

    // Um resultado por usuário: a chave é o id do usuário
    @Id
    @Column(name = "usuario_id")
    private Long usuarioId;

    private int melhor;

    private int total;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    protected TreinoGolpe() {
    }

    public TreinoGolpe(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void atualizar(int melhor, int total) {
        this.melhor = melhor;
        this.total = total;
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public int getMelhor() {
        return melhor;
    }

    public int getTotal() {
        return total;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
