import json
A=(1280,760); P=(768,1024)
scroll_bottom={"eval":"[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+10&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)).forEach(e=>{e.scrollTop=e.scrollHeight;e.dispatchEvent(new Event('scroll'))})"}
pick={"pick":1}
trash="(()=>{const b=[...document.querySelectorAll('button')].filter(b=>!b.innerText.trim()&&b.getBoundingClientRect().x>900&&b.getBoundingClientRect().y>120);b[0].click();})()"
dl="(()=>{let b=document.querySelector('[aria-label*=\"ダウンロード\"]');if(!b)b=[...document.querySelectorAll('button')].filter(b=>!b.innerText.trim()&&b.getBoundingClientRect().x>1100&&b.getBoundingClientRect().y<200)[0];b.click();})()"
typ="window.__type=(ph,val)=>{const el=[...document.querySelectorAll('input,textarea')].find(e=>e.placeholder===ph);const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));};__type('例）1,000','100');"
datepick="(()=>{const i=[...document.querySelectorAll('input')].find(e=>/\\d{4}\\/\\d{2}\\/\\d{2}/.test(e.value)||/日付/.test(e.placeholder));const t=(i&&(i.closest('label')||i.parentElement));const btn=t&&t.querySelector('button,svg,img');(btn||i).dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));(btn||i).click();i&&i.focus();})()"
L=[('9','薬品管理','chemical-management','chemicals','c1','薬品','c3','records/r5','p18','p16','ch2','dch1','消泡剤（シリコーン樹脂）',0,'選択してください','c3'),
   ('10','添加物管理','additive-management','additives','a1','添加物','products/a3','records/r4','p1','p17','a1','add1','ソルビン酸',1,'選択をしてください','products/a3')]
S=[]
def add(sec,J,row,name,pf,h,steps=None,clone=None):
    S.append(dict(sec=sec,led=J,row=row,name=name,pf=pf,hash=h,steps=steps or [],clone=clone))
