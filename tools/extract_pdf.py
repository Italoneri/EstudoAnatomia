"""Extrai o texto de cada página de um PDF de slides e renderiza as páginas só-imagem.

Uso:
    python -I tools/extract_pdf.py <arquivo.pdf> <pasta_saida> [pasta_pymupdf]

Saída em <pasta_saida>:
    pages.txt          texto por página, separado por "=== P<n>" (n = número do slide)
    img/p<NNN>.png     render de cada página com pouco ou nenhum texto (tabelas, esquemas)

PyMuPDF não vem instalado. Instale isolado e passe a pasta como 3º argumento:
    python -m pip install --quiet --target <scratchpad>/pylib pymupdf
"""
import sys
from pathlib import Path

MIN_TEXT_CHARS = 40
RENDER_DPI = 55


def load_pymupdf(lib_dir):
    if lib_dir:
        sys.path.insert(0, lib_dir)
    import pymupdf
    return pymupdf


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    pdf_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    pymupdf = load_pymupdf(sys.argv[3] if len(sys.argv) > 3 else None)

    img_dir = out_dir / "img"
    img_dir.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)

    chunks, image_only = [], []
    for number, page in enumerate(doc, start=1):
        lines = [ln.strip() for ln in page.get_text().splitlines() if ln.strip()]
        chunks.append(f"=== P{number}\n" + "\n".join(lines))
        if sum(len(ln) for ln in lines) < MIN_TEXT_CHARS:
            page.get_pixmap(dpi=RENDER_DPI).save(img_dir / f"p{number:03d}.png")
            image_only.append(number)

    (out_dir / "pages.txt").write_text("\n".join(chunks) + "\n", encoding="utf-8")
    print(f"paginas={doc.page_count} so_imagem={image_only}")


if __name__ == "__main__":
    main()
