// Insere (ou substitui, pelo id) um kit no banco da matéria dele e remonta o `const DB` do index.html.
// Uso:
//   node tools/merge-kit.js <kit.json gerado pelo build-kit/build-prova>
//   node tools/merge-kit.js            (sem argumento: só remonta o index.html a partir de dados/)
// A matéria vem do campo "id" na raiz do kit.json (o build preenche a partir de KIT.materia).
const fs = require("fs");
const { lerMateria, gravarMateria, todasMaterias, idsRepetidos, atualizarHtml } = require("./materias");

const arquivo = process.argv[2];
if (arquivo) {
  const entrada = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  const materia = lerMateria(entrada.id);
  for (const kit of entrada.kits) {
    const outras = todasMaterias().filter((m) => m.id !== materia.id);
    const repetido = idsRepetidos([...outras, { id: materia.id, kits: [kit] }]);
    if (repetido.length) throw new Error(`o id "${kit.id}" já existe em outra matéria; use um prefixo da matéria`);
    materia.kits = materia.kits.filter((k) => k.id !== kit.id).concat(kit);
  }
  gravarMateria(materia);
}

for (const m of atualizarHtml()) {
  const kits = m.kits.map((k) => `${k.id}(${k.perguntas.length})`).join(", ");
  console.log(`${m.nome}: ${kits || "sem kits"}`);
}
