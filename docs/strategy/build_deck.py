"""Build the Aval pitch deck (8 slides, 16:9) for HackaTwin 2026."""
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
         anchor=MSO_ANCHOR.TOP, line_spacing=1.05, space_after=6, font=FONT):
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
            r.font.name = opts.get("font", font)
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
    tf.margin_left = Inches(0.08)
    tf.margin_right = Inches(0.08)
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
    text(s, 0.6, 0.35, 8, 0.3, label, size=11, color=MUTED, bold=True)
    text(s, W - 1.3, 0.35, 0.7, 0.3, f"{n:02d}", size=11, color=MUTED, bold=True,
         align=PP_ALIGN.RIGHT)
    ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.72),
                            Inches(W - 1.2), Inches(0.015))
    ln.fill.solid()
    ln.fill.fore_color.rgb = LINE
    ln.line.fill.background()


# ---------------------------------------------------------------- 1. title
s = add_slide()
rect(s, 0, 0, 0.18, H, fill=AMBER)
text(s, 0.9, 1.15, 8, 1.6, [("Aval", {"size": 120, "bold": True})])
text(s, 0.95, 3.0, 9, 0.6, "Collateral social, programable.", size=30, color=MUTED)
rect(s, 0.95, 3.9, 4.2, 0.05, fill=AMBER)
text(s, 0.95, 4.2, 10.5, 1.0,
     [[("\u201cRosa no ten\u00eda garant\u00eda. Ten\u00eda una red.\u201d", {"size": 26, "italic": True, "color": AMBER})]])
text(s, 0.95, 6.35, 11.5, 0.4,
     "Twin Stablecoins  \u00b7  ARGt  \u00b7  Arbitrum  \u00b7  HackaTwin 2026", size=14, color=MUTED)

# ---------------------------------------------------------------- 2. problem
s = add_slide()
chrome(s, 2)
text(s, 0.6, 1.05, 8, 0.8, "Rosa, 44, La Matanza.", size=44, bold=True)
text(s, 0.6, 1.95, 6.4, 3.2, [
    [("Lava y plancha. Cobra por d\u00eda.", {"size": 19})],
    [("No tiene recibo de sueldo ni propiedad.", {"size": 19})],
    [("Quiere una moto para repartir: ", {"size": 19}), ("$300.000", {"size": 19, "bold": True, "color": AMBER})],
    [("El banco le pide un garante con propiedad. No tiene.", {"size": 19})],
    [("Una fintech le ofrece ", {"size": 19}), ("120% TNA.", {"size": 19, "bold": True, "color": RED})],
], space_after=8)
stats = [("43%", "de los trabajadores\nes informal", AMBER, "INDEC, 4T 2025"),
         ("120%", "TNA que le ofrecen\nsin garant\u00eda", RED, "oferta t\u00edpica"),
         ("$0", "de garant\u00eda\nformal", MUTED, "sin propiedad")]
for i, (big, small, col, src) in enumerate(stats):
    x = 7.35 + i * 1.95
    rect(s, x, 2.0, 1.8, 2.3, fill=CARD, line=LINE, radius=True)
    text(s, x + 0.12, 2.2, 1.56, 0.8, big, size=34, bold=True, color=col)
    text(s, x + 0.12, 2.95, 1.56, 0.8, small, size=12, color=MUTED, line_spacing=1.0)
    text(s, x + 0.12, 3.85, 1.56, 0.3, src, size=9, color=MUTED)
text(s, 7.35, 4.6, 5.4, 1.2,
     "El problema no es la falta de plata.\nEs la falta de una garant\u00eda que el prestamista pueda ejecutar.",
     size=16, color=INK, line_spacing=1.15)

# ---------------------------------------------------------------- 3. insight
s = add_slide()
chrome(s, 3)
text(s, 0.6, 1.05, 12, 0.7, "La garant\u00eda existe. No se puede ejecutar.", size=40, bold=True)
text(s, 0.6, 1.9, 12, 0.4, "Hoy es una firma en un papel: sin tope, sin precio y sin juez.", size=20, color=MUTED)

