// Conteúdo das trilhas. {peca}, {pecas}, {cliente} e {negocio} mudam conforme o perfil de cada pessoa.
// Rascunho da equipe: regras de MEI, nota fiscal e banco precisam de revisão antes do uso real.

import { SITES, busca, oficial, videosSobre } from './links.js';

export const TRILHAS = [
  {
    id: 'organizar', nome: 'Organizar meu negócio', cor: 'organizar', icone: 'organizar',
    resumo: 'Estoque, dinheiro que entra e sai, pedidos e contas.',
    aulas: [
      {
        id: 'o1', saibaMais: [busca('Excel para iniciantes passo a passo'), videosSobre('Excel básico para iniciantes')], titulo: 'Do caderno para a planilha', tempo: 3, nivel: 1, icone: 'planilha',
        passos: [
          { titulo: 'Planilha é um caderno com quadradinhos', texto: 'Cada linha é uma anotação. Cada coluna guarda um tipo de informação: o nome da peça, a quantidade, o valor.' },
          { titulo: 'Veja com as suas peças', texto: 'É assim que {pecas} ficam em uma planilha.', exemplo: { cabecalho: ['Peça', 'Quantidade'], linhas: [['{peca} P', '12'], ['{peca} M', '30'], ['{peca} G', '18']] } },
          { titulo: 'A planilha soma para você', links: [busca('Como fazer soma no Excel')], texto: 'No caderno, você soma na mão. Na planilha, a conta sai sozinha e não erra.', exemplo: { cabecalho: ['Peça', 'Quantidade'], linhas: [['{peca} P', '12'], ['{peca} M', '30'], ['Total', '42']] } },
          { pergunta: 'Na planilha, onde fica o nome de cada peça?', opcoes: [{ t: 'Em uma coluna só para os nomes', certa: true, retorno: 'Isso. Cada coluna guarda um tipo de informação.' }, { t: 'Misturado com os valores', retorno: 'Misturar atrapalha a soma. Cada coluna guarda um tipo de informação.' }] },
        ],
        entrega: { tipo: 'modelo', id: 'estoque', texto: 'Sua planilha de estoque está pronta. Comece anotando as {pecas} de hoje.' },
      },
      {
        id: 'o2', saibaMais: [busca('Como fazer fluxo de caixa simples para pequeno negócio'), videosSobre('fluxo de caixa simples no Excel')], titulo: 'Quanto entrou e quanto saiu', tempo: 3, nivel: 1, icone: 'dinheiro',
        passos: [
          { titulo: 'Anote o dinheiro no mesmo dia', texto: 'Tudo que entra e tudo que sai vai para a mesma lista. Assim você sabe se {negocio} está sobrando ou faltando.' },
          { titulo: 'Exemplo de uma semana', texto: 'Veja como fica uma semana.', exemplo: { cabecalho: ['O quê', 'Valor'], linhas: [['Entrou: 40 {pecas}', 'R$ 800'], ['Saiu: linha e aviamento', 'R$ 150'], ['Sobrou', 'R$ 650']] } },
          { titulo: 'Separe a conta da casa', texto: 'Dinheiro do negócio e dinheiro da casa em lugares diferentes. Misturar esconde se o negócio dá lucro.' },
          { pergunta: 'Comprou linha com o dinheiro das vendas. O que fazer?', opcoes: [{ t: 'Anotar como dinheiro que saiu', certa: true, retorno: 'Certo. Toda saída entra na lista, mesmo as pequenas.' }, { t: 'Não anotar, porque foi pouco', retorno: 'Os gastos pequenos somados pesam no fim do mês. Anote todos.' }] },
        ],
        entrega: { tipo: 'modelo', id: 'caixa', texto: 'Seu controle de caixa está pronto. Toque em Falar e diga: vendi 3 {pecas} por 50 reais.' },
      },
      {
        id: 'o3', saibaMais: [busca('Como organizar pedidos de clientes no WhatsApp Business'), videosSobre('WhatsApp Business organizar pedidos etiquetas')], titulo: 'Nenhum pedido esquecido', tempo: 2, nivel: 2, icone: 'recibo',
        passos: [
          { titulo: 'WhatsApp não é lista de pedidos', texto: 'A conversa com {cliente} sobe e o pedido some. Passe cada pedido para a lista assim que ele chegar.' },
          { titulo: 'O que anotar', texto: 'Quem pediu, qual peça, quantas e em que situação está.', exemplo: { cabecalho: ['Quem', 'Pedido', 'Situação'], linhas: [['Maria', '20 {pecas}', 'A fazer'], ['Josefa', '50 {pecas}', 'Pronto']] } },
          { pergunta: 'Qual informação não pode faltar em um pedido?', opcoes: [{ t: 'Quem pediu e a quantidade', certa: true, retorno: 'Isso. Sem esses dados, o pedido se perde.' }, { t: 'A foto de perfil da pessoa', retorno: 'A foto não ajuda a entregar. Anote quem pediu e quantas peças.' }] },
        ],
        entrega: { tipo: 'modelo', id: 'pedidos', texto: 'Sua lista de pedidos está pronta para usar.' },
      },
      {
        id: 'o4', saibaMais: [busca('Como controlar contas a pagar em pequeno negócio')], titulo: 'Contas a pagar em dia', tempo: 2, nivel: 3, icone: 'relogio',
        passos: [
          { titulo: 'Olhe para a frente', texto: 'Além do que já saiu, anote o que ainda vai sair: fornecedor, energia, aluguel da máquina.' },
          { titulo: 'Toda segunda, cinco minutos', texto: 'Escolha um dia da semana para olhar as contas. Pagar em dia evita juros e mantém seu nome limpo.' },
          { pergunta: 'Qual conta merece atenção primeiro?', opcoes: [{ t: 'A que vence antes', certa: true, retorno: 'Certo. A data de vencimento decide a ordem.' }, { t: 'A de menor valor', retorno: 'O valor pequeno pode esperar menos do que parece. Olhe primeiro o vencimento.' }] },
        ],
        entrega: { tipo: 'modelo', id: 'caixa', texto: 'Anote suas contas no controle de caixa como dinheiro que saiu.' },
      },
    ],
  },
  {
    id: 'formalizar', nome: 'Formalizar', cor: 'formalizar', icone: 'formalizar',
    resumo: 'MEI, CNPJ e nota fiscal, um passo de cada vez.',
    aulas: [
      {
        id: 'f1', saibaMais: [SITES.portalMei, SITES.atividadesMei, busca('Quais os direitos e obrigações do MEI')], titulo: 'O que é MEI', tempo: 3, nivel: 1, icone: 'formalizar',
        passos: [
          { titulo: 'MEI é o jeito simples de ter CNPJ', texto: 'MEI quer dizer Microempreendedor Individual. Com ele, {negocio} passa a existir no papel.' },
          { titulo: 'O que você ganha', texto: 'Pode emitir nota fiscal para {clientes}, ter conta de empresa e contar com benefícios do INSS.' },
          { titulo: 'O que você precisa fazer', links: [SITES.pgmei], texto: 'Abrir o MEI é de graça. Depois, você paga uma guia todo mês, chamada DAS, e faz uma declaração por ano. Existe um limite de faturamento: confira o valor atual no Portal do Empreendedor.' },
          { pergunta: 'Alguém cobrou uma taxa para abrir seu MEI. O que pensar?', opcoes: [{ t: 'Abrir o MEI no portal oficial é de graça', certa: true, retorno: 'Exato. O cadastro no portal oficial não tem custo.' }, { t: 'Toda abertura tem taxa', retorno: 'Não tem. O cadastro no portal oficial é de graça.' }] },
        ],
        entrega: { tipo: 'guia', titulo: 'Tenha em mãos antes de abrir', itens: ['Conta gov.br com senha', 'CPF e número do celular', 'Endereço completo e CEP', 'O que você faz: costura, venda ou os dois'] },
      },
      {
        id: 'f2', saibaMais: [SITES.queroSerMei, busca('Como abrir MEI passo a passo'), videosSobre('como abrir MEI passo a passo gov.br')], titulo: 'Abrir meu CNPJ', tempo: 5, nivel: 2, icone: 'nota',
        passos: [
          { titulo: 'Onde entrar', links: [SITES.portalMei], texto: 'O MEI é aberto no Portal do Empreendedor, dentro do gov.br. É de graça. Desconfie de site que peça pagamento.' },
          { titulo: 'Crie sua conta gov.br', links: [SITES.contaGov, busca('Como aumentar o nível da conta gov.br para prata')], texto: 'Você precisa de uma conta gov.br com nível prata ou ouro. Se já usa o aplicativo do governo, talvez já tenha.' },
          { titulo: 'Toque em Quero ser MEI', links: [SITES.queroSerMei], texto: 'No portal, escolha Quero ser MEI e depois Formalize-se. Entre com o CPF e a senha do gov.br.' },
          { titulo: 'Preencha seus dados', links: [SITES.atividadesMei], texto: 'Informe telefone, endereço e o que você faz. Veja na lista de atividades permitidas qual combina com {negocio}.' },
          { titulo: 'Guarde o certificado', texto: 'No fim, o CNPJ sai na hora, junto com o CCMEI, o certificado do seu MEI. Salve o arquivo no celular.' },
          { pergunta: 'Onde o MEI deve ser aberto?', opcoes: [{ t: 'No portal do governo', certa: true, retorno: 'Certo. Sempre no site oficial.' }, { t: 'Em um link recebido no WhatsApp', retorno: 'Cuidado: link recebido por mensagem pode ser golpe. Use o portal do governo.' }] },
        ],
        entrega: { tipo: 'simulador', rota: '/simulador/mei', botao: 'Treinar abertura do MEI', texto: 'Treine agora, sem risco, todos os passos do cadastro.' },
      },
      {
        id: 'f3', saibaMais: [SITES.emissorNfse, SITES.manualNfse, videosSobre('como emitir nota fiscal de serviço MEI emissor nacional')], titulo: 'Emitir nota fiscal', tempo: 3, nivel: 3, icone: 'recibo',
        passos: [
          { titulo: 'Nota é o comprovante do negócio', texto: 'Ela mostra quem fez, para quem fez, o que foi feito e quanto custou. Muitas empresas só pagam com nota.' },
          { titulo: 'Serviço ou produto', links: [SITES.emissorNfse, busca('Como MEI emite nota fiscal de produto em Pernambuco')], texto: 'Quem costura para outra empresa presta serviço e emite nota de serviço. Quem vende peça usa nota de produto. Na dúvida, fale com um contador.' },
          { titulo: 'Revise antes de emitir', texto: 'Confira nome, CNPJ, descrição e valor de {cliente}. Corrigir depois dá mais trabalho.' },
          { pergunta: 'O que fazer antes de confirmar a nota?', opcoes: [{ t: 'Conferir todos os dados', certa: true, retorno: 'Isso. Uma conferida agora evita retrabalho.' }, { t: 'Confirmar logo e corrigir depois', retorno: 'Corrigir uma nota dá mais trabalho. Confira antes.' }] },
        ],
        entrega: { tipo: 'simulador', rota: '/simulador/nota', botao: 'Treinar emissão de nota', texto: 'Treine emitir uma nota com os seus exemplos.' },
      },
    ],
  },
  {
    id: 'dinheiro', nome: 'Dinheiro on-line', cor: 'dinheiro', icone: 'dinheiro',
    resumo: 'Pix, boletos e banco digital sem medo.',
    aulas: [
      {
        id: 'd1', saibaMais: [SITES.medPix, videosSobre('como fazer Pix pelo celular com segurança')], titulo: 'Pix sem medo', tempo: 2, nivel: 1, icone: 'pix',
        passos: [
          { titulo: 'Pix cai na hora', texto: 'Por isso, confira antes. Depois de enviado, é difícil desfazer.' },
          { titulo: 'Olhe o nome', texto: 'Antes de confirmar, o banco mostra para quem vai o dinheiro. Se o nome não for o de {cliente}, pare.' },
          { pergunta: 'O app mostrou um nome diferente do esperado. E agora?', opcoes: [{ t: 'Cancelar e confirmar a chave com a pessoa', certa: true, retorno: 'Certo. Falar com a pessoa evita o erro.' }, { t: 'Enviar mesmo assim', retorno: 'Pare antes. O nome diferente é o principal sinal de problema.' }] },
        ],
        entrega: { tipo: 'guia', titulo: 'Confira antes de todo Pix', itens: ['A chave veio da própria pessoa', 'O nome na tela é o esperado', 'O valor está certo', 'Guardei o comprovante'] },
      },
      {
        id: 'd2', saibaMais: [busca('Como pagar boleto pelo aplicativo do banco'), videosSobre('como pagar boleto pelo celular')], titulo: 'Pagar boleto pelo celular', tempo: 3, nivel: 1, icone: 'boleto',
        passos: [
          { titulo: 'Abra o app do seu banco', texto: 'Procure a opção Pagar ou Boleto e aponte a câmera para o código de barras.' },
          { titulo: 'Confira quem recebe', texto: 'A tela mostra o nome de quem vai receber e o valor. Compare com o boleto e com o seu fornecedor.' },
          { titulo: 'Guarde o comprovante', texto: 'Salve o comprovante no celular. Ele prova que a conta foi paga.' },
          { pergunta: 'O que olhar antes de confirmar o boleto?', opcoes: [{ t: 'Nome de quem recebe e valor', certa: true, retorno: 'Certo. Esses dois dados revelam boleto falso.' }, { t: 'Só a data de vencimento', retorno: 'A data não basta. Olhe quem recebe e o valor.' }] },
        ],
        entrega: { tipo: 'guia', titulo: 'Confira antes de todo boleto', itens: ['Conheço quem está cobrando', 'O nome na tela é o da empresa', 'O valor é o combinado', 'Salvei o comprovante'] },
      },
      {
        id: 'd3', saibaMais: [busca('Como abrir conta digital para MEI'), videosSobre('como usar banco digital para iniciantes')], titulo: 'Conhecer o banco digital', tempo: 3, nivel: 2, icone: 'banco',
        passos: [
          { titulo: 'Banco que cabe no celular', texto: 'Você abre a conta e faz quase tudo pelo aplicativo, sem ir à agência.' },
          { titulo: 'Baixe só da loja oficial', links: [busca('Como saber se o aplicativo do banco é oficial')], texto: 'Instale pela loja de aplicativos do celular. Nunca por link recebido em mensagem.' },
          { titulo: 'Uma conta para o negócio', texto: 'Com CNPJ, você pode abrir uma conta só para {negocio} e separar do dinheiro da casa.' },
          { pergunta: 'De onde baixar o aplicativo do banco?', opcoes: [{ t: 'Da loja de aplicativos do celular', certa: true, retorno: 'Isso. A loja oficial é o caminho seguro.' }, { t: 'De um link enviado no WhatsApp', retorno: 'Link por mensagem pode instalar aplicativo falso.' }] },
        ],
        entrega: { tipo: 'guia', titulo: 'Para começar no banco digital', itens: ['Baixei da loja oficial', 'Criei uma senha só para o banco', 'Ativei o aviso de movimentação', 'Defini um limite baixo para o Pix'] },
      },
    ],
  },
  {
    id: 'proteger', nome: 'Me proteger', cor: 'proteger', icone: 'proteger',
    resumo: 'Golpes, senhas, links e comprovantes falsos.',
    aulas: [
      {
        id: 'p1', saibaMais: [SITES.febraban, videosSobre('como reconhecer golpes por WhatsApp')], titulo: 'Como o golpe chega', tempo: 3, nivel: 1, icone: 'conversa',
        passos: [
          { titulo: 'Golpe vem com pressa', texto: 'A mensagem diz que é urgente para você não pensar. Pressa é o primeiro sinal.' },
          { titulo: 'Banco não pede senha', links: [SITES.febraban], texto: 'Nenhum banco pede senha, código ou token por mensagem ou ligação.' },
          { titulo: 'Na dúvida, saia da conversa', texto: 'Desligue, abra o aplicativo do banco e procure o atendimento por lá.' },
          { pergunta: 'Pediram seu código de segurança por WhatsApp. O que fazer?', opcoes: [{ t: 'Não enviar e bloquear o contato', certa: true, retorno: 'Certo. Código não se passa para ninguém.' }, { t: 'Enviar, se a pessoa disser que é do banco', retorno: 'Golpistas dizem ser do banco. Não envie.' }] },
        ],
        entrega: { tipo: 'simulador', rota: '/golpe', botao: 'Treinar: é golpe ou não é?', texto: 'Teste seu olho com mensagens falsas e verdadeiras.' },
      },
      {
        id: 'p2', saibaMais: [busca('Como criar senha forte e fácil de lembrar')], titulo: 'Senha forte e fácil de lembrar', tempo: 2, nivel: 1, icone: 'cadeado',
        passos: [
          { titulo: 'Fuja do óbvio', texto: 'Data de nascimento e 123456 são as primeiras tentativas de quem quer invadir.' },
          { titulo: 'Use uma frase', texto: 'Junte palavras que só você conhece, como o nome de uma máquina antiga e uma rua de infância.' },
          { titulo: 'Uma senha para o banco', links: [busca('Como ativar a verificação em duas etapas no WhatsApp')], texto: 'A senha do banco não pode ser igual à de outro aplicativo.' },
          { pergunta: 'Qual senha é melhor?', opcoes: [{ t: 'Uma frase com palavras só suas', certa: true, retorno: 'Isso. Fica longa e fácil de lembrar.' }, { t: 'Sua data de nascimento', retorno: 'Sua data é fácil de descobrir. Use uma frase.' }] },
        ],
        entrega: { tipo: 'guia', titulo: 'Seu celular mais seguro', itens: ['Coloquei senha na tela do celular', 'Troquei senhas óbvias', 'A senha do banco é só do banco', 'Ativei a verificação em duas etapas do WhatsApp'] },
      },
      {
        id: 'p3', saibaMais: [SITES.febraban, SITES.medPix], titulo: 'Link suspeito e comprovante falso', tempo: 3, nivel: 2, icone: 'link',
        passos: [
          { titulo: 'Não toque antes de pensar', texto: 'Link com prêmio, bloqueio de conta ou entrega presa costuma ser armadilha.' },
          { titulo: 'Comprovante não é dinheiro', links: [busca('Como identificar comprovante de Pix falso')], texto: '{cliente} mandou o comprovante? Só entregue as {pecas} depois de ver o valor na sua conta.' },
          { pergunta: 'Chegou comprovante de Pix. Quando entregar o pedido?', opcoes: [{ t: 'Depois de ver o dinheiro na conta', certa: true, retorno: 'Certo. A imagem pode ser falsa; o saldo não.' }, { t: 'Assim que chegar a imagem', retorno: 'Imagem pode ser editada. Confira sua conta.' }] },
        ],
        entrega: { tipo: 'simulador', rota: '/golpe', botao: 'Treinar: é golpe ou não é?', texto: 'Treine com links e comprovantes.' },
      },
    ],
  },
];

export const trilhaPorId = (id) => TRILHAS.find((t) => t.id === id);

export function aulaPorId(id) {
  for (const trilha of TRILHAS) {
    const aula = trilha.aulas.find((a) => a.id === id);
    if (aula) return { aula, trilha };
  }
  return null;
}
