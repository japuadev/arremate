package br.com.arremate.repository;

import br.com.arremate.entity.LinhaCaixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LinhaCaixaRepository extends JpaRepository<LinhaCaixa, Long> {

    // Linhas do usuário na mesma ordem em que o front mandou
    List<LinhaCaixa> findByUsuarioIdOrderByPosicao(Long usuarioId);

    @Modifying
    @Query("DELETE FROM LinhaCaixa l WHERE l.usuarioId = :usuarioId")
    void apagarDoUsuario(@Param("usuarioId") Long usuarioId);
}
