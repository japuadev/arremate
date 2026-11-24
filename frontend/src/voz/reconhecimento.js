// Reconhecimento de voz pela Web Speech API. No Chrome, o áudio é processado pelo serviço do Google.
// Para trocar pelo Google Cloud Speech-to-Text no futuro, basta reescrever este arquivo.

const Motor = () => window.SpeechRecognition || window.webkitSpeechRecognition;

export const vozDisponivel = () => Boolean(Motor());

const MENSAGENS = {
  'not-allowed': 'O microfone está bloqueado. Libere o microfone nas permissões do navegador.',
  'service-not-allowed': 'O microfone está bloqueado. Libere o microfone nas permissões do navegador.',
  'audio-capture': 'Não encontrei microfone neste aparelho.',
  'no-speech': 'Não ouvi nada. Toque em Tentar de novo e fale perto do celular.',
  network: 'A voz precisa de internet. Use os botões ou digite o comando.',
  'language-not-supported': 'Este navegador não entende português por voz. Digite o comando.',
};

let atual = null;

export function pararEscuta() {
  try { atual?.abort(); } catch { /* já parado */ }
  atual = null;
}

export function ouvir({ aoParcial, aoFinal, aoErro, aoFim }) {
  pararEscuta();
  if (!vozDisponivel()) {
    aoErro?.('Este navegador não tem reconhecimento de voz. Use o Chrome ou digite o comando.');
    aoFim?.();
    return;
  }
  if (navigator.onLine === false) {
    aoErro?.(MENSAGENS.network);
    aoFim?.();
    return;
  }

  const Reconhecedor = Motor();
  const r = new Reconhecedor();
  r.lang = 'pt-BR';
  r.continuous = false;
  r.interimResults = true;
  r.maxAlternatives = 1;

  r.onresult = (e) => {
    let texto = '';
    let final = false;
    for (let i = e.resultIndex; i < e.results.length; i += 1) {
      texto += e.results[i][0].transcript;
      if (e.results[i].isFinal) final = true;
    }
    if (final) aoFinal?.(texto.trim()); else aoParcial?.(texto.trim());
  };
  r.onerror = (e) => {
    if (e.error !== 'aborted') aoErro?.(MENSAGENS[e.error] || 'Não consegui ouvir. Tente de novo ou digite o comando.');
  };
  r.onend = () => { if (atual === r) atual = null; aoFim?.(); };

  atual = r;
  try { r.start(); } catch { aoErro?.('Não consegui ligar o microfone. Tente de novo.'); }
}
