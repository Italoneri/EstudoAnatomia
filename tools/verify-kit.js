// Valida um JSON de banco (kit avulso ou dados/anatopato.json) contra as metas do CLAUDE.md.
// Uso: node tools/verify-kit.js <arquivo.json>
const fs = require("fs");

const db = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const errors = [];
const need = (ok, message) => { if (!ok) errors.push(message); };

const NIVEIS = new Set(["facil", "medio", "dificil"]);
const FONTE = /, slides? \d+((, | y |[-–])\d+)*$/;
const tokens = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3);
const jaccard = (a, b) => {
  const A = new Set(a);
  const B = new Set(b);
  const shared = [...A].filter((x) => B.has(x)).length;
  return shared / (A.size + B.size - shared || 1);
};

function checkPergunta(p, tag) {
  need(typeof p.pergunta === "string" && p.pergunta.length > 10, `${tag}: pergunta`);
  need(Array.isArray(p.opcoes) && p.opcoes.length === 4 && new Set(p.opcoes).size === 4, `${tag}: opcoes`);
  need(Number.isInteger(p.correta) && p.correta >= 0 && p.correta <= 3, `${tag}: correta`);
  need(Array.isArray(p.explicacao) && p.explicacao.length === 3, `${tag}: explicacao`);
  need(typeof p.fonte === "string" && FONTE.test(p.fonte), `${tag}: fonte`);
  need(typeof p.bloco === "string" && p.bloco.length > 0, `${tag}: bloco`);
  need(NIVEIS.has(p.nivel), `${tag}: nivel`);
  need(typeof p.complemento === "boolean", `${tag}: complemento`);
  need(!p.opcoes.some((o) => /(todas|ninguna) de las anteriores/i.test(o)), `${tag}: todas/ninguna`);
  need(!/\b(siempre|nunca)\b/i.test(p.opcoes[p.correta] || ""), `${tag}: absoluto na correta`);
}

function lengthRank(p) {
  const lengths = p.opcoes.map((o) => o.length);
  const own = lengths[p.correta];
  const others = lengths.filter((_, i) => i !== p.correta);
  return { longest: others.every((l) => own > l), shortest: others.every((l) => own < l) };
}

function nearDuplicates(perguntas) {
  const bags = perguntas.map((p) => tokens(p.pergunta + " " + p.opcoes[p.correta]));
  const pairs = [];
  for (let i = 0; i < bags.length; i++) {
    for (let j = i + 1; j < bags.length; j++) {
      const score = jaccard(bags[i], bags[j]);
      if (score >= 0.5) pairs.push(`#${i + 1}~#${j + 1} (${score.toFixed(2)})`);
    }
  }
  return pairs;
}

const pct = (part, whole) => `${((100 * part) / whole).toFixed(1)}%`;
const total = { pos: [0, 0, 0, 0], n: 0, longest: 0, shortest: 0, complemento: 0, incorrecta: 0, nivel: {} };

need(db.id === "anatopato" && Array.isArray(db.kits), "raiz: precisa de id 'anatopato' e kits[]");
for (const kit of db.kits) {
  ["id", "tema", "titulo", "icone", "materiais", "perguntas", "flashcards"].forEach((f) => need(kit[f] !== undefined, `${kit.id}: falta ${f}`));
  const pos = [0, 0, 0, 0];
  const blocos = {};
  let longest = 0;
  let shortest = 0;
  kit.perguntas.forEach((p, i) => {
    checkPergunta(p, `${kit.id}#${i + 1}`);
    pos[p.correta]++;
    const rank = lengthRank(p);
    longest += rank.longest;
    shortest += rank.shortest;
    blocos[p.bloco] = (blocos[p.bloco] || 0) + 1;
    total.complemento += p.complemento ? 1 : 0;
    total.incorrecta += /INCORRECTA/.test(p.pergunta) ? 1 : 0;
    total.nivel[p.nivel] = (total.nivel[p.nivel] || 0) + 1;
  });
  kit.flashcards.forEach((f, i) => need(f.frente && f.verso && FONTE.test(f.fonte || ""), `${kit.id} flashcard#${i + 1}`));

  const n = kit.perguntas.length;
  const near = nearDuplicates(kit.perguntas);
  console.log(`\n[${kit.id}] ${n} questões, ${kit.flashcards.length} flashcards`);
  console.log("  blocos:", JSON.stringify(blocos));
  console.log("  posições 0/1/2/3:", pos.join("/"), "→", pos.map((x) => pct(x, n)).join(" "));
  console.log(`  correta = mais longa: ${longest} (${pct(longest, n)}) | mais curta: ${shortest} (${pct(shortest, n)})`);
  console.log("  quase iguais (Jaccard≥0.5):", near.length ? near.join(", ") : "nenhuma");
  pos.forEach((x, i) => (total.pos[i] += x));
  total.n += n;
  total.longest += longest;
  total.shortest += shortest;
}

console.log(`\n[TOTAL] ${total.n} questões | posições ${total.pos.join("/")} | mais longa ${pct(total.longest, total.n)} | mais curta ${pct(total.shortest, total.n)}`);
console.log(`  complemento:true = ${total.complemento} | INCORRECTA = ${total.incorrecta} (${pct(total.incorrecta, total.n)}) | níveis ${JSON.stringify(total.nivel)}`);
console.log(errors.length ? `\nERROS (${errors.length}):\n  ${errors.join("\n  ")}` : "\nEstrutura: OK, nenhum erro");
process.exitCode = errors.length ? 1 : 0;
