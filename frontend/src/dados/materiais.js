// Materiais gratuitos de gestão indicados pelo app: cursos, cartilhas, planilhas e capacitações
// presenciais. Endereços conferidos em novembro de 2026. Se um link mudar, corrija aqui.
//
// "temas" organiza a página Materiais; "trilhas" diz em que trilha o material aparece.
import { SITES } from './links.js';

const sebraeCurso = (caminho) => `https://sebrae.com.br/sites/PortalSebrae/cursosonline/${caminho}`;

export const TEMAS = [
  { id: 'dinheiro', nome: 'Controle do dinheiro', icone: 'dinheiro' },
  { id: 'preco', nome: 'Preço e lucro', icone: 'etiqueta' },
  { id: 'formalizar', nome: 'MEI e formalização', icone: 'formalizar' },
  { id: 'seguranca', nome: 'Segurança', icone: 'proteger' },
  { id: 'agreste', nome: 'Perto de você', icone: 'agulha' },
];

export const TIPOS = {
  curso: { nome: 'Curso on-line', icone: 'play' },
  cartilha: { nome: 'Cartilha', icone: 'nota' },
  planilha: { nome: 'Planilha', icone: 'planilha' },
  plataforma: { nome: 'Site com trilhas', icone: 'celular' },
  presencial: { nome: 'Curso presencial', icone: 'usuario' },
};

