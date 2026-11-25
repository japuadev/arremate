# Front-end do Arremate

JavaScript puro com módulos ES. O Vite serve o app em desenvolvimento e gera os arquivos finais.

```
src/
  main.js            ponto de entrada
  app/               roteador, estado salvo no aparelho e utilidades
  api/               simulada.js (hoje) e http.js (quando o back existir)
  voz/               reconhecimento, leitura em voz alta e comandos
  personalizacao/    vocabulário por perfil e ordem das trilhas
  dados/             trilhas, aulas, golpes, socorro e planilhas
  componentes/       etiqueta, passos, campo, ícones
  paginas/           uma função por tela
  estilos/           cores, fontes e componentes do moodboard
tests/               testes dos comandos de voz
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

## Links das aulas

Os endereços ficam em `src/dados/links.js`. Cada passo aceita `links: [...]` e cada aula aceita `saibaMais: [...]`, em `src/dados/trilhas.js`.

## Personalização

- O diagnóstico inicial define a ordem das trilhas, o nível sugerido e se o app lê as telas sozinho.
- Nas aulas, `{peca}`, `{pecas}`, `{cliente}` e `{negocio}` mudam conforme o perfil (`personalizacao/perfil.js`).
- Em Ajustes, a pessoa muda letra, velocidade da voz e dados do negócio.

## Ligar ao back-end

Copie `.env.example` para `.env` e preencha `VITE_API_URL`. As telas não mudam: todas usam o objeto `api`, de `src/api/index.js`.
