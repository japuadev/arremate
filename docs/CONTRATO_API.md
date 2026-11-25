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
{ "linhas": [{ "tipo": "entrou", "descricao": "3 calças", "valor": 50, "data": "08/11/2026", "categoria": "venda" }] }
```

| Planilha | Campos de cada linha |
| --- | --- |
| `estoque` | `peca`, `quantidade`, `data` |
| `caixa` | `tipo` (`entrou` ou `saiu`), `descricao`, `valor`, `data`, `categoria` (opcional) |
| `pedidos` | `cliente`, `peca`, `quantidade`, `situacao` (`A fazer`, `Pronto`, `Entregue`), `data` |

Respostas de `PUT`: `200` com `{ "ok": true }` ou `204`.

A lista enviada substitui a anterior, na mesma ordem; lista vazia apaga tudo. Regras de cada linha:

- `data` no formato `dd/mm/aaaa` (ex.: `24/11/2026`), data que exista.
- Textos (`peca`, `descricao`, `cliente`) obrigatórios, até 100 letras.
- `quantidade`: inteiro; no estoque pode ser `0`, nos pedidos é no mínimo `1`.
- `valor`: maior que zero, arredondado para centavos.
- `categoria` (caixa, opcional): em entradas, `venda`, `servico` ou `outra-entrada`; em saídas, `material`, `pessoal`, `contas`, `maquina`, `transporte`, `impostos`, `retirada` ou `outra-saida`. Pode faltar ou vir `null`.
- Até 1000 linhas por planilha.

Erros (`400`): `linhas_invalidas`, `linha_invalida`, `planilha_muito_grande`, `peca_invalida`, `descricao_invalida`, `cliente_invalido`, `quantidade_invalida`, `tipo_invalido`, `situacao_invalida`, `valor_invalido`, `data_invalida`, `categoria_invalida`. Outro `id` além dos três: `404` com `{ "erro": "rota_nao_encontrada" }`.

`GET /planilhas/:id`: `200` com `{ "linhas": [...] }` no mesmo formato (lista vazia se não houver nada).

## Ajuda (IA)

A tela Ajuda manda o que a pessoa escreveu ou falou e recebe passos curtos. A chave do Gemini fica só no servidor, na variável de ambiente `GEMINI_API_KEY`. As instruções da IA também ficam no servidor (`InstrucoesAjuda.java`), e o texto da pessoa vai separado delas, entre `<relato>` e `</relato>`. Antes de enviar, o front e o servidor trocam por `••••` números longos (CPF, cartão, conta, telefone, códigos) e valores de senha ou código.

`POST /ajuda/perguntar` (com token)

```json
{ "texto": "Fiz um Pix de 300 reais para um golpista" }
```

Resposta `200`: o JSON da IA como veio. O front valida antes de mostrar (`frontend/src/ia/validacao.js`).

```json
{
  "foraDoEscopo": false,
  "urgente": true,
  "passos": [
    { "texto": "Fale agora com o seu banco e peça o MED: Mecanismo Especial de Devolução.", "tela": { "modelo": "apps", "alvo": "banco" } },
    "Faça o boletim de ocorrência pela delegacia on-line."
  ],
  "dica": "Quanto antes o banco souber, melhor."
}
```

Assunto fora do escopo: `{ "foraDoEscopo": true, "mensagem": "..." }`.

Regras conferidas pelo front: de 1 a 5 passos; cada passo é texto ou `{ texto, tela }`, com até 25 palavras; `urgente` é obrigatório; `dica` é opcional. Uma `tela` fora do combinado é descartada e o passo aparece sem figura. Modelos de `tela`: `apps`, `lista`, `aviso`, `conversa` e `campo` (campos em `frontend/src/ia/ilustracao.js`). Em golpe com dinheiro já enviado, o primeiro passo é sempre falar com o banco e pedir o MED; o front garante isso mesmo se a IA esquecer.

`POST /ajuda/outro-jeito` (com token): botão "Não entendi", outra explicação para o mesmo passo.

```json
{ "texto": "Fiz um Pix de 300 reais para um golpista", "passo": "Peça o MED ao banco." }
```

Resposta `200`: `{ "texto": "O MED é um pedido para o banco tentar pegar o dinheiro de volta..." }`

Erros:

| Status | Código | Quando | O que o front faz |
| --- | --- | --- | --- |
| `400` | `texto_invalido`, `passo_invalido` | texto vazio ou com mais de 1000 letras (passo: 300) | pede para escrever de novo |
| `429` | `limite_pedidos` | mais de 30 pedidos por pessoa na última hora (`arremate.ia.pedidos-por-hora`) | "Muitos pedidos agora" e guias prontos |
| `429` | `ia_limite` | a cota da chave no Google acabou | idem |
| `502` | `ia_indisponivel` | o Google não respondeu ou deu erro | "Tente de novo" e guias prontos |
| `502` | `ia_formato` | a IA não devolveu JSON | mensagem simples e guias prontos |
| `503` | `ia_nao_configurada` | servidor sem `GEMINI_API_KEY` | passa a usar a IA simulada, sem avisar a pessoa |
| `504` | `ia_tempo_esgotado` | o Google passou de 15 segundos | "Demorou demais" e guias prontos |

## Recuperar os dados

Logo depois de `POST /auth/confirmar`, o front chama `GET /perfil`, `GET /progresso` e `GET /planilhas/:id` (as três) e substitui o que estiver no aparelho pelo que vier do servidor. Assim a pessoa encontra os dados em outro aparelho ou depois de sair. Perfil `404` significa usuário novo, que segue para o diagnóstico.

Ao tocar em "Sair", o front chama `POST /auth/sair` e limpa o aparelho. Se qualquer rota responder `401 nao_autenticado`, o front limpa o aparelho e volta para a tela de entrar.

Ficam só no aparelho, sem rota na API: preferências (tamanho da letra, voz) e endereços de vídeo das aulas.
