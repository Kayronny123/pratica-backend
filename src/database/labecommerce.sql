-- Active: 1687904746545@@127.0.0.1@3306
CREATE TABLE users(
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT(DATETIME('now', 'localtime'))
);

INSERT INTO users(id, name, email, password)
VALUES
('u01', 'Rogerio', 'rogerio@email.com', '123456'),
('u001', 'Ayranne', 'ayranne@email.com', '654321');

