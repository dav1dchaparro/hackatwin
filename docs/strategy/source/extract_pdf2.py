"""Position-aware text extraction for Word-exported PDFs (per-glyph Tm/Td + cm CTM).

The original extractor ignored the graphics-state CTM and the per-object Tm, so
glyphs from different text blocks were merged onto the same line. This version
tracks q/Q/cm, Tm/Td/TD/T*, and TJ arrays, then reconstructs lines by absolute
baseline and inserts spaces from real x-gaps.
"""
import re
import sys
import zlib

OBJ_RE = re.compile(rb'(\d+)\s+0\s+obj')


def load_objects(data):
    objs = {}
    ms = list(OBJ_RE.finditer(data))
    for i, m in enumerate(ms):
        num = int(m.group(1))
        end = ms[i + 1].start() if i + 1 < len(ms) else len(data)
        objs[num] = data[m.end():end]
    return objs


def decompress(body):
    m = re.search(rb'stream\r?\n', body)
    if not m:
        return None
    raw = body[m.end():].rsplit(b'endstream', 1)[0]
    try:
        return zlib.decompress(raw)
    except Exception:
        try:
            return zlib.decompressobj().decompress(raw)
        except Exception:
            return None


def parse_cmap(txt):
    out = {}
    if not txt:
        return out
    s = txt.decode('latin-1')
    for blk in re.findall(r'beginbfchar(.*?)endbfchar', s, re.S):
        for src, dst in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            try:
                out[int(src, 16)] = bytes.fromhex(dst).decode('utf-16-be', 'ignore')
            except Exception:
                pass
    for blk in re.findall(r'beginbfrange(.*?)endbfrange', s, re.S):
        for lo, hi, dst in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            a, b, base = int(lo, 16), int(hi, 16), int(dst, 16)
            for k in range(a, b + 1):
                out[k] = chr(base + (k - a))
        for lo, hi, arr in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[(.*?)\]', blk, re.S):
            a = int(lo, 16)
            for i, dst in enumerate(re.findall(r'<([0-9A-Fa-f]+)>', arr)):
                try:
                    out[a + i] = bytes.fromhex(dst).decode('utf-16-be', 'ignore')
                except Exception:
                    pass
    return out


def ref(body, key):
    m = re.search(rb'/' + key + rb'\s+(\d+)\s+0\s+R', body)
    return int(m.group(1)) if m else None


def font_info(objs, num):
    body = objs.get(num, b'')
    tu = ref(body, b'ToUnicode')
    cmap = parse_cmap(decompress(objs.get(tu, b''))) if tu else {}
    return cmap


def page_fonts(objs, body):
    fonts = {}
    res = body
    m = re.search(rb'/Font\s*<<(.*?)>>', body, re.S)
    if not m:
        rm = ref(body, b'Resources')
        if rm:
            res = objs.get(rm, b'')
            m = re.search(rb'/Font\s*<<(.*?)>>', res, re.S)
    if m:
        for name, num in re.findall(rb'/(\w+)\s+(\d+)\s+0\s+R', m.group(1)):
            fonts[name] = int(num)
    return fonts


NUM = rb'[-+]?[\d.]+'


def tokenize(code):
    """Yield tokens: operators and operands (bytes)."""
    out = []
    i, n = 0, len(code)
    while i < n:
        c = code[i:i + 1]
        if c in b' \t\r\n\x00':
            i += 1
        elif c == b'%':
            j = code.find(b'\n', i)
            i = n if j < 0 else j + 1
        elif c in b'()':
            depth = 0
            j = i
            buf = bytearray()
            while j < n:
                ch = code[j:j + 1]
                if ch == b'\\':
                    buf += code[j:j + 2]
                    j += 2
                    continue
                if ch == b'(':
                    depth += 1
                    if depth == 1:
                        j += 1
                        continue
                if ch == b')':
                    depth -= 1
                    if depth == 0:
                        j += 1
                        break
                buf += ch
                j += 1
            out.append(bytes(buf))
            i = j
        elif c == b'[' or c == b']':
            out.append(c)
            i += 1
        elif c == b'<':
            j = code.find(b'>', i)
            if j < 0:
                break
            out.append(code[i:j + 1])
            i = j + 1
        elif c == b'/':
            j = i + 1
            while j < n and code[j:j + 1] not in b' \t\r\n\x00/[]<>()':
                j += 1
            out.append(code[i:j])
            i = j
        else:
            m = re.match(rb'[-+]?[\d.]+', code[i:])
            if m:
                out.append(m.group(0))
                i += len(m.group(0))
            else:
                j = i + 1
                while j < n and code[j:j + 1] not in b' \t\r\n\x00/[]<>()':
                    j += 1
                out.append(code[i:j])
                i = j
    return out


def mul(a, b):
    return [
        a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
        a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3],
        a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5],
    ]


