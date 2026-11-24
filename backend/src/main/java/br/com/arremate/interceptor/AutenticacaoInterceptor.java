package br.com.arremate.interceptor;

import br.com.arremate.entity.Usuario;
import br.com.arremate.exception.NaoAutenticadoException;
import br.com.arremate.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

// Roda antes dos controllers protegidos. Confere o cabeçalho "Authorization: Bearer <token>".
// Se o token for válido, guarda o usuário na requisição para o controller usar.
@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_USUARIO = "usuario";
    public static final String ATRIBUTO_TOKEN = "token";
    private static final String PREFIXO = "Bearer ";

    private final AuthService authService;

    public AutenticacaoInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // A pré-requisição do CORS (OPTIONS) não leva token
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String cabecalho = request.getHeader("Authorization");
        if (cabecalho == null || !cabecalho.startsWith(PREFIXO)) {
            throw new NaoAutenticadoException();
        }

        String token = cabecalho.substring(PREFIXO.length()).trim();
        Usuario usuario = authService.buscarUsuarioPorToken(token);

        request.setAttribute(ATRIBUTO_USUARIO, usuario);
        request.setAttribute(ATRIBUTO_TOKEN, token);
        return true;
    }
}
