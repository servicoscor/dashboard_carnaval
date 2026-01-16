import type { Bloco, PontoPercurso } from '../types/bloco';
import { getCoordenadasBairro } from './coordenadasBairros';

// Nomes de blocos famosos e gerados
const nomesBlocos = [
  'CORDÃO DA BOLA PRETA', 'BANDA DE IPANEMA', 'BLOCO DA PRETA', 'SARGENTO PIMENTA',
  'MONOBLOCO', 'SIMPATIA É QUASE AMOR', 'BLOCO DA ANS', 'CARMELITAS',
  'CÉUCONSAGRA', 'BLOCO DO BARBAS', 'ESCRAVOS DA MAUÁ', 'EMPOLGA ÀS 9',
  'ORQUESTRA VOADORA', 'QUIZOMBA', 'BANGALAFUMENGA', 'BLOCO DA LAMA',
  'ME ESQUECE', 'BLOCO DA SAARA', 'FERVO DA LULU', 'SUVACO DO CRISTO',
  'VAGALUME', 'BLOCO DO BECO', 'DESLIGA DA JUSTIÇA', 'CORDÃO DO BOITATÁ',
  'BLOCO DOS BLOGUEIROS', 'LARGO DO MACHADO, MAS NÃO LARGO DO COPO',
  'BLOCO DO URSO', 'BLOCO VIRTUAL', 'TÔ DE BOA', 'FUNK YOU',
  'TCHAKABUM', 'BLOCO DAS CARMELITAS', 'UNIDOS DO SAMBA',
  'FILHOS DE GANDHI', 'QUE MERDA É ESSA', 'BLOCO DOS SUJOS',
  'MULTIBLOCO', 'BLOCO DO AMOR', 'VIRA E MEXE', 'PEGA NO SAMBA',
  'PURO MALTE', 'FOGO E PAIXÃO', 'TICO TICO', 'BATUKE DE AFOXÉ',
  'PÉROLA DA GUANABARA', 'ZIRIGUIDUM', 'É PRA VER OU PRA COMER',
  'BATERIA CARAMBOLADA', 'TERREIRADA CEARENSE', 'FICO ASSIM SEM VOCÊ',
];

// Bairros por subprefeitura
const bairrosPorSubprefeitura: Record<string, string[]> = {
  'CENTRO': ['CENTRO', 'LAPA', 'SANTA TERESA', 'SAUDE', 'GAMBOA', 'CIDADE NOVA', 'CATUMBI'],
  'ZONA SUL': ['COPACABANA', 'IPANEMA', 'LEBLON', 'LEME', 'BOTAFOGO', 'FLAMENGO', 'LARANJEIRAS', 'CATETE', 'GLORIA', 'HUMAITA', 'URCA', 'LAGOA', 'GAVEA', 'JARDIM BOTANICO'],
  'GRANDE TIJUCA': ['TIJUCA', 'ALTO DA BOA VISTA', 'PRACA DA BANDEIRA', 'MARACANA', 'ANDARAI', 'GRAJAU', 'VILA ISABEL'],
  'ZONA NORTE': ['MEIER', 'ENGENHO DE DENTRO', 'CACHAMBI', 'TODOS OS SANTOS', 'ENGENHO NOVO', 'PILARES', 'ABOLIÇÃO', 'PIEDADE', 'CASCADURA', 'MADUREIRA', 'PENHA', 'OLARIA', 'RAMOS', 'BONSUCESSO', 'SAO CRISTOVAO', 'IRAJÁ', 'VILA DA PENHA'],
  'ILHAS': ['ILHA DO GOVERNADOR', 'COCOTA', 'PRAIA DA BANDEIRA', 'FREGUESIA', 'PORTUGUESA', 'BANCARIOS', 'JARDIM GUANABARA', 'RIBEIRA', 'PAQUETA'],
  'ZONA OESTE 1': ['BANGU', 'SENADOR CAMARA', 'PADRE MIGUEL', 'REALENGO', 'DEODORO', 'VILA MILITAR', 'MAGALHAES BASTOS', 'JARDIM SULACAP'],
  'ZONA OESTE 2': ['CAMPO GRANDE', 'SANTA CRUZ'],
  'ZONA OESTE 3': ['COSMOS', 'INHOAIBA', 'PACIENCIA', 'SEPETIBA', 'GUARATIBA', 'PEDRA DE GUARATIBA'],
  'BARRA, RECREIO E VARGENS': ['BARRA DA TIJUCA', 'RECREIO DOS BANDEIRANTES', 'JOATINGA', 'ITANHANGA', 'VARGEM PEQUENA', 'VARGEM GRANDE'],
  'JACAREPAGUÁ': ['JACAREPAGUA', 'TAQUARA', 'TANQUE', 'PRACA SECA', 'VILA VALQUEIRE', 'FREGUESIA DE JACAREPAGUA', 'PECHINCHA', 'ANIL', 'CURICICA', 'CIDADE DE DEUS'],
};

