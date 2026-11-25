# Banco de dados do Arremate

O banco é criado e atualizado pelo **Flyway**, junto com o back-end. Os scripts SQL ficam dentro do projeto Java:

```
backend/src/main/resources/
  db/migration/   tabelas, em ordem (V1__..., V2__...). Rodam uma única vez cada.
  db/exemplo/     usuários de exemplo (R__dados_exemplo.sql). Roda de novo quando o arquivo muda.

database/
  modelagem/      diagrama, decisões do modelo e dicionário de dados
```

Ver [modelagem/MODELO.md](modelagem/MODELO.md) para o diagrama entidade-relacionamento e a explicação de cada tabela.

## Migrations

| Arquivo | Etapa | Tabelas |
| --- | --- | --- |
| `V1__criar_tabelas_login.sql` | Login | `usuario`, `codigo_acesso`, `sessao` |
| `V2__criar_tabelas_perfil.sql` | Perfil | `perfil`, `perfil_trilha` |
| `V3__criar_tabelas_progresso.sql` | Progresso | `aula_concluida`, `treino_golpe`, `trilha_baixada` |
| `V4__criar_tabelas_planilhas.sql` | Planilhas | `linha_estoque`, `linha_caixa`, `linha_pedido` |
| `V5__categoria_no_caixa.sql` | Categoria das linhas do caixa | coluna `categoria` em `linha_caixa` |

Regras do Flyway:

- **Nunca altere um `V...` que já rodou.** O Flyway confere o conteúdo e a API não sobe se o arquivo mudar. Para mudar uma tabela, crie um novo arquivo, por exemplo `V5__adicionar_coluna_x.sql`.
- O número da versão vem depois do `V` e antes de dois sublinhados (`__`).

## Dados de exemplo

O arquivo `db/exemplo/R__dados_exemplo.sql` cria dois usuários para demonstração. Entre com o telefone e o código `1234`:

| Telefone | Quem | O que tem |
| --- | --- | --- |
| `81911111111` | Maria, Facção da Maria (jeans) | diagnóstico feito, 3 aulas, treino de golpes, estoque, caixa e pedidos preenchidos |
| `81922222222` | José, Confecção São José (camisas) | diagnóstico feito, 1 aula e 1 linha no caixa |

O script apaga e recria só esses dois usuários. Para voltar os dados deles ao original, altere qualquer coisa no arquivo (até um comentário) e reinicie a API. Em produção, tire `classpath:db/exemplo` de `spring.flyway.locations` no `application.properties`.

## Ver e consultar o banco

Com a API rodando, abra `http://localhost:8080/h2-console`:

- JDBC URL: `jdbc:h2:file:./data/arremate`
- Usuário: `sa`
- Senha: vazia

O arquivo do banco fica em `backend/data/` e não vai para o Git. **Para zerar tudo**, pare a API, apague a pasta `backend/data/` e suba de novo: o Flyway recria as tabelas e os exemplos.

## Dados pessoais

Telefone, nome e dados do negócio estão protegidos pela LGPD. Todas as tabelas usam `ON DELETE CASCADE`: apagar um usuário apaga todos os dados dele. O áudio da voz não passa pelo nosso back-end e não é guardado.
