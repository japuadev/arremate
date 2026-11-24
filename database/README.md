# Banco de dados do Arremate

```
migrations/  scripts de criação e alteração de tabelas, numerados (001_..., 002_...)
seeds/       dados iniciais para testes
modelagem/   diagrama e documentação do modelo
```

## Dados que o front já usa

Ponto de partida, derivado das telas. A modelagem final é da equipe de banco.

| Entidade | Campos |
| --- | --- |
| Usuário | id, telefone (único), criado_em |
| Perfil | usuario_id, nome, negocio, tipo, peca, ordem das trilhas, níveis, diagnostico_feito |
| Aula concluída | usuario_id, aula_id, concluida_em |
| Treino de golpe | usuario_id, melhor_acerto, total |
| Linha de estoque | usuario_id, peca, quantidade, data |
| Linha de caixa | usuario_id, tipo (entrou/saiu), descricao, valor, data |
| Linha de pedido | usuario_id, cliente, peca, quantidade, situacao, data |

As trilhas e as aulas ficam hoje em `frontend/src/dados/`, para funcionarem sem internet. O banco só precisa guardar o `aula_id`.

## Dados pessoais

Telefone, nome e dados do negócio estão protegidos pela LGPD. O áudio da voz não passa pelo nosso back-end e não deve ser guardado.
