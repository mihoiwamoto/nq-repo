# Confluence の画面仕様書と React の食い違い

2026-09-30。画面設計の「画面概要」を Confluence「NQリポ」スペースの画面仕様書（[cms]／[app]）から起こしたときに見つかったもの（66 件）。
画面概要の本文はいまの画面（React）に合わせて書いてある。**どちらに合わせるか**の欄を打合せで埋め、React を直すか仕様書を直すかを決める。

- 画面番号は画面設計に出ている番号（確認管理を隠したので、帳票管理は M4-n）
- 仕様書のページ名は Confluence のページへのリンク

| 種類 | 件数 |
|---|---|
| 仕様書にあって React に無いもの | 15 |
| 動き・初期値の違い | 25 |
| 文言・呼び方の違い | 11 |
| 仕様書の中で食い違っているもの | 6 |
| 画面設計の手書きの説明が実際と違うもの（資料側で直す） | 9 |

## 仕様書にあって React に無いもの（15 件）

### 管理画面

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| M2-1-1 使用水の点検 › データ検索 | 旧版（データ検索画面仕様）ではデータ一覧に「承認する」（一括承認）があるが、React のデータ検索の一覧には無い | [データ検索_データ一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147619841)<br>[データ検索_データ一覧_記録しないの項目がある時「−」表示](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147554310)<br>[データ検索_データ一覧_期間選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147521555)<br>ほか 3 件 |  |
| M3 承認申請管理 | Confluence（秤・官能・検体の承認待ち）は各タブの表示を 2 週間分としているが、React に期間の区切りは無い | [承認申請管理_承認待ち](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160727075)<br>[承認申請管理_承認済み](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160661629)<br>[承認申請管理_差し戻し](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160727128)<br>ほか 2 件 |  |
| M4-4-8 官能検査記録 › 点検予定 | Confluence では休業日も選べて「〇〇年〇〇月〇〇日　休業日」と出し入力はできない、React のカレンダーには休業日の扱いが無い | [帳票管理_⁨⁩官能検査記録_点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196247553)<br>[帳票管理_⁨⁩官能検査記録_点検予定_登録された商品がない日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196313089)<br>[帳票管理_⁨⁩官能検査記録_点検予定_休業日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196345857)<br>ほか 2 件 |  |
| M4-4-8 官能検査記録 › 点検予定 | Confluence では比較商品の有無と比較商品の製造日も並ぶ、React の予定の表示には無い | [帳票管理_⁨⁩官能検査記録_点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196247553)<br>[帳票管理_⁨⁩官能検査記録_点検予定_登録された商品がない日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196313089)<br>[帳票管理_⁨⁩官能検査記録_点検予定_休業日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196345857)<br>ほか 2 件 |  |
| M4-4-9 官能検査記録 › 予定の新規登録 | Confluence の編集では製品ごとに比較商品の有無（初期値は未設定）と比較商品点検日を入れる、React の画面には無い | [帳票管理_⁨⁩官能検査記録_点検予定_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196182070)<br>[帳票管理_⁨⁩官能検査記録_点検予定_商品追加ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196018263)<br>[帳票管理_⁨⁩官能検査記録_点検予定_編集](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196280321)<br>ほか 2 件 |  |
| M4-5-8 金属探知機・X線探知機記録 › 金属探知機管理 | Confluence は一覧を 20 件ずつのページ送りにするとするが、React はページ送りが無い | [帳票管理_金属探知機管理（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368738404)<br>[帳票管理_⁨⁩金属/X線探知機記録_金属探知機管理](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/281444502) |  |
| M4-5-15 金属探知機・X線探知機記録 › X線探知機管理 | Confluence は一覧を 20 件ずつのページ送りにするとするが、React はページ送りが無い | [帳票管理_X線探知機管理（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640219)<br>[帳票管理_⁨⁩金属/X線探知機記録_X線探知機管理](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/281804801) |  |
| M4-5-22 金属探知機・X線探知機記録 › ウェイトチェッカー管理 | Confluence は一覧を 20 件ずつのページ送りにするとするが、React はページ送りが無い | [帳票管理_ウェイトチェッカー管理（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640247)<br>[帳票管理_⁨⁩金属/X線探知機記録_ウェイトチェッカー管理](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/287965590) |  |
| M4-6-7 検体の管理 › 点検予定 | Confluence は休業日は選べるが入力できないとするが、React のカレンダーに休業日の扱いは無い | [帳票管理_検体管理_点検予定_カレンダー（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640420)<br>[帳票管理_⁨⁩検体管理_点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/269386011)<br>[帳票管理_検体管理_点検予定_削除確認ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/270630967)<br>ほか 1 件 |  |
| M4-6-7 検体の管理 › 点検予定 | Confluence は今日の日付を緑で表示するとするが、React のカレンダーは今日の色分けが無い | [帳票管理_検体管理_点検予定_カレンダー（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640420)<br>[帳票管理_⁨⁩検体管理_点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/269386011)<br>[帳票管理_検体管理_点検予定_削除確認ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/270630967)<br>ほか 1 件 |  |

