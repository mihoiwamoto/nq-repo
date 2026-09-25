# NQリポ 画面設計キット — 他の案件へ持っていくための決まり

このフォルダは「触れるプロトタイプ」と「画面設計の資料」を組み合わせた作り方の見本です。
元は NVIDEO 案件のキット。**このファイルと2つの HTML をコピーして、データだけ差し替えて**作りました。
別の案件で同じことをするときも、ソースを読んで推測させるより、この手順で差し替えるほうが速く、失敗しません。

---

## 0. この案件（NQリポ）でのローカル確認

```bash
node .claude/serve.cjs
```

`http://127.0.0.1:8791/nqrepo-screen-design.html` が開きます（`PORT` で変えられる）。
**2026-09-25 から、画面設計の枠に映るのは React 実装そのもの**（`../other/NQrepo（old）/dist-kit` を同じサーバーが `/react/` の下で配る。置き場は `REACT_DIST` で変えられる）。
React 側を直したら、React のフォルダで `npm run build:kit`（`vite build --base=/react/ --outDir=dist-kit`）して dist-kit を作り直す（画面設計はリロードするだけ）。
dist-kit が無い／サーバーを使わずダブルクリックで開いたときは、従来どおり単体 HTML のプロトタイプ `nqrepo-demo.html` が映る（起動時に `react/` が返るかを見て切り替える。`PROJECT.demo.fallback`）。
別ポートで配らず同じオリジンにしているのは、別ポートだと Chrome が別プロセスの iframe として扱い、配置図のある画面（ガラス・プラスチック管理）が白いままになったため。

**React を /react/ の下で配るときの注意（2026-09-25）。** React 側で `/…` の絶対パスを書くと、`/react/` の下では見つからない。
`import.meta.env.BASE_URL` を頭に付けること（`src/data/ledgers.ts` の帳票アイコン、`src/admin/features/guide/screenShots.tsx` の撮影済みスクリーンショットを直した）。
`.claude/.shots` は dist に入らないので、`serve.cjs` が `/react/.claude/…` を React のフォルダから直に配る。

**Vercel（nq-repo.vercel.app）での公開（2026-09-25）。** このリポジトリの `main` は Vercel が静的ファイルのまま配る（`vercel.json`：ビルド無し、`/` → 画面設計へ転送、`/react/*` は SPA として `react/index.html`、`snapshots/images/*` → `images/*`）。
Vercel にはリポジトリの外のフォルダが無いので、**React の dist-kit を `react/` に写してコミットする**。React 側を直したら `npm run build:kit` のあと `rm -rf react && cp -R "../other/NQrepo（old）/dist-kit" react` してコミット・プッシュ。
画面説明の撮影済みスクリーンショット（`.claude/.shots`、69MB）は Vercel に載せていないので、そこだけ画像が出ない。

**画面が正しく出るかの一括点検。** 画面設計の全画面（304 枚）を順にめくって、白い画面・壊れた画像・JS エラー・行き先違いを調べる仕掛けを使った。
`/react/` は画面設計と同じオリジンなので、iframe の中（`contentDocument`）をそのまま読める。hash が React のルートに無いと `*` で `/admin/login` に飛ぶので、「行き先が hash と違う」で見つけられる。
画面や hash を足したあとは同じやり方で一度めくると早い（作業用の HTML は使い終わったら消す）。

- 画面設計 … `nqrepo-screen-design.html`（#M3 のように画面IDで直接開ける。`#flow` `#ref` `#release` で フロー・前提・リリース）
- 画面の実体 … React 実装の dist-kit（`http://127.0.0.1:8791/react/?frame=1#admin/approvals` のように単体でも開ける）。ブリッジは React 側の `src/frameBridge.tsx`（`main.tsx` と `App.tsx` から呼ぶ）
- プロトタイプ（予備） … `nqrepo-demo.html`（右下の切替で 管理画面／アプリ、ロール、状態を変える。`1` `2` キーで端末切替）
- デザインガイド … `../NQrepoDesignSystem/nqrepo-design-guide.html`（別フォルダ）
- React 実装 … `../NQrepo`（`npm run dev` で `http://localhost:5173`）

