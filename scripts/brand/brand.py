"""Gera as artes da marca NOMA: símbolo, wordmark em curvas, variações de cor e o Logo.tsx."""
import math, os, sys, json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib import instancer

S = os.path.dirname(os.path.abspath(__file__))  # fonts/ fica ao lado deste script
OUT = sys.argv[1]  # noma-lencois
BRAND = os.path.join(OUT, "public", "brand")
os.makedirs(BRAND, exist_ok=True)


def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


# ---------- símbolo (viewBox 0 0 100 100) ----------
# Mandala oficial vetorizada de public/brand/original/mandala.png (ver trace_mandala.py).
MANDALA_D = open(os.path.join(S, "mandala-path.txt")).read().strip()


def symbol_group(fill="currentColor"):
    return f'<path d="{MANDALA_D}" fill="{fill}" fill-rule="evenodd"/>'


# ---------- texto em curvas ----------
def text_path(font, text, size, tracking=0.0, x0=0.0, baseline=0.0):
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    sc = size / upm
    hmtx = font["hmtx"]
    x = x0
    d = []
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            continue
        pen = SVGPathPen(gs, ntos=lambda v: f(v))
        tp = TransformPen(pen, (sc, 0, 0, -sc, x, baseline))
        gs[name].draw(tp)
        d.append(pen.getCommands())
        x += hmtx[name][0] * sc + tracking
    return " ".join(d), x - tracking - x0


marcellus = TTFont(os.path.join(S, "fonts", "Marcellus-Regular.ttf"))
josefin = instancer.instantiateVariableFont(TTFont(os.path.join(S, "fonts", "JosefinSans.ttf")), {"wght": 300})

# Wordmark (cap height do Marcellus ~ 0.7em). Tamanho 100 → caixa alta ~70.
WM_SIZE = 100
wm_d, wm_w = text_path(marcellus, "NOMA", WM_SIZE, tracking=4)
WM_CAP = 70
tag_d, tag_w = text_path(josefin, "agência de turismo", 30, tracking=1.2)


def wordmark_svg(fill="currentColor"):
    return f'<path d="{wm_d}" fill="{fill}"/>'


# ---------- composições ----------
def stacked(fg, bg=None, tagline=True, pad=40):
    """Símbolo em cima, NOMA embaixo, 'agência de turismo' opcional — como no feed."""
    sym = 150
    w = max(wm_w, tag_w) + pad * 2
    cx = w / 2
    y_sym = pad
    y_wm = y_sym + sym + 34 + WM_CAP
    y_tag = y_wm + 46
    h = (y_tag if tagline else y_wm) + pad
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" width="{f(w)}" height="{f(h)}">']
    if bg:
        s.append(f'<rect width="100%" height="100%" fill="{bg}"/>')
    s.append(f'<g transform="translate({f(cx - sym / 2)} {f(y_sym)}) scale({sym / 100})">{symbol_group(fg)}</g>')
    s.append(f'<g transform="translate({f(cx - wm_w / 2)} {f(y_wm)})">{wordmark_svg(fg)}</g>')
    if tagline:
        s.append(f'<g transform="translate({f(cx - tag_w / 2)} {f(y_tag)})" opacity="0.92"><path d="{tag_d}" fill="{fg}"/></g>')
    s.append("</svg>")
    return "".join(s)


def horizontal(fg, bg=None, pad=24):
    sym = 110
    gap = 26
    w = pad * 2 + sym + gap + wm_w
    h = pad * 2 + sym
    y_wm = pad + sym / 2 + WM_CAP / 2
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" width="{f(w)}" height="{f(h)}">']
    if bg:
        s.append(f'<rect width="100%" height="100%" fill="{bg}"/>')
    s.append(f'<g transform="translate({pad} {pad}) scale({sym / 100})">{symbol_group(fg)}</g>')
    s.append(f'<g transform="translate({f(pad + sym + gap)} {f(y_wm)})">{wordmark_svg(fg)}</g></svg>')
    return "".join(s)


def symbol_only(fg, bg=None, round_bg=False, size=100, pad=0):
    v = 100 + pad * 2
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {v} {v}" width="{size}" height="{size}">']
    if bg:
        s.append(f'<circle cx="50" cy="50" r="{50 + pad}" fill="{bg}"/>' if round_bg else f'<rect x="{-pad}" y="{-pad}" width="{v}" height="{v}" fill="{bg}"/>')
    s.append(symbol_group(fg) + "</svg>")
    return "".join(s)


def avatar(fg, bg, size=1080):
    """Foto de perfil: círculo cheio, símbolo + NOMA centralizados (igual ao perfil do Instagram)."""
    inner = stacked(fg, None, tagline=False, pad=0)
    vb = inner.split('viewBox="')[1].split('"')[0].split()
    iw, ih = float(vb[2]), float(vb[3])
    scale = (size * 0.56) / iw
    body = inner.split(">", 1)[1].rsplit("</svg>", 1)[0]
    tx = (size - iw * scale) / 2
    ty = (size - ih * scale) / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">'
        f'<rect width="100%" height="100%" fill="{bg}"/>'
        f'<g transform="translate({f(tx)} {f(ty)}) scale({f(scale)})">{body}</g></svg>'
    )


