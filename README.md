# Dashboard Carnaval Rio 2026

Dashboard interativo para monitoramento e gestao dos Blocos de Carnaval do Rio de Janeiro 2026, desenvolvido para o **Centro de Operacoes Rio (COR)**.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.3.1-646CFF?logo=vite)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.4-06B6D4?logo=tailwindcss)

---

## Visao Geral

O Dashboard Carnaval Rio 2026 e uma aplicacao web moderna que permite visualizar e monitorar todos os **465 blocos de carnaval** autorizados pela Prefeitura do Rio de Janeiro para o Carnaval 2026. A ferramenta integra dados geograficos, informacoes dos blocos e cameras de monitoramento em tempo real.

### Principais Funcionalidades

- **Mapa Interativo** com visualizacao de todos os blocos de carnaval
- **Filtros Avancados** por data, subprefeitura, tipo de apresentacao e busca textual
- **Rotas Reais** extraidas dos logradouros do municipio do Rio de Janeiro
- **Cameras ao Vivo** integradas com a API do COR (4.167 cameras)
- **Player Flutuante** para visualizacao de cameras em tempo real
- **Estatisticas** de distribuicao de blocos por data e regiao

---

## Screenshots

### Mapa Principal
O mapa exibe todos os blocos com marcadores coloridos por subprefeitura. Blocos com deslocamento sao representados por circulos, enquanto blocos parados usam marcadores quadrados.

### Painel de Detalhes
Ao clicar em um bloco, um painel lateral exibe informacoes detalhadas incluindo horario, publico estimado, percurso e pontos de concentracao/dispersao.

### Player de Camera
Cameras proximas ao bloco selecionado (raio de 100m) sao exibidas no mapa. Ao clicar, um player flutuante permite visualizar o stream ao vivo.

---

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| **React** | 18.3.1 | Biblioteca para construcao de interfaces |
| **TypeScript** | 5.4.5 | Superset JavaScript com tipagem estatica |
| **Vite** | 5.3.1 | Build tool e dev server ultrarapido |
| **Tailwind CSS** | 3.4.4 | Framework CSS utilitario |
| **React-Leaflet** | 4.2.1 | Wrapper React para Leaflet |
| **Leaflet** | 1.9.4 | Biblioteca de mapas interativos |
| **Lucide React** | 0.300.0 | Icones modernos |
| **date-fns** | 3.6.0 | Manipulacao de datas |
| **xlsx** | 0.18.5 | Parser de arquivos Excel |

### Dados e APIs
| Fonte | Descricao |
|-------|-----------|
| **Planilha de Blocos** | Excel oficial com 465 blocos autorizados |
| **Logradouros.geojson** | 132.328 segmentos de ruas do Rio de Janeiro |
| **API de Cameras** | 4.167 cameras de monitoramento do COR |
| **Stream de Video** | MJPEG stream via Tixxi |

---

## Estrutura do Projeto

```
dashboard-carnaval/
├── public/
│   ├── data/
│   │   ├── PLANILHACOMPLETABLOCOS2026.xlsx  # Dados dos blocos
│   │   └── percursos-blocos.json            # Percursos extraidos
│   └── Logradouros.geojson                  # Logradouros do RJ (153MB)
│
├── scripts/
│   └── extrair-percursos.cjs                # Script de extracao de rotas
│
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.tsx                   # Cabecalho com titulo e stats
│   │   │
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx                  # Container da sidebar
│   │   │   ├── SearchInput.tsx              # Campo de busca
│   │   │   ├── Filters.tsx                  # Filtros (data, subpref, tipo)
│   │   │   └── BlocoList.tsx                # Lista de blocos
│   │   │
│   │   ├── Map/
│   │   │   ├── MapContainer.tsx             # Container do mapa Leaflet
│   │   │   ├── BlocoMarker.tsx              # Marcador de bloco
│   │   │   ├── BlocoRoute.tsx               # Rota/percurso do bloco
│   │   │   ├── CameraMarker.tsx             # Marcador de camera
│   │   │   ├── CameraPlayer.tsx             # Player de video flutuante
│   │   │   └── MapLegend.tsx                # Legenda do mapa
│   │   │
│   │   ├── BlocoDetail/
│   │   │   └── BlocoDetailPanel.tsx         # Painel de detalhes do bloco
│   │   │
│   │   └── Stats/
│   │       └── DateDistributionChart.tsx    # Grafico de distribuicao
│   │
│   ├── hooks/
│   │   ├── useBlocos.ts                     # Carrega blocos do Excel
│   │   ├── useFilters.ts                    # Gerencia filtros
│   │   ├── useCameras.ts                    # Carrega e filtra cameras
│   │   └── index.ts                         # Barrel exports
│   │
│   ├── types/
│   │   └── bloco.ts                         # Interfaces TypeScript
│   │
│   ├── utils/
│   │   ├── constants.ts                     # Constantes do projeto
│   │   ├── formatters.ts                    # Funcoes de formatacao
│   │   └── parseExcel.ts                    # Parser da planilha
│   │
│   ├── data/
│   │   ├── coordenadasBairros.ts            # Cores por subprefeitura
│   │   └── mockData.ts                      # Dados de fallback
│   │
│   ├── App.tsx                              # Componente principal
│   ├── main.tsx                             # Entry point
│   └── index.css                            # Estilos globais
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Instalacao e Execucao

### Pre-requisitos

- **Node.js** 18.x ou superior
- **npm** 9.x ou superior (ou yarn/pnpm)
- **Git**

### Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/servicoscor/dashboard_carnaval.git
cd dashboard_carnaval

# Instalar dependencias
npm install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# O servidor estara disponivel em http://localhost:5173
```

