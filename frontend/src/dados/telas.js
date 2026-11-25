// Tela ilustrada de cada passo das aulas, no lugar dos vídeos.
// A chave é "<id da aula>-<número do passo>" (o primeiro passo é 1). Passos com tabela de
// exemplo e perguntas não precisam de tela. Para criar uma tela nova, monte com as peças
// de componentes/telas.js e escreva em "descricao" o que ela mostra (é o texto lido por
// leitores de tela).
import {
  COR, botao, bolha, cabecalho, campo, celular, documento, grade, linhaLista, navegador,
  olheAqui, selo, telaDeApps, texto, toque, topoConversa,
} from '../componentes/telas.js';
import { t } from '../personalizacao/perfil.js';

const TELAS = {
  // ---------- Organizar ----------
  'o1-1': () => ({
    descricao: 'Planilha no celular com colunas para peça, quantidade e valor.',
    svg: `${cabecalho('Planilha de estoque')}
      ${grade(86, ['Peça', 'Qtd', 'Valor'], [[t('{peca}'), '12', 'R$ 40'], [t('{peca}'), '30', 'R$ 45'], ['', '', ''], ['', '', '']], { colunaDestaque: 0 })}
      ${texto(120, 262, 'Cada coluna guarda uma coisa', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}
      ${olheAqui(19, 101, 72, 136)}`,
  }),
  'o2-1': () => ({
    descricao: 'Tela do caixa com uma entrada de dinheiro, uma saída e o botão Anotar.',
    svg: `${cabecalho('Caixa de hoje')}
      ${linhaLista(80, t('Venda de {pecas}'), { detalhe: 'Entrou', valor: '+ R$ 150', corValor: COR.verde })}
      ${linhaLista(124, 'Linha e aviamento', { detalhe: 'Saiu', valor: '− R$ 40', corValor: COR.vermelho })}
      <rect x="26" y="182" width="188" height="44" rx="10" fill="${COR.verdeClaro}"/>
      ${texto(38, 209, 'Sobrou hoje', { tam: 12, cor: COR.apoio })}
      ${texto(204, 210, 'R$ 110', { tam: 15, peso: 700, cor: COR.verde, ancora: 'end' })}
      ${botao(40, 250, 160, 'Anotar')}
      ${toque(184, 267)}`,
  }),
  'o2-3': () => ({
    descricao: 'Aplicativo do banco com duas contas separadas: a do negócio e a da casa.',
    svg: `${cabecalho('Minhas contas', { voltar: false, cor: COR.indigo, corTexto: '#fff' })}
      <rect x="26" y="88" width="188" height="70" rx="12" fill="#fff" stroke="${COR.indigo}" stroke-width="2"/>
      ${texto(40, 110, 'Conta do negócio', { tam: 12, peso: 700, cor: COR.indigo })}
      ${texto(40, 140, 'R$ 1.250,00', { tam: 17, peso: 700 })}
      <rect x="26" y="170" width="188" height="70" rx="12" fill="#fff" stroke="${COR.linha}" stroke-width="2"/>
      ${texto(40, 192, 'Conta da casa', { tam: 12, peso: 700, cor: COR.apoio })}
      ${texto(40, 222, 'R$ 480,00', { tam: 17, peso: 700 })}
      ${texto(120, 272, 'Uma conta para cada coisa', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'o3-1': () => ({
    descricao: 'Conversa em que a cliente faz um pedido, com o pedido marcado para ir para a lista.',
    svg: `${topoConversa(t('Cliente'), { desconhecido: false })}
      ${bolha(92, ['Bom dia! Tudo bem?'], { largura: 130 })}
      ${bolha(128, [t('Quero 20 {pecas}'), 'para sexta-feira'])}
      ${olheAqui(21, 123, 186, 54)}
      ${bolha(190, ['Combinado!'], { eu: true, largura: 100 })}
      ${botao(40, 250, 160, 'Anotar pedido', { cor: COR.verde })}
      ${toque(184, 267)}`,
  }),
  'o4-1': () => ({
    descricao: 'Lista de contas que ainda vão vencer, com data de cada uma.',
    svg: `${cabecalho('Contas a pagar')}
      ${linhaLista(80, 'Fornecedor de tecido', { detalhe: 'Vence 05/12', valor: 'R$ 600' })}
      ${linhaLista(124, 'Energia', { detalhe: 'Vence 10/12', valor: 'R$ 180' })}
      ${linhaLista(168, 'Aluguel da máquina', { detalhe: 'Vence 15/12', valor: 'R$ 250' })}
      ${olheAqui(46, 84, 100, 128)}
      ${texto(120, 248, 'Olhe primeiro a data', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'o4-2': () => ({
    descricao: 'Calendário da semana com a segunda-feira marcada para olhar as contas.',
    svg: `${cabecalho('Agenda', { voltar: false })}
      ${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => `
        <rect x="${24 + i * 28}" y="96" width="24" height="44" rx="6" fill="${i === 0 ? COR.indigo : '#fff'}" stroke="${COR.linha}"/>
        ${texto(36 + i * 28, 114, d, { tam: 11, peso: 700, cor: i === 0 ? '#fff' : COR.apoio, ancora: 'middle' })}
        ${texto(36 + i * 28, 132, String(2 + i), { tam: 11, cor: i === 0 ? '#fff' : COR.tinta, ancora: 'middle' })}`).join('')}
      <rect x="26" y="162" width="188" height="54" rx="10" fill="#FFF6DC" stroke="${COR.ouro}"/>
      ${texto(38, 184, 'Segunda, 8h', { tam: 11, cor: COR.apoio })}
      ${texto(38, 204, 'Olhar as contas: 5 min', { tam: 12.5, peso: 700 })}`,
  }),

  // ---------- Formalizar ----------
  'f1-1': () => ({
    descricao: 'Certificado do MEI com nome do negócio e número do CNPJ.',
    svg: `${cabecalho('Meu MEI')}
      ${documento(92, 'Certificado do MEI', [['Nome do negócio', t('{negocio}')], ['CNPJ', '00.000.000/0001-00'], ['Situação', 'Ativa']], { selo: true })}`,
  }),
  'f1-2': () => ({
    descricao: 'Lista do que o MEI permite: nota fiscal, conta de empresa e benefícios do INSS.',
    svg: `${cabecalho('Com o MEI você tem')}
      ${['Nota fiscal', 'Conta de empresa', 'Benefícios do INSS'].map((x, i) => `
        <rect x="15" y="${84 + i * 50}" width="210" height="50" fill="#fff"/>
        <line x1="28" y1="${134 + i * 50}" x2="225" y2="${134 + i * 50}" stroke="${COR.linha}"/>
        ${selo(42, 109 + i * 50)}
        ${texto(66, 114 + i * 50, x, { tam: 13, peso: 700 })}`).join('')}`,
  }),
  'f1-3': () => ({
    descricao: 'Guia mensal do MEI, chamada DAS, com a data de vencimento.',
    svg: `${cabecalho('Guia do mês')}
      ${documento(84, 'DAS do MEI', [['Mês', 'Novembro'], ['Vence', 'Dia 20']], { altura: 124 })}
      <g>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => `<rect x="${44 + i * 11}" y="190" width="${i % 3 ? 4 : 7}" height="12" fill="${COR.tinta}"/>`).join('')}</g>
      ${olheAqui(36, 150, 100, 34)}
      ${texto(120, 234, 'Paga todo mês, até o dia 20', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}
      ${botao(40, 252, 160, 'Gerar guia')}`,
  }),
  'f2-1': () => ({
    descricao: 'Navegador aberto no endereço gov.br, com o cadeado de site seguro.',
    svg: `${navegador('gov.br/empreendedor')}
      ${olheAqui(20, 41, 200, 32)}
      ${texto(120, 112, 'Portal do Empreendedor', { tam: 14, peso: 700, cor: COR.indigo, ancora: 'middle' })}
      ${texto(120, 134, 'Abrir o MEI é de graça', { tam: 12, cor: COR.apoio, ancora: 'middle' })}
      ${botao(40, 156, 160, 'Quero ser MEI')}
      ${botao(40, 200, 160, 'Já sou MEI', { contorno: true })}
      ${texto(120, 268, 'Endereço termina em gov.br', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'f2-2': () => ({
    descricao: 'Tela de entrar no gov.br, com campo de CPF e botão Continuar.',
    svg: `${navegador('acesso.gov.br')}
      ${texto(120, 110, 'Entrar com gov.br', { tam: 14, peso: 700, cor: COR.indigo, ancora: 'middle' })}
      ${campo(134, 'Digite seu CPF', '000.000.000-00', { foco: true })}
      ${botao(40, 188, 160, 'Continuar')}
      ${texto(120, 290, 'Conta prata ou ouro', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}
      ${toque(184, 205)}`,
  }),
  'f2-3': () => ({
    descricao: 'Site do Portal do Empreendedor com o botão Quero ser MEI e, em seguida, Formalize-se.',
    svg: `${navegador('gov.br/empreendedor')}
      ${linhaLista(84, 'Quero ser MEI', { destaque: true })}
      ${linhaLista(128, 'Já sou MEI')}
      ${linhaLista(172, 'Cartilhas e cursos')}
      ${botao(40, 236, 160, 'Formalize-se', { cor: COR.verde })}
      ${toque(190, 106)}`,
  }),
  'f2-4': () => ({
    descricao: 'Formulário com telefone, CEP e atividade, com o campo de atividade em foco.',
    svg: `${navegador('gov.br/empreendedor')}
      ${campo(100, 'Telefone', '(81) 90000-0000')}
      ${campo(148, 'CEP', '55000-000')}
      ${campo(196, 'O que você faz', t('Facção de roupas'), { foco: true })}
      ${botao(40, 252, 160, 'Continuar')}
      ${toque(190, 217)}`,
  }),
  'f2-5': () => ({
    descricao: 'Certificado do MEI pronto, com o botão Baixar para salvar no celular.',
    svg: `${cabecalho('Cadastro concluído')}
      ${documento(86, 'Certificado do MEI', [['CNPJ', '00.000.000/0001-00'], ['Abertura', 'Hoje']], { selo: true, altura: 110 })}
      ${botao(40, 214, 160, 'Baixar certificado')}
      ${texto(120, 294, 'Salve no celular', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}
      ${toque(184, 231)}`,
  }),
  'f3-1': () => ({
    descricao: 'Nota fiscal mostrando quem fez, para quem, o que foi feito e o valor.',
    svg: `${cabecalho('Nota fiscal')}
      ${documento(84, 'Nota de serviço', [['Quem fez', t('{negocio}')], ['Para quem', t('Confecção Exemplo')], ['O que foi feito', t('Costura de 50 {pecas}')], ['Valor', 'R$ 350,00']])}`,
  }),
  'f3-2': () => ({
    descricao: 'Duas opções: nota de serviço, para quem costura para empresas, e nota de produto, para quem vende peças.',
    svg: `${cabecalho('Qual nota emitir?')}
      <rect x="26" y="88" width="188" height="76" rx="12" fill="#fff" stroke="${COR.indigo}" stroke-width="2.5"/>
      ${texto(40, 112, 'Nota de serviço', { tam: 13, peso: 700, cor: COR.indigo })}
      ${texto(40, 132, 'Costuro para outra', { tam: 11.5, cor: COR.apoio })}
      ${texto(40, 148, 'empresa (facção)', { tam: 11.5, cor: COR.apoio })}
      <rect x="26" y="176" width="188" height="76" rx="12" fill="#fff" stroke="${COR.linha}" stroke-width="2.5"/>
      ${texto(40, 200, 'Nota de produto', { tam: 13, peso: 700 })}
      ${texto(40, 220, 'Vendo as peças que', { tam: 11.5, cor: COR.apoio })}
      ${texto(40, 236, 'fabrico ou revendo', { tam: 11.5, cor: COR.apoio })}
      ${texto(120, 284, 'Na dúvida, pergunte ao contador', { tam: 11.5, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'f3-3': () => ({
    descricao: 'Tela de revisão da nota com os dados marcados para conferir antes de emitir.',
    svg: `${cabecalho('Revise a nota')}
      ${linhaLista(80, 'Para', { detalhe: t('Confecção Exemplo'), seta: false })}
      ${linhaLista(124, 'CNPJ', { detalhe: '11.111.111/0001-11', seta: false })}
      ${linhaLista(168, 'Valor', { detalhe: 'R$ 350,00', seta: false })}
      ${olheAqui(19, 83, 202, 128)}
      ${botao(40, 238, 160, 'Emitir nota', { cor: COR.verde })}
      ${texto(120, 296, 'Confira antes de tocar', { tam: 11.5, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),

  // ---------- Dinheiro on-line ----------
  'd1-1': () => ({
    descricao: 'Comprovante de Pix enviado, com a hora do envio.',
    svg: `${cabecalho('Pix', { voltar: false })}
      ${selo(120, 122)}
      ${texto(120, 166, 'Pix enviado', { tam: 16, peso: 700, cor: COR.verde, ancora: 'middle' })}
      ${texto(120, 188, 'Agora, às 9:41', { tam: 12, cor: COR.apoio, ancora: 'middle' })}
      ${texto(120, 222, 'R$ 300,00', { tam: 20, peso: 700, ancora: 'middle' })}
      ${texto(120, 270, 'O dinheiro já saiu da conta', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'd1-2': () => ({
    descricao: 'Tela de confirmação do Pix com o nome de quem vai receber marcado para conferir.',
    svg: `${cabecalho('Confirme o Pix')}
      ${texto(30, 102, 'Você vai enviar', { tam: 11, cor: COR.apoio })}
      ${texto(30, 126, 'R$ 300,00', { tam: 20, peso: 700 })}
      ${texto(30, 158, 'Para', { tam: 11, cor: COR.apoio })}
      ${texto(30, 178, t('Maria das Graças Silva'), { tam: 13.5, peso: 700 })}
      ${texto(30, 196, 'Banco Exemplo', { tam: 11, cor: COR.apoio })}
      ${olheAqui(22, 145, 196, 60)}
      ${botao(40, 236, 160, 'Confirmar')}
      ${texto(120, 296, 'Nome errado? Pare aqui.', { tam: 11.5, peso: 700, cor: COR.vermelho, ancora: 'middle' })}`,
  }),
  'd2-1': () => ({
    descricao: 'Tela inicial do celular com o dedo tocando no aplicativo do banco.',
    svg: telaDeApps('banco'),
  }),
  'd2-2': () => ({
    descricao: 'Tela do boleto com o nome de quem recebe e o valor marcados para conferir.',
    svg: `${cabecalho('Pagar boleto')}
      ${texto(30, 102, 'Quem recebe', { tam: 11, cor: COR.apoio })}
      ${texto(30, 122, 'Tecidos Exemplo Ltda', { tam: 13.5, peso: 700 })}
      ${texto(30, 152, 'Valor', { tam: 11, cor: COR.apoio })}
      ${texto(30, 174, 'R$ 600,00', { tam: 17, peso: 700 })}
      ${olheAqui(22, 86, 196, 98)}
      ${texto(30, 208, 'Vencimento: 05/12', { tam: 11.5, cor: COR.apoio })}
      ${botao(40, 236, 160, 'Pagar')}`,
  }),
  'd2-3': () => ({
    descricao: 'Comprovante de pagamento com o botão Salvar comprovante.',
    svg: `${cabecalho('Comprovante', { voltar: false })}
      ${documento(86, 'Pagamento feito', [['Para', 'Tecidos Exemplo Ltda'], ['Valor', 'R$ 600,00']], { selo: true, altura: 110 })}
      ${botao(40, 216, 160, 'Salvar comprovante')}
      ${botao(40, 258, 160, 'Compartilhar', { contorno: true })}
      ${toque(184, 233)}`,
  }),
  'd3-1': () => ({
    descricao: 'Tela inicial de um banco digital com saldo e os botões Pix, Pagar e Extrato.',
    svg: `${cabecalho('Olá!', { voltar: false, cor: COR.indigo, corTexto: '#fff' })}
      <rect x="15" y="74" width="210" height="70" fill="${COR.indigo}"/>
      ${texto(30, 98, 'Saldo', { tam: 11, cor: '#C9D3EA' })}
      ${texto(30, 126, 'R$ 1.250,00', { tam: 20, peso: 700, cor: '#fff' })}
      ${['Pix', 'Pagar', 'Extrato'].map((x, i) => `
        <circle cx="${60 + i * 60}" cy="184" r="22" fill="#fff" stroke="${COR.indigo}" stroke-width="2"/>
        ${texto(60 + i * 60, 189, x[0], { tam: 14, peso: 700, cor: COR.indigo, ancora: 'middle' })}
        ${texto(60 + i * 60, 224, x, { tam: 11, ancora: 'middle' })}`).join('')}
      ${texto(120, 270, 'Tudo pelo celular', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'd3-2': () => ({
    descricao: 'Loja de aplicativos do celular com o aplicativo do banco e o botão Instalar.',
    svg: `${cabecalho('Loja de aplicativos')}
      <rect x="26" y="88" width="56" height="56" rx="14" fill="${COR.indigo}"/>
      <g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M42 112 L54 104 L66 112 Z M46 115 v10 M54 115 v10 M62 115 v10 M41 127 h26"/></g>
      ${texto(94, 108, 'Banco Exemplo', { tam: 13, peso: 700 })}
      ${texto(94, 126, 'Banco Exemplo S.A.', { tam: 10.5, cor: COR.apoio })}
      ${olheAqui(88, 113, 110, 20)}
      ${botao(26, 164, 188, 'Instalar', { cor: COR.verde })}
      ${texto(120, 270, 'Confira o nome de quem fez', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}
      ${toque(192, 181)}`,
  }),
  'd3-3': () => ({
    descricao: 'Abertura de conta com duas opções: conta pessoal, com CPF, e conta do negócio, com CNPJ.',
    svg: `${cabecalho('Abrir conta')}
      ${linhaLista(84, 'Conta pessoal', { detalhe: 'Com CPF' })}
      ${linhaLista(128, 'Conta do negócio', { detalhe: 'Com CNPJ do MEI', destaque: true })}
      ${toque(190, 150)}`,
  }),

  // ---------- Me proteger ----------
  'p1-1': () => ({
    descricao: 'Mensagem de número desconhecido dizendo que é urgente e que a conta será bloqueada.',
    svg: `${topoConversa('+55 11 9xxxx-xxxx')}
      ${bolha(96, ['URGENTE!', 'Sua conta será bloqueada', 'hoje. Responda agora.'])}
      ${olheAqui(21, 91, 186, 66)}
      ${texto(120, 196, 'Pressa é sinal de golpe', { tam: 12.5, peso: 700, cor: COR.vermelho, ancora: 'middle' })}`,
  }),
  'p1-2': () => ({
    descricao: 'Mensagem pedindo o código que chegou por SMS, com sinal de proibido.',
    svg: `${topoConversa('Central do Banco')}
      ${bolha(96, ['Para confirmar, envie o', 'código que chegou', 'por SMS.'])}
      ${selo(200, 98, 'nao')}
      ${texto(120, 196, 'Banco não pede código', { tam: 12.5, peso: 700, cor: COR.vermelho, ancora: 'middle' })}`,
  }),
  'p1-3': () => ({
    descricao: 'Ligação em andamento com o botão vermelho de desligar.',
    svg: `<rect x="15" y="11" width="210" height="298" rx="22" fill="#2A3350"/>
      ${texto(120, 92, 'Central do Banco?', { tam: 15, peso: 700, cor: '#fff', ancora: 'middle' })}
      ${texto(120, 114, 'Em ligação, 00:42', { tam: 11.5, cor: '#C9D3EA', ancora: 'middle' })}
      <circle cx="120" cy="236" r="28" fill="${COR.vermelho}"/>
      <path d="M104 238 q16 -12 32 0 l-4 6 -6 -3 v-5 q-6 -2 -12 0 v5 l-6 3z" fill="#fff"/>
      ${texto(120, 196, 'Desligue', { tam: 12, peso: 700, cor: '#fff', ancora: 'middle' })}
      ${toque(120, 236)}`,
  }),
  'p2-1': () => ({
    descricao: 'Campo de senha preenchido com 123456, marcado como senha fraca.',
    svg: `${cabecalho('Criar senha')}
      ${campo(100, 'Nova senha', '123456')}
      ${selo(196, 121, 'nao')}
      <rect x="26" y="150" width="188" height="8" rx="4" fill="${COR.linha}"/>
      <rect x="26" y="150" width="40" height="8" rx="4" fill="${COR.vermelho}"/>
      ${texto(26, 178, 'Senha fraca', { tam: 12, peso: 700, cor: COR.vermelho })}
      ${texto(120, 232, 'Data e 123456 são fáceis', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'p2-2': () => ({
    descricao: 'Campo de senha com uma frase longa, marcado como senha forte.',
    svg: `${cabecalho('Criar senha')}
      ${campo(100, 'Nova senha', 'Linha+Agulha+Rua7')}
      ${selo(196, 121, 'ok')}
      <rect x="26" y="150" width="188" height="8" rx="4" fill="${COR.verde}"/>
      ${texto(26, 178, 'Senha forte', { tam: 12, peso: 700, cor: COR.verde })}
      ${texto(120, 232, 'Uma frase só sua', { tam: 12, peso: 700, cor: COR.ouroEscuro, ancora: 'middle' })}`,
  }),
  'p2-3': () => ({
    descricao: 'Configuração de verificação em duas etapas ligada.',
    svg: `${cabecalho('Segurança')}
      ${linhaLista(80, 'Senha do banco', { detalhe: 'Só para o banco', seta: false })}
      <rect x="15" y="124" width="210" height="44" fill="#FFF6DC"/>
      ${texto(30, 144, 'Verificação em', { tam: 12.5, peso: 700 })}
      ${texto(30, 159, 'duas etapas', { tam: 12.5, peso: 700 })}
      <rect x="170" y="136" width="40" height="22" rx="11" fill="${COR.verde}"/>
      <circle cx="199" cy="147" r="8" fill="#fff"/>
      ${toque(190, 147)}`,
  }),
  'p3-1': () => ({
    descricao: 'Mensagem com link de prêmio, marcada com sinal de não tocar.',
    svg: `${topoConversa('Promoção')}
      ${bolha(96, ['Você ganhou um prêmio!', 'Toque para receber:', 'premio-gratis.xyz'], { link: 2 })}
      ${selo(170, 140, 'nao')}
      ${texto(120, 196, 'Não toque no link', { tam: 12.5, peso: 700, cor: COR.vermelho, ancora: 'middle' })}`,
  }),
  'p3-2': () => ({
    descricao: 'Extrato do banco com o Pix recebido marcado, para conferir antes de entregar.',
    svg: `${cabecalho('Extrato')}
      ${linhaLista(80, 'Pix recebido', { detalhe: t('Hoje, de {cliente}'), valor: '+ R$ 300', corValor: COR.verde, destaque: true })}
      ${linhaLista(124, 'Energia', { detalhe: 'Ontem', valor: '− R$ 180', corValor: COR.vermelho })}
      ${olheAqui(19, 82, 202, 40)}
      ${texto(120, 210, 'Caiu na conta? Agora entregue.', { tam: 12, peso: 700, cor: COR.verde, ancora: 'middle' })}`,
  }),
};

export function telaDoPasso(aulaId, numero) {
  const criar = TELAS[`${aulaId}-${numero}`];
  if (!criar) return '';
  const { descricao, svg } = criar();
  return celular(descricao, svg);
}

