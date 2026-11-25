-- Etapa 7: categoria das linhas do caixa (venda, material, contas...).
-- Opcional: linhas antigas ficam sem categoria e o front mostra "Venda de peças" ou "Outra saída".
-- Os valores aceitos ficam em PlanilhaService.CATEGORIAS_ENTRADA e CATEGORIAS_SAIDA.

ALTER TABLE linha_caixa ADD COLUMN categoria VARCHAR(20);