// Distribuição de blocos por subprefeitura (conforme fornecido)
const distribuicaoSubprefeituras: Record<string, number> = {
  'CENTRO': 134,
  'ZONA SUL': 101,
  'GRANDE TIJUCA': 63,
  'ZONA NORTE': 56,
  'ILHAS': 37,
  'ZONA OESTE 1': 23,
  'ZONA OESTE 3': 21,
  'BARRA, RECREIO E VARGENS': 16,
  'JACAREPAGUÁ': 12,
  'ZONA OESTE 2': 2,
};

// Mapeamento de subprefeitura para zona
const subprefeituraParaZona: Record<string, string> = {
  'CENTRO': 'CENTRO',
  'ZONA SUL': 'ZONA SUL',
  'GRANDE TIJUCA': 'ZONA NORTE',
  'ZONA NORTE': 'ZONA NORTE',
  'ILHAS': 'ZONA NORTE',
  'ZONA OESTE 1': 'ZONA OESTE',
  'ZONA OESTE 2': 'ZONA OESTE',
  'ZONA OESTE 3': 'ZONA OESTE',
  'BARRA, RECREIO E VARGENS': 'ZONA OESTE',
  'JACAREPAGUÁ': 'ZONA OESTE',
};

// Datas do carnaval 2026
const datasCarnaval = [
  { data: '2026-01-17', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-01-18', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-01-24', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-01-25', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-01-31', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-02-01', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-02-07', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-02-08', relativa: 'PRÉ-CARNAVAL' },
  { data: '2026-02-14', relativa: 'SÁBADO DE CARNAVAL' },
  { data: '2026-02-15', relativa: 'DOMINGO DE CARNAVAL' },
  { data: '2026-02-16', relativa: 'SEGUNDA DE CARNAVAL' },
  { data: '2026-02-17', relativa: 'TERÇA DE CARNAVAL' },
  { data: '2026-02-18', relativa: 'QUARTA DE CINZAS' },
  { data: '2026-02-21', relativa: 'PÓS-CARNAVAL' },
  { data: '2026-02-22', relativa: 'PÓS-CARNAVAL' },
];

// Estruturas de som
const estruturas = ['TRIO ELÉTRICO', 'CAMINHÃO DE SOM', 'CARRO DE SOM', 'CHARRETE COM SOM', 'NENHUM'];

// Ruas comuns por bairro
const ruasPorBairro: Record<string, string[]> = {
  'CENTRO': ['Av. Rio Branco', 'R. Primeiro de Março', 'Av. Pres. Vargas', 'R. da Carioca', 'Praça XV'],
  'LAPA': ['R. da Lapa', 'R. do Lavradio', 'Av. Mem de Sá', 'Praça Tiradentes', 'R. do Riachuelo'],
  'COPACABANA': ['Av. Atlântica', 'Av. N. Sra. de Copacabana', 'R. Barata Ribeiro', 'R. Siqueira Campos'],
  'IPANEMA': ['R. Visconde de Pirajá', 'Praça General Osório', 'R. Farme de Amoedo', 'Av. Vieira Souto'],
  'LEBLON': ['R. Dias Ferreira', 'Av. Ataulfo de Paiva', 'Praça Antero de Quental', 'R. General Venâncio Flores'],
  'DEFAULT': ['Rua Principal', 'Praça Central', 'Av. Comercial', 'R. do Comércio'],
};

function gerarPercursoDetalhado(bairro: string, pontos: number): string {
  const ruas = ruasPorBairro[bairro] || ruasPorBairro['DEFAULT'];
  const percurso: string[] = [];

  for (let i = 0; i < pontos; i++) {
    const rua = ruas[i % ruas.length];
    const numero = Math.floor(Math.random() * 900) + 100;
    percurso.push(`${rua}, ${numero}`);
  }

  return percurso.join(' | ');
}

function gerarPercurso(bairro: string, pontos: number): PontoPercurso[] {
  const [baseLat, baseLng] = getCoordenadasBairro(bairro);
  const ruas = ruasPorBairro[bairro] || ruasPorBairro['DEFAULT'];
  const resultado: PontoPercurso[] = [];

  for (let i = 0; i < pontos; i++) {
    const progress = pontos > 1 ? i / (pontos - 1) : 0;
    const latOffset = (progress - 0.5) * 0.008 + (Math.random() - 0.5) * 0.001;
    const lngOffset = (progress - 0.5) * 0.008 + (Math.random() - 0.5) * 0.001;
    const rua = ruas[i % ruas.length];
    const numero = Math.floor(Math.random() * 900) + 100;

    resultado.push({
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
      endereco: `${rua}, ${numero}`,
    });
  }

  return resultado;
}

function gerarHora(horaBase: number, variacaoMin: number = 0): string {
  const hora = horaBase + Math.floor(Math.random() * variacaoMin);
  const minutos = Math.floor(Math.random() * 4) * 15;
  return `${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
}

function gerarNomeBloco(index: number): string {
  if (index < nomesBlocos.length) {
    return nomesBlocos[index];
  }

  const prefixos = ['BLOCO', 'BANDA', 'CORDÃO', 'UNIDOS', 'AMIGOS', 'FILHOS'];
  const sufixos = ['DO AMOR', 'DA ALEGRIA', 'DO SAMBA', 'DA PAZ', 'DA FOLIA', 'DO RIO', 'DA RUA', 'DOS AMIGOS', 'DA GALERA'];
  const meios = ['DE', 'DA', 'DO', 'DOS', 'DAS'];
  const locais = ['TIJUCA', 'LAPA', 'CENTRO', 'BOTAFOGO', 'COPA', 'MÉIER', 'BANGU', 'MADUREIRA'];

  const tipo = Math.random();

  if (tipo < 0.3) {
    return `${prefixos[Math.floor(Math.random() * prefixos.length)]} ${sufixos[Math.floor(Math.random() * sufixos.length)]}`;
  } else if (tipo < 0.6) {
    return `${prefixos[Math.floor(Math.random() * prefixos.length)]} ${meios[Math.floor(Math.random() * meios.length)]} ${locais[Math.floor(Math.random() * locais.length)]}`;
  } else {
    return `${prefixos[Math.floor(Math.random() * prefixos.length)]} #${index + 1}`;
  }
}

