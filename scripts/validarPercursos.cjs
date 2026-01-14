/**
 * Script para validar correspondência entre blocos do Excel e percursos do KMZ
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '..', 'public', 'data', 'PLANILHACOMPLETABLOCOS2026.xlsx');
const KMZ_JSON_PATH = path.join(__dirname, '..', 'public', 'data', 'percursos-blocos-kmz.json');

// Função de normalização MELHORADA
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

// Carregar Excel
console.log('Carregando Excel...');
const workbook = xlsx.readFile(EXCEL_PATH);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

// Carregar KMZ JSON
console.log('Carregando percursos KMZ...');
const percursosKMZ = JSON.parse(fs.readFileSync(KMZ_JSON_PATH, 'utf-8'));

// Teste de normalização
console.log('\n--- Teste de Normalização ---');
console.log('Excel: "CALA A BOCA & DANÇA" =>', normalizarNome('CALA A BOCA & DANÇA'));
console.log('KMZ:   "CALA A BOCA &amp; DANÇA" =>', normalizarNome('CALA A BOCA &amp; DANÇA'));

// Criar mapa de nomes do Excel (com forma de apresentação)
const blocosExcel = new Map();
for (const row of data) {
  const nome = row['NOME DO BLOCO'] || row['Nome do Bloco'];
  const forma = row['FORMA DE APRESENTAÇÃO'] || row['FORMA DE APRESENTACAO'] || '';
  if (!nome) continue;
  const nomeNorm = normalizarNome(String(nome));
  blocosExcel.set(nomeNorm, {
    nome: String(nome).trim(),
    formaApresentacao: String(forma).trim(),
  });
}

// Criar mapa de nomes do KMZ
const blocosKMZ = new Map();
for (const p of percursosKMZ) {
  const nomeNorm = normalizarNome(p.nomeBloco);
  blocosKMZ.set(nomeNorm, p.nomeBloco);
}

// Analisar correspondências
const comPercurso = [];
const semPercurso = [];
const kmzSemExcel = [];

// Verificar Excel -> KMZ
for (const [nomeNorm, info] of blocosExcel) {
  if (blocosKMZ.has(nomeNorm)) {
    comPercurso.push(info);
  } else {
    semPercurso.push(info);
  }
}

// Verificar KMZ -> Excel
for (const [nomeNorm, nomeOriginal] of blocosKMZ) {
  if (!blocosExcel.has(nomeNorm)) {
    kmzSemExcel.push(nomeOriginal);
  }
}

// Relatório
console.log('\n' + '='.repeat(60));
console.log('RELATÓRIO DE VALIDAÇÃO');
console.log('='.repeat(60));

console.log(`\nTotal de blocos no Excel: ${blocosExcel.size}`);
console.log(`Total de rotas no KMZ: ${blocosKMZ.size}`);
console.log(`Blocos COM percurso KMZ: ${comPercurso.length}`);
console.log(`Blocos SEM percurso KMZ: ${semPercurso.length}`);
console.log(`Rotas KMZ sem bloco no Excel: ${kmzSemExcel.length}`);

// Separar por forma de apresentação
const comDeslocamentoSemPercurso = semPercurso.filter(b =>
  b.formaApresentacao.toUpperCase().includes('DESLOCAMENTO')
);
const paradosSemPercurso = semPercurso.filter(b =>
  b.formaApresentacao.toUpperCase().includes('PARADO')
);

console.log(`\n--- Blocos COM DESLOCAMENTO sem percurso: ${comDeslocamentoSemPercurso.length} ---`);
comDeslocamentoSemPercurso.forEach((b, i) => {
  console.log(`${i + 1}. ${b.nome}`);
});

console.log(`\n--- Blocos PARADOS sem percurso (esperado): ${paradosSemPercurso.length} ---`);

// Mostrar todos os blocos sem percurso (limitado a 30)
console.log(`\n--- Todos os blocos sem percurso (primeiros 30): ---`);
semPercurso.slice(0, 30).forEach((b, i) => {
  console.log(`${i + 1}. ${b.nome} [${b.formaApresentacao || 'N/A'}]`);
});

console.log(`\n--- Rotas KMZ sem correspondência no Excel: ${kmzSemExcel.length} ---`);
kmzSemExcel.forEach((n, i) => {
  console.log(`${i + 1}. ${n}`);
});

// Tentar encontrar correspondências aproximadas
console.log('\n--- Possíveis correspondências (análise de similaridade) ---');
for (const info of comDeslocamentoSemPercurso.slice(0, 10)) {
  const nomeExcel = normalizarNome(info.nome);
  const palavras = nomeExcel.split(' ').filter(p => p.length > 3);

  for (const kmzNome of kmzSemExcel) {
    const nomeKMZ = normalizarNome(kmzNome);
    const match = palavras.some(p => nomeKMZ.includes(p));
    if (match) {
      console.log(`Excel: "${info.nome}" <=> KMZ: "${kmzNome}"`);
    }
  }
}

console.log('\n' + '='.repeat(60));