export const MATERIAIS = [
  {
    id: 'fluxo-caixa', tipo: 'curso', temas: ['dinheiro'], trilhas: ['organizar'],
    titulo: 'Como controlar o fluxo de caixa', fonte: 'Sebrae', tempo: '10 horas', certificado: true,
    resumo: 'Anotar o que entra e o que sai, prever as contas do mês e não ficar sem dinheiro.',
    url: sebraeCurso('como-controlar-o-fluxo-de-caixa,9ca0225a693a8910VgnVCM1000001b00320aRCRD'),
  },
  {
    id: 'gestao-financeira', tipo: 'curso', temas: ['dinheiro'], trilhas: ['organizar', 'dinheiro'],
    titulo: 'Gestão financeira', fonte: 'Sebrae', tempo: '10 horas', certificado: true,
    resumo: 'Caixa, capital de giro, custos e decisões do dia a dia do negócio.',
    url: sebraeCurso('gestao-financeira,e059d743ad3a8910VgnVCM1000001b00320aRCRD'),
  },
  {
    id: 'preco-venda', tipo: 'curso', temas: ['preco'], trilhas: ['organizar'],
    titulo: 'Como definir o preço de venda', fonte: 'Sebrae', tempo: '6 horas', certificado: true,
    resumo: 'Custos, despesas e margem de lucro para chegar ao preço certo da peça ou do serviço.',
    url: sebraeCurso('como-definir-o-preco-de-venda,73c7225a693a8910VgnVCM1000001b00320aRCRD'),
  },
  {
    id: 'ebook-preco', tipo: 'cartilha', temas: ['preco'], trilhas: ['organizar'],
    titulo: 'Saiba como fazer seu preço de venda', fonte: 'Sebrae', tempo: 'Leitura curta',
    resumo: 'E-book com o passo a passo: apurar custos, somar despesas fixas e definir o lucro.',
    url: 'https://sebrae.com.br/Sebrae/Portal%20Sebrae/Arquivos/ebook_sebrae_saiba_como_fazer_seu_preco_de_venda.pdf',
  },
  {
    id: 'guia-fluxo-pe', tipo: 'cartilha', temas: ['dinheiro'], trilhas: ['organizar'],
    titulo: 'Fluxo de caixa: guia prático', fonte: 'Sebrae Pernambuco', tempo: 'Leitura curta',
    resumo: 'Como registrar as entradas e saídas de dinheiro e conhecer as contas a pagar e a receber.',
    url: 'https://meuatendimento.sebrae.com.br/Sebrae/Portal%20Sebrae/UFs/PE/Anexos/Fluxo_de_caixa.pdf',
  },
  {
    id: 'planilha-fluxo', tipo: 'planilha', temas: ['dinheiro'], trilhas: ['organizar'],
    titulo: 'Planilha de fluxo de caixa', fonte: 'Sebrae Paraná', tempo: 'Para baixar',
    resumo: 'Modelo pronto para quem já anota e quer acompanhar o mês no computador.',
    url: 'https://sebraepr.com.br/planilhas/fluxo-de-caixa/',
  },
  {
    id: 'microcredito', tipo: 'curso', temas: ['dinheiro'], trilhas: ['dinheiro'],
    titulo: 'Microcrédito consciente', fonte: 'Sebrae', tempo: '4 horas', certificado: true,
    resumo: 'Quando vale pegar empréstimo para o negócio e como escolher onde pegar.',
    url: sebraeCurso('microcredito-consciente,c9fcd743ad3a8910VgnVCM1000001b00320aRCRD'),
  },
  {
    id: 'meu-bolso', tipo: 'plataforma', temas: ['dinheiro'], trilhas: ['dinheiro'],
    titulo: 'Meu Bolso em Dia', fonte: 'Febraban e Banco Central', tempo: 'No seu ritmo',
    resumo: 'Faz um diagnóstico do seu dinheiro e monta uma trilha de estudo só para você.',
    url: 'https://plataforma.meubolsoemdia.com.br/',
  },
  {
    id: 'caderno-bc', tipo: 'cartilha', temas: ['dinheiro'], trilhas: ['dinheiro'],
    titulo: 'Caderno de Educação Financeira', fonte: 'Banco Central', tempo: 'Leitura longa',
    resumo: 'Orçamento, dívidas, crédito e poupança, com exemplos do dia a dia.',
    url: 'https://www.bcb.gov.br/pre/pef/port/caderno_cidadania_financeira.pdf',
  },
  {
    id: 'portal-mei', tipo: 'plataforma', temas: ['formalizar'], trilhas: ['formalizar'],
    titulo: 'Portal do Empreendedor', fonte: 'gov.br', tempo: 'Consulta',
    resumo: 'Abrir, manter e emitir a guia do MEI, com cartilhas e respostas oficiais.',
    url: SITES.portalMei.url,
  },
  {
    id: 'manual-nota', tipo: 'cartilha', temas: ['formalizar'], trilhas: ['formalizar'],
    titulo: 'Manual da nota fiscal de serviço do MEI', fonte: 'gov.br', tempo: 'Leitura curta',
    resumo: 'Cadastro no Emissor Nacional e emissão da nota de serviço, passo a passo.',
    url: SITES.manualNfse.url,
  },
  {
    id: 'febraban', tipo: 'plataforma', temas: ['seguranca'], trilhas: ['proteger', 'dinheiro'],
    titulo: 'Golpes e fraudes explicados', fonte: 'Febraban', tempo: 'Consulta',
    resumo: 'Os golpes mais comuns por mensagem, ligação e boleto, e como se proteger.',
    url: SITES.febraban.url,
  },
  {
    id: 'ntcpe', tipo: 'presencial', temas: ['agreste'], trilhas: ['organizar', 'formalizar'],
    titulo: 'Cursos gratuitos do NTCPE', fonte: 'Núcleo Gestor da Cadeia Têxtil e de Confecções em PE', tempo: 'Turmas em várias cidades',
    resumo: 'Costura, modelagem, manutenção de máquinas, redes sociais e gestão, perto do Polo de Confecções.',
    url: 'https://cursos.ntcpe.org.br/',
  },
  {
    id: 'sebrae-cursos', tipo: 'curso', temas: ['agreste', 'dinheiro'], trilhas: [],
    titulo: 'Todos os cursos on-line do Sebrae', fonte: 'Sebrae', tempo: 'Vários tamanhos', certificado: true,
    resumo: 'Centenas de cursos grátis, alguns feitos pelo WhatsApp. Atendimento: 0800 570 0800.',
    url: 'https://www.sebrae.com.br/cursosonline',
  },
];

export const materiaisDaTrilha = (trilhaId) => MATERIAIS.filter((m) => m.trilhas.includes(trilhaId));
export const materiaisDoTema = (temaId) => MATERIAIS.filter((m) => m.temas.includes(temaId));
export const materialPorId = (id) => MATERIAIS.find((m) => m.id === id);
