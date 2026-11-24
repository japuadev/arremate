package br.com.arremate.mapper;

import br.com.arremate.dto.SessaoDTO;
import br.com.arremate.dto.UsuarioDTO;
import br.com.arremate.entity.Sessao;
import br.com.arremate.entity.Usuario;

public class UsuarioMapper {

    public static UsuarioDTO paraDTO(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getTelefone(),
                usuario.getCriadoEm()
        );
    }

    public static SessaoDTO paraSessaoDTO(Sessao sessao) {
        return new SessaoDTO(
                sessao.getUsuario().getTelefone(),
                sessao.getToken()
        );
    }
}
