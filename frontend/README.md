# Front-end do Arremate

JavaScript puro com módulos ES. O Vite serve o app em desenvolvimento e gera os arquivos finais.

```
src/
  main.js            ponto de entrada
  app/               roteador, estado salvo no aparelho e utilidades
  api/               simulada.js (hoje) e http.js (quando o back existir)
  voz/               reconhecimento, leitura em voz alta e comandos
  personalizacao/    vocabulário por perfil e ordem das trilhas
  dados/             trilhas, aulas, golpes, guias de ajuda e planilhas
  componentes/       etiqueta, passos, campo, ícones
  paginas/           uma função por tela
  estilos/           cores, fontes e componentes do moodboard
  ia/                IA da tela Ajuda (servidor ou simulada), validação e proteção de dados
tests/               testes dos comandos de voz, das finanças e da IA
public/              ícone, manifesto e service worker (uso sem internet)
```

## Comando de voz

O app usa a **Web Speech API**. No Chrome, ela envia o áudio ao serviço de reconhecimento do Google e devolve o texto. Não precisa de chave nem de back-end.

| Arquivo | Função |
| --- | --- |
| `voz/reconhecimento.js` | Liga o microfone em `pt-BR` e trata os erros |
| `voz/comandos.js` | Transforma a frase em ação; é coberto por testes |
| `voz/interface-voz.js` | Folha "Falar", execução dos comandos e anotações |
| `voz/sintese.js` | Botão "Ouvir": lê um trecho por vez, destaca o trecho e a palavra falada e controla pausa, voltar e pular |
| `voz/leitura.js` | Define o que conta como trecho de leitura |

Limites importantes:

- O microfone exige `https://` ou `localhost`. Abrindo o HTML direto do aparelho, o navegador pode bloquear.
- Precisa de internet. Sem ela, o app avisa e continua funcionando por toque.
- Funciona melhor no Chrome e no Edge. No Firefox, o reconhecimento não está disponível.
- Para trocar pelo Google Cloud Speech-to-Text, reescreva apenas `reconhecimento.js`. Essa opção precisa do back-end, para a chave não ficar no navegador.

### Como adicionar um comando

Comando geral: acrescente em `COMANDOS_GERAIS` (`voz/comandos.js`) e trate a ação em `executarGeral` (`voz/interface-voz.js`).

Comando de uma tela: devolva-o no método `voz()` da página.

```js
voz: () => [{ rotulo: 'Continuar', frases: ['continuar', 'proximo'], fazer: avancar }],
```

## Telas do passo a passo

Cada passo das aulas mostra a tela do celular desenhada, com o dedo indicando onde tocar e uma moldura tracejada no que precisa ser conferido. As telas ficam em `src/dados/telas.js`, com a chave `<id da aula>-<número do passo>`:

```js
'd1-2': () => ({
  descricao: 'Tela de confirmação do Pix com o nome de quem vai receber marcado.',
  svg: `${cabecalho('Confirme o Pix')}
    ${texto(30, 178, t('Maria das Graças Silva'), { tam: 13.5, peso: 700 })}
    ${olheAqui(22, 145, 196, 60)}
    ${botao(40, 236, 160, 'Confirmar')}`,
}),
```

As peças (`celular`, `toque`, `olheAqui`, `navegador`, `campo`, `linhaLista`, `bolha`, `documento`, `grade`, `telaDeApps`) ficam em `src/componentes/telas.js` e usam uma área de 240 × 320. A `descricao` é lida por leitores de tela. As telas são genéricas, sem marca de banco ou aplicativo, porque cada celular mostra telas um pouco diferentes. Passo sem tela mostra a tabela de exemplo ou o ícone da aula.

## Finanças e Excel

A aba **Caixa** abre o painel do mês (`paginas/planilhas.js`): quanto entrou, saiu e sobrou, comparação com o mês anterior e para onde foi o dinheiro, por categoria. As contas ficam em `app/financas.js` (com testes) e as categorias em `dados/modelos.js`. Na anotação por voz, a categoria é adivinhada pela descrição ("paguei 40 reais de linha" vai para Tecido e aviamento).

