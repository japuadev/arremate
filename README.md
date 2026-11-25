# Arremate

Aplicativo de letramento digital prático para pequenos empreendedores de confecções do Agreste pernambucano. Projeto Integrador 2026.2, ADS, Faculdade Senac Pernambuco. Tema: Digitalizando o Agreste Têxtil.

Equipe: Fábian Souza, João Apuã de Melo, Luíza Cavalcanti e Vinícius Costa.

## Pastas

| Pasta | O que tem | Quem cuida |
| --- | --- | --- |
| `frontend/` | App em JavaScript, com personalização e comando de voz | Front |
| `backend/` | API em Java (Spring Boot), com login, perfil, progresso e planilhas | Back |
| `database/` | Modelagem do banco e explicação das migrations e dos dados de exemplo | Banco |
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

## Rodar o back-end

Precisa de um JDK 17 ou mais novo. O Maven vem junto com o projeto.

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080` e cria o banco sozinha. Para o front usar a API em vez dos dados simulados, crie `frontend/.env` (copie de `.env.example`) com `VITE_API_URL=http://localhost:8080` e reinicie o `npm run dev`.

Para entrar, use o código `1234`. Usuários de exemplo com dados prontos: `81911111111` (Maria) e `81922222222` (José).

Detalhes, rotas e problemas comuns: [backend/README.md](backend/README.md).

## Para continuar

- [Como subir e trabalhar no Git](docs/COMO_SUBIR_NO_GIT.md)
- [Contrato entre front e back](docs/CONTRATO_API.md)
- [Back-end](backend/README.md)
- [Banco de dados](database/README.md) e [modelo do banco](database/modelagem/MODELO.md)
- [Organização do front](frontend/README.md)
