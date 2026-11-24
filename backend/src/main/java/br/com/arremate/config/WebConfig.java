package br.com.arremate.config;

import br.com.arremate.interceptor.AutenticacaoInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Define quais rotas exigem login. Tudo é protegido, menos a lista de rotas públicas.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AutenticacaoInterceptor autenticacaoInterceptor;

    public WebConfig(AutenticacaoInterceptor autenticacaoInterceptor) {
        this.autenticacaoInterceptor = autenticacaoInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(autenticacaoInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/status",
                        "/auth/codigo",
                        "/auth/confirmar",
                        "/h2-console/**",
                        "/error"
                );
    }
}