### Build de Producao

```bash
# Gerar build otimizada
npm run build

# Preview da build
npm run preview
```

### Lint

```bash
# Verificar codigo
npm run lint
```

---

## Configuracao

### Variaveis de Ambiente

O projeto nao requer variaveis de ambiente obrigatorias. As URLs das APIs estao configuradas diretamente no codigo:

| Configuracao | Arquivo | Valor Padrao |
|--------------|---------|--------------|
| API de Cameras | `src/hooks/useCameras.ts` | `https://aplicativo.cocr.com.br/cameras_api` |
| Stream de Video | `src/components/Map/CameraPlayer.tsx` | `https://dev.tixxi.rio/outvideo3/` |

### Personalizacao de Cores

As cores do tema podem ser ajustadas em `tailwind.config.js`:

```javascript
colors: {
  'cor-bg-primary': '#0a0a1a',    // Fundo principal (escuro)
  'cor-bg-secondary': '#1a1a3a',  // Fundo secundario
  'cor-accent-orange': '#FF6B35', // Destaque laranja
  'cor-accent-pink': '#FF3D91',   // Destaque rosa
  'cor-accent-purple': '#7B68EE', // Destaque roxo
  'cor-accent-green': '#00D4AA',  // Destaque verde
}
```

### Cores por Subprefeitura

Cada subprefeitura possui uma cor unica definida em `src/data/coordenadasBairros.ts`:

| Subprefeitura | Cor |
|---------------|-----|
| CENTRO | #FF6B6B |
| ZONA SUL | #4ECDC4 |
| GRANDE TIJUCA | #45B7D1 |
| ZONA NORTE | #96CEB4 |
| ILHAS | #DDA0DD |
| ZONA OESTE 1 | #F7DC6F |
| ZONA OESTE 2 | #BB8FCE |
| ZONA OESTE 3 | #85C1E9 |
| BARRA, RECREIO E VARGENS | #F8B500 |
| JACAREPAGUA | #82E0AA |

---

## Funcionalidades Detalhadas

### 1. Mapa Interativo

O mapa utiliza **Leaflet** com tiles do **CartoDB Dark** para criar uma interface estilo "JARVIS Municipal".

#### Marcadores de Blocos
- **Circulo**: Blocos com deslocamento (percurso definido)
- **Quadrado com "P"**: Blocos parados (concentrados em um ponto)
- **Tamanho**: Proporcional ao publico estimado

```typescript
// Escala de tamanho baseada no publico
>= 500.000 pessoas: 20px
>= 100.000 pessoas: 16px
>= 50.000 pessoas:  12px
>= 10.000 pessoas:  10px
>= 5.000 pessoas:   8px
< 5.000 pessoas:    6px
```

#### Visualizacao de Rotas
- Linha tracejada conectando pontos do percurso
- Marcador verde "I" para inicio
- Marcador rosa "F" para fim
- Animacao de transicao suave (fly-to) ao selecionar bloco

### 2. Sistema de Filtros

#### Filtro por Data
Dropdown com as datas do Carnaval 2026:
- 14/02/2026 - Sabado de Carnaval
- 15/02/2026 - Domingo de Carnaval
- 16/02/2026 - Segunda de Carnaval
- 17/02/2026 - Terca de Carnaval
- 18/02/2026 - Quarta de Cinzas

#### Filtro por Subprefeitura
10 subprefeituras do Rio de Janeiro com opcao "Todas".

#### Filtro por Tipo
- Todos os blocos
- Com Deslocamento (percurso)
- Parado

#### Busca Textual
Busca por nome do bloco com normalizacao de acentos e case-insensitive.

### 3. Integracao com Cameras

#### API de Cameras
```
GET https://aplicativo.cocr.com.br/cameras_api
Formato: CSV (latitude;longitude;nome;codigo)
Total: 4.167 cameras
```

#### Filtro de Proximidade
Utiliza a **formula de Haversine** para calcular distancia entre pontos:

