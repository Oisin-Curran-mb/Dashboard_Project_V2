/* Alerts & Actions design mocks: the card frame, status line, confirm dialog and item pop-up shared by the three options. */
var SHELL = (function () {
  var I = MOCK.ICON, E = MOCK.esc;
  function frame(size, inner, title) {
    var w = size === "xwide" ? 1148 : 566, h = size === "xwide" ? 560 : 496;
    return '<section class="widget mock" data-size="' + size + '" style="width:' + w + 'px;height:' + h + 'px">' +
      '<div class="whead"><div class="wtitle-wrap"><h3 class="wtitle">' + (title || "Alerts &amp; Actions") + (size === "xwide" ? " (Detail)" : "") + '</h3></div>' +
      '<div class="whover"><button class="wmini" title="' + E(MOCK.ABOUT) + '" aria-label="About this widget">' + I("info") + '</button></div><div class="wspace"></div>' +
      '<div class="wactions"><button class="iconbtn" aria-label="Refresh">' + I("refresh") + '</button><button class="iconbtn" aria-label="Size">' + I("aspect_ratio") + '</button><button class="iconbtn" aria-label="More">' + I("more_vert") + '</button></div></div>' +
      '<div class="wcontent">' + inner + '</div></section>';
  }
  function status(msg) { var el = document.getElementById("status"); if (el) el.textContent = msg; }
  function closeBd(bd) { bd.classList.add("al-modal-hiding"); setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 160); }
  function dialog(html) {
    var bd = document.createElement("div"); bd.className = "al-modal-backdrop"; bd.innerHTML = html; document.body.appendChild(bd);
    bd.addEventListener("click", function (ev) { if (ev.target === bd || ev.target.closest("[data-close]")) closeBd(bd); });
    function esc(ev) { if (ev.key === "Escape") { closeBd(bd); document.removeEventListener("keydown", esc, true); } }
    document.addEventListener("keydown", esc, true);
    var f = bd.querySelector("button"); if (f) f.focus();
    return bd;
  }
  /* Jo-style confirm: title, one line, Cancel + green verb */
  function confirmAct(it, verb, after) {
    var g = it.g, line = verb === "Approve" ? "Approve " + it.label + ", " + MOCK.money(it.amount) + ". The request moves to the next approver or to Approved." :
      verb === "Reject" ? "Reject " + it.label + ", " + MOCK.money(it.amount) + ". The requester is told." :
      "Open Payment Processing with " + it.label + " (" + MOCK.money(it.amount) + ") selected.";
    var bd = dialog('<div class="al-modal" role="dialog" aria-modal="true" aria-label="' + E(verb) + '"><div class="al-modal-hd"><div class="al-modal-hd-text"><div class="al-modal-cat">' + E(g.title) + '</div><div class="al-modal-title">' + E(verb) + '?</div></div><button class="al-modal-close iconbtn" data-close aria-label="Close">' + I("close") + '</button></div>' +
      '<div class="al-modal-body"><p class="al-modal-msg">' + E(line) + '</p></div>' +
      '<div class="al-modal-actions"><button class="btn outlined sm" data-close>Cancel</button><button class="btn primary sm ' + (verb === "Reject" ? "reject outlined" : "ok") + '" data-ok>' + E(verb) + '</button></div></div>');
    bd.querySelector("[data-ok]").addEventListener("click", function () { closeBd(bd); after(); });
  }
  function act(it, verb) {
    var g = it.g;
    if (verb === "Approve" || verb === "Reject" || verb === "Process payment") {
      confirmAct(it, verb, function () { status((verb === "Process payment" ? "Opening " + g.dest : verb + "d: " + it.label) + " (demo)"); });
    } else { status("Opens " + g.dest + " (demo)"); }
  }
  function factsTable(it) {
    return '<div class="al2-dp-table">' + it.facts.map(function (f) { return '<div class="al2-dp-row"><span class="al2-dp-lbl">' + E(f[0]) + '</span><span class="al2-dp-val' + (f[2] ? " val-err" : "") + '">' + E(f[1]) + '</span></div>'; }).join("") + '</div>';
  }
  function poExtra(it) {
    if (!it.lines) return "";
    return '<div class="al2-dp-section" style="padding:0 0 var(--padding-tight)"><div class="al2-dp-section-lbl">Line items</div><div class="al2-dp-items">' +
      it.lines.map(function (l) { return '<div class="al2-dp-item-row"><span class="al2-dp-item-desc">' + E(l[0]) + '</span><span class="al2-dp-item-qty">' + E(l[1]) + '</span><span class="al2-dp-item-amt">' + E(l[2]) + '</span></div>'; }).join("") +
      '<div class="al2-dp-item-row total"><span class="al2-dp-item-desc">Total</span><span class="al2-dp-item-qty"></span><span class="al2-dp-item-amt">' + MOCK.money(it.amount) + '</span></div></div></div>' +
      '<div class="al2-dp-section" style="padding:0"><div class="al2-dp-section-lbl">Approval trail</div><div class="al2-dp-trail">' +
      it.trail.map(function (t) { return '<div class="al2-dp-step"><div class="al2-dp-step-icon ' + (t[2] ? "done" : "pending") + '"></div><div class="al2-dp-step-info"><div class="al2-dp-step-name">' + E(t[0]) + '</div><div class="al2-dp-step-sub">' + E(t[1]) + '</div></div></div>'; }).join("") + '</div></div>';
  }
  function buttons(it, cls) {
    var g = it.g, c = cls || "sm", out = '<button class="btn outlined ' + c + '" data-a="open" data-it="' + it.id + '">' + I("open_in_new") + E(g.open) + '</button>';
    if (g.reject) out += '<button class="btn outlined ' + c + ' reject" data-a="act" data-v="Reject" data-it="' + it.id + '">' + E(g.reject) + '</button>';
    if (g.act) out += '<button class="btn primary ' + c + (g.act === "Approve" ? " ok" : "") + '" data-a="act" data-v="' + E(g.act) + '" data-it="' + it.id + '">' + E(g.act) + '</button>';
    return out;
  }
  /* one button per item at Explore: the completing verb if there is one, else the Open button */
  function button1(it, cls) {
    var g = it.g, c = cls || "sm";
    if (g.act) return '<button class="btn primary ' + c + (g.act === "Approve" ? " ok" : "") + '" data-a="act" data-v="' + E(g.act) + '" data-it="' + it.id + '">' + E(g.act) + '</button>';
    return '<button class="btn outlined ' + c + '" data-a="open" data-it="' + it.id + '">' + I("open_in_new") + E(g.open) + '</button>';
  }
  /* right-hand pane (Detail) */
  function pane(it, withNext) {
    if (!it) return '<div class="al2-dp"><div class="al2-dp-empty">' + I("touch_app") + '<span class="al2-dp-empty-title">Select an item to see its detail</span><span class="al2-dp-empty-sub">Act on it here, or open it in its module.</span></div></div>';
    var g = it.g;
    return '<div class="al2-dp"><div class="al2-dp-hd"><div class="al2-dp-hd-text"><div class="al2-dp-sev ' + (g.half === "act" ? "sev-need" : "sev-upd") + '">' + E(g.sev) + '</div><div class="al2-dp-title">' + E(g.title) + ': ' + E(it.label) + '</div></div></div>' +
      (withNext ? '<div class="dp-next"><div class="rec-next">' + I("arrow_forward") + '<span>' + E(it.next) + '</span></div></div>' : "") +
      '<div class="al2-dp-body">' + factsTable(it) + poExtra(it) + '</div>' +
      '<div class="al2-dp-actions"><p class="al2-dp-redirect-note">' + I("open_in_new") + ' Opens <strong>' + E(g.dest) + '</strong></p>' + buttons(it) + '</div></div>';
  }
  /* Explore pop-up */
  function popup(it) {
    var g = it.g;
    dialog('<div class="al-modal al-modal-md" role="dialog" aria-modal="true" aria-label="' + E(it.label) + '"><div class="al-modal-hd"><div class="al-modal-hd-text"><div class="al-modal-sev ' + (g.half === "act" ? "sev-err" : "sev-warn") + '">' + E(g.sev) + '</div><div class="al-modal-title">' + E(g.title) + ': ' + E(it.label) + '</div></div><button class="al-modal-close iconbtn" data-close aria-label="Close">' + I("close") + '</button></div>' +
      '<div class="al-modal-body"><p class="al-modal-msg">' + E(it.next) + '</p>' + factsTable(it) + '</div>' +
      '<div class="al-modal-actions">' + buttons(it) + '</div></div>');
  }
  function find(id) { var r = null; MOCK.groups.forEach(function (g) { g.items.forEach(function (it) { if (it.id === id) r = it; }); }); return r; }
  return { frame: frame, status: status, act: act, pane: pane, popup: popup, buttons: buttons, button1: button1, find: find, factsTable: factsTable };
})();
