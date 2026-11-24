// Chamadas reais. O formato de cada rota está em docs/CONTRATO_API.md.
import { estado } from '../app/estado.js';

export function apiHttp(base) {
  async function chamar(metodo, caminho, corpo) {
    const resposta = await fetch(`${base}${caminho}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(estado.sessao?.token ? { Authorization: `Bearer ${estado.sessao.token}` } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    if (!resposta.ok) throw new Error((await resposta.json().catch(() => ({}))).erro || 'erro_servidor');
    return resposta.status === 204 ? null : resposta.json();
  }

  return {
    pedirCodigo: (telefone) => chamar('POST', '/auth/codigo', { telefone }),
    confirmarCodigo: (telefone, codigo) => chamar('POST', '/auth/confirmar', { telefone, codigo }),
    salvarPerfil: (perfil) => chamar('PUT', '/perfil', perfil),
    salvarProgresso: (progresso) => chamar('PUT', '/progresso', progresso),
    salvarPlanilha: (id, linhas) => chamar('PUT', `/planilhas/${id}`, { linhas }),
  };
}
