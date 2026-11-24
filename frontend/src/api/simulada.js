// Substitui o back-end enquanto ele não existe. O código de acesso do protótipo é 1234.
const espera = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const apiSimulada = {
  async pedirCodigo(telefone) { await espera(); return { telefone, enviado: true }; },
  async confirmarCodigo(telefone, codigo) {
    await espera();
    if (codigo !== '1234') throw new Error('codigo_invalido');
    return { telefone, token: 'token-simulado' };
  },
  async salvarPerfil() { return { ok: true }; },
  async salvarProgresso() { return { ok: true }; },
  async salvarPlanilha() { return { ok: true }; },
};
