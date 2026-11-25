-- Etapa 2: perfil do negócio (respostas do diagnóstico e tela de Ajustes)

-- Um perfil por usuário. A chave é o próprio id do usuário.
-- nome e negocio podem ficar vazios: o front salva o perfil a cada resposta do diagnóstico.
CREATE TABLE perfil (
    usuario_id        BIGINT       PRIMARY KEY,
    nome              VARCHAR(100) NOT NULL DEFAULT '',
    negocio           VARCHAR(100) NOT NULL DEFAULT '',
    tipo              VARCHAR(20)  NOT NULL,
    peca              VARCHAR(20)  NOT NULL,
    diagnostico_feito BOOLEAN      NOT NULL DEFAULT FALSE,
    atualizado_em     TIMESTAMP    NOT NULL,
    CONSTRAINT fk_perfil_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT ck_perfil_tipo CHECK (tipo IN ('faccao', 'confeccao', 'vendas')),
    CONSTRAINT ck_perfil_peca CHECK (peca IN ('jeans', 'camisas', 'intima', 'infantil', 'outras'))
);

-- Trilhas do usuário: em que ordem aparecem (resultado do diagnóstico) e o nível em cada uma.
-- Guarda só o id da trilha; o conteúdo das trilhas fica no front.
CREATE TABLE perfil_trilha (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT      NOT NULL,
    trilha_id  VARCHAR(20) NOT NULL,
    ordem      INT,
    nivel      INT,
    CONSTRAINT fk_perfil_trilha_perfil FOREIGN KEY (usuario_id) REFERENCES perfil (usuario_id) ON DELETE CASCADE,
    CONSTRAINT uk_perfil_trilha UNIQUE (usuario_id, trilha_id),
    CONSTRAINT ck_perfil_trilha_id CHECK (trilha_id IN ('organizar', 'formalizar', 'dinheiro', 'proteger')),
    CONSTRAINT ck_perfil_trilha_nivel CHECK (nivel BETWEEN 1 AND 3)
);
