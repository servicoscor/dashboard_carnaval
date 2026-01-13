const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/data/PLANILHACOMPLETABLOCOS2026.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("Colunas disponíveis:");
console.log(Object.keys(data[0]).join('\n'));

console.log("\n\n--- Exemplos de blocos COM DESLOCAMENTO ---\n");

let count = 0;
for (const row of data) {
    const formaEntry = Object.entries(row).find(([k]) => k.toLowerCase().includes('forma'));
    if (formaEntry && String(formaEntry[1]).toUpperCase().includes('DESLOCAMENTO')) {
        const nomeEntry = Object.entries(row).find(([k]) => k.toLowerCase().includes('nome'));
        console.log("\nBloco:", nomeEntry ? nomeEntry[1] : 'N/A');

        // Mostrar todas as colunas que podem ter info de rota
        for (const [key, value] of Object.entries(row)) {
            const k = key.toLowerCase();
            if (k.includes('concentr') || k.includes('dispers') || k.includes('percurso') ||
                k.includes('local') || k.includes('rua') || k.includes('endereco') || k.includes('trajeto')) {
                console.log(`  ${key}: ${String(value).substring(0, 250)}`);
            }
        }
        count++;
        if (count >= 5) break;
    }
}
