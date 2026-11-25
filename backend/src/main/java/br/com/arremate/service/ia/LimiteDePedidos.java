package br.com.arremate.service.ia;

import br.com.arremate.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Limita quantos pedidos cada pessoa faz à IA por hora, para proteger a cota da chave.
// Fica só na memória: ao reiniciar a API, a contagem recomeça.
@Component
public class LimiteDePedidos {

    private static final long UMA_HORA_MS = 60L * 60 * 1000;

    private final int porHora;
    private final Map<Long, Deque<Long>> pedidos = new ConcurrentHashMap<>();

    public LimiteDePedidos(@Value("${arremate.ia.pedidos-por-hora:30}") int porHora) {
        this.porHora = porHora;
    }

    public void registrar(Long usuarioId) {
        registrar(usuarioId, System.currentTimeMillis());
    }

    void registrar(Long usuarioId, long agora) {
        Deque<Long> fila = pedidos.computeIfAbsent(usuarioId, id -> new ArrayDeque<>());
        synchronized (fila) {
            while (!fila.isEmpty() && agora - fila.peekFirst() >= UMA_HORA_MS) {
                fila.pollFirst();
            }
            if (fila.size() >= porHora) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "limite_pedidos");
            }
            fila.addLast(agora);
        }
    }
}
