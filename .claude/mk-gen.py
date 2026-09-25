# -*- coding: utf-8 -*-
import json,os
M=os.environ['SP']+'/mocks/'
def L(n): return json.load(open(M+n+'.json'))
FAC = {f['id']:f['name'] for f in L('admin__features__factory-management__mockData')['INITIAL_FACTORY_RECORDS']}
def jp(d): return (d or '').replace('-','/')
def cm(list_): return [{'who':c.get('author',''), 'at':c.get('timestamp','').replace('.','/'), 'text':c.get('text','')} for c in (list_ or [])]
MK={}
# 承認申請管理
MK['approvals']=[{'id':'ap'+a['id'],'st':a['status'],'fac':a['companyName'],'slug':a['ledgerSlug'],'desc':a['description']} for a in L('admin__data__approvals')['approvalRequests']]
# 確認待ち（アプリ）
MK['pending']=[{'id':p['id'],'date':'2025-'+p['date'].replace('/','-'),'slug':p['ledgerSlug'],'name':p['name'],'st':p['status'],'point':p.get('pointId')} for p in L('app__data__pendingReviews')['PENDING_REVIEWS']]
# 職員・端末・ログ
MK['staff']=[{'name':s['name'],'no':s['employeeNumber'],'fac':FAC[s['assignments'][0]['factoryId']],'role':s['assignments'][0]['role'],'mail':s['email'],'auth':s['systemAuthority'],'facs':[FAC[a['factoryId']] for a in s['assignments']]} for s in L('admin__features__staff-management__mockData')['INITIAL_STAFF']]
MK['devices']=[{'name':d['name'],'fac':FAC[d['factoryId']],'st':d['status']} for d in L('admin__features__device-management__mockData')['INITIAL_DEVICES']]
MK['logs']=[{'at':l['timestamp'],'kind':'アプリ画面' if l['screenType']=='app' else '管理画面','fac':FAC[l['factoryId']],'who':l['staffName'],'role':l['role'],'what':l['action'],'slug':l.get('ledgerSlug','')} for l in L('admin__features__log-management__mockData')['LOG_ENTRIES']]
h=L('admin__features__help__mockData'); MK['help']=[[q['question'],q['answer']] for q in h['HELP_FAQS']]
MK['nq']=[{'name':p['name'],'qty':p['quantity'],'unit':p['quantityUnit'],'fac':FAC[p['factoryId']],'exp':p['expiry']} for p in L('admin__features__product-management__mockData')['INITIAL_NQ_PRODUCTS']]
# 使用水
PT={'給湯室':'wp1','点検場所B':'wp2'}
CK=[('taste','taste'),('smell','smell'),('color','color'),('turb','turbidity'),('fm','foreignMatter')]
def wrec(r, st):
    checks={}; ng={}
    for k,src in CK:
        x=r[src]; checks[k]='ok' if x['status']=='normal' else 'ng'
        if x['status']!='normal': ng[k]={'cause':x.get('cause',''),'action':x.get('action','')}
    return {'id':r['id'],'date':r['date'],'time':r['time'],'point':PT.get(r['location'],'wp0'),'location':r['location'],'implementer':r['implementer'],'confirmer':r['confirmer'],'st':st,'checks':checks,'ng':ng,
            'ph':str(r['ph']),'chlorine':str(r['chlorine']),'chlorineRep':r['chlorineReplenished'],'uvHours':str(r['uvOperatingHours']),'uvRep':r['uvLampReplaced'],
            'uvLight':'点灯' if r['uvIndicatorLight']=='on' else '消灯','abnLight':'点灯' if r['abnormalDetectionLight']=='on' else '消灯','comments':cm(r.get('comments'))}
