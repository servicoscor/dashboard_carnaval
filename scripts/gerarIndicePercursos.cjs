/**
 * Script para gerar o índice de arquivos KMZ de percursos
 *
 * Uso:
 *   node scripts/gerarIndicePercursos.cjs
 *
 * O script:
 * 1. Lê todos os arquivos .kmz da pasta public/data/percursos/kmz/
 * 2. Tenta extrair o ID e nome do bloco do nome do arquivo
 * 3. Gera o arquivo index.json com a lista de blocos disponíveis
 *
 * Convenção de nomenclatura dos arquivos KMZ:
 *   {id}_{nome-do-bloco}.kmz
 *   Exemplo: 123_bloco-da-laje.kmz
 *
 * Ou simplesmente:
 *   {nome-do-bloco}.kmz (será usado hash do nome como ID)
 */

const fs = require('fs');
const path = require('path');

const KMZ_DIR = path.join(__dirname, '..', 'public', 'data', 'percursos', 'kmz');
const INDEX_FILE = path.join(__dirname, '..', 'public', 'data', 'percursos', 'index.json');

// Função para normalizar nome do arquivo para nome do bloco
function nomeArquivoParaNomeBloco(filename) {
  // Remove extensão
  let nome = filename.replace(/\.kmz$/i, '');

  // Se começa com número seguido de underscore, extrair ID e nome
  const match = nome.match(/^(\d+)_(.+)$/);
  if (match) {
    return {
      id: parseInt(match[1], 10),
      nome: match[2].replace(/-/g, ' ').replace(/_/g, ' ').toUpperCase(),
    };
  }

  // Caso contrário, usar hash do nome como ID
  const hash = nome.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  return {
    id: Math.abs(hash) % 100000,
    nome: nome.replace(/-/g, ' ').replace(/_/g, ' ').toUpperCase(),
  };
}

function main() {
  console.log('='.repeat(60));
  console.log('Gerando índice de percursos KMZ');
  console.log('='.repeat(60));

  // Verificar se o diretório existe
  if (!fs.existsSync(KMZ_DIR)) {
    console.log(`\nCriando diretório: ${KMZ_DIR}`);
    fs.mkdirSync(KMZ_DIR, { recursive: true });
  }

  // Listar arquivos KMZ
  const arquivos = fs.readdirSync(KMZ_DIR)
    .filter(f => f.toLowerCase().endsWith('.kmz'))
    .sort();

  console.log(`\nArquivos KMZ encontrados: ${arquivos.length}`);

  if (arquivos.length === 0) {
    console.log('\nNenhum arquivo KMZ encontrado na pasta.');
    console.log(`Adicione arquivos .kmz em: ${KMZ_DIR}`);
    console.log('\nConvenção de nomenclatura:');
    console.log('  {id}_{nome-do-bloco}.kmz');
    console.log('  Exemplo: 123_bloco-da-laje.kmz');
  }

  // Processar arquivos
  const blocos = arquivos.map(arquivo => {
    const { id, nome } = nomeArquivoParaNomeBloco(arquivo);
    console.log(`  - ${arquivo} => ID: ${id}, Nome: ${nome}`);
    return {
      id,
      nome,
      arquivo,
    };
  });

  // Gerar índice
  const indice = {
    blocos,
    ultimaAtualizacao: new Date().toISOString(),
    descricao: 'Índice de arquivos KMZ de percursos dos blocos de carnaval.',
  };

  // Salvar índice
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indice, null, 2), 'utf-8');
  console.log(`\nÍndice salvo em: ${INDEX_FILE}`);
  console.log(`Total de blocos indexados: ${blocos.length}`);

  console.log('\n' + '='.repeat(60));
  console.log('Concluído!');
  console.log('='.repeat(60));
}

main();