```typescript
function calcularDistancia(lat1, lng1, lat2, lng2): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

Cameras dentro de **100 metros** do bloco ou seu percurso sao exibidas.

### 4. Player de Video

#### Recursos
- **Draggable**: Arraste pelo cabecalho para reposicionar
- **Resizable**: Arraste o canto inferior direito para redimensionar
- **Maximize**: Expande para ocupar a tela mantendo aspect ratio
- **Aspect Ratio**: Mantem proporcao 4:3 do video
- **Tecla ESC**: Fecha o player

#### URL do Stream
```
https://dev.tixxi.rio/outvideo3/?CODE={codigo}&KEY=G5325
```

### 5. Extracao de Percursos

O script `scripts/extrair-percursos.cjs` processa o arquivo de logradouros para gerar coordenadas reais dos percursos.

#### Execucao
```bash
node scripts/extrair-percursos.cjs
```

#### Processo
1. Le a planilha de blocos
2. Extrai nomes de ruas dos percursos detalhados
3. Carrega o GeoJSON de logradouros (132.328 segmentos)
4. Faz correspondencia por nome normalizado
5. Gera arquivo JSON com coordenadas

#### Resultados
- **274 blocos** com percurso detalhado
- **250 percursos** gerados com sucesso
- **91.2%** de taxa de sucesso

---

## Modelo de Dados

### Interface Bloco

```typescript
interface Bloco {
  id: number;
  nome: string;
  data: string;                    // YYYY-MM-DD
  dataRelativa: string;            // Ex: "SABADO DE CARNAVAL"
  bairro: string;
  subprefeitura: Subprefeitura;
  publicoEstimado: number;
  lat: number;
  lng: number;
  formaApresentacao: string;       // "DESLOCAMENTO" | "PARADO"
  temPercurso: boolean;
  localConcentracao?: string;
  localDispersao?: string;
  percursoDetalhado?: string;
  percurso?: PontoPercurso[];      // Coordenadas do trajeto
  horaInicio?: string;
  horaTermino?: string;
  horaConcentracao?: string;
  estrutura?: string;
  situacao?: string;
}
```

### Interface Camera

```typescript
interface Camera {
  id: string;
  lat: number;
  lng: number;
  nome: string;
  codigo: string;                  // Codigo para stream
}
```

### Interface PontoPercurso

```typescript
interface PontoPercurso {
  lat: number;
  lng: number;
  endereco?: string;
  rua?: string;
}
```

---

## Performance

### Otimizacoes Implementadas

1. **Lazy Loading**: Componentes carregados sob demanda
2. **Memoization**: `useMemo` para calculos pesados (filtros, cameras)
3. **useCallback**: Previne re-renders desnecessarios
4. **Virtual Scrolling**: Lista de blocos otimizada
5. **Debounce**: Campo de busca com debounce implicito

### Metricas

| Metrica | Valor |
|---------|-------|
| Build Size | ~500KB (gzipped) |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Blocos renderizados | 465 |
| Cameras carregadas | 4.167 |

---

## Troubleshooting

### Problema: Mapa nao carrega

**Causa**: Falha no carregamento dos tiles CartoDB.

**Solucao**: Verificar conexao com internet e se o endpoint do CartoDB esta acessivel.

### Problema: Blocos nao aparecem

**Causa**: Arquivo Excel nao encontrado ou corrompido.

**Solucao**:
1. Verificar se `public/data/PLANILHACOMPLETABLOCOS2026.xlsx` existe
2. O sistema usara dados mock automaticamente como fallback

### Problema: Cameras nao carregam

**Causa**: API de cameras inacessivel ou CORS bloqueado.

**Solucao**: Verificar se `https://aplicativo.cocr.com.br/cameras_api` esta acessivel.

### Problema: Video da camera nao aparece

**Causa**: Stream MJPEG bloqueado ou camera offline.

**Solucao**: Verificar conectividade com `https://dev.tixxi.rio/outvideo3/`

---

## Contribuicao

### Padrao de Commits

```
feat: nova funcionalidade
fix: correcao de bug
docs: documentacao
style: formatacao
refactor: refatoracao
test: testes
chore: manutencao
```

### Fluxo de Trabalho

1. Fork do repositorio
2. Criar branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit das alteracoes (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

---

## Licenca

Este projeto e propriedade do **Centro de Operacoes Rio (COR)** - Prefeitura do Rio de Janeiro.

---

## Contato

**Centro de Operacoes Rio (COR)**
- Email: servicos.cor@cor.rio
- GitHub: [@servicoscor](https://github.com/servicoscor)

---

## Changelog

### v1.0.0 (2026-01-13)

- Lancamento inicial
- Mapa interativo com 465 blocos
- Filtros por data, subprefeitura e tipo
- Rotas reais extraidas do GeoJSON de logradouros
- Integracao com 4.167 cameras do COR
- Player flutuante de video ao vivo
- Tema dark estilo "JARVIS Municipal"

---

**Desenvolvido com React + TypeScript + Leaflet para o Carnaval Rio 2026**
