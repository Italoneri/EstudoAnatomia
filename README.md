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

Os cards "<Tema> – todos" e "Geral" são gerados automaticamente a partir do campo `tema` de cada kit.

## Estrutura
- `index.html`: o app, com o banco embutido no bloco `const DB`
- `dados/anatopato.json`: o mesmo banco de questões em JSON (fonte para adicionar temas novos)

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
