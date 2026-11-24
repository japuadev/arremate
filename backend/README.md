# Back-end do Arremate

API em **Java 17 + Spring Boot 4**, com banco **H2** e migrations **Flyway**. Baseada no projeto de referência `japuadev/demo3`.

## Como rodar

Precisa de um JDK 17 ou mais novo. O Maven não precisa ser instalado, porque o projeto usa o Maven Wrapper (`mvnw`).

```powershell
cd backend
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.13.1'   # só se o java não estiver no PATH
.\mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080`. Para testar: `curl http://localhost:8080/status`.

Outros comandos:

- `.\mvnw.cmd test`: roda os testes.
- `.\mvnw.cmd package`: gera `target/arremate-backend-0.0.1-SNAPSHOT.jar`.

## Banco de dados

- Arquivo H2 em `backend/data/` (fora do Git). Para zerar o banco, pare a API e apague essa pasta.
- Console: `http://localhost:8080/h2-console`, com JDBC URL `jdbc:h2:file:./data/arremate`, usuário `sa` e senha vazia.
- As tabelas são criadas pelos scripts de `src/main/resources/db/migration` (`V1__...sql`, `V2__...sql`). Nunca edite um script que já rodou: crie um novo.

## Organização

```
src/main/java/br/com/arremate/
  config/       CORS e configurações gerais
  controller/   recebem a requisição e devolvem a resposta
  service/      regras de negócio
  repository/   acesso às tabelas (JpaRepository)
  entity/       classes que representam as tabelas
  dto/          formato do JSON de entrada e saída
  mapper/       converte entity <-> dto
  exception/    exceções e o tratador de erros ({ "erro": "codigo" })
  interceptor/  confere o token "Authorization: Bearer ..."
```

O que o front espera está em [`docs/CONTRATO_API.md`](../docs/CONTRATO_API.md). O CORS libera o endereço definido em `arremate.cors.origens` no `application.properties`.

Nunca envie senhas ou chaves ao Git.
