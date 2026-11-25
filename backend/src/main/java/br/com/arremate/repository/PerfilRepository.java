package br.com.arremate.repository;

import br.com.arremate.entity.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;

// A chave do perfil é o id do usuário, então findById(usuarioId) já encontra o perfil.
public interface PerfilRepository extends JpaRepository<Perfil, Long> {
}