### アプリ

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| A1 帳票一覧 | Confluence では管理画面で当日が休業日のとき「本日は休業日です」を出し、帳票を押せなくする。React の帳票一覧には休業日の表示も押せなくする扱いも無い | [帳票一覧画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/144212253)<br>[2.1帳票一覧_帳票選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/242941953)<br>[実施者選択画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155746307)<br>ほか 3 件 |  |
| A3 確認待ち | Confluence では表示を 2 週間以内に限るが、React の見本データには日付での絞り込みが無い | [確認待ち画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155517148)<br>[確認待ち](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163512321)<br>[確認待ち_確認者選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163545315)<br>ほか 22 件 |  |
| A3 確認待ち | React の絞り込みの選択肢には薬品管理と添加物管理が出ない | [確認待ち画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155517148)<br>[確認待ち](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163512321)<br>[確認待ち_確認者選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163545315)<br>ほか 22 件 |  |
| A4 点検予定 | Confluence には検体管理の点検予定のページもあるが、Ver3.0 のページには「アプリの点検予定には検体管理を実装していない」とある。React にも無い | [点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199720961)<br>[点検予定_休業日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199197225)<br>[点検予定_何も予定が組まれていない日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199753729)<br>ほか 6 件 |  |
| A4-2 点検予定 › 官能検査記録 検査商品設定 | Confluence では、詳細の 3 点リーダーのメニューに「この内容を複製して登録」と全商品削除がある。React にはこのメニューが無く、商品を全部外して保存すると削除完了になる | [点検予定_官能検査記録 検査商品設定_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199557450)<br>[点検予定_官能検査記録 検査商品設定_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200278031)<br>[点検予定_官能検査記録 検査商品設定_商品追加ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200278200)<br>ほか 5 件 |  |

## 動き・初期値の違い（25 件）

