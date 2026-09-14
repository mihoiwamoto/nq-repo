import { useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useScaleInspection } from "./ScaleInspectionContext";
import { PostProgressPanel } from "./PostProgressPanel";
import { POST_STATUS_COLORS, POST_STATUS_LABELS } from "./mockData";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import { StatusChip } from "../../components/StatusChip";

export function PostSelectionPage() {
  const { posts } = useScaleInspection();
  const [progressOpen, setProgressOpen] = useState(false);

  const inspectedCount = posts.filter((post) => post.status === "inspected").length;
  const inspectedPosts = posts.filter((post) => post.status === "inspected");

  return (
    <>
      <AppHeader
        title="秤点検記録"
        action={
          <button
            type="button"
            onClick={() => setProgressOpen(true)}
            className="bg-[var(--semantic-brand-primary)] flex items-center rounded-lg overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
          >
            <span
              aria-hidden
              className="inline-block size-5 shrink-0 mx-2 text-white"
              style={{
                WebkitMaskImage: `url("${iconArrowLeft}")`,
                maskImage: `url("${iconArrowLeft}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "currentColor",
              }}
            />
            <span className="bg-white flex flex-col items-center justify-center gap-0 px-2 py-1">
              <span className="text-xs text-[var(--semantic-brand-primary)] font-semibold">点検済み</span>
              <span className="text-lg text-[var(--semantic-brand-primary)] leading-none font-bold">
                {inspectedCount}/{posts.length}
              </span>
            </span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center relative">
        <div className="flex flex-col gap-6 items-start w-full max-w-full">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/app/ledger-list/scale-inspection/posts/${post.id}`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg w-full"
            >
              <p className="flex-1 text-lg text-[var(--semantic-text-primary)]">{post.name}</p>
              <StatusChip color={POST_STATUS_COLORS[post.status]}>{POST_STATUS_LABELS[post.status]}</StatusChip>
            </Link>
          ))}
        </div>

        {/* 上の余白は親の gap(24px) + mt-4 = 40px */}
        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex items-center justify-center mt-4 px-4 py-6 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>

      {progressOpen && <PostProgressPanel posts={posts} inspectedPosts={inspectedPosts} onClose={() => setProgressOpen(false)} />}
    </>
  );
}
