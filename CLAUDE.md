# EstudoAnatomia: gerar banco de questões a partir de slides

App de estudo de **Anatomía Patológica** (um único `index.html`). O usuário manda um PDF de slides da aula e pede um banco de questões. Este documento é o fluxo completo, já validado no kit `vasos-sanguineos-2`.

Fluxo: localizar PDF → **Etapa 1 (análise, PARAR e esperar confirmação)** → Etapa 2 (questões) → Etapa 3 (verificação e correção) → integrar no repo → commit.

## Onde estão as coisas

| Caminho | O que é |
|---|---|
| `index.html` | O app. Banco embutido no bloco `const DB = { materias: [ ... ] };` |
| `dados/anatopato.json` | O mesmo banco em JSON (fonte de verdade, idêntico ao embutido) |
| `tools/extract_pdf.py` | Texto por página + render das páginas só-imagem |
| `tools/kits/<id>.js` | Fonte compacta de cada kit (questões escritas à mão) |
| `tools/build-kit.js` | Fonte compacta → JSON do kit, sorteando a posição da correta |
| `tools/verify-kit.js` | Etapa 3: estrutura, distribuição, tamanho, duplicadas, complemento |
| `tools/merge-kit.js` | Insere/substitui o kit em `dados/anatopato.json` e no `index.html` |

Kits atuais: `neoplasia-1..3`, `vasos-sanguineos-1..2`. O `tema` agrupa kits ("Neoplasia", "Vasos sanguíneos"). O app cria sozinho os cards "<Tema> – todos" e "Geral"; **nunca criar kit "todos"**.

## Regras do usuário (obrigatórias)

### Não inventar
- Toda questão se baseia no conteúdo dos slides. Nada de assuntos que não aparecem neles.
- Campo `fonte` com arquivo e slide: `"<nome do arquivo>.pdf, slide N"`.
- Conhecimento geral para completar uma explicação → `"complemento": true`. Usar o mínimo possível e **marcar sempre que usar**, mesmo que seja só uma frase de fisiopatologia na explicação.
- Se um bloco não tem conteúdo para ~20 questões boas, fazer menos e dizer quantas e por quê. Melhor 12 sólidas que 20 com enchimento.
- Questões no idioma dos slides (espanhol).
- Se um slide contradiz a literatura, apontar na Etapa 1 e, por padrão, **não fazer questão sobre esse ponto** (decisão já aprovada pelo usuário).
- Se outro kit já cobre um assunto (ex.: HHV8/Kaposi em `neoplasia-2`), não repetir a mesma ideia; focar no ângulo novo.

### Etapa 1: análise (PARAR e esperar confirmação)
1. Extrair o texto (e notas do apresentador, se houver; PDF normalmente não tem, então avisar).
2. Identificar o tema geral e dividir em blocos (subtemas) com os slides de cada um.
3. Mostrar a tabela: `Arquivo | Bloco | Slides | Nº de questões proposto` (até ~20 por bloco, proporcional ao conteúdo), mais pontos de atenção (slides conflitantes, sobreposição com kits existentes, slides só-imagem).
4. Perguntar e **esperar**. "vai fundo" / "pode seguir" = aprovar tudo, inclusive as recomendações e a integração completa no repo.

### Etapa 2: questões
- 4 alternativas, só UMA correta e sem ambiguidade.
- Distratores plausíveis do mesmo assunto (outras lesões, mecanismos ou achados do próprio material). Proibido "todas/ninguna de las anteriores" e alternativas absurdas.
- Níveis: ~30% memorização (`facil`), ~50% compreensão/mecanismo (`medio`), ~20% aplicação: caso clínico curto ou correlação clínico-patológica (`dificil`).
- Formatos variados: "¿Cuál es…?", "¿Qué hallazgo…?", caso clínico curto, "Señale la INCORRECTA" (máx. 10%, INCORRECTA em maiúsculas).
- Não repetir a mesma ideia em duas questões.
- 10–15 flashcards por arquivo com os conceitos-chave.

