import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useDemoInspectionState } from "../../../components/demo/demoStore";
import { Outlet } from "react-router-dom";
import {
  posts as initialPosts,
  scalesByPost as initialScalesByPost,
  type Post,
  type Scale,
  type ScaleRecord,
} from "./mockData";

type ScaleInspectionContextValue = {
  posts: Post[];
  submitPost: (postId: string, info: { date: string; inspectorName: string }) => void;
  scalesByPost: Record<string, Scale[]>;
  addScaleWithId: (
    postId: string,
    id: string,
    source: { label: string; serialNumber: string; referenceWeight: number }
  ) => void;
  saveScaleRecord: (postId: string, scaleId: string, record: ScaleRecord) => void;
  skipScale: (postId: string, scaleId: string, skipReason: string) => void;
  /**
   * 進捗一覧のステータスに合わせて、持ち場の秤の記録をまとめて差し替える。
   * 一覧だけで記録を作ると詳細・確認画面が空のままになるため、
   * 記録そのものをここに入れて画面間で共有する。
   * 同じ `seedKey`（持ち場 + 記録の入り具合）では 1 回だけ効く
   * ＝ 詳細画面から戻ってきたときに入力は消さないが、
   * 別のステータスで同じ持ち場を開き直したときは入れ直す。
   *
   * `clearScales` を渡すと記録ではなく秤の行そのものを消す。未点検は「まだ 1 台も
   * 点検していない」状態なので表を空にする。確認画面も同じ state を読むため、
   * ここで消さないと確認画面にだけ秤が並んでしまう。
   */
  seedPostRecords: (
    postId: string,
    recordByScaleId: Record<string, ScaleRecord | null>,
    seedKey: string,
    options?: { clearScales?: boolean }
  ) => void;
};

const ScaleInspectionContext = createContext<ScaleInspectionContextValue | null>(null);

export function ScaleInspectionProvider({ children }: { children: ReactNode }) {
  // 動作デモ「データが無い」のときは、まだ 1 件も点検していない状態から始める
  const [posts, setPosts] = useDemoInspectionState<Post>(initialPosts);
  const [scalesByPost, setScalesByPost] = useState<Record<string, Scale[]>>(initialScalesByPost);
  // 進捗一覧由来の記録を流し込み済みの持ち場。一覧を開き直すたびに上書きしないための目印。
  // 値は流し込んだときの seedKey（持ち場 + 記録の入り具合）
  const seededPosts = useRef<Map<string, string>>(new Map());

  const value = useMemo<ScaleInspectionContextValue>(
    () => ({
      posts,
      submitPost: (postId, info) => {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, status: "inspected", date: info.date, inspectorName: info.inspectorName }
              : post
          )
        );
      },
      scalesByPost,
      addScaleWithId: (postId, id, source) => {
        setScalesByPost((prev) => {
          const scales = prev[postId] ?? [];
          const scale: Scale = {
            id,
            label: source.label,
            serialNumber: source.serialNumber,
            referenceWeight: source.referenceWeight,
            record: null,
            skipped: false,
            skipReason: "",
          };
          return { ...prev, [postId]: [...scales, scale] };
        });
      },
      saveScaleRecord: (postId, scaleId, record) => {
        setScalesByPost((prev) => {
          const scales = prev[postId] ?? [];
          return {
            ...prev,
            [postId]: scales.map((scale) =>
              scale.id === scaleId ? { ...scale, record, skipped: false, skipReason: "" } : scale
            ),
          };
        });
      },
      seedPostRecords: (postId, recordByScaleId, seedKey, options) => {
        if (seededPosts.current.get(postId) === seedKey) return;
        seededPosts.current.set(postId, seedKey);
        setScalesByPost((prev) => {
          if (options?.clearScales) {
            if ((prev[postId] ?? []).length === 0) return prev;
            return { ...prev, [postId]: [] };
          }
          const current = prev[postId] ?? [];
          // 未点検で空にしたあと別のステータスで開き直したときは、登録されている秤に戻す
          const scales = current.length > 0 ? current : initialScalesByPost[postId] ?? [];
          const next = scales.map((scale) => {
            const record = recordByScaleId[scale.id] ?? null;
            if (scale.record === record) return scale;
            return { ...scale, record, skipped: false, skipReason: "" };
          });
          if (scales === current && next.every((scale, index) => scale === scales[index])) return prev;
          return { ...prev, [postId]: next };
        });
      },
      skipScale: (postId, scaleId, skipReason) => {
        setScalesByPost((prev) => {
          const scales = prev[postId] ?? [];
          return {
            ...prev,
            [postId]: scales.map((scale) =>
              scale.id === scaleId ? { ...scale, skipped: true, skipReason, record: null } : scale
            ),
          };
        });
      },
    }),
    [posts, scalesByPost]
  );

  return <ScaleInspectionContext.Provider value={value}>{children}</ScaleInspectionContext.Provider>;
}

export function ScaleInspectionProviderOutlet() {
  return (
    <ScaleInspectionProvider>
      <Outlet />
    </ScaleInspectionProvider>
  );
}

export function useScaleInspection() {
  const ctx = useContext(ScaleInspectionContext);
  if (!ctx) throw new Error("useScaleInspection must be used within ScaleInspectionProvider");
  return ctx;
}
