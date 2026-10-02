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
**画面設計の枠と「プロトタイプで開く」に映るのは React 実装そのもの。** React のソースは **このリポジトリの `react-src/`**（2026-09-28 に `Documents/other/NQrepo（old）` から移した。ビルド後のファイルはコミットしない）。
`react-src/dist-kit` を同じサーバーが `/react/` の下で配る（置き場は `REACT_DIST` で変えられる）。
画面を直すときは `react-src/src` を直し、`cd react-src && npm run build:kit`（`vite build --base=/react/ --outDir=dist-kit`）で dist-kit を作り直す（画面設計はリロードするだけ）。初めての環境では先に `cd react-src && npm ci`。
dist-kit が無い／サーバーを使わずダブルクリックで開いたときは、従来どおり単体 HTML のプロトタイプ `nqrepo-demo.html` が映る（起動時に `react/` が返るかを見て切り替える。`PROJECT.demo.fallback`）。
別ポートで配らず同じオリジンにしているのは、別ポートだと Chrome が別プロセスの iframe として扱い、配置図のある画面（ガラス・プラスチック管理）が白いままになったため。

**React を /react/ の下で配るときの注意（2026-09-25）。** React 側で `/…` の絶対パスを書くと、`/react/` の下では見つからない。
`import.meta.env.BASE_URL` を頭に付けること（`src/data/ledgers.ts` の帳票アイコン、`src/admin/features/guide/screenShots.tsx` の撮影済みスクリーンショットを直した）。
`react-src/.claude/.shots` は dist に入らないので、`serve.cjs` が `/react/.claude/…` を `react-src/` から直に配る。

**確認画面の中身（2026-09-25）。** アプリの確認画面は前の画面から `location.state` で入力内容を受け取るので、hash だけで開くと「点検内容が見つかりません」になる。
`frameBridge.tsx` が枠の中（とプロトタイプで開いたタブ）で state の無い画面を開いたとき、React の画面遷移図と同じ見本（`src/admin/features/guide/screenPreviewState.ts` の `PREVIEW_STATE`、キーは画面のファイル）を差し込む。空の確認画面が出たらそこへ 1 件足す。

**Vercel（nq-repo.vercel.app）での公開（2026-09-28 から）。** このリポジトリの `main` を Vercel がビルドして配る（`vercel.json`：`react-src` で `npm ci` → `.claude/build-vercel.sh` が React をビルドし、画面設計・プロトタイプ・`images/`・`snapshots/` と一緒に `.vercel-out/` へまとめる。`/` → プロトタイプの管理画面のログイン（`/react/admin/login?kit=1`。2026-10-02 に画面設計から変えた。画面設計は `/nqrepo-screen-design.html`）、`/react/*` は SPA として `react/index.html`、`snapshots/images/*` → `images/*`）。
React を直したらソースをコミット・プッシュするだけでよい（ビルド後のファイルはコミットしない）。手元で同じものを作るなら `sh .claude/build-vercel.sh`。
画面説明の撮影済みスクリーンショット（`.claude/.shots`、69MB）は Vercel に載せていないので、そこだけ画像が出ない。

**画面が正しく出るかの一括点検。** 画面設計の全画面（304 枚）を順にめくって、白い画面・壊れた画像・JS エラー・行き先違いを調べる仕掛けを使った。
`/react/` は画面設計と同じオリジンなので、iframe の中（`contentDocument`）をそのまま読める。hash が React のルートに無いと `*` で `/admin/login` に飛ぶので、「行き先が hash と違う」で見つけられる。
画面や hash を足したあとは同じやり方で一度めくると早い（作業用の HTML は使い終わったら消す）。