### 管理画面

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| M0 ログイン | Confluence は未入力・桁数・文字種ごとのエラー文言（例「社員番号は6桁の数字で入力してください。」）を決めているが、React のログイン画面に出る文言は「社員番号とパスワードが一致しません」だけ | [ログイン画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/156663882)<br>[ログアウト画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/156631131) |  |
| M1 ホーム | Confluence の権限別サイドメニューには保管場所管理・ヘルプが無い（React は承認者にも保管場所管理・ヘルプを出す） | [管理者権限画面仕様_ホーム](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/156631171)<br>[権限別_管理画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160006193) |  |
| M1 ホーム | 確認管理は React では 2026-09-30 からどのロールにも出さない（Confluence には記載なし） | [管理者権限画面仕様_ホーム](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/156631171)<br>[権限別_管理画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160006193) |  |
| M2-2-2 ガラスプラスチック管理 › 詳細画面 | Confluence 2.1 版は絞り込みに「修理中」があるが、2026-08-05 に承認申請管理側で削除された（データ検索側のページは未更新） | [2.1データ検索_データ詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/247955457)<br>[承認申請管理_ガラスプラスチック管理_詳細_承認待ちステータス](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/162136065) |  |
| M3 承認申請管理 | Confluence（秤・官能・検体）はサイドメニューのバッジを 承認待ち・承認済み・差し戻し の合計としている（使用水の版は承認待ちの件数）。要確認 | [承認申請管理_承認待ち](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160727075)<br>[承認申請管理_承認済み](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160661629)<br>[承認申請管理_差し戻し](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/160727128)<br>ほか 2 件 |  |
| M4-2-5 ガラスプラスチック管理 › フロアの詳細 | Confluence の最新（2025/11/02）では要対応から選べるのは「修理中／要対応のまま／修理完了」、React と 2025/10/24 版は「要対応／修理中／修理しない」 | [帳票管理_ガラス・プラスチック管理_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/148832285)<br>[帳票管理_ガラス・プラスチック管理_詳細_ステータス変更プルダウン表示時](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/148832359)<br>[帳票管理_ガラス・プラスチック管理_詳細_ステータス変更後「修理しない」一時表示時](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/149356545)<br>ほか 1 件 |  |
| M4-4-6 官能検査記録 › 製品の編集 | Confluence では編集画面の検査商品名は直せない（新規登録のときだけ）、React は編集でも検査製品名の欄が入力できる | [帳票管理_⁨⁩官能検査記録_編集](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196116481) |  |
| M4-4-9 官能検査記録 › 予定の新規登録 | Confluence では 2026/5/7 の仕様変更で予定の日付は変えられない、React は日付の欄を入力で変えられる | [帳票管理_⁨⁩官能検査記録_点検予定_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196182070)<br>[帳票管理_⁨⁩官能検査記録_点検予定_商品追加ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196018263)<br>[帳票管理_⁨⁩官能検査記録_点検予定_編集](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196280321)<br>ほか 2 件 |  |
| M4-6-7 検体の管理 › 点検予定 | 複製：Confluence は複製元の製品を持ったまま今日の新規登録（今日に予定があれば編集）へ移り、既存の製品に足すとする。React は日付を空けたまま新規登録を開き、選んだ日に予定があればそちらの製品で置き換える | [帳票管理_検体管理_点検予定_カレンダー（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640420)<br>[帳票管理_⁨⁩検体管理_点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/269386011)<br>[帳票管理_検体管理_点検予定_削除確認ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/270630967)<br>ほか 1 件 |  |
| M4-6-8 検体の管理 › 予定の新規登録 | Confluence は休業日を選べないとするが、React の日付欄は休業日も選べる | [帳票管理_検体管理_点検予定_新規登録（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368705906)<br>[帳票管理_検体管理_点検予定_新規登録_商品追加後（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368771311)<br>[帳票管理_⁨⁩検体管理_点検予定_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/270532658)<br>ほか 7 件 |  |
| M4-6-8 検体の管理 › 予定の新規登録 | Confluence は商品追加ダイアログの検索先を NQリポ商品マスタ（基幹システムから取り込んだものを含む）とし、Ver3.0 は検体対象製品から選ぶとする。どちらを出すか要確認 | [帳票管理_検体管理_点検予定_新規登録（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368705906)<br>[帳票管理_検体管理_点検予定_新規登録_商品追加後（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368771311)<br>[帳票管理_⁨⁩検体管理_点検予定_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/270532658)<br>ほか 7 件 |  |

