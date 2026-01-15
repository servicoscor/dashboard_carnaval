const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Função de normalização
function normalizarNome(nome) {
  return nome
    .replace(/&amp;/gi, "&")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "E")
    .replace(/[.,!?()]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const EXCEL_PATH = path.join(__dirname, '..', 'public', 'data', 'PLANILHACOMPLETABLOCOS2026.xlsx');
const KMZ_JSON_PATH = path.join(__dirname, '..', 'public', 'data', 'percursos-blocos-kmz.json');

// Carregar Excel
const workbook = xlsx.readFile(EXCEL_PATH);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

// Carregar KMZ JSON
const percursosKMZ = JSON.parse(fs.readFileSync(KMZ_JSON_PATH, "utf-8"));

// Criar mapa de percursos
const mapaPercursos = new Map();
for (const p of percursosKMZ) {
  const nomeNorm = normalizarNome(p.nomeBloco);
  if (p.percurso && p.percurso.length >= 2) {
    mapaPercursos.set(nomeNorm, p.percurso);
  }
}

// Encontrar todos os blocos "TURMA DO GATO"
const blocosGato = data.filter(row => {
  const nome = row["Nome do Bloco"] || "";
  return nome.includes("TURMA DO GATO");
});

console.log("=== BLOCOS 'TURMA DO GATO' NO EXCEL ===");
console.log("Quantidade encontrada:", blocosGato.length);

blocosGato.forEach((blocoExcel, idx) => {
  const nomeBloco = blocoExcel["Nome do Bloco"];
  const nomeNorm = normalizarNome(nomeBloco);
  const formaApresentacao = blocoExcel["Forma de apresentação"] || "";

  console.log(`\n--- Bloco ${idx + 1} ---`);
  console.log("Nome:", nomeBloco);
  console.log("Nome normalizado:", nomeNorm);
  console.log("Forma de apresentação:", formaApresentacao);
  console.log("Bairro:", blocoExcel["Bairro"]);
  console.log("Data:", blocoExcel["Data do Desfile"]);

  console.log("\n-> Busca no mapa de percursos:");
  console.log("   Chave existe?", mapaPercursos.has(nomeNorm));

  const percurso = mapaPercursos.get(nomeNorm);
  if (percurso) {
    console.log("   Tamanho do percurso:", percurso.length);
    console.log("   Primeiro ponto:", JSON.stringify(percurso[0]));
    console.log("   Último ponto:", JSON.stringify(percurso[percurso.length - 1]));
  } else {
    console.log("   PERCURSO NÃO ENCONTRADO!");
  }

  console.log("\n-> Condições do componente:");
  const isComDeslocamento = formaApresentacao.toUpperCase().includes("DESLOCAMENTO");
  console.log("   É COM DESLOCAMENTO?", isComDeslocamento);
  console.log("   Tem percurso?", percurso !== undefined);
  console.log("   Percurso.length >= 2?", percurso ? percurso.length >= 2 : false);
  console.log("   DEVERIA MOSTRAR ROTA?", isComDeslocamento && percurso && percurso.length >= 2);
});
