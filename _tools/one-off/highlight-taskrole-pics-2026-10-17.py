# Highlight the rows that matter on the Task Role editor pictures (17 Oct 2026).
# Row bands are found from the table's horizontal rules, then each requested y is snapped to its band.
from PIL import Image, ImageDraw
import os
SRC = r"C:\Users\ocurran\AppData\Local\Temp\claude\C--Users-ocurran\757e49f3-a29b-471e-8afb-fe14ef9b4809\scratchpad\oldui"
OWN = r"C:\Users\ocurran\AppData\Local\Temp\claude\C--Users-ocurran\757e49f3-a29b-471e-8afb-fe14ef9b4809\images\67.png"
DST = r"C:\Users\ocurran\Desktop\For Dashboard\Step 7 - Version 2\Complete Version 2\docs\Pics\Permissions"
BLUE = (37, 99, 235)   # a brand-like blue, drawn 3px with a soft outer glow


def rules(im, x0, x1, ymin, ymax):
    """y positions of thin horizontal grey rules spanning most of x0..x1"""
    px = im.load(); out = []
    for y in range(ymin, ymax):
        dark = 0; n = 0
        for x in range(x0, x1, 2):
            r, g, b = px[x, y]; n += 1
            if r < 236 and abs(r - g) < 8 and abs(g - b) < 8: dark += 1
        if dark > n * 0.7: out.append(y)
    # collapse runs
    bands = []
    for y in out:
        if bands and y - bands[-1][1] <= 2: bands[-1][1] = y
        else: bands.append([y, y])
    return [b[0] for b in bands]


HALF = 13
def snap(ys, y):
    """a fixed band around the row centre (the table's rules are too faint to detect reliably)"""
    return y - HALF, y + HALF


def box(d, x0, y0, x1, y1):
    for k, a in ((4, 60), (3, 120), (2, 255)):
        d.rounded_rectangle((x0 - k, y0 - k, x1 + k, y1 + k), radius=8, outline=BLUE + (a,), width=1)
    d.rounded_rectangle((x0, y0, x1, y1), radius=7, outline=BLUE + (255,), width=3)


def mark(name, src_jpg, crop, rows, xr, scan):
    im = Image.open(src_jpg).convert("RGB").crop(crop)
    ys = rules(im, scan[0], scan[1], 0, im.size[1])
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for y in rows:
        t, b = snap(ys, y)
        box(d, xr[0], t + 2, xr[1], b - 2)
    out = Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")
    out.save(os.path.join(DST, name + ".png"), optimize=True)
    print(name, "rules:", len(ys), "rows:", [snap(ys, y) for y in rows])


C = (60, 14, 546, 796)     # the page card in the 800x1155 pane captures
X = (32, 452)              # label column start .. past the Full Rights box
S = (40, 440)              # where to scan for rules
# requested rows, in cropped coordinates (capture y minus 14)
mark("taskrole-purchasing", os.path.join(SRC, "taskrole-purchasing.jpg"), C, [362, 417, 473, 611], X, S)
mark("taskrole-payables", os.path.join(SRC, "taskrole-payables.jpg"), C, [131, 412, 489], X, S)
mark("taskrole-bank", os.path.join(SRC, "taskrole-bank.jpg"), C, [549], X, S)
mark("taskrole-gifts", os.path.join(SRC, "taskrole-gifts.jpg"), C, [336, 387], X, S)
mark("taskrole-remittance", os.path.join(SRC, "taskrole-remittance.jpg"), C, [285, 387], X, S)
mark("taskrole-loans", os.path.join(SRC, "taskrole-loans.jpg"), C, [396, 626], X, S)
mark("taskrole-payroll", os.path.join(SRC, "taskrole-payroll.jpg"), C, [387, 413, 541], X, S)
mark("taskrole-generalledger", os.path.join(SRC, "taskrole-generalledger.jpg"), C, [387], X, S)
# the owner's full-width screenshot: Dashboard row of Accounts Payable
HALF = 21
mark("taskrole-dashboard-row", OWN, (0, 50, 1895, 1085), [617], (770, 1680), (800, 1660))
