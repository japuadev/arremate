// Versão simulada da IA da Ajuda: respostas fixas para 4 problemas comuns, no mesmo JSON
// que o servidor devolve, e que passam pela mesma validação. É usada quando não há chave
// configurada (protótipo, sem internet e demonstração).
//
// Para demonstrar os estados de erro, acrescente à URL, depois da rota:
//   #/ajuda?simular=formato | indisponivel | tempo | lento
// "?simular=normal" força a simulação mesmo com o servidor configurado (plano B da apresentação).
import { normalizar } from '../voz/comandos.js';
import { ErroIA } from './contrato.js';
import { dinheiroJaEnviado } from './regras.js';

const SIMULACOES = ['normal', 'formato', 'indisponivel', 'tempo', 'lento'];

export function lerSimulacao() {
  if (typeof location === 'undefined') return null;
  const consulta = location.hash.split('?')[1] ?? location.search.slice(1);
  const valor = new URLSearchParams(consulta).get('simular');
  return SIMULACOES.includes(valor) ? valor : null;
}

const APP_BANCO = { modelo: 'apps', alvo: 'banco' };

// Cada tema: palavras-chave (sem acento), passos com a explicação do "Não entendi" e a dica.
export const TEMAS = [
  {
    id: 'pix-golpe',
    // Escolhido pela regra dinheiroJaEnviado (regras.js), e não por palavras-chave.
    chaves: [],
    urgente: true,
    passos: [
      { texto: 'Fale agora com o seu banco, pelo aplicativo ou pelo telefone do cartão, e peça o MED: Mecanismo Especial de Devolução.', tela: APP_BANCO, outroJeito: 'O MED é um pedido para o banco tentar pegar o dinheiro de volta. Abra o aplicativo do banco, procure “Ajuda” ou “Atendimento” e diga: “Caí num golpe do Pix, quero o MED”.' },
      { texto: 'No atendimento, toque na opção de contestar ou devolver o Pix.', tela: { modelo: 'lista', titulo: 'Atendimento', itens: ['Contestar Pix', 'Cartões', 'Empréstimos', 'Outros assuntos'], alvo: 0 }, outroJeito: 'Cada banco usa um nome: “Contestar Pix”, “Devolução” ou “Fui vítima de golpe”. Se não achar, fale com a pessoa do atendimento.' },
      { texto: 'Faça o boletim de ocorrência. Em Pernambuco, dá para fazer pela delegacia on-line.', outroJeito: 'O boletim de ocorrência é o registro do golpe na polícia. Pode ser feito pela internet, no site da delegacia on-line, ou numa delegacia perto de você.' },
      { texto: 'Guarde o comprovante do Pix e tire prints da conversa com o golpista.', tela: { modelo: 'conversa', contato: 'Número novo', mensagens: [{ de: 'outro', texto: 'Oi, troquei de número. Faz um Pix pra mim?' }, { de: 'eu', texto: 'Fiz agora.' }] }, outroJeito: 'Print é a foto da tela. Aperte ao mesmo tempo o botão de ligar e o de baixar o volume. A foto vai para a galeria.' },
      { texto: 'Avise seus clientes e contatos que alguém está usando seu nome.', outroJeito: 'Mande uma mensagem no seu status ou nos grupos: “Não peço dinheiro por número novo. Se pedirem, é golpe.”' },
    ],
    dica: 'Quanto antes o banco souber, maior a chance de o dinheiro voltar.',
  },
  {
    id: 'boleto',
    chaves: ['boleto', 'cobranca', 'codigo de barras', 'conta para pagar'],
    urgente: false,
    passos: [
      { texto: 'Não pague ainda. Veja se você conhece quem está cobrando.', outroJeito: 'Pense: você comprou algo dessa empresa? Se não lembra de nada, desconfie.' },
      { texto: 'No aplicativo do banco, leia o código de barras e confira o nome de quem recebe.', tela: { modelo: 'aviso', titulo: 'Pagar boleto', texto: 'Quem recebe: Empresa Exemplo LTDA. Valor: R$ 150,00', botao: 'Conferir' }, outroJeito: 'Antes de confirmar, o aplicativo mostra o nome de quem vai receber. Se o nome for de uma pessoa ou de outra empresa, é golpe.' },
      { texto: 'Ligue para a empresa por um número que você já tem, não o da mensagem.', outroJeito: 'Use o telefone que está no seu contrato, numa nota antiga ou no site oficial. O número da mensagem pode ser do golpista.' },
      { texto: 'Se for falso, apague a mensagem e bloqueie o contato.', outroJeito: 'Na conversa, toque no nome do contato, desça a tela e toque em “Bloquear”.' },
    ],
    dica: 'Boleto falso costuma chegar com pressa e desconto bom demais.',
  },
  {
    id: 'link-senha',
    chaves: ['link', 'cliquei', 'toquei', 'senha', 'codigo', 'whatsapp clonado', 'clonaram', 'hackearam', 'invadiram'],
    urgente: true,
    passos: [
      { texto: 'Feche a página e não digite mais nada nela.', outroJeito: 'Toque no botão de voltar do celular até sair da página. Não preencha nome, CPF nem senha.' },
      { texto: 'Se digitou ou passou alguma senha, troque essa senha agora no aplicativo oficial.', tela: { modelo: 'lista', titulo: 'Segurança', itens: ['Trocar senha', 'Aparelhos', 'Limites'], alvo: 0 }, outroJeito: 'Abra o aplicativo do banco ou do WhatsApp, procure “Segurança” ou “Perfil” e depois “Trocar senha”.' },
      { texto: 'Abra o aplicativo do banco e veja se há movimentação estranha.', tela: APP_BANCO, outroJeito: 'Olhe o extrato, que é a lista do que entrou e saiu. Procure Pix ou compras que você não fez.' },
      { texto: 'Se viu algo estranho, chame o banco pelo aplicativo ou pelo telefone do cartão.', outroJeito: 'O telefone do banco fica atrás do seu cartão. Ligue de outro celular, se puder.' },
    ],
    dica: 'Banco nunca pede senha nem código por mensagem.',
  },
  {
    id: 'mei',
    chaves: ['mei', 'das', 'cnpj', 'divida', 'nota fiscal', 'imposto', 'guia'],
    urgente: false,
    passos: [
      { texto: 'Não pague guia que chegou por mensagem ou e-mail.', outroJeito: 'O governo não manda boleto do MEI por WhatsApp. Guia de verdade você mesma gera no site oficial.' },
      { texto: 'Abra o navegador e entre no Portal do Empreendedor, no gov.br.', tela: { modelo: 'apps', alvo: 'navegador' }, outroJeito: 'No celular, abra a Internet e escreva “portal do empreendedor”. Entre só no endereço que termina em gov.br.' },
      { texto: 'Toque em “Já sou MEI” e depois em pagar contribuição mensal.', tela: { modelo: 'lista', titulo: 'Portal do MEI', itens: ['Quero ser MEI', 'Já sou MEI', 'Serviços'], alvo: 1 }, outroJeito: 'Lá aparece o DAS, a guia mensal do MEI. Digite seu CNPJ só no site oficial.' },
      { texto: 'Veja se há guia em aberto e gere a guia por lá.', outroJeito: 'Se aparecer um mês sem pagar, marque esse mês e toque em gerar guia. Pode pagar pelo Pix do código.' },
    ],
    dica: 'Dúvida sobre MEI? O Sebrae atende de graça: 0800 570 0800.',
  },
];

