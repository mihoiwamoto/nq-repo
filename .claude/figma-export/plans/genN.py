# 2026-10-08 夜：データが無いときの画面（4 帳票）を「📺 AI書き出し」の機械器具点検の列の左に書き出す plan
# 管理画面は「状態を試す › データが無い」（&empty=1）・管理者、アプリは点検対象が 0 件の工場（&appFactory=f5）＋データが無い
import json
L = [("equipment-inspection", "機械器具点検", "持ち場/ラインの一覧"),
     ("cleaning-record", "清掃記録", "持ち場/ラインの一覧"),
     ("chemical-management", "薬品管理", "薬品の一覧"),
     ("additive-management", "添加物管理", "添加物の一覧")]
APP_LIST = {"equipment-inspection": "持ち場/ラインの一覧", "cleaning-record": "持ち場/ラインの一覧",
            "chemical-management": "薬品の一覧", "additive-management": "製品の一覧"}
REC = {"chemical-management": "app/ledger-list/chemical-management/c3",
       "additive-management": "app/ledger-list/additive-management/products/a3"}
AQ = "&role=administrator&empty=1"
PQ = "&empty=1&appFactory=f5"
rows = []
for i, (slug, name, admin_list) in enumerate(L, 1):
    sa, sp = f"（Admin）データなし_{name}", f"（App）データなし_{name}"
    def a(n, h): rows.append(dict(id=f"N{len(rows)+1:03d}", name=n + "（データなし）", pf="admin", hash=h, steps=[], w=1440, h=960, q=AQ, sections=[sa]))
    def p(n, h, q=PQ): rows.append(dict(id=f"N{len(rows)+1:03d}", name=n + "（データなし）", pf="app", hash=h, steps=[], w=768, h=976, q=q, sections=[sp]))
    a(f"帳票管理 › {name} › {admin_list}", f"admin/ledger-management/{slug}/factories/f1")
    a("承認申請管理 › 帳票選択", "admin/approvals")
    a(f"承認申請管理 › {name} › 申請の一覧", f"admin/approvals/{slug}")
    a(f"データ検索 › {name} › データ一覧", f"admin/data-search/{slug}/factories/f1")
    p(f"帳票一覧 › {name} › {APP_LIST[slug]}", f"app/ledger-list/{slug}")
    if slug in REC:
        # 記録の一覧は点検対象（薬品・製品）が要るので、見本の工場のまま「データが無い」で記録だけ空にする
        p(f"帳票一覧 › {name} › 記録の一覧", REC[slug], "&empty=1")
    else:
        p("点検予定", "app/schedule")
    p("進捗一覧", "app/progress")
    p("確認待ち › 確認一覧", "app/pending-review")
json.dump(rows, open("plans/planN.json", "w"), ensure_ascii=False, indent=1)
print(len(rows))
