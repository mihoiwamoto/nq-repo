import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
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
};

const ScaleInspectionContext = createContext<ScaleInspectionContextValue | null>(null);

export function ScaleInspectionProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [scalesByPost, setScalesByPost] = useState<Record<string, Scale[]>>(initialScalesByPost);

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
