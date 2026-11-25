package br.com.arremate.service;

import br.com.arremate.dto.GolpeDTO;
import br.com.arremate.dto.ProgressoDTO;
import br.com.arremate.entity.AulaConcluida;
import br.com.arremate.entity.TreinoGolpe;
import br.com.arremate.entity.TrilhaBaixada;
import br.com.arremate.exception.DadoInvalidoException;
import br.com.arremate.mapper.ProgressoMapper;
import br.com.arremate.repository.AulaConcluidaRepository;
import br.com.arremate.repository.TreinoGolpeRepository;
import br.com.arremate.repository.TrilhaBaixadaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

@Service
public class ProgressoService {

    // Id de aula: letras minúsculas e números, até 10 (ex.: o1, f2, d3)
    private static final String FORMATO_AULA = "[a-z0-9]{1,10}";
    private static final int MAXIMO_MENSAGENS_GOLPE = 100;

    private final AulaConcluidaRepository aulaRepository;
    private final TreinoGolpeRepository golpeRepository;
    private final TrilhaBaixadaRepository baixadaRepository;

    public ProgressoService(AulaConcluidaRepository aulaRepository,
                            TreinoGolpeRepository golpeRepository,
                            TrilhaBaixadaRepository baixadaRepository) {
        this.aulaRepository = aulaRepository;
        this.golpeRepository = golpeRepository;
        this.baixadaRepository = baixadaRepository;
    }

    // GET /progresso: sem nada salvo, devolve tudo vazio (não é erro)
    public ProgressoDTO buscar(Long usuarioId) {
        return ProgressoMapper.paraDTO(
                aulaRepository.findByUsuarioId(usuarioId),
                golpeRepository.findById(usuarioId).orElse(null),
                baixadaRepository.findByUsuarioId(usuarioId)
        );
    }

    // PUT /progresso: cada parte que vier no corpo substitui a anterior.
    // Parte que não vier (null) fica como está.
    @Transactional
    public void salvar(Long usuarioId, ProgressoDTO dto) {
        // Valida tudo antes de gravar qualquer coisa
        Set<String> aulas = dto.aulas() == null ? null : marcadosComoTrue(dto.aulas(), this::validarAula);
        Set<String> baixadas = dto.baixadas() == null ? null : marcadosComoTrue(dto.baixadas(), this::validarTrilha);
        if (dto.golpe() != null) {
            validarGolpe(dto.golpe());
        }

        if (aulas != null) {
            salvarAulas(usuarioId, aulas);
        }
        if (dto.golpe() != null) {
            salvarGolpe(usuarioId, dto.golpe());
        }
        if (baixadas != null) {
            salvarBaixadas(usuarioId, baixadas);
        }
    }

    // Mantém as aulas que já estavam feitas (e a data em que foram concluídas),
    // apaga as que saíram da lista e insere só as novas.
    private void salvarAulas(Long usuarioId, Set<String> aulasFeitas) {
        List<AulaConcluida> salvas = aulaRepository.findByUsuarioId(usuarioId);
        List<String> idsSalvos = new ArrayList<>();

        for (AulaConcluida aula : salvas) {
            if (aulasFeitas.contains(aula.getAulaId())) {
                idsSalvos.add(aula.getAulaId());
            } else {
                aulaRepository.delete(aula);
            }
        }

        for (String aulaId : aulasFeitas) {
            if (!idsSalvos.contains(aulaId)) {
                aulaRepository.save(new AulaConcluida(usuarioId, aulaId));
            }
        }
    }

    private void salvarGolpe(Long usuarioId, GolpeDTO golpe) {
        TreinoGolpe treino = golpeRepository.findById(usuarioId).orElseGet(() -> new TreinoGolpe(usuarioId));
        treino.atualizar(golpe.melhor(), golpe.total());
        golpeRepository.save(treino);
    }

    private void salvarBaixadas(Long usuarioId, Set<String> trilhas) {
        baixadaRepository.apagarDoUsuario(usuarioId);
        for (String trilhaId : trilhas) {
            baixadaRepository.save(new TrilhaBaixada(usuarioId, trilhaId));
        }
    }

    // De { "o1": true, "o2": false } fica só ["o1"]. Valida cada chave, mesmo as que estão false.
    private Set<String> marcadosComoTrue(Map<String, Boolean> mapa, Consumer<String> validador) {
        Set<String> marcados = new LinkedHashSet<>();
        for (Map.Entry<String, Boolean> item : mapa.entrySet()) {
            validador.accept(item.getKey());
            if (Boolean.TRUE.equals(item.getValue())) {
                marcados.add(item.getKey());
            }
        }
        return marcados;
    }

    private void validarAula(String aulaId) {
        if (aulaId == null || !aulaId.matches(FORMATO_AULA)) {
            throw new DadoInvalidoException("aula_invalida");
        }
    }

    private void validarTrilha(String trilhaId) {
        if (!PerfilService.TRILHAS.contains(trilhaId)) {
            throw new DadoInvalidoException("trilha_invalida");
        }
    }

    // 0 <= melhor <= total <= 100
    private void validarGolpe(GolpeDTO golpe) {
        Integer melhor = golpe.melhor();
        Integer total = golpe.total();
        if (melhor == null || total == null
                || melhor < 0 || total < 0
                || melhor > total || total > MAXIMO_MENSAGENS_GOLPE) {
            throw new DadoInvalidoException("golpe_invalido");
        }
    }
}