---

## 1. 何ができる作りか

- 画面ごとの仕様を見ながら、**その場で動くプロトタイプ**を触れる
- 画面のつながりを**フロー図**で俯瞰でき、ノードを押すと隣にその画面が出る
- 利用者・規模・権限・用語などの**前提**を1枚にまとめてある
- 画面を開いたまま**データが無い／オフライン／送信エラー／セッション終了／ロール**に切り替えられる
- 資料とプロトタイプの**デザインが絶対にズレない**（見た目の実体は1か所しかないため）

## 2. ファイル構成

| ファイル | 役割 | 触る頻度 |
|---|---|---|
| `nqrepo-demo.html` | プロトタイプ本体。**見た目と挙動の実体はここだけ** | 高い |
| `nqrepo-screen-design.html` | 画面設計。プロトタイプを iframe で表示し、説明と決めることを持つ | 高い |
| `images/` | 実アイコン。`../NQrepo/src/assets/figma` の nav・rail・ledger・common とロゴを写したもの | 低い |
| `.claude/serve.cjs` `.claude/launch.json` | ローカル確認用の静的サーバー | 低い |
| `.claude/snapshot.py` `.claude/settings.json` | プロトタイプの控えを取る道具と、Claude Code のフック | 低い |
| `snapshots/` | プロトタイプの控え。画面設計の更新履歴から変更の前後を並べる。**手で直さない** | 自動 |
| `../NQrepo/src/index.css` | 色の元（`--semantic-*`）。プロトタイプの `:root` はこれの写し | 低い |
| `../NQrepoDesignSystem/` | デザインガイド。禁止パターンと部品の使い方 | 低い |

**画面の見た目を画面設計側に実装しないこと。** 2つ作ると必ずズレます。

### 2-0. 見本データは React 実装の mockData そのもの（2026-09-25）

プロトタイプに出るデータは **React 実装（`Documents/other/NQrepo（old）`）の mockData を写したもの**で、勝手に作らない。
`nqrepo-demo.html` の `const MK = {…}` が管理画面（`src/admin/data`・`src/admin/features/<機能>/mockData.ts`・`mockRecords.ts`）と 確認待ち（`src/app/data/pendingReviews.ts`）・使用水（`src/app/features/water-inspection/mockData.ts`）の写し。
`.claude/mk-gen.py` が React の mockData を esbuild で JSON にしてから `MK` に変換する（scratchpad の `mocks/*.json` を読む。作り方はスクリプト先頭のコメント）。React 側が変わったら手で直さず作り直す。
アプリの 9 帳票は `AX_APP`／`AX_ROWS`（`src/app/features/<slug>/mockData.ts`）。
**React は画面ごとに別の mockData を持つ**（例：使用水は 帳票管理の点検場所＝給湯室・点検場所B、データ検索 6 件、確認管理 4 件、承認申請管理 4 件、アプリの点検場所A〜D）。プロトタイプも画面ごとに別々の見本を持ち（`S.wx`、`rxMock(slug, kind)`）、プロトタイプで提出した記録だけが `S.records`／`rxRows(slug)` に入って各画面の見本の前に並ぶ。
管理画面の月の初期値は React の見本に合わせて **2025 年 4 月**。プロトタイプで今日提出した記録を管理画面で見るときは月送りで今月へ。

アイコンは描き直さず、React 実装の実ファイルを `images/` に写して使います。単色の SVG は `mk()`（CSS mask で currentColor に塗る）、色つきの画像は `im()`（そのまま `<img>`）。React 側でアイコンが増えたら同じ場所にコピーして `nav()` `im()` から参照します。

### 2-1. プロトタイプと React 実装の関係