**「プロトタイプで開く」は枠の中身を引き継ぐ（2026-09-25）。** `openProto()` が 枠の中のいまの画面（`liveLoc`）＋ `?kit=1&<状態>&role=…` で `window.open` する（noopener なし＝sessionStorage が新しいタブへ写る）。
受け手は React の `installFrameBridge()` と `nqrepo-demo.html` の `QS.has('kit')`。どちらも印を写したあと URL を hash だけに戻す。
開いた先の右下は画面設計の右下と同じ中身（上から 管理画面／アプリのタブ・資料・権限・状態・フィードバック。ボタンの横にいまの状態。「状態」の横の ? で各状態の説明の吹き出し）。React は `src/components/demo/KitSwitch.tsx`（sessionStorage の `nq_kit_info` があれば動作デモのピルの代わりに出る。CSS と吹き出しの文 `STATE_HELP` は画面設計の写しなので、画面設計側を直したら写し直す）、プロトタイプ HTML は `kitSync()`（資料・権限だけの古い形のまま）。
開いた先のアプリ（`/app`）は、画面設計のアプリの枠（`.phone.tablet`）と同じ iPad の縁（11px の黒・角丸 26px）を付けて出す（`AppViewport.tsx` の `BEZELED`＝`!FRAME && isKit()`、CSS は `index.css` の `.app-viewport-frame--bezel`。枠の中と動作デモには付けない）。
「資料 › 画面設計」は `nqrepo-screen-design.html?role=…&state=…#admin/…` で戻り、画面設計の `takeReturn()` が画面IDに読み替えて、枠にはその画面そのもの（`bootLoc`）を映す。予備のプロトタイプ HTML は frame で保存しないので、押す直前に親が `S` を sessionStorage へ保存させている。

**右下の「フィードバック」（2026-09-28）。** 画面設計の右下のボタンは、枠の中の React へ `{nvideo:'feedback'}` を送る。`?frame=1` の `FeedbackWidget` は自分のパネルを出さず、中身を `{nvideo:'fb-state'}` で親へ返し、画面設計が**右パネル**（`inspView='feedback'`、`fbHTML()`／`fbPaint()`）に入力欄と一覧を描く。保存・場所選び・画面上のピンは React のまま、画面設計からは `{nvideo:'fb', op:'submit'|'pick'|…}` で頼む（保存先は同じオリジンの localStorage `nq_feedback_v1`）。入力欄や項目を React 側で変えたら右パネルも直す。「プロトタイプで開く」の先は `KitSwitch.tsx` の同じボタンから開く。予備のプロトタイプ HTML には受け口が無いので、そのときはボタンを隠す。

