package br.com.arremate.controller;

import br.com.arremate.dto.StatusDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Rota simples para conferir se a API está no ar.
@RestController
public class StatusController {

    @GetMapping("/status")
    public StatusDTO status() {
        return new StatusDTO("ok", "arremate");
    }
}
