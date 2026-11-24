// Endereços usados nas aulas. Se um site mudar, corrija aqui.
const google = 'https://www.google.com/search?hl=pt-BR&q=';
const youtube = 'https://www.youtube.com/results?search_query=';

export const oficial = (rotulo, url, site) => ({ tipo: 'oficial', rotulo, url, site });
export const busca = (texto) => ({ tipo: 'busca', rotulo: texto, url: google + encodeURIComponent(texto) });
export const videosSobre = (texto) => ({ tipo: 'video', rotulo: `Vídeos: ${texto}`, url: youtube + encodeURIComponent(texto) });

export const SITES = {
  portalMei: oficial('Portal do Empreendedor', 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor', 'gov.br'),
  queroSerMei: oficial('Quero ser MEI', 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei', 'gov.br'),
  atividadesMei: oficial('Atividades permitidas no MEI', 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas', 'gov.br'),
  contaGov: oficial('Criar conta gov.br', 'https://www.gov.br/governodigital/pt-br/conta-gov-br', 'gov.br'),
  pgmei: oficial('Gerar a guia DAS do MEI', 'https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao', 'Receita Federal'),
  emissorNfse: oficial('Emissor Nacional de nota de serviço', 'https://www.nfse.gov.br/EmissorNacional', 'nfse.gov.br'),
  manualNfse: oficial('Manual da nota para MEI', 'https://www.gov.br/nfse/ebook-mei-cadastramento-e-emissao-nfs-e.pdf', 'gov.br'),
  febraban: oficial('Golpes e fraudes explicados', 'https://portal.febraban.org.br/AntiFraude', 'Febraban'),
  medPix: oficial('Devolução do Pix em caso de golpe (MED)', 'https://www.bcb.gov.br/meubc/faqs/p/o-que-e-e-como-funciona-o-mecanismo-especial-de-devolucao-med', 'Banco Central'),
};
