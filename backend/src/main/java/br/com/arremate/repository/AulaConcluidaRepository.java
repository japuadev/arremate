package br.com.arremate.repository;

import br.com.arremate.entity.AulaConcluida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AulaConcluidaRepository extends JpaRepository<AulaConcluida, Long> {

    List<AulaConcluida> findByUsuarioId(Long usuarioId);
}