for n,J,slug,coll,iid,X,app_item,rec,p,pr,ap,ds,prow,pnth,selbtn,_ in L:
    s='帳票管理'; base=f'admin/ledger-management/{slug}/factories/f1'
    add(s,J,'common','帳票管理 › 帳票選択','admin','',clone='帳票管理 › 帳票選択')
    add(s,J,'main',f'帳票管理 › {J} › 工場選択','admin',f'admin/ledger-management/{slug}')
    add(s,J,'main',f'帳票管理 › {J} › {X}の一覧','admin',base)
    add(s,J,'main',f'帳票管理 › {J} › {X}の新規登録','admin',base+f'/{coll}/new')
    add(s,J,'main',f'帳票管理 › {J} › 登録完了','admin',base+f'/{coll}/registered')
    add(s,J,'main',f'帳票管理 › {J} › {X}の詳細','admin',base+f'/{coll}/{iid}')
    add(s,J,'main',f'帳票管理 › {J} › {X}の詳細（ダイアログ：削除）','admin',base+f'/{coll}/{iid}',[{"wait":800},{"eval":trash,"after":900}])
    add(s,J,'main',f'帳票管理 › {J} › {X}の編集','admin',base+f'/{coll}/{iid}/edit')
    add(s,J,'main',f'帳票管理 › {J} › 削除完了','admin',base+f'/{coll}/deleted')
    for nm,h in [('保管場所管理','admin/storage'),('保管場所管理 › 新規登録','admin/storage/new'),('保管場所管理 › 登録完了','admin/storage/new/complete'),('保管場所管理 › 詳細','admin/storage/s1')]:
        add(s,J,'storage',nm,'admin',h)
    s='帳票一覧'; ab=f'app/ledger-list/{slug}'
    add(s,J,'common','帳票一覧','app','',clone='帳票一覧')
    add(s,J,'main',f'帳票一覧 › {J}（ポップアップ：実施者の選択）','app','app/ledger-list',[{"click":J}])
    add(s,J,'main',f'帳票一覧 › {J} › {X if n=="9" else "製品"}の一覧','app',ab)
    add(s,J,'main',f'帳票一覧 › {J} › 記録の一覧','app',f'{ab}/{app_item}')
    add(s,J,'main',f'帳票一覧 › {J} › 記録の一覧（ポップアップ：実施日の選択）','app',f'{ab}/{app_item}',[{"wait":600},{"eval":datepick,"after":900}])
    add(s,J,'main',f'帳票一覧 › {J} › 記録入力','app',f'{ab}/{app_item}/new')
    add(s,J,'main',f'帳票一覧 › {J} › 記録の詳細','app',f'{ab}/{app_item}/{rec}')
    add(s,J,'main',f'帳票一覧 › {J} › 提出内容の確認','app',f'{ab}/{app_item}/confirm')
    add(s,J,'main',f'帳票一覧 › {J} › 提出完了','app',f'{ab}/{app_item}/confirm/complete' if n=='9' else f'{ab}/{app_item}/complete')
    s='確認待ち'
    add(s,J,'common','帳票一覧','app','',clone='帳票一覧')
    add(s,J,'common','確認待ち','app','',clone='確認待ち')
    add(s,J,'main',f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：確認者の選択）','app',f'app/pending-review/{p}')
    add(s,J,'main',f'確認待ち › {J} › 確認待ちの詳細','app',f'app/pending-review/{p}',[pick,{"click":"次へ","in":1}])
    add(s,J,'main',f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：提出完了）','app',f'app/pending-review/{p}',[pick,{"click":"次へ","in":1},{"click":"提出","exact":1}])
    s='承認申請管理'
    add(s,J,'common','承認申請管理','admin','',clone='承認申請管理')
    add(s,J,'main',f'承認申請管理 › {J} › データ一覧','admin',f'admin/approvals/{slug}')
    add(s,J,'main',f'承認申請管理 › {J} › データ一覧（ダイアログ：承認の確認）','admin',f'admin/approvals/{slug}',[{"click":"承認する","exact":1}])
    add(s,J,'main',f'承認申請管理 › {J} › 詳細','admin',f'admin/approvals/{slug}/records/{ap}')
    add(s,J,'main',f'承認申請管理 › {J} › 詳細（ダイアログ：承認の確認）','admin',f'admin/approvals/{slug}/records/{ap}',[{"click":"承認待ち","exact":1},{"click":"承認済み","exact":1}])
    add(s,J,'main',f'承認申請管理 › {J} › 詳細（ダイアログ：差し戻し理由）','admin',f'admin/approvals/{slug}/records/{ap}',[{"click":"承認待ち","exact":1},{"click":"差し戻し","exact":1}])
    s='確認待ち_差し戻し'
    add(s,J,'common','帳票一覧','app','',clone='帳票一覧')
    add(s,J,'main',f'確認待ち › {J} › 確認待ちの詳細（差し戻し）（ポップアップ：実施者の選択）','app',f'app/pending-review/{pr}')
    add(s,J,'main',f'確認待ち › {J} › 差し戻しの内容','app',f'app/pending-review/{pr}',[pick,{"click":"次へ","in":1}])
    add(s,J,'main',f'確認待ち › {J} › 内容の修正','app',f'app/pending-review/{pr}',[pick,{"click":"次へ","in":1},{"click":"修正する"}])
    add(s,J,'main',f'確認待ち › {J} › 差し戻しの内容（ポップアップ：差し戻し対応完了）','app',f'app/pending-review/{pr}',[pick,{"click":"次へ","in":1},scroll_bottom,{"click":"差し戻し対応完了"}])
    s='進捗一覧'
    add(s,J,'common','進捗一覧','app','',clone='進捗一覧')
    add(s,J,'common','進捗一覧（ポップアップ：絞り込み条件）','app','',clone='進捗一覧（ポップアップ：絞り込み条件）')
    st=[{"click":prow,"nth":pnth}]
    add(s,J,'main',f'進捗一覧 › {J}（ポップアップ：実施者の選択）','app','app/progress',st)
    st=st+[{"click":"次へ","in":1}]
    add(s,J,'main',f'進捗一覧 › {J} › 記録の一覧','app','app/progress',st)
    st2=st+[{"click":"記録を追加"}]
    add(s,J,'main',f'進捗一覧 › {J} › 記録入力','app','app/progress',st2)
    st3=st2+[{"click":selbtn},{"click":"入庫","exact":1},{"eval":typ,"after":400},{"click":"自動計算","exact":1,"optional":1},{"click":"保存","exact":1},{"click":"確認画面へ","exact":1}]
    add(s,J,'main',f'進捗一覧 › {J} › 提出内容の確認','app','app/progress',st3)
    add(s,J,'main',f'進捗一覧 › {J} › 提出完了','app','app/progress',st3+[{"click":"提出","exact":1}])
    s='データ検索'; dsb=f'admin/data-search/{slug}/factories/f1'
    add(s,J,'common','データ検索 › 帳票選択','admin','',clone='データ検索 › 帳票選択')
    add(s,J,'main',f'データ検索 › {J} › 工場選択','admin',f'admin/data-search/{slug}')
    add(s,J,'main',f'データ検索 › {J} › データ一覧','admin',dsb)
    add(s,J,'main',f'データ検索 › {J} › データ一覧（ポップアップ：年月の選択）','admin',dsb,[{"click":"2025年4月","exact":1}])
    add(s,J,'main',f'データ検索 › {J} › データ一覧（ダイアログ：ダウンロード形式選択）','admin',dsb,[{"wait":1500},{"eval":dl,"after":900}])
    add(s,J,'main',f'データ検索 › {J} › 詳細','admin',f'{dsb}/records/{ds}')
for i,s in enumerate(S): s['id']=f'D{i:03d}'; s['w'],s['h']=A if s['pf']=='admin' else P
# storage screens are the same for both ledgers: capture once (薬品), clone for 添加物
seen={}
for s in S:
    if s['row']=='storage':
        if s['name'] in seen: s['clone']=s['name']; s['hash']=''
        else: seen[s['name']]=s['id']
json.dump(S,open('plan5.json','w'),ensure_ascii=False)
cap=[s for s in S if not s['clone']]; print('total',len(S),'capture',len(cap))
open('todo5.txt','w').write('\n'.join(f"{i} {s['id']}" for i,s in enumerate(cap)))
