/**
 * 画面上コーチマークの「どこに・何を出すか」を決めるロジック（DOM を読むだけで、描画はしない）。
 *
 * 今見ている画面の DOM から、ユーザーが触る「機能」のかたまりを見つけて番号を振る:
 *   サイドメニュー / ヘッダー / 画面タイトル / パンくず / 検索・絞り込み / タブ・月送り /
 *   一覧（表・リスト） / 操作列 / ステータス / 主なボタン / 入力欄 / コメント / ページ送り /
 *   点検の事前準備（「点検予定」「確認項目の設定」の入口カード）
 *
 * 見つけ方は 2 段構え:
 *   1. 共通部品に付けた印 `data-nq-part="..."`（PageTitleBar, Breadcrumb, AdminSidebar など）
 *   2. 印が無いものは要素の種類やラベル文字から推定（table, [role=tablist], 「絞り込み検索」ボタン …）
 *
 * そのうえで、screenDescriptions.ts の箇条書き（points）を各マークに振り分ける。
 *   - 「登録」のように 「」で囲まれた語があれば、その文字のボタンに付ける
 *   - それ以外は「検索」「タブ」「一覧」「操作列」などの語で振り分ける
 * どのマークにも当てはまらなかった箇条書きは leftoverPoints として返し、説明カードに載せる。
 *
 * 画面ごとに手で位置を指定したいときは、screenDescriptions.ts の marks（CoachMarkSpec）に書く。
 * 手で書いたものは自動検出より優先し、同じ要素を指していれば自動のほうを置き換える。
 */
import type { CoachMarkSpec, ScreenDescription } from "./screenDescriptions";

export type CoachMarkKind =
  | "nav"
  | "header"
  | "title"
  | "breadcrumb"
  | "filter"
  | "tabs"
  | "month"
  | "table"
  | "list"
  | "actions"
  | "status"
  | "button"
  | "form"
  | "comments"
  | "pagination"
  | "prep"
  | "custom";

export type CoachMark = {
  /** 同じ画面で再検出したときに「同じマーク」と見なすためのキー */
  id: string;
  kind: CoachMarkKind;
  el: HTMLElement;
  title: string;
  body: string;
  /** 画面説明の箇条書きのうち、この部分に当てはまったもの */
  points: string[];
};

export type CoachMarkDetection = {
  marks: CoachMark[];
  /** どのマークにも振り分けられなかった箇条書き */
  leftoverPoints: string[];
};

/** コーチマーク UI 自身に付ける印。検出対象から外す */
export const COACH_OWN_ATTR = "data-nq-coach";

/** 検出対象から外す領域（自分自身・フィードバック UI・動作デモのオーバーレイ） */
const EXCLUDE_SELECTOR = `[${COACH_OWN_ATTR}], [data-nq-feedback], #nq-demo-overlay, #nq-demo-panel`;

/** 一覧のステータス表示としてよく出る語。これが単独で入っている小さな要素を「ステータス」と見なす */
const STATUS_WORDS = [
  "承認待ち",
  "承認済み",
  "差し戻し",
  "点検済み",
  "未点検",
  "点検中",
  "確認完了",
  "確認待ち",
  "確認済み",
  "提出済み",
  "未提出",
  "下書き",
  "対応中",
  "未対応",
  "完了",
];

const MAX_MARKS = 14;

/* ───────────────────────── 小さなヘルパー ───────────────────────── */

function textOf(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function isExcluded(el: Element): boolean {
  return !!el.closest(EXCLUDE_SELECTOR);
}

/** 画面に描かれていて、面積がある要素か */
function isVisible(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (isExcluded(el)) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  if (!style) return true;
  return style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
}

function q<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector)).filter((el) => isVisible(el)) as T[];
}

function first(root: ParentNode, selector: string): HTMLElement | null {
  return q(root, selector)[0] ?? null;
}

/** 文書順（≒ 上から下・左から右）に並べる */
function byDocumentOrder(a: Element, b: Element): number {
  if (a === b) return 0;
  const pos = a.compareDocumentPosition(b);
  if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

/** 重複を除いて「・」でつなぐ。空なら "" */
function joinUnique(items: string[], max = 8): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const s = raw.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= max) break;
  }
  const more = new Set(items.map((s) => s.trim()).filter(Boolean)).size - out.length;
  return out.join("・") + (more > 0 ? " など" : "");
}