**右パネルの「この画面でできること」（2026-09-30）。** React の画面説明（`react-src/src/components/screen-description/screenDescriptions.ts`、キーは画面のファイル）を画面設計の `SCREEN_DESC` に写して出す（`SCREENS` の `src` で引く。`src` は実在するファイルにしておくこと）。React 側の説明を直したら手で写さず `node .claude/sd-gen.cjs`。2026-10-01 に「この画面でできること」の見出しは全画面で外し、中身（`points` と `note`）は画面概要の箇条書きに入れる。画面概要は ひとこと・本文・できること・note（文ごとに分ける）を 1 つの箇条書きで出し、ほかの項目の頭と同じだけの項目は落とす。「画面のつながり」「この画面を通るユースケース」は `ledgerFlow()`／`CASE_LIST` から自動で出るので書き足す場所は無い。
「項目定義」「操作と結果」は ⑧-3 `SPEC`（画面IDごとの `fields`／`ops`。2026-09-30 に React のコードを読んで全画面ぶん起こした）。手で書いた ⑧ `FIELDS` がある画面はそちらが優先。UI遷移仕様は画面の部分（画面上部・タブ・検索・絞り込み・対象の月・一覧（表）・入力欄・表示する内容・ダイアログ。`FPART`）ごとのカードで出す（2026-10-01）。部分は `fpartOf()` が形式と説明の文から決める。外れる項目は行の 6 つ目に部分の名前を書く。React の画面を直したら、同じ画面の `SPEC` の行も直す。
**UI遷移仕様の番号と赤枠（2026-09-30、2026-10-01 に 項目定義 と UI遷移仕様 を 1 つの節にまとめ、名前を「UI遷移仕様」にして画面概要のすぐ下へ移した）。** 右パネルの「UI遷移仕様」は、`FIELDS`／`SPEC` の `fields` と `SPEC` の `ops` を画面の部分（`FPART`）ごとのカードに並べ、通し番号を振る（並びは `fItemsOf()`。一覧（表）だけは 操作 → 項目）。枠の中は同じオリジンなので、画面設計が `contentDocument` を直に読んで場所を探す。操作は文（「」の中の語・〜カード・戻る（←）・月送り …）から押せるものを（`opFind()`）、項目は名前と同じ文字の 表の見出し・ラベル・プルダウン・placeholder を（`fieldFind()`。「・」「／」で分けた語でも探す）。行（`#fsec li[data-op]`。中の遷移先ボタンは除く）を押すと枠の中の文書に `#kit-opmark`（赤枠・中は 10% の塗り・番号）を重ねる（`opPaint()`）。番号は枠の中に置くと画面の文字と重なるので、2026-10-02 から画面設計の側（端末の横の余白の広い側）に出し、赤枠の端と線でつなぐ（`opLeadPaint()`、`.stage` の中の `#kit-oplead`。「すべて」のときは重ならないよう縦にずらす）。React 側には手を入れていない。見つからないものは番号が点線になる。「ダイアログの「…」」は、枠の中でダイアログが開いていればその中のボタンに赤枠を出す（`opDialog()`）。見出しの右の「すべて」（`opAll`）で場所の分かるものを全部いっしょに出す。部分（`FPART`）の見出しを押すと、その部分の項目をまとめて 1 つの大きな赤枠（左上に部分の名前の札）で囲む（`opSec`。2026-10-02）。枠は見つかった部品と、それらを入れている色・枠・影のある箱（`opSecBox()`）を合わせた範囲。場所がずれる・見つからない操作は、`ops` の操作の文を実際のボタンの文字どおり「」で書くのがいちばん早い。
帳票一覧のタイル（A1-1〜A1-10。`isTile()`）は、React ではタイルの hash が「次へ」の先の一覧なので、枠には帳票一覧（`app/ledger-list`）を映し、`tileOpen()` がそのタイルを押して実施者のポップアップを開いておく（2026-10-01）。タイルそのもの（帳票カード・「〇〇」のカード）以外の項目・操作はポップアップの中で探し、「次へ」で進むと右パネルは A1-n-1 へ移る。
**右パネルの小見出しのタブ（2026-09-30〜2026-10-01）。** タイトルの下のタブは 2026-10-01 にやめた（`STAB`・`stabBind()` は消した）。
**フローのユースケースの再生（2026-10-02、NVIDEO の「▶ 再生」を移した）。** 札の「▶ 再生」で経路の手順を順に進め、フロー図はその手順へ寄り、右の枠ではカーソル・赤い囲み・字幕で部品を押して見せる。操作の段（一時停止・次の操作・終了・進み具合）と「操作手順」のアコーディオンも NVIDEO と同じ。速さは札の「▶ 再生」の左で 1.5× ／ 1× ／ 0.5× から選ぶ（2026-10-02 に操作の段の切替ボタンから移した。`PRATES`・`setRate()`。選んだ速さは再生中でも効き、次に開いたときも覚えている）。キーは Space／→／Esc／Shift + . ,。「操作手順」の行（または手順の見出し）を押すと、その手順のその操作から再生する（`playCase(key, {k, j})`。前の手順は飛ばしてその画面を開き、同じ手順の前の操作は待たずに済ませる。2026-10-02）。
NVIDEO は台本（`CASES` の `play`）をプロトタイプの中の `pbRun` で動かすが、NQリポは**台本を書かず**、画面設計が枠の中の文書を直に操作する（`playCase()`〜`pRun()`。React 側には手を入れていない）。手順ごとの操作は `playActs()` が ⑧-3 `SPEC` の `ops` から、行き先（4 つ目）が次の手順の画面のものを選び、赤枠と同じ `opFind()` で探して押す。ポップアップが出たら先頭のカードと「次へ」などを押す（`pDialog()`）。操作が無い・押しても移らないときは次の画面へ切り替える。押す部品がずれるときは `ops` の文を実際のボタンの文字どおり「」で書き、行き先に画面IDを書く。
ポップアップの中のボタン（「点検を見送る」など）は、`ops` ですぐ前の行が行き先「ポップアップ」の操作（「点検見送り」）なら、見えないときに先にそれを押して開き、`pFill()` で はい／いいえ（ユースケース名に「いいえの場合」があればいいえ）と空の備考を埋めてから押す（2026-10-02）。開く行は必ずすぐ前に置くこと。どのタブのどの行を開くかは `CASES` の `pick:{tab, row}`（タブの文字・行に含む文字）で決める。最後の画面で押さずに見せたいもの（タブを切り替えて、行を赤枠で囲み字幕で説明する）は `CASES` の `end:[{tab}|{box, cap}]`（`caseActs()` が最後の手順の操作と置き換え、`pRun` の `look` が `pRow()`／`pLook()` で囲む）。例は機械器具点検・清掃記録の「明日に見送る：はいの場合」。押すボタンがまだ押せない点検画面（機械器具点検の「確認画面へ」は始業・終業が埋まるまで押せない）は、`pForm()` が「全て異常なし」を押し、始業 → 終業のタブも埋めてから押す（2026-10-02）。`CASES` に `ng:{cause, action}` があると、始業の「全て異常なし」のあとに最初の項目の ×（異常あり）を押し、ポップアップで原因・対応を選んで「完了」し、その項目を囲む（`pNg()`。例は機械器具点検の「【異常あり】点検で異常があった場合」）。囲む行（`pRow()`）は、押せる部品の中にさらに押せる文字があるときは外側のカードごと囲む。手順を 2 つ以上にまたぐときは配列の配列にすると後ろの手順から当てる（「いいえの場合」は ラインの一覧で 4/1 の見送りを囲み → 翌日分のラインの一覧（A1-n-2）で「点検予定が登録されていません」を囲む）。`exact:true` を付けると、経路の間の画面を補わない。`end` の段に `press:'文字'`（配列なら順に）を書くと、その文字どおりのボタンを押す（ポップアップが開いていればその中から。プルダウン → 選択肢 → 「承認」のように続けて押せる。2026-10-02）。例は機械器具点検の「【詳細で承認】」「【一括承認】」（React の承認申請管理の機械器具点検は見本を全件 承認待ちにし、データ一覧の「承認する」で一覧の記録もまとめて承認済みにする）。`CASES` に `state:'off'` のように `PROJECT.screenStates` のキーを書くと、再生のあいだ枠をその状態で開く（右下の「状態」も切り替わる。次に state の無いユースケースを再生すると通常に戻す。例は「電波の無い場所で点検する」：オフラインで提出 → 進捗一覧の「未送信のデータがあります」の帯を囲む。2026-10-02）。翌日分のラインの一覧（A1-7-2・A1-8-2、React の `next-day`）は 2026-10-02 から 04/02 だけを出し、毎週は ラインの一覧で「明日に見送る：はい」で見送ったラインだけが「未点検」で並ぶ（`LineSelectionPage.tsx` の `nextDayLines()`。見送りの選択は `SkipConfirmPage` が `deferToTomorrow` で記録に残す）。ラインの一覧は 04/01 だけ。はい・いいえ の両方とも、再生は ラインの一覧 → 翌日分のラインの一覧 で見せる。
**再生で入力して見せる（2026-10-02）。** 新規登録・点検記録などで「登録」「確認画面へ」「保存」「提出」「追加」「完了」（`P_SUBMIT`）を押す前に、`pFormFill()` が空の欄を上から順に人が書くように埋める（カーソルを欄へ動かして押し、1 文字ずつばらつきのある間で打つ）。埋めるのは画面名が `P_FORM`（記録入力・新規登録・〜の編集・〜の点検）の画面だけ（設定や一覧の切替は押さない）。操作の書いていない手順（jump）でも入力の画面なら埋めてから「保存」などを押す。先に「全て異常なし」「全て清掃済み」「誤差なし」（`P_QUICK`）を押し、残りを `pFields()` が集める：空の入力欄（値は placeholder の見本、無ければ見出しから `pValueFor()`。自動計算は除く）・ネイティブの select と「選択してください」のボタン（押して出た最初の選択肢）・どれも選ばれていない選ぶボタンの並び（×／✓・記録しない／記録する・1〜5 点。`P_PREF` の良いほう、点数は 4 か 5、無ければ右端）・灰色の ✓ だけのボタン（秤点検の 水平点検・汚れ）。※任意・日付・チェックボックス・必須でない備考・拡大縮小のボタンは触らない。欄が多い画面（ガラス・プラスチックの配置図）は 6 つ目から手早く進める（`P.quick`）。編集の `end:[{type:true}]` も同じ `pKeys()` で打つ。
アプリの記録入力は見本だと「点検済み」で埋まって開くので、`帳票一覧`／`進捗一覧`／`エラーの場合` のユースケースの再生中は flags に `fresh:1` を付け（`stateFlags()`。外すなら `CASES` に `fresh:false`）、React の `frameBridge.tsx` の `kitFresh` → `progressRecordFill.ts` の `useProgressRecordFill()` が `"none"`（未点検）を返して空で開く（進捗一覧から来たときの progressStatus のほうが先）。あわせて、枠を開いたときの URL の印（`?frame=1&off=1…`）を `installFrameBridge()` が hash の読み替えで search を消したあとに読んでいて効いていなかったのを、先に読んだ値で当てるよう直した。埋まらない欄・押し間違う欄が出たら `pFields()` の決まりを直す。
帳票管理の使用水以外の画面に sub・note・決めることを書き足すときは `LM_OVER`（帳票の slug → 何番目の画面か。使用水は `LM_WATER_OVER`）。
「画面概要」の本文は ⑧-4 `OVERVIEW`（2026-09-30 に Confluence「NQリポ」スペースの `[cms]`／`[app]` 画面仕様書から起こした。`lead` が一行説明の代わりに出て、`body` の箇条書き（2026-10-01 に 1 項目 1 事実・2〜5 項目へ要約した。長い段落で書き足さない）。2026-10-01 に、`body` と「この画面でできること」（`SCREEN_DESC`）が両方ある 197 画面は 1 つの箇条書きにまとめ直して `merged:true` を付けた（できることは出さない。補足は出す。データ検索のデータ一覧は `solo:true` で補足も出さない）。この画面では React の画面説明を直しても右パネルには出ないので、`body` も手で直す、手書きの `note`（「補足」に畳む）の順。元のページ `pages` は取り直し用に持つだけで、2026-09-30 から画面には出さない）。仕様書と React が違うところは React に合わせて書いてある。Confluence の一覧 API は本文が大きいと「Body omitted」になるので、取り直すときはページごとに markdown で取る。