### アプリ

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| A0 ログイン | Confluence では未認証の端末でログインすると「ログイン認証待ち」ダイアログが出て、管理画面で認証されるまで先へ進めない。React は初回ログインの端末をログイン端末管理に登録したうえで、そのまま帳票一覧へ進む（待ちのダイアログは無い） | [ログイン画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/144179222) |  |
| A1-5-2 金属探知機 › 機器の詳細 | Confluence では実施日の初期値は未入力、React は当日（途中の記録があればその日） | [帳票一覧_金属探知機_機器詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/360153139)<br>[帳票一覧_金属探知機_機器詳細_記録追加ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/360153161)<br>[帳票一覧_金属探知機_点検画面_途中保存ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/359956660) |  |
| A1-6-2 検体管理 › 検体の点検 | Confluence（Ver3.0）では実施日の初期値は未入力、React は当日 | [帳票一覧_検体管理（Ver3.0）_点検画面](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/362774853)<br>[帳票一覧_検体管理_点検画面](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/271155346)<br>[帳票一覧_検体管理_点検画面_途中保存ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/271155385) |  |
| A1-6-4 検体管理 › 提出完了 | Confluence（Ver3.0）では完了画面のボタンは「進捗一覧に戻る」だけ。React は帳票一覧から入ったときは「検体管理を続ける」「帳票一覧に戻る」、進捗一覧から入ったときだけ「進捗一覧に戻る」 | [帳票一覧_検体管理（Ver3.0）_提出完了](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/362840387)<br>[帳票一覧_検体管理_提出完了](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/271679588) |  |
| A1-10-1 添加物管理 › 製品の一覧 | Confluence ではカードに状態の印は出さず、カードを押したときに実施者選択のダイアログが出る。React はカードに状態（未点検／点検中／点検済み）が出て、実施者は帳票一覧のタイルを押したときに選ぶ | [帳票一覧_添加物管理](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/354484643)<br>[帳票一覧_添加物管理_実施者選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/354353524) |  |
| A1-10-2 添加物管理 › 記録の一覧 | Confluence では実施日の初期値は 2025/04/01 の暫定固定値、React は最初の記録の日付（記録が無ければ当日） | [帳票一覧_添加物管理_記録一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/354451780)<br>[帳票一覧_添加物管理_記録一覧_未登録時](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/354484665)<br>[帳票一覧_添加物管理_確認画面](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/354451802) |  |
| A7-2 設定 › ライセンス情報 | Confluence では「戻る」で帳票一覧へ戻る。React は設定に戻る | [設定画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/144146547) |  |
| A2 進捗 | Confluence（2.1）では「未点検」タブに未点検と点検中の両方が並び、バッジも両方を数える。React は未点検だけを並べ、バッジも未点検だけを数える | [進捗一覧画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155484322)<br>[2.1進捗一覧_すべて_アコーディオン展開時](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/245202999)<br>[2.1進捗一覧_未点検一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/246317057)<br>ほか 15 件 |  |
| A2 進捗 | Confluence では未送信の記録に付く印の決まりが書かれていない。React は、未送信の帯が出ているあいだ点検済みの行に ↗ の印を付ける | [進捗一覧画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155484322)<br>[2.1進捗一覧_すべて_アコーディオン展開時](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/245202999)<br>[2.1進捗一覧_未点検一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/246317057)<br>ほか 15 件 |  |
| A3 確認待ち | Confluence（検体管理 Ver3.0）では、検体管理の確認待ちは確認者選択と確認画面を通らず、行を押すと詳細へ直接移る。差し戻しも同じ。React は検体管理でも確認者を選んでから確認画面に入る | [確認待ち画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155517148)<br>[確認待ち](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163512321)<br>[確認待ち_確認者選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163545315)<br>ほか 22 件 |  |
| A3 確認待ち | Confluence（Ver1.6）では、255 文字を超えると「※文字数の上限を超えています。255文字以内で入力してください。」が出る。Ver3.0 と React は 255 文字で入力を止める | [確認待ち画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155517148)<br>[確認待ち](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163512321)<br>[確認待ち_確認者選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163545315)<br>ほか 22 件 |  |
| A4 点検予定 | Confluence では新規登録で選べる帳票が官能検査記録だけ（「初期は官能検査のみ」）。React は機械器具点検 点検管理と官能検査記録 検査商品設定の 2 つ | [点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199720961)<br>[点検予定_休業日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199197225)<br>[点検予定_何も予定が組まれていない日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199753729)<br>ほか 6 件 |  |
| A4 点検予定 | Confluence ではカレンダー上の休業日はグレー。React はカレンダーのマスに「休業日」と出し、下の見出しは赤字 | [点検予定](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199720961)<br>[点検予定_休業日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199197225)<br>[点検予定_何も予定が組まれていない日を選択した場合](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199753729)<br>ほか 6 件 |  |
| A4-2 点検予定 › 官能検査記録 検査商品設定 | Confluence では、商品追加ダイアログを編集から開くと登録済みの商品が並ぶ（チェックは付かない）。React でどう見えるかは確かめていない | [点検予定_官能検査記録 検査商品設定_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199557450)<br>[点検予定_官能検査記録 検査商品設定_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200278031)<br>[点検予定_官能検査記録 検査商品設定_商品追加ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200278200)<br>ほか 5 件 |  |

