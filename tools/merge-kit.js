// Insere (ou substitui, pelo id) um kit em dados/anatopato.json e no `const DB` do index.html.
// Uso: node tools/merge-kit.js <kit.json gerado pelo build-kit>
// Os dois arquivos usam JSON com indent de 1 espaço; a quebra de linha (CRLF no checkout do Windows,
// LF no repositório) é detectada no próprio arquivo, então o round-trip mantém o diff só no kit.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "dados", "anatopato.json");
const HTML_PATH = path.join(ROOT, "index.html");
const eolOf = (text) => (text.includes("\r\n") ? "\r\n" : "\n");
const serialize = (data, eol) => JSON.stringify(data, null, 1).replace(/\n/g, eol);

const kit = JSON.parse(fs.readFileSync(process.argv[2], "utf8")).kits[0];
const jsonText = fs.readFileSync(JSON_PATH, "utf8");
const db = JSON.parse(jsonText);
db.kits = db.kits.filter((k) => k.id !== kit.id).concat(kit);

const html = fs.readFileSync(HTML_PATH, "utf8");
const eol = eolOf(html);
const DB_START = `const DB = { materias: [${eol}`;
const DB_END = `${eol}] };`;
const start = html.indexOf(DB_START);
const end = html.indexOf(DB_END, start);
if (start < 0 || end < 0) throw new Error("merge: bloco `const DB` não encontrado no index.html");
fs.writeFileSync(JSON_PATH, serialize(db, eolOf(jsonText)));
fs.writeFileSync(HTML_PATH, html.slice(0, start + DB_START.length) + serialize(db, eol) + html.slice(end));

console.log("kits:", db.kits.map((k) => `${k.id}(${k.perguntas.length})`).join(", "));