この案件には React 実装（`../NQrepo`、約 300 画面）が既にあります。プロトタイプ `nqrepo-demo.html` はそれとは別の単体 HTML で、
**見た目は React 実装の Tailwind クラスを CSS に写したもの**（`.f .ic .g4 .p6 .tb .txl` のように Tailwind と同じ寸法のユーティリティを持つ）。
React 側のデザインが変わったら、変わった画面の className を読んで同じ値に直す。ヘッダーの文言（Design Spec）や 工場選択→点検場所選択 の導線も React に揃えてある。
**使用水の点検 1 帳票だけを、アプリで提出 → 管理画面で確認 → 承認 → データ検索 まで 1 つの状態でつなげて**動かします。
他の 9 帳票は、最後から 2 つ目の `<script>` にある **LX（帳票管理）／RX（記録）の汎用の仕組み**で動きます。
帳票ごとの定義（登録するもの・項目・列・サンプル 4 件）を `LX` `RX` に書くと、工場選択 → 一覧 → 新規登録 → 登録完了 → 詳細 → 編集 → 削除完了、
点検予定（カレンダー）、確認項目の設定、下位の管理（秤管理・金属探知機管理…）と、データ検索・承認・確認の一覧・詳細が出ます。
アプリ側の他の 9 帳票（A1-2〜A1-10、60 画面）は、最後から 2 つ目の `<script>` の手前にある **AX（アプリ側の帳票ごとの定義＋汎用の画面）**で動きます（2026-09-25）。
`AX[slug]` に ルートの形（`routes`。React の app 側ルートと同じ）・記録入力の項目（`fields`）・管理画面の記録の行に変える関数（`toV`）を書くと、
一覧（帳票管理 LX の登録物が並ぶ）→ 記録入力 → 提出内容の確認 → 提出完了 と、記録の一覧・詳細・見直し・点検見送り・保管検体の破棄 が出ます。
提出した記録は RX の行として増えるので、管理画面の 確認管理 › その帳票 に「点検済み」で並びます（管理画面の月の初期値は 2025-04 なので、月送りで今月へ）。
**アプリの一覧に並ぶ対象・ステータス・記録は `AX_APP`／`AX_ROWS`（React の `src/app/features/<slug>/mockData.ts` を写したもの。id も React と同じ）から出します。** 帳票管理（LX）の登録物と管理画面の記録（RX）は admin 側の mockData で、アプリの見本とは別物なので混ぜないこと（2026-09-25）。
記録入力は一覧のステータスに合わせて開きます（`axSeed`。使用水の `openPoint` と同じ考え）。点検済み・確認完了・差し戻しの対象は React の mockData と同じ元の記録（`AX_SEED`。値・実施者・入力時刻・備考）が入った状態、未点検は空（実施日は今日）、見送りは備考に理由だけ。プロトタイプで提出した記録は RX の行に `form` として持たせ、次に開いたときそのまま戻します。薬品・添加物・金属は「記録を 1 件足す」画面なので常に空です（2026-09-25）。
画面名・項目・選択肢・ボタンの文言・見本データは React 実装の `src/app/features/<slug>/` の各ページと mockData.ts から写した（React の実体は `Documents/other/NQrepo（old）`。括弧は全角）。配置図・室内タブ・秤の追加ポップアップ・一括破棄など細かい仕掛けは省いてあり、押すと「省いています」の吹き出しが出る。React 側が変わったら同じページを読んで `fields` を直す。
画面設計側は `AL_LEDGERS`（画面の並び。React の app 側ルート順）と `AL_IDS`（hash の `:floorId` などを埋める見本の ID）。hash は `alLedgerScreens()` がルートから自動で作る。
アプリの 点検予定（カレンダーと 機械器具点検・官能検査記録 の設定画面）・ヘルプ・設定・ライセンス情報・テキストサイズ変更 はプロトタイプにあります。文言と見本データは React の `src/app/features` から写したもので、React 側が変わったら同じ場所を直します。
画面を足すときは `LX`／`RX`／`AX` の定義と、画面設計側の `LM_HASH`（帳票管理の hash の並び。steps と同じ順・同じ数）・`AL_LEDGERS` のルートを合わせます。

