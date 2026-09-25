// One-off, 2026-09-25, owner ruling on the W04 table after the browser check:
//   1. column headings follow Jo's phase 2 (Activity, Pledge, Outstanding, Paid, Expected, % Paid;
//      her order, her paired alignment: Pledge/Paid right, Outstanding/Expected left)
//   2. Explore (wide) shows four columns only: Activity | Outstanding | Paid | % Paid, fitted to
//      the card width with no side-scroll; Detail (xwide) keeps every column incl. Seq and
//      Pledges behind (the T10 count stays on Detail and in the pop-up)
//   3. the per-card info button is dropped at Glance (kpi) only
//   4. layout defects at Explore auto-fixed: clipped third pace card, clipped Table/Popular toggle
// Anchored; aborts before writing on any miss.
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "..", "index.html"), NL = "\r\n";
let t = fs.readFileSync(FILE, "utf8");
const once = function (n, label) { const i = t.indexOf(n); if (i < 0 || t.indexOf(n, i + 1) > -1) throw new Error("anchor: " + (label || n.slice(0, 70))); return i; };
const swap = function (a, b, label) { once(a, label); t = t.replace(a, b); };
const fnReplace = function (name, body) { const s = once("function " + name + "(w"); const e = t.indexOf(NL + "}" + NL, s) + (NL + "}" + NL).length; t = t.slice(0, s) + body + t.slice(e); };

/* ---- JS ---- */
swap("/* ---- report table (Version A columns in Jo's style, strictly tabular, no bar):" + NL + "   Activity | Pledge | Expected | Paid | Outstanding | % Paid ---- */",
  "/* ---- activity table. Explore: Activity | Outstanding | Paid | % Paid. Detail adds Seq," + NL + "   Pledges behind (instalment count), Pledge and Expected (term pacing). ---- */", "table comment");

fnReplace("remOHead", [
  "function remOFull(w){return w.size===\"xwide\";}",
  "function remOHead(w){",
  "  var full=remOFull(w);",
  "  return '<div class=\"remO-row remO-head'+(full?\" remO-full\":\"\")+'\">'+",
  "    (full?'<span class=\"remO-cell remO-seq\">'+remOSortBtn(w,\"seq\",\"Seq.\")+'</span>':'')+",
  "    '<span class=\"remO-cell remO-name\">'+remOSortBtn(w,\"name\",\"Activity\")+'</span>'+",
  "    (full?'<span class=\"remO-cell remO-num\">'+remOSortBtn(w,\"behind\",\"Pledges behind\",\"How many pledges behind this activity have at least one payment unpaid for more than \"+REMO_GRACE_DAYS+\" days. Payments still inside their grace period count as at risk, not behind, and are shown when you open the activity.\")+'</span>'+",
  "          '<span class=\"remO-cell remO-num\">'+remOSortBtn(w,\"annual\",\"Pledge\",\"Total pledged over each pledge's own term (start to end date). A multi-year pledge counts in full, not one year's share.\")+'</span>':'')+",
  "    '<span class=\"remO-cell remO-num'+(full?\" remO-alignL\":\"\")+'\">'+remOSortBtn(w,\"outstanding\",\"Outstanding\")+'</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+remOSortBtn(w,\"paidamt\",\"Paid\",\"Every receipt recorded against this activity up to the Receipts through date. Cumulative over the pledge term, not year-to-date.\")+'</span>'+",
  "    (full?'<span class=\"remO-cell remO-num remO-alignL\">'+remOSortBtn(w,\"expected\",\"Expected\",\"Amount that should have been paid by now, from the share of each pledge's own term (start to end date) elapsed. Not a calendar-year figure.\")+'</span>':'')+",
  "    '<span class=\"remO-cell remO-pct\">'+remOSortBtn(w,\"pct\",\"% Paid\")+'</span>'+",
  "  '</div>';",
  "}", ""].join(NL));

fnReplace("remORow", [
  "function remORow(w,r){",
  "  var full=remOFull(w);",
  "  return '<div class=\"remO-row'+(full?\" remO-full\":\"\")+'\" data-action=\"remO-open\" data-id=\"'+w.id+'\" data-seq=\"'+r.seq+'\" role=\"button\" tabindex=\"0\" aria-label=\"'+remOEsc(r.name+\", \"+remORowSr(r)+\" \"+remOStatusLabel(remOStatus(r))+\". Open the member churches behind this fund.\")+'\">'+",
  "    (full?'<span class=\"remO-cell remO-seq\">'+r.seq+'</span>':'')+",
  "    '<div class=\"remO-cell remO-name\"><span class=\"remO-name-nm\">'+r.name+'</span></div>'+",
  "    (full?'<span class=\"remO-cell remO-num\">'+remOBehindCell(w,r)+'</span>'+",
  "          '<span class=\"remO-cell remO-num\">'+money(r.total)+'</span>':'')+",
  "    '<span class=\"remO-cell remO-num'+(full?\" remO-alignL\":\"\")+'\">'+money(r.outstanding)+'</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+money(r.paid)+'</span>'+",
  "    (full?'<span class=\"remO-cell remO-num remO-alignL\">'+money(r.expected)+'</span>':'')+",
  "    '<span class=\"remO-cell remO-pct\">'+remOMiniBar(r)+'</span>'+",
  "    '<span class=\"sr-only\">'+remORowSr(r)+' '+remOStatusLabel(remOStatus(r))+'.</span>'+",
  "  '</div>';",
  "}", ""].join(NL));