- 画面設計 … `nqrepo-screen-design.html`（#M3 のように画面IDで直接開ける。`#flow` `#ref` `#release` で フロー・前提・リリース）
- 画面の実体 … `react-src/` をビルドした dist-kit（`http://127.0.0.1:8791/react/?frame=1#admin/approvals` のように単体でも開ける）。ブリッジは React 側の `src/frameBridge.tsx`（`main.tsx` と `App.tsx` から呼ぶ）
- プロトタイプ（予備） … `nqrepo-demo.html`（右下の切替で 管理画面／アプリ、ロール、状態を変える。`1` `2` キーで端末切替）
- デザインガイド … `../NQrepoDesignSystem/nqrepo-design-guide.html`（別フォルダ）
- React 実装 … `react-src/`（`cd react-src && npm run dev` で `http://localhost:5173`。`.claude/launch.json` の `react-dev`。React 側の決まりは `react-src/CLAUDE.md`）

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
| `images/` | 実アイコン。`react-src/src/assets/figma` の nav・rail・ledger・common とロゴを写したもの | 低い |
| `.claude/serve.cjs` `.claude/launch.json` | ローカル確認用の静的サーバー | 低い |
| `.claude/snapshot.py` `.claude/settings.json` | プロトタイプの控えを取る道具と、Claude Code のフック | 低い |
| `snapshots/` | プロトタイプの控え。画面設計の更新履歴から変更の前後を並べる。**手で直さない** | 自動 |
| `react-src/src/index.css` | 色の元（`--semantic-*`）。プロトタイプの `:root` はこれの写し | 低い |
| `../NQrepoDesignSystem/` | デザインガイド。禁止パターンと部品の使い方 | 低い |

