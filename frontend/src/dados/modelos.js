export const MODELOS = {
  caixa: { id: 'caixa', nome: 'Caixa', icone: 'dinheiro', ajudaVoz: 'vendi 3 {pecas} por 50 reais', descricao: 'O dinheiro que entrou e que saiu.', colunas: ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'] },
  estoque: { id: 'estoque', nome: 'Estoque', icone: 'caixa', ajudaVoz: 'tenho 20 {pecas}', descricao: 'Quantas peças você tem agora.', colunas: ['Peça', 'Quantidade', 'Data'] },
  pedidos: { id: 'pedidos', nome: 'Pedidos', icone: 'recibo', ajudaVoz: 'pedido da Maria 10 {pecas}', descricao: 'Quem pediu, o quê e como está.', colunas: ['Cliente', 'Peça', 'Quantidade', 'Situação', 'Data'] },
};
export const SITUACOES = ['A fazer', 'Pronto', 'Entregue'];

// Categorias do caixa. O id é o que vai para o servidor; o nome aparece na tela e no Excel.
// As palavras servem para adivinhar a categoria de uma anotação feita por voz.
export const CATEGORIAS = {
  entrou: [
    { id: 'venda', nome: 'Venda de peças', palavras: ['venda', 'vendi', 'vendeu', 'feira', 'loja', 'sacoleira', 'freguesa'] },
    { id: 'servico', nome: 'Serviço de costura', palavras: ['costura', 'faccao', 'servico', 'conserto', 'barra', 'ajuste', 'lote'] },
    { id: 'outra-entrada', nome: 'Outra entrada', palavras: [] },
  ],
  saiu: [
    { id: 'material', nome: 'Tecido e aviamento', palavras: ['tecido', 'linha', 'aviamento', 'botao', 'botoes', 'ziper', 'elastico', 'etiqueta', 'malha', 'jeans', 'renda', 'embalagem', 'saco'] },
    { id: 'pessoal', nome: 'Mão de obra', palavras: ['costureira', 'ajudante', 'mao de obra', 'diaria', 'pagamento de', 'funcionaria', 'acabamento', 'travete', 'caseado'] },
    { id: 'contas', nome: 'Energia, água e aluguel', palavras: ['energia', 'luz', 'agua', 'aluguel', 'internet', 'celular', 'telefone', 'gas'] },
    { id: 'maquina', nome: 'Máquina e manutenção', palavras: ['maquina', 'agulha', 'oleo', 'manutencao', 'mecanico', 'peca da maquina', 'motor'] },
    { id: 'transporte', nome: 'Transporte e frete', palavras: ['transporte', 'frete', 'passagem', 'gasolina', 'combustivel', 'moto', 'uber', 'onibus', 'entrega'] },
    { id: 'impostos', nome: 'DAS e impostos', palavras: ['das', 'imposto', 'mei', 'taxa', 'contador', 'contadora'] },
    { id: 'retirada', nome: 'Retirada para casa', palavras: ['casa', 'mercado', 'feira de casa', 'retirada', 'pro labore', 'salario'] },
    { id: 'outra-saida', nome: 'Outra saída', palavras: [] },
  ],
};

const TODAS = [...CATEGORIAS.entrou, ...CATEGORIAS.saiu];
const semAcento = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const nomeCategoria = (id) => TODAS.find((c) => c.id === id)?.nome ?? 'Sem categoria';
export const categoriaValida = (tipo, id) => CATEGORIAS[tipo]?.some((c) => c.id === id) ?? false;

// "paguei 40 reais de linha" → material. Sem pista, cai em "Outra" (saída) ou "Venda" (entrada).
export function categoriaPorDescricao(tipo, descricao) {
  const texto = ` ${semAcento(descricao).replace(/[^a-z0-9 ]/g, ' ')} `;
  const lista = CATEGORIAS[tipo] || [];
  const achou = lista.find((c) => c.palavras.some((p) => texto.includes(` ${p} `)));
  if (achou) return achou.id;
  return tipo === 'entrou' ? 'venda' : 'outra-saida';
}

// Valores iniciais da calculadora de preço (a pessoa troca pelos dela).
export const PRECO_INICIAL = { material: 18, maoDeObra: 6, contasMes: 400, pecasMes: 400, lucro: 30 };
