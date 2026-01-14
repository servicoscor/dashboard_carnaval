/**
 * Script para extrair percursos de um arquivo KMZ único contendo todos os blocos
 *
 * Uso:
 *   node scripts/extrairPercursosKMZ.cjs [caminho-do-kmz]
 *
 * Se nenhum caminho for fornecido, usa o arquivo padrão em public/data/percursos/kmz/
 *
 * O script:
 * 1. Lê o arquivo KMZ
 * 2. Extrai o KML interno
 * 3. Processa cada Placemark com LineString
 * 4. Gera o arquivo percursos-blocos-kmz.json no formato compatível
 */

const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

const DEFAULT_KMZ = path.join(__dirname, '..', 'public', 'data', 'percursos', 'kmz', 'Carnaval 2026 - Blocos.kmz');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'percursos-blocos-kmz.json');

// Normaliza nome para comparação
function normalizarNome(nome) {
  return nome
    .replace(/&amp;/gi, '&')           // Entidade HTML &amp; -> & (ANTES de toUpperCase)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/&/g, 'E')                // & -> E
    .replace(/[.,!?()]/g, '')          // Remove pontuação
    .replace(/-/g, ' ')                // Hífen -> espaço
    .replace(/\s+/g, ' ')              // Múltiplos espaços -> um
    .trim();
}

// Extrai coordenadas de uma string KML
function parseCoordinates(coordString) {
  const coords = [];
  const parts = coordString.trim().split(/\s+/);

  for (const part of parts) {
    if (!part) continue;
    const [lng, lat, alt] = part.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      coords.push({ lat, lng });
    }
  }

  return coords;
}

// Calcula distância entre dois pontos (Haversine)
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calcula distância total de um percurso
function calcularDistanciaTotal(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += calcularDistancia(
      coords[i - 1].lat, coords[i - 1].lng,
      coords[i].lat, coords[i].lng
    );
  }
  return Math.round(total);
}

// Extrai Placemarks com LineString do KML
function extractLineStrings(kml) {
  const results = [];

  // Regex para capturar Placemarks com LineString
  const placemarkRegex = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g;
  let match;

  while ((match = placemarkRegex.exec(kml)) !== null) {
    const content = match[1];

    // Verificar se tem LineString
    if (!content.includes('<LineString>')) continue;

    // Extrair nome
    const nameMatch = content.match(/<name>([^<]+)<\/name>/);
    const name = nameMatch ? nameMatch[1].trim() : 'Sem nome';

    // Extrair descrição (pode conter horários)
    const descMatch = content.match(/<description>([^<]*)<\/description>/);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extrair coordenadas
    const coordsMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
    if (!coordsMatch) continue;

    const coords = parseCoordinates(coordsMatch[1]);
    if (coords.length < 2) continue;

    // Extrair horários da descrição se disponível
    let horaInicio = null;
    let horaFim = null;
    const horaMatch = description.match(/(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})/);
    if (horaMatch) {
      horaInicio = horaMatch[1];
      horaFim = horaMatch[2];
    }

    results.push({
      nomeBloco: name,
      nomeNormalizado: normalizarNome(name),
      percurso: coords,
      distanciaMetros: calcularDistanciaTotal(coords),
      pontosTotal: coords.length,
      horaInicio,
      horaFim,
    });
  }

  return results;
}

// Extrai Placemarks com Point (concentração)
function extractPoints(kml) {
  const results = new Map();

  const placemarkRegex = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g;
  let match;

  while ((match = placemarkRegex.exec(kml)) !== null) {
    const content = match[1];

    // Verificar se tem Point
    if (!content.includes('<Point>')) continue;

    // Extrair nome
    const nameMatch = content.match(/<name>([^<]+)<\/name>/);
    const name = nameMatch ? nameMatch[1].trim() : 'Sem nome';

    // Extrair coordenadas
    const coordsMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
    if (!coordsMatch) continue;

    const coords = parseCoordinates(coordsMatch[1]);
    if (coords.length === 0) continue;

    results.set(normalizarNome(name), coords[0]);
  }

  return results;
}

async function main() {
  const kmzPath = process.argv[2] || DEFAULT_KMZ;

  console.log('='.repeat(60));
  console.log('Extraindo Percursos do KMZ');
  console.log('='.repeat(60));
  console.log(`\nArquivo: ${kmzPath}`);

  // Verificar se o arquivo existe
  if (!fs.existsSync(kmzPath)) {
    console.error(`\nErro: Arquivo não encontrado: ${kmzPath}`);
    process.exit(1);
  }

  // Ler e extrair KMZ
  console.log('\nLendo arquivo KMZ...');
  const data = fs.readFileSync(kmzPath);
  const zip = await JSZip.loadAsync(data);

  // Encontrar o KML
  const kmlFile = Object.keys(zip.files).find(n => n.endsWith('.kml'));
  if (!kmlFile) {
    console.error('\nErro: Arquivo KML não encontrado dentro do KMZ');
    process.exit(1);
  }

  const kml = await zip.file(kmlFile).async('string');
  console.log(`Tamanho do KML: ${(kml.length / 1024).toFixed(1)} KB`);

  // Extrair LineStrings (rotas)
  console.log('\nExtraindo percursos (LineStrings)...');
  const percursos = extractLineStrings(kml);
  console.log(`Percursos encontrados: ${percursos.length}`);

  // Extrair Points (concentração)
  console.log('\nExtraindo pontos de concentração...');
  const pontosConcentracao = extractPoints(kml);
  console.log(`Pontos de concentração: ${pontosConcentracao.size}`);

  // Combinar percursos com pontos de concentração
  for (const percurso of percursos) {
    const ponto = pontosConcentracao.get(percurso.nomeNormalizado);
    if (ponto) {
      percurso.pontoConcentracao = ponto;
    }
  }

  // Estatísticas
  console.log('\n--- Estatísticas ---');
  const distancias = percursos.map(p => p.distanciaMetros);
  const totalPontos = percursos.reduce((sum, p) => sum + p.pontosTotal, 0);

  console.log(`Total de percursos: ${percursos.length}`);
  console.log(`Total de pontos: ${totalPontos}`);
  console.log(`Média de pontos por percurso: ${(totalPontos / percursos.length).toFixed(1)}`);
  console.log(`Distância média: ${(distancias.reduce((a, b) => a + b, 0) / distancias.length / 1000).toFixed(2)} km`);
  console.log(`Maior percurso: ${(Math.max(...distancias) / 1000).toFixed(2)} km`);
  console.log(`Menor percurso: ${(Math.min(...distancias) / 1000).toFixed(2)} km`);

  // Gerar arquivo de saída no formato compatível com o sistema
  const output = percursos.map(p => ({
    nomeBloco: p.nomeBloco,
    bairro: '', // Não disponível no KMZ
    percurso: p.percurso.map((coord, idx) => ({
      lat: coord.lat,
      lng: coord.lng,
      rua: idx === 0 ? 'Início' : (idx === p.percurso.length - 1 ? 'Fim' : undefined),
    })),
    distanciaMetros: p.distanciaMetros,
    pontoConcentracao: p.pontoConcentracao,
    horaInicio: p.horaInicio,
    horaFim: p.horaFim,
    fonte: 'KMZ',
  }));

  // Salvar arquivo
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nArquivo salvo: ${OUTPUT_FILE}`);

  // Listar primeiros 10 blocos
  console.log('\n--- Primeiros 10 blocos ---');
  output.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. ${p.nomeBloco}`);
    console.log(`   Pontos: ${p.percurso.length}, Distância: ${(p.distanciaMetros / 1000).toFixed(2)} km`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('Concluído!');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