/** 表示ラベル。件数バッジ（「承認申請管理」の横の 12 など）は説明文に混ぜない */
function labelOf(el: Element | null | undefined): string {
  if (!el) return "";
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[data-nq-part="badge"]').forEach((b) => b.remove());
  // 印を付けていないバッジ対策: 数字だけの小さな要素は落とす（他に文字が残る場合のみ）
  clone.querySelectorAll("*").forEach((child) => {
    if (child.children.length === 0 && /^\d{1,3}$/.test((child.textContent ?? "").trim())) child.remove();
  });
  const text = textOf(clone);
  return text || textOf(el).replace(/\s*\d{1,3}$/, "");
}

/** ボタンの見た目の文字。文字が無いときは aria-label / title / 中の画像の alt */
function buttonLabel(el: Element): string {
  const text = labelOf(el);
  if (text) return text;
  const aria = el.getAttribute("aria-label") || el.getAttribute("title");
  if (aria) return aria;
  const img = el.querySelector("img[alt]");
  return img?.getAttribute("alt") ?? "";
}

/** 入力欄の名前。<label> の文字 → placeholder → aria-label の順に探す */
function fieldLabel(el: HTMLElement): string {
  const id = el.getAttribute("id");
  if (id) {
    const label = el.ownerDocument.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label) return textOf(label);
  }
  const wrapping = el.closest("label");
  if (wrapping) {
    const t = textOf(wrapping);
    if (t) return t;
  }
  const placeholder = el.getAttribute("placeholder") || el.getAttribute("aria-label");
  if (placeholder) return placeholder;
  // Pulldown（div）の場合は中のボタンの文字
  if (el.matches('[data-nq-part="pulldown"]')) return textOf(el.querySelector("button"));
  return "";
}

/** a と b の共通の祖先のうち、いちばん近いもの */
function commonAncestor(a: Element, b: Element): HTMLElement | null {
  let node: Element | null = a;
  while (node) {
    if (node.contains(b)) return node as HTMLElement;
    node = node.parentElement;
  }
  return null;
}

/** 「登録」「保存」のように 「」で囲まれた語を取り出す */
function quotedWords(text: string): string[] {
  const out: string[] = [];
  const re = /「([^」]{1,20})」/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[1]);
  return out;
}

/* ───────────────────────── 検出 ───────────────────────── */

type Candidate = Omit<CoachMark, "points">;

type RowsResult = {
  kind: "table" | "list";
  container: HTMLElement;
  /** データ行の数（見出し行は含まない） */
  rowCount: number;
  /** 見出し行のセルの文字（div の表のとき） */
  headers: string[];
  /** 行の中のボタンが入っているセル（操作列）。無ければ null */
  actionCell: HTMLElement | null;
  actionLabels: string[];
  /** 行そのものがボタン/リンクか（アプリ側のリスト） */
  clickable: boolean;
};

/** 見出し行によく出る語。これを含む行を見出し行と見なす */
const HEADER_WORDS = /操作|ステータス|日付|日時|名|番号|区分|数量|場所|備考|実施者|確認者|承認者|結果|状態|工場|項目/;

/**
 * <table> を使わない一覧を見つける。
 * 「同じ形（同じタグ・同じセル数）の子要素が 2 つ以上、縦に並んでいる」要素を行の並びと見なし、
 * いちばん大きいものを返す。セルが 3 つ以上なら表、そうでなければリスト。
 */
