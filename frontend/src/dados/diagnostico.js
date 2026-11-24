export const PERGUNTAS = [
  { id: 'tipo', titulo: 'Como é o seu trabalho?', perfil: 'tipo', fonte: 'tipos' },
  { id: 'peca', titulo: 'O que você mais faz ou vende?', perfil: 'peca', fonte: 'pecas' },
  {
    id: 'organizar', titulo: 'Onde você anota as vendas?', trilha: 'organizar',
    opcoes: [{ t: 'No caderno ou na cabeça', nota: 2 }, { t: 'No WhatsApp', nota: 2 }, { t: 'Em uma planilha', nota: 0 }],
  },
  {
    id: 'formalizar', titulo: 'Você já tem CNPJ ou MEI?', trilha: 'formalizar',
    opcoes: [{ t: 'Ainda não', nota: 3 }, { t: 'Tenho, mas não emito nota', nota: 1 }, { t: 'Tenho e emito nota', nota: 0 }],
  },
  {
    id: 'dinheiro', titulo: 'Você paga contas pelo celular?', trilha: 'dinheiro',
    opcoes: [{ t: 'Nunca paguei', nota: 2 }, { t: 'Às vezes, com ajuda', nota: 1 }, { t: 'Sim, sozinho', nota: 0 }],
  },
  {
    id: 'proteger', titulo: 'Você sabe reconhecer um golpe por mensagem?', trilha: 'proteger',
    opcoes: [{ t: 'Tenho muito medo de cair', nota: 2 }, { t: 'Às vezes fico na dúvida', nota: 1 }, { t: 'Sei reconhecer', nota: 0 }],
  },
  {
    id: 'ouvir', titulo: 'Como prefere aprender?', preferencia: 'lerSozinho',
    opcoes: [{ t: 'Ouvindo', valor: true }, { t: 'Lendo', valor: false }],
  },
];
