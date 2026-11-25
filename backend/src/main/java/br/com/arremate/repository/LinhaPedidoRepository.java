package br.com.arremate.repository;

import br.com.arremate.entity.LinhaPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LinhaPedidoRepository extends JpaRepository<LinhaPedido, Long> {

    // Linhas do usuário na mesma ordem em que o front mandou
    List<LinhaPedido> findByUsuarioIdOrderByPosicao(Long usuarioId);

    @Modifying
    @Query("DELETE FROM LinhaPedido l WHERE l.usuarioId = :usuarioId")
    void apagarDoUsuario(@Param("usuarioId") Long usuarioId);
}
