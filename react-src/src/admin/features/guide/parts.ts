/**
 * キャンバスに置ける「部品」。
 *
 * 区分と項目は設計ガイド（nqrepo-design-guide.html #styles）の「コンポーネント一覧」に
 * 揃えている。各部品の寸法・色・角丸はガイド各パネルに書かれた Figma「NQrepo UI Kit」の
 * 仕様値をそのまま Tailwind のクラスにしたもの（見た目の確認用なので動作はしない）。
 *
 * - フォントの W6 は `font-semibold`、W3 は `font-normal`（body が bold なので明示する）
 * - Tailwind はこのファイルも走査するので、ここに書いたクラスは必ず CSS に含まれる
 * - 1 部品 = ルート要素 1 つ（insertHtmlAt が firstElementChild しか拾わない）
 */
export type PartGroup = "基本" | "App + Admin 共通" | "App のみ" | "Admin のみ";

/** パレット上の簡易プレビューの形 */
export type PartPreview = "solid" | "outline" | "danger" | "input" | "tag" | "block" | "text" | "icon";

export type Part = {
  id: string;
  label: string;
  group: PartGroup;
  /** ガイドのコンポーネント名（一覧の見出し）。同じ名前で束ねて表示する */
  component: string;
  description: string;
  preview: PartPreview;
  html: string;
};

// ---------------------------------------------------------------------------
// 共通の値
// ---------------------------------------------------------------------------

const PRIMARY = "var(--semantic-brand-primary)"; // #009944
const DANGER = "var(--semantic-brand-danger)"; // #f34949
const TEXT = "var(--semantic-text-primary)"; // #333333
const TEXT2 = "var(--semantic-text-secondary)"; // #808080
const PAGE = "var(--semantic-background-page)"; // #f1efea
const SUCCESS = "var(--semantic-status-success)"; // #19c95f
const ERROR = "var(--semantic-status-error)"; // #f85c5c
const CAUTION = "var(--semantic-status-caution)"; // #dcaa14
const DONE = "var(--semantic-status-done)"; // #4b9ff8
const BORDER = "#d0d0d0";

/** ガイド「エレベーション」Level.1（First + Second Shadow） */
const ELEVATION_1 = "shadow-[0_2px_4px_1px_rgba(51,51,51,0.10),0_1px_5px_0_rgba(51,51,51,0.30)]";
/** Admin ボタン・アコーディオンの影 */
const SHADOW_4 = "shadow-[0_2px_4px_rgba(51,51,51,0.24)]";
/** ダイアログ・カードの影 */
const SHADOW_6 = "shadow-[0_2px_6px_rgba(51,51,51,0.24)]";

// ガイド「アイコン」（Figma 書き出し）の 24px 統一ストロークアイコン
const ICON_PATHS = {
  checkmark: `<path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" stroke-width="2.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  check: `<path d="M20 12C20 7.58173 16.4183 4.00001 12 4.00001C7.58172 4.00001 4 7.58173 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12ZM22 12C22 17.5229 17.5228 22 12 22C6.47715 22 2 17.5229 2 12C2 6.47716 6.47715 2.00001 12 2.00001C17.5228 2.00001 22 6.47716 22 12Z" fill="currentColor"/><path d="M15.748 9.15796C16.1386 8.76751 16.7716 8.76746 17.1621 9.15796C17.5525 9.54846 17.5525 10.1815 17.1621 10.572L11.5166 16.2175L11.4434 16.2839C11.2655 16.4295 11.0415 16.5095 10.8096 16.5095C10.5776 16.5094 10.3536 16.4297 10.1758 16.2839L10.1025 16.2175L7.33789 13.4519C6.94743 13.0614 6.94739 12.4283 7.33789 12.0378C7.7284 11.6474 8.36144 11.6474 8.75195 12.0378L10.8096 14.0955L15.748 9.15796Z" fill="currentColor"/>`,
  search: `<path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z" fill="currentColor"/>`,
  calendar: `<g transform="translate(2.25 2.25)"><path d="M5.75 2.75H1.75C1.48478 2.75 1.23043 2.85536 1.04289 3.04289C0.855357 3.23043 0.75 3.48478 0.75 3.75V17.75C0.75 18.0152 0.855357 18.2696 1.04289 18.4571C1.23043 18.6446 1.48478 18.75 1.75 18.75H17.75C18.0152 18.75 18.2696 18.6446 18.4571 18.4571C18.6446 18.2696 18.75 18.0152 18.75 17.75V3.75C18.75 3.48478 18.6446 3.23043 18.4571 3.04289C18.2696 2.85536 18.0152 2.75 17.75 2.75H16.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.75 2.75H13.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.75 0.75V4.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.75 0.75V4.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M0.75 8.25H14.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  arrowRight: `<path d="M6.885 19.145C6.39623 19.6338 6.39623 20.4262 6.885 20.915C7.37377 21.4038 8.16623 21.4038 8.655 20.915L16.2558 13.3142C17.0368 12.5332 17.0368 11.2668 16.2558 10.4858L8.655 2.885C8.16623 2.39623 7.37377 2.39623 6.885 2.885C6.39623 3.37377 6.39623 4.16623 6.885 4.655L14.13 11.9L6.885 19.145Z" fill="currentColor"/>`,
  arrowDown: `<path d="M4.58957 6.94999C4.1008 6.46121 3.30834 6.46121 2.81957 6.94999C2.3308 7.43876 2.3308 8.23121 2.81957 8.71999L10.4204 16.3208C11.2014 17.1018 12.4677 17.1018 13.2488 16.3208L20.8496 8.71999C21.3383 8.23121 21.3383 7.43876 20.8496 6.94998C20.3608 6.46121 19.5683 6.46121 19.0796 6.94998L13.2488 12.7808C12.4677 13.5618 11.2014 13.5618 10.4204 12.7808L4.58957 6.94999Z" fill="currentColor"/>`,
  pulldown: `<path d="M12.9422 18.4924C12.507 19.1887 11.493 19.1887 11.0578 18.4924L3.0625 5.7C2.59997 4.95994 3.13202 4 4.00472 4L19.9953 4C20.868 4 21.4 4.95995 20.9375 5.7L12.9422 18.4924Z" fill="currentColor"/>`,
  plus: `<path d="M10.5714 13.4286H3.42857C2.63959 13.4286 2 12.789 2 12C2 11.211 2.63959 10.5714 3.42857 10.5714H10.5714V3.42857C10.5714 2.63959 11.211 2 12 2C12.789 2 13.4286 2.63959 13.4286 3.42857V10.5714H20.5714C21.3604 10.5714 22 11.211 22 12C22 12.789 21.3604 13.4286 20.5714 13.4286H13.4286V20.5714C13.4286 21.3604 12.789 22 12 22C11.211 22 10.5714 21.3604 10.5714 20.5714V13.4286Z" fill="currentColor"/>`,
  minus: `<path d="M10.5714 13.4286H3.42857C2.63959 13.4286 2 12.789 2 12C2 11.2111 2.63959 10.5715 3.42857 10.5715H10.5714L13.4286 10.5715L20.5714 10.5715C21.3604 10.5715 22 11.2111 22 12C22 12.789 21.3604 13.4286 20.5714 13.4286H13.4286H10.5714Z" fill="currentColor"/>`,
  question: `<path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02945 16.9706 3.00001 12 3.00001C7.02944 3.00001 3 7.02945 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.8895 15.0498C11.2267 15.0498 10.6891 15.5761 10.6891 16.2251C10.6891 16.8735 11.2267 17.4 11.8895 17.4C12.5519 17.4 13.0893 16.8735 13.0893 16.2251C13.0893 15.5761 12.5519 15.0498 11.8895 15.0498Z" fill="currentColor"/><path d="M9.16551 7.94701L9.98269 8.58829C10.1491 8.71858 10.3874 8.71383 10.5481 8.57678C10.5481 8.57678 10.6485 8.39911 10.9631 8.22313C11.2793 8.04816 11.6895 7.9074 12.3025 7.90535C12.8373 7.90434 13.3037 8.0996 13.6219 8.36663C13.7798 8.4993 13.898 8.64681 13.9704 8.78282C14.0433 8.91923 14.0699 9.03865 14.0696 9.12933C14.0682 9.43593 14.0072 9.63662 13.9192 9.80716C13.8524 9.93508 13.7651 10.0481 13.6526 10.1577C13.4848 10.3222 13.2569 10.4742 13.0015 10.6139C12.7457 10.7547 12.4701 10.8792 12.1916 11.0295C11.874 11.2021 11.5374 11.4495 11.2891 11.821C11.165 12.0044 11.068 12.2149 11.0064 12.4362C10.9441 12.6585 10.916 12.891 10.916 13.1282C10.916 13.3814 10.916 13.5894 10.916 13.5894C10.916 13.8277 11.1137 14.0216 11.3575 14.0216H12.4207C12.6643 14.0216 12.8619 13.8277 12.8619 13.5894C12.8619 13.5894 12.8619 13.3814 12.8619 13.1282C12.8619 13.0368 12.8726 12.9776 12.883 12.9407C12.9004 12.8846 12.9103 12.8706 12.9393 12.8365C12.9685 12.804 13.0278 12.7546 13.137 12.6954C13.2965 12.6077 13.5529 12.4893 13.8434 12.3353C14.2783 12.1025 14.8068 11.7868 15.2526 11.2653C15.4741 11.0047 15.6701 10.6917 15.806 10.3309C15.9421 9.96984 16.016 9.5638 16.0154 9.12924C16.015 8.68898 15.8931 8.27037 15.6943 7.89913C15.395 7.34146 14.926 6.87717 14.3451 6.5401C13.7643 6.20473 13.0634 6.00002 12.3026 6.00002C11.365 5.99764 10.5858 6.23721 9.99799 6.56852C9.40751 6.89845 9.153 7.28253 9.153 7.28253C9.05381 7.36714 8.99783 7.48966 9.00006 7.6179C9.00291 7.74668 9.06319 7.86716 9.16551 7.94701Z" fill="currentColor"/>`,
  edit: `<path d="M4.59301 19.4055H5.90625L15.7404 9.56211L14.4272 8.24761L4.59301 18.091V19.4055ZM19.147 8.40914L15.5627 4.85415L16.9474 3.46814C17.2592 3.15604 17.6384 3 18.085 3C18.5316 3 18.9108 3.15604 19.2226 3.46814L20.5154 4.76214C20.8272 5.07423 20.9886 5.44834 20.9994 5.88445C21.0103 6.32056 20.8599 6.69466 20.5481 7.00675L19.147 8.40914ZM17.9951 9.57845L6.58431 21H3V17.4123L14.4108 5.99075L17.9951 9.57845Z" fill="currentColor"/>`,
  menu: `<g transform="translate(3 4)"><line y1="1.25" x2="18" y2="1.25" stroke="currentColor" stroke-width="2.5"/><line y1="7.75" x2="18" y2="7.75" stroke="currentColor" stroke-width="2.5"/><line y1="14.25" x2="18" y2="14.25" stroke="currentColor" stroke-width="2.5"/></g>`,
  home: `<path d="M11.5263 1.41809C11.8209 1.17778 12.2556 1.19524 12.5302 1.46984L23.0302 11.9698C23.3231 12.2627 23.3231 12.7375 23.0302 13.0304C22.7373 13.3233 22.2626 13.3233 21.9697 13.0304L21.2499 12.3107V21.5001C21.2499 22.4666 20.4664 23.2501 19.4999 23.2501H4.49994C3.53345 23.2501 2.74994 22.4666 2.74994 21.5001V12.3107L2.03022 13.0304C1.73732 13.3233 1.26256 13.3233 0.96967 13.0304C0.676777 12.7375 0.676777 12.2627 0.96967 11.9698L11.4697 1.46984L11.5263 1.41809ZM4.24994 10.8107V21.5001C4.24994 21.6382 4.36187 21.7501 4.49994 21.7501H19.4999C19.638 21.7501 19.7499 21.6382 19.7499 21.5001V10.8107L11.9999 3.06066L4.24994 10.8107Z" fill="currentColor"/><path d="M9 15V22.5H15V15C15 14.4477 14.5523 14 14 14H10C9.44772 14 9 14.4477 9 15Z" stroke="currentColor" stroke-linecap="round"/>`,
} as const;

