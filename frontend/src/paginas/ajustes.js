import { estado, atualizarPerfil, atualizarPreferencias, sair } from '../app/estado.js';
import { campo } from '../componentes/comuns.js';
import { ligarDitado } from '../componentes/ditado.js';
import { TIPOS, PECAS } from '../personalizacao/perfil.js';
import { falar } from '../voz/sintese.js';
import { vozDisponivel } from '../voz/reconhecimento.js';
import { aviso, esc, ir } from '../app/utilidades.js';

const TAMANHOS = [['Normal', 1], ['Grande', 1.2], ['Muito grande', 1.4]];
const VELOCIDADES = [['Devagar', 0.8], ['Normal', 1], ['Rápida', 1.2]];

const grupoBotoes = (nome, itens, atual) => `<div class="filtro-lista" role="group" aria-label="${nome}">${itens.map(([r, v]) => `<button class="filtro-item" data-${nome}="${v}" aria-pressed="${atual === v}">${r}</button>`).join('')}</div>`;

const selecao = (id, rotulo, lista, valor) => `<div class="grupo-campo"><label for="${id}">${rotulo}</label><select class="campo" id="${id}">${lista.map((x) => `<option value="${x.id}" ${x.id === valor ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>`;

export function paginaAjustes(ctx) {
  return {
    titulo: 'Ajustes', voltar: '/inicio',
    view() {
      const p = estado.perfil;
      const q = estado.preferencias;
      return `<h1 tabindex="-1">Ajustes</h1>
      <section class="pilha">
        <h2>Tamanho da letra</h2>${grupoBotoes('escala', TAMANHOS, q.escala)}
      </section>
      <section class="pilha">
        <h2>Voz</h2>
        <p class="rotulo-solto">Velocidade da leitura</p>${grupoBotoes('velocidade', VELOCIDADES, q.velocidade)}
        <label class="alternar"><input type="checkbox" data-sozinho ${q.lerSozinho ? 'checked' : ''}/> <span>Ler cada tela automaticamente</span></label>
        <button class="botao botao-contorno" data-testar>Testar a voz</button>
        <p class="nota-baixa">${vozDisponivel() ? 'Para virar texto, sua voz passa pelo serviço do Google. Não fale senhas nem números de cartão.' : 'Comando de voz indisponível neste navegador. Use o Chrome.'}</p>
      </section>
      <form class="pilha" data-form>
        <h2>Meu negócio</h2>
        ${campo({ id: 'nome', rotulo: 'Seu nome', valor: p.nome, comVoz: true })}
        ${campo({ id: 'negocio', rotulo: 'Nome do negócio', valor: p.negocio, comVoz: true })}
        ${selecao('tipo', 'Como é o seu trabalho', TIPOS, p.tipo)}
        ${selecao('peca', 'O que você mais faz', PECAS, p.peca)}
        <button class="botao botao-principal" type="submit">Salvar mudanças</button>
      </form>
      <section class="pilha">
        <button class="botao botao-contorno" data-refazer>Refazer diagnóstico</button>
        <button class="botao botao-contorno" data-sair>Sair e apagar meus dados</button>
      </section>`;
    },
    montar(raiz) {
      ligarDitado(raiz);
      raiz.querySelectorAll('[data-escala]').forEach((b) => b.addEventListener('click', () => { atualizarPreferencias({ escala: Number(b.dataset.escala) }); ctx.atualizar(); }));
      raiz.querySelectorAll('[data-velocidade]').forEach((b) => b.addEventListener('click', () => { atualizarPreferencias({ velocidade: Number(b.dataset.velocidade) }); ctx.atualizar(); }));
      raiz.querySelector('[data-sozinho]').addEventListener('change', (e) => atualizarPreferencias({ lerSozinho: e.target.checked }));
      raiz.querySelector('[data-testar]').addEventListener('click', () => falar('Esta é a voz do Arremate.'));
      raiz.querySelector('[data-form]').addEventListener('submit', (e) => {
        e.preventDefault();
        atualizarPerfil({
          nome: raiz.querySelector('#nome').value.trim(), negocio: raiz.querySelector('#negocio').value.trim(),
          tipo: raiz.querySelector('#tipo').value, peca: raiz.querySelector('#peca').value,
        });
        aviso('Mudanças salvas.');
      });
      raiz.querySelector('[data-refazer]').addEventListener('click', () => { atualizarPerfil({ diagnosticoFeito: false }); ir('/diagnostico'); });
      raiz.querySelector('[data-sair]').addEventListener('click', () => { sair(); ir('/entrar'); });
    },
  };
}
