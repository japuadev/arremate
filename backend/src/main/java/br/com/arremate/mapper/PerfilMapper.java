package br.com.arremate.mapper;

import br.com.arremate.dto.PerfilDTO;
import br.com.arremate.entity.Perfil;
import br.com.arremate.entity.PerfilTrilha;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PerfilMapper {

    public static PerfilDTO paraDTO(Perfil perfil, List<PerfilTrilha> trilhasDoUsuario) {
        // Ordem das trilhas: só as que têm posição, da primeira para a última
        List<String> trilhas = trilhasDoUsuario.stream()
                .filter(t -> t.getOrdem() != null)
                .sorted(Comparator.comparing(PerfilTrilha::getOrdem))
                .map(PerfilTrilha::getTrilhaId)
                .toList();

        // Níveis: { "organizar": 1, ... }
        Map<String, Integer> niveis = new LinkedHashMap<>();
        for (PerfilTrilha t : trilhasDoUsuario) {
            if (t.getNivel() != null) {
                niveis.put(t.getTrilhaId(), t.getNivel());
            }
        }

        return new PerfilDTO(
                perfil.getNome(),
                perfil.getNegocio(),
                perfil.getTipo(),
                perfil.getPeca(),
                trilhas.isEmpty() ? null : trilhas, // null = diagnóstico ainda não definiu a ordem (igual ao front)
                niveis,
                perfil.isDiagnosticoFeito()
        );
    }
}