function detectRows(root: ParentNode, exclude: HTMLElement | null): RowsResult | null {
  const isField = (el: Element) => !!el.querySelector("input, textarea, select, [data-nq-part='pulldown']");
  let best: { score: number; result: RowsResult } | null = null;

  const containers = Array.from(root.querySelectorAll<HTMLElement>("div, ul, ol, section")).filter((c) => {
    if (c.childElementCount < 2 || c.childElementCount > 400) return false;
    if (c.closest("nav, header, table, [role=tablist], dialog")) return false;
    if (exclude && (exclude.contains(c) || c.contains(exclude))) return false;
    if (isExcluded(c)) return false;
    const rect = c.getBoundingClientRect();
    return rect.width >= 240 && rect.height >= 40;
  });

  for (const container of containers) {
    const children = Array.from(container.children).filter((ch) => isVisible(ch)) as HTMLElement[];
    if (children.length < 2) continue;

    // いちばん多い「タグ:セル数」の形を行の形とする
    const sig = (el: Element) => `${el.tagName}:${el.childElementCount}`;
    const counts = new Map<string, number>();
    for (const ch of children) counts.set(sig(ch), (counts.get(sig(ch)) ?? 0) + 1);
    const [rowSig, rowNum] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    const cellCount = Number(rowSig.split(":")[1]);
    const rows = children.filter((ch) => sig(ch) === rowSig);

    // 行っぽくないものを外す: 行が高すぎる・低すぎる / 入力欄の並び（フォーム）
    if (rowNum < 2) continue;
    const heights = rows.map((r) => r.getBoundingClientRect().height);
    const widths = rows.map((r) => r.getBoundingClientRect().width);
    const cw = container.getBoundingClientRect().width;
    // 横に並んだカード（アプリの帳票一覧のような格子）。行より背が高く、3 つ以上あるものだけ
    const isGrid = widths.some((w) => w < cw * 0.6);
    if (isGrid) {
      if (rowNum < 3 || heights.some((h) => h < 56 || h > 400)) continue;
      if (!rows.every((r) => r.matches("button, a") || !!r.querySelector("button, a"))) continue;
    } else if (heights.some((h) => h < 20 || h > 200)) continue;
    if (rows.filter(isField).length > rows.length / 2) continue;
    if (cellCount === 0 && rows.some((r) => !textOf(r))) continue;

    const isTable = !isGrid && cellCount >= 3;
    // 見出し行: 先頭の子で、セルの文字が短く、見出しらしい語を含む
    let headers: string[] = [];
    let dataRows = rows;
    const head = children[0];
    if (isTable && head.childElementCount >= 3) {
      const cells = Array.from(head.children).map(textOf);
      const looksHeader = cells.every((t) => t.length <= 10) && cells.some((t) => HEADER_WORDS.test(t)) && !head.querySelector("button, a, input");
      if (looksHeader) {
        headers = cells.filter(Boolean);
        dataRows = rows.filter((r) => r !== head);
      }
    }
    if (isTable && headers.length === 0) {
      // 見出し行が無い表は、セル数が多い「カード」の可能性が高いので、行数で判断する
      if (dataRows.length < 3) continue;
    }

    const rowsRect = container.getBoundingClientRect();
    const score = rowsRect.width * rowsRect.height * (isTable ? 2 : 1);
    if (best && best.score >= score) continue;

    let actionCell: HTMLElement | null = null;
    const actionLabels: string[] = [];
    if (isTable) {
      for (const r of dataRows) {
        const btn = r.querySelector("button, a");
        if (btn) {
          if (!actionCell) {
            let cell: HTMLElement = btn as HTMLElement;
            while (cell.parentElement && cell.parentElement !== r) cell = cell.parentElement;
            actionCell = cell;
          }
          r.querySelectorAll("button, a").forEach((b) => actionLabels.push(buttonLabel(b)));
        }
      }
    }
    const clickable = !isTable && dataRows.every((r) => r.matches("button, a") || !!r.querySelector("button, a"));

    best = {
      score,
      result: { kind: isTable ? "table" : "list", container, rowCount: dataRows.length, headers, actionCell, actionLabels, clickable },
    };
  }

  // 見出し行だけで「該当するデータがありません」と出ている空の表
  if (!best) {
    const empty = q(root, "p").find((p) => /ありません|まだ.*ありません/.test(textOf(p)) && textOf(p).length <= 30 && !p.closest("nav, header, dialog"));
    const head = empty?.previousElementSibling;
    if (empty && head && head.childElementCount >= 3 && !head.querySelector("button, input")) {
      const cells = Array.from(head.children).map(textOf);
      if (cells.some((t) => HEADER_WORDS.test(t)) && empty.parentElement) {
        return { kind: "table", container: empty.parentElement, rowCount: 0, headers: cells.filter(Boolean), actionCell: null, actionLabels: [], clickable: false };
      }
    }
  }

  return best?.result ?? null;
}

