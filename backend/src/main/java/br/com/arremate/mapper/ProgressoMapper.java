package br.com.arremate.mapper;

import br.com.arremate.dto.GolpeDTO;
import br.com.arremate.dto.ProgressoDTO;
import br.com.arremate.entity.AulaConcluida;
import br.com.arremate.entity.TreinoGolpe;
import br.com.arremate.entity.TrilhaBaixada;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ProgressoMapper {

    // treino pode ser null (usuário ainda não fez o treino): devolve 0 de 0, igual ao front
    public static ProgressoDTO paraDTO(List<AulaConcluida> aulas, TreinoGolpe treino, List<TrilhaBaixada> baixadas) {
        Map<String, Boolean> mapaAulas = new LinkedHashMap<>();
        for (AulaConcluida aula : aulas) {
            mapaAulas.put(aula.getAulaId(), true);
        }

        Map<String, Boolean> mapaBaixadas = new LinkedHashMap<>();
        for (TrilhaBaixada trilha : baixadas) {
            mapaBaixadas.put(trilha.getTrilhaId(), true);
        }

        GolpeDTO golpe = treino == null
                ? new GolpeDTO(0, 0)
                : new GolpeDTO(treino.getMelhor(), treino.getTotal());

        return new ProgressoDTO(mapaAulas, golpe, mapaBaixadas);
    }
}