type IconName = keyof typeof ICON_PATHS;

/** 24px 基準のアイコン。`size` は表示ピクセル */
function icon(name: IconName, size = 24, className = ""): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0 ${className}" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

// ---------------------------------------------------------------------------
// 部品の定義
// ---------------------------------------------------------------------------

export const PARTS: Part[] = [
  // =========================================================================
  // 基本
  // =========================================================================

  // ---- アイコン ------------------------------------------------------------
  {
    id: "icon-checkmark",
    label: "チェックマーク",
    group: "基本",
    component: "アイコン",
    description: "24px 統一ストロークのアイコン（Icon/ckeckmark）",
    preview: "icon",
    html: `<span class="inline-flex size-6 items-center justify-center text-[${TEXT}]">${icon("checkmark")}</span>`,
  },
  {
    id: "icon-search",
    label: "検索",
    group: "基本",
    component: "アイコン",
    description: "24px 統一ストロークのアイコン（Icon/search）",
    preview: "icon",
    html: `<span class="inline-flex size-6 items-center justify-center text-[${TEXT}]">${icon("search")}</span>`,
  },
  {
    id: "icon-calendar",
    label: "カレンダー",
    group: "基本",
    component: "アイコン",
    description: "24px 統一ストロークのアイコン（Icon/calendar）",
    preview: "icon",
    html: `<span class="inline-flex size-6 items-center justify-center text-[${TEXT}]">${icon("calendar")}</span>`,
  },
  {
    id: "icon-edit",
    label: "編集",
    group: "基本",
    component: "アイコン",
    description: "24px 統一ストロークのアイコン（Icon/edit）",
    preview: "icon",
    html: `<span class="inline-flex size-6 items-center justify-center text-[${TEXT}]">${icon("edit")}</span>`,
  },

  // ---- カラー ---------------------------------------------------------------
  {
    id: "color-swatches",
    label: "カラーパレット",
    group: "基本",
    component: "カラー",
    description: "セマンティックカラー 8 色のスウォッチ（brand / status / text）",
    preview: "block",
    html: `<div class="flex gap-2">
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${PRIMARY}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">primary</span></div>
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${DANGER}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">danger</span></div>
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${SUCCESS}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">success</span></div>
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${ERROR}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">error</span></div>
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${CAUTION}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">caution</span></div>
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${DONE}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">done</span></div>
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${TEXT}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">text</span></div>
<div class="flex flex-col items-center gap-1"><span class="size-12 rounded-lg bg-[${TEXT2}]"></span><span class="text-[10px] font-normal text-[${TEXT2}]">secondary</span></div>
</div>`,
  },

  // ---- ボタン ---------------------------------------------------------------
  {
    id: "button-app-solid-lg",
    label: "App Solid Large",
    group: "基本",
    component: "ボタン",
    description: "App / Button / Solid・Large：360×64・W6 20px。画面の主目的、1 画面 1 つ",
    preview: "solid",
    html: `<button type="button" class="inline-flex h-16 w-[360px] max-w-full items-center justify-center rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] px-4 py-2 text-[20px] font-semibold leading-none text-white">保存する</button>`,
  },
  {
    id: "button-app-outline-lg",
    label: "App Outline Large",
    group: "基本",
    component: "ボタン",
    description: "App / Button / Outline・Large：360×64・W6 20px。戻る・キャンセルなどの副アクション",
    preview: "outline",
    html: `<button type="button" class="inline-flex h-16 w-[360px] max-w-full items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white px-4 py-2 text-[20px] font-semibold leading-none text-[${PRIMARY}]">戻る</button>`,
  },
  {
    id: "button-app-solid-md",
    label: "App Solid Medium",
    group: "基本",
    component: "ボタン",
    description: "App / Button / Solid・Medium：240×64。ダイアログ・カードなど囲まれた領域の主アクション",
    preview: "solid",
    html: `<button type="button" class="inline-flex h-16 w-[240px] max-w-full items-center justify-center rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] px-4 py-2 text-[20px] font-semibold leading-none text-white">次へ</button>`,
  },
  {
    id: "button-app-outline-sm",
    label: "App Small",
    group: "基本",
    component: "ボタン",
    description: "App / Button / Outline・Small：96×44・W6 18px。リスト行やヘッダーなど高さに制限がある場所",
    preview: "outline",
    html: `<button type="button" class="inline-flex h-11 w-24 items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white p-3 text-[18px] font-semibold leading-none text-[${PRIMARY}]">編集</button>`,
  },
  {
    id: "button-admin-solid-xl",
    label: "Admin Solid ExtraLarge",
    group: "基本",
    component: "ボタン",
    description: "Admin / Button / Solid・ExtraLarge：400×48・W6 20px。フォーム送信・モーダル確定",
    preview: "solid",
    html: `<button type="button" class="inline-flex h-12 w-[400px] max-w-full items-center justify-center gap-1 rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] text-[20px] font-semibold leading-none text-white ${SHADOW_4}">登録する</button>`,
  },
  {
    id: "button-admin-solid-lg",
    label: "Admin Solid Large",
    group: "基本",
    component: "ボタン",
    description: "Admin / Button / Solid・Large：200×48・W6 16px。セクション単位の主アクション",
    preview: "solid",
    html: `<button type="button" class="inline-flex h-12 w-[200px] max-w-full items-center justify-center gap-1 rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] text-base font-semibold leading-none text-white ${SHADOW_4}">変更を保存</button>`,
  },
  {
    id: "button-admin-solid-md",
    label: "Admin Solid Medium",
    group: "基本",
    component: "ボタン",
    description: "Admin / Button / Solid・Medium：120×40・W6 16px。標準サイズ。テーブル上部の操作・フィルター適用",
    preview: "solid",
    html: `<button type="button" class="inline-flex h-10 w-[120px] items-center justify-center gap-1 rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] px-2 text-base font-semibold leading-none text-white ${SHADOW_4}">保存</button>`,
  },
  {
    id: "button-admin-outline-md",
    label: "Admin Outline Medium",
    group: "基本",
    component: "ボタン",
    description: "Admin / Button / Outline・Medium：120×40・W6 16px。キャンセル・条件クリアなどの副アクション",
    preview: "outline",
    html: `<button type="button" class="inline-flex h-10 w-[120px] items-center justify-center gap-1 rounded-lg border border-[${PRIMARY}] bg-white px-2 text-base font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">キャンセル</button>`,
  },
  {
    id: "button-admin-outline-sm",
    label: "Admin Small",
    group: "基本",
    component: "ボタン",
    description: "Admin / Button / Outline・Small：80×40・W6 14px。テーブル行内の操作",
    preview: "outline",
    html: `<button type="button" class="inline-flex h-10 w-20 items-center justify-center gap-1 rounded-lg border border-[${PRIMARY}] bg-white text-sm font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">詳細</button>`,
  },
  {
    id: "button-admin-icon",
    label: "Admin Icon",
    group: "基本",
    component: "ボタン",
    description: "Admin / Button / Icon：40×40・アイコン 24px。ツールバー内。aria-label 必須",
    preview: "outline",
    html: `<button type="button" aria-label="編集" class="inline-flex size-10 items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-[${PRIMARY}] ${SHADOW_4}">${icon("edit")}</button>`,
  },
  {
    id: "button-admin-disable",
    label: "Admin Disable",
    group: "基本",
    component: "ボタン",
    description: "Solid の Disable 状態：#808080・不透明度 50%。必須未入力や送信処理中に使う（第 3 のボタン種ではない）",
    preview: "block",
    html: `<button type="button" disabled class="inline-flex h-10 w-[120px] items-center justify-center gap-1 rounded-lg border border-[${TEXT2}] bg-[${TEXT2}] px-2 text-base font-semibold leading-none text-white opacity-50 ${SHADOW_4}">保存</button>`,
  },

  // ---- タイポグラフィ -------------------------------------------------------
  {
    id: "type-h1",
    label: "H1-32-W6-140",
    group: "基本",
    component: "タイポグラフィ",
    description: "PC 見出し H1：32px・W6・行間 140%",
    preview: "text",
    html: `<h1 class="text-[32px] font-semibold leading-[1.4] text-[${TEXT}]">見出し H1</h1>`,
  },
  {
    id: "type-h2",
    label: "H2-20-W6-140",
    group: "基本",
    component: "タイポグラフィ",
    description: "PC 見出し H2：20px・W6・行間 140%（アプリ文字サイズ「中」では 24pt）",
    preview: "text",
    html: `<h2 class="text-[20px] font-semibold leading-[1.4] text-[${TEXT}]">見出し H2</h2>`,
  },
  {
    id: "type-h4",
    label: "H4-16-W6-140",
    group: "基本",
    component: "タイポグラフィ",
    description: "PC 見出し H4：16px・W6・行間 140%。ラベル・項目名に使う",
    preview: "text",
    html: `<p class="text-base font-semibold leading-[1.4] text-[${TEXT}]">項目名</p>`,
  },
  {
    id: "type-body",
    label: "本文 16-W3-160",
    group: "基本",
    component: "タイポグラフィ",
    description: "本文：16px・W3・行間 160%",
    preview: "text",
    html: `<p class="text-base font-normal leading-[1.6] text-[${TEXT}]">本文のテキストが入ります。現場の言葉で、省略せずに書きます。</p>`,
  },
  {
    id: "type-label",
    label: "補足 14-W6",
    group: "基本",
    component: "タイポグラフィ",
    description: "補足テキスト・サポートテキスト：14px・W6・text/secondary",
    preview: "text",
    html: `<p class="text-sm font-semibold leading-[1.4] text-[${TEXT2}]">補足の説明が入ります。</p>`,
  },

  // ---- エレベーション -------------------------------------------------------
  {
    id: "elevation-1",
    label: "Level.1",
    group: "基本",
    component: "エレベーション",
    description: "First 0 2px 4px 1px #333 10% + Second 0 1px 5px 0 #333 30%。カード・行の基準の高さ",
    preview: "block",
    html: `<div class="flex h-20 w-[200px] items-center justify-center rounded-lg bg-white text-sm font-semibold text-[${TEXT2}] ${ELEVATION_1}">Level.1</div>`,
  },
  {
    id: "elevation-4",
    label: "Level.4",
    group: "基本",
    component: "エレベーション",
    description: "First 0 8px 10px 4px #333 10% + Second 0 2px 6px 0 #333 30%。浮いて見せるパネル",
    preview: "block",
    html: `<div class="flex h-20 w-[200px] items-center justify-center rounded-lg bg-white text-sm font-semibold text-[${TEXT2}] shadow-[0_8px_10px_4px_rgba(51,51,51,0.10),0_2px_6px_0_rgba(51,51,51,0.30)]">Level.4</div>`,
  },
  {
    id: "elevation-8",
    label: "Level.8",
    group: "基本",
    component: "エレベーション",
    description: "First 0 16px 18px 8px #333 10% + Second 0 3px 16px 0 #333 30%。ダイアログ・オーバーレイ",
    preview: "block",
    html: `<div class="flex h-20 w-[200px] items-center justify-center rounded-lg bg-white text-sm font-semibold text-[${TEXT2}] shadow-[0_16px_18px_8px_rgba(51,51,51,0.10),0_3px_16px_0_rgba(51,51,51,0.30)]">Level.8</div>`,
  },

  // =========================================================================
  // App + Admin 共通
  // =========================================================================

  // ---- 入力フィールド -------------------------------------------------------
  {
    id: "input-app",
    label: "App 入力アイテム",
    group: "App + Admin 共通",
    component: "入力フィールド",
    description: "App / InputTextItem：ラベル W6 18px + 必須 ※（#f34949）+ 入力欄 280×48（白・角丸 8px・W6 16px）+ 補足 W6 14px",
    preview: "input",
    html: `<div class="flex flex-col gap-2">
<p class="text-[18px] font-semibold leading-none text-[${TEXT}]">項目名<span class="ml-1 text-[${DANGER}]">※</span></p>
<input type="text" placeholder="入力してください" class="h-12 w-[280px] max-w-full rounded-lg bg-white px-4 text-base font-semibold leading-[1.4] text-[${TEXT}] placeholder:text-[${TEXT2}]" />
<p class="text-sm font-semibold leading-none text-[${TEXT2}]">補足テキスト</p>
</div>`,
  },
  {
    id: "input-admin-md",
    label: "Admin Medium Bordered",
    group: "App + Admin 共通",
    component: "入力フィールド",
    description: "Admin / InputText / Medium・Bordered：300×48・パディング 16px・枠線 #d0d0d0。ラベル W6 20px + 必須 W6 14px",
    preview: "input",
    html: `<div class="flex flex-col gap-2">
<p class="flex items-center gap-2 text-[20px] font-semibold leading-none text-[${TEXT}]">項目名<span class="text-sm text-[${DANGER}]">必須</span></p>
<input type="text" placeholder="入力してください" class="h-12 w-[300px] max-w-full rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT}] placeholder:text-[${TEXT2}]" />
</div>`,
  },
  {
    id: "input-admin-lg",
    label: "Admin Large Default",
    group: "App + Admin 共通",
    component: "入力フィールド",
    description: "Admin / InputText / Large・Default：480×48・枠線なし",
    preview: "input",
    html: `<input type="text" placeholder="入力してください" class="h-12 w-[480px] max-w-full rounded-lg bg-white px-4 text-base font-semibold text-[${TEXT}] placeholder:text-[${TEXT2}]" />`,
  },
  {
    id: "input-admin-error",
    label: "Admin error",
    group: "App + Admin 共通",
    component: "入力フィールド",
    description: "Admin / InputText / Medium・error：枠線 #f85c5c + 下にエラーテキスト W3 16px",
    preview: "input",
    html: `<div class="flex flex-col gap-1">
<input type="text" value="ｱｲｴｵ" class="h-12 w-[300px] max-w-full rounded-lg border border-[${ERROR}] bg-white px-4 text-base font-semibold text-[${TEXT}]" />
<p class="text-base font-normal text-[${ERROR}]">全角で入力してください</p>
</div>`,
  },

  // ---- 日付入力 -------------------------------------------------------------
  {
    id: "input-date-app",
    label: "App 日付入力",
    group: "App + Admin 共通",
    component: "日付入力",
    description: "App / InputDate：200×48・左右 16px・gap 8px・プレースホルダ W6 16px #808080 + カレンダーアイコン 24px",
    preview: "input",
    html: `<div class="flex h-12 w-[200px] items-center justify-between gap-2 rounded-lg bg-white px-4 text-base font-semibold text-[${TEXT2}]"><span>年/月/日</span>${icon("calendar", 24, `text-[${TEXT}]`)}</div>`,
  },
  {
    id: "input-date-admin",
    label: "Admin 日付入力 Bordered",
    group: "App + Admin 共通",
    component: "日付入力",
    description: "Admin / InputDate / Large・Bordered：200×48・枠線 #d0d0d0",
    preview: "input",
    html: `<div class="flex h-12 w-[200px] items-center justify-between gap-2 rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT}]"><span>2026/09/02</span>${icon("calendar")}</div>`,
  },
  {
    id: "input-date-range-admin",
    label: "Admin 期間指定",
    group: "App + Admin 共通",
    component: "日付入力",
    description: "Admin / InputDateRange：InputDate 2 つを gap 8px で並べ、間に「〜」（W6 16px）",
    preview: "input",
    html: `<div class="flex items-center gap-2">
<div class="flex h-12 w-[200px] items-center justify-between gap-2 rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT}]"><span>2026/09/01</span>${icon("calendar")}</div>
<span class="text-base font-semibold text-[${TEXT}]">〜</span>
<div class="flex h-12 w-[200px] items-center justify-between gap-2 rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT}]"><span>2026/09/30</span>${icon("calendar")}</div>
</div>`,
  },

  // ---- セレクト -------------------------------------------------------------
  {
    id: "select-app-ok",
    label: "App SelectButton（OK）",
    group: "App + Admin 共通",
    component: "セレクト",
    description: "App / SelectButton / State=OK：160×48 を 80×48 で 2 分割、外側だけ角丸 8px。OK は status/success",
    preview: "tag",
    html: `<div class="inline-flex h-12 w-40 text-[18px] font-semibold leading-none">
<span class="flex w-20 items-center justify-center rounded-l-lg bg-[${SUCCESS}] text-white">OK</span>
<span class="flex w-20 items-center justify-center rounded-r-lg border border-l-0 border-[${BORDER}] bg-white text-[${TEXT2}]">NG</span>
</div>`,
  },
  {
    id: "select-app-ng",
    label: "App SelectButton（NG）",
    group: "App + Admin 共通",
    component: "セレクト",
    description: "App / SelectButton / State=NG：NG は status/error",
    preview: "tag",
    html: `<div class="inline-flex h-12 w-40 text-[18px] font-semibold leading-none">
<span class="flex w-20 items-center justify-center rounded-l-lg border border-r-0 border-[${BORDER}] bg-white text-[${TEXT2}]">OK</span>
<span class="flex w-20 items-center justify-center rounded-r-lg bg-[${ERROR}] text-white">NG</span>
</div>`,
  },
  {
    id: "select-app-repair",
    label: "App SelectButton（Repair）",
    group: "App + Admin 共通",
    component: "セレクト",
    description: "App / SelectButton / State=Repair：全幅 status/caution に「修理中」（W6 18px）",
    preview: "tag",
    html: `<div class="inline-flex h-12 w-40 items-center justify-center rounded-lg bg-[${CAUTION}] text-[18px] font-semibold leading-none text-white">修理中</div>`,
  },
  {
    id: "select-admin",
    label: "Admin SelectBox",
    group: "App + Admin 共通",
    component: "セレクト",
    description: "Admin / SelectBox / Large・Bordered：240×48・角丸 8px・左右 16px・枠線 #d0d0d0",
    preview: "input",
    html: `<div class="flex h-12 w-[240px] items-center justify-between gap-2 rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT2}]"><span>選択してください</span>${icon("pulldown", 16, `text-[${TEXT}]`)}</div>`,
  },
  {
    id: "select-admin-button",
    label: "Admin SelectBox + ボタン",
    group: "App + Admin 共通",
    component: "セレクト",
    description: "Admin / SelectBox / Button=On：右に 120×40 のアウトラインボタン（gap 24px）",
    preview: "input",
    html: `<div class="flex items-center gap-6">
<div class="flex h-12 w-[240px] items-center justify-between gap-2 rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT}]"><span>第一工場</span>${icon("pulldown", 16)}</div>
<button type="button" class="inline-flex h-10 w-[120px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-base font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">切り替え</button>
</div>`,
  },

  // ---- ステータスタグ -------------------------------------------------------
  {
    id: "status-tag-app-success",
    label: "App Success",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "App / StatusTag / Success：64×24・角丸 8px・W6 12px 白・status/success",
    preview: "tag",
    html: `<span class="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-[${SUCCESS}] px-2 py-0.5 text-xs font-semibold leading-[1.2] text-white">点検済</span>`,
  },
  {
    id: "status-tag-app-error",
    label: "App Error",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "App / StatusTag / Error：status/error",
    preview: "tag",
    html: `<span class="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-[${ERROR}] px-2 py-0.5 text-xs font-semibold leading-[1.2] text-white">異常</span>`,
  },
  {
    id: "status-tag-app-repair",
    label: "App Repair",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "App / StatusTag / Repair：status/caution",
    preview: "tag",
    html: `<span class="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-[${CAUTION}] px-2 py-0.5 text-xs font-semibold leading-[1.2] text-white">修理中</span>`,
  },
  {
    id: "status-tag-app-done",
    label: "App Done",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "App / StatusTag / Done：status/done",
    preview: "tag",
    html: `<span class="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-[${DONE}] px-2 py-0.5 text-xs font-semibold leading-[1.2] text-white">完了</span>`,
  },
  {
    id: "status-tag-app-unchecked",
    label: "App un checked",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "App / StatusTag / un checked：#808080",
    preview: "tag",
    html: `<span class="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-[${TEXT2}] px-2 py-0.5 text-xs font-semibold leading-[1.2] text-white">未点検</span>`,
  },
  {
    id: "status-tag-app-seeoff",
    label: "App see off",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "App / StatusTag / see off：白地 + #ddf3e7 の枠線、文字 #009944",
    preview: "tag",
    html: `<span class="inline-flex h-6 w-16 items-center justify-center rounded-lg border border-[#ddf3e7] bg-white px-2 py-0.5 text-xs font-semibold leading-[1.2] text-[${PRIMARY}]">見送り</span>`,
  },
  {
    id: "status-tag-admin-success",
    label: "Admin Success",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "Admin / StatusTag / Success：88×28・W6 16px",
    preview: "tag",
    html: `<span class="inline-flex h-7 w-[88px] items-center justify-center rounded-lg bg-[${SUCCESS}] text-base font-semibold leading-none text-white">正常</span>`,
  },
  {
    id: "status-tag-admin-error",
    label: "Admin Error",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "Admin / StatusTag / Error：88×28・W6 16px",
    preview: "tag",
    html: `<span class="inline-flex h-7 w-[88px] items-center justify-center rounded-lg bg-[${ERROR}] text-base font-semibold leading-none text-white">異常</span>`,
  },
  {
    id: "status-tag-admin-repair",
    label: "Admin Repair",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "Admin / StatusTag / Repair：88×28・W6 16px",
    preview: "tag",
    html: `<span class="inline-flex h-7 w-[88px] items-center justify-center rounded-lg bg-[${CAUTION}] text-base font-semibold leading-none text-white">修理中</span>`,
  },
  {
    id: "certification-verified",
    label: "認証状態（認証済み）",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "Admin / CertificationState / Verified：120×40・白地・枠線 #d0d0d0・角丸 8px・文字 #009944",
    preview: "tag",
    html: `<span class="inline-flex h-10 w-[120px] items-center justify-center rounded-lg border border-[${BORDER}] bg-white text-base font-semibold leading-none text-[${PRIMARY}]">認証済み</span>`,
  },
  {
    id: "certification-pending",
    label: "認証状態（認証待ち）",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "Admin / CertificationState / Pending：文字 #808080",
    preview: "tag",
    html: `<span class="inline-flex h-10 w-[120px] items-center justify-center rounded-lg border border-[${BORDER}] bg-white text-base font-semibold leading-none text-[${TEXT2}]">認証待ち</span>`,
  },
  {
    id: "certification-denial",
    label: "認証状態（否認）",
    group: "App + Admin 共通",
    component: "ステータスタグ",
    description: "Admin / CertificationState / Denial：文字 #f34949",
    preview: "tag",
    html: `<span class="inline-flex h-10 w-[120px] items-center justify-center rounded-lg border border-[${BORDER}] bg-white text-base font-semibold leading-none text-[${DANGER}]">否認</span>`,
  },

  // ---- ダイアログ -----------------------------------------------------------
  {
    id: "dialog-app-double",
    label: "App ダイアログ（2 ボタン）",
    group: "App + Admin 共通",
    component: "ダイアログ",
    description: "App / Dialog / Button=Bouble・Description=On：幅 640・角丸 8px・パディング 40·24px・gap 40px・地色 #f1efea。タイトル W6 24px 中央、ボタン 240×64",
    preview: "block",
    html: `<div class="flex w-[640px] max-w-full flex-col items-center gap-10 rounded-lg bg-[${PAGE}] px-6 py-10 ${SHADOW_6}">
<p class="text-center text-[24px] font-semibold leading-[1.4] text-[${TEXT}]">点検を完了しますか？</p>
<p class="text-center text-base font-semibold leading-[1.4] text-[${TEXT}]">完了すると確認者へ送られます。内容をもう一度確認してください。</p>
<div class="flex gap-10">
<button type="button" class="inline-flex h-16 w-[240px] items-center justify-center rounded-lg border border-[${TEXT}] bg-white text-[20px] font-semibold leading-none text-[${TEXT}]">戻る</button>
<button type="button" class="inline-flex h-16 w-[240px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] text-[20px] font-semibold leading-none text-white">完了する</button>
</div>
</div>`,
  },
  {
    id: "dialog-app-single",
    label: "App ダイアログ（1 ボタン）",
    group: "App + Admin 共通",
    component: "ダイアログ",
    description: "App / Dialog / Button=Single・Description=Off：アウトラインボタン 1 つ",
    preview: "block",
    html: `<div class="flex w-[640px] max-w-full flex-col items-center gap-10 rounded-lg bg-[${PAGE}] px-6 py-10 ${SHADOW_6}">
<p class="text-center text-[24px] font-semibold leading-[1.4] text-[${TEXT}]">保存しました</p>
<button type="button" class="inline-flex h-16 w-[240px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-[20px] font-semibold leading-none text-[${PRIMARY}]">閉じる</button>
</div>`,
  },
  {
    id: "dialog-admin-delete",
    label: "Admin 削除ダイアログ",
    group: "App + Admin 共通",
    component: "ダイアログ",
    description: "Admin / Dialog（削除）：幅 640・タイトル W6 24px + 本文 W3 16px（gap 24px）、ボタン 200×48。破壊的操作は brand/danger",
    preview: "block",
    html: `<div class="flex w-[640px] max-w-full flex-col gap-6 rounded-lg bg-[${PAGE}] px-6 py-10 ${SHADOW_6}">
<p class="text-[24px] font-semibold leading-[1.4] text-[${TEXT}]">〇〇〇〇を削除</p>
<p class="text-base font-normal leading-[1.6] text-[${TEXT}]">削除すると元に戻せません。本当に削除しますか？</p>
<div class="flex justify-end gap-6">
<button type="button" class="inline-flex h-12 w-[200px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-base font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">キャンセル</button>
<button type="button" class="inline-flex h-12 w-[200px] items-center justify-center rounded-lg border border-[${DANGER}] bg-[${DANGER}] text-base font-semibold leading-none text-white ${SHADOW_4}">削除する</button>
</div>
</div>`,
  },
  {
    id: "dialog-admin-approve",
    label: "Admin 承認ダイアログ",
    group: "App + Admin 共通",
    component: "ダイアログ",
    description: "Admin / Dialog（承認）：通常の確定は brand/primary",
    preview: "block",
    html: `<div class="flex w-[640px] max-w-full flex-col gap-6 rounded-lg bg-[${PAGE}] px-6 py-10 ${SHADOW_6}">
<p class="text-[24px] font-semibold leading-[1.4] text-[${TEXT}]">承認しますか？</p>
<p class="text-base font-normal leading-[1.6] text-[${TEXT}]">承認すると記録が確定し、実施者・確認者は編集できなくなります。</p>
<div class="flex justify-end gap-6">
<button type="button" class="inline-flex h-12 w-[200px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-base font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">キャンセル</button>
<button type="button" class="inline-flex h-12 w-[200px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] text-base font-semibold leading-none text-white ${SHADOW_4}">承認する</button>
</div>
</div>`,
  },

  // ---- ナビゲーション -------------------------------------------------------
  {
    id: "nav-app-header",
    label: "App ヘッダー",
    group: "App + Admin 共通",
    component: "ナビゲーション",
    description: "App / Header：704×64・地色 #f1efea・上だけ角丸 8px。右に進捗（点検済み）を重ねる",
    preview: "block",
    html: `<header class="flex h-16 w-[704px] max-w-full items-center justify-between rounded-t-lg bg-[${PAGE}] px-4">
<div class="flex items-center gap-3 text-[${TEXT}]">${icon("menu")}<span class="text-[20px] font-semibold leading-none">金属探知機記録</span></div>
<span class="text-base font-semibold text-[${TEXT2}]">点検済み <span class="text-[${PRIMARY}]">3</span> / 10</span>
</header>`,
  },
  {
    id: "nav-app-tab",
    label: "App タブ",
    group: "App + Admin 共通",
    component: "ナビゲーション",
    description: "App / Tab Container：672×40・選択タブが #009944 塗り",
    preview: "block",
    html: `<div class="flex h-10 w-[672px] max-w-full rounded-lg border border-[${PRIMARY}] bg-white p-0.5 text-base font-semibold leading-none">
<span class="flex flex-1 items-center justify-center rounded-md bg-[${PRIMARY}] text-white">未点検</span>
<span class="flex flex-1 items-center justify-center text-[${PRIMARY}]">点検済</span>
<span class="flex flex-1 items-center justify-center text-[${PRIMARY}]">すべて</span>
</div>`,
  },
  {
    id: "nav-app-bottom-bar",
    label: "App ボトムアクションバー",
    group: "App + Admin 共通",
    component: "ナビゲーション",
    description: "App / BottomActionBar：704 幅・上向きシャドウ 0 -4px 16px rgba(51,51,51,0.16)。バッジは #f34949 の丸に白文字",
    preview: "block",
    html: `<div class="flex w-[704px] max-w-full items-center justify-between gap-6 bg-white px-6 py-4 shadow-[0_-4px_16px_rgba(51,51,51,0.16)]">
<button type="button" class="inline-flex h-16 w-[240px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-[20px] font-semibold leading-none text-[${PRIMARY}]">一時保存</button>
<button type="button" class="relative inline-flex h-16 w-[360px] items-center justify-center rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] text-[20px] font-semibold leading-none text-white">確認へ送る<span class="absolute -right-2 -top-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[${DANGER}] px-1.5 py-0.5 text-xs font-bold leading-none text-white">2</span></button>
</div>`,
  },
  {
    id: "nav-admin-side-rail",
    label: "Admin サイドナビ（アイコン）",
    group: "App + Admin 共通",
    component: "ナビゲーション",
    description: "Admin / SideNavigation（閉）：72×960・地色 brand/primary・アイコン白",
    preview: "block",
    html: `<nav class="flex h-[960px] w-[72px] flex-col items-center gap-2 bg-[${PRIMARY}] py-6 text-white">
<span class="flex size-12 items-center justify-center rounded-lg bg-white/20">${icon("home")}</span>
<span class="flex size-12 items-center justify-center rounded-lg">${icon("search")}</span>
<span class="flex size-12 items-center justify-center rounded-lg">${icon("check")}</span>
<span class="flex size-12 items-center justify-center rounded-lg">${icon("calendar")}</span>
</nav>`,
  },
  {
    id: "nav-admin-side-expanded",
    label: "Admin サイドナビ（展開）",
    group: "App + Admin 共通",
    component: "ナビゲーション",
    description: "Admin / SideNavigation（開）：240×960・地色 brand/primary・アイコンと文字は白",
    preview: "block",
    html: `<nav class="flex h-[960px] w-[240px] flex-col gap-1 bg-[${PRIMARY}] px-3 py-6 text-white">
<span class="flex h-12 items-center gap-3 rounded-lg bg-white/20 px-3 text-base font-semibold">${icon("home")}ホーム</span>
<span class="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-semibold">${icon("search")}データ検索</span>
<span class="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-semibold">${icon("check")}承認</span>
<span class="flex h-12 items-center gap-3 rounded-lg px-3 text-base font-semibold">${icon("calendar")}予定</span>
</nav>`,
  },

  // =========================================================================
  // App のみ
  // =========================================================================

  // ---- チェックボックス -----------------------------------------------------
  {
    id: "checkbox-app-check-on",
    label: "Check（On）",
    group: "App のみ",
    component: "チェックボックス",
    description: "App / Check / On：80×48・角丸 8px・status/success",
    preview: "tag",
    html: `<span class="inline-flex h-12 w-20 items-center justify-center rounded-lg bg-[${SUCCESS}] text-white">${icon("checkmark", 32)}</span>`,
  },
  {
    id: "checkbox-app-check-off",
    label: "Check（Off）",
    group: "App のみ",
    component: "チェックボックス",
    description: "App / Check / Off：80×48・角丸 8px・枠線 border/default #d0d0d0",
    preview: "tag",
    html: `<span class="inline-flex h-12 w-20 items-center justify-center rounded-lg border border-[${BORDER}] bg-white text-[${BORDER}]">${icon("checkmark", 32)}</span>`,
  },
  {
    id: "checkbox-app-ng-on",
    label: "NG（On）",
    group: "App のみ",
    component: "チェックボックス",
    description: "App / NG / On：80×48・角丸 8px・status/error",
    preview: "tag",
    html: `<span class="inline-flex h-12 w-20 items-center justify-center rounded-lg bg-[${ERROR}] text-[18px] font-semibold leading-none text-white">NG</span>`,
  },
  {
    id: "checkbox-app-container",
    label: "チェックボックス + ラベル",
    group: "App のみ",
    component: "チェックボックス",
    description: "App / CheckboxContainer：チェックボックス 24px + ラベル W6 14px + ツールチップ 20px（gap 4 / 8px）",
    preview: "input",
    html: `<label class="inline-flex items-center gap-2 text-sm font-semibold text-[${TEXT}]"><span class="inline-flex size-6 items-center justify-center rounded border-2 border-[${PRIMARY}] bg-[${PRIMARY}] text-white">${icon("checkmark", 18)}</span><span class="inline-flex items-center gap-1">異常なし${icon("question", 20, `text-[${TEXT2}]`)}</span></label>`,
  },

  // ---- リストアイテム -------------------------------------------------------
  {
    id: "list-item-app-inspection",
    label: "検査リスト行",
    group: "App のみ",
    component: "リストアイテム",
    description: "App / ListItem（検査リスト）：白・角丸 8px・左右 16px・タイトル W6 18px + ステータスタグ + 右矢印",
    preview: "block",
    html: `<div class="flex h-16 w-full items-center justify-between gap-4 rounded-lg bg-white px-4 ${ELEVATION_1}">
<div class="flex items-center gap-3"><span class="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-[${TEXT2}] text-xs font-semibold leading-[1.2] text-white">未点検</span><span class="text-[18px] font-semibold leading-none text-[${TEXT}]">金属探知機 A-1</span></div>
<span class="text-[${TEXT2}]">${icon("arrowRight", 20)}</span>
</div>`,
  },
  {
    id: "list-item-app-row",
    label: "アイテム行",
    group: "App のみ",
    component: "リストアイテム",
    description: "App / ListItem（アイテム行）：項目名 W6 16px + 値。区切り線 #d0d0d0",
    preview: "block",
    html: `<div class="flex w-full items-center justify-between gap-4 border-b border-[${BORDER}] py-3 text-base font-semibold text-[${TEXT}]"><span class="text-[${TEXT2}]">実施者</span><span>山田 太郎</span></div>`,
  },
  {
    id: "list-item-app-text",
    label: "テキストコンテンツ",
    group: "App のみ",
    component: "リストアイテム",
    description: "App / ListItem（テキストコンテンツ）：見出し W6 18px + 本文 W6 16px・行間 140%",
    preview: "block",
    html: `<div class="flex w-full flex-col gap-2 rounded-lg bg-white p-4"><p class="text-[18px] font-semibold leading-none text-[${TEXT}]">備考</p><p class="text-base font-semibold leading-[1.4] text-[${TEXT}]">異常はありませんでした。次回は感度を再確認します。</p></div>`,
  },

  // ---- 検査ステータス -------------------------------------------------------
  {
    id: "inspection-status",
    label: "ステータス表示",
    group: "App のみ",
    component: "検査ステータス",
    description: "App / InspectionStatus（checked / Inspected / unchecked / remand / progress / seeoff）：進捗を示す表示",
    preview: "tag",
    html: `<div class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 ${ELEVATION_1}"><span class="inline-flex size-6 items-center justify-center rounded-full bg-[${SUCCESS}] text-white">${icon("checkmark", 16)}</span><span class="text-base font-semibold leading-none text-[${TEXT}]">点検済み</span></div>`,
  },
  {
    id: "inspection-number-button",
    label: "数値入力ボタン",
    group: "App のみ",
    component: "検査ステータス",
    description: "App / NumberButtonItem：項目名 + 数値 + OK / NG ボタン（NumberButton_OK / NumberButton_NG）",
    preview: "block",
    html: `<div class="flex w-full items-center justify-between gap-4 rounded-lg bg-white px-4 py-3 ${ELEVATION_1}">
<span class="text-[18px] font-semibold leading-none text-[${TEXT}]">感度（Fe）</span>
<div class="flex items-center gap-2">
<span class="inline-flex h-12 w-24 items-center justify-center rounded-lg border border-[${BORDER}] bg-white text-base font-semibold text-[${TEXT}]">1.2 <span class="ml-1 text-sm text-[${TEXT2}]">mm</span></span>
<span class="inline-flex h-12 w-20 items-center justify-center rounded-lg bg-[${SUCCESS}] text-[18px] font-semibold leading-none text-white">OK</span>
<span class="inline-flex h-12 w-20 items-center justify-center rounded-lg border border-[${BORDER}] bg-white text-[18px] font-semibold leading-none text-[${TEXT2}]">NG</span>
</div>
</div>`,
  },
  {
    id: "inspection-question",
    label: "質問コンテナ",
    group: "App のみ",
    component: "検査ステータス",
    description: "App / QuestionContainer / active：質問文 + SelectButton",
    preview: "block",
    html: `<div class="flex w-full flex-col gap-3 rounded-lg border-2 border-[${PRIMARY}] bg-white p-4">
<p class="text-[18px] font-semibold leading-[1.4] text-[${TEXT}]">テストピースが正常に検知されましたか？</p>
<div class="inline-flex h-12 w-40 text-[18px] font-semibold leading-none">
<span class="flex w-20 items-center justify-center rounded-l-lg bg-[${SUCCESS}] text-white">OK</span>
<span class="flex w-20 items-center justify-center rounded-r-lg border border-l-0 border-[${BORDER}] bg-white text-[${TEXT2}]">NG</span>
</div>
</div>`,
  },
  {
    id: "inspection-progress-accordion",
    label: "進捗アコーディオン",
    group: "App のみ",
    component: "検査ステータス",
    description: "App / ProgressAccordion / active：セクション名 + 進捗 + 開閉矢印",
    preview: "block",
    html: `<div class="flex h-14 w-full items-center justify-between gap-4 rounded-lg bg-white px-4 ${ELEVATION_1}">
<span class="text-[18px] font-semibold leading-none text-[${TEXT}]">始業前点検</span>
<div class="flex items-center gap-3"><span class="text-base font-semibold text-[${TEXT2}]"><span class="text-[${PRIMARY}]">3</span> / 5</span><span class="text-[${PRIMARY}]">${icon("arrowDown", 20)}</span></div>
</div>`,
  },
  {
    id: "inspection-confirm-row",
    label: "確認行",
    group: "App のみ",
    component: "検査ステータス",
    description: "App / ConfirmRow / Type=StatusLabel：項目名 + 結果ステータス。Error=On は文字が status/error",
    preview: "block",
    html: `<div class="flex w-full items-center justify-between gap-4 border-b border-[${BORDER}] py-3"><span class="text-base font-semibold text-[${TEXT}]">感度（Fe）</span><span class="inline-flex h-6 w-16 items-center justify-center rounded-lg bg-[${ERROR}] text-xs font-semibold leading-[1.2] text-white">異常</span></div>`,
  },

  // =========================================================================
  // Admin のみ
  // =========================================================================

  // ---- ラジオボタン ---------------------------------------------------------
  {
    id: "radio-admin",
    label: "ラジオボタン",
    group: "Admin のみ",
    component: "ラジオボタン",
    description: "Admin / RadioButton_PC：ラジオ 16px・ラベル W6 16px・gap 8px。active は #009944 の二重丸、inactive は #808080 の輪郭",
    preview: "input",
    html: `<div class="flex items-center gap-6 text-base font-semibold leading-[1.4] text-[${TEXT}]">
<label class="inline-flex items-center gap-2"><span class="inline-flex size-4 items-center justify-center rounded-full border-2 border-[${PRIMARY}]"><span class="size-2 rounded-full bg-[${PRIMARY}]"></span></span>有効</label>
<label class="inline-flex items-center gap-2"><span class="inline-block size-4 rounded-full border-2 border-[${TEXT2}]"></span>無効</label>
</div>`,
  },

  // ---- フィルター検索 -------------------------------------------------------
  {
    id: "filter-search-admin",
    label: "絞り込み検索（active）",
    group: "Admin のみ",
    component: "フィルター検索",
    description: "Admin / Filtersearch / active：幅 1152・白・角丸 8px・パディング 16px。見出し W6 16px #009944 + −、入力は枠線 #d0d0d0、右にリセット 80×40 と検索 120×40",
    preview: "block",
    html: `<div class="flex w-[1152px] max-w-full flex-col gap-4 rounded-lg bg-white p-4">
<div class="flex items-center justify-between text-[${PRIMARY}]"><span class="text-base font-semibold leading-none">絞り込み検索</span>${icon("minus", 20)}</div>
<div class="flex flex-wrap items-end justify-between gap-4">
<div class="flex flex-wrap gap-4">
<input type="text" placeholder="キーワード" class="h-12 w-[300px] rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT}] placeholder:text-[${TEXT2}]" />
<div class="flex h-12 w-[240px] items-center justify-between gap-2 rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT2}]"><span>工場を選択</span>${icon("pulldown", 16, `text-[${TEXT}]`)}</div>
<div class="flex h-12 w-[200px] items-center justify-between gap-2 rounded-lg border border-[${BORDER}] bg-white px-4 text-base font-semibold text-[${TEXT2}]"><span>年/月/日</span>${icon("calendar", 24, `text-[${TEXT}]`)}</div>
</div>
<div class="flex gap-2">
<button type="button" class="inline-flex h-10 w-20 items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-sm font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">リセット</button>
<button type="button" class="inline-flex h-10 w-[120px] items-center justify-center gap-1 rounded-lg border border-[${PRIMARY}] bg-[${PRIMARY}] text-base font-semibold leading-none text-white ${SHADOW_4}">${icon("search", 20)}検索</button>
</div>
</div>
</div>`,
  },
  {
    id: "filter-search-admin-inactive",
    label: "絞り込み検索（inactive）",
    group: "Admin のみ",
    component: "フィルター検索",
    description: "Admin / Filtersearch / inactive：閉じた状態。見出しに + アイコン",
    preview: "block",
    html: `<div class="flex w-[1152px] max-w-full items-center justify-between rounded-lg bg-white p-4 text-[${PRIMARY}]"><span class="text-base font-semibold leading-none">絞り込み検索</span>${icon("plus", 20)}</div>`,
  },

  // ---- カード ---------------------------------------------------------------
  {
    id: "card-admin",
    label: "カード（Default）",
    group: "Admin のみ",
    component: "カード",
    description: "Admin / Card / Icon=On・Default：270×80・角丸 8px・左右 16px・シャドウ 0 2px 6px。文字 W6 20px、アイコン 40×40",
    preview: "block",
    html: `<div class="flex h-20 w-[270px] items-center gap-4 rounded-lg bg-white px-4 ${SHADOW_6}"><span class="inline-flex size-10 items-center justify-center rounded-lg bg-[#ddf3e7] text-[${PRIMARY}]">${icon("checkmark")}</span><span class="text-[20px] font-semibold leading-[1.4] text-[${TEXT}]">金属探知機記録</span></div>`,
  },
  {
    id: "card-admin-selected",
    label: "カード（Selected）",
    group: "Admin のみ",
    component: "カード",
    description: "Admin / Card / Selected：#009944 の枠線と文字色",
    preview: "block",
    html: `<div class="flex h-20 w-[270px] items-center gap-4 rounded-lg border-2 border-[${PRIMARY}] bg-white px-4 ${SHADOW_6}"><span class="inline-flex size-10 items-center justify-center rounded-lg bg-[#ddf3e7] text-[${PRIMARY}]">${icon("checkmark")}</span><span class="text-[20px] font-semibold leading-[1.4] text-[${PRIMARY}]">金属探知機記録</span></div>`,
  },

  // ---- テーブル / 行 --------------------------------------------------------
  {
    id: "table-admin",
    label: "テーブル（ヘッダー + 行）",
    group: "Admin のみ",
    component: "テーブル / 行",
    description: "Admin / TableRow：ヘッダー行 + データ行 2 つ。行内の操作は Small ボタン 80×40",
    preview: "block",
    html: `<table class="w-full border-separate border-spacing-0 rounded-lg bg-white text-sm">
<thead><tr>
<th class="border-b border-[${BORDER}] px-4 py-3 text-left font-semibold text-[${PRIMARY}]">工場名</th>
<th class="border-b border-[${BORDER}] px-4 py-3 text-left font-semibold text-[${PRIMARY}]">実施者</th>
<th class="border-b border-[${BORDER}] px-4 py-3 text-left font-semibold text-[${PRIMARY}]">状態</th>
<th class="border-b border-[${BORDER}] px-4 py-3 text-left font-semibold text-[${PRIMARY}]"></th>
</tr></thead>
<tbody>
<tr>
<td class="border-b border-[${BORDER}] px-4 py-3 font-normal text-[${TEXT}]">第一工場</td>
<td class="border-b border-[${BORDER}] px-4 py-3 font-normal text-[${TEXT}]">山田 太郎</td>
<td class="border-b border-[${BORDER}] px-4 py-3"><span class="inline-flex h-7 w-[88px] items-center justify-center rounded-lg bg-[${SUCCESS}] text-base font-semibold leading-none text-white">正常</span></td>
<td class="border-b border-[${BORDER}] px-4 py-3 text-right"><button type="button" class="inline-flex h-10 w-20 items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-sm font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">詳細</button></td>
</tr>
<tr>
<td class="px-4 py-3 font-normal text-[${TEXT}]">第二工場</td>
<td class="px-4 py-3 font-normal text-[${TEXT}]">佐藤 花子</td>
<td class="px-4 py-3"><span class="inline-flex h-7 w-[88px] items-center justify-center rounded-lg bg-[${ERROR}] text-base font-semibold leading-none text-white">異常</span></td>
<td class="px-4 py-3 text-right"><button type="button" class="inline-flex h-10 w-20 items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-sm font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">詳細</button></td>
</tr>
</tbody>
</table>`,
  },
  {
    id: "table-header-admin",
    label: "テーブルヘッダー行",
    group: "Admin のみ",
    component: "テーブル / 行",
    description: "Admin / TableRow / Header：見出しだけの行（W6 14px #009944・下線 #d0d0d0）",
    preview: "block",
    html: `<div class="grid w-full grid-cols-4 rounded-t-lg border-b border-[${BORDER}] bg-white text-sm font-semibold text-[${PRIMARY}]"><span class="px-4 py-3">工場名</span><span class="px-4 py-3">実施者</span><span class="px-4 py-3">状態</span><span class="px-4 py-3"></span></div>`,
  },
  {
    id: "table-row-admin",
    label: "テーブルデータ行",
    group: "Admin のみ",
    component: "テーブル / 行",
    description: "Admin / TableRow（データ行）：W3 14px + ステータスタグ + Small ボタン 80×40",
    preview: "block",
    html: `<div class="grid w-full grid-cols-4 items-center border-b border-[${BORDER}] bg-white text-sm font-normal text-[${TEXT}]"><span class="px-4 py-3">第三工場</span><span class="px-4 py-3">鈴木 一郎</span><span class="px-4 py-3"><span class="inline-flex h-7 w-[88px] items-center justify-center rounded-lg bg-[${CAUTION}] text-base font-semibold leading-none text-white">修理中</span></span><span class="px-4 py-3 text-right"><button type="button" class="inline-flex h-10 w-20 items-center justify-center rounded-lg border border-[${PRIMARY}] bg-white text-sm font-semibold leading-none text-[${PRIMARY}] ${SHADOW_4}">詳細</button></span></div>`,
  },
  {
    id: "product-container-admin",
    label: "ProductContainer",
    group: "Admin のみ",
    component: "テーブル / 行",
    description: "Admin / ProductContainer / Selected：選択できる一覧行。Selected は #009944 の枠線",
    preview: "block",
    html: `<div class="flex h-14 w-full items-center justify-between gap-4 rounded-lg border-2 border-[${PRIMARY}] bg-white px-4"><span class="text-base font-semibold text-[${TEXT}]">商品 A（冷凍餃子 12個入）</span><span class="text-sm font-normal text-[${TEXT2}]">JAN 4900000000001</span></div>`,
  },

  // ---- アコーディオン -------------------------------------------------------
  {
    id: "accordion-admin-active",
    label: "アコーディオン（active）",
    group: "Admin のみ",
    component: "アコーディオン",
    description: "Admin / Accordion / active：幅 1148・角丸 8px・パディング 16px・シャドウ 0 2px 4px。Q. + W6 16px、開閉 24px −。回答領域 #f8f8f8（16·56·24·16px）に A. + W3 16px・行間 160%",
    preview: "block",
    html: `<div class="w-[1148px] max-w-full overflow-hidden rounded-lg bg-white ${SHADOW_4}">
<div class="flex items-center justify-between gap-4 p-4">
<div class="flex items-center gap-2 text-base font-semibold leading-[1.4] text-[${TEXT}]"><span class="inline-flex size-6 items-center justify-center text-[${PRIMARY}]">Q.</span>点検記録を差し戻したあと、実施者はどこから修正できますか？</div>
<span class="text-[${PRIMARY}]">${icon("minus")}</span>
</div>
<div class="flex items-start gap-2 bg-[#f8f8f8] pb-6 pl-4 pr-14 pt-4"><span class="inline-flex size-6 shrink-0 items-center justify-center text-base font-semibold text-[${PRIMARY}]">A.</span><p class="text-base font-normal leading-[1.6] text-[${TEXT}]">iPad アプリの「確認待ち」一覧に差し戻し理由とともに表示されます。該当の記録を開くと、差し戻された項目だけが編集できる状態になります。</p></div>
</div>`,
  },
  {
    id: "accordion-admin-inactive",
    label: "アコーディオン（inactive）",
    group: "Admin のみ",
    component: "アコーディオン",
    description: "Admin / Accordion / inactive：閉じた状態。開閉アイコンは +",
    preview: "block",
    html: `<div class="flex w-[1148px] max-w-full items-center justify-between gap-4 rounded-lg bg-white p-4 ${SHADOW_4}">
<div class="flex items-center gap-2 text-base font-semibold leading-[1.4] text-[${TEXT}]"><span class="inline-flex size-6 items-center justify-center text-[${PRIMARY}]">Q.</span>承認後に記録を修正することはできますか？</div>
<span class="text-[${PRIMARY}]">${icon("plus")}</span>
</div>`,
  },

  // ---- パンくずリスト -------------------------------------------------------
  {
    id: "breadcrumb-admin",
    label: "パンくずリスト（3 階層）",
    group: "Admin のみ",
    component: "パンくずリスト",
    description: "Admin / Breadcrumb / unit=3：幅 1200・パディング 16·24px・gap 8px。W6 14px、途中は #009944 + 16px 矢印、最後だけ #333333",
    preview: "text",
    html: `<nav class="flex w-[1200px] max-w-full items-center gap-2 px-6 py-4 text-sm font-semibold leading-none">
<span class="text-[${PRIMARY}]">ホーム</span><span class="text-[${PRIMARY}]">${icon("arrowRight", 16)}</span>
<span class="text-[${PRIMARY}]">確認</span><span class="text-[${PRIMARY}]">${icon("arrowRight", 16)}</span>
<span class="text-[${TEXT}]">金属探知機記録</span>
</nav>`,
  },

  // ---- ページネーション -----------------------------------------------------
  {
    id: "pagination-admin",
    label: "ページネーション",
    group: "Admin のみ",
    component: "ページネーション",
    description: "Admin / Pagination：セル 32×32・角丸 8px・パディング 6px・gap 8px・白地。W3 14px、現在ページは #009944 塗り白文字。前後送りは 16px 矢印",
    preview: "block",
    html: `<nav class="inline-flex items-center gap-2 text-sm font-normal leading-[1.6] text-[${TEXT}]">
<span class="inline-flex size-8 rotate-180 items-center justify-center rounded-lg bg-white p-1.5">${icon("arrowRight", 16)}</span>
<span class="inline-flex size-8 items-center justify-center rounded-lg bg-[${PRIMARY}] p-1.5 text-white">1</span>
<span class="inline-flex size-8 items-center justify-center rounded-lg bg-white p-1.5">2</span>
<span class="inline-flex size-8 items-center justify-center rounded-lg bg-white p-1.5">3</span>
<span class="inline-flex size-8 items-center justify-center rounded-lg bg-white p-1.5">…</span>
<span class="inline-flex size-8 items-center justify-center rounded-lg bg-white p-1.5">12</span>
<span class="inline-flex size-8 items-center justify-center rounded-lg bg-white p-1.5">${icon("arrowRight", 16)}</span>
</nav>`,
  },

  // ---- カレンダー -----------------------------------------------------------
  {
    id: "calendar-admin",
    label: "カレンダー（1 週）",
    group: "Admin のみ",
    component: "カレンダー",
    description: "Admin / Calendar：曜日ヘッダー 80×32 + 日付セル 80×64・枠線 #d0d0d0・W6 16px。active は #ddf3e7 地 + #009944 のタグ（W6 14px）",
    preview: "block",
    html: `<div class="inline-grid grid-cols-7 border-l border-t border-[${BORDER}] bg-white text-base font-semibold leading-[1.4] text-[${TEXT}]">
<div class="flex h-8 w-20 items-center justify-center border-b border-r border-[${BORDER}]">月</div>
<div class="flex h-8 w-20 items-center justify-center border-b border-r border-[${BORDER}]">火</div>
<div class="flex h-8 w-20 items-center justify-center border-b border-r border-[${BORDER}]">水</div>
<div class="flex h-8 w-20 items-center justify-center border-b border-r border-[${BORDER}]">木</div>
<div class="flex h-8 w-20 items-center justify-center border-b border-r border-[${BORDER}]">金</div>
<div class="flex h-8 w-20 items-center justify-center border-b border-r border-[${BORDER}] text-[${DONE}]">土</div>
<div class="flex h-8 w-20 items-center justify-center border-b border-r border-[${BORDER}] text-[${DANGER}]">日</div>
<div class="flex h-16 w-20 flex-col items-start justify-between border-b border-r border-[${BORDER}] p-2">1</div>
<div class="flex h-16 w-20 flex-col items-start justify-between border-b border-r border-[${BORDER}] bg-[#ddf3e7] p-2">2<span class="inline-flex h-5 items-center rounded-lg bg-[${PRIMARY}] px-2 text-sm leading-none text-white">点検</span></div>
<div class="flex h-16 w-20 flex-col items-start justify-between border-b border-r border-[${BORDER}] p-2">3</div>
<div class="flex h-16 w-20 flex-col items-start justify-between border-b border-r border-[${BORDER}] p-2">4</div>
<div class="flex h-16 w-20 flex-col items-start justify-between border-b border-r border-[${BORDER}] p-2">5</div>
<div class="flex h-16 w-20 flex-col items-start justify-between border-b border-r border-[${BORDER}] p-2 text-[${DONE}]">6</div>
<div class="flex h-16 w-20 flex-col items-start justify-between border-b border-r border-[${BORDER}] p-2 text-[${DANGER}]">7</div>
</div>`,
  },

  // ---- テキストエリア -------------------------------------------------------
  {
    id: "textarea-admin",
    label: "テキストエリア（Default）",
    group: "Admin のみ",
    component: "テキストエリア",
    description: "Admin / Textarea / Default：全体 360×120・入力枠 360×96・角丸 4px・枠線 #d0d0d0。ラベル 12px、プレースホルダ 14px #b5b5b5",
    preview: "input",
    html: `<div class="flex w-[360px] max-w-full flex-col gap-1">
<label class="text-xs font-semibold leading-none text-[${TEXT}]">備考</label>
<textarea placeholder="備考を入力してください" class="h-24 w-full resize-none rounded border border-[${BORDER}] bg-white px-3 py-2 text-sm font-normal text-[${TEXT}] placeholder:text-[var(--semantic-text-disabled)]"></textarea>
</div>`,
  },
  {
    id: "textarea-admin-error",
    label: "テキストエリア（Error）",
    group: "Admin のみ",
    component: "テキストエリア",
    description: "Admin / Textarea / Error：枠線 #f34949",
    preview: "input",
    html: `<div class="flex w-[360px] max-w-full flex-col gap-1">
<label class="text-xs font-semibold leading-none text-[${TEXT}]">備考</label>
<textarea class="h-24 w-full resize-none rounded border border-[${DANGER}] bg-white px-3 py-2 text-sm font-normal text-[${TEXT}]">500 文字を超えています…</textarea>
<p class="text-xs font-normal text-[${DANGER}]">500 文字以内で入力してください</p>
</div>`,
  },

  // ---- タブ -----------------------------------------------------------------
  {
    id: "tab-bar-admin",
    label: "タブバー",
    group: "Admin のみ",
    component: "タブ",
    description: "Admin / TabBar：幅 560。タブは 106×29・上 10px・左右 16px、下線 2px。Default #808080、Active #009944 の文字と下線",
    preview: "block",
    html: `<div class="flex w-[560px] max-w-full items-end border-b border-[${BORDER}] text-sm font-semibold leading-none">
<span class="flex h-[29px] w-[106px] flex-col items-center justify-between px-4 pt-2.5 text-[${PRIMARY}]">確認待ち<span class="h-0.5 w-[60px] bg-[${PRIMARY}]"></span></span>
<span class="flex h-[29px] w-[106px] flex-col items-center justify-between px-4 pt-2.5 text-[${TEXT2}]">確認済み<span class="h-0.5 w-[60px]"></span></span>
<span class="flex h-[29px] w-[106px] flex-col items-center justify-between px-4 pt-2.5 text-[${TEXT2}]">差し戻し<span class="h-0.5 w-[60px]"></span></span>
</div>`,
  },

  // ---- アラート -------------------------------------------------------------
  {
    id: "alert-admin-primary",
    label: "アラート（Primary）",
    group: "Admin のみ",
    component: "アラート",
    description: "Admin / Alert / Primary：520×44・角丸 6px・枠線 1px・14px。#ddf3e7 地 + #009944 枠 + #228b22 文字",
    preview: "block",
    html: `<div class="flex h-11 w-[520px] max-w-full items-center gap-2 rounded-md border border-[${PRIMARY}] bg-[#ddf3e7] px-4 text-sm font-semibold text-[#228b22]">${icon("check", 18)}変更を保存しました</div>`,
  },
  {
    id: "alert-admin-danger",
    label: "アラート（Danger）",
    group: "Admin のみ",
    component: "アラート",
    description: "Admin / Alert / Danger：#feecec 地 + #f85c5c 枠 + #c62828 文字",
    preview: "danger",
    html: `<div class="flex h-11 w-[520px] max-w-full items-center gap-2 rounded-md border border-[${ERROR}] bg-[#feecec] px-4 text-sm font-semibold text-[#c62828]">${icon("question", 18)}入力内容に誤りがあります</div>`,
  },
  {
    id: "alert-admin-caution",
    label: "アラート（Caution）",
    group: "Admin のみ",
    component: "アラート",
    description: "Admin / Alert / Caution：#fffbea 地 + #dcaa14 枠 + #b38b00 文字",
    preview: "block",
    html: `<div class="flex h-11 w-[520px] max-w-full items-center gap-2 rounded-md border border-[${CAUTION}] bg-[#fffbea] px-4 text-sm font-semibold text-[#b38b00]">${icon("question", 18)}未保存の変更があります</div>`,
  },

  // ---- バッジ ---------------------------------------------------------------
  {
    id: "badge-admin-number",
    label: "バッジ（数値）",
    group: "Admin のみ",
    component: "バッジ",
    description: "Admin / Badge / Number：#f85c5c・角丸 99px・パディング 2·5px・10px ボールド白",
    preview: "danger",
    html: `<span class="inline-flex min-w-4 items-center justify-center rounded-full bg-[${ERROR}] px-[5px] py-0.5 text-[10px] font-bold leading-none text-white">3</span>`,
  },
  {
    id: "badge-admin-99",
    label: "バッジ（99+）",
    group: "Admin のみ",
    component: "バッジ",
    description: "Admin / Badge / Number99+",
    preview: "danger",
    html: `<span class="inline-flex min-w-4 items-center justify-center rounded-full bg-[${ERROR}] px-[5px] py-0.5 text-[10px] font-bold leading-none text-white">99+</span>`,
  },
  {
    id: "badge-admin-dot",
    label: "バッジ（Dot）",
    group: "Admin のみ",
    component: "バッジ",
    description: "Admin / Badge / Dot：8×8 の丸",
    preview: "danger",
    html: `<span class="inline-block size-2 rounded-full bg-[${ERROR}]"></span>`,
  },

  // ---- トースト -------------------------------------------------------------
  {
    id: "toast-admin-success",
    label: "トースト（Success）",
    group: "Admin のみ",
    component: "トースト",
    description: "Admin / Toast / Success：320×52・角丸 6px・#19c95f。左に 20px の白丸（記号は地色）、48px から 14px の白文字",
    preview: "block",
    html: `<div class="relative flex h-[52px] w-[320px] items-center rounded-md bg-[${SUCCESS}] pl-12 pr-4 text-sm font-semibold text-white"><span class="absolute left-4 inline-flex size-5 items-center justify-center rounded-full bg-white text-[${SUCCESS}]">${icon("checkmark", 12)}</span>保存しました</div>`,
  },
  {
    id: "toast-admin-error",
    label: "トースト（Error）",
    group: "Admin のみ",
    component: "トースト",
    description: "Admin / Toast / Error：#f85c5c",
    preview: "danger",
    html: `<div class="relative flex h-[52px] w-[320px] items-center rounded-md bg-[${ERROR}] pl-12 pr-4 text-sm font-semibold text-white"><span class="absolute left-4 inline-flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold leading-none text-[${ERROR}]">!</span>保存に失敗しました</div>`,
  },

  // ---- 権限タグ -------------------------------------------------------------
  {
    id: "authority-tag-executor",
    label: "実施者",
    group: "Admin のみ",
    component: "権限タグ",
    description: "Admin / AuthorityTag / 実施者：52×23・角丸 4px・パディング 4·8px・12px。#e3f7e6 / #228b22",
    preview: "tag",
    html: `<span class="inline-flex h-[23px] items-center justify-center rounded px-2 py-1 text-xs font-semibold leading-none bg-[#e3f7e6] text-[#228b22]">実施者</span>`,
  },
  {
    id: "authority-tag-checker",
    label: "確認者",
    group: "Admin のみ",
    component: "権限タグ",
    description: "Admin / AuthorityTag / 確認者：#fff6d6 / #b38b00",
    preview: "tag",
    html: `<span class="inline-flex h-[23px] items-center justify-center rounded px-2 py-1 text-xs font-semibold leading-none bg-[#fff6d6] text-[#b38b00]">確認者</span>`,
  },
  {
    id: "authority-tag-approver",
    label: "承認者",
    group: "Admin のみ",
    component: "権限タグ",
    description: "Admin / AuthorityTag / 承認者：#dff1ff / #005e9e",
    preview: "tag",
    html: `<span class="inline-flex h-[23px] items-center justify-center rounded px-2 py-1 text-xs font-semibold leading-none bg-[#dff1ff] text-[#005e9e]">承認者</span>`,
  },
  {
    id: "authority-tag-admin",
    label: "管理者",
    group: "Admin のみ",
    component: "権限タグ",
    description: "Admin / AuthorityTag / 管理者：#ffe4e1 / #c62828",
    preview: "tag",
    html: `<span class="inline-flex h-[23px] items-center justify-center rounded px-2 py-1 text-xs font-semibold leading-none bg-[#ffe4e1] text-[#c62828]">管理者</span>`,
  },

  // ---- ドロップダウン -------------------------------------------------------
  {
    id: "dropdown-admin-menu",
    label: "ドロップダウンメニュー",
    group: "Admin のみ",
    component: "ドロップダウン",
    description: "Admin / DropdownMenu：200×128・角丸 6px・枠線 #d0d0d0。項目 200×40・パディング 10·16px・14px（Default 白 / Hover #f1efea / Danger #f34949 文字）",
    preview: "block",
    html: `<div class="flex w-[200px] flex-col overflow-hidden rounded-md border border-[${BORDER}] bg-white py-1 text-sm font-semibold leading-none ${ELEVATION_1}">
<span class="flex h-10 items-center px-4 py-2.5 text-[${TEXT}]">編集</span>
<span class="flex h-10 items-center bg-[${PAGE}] px-4 py-2.5 text-[${TEXT}]">複製</span>
<span class="flex h-10 items-center px-4 py-2.5 text-[${DANGER}]">削除</span>
</div>`,
  },
];

/** ガイド「コンポーネント一覧」と同じ区分・同じ順 */
export const PART_GROUPS: PartGroup[] = ["基本", "App + Admin 共通", "App のみ", "Admin のみ"];

/** 区分ごとの、ガイドと同じ並びのコンポーネント名 */
export const PART_COMPONENTS: Record<PartGroup, string[]> = {
  "基本": ["アイコン", "カラー", "ボタン", "タイポグラフィ", "エレベーション"],
  "App + Admin 共通": ["入力フィールド", "日付入力", "セレクト", "ステータスタグ", "ダイアログ", "ナビゲーション"],
  "App のみ": ["チェックボックス", "リストアイテム", "検査ステータス"],
  "Admin のみ": [
    "ラジオボタン",
    "フィルター検索",
    "カード",
    "テーブル / 行",
    "アコーディオン",
    "パンくずリスト",
    "ページネーション",
    "カレンダー",
    "テキストエリア",
    "タブ",
    "アラート",
    "バッジ",
    "トースト",
    "権限タグ",
    "ドロップダウン",
  ],
};
