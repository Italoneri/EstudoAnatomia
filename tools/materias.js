// Funções comuns para trabalhar com várias matérias.
// - dados/materias.json guarda a ordem das matérias na tela inicial: { "ordem": ["id1", "id2", ...] }
// - dados/<id>.json é o banco de cada matéria: { id, nome, cor, kits[] }
// - o bloco `const DB = { materias: [ ... ] };` do index.html é montado juntando essas matérias na ordem.
// JSON com indent de 1 espaço; a quebra de linha (CRLF no checkout do Windows, LF no repositório)
// é detectada no próprio arquivo, então o round-trip mantém o diff só no que mudou.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DADOS = path.join(ROOT, "dados");
const HTML_PATH = path.join(ROOT, "index.html");
const ORDEM_PATH = path.join(DADOS, "materias.json");

const eolOf = (text) => (text.includes("\r\n") ? "\r\n" : "\n");
const serialize = (data, eol) => JSON.stringify(data, null, 1).replace(/\n/g, eol);
const materiaPath = (id) => path.join(DADOS, `${id}.json`);

function ordem() {
  return JSON.parse(fs.readFileSync(ORDEM_PATH, "utf8")).ordem;
}

function lerMateria(id) {
  if (!ordem().includes(id)) {
    throw new Error(`matéria "${id}" não está em dados/materias.json (ids válidos: ${ordem().join(", ")})`);
  }
  return JSON.parse(fs.readFileSync(materiaPath(id), "utf8"));
}

function gravarMateria(materia) {
  const file = materiaPath(materia.id);
  const eol = fs.existsSync(file) ? eolOf(fs.readFileSync(file, "utf8")) : "\n";
  fs.writeFileSync(file, serialize(materia, eol));
}

function todasMaterias() {
  return ordem().map((id) => JSON.parse(fs.readFileSync(materiaPath(id), "utf8")));
}

// O id do kit identifica o progresso salvo no navegador, então precisa ser único entre TODAS as matérias.
function idsRepetidos(materias) {
  const dono = {};
  const repetidos = [];
  for (const m of materias) {
    for (const k of m.kits) {
      if (dono[k.id]) repetidos.push(`${k.id} (em ${dono[k.id]} e ${m.id})`);
      else dono[k.id] = m.id;
    }
  }
  return repetidos;
}

// Reescreve o bloco `const DB` do index.html com todas as matérias de dados/.
function atualizarHtml() {
  const materias = todasMaterias();
  const repetidos = idsRepetidos(materias);
  if (repetidos.length) throw new Error(`ids de kit repetidos: ${repetidos.join(", ")}`);
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const eol = eolOf(html);
  const DB_START = `const DB = { materias: [${eol}`;
  const DB_END = `${eol}] };`;
  const start = html.indexOf(DB_START);
  const end = html.indexOf(DB_END, start);
  if (start < 0 || end < 0) throw new Error("bloco `const DB` não encontrado no index.html");
  const bloco = materias.map((m) => serialize(m, eol)).join("," + eol);
  fs.writeFileSync(HTML_PATH, html.slice(0, start + DB_START.length) + bloco + html.slice(end));
  return materias;
}

module.exports = { ROOT, DADOS, ordem, lerMateria, gravarMateria, todasMaterias, idsRepetidos, atualizarHtml };
