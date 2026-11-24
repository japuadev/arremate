package br.com.arremate;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:teste")
class ArremateApplicationTests {

    @Test
    void contextoSobe() {
    }
}