// Palavras que mostram que o assunto é do negócio ou do celular (escopo da Ajuda).
const ESCOPO = ['pix', 'boleto', 'banco', 'conta', 'cartao', 'golpe', 'golpista', 'senha', 'link', 'codigo', 'mei', 'das', 'cnpj', 'nota', 'fiscal', 'imposto',
  'celular', 'whatsapp', 'zap', 'mensagem', 'aplicativo', 'app', 'internet', 'planilha', 'caixa', 'estoque', 'pedido', 'cliente', 'venda', 'vendi',
  'dinheiro', 'pagamento', 'paguei', 'transferi', 'cobranca', 'comprovante', 'negocio', 'loja', 'fornecedor', 'maquininha', 'emprestimo'];

export const RECUSA = 'Desculpe, com esse assunto o Arremate não consegue ajudar. Posso ajudar com golpes, Pix, boleto, MEI, banco, planilhas e WhatsApp.';
export const PASSOS_GERAIS = [
  { texto: 'Respire. Quem tem pressa é o golpista, não você.', outroJeito: 'Pare um pouco antes de pagar ou clicar em qualquer coisa. Pressa é o sinal mais comum de golpe.' },
  { texto: 'Não passe senha, código ou foto de documento para ninguém.', outroJeito: 'Nem para quem diz ser do banco ou do governo. Eles não pedem isso por mensagem.' },
  { texto: 'Procure o atendimento oficial pelo aplicativo ou pelo telefone que está no cartão.', tela: APP_BANCO, outroJeito: 'Use o aplicativo que você já tem no celular, e não links de mensagens.' },
  { texto: 'Veja também as situações comuns logo abaixo.', outroJeito: 'Embaixo desta tela há guias prontos para boleto, Pix, link e celular perdido.' },
];
export const OUTRO_JEITO_GERAL = 'Peça ajuda a alguém de confiança para fazer junto com você, olhando a mesma tela.';