function detectAuto(doc: Document, isAdmin: boolean, isHome: boolean, scope?: HTMLElement): Candidate[] {
  // ポップアップが出ているときは、その中だけを案内する（裏の画面は幕の下で触れないため）
  const root: ParentNode = scope ?? doc.getElementById("root") ?? doc.body;
  const out: Candidate[] = [];
  const push = (c: Candidate | null | undefined) => {
    if (c && !out.some((o) => o.el === c.el)) out.push(c);
  };

  /* メニュー（ホームでだけ案内する。どの画面にも出るので、他の画面では説明が冗長になる） */
  const sidebar = first(root, '[data-nq-part="admin-sidebar"]');
  const rail = first(root, '[data-nq-part="app-rail"]');
  const nav = sidebar ?? rail ?? q(root, "nav").find((n) => !n.closest("table, main")) ?? null;
  if (nav && isHome) {
    const items = q(nav, "a, button").map(buttonLabel).filter(Boolean);
    const list = joinUnique(items, 10);
    push({
      id: "nav",
      kind: "nav",
      el: nav,
      title: isAdmin ? "サイドメニュー" : "メニュー",
      body:
        (isAdmin
          ? "機能を切り替えるメニューです。ログイン中の権限（管理者・承認者・確認者）で並ぶ項目が変わり、今いる機能が濃く表示されます。"
          : "アプリの機能を切り替える左のメニューです。数字のバッジは未対応の件数です。") + (list ? `\n項目: ${list}` : ""),
    });
  }

  /* ヘッダー（管理画面）。メニューと同じく、ホームでだけ案内する */
  const header = first(root, '[data-nq-part="admin-header"]');
  if (header && isHome) {
    const account = textOf(header.querySelector('[data-nq-part="account"]'));
    push({
      id: "header",
      kind: "header",
      el: header,
      title: "ヘッダー",
      body: `右上の名前${account ? `（${account}）` : ""}を押すと、アカウント情報の確認やログアウトができます。`,
    });
  }

  /* 画面タイトル（PageTitleBar / AppHeader / 最初の h1） */
  const titleBar = first(root, '[data-nq-part="page-title"]') ?? first(root, "h1");
  if (titleBar) {
    const back = titleBar.querySelector('[data-nq-part="back"]');
    const heading = textOf(titleBar.querySelector("h1") ?? titleBar);
    push({
      id: "title",
      kind: "title",
      el: titleBar,
      title: heading ? `画面タイトル「${heading}」` : "画面タイトル",
      body: back ? "左の矢印を押すと前の画面に戻れます。" : "",
    });
  }

  /* パンくず */
  const crumb = first(root, '[data-nq-part="breadcrumb"]');
  if (crumb) {
    const trail = q(crumb, "a, span").map(textOf).filter((t) => t && t !== "›");
    push({
      id: "breadcrumb",
      kind: "breadcrumb",
      el: crumb,
      title: "パンくず",
      body: `今いる場所です。緑色の文字を押すと上の階層に戻れます。${trail.length ? `\n${joinUnique(trail, 6).replace(/・/g, " › ")}` : ""}`,
    });
  }

  /* 点検の事前準備（「点検予定」「確認項目の設定」などの入口カード）。
     帳票管理の各機能で、一覧の上に同じ形で置かれている */
  const PREP_LABEL = /^(点検予定|確認項目の設定|確認項目設定|点検項目の設定)$/;
  const prepLinks = q(root, "a, button").filter(
    (el) => PREP_LABEL.test(buttonLabel(el)) && !el.closest("table, nav, header, [role=tablist], dialog"),
  );
  if (prepLinks.length) {
    const labels = prepLinks.map(buttonLabel);
    const container =
      (prepLinks.length > 1 ? commonAncestor(prepLinks[0], prepLinks[prepLinks.length - 1]) : prepLinks[0].parentElement) ??
      prepLinks[0];
    const lines = [
      labels.includes("点検予定") ? "「点検予定」で、いつ・どこを点検するかの予定を組みます。" : "",
      labels.some((l) => /確認項目|点検項目/.test(l)) ? "「確認項目の設定」で、点検のときに確認する項目を登録します。" : "",
    ].filter(Boolean);
    push({
      id: "prep",
      kind: "prep",
      el: container,
      title: "点検の事前準備",
      body: `点検を始める前の準備をする入口です。${lines.length ? `\n${lines.join("\n")}` : ""}`,
    });
  }

  /* 検索・絞り込み */
  const filterToggle = q(root, "button").find((b) => /^絞り込み検索/.test(textOf(b)));
  let filterEl: HTMLElement | null = null;
  if (filterToggle) {
    filterEl = filterToggle.parentElement ?? filterToggle;
    const fields = q(filterEl, 'input:not([type="checkbox"]):not([type="hidden"]), select, [data-nq-part="pulldown"], textarea');
    const names = fields.map(fieldLabel).filter(Boolean);
    const checks = q(filterEl, 'label:has(input[type="checkbox"])').map(textOf).filter(Boolean);
    const opened = fields.length > 0 || checks.length > 0;
    push({
      id: "filter",
      kind: "filter",
      el: filterEl,
      title: "絞り込み検索",
      body: opened
        ? `条件を入れて「検索」を押すと一覧が絞られます。「リセット」で条件を消せます。${names.length ? `\n条件: ${joinUnique(names)}` : ""}${checks.length ? `\nチェック: ${joinUnique(checks)}` : ""}`
        : "「絞り込み検索」を押すと条件の入力欄が開き、日付や名前などで一覧を絞れます。",
    });
  } else {
    // placeholder に「検索」と入っている欄だけを検索欄と見なす（「名」で拾うと住所欄の例文などを誤検出した）
    const search = q<HTMLInputElement>(root, 'input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').find((i) => !i.closest("table"));
    if (search) {
      filterEl = search.closest("form") ?? search.parentElement ?? search;
      push({
        id: "filter",
        kind: "filter",
        el: filterEl,
        title: "検索",
        body: `${search.placeholder ? `「${search.placeholder}」に` : ""}文字を入れると、一覧がその文字を含むものに絞られます。`,
      });
    }
  }

  /* タブ */
  const tablist = first(root, '[role="tablist"]');
  if (tablist) {
    const tabs = q(tablist, '[role="tab"], button, a').map(labelOf).filter(Boolean);
    push({
      id: "tabs",
      kind: "tabs",
      el: tablist,
      title: "タブ",
      body: `押すと表示する内容が切り替わります。${tabs.length ? `\nタブ: ${joinUnique(tabs, 12)}` : ""}`,
    });
  }

  /* 月送り（「2026年9月」の左右に矢印ボタン） */
  const monthLabel = q(root, "p, span, h2, h3").find((el) => /^\d{4}年\s?\d{1,2}月/.test(textOf(el)) && el.children.length === 0);
  if (monthLabel) {
    const row = monthLabel.parentElement;
    if (row && q(row, "button").length >= 1) {
      push({
        id: "month",
        kind: "month",
        el: row,
        title: "対象の月",
        body: `今表示している月です（${textOf(monthLabel)}）。左右の矢印で前後の月に移れます。`,
      });
    }
  }

  /* 一覧（表） */
  const table = first(root, "table");
  if (table) {
    const heads = q(table, "thead th, thead td").map(textOf).filter(Boolean);
    const rows = q(table, "tbody tr").length;
    push({
      id: "table",
      kind: "table",
      el: table,
      title: "一覧",
      body: `${rows > 0 ? "条件に合う記録が行で並びます。" : "条件に合うものがまだありません。"}${heads.length ? `\n列: ${joinUnique(heads, 12)}` : ""}`,
    });

    /* 操作列（表の中のボタン） */
    const cellButtons = q(table, "tbody td button, tbody td a").filter((b) => !b.closest("th"));
    if (cellButtons.length) {
      const cell = cellButtons[0].closest("td") ?? cellButtons[0];
      const labels = cellButtons.map(buttonLabel).filter(Boolean);
      push({
        id: "actions",
        kind: "actions",
        el: cell as HTMLElement,
        title: "操作列",
        body: `行ごとのボタンで、その記録に対する操作をします。${labels.length ? `\nボタン: ${joinUnique(labels, 6)}` : ""}`,
      });
    }
  }

  /* 一覧（<table> を使わず div の行を並べた表。このリポジトリの一覧はほぼこの作り）と、
     アプリ側の「行ボタンの並び」のようなリスト */
  if (!table) {
    const rows = detectRows(root, filterEl);
    if (rows) {
      if (rows.kind === "table") {
        push({
          id: "table",
          kind: "table",
          el: rows.container,
          title: "一覧",
          body: `${rows.rowCount > 0 ? "条件に合う記録が行で並びます。" : "条件に合うものがまだありません。"}${
            rows.headers.length ? `\n列: ${joinUnique(rows.headers, 12)}` : ""
          }`,
        });
        if (rows.actionCell) {
          push({
            id: "actions",
            kind: "actions",
            el: rows.actionCell,
            title: "操作列",
            body: `行ごとのボタンで、その記録に対する操作をします。${rows.actionLabels.length ? `\nボタン: ${joinUnique(rows.actionLabels, 6)}` : ""}`,
          });
        }
      } else {
        push({
          id: "list",
          kind: "list",
          el: rows.container,
          title: "一覧",
          body: `条件に合うものが並びます。${rows.clickable ? "行を押すと次の画面に進みます。" : ""}`,
        });
      }
    }
  }

  /* ステータス */
  const statusEls = q(root, "span, td, div, p").filter((el) => {
    if (el.children.length > 0) return false;
    if (!STATUS_WORDS.includes(textOf(el))) return false;
    if (el.closest("nav, header, button")) return false;
    const rect = el.getBoundingClientRect();
    return rect.width < 200 && rect.height < 60;
  });
  if (statusEls.length) {
    const inList = statusEls.filter((el) => el.closest("table, ul, ol"));
    const target = (inList[0] ?? statusEls[0]) as HTMLElement;
    const kinds = statusEls.map(textOf);
    push({
      id: "status",
      kind: "status",
      el: target,
      title: "ステータス",
      body: `今どの段階にあるかを示します。${kinds.length ? `\nこの画面に出ている種類: ${joinUnique(kinds, 6)}` : ""}`,
    });
  }

  /* 主なボタン（表・メニュー・絞り込みの外にある、緑や赤のボタン） */
  const primaryLike = (el: Element) => /bg-\[var\(--semantic-brand-(primary|danger)\)\]/.test(el.className);
  const buttons = q(root, 'button, a[class*="rounded"]').filter((b) => {
    if (b.closest("table, nav, header, [role=tablist], dialog")) return false;
    if (filterEl && filterEl.contains(b)) return false;
    if (titleBar && titleBar === b) return false;
    const label = buttonLabel(b);
    if (/^\d+$/.test(label)) return false; // ページ番号のボタン
    return label.length >= 1 && label.length <= 14 && primaryLike(b);
  });
  buttons.slice(0, 4).forEach((b, i) => {
    const label = buttonLabel(b);
    push({
      id: `button:${label}:${i}`,
      kind: "button",
      el: b,
      title: `「${label}」ボタン`,
      body: /danger/.test(b.className) ? "取り消し・削除など、慎重に行う操作です。" : "この画面の主な操作です。",
    });
  });

  /* 入力欄（絞り込み・表の外にある入力欄のまとまり） */
  const fields = q(root, 'input:not([type="hidden"]), textarea, select, [data-nq-part="pulldown"]').filter((f) => {
    if (f.closest("table, nav, header, dialog, [data-nq-part=\"pulldown\"] *")) return false;
    if (filterEl && filterEl.contains(f)) return false;
    return true;
  });
  if (fields.length >= 1) {
    const form = fields[0].closest("form");
    let container: HTMLElement | null = form;
    if (!container) {
      container = fields.length > 1 ? commonAncestor(fields[0], fields[fields.length - 1]) : fields[0].parentElement;
      // 共通の祖先が画面全体になってしまったら、最初の入力欄の近くまで戻す
      if (container && (container.tagName === "MAIN" || container.tagName === "BODY" || container.id === "root")) {
        container = fields[0].closest("section, fieldset, form, div") as HTMLElement | null;
      }
    }
    if (container) {
      const names = fields.map(fieldLabel).filter(Boolean);
      const required = names.filter((n) => /\*|必須/.test(n)).length;
      push({
        id: "form",
        kind: "form",
        el: container,
        title: fields.length === 1 ? "入力欄" : "入力欄",
        body: `この画面の項目を入力・選択します。${required ? "「*」が付いた項目は必須です。" : ""}${names.length ? `\n項目: ${joinUnique(names.map((n) => n.replace(/\s*\*$/, "")), 10)}` : ""}`,
      });
    }
  }

  /* コメント */
  const commentsMarked = first(root, '[data-nq-part="comments"]');
  const commentsHeading = commentsMarked ?? q(root, "h2, h3, h4, p").find((h) => /^コメント/.test(textOf(h)) && h.children.length === 0)?.parentElement ?? null;
  if (commentsHeading) {
    push({
      id: "comments",
      kind: "comments",
      el: commentsHeading,
      title: "コメント",
      body: "確認・承認・差し戻しのときのやり取りが時系列で残ります。入力欄があれば、ここから新しいコメントを書けます。",
    });
  }

  /* ポップアップの中を案内しているとき（scope あり）。
     ポップアップは見出し・選択肢・下部のボタンという決まった形なので、
     画面用の細かい規則（緑のボタンだけ拾う等）ではなく、この形に合わせて拾う */
  if (scope) {
    const heading = q(root, "h1, h2, h3").find((h) => textOf(h).length > 0);
    if (heading) {
      push({ id: "popup-title", kind: "title", el: heading, title: textOf(heading), body: "" });
    }

    const popupButtons = q(root, "button").filter((b) => {
      const rect = b.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && buttonLabel(b).length > 0;
    });

    // 選択肢のかたまり（同じ親に 3 つ以上ボタンが並んでいるところ）
    const groups = new Map<HTMLElement, HTMLElement[]>();
    for (const b of popupButtons) {
      const parent = b.parentElement;
      if (!parent) continue;
      groups.set(parent, [...(groups.get(parent) ?? []), b]);
    }
    let choices: HTMLElement | null = null;
    let choiceItems: HTMLElement[] = [];
    for (const [parent, items] of groups) {
      if (items.length >= 3 && items.length > choiceItems.length) {
        choices = parent;
        choiceItems = items;
      }
    }
    if (choices) {
      push({
        id: "popup-choices",
        kind: "list",
        el: choices,
        title: "選択肢",
        body: `押して選びます。\n例: ${joinUnique(choiceItems.map((b) => buttonLabel(b).split("\n")[0]), 6)}`,
      });
    }

    // 下部のボタン（閉じる・次へ・登録 など）。選択肢のかたまりの中は除く
    popupButtons
      .filter((b) => !choices || !choices.contains(b))
      .filter((b) => buttonLabel(b).length <= 14)
      .slice(0, 4)
      .forEach((b, i) => {
        const label = buttonLabel(b);
        push({
          id: `popup-button:${label}:${i}`,
          kind: "button",
          el: b,
          title: `「${label}」ボタン`,
          body: /閉じる|キャンセル|戻る/.test(label)
            ? "このポップアップを閉じて、元の画面に戻ります。"
            : /破棄|削除/.test(label)
              ? "取り消せない操作です。内容を確かめてから押してください。"
              : "このポップアップの主な操作です。",
        });
      });
  }

  /* ページ送り。
     ポップアップの「閉じる / 次へ」をページ送りと間違えないよう、ボタンから探すときは
     前後の組になっているか「1 / 4」のようなページ表示があるものだけを見る */
  const pagerBox = (() => {
    const btn = q(root, "button, a").find((b) => /^(次へ|前へ|次のページ|前のページ)$/.test(textOf(b)));
    const box = btn?.parentElement ?? null;
    if (!box) return null;
    const labels = q(box, "button, a").map(textOf);
    const hasPrev = labels.some((t) => /^(前へ|前のページ)$/.test(t));
    const hasNext = labels.some((t) => /^(次へ|次のページ)$/.test(t));
    const hasCount = /\d+\s*\/\s*\d+/.test(textOf(box));
    return (hasPrev && hasNext) || hasCount ? box : null;
  })();
  const pager = first(root, 'nav[aria-label*="ページ"], [data-nq-part="pagination"]') ?? pagerBox;
  if (pager) {
    push({ id: "pagination", kind: "pagination", el: pager, title: "ページ送り", body: "件数が多いときにページを切り替えます。" });
  }

  return out;
}