W={}
W['search']=[wrec(r, r['approvalStatus']) for r in L('admin__features__data-search-water-inspection__mockRecords')['mockRecords']]
W['conf']=[wrec(r, 'inspected' if r['confirmStatus']=='unconfirmed' else 'pending') for r in L('admin__features__confirmations-water-inspection__mockData')['waterConfirmationRecords']]
W['appr']=[wrec(r, r['approvalStatus']) for r in L('admin__features__approvals-water-inspection__mockData')['waterApprovalRecords']]
aw=L('app__features__water-inspection__mockData')
W['points']=[[p['id'],p['name'],p['status'],p.get('inspectorName',''),p.get('inspectionDate','')] for p in aw['points']]
LBL={'味':'taste','臭い':'smell','色':'color','濁り':'turb','異物':'fm'}
def arec(pid, r):
    checks={}; ng={}
    for c in r['checks']:
        k=LBL[c['label']]; checks[k]=c['status']
        if c['status']=='ng': ng[k]={'cause':c.get('cause',''),'action':c.get('action','')}
    return {'id':r['id'],'date':r['date'].replace('/','-'),'time':r['time'],'point':pid,'location':r['location'],'implementer':r['inspector'],'confirmer':'','st':'approved','checks':checks,'ng':ng,
            'ph':r['phValue'],'chlorine':r['residualChlorine'],'chlorineRep':r['chlorineToggle']['checked'],'uvHours':r['uvOperatingHours'],'uvRep':r['uvToggle']['checked'],'uvLight':r['uvIndicatorLight'],'abnLight':r['errorIndicatorLight'],'comments':[]}
W['app']={pid:[arec(pid,r) for r in rs] for pid,rs in aw['recordsByPoint'].items()}
W['mgmt']=[{'id':p['id'],'name':p['name'],'from':jp(p.get('displayFrom','')),'to':jp(p.get('displayTo','')),'rec':all(p['checks'].values()),'alert':p.get('uvAlertHours','')} for p in L('admin__features__water-inspection__mockData')['initialWaterInspectionPoints']]
MK['water']=W
# 帳票ごとの管理画面の記録（RX）
def conf_st(r): return 'inspected' if r.get('confirmStatus')=='unconfirmed' else 'pending'
def base(r, st, v, time='09:00', note='', who=None, conf=None, x=None):
    return {'id':r['id'],'st':st,'date':r['date'],'time':r.get('time') or time,'v':v,'who':who if who is not None else r.get('implementer',''),'conf':conf if conf is not None else r.get('confirmer',''),'note':note,'comments':cm(r.get('comments')),'x':x or {}}
RX={}
def three(slug, fn_search, fn_conf, fn_appr):
    RX[slug]={'search':fn_search(),'conf':fn_conf(),'appr':fn_appr()}
# glass
def gp(r, st):
    items=[it for room in r['rooms'] for it in room['items']]; issue=sum(1 for it in items if it['status']=='issue')
    return base(r, st, [r['floorName'], str(len(items)), str(len(items)-issue), str(issue)], x={'rooms':[[room['name'],[[it['name'],it['status'],it.get('content',''),it.get('cause',''),it.get('actionType','')] for it in room['items']]] for room in r['rooms']]})
three('glass-plastic', lambda:[gp(r, r.get('approvalStatus','approved')) for r in L('admin__features__data-search-glass-plastic__mockRecords')['glassPlasticRecords']],
      lambda:[gp(r, conf_st(r)) for r in L('admin__features__confirmations-glass-plastic__mockData')['glassPlasticConfirmationRecords']],
      lambda:[gp(r, r['approvalStatus']) for r in L('admin__features__approvals-glass-plastic__mockData')['glassPlasticApprovalRecords']])