# Paleta tirada do feed
PALETTES = {
    "lagoa": ("#2f5e5f", "#5e9faa"),      # perfil: verde-petróleo sobre turquesa
    "buriti": ("#4b5a1e", "#a9aa3c"),     # verde-oliva sobre chartreuse
    "areia": ("#4e97a3", "#f4e6c8"),      # turquesa sobre creme
    "mata": ("#d9c34a", "#3d5525"),       # mostarda sobre verde-mata
    "por-do-sol": ("#e3b23c", "#c4541c"), # dourado sobre terracota
    "noite": ("#ebd6a9", "#0f1a1f"),      # creme-dourado sobre noite
}

files = {}
files["noma-simbolo.svg"] = symbol_only("currentColor")
files["noma-logo.svg"] = stacked("currentColor")
files["noma-logo-horizontal.svg"] = horizontal("currentColor")
for k, (fg, bg) in PALETTES.items():
    files[f"noma-logo-{k}.svg"] = stacked(fg, bg, pad=90)
    files[f"noma-horizontal-{k}.svg"] = horizontal(fg, bg, pad=48)
    files[f"noma-simbolo-{k}.svg"] = symbol_only(fg, bg, size=512, pad=14)
    files[f"noma-avatar-{k}.svg"] = avatar(fg, bg)
files["noma-logo-transparente-creme.svg"] = stacked("#ebd6a9")
files["noma-logo-transparente-petroleo.svg"] = stacked("#2f5e5f")

for name, svg in files.items():
    with open(os.path.join(BRAND, name), "w") as fh:
        fh.write(svg)

# favicon / app icon
with open(os.path.join(OUT, "src", "app", "icon.svg"), "w") as fh:
    fh.write(symbol_only("#f4e6c8", "#2f5e5f", round_bg=True, size=64, pad=8))

# Logo.tsx — mesmos desenhos inline (currentColor) pro site
sym_d = MANDALA_D
tsx = f'''/**
 * Marca NOMA em SVG inline (cor = currentColor). Gerado por scripts de marca — o wordmark é o
 * "NOMA" em curvas e o símbolo é a mandala oficial vetorizada (public/brand/original/mandala.png). Arquivos prontos em /public/brand.
 */
const WORDMARK_D = "{wm_d}";
const TAGLINE_D = "{tag_d}";

/**
 * Mandala como máscara CSS sobre o arquivo /brand/noma-simbolo.svg (cor = currentColor). O desenho é
 * pesado (~18 KB); embutido em cada uso, inchava o HTML e travava a hidratação.
 */
export function NomaSymbol({{ className }}: {{ className?: string }}) {{
  return (
    <span
      aria-hidden
      className={{`block shrink-0 bg-current [mask:url(/brand/noma-simbolo.svg)_center/contain_no-repeat] ${{className ?? ""}}`}}
    />
  );
}}

export function NomaWordmark({{ className }}: {{ className?: string }}) {{
  return (
    <svg viewBox="0 -{WM_CAP} {f(wm_w)} {WM_CAP + 2}" className={{className}} role="img" aria-label="NOMA">
      <path d={{WORDMARK_D}} fill="currentColor" />
    </svg>
  );
}}

export function NomaTagline({{ className }}: {{ className?: string }}) {{
  return (
    <svg viewBox="0 -24 {f(tag_w)} 32" className={{className}} role="img" aria-label="agência de turismo">
      <path d={{TAGLINE_D}} fill="currentColor" />
    </svg>
  );
}}

/** Símbolo + NOMA lado a lado (cabeçalho) ou empilhado com "agência de turismo" (rodapé, hero). */
export function NomaLogo({{ variant = "horizontal", className }}: {{ variant?: "horizontal" | "stacked"; className?: string }}) {{
  if (variant === "stacked")
    return (
      <span className={{`inline-flex flex-col items-center ${{className ?? ""}}`}}>
        <NomaSymbol className="aspect-square w-[34%]" />
        <NomaWordmark className="mt-[7%] w-full" />
        <NomaTagline className="mt-[5%] w-[78%] opacity-90" />
      </span>
    );
  return (
    <span className={{`inline-flex items-center gap-[0.45em] ${{className ?? ""}}`}}>
      <NomaSymbol className="h-[1.55em] w-[1.55em]" />
      <NomaWordmark className="h-[0.78em]" />
    </span>
  );
}}
'''
with open(os.path.join(OUT, "src", "components", "ui", "Logo.tsx"), "w") as fh:
    fh.write(tsx)
print(json.dumps({"files": len(files), "wm_w": wm_w, "tag_w": tag_w}))