### Evitar padrões de IA
- Correta distribuída ~25% em cada posição 0/1/2/3 (nenhuma > 30%), sem sequências previsíveis. O `build-kit.js` garante isso.
- A correta **não** pode ser sistematicamente a mais longa: meta ≤ 30%. Em ~25% ela pode ser a mais curta (sem passar muito disso, senão vira o padrão inverso).
- Absolutos ("siempre", "nunca") só nos distratores.
- Termo técnico do enunciado não pode aparecer só na correta (pista lexical). Se a correta precisa dele, colocar o termo também em algum distrator.

### Explicação
Campo `explicacao`: 3 bullets curtos (1–2 frases cada):
1. Por que a correta está certa (conceito central).
2. O mecanismo ou achado que sustenta isso.
3. Por que o distrator mais tentador está errado, ou a correlação clínica.

### Formato do JSON
```json
{
  "id": "anatopato",
  "nome": "Anatomía Patológica",
  "kits": [{
    "id": "<tema>-<n>",
    "tema": "<Nome do tema>",
    "titulo": "<Tema> <n> – <assunto do arquivo>",
    "icone": "hospital",
    "materiais": [{ "nome": "<nome do arquivo>", "tipo": "ppt" }],
    "perguntas": [{
      "pergunta": "…", "opcoes": ["…","…","…","…"], "correta": 0,
      "explicacao": ["…","…","…"], "fonte": "Arquivo, slide N",
      "bloco": "<subtema>", "nivel": "facil|medio|dificil", "complemento": false
    }],
    "flashcards": [{ "frente": "…", "verso": "…", "fonte": "Arquivo, slide N" }]
  }]
}
```
Um kit por arquivo. `id` em kebab-case sem acento (`vasos-sanguineos-3`).

### Etapa 3: verificação
Rodar `tools/verify-kit.js` e mostrar: JSON válido e estrutura OK; posições 0/1/2/3 por kit e total; % correta mais longa (≤ 30%) e mais curta (~25%); sem `fonte`, duplicadas ou quase iguais; quantas `complemento: true`. Corrigir o que estiver fora da meta e rodar de novo.

## Passo a passo técnico (Windows, Git Bash)

### 1. Achar e copiar o PDF
O PDF fica em `C:/Users/Perdido/Downloads`. Nomes têm acento: usar glob (`cp "C:/Users/Perdido/Downloads/"Clase\ 18*.pdf …`), porque o caminho literal com `í` falha no `cp`. Copiar para o scratchpad da sessão com nome simples (`aula.pdf`).

### 2. Extrair
```bash
python -m pip install --quiet --target "$SCRATCH/pylib" pymupdf   # uma vez por sessão
python -I tools/extract_pdf.py "$SCRATCH/aula.pdf" "$SCRATCH/extract" "$SCRATCH/pylib"
```
- `pages.txt`: texto por página com marcador `=== P<n>`. **n = número do slide** usado em `fonte`.
- `img/pNNN.png`: páginas com pouco texto. **Abrir todas com Read**: tabelas e esquemas (classificações, quadros comparativos) viram questão; fotos de histologia em geral não.
- Armadilhas já encontradas:
  - Read em PDF não funciona aqui (falta `pdftoppm`). Use o script.
  - `pdftotext` existe, mas contar páginas por `\f` erra o número dos slides. Use o script.
  - A saída do `pdftotext` sem `-enc UTF-8` vem em Latin-1 e o Read mostra `�`.
  - A capa pode ter número de aula diferente do nome do arquivo. Em `fonte`, vale o **nome do arquivo**.