# scale
def sc(r, st):
    if r['skipped']: v=[r['scaleLabel'], r['serialNumber'], r['post'], '見送り','—','—','—', r.get('remarks','')]
    else: v=[r['scaleLabel'], r['serialNumber'], r['post'], '異常あり' if r['operationCheck']=='ng' else '正常', '正常' if r.get('levelCheck')=='ok' else '—', 'なし' if r.get('dirtCheck')=='ok' else '—', str(r['displayValue']) if r.get('displayValue') is not None else '—', r.get('remarks','')]
    return base(r, st, v, time=(r.get('operationCheckTime') or '2025/04/01 09:00').split(' ')[-1] or '09:00', note=r.get('remarks',''), x={'cause':r.get('operationCause',''),'action':r.get('operationAction') or '','repair':r.get('repairStatus') or '','skipped':r['skipped'],'weightCause':r.get('weightCause') or ''})
three('scale-inspection', lambda:[sc(r, r['approvalStatus']) for r in L('admin__features__data-search-scale-inspection__mockRecords')['scaleRecords']],
      lambda:[sc(r, conf_st(r)) for r in L('admin__features__confirmations-scale-inspection__mockData')['scaleConfirmationRecords']],
      lambda:[sc(r, r['approvalStatus']) for r in L('admin__features__approvals-scale-inspection__mockData')['scaleApprovalRecords']])
# sensory
CR=['味','形','色','食感','香り','とろみ']
def sn(r, st):
    e=r['scoreEntries'][0]; sc_=[str(e['scores'][c]['score']) if c in e['scores'] else '—' for c in CR]
    ok=all(int(s)>=3 for s in sc_ if s!='—')
    return base(r, st, [r['productName'], *sc_, '合格' if ok else '不合格'], time=list(e['scores'].values())[0]['timestamp'].split(' ')[-1] if e['scores'] else '10:00', who=e['inspectorName'], x={'mfg':jp(r['manufactureDate']),'exp':jp(r['expiryDate']),'entries':[{'who':x['inspectorName'],'date':jp(x['date']),'cmp':x.get('hasComparisonProduct',False),'cmpDate':jp(x.get('comparisonManufactureDate','')),'scores':{c:x['scores'][c]['score'] for c in x['scores']}} for x in r['scoreEntries']]})
three('sensory-inspection', lambda:[sn(r, r['approvalStatus']) for r in L('admin__features__data-search-sensory-inspection__mockRecords')['sensoryRecords']],
      lambda:[sn(r, conf_st(r)) for r in L('admin__features__confirmations-sensory-inspection__mockData')['sensoryConfirmationRecords']],
      lambda:[sn(r, r['approvalStatus']) for r in L('admin__features__approvals-sensory-inspection__mockData')['sensoryApprovalRecords']])
# metal
def mx(r, st):
    recs=r.get('records',[]); res='異常あり' if r.get('result')=='NG' else '正常'
    who = recs[0]['inspectorName'] if recs else r.get('metalInspector','')
    return base(r, st, [r['machineName'], res], time=(recs[0]['time'] if recs else r.get('metalCheckTime','08:00')), who=who, note=r.get('remarks',''), x={'md':r.get('metalDetectorModel',''),'xr':r.get('xrayDetectorModel',''),'wc':r.get('weightCheckerModel',''),'records':[{'phase':q['category'],'time':q['time'],'content':q['content'],'prod':q.get('passedProduct',''),'result':'正常' if q['result']=='OK' else '異常あり','note':q.get('remarks',''),'who':q.get('inspectorName','')} for q in recs]})
three('metal-xray-detection', lambda:[mx(r, r['approvalStatus']) for r in L('admin__features__data-search-metal-xray-detection__mockRecords')['machineSearchRecords']],
      lambda:[mx(r, conf_st(r)) for r in L('admin__features__confirmations-metal-xray-detection__mockData')['machineConfirmationRecords']],
      lambda:[mx(r, r['approvalStatus']) for r in L('admin__features__approvals-metal-xray-detection__mockData')['machineApprovalRecords']])
