#!/usr/bin/env node
/* React の画面説明（react-src/src/components/screen-description/screenDescriptions.ts）を
   画面設計 nqrepo-screen-design.html の SCREEN_DESC へ写す。右パネルの「この画面でできること」の元。
   React 側の説明を直したら手で写さず、これを流し直す:  node .claude/sd-gen.cjs
   キーは画面のファイル（SCREENS の src と同じ）。画面上コーチマークの位置指定（marks）は資料に要らないので落とす */
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const html = path.join(root, 'nqrepo-screen-design.html');
/* screenDescriptions.ts は import の無い素の TS なので、Node（22.6 以降の型の読み飛ばし）でそのまま読める */
const tsFile = path.join(root, 'react-src/src/components/screen-description/screenDescriptions.ts');

(async () => {
const { SCREEN_DESCRIPTIONS } = await import(tsFile);

const pick = d => {
  const o = { summary: d.summary, points: d.points || [] };
  if (d.note) o.note = d.note;
  if (d.states?.length) o.states = d.states.map(s => {
    const x = { label: s.label, summary: s.summary, points: s.points || [] };
    if (s.note) x.note = s.note;
    return x;
  });
  return o;
};
const data = Object.fromEntries(Object.keys(SCREEN_DESCRIPTIONS).sort().map(k => [k, pick(SCREEN_DESCRIPTIONS[k])]));

const BEGIN = '/* SCREEN_DESC:BEGIN（.claude/sd-gen.cjs が書く。手で直さない） */';
const END = '/* SCREEN_DESC:END */';
const src = fs.readFileSync(html, 'utf8');
const a = src.indexOf(BEGIN), b = src.indexOf(END);
if (a < 0 || b < a) { console.error('nqrepo-screen-design.html に SCREEN_DESC の印がありません'); process.exit(1); }
const body = `${BEGIN}\nconst SCREEN_DESC = ${JSON.stringify(data)};\n`;
fs.writeFileSync(html, src.slice(0, a) + body + src.slice(b));
console.log(`SCREEN_DESC を ${Object.keys(data).length} 画面ぶん書きました`);
})();
