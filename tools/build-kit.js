// Monta o JSON de um kit a partir da fonte compacta em tools/kits/<id>.js.
// Uso: node tools/build-kit.js tools/kits/<id>.js <saida.json> [seed]
// Sorteia a posição da correta com distribuição exata 25% e no máx. 3 iguais seguidas.
const fs = require("fs");
const path = require("path");

const [srcArg, outArg, seedArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error("uso: node tools/build-kit.js tools/kits/<id>.js <saida.json> [seed]");
  process.exit(1);
}

const { KIT, BLOCOS, Q, FLASH } = require(path.resolve(srcArg));
const fonte = (slide) => `${KIT.arquivo}, slide ${slide}`;

function seededRandom(seed) {
  let state = seed;
  return () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
}
const rand = seededRandom(Number(seedArg || 20261107));

function shuffle(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function longestRun(values) {
  let best = 0;
  let current = 0;
  values.forEach((v, i) => {
    current = i > 0 && values[i - 1] === v ? current + 1 : 1;
    best = Math.max(best, current);
  });
  return best;
}

function balancedPositions(count) {
  const base = Array.from({ length: count }, (_, i) => i % 4);
  for (let attempt = 0; attempt < 20000; attempt++) {
    const candidate = shuffle(base);
    if (longestRun(candidate) <= 3) return candidate;
  }
  throw new Error("build: nenhuma sequência balanceada encontrada");
}

function toPergunta(item, index, correctPosition) {
  if (item.d.length !== 3 || item.e.length !== 3) throw new Error(`build: item ${index + 1} precisa de 3 distratores e 3 explicações`);
  if (!BLOCOS[item.b]) throw new Error(`build: item ${index + 1} com bloco inexistente ${item.b}`);
  const opcoes = shuffle(item.d);
  opcoes.splice(correctPosition, 0, item.c);
  return {
    pergunta: item.q,
    opcoes,
    correta: correctPosition,
    explicacao: item.e,
    fonte: fonte(item.s),
    bloco: BLOCOS[item.b],
    nivel: item.n,
    complemento: Boolean(item.x),
  };
}

const positions = balancedPositions(Q.length);
const kit = {
  id: KIT.id,
  tema: KIT.tema,
  titulo: KIT.titulo,
  icone: "hospital",
  materiais: [{ nome: KIT.arquivo, tipo: "ppt" }],
  perguntas: Q.map((item, i) => toPergunta(item, i, positions[i])),
  flashcards: FLASH.map((f) => ({ frente: f.f, verso: f.v, fonte: fonte(f.s) })),
};

const output = { id: "anatopato", nome: "Anatomía Patológica", kits: [kit] };
fs.writeFileSync(outArg, JSON.stringify(output, null, 1) + "\n");
console.log(`${kit.id}: ${kit.perguntas.length} questões, ${kit.flashcards.length} flashcards -> ${outArg}`);