**2026-09-25 に、React 実装そのものを画面設計に映す形へ切り替えた。** やったことは次の 3 つ（プロトタイプ HTML は予備として残す）。

1. `nqrepo-screen-design.html` の `PROJECT.demo` を `{href:'react/', fallback:'nqrepo-demo.html'}` にした。起動時の `pickDemo()` が href を取れなければ fallback に切り替える
2. React の `src/frameBridge.tsx` が §3 の5つの約束を満たす（`?frame=1` で `html.frame`・Basic 認証を通す・`#hash` を `/hash` に読み替える／画面が変わるたび `{nvideo:'loc', hash}` を親へ／親の `{nvideo:'go', hash, flags}` で `navigate()`／flags を demoStore の「状態を試す」（off・unsent→offline、empty、err→error、session）と roleStore のロールに写す）。`App.tsx` は frame のとき動作デモのピルを出さない
3. `HASH2ID` はそのまま。ただし hash の中の id は React の mockData に実在する id にしておくこと（`LM_HASH`・`RX_ID`・`AL_IDS`・使用水の hash）。無い id だと React 側が空の画面になる

以下（LX／RX／AX の仕組み）は予備のプロトタイプ HTML の話。React を映しているあいだは使わない。

---

## 3. プロトタイプが守る約束（これが要）

画面設計はプロトタイプを iframe で開くだけの器です。**次の5つを実装していないと中央が真っ白になります。**
`nqrepo-demo.html` では最後の `<script>` にまとめてあります。

### 3-1. `?frame=1` で資料用の表示にする

```js
const QS = new URLSearchParams(location.search);
const FRAME = QS.has('frame');
if (FRAME) document.documentElement.classList.add('frame');
```

```css
html.frame .tab,html.frame .win{width:100%;height:100vh;border:0;border-radius:0;box-shadow:none}  /* 端末の枡を消す */
html.frame .nvsw{display:none}                                                                    /* 右下の切替を消す */
```

frame のときは保存もしない。資料を開くたびに前回の続きが出ると邪魔になる。

```js
function saveState(){
  if (FRAME) return;   /* 画面設計の中では保存しない。毎回きれいな初期状態で開く */
  ...
}
```

### 3-2. hash で画面が決まる

`#admin/approvals/water-inspection/r2` `#app/ledger-list/water-inspection/points/wp3/new` のような hash から画面を復元する `applyHash()` と、
いまの画面から hash を作る `locHash()` を持つ。画面を1つ足すたびに両方へ追記する。
**hash は React のルートと同じ形にする。** 後で React 実装に差し替えても `HASH2ID` を書き直さなくてよい。
（例：`admin/approvals/water-inspection/records/r2`、`admin/confirmations/water-inspection/factories/f1`、`admin/data-search/water-inspection/factories/f1/points/点検場所B`、`app/ledger-list/water-inspection/points/wp3/new/confirm`）

### 3-3. 現在地を親へ知らせる

```js
function syncHash(){
  const h = '#' + locHash();
  if (FRAME){                      /* 親の履歴を汚さず、現在地だけ知らせる */
    if (location.hash !== h){ try{ history.replaceState(null,'',h); }catch(e){} }
    try{ parent.postMessage({nvideo:'loc', hash:locHash()}, '*'); }catch(e){}
    return;
  }
  ...
}
```

`nvideo` というキー名はキット共通の合言葉。案件名に変えない（画面設計側の受け口と揃っている）。

### 3-4. 親からの指示で画面と状態を切り替える

