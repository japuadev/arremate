// Tudo que muda conforme quem está usando: vocabulário das aulas e ordem das trilhas.
import { estado } from '../app/estado.js';

export const TIPOS = [
  { id: 'faccao', nome: 'Costuro para outras confecções (facção)', curto: 'Facção', cliente: 'a confecção que te contrata', clientes: 'as confecções' },
  { id: 'confeccao', nome: 'Tenho confecção com marca própria', curto: 'Confecção', cliente: 'a sacoleira', clientes: 'as sacoleiras' },
  { id: 'vendas', nome: 'Compro e revendo peças', curto: 'Revenda', cliente: 'a freguesa', clientes: 'as freguesas' },
];

export const PECAS = [
  { id: 'jeans', nome: 'Jeans', uma: 'calça jeans', varias: 'calças jeans' },
  { id: 'camisas', nome: 'Camisas e blusas', uma: 'blusa', varias: 'blusas' },
  { id: 'intima', nome: 'Moda íntima', uma: 'conjunto', varias: 'conjuntos' },
  { id: 'infantil', nome: 'Roupa infantil', uma: 'roupinha', varias: 'roupinhas' },
  { id: 'outras', nome: 'Outras peças', uma: 'peça', varias: 'peças' },
];

export const tipoAtual = () => TIPOS.find((t) => t.id === estado.perfil.tipo) || TIPOS[0];
export const pecaAtual = () => PECAS.find((p) => p.id === estado.perfil.peca) || PECAS[4];

export function t(texto) {
  const tipo = tipoAtual();
  const peca = pecaAtual();
  const vars = {
    nome: estado.perfil.nome || 'você',
    negocio: estado.perfil.negocio || 'seu negócio',
    peca: peca.uma,
    pecas: peca.varias,
    cliente: tipo.cliente,
    clientes: tipo.clientes,
  };
  const pronto = String(texto).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  // "{cliente} mandou..." vira "A confecção que te contrata mandou...".
  return /^\{/.test(texto) ? pronto.charAt(0).toUpperCase() + pronto.slice(1) : pronto;
}

// Quanto maior a nota, mais a pessoa precisa daquela trilha. Em empate vale a ordem da lista.
export function ordenarTrilhas(notas) {
  return ['formalizar', 'organizar', 'proteger', 'dinheiro'].sort((a, b) => notas[b] - notas[a]);
}

export function nivelDaNota(nota) {
  if (nota >= 2) return 1;
  if (nota === 1) return 2;
  return 3;
}
