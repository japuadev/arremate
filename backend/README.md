# Back-end do Arremate

API REST em **Java 17 + Spring Boot 4**, com banco **H2** e migrations **Flyway**. Segue a organização do projeto de referência `japuadev/demo3`.

## Como rodar

Precisa de um **JDK 17 ou mais novo**. Não precisa instalar o Maven: o projeto usa o Maven Wrapper (`mvnw`).

```powershell
cd backend
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.13.1'   # só se o java não estiver no PATH
.\mvnw.cmd spring-boot:run
```

No Linux ou Mac: `./mvnw spring-boot:run`.

A API sobe em `http://localhost:8080`. Para conferir:

```powershell
curl.exe http://localhost:8080/status
```

No PowerShell, use `curl.exe`; o `curl` sozinho é outro comando.

### Ligar o front à API

Em `frontend/`, copie `.env.example` para `.env` com:

```
VITE_API_URL=http://localhost:8080
```

Depois rode `npm run dev` e abra `http://localhost:5173`. Sem o `.env`, o front usa a API simulada e não fala com o back-end.

### Entrar no app

O SMS é **simulado**: o código sorteado aparece no console da API. Em desenvolvimento, o código **`1234`** sempre funciona.

Usuários de exemplo, já com dados: `81911111111` (Maria) e `81922222222` (José). Detalhes em [`database/README.md`](../database/README.md).

## Configuração

Tudo em `src/main/resources/application.properties`:

| Propriedade | Valor | Para quê |
| --- | --- | --- |
| `server.port` | `8080` | porta da API |
| `spring.datasource.url` | `jdbc:h2:file:./data/arremate` | banco salvo em arquivo na pasta `backend/data/` |
| `spring.flyway.locations` | `db/migration,db/exemplo` | tabelas e dados de exemplo (em produção, só `db/migration`) |
| `spring.h2.console.enabled` | `true` | console do banco em `/h2-console` |
| `arremate.cors.origens` | `http://localhost:5173` | endereços do front liberados (separe vários com vírgula) |
| `arremate.auth.codigo-fixo` | `1234` | código que sempre funciona; deixe vazio para aceitar só o sorteado |

## Rotas

Corpo sempre em JSON. Rotas protegidas exigem `Authorization: Bearer <token>`, recebido em `/auth/confirmar`. O formato completo de cada rota está em [`docs/CONTRATO_API.md`](../docs/CONTRATO_API.md).

| Método | Rota | Protegida | O que faz |
| --- | --- | --- | --- |
| GET | `/status` | não | confere se a API está no ar |
| POST | `/auth/codigo` | não | gera o código de acesso para o telefone |
| POST | `/auth/confirmar` | não | confere o código e devolve o token |
| GET | `/auth/sessao` | sim | mostra o dono do token |
| POST | `/auth/sair` | sim | encerra a sessão |
| GET / PUT | `/perfil` | sim | lê / grava o perfil do negócio |
| GET / PUT | `/progresso` | sim | lê / grava aulas, treino de golpes e trilhas guardadas |
| GET / PUT | `/planilhas/estoque` | sim | lê / grava a planilha de estoque |
| GET / PUT | `/planilhas/caixa` | sim | lê / grava a planilha de caixa |
| GET / PUT | `/planilhas/pedidos` | sim | lê / grava a planilha de pedidos |

### Erros

Todo erro devolve o status HTTP e `{ "erro": "codigo" }`:

| Status | Quando | Exemplos de código |
| --- | --- | --- |
| 400 | campo com valor não aceito ou JSON mal escrito | `telefone_invalido`, `tipo_invalido`, `data_invalida`, `corpo_invalido` |
| 401 | código errado, ou rota protegida sem token válido | `codigo_invalido`, `nao_autenticado` |
| 404 | rota inexistente ou perfil ainda não criado | `rota_nao_encontrada`, `perfil_nao_encontrado` |
| 405 | método errado na rota | `metodo_nao_permitido` |
| 500 | erro inesperado (detalhes no console da API) | `erro_servidor` |

## Organização do código

```
src/main/java/br/com/arremate/
  ArremateApplication.java  classe principal
  config/        CorsConfig (libera o front) e WebConfig (quais rotas exigem login)
  controller/    recebem a requisição e devolvem a resposta
  service/       regras de negócio e validações
  repository/    acesso às tabelas (JpaRepository)
  entity/        classes que representam as tabelas
  dto/           formato do JSON de entrada e saída (records)
  mapper/        converte entity em dto
  exception/     exceções da API e o TratadorDeErros
  interceptor/   AutenticacaoInterceptor: confere o token antes das rotas protegidas
src/main/resources/
  application.properties
  db/migration/  criação das tabelas (Flyway)
  db/exemplo/    dados de exemplo (Flyway)
```

Caminho de uma requisição protegida, por exemplo `PUT /perfil`:

```
AutenticacaoInterceptor  confere o token e acha o usuário
  → PerfilController     recebe o JSON como PerfilDTO
  → PerfilService        valida e grava (numa transação)
  → PerfilRepository     acessa as tabelas perfil e perfil_trilha
  ← OkDTO                { "ok": true }
Se algo der errado, a exceção vai para o TratadorDeErros, que devolve { "erro": "..." }.
```

## Banco de dados

Diagrama, tabelas e decisões do modelo: [`database/modelagem/MODELO.md`](../database/modelagem/MODELO.md).

- Console: `http://localhost:8080/h2-console`, com JDBC URL `jdbc:h2:file:./data/arremate`, usuário `sa` e senha vazia.
- Para zerar o banco: pare a API, apague `backend/data/` e suba de novo.
- Para mudar uma tabela: crie uma migration nova (`V5__...sql`). Nunca edite uma que já rodou.

## Problemas comuns

| Sintoma | Solução |
| --- | --- |
| `JAVA_HOME not found` ou `java não reconhecido` | defina o `JAVA_HOME` como no exemplo acima |
| `Port 8080 was already in use` | outra API já está rodando; feche a outra janela ou mude `server.port` |
| `Validate failed: Migration checksum mismatch` | uma migration `V...` foi editada depois de rodar; desfaça a edição ou, só em desenvolvimento, apague `backend/data/` |
| `Database may be already in use` | o banco está aberto em outro programa; feche-o (só a API pode usar o arquivo) |
| Front não salva nada no back-end | confira o `frontend/.env` e reinicie o `npm run dev` |
| Acento chega errado pelo curl no Git Bash | o terminal não manda UTF-8; use o Insomnia, o PowerShell ou `--data-binary @arquivo.json` |

Nunca envie senhas ou chaves ao Git.
