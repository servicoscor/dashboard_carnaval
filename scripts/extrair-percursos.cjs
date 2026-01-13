/**
 * Script para extrair os percursos dos blocos de carnaval
 * usando o arquivo de logradouros do município do Rio de Janeiro
 *
 * Uso: node scripts/extrair-percursos.cjs
 */

const XLSX = require('xlsx');
const fs = require('fs');
const readline = require('readline');

// Função para normalizar nomes de ruas para comparação
function normalizarNomeRua(nome) {
    if (!nome) return '';
    let resultado = nome
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, ' ')
        .trim()
        // Remover prefixos comuns
        .replace(/^(RUA|R\.|AV\.|AVENIDA|PRACA|PCA\.|TRAVESSA|TRAV\.|ESTRADA|ESTR\.|LADEIRA|LAD\.|BECO|LARGO|LGO\.|BLVD\.|BOULEVARD)\s*/i, '')
        .trim();

    // Expandir abreviações comuns
    resultado = resultado
        .replace(/^ALM\.\s*/i, 'ALMIRANTE ')
        .replace(/^CEL\.\s*/i, 'CORONEL ')
        .replace(/^CAP\.\s*/i, 'CAPITAO ')
        .replace(/^GEN\.\s*/i, 'GENERAL ')
        .replace(/^MAJ\.\s*/i, 'MAJOR ')
        .replace(/^TEN\.\s*/i, 'TENENTE ')
        .replace(/^DR\.\s*/i, 'DOUTOR ')
        .replace(/^PROF\.\s*/i, 'PROFESSOR ')
        .replace(/^SEN\.\s*/i, 'SENADOR ')
        .replace(/^DEP\.\s*/i, 'DEPUTADO ')
        .replace(/^PRES\.\s*/i, 'PRESIDENTE ')
        .replace(/^COMEND\.\s*/i, 'COMENDADOR ')
        .replace(/^CONS\.\s*/i, 'CONSELHEIRO ')
        .replace(/^ENG\.\s*/i, 'ENGENHEIRO ')
        .replace(/^MIN\.\s*/i, 'MINISTRO ')
        .replace(/^D\.\s*/i, 'DONA ')
        .replace(/^S\.\s*/i, 'SAO ')
        .replace(/^STA\.\s*/i, 'SANTA ')
        .replace(/^STO\.\s*/i, 'SANTO ')
        .replace(/^N\.\s*S\.\s*/i, 'NOSSA SENHORA ')
        .replace(/^NS\.\s*/i, 'NOSSA SENHORA ')
        .trim();

    // Remover números no final (ex: "CONDE DE BONFIM 123")
    resultado = resultado.replace(/\s+\d+.*$/, '').trim();

    // Remover textos em parênteses
    resultado = resultado.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

    // Remover " - " e tudo depois (ex: "NOME - BAIRRO")
    resultado = resultado.replace(/\s+-\s+.*$/, '').trim();

    return resultado;
}

// Função para extrair nome da rua de um endereço completo
function extrairNomeRua(endereco) {
    if (!endereco) return null;

    // Formato: "R. Nome da Rua, 123 - Bairro, Rio de Janeiro..."
    // ou "Av. Nome da Rua, 123..."

    // Primeiro, pegar só a parte antes do número
    const partes = endereco.split(',');
    if (partes.length === 0) return null;

    let ruaParte = partes[0].trim();

    // Identificar o tipo e o nome
    const tiposRua = [
        { prefixo: /^R\.\s*/i, tipo: 'Rua' },
        { prefixo: /^Rua\s*/i, tipo: 'Rua' },
        { prefixo: /^Av\.\s*/i, tipo: 'Avenida' },
        { prefixo: /^Avenida\s*/i, tipo: 'Avenida' },
        { prefixo: /^Pra[cç]a\s*/i, tipo: 'Praça' },
        { prefixo: /^Pca\.\s*/i, tipo: 'Praça' },
        { prefixo: /^Trav\.\s*/i, tipo: 'Travessa' },
        { prefixo: /^Travessa\s*/i, tipo: 'Travessa' },
        { prefixo: /^Estr\.\s*/i, tipo: 'Estrada' },
        { prefixo: /^Estrada\s*/i, tipo: 'Estrada' },
        { prefixo: /^Lad\.\s*/i, tipo: 'Ladeira' },
        { prefixo: /^Ladeira\s*/i, tipo: 'Ladeira' },
        { prefixo: /^Largo\s*/i, tipo: 'Largo' },
        { prefixo: /^Lgo\.\s*/i, tipo: 'Largo' },
        { prefixo: /^Beco\s*/i, tipo: 'Beco' },
        { prefixo: /^Al\.\s*/i, tipo: 'Alameda' },
        { prefixo: /^Alameda\s*/i, tipo: 'Alameda' },
    ];

    let tipo = null;
    let nome = ruaParte;

    for (const t of tiposRua) {
        if (t.prefixo.test(ruaParte)) {
            tipo = t.tipo;
            nome = ruaParte.replace(t.prefixo, '').trim();
            break;
        }
    }

    return { tipo, nome, nomeCompleto: tipo ? `${tipo} ${nome}` : nome };
}

