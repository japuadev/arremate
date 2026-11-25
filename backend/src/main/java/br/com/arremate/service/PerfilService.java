package br.com.arremate.service;

import br.com.arremate.dto.PerfilDTO;
import br.com.arremate.entity.Perfil;
import br.com.arremate.entity.PerfilTrilha;
import br.com.arremate.exception.DadoInvalidoException;
import br.com.arremate.exception.PerfilNaoEncontradoException;
import br.com.arremate.mapper.PerfilMapper;
import br.com.arremate.repository.PerfilRepository;
import br.com.arremate.repository.PerfilTrilhaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PerfilService {

    // Valores aceitos (os mesmos do front e das regras CHECK do banco)
    public static final Set<String> TIPOS = Set.of("faccao", "confeccao", "vendas");
    public static final Set<String> PECAS = Set.of("jeans", "camisas", "intima", "infantil", "outras");
    public static final Set<String> TRILHAS = Set.of("organizar", "formalizar", "dinheiro", "proteger");
    private static final int TAMANHO_MAXIMO_TEXTO = 100;

    private final PerfilRepository perfilRepository;
    private final PerfilTrilhaRepository trilhaRepository;

    public PerfilService(PerfilRepository perfilRepository, PerfilTrilhaRepository trilhaRepository) {
        this.perfilRepository = perfilRepository;
        this.trilhaRepository = trilhaRepository;
    }

    // GET /perfil
    public PerfilDTO buscar(Long usuarioId) {
        Perfil perfil = perfilRepository.findById(usuarioId)
                .orElseThrow(PerfilNaoEncontradoException::new);
        return PerfilMapper.paraDTO(perfil, trilhaRepository.findByUsuarioId(usuarioId));
    }

    // PUT /perfil: o front sempre manda o perfil inteiro, então tudo é substituído.
    @Transactional
    public void salvar(Long usuarioId, PerfilDTO dto) {
        String nome = validarTexto(dto.nome(), "nome_invalido");
        String negocio = validarTexto(dto.negocio(), "negocio_invalido");
        validarValor(dto.tipo(), TIPOS, "tipo_invalido");
        validarValor(dto.peca(), PECAS, "peca_invalida");
        List<String> ordem = validarOrdemDasTrilhas(dto.trilhas());
        Map<String, Integer> niveis = validarNiveis(dto.niveis());
        boolean diagnosticoFeito = Boolean.TRUE.equals(dto.diagnosticoFeito());

        // Cria o perfil na primeira vez; depois só atualiza
        Perfil perfil = perfilRepository.findById(usuarioId).orElseGet(() -> new Perfil(usuarioId));
        perfil.atualizar(nome, negocio, dto.tipo(), dto.peca(), diagnosticoFeito);
        perfilRepository.saveAndFlush(perfil);

        // Trilhas: apaga as antigas e grava as novas
        trilhaRepository.apagarDoUsuario(usuarioId);
        trilhaRepository.saveAll(montarTrilhas(usuarioId, ordem, niveis));
    }

    // Junta a ordem e os níveis numa linha por trilha
    private List<PerfilTrilha> montarTrilhas(Long usuarioId, List<String> ordem, Map<String, Integer> niveis) {
        Set<String> todas = new LinkedHashSet<>(ordem);
        todas.addAll(niveis.keySet());

        List<PerfilTrilha> linhas = new ArrayList<>();
        for (String trilha : todas) {
            Integer posicao = ordem.contains(trilha) ? ordem.indexOf(trilha) : null;
            linhas.add(new PerfilTrilha(usuarioId, trilha, posicao, niveis.get(trilha)));
        }
        return linhas;
    }

    // Texto vazio é aceito (o diagnóstico salva antes de pedir o nome)
    private String validarTexto(String texto, String codigoErro) {
        String limpo = texto == null ? "" : texto.trim();
        if (limpo.length() > TAMANHO_MAXIMO_TEXTO) {
            throw new DadoInvalidoException(codigoErro);
        }
        return limpo;
    }

    private void validarValor(String valor, Set<String> aceitos, String codigoErro) {
        if (valor == null || !aceitos.contains(valor)) {
            throw new DadoInvalidoException(codigoErro);
        }
    }

    // trilhas pode vir null (diagnóstico ainda não terminou). Não aceita trilha repetida ou desconhecida.
    private List<String> validarOrdemDasTrilhas(List<String> trilhas) {
        if (trilhas == null) {
            return List.of();
        }
        Set<String> vistas = new HashSet<>();
        for (String trilha : trilhas) {
            validarValor(trilha, TRILHAS, "trilha_invalida");
            if (!vistas.add(trilha)) {
                throw new DadoInvalidoException("trilha_invalida");
            }
        }
        return trilhas;
    }

    // niveis pode vir vazio. Cada nível vai de 1 a 3.
    private Map<String, Integer> validarNiveis(Map<String, Integer> niveis) {
        if (niveis == null) {
            return Map.of();
        }
        for (Map.Entry<String, Integer> item : niveis.entrySet()) {
            validarValor(item.getKey(), TRILHAS, "trilha_invalida");
            Integer nivel = item.getValue();
            if (nivel == null || nivel < 1 || nivel > 3) {
                throw new DadoInvalidoException("nivel_invalido");
            }
        }
        return niveis;
    }
}