```js
window.addEventListener('message', e => {
  const m = e.data;
  if (!m || m.nvideo!=='go' || typeof m.hash!=='string') return;
  try{ history.replaceState(null,'','#'+m.hash); }catch(err){}
  applyHash(); applyFlags(m.flags || {}); render();
});
```

### 3-5. 状態の印を受け取る

```js
/* off（オフライン）／ empty（データが無い）／ err（送信エラー）／ session（セッション終了）
   ／ role（管理画面のロール）／ unsent（未送信の帯を出す） */
function applyFlags(f){
  S.off = !!f.off; S.empty = !!f.empty; S.err = !!f.err; S.session = !!f.session;
  if (f.role && ROLES[f.role]) S.role = f.role;
  ...
}
```

印の名前は案件ごとに変えてよい。画面設計側の `PROJECT.screenStates` と揃えること。
この案件では React 側の「動作デモ › 状態を試す」（`src/components/demo/demoStore.ts`）の4つに合わせた。ロールは中央下の「状態」ではなく、右下のフローティング「権限」（`PROJECT.roles`）から切り替え、管理画面の画面にだけ `flags.role` を付けて送る。

---

## 4. 画面設計で書き換える場所

ファイル先頭の番号付きブロックだけ。**描画・検索・フロー図の配置計算・拡大縮小・印刷は触らない。**

| 番号 | 名前 | 中身（この案件での値） |
|---|---|---|
| ① | `PROJECT` | 資料名・関連資料・端末の枡（管理画面 1280×760／アプリ タブレット 768×1024）・切り替えられる状態・見出しアイコン |
| ② | `SCREENS` | 画面の定義。管理画面 M0〜M15（親はサイドメニューの順に番号を振る。枝の画面は `M3-1` のように 親番号-連番。データ検索・承認・確認・帳票管理は 帳票 › 画面 の 3 段で、使用水の点検以外の帳票は `DS_LEDGERS`／`LM_LEDGERS` から生成する）、アプリ A0〜A7（左レールの順。A5 はレールの「サイズ」＝テキストサイズ変更。A1 帳票の下に帳票ごとの枝 A1-1〜A1-10。使用水以外は `AL_LEDGERS` から生成し、番号は帳票管理 M5-n と同じ帳票）、共通 S1。`src` に React のファイル、`pin:true` でフローの縦位置を並び順に固定 |
| ③ | `FLOW` `FLOW_IN` | 画面の遷移。端末をまたぐ「記録の受け渡し」も線にしてある。書くのは**使用水の点検（帳票の番号 1）ぶんだけ**で、他の 9 帳票は凡例の「帳票」で切り替えると `ledgerFlow()` が組み立てる |
| ④ | `ROLES` `ACCESS` | 実施者／確認者／承認者／管理者 と、画面ごとの可否 |
| ⑤ | `STATES` | 記録の一生（未点検→点検済み→承認待ち→承認済み／差し戻し／未送信）。2026-09-25 にフローの「画面の遷移／動画の状態」の切替を外したので、いまはどこにも描いていない（定義だけ残す） |
| ⑥ | `CASES` | 主なユースケース 6 本。`path` は使用水の画面IDで書く。帳票を切り替えると同じ 6 本がその帳票の画面へ読み替えられ（`LEDGER_ROLE`／`roleId()`）、`gname`／`gnote`（`{L}` は帳票名）で言い換える。フローのプルダウンには 6 本 × 10 帳票が帳票ごとにまとまって出て、名前・説明・帳票名で検索できる |
| ⑦ | `PERSONAS` `SCALE` `TERMS` | 利用者・規模（16 社・21 工場・10 帳票）・用語 |
| ⑧ | `FIELDS` | 項目定義。使用水の点検の入力項目と、ログイン・職員・点検場所 |
| ⑨ | `BUILT` | プロトタイプで動く範囲。使用水以外の 9 帳票は `LM_KIND`（画面名から判定）で生成 |
| ⑩ | `ACCESS_POLICY` `CRUD` `AUDIT` `APPROVAL` | 権限の方針・操作ログ・承認経路（2 段） |
| ⑪ | `LOG` `LOG_DOC` | 更新履歴 |
| ⑫ | `AS_IS` `NEW_ONLY` | 現行との対応。この案件は React 実装が現行なので空 |
| ⑬ | `RELEASES` `RELEASE_CURRENT` | リリース（開発 Ver ごとの状態・期間・ねらい・追加した帳票）。ヘッダーの「リリース」で出す。元は React の devVersions.ts。ガイドの開発Ver管理は 2026-09-24 にここへ移した |

