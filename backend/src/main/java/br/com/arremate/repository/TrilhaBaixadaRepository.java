package br.com.arremate.repository;

import br.com.arremate.entity.TrilhaBaixada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrilhaBaixadaRepository extends JpaRepository<TrilhaBaixada, Long> {

    List<TrilhaBaixada> findByUsuarioId(Long usuarioId);

    // Apaga na hora (antes de inserir as novas), para não esbarrar na regra de trilha única por usuário
    @Modifying
    @Query("DELETE FROM TrilhaBaixada t WHERE t.usuarioId = :usuarioId")
    void apagarDoUsuario(@Param("usuarioId") Long usuarioId);
}
