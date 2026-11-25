// Estado do app. Fica salvo no aparelho (localStorage) e é enviado à API quando ela existir.
import { api } from '../api/index.js';

const CHAVE = 'arremate:v1';

const inicial = () => ({
  sessao: null,
  perfil: { nome: '', negocio: '', tipo: 'faccao', peca: 'jeans', trilhas: null, diagnosticoFeito: false, niveis: {} },
  preferencias: { escala: 1, velocidade: 1, lerSozinho: false, avisoVozVisto: false },
  progresso: { aulas: {}, golpe: { melhor: 0, total: 0 }, baixadas: {} },
  planilhas: { estoque: [], caixa: [], pedidos: [] },
  videos: {},
});

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo) {
      const base = inicial();
      return {
        ...base,
        ...salvo,
        perfil: { ...base.perfil, ...salvo.perfil },
        preferencias: { ...base.preferencias, ...salvo.preferencias },
        progresso: { ...base.progresso, ...salvo.progresso },
        planilhas: { ...base.planilhas, ...salvo.planilhas },
        videos: { ...salvo.videos },
      };
    }
  } catch { /* aparelho sem armazenamento: segue só na memória */ }
  return inicial();
}

export const estado = carregar();

function guardar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch { /* idem */ }
}

const sincronizar = (promessa) => promessa?.catch?.(() => {});

export function iniciarSessao(sessao) {
  estado.sessao = sessao;
  guardar();
}

// Chamado logo depois de entrar: traz do servidor o que a pessoa já tinha salvo,
// inclusive de outro aparelho. O que vier do servidor vale; o que vier null
// (nada salvo, sem internet ou API simulada) mantém o que está no aparelho.
export async function carregarDados() {
  const buscar = (promessa) => promessa.catch(() => null);
  const [perfil, progresso, estoque, caixa, pedidos] = await Promise.all([
    buscar(api.buscarPerfil()),
    buscar(api.buscarProgresso()),
    buscar(api.buscarPlanilha('estoque')),
    buscar(api.buscarPlanilha('caixa')),
    buscar(api.buscarPlanilha('pedidos')),
  ]);
  const base = inicial();
  if (perfil) estado.perfil = { ...base.perfil, ...perfil };
  if (progresso) estado.progresso = { ...base.progresso, ...progresso };
  if (estoque) estado.planilhas.estoque = estoque;
  if (caixa) estado.planilhas.caixa = caixa;
  if (pedidos) estado.planilhas.pedidos = pedidos;
  guardar();
}

export function atualizarPerfil(dados) {
  Object.assign(estado.perfil, dados);
  guardar();
  sincronizar(api.salvarPerfil(estado.perfil));
}

export function atualizarPreferencias(dados) {
  Object.assign(estado.preferencias, dados);
  guardar();
  aplicarPreferencias();
}

export function concluirAula(id) {
  estado.progresso.aulas[id] = true;
  guardar();
  sincronizar(api.salvarProgresso(estado.progresso));
}

export function registrarGolpe(acertos, total) {
  estado.progresso.golpe.melhor = Math.max(estado.progresso.golpe.melhor, acertos);
  estado.progresso.golpe.total = total;
  guardar();
  sincronizar(api.salvarProgresso(estado.progresso));
}

export function alternarBaixada(trilhaId) {
  estado.progresso.baixadas[trilhaId] = !estado.progresso.baixadas[trilhaId];
  guardar();
  sincronizar(api.salvarProgresso(estado.progresso));
  return estado.progresso.baixadas[trilhaId];
}

export function salvarPlanilha(id, linhas) {
  estado.planilhas[id] = linhas;
  guardar();
  sincronizar(api.salvarPlanilha(id, linhas));
}

export function salvarVideo(aulaId, endereco) {
  if (endereco) estado.videos[aulaId] = endereco; else delete estado.videos[aulaId];
  guardar();
}

// Encerra a sessão no servidor e limpa o aparelho.
// O pedido ao servidor sai com o token antes de ele ser apagado logo abaixo.
export function sair() {
  sincronizar(api.sair());
  limparAparelho();
}

// Só limpa o aparelho. Usado quando o servidor já não reconhece o token.
export function limparAparelho() {
  try { localStorage.removeItem(CHAVE); } catch { /* idem */ }
  Object.assign(estado, inicial());
  aplicarPreferencias();
}

export function aplicarPreferencias() {
  document.documentElement.style.setProperty('--escala', estado.preferencias.escala);
}