### 3. Escrever a fonte compacta `tools/kits/<id>.js`
Usar `tools/kits/vasos-sanguineos-2.js` como modelo:
```js
const KIT = { id, tema, titulo, arquivo: "<nome exato do PDF>" };
const BLOCOS = { 1: "Nombre del bloque", ... };
const Q = [
  { b:1, n:"medio", s:7, x:true /* só se complemento */,
    q:"Pregunta…", c:"Correcta", d:["Distractor","Distractor","Distractor"],
    e:["Por qué es correcta","Mecanismo/hallazgo","Por qué el distractor tentador está mal"] },
];
const FLASH = [ { s:4, f:"Frente", v:"Verso" } ];
module.exports = { KIT, BLOCOS, Q, FLASH };
```
Escrever com a correta em `c`; a posição é sorteada no build. Ao escrever, já deixar `c` com tamanho parecido aos distratores (não o mais detalhado).

### 4. Build, verificar, corrigir
```bash
node tools/build-kit.js tools/kits/<id>.js "$SCRATCH/<id>.json"
node tools/verify-kit.js "$SCRATCH/<id>.json"
```
Na primeira rodada do vasos-2, a correta era a mais longa em 48,5%. Foi corrigido encurtando a correta ou alongando um distrator, até 15%. Para achar os casos:
```bash
node -e 'const {Q}=require("./tools/kits/<id>.js");Q.forEach((q,i)=>{const m=Math.max(...q.d.map(x=>x.length));if(q.c.length>m)console.log(i+1,q.c)})'
```
Fazer o mesmo com `Math.min` para "mais curta" e checar pistas lexicais. Editar sempre a fonte `tools/kits/<id>.js` e refazer o build; nunca editar o JSON gerado à mão.

### 5. Integrar e entregar
```bash
node tools/merge-kit.js "$SCRATCH/<id>.json"     # atualiza dados/anatopato.json e index.html
node tools/verify-kit.js dados/anatopato.json    # todos os kits devem passar
```
- `anatopato.json` e o bloco do `index.html` usam JSON com indent de **1 espaço** e **CRLF**, sem newline final. O `merge-kit.js` preserva isso, então o diff fica só com o kit novo. Rodar duas vezes não muda nada.
- Atualizar a tabela "Conteúdo atual" do `README.md` (Tema | Arquivo | Questões).
- Conferir se o JS do app ainda parseia:
  ```bash
  node -e 'const h=require("fs").readFileSync("index.html","utf8");[...h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].forEach(m=>new Function(m[1]));console.log("ok")'
  ```

### 6. Git
- Branch: `feat/<id>` (sem Jira). Commit: `feat: add <tema> <n> question bank`.
- Commitar ao terminar. Push/PR só se o usuário pedir.

### 7. Ver no navegador
`python -m http.server 8765 --bind 127.0.0.1` em background e abrir `http://localhost:8765/`. A porta **8080 está ocupada/bloqueada** nesta máquina (WinError 10013). Alternativa sem servidor: abrir o `index.html` com duplo clique.

## Kits de "Provas anteriores"
Questões reais de provas antigas, separadas por tema (`provas-anteriores-1..4`). Diferem dos kits de slides:
- Fonte compacta em `tools/kits/provas-anteriores-<n>.js`; nomes das provas em `tools/kits/provas-fontes.js`. `fonte` = `"<prova>, pregunta N"`.
- Build com `node tools/build-prova.js` (não o `build-kit.js`): mantém 2 a 5 alternativas como na prova. Itens com ordem que importa ("Todas son correctas", Verdadero/Falso, intervalos de tempo) usam `o` + `k` e não são embaralhados.
- O kit sai com `"separado": true`: o app cria "Provas anteriores – todos" e o deixa fora do "Geral". O `verify-kit.js` aplica as regras de 2–5 alternativas e de `fonte` de prova só a esses kits.
- Respostas: gabarito oficial quando a prova trazia; senão, a resposta pelo material da aula. Opções adaptadas (por ambiguidade) são avisadas na explicação.

## Resumo final para o usuário
Entregar: tabela de questões por bloco, resultado da verificação (posições, % mais longa/curta, duplicadas, complemento, INCORRECTA, níveis) e o que ficou de fora e por quê.