/** Tema que mais combina com o relato: soma o tamanho das palavras-chave encontradas. */
export function buscarTema(relato) {
  if (dinheiroJaEnviado(relato)) return TEMAS[0];
  const t = ` ${normalizar(relato)} `;
  let melhor = null;
  let pontos = 0;
  for (const tema of TEMAS) {
    const soma = tema.chaves.reduce((s, c) => (t.includes(` ${c} `) ? s + c.length : s), 0);
    if (soma > pontos) { melhor = tema; pontos = soma; }
  }
  return melhor;
}

const dentroDoEscopo = (relato) => ESCOPO.some((p) => ` ${normalizar(relato)} `.includes(` ${p} `));

/** Monta o JSON cru, igual ao do servidor (antes da validação). */
export function responderSimulado(relato) {
  const tema = buscarTema(relato);
  if (tema) return { foraDoEscopo: false, urgente: tema.urgente, passos: tema.passos.map(({ texto, tela }) => (tela ? { texto, tela } : texto)), dica: tema.dica };
  if (dentroDoEscopo(relato)) return { foraDoEscopo: false, urgente: false, passos: PASSOS_GERAIS.map(({ texto, tela }) => (tela ? { texto, tela } : texto)), dica: 'Na dúvida, não pague e não clique.' };
  return { foraDoEscopo: true, mensagem: RECUSA };
}

function esperar(ms, sinal) {
  return new Promise((resolver, rejeitar) => {
    const id = setTimeout(resolver, ms);
    sinal?.addEventListener('abort', () => { clearTimeout(id); rejeitar(new ErroIA('tempo')); });
  });
}

async function simularRede(sinal, { atraso = 900 } = {}) {
  const simulacao = lerSimulacao();
  if (simulacao === 'tempo') await esperar(120000, sinal); // nunca responde: o app desiste no limite de tempo
  if (simulacao === 'indisponivel') { await esperar(600, sinal); throw new ErroIA('indisponivel'); }
  await esperar(simulacao === 'lento' ? 6000 : atraso, sinal);
  return simulacao;
}

export function criarIASimulada({ atraso = 900 } = {}) {
  return {
    nome: 'simulada',
    async perguntar(relato, sinal) {
      const simulacao = await simularRede(sinal, { atraso });
      if (simulacao === 'formato') return { resposta: 'texto solto, fora do formato combinado' };
      return responderSimulado(relato);
    },
    async outroJeito(relato, passo, sinal) {
      await simularRede(sinal, { atraso });
      const todos = [...TEMAS.flatMap((t) => t.passos), ...PASSOS_GERAIS];
      return { texto: todos.find((p) => p.texto === passo)?.outroJeito ?? OUTRO_JEITO_GERAL };
    },
  };
}
