package br.com.arremate.service;

import br.com.arremate.entity.CodigoAcesso;
import br.com.arremate.entity.Sessao;
import br.com.arremate.entity.Usuario;
import br.com.arremate.exception.CodigoInvalidoException;
import br.com.arremate.exception.NaoAutenticadoException;
import br.com.arremate.exception.TelefoneInvalidoException;
import br.com.arremate.repository.CodigoAcessoRepository;
import br.com.arremate.repository.SessaoRepository;
import br.com.arremate.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MINUTOS_VALIDADE_CODIGO = 10;

    private final UsuarioRepository usuarioRepository;
    private final CodigoAcessoRepository codigoRepository;
    private final SessaoRepository sessaoRepository;
    private final String codigoFixo;
    private final SecureRandom sorteio = new SecureRandom();

    public AuthService(UsuarioRepository usuarioRepository,
                       CodigoAcessoRepository codigoRepository,
                       SessaoRepository sessaoRepository,
                       @Value("${arremate.auth.codigo-fixo:}") String codigoFixo) {
        this.usuarioRepository = usuarioRepository;
        this.codigoRepository = codigoRepository;
        this.sessaoRepository = sessaoRepository;
        this.codigoFixo = codigoFixo;
    }

    // POST /auth/codigo: gera um código de 4 números para o telefone.
    @Transactional
    public String pedirCodigo(String telefoneRecebido) {
        String telefone = validarTelefone(telefoneRecebido);
        String codigo = String.format("%04d", sorteio.nextInt(10000)); // de 0000 a 9999

        codigoRepository.save(new CodigoAcesso(telefone, codigo, MINUTOS_VALIDADE_CODIGO));

        // Envio de SMS simulado: o código aparece no console do servidor.
        log.info("SMS simulado para {}: seu código do Arremate é {}", telefone, codigo);
        return telefone;
    }

    // POST /auth/confirmar: confere o código e abre uma sessão.
    @Transactional
    public Sessao confirmarCodigo(String telefoneRecebido, String codigo) {
        String telefone = validarTelefone(telefoneRecebido);
        if (codigo == null || codigo.isBlank()) {
            throw new CodigoInvalidoException();
        }

        if (!codigoFixoAceito(codigo)) {
            CodigoAcesso pedido = codigoRepository
                    .findFirstByTelefoneAndUsadoFalseOrderByIdDesc(telefone)
                    .orElseThrow(CodigoInvalidoException::new);

            if (pedido.estaExpirado() || !pedido.getCodigo().equals(codigo.trim())) {
                throw new CodigoInvalidoException();
            }
            pedido.marcarComoUsado(); // cada código só serve uma vez
        }

        // Primeira vez com esse telefone? Cria o usuário.
        Usuario usuario = usuarioRepository.findByTelefone(telefone)
                .orElseGet(() -> usuarioRepository.save(new Usuario(telefone)));

        return sessaoRepository.save(new Sessao(usuario));
    }

    // Usado pelo interceptor: descobre de quem é o token.
    public Usuario buscarUsuarioPorToken(String token) {
        return sessaoRepository.findByToken(token)
                .map(Sessao::getUsuario)
                .orElseThrow(NaoAutenticadoException::new);
    }

    // POST /auth/sair: encerra a sessão. O token deixa de funcionar.
    @Transactional
    public void sair(String token) {
        sessaoRepository.findByToken(token).ifPresent(sessaoRepository::delete);
    }

    // Aceita só números; tira espaços, parênteses e traços. Celular com DDD tem 10 ou 11 dígitos.
    private String validarTelefone(String telefone) {
        if (telefone == null) {
            throw new TelefoneInvalidoException();
        }
        String soDigitos = telefone.replaceAll("\\D", "");
        if (soDigitos.length() < 10 || soDigitos.length() > 11) {
            throw new TelefoneInvalidoException();
        }
        return soDigitos;
    }

    // Código fixo para testes (igual ao protótipo: 1234). Desligado se a propriedade estiver vazia.
    private boolean codigoFixoAceito(String codigo) {
        return !codigoFixo.isBlank() && codigoFixo.equals(codigo.trim());
    }
}