// Função para normalizar nome de bairro
function normalizarBairro(bairro) {
    if (!bairro) return '';
    return bairro
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Função para extrair bairro do endereço
function extrairBairro(endereco) {
    if (!endereco) return null;

    // Formato: "R. Nome, 123 - Bairro, Rio de Janeiro..."
    const match = endereco.match(/\s-\s([^,]+),\s*Rio de Janeiro/i);
    if (match) {
        return normalizarBairro(match[1]);
    }
    return null;
}

async function main() {
    console.log('='.repeat(60));
    console.log('EXTRATOR DE PERCURSOS - Dashboard Carnaval Rio 2026');
    console.log('='.repeat(60));
    console.log('');

    // 1. Carregar planilha dos blocos
    console.log('[1/4] Carregando planilha dos blocos...');
    const workbook = XLSX.readFile('public/data/PLANILHACOMPLETABLOCOS2026.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const blocos = XLSX.utils.sheet_to_json(sheet);
    console.log(`      ${blocos.length} blocos encontrados`);

    // 2. Extrair todos os nomes de ruas dos percursos
    console.log('\n[2/4] Extraindo ruas dos percursos...');

    const blocosComPercurso = [];
    const todasRuas = new Map(); // nome normalizado -> { tipo, nome, bairros: Set }

    for (const bloco of blocos) {
        const forma = bloco['Forma de apresentação'] || '';
        if (!forma.toUpperCase().includes('DESLOCAMENTO')) continue;

        const percursoStr = bloco['Percurso Detalhado'] || '';
        if (!percursoStr) continue;

        // Separar por | ou /
        const pontos = percursoStr.split(/[|\/]/).map(p => p.trim()).filter(p => p);

        const ruasDoBloco = [];
        for (const ponto of pontos) {
            const ruaInfo = extrairNomeRua(ponto);
            const bairro = extrairBairro(ponto);

            if (ruaInfo && ruaInfo.nome) {
                const nomeNorm = normalizarNomeRua(ruaInfo.nome);

                if (!todasRuas.has(nomeNorm)) {
                    todasRuas.set(nomeNorm, {
                        tipo: ruaInfo.tipo,
                        nome: ruaInfo.nome,
                        nomeCompleto: ruaInfo.nomeCompleto,
                        bairros: new Set()
                    });
                }
                if (bairro) {
                    todasRuas.get(nomeNorm).bairros.add(bairro);
                }

                ruasDoBloco.push({
                    nomeNorm,
                    bairro,
                    enderecoOriginal: ponto
                });
            }
        }

        if (ruasDoBloco.length > 0) {
            blocosComPercurso.push({
                nome: bloco['Nome do Bloco'],
                bairro: bloco['Bairro'],
                ruas: ruasDoBloco
            });
        }
    }

    console.log(`      ${blocosComPercurso.length} blocos com percurso detalhado`);
    console.log(`      ${todasRuas.size} ruas únicas encontradas`);

    // 3. Carregar GeoJSON e criar índice de logradouros
    console.log('\n[3/4] Processando arquivo de logradouros (pode demorar)...');

    const logradourosPath = 'public/Logradouros.geojson';
    const geojsonContent = fs.readFileSync(logradourosPath, 'utf-8');
    const geojson = JSON.parse(geojsonContent);

    console.log(`      ${geojson.features.length} segmentos de logradouros`);

    // Criar índice por nome de rua normalizado
    const indiceLogradouros = new Map(); // nomeNorm -> [{ bairro, coordinates }]

    for (const feature of geojson.features) {
        const props = feature.properties;
        const nomeCompleto = props.completo || props.nome_parcial;
        if (!nomeCompleto) continue;

        const nomeNorm = normalizarNomeRua(props.nome_parcial || nomeCompleto);
        const bairro = (props.bairro || '').toUpperCase().trim();
        const coords = feature.geometry.coordinates;

        if (!indiceLogradouros.has(nomeNorm)) {
            indiceLogradouros.set(nomeNorm, []);
        }

        indiceLogradouros.get(nomeNorm).push({
            bairro,
            nomeCompleto: props.completo,
            coordinates: coords
        });
    }

    console.log(`      ${indiceLogradouros.size} logradouros únicos indexados`);

    // 4. Buscar coordenadas para cada rua dos percursos
    console.log('\n[4/4] Gerando percursos com coordenadas...');

    const percursosGerados = [];
    let ruasEncontradas = 0;
    let ruasNaoEncontradas = 0;
    const ruasFaltando = new Set();

    for (const bloco of blocosComPercurso) {
        const percursoCoords = [];

        for (const rua of bloco.ruas) {
            let segmentos = indiceLogradouros.get(rua.nomeNorm);

            // Se não encontrou, tentar busca parcial
            if (!segmentos || segmentos.length === 0) {
                // Tentar encontrar ruas que contenham o nome
                const palavrasChave = rua.nomeNorm.split(' ').filter(p => p.length > 3);
                if (palavrasChave.length > 0) {
                    for (const [nomeIdx, segs] of indiceLogradouros) {
                        // Verificar se todas as palavras-chave estão no nome
                        if (palavrasChave.every(p => nomeIdx.includes(p))) {
                            segmentos = segs;
                            break;
                        }
                    }
                }
            }

            if (segmentos && segmentos.length > 0) {
                // Tentar encontrar segmento no mesmo bairro
                let segmentoEscolhido = segmentos[0];

                if (rua.bairro) {
                    const bairroNorm = normalizarBairro(rua.bairro);
                    const segmentoBairro = segmentos.find(s => {
                        const sBairroNorm = normalizarBairro(s.bairro);
                        return sBairroNorm === bairroNorm ||
                               sBairroNorm.includes(bairroNorm) ||
                               bairroNorm.includes(sBairroNorm);
                    });
                    if (segmentoBairro) {
                        segmentoEscolhido = segmentoBairro;
                    }
                }

                // Adicionar coordenadas (pegar ponto médio do segmento)
                const coords = segmentoEscolhido.coordinates;
                if (coords && coords.length > 0) {
                    // Para LineString, pegar pontos
                    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
                        // É LineString simples
                        const midIdx = Math.floor(coords.length / 2);
                        percursoCoords.push({
                            lat: coords[midIdx][1],
                            lng: coords[midIdx][0],
                            rua: segmentoEscolhido.nomeCompleto
                        });

                        // Se for o início ou fim, adicionar pontos extras para melhor visualização
                        if (rua === bloco.ruas[0] || rua === bloco.ruas[bloco.ruas.length - 1]) {
                            // Adicionar primeiro e último ponto do segmento
                            if (rua === bloco.ruas[0]) {
                                percursoCoords.unshift({
                                    lat: coords[0][1],
                                    lng: coords[0][0],
                                    rua: segmentoEscolhido.nomeCompleto + ' (início)'
                                });
                            }
                            if (rua === bloco.ruas[bloco.ruas.length - 1]) {
                                percursoCoords.push({
                                    lat: coords[coords.length - 1][1],
                                    lng: coords[coords.length - 1][0],
                                    rua: segmentoEscolhido.nomeCompleto + ' (fim)'
                                });
                            }
                        }
                    }
                    ruasEncontradas++;
                }
            } else {
                ruasNaoEncontradas++;
                ruasFaltando.add(`${rua.nomeNorm} (${rua.bairro || 'bairro desconhecido'})`);
            }
        }

        if (percursoCoords.length >= 2) {
            percursosGerados.push({
                nomeBloco: bloco.nome,
                bairro: bloco.bairro,
                percurso: percursoCoords
            });
        }
    }

    console.log(`      ${ruasEncontradas} ruas encontradas no mapa`);
    console.log(`      ${ruasNaoEncontradas} ruas não encontradas`);
    console.log(`      ${percursosGerados.length} percursos gerados com sucesso`);

    // 5. Salvar resultado
    const outputPath = 'public/data/percursos-blocos.json';
    fs.writeFileSync(outputPath, JSON.stringify(percursosGerados, null, 2));
    console.log(`\n✓ Arquivo salvo em: ${outputPath}`);

    // Salvar lista de ruas não encontradas para debug
    if (ruasFaltando.size > 0) {
        const debugPath = 'scripts/ruas-nao-encontradas.txt';
        fs.writeFileSync(debugPath, Array.from(ruasFaltando).sort().join('\n'));
        console.log(`  (Lista de ruas não encontradas em: ${debugPath})`);
    }

    // 6. Gerar estatísticas
    console.log('\n' + '='.repeat(60));
    console.log('RESUMO');
    console.log('='.repeat(60));
    console.log(`Total de blocos na planilha: ${blocos.length}`);
    console.log(`Blocos com deslocamento: ${blocosComPercurso.length}`);
    console.log(`Percursos gerados: ${percursosGerados.length}`);
    console.log(`Taxa de sucesso: ${((percursosGerados.length / blocosComPercurso.length) * 100).toFixed(1)}%`);
}

main().catch(console.error);
