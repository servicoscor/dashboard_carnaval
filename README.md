# 🎭 Dashboard Carnaval Rio 2026

<div align="center">

**Dashboard interativo para monitoramento e gestão dos Blocos de Carnaval do Rio de Janeiro 2026**

*Desenvolvido para o Centro de Operações Rio (COR)*

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

[Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Arquitetura](#-arquitetura) • [APIs](#-integrações-de-api) • [Contribuição](#-contribuição)

</div>

---

## 📋 Visão Geral

O **Dashboard Carnaval Rio 2026** é uma aplicação web de alta performance que permite visualizar, monitorar e gerenciar todos os blocos de carnaval autorizados pela Prefeitura do Rio de Janeiro. A ferramenta integra dados oficiais da API municipal, informações geográficas, câmeras de monitoramento em tempo real e alertas inteligentes.

### Destaques

- 🗺️ **Mapa Interativo** com visualização de todos os blocos em tempo real
- 📡 **Integração com API Oficial** da Prefeitura do Rio (dados sempre atualizados)
- 🔔 **Sistema de Alertas** para blocos prestes a iniciar
- 🛣️ **Planejamento de Rotas** com OSRM (Open Source Routing Machine)
- ⚠️ **Alertas Waze** integrados para monitoramento de trânsito
- 📹 **4.167 Câmeras** do COR com streaming ao vivo
- 📱 **Design Responsivo** otimizado para desktop e mobile
- 🎯 **Tour Automático** pelos blocos filtrados

---

## ✨ Funcionalidades

### 🗺️ Mapa Interativo

| Recurso | Descrição |
|---------|-----------|
| **Marcadores Dinâmicos** | Círculos para blocos com deslocamento, quadrados para blocos parados |
| **Cores por Subprefeitura** | 10 cores distintas para identificação visual rápida |
| **Tamanho por Público** | Marcadores proporcionais ao público estimado (2k a 700k pessoas) |
| **Percursos Animados** | Rotas tracejadas com marcadores de início (I) e fim (F) |
| **Pulsação em Tempo Real** | Blocos ativos pulsam no mapa durante seu horário |
| **Fly-to Animation** | Transição suave ao selecionar um bloco |

### 🔍 Sistema de Filtros Avançados

- **Por Data**: Hoje, todas as datas, ou data específica do carnaval
- **Por Zona**: Centro, Zona Sul, Zona Norte, Zona Oeste
- **Por Subprefeitura**: 10 subprefeituras do Rio de Janeiro
- **Por Tipo**: Com deslocamento ou Parado
- **Busca Textual**: Nome do bloco (case-insensitive, ignora acentos)

### 🔔 Sistema de Alertas Inteligentes

```
┌─────────────────────────────────────────┐
│  🔔 Alertas de Blocos                   │
├─────────────────────────────────────────┤
│  ⚠️ ALTA: Bloco inicia em < 30min       │
│  📢 MÉDIA: Bloco inicia em < 1h         │
│  ℹ️ BAIXA: Bloco inicia em < 2h         │
└─────────────────────────────────────────┘
```

- **Popup Automático**: Alerta visual quando bloco está prestes a começar
- **Badge no Header**: Contador de alertas com indicador de prioridade
- **Painel Lateral**: Lista completa de alertas ordenados por urgência
- **Tempo Restante**: Contagem regressiva para início de cada bloco

### 🛣️ Planejamento de Rotas (OSRM)

- **Geolocalização**: Detecta sua posição atual automaticamente
- **Cálculo de Rota**: Rota otimizada até o bloco selecionado
- **Informações**: Distância em km e tempo estimado de chegada
- **Enquadramento Automático**: Mapa ajusta zoom para mostrar rota completa
- **Integração OSRM**: Utiliza servidor de roteamento open source

### ⚠️ Integração Waze

- **Alertas em Tempo Real**: Acidentes, obras, interdições próximas
- **Raio Configurável**: Alertas dentro de 500m do bloco selecionado
- **Tipos de Alerta**: ACCIDENT, ROAD_CLOSED, HAZARD, JAM
- **Marcadores no Mapa**: Visualização dos alertas Waze

### 📹 Sistema de Câmeras

- **4.167 Câmeras**: Integração completa com a rede do COR
- **Proximidade**: Exibe câmeras num raio de 300m do bloco
- **Player Flutuante**: Arraste, redimensione e maximize
- **Streaming MJPEG**: Vídeo ao vivo via Tixxi
- **Tecla ESC**: Fecha o player rapidamente

### 🎯 Tour Automático

- **Navegação Automática**: Percorre todos os blocos filtrados
- **Timer Configurável**: Pausa de 5 segundos entre blocos
- **Controles**: Play, Stop, Skip para o próximo
- **Contador**: Mostra progresso (ex: 3/45 blocos)

### 📅 Timeline de Blocos

- **Visualização Temporal**: Todos os blocos organizados por horário
- **Filtros Independentes**: Data, zona, subprefeitura, tipo
- **Cards Informativos**: Nome, horário, público, bairro
- **Navegação Rápida**: Clique para ir ao bloco no mapa

### 📱 Design Responsivo

| Viewport | Comportamento |
|----------|---------------|
| **Desktop** (≥1024px) | Sidebar fixa, todas funcionalidades visíveis |
| **Tablet** (768-1023px) | Sidebar colapsável, layout adaptado |
| **Mobile** (<768px) | Bottom sheet, interface touch-friendly |

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** 9.x ou superior
- **Git**

### Setup

```bash
# Clonar repositório
git clone https://github.com/servicoscor/dashboard_carnaval.git
cd dashboard_carnaval

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Abrir http://localhost:5173
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build otimizada para produção |
| `npm run preview` | Preview da build de produção |
| `npm run lint` | Verificação de código com ESLint |

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
dashboard-carnaval/
│
├── 📁 public/
│   └── 📁 data/
│       ├── 📄 PLANILHACOMPLETABLOCOS2026.xlsx    # Fallback Excel
│       ├── 📁 percursos/kmz/                      # Arquivos KMZ
│       └── 🖼️ RIOPREFEITURA COR...png            # Logo oficial
│
├── 📁 src/
│   │
│   ├── 📁 components/
│   │   ├── 📁 Header/
│   │   │   └── Header.tsx           # Cabeçalho com stats e tour
│   │   │
│   │   ├── 📁 Sidebar/
│   │   │   ├── Sidebar.tsx          # Container da sidebar
│   │   │   ├── SearchInput.tsx      # Campo de busca
│   │   │   ├── Filters.tsx          # Filtros (data, zona, subpref, tipo)
│   │   │   └── BlocoList.tsx        # Lista virtualizada de blocos
│   │   │
│   │   ├── 📁 Map/
│   │   │   ├── MapContainer.tsx     # Container Leaflet
│   │   │   ├── BlocoMarker.tsx      # Marcador com pulsação
│   │   │   ├── BlocoRoute.tsx       # Percurso do bloco
│   │   │   ├── CameraMarker.tsx     # Marcador de câmera
│   │   │   ├── CameraPlayer.tsx     # Player flutuante
│   │   │   ├── RotaPanel.tsx        # Painel de rota calculada
│   │   │   └── WazeAlerts.tsx       # Marcadores Waze
│   │   │
│   │   ├── 📁 Alertas/
│   │   │   ├── AlertasPanel.tsx     # Painel lateral de alertas
│   │   │   ├── AlertaBadge.tsx      # Badge no header
│   │   │   └── index.ts             # Exports
│   │   │
│   │   ├── 📁 BlocoDetail/
│   │   │   └── BlocoDetailPanel.tsx # Detalhes do bloco selecionado
│   │   │
│   │   └── 📁 Timeline/
│   │       └── TimelineView.tsx     # Página de timeline
│   │
│   ├── 📁 hooks/
│   │   ├── useBlocos.ts             # Carrega blocos (API/Excel/Mock)
│   │   ├── useFilters.ts            # Gerencia filtros
│   │   ├── useCameras.ts            # Carrega câmeras do COR
│   │   ├── useAlertas.ts            # Sistema de alertas temporais
│   │   ├── useRota.ts               # Cálculo de rotas OSRM
│   │   ├── useGeolocation.ts        # Geolocalização do usuário
│   │   ├── useWazeAlerts.ts         # Alertas do Waze
│   │   ├── useTour.ts               # Tour automático
│   │   └── index.ts                 # Barrel exports
│   │
│   ├── 📁 services/
│   │   └── blocosApiService.ts      # Cliente da API oficial
│   │
│   ├── 📁 types/
│   │   └── bloco.ts                 # Interfaces TypeScript
│   │
│   ├── 📁 utils/
│   │   ├── constants.ts             # Constantes (zonas, cores, etc)
│   │   ├── formatters.ts            # Formatação de números/datas
│   │   ├── parseExcel.ts            # Parser da planilha
│   │   └── kmzParser.ts             # Parser de arquivos KMZ
│   │
│   ├── 📁 data/
│   │   ├── coordenadasBairros.ts    # Coordenadas e cores
│   │   └── mockData.ts              # Dados de demonstração
│   │
│   ├── 📁 pages/
│   │   ├── MapPage.tsx              # Página principal do mapa
│   │   └── TimelinePage.tsx         # Página de timeline
│   │
│   ├── App.tsx                      # Router e layout
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Estilos globais + Tailwind
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 tailwind.config.js
├── 📄 vite.config.ts
└── 📄 README.md
```

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                        FONTES DE DADOS                          │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  API Rio    │   Excel     │    Mock     │   Câmeras   │   KMZ   │
│  (primário) │ (fallback)  │ (fallback)  │    COR      │ Rotas   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
       │             │             │             │           │
       └─────────────┴──────┬──────┴─────────────┴───────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │        useBlocos()          │
              │   Hook de carregamento      │
              │   com fallback automático   │
              └─────────────┬───────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │        useFilters()         │
              │   Filtragem reativa         │
              │   Data/Zona/Subpref/Tipo    │
              └─────────────┬───────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │   Mapa    │    │  Sidebar  │    │  Alertas  │
    │  Leaflet  │    │   Lista   │    │  Sistema  │
    └───────────┘    └───────────┘    └───────────┘
```

---

## 🔌 Integrações de API

### API Oficial de Blocos (Prefeitura do Rio)

```
Endpoint: https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRua.rule
Método: POST
Parâmetros: sys=BLO&id=blocosderua&ano=2026
```

| Campo | Descrição |
|-------|-----------|
| `NOME_EVENTO` | Nome do bloco |
| `LATITUDE` / `LONGITUDE` | Coordenadas |
| `PUBLICO_ESTIMADO` | Público esperado |
| `SUBPREFEITURA` | Subprefeitura responsável |
| `DATA_EVENTO` | Data no formato DD/MM/YYYY |
| `HORA_INICIO` / `HORA_TERMINO` | Horários |
| `LOCAL_CONCENTRACAO` | Ponto de encontro |
| `SITUACAO` | Status (ATIVO, PEDIDO DE CADASTRO, etc) |

**Nota**: Apenas blocos com `SITUACAO = "ATIVO"` são exibidos.

### API de Câmeras (COCR)

```
Endpoint: https://aplicativo.cocr.com.br/cameras_api
Formato: CSV (latitude;longitude;nome;codigo)
Total: 4.167 câmeras
```

### OSRM (Roteamento)

```
Endpoint: https://router.project-osrm.org/route/v1/driving/
Parâmetros: {origem};{destino}?overview=full&geometries=geojson
```

### Waze Live Alerts

```
Endpoint: https://www.waze.com/row-rtserver/web/TGeoRSS
Parâmetros: format=JSON&ma=600&mj=100&mu=100&...
```

### Stream de Vídeo (Tixxi)

```
URL: https://dev.tixxi.rio/outvideo3/?CODE={codigo}&KEY=G5325
Formato: MJPEG
```

---

## 🎨 Personalização

### Cores do Tema

```javascript
// tailwind.config.js
colors: {
  'cor-bg-primary': '#0a0a1a',      // Fundo escuro
  'cor-bg-secondary': '#1a1a3a',    // Fundo secundário
  'cor-accent-orange': '#FF6B35',   // Laranja (blocos)
  'cor-accent-pink': '#FF3D91',     // Rosa (parados)
  'cor-accent-purple': '#7B68EE',   // Roxo (deslocamento)
  'cor-accent-green': '#00D4AA',    // Verde (público)
}
```

### Cores por Subprefeitura

| Subprefeitura | Cor | Hex |
|---------------|-----|-----|
| CENTRO | 🔴 Vermelho | `#FF6B6B` |
| ZONA SUL | 🔵 Turquesa | `#4ECDC4` |
| GRANDE TIJUCA | 🔵 Azul Claro | `#45B7D1` |
| ZONA NORTE | 🟢 Verde | `#96CEB4` |
| ILHAS | 🟣 Lilás | `#DDA0DD` |
| ZONA OESTE 1 | 🟡 Amarelo | `#F7DC6F` |
| ZONA OESTE 2 | 🟣 Roxo | `#BB8FCE` |
| ZONA OESTE 3 | 🔵 Azul | `#85C1E9` |
| BARRA/RECREIO | 🟠 Dourado | `#F8B500` |
| JACAREPAGUÁ | 🟢 Verde Claro | `#82E0AA` |

### Configurações de Alertas

```typescript
// Limiares de tempo (minutos)
ALERTA_ALTA_PRIORIDADE: 30      // < 30min para início
ALERTA_MEDIA_PRIORIDADE: 60     // < 1h para início
ALERTA_BAIXA_PRIORIDADE: 120    // < 2h para início

// Raio de câmeras (metros)
RAIO_CAMERAS: 300

// Raio de alertas Waze (metros)
RAIO_WAZE: 500
```

---

## 📊 Modelo de Dados

### Interface Bloco

```typescript
interface Bloco {
  id: number;
  nome: string;
  data: string;                    // YYYY-MM-DD
  dataRelativa: string;            // "SÁBADO DE CARNAVAL"
  bairro: string;
  subprefeitura: string;
  regiao: string;                  // "CENTRO" | "ZONA SUL" | "ZONA NORTE" | "ZONA OESTE"
  publicoEstimado: number;
  lat: number;
  lng: number;
  formaApresentacao: string;       // "COM DESLOCAMENTO" | "PARADO"
  temPercurso: boolean;
  localConcentracao?: string;
  localDispersao?: string;
  percursoDetalhado?: string;
  percurso?: PontoPercurso[];
  horaInicio?: string;
  horaTermino?: string;
  horaConcentracao?: string;
  estrutura?: string;
  situacao?: string;
}
```

### Interface Filtros

```typescript
interface Filtros {
  data: string;           // "hoje" | "todos" | "YYYY-MM-DD"
  zona: string;           // "todos" | zona específica
  subprefeitura: string;  // "todos" | subprefeitura específica
  tipo: string;           // "todos" | "deslocamento" | "parado"
  busca: string;          // texto livre
}
```

### Interface Alerta

```typescript
interface AlertaBloco {
  bloco: Bloco;
  prioridade: 'alta' | 'media' | 'baixa';
  tempoRestante: number;   // minutos
  mensagem: string;
}
```

---

## ⚡ Performance

### Otimizações Implementadas

| Técnica | Benefício |
|---------|-----------|
| **React.memo** | Previne re-renders de marcadores |
| **useMemo** | Cache de cálculos de filtros e distâncias |
| **useCallback** | Estabiliza referências de callbacks |
| **Lazy Loading** | Componentes carregados sob demanda |
| **Virtual Scrolling** | Lista de blocos otimizada |
| **Debounce** | Busca textual com debounce |

### Métricas

| Métrica | Valor |
|---------|-------|
| Build Size (gzip) | ~500KB |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | 90+ |

---

## 🐛 Troubleshooting

### Blocos não aparecem

1. Verificar conexão com a API: `https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRua.rule`
2. O sistema usa fallback automático: API → Excel → Mock
3. Verificar console do navegador para erros

### Câmeras não carregam

1. Verificar acesso à API: `https://aplicativo.cocr.com.br/cameras_api`
2. Possível bloqueio de CORS (usar proxy se necessário)

### Rota não calcula

1. Permitir geolocalização no navegador
2. Verificar acesso ao OSRM: `https://router.project-osrm.org`

### Vídeo não aparece

1. Verificar conexão com Tixxi: `https://dev.tixxi.rio/outvideo3/`
2. Algumas câmeras podem estar offline temporariamente

---

## 🤝 Contribuição

### Padrão de Commits

```
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação (não afeta código)
refactor: Refatoração
test:     Testes
chore:    Manutenção
```

### Workflow

1. Fork do repositório
2. Criar branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abrir Pull Request

---

## 📜 Changelog

### v2.0.0 (Janeiro 2026)

#### Novas Funcionalidades
- ✅ Integração com API oficial da Prefeitura
- ✅ Sistema de alertas para blocos próximos de iniciar
- ✅ Planejamento de rotas com OSRM
- ✅ Alertas do Waze em tempo real
- ✅ Filtro por zona (região)
- ✅ Página de Timeline
- ✅ Tour automático pelos blocos
- ✅ Marcadores pulsantes para blocos ativos
- ✅ Logo clicável para recarregar página
- ✅ Botões padronizados no header

#### Melhorias
- 🔄 Design responsivo aprimorado
- 🔄 Performance otimizada
- 🔄 Fallback automático de dados

### v1.0.0 (Janeiro 2026)

- 🚀 Lançamento inicial
- 🗺️ Mapa interativo com Leaflet
- 🔍 Filtros básicos
- 📹 Integração com câmeras do COR

---

## 📞 Contato

<div align="center">

**Centro de Operações Rio (COR)**

Prefeitura da Cidade do Rio de Janeiro

📧 servicos.cor@cor.rio

🌐 [cor.rio](https://cor.rio)

</div>

---

<div align="center">

**Desenvolvido com ❤️ para o Carnaval Rio 2026**

React • TypeScript • Leaflet • TailwindCSS

</div>
