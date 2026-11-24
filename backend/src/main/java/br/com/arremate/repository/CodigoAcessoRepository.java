package br.com.arremate.repository;

import br.com.arremate.entity.CodigoAcesso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodigoAcessoRepository extends JpaRepository<CodigoAcesso, Long> {

    // O último código ainda não usado daquele telefone (o mais novo vale; os anteriores são ignorados)
    Optional<CodigoAcesso> findFirstByTelefoneAndUsadoFalseOrderByIdDesc(String telefone);
}
