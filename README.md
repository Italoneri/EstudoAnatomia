# EstudoAnatomia

App de estudo das matérias da faculdade: estudo inteligente com níveis, flashcards, guia e prova, tudo num único arquivo HTML.
A tela inicial mostra um card por matéria; clicando, abre a matéria com os temas, os cards "<Tema> – todos" e o "Geral" dela.

## Como usar
- Abra o `index.html` no navegador (duplo clique), ou ative o GitHub Pages em *Settings → Pages → Branch: main* para ter um link.
- O progresso fica salvo no navegador (localStorage).
- A busca da tela inicial procura matérias e kits de todas as matérias; dentro de uma matéria, só nela.
- Nome e cor de cada matéria podem ser trocados pelo menu ⋮ do card (fica salvo no navegador).
- Pergunta acertada some por um tempo: só volta depois de 60, 180 e 500 respostas (1º, 2º e 3º acerto seguido). As erradas voltam logo.
- Na engrenagem do Estudo inteligente, "Passar uma vez por cada pergunta" mostra cada pergunta uma única vez até terminar o kit (ou o bloco), com opção de refazer só as erradas.

## Matérias
| Matéria | id | Questões |
|---|---|---|
| Metodología II | `metodologia-2` | – |
| Epidemiología | `epidemiologia` | – |
| Patología Médica | `patologia-medica` | 30 |
| Anatomía Patológica I | `anatopato` | 936 |
| Fisiopatología I | `fisiopato-1` | 197 (importadas do [fisiopato-quiz](https://github.com/Italoneri/fisiopato-quiz)) |
| Patología Quirúrgica I | `patologia-quirurgica-1` | – |
| Primeros Auxilios | `primeros-auxilios` | – |
| Principios y Valores | `principios-valores` | – |

## Anatomía Patológica I
Temas da P2 (os da P1 entram como kits novos com o próprio `tema`; o "Geral" junta tudo para a final).

| Tema | Arquivo | Questões |
|---|---|---|
| Neoplasia | 1 – Generalidades | 82 |
| Neoplasia | 2 – Carcinogénesis | 89 |
| Neoplasia | 3 – Aspectos clínicos y ejemplos | 83 |
| Vasos sanguíneos | 1 – HTA, aterosclerosis, aneurismas y disección | 104 |
| Vasos sanguíneos | 2 – Vasculitis, enfermedades venosas y linfáticas, y tumores vasculares | 132 |
| Vasos sanguíneos | 3 – Vasculitis: cuadro comparativo, detalles y tumores vasculares (Vasculitis.pdf) | 45 |
| Cardio | 1 – Valvulopatías (SESIÓN 21.Valvulopatías.pdf) | 30 |
| Cardio | 2 – Tumores cardíacos (SESIÓN 21.tumorescardiacos 2026.pdf) | 16 |
| Cardio | 3 – Miocardiopatías (SESIÓN 21.MIOCARDIOPATIAS 2024.pdf) | 19 |
| Cardio | 4 – Enfermedades pericárdicas (SESIÓN 21.pericarditis2026.pdf) | 20 |
| Cardio | 5 – Cardiopatía isquémica (CARDIOPATIA ISQUEMICA.pdf) | 44 |
| Respiratorio | 1 – EPOC y atelectasias (Clase 19 - RESPIRATORIO - EPOC, Atelectasias - Teoria 2020.pdf) | 69 |
| Respiratorio | 2 – Neumonías (Clase 19 - RESPIRATORIO - NEUMONIAS - 2020.pdf) | 48 |
| Provas anteriores | 1 – Neoplasia (questões reais de P2 antigas) | 31 |
| Provas anteriores | 2 – Vasos sanguíneos (questões reais de P2 antigas) | 44 |
| Provas anteriores | 3 – Corazón (questões reais de P2 antigas) | 50 |
| Provas anteriores | 4 – Respiratorio (questões reais de P2 antigas) | 30 |

## Patología Médica

| Tema | Arquivo | Questões |
|---|---|---|
| Aparato digestivo | 1 – Patología esofágica, gastritis y úlcera péptica (Aparato_digestivo.pdf) | 30 |

## Fisiopatología I
| Tema | Kits | Questões |
|---|---|---|
| Cardiovascular | Dislipidemias, Aterosclerosis, Circulación arterial, Circulación venosa, Hipertensión arterial, Arritmias, Valvulopatías | 125 |
| Equilibrio ácido-base | Ácido-base | 25 |
| Repaso | Cuestionario del profesor, Casos clínicos | 47 |

Vieram do app fisiopato-quiz (`node tools/importar-quiz.js <index.html do fisiopato-quiz>`), com `"origem": "importado"`: têm uma explicação só por questão e não têm slide de fonte nem flashcards.

## Como os cards são montados
Os cards "<Tema> – todos" e "Geral" são gerados automaticamente a partir do campo `tema` de cada kit, separados por matéria.
Os kits de "Provas anteriores" têm `"separado": true`: ganham o próprio card "Provas anteriores – todos" e ficam fora do "Geral". Eles mantêm o número de alternativas da prova original (2 a 5).

## Estrutura
- `index.html`: o app, com o banco embutido no bloco `const DB` (montado pelo `tools/merge-kit.js`, não editar à mão)
- `dados/materias.json`: ordem das matérias na tela inicial
- `dados/<id>.json`: o banco de cada matéria (`{ id, nome, cor, kits[] }`), fonte de verdade
- `tools/`: scripts para gerar um kit a partir do PDF da aula (extração, build, verificação e merge)
- `CLAUDE.md`: fluxo completo e regras para gerar um kit novo com o Claude Code

## Adicionar uma matéria nova
1. Criar `dados/<id>.json` com `{ "id": "<id>", "nome": "<Nome>", "cor": "azul", "icone": "livro", "kits": [] }`
   - cores: vermelho, roxo, azul, verde, laranja, rosa, turquesa, indigo, violeta
   - ícones: livro, grafico, esteto, microscopio, coracao, bisturi, maleta, balanca, hospital, gota, cerebro, pulmao
2. Pôr o `<id>` em `dados/materias.json`, na posição em que ela deve aparecer.
3. `node tools/merge-kit.js` (sem argumento) para remontar o `index.html`.

## Formato de cada kit
O `id` do kit precisa ser único entre **todas** as matérias (o progresso é salvo por ele); nas matérias novas, use um prefixo (ex.: `epi-1`, `pq-hernias`).
```json
{
  "id": "vasos-sanguineos-2",
  "tema": "Vasos sanguíneos",
  "titulo": "Vasos sanguíneos 2 – ...",
  "icone": "hospital",
  "materiais": [{ "nome": "arquivo.pdf", "tipo": "ppt" }],
  "perguntas": [{
    "pergunta": "...", "opcoes": ["...", "...", "...", "..."], "correta": 0,
    "explicacao": ["...", "...", "..."], "fonte": "arquivo.pdf, slide N",
    "bloco": "...", "nivel": "facil|medio|dificil", "complemento": false
  }],
  "flashcards": [{ "frente": "...", "verso": "...", "fonte": "..." }]
}
```