## 文言・呼び方の違い（11 件）

### 管理画面

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| M4-1-3 使用水の点検 › 点検場所の新規登録 | Confluence の選択肢は「記載する／記載しない」、React の画面は「記録する／記録しない」 | [帳票管理画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/156631207) |  |
| M4-1-6 使用水の点検 › 点検場所の編集 | Confluence では保存後のトーストは「更新が完了しました」、React は詳細へ戻って「更新されました。」 | [帳票管理画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/156631207) |  |
| M4-3-3 秤点検管理 › 秤の新規登録 | Confluence では期間の欄は「アプリ表示期間」、React の登録画面は「持ち場の運用期間」（詳細では「アプリ表示期間」） | [帳票管理_秤点検記録_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200900818)<br>[帳票管理_秤点検記録_持ち場管理_新規登録画面](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/201719822) |  |
| M4-3-11 秤点検管理 › 秤管理の新規登録 | Confluence の選択肢は「記載する／記載しない」、React の画面は「記録する／記録しない」 | [帳票管理_秤点検記録_秤管理_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/208830465) |  |
| M4-3-13 秤点検管理 › 秤管理の詳細 | Confluence では持ち場を割り当てていないときの表示は「未割り当て」、React は「未設定」 | [帳票管理_秤点検記録_秤管理_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/209092609)<br>[帳票管理_秤点検記録_秤管理_削除確認ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/209092654) |  |
| M4-4-2 官能検査記録 › 検査製品の一覧 | Confluence では「検査商品」、React の画面は「検査製品」 | [帳票管理_⁨⁩官能検査記録_アプリ表示中](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/195985437) |  |
| M4-4-3 官能検査記録 › 製品の新規登録 | Confluence では選択肢は「記載する／記載しない」、React の画面は「記録する／記録しない」 | [帳票管理_⁨⁩官能検査記録_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/196018210)<br>[帳票管理_⁨⁩官能検査記録_新規登録_検査商品名プルダウン展開時](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/208437249) |  |
| M4-5-14 金属探知機・X線探知機記録 › 金属探知機の動作確認項目設定 | カテゴリ：Confluence は 電源ON／コンベア・プーリー・モーター／設定／はね板(フリッター)／その他。React は「その他」が無く、「はね板（フリッパー）」と表記 | [帳票管理_金属探知機管理_動作確認項目設定（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640197)<br>[帳票管理_金属/X線探知機記録_金属探知機管理_動作確認項目設定（プルダウン展開）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/281575425) |  |
| M4-5-21 金属探知機・X線探知機記録 › X線探知機の動作確認項目設定 | カテゴリ：Confluence は 電源ON／コンベア・プーリー・モーター／設定／はね板(フリッター)／その他。React は「その他」が無く、「はね板（フリッパー）」と表記 | [帳票管理_金属/X線探知機記録_X線探知機管理_動作確認項目設定（プルダウン展開）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/287965185)<br>[帳票管理_X線探知機管理（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640219) |  |
| M4-5-28 金属探知機・X線探知機記録 › ウェイトチェッカーの動作確認項目設定 | カテゴリ：Confluence は 動作確認／その他。React は 電源ON／キャリブレーション／精度確認 | [帳票管理_金属/X線探知機記録_ウェイトチェッカー管理_動作確認項目設定（プルダウン展開）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/287703527) |  |

