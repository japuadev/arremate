// Chamadas reais. O formato de cada rota está em docs/CONTRATO_API.md.
import { estado } from '../app/estado.js';

// Avisado quando o servidor não reconhece mais o token (ex.: sessão encerrada em outro lugar).
// O main.js escuta este evento e manda a pessoa para a tela de entrar.
export const SESSAO_EXPIRADA = 'arremate:sessao-expirada';

export function apiHttp(base) {
  async function chamar(metodo, caminho, corpo, sinal) {
    const resposta = await fetch(`${base}${caminho}`, {
      method: metodo,
      signal: sinal,
      headers: {
        'Content-Type': 'application/json',
        ...(estado.sessao?.token ? { Authorization: `Bearer ${estado.sessao.token}` } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    if (!resposta.ok) {
      const erro = (await resposta.json().catch(() => ({}))).erro || 'erro_servidor';
      if (erro === 'nao_autenticado') window.dispatchEvent(new Event(SESSAO_EXPIRADA));
      throw new Error(erro);
    }
    return resposta.status === 204 ? null : resposta.json();
  }

  return {
    pedirCodigo: (telefone) => chamar('POST', '/auth/codigo', { telefone }),
    confirmarCodigo: (telefone, codigo) => chamar('POST', '/auth/confirmar', { telefone, codigo }),
    sair: () => chamar('POST', '/auth/sair'),
    salvarPerfil: (perfil) => chamar('PUT', '/perfil', perfil),
    salvarProgresso: (progresso) => chamar('PUT', '/progresso', progresso),
    salvarPlanilha: (id, linhas) => chamar('PUT', `/planilhas/${id}`, { linhas }),

    // IA da tela Ajuda. A chave fica no servidor; daqui só sai o texto, já mascarado.
    perguntarAjuda: (texto, sinal) => chamar('POST', '/ajuda/perguntar', { texto }, sinal),
    outroJeitoAjuda: (texto, passo, sinal) => chamar('POST', '/ajuda/outro-jeito', { texto, passo }, sinal),

    // Leitura, usada ao entrar. null = nada salvo no servidor.
    buscarPerfil: () => chamar('GET', '/perfil').catch((e) => {
      if (e.message === 'perfil_nao_encontrado') return null;
      throw e;
    }),
    buscarProgresso: () => chamar('GET', '/progresso'),
    buscarPlanilha: async (id) => (await chamar('GET', `/planilhas/${id}`)).linhas,
  };
}
