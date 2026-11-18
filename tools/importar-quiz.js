// Traz o banco do app fisiopato-quiz (github.com/Italoneri/fisiopato-quiz) para a matéria fisiopato-1.
// Uso: node tools/importar-quiz.js <caminho do index.html do fisiopato-quiz>
// Depois: node tools/merge-kit.js   (remonta o index.html)
// Rodar de novo substitui os kits "fisio-*" pelos do arquivo informado (o progresso se mantém
// enquanto a ordem das perguntas de cada tema não mudar).
const fs = require("fs");
const vm = require("vm");
const { lerMateria, gravarMateria } = require("./materias");

const arquivo = process.argv[2];
if (!arquivo) {
  console.error("uso: node tools/importar-quiz.js <index.html do fisiopato-quiz>");
  process.exit(1);
}

// Tema do quiz -> agrupamento na tela inicial (kits com o mesmo tema viram uma seção com "<Tema> – todos")
const GRUPOS = {
  Dislipidemias: ["Cardiovascular", "coracao"],
  Aterosclerosis: ["Cardiovascular", "coracao"],
  "Circulación arterial": ["Cardiovascular", "coracao"],
  "Circulación venosa": ["Cardiovascular", "coracao"],
  "Hipertensión arterial": ["Cardiovascular", "coracao"],
  Arritmias: ["Cardiovascular", "coracao"],
  "Valvulopatías": ["Cardiovascular", "coracao"],
  "Ácido-base": ["Equilibrio ácido-base", "gota"],
  "Cuestionario del profesor": ["Repaso", "cerebro"],
  "Casos clínicos": ["Repaso", "cerebro"],
};
const FONTE = "Material de clase – Dr. Luis Paniagua";

// Lê só o array `const BANCO = [...]`, sem executar o resto da página.
function lerBanco(html) {
  const inicio = html.indexOf("[", html.indexOf("const BANCO = ["));
  let depth = 0;
  let str = null;
  let escape = false;
  for (let p = inicio; p < html.length; p++) {
    const c = html[p];
    if (str) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "/" && html[p + 1] === "*") { p = html.indexOf("*/", p) + 1; continue; }
    if (c === "[") depth++;
    if (c === "]" && --depth === 0) {
      return vm.runInNewContext(`(${html.slice(inicio, p + 1)})`, Object.create(null), { timeout: 1000 });
    }
  }
  throw new Error("const BANCO não encontrado");
}

const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const banco = lerBanco(fs.readFileSync(arquivo, "utf8"));
const temas = [...new Set(banco.map((q) => q.t))];
const semGrupo = temas.filter((t) => !GRUPOS[t]);
if (semGrupo.length) throw new Error(`temas novos sem agrupamento em GRUPOS: ${semGrupo.join(", ")}`);

const kits = temas.map((t) => ({
  id: `fisio-${slug(t)}`,
  tema: GRUPOS[t][0],
  titulo: t,
  icone: GRUPOS[t][1],
  origem: "importado",
  materiais: [{ nome: FONTE, tipo: "aula" }],
  perguntas: banco.filter((q) => q.t === t).map((q) => ({
    pergunta: q.q,
    opcoes: q.o,
    correta: q.a,
    explicacao: [q.e],
  })),
  flashcards: [],
}));

const materia = lerMateria("fisiopato-1");
materia.kits = materia.kits.filter((k) => !k.id.startsWith("fisio-")).concat(kits);
gravarMateria(materia);
kits.forEach((k) => console.log(`${k.id} [${k.tema}]: ${k.perguntas.length}`));
console.log(`total: ${banco.length} questões`);
