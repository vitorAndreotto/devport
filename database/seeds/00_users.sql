-- =============================================
-- Seed: Usuários de teste — Dev Port
-- Versão: 1.0
-- Senha: teste123
-- =============================================

TRUNCATE TABLE users CASCADE;

INSERT INTO users (id, name, email, password_hash, role, refresh_token) VALUES
  ('2c59149e-d6d9-4a65-8594-5d4870daa92d', 'Dev Test', 'dev@test.com', '$2b$10$q.MSk2tX.BfoaIo2PT5utePYn7hHRYhNAE.JnfkS3nBxsi0YHngb6', 'dev', '$2b$10$NkmDKEy3gXbIAaoWyaAXm.VonRjBh2S4Xjt.N75ZaQFH.bSdKEQJ.');
