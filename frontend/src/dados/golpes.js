// Treino com nomes fictícios. Os links abaixo são só texto: não abrem nada.
export const MENSAGENS = [
  { canal: 'SMS', de: 'Banco Mandacaru', texto: 'Sua conta será BLOQUEADA hoje! Regularize agora: mandacaru-seguro.net/app', golpe: true, sinais: ['Pressa e ameaça', 'Endereço estranho', 'Banco não manda link para resolver bloqueio'] },
  { canal: 'WhatsApp', de: 'Número desconhecido', texto: 'Oi, troquei de número. Tô apertada, faz um Pix de R$ 300 pra mim? Te pago amanhã.', golpe: true, sinais: ['Número novo pedindo dinheiro', 'Ligue para o número antigo antes de qualquer Pix'] },
  { canal: 'WhatsApp', de: 'Dona Josefa (contato salvo)', texto: 'Bom dia! Pode separar 20 peças pra sexta? Pago quando buscar.', golpe: false, sinais: ['Contato conhecido', 'Não pede dinheiro, senha nem link'] },
  { canal: 'E-mail', de: 'Boleto Fácil Cobranças', texto: 'Sua dívida do MEI vence hoje. Pague este boleto em nome de J. Silva Serviços para evitar processo.', golpe: true, sinais: ['Ameaça de processo', 'Boleto em nome de outra pessoa', 'A guia do MEI sai do site oficial'] },
  { canal: 'Aplicativo do banco', de: 'Notificação no app', texto: 'Pix recebido de Ana Lima: R$ 450,00. O valor já está no seu saldo.', golpe: false, sinais: ['Aviso dentro do aplicativo oficial', 'O valor aparece no saldo'] },
  { canal: 'WhatsApp', de: 'Cliente nova', texto: 'Fiz o Pix! Olha o comprovante. Manda o motoboy buscar as 80 peças agora, é urgente.', golpe: true, sinais: ['Comprovante é só imagem', 'Pressa para levar a mercadoria', 'Confira o saldo antes de entregar'] },
  { canal: 'Ligação', de: 'Central de segurança', texto: 'Aqui é do seu banco. Detectamos fraude. Me diga o código que chegou no seu celular para cancelar.', golpe: true, sinais: ['Banco não pede código', 'Desligue e chame o banco pelo aplicativo'] },
  { canal: 'WhatsApp', de: 'Seu fornecedor (contato salvo)', texto: 'Segue o boleto da linha, R$ 180, conforme a nota que entreguei ontem. Vence dia 15.', golpe: false, sinais: ['Compra que você conhece', 'Valor combinado', 'Mesmo assim, confira o nome ao pagar'] },
];
