/**
 * コメントの記入者名を、ログイン中の Google アカウントから取る。
 *
 * Google Identity Services（GIS）の「Google でログイン」を使う。
 * ブラウザで Google にログインしていれば One Tap が出て、承認するだけで名前が入る。
 *
 * 使うには OAuth クライアント ID が要る（.env.example を参照）:
 *   VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
 * 未設定のときは連携しない（コメント欄で名前を手で入れる）。
 *
 * サーバーは無いので、ID トークンの中身（名前・メール・写真）をブラウザで読んで
 * localStorage に覚えるだけ。検証はしていない（プロトタイプ用途）。
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type GoogleAccount = { name: string; email: string; picture: string };

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? "";
const STORAGE_KEY = "nq_google_account";
const CHANGED_EVENT = "nq-google-account-changed";
const GSI_SRC = "https://accounts.google.com/gsi/client";

/** クライアント ID が設定されていて連携できるか */
export const GOOGLE_SIGN_IN_CONFIGURED = CLIENT_ID !== "";

type GsiPromptNotification = {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
};

/** GIS が window.google に生やす API のうち、使うところだけ */
type GsiApi = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        itp_support?: boolean;
      }) => void;
      prompt: (listener?: (notification: GsiPromptNotification) => void) => void;
      renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
      disableAutoSelect: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GsiApi;
  }
}

export function loadGoogleAccount(): GoogleAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as GoogleAccount) : null;
    return parsed && typeof parsed.name === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function saveGoogleAccount(account: GoogleAccount | null) {
  try {
    if (account) localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 無視 */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

/** ID トークン（JWT）の payload から名前などを取り出す */
function accountFromCredential(credential: string): GoogleAccount | null {
  try {
    const payload = credential.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    const claims = JSON.parse(json) as { name?: string; email?: string; picture?: string };
    if (!claims.name) return null;
    return { name: claims.name, email: claims.email ?? "", picture: claims.picture ?? "" };
  } catch {
    return null;
  }
}

let gsiLoading: Promise<GsiApi> | null = null;

/** GIS のスクリプトを 1 回だけ読み込む */
function loadGsi(): Promise<GsiApi> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (gsiLoading) return gsiLoading;
  gsiLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => (window.google?.accounts?.id ? resolve(window.google) : reject(new Error("GIS が初期化できませんでした")));
    script.onerror = () => reject(new Error("Google のスクリプトを読み込めませんでした（オフライン？）"));
    document.head.appendChild(script);
  });
  return gsiLoading;
}

/**
 * Google アカウントの状態。
 * - configured: クライアント ID が設定されている
 * - account: ログイン済みなら名前など
 * - renderButton: 「Google でログイン」ボタンを置く要素を渡す
 * - signOut: 忘れる（次回は選び直し）
 */
export function useGoogleAccount() {
  const [account, setAccount] = useState<GoogleAccount | null>(loadGoogleAccount);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const reload = () => setAccount(loadGoogleAccount());
    window.addEventListener(CHANGED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(CHANGED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const init = useCallback(async () => {
    const gsi = await loadGsi();
    if (!initializedRef.current) {
      initializedRef.current = true;
      gsi.accounts.id.initialize({
        client_id: CLIENT_ID,
        auto_select: true,
        cancel_on_tap_outside: true,
        itp_support: true,
        callback: ({ credential }) => {
          const next = credential ? accountFromCredential(credential) : null;
          if (!next) {
            setError("Google から名前を受け取れませんでした");
            return;
          }
          setError(null);
          saveGoogleAccount(next);
        },
      });
    }
    return gsi;
  }, []);

  // 未ログインなら、ログイン中の Google アカウントを One Tap で提案する
  useEffect(() => {
    if (!GOOGLE_SIGN_IN_CONFIGURED || account) return;
    let cancelled = false;
    init()
      .then((gsi) => {
        if (cancelled) return;
        gsi.accounts.id.prompt((n) => {
          if (cancelled) return;
          if (n.isNotDisplayed()) {
            const reason = n.getNotDisplayedReason();
            // 承認済みオリジンでないときは、ここで気づけるようにしておく
            if (reason === "unregistered_origin") setError("このURLは Google Cloud の承認済み JavaScript 生成元に登録されていません");
          }
        });
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [account, init]);

  /** 「Google でログイン」ボタンを描く（One Tap を閉じてしまった人用） */
  const renderButton = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !GOOGLE_SIGN_IN_CONFIGURED) return;
      init()
        .then((gsi) => {
          el.innerHTML = "";
          gsi.accounts.id.renderButton(el, { type: "standard", size: "medium", text: "signin_with", locale: "ja", width: 240 });
        })
        .catch((e: Error) => setError(e.message));
    },
    [init]
  );

  const signOut = useCallback(() => {
    window.google?.accounts?.id.disableAutoSelect();
    saveGoogleAccount(null);
  }, []);

  return { configured: GOOGLE_SIGN_IN_CONFIGURED, account, error, renderButton, signOut };
}