# sample
def sm(r, st):
    v=[r['productName'], r.get('lotNumber',''), jp(r['expirationDate']), jp(r['manufactureDate']), r['sampleType'], r['sampleQuantity'], r['unit'], r['storageLocation'], r.get('remarks',''), r['status'], jp(r.get('discardedDate','')) or '—']
    return base(r, st, v, time=(r.get('timestamp','').split(' ')[-1] if r.get('timestamp') else '10:00'), note=r.get('remarks',''), x={'reason':r.get('discardReason',''),'reasonNote':r.get('discardReasonNote','')})
three('sample-management', lambda:[sm(r, r['approvalStatus']) for r in L('admin__features__data-search-sample-management__mockRecords')['sampleRecords']],
      lambda:[sm(r, conf_st(r)) for r in L('admin__features__confirmations-sample-management__mockData')['sampleConfirmationRecords']],
      lambda:[sm(r, r['approvalStatus']) for r in L('admin__features__approvals-sample-management__mockData')['sampleApprovalRecords']])
# equipment
RES={'ok':'正常','ng':'異常あり','skip':'見送り'}
def eq(r, st):
    sess=r.get('sessions') or []
    t = sess[0]['points'][0]['items'][0]['timestamp'].split(' ')[-1] if sess and sess[0].get('points') and sess[0]['points'][0]['items'] else '07:30'
    return base(r, st, [r['lineLabel'], RES.get(r['resultIcon'],'正常'), r.get('remarks','')], time=t, note=r.get('remarks',''), x={'sessions':[{'seg':s['segment'],'note':s.get('remarks',''),'points':[[p['location'],[[i['name'],i.get('status',''),i.get('timestamp',''),i.get('inspector','')] for i in p['items']]] for p in s.get('points',[])]} for s in sess],'comment':r.get('comment','')})
three('equipment-inspection', lambda:[eq(r, r['approvalStatus']) for r in L('admin__features__data-search-equipment__mockRecords')['inspectionRecords']],
      lambda:[eq(r, conf_st(r)) for r in L('admin__features__confirmations-equipment-inspection__mockData')['equipmentConfirmationRecords']],
      lambda:[eq(r, r['approvalStatus']) for r in L('admin__features__approvals-equipment-inspection__mockData')['equipmentApprovalRecords']])
# cleaning
def cl(r, st):
    pts=r.get('cleaningPoints') or r.get('locations') or []
    t = pts[0]['items'][0].get('timestamp','2025/04/01 17:00').split(' ')[-1] if pts and pts[0].get('items') else '17:00'
    return base(r, st, [r['lineLabel'], '清掃済' if r['cleaned'] else '未清掃', r.get('remarks','')], time=t, note=r.get('remarks',''), x={'detail':r.get('detailRemarks',''),'points':[[p.get('location') or p.get('name',''),[[i['name'], bool(i.get('cleaned', True)), i.get('timestamp',''), i.get('inspector','')] for i in p.get('items',[])]] for p in pts]})
three('cleaning-record', lambda:[cl(r, r['approvalStatus']) for r in L('admin__features__data-search-cleaning-record__mockRecords')['mockRecords']],
      lambda:[cl(r, conf_st(r)) for r in L('admin__features__confirmations-cleaning-record__mockData')['cleaningConfirmationRecords']],
      lambda:[cl(r, r.get('approvalStatus','pending')) for r in L('admin__features__approvals-cleaning-record__mockData')['cleaningApprovalRecords']])
# chemical / additive
def stock(r, st, nameKey):
    return base(r, st, [r[nameKey], r['type'], r['quantity'], r['currentStock'], r['storageLocation'], r.get('remarks','')], note=r.get('remarks',''), x={'prev':r.get('previousStock','')})
three('chemical-management', lambda:[stock(r, r['approvalStatus'],'chemicalName') for r in L('admin__features__data-search-chemical-management__mockRecords')['chemicalRecords']],
      lambda:[stock(r, conf_st(r),'chemicalName') for r in L('admin__features__confirmations-chemical-management__mockData')['chemicalConfirmationRecords']],
      lambda:[stock(r, r['approvalStatus'],'chemicalName') for r in L('admin__features__approvals-chemical-management__mockData')['chemicalApprovalRecords']])
