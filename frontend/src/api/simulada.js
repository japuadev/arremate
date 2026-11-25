// Substitui o back-end enquanto ele não existe. O código de acesso do protótipo é 1234.
const espera = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const apiSimulada = {
  async pedirCodigo(telefone) { await espera(); return { telefone, enviado: true }; },
  async confirmarCodigo(telefone, codigo) {
    await espera();
    if (codigo !== '1234') throw new Error('codigo_invalido');
    return { telefone, token: 'token-simulado' };
  },
  async sair() { return null; },
  async salvarPerfil() { return { ok: true }; },
  async salvarProgresso() { return { ok: true }; },
  async salvarPlanilha() { return { ok: true }; },
  // Sem servidor não há nada para recuperar: null mantém o que está no aparelho.
  async buscarPerfil() { return null; },
  async buscarProgresso() { return null; },
  async buscarPlanilha() { return null; },
};