/** 手書きの位置指定（screenDescriptions.ts の marks）を要素に解決する */
function resolveSpecs(from: Document | HTMLElement, specs: CoachMarkSpec[]): Candidate[] {
  const root: ParentNode = from instanceof Document ? from.getElementById("root") ?? from.body : from;
  const out: Candidate[] = [];
  specs.forEach((spec, i) => {
    let el: HTMLElement | null = null;
    if (spec.target.startsWith("text:")) {
      const want = spec.target.slice(5).trim();
      el = q(root, "button, a, [role=tab], h1, h2, h3, label, th").find((c) => buttonLabel(c) === want) ?? null;
    } else {
      try {
        el = first(root, spec.target);
      } catch {
        el = null;
      }
    }
    if (el) out.push({ id: `custom:${i}`, kind: "custom", el, title: spec.title, body: spec.body });
  });
  return out;
}

/* ───────────────────────── 箇条書きの振り分け ───────────────────────── */

/** 語 → マークの種類。上から順に試す */
const POINT_RULES: { kinds: CoachMarkKind[]; re: RegExp }[] = [
  { kinds: ["prep"], re: /事前準備|点検予定|確認項目/ },
  { kinds: ["filter"], re: /検索|絞り込|絞る|絞れる/ },
  { kinds: ["tabs", "month"], re: /タブ/ },
  { kinds: ["month", "tabs"], re: /年と月|月ごと|月を切り替|前後の月/ },
  { kinds: ["actions"], re: /操作列|操作のボタン|ボタンで詳細|ボタンで、その/ },
  { kinds: ["status"], re: /ステータス|状態を把握|見分ける|印が付く/ },
  { kinds: ["comments"], re: /コメント/ },
  { kinds: ["pagination"], re: /ページ/ },
  { kinds: ["table", "list"], re: /一覧|列|並ぶ|表示され|件|カードを押|行を押|を押して.*へ進む/ },
  { kinds: ["form"], re: /必須|任意|入力|選ぶ|選択|記入|チェック/ },
  { kinds: ["nav"], re: /サイドメニュー|メニュー/ },
  { kinds: ["title"], re: /戻る|戻れる/ },
  { kinds: ["header"], re: /ヘッダー|右上|ログアウト|アカウント/ },
];

