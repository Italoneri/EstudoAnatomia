// Nomes das provas de origem usados no campo `fonte` dos kits "Provas anteriores".
const fonte = (prova) => (n) => `${prova}, pregunta ${n}`;

module.exports = {
  A: fonte("2º parcial ordinario teórico (prueba antigua con gabarito)"),
  K: fonte("P2 Anatopato (Kristel)"),
  E1: fonte("2º parcial, 1ª parte (Anatopato I – ESSA ESTUDAR 2P)"),
  E2: fonte("2º parcial, 2ª parte (Anatopato I – ESSA ESTUDAR 2P)"),
  P1: fonte("2ª parcial, parte 1 (Anatopato I – ESSA ESTUDAR 2P)"),
  P2: fonte("2ª parcial, parte 2 (Anatopato I – ESSA ESTUDAR 2P)"),
  X1: fonte("2ª parcial extraordinario, parte 1 (Anatopato I – ESSA ESTUDAR 2P)"),
  X2: fonte("2ª parcial extraordinario, parte 2 (Anatopato I – ESSA ESTUDAR 2P)"),
  T17: fonte("3er parcial 2017 (Anatopato I – ESSA ESTUDAR 2P)"),
  C25: fonte("2º examen parcial ordinario 2025 (corrección)"),
  C26: fonte("Examen parcial ordinario teórico, junio 2026"),
  MATERIAIS: [
    "2º Parcial Ordinário Teórica - Anatomía Patológica I.pdf",
    "P2 anatopato kristel.pdf",
    "Anatopato I - ESSA ESTUDAR 2P.pdf",
    "Corrección P2 Anatopato.pdf",
    "P2 Anatopato teoría e práctica.pdf",
    "Prova anatopato C.pdf",
  ],
};