**画面の見た目を画面設計側に実装しないこと。** 2つ作ると必ずズレます。

### 2-0. 見本データは React 実装の mockData そのもの（2026-09-25）

プロトタイプに出るデータは **React 実装（`react-src/`）の mockData を写したもの**で、勝手に作らない。
`nqrepo-demo.html` の `const MK = {…}` が管理画面（`src/admin/data`・`src/admin/features/<機能>/mockData.ts`・`mockRecords.ts`）と 確認待ち（`src/app/data/pendingReviews.ts`）・使用水（`src/app/features/water-inspection/mockData.ts`）の写し。
`.claude/mk-gen.py` が React の mockData を esbuild で JSON にしてから `MK` に変換する（scratchpad の `mocks/*.json` を読む。作り方はスクリプト先頭のコメント）。React 側が変わったら手で直さず作り直す。
アプリの 9 帳票は `AX_APP`／`AX_ROWS`（`src/app/features/<slug>/mockData.ts`）。
**React は画面ごとに別の mockData を持つ**（例：使用水は 帳票管理の点検場所＝給湯室・点検場所B、データ検索 6 件、確認管理 4 件、承認申請管理 4 件、アプリの点検場所A〜D）。プロトタイプも画面ごとに別々の見本を持ち（`S.wx`、`rxMock(slug, kind)`）、プロトタイプで提出した記録だけが `S.records`／`rxRows(slug)` に入って各画面の見本の前に並ぶ。
管理画面の月の初期値は React の見本に合わせて **2025 年 4 月**。プロトタイプで今日提出した記録を管理画面で見るときは月送りで今月へ。