/**
 * メニュー・ヘッダーの説明を出す画面（ホーム）か。
 * どの画面にも出ている共通部分なので、入口のホームだけで案内する。
 */
export function isHomePath(pathname: string): boolean {
  return ["/", "/admin", "/admin/home", "/app", "/app/ledger-list"].includes(pathname.replace(/\/$/, "") || "/");
}

/**
 * 今の画面のコーチマークを組み立てる。
 * @param doc 対象の文書（動作デモの中なら iframe の document）
 */
export function detectCoachMarks(
  doc: Document,
  description: ScreenDescription | undefined,
  isAdmin: boolean,
  isHome: boolean,
  /** ポップアップが出ているとき、その土台。指定するとこの中だけを案内する */
  scope?: HTMLElement,
): CoachMarkDetection {
  const custom = description?.marks?.length ? resolveSpecs(scope ?? doc, description.marks) : [];
  const auto = detectAuto(doc, isAdmin, isHome, scope);

  // 手書きが同じ要素を指していたら自動のほうを外す
  const merged: Candidate[] = [...custom, ...auto.filter((a) => !custom.some((c) => c.el === a.el))];
  merged.sort((a, b) => byDocumentOrder(a.el, b.el));

  const marks: CoachMark[] = merged.slice(0, MAX_MARKS).map((c) => ({ ...c, points: [] }));

  // 概要は画面タイトルのマークに載せる（タイトルが無ければ先頭のマーク）
  const titleMark = marks.find((m) => m.kind === "title") ?? marks[0];
  if (titleMark && description?.summary) {
    titleMark.body = [description.summary, titleMark.body].filter(Boolean).join("\n");
  }

  const leftoverPoints: string[] = [];
  for (const point of description?.points ?? []) {
    let target: CoachMark | undefined;

    // 「登録」のような語 → その文字のボタン
    for (const word of quotedWords(point)) {
      target = marks.find((m) => (m.kind === "button" || m.kind === "custom") && buttonLabel(m.el) === word);
      if (target) break;
    }
    // 語からの推定
    if (!target) {
      for (const rule of POINT_RULES) {
        if (!rule.re.test(point)) continue;
        target = rule.kinds.map((k) => marks.find((m) => m.kind === k)).find(Boolean);
        if (target) break;
      }
    }
    if (target) target.points.push(point);
    else leftoverPoints.push(point);
  }

  return { marks, leftoverPoints };
}
