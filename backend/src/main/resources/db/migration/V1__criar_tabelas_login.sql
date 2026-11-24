-- Etapa 1: login por código enviado ao celular

-- Quem já entrou no app. O telefone é a identificação (sem e-mail e sem senha).
CREATE TABLE usuario (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    telefone  VARCHAR(11) NOT NULL UNIQUE,
    criado_em TIMESTAMP   NOT NULL
);

-- Códigos de 4 números pedidos em POST /auth/codigo.
-- Fica ligado ao telefone (e não ao usuário) porque o usuário só é criado ao confirmar.
CREATE TABLE codigo_acesso (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    telefone  VARCHAR(11) NOT NULL,
    codigo    VARCHAR(4)  NOT NULL,
    expira_em TIMESTAMP   NOT NULL,
    usado     BOOLEAN     NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP   NOT NULL
);

CREATE INDEX idx_codigo_acesso_telefone ON codigo_acesso (telefone);

-- Sessões abertas. O token vai no cabeçalho "Authorization: Bearer <token>".
CREATE TABLE sessao (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT      NOT NULL,
    token      VARCHAR(36) NOT NULL UNIQUE,
    criado_em  TIMESTAMP   NOT NULL,
    CONSTRAINT fk_sessao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
);
