"""Extract text from the HackaTwin PDFs (Type3/CID fonts, ToUnicode CMaps)."""
import re
import sys
import zlib

OBJ_RE = re.compile(rb'(\d+)\s+0\s+obj')

def load_objects(data):
    objs = {}
    matches = list(OBJ_RE.finditer(data))
    for i, m in enumerate(matches):
        num = int(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(data)
        body = data[start:end]
        objs[num] = body
    return objs

def get_stream(body):
    m = re.search(rb'stream\r?\n', body)
    if not m:
        return None
    return body[m.end():]

def decompress(body):
    raw = get_stream(body)
    if raw is None:
        return None
    raw = raw.rsplit(b'endstream', 1)[0]
    try:
        return zlib.decompress(raw)
    except Exception:
        try:
            return zlib.decompressobj().decompress(raw)
        except Exception:
            return None

def parse_cmap(txt):
    """Parse a ToUnicode CMap into {code_int: unicode_str}."""
    out = {}
    if not txt:
        return out
    s = txt.decode('latin-1')
    for blk in re.findall(r'beginbfchar(.*?)endbfchar', s, re.S):
        for src, dst in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            code = int(src, 16)
            try:
                u = bytes.fromhex(dst).decode('utf-16-be', 'ignore')
            except Exception:
                u = ''
            out[code] = u
    for blk in re.findall(r'beginbfrange(.*?)endbfrange', s, re.S):
        for lo, hi, dst in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            a, b = int(lo, 16), int(hi, 16)
            base = int(dst, 16)
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

def refs(body, key):
    m = re.search(rb'/' + key + rb'\s+(\d+)\s+0\s+R', body)
    return int(m.group(1)) if m else None

def font_info(objs, fnum):
    body = objs.get(fnum, b'')
    tu = refs(body, b'ToUnicode')
    cmap = parse_cmap(decompress(objs.get(tu, b''))) if tu else {}
    subtype = re.search(rb'/Subtype\s*/(\w+)', body)
    subtype = subtype.group(1) if subtype else b''
    two_byte = subtype in (b'Type0',) or b'Identity-H' in body
    return cmap, two_byte

def page_fonts(objs, body):
    """Map /Fxx -> font object number for one page."""
    fonts = {}
    m = re.search(rb'/Font\s*<<(.*?)>>', body, re.S)
    res = body
    if not m:
        rm = re.search(rb'/Resources\s+(\d+)\s+0\s+R', body)
        if rm:
            res = objs.get(int(rm.group(1)), b'')
            m = re.search(rb'/Font\s*<<(.*?)>>', res, re.S)
    if m:
        for name, num in re.findall(rb'/(\w+)\s+(\d+)\s+0\s+R', m.group(1)):
            fonts[name] = int(num)
    return fonts

TOKEN = re.compile(
    rb'/(\w+)\s+([\d.]+)\s+Tf'
    rb'|<([0-9A-Fa-f]+)>\s*Tj'
    rb'|\(((?:\\.|[^\\()])*)\)\s*Tj'
    rb'|([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm'
    rb'|([-\d.]+)\s+([-\d.]+)\s+Td',
    re.S)

def decode_content(dec, fonts, objs):
    items = []
    x = y = 0.0
    cur = ({}, False)
    for m in TOKEN.finditer(dec):
        if m.group(1):
            fnum = fonts.get(m.group(1))
            cur = font_info(objs, fnum) if fnum else ({}, True)
        elif m.group(3):
            h = m.group(3)
            items.append((x, y, decode_hex(h, cur)))
        elif m.group(4) is not None:
            items.append((x, y, decode_lit(m.group(4), cur)))
        elif m.group(5) is not None:
            x = float(m.group(9))
            y = float(m.group(10))
        elif m.group(11) is not None:
            x += float(m.group(11))
            y += float(m.group(12))
    items.sort(key=lambda t: (-round(t[1], 1), t[0]))
    lines = []
    cur_line = []
    lasty = None
    for xx, yy, s in items:
        if not s.strip():
            continue
        if lasty is None or abs(yy - lasty) < 4.0:
            cur_line.append((xx, s))
        else:
            cur_line.sort()
            lines.append(''.join(t for _, t in cur_line).strip())
            cur_line = [(xx, s)]
        lasty = yy
    if cur_line:
        cur_line.sort()
        lines.append(''.join(t for _, t in cur_line).strip())
    return [l for l in lines if l.strip()]

def decode_hex(h, cur):
    cmap, two = cur
    try:
        b = bytes.fromhex(h.decode())
    except Exception:
        return ''
    if len(b) % 2:
        b += b'\x00'
    out = []
    step = 2 if two or (cmap and max(cmap) > 255) else 1
    for i in range(0, len(b), step):
        code = int.from_bytes(b[i:i + step], 'big')
        if code in cmap:
            out.append(cmap[code])
        elif step == 1:
            out.append(chr(code) if 32 <= code < 127 else '')
    return ''.join(out)

def decode_lit(raw, cur):
    cmap, _ = cur
    s = raw.decode('latin-1')
    s = s.replace('\\(', '(').replace('\\)', ')').replace('\\\\', '\\')
    out = []
    for ch in s:
        code = ord(ch)
        out.append(cmap.get(code, ch))
    return ''.join(out)

def extract(path, outpath):
    data = open(path, 'rb').read()
    objs = load_objects(data)
    pages = []
    for num, body in objs.items():
        if re.search(rb'/Type\s*/Page[^s]', body):
            pages.append((num, body))
    pages.sort(key=lambda t: t[0])
    blocks = []
    for num, body in pages:
        fonts = page_fonts(objs, body)
        cm = re.search(rb'/Contents\s+(\d+)\s+0\s+R', body)
        if not cm:
            am = re.search(rb'/Contents\s*\[(.*?)\]', body, re.S)
            if not am:
                continue
            nums = [int(x) for x in re.findall(rb'(\d+)\s+0\s+R', am.group(1))]
        else:
            nums = [int(cm.group(1))]
        text = []
        for n in nums:
            dec = decompress(objs.get(n, b''))
            if dec:
                text.extend(decode_content(dec, fonts, objs))
        blocks.append('=== PAGE %d ===\n' % num + '\n'.join(text))
    open(outpath, 'w', encoding='utf-8').write('\n\n'.join(blocks))
    print(outpath, len(blocks), 'pages')

if __name__ == '__main__':
    extract(sys.argv[1], sys.argv[2])
