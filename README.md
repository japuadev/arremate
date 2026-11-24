# Arremate

Aplicativo de letramento digital prático para pequenos empreendedores de confecções do Agreste pernambucano. Projeto Integrador 2026.2, ADS, Faculdade Senac Pernambuco. Tema: Digitalizando o Agreste Têxtil.

Equipe: Fábian Souza, João Apuã de Melo, Luíza Cavalcanti e Vinícius Costa.

## Pastas

| Pasta | O que tem | Quem cuida |
| --- | --- | --- |
| `frontend/` | App em JavaScript, com personalização e comando de voz | Front |
| `backend/` | API do app | Back |
| `database/` | Migrações, dados iniciais e modelagem | Banco |
| `docs/` | Guia do Git e contrato da API | Todos |
| `prototipo/` | Protótipo em um único HTML, para abrir com dois cliques | Gerado pelo front |

## Rodar o front

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173` no Chrome. No protótipo, o código de acesso é `1234`.

Outros comandos, dentro de `frontend/`:

- `npm test`: testa o interpretador de comandos de voz.
- `npm run build`: gera a versão de produção em `dist/`.
- `npm run prototipo`: atualiza `prototipo/arremate-prototipo.html`.

## Para continuar

- [Como subir e trabalhar no Git](docs/COMO_SUBIR_NO_GIT.md)
- [Contrato entre front e back](docs/CONTRATO_API.md)
- [Back-end](backend/README.md)
- [Banco de dados](database/README.md)
- [Organização do front](frontend/README.md)