# bank box
rect(s, 0.7, 3.0, 3.0, 1.5, fill=CARD, line=LINE, radius=True)
text(s, 0.9, 3.2, 2.6, 1.2, [[("Banco / fintech", {"size": 18, "bold": True})],
                             [("Pide propiedad o recibo", {"size": 14, "color": MUTED})]])
text(s, 3.95, 3.55, 0.6, 0.5, "\u2717", size=40, color=RED, bold=True)

# rosa box
rect(s, 5.0, 2.55, 3.0, 2.4, fill=CARD, line=AMBER, radius=True, lw=2)
text(s, 5.15, 2.75, 2.7, 2.0, [[("Rosa", {"size": 26, "bold": True, "color": AMBER})],
                               [("ingreso informal", {"size": 14, "color": MUTED})],
                               [("sin garant\u00eda formal", {"size": 14, "color": MUTED})]])

# avalistas boxes
for i, (name, rel) in enumerate([("Luc\u00eda", "hija, en blanco"), ("Alberto", "vecino, 12 a\u00f1os")]):
    y = 2.55 + i * 1.3
    rect(s, 9.4, y, 3.2, 1.1, fill=CARD, line=GREEN, radius=True, lw=2)
    text(s, 9.55, y + 0.12, 2.9, 0.9, [[(name, {"size": 18, "bold": True, "color": GREEN})],
                                      [(rel, {"size": 12, "color": MUTED})]])
text(s, 8.15, 2.95, 1.1, 0.6, "\u2713", size=34, color=GREEN, bold=True)
text(s, 8.15, 4.25, 1.1, 0.6, "\u2713", size=34, color=GREEN, bold=True)
text(s, 0.7, 5.5, 12, 1.0,
     [[("La garant\u00eda que busca el banco ya existe: es la red de Rosa.", {"size": 22, "bold": True})],
      [("Aval la vuelve legible, la pone en ARGt, la limita y la ejecuta sola.", {"size": 18, "color": MUTED})]],
     line_spacing=1.15)

# ---------------------------------------------------------------- 4. product
s = add_slide()
chrome(s, 4)
text(s, 0.6, 1.05, 12, 0.7, "Aval: tres pasos.", size=44, bold=True)
steps = [
    ("01", "Ped\u00eds", "Rosa pide $300.000\na 90 d\u00edas. Cobertura\nobjetivo: 30%."),
    ("02", "Aval\u00e1s", "Luc\u00eda y Alberto ponen\n15% cada uno en ARGt\ny fijan su comisi\u00f3n."),
    ("03", "Fonde\u00e1s y pag\u00e1s", "La tasa baja de 120%\na 45%. El contrato\nreparte y ejecuta."),
]
for i, (num, title, body) in enumerate(steps):
    x = 0.7 + i * 4.1
    rect(s, x, 2.0, 3.8, 2.75, fill=CARD, line=LINE, radius=True)
    text(s, x + 0.25, 2.15, 0.9, 0.5, num, size=14, bold=True, color=AMBER)
    text(s, x + 0.25, 2.55, 3.3, 0.5, title, size=26, bold=True)
    text(s, x + 0.25, 3.15, 3.3, 1.4, body, size=14, color=MUTED, line_spacing=1.1)
    text(s, x + 0.25, 3.95, 3.3, 0.4, ["\u2192 120% TNA", "\u2192 cobertura 30%", "\u2192 45% TNA"][i], size=15, bold=True, color=AMBER)
    if i < 2:
        text(s, x + 3.82, 3.15, 0.35, 0.5, "\u2192", size=26, color=AMBER, bold=True)
text(s, 0.7, 5.1, 12, 1.2,
     [[("Todo en ARGt. Todo on-chain. Sin escribano, sin papel, sin garant\u00eda en blanco.", {"size": 22, "bold": True, "color": AMBER})],
      [("El aval es un porcentaje con tope, no una firma que te puede costar la casa.", {"size": 16, "color": MUTED})]],
     line_spacing=1.2)