def decode_str(raw, cmap, two):
    try:
        if raw.startswith(b'<'):
            hexs = raw[1:-1] if raw.endswith(b'>') else raw[1:]
            b = bytes.fromhex(hexs.decode())
        else:
            b = raw
    except Exception:
        return ''
    if raw.startswith(b'<') and len(b) % 2:
        b += b'\x00'
    out = []
    step = 2 if two or (cmap and max(cmap) > 255) else 1
    for i in range(0, len(b), step):
        code = int.from_bytes(b[i:i + step], 'big')
        if code in cmap:
            out.append(cmap[code])
        elif step == 1 and 32 <= code < 127:
            out.append(chr(code))
    return ''.join(out)


def decode(content, fonts, objs):
    ctm = [1, 0, 0, 1, 0, 0]
    stack = []
    tm = tlm = [1, 0, 0, 1, 0, 0]
    cmap = {}
    size = 1.0
    glyphs = []  # (x, y, ch, size)
    toks = tokenize(content)
    operands = []
    last_show = None
    for t in toks:
        if t in (b'[', b']'):
            operands.append(t)
            continue
        if re.fullmatch(rb'[-+]?[\d.]+', t) or t.startswith(b'/') or t.startswith(b'<') or t.startswith(b'(') or t in (b'[]',):
            operands.append(t)
            continue
        op = t
        if op == b'q':
            stack.append(ctm[:])
        elif op == b'Q':
            if stack:
                ctm = stack.pop()
        elif op == b'cm' and len(operands) >= 6:
            nums = [float(x) for x in operands[-6:]]
            ctm = mul(nums, ctm)
        elif op == b'BT':
            tm = tlm = [1, 0, 0, 1, 0, 0]
        elif op == b'Tf' and len(operands) >= 2:
            try:
                size = float(operands[-1])
            except Exception:
                size = 1.0
            cmap = fonts.get(operands[-2].lstrip(b'/'), {})
        elif op == b'Tm' and len(operands) >= 6:
            tm = [float(x) for x in operands[-6:]]
            tlm = tm[:]
        elif op in (b'Td', b'TD') and len(operands) >= 2:
            tx, ty = float(operands[-2]), float(operands[-1])
            tlm = mul([1, 0, 0, 1, tx, ty], tlm)
            tm = tlm[:]
        elif op == b'T*':
            tlm = mul([1, 0, 0, 1, 0, -12], tlm)
            tm = tlm[:]
        elif op == b'Tj' and operands:
            s = decode_str(operands[-1], cmap, False)
            if s:
                m = mul(tm, ctm)
                glyphs.append((m[4], m[5], s, size))
            operands = []
        elif op == b'TJ' and operands:
            # operands inside [] tokens
            parts = []
            for o in operands:
                if o.startswith(b'<') or o.startswith(b'('):
                    parts.append(decode_str(o, cmap, False))
            s = ''.join(parts)
            if s:
                m = mul(tm, ctm)
                glyphs.append((m[4], m[5], s, size))
            operands = []
        elif op in (b"'", b'"') and operands:
            s = decode_str(operands[-1], cmap, False)
            if s:
                m = mul(tm, ctm)
                glyphs.append((m[4], m[5], s, size))
            operands = []
        else:
            operands = []
        if op in (b'Tj', b'TJ', b"'", b'"'):
            operands = []
    return glyphs


def build_lines(glyphs):
    lines = {}
    for x, y, s, size in glyphs:
        key = round(y / 3.0) * 3.0
        lines.setdefault(key, []).append((x, s, size))
    out = []
    for y in sorted(lines, reverse=True):
        items = sorted(lines[y], key=lambda t: t[0])
        buf = []
        prev_x = None
        prev_size = 10
        for x, s, size in items:
            if prev_x is not None:
                gap = x - prev_x
                if gap > max(prev_size, size) * 0.22 and not buf[-1].endswith(' '):
                    buf.append(' ')
            buf.append(s)
            prev_x = x + len(s) * max(size, 1) * 0.5
            prev_size = size
        txt = ''.join(buf).replace('  ', ' ')
        if txt.strip():
            out.append((y, txt.strip()))
    return out


def extract(path, outpath):
    data = open(path, 'rb').read()
    objs = load_objects(data)
    pages = []
    for num, body in objs.items():
        if re.search(rb'/Type\s*/Page[^s]', body):
            pages.append((num, body))
    pages.sort(key=lambda t: t[0])
    blocks = []
    for i, (num, body) in enumerate(pages, 1):
        fonts = {k: font_info(objs, v) for k, v in page_fonts(objs, body).items()}
        nums = []
        cm_ = re.search(rb'/Contents\s+(\d+)\s+0\s+R', body)
        if cm_:
            nums = [int(cm_.group(1))]
        else:
            am = re.search(rb'/Contents\s*\[(.*?)\]', body, re.S)
            if am:
                nums = [int(x) for x in re.findall(rb'(\d+)\s+0\s+R', am.group(1))]
        glyphs = []
        for n in nums:
            dec = decompress(objs.get(n, b''))
            if dec:
                glyphs.extend(decode(dec, fonts, objs))
        lines = build_lines(glyphs)
        blocks.append('=== PAGE %d ===\n' % i + '\n'.join(t for _, t in lines))
    open(outpath, 'w', encoding='utf-8').write('\n\n'.join(blocks))
    print(outpath, len(blocks), 'pages')


if __name__ == '__main__':
    extract(sys.argv[1], sys.argv[2])
