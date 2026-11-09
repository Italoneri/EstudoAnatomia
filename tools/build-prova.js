// Monta o JSON de um kit de "Provas anteriores" a partir de tools/kits/provas-anteriores-<n>.js.
// Uso: node tools/build-prova.js tools/kits/provas-anteriores-<n>.js <saida.json> [seed]
// Diferenças em relação ao build-kit.js:
// - cada questão mantém o número de alternativas da prova original (2 a 5);
// - questões com alternativas que dependem da ordem ("Todas son correctas", Verdadero/Falso,
//   intervalos de tempo) usam `o` (lista na ordem) + `k` (índice da correta) e não são embaralhadas;
// - `fonte` é a prova de origem e o número da pergunta, não um slide.
const fs = require("fs");
const path = require("path");

const [srcArg, outArg, seedArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error("uso: node tools/build-prova.js tools/kits/provas-anteriores-<n>.js <saida.json> [seed]");
  process.exit(1);
}

const { KIT, BLOCOS, Q, FLASH } = require(path.resolve(srcArg));

function seededRandom(seed) {
  let state = seed;
  return () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
}
const rand = seededRandom(Number(seedArg || 20261109));

function shuffle(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Posições da correta balanceadas por número de alternativas (cada posição recebe a mesma cota).
const pools = {};
Q.forEach((item) => {
  if (item.o) return;
  const n = item.d.length + 1;
  pools[n] = (pools[n] || 0) + 1;
});
const positions = {};
Object.entries(pools).forEach(([n, count]) => {
  positions[n] = shuffle(Array.from({ length: count }, (_, i) => i % Number(n)));
});

function toPergunta(item, index) {
  const tag = `item ${index + 1}`;
  if (!BLOCOS[item.b]) throw new Error(`build: ${tag} com bloco inexistente ${item.b}`);
  if (!Array.isArray(item.e) || item.e.length !== 3) throw new Error(`build: ${tag} precisa de 3 explicações`);
  if (!item.f) throw new Error(`build: ${tag} sem fonte`);
  let opcoes;
  let correta;
  if (item.o) {
    opcoes = item.o.slice();
    correta = item.k;
  } else {
    const n = item.d.length + 1;
    correta = positions[n].pop();
    opcoes = shuffle(item.d);
    opcoes.splice(correta, 0, item.c);
  }
  if (opcoes.length < 2 || opcoes.length > 5) throw new Error(`build: ${tag} precisa de 2 a 5 alternativas`);
  if (!(correta >= 0 && correta < opcoes.length)) throw new Error(`build: ${tag} com correta inválida`);
  return {
    pergunta: item.q,
    opcoes,
    correta,
    explicacao: item.e,
    fonte: item.f,
    bloco: BLOCOS[item.b],
    nivel: item.n,
    complemento: Boolean(item.x),
  };
}

const kit = {
  id: KIT.id,
  tema: KIT.tema,
  titulo: KIT.titulo,
  icone: "hospital",
  separado: true,
  materiais: KIT.materiais.map((nome) => ({ nome, tipo: "prova" })),
  perguntas: Q.map(toPergunta),
  flashcards: FLASH.map((f) => ({ frente: f.f, verso: f.v, fonte: f.s })),
};

const output = { id: "anatopato", nome: "Anatomía Patológica", kits: [kit] };
fs.writeFileSync(outArg, JSON.stringify(output, null, 1) + "\n");
console.log(`${kit.id}: ${kit.perguntas.length} questões, ${kit.flashcards.length} flashcards -> ${outArg}`);