### アプリ

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| A4-2 点検予定 › 官能検査記録 検査商品設定 | Confluence では編集して保存すると「保存しました」のトーストが出る。React は「保存が完了しました！」の完了画面に移る | [点検予定_官能検査記録 検査商品設定_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/199557450)<br>[点検予定_官能検査記録 検査商品設定_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200278031)<br>[点検予定_官能検査記録 検査商品設定_商品追加ダイアログ](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200278200)<br>ほか 5 件 |  |

## 仕様書の中で食い違っているもの（6 件）

### 管理画面

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| M2-5-1 金属探知機・X線探知機記録 › データ検索 | 旧版は列を ステータス・実施日・点検構成名・通過商品・結果・確認者 としていたが、Ver3.0 は 実施日・点検構成名・実施者（React は Ver3.0 に合わせる前提で要確認） | [データ検索_金属/X線探知機記録_データ一覧（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640003)<br>[データ検索_金属/X線探知機記録_データ一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/265420801) |  |
| M3-2-2 ガラスプラスチック管理 › 詳細画面 | 修理完了の呼び方が Confluence でも揺れている（2.1 版は「対応完了」、2026-08-05 版は「修理完了」） | [承認申請管理_ガラスプラスチック管理_詳細_承認待ちステータス](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/162136065)<br>[2.1承認申請管理_ガラスプラスチック管理_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/248152065)<br>[承認申請管理_ガラスプラスチック管理_詳細_ステータス変更プルダウン展開時](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/162005077)<br>ほか 3 件 |  |
| M4-3-11 秤点検管理 › 秤管理の新規登録 | Confluence の入力項目表には「秤量(kg)は1以上で入力してください」が残り、同じページの 2026/6/29 追記（小数点以下 3 桁まで）と食い違う | [帳票管理_秤点検記録_秤管理_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/208830465) |  |
| M4-5-3 金属探知機・X線探知機記録 › 機器の新規登録 | 記録する／記録しない の初期値：Confluence（Ver3.0）は 4 つとも「記録しない」、旧版は 4 つとも「記録する」。React は 金属探知機・X線探知機・ウェイトチェッカーが「記録しない」、シーリングだけ「記録する」 | [帳票管理_金属/X線探知機記録_新規登録（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640125)<br>[帳票管理_⁨⁩金属/X線探知機記録_新規登録](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/279642214)<br>[帳票管理_金属/X線探知機記録_新規登録_商品追加ダイアログ（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368738364)<br>ほか 1 件 |  |
| M4-6-2 検体の管理 › 検体（製品）の一覧 | Confluence の旧版はこの画面に「保管場所管理」ボタンがあるが、Ver3.0 と React ではサイドメニューの保管場所管理に移っていて、この画面には無い | [帳票管理_検体管理（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368738650)<br>[帳票管理_⁨⁩検体管理_検体対象製品一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/268173334) |  |

### アプリ

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| A3 確認待ち | Confluence では差し戻しの行を押すと確認者選択になる（機械器具点検・金属探知機・2.1）ページと、実施者選択になる（官能検査記録）ページがある。React は機械器具点検の差し戻しだけ実施者を選び、他は確認者を選ぶ | [確認待ち画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155517148)<br>[確認待ち](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163512321)<br>[確認待ち_確認者選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/163545315)<br>ほか 22 件 |  |

## 画面設計の手書きの説明が実際と違うもの（資料側で直す）（9 件）