`PROJECT.demo` と `PROJECT.asIs` は `null` にできる。プロトタイプや現行調査が無い案件でも、案内が出るだけで他は動く。

この案件で実行部に手を入れたのは 4 か所。フローの凡例から図の種類の切替（画面の遷移／動画の状態）を外したこと、`frameHTML()` に `device:'tablet'`（ノッチ無しの枡）を足したこと、`flowLayout()` で `pin` のノードは重心に寄せず並び順のまま置くようにしたこと、そして**フローを帳票ごとに切り替えられるようにしたこと**（2026-09-25）。

**フローの帳票切替（`FLOW_LEDGERS` 〜 `bindCaseBox()`）。** 帳票の枝は `M2-n`・`M3-n`・`M4-n`・`M5-n`・`A1-n`（`n` は帳票の番号。1 が使用水の点検）で、図に出すのは選んだ 1 帳票ぶんだけ。骨組み（M0〜M15・A0〜A7）は共通。
使用水（`n=1`）のつながりは `FLOW` に手で書いたものをそのまま使い、他の 9 帳票は画面の数も並びも違うので `branchParent()` が画面名から親を決めて組み立てる（一覧・管理・点検予定 は枝の根から、新規登録・詳細はその一覧から、編集は詳細から、提出完了は提出内容の確認から、完了は元の一覧へ戻る）。
**帳票をまたぐ線とユースケースの経路は「役どころ」で読み替える。** `A1-1-1`＝一覧・`A1-1-2`＝記録入力・`A1-1-3`＝提出内容の確認・`A1-1-4`＝提出完了 が `LEDGER_ROLE` で、`roleId()` が同じ役どころの画面を画面名から探す（帳票によっては間に画面が挟まるので、経路は `caseList()` が途中の画面も補う）。
**帳票に画面を足したら、`LM_LEDGERS`／`AL_LEDGERS` に画面名を足すだけでフローにも出る。** 画面名が上の決まりに当てはまらないときだけ `branchParent()` を直す。
**サイドメニューに並ぶ画面は、SCREENS をメニューの順に並べて `pin:true` を付ける。** そうしないとフロー図の縦の並びが「つながりの重心」で決まり、メニューと違う順に見える。

---

## 5. 新しい案件での手順

1. **先にプロトタイプを作る。** 画面を3つでも作り、§3 の5つを実装して `?frame=1#…` で開けることを確かめる
2. `nqrepo-screen-design.html` をコピーし、`PROJECT` を書き換える（`key` は必ず変える。保存が混ざる）
3. `SCREENS` を並べる。`hash` はプロトタイプの hash と1対1で対応させる
4. `HASH2ID` は画面定義の `hash` から自動で作られる（`HASH2ID_AUTO`。`factories/f1` のような ID の段はどの ID でも合う）。手で足すのは自動で拾えない特例だけ
5. 残りのブロックを埋める。全部揃わなくても動く
6. 色を変えるなら `:root` の8つだけ。`--g` は面に、`--g-d` は文字に使う

**逆順にしないこと。** 画面設計から作ると、器だけできて中身が映りません。

---

## 6. つまずきどころ（実際に踏んだもの）