// Gerar dados mock
function gerarDadosMock(): Bloco[] {
  const blocos: Bloco[] = [];
  let id = 1;

  // Criar bloco por subprefeitura respeitando a distribuição
  for (const [subprefeitura, quantidade] of Object.entries(distribuicaoSubprefeituras)) {
    const bairros = bairrosPorSubprefeitura[subprefeitura] || ['CENTRO'];

    for (let i = 0; i < quantidade; i++) {
      const bairro = bairros[Math.floor(Math.random() * bairros.length)];
      const dataInfo = datasCarnaval[Math.floor(Math.random() * datasCarnaval.length)];

      // 59% com deslocamento
      const comDeslocamento = Math.random() < 0.59;
      const pontosPercurso = comDeslocamento ? Math.floor(Math.random() * 5) + 3 : 0;

      // Público estimado (distribuição exponencial para ter alguns muito grandes)
      let publicoEstimado: number;
      const sorteio = Math.random();
      if (sorteio < 0.01) {
        publicoEstimado = Math.floor(Math.random() * 300000) + 400000; // Mega blocos (até 700k)
      } else if (sorteio < 0.05) {
        publicoEstimado = Math.floor(Math.random() * 150000) + 100000; // Grandes (100k-250k)
      } else if (sorteio < 0.15) {
        publicoEstimado = Math.floor(Math.random() * 50000) + 50000; // Médios (50k-100k)
      } else if (sorteio < 0.4) {
        publicoEstimado = Math.floor(Math.random() * 30000) + 10000; // Pequenos-médios (10k-40k)
      } else {
        publicoEstimado = Math.floor(Math.random() * 8000) + 2000; // Pequenos (2k-10k)
      }

      const [lat, lng] = getCoordenadasBairro(bairro);

      // Adicionar variação nas coordenadas para não sobrepor
      const latVar = lat + (Math.random() - 0.5) * 0.01;
      const lngVar = lng + (Math.random() - 0.5) * 0.01;

      const horaInicio = 8 + Math.floor(Math.random() * 10); // Entre 8h e 18h
      const duracao = 3 + Math.floor(Math.random() * 4); // 3-6 horas

      const percursoDetalhado = comDeslocamento ? gerarPercursoDetalhado(bairro, pontosPercurso) : '';

      blocos.push({
        id,
        nome: gerarNomeBloco(id - 1),
        data: dataInfo.data,
        dataRelativa: dataInfo.relativa,
        bairro,
        subprefeitura,
        regiao: subprefeituraParaZona[subprefeitura] || 'CENTRO',
        publicoEstimado,
        localConcentracao: `${(ruasPorBairro[bairro] || ruasPorBairro['DEFAULT'])[0]}, ${Math.floor(Math.random() * 500) + 1} - ${bairro}`,
        horaConcentracao: gerarHora(horaInicio - 1),
        horaInicio: gerarHora(horaInicio),
        horaTermino: gerarHora(horaInicio + duracao),
        percursoDetalhado,
        localDispersao: comDeslocamento
          ? `${(ruasPorBairro[bairro] || ruasPorBairro['DEFAULT'])[Math.floor(Math.random() * 3)]} - ${bairro}`
          : '',
        formaApresentacao: comDeslocamento ? 'COM DESLOCAMENTO' : 'PARADO',
        estrutura: estruturas[Math.floor(Math.random() * estruturas.length)],
        situacao: 'CADASTRO PRELIMINAR',
        lat: latVar,
        lng: lngVar,
        temPercurso: comDeslocamento && pontosPercurso > 0,
        percurso: comDeslocamento ? gerarPercurso(bairro, pontosPercurso) : [],
      });

      id++;
    }
  }

  // Garantir que o Cordão da Bola Preta seja o primeiro e maior
  const bolaPreta = blocos.find(b => b.nome === 'CORDÃO DA BOLA PRETA');
  if (bolaPreta) {
    bolaPreta.publicoEstimado = 700000;
    bolaPreta.bairro = 'CENTRO';
    bolaPreta.subprefeitura = 'CENTRO';
    bolaPreta.regiao = 'CENTRO';
    bolaPreta.data = '2026-02-14';
    bolaPreta.dataRelativa = 'SÁBADO DE CARNAVAL';
    const [lat, lng] = getCoordenadasBairro('CENTRO');
    bolaPreta.lat = lat;
    bolaPreta.lng = lng;
  }

  return blocos;
}

export const dadosMock = gerarDadosMock();
