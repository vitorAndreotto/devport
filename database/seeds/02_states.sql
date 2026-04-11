-- =============================================
-- Seed: Estados brasileiros — Fonte IBGE
-- Colunas: id (codigo_uf), abbr (uf), name, latitude, longitude, region
-- =============================================

TRUNCATE TABLE states CASCADE;

INSERT INTO states (id, abbr, name, latitude, longitude, region) VALUES
  (11, 'RO', 'Rondônia', -10.830000, -63.340000, 'Norte'),
  (12, 'AC', 'Acre', -8.770000, -70.550000, 'Norte'),
  (13, 'AM', 'Amazonas', -3.470000, -65.100000, 'Norte'),
  (14, 'RR', 'Roraima', 1.990000, -61.330000, 'Norte'),
  (15, 'PA', 'Pará', -3.790000, -52.480000, 'Norte'),
  (16, 'AP', 'Amapá', 1.410000, -51.770000, 'Norte'),
  (17, 'TO', 'Tocantins', -9.460000, -48.260000, 'Norte'),
  (21, 'MA', 'Maranhão', -5.420000, -45.440000, 'Nordeste'),
  (22, 'PI', 'Piauí', -6.600000, -42.280000, 'Nordeste'),
  (23, 'CE', 'Ceará', -5.200000, -39.530000, 'Nordeste'),
  (24, 'RN', 'Rio Grande do Norte', -5.810000, -36.590000, 'Nordeste'),
  (25, 'PB', 'Paraíba', -7.280000, -36.720000, 'Nordeste'),
  (26, 'PE', 'Pernambuco', -8.380000, -37.860000, 'Nordeste'),
  (27, 'AL', 'Alagoas', -9.620000, -36.820000, 'Nordeste'),
  (28, 'SE', 'Sergipe', -10.570000, -37.450000, 'Nordeste'),
  (29, 'BA', 'Bahia', -13.290000, -41.710000, 'Nordeste'),
  (31, 'MG', 'Minas Gerais', -18.100000, -44.380000, 'Sudeste'),
  (32, 'ES', 'Espírito Santo', -19.190000, -40.340000, 'Sudeste'),
  (33, 'RJ', 'Rio de Janeiro', -22.250000, -42.660000, 'Sudeste'),
  (35, 'SP', 'São Paulo', -22.190000, -48.790000, 'Sudeste'),
  (41, 'PR', 'Paraná', -24.890000, -51.550000, 'Sul'),
  (42, 'SC', 'Santa Catarina', -27.450000, -50.950000, 'Sul'),
  (43, 'RS', 'Rio Grande do Sul', -30.170000, -53.500000, 'Sul'),
  (50, 'MS', 'Mato Grosso do Sul', -20.510000, -54.540000, 'Centro-Oeste'),
  (51, 'MT', 'Mato Grosso', -12.640000, -55.420000, 'Centro-Oeste'),
  (52, 'GO', 'Goiás', -15.980000, -49.860000, 'Centro-Oeste'),
  (53, 'DF', 'Distrito Federal', -15.830000, -47.860000, 'Centro-Oeste');