O botão **Baixar planilha** gera um `.xlsx` de verdade (`app/exportar.js`), sem biblioteca: `app/xlsx.js` monta o arquivo e o zip. O arquivo tem as abas Resumo, Caixa, Estoque, Pedidos e Preço da peça, com fórmulas, listas de escolha e cores. Abre no Excel, no Google Planilhas e no LibreOffice.

A calculadora **Preço da peça** fica só no aparelho (`estado.calculos`), não vai para a API.

## Links das aulas

Os endereços ficam em `src/dados/links.js`. Cada passo aceita `links: [...]` e cada aula aceita `saibaMais: [...]`, em `src/dados/trilhas.js`.

## Materiais de gestão

Cursos, cartilhas, planilhas e capacitações grátis (Sebrae, Banco Central, Febraban, gov.br e NTCPE) ficam em `src/dados/materiais.js`. Cada material diz em que trilhas aparece (`trilhas`) e em que assunto da página **Materiais de gestão** entra (`temas`). Eles aparecem no fim de cada trilha, no fim das aulas, no painel do caixa e na calculadora de preço. Os endereços foram conferidos em novembro de 2026; revise antes de cada entrega.

## Personalização

- O diagnóstico inicial define a ordem das trilhas, o nível sugerido e se o app lê as telas sozinho.
- Nas aulas, `{peca}`, `{pecas}`, `{cliente}` e `{negocio}` mudam conforme o perfil (`personalizacao/perfil.js`).
- Em Ajustes, a pessoa muda letra, velocidade da voz e dados do negócio.

## Tela Ajuda com IA

Na aba **Ajuda**, a pessoa escreve ou dita (microfone ao lado do campo) o que aconteceu e toca em **Pedir ajuda**. A resposta vem em passos curtos, um por vez, com **Repetir**, **Próximo** e **Não entendi** (outra explicação para o mesmo passo). Quando ajuda, o passo mostra uma tela desenhada com as peças de `componentes/telas.js`. Os guias prontos continuam embaixo, como **Situações comuns**, e são o plano B quando a IA falha.

| Arquivo | Função |
| --- | --- |
| `ia/index.js` | escolhe a versão da IA; é o único lugar que sabe qual está ativa |
| `ia/servico.js` | o que a tela usa: esconde dados, chama a IA com limite de tempo, valida e aplica a regra do MED |
| `ia/servidor.js` | IA de verdade, pelo back-end (`POST /ajuda/perguntar`) |
| `ia/simulado.js` | IA simulada: respostas fixas para Pix com golpista, boleto estranho, link ou senha e MEI |
| `ia/validacao.js` | confere o JSON da IA antes de mostrar |
| `ia/dadosSensiveis.js` | troca por `••••` CPF, cartão, conta, telefone, senhas e códigos |
| `ia/regras.js` | em golpe com dinheiro já enviado, o primeiro passo é sempre falar com o banco e pedir o MED |
| `ia/ilustracao.js` | confere e desenha as telas dos passos (`apps`, `lista`, `aviso`, `conversa`, `campo`) |

Qual versão é usada:

- Sem `VITE_API_URL` (protótipo e demonstração): a simulada.
- Com `VITE_API_URL`: a do servidor. Se o servidor não tiver a chave `GEMINI_API_KEY`, ele responde `ia_nao_configurada` e o app passa para a simulada sozinho.
- `?simular=normal` no fim do endereço (ex.: `#/ajuda?simular=normal`) força a simulada, como plano B na apresentação. Para mostrar os erros: `?simular=formato`, `?simular=indisponivel`, `?simular=tempo` ou `?simular=lento`.

A chave da IA nunca fica no navegador: quem fala com o Gemini é o back-end. Veja como configurar em [`backend/README.md`](../backend/README.md#ia-da-tela-ajuda).

`npm run prototipo` usa o arquivo `.env.prototipo`, que deixa `VITE_API_URL` vazio: o HTML único sempre abre com a API e a IA simuladas, mesmo que o `.env` aponte para um servidor.

## Ligar ao back-end

Copie `.env.example` para `.env` e preencha `VITE_API_URL`. As telas não mudam: todas usam o objeto `api`, de `src/api/index.js`.
