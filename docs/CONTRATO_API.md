# Contrato entre front e back

Este é o formato que `frontend/src/api/http.js` já usa. Se precisar mudar uma rota, combine com o front e atualize este arquivo.

Corpo sempre em JSON. Depois de entrar, todo pedido leva `Authorization: Bearer <token>`.

Erros devolvem o status HTTP adequado e `{ "erro": "codigo_do_erro" }`.

## Entrar

`POST /auth/codigo`: envia o código por SMS.

```json
{ "telefone": "81999887766" }
```

Resposta `200`: `{ "telefone": "81999887766", "enviado": true }`

`POST /auth/confirmar`

```json
{ "telefone": "81999887766", "codigo": "1234" }
```

Resposta `200`: `{ "telefone": "81999887766", "token": "..." }`. Código errado: `401` com `{ "erro": "codigo_invalido" }`.

Telefone com menos de 10 ou mais de 11 números: `400` com `{ "erro": "telefone_invalido" }`. O código vale por 10 minutos e só pode ser usado uma vez. Em desenvolvimento, `1234` sempre funciona (`arremate.auth.codigo-fixo`).

`GET /auth/sessao` (com token): `200` com `{ "id": 1, "telefone": "81999887766", "criadoEm": "..." }`.

`POST /auth/sair` (com token): `204`. O token deixa de valer.

Qualquer rota protegida sem token, ou com token inválido: `401` com `{ "erro": "nao_autenticado" }`.

## Perfil

`PUT /perfil`

```json
{
  "nome": "Maria",
  "negocio": "Facção da Maria",
  "tipo": "faccao",
  "peca": "jeans",
  "trilhas": ["organizar", "proteger", "dinheiro", "formalizar"],
  "niveis": { "organizar": 1, "formalizar": 3, "dinheiro": 2, "proteger": 1 },
  "diagnosticoFeito": true
}
```

`tipo`: `faccao`, `confeccao` ou `vendas`. `peca`: `jeans`, `camisas`, `intima`, `infantil` ou `outras`.

O corpo substitui o perfil inteiro. `nome` e `negocio` podem ir vazios (até 100 letras), `trilhas` pode ir `null` enquanto o diagnóstico não termina, e `niveis` pode ir `{}`. Trilhas aceitas: `organizar`, `formalizar`, `dinheiro` e `proteger`, sem repetir. Níveis vão de 1 a 3.

Erros (`400`): `tipo_invalido`, `peca_invalida`, `trilha_invalida`, `nivel_invalido`, `nome_invalido`, `negocio_invalido`.

`GET /perfil`: `200` com o mesmo formato do corpo acima. Se o usuário ainda não tem perfil: `404` com `{ "erro": "perfil_nao_encontrado" }`.

## Progresso

`PUT /progresso`

```json
{
  "aulas": { "o1": true, "f1": true },
  "golpe": { "melhor": 7, "total": 8 },
  "baixadas": { "organizar": true }
}
```

Cada parte enviada (`aulas`, `golpe`, `baixadas`) substitui a anterior; parte omitida fica como está. Itens com `false` contam como não marcados. A data de conclusão de uma aula é a do primeiro envio em que ela apareceu.

Regras: id de aula com letras minúsculas e números (até 10); trilhas de `baixadas` iguais às do perfil; `golpe` com `0 <= melhor <= total <= 100`.

Erros (`400`): `aula_invalida`, `trilha_invalida`, `golpe_invalido`.

`GET /progresso`: `200` com o mesmo formato. Sem nada salvo: `{ "aulas": {}, "golpe": { "melhor": 0, "total": 0 }, "baixadas": {} }`.

## Planilhas

`PUT /planilhas/:id`, com `id` igual a `estoque`, `caixa` ou `pedidos`. O corpo traz a lista completa.

```json
{ "linhas": [{ "tipo": "entrou", "descricao": "3 calças", "valor": 50, "data": "08/11/2026" }] }
```

| Planilha | Campos de cada linha |
| --- | --- |
| `estoque` | `peca`, `quantidade`, `data` |
| `caixa` | `tipo` (`entrou` ou `saiu`), `descricao`, `valor`, `data` |
| `pedidos` | `cliente`, `peca`, `quantidade`, `situacao` (`A fazer`, `Pronto`, `Entregue`), `data` |

Respostas de `PUT`: `200` com `{ "ok": true }` ou `204`.

Falta definir em conjunto: rotas `GET` para recuperar os dados ao entrar em outro aparelho.
