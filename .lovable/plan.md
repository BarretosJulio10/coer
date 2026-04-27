# Página de Cadastro — Comitês COER

## Visão geral

Site institucional para a chamada de voluntários da COER (Associação Nacional de Cooperação em Rastreamento, Monitoramento, Pronta Resposta e Gerenciamento de Riscos), com:
1. **Página pública** com a chamada, resumo dos 10 comitês e formulário de candidatura.
2. **Página de detalhes** de cada comitê.
3. **Painel admin** protegido por senha para visualizar, gerenciar status e exportar candidaturas.

Todo o conteúdo do `.docx` enviado será usado integralmente (carta do fundador, regras dos comitês, descrição de cada comitê, vagas, dedicação, diretor responsável).

---

## Identidade visual

**Direção**: institucional, sério, limpo — linguagem de associação técnica nacional (ABNT, CNI, federações de classe), não startup. Nada de gradientes coloridos, glassmorphism, blobs, emojis decorativos ou cards com sombra "fofa" — esses são marcadores de design IA-genérico.

**Logo**: a logo enviada (escudo + globo + pin + sinal Wi-Fi) será usada no header, no rodapé e como favicon. Cores extraídas dela:
- **Azul-marinho profundo** `#0B1F3A` — cor institucional principal (textos, header, títulos)
- **Dourado/âmbar** `#C9A14A` — acento exclusivo (linhas divisórias, destaques pontuais, código dos comitês "C1, C2…")
- **Off-white quente** `#F6F3EC` — fundo principal (sensação de papel, documento oficial)
- **Cinza grafite** `#3A3A3A` — corpo de texto
- **Linha hairline** `#D9D2C2` — bordas e separadores discretos

**Tipografia**:
- Títulos: **Fraunces** (serifada contemporânea, transmite seriedade de instituição estabelecida sem ser arcaica)
- Corpo: **Inter** (humanista, alta legibilidade em português)

**Linguagem visual concreta** (anti-IA):
- Layout em colunas com **régua dourada fina** (1px) separando blocos — referência a documentos institucionais e relatórios oficiais.
- Numeração **C1, C2 … C10** em destaque tipográfico grande (não em "badges" com fundo colorido).
- Selos discretos: "Fundada em 2026 — Campinas/SP", "Documento oficial — Chamada de voluntários".
- Pequena marca d'água do escudo da logo em opacidade baixa em seções específicas.
- **Sem ícones decorativos genéricos** (lucide aleatório). Apenas marcadores tipográficos (→, §, n°) e a própria logo.
- Botões retangulares, sem cantos super-arredondados; estados hover sutis (sublinhado dourado, não mudança de cor brusca).
- Fotos / imagens: **nenhuma stock photo**. Apenas a logo + composições tipográficas.

---

## Estrutura de páginas

### `/` — Página pública

1. **Header fixo enxuto**: logo COER à esquerda + nome completo da associação em uma linha pequena ao lado + nav (Comitês, Candidatar-se, Admin).
2. **Hero institucional**:
   - Sobrelinha: "CHAMADA DE VOLUNTÁRIOS · JUNHO DE 2026 · CAMPINAS/SP"
   - Título serifado grande: *"Comitês Temáticos da COER"*
   - Subtítulo: "O que você vai fazer e por que importa"
   - Régua dourada divisória.
3. **Carta do fundador** (Douglas Gonçalves Carretero): bloco em coluna estreita, tipografia generosa, assinatura ao final — formato carta-aberta institucional.
4. **"Como funcionam os comitês"**: 6 regras do documento, em duas colunas, com numeração discreta.
5. **Índice dos 10 comitês**: tabela tipográfica (não cards coloridos) com colunas: **Cód. · Comitê · Reporta-se a · Vagas · Dedicação · [ver detalhes]**. Estilo de sumário de relatório.
6. **Formulário de candidatura**: seção dedicada em fundo levemente diferenciado, com título "Ficha de Candidatura".
7. **Rodapé**: logo, lema *"O setor que move o Brasil. A entidade que o representa."*, contato secretaria@coer.org.br, Campinas/SP, coer.org.br.

### `/comite/:codigo` — Detalhe do comitê
Para C1 a C10, layout de "página de relatório":
- Cabeçalho com código grande em dourado, nome, reporta-se a, vagas, dedicação.
- **Por que este comitê existe** — texto integral do documento.
- **O que você vai fazer concretamente** — lista numerada das atividades.
- Botão: "Candidatar-se a este comitê" (volta ao formulário com o comitê pré-selecionado).
- Link "← voltar ao índice".

### `/admin` — Painel administrativo
- Tela de login com **senha única** (validada via edge function; senha como secret no backend, nunca no cliente).
- Após autenticar:
  - Tabela de candidaturas: data, nome, empresa, WhatsApp, e-mail, comitês, status.
  - Filtros por comitê e por status.
  - Modal de detalhe com todos os campos.
  - Ações: alterar status (`pendente`, `em análise`, `aprovado`, `rejeitado`) e adicionar nota interna.
  - Botão **Exportar CSV** (UTF-8 com BOM para abrir no Excel).

---

## Formulário de candidatura

Campos validados em PT-BR:
- Nome completo (obrigatório)
- Empresa / Razão Social (obrigatório)
- WhatsApp com máscara (obrigatório)
- E-mail corporativo (obrigatório)
- **Comitês de interesse** — múltipla seleção, mínimo 1
- Minha experiência nesta área (textarea, obrigatório)
- Horas disponíveis por semana: 1 a 2 / 2 a 3 / mais de 3
- Já participei de associações do setor: Sim (qual?) / Não
- Por que quero fazer parte (opcional)
- Aceite: ciência sobre verificação de antecedentes e mandato de 2 anos

Confirmação após envio: mensagem institucional sóbria — "Candidatura recebida. A Secretaria entrará em contato pelo e-mail informado."

---

## Backend (Lovable Cloud)

### Tabelas
- **`committees`** — seed com os 10 comitês (código, nome, diretor, vagas, dedicação, "por que existe", lista de atividades).
- **`applications`** — candidaturas (dados pessoais, experiência, horas, participação anterior, motivação, status, notas internas, criado em).
- **`application_committees`** — N:N entre candidatura e comitês escolhidos.

### Segurança
- RLS ativada em todas as tabelas.
- **Insert público** permitido em `applications` e `application_committees`.
- Select/update bloqueados no cliente — só via edge function autenticada.
- Senha admin armazenada como **secret do backend**.

### Edge functions
- `admin-login` — recebe senha, retorna token de sessão curto (sessionStorage).
- `admin-list-applications` — exige token; retorna candidaturas com filtros.
- `admin-update-application` — exige token; atualiza status/notas.
- `admin-export-csv` — exige token; retorna CSV completo.

---

## Detalhes técnicos

- React + Vite + TypeScript + Tailwind + shadcn/ui.
- React Hook Form + Zod para validação.
- React Router: `/`, `/comite/:codigo`, `/admin`.
- Lovable Cloud (Supabase) para banco + edge functions.
- Logo copiada para `src/assets/coer-logo.png` e importada como módulo.
- Fontes Fraunces e Inter via Google Fonts.
- Tokens de cor da logo definidos em `index.css` como variáveis HSL (sem cores hardcoded em componentes).
- Conteúdo dos 10 comitês extraído do `.docx` e inserido como seed no banco.
- Senha admin será solicitada como secret após aprovação do plano.
