package br.com.arremate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "perfil_trilha")
public class PerfilTrilha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "trilha_id")
    private String trilhaId;

    // Posição da trilha na lista (0 = primeira). Fica nula enquanto o diagnóstico não termina.
    private Integer ordem;

    // 1, 2 ou 3. Fica nulo se o diagnóstico não deu nível para essa trilha.
    private Integer nivel;

    protected PerfilTrilha() {
    }

    public PerfilTrilha(Long usuarioId, String trilhaId, Integer ordem, Integer nivel) {
        this.usuarioId = usuarioId;
        this.trilhaId = trilhaId;
        this.ordem = ordem;
        this.nivel = nivel;
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

    public Integer getOrdem() {
        return ordem;
    }

    public Integer getNivel() {
        return nivel;
    }
}
