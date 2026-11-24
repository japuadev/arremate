import { icone } from '../componentes/icones.js';
import { campo } from '../componentes/comuns.js';
import { ligarDitado } from '../componentes/ditado.js';
import { digitosFalados } from '../voz/comandos.js';
import { esc, ir, soDigitos } from '../app/utilidades.js';
import { iniciarSessao, estado } from '../app/estado.js';
import { api } from '../api/index.js';

let telefoneDigitado = '';

export function paginaEntrar(ctx) {
  let erro = '';
  const pagina = {
    titulo: 'Entrar', semTopo: true, semAbas: true,
    view: () => `
      <section class="abertura jeans">
        <div class="jeans-costura">
          <h1 tabindex="-1" class="marca">Arremate</h1>
          <svg class="fio" viewBox="0 0 300 16" aria-hidden="true" preserveAspectRatio="none"><path d="M2 9 C 60 1, 110 15, 160 8 S 260 3, 298 9"/></svg>
          <p class="abertura-texto">Arremate é o ponto que fecha a costura. Aqui, você fecha o que falta no seu negócio.</p>
        </div>
      </section>
      <form class="pilha" data-form novalidate>
        ${campo({ id: 'telefone', rotulo: 'Seu celular com DDD', valor: telefoneDigitado, tipo: 'tel', modo: 'numeric', erro, comVoz: true, maximo: 15 })}
        <button class="botao botao-principal" type="submit">Receber código</button>
        <p class="nota-baixa">Sem e-mail e sem senha. Mandamos um código para o seu celular.</p>
      </form>`,
    montar(raiz) {
      ligarDitado(raiz, digitosFalados);
      raiz.querySelector('[data-form]').addEventListener('submit', async (e) => {
        e.preventDefault();
        const n = soDigitos(raiz.querySelector('#telefone').value);
        if (n.length < 10 || n.length > 11) {
          const f = 11 - n.length;
          erro = n.length === 0 ? 'Escreva o número do seu celular.' : n.length < 10 ? `Faltam ${f} números. O celular com DDD tem 11.` : 'Tem número a mais. O celular com DDD tem 11.';
          telefoneDigitado = n;
          ctx.atualizar();
          return;
        }
        telefoneDigitado = n;
        await api.pedirCodigo(n);
        ir('/codigo');
      });
    },
    voz: () => [{ rotulo: 'Receber código', frases: ['receber codigo', 'enviar codigo'], fazer: () => document.querySelector('[data-form]').requestSubmit() }],
  };
  return pagina;
}

export function paginaCodigo(ctx) {
  let erro = '';
  return {
    titulo: 'Código', semAbas: true, voltar: '/entrar', semAjustes: true,
    view: () => `
      <h1 tabindex="-1">Digite o código</h1>
      <p class="texto-grande">Enviamos para o número terminado em ${esc(telefoneDigitado.slice(-4))}.</p>
      <p class="faixa-simulacao">${icone('alerta', 24)}<span>No protótipo, o código é 1234.</span></p>
      <form class="pilha" data-form novalidate>
        ${campo({ id: 'codigo', rotulo: 'Código de 4 números', tipo: 'tel', modo: 'numeric', erro, comVoz: true, maximo: 4 })}
        <button class="botao botao-principal" type="submit">Entrar</button>
      </form>`,
    montar(raiz) {
      ligarDitado(raiz, digitosFalados);
      raiz.querySelector('#codigo').focus();
      raiz.querySelector('[data-form]').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = soDigitos(raiz.querySelector('#codigo').value);
        try {
          iniciarSessao(await api.confirmarCodigo(telefoneDigitado, codigo));
          ir(estado.perfil.diagnosticoFeito ? '/inicio' : '/diagnostico');
        } catch {
          erro = 'Código errado. Confira os 4 números e tente de novo.';
          ctx.atualizar();
        }
      });
    },
  };
}