# ---------------------------------------------------------------- 5. demo
s = add_slide()
chrome(s, 5)
text(s, 0.6, 1.05, 12, 0.7, "La demo, en 90 segundos.", size=44, bold=True)
flow = ["Request", "Luc\u00eda 15%", "Alberto 15%", "Fund", "Repay"]
for i, label in enumerate(flow):
    x = 0.7 + i * 2.45
    fill = GREEN if label in ("Fund", "Repay") else AMBER
    chip(s, x, 2.05, 2.1, 0.62, label, color=fill, txtcolor=BG, size=14)
    if i < len(flow) - 1:
        text(s, x + 2.12, 2.12, 0.3, 0.4, "\u203a", size=26, color=MUTED, bold=True)
rect(s, 0.7, 3.0, 7.4, 2.6, fill=CARD, line=LINE, radius=True)
text(s, 0.95, 3.2, 6.9, 0.4, "ON-CHAIN RECEIPT", size=12, bold=True, color=MUTED)
text(s, 0.95, 3.65, 6.9, 0.5, "0x  ________________________________", size=22, bold=True, color=GREEN)
text(s, 0.95, 4.25, 6.9, 1.1,
     [[("LoanFunded  \u00b7  AvalStaked \u00d7 2  \u00b7  CuotaPagada", {"size": 16})],
      [("Arbiscan  \u00b7  Arbitrum One  \u00b7  ARGt", {"size": 14, "color": MUTED})]],
     line_spacing=1.3)
rect(s, 8.35, 3.0, 4.25, 2.6, fill=CARD, line=RED, radius=True, lw=2)
text(s, 8.55, 3.2, 3.9, 0.4, "STRESS TEST", size=12, bold=True, color=RED)
text(s, 8.55, 3.6, 3.9, 1.8,
     "Rosa no paga.\nEl contrato ejecuta el aval.\nEl prestamista cobra.\nLuc\u00eda y Alberto pierden\nsolo lo que pusieron.",
     size=15, color=INK, line_spacing=1.15)
text(s, 0.7, 6.0, 12, 0.6, "Una transacci\u00f3n real, un recibo real, un default real.", size=18, color=AMBER, bold=True)

# ---------------------------------------------------------------- 6. why ARGt
s = add_slide()
chrome(s, 6)
text(s, 0.6, 1.05, 12, 0.7, "Por qu\u00e9 ARGt y no USDT.", size=44, bold=True)
rect(s, 0.7, 2.0, 5.9, 3.4, fill=CARD, line=RED, radius=True, lw=2)
text(s, 0.95, 2.2, 5.4, 0.5, "PR\u00c9STAMO EN USD", size=14, bold=True, color=RED)
text(s, 0.95, 2.7, 5.4, 2.5, [
    [("Rosa cobra en pesos y debe en d\u00f3lares.", {"size": 16})],
    [("Una devaluaci\u00f3n del 30% le sube la deuda real 30%, aunque pague todas las cuotas.", {"size": 16})],
    [("El prestamista cobra dos riesgos: moneda + cr\u00e9dito.", {"size": 16})],
], space_after=10)
text(s, 0.95, 4.4, 5.2, 0.5, "Riesgo: moneda + cr\u00e9dito", size=18, bold=True, color=RED)
rect(s, 6.95, 2.0, 5.65, 3.4, fill=CARD, line=GREEN, radius=True, lw=2)
text(s, 7.2, 2.2, 5.2, 0.5, "PR\u00c9STAMO EN ARGt", size=14, bold=True, color=GREEN)
text(s, 7.2, 2.7, 5.2, 2.5, [
    [("Ingreso, deuda y garant\u00eda en la misma unidad.", {"size": 16})],
    [("La devaluaci\u00f3n no cambia la carga real.", {"size": 16})],
    [("Queda un solo riesgo: cr\u00e9dito. Eso es lo que el aval cubre.", {"size": 16})],
], space_after=10)
text(s, 7.2, 4.4, 5.2, 0.5, "Riesgo: solo cr\u00e9dito", size=18, bold=True, color=GREEN)
text(s, 0.7, 5.75, 12, 0.8,
     [[("El token local no es un detalle: es lo que hace asegurable el riesgo.", {"size": 24, "bold": True, "color": AMBER})]])

