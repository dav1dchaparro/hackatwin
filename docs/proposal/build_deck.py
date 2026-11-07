"""Build the Aval pitch deck (9 slides, 16:9, Spanish) for HackaTwin 2026.

Design system reused from docs/strategy/build_deck.py: dark canvas, amber accent,
one idea per slide, numbers as objects. Text is editable (no images).
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

BG = RGBColor(0x0E, 0x11, 0x16)
INK = RGBColor(0xF5, 0xF1, 0xE8)
MUTED = RGBColor(0x9A, 0xA3, 0xAF)
AMBER = RGBColor(0xF2, 0xB1, 0x34)
GREEN = RGBColor(0x2F, 0xBF, 0x71)
RED = RGBColor(0xE4, 0x57, 0x2E)
CARD = RGBColor(0x1A, 0x1F, 0x27)
LINE = RGBColor(0x2A, 0x31, 0x3C)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

FONT = "Segoe UI"
W, H = 13.333, 7.5

prs = Presentation()
prs.slide_width = Inches(W)
prs.slide_height = Inches(H)
BLANK = prs.slide_layouts[6]


def add_slide():
    s = prs.slides.add_slide(BLANK)
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG
    bg.line.fill.background()
    bg.shadow.inherit = False
    return s


def text(s, x, y, w, h, runs, size=20, color=INK, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, line_spacing=1.02, space_after=4):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    if isinstance(runs, str):
        runs = [runs]
    for i, item in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        p.space_after = Pt(space_after)
        if isinstance(item, str):
            item = [(item, {})]
        elif isinstance(item, tuple):
            item = [item]
        for chunk, opts in item:
            r = p.add_run()
            r.text = chunk
            r.font.name = FONT
            r.font.size = Pt(opts.get("size", size))
            r.font.bold = opts.get("bold", bold)
            r.font.color.rgb = opts.get("color", color)
            if opts.get("italic"):
                r.font.italic = True
    return tb


def rect(s, x, y, w, h, fill=CARD, line=None, radius=False, lw=1.0):
    shp = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    if line:
        shp.line.color.rgb = line
        shp.line.width = Pt(lw)
    else:
        shp.line.fill.background()
    shp.shadow.inherit = False
    return shp


def chip(s, x, y, w, h, txt, color=AMBER, txtcolor=BG, size=14):
    shp = rect(s, x, y, w, h, fill=color, radius=True)
    tf = shp.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.06)
    tf.margin_right = Inches(0.06)
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = txt
    r.font.name = FONT
    r.font.size = Pt(size)
    r.font.bold = True
    r.font.color.rgb = txtcolor
    return shp


def chrome(s, n, label="HACKATWIN 2026 · STABLECOINS"):
    text(s, 0.6, 0.32, 9, 0.3, label, size=11, color=MUTED, bold=True)
    text(s, W - 1.3, 0.32, 0.7, 0.3, f"{n:02d}", size=11, color=MUTED, bold=True,
         align=PP_ALIGN.RIGHT)
    ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.7),
                            Inches(W - 1.2), Inches(0.012))
    ln.fill.solid()
    ln.fill.fore_color.rgb = LINE
    ln.line.fill.background()


def title(s, txt, y=0.95, size=40):
    text(s, 0.6, y, W - 1.2, 1.0, txt, size=size, bold=True)


# ------------------------------------------------------------------ 1 title
s = add_slide()
rect(s, 0, 0, 0.16, H, fill=AMBER)
text(s, 0.9, 0.95, 7.5, 1.7, [("Aval", {"size": 118, "bold": True})])
text(s, 0.95, 2.85, 9.5, 0.7, "El aval deja de ser un papel.", size=34, color=MUTED)
rect(s, 0.95, 3.72, 4.0, 0.05, fill=AMBER)
text(s, 0.95, 3.98, 8.6, 0.9,
     [("Garantías en ARGt para las SGR y mutuales de Argentina.",
       {"size": 24, "color": INK})])
text(s, 0.95, 6.45, 10.5, 0.4,
     "Twin Stablecoins  ·  ARGt  ·  Arbitrum One  ·  HackaTwin 2026",
     size=13, color=MUTED, bold=True)

# right stat card
rect(s, 9.35, 4.75, 3.4, 1.55, fill=CARD, line=LINE, radius=True)
text(s, 9.6, 4.95, 2.95, 0.5, "1 de cada 3", size=30, color=AMBER, bold=True)
text(s, 9.6, 5.45, 2.95, 0.75,
     "créditos bancarios a pymes ya tienen aval de una SGR", size=12, color=MUTED)

# ------------------------------------------------------------------ 2 rosa
s = add_slide()
chrome(s, 2)
title(s, "Rosa, 44. Un kiosco. Tres millones.")
text(s, 0.6, 2.05, 6.6, 3.2, [
    ("Monotributista. Cobra por día. No tiene recibo de sueldo ni propiedad.", {"size": 19}),
    ("Necesita ARGt 3.000.000 para mercadería.", {"size": 19}),
    ("El banco le pide un garante con propiedad. No tiene.", {"size": 19}),
    ("Una fintech le ofrece 90% TNA.", {"size": 19}),
])
for i, (big, small, col) in enumerate([
        ("0%", "de garantía formal", RED),
        ("90%", "TNA sin aval", RED),
        ("3 M", "ARGt para mercadería", AMBER)]):
    y = 2.0 + i * 1.38
    rect(s, 7.55, y, 5.2, 1.18, fill=CARD, line=LINE, radius=True)
    text(s, 7.85, y + 0.12, 1.7, 0.8, big, size=34, color=col, bold=True)
    text(s, 9.55, y + 0.4, 3.0, 0.5, small, size=13, color=MUTED)
text(s, 0.6, 6.05, 12.1, 0.8,
     "El problema no es la falta de plata. Es la falta de una garantía que el prestamista pueda ejecutar.",
     size=19, color=AMBER, bold=True)

# ------------------------------------------------------------------ 3 paper
s = add_slide()
chrome(s, 3)
title(s, "La garantía existe. Vive en papel.")
cols = [
    ("No se verifica", "Un prestamista de otra provincia no puede comprobar el aval sin llamar a la SGR."),
    ("No se ejecuta", "La ejecución depende de un circuito manual, semanas después del default."),
    ("No se vende", "La SGR no puede ceder una parte del aval para bajar concentración."),
]
for i, (h, b) in enumerate(cols):
    x = 0.6 + i * 4.12
    rect(s, x, 2.15, 3.85, 2.55, fill=CARD, line=LINE, radius=True)
    text(s, x + 0.28, 2.4, 3.3, 0.5, h, size=22, color=RED, bold=True)
    text(s, x + 0.28, 3.0, 3.3, 1.55, b, size=14, color=MUTED)
rect(s, 0.6, 5.1, 12.1, 1.35, fill=RGBColor(0x24, 0x1D, 0x0F), line=AMBER, radius=True)
text(s, 0.9, 5.28, 11.5, 0.55,
     "Resolución 94/2026  ·  las SGR ya deben usar blockchain para los contratos electrónicos de garantía.",
     size=15, color=AMBER, bold=True)
text(s, 0.9, 5.82, 11.5, 0.45,
     "Una obligación legal. Un producto que no existe.", size=17, color=INK, bold=True)

# ------------------------------------------------------------------ 4 pieces
s = add_slide()
chrome(s, 4)
title(s, "Aval: tres piezas.")
pieces = [
    ("Certificado", "ERC-721", "Emisor, tomador, cobertura, plazo, estado y hash del contrato legal. Cualquier prestamista lo lee. Se puede ceder."),
    ("Fondo de riesgo", "ARGt", "El capital de la SGR respalda el aval. Se asigna, se libera y se ejecuta solo. Puede dormir en Morpho."),
    ("Legajo", "historial", "El récord de pagos del tomador, portable entre prestamistas. El flujo informal se vuelve legible."),
]
for i, (h, tag, b) in enumerate(pieces):
    x = 0.6 + i * 4.12
    rect(s, x, 2.05, 3.85, 3.1, fill=CARD, line=LINE, radius=True)
    chip(s, x + 0.28, 2.28, 1.5, 0.34, tag, color=AMBER, size=11)
    text(s, x + 0.28, 2.78, 3.3, 0.5, h, size=21, bold=True)
    text(s, x + 0.28, 3.35, 3.3, 1.6, b, size=13, color=MUTED)
flow = ["SGR", "Certificado", "Prestamista", "Rosa"]
xs = [0.6, 3.75, 6.9, 10.05]
for i, label in enumerate(flow):
    chip(s, xs[i], 5.65, 2.3, 0.55, label,
         color=GREEN if i == 3 else CARD,
         txtcolor=BG if i == 3 else INK, size=15)
    if i < 3:
        text(s, xs[i] + 2.32, 5.7, 0.8, 0.4, "→", size=20, color=AMBER, bold=True)
text(s, 0.6, 6.45, 12.1, 0.5,
     "El aval deja de ser un documento que se pierde: es una pieza que se lee, se ejecuta y se transfiere.",
     size=14, color=MUTED)

# ------------------------------------------------------------------ 5 rate
s = add_slide()
chrome(s, 5)
title(s, "90% → 45%.")
rect(s, 0.6, 2.15, 5.6, 2.9, fill=CARD, line=LINE, radius=True)
text(s, 0.95, 2.4, 5.0, 0.4, "SIN AVAL", size=13, color=MUTED, bold=True)
text(s, 0.95, 2.85, 5.0, 1.2, "90%", size=76, color=RED, bold=True)
text(s, 0.95, 4.2, 5.0, 0.6, "TNA de una fintech, sin garantía", size=15, color=MUTED)
rect(s, 6.7, 2.15, 6.0, 2.9, fill=RGBColor(0x10, 0x24, 0x1A), line=GREEN, radius=True)
text(s, 7.05, 2.4, 5.3, 0.4, "CON AVAL 50%", size=13, color=GREEN, bold=True)
text(s, 7.05, 2.85, 5.3, 1.2, "45%", size=76, color=GREEN, bold=True)
text(s, 7.05, 4.2, 5.3, 0.6, "la tasa que Rosa puede pagar", size=15, color=INK)
text(s, 0.6, 5.35, 12.1, 1.3, [
    ("La SGR cubre el 50% de la pérdida esperada y cobra 3% anual por el aval.", {"size": 18}),
    ("El prestamista baja su pérdida esperada y compite por el crédito.", {"size": 18}),
])
text(s, 0.6, 6.55, 12.1, 0.45,
     "El pricing no es una promesa: es una función del contrato.", size=14, color=AMBER, bold=True)

# ------------------------------------------------------------------ 6 demo
s = add_slide()
chrome(s, 6)
title(s, "La demo, en seis pasos.")
steps = [
    ("01", "Pedido", "Rosa pide\n3 M ARGt"),
    ("02", "Certificado", "La SGR emite\n50% de cobertura"),
    ("03", "Tasa", "90% → 45%\nen pantalla"),
    ("04", "Fondeo", "ARGt a la\nbilletera de Rosa"),
    ("05", "Pago", "Waterfall:\nprestamista, SGR, fondo"),
    ("06", "Cesión", "La SGR cede\n30% a otra SGR"),
]
for i, (n, h, b) in enumerate(steps):
    x = 0.6 + i * 2.06
    rect(s, x, 2.1, 1.86, 2.05, fill=CARD, line=LINE, radius=True)
    text(s, x + 0.18, 2.22, 1.5, 0.3, n, size=11, color=AMBER, bold=True)
    text(s, x + 0.18, 2.55, 1.55, 0.45, h, size=15, bold=True)
    text(s, x + 0.18, 3.05, 1.55, 0.95, b, size=11, color=MUTED)
rect(s, 0.6, 4.55, 12.1, 1.0, fill=CARD, line=LINE, radius=True)
text(s, 0.9, 4.72, 3.4, 0.35, "ON-CHAIN RECEIPT", size=11, color=MUTED, bold=True)
text(s, 0.9, 5.05, 7.4, 0.4, "0x________________  ·  Arbiscan  ·  ARGt  ·  Arbitrum One",
     size=15, color=INK)
text(s, 0.6, 5.85, 12.1, 1.0, [
    ("Stress test: Rosa no paga → el fondo paga al prestamista hasta el 50%.", {"size": 16, "color": RED}),
    ("La SGR conserva el derecho de cobro y el legajo lo registra.", {"size": 16, "color": MUTED}),
])

# ------------------------------------------------------------------ 7 currency
s = add_slide()
chrome(s, 7)
title(s, "Por qué ARGt y no USDT.")
rect(s, 0.6, 2.05, 5.85, 3.5, fill=RGBColor(0x24, 0x12, 0x10), line=RED, radius=True)
text(s, 0.9, 2.28, 5.2, 0.4, "FONDO EN USD", size=13, color=RED, bold=True)
text(s, 0.9, 2.8, 5.2, 2.5, [
    ("La SGR cubre una obligación en pesos con un fondo en dólares.", {"size": 15}),
    ("Una devaluación del 30% le mueve el ratio de cobertura.", {"size": 15}),
    ("Su capital regulatorio está en pesos: el fondo no calza.", {"size": 15}),
], color=INK)
rect(s, 6.9, 2.05, 5.8, 3.5, fill=RGBColor(0x10, 0x24, 0x1A), line=GREEN, radius=True)
text(s, 7.2, 2.28, 5.2, 0.4, "FONDO EN ARGt", size=13, color=GREEN, bold=True)
text(s, 7.2, 2.8, 5.2, 2.5, [
    ("Activo y pasivo en la misma unidad.", {"size": 15}),
    ("La cobertura no depende del tipo de cambio.", {"size": 15}),
    ("Queda un solo riesgo: crédito. Eso es lo que el aval precio.", {"size": 15}),
], color=INK)
text(s, 0.6, 5.95, 12.1, 0.9,
     "El token local no es un detalle: es lo que hace asegurable el riesgo.",
     size=22, color=AMBER, bold=True)

# ------------------------------------------------------------------ 8 business
s = add_slide()
chrome(s, 8)
title(s, "Negocio: 15 bps del volumen garantizado.")
text(s, 0.6, 2.0, 6.2, 0.4, "LÍNEAS DE INGRESO", size=12, color=MUTED, bold=True)
rows = [
    ("SaaS", "USD 1.000–3.000 / mes por SGR"),
    ("Volumen", "10–25 bps del capital garantizado"),
    ("Cesión", "5–10 bps del volumen secundario"),
    ("Float", "parte del rendimiento del fondo en Morpho"),
]
for i, (a, b) in enumerate(rows):
    y = 2.45 + i * 0.78
    text(s, 0.6, y, 1.5, 0.4, a, size=15, color=AMBER, bold=True)
    text(s, 2.1, y, 4.6, 0.45, b, size=15, color=INK)
rect(s, 7.15, 2.0, 5.55, 3.55, fill=CARD, line=LINE, radius=True)
text(s, 7.4, 2.2, 5.0, 0.4, "EL NÚMERO", size=12, color=MUTED, bold=True)
text(s, 7.4, 2.6, 5.0, 0.6, "50+", size=34, color=AMBER, bold=True)
text(s, 8.9, 2.72, 3.6, 0.5, "SGR y mutuales\nen Argentina", size=12, color=MUTED)
text(s, 7.4, 3.55, 5.0, 0.5, "ARS 30.000 M / año", size=22, color=INK, bold=True)
text(s, 7.4, 4.05, 5.0, 0.5, "volumen de una SGR mediana  →  ~USD 30k/año a 15 bps",
     size=12, color=MUTED)
text(s, 7.4, 4.65, 5.0, 0.5, "30 SGR  →  ~USD 900k ARR", size=18, color=GREEN, bold=True)
text(s, 0.6, 5.95, 12.1, 0.9,
     "El microcrédito es la cuña. El fondo de riesgo y el mercado secundario son el negocio.",
     size=17, color=INK, bold=True)

# ------------------------------------------------------------------ 9 close
s = add_slide()
rect(s, 0, 0, 0.16, H, fill=AMBER)
text(s, 0.9, 1.35, 11.6, 0.9, "El banco pide garantías.", size=48, bold=True)
text(s, 0.9, 2.3, 11.6, 0.9, "Nosotros las hacemos verificables.",
     size=46, color=AMBER, bold=True)
text(s, 0.95, 4.35, 11.0, 0.6,
     "Rosa no tenía garantía. Su cooperativa sí.", size=22, color=MUTED)
rect(s, 0.95, 5.15, 3.6, 0.04, fill=LINE)
text(s, 0.95, 5.35, 3.4, 0.35, "REPO", size=11, color=MUTED, bold=True)
text(s, 0.95, 5.7, 4.2, 0.4, "github.com/<team>/aval", size=14, color=INK)
text(s, 5.4, 5.35, 3.4, 0.35, "TX", size=11, color=MUTED, bold=True)
text(s, 5.4, 5.7, 4.2, 0.4, "0x…  (Arbiscan)", size=14, color=INK)
text(s, 9.7, 5.35, 3.0, 0.35, "EQUIPO", size=11, color=MUTED, bold=True)
text(s, 9.7, 5.7, 3.0, 0.4, "P1 · P2 · P3 · P4", size=14, color=INK)
text(s, 0.95, 6.55, 11.5, 0.4,
     "HackaTwin 2026  ·  Twin Stablecoins  ·  ARGt  ·  Arbitrum One",
     size=12, color=MUTED, bold=True)

prs.save(r"docs\proposal\AVAL_PITCH.pptx")
print("saved", len(prs.slides._sldIdLst), "slides")
