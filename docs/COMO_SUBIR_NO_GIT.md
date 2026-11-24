# Como subir o Arremate no GitHub

## 1. Preparar

1. Instale o [Git](https://git-scm.com/downloads) e o [Node.js](https://nodejs.org).
2. Crie uma conta no [GitHub](https://github.com), se ainda não tiver.
3. Descompacte o `arremate.zip` e abra a pasta `arremate` no VS Code.
4. Abra o terminal do VS Code (`Ctrl` + `'`). Na primeira vez, informe seu nome e e-mail:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## 2. Criar o repositório vazio

No GitHub, clique em **New repository**. Use o nome `arremate` e **não marque** README, `.gitignore` nem licença. Clique em **Create repository** e copie o endereço terminado em `.git`.

## 3. Enviar o projeto

Dentro da pasta `arremate`:

```bash
git init -b main
git add .
git commit -m "Estrutura inicial e front-end do Arremate"
git remote add origin https://github.com/SEU-USUARIO/arremate.git
git push -u origin main
```

Se o GitHub pedir login, siga a janela do navegador. Se pedir senha no terminal, use um *personal access token*, criado em Settings > Developer settings.

## 4. Chamar a equipe

No repositório, abra **Settings > Collaborators > Add people** e convide os colegas.

Cada integrante baixa o projeto uma vez:

```bash
git clone https://github.com/SEU-USUARIO/arremate.git
```

## 5. Trabalhar sem atrapalhar os colegas

Nunca programe direto na `main`. Cada tarefa ganha uma branch:

```bash
git checkout main
git pull
git checkout -b back/login-por-celular
```

Exemplos de nome: `front/tela-ajustes`, `back/rotas-progresso`, `banco/tabela-usuarios`.

Quando terminar:

```bash
git add .
git commit -m "Cria rotas de login por celular"
git push -u origin back/login-por-celular
```

No GitHub, clique em **Compare & pull request**. Outro integrante revisa e aprova, e então a branch entra na `main`.

| Quem | Trabalha em |
| --- | --- |
| Front | `frontend/` e `prototipo/` |
| Back | `backend/` |
| Banco | `database/` |

Mudou uma rota ou um campo? Atualize `docs/CONTRATO_API.md` no mesmo pull request.

## 6. Publicar o app com microfone funcionando

O microfone exige um endereço `https://`. O GitHub Pages resolve isso de graça:

1. Abra **Settings > Pages** no repositório.
2. Em **Source**, escolha **GitHub Actions**.
3. Abra a aba **Actions**, escolha **Publicar front** e clique em **Run workflow**.

Depois, o endereço será `https://SEU-USUARIO.github.io/arremate/`. A cada envio para a `main` que altere o front, o site é atualizado sozinho. No plano gratuito, o repositório precisa ser público para usar o Pages.

## Nunca envie

Senhas, tokens, arquivos `.env` e a pasta `node_modules`. O `.gitignore` já bloqueia `.env` e `node_modules`.