# ---------------------------------------------------------------- 7. business
s = add_slide()
chrome(s, 7)
text(s, 0.6, 1.05, 12, 0.7, "Negocio: 2% del capital garantizado.", size=40, bold=True)
rows = [("Garant\u00eda", "1,5\u20132,5% del capital", "prestamista"),
        ("Comisi\u00f3n avalista", "10\u201315% de su fee", "avalista"),
        ("SaaS / legajo API", "USD 200\u2013500 / mes", "mutual / fintech")]
text(s, 0.7, 2.0, 6.0, 0.4, "L\u00cdNEAS DE INGRESO", size=12, bold=True, color=MUTED)
for i, (a, b, c) in enumerate(rows):
    y = 2.45 + i * 1.0
    rect(s, 0.7, y, 5.9, 0.85, fill=CARD, line=LINE, radius=True)
    text(s, 0.9, y + 0.08, 2.0, 0.7, a, size=14, bold=True)
    text(s, 2.85, y + 0.08, 2.4, 0.7, b, size=14, color=AMBER)
    text(s, 5.25, y + 0.08, 1.2, 0.7, c, size=11, color=MUTED)
text(s, 7.0, 2.0, 5.6, 0.4, "CU\u00d1A \u2192 PLATAFORMA", size=12, bold=True, color=MUTED)
rect(s, 7.0, 2.45, 5.6, 2.85, fill=CARD, line=AMBER, radius=True, lw=2)
for j, (ttl, sub) in enumerate([("Microcr\u00e9dito", "ticket USD 250"),
                               ("Garant\u00eda de alquiler", "ticket USD 12.000/a\u00f1o"),
                               ("Garant\u00eda entre proveedores", "ticket 10\u201340\u00d7")]):
    yy = 2.55 + j * 0.85
    text(s, 7.25, yy, 5.1, 0.4, [[(ttl, {"size": 20, "bold": True, "color": AMBER if j == 0 else INK})]])
    text(s, 7.25, yy + 0.36, 5.1, 0.3, [[(sub, {"size": 13, "color": MUTED})]])
text(s, 0.7, 5.6, 12, 0.8,
     [[("El microcr\u00e9dito es la cu\u00f1a. Los alquileres y los proveedores son el negocio.", {"size": 20, "bold": True})],
      [("Mismo contrato. Distinto ticket. La red de avalistas ya existe.", {"size": 15, "color": MUTED})]],
     line_spacing=1.2)

# ---------------------------------------------------------------- 8. close
s = add_slide()
rect(s, 0, 0, 0.18, H, fill=AMBER)
text(s, 0.9, 1.5, 11.8, 1.4, "El banco pide garant\u00edas.", size=52, bold=True)
text(s, 0.9, 2.6, 11.8, 1.4, "Nosotros las creamos.", size=52, bold=True, color=AMBER)
text(s, 0.95, 4.2, 11.5, 1.0,
     "Rosa no ten\u00eda garant\u00eda. Ten\u00eda una red.\nAval la convierte en cr\u00e9dito, en pesos y on-chain.",
     size=22, color=INK, line_spacing=1.2)
rect(s, 0.95, 5.55, 11.4, 0.02, fill=LINE)
cols = [("REPO", "github.com/<team>/aval"), ("TX", "0x\u2026  (Arbiscan)"), ("EQUIPO", "P1 \u00b7 P2 \u00b7 P3 \u00b7 P4")]
for i, (k, v) in enumerate(cols):
    x = 0.95 + i * 3.85
    text(s, x, 5.8, 3.6, 0.3, k, size=11, bold=True, color=MUTED)
    text(s, x, 6.12, 3.6, 0.5, v, size=15, color=INK)
text(s, 0.95, 6.85, 11.4, 0.3, "HackaTwin 2026  \u00b7  Twin Stablecoins  \u00b7  ARGt  \u00b7  Arbitrum",
     size=11, color=MUTED)

prs.save("docs/strategy/AVAL_PITCH.pptx")
print("saved", len(prs.slides.__iter__.__self__._sldIdLst), "slides")