- **`[hidden]` は `display:` を書いた要素に効かない。** パネルが閉じなくなる。`.x[hidden]{display:none}` を明示する
- **入場アニメーションに `opacity` を使わない。** `animation-fill-mode:both` で止まると消えたまま出てこない。`transform` だけにする
- **単一ファイルではクラス名が衝突する。** `.open` `.rd` `.ch` のような短い名前は必ずぶつかる
- **グリッドの列は明示する。** `display:none` にした列があると、後ろの項目が1列ずれて中央が潰れる
- **`transform: scale()` は場所取りを変えない。** 縮めた分を負の余白で詰めないと横スクロールが出る
- **色・太さは React 実装（src/index.css の `--semantic-*`）をそのまま使う。** 2026-09-24 に「React と全く同じ画面にする」と決めたので、
  文字の緑は `#009944`、薄い文字は `#808080`、本文は body で bold（React の body と同じ）。以前のコントラスト調整（`#6B6B6B` `#00853C`）は戻した。
  見た目を直すときは React の className（Tailwind）を読んで、同じ寸法をプロトタイプの CSS に写す
- **プロトタイプのサンプルデータを変えたら `SEED_V` を上げる。** 古い保存が残って新しい画面に古いデータが出る
- **`let S` は iframe の外から `contentWindow.S` では見えない。** 親からデバッグするときは `contentWindow.eval('S.off')`
- **hash に画面IDが無いとき、詳細画面は「その状態の最初の1件」を自動で選ぶ。** 空のまま出すと画面設計で真っ白に見える

---

## 7. 控え（snapshots/）と変更の前後

NVIDEO の画面設計と同じ仕組み。画面設計の更新履歴で「前後を見る」の付いた行を押すと、中央に **左＝変更後（後の控えが無ければ いま）・右＝変更前** の画面が横に並ぶ（常に横並び。縦には積まない）。左を操作すると右も同じ画面へ付いてくる。

- 控えはプロトタイプ `nqrepo-demo.html` を **1 文字も変えずに** `snapshots/YYYY-MM-DD[-HHMM].html` へコピーしたもの。同じ約束（`?frame=1`・`go`・`loc`）で動くので、画面設計は iframe を 2 枚置くだけ
- プロトタイプを直す日の最初の変更の前に、フック（`.claude/settings.json`）が `snapshots/YYYY-MM-DD.html` を自動で取る。1 日 1 つ。前の控えと中身が同じなら取らない
- ユーザーが「いまを『○○』として控えて」と言ったら `python3 .claude/snapshot.py take nqrepo-demo.html "○○"`。名前付きは消えない
- 名前の無い控えは 30 日で消える。消すのは snapshot.py だけ。手で消さない・直さない。一覧は `snapshots/index.js`（`name` だけ手で直してよい）
- **同じ日に控えを取ったあとで直したら、`LOG` の行に時刻を足す**（`['2026-09-24','…','16:15']`）。足さないと前の日の控えと比べてしまう
- 人がエディタで直したときはフックが走らない。その前に `python3 .claude/snapshot.py daily nqrepo-demo.html`
- 控えは `snapshots/` に置かれるので、プロトタイプの `IMG` は置き場が 1 段深いとき `../images/` を見る。`serve.cjs` も `snapshots/images/…` が無ければ 1 つ上を返す
- 最初の控え `2026-09-24-1600.html` は、この仕組みを入れた日の編集（ガイド › 変更履歴 の中身）を戻して起こしたもの。それより前の行は並べられない

## 8. 書くときの言葉づかい

- 画面名・項目名は**実際の画面に出る言葉**を使う（帳票名は `src/data/ledgers.ts` の `adminLabel` / `appLabel`）。社内用語は `TERMS` に定義を置く
- 決まっていないことは「未定」「要確認」と書く。埋めた風にしない
- `decide` は問いだけでなく、決まったら3つ目に答えを書く。**開発中の「なぜこうなったか」はここが答えになる**
  （例：A3 の「異常時の対応の選択肢」は 2026-08-07 の開発定例で「修理（外部委託）」に決まった、と書いてある）
