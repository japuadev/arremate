-- Dados de exemplo para demonstração e testes. NÃO usar em produção.
--
-- É uma migration "repetível" do Flyway (prefixo R__): roda depois das versionadas (V1, V2...)
-- e roda de novo sempre que este arquivo for alterado.
-- Ela apaga e recria só os usuários de exemplo abaixo; os outros usuários não são tocados.
--
-- Para entrar no app com eles, use o telefone e o código 1234:
--   81911111111  Maria  (facção de jeans, diagnóstico feito, com progresso e planilhas preenchidas)
--   81922222222  José   (confecção de camisas, diagnóstico feito, começando agora)

-- Limpa os exemplos anteriores. O ON DELETE CASCADE das tabelas apaga junto
-- sessões, perfil, trilhas, progresso e planilhas desses usuários.
DELETE FROM codigo_acesso WHERE telefone IN ('81911111111', '81922222222');
DELETE FROM usuario WHERE telefone IN ('81911111111', '81922222222');

-- ===================== Maria =====================
INSERT INTO usuario (telefone, criado_em) VALUES ('81911111111', CURRENT_TIMESTAMP);

INSERT INTO perfil (usuario_id, nome, negocio, tipo, peca, diagnostico_feito, atualizado_em)
SELECT id, 'Maria', 'Facção da Maria', 'faccao', 'jeans', TRUE, CURRENT_TIMESTAMP
FROM usuario WHERE telefone = '81911111111';

INSERT INTO perfil_trilha (usuario_id, trilha_id, ordem, nivel)
SELECT id, 'organizar', 0, 1 FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 'proteger', 1, 1 FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 'dinheiro', 2, 2 FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 'formalizar', 3, 3 FROM usuario WHERE telefone = '81911111111';

INSERT INTO aula_concluida (usuario_id, aula_id, concluida_em)
SELECT id, 'o1', TIMESTAMP '2026-11-18 09:30:00' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 'o2', TIMESTAMP '2026-11-19 20:10:00' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 'p1', TIMESTAMP '2026-11-21 14:45:00' FROM usuario WHERE telefone = '81911111111';

INSERT INTO treino_golpe (usuario_id, melhor, total, atualizado_em)
SELECT id, 6, 8, CURRENT_TIMESTAMP FROM usuario WHERE telefone = '81911111111';

INSERT INTO trilha_baixada (usuario_id, trilha_id)
SELECT id, 'organizar' FROM usuario WHERE telefone = '81911111111';

INSERT INTO linha_estoque (usuario_id, posicao, peca, quantidade, data)
SELECT id, 0, 'calça jeans', 40, DATE '2026-11-18' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 1, 'bermuda jeans', 15, DATE '2026-11-18' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 2, 'short jeans', 0, DATE '2026-11-20' FROM usuario WHERE telefone = '81911111111';

INSERT INTO linha_caixa (usuario_id, posicao, tipo, descricao, valor, data)
SELECT id, 0, 'entrou', '10 calças para a loja do Zé', 250.00, DATE '2026-11-18' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 1, 'saiu', 'linha e aviamentos', 38.50, DATE '2026-11-19' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 2, 'entrou', 'costura de 20 bermudas', 180.00, DATE '2026-11-21' FROM usuario WHERE telefone = '81911111111';

INSERT INTO linha_pedido (usuario_id, posicao, cliente, peca, quantidade, situacao, data)
SELECT id, 0, 'Loja Moda Caruaru', 'calça jeans', 30, 'A fazer', DATE '2026-11-22' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 1, 'Dona Josefa', 'bermuda jeans', 12, 'Pronto', DATE '2026-11-20' FROM usuario WHERE telefone = '81911111111' UNION ALL
SELECT id, 2, 'Ana Lima', 'short jeans', 8, 'Entregue', DATE '2026-11-17' FROM usuario WHERE telefone = '81911111111';

-- ===================== José =====================
INSERT INTO usuario (telefone, criado_em) VALUES ('81922222222', CURRENT_TIMESTAMP);

INSERT INTO perfil (usuario_id, nome, negocio, tipo, peca, diagnostico_feito, atualizado_em)
SELECT id, 'José', 'Confecção São José', 'confeccao', 'camisas', TRUE, CURRENT_TIMESTAMP
FROM usuario WHERE telefone = '81922222222';

INSERT INTO perfil_trilha (usuario_id, trilha_id, ordem, nivel)
SELECT id, 'dinheiro', 0, 1 FROM usuario WHERE telefone = '81922222222' UNION ALL
SELECT id, 'formalizar', 1, 1 FROM usuario WHERE telefone = '81922222222' UNION ALL
SELECT id, 'organizar', 2, 2 FROM usuario WHERE telefone = '81922222222' UNION ALL
SELECT id, 'proteger', 3, 3 FROM usuario WHERE telefone = '81922222222';

INSERT INTO aula_concluida (usuario_id, aula_id, concluida_em)
SELECT id, 'd1', TIMESTAMP '2026-11-23 19:00:00' FROM usuario WHERE telefone = '81922222222';

INSERT INTO linha_caixa (usuario_id, posicao, tipo, descricao, valor, data)
SELECT id, 0, 'entrou', 'venda de 15 camisas na feira', 225.00, DATE '2026-11-23' FROM usuario WHERE telefone = '81922222222';
