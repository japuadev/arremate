package br.com.arremate.repository;

import br.com.arremate.entity.Sessao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessaoRepository extends JpaRepository<Sessao, Long> {

    Optional<Sessao> findByToken(String token);
}
