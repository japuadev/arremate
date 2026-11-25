-- Etapa 3: progresso do usuário (aulas feitas, treino de golpes e trilhas guardadas no celular)
-- Tudo ligado ao usuário (e não ao perfil): o progresso existe mesmo antes do diagnóstico.

-- Uma linha por aula concluída. Guarda só o id da aula (o1, f2...); o conteúdo fica no front.
CREATE TABLE aula_concluida (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id   BIGINT      NOT NULL,
    aula_id      VARCHAR(10) NOT NULL,
    concluida_em TIMESTAMP   NOT NULL,
    CONSTRAINT fk_aula_concluida_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT uk_aula_concluida UNIQUE (usuario_id, aula_id)
);

-- Resultado do treino "É golpe?": melhor número de acertos e quantas mensagens o treino tinha.
CREATE TABLE treino_golpe (
    usuario_id    BIGINT    PRIMARY KEY,
    melhor        INT       NOT NULL DEFAULT 0,
    total         INT       NOT NULL DEFAULT 0,
    atualizado_em TIMESTAMP NOT NULL,
    CONSTRAINT fk_treino_golpe_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT ck_treino_golpe CHECK (melhor >= 0 AND total >= 0 AND melhor <= total)
);

-- Trilhas que o usuário guardou no celular para usar sem internet.
CREATE TABLE trilha_baixada (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT      NOT NULL,
    trilha_id  VARCHAR(20) NOT NULL,
    CONSTRAINT fk_trilha_baixada_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT uk_trilha_baixada UNIQUE (usuario_id, trilha_id),
    CONSTRAINT ck_trilha_baixada_id CHECK (trilha_id IN ('organizar', 'formalizar', 'dinheiro', 'proteger'))
);
