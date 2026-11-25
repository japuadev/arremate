// Ponto de entrada da IA da Ajuda. É o único lugar que escolhe a versão:
// - servidor (Gemini pelo back-end), quando VITE_API_URL está configurada e o servidor tem
//   a chave GEMINI_API_KEY;
// - simulada, sem VITE_API_URL (protótipo e demonstração), com ?simular= na URL, ou quando o
//   servidor responde que não tem chave (ia_nao_configurada).
// A tela não muda em nenhum caso.
import { api } from '../api/index.js';
import { criarServicoAjuda } from './servico.js';
import { criarIASimulada, lerSimulacao } from './simulado.js';
import { criarIAServidor, SEM_CHAVE } from './servidor.js';

const simulada = criarIASimulada();
const temServidor = Boolean(import.meta.env?.VITE_API_URL) && typeof api.perguntarAjuda === 'function';
let servidorSemChave = false;

// Se o servidor avisar que não tem chave, este e os próximos pedidos vão para a simulação.
function comReserva(servidor) {
  const tentar = (metodo) => async (...args) => {
    if (servidorSemChave) return simulada[metodo](...args);
    try {
      return await servidor[metodo](...args);
    } catch (erro) {
      if (erro?.message !== SEM_CHAVE) throw erro;
      servidorSemChave = true;
      return simulada[metodo](...args);
    }
  };
  return { nome: 'servidor', perguntar: tentar('perguntar'), outroJeito: tentar('outroJeito') };
}

const servidor = temServidor ? comReserva(criarIAServidor(api)) : null;

const escolher = () => (!servidor || lerSimulacao() ? simulada : servidor);

const servico = criarServicoAjuda(escolher);

export function obterServicoIA() {
  return servico;
}