アイコンは描き直さず、React 実装の実ファイルを `images/` に写して使います。単色の SVG は `mk()`（CSS mask で currentColor に塗る）、色つきの画像は `im()`（そのまま `<img>`）。React 側でアイコンが増えたら同じ場所にコピーして `nav()` `im()` から参照します。

### 2-1. プロトタイプと React 実装の関係

この案件には React 実装（`react-src/`、約 300 画面）が既にあります。プロトタイプ `nqrepo-demo.html` はそれとは別の単体 HTML で、
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
画面名・項目・選択肢・ボタンの文言・見本データは React 実装の `src/app/features/<slug>/` の各ページと mockData.ts から写した（React の実体は `react-src/`）。配置図・室内タブ・秤の追加ポップアップ・一括破棄など細かい仕掛けは省いてあり、押すと「省いています」の吹き出しが出る。React 側が変わったら同じページを読んで `fields` を直す。
画面設計側は `AL_LEDGERS`（画面の並び。React の app 側ルート順）と `AL_IDS`（hash の `:floorId` などを埋める見本の ID）。hash は `alLedgerScreens()` がルートから自動で作る。
アプリの 点検予定（カレンダーと 機械器具点検・官能検査記録 の設定画面）・ヘルプ・設定・ライセンス情報・テキストサイズ変更 はプロトタイプにあります。文言と見本データは React の `src/app/features` から写したもので、React 側が変わったら同じ場所を直します。
画面を足すときは `LX`／`RX`／`AX` の定義と、画面設計側の `LM_HASH`（帳票管理の hash の並び。steps と同じ順・同じ数）・`AL_LEDGERS` のルートを合わせます。

**2026-09-25 に、React 実装そのものを画面設計に映す形へ切り替えた。** やったことは次の 3 つ（プロトタイプ HTML は予備として残す）。