three('additive-management', lambda:[stock(r, r['approvalStatus'],'additiveName') for r in L('admin__features__data-search-additive-management__mockRecords')['additiveRecords']],
      lambda:[stock(r, conf_st(r),'additiveName') for r in L('admin__features__confirmations-additive-management__mockData')['additiveConfirmationRecords']],
      lambda:[stock(r, r['approvalStatus'],'additiveName') for r in L('admin__features__approvals-additive-management__mockData')['additiveApprovalRecords']])
MK['rx']=RX
# 帳票管理（LX）
FQ={'daily':'毎日','weekly':'毎週','monthly':'毎月','yearly':'毎年'}
e=L('admin__features__equipment-inspection__mockData')
MK['lx']={
 'eqLines':[{'id':l['id'],'name':l['name'],'freq':FQ[l['frequency']],'from':jp(l.get('displayFrom','')),'to':jp(l.get('displayTo','')),'pts':[[p['location'],p['items']] for p in (l.get('inspectionPoints') or [])]} for l in e['initialLines']],
 'eqCheck':[c['text'] for c in e['initialChecklistItems']],
 'clLines':[{'id':l['id'],'name':l['name'],'freq':FQ[l['frequency']],'from':jp(l.get('displayFrom','')),'to':jp(l.get('displayTo','')),'pts':[[p['location'],p['items']] for p in (l.get('cleaningPoints') or [])]} for l in L('admin__features__cleaning-record__mockData')['initialLines']],
 'scales':[{'id':s['id'],'name':s['label'],'serial':s['serialNumber'],'cap':str(s['weightCapacity']),'post':s['postId'].replace('post-',''),'repair':s.get('repairStatus') or '','from':jp(s.get('displayFrom','')),'to':jp(s.get('displayTo',''))} for s in L('admin__features__scale-inspection__mockData')['initialScaleInspectionScales']],
 'machines':[{'id':m['id'],'name':m['name'],'md':m.get('metalDetectorName','') if m.get('recordMetalDetector') else '','xr':m.get('xrayDetectorName','') if m.get('recordXrayDetector') else '','wc':m.get('weightCheckerName','') if m.get('recordWeightChecker') else '','seal':m.get('sealingName','') if m.get('recordSealing') else '','prods':m.get('mainPassProducts',[]),'from':jp(m.get('displayFrom','')),'to':jp(m.get('displayTo',''))} for m in L('admin__features__metal-xray-detection__mockData')['MACHINES']],
 'samples':[{'id':p['id'],'name':p['name'],'mfg':jp(p.get('manufactureDate','')),'lot':p.get('lotNumber','')} for p in L('admin__features__sample-management__mockData')['SAMPLE_TARGET_PRODUCTS']],
}
POSTN={'additive':'添加物','pudding':'プリン','topping':'トッピング','ice':'アイス','catalana':'カタラーナ'}
for s in MK['lx']['scales']: s['post']=POSTN[s['post']]
js='/* ---- React 実装の見本データを写したもの（管理画面：src/admin/data、src/admin/features/**/mockData.ts・mockRecords.ts、アプリ：src/app/data/pendingReviews.ts、水：src/app/features/water-inspection/mockData.ts）。\n   .claude/mk-gen.py（scratchpad）で JSON から変換して貼り込んだ。React 側が変わったら同じ変換で作り直す。手で直すより React を直してから写す ---- */\nconst MK = '+json.dumps(MK,ensure_ascii=False,separators=(',',':'))+';\n'
open(os.environ['SP']+'/mk.js','w',encoding='utf-8').write(js)
print(len(js), 'bytes'); print({k:(len(v) if isinstance(v,list) else '') for k,v in MK.items()}); print({k:{kk:len(vv) for kk,vv in v.items()} for k,v in RX.items()})
