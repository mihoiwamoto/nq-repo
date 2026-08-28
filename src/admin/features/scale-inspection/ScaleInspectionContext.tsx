import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { initialScaleInspectionPosts, initialScaleInspectionScales } from "./mockData";
import type { ScaleInspectionPost, ScaleInspectionScale, ScaleRepairStatus } from "./types";

type PostInput = Omit<ScaleInspectionPost, "id">;
type ScaleInput = Omit<ScaleInspectionScale, "id">;

type ScaleInspectionContextValue = {
  posts: ScaleInspectionPost[];
  scales: ScaleInspectionScale[];
  addPost: (input: PostInput) => ScaleInspectionPost;
  updatePost: (id: string, input: PostInput) => void;
  removePost: (id: string) => void;
  addScale: (input: ScaleInput) => ScaleInspectionScale;
  updateScale: (id: string, input: ScaleInput) => void;
  removeScale: (id: string) => void;
  setScaleRepairStatus: (id: string, status: ScaleRepairStatus | null) => void;
  moveScale: (id: string, direction: "up" | "down") => void;
  movePost: (id: string, direction: "up" | "down") => void;
};

const ScaleInspectionContext = createContext<ScaleInspectionContextValue | null>(null);

export function ScaleInspectionProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<ScaleInspectionPost[]>(initialScaleInspectionPosts);
  const [scales, setScales] = useState<ScaleInspectionScale[]>(initialScaleInspectionScales);

  const value = useMemo<ScaleInspectionContextValue>(
    () => ({
      posts,
      scales,
      addPost: (input) => {
        const created: ScaleInspectionPost = { id: `post${Date.now()}`, ...input };
        setPosts((prev) => [...prev, created]);
        return created;
      },
      updatePost: (id, input) => {
        setPosts((prev) => prev.map((post) => (post.id === id ? { id, ...input } : post)));
      },
      removePost: (id) => {
        setPosts((prev) => prev.filter((post) => post.id !== id));
      },
      addScale: (input) => {
        const created: ScaleInspectionScale = { id: `scale${Date.now()}`, ...input };
        setScales((prev) => [...prev, created]);
        return created;
      },
      updateScale: (id, input) => {
        setScales((prev) => prev.map((scale) => (scale.id === id ? { id, ...input } : scale)));
      },
      removeScale: (id) => {
        setScales((prev) => prev.filter((scale) => scale.id !== id));
      },
      setScaleRepairStatus: (id, status) => {
        setScales((prev) => prev.map((scale) => (scale.id === id ? { ...scale, repairStatus: status } : scale)));
      },
      moveScale: (id, direction) => {
        setScales((prev) => {
          const scale = prev.find((s) => s.id === id);
          if (!scale) return prev;
          const siblingIds = prev.filter((s) => s.factoryId === scale.factoryId).map((s) => s.id);
          const fromIndex = siblingIds.indexOf(id);
          const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
          if (toIndex < 0 || toIndex >= siblingIds.length) return prev;
          const swappedId = siblingIds[toIndex];
          const fullFromIndex = prev.findIndex((s) => s.id === id);
          const fullToIndex = prev.findIndex((s) => s.id === swappedId);
          const next = [...prev];
          [next[fullFromIndex], next[fullToIndex]] = [next[fullToIndex], next[fullFromIndex]];
          return next;
        });
      },
      movePost: (id, direction) => {
        setPosts((prev) => {
          const post = prev.find((p) => p.id === id);
          if (!post) return prev;
          const siblingIds = prev.filter((p) => p.factoryId === post.factoryId).map((p) => p.id);
          const fromIndex = siblingIds.indexOf(id);
          const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
          if (toIndex < 0 || toIndex >= siblingIds.length) return prev;
          const swappedId = siblingIds[toIndex];
          const fullFromIndex = prev.findIndex((p) => p.id === id);
          const fullToIndex = prev.findIndex((p) => p.id === swappedId);
          const next = [...prev];
          [next[fullFromIndex], next[fullToIndex]] = [next[fullToIndex], next[fullFromIndex]];
          return next;
        });
      },
    }),
    [posts, scales]
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
