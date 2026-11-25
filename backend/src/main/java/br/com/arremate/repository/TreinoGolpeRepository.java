package br.com.arremate.repository;

import br.com.arremate.entity.TreinoGolpe;
import org.springframework.data.jpa.repository.JpaRepository;

// A chave é o id do usuário, então findById(usuarioId) já encontra o treino.
public interface TreinoGolpeRepository extends JpaRepository<TreinoGolpe, Long> {
}
