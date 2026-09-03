import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useScaleInspection } from "./ScaleInspectionContext";
import { getFactoryName } from "../../../data/factories";

export function PostFormPage() {
  const { factoryId, postId } = useParams<{ factoryId: string; postId: string }>();
  const isEditing = Boolean(postId);
  const { posts, addPost, updatePost } = useScaleInspection();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/scale-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const existing = posts.find((p) => p.id === postId);

  const [name, setName] = useState(existing?.name ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("持ち場名は必須です");
      return;
    }
    const input = { factoryId: factoryId!, name };
    if (isEditing && existing) {
      updatePost(existing.id, input);
      navigate(`${basePath}/posts/${existing.id}`, { state: { justSaved: true } });
    } else {
      addPost(input);
      navigate(`${basePath}/post-management/new/complete`);
    }
  }

  return (
    <div>
      <PageTitleBar title="持ち場管理" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/scale-inspection" },
          { label: "秤点検記録設定", to: basePath },
          { label: "持ち場管理", to: `${basePath}/post-management` },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-6 items-start">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">持ち場名</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）プリン製造ライン"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