### 管理画面

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| M2-1-1 使用水の点検 › データ検索 | 画面設計の一行説明は「年月のタブで月を切り替える」だが、React は 月送り（＜ ＞）と月の選択で切り替える | [データ検索_データ一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147619841)<br>[データ検索_データ一覧_記録しないの項目がある時「−」表示](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147554310)<br>[データ検索_データ一覧_期間選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147521555)<br>ほか 3 件 |  |
| M2-1-1 使用水の点検 › データ検索 | 画面設計の一行説明は「承認済みだけ」だが、React の一覧は承認の状態で絞っていない（Confluence にも承認済みだけという記述は無い） | [データ検索_データ一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147619841)<br>[データ検索_データ一覧_記録しないの項目がある時「−」表示](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147554310)<br>[データ検索_データ一覧_期間選択](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147521555)<br>ほか 3 件 |  |
| M2-1-2 使用水の点検 › 詳細画面 | 画面設計の説明は「閲覧専用で、承認・差し戻しの操作は無い」だが、React は承認申請管理の詳細をそのまま使い、承認ステータスの変更とコメント入力がある（Confluence の旧版も同じ）。sub の書き直しが要る | [データ検索_データ詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/147456005)<br>[データ検索画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/159121632) |  |
| M2-2-2 ガラスプラスチック管理 › 詳細画面 | 画面設計の一行説明は「閲覧専用」だが、Confluence と React はステータス変更・修理状況の変更・コメント入力つき | [2.1データ検索_データ詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/247955457)<br>[承認申請管理_ガラスプラスチック管理_詳細_承認待ちステータス](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/162136065) |  |
| M2-3-2 秤点検管理 › 詳細画面 | 画面設計の一行説明は「閲覧専用」だが、Confluence と React は承認ステータスの変更・修理状況の変更・コメント入力つき | [データ検索_秤点検記録_データ一覧_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/190873601)<br>[データ検索_秤点検記録_データ一覧_詳細（点検見送りの秤）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/200704410) |  |
| M2-4-2 官能検査記録 › 詳細画面 | 画面設計の一行説明は「閲覧専用」だが、Confluence はデータ検索の点数一覧に承認ステータスの変更とコメント入力を置いている | [データ検索_官能検査記録_データ一覧_点数一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/194838541)<br>[データ検索_官能検査記録_データ一覧_点数一覧_詳細](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/195100678)<br>[承認申請管理_官能検査記録_データ一覧_点数一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/195756033) |  |
| M2-5-2 金属探知機・X線探知機記録 › 詳細画面 | 画面設計の一行説明は「閲覧専用」だが、旧版の点検内容一覧には承認ステータスの変更（一度変えたら修正不可）がある | [データ検索_金属/X線探知機記録_点検内容一覧（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368640031)<br>[データ検索_金属/X線探知機記録_点検内容一覧_詳細（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368705553)<br>[データ検索_金属/X線探知機記録_データ一覧_点検内容一覧](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/278200444)<br>ほか 1 件 |  |
| M2-6-2 検体の管理 › 詳細画面 | 画面設計の一行説明は「閲覧専用」だが、旧版の詳細は承認ステータスの変更（承認待ち・差し戻し・承認完了）とコメント入力つき | [データ検索_検体管理_データ一覧_詳細（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368705816)<br>[データ検索_検体管理_データ一覧_詳細_破棄済みの場合（理由：賞味期限切れ）（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368738578)<br>[データ検索_検体管理_データ一覧_詳細_破棄済みの場合（理由：その他）（Ver3.0）](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/368771277)<br>ほか 3 件 |  |

### アプリ

| 画面 | 食い違い | 仕様書 | どちらに合わせるか |
|---|---|---|---|
| A1-1-1 使用水の点検 › 点検場所の一覧 | 画面設計の手書きの説明は「行を押すと記録入力へ」だが、React と Confluence では行を押すとその点検場所の過去2週間分の記録の表が開く | [使用水の点検画面仕様](https://lanstech.atlassian.net/wiki/spaces/ymeDALCz8h1f/pages/155680799) |  |
