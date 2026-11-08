# EstudoAnatomia

App de estudo para **Anatomía Patológica**: estudo inteligente com níveis, flashcards, guia e prova, tudo num único arquivo HTML.

## Como usar
- Abra o `index.html` no navegador (duplo clique), ou ative o GitHub Pages em *Settings → Pages → Branch: main* para ter um link.
- O progresso fica salvo no navegador (localStorage).

## Conteúdo atual
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

Os cards "<Tema> – todos" e "Geral" são gerados automaticamente a partir do campo `tema` de cada kit.

## Estrutura
- `index.html`: o app, com o banco embutido no bloco `const DB`
- `dados/anatopato.json`: o mesmo banco de questões em JSON (fonte para adicionar temas novos)
- `tools/`: scripts para gerar um kit a partir do PDF da aula (extração, build, verificação e merge)
- `CLAUDE.md`: fluxo completo e regras para gerar um kit novo com o Claude Code

## Formato de cada kit
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
