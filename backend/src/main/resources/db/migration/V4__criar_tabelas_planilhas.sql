-- Etapa 4: planilhas de estoque, caixa e pedidos
-- O front sempre manda a lista inteira. "posicao" guarda a ordem das linhas (0 = primeira),
-- porque o front altera e apaga linhas pela posição na lista.
-- A data chega como "24/11/2026" e é guardada como DATE.

CREATE TABLE linha_estoque (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT       NOT NULL,
    posicao    INT          NOT NULL,
    peca       VARCHAR(100) NOT NULL,
    quantidade INT          NOT NULL,
    data       DATE         NOT NULL,
    CONSTRAINT fk_linha_estoque_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT ck_linha_estoque_quantidade CHECK (quantidade >= 0)
);

CREATE TABLE linha_caixa (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT        NOT NULL,
    posicao    INT           NOT NULL,
    tipo       VARCHAR(6)    NOT NULL,
    descricao  VARCHAR(100)  NOT NULL,
    valor      DECIMAL(10,2) NOT NULL,
    data       DATE          NOT NULL,
    CONSTRAINT fk_linha_caixa_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT ck_linha_caixa_tipo CHECK (tipo IN ('entrou', 'saiu')),
    CONSTRAINT ck_linha_caixa_valor CHECK (valor > 0)
);

CREATE TABLE linha_pedido (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT       NOT NULL,
    posicao    INT          NOT NULL,
    cliente    VARCHAR(100) NOT NULL,
    peca       VARCHAR(100) NOT NULL,
    quantidade INT          NOT NULL,
    situacao   VARCHAR(10)  NOT NULL,
    data       DATE         NOT NULL,
    CONSTRAINT fk_linha_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT ck_linha_pedido_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_linha_pedido_situacao CHECK (situacao IN ('A fazer', 'Pronto', 'Entregue'))
);

CREATE INDEX idx_linha_estoque_usuario ON linha_estoque (usuario_id);
CREATE INDEX idx_linha_caixa_usuario ON linha_caixa (usuario_id);
CREATE INDEX idx_linha_pedido_usuario ON linha_pedido (usuario_id);
