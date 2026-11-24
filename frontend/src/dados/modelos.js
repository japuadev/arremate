export const MODELOS = {
  estoque: { id: 'estoque', nome: 'Estoque', icone: 'caixa', ajudaVoz: 'tenho 20 {pecas}', descricao: 'Quantas peças você tem agora.', colunas: ['Peça', 'Quantidade', 'Data'] },
  caixa: { id: 'caixa', nome: 'Caixa', icone: 'dinheiro', ajudaVoz: 'vendi 3 {pecas} por 50 reais', descricao: 'O dinheiro que entrou e que saiu.', colunas: ['Tipo', 'Descrição', 'Valor', 'Data'] },
  pedidos: { id: 'pedidos', nome: 'Pedidos', icone: 'recibo', ajudaVoz: 'pedido da Maria 10 {pecas}', descricao: 'Quem pediu, o quê e como está.', colunas: ['Cliente', 'Peça', 'Quantidade', 'Situação', 'Data'] },
};
export const SITUACOES = ['A fazer', 'Pronto', 'Entregue'];