swap([
  "  var tot='<div class=\"remO-row remO-total\">'+",
  "    '<span class=\"remO-cell remO-seq\"></span>'+",
  "    '<span class=\"remO-cell remO-name remO-total-lead\">Total ('+tt.count+' activit'+(tt.count===1?\"y\":\"ies\")+')</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+tt.behind+'</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+money(tt.total)+'</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+money(tt.expected)+'</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+money(tt.paid)+'</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+money(tt.out)+'</span>'+",
  "    '<span class=\"remO-cell remO-pct\">'+totMini+'</span>'+",
  "  '</div>';"].join(NL), [
  "  var full=remOFull(w);",
  "  var tot='<div class=\"remO-row remO-total'+(full?\" remO-full\":\"\")+'\">'+",
  "    (full?'<span class=\"remO-cell remO-seq\"></span>':'')+",
  "    '<span class=\"remO-cell remO-name remO-total-lead\">Total ('+tt.count+' activit'+(tt.count===1?\"y\":\"ies\")+')</span>'+",
  "    (full?'<span class=\"remO-cell remO-num\">'+tt.behind+'</span>'+",
  "          '<span class=\"remO-cell remO-num\">'+money(tt.total)+'</span>':'')+",
  "    '<span class=\"remO-cell remO-num'+(full?\" remO-alignL\":\"\")+'\">'+money(tt.out)+'</span>'+",
  "    '<span class=\"remO-cell remO-num\">'+money(tt.paid)+'</span>'+",
  "    (full?'<span class=\"remO-cell remO-num remO-alignL\">'+money(tt.expected)+'</span>':'')+",
  "    '<span class=\"remO-cell remO-pct\">'+totMini+'</span>'+",
  "  '</div>';"].join(NL), "total row");

/* glance: no per-card info button */
swap("    var info='<button type=\"button\" class=\"remO-cardinfo\"", "    var info=w.size===\"kpi\"?'':'<button type=\"button\" class=\"remO-cardinfo\"", "card info");

/* ---- CSS ---- */
swap("  .remO-row{display:grid;grid-template-columns:minmax(150px,2fr) 76px 80px 80px 80px 110px;",
  "  .remO-row{display:grid;grid-template-columns:minmax(0,1fr) 68px 60px 74px;", "explore grid");
swap("  .remO-row{grid-template-columns:34px minmax(108px,1.5fr) 66px 72px 78px 78px 80px 98px;}",
  "  .remO-row.remO-full{grid-template-columns:34px minmax(120px,1.5fr) 64px 76px 80px 76px 80px 98px;}", "detail grid");
swap("  .remO-cards{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);",
  "  .remO-cards{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));", "cards grid");
swap("  .remO-card-sub{font-size:11px;color:var(--txt-subtle);font-variant-numeric:tabular-nums;}",
  "  .remO-card-sub{font-size:11px;color:var(--txt-subtle);font-variant-numeric:tabular-nums;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" + NL +
  "  .w04-hd .dep-hd-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;}", "card sub + header wrap");
swap("  .remO-glancewrap .remO-cardwrap .remO-card{padding:8px 9px;padding-right:17px;}",
  "  .remO-glancewrap .remO-cardwrap .remO-card{padding:8px 9px;}", "glance card padding");
swap("  .remO-glancewrap .remO-cardinfo{top:3px;right:3px;padding:1px;}" + NL + "  .remO-glancewrap .remO-cardinfo .material-symbols-rounded{font-size:13px;}" + NL, "", "glance info rules");

if ((t.match(/(?<!\r)\n/g) || []).length) throw new Error("bare LF");
fs.writeFileSync(FILE, t, "utf8"); console.log("done: " + t.split(NL).length + " lines");
// Follow-up the same day, after measuring in the browser: the Explore grid became
// "minmax(0,1fr) 80px 54px 70px" so the "Outstanding" header (label + sort icon) no longer wraps.
// Also added ".remO-head .wt-sort{white-space:nowrap;}": the shell sort button is inline-block with
// normal wrapping, so its icon dropped to a second line in the narrower Explore columns.
// Detail grid refit (owner, same day): "38px minmax(0,1fr) 62px 76px 82px 76px 78px 80px", gap 6px, 8px side padding, so the
// Activity column takes the slack (~169px, names fit) and every numeric column sits at its natural width;
// the two-word "Pledges behind" header may wrap to two lines. Pledges-behind count no longer bold.
// Owner, same day: no paired left/right alignment after all; every money column right-aligned like
// the other finished widgets (D12), "Pledges behind" header on one line, columns evenly spaced:
// Detail grid "40px minmax(0,1fr) 97px 76px 82px 76px 80px 80px", gap 5px (Seq 40 so its sort icon is not clipped). remO-alignL removed.
// Owner, same day: header labels sat ~14px left of their numbers because the shell hides the sort icon
// until hover while it still takes space. The header row now carries the shell's wt-head class like the
// other finished widgets (icon always visible at the column edge); the W04 display:inline override went.
// Owner, same day (Explore): card sub-text is the amount only below Detail; card label nowrap at 10.5px
// with 8/18px card padding so it clears the info button; Explore grid "minmax(0,1fr) 88px 60px 68px",
// gap 6, padding 7px 8px (the "Outstanding" header had been clipped). The total row now renders inside
// the scroll container as a sticky bottom row, so its columns stay under the body's when the list scrolls.
// Owner, same day: every table column LEFT-aligned (headers and figures), Outstanding column 96px so its
// header never clips; the total row mini-bar cell follows the same left alignment.