1. `nqrepo-screen-design.html` の `PROJECT.demo` を `{href:'react/', fallback:'nqrepo-demo.html'}` にした。起動時の `pickDemo()` が href を取れなければ fallback に切り替える
2. React の `src/frameBridge.tsx` が §3 の5つの約束を満たす（`?frame=1` で `html.frame`・Basic 認証を通す・`#hash` を `/hash` に読み替える／画面が変わるたび `{nvideo:'loc', hash}` を親へ／親の `{nvideo:'go', hash, flags}` で `navigate()`／flags を demoStore の「状態を試す」（off→offline、empty、err→error、session）と roleStore のロールに写す。unsent（未送信の記録がある）は状態を試すに無いので `frameBridge` の `kitUnsent` で持ち、`AppLayout` がどの画面でも未送信の帯を出す。状態が届くたびに帯を出し直す（`KIT_FLAGS_EVENT`）。枠の中でオフラインのときはログイン画面の「オフライン状態です」の帯を最初から出す）。`App.tsx` は frame のとき動作デモのピルを出さない
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
| ② | `SCREENS` | 画面の定義。管理画面 M0〜M14（親はサイドメニューの順に番号を振る。枝の画面は `M3-1` のように 親番号-連番。データ検索・承認・確認・帳票管理は 帳票 › 画面 の 3 段で、使用水の点検以外の帳票は `DS_LEDGERS`／`LM_LEDGERS` から生成する）、アプリ A0〜A7（左レールの順。A5 はレールの「サイズ」＝テキストサイズ変更。A1 帳票の下に帳票ごとの枝 A1-1〜A1-10。使用水以外は `AL_LEDGERS` から生成し、番号は帳票管理 M5-n と同じ帳票）。`src` に React のファイル、`pin:true` でフローの縦位置を並び順に固定 |
| ③ | `FLOW` `FLOW_IN` | 画面の遷移。端末をまたぐ「記録の受け渡し」も線にしてある。書くのは**使用水の点検（帳票の番号 1）ぶんだけ**で、他の 9 帳票は凡例の「帳票」で切り替えると `ledgerFlow()` が組み立てる |
| ④ | `ROLES` `ACCESS` | 実施者／確認者／承認者／管理者 と、画面ごとの可否 |
| ⑤ | `STATES` | 記録の一生（未点検→点検済み→承認待ち→承認済み／差し戻し／未送信）。2026-09-25 にフローの「画面の遷移／動画の状態」の切替を外したので、いまはどこにも描いていない（定義だけ残す） |
| ⑥ | `CASES` | 主なユースケース。`CASE_GROUPS` の見出し（【Admin】帳票管理・【App】帳票一覧・【App】確認待ち・【Admin】承認申請管理・【App】確認待ち（差し戻し）・【App】進捗一覧・【Admin】データ検索・エラーの場合）ごとに、どの帳票でも最低 1 本出るようにしてある（2026-10-01。`need` はその役どころの画面が無い帳票では出さない、`alt` は画面の並びが違う帳票だけの経路、`except` はその帳票では出さない。機械器具点検は「承認して検索に残す」を外し【詳細で承認】【一括承認】の 2 本にした）。`path` は使用水の画面IDで書く。帳票を切り替えると同じ 6 本がその帳票の画面へ読み替えられ（`LEDGER_ROLE`／`roleId()`）、`gname`／`gnote`（`{L}` は帳票名）で言い換える。フローのプルダウンは いま選んでいる帳票のユースケースを `grp`（見出し。並びは `CASE_GROUPS`）ごとに出し、字を打つと全帳票から名前・説明・帳票名で検索できる（2026-10-01） |
| ⑦ | `PERSONAS` `SCALE` `TERMS` | 利用者・規模（16 社・21 工場・10 帳票）・用語 |
| ⑧ | `FIELDS` | 項目定義。使用水の点検の入力項目と、ログイン・職員・点検場所 |
| ⑨ | `BUILT` | プロトタイプで動く範囲。枠に映る React 実装でできることを 1 画面 1 行で書く（2026-09-28 に全画面を React のコードから見直した。画面を足したら 1 行足す） |
| ⑩ | `ACCESS_POLICY` `CRUD` `AUDIT` `APPROVAL` | 権限の方針・操作ログ・承認経路（2 段） |
| ⑪ | `LOG` `LOG_DOC` | 更新履歴 |
| ⑫ | `AS_IS` `NEW_ONLY` | 現行との対応。この案件は React 実装が現行なので空 |
| ⑬ | `RELEASES` `RELEASE_CURRENT` | リリース（開発 Ver ごとの状態・期間・ねらい・追加した帳票）。ヘッダーの「リリース」で出す。元は React の devVersions.ts。ガイドの開発Ver管理は 2026-09-24 にここへ移した |

`PROJECT.demo` と `PROJECT.asIs` は `null` にできる。プロトタイプや現行調査が無い案件でも、案内が出るだけで他は動く。

この案件で実行部に手を入れたのは 4 か所。フローの凡例から図の種類の切替（画面の遷移／動画の状態）を外したこと、`frameHTML()` に `device:'tablet'`（ノッチ無しの枡）を足したこと、`flowLayout()` で `pin` のノードは重心に寄せず並び順のまま置くようにしたこと、そして**フローを帳票ごとに切り替えられるようにしたこと**（2026-09-25）。

**フローの帳票切替（`FLOW_LEDGERS` 〜 `bindCaseBox()`）。** 帳票の枝は `M2-n`・`M3-n`・`M4-n`・`M5-n`・`A1-n`（`n` は帳票の番号。1 が使用水の点検）で、図に出すのは選んだ 1 帳票ぶんだけ。骨組み（M0〜M14・A0〜A7）は共通。
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
