import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { FACTORIES } from "../../../data/factories";
import { INITIAL_COMPANIES } from "../../../data/companies";
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  SYSTEM_AUTHORITY_LABELS,
  SYSTEM_AUTHORITY_OPTIONS,
  type StaffFactoryAssignment,
  type StaffRole,
  type SystemAuthority,
} from "./types";
import { useStaffManagement } from "./StaffManagementContext";
import iconCancelDark from "@images/Icon/cancel.svg";

type AssignmentRow = StaffFactoryAssignment & { key: number };

let nextRowKey = 1;

export function StaffFormPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const isEditing = Boolean(staffId);
  const { staff, addStaff, updateStaff } = useStaffManagement();
  const navigate = useNavigate();
  const existing = staff.find((s) => s.id === staffId);

  const [name, setName] = useState(existing?.name ?? "");
  const [employeeNumber, setEmployeeNumber] = useState(existing?.employeeNumber ?? "");
  const [systemAuthority, setSystemAuthority] = useState<SystemAuthority | "">(
    existing?.systemAuthority ?? ""
  );
  const [companyId, setCompanyId] = useState(existing?.companyId ?? "");
  const [assignments, setAssignments] = useState<AssignmentRow[]>(
    existing?.assignments.map((a) => ({ ...a, key: nextRowKey++ })) ?? [
      { factoryId: "", role: "" as StaffRole | "", key: nextRowKey++ } as AssignmentRow,
    ]
  );
  const [email, setEmail] = useState(existing?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function updateAssignment(key: number, patch: Partial<StaffFactoryAssignment>) {
    setAssignments((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addAssignmentRow() {
    setAssignments((prev) => [...prev, { factoryId: "", role: "" as StaffRole | "", key: nextRowKey++ } as AssignmentRow]);
  }

  function removeAssignmentRow(key: number) {
    setAssignments((prev) => prev.filter((row) => row.key !== key));
  }

  const validAssignments = assignments.filter((row) => row.factoryId && row.role);
  const isOnlyOperator = validAssignments.length > 0 && validAssignments.every((row) => row.role === "operator");

  function handleSubmit() {
    if (
      !name ||
      !employeeNumber ||
      !systemAuthority ||
      !companyId ||
      validAssignments.length === 0 ||
      (!isOnlyOperator && !password)
    ) {
      setError("必須項目を入力してください");
      return;
    }
    const input = {
      name,
      employeeNumber,
      systemAuthority,
      companyId,
      assignments: validAssignments.map(({ factoryId, role }) => ({
        factoryId,
        role: role as StaffRole,
      })),
      email,
      password,
    };
    if (isEditing && existing) {
      updateStaff(existing.id, input);
      navigate(`/admin/staff/${existing.id}`, { state: { justSaved: true } });
    } else {
      addStaff(input);
      navigate("/admin/staff/new/complete");
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={
          isEditing
            ? [
                { label: "職員管理", to: "/admin/staff" },
                { label: "詳細", to: `/admin/staff/${staffId}` },
                { label: "編集" },
              ]
            : [{ label: "職員管理", to: "/admin/staff" }, { label: "新規登録" }]
        }
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">名前</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <p className="text-sm text-[#808080]">アプリ・管理画面に表示される名前になります。</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）山田太郎"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">社員番号</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="例）012345"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">システム権限</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <Pulldown
              value={systemAuthority}
              onChange={(value) => setSystemAuthority(value as SystemAuthority)}
              options={SYSTEM_AUTHORITY_OPTIONS.map((option) => ({
                value: option,
                label: SYSTEM_AUTHORITY_LABELS[option],
              }))}
              placeholder="選択してください"
              className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">企業</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <div className="flex gap-6 items-center">
              <Pulldown
                value={companyId}
                onChange={setCompanyId}
                options={INITIAL_COMPANIES.map((company) => ({ value: company.id, label: company.name }))}
                placeholder="選択してください"
                className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
              />
              <Link
                to="/admin/company/new"
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
              >
                + 新規登録
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 items-start w-full">
            {assignments.map((row, index) => (
              <div key={row.key} className="flex flex-col gap-1 items-start w-full">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex gap-2 items-center">
                      <p className="text-xl text-[var(--semantic-text-primary)]">工場</p>
                      <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
                    </div>
                    <div className="flex gap-6 items-center">
                      <Pulldown
                        value={row.factoryId}
                        onChange={(value) => updateAssignment(row.key, { factoryId: value })}
                        options={FACTORIES.map((factory) => ({ value: factory.id, label: factory.name }))}
                        placeholder="選択してください"
                        className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
                      />
                      {index === 0 && (
                        <Link
                          to="/admin/factory/new"
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
                        >
                          + 新規登録
                        </Link>
                      )}
                    </div>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAssignmentRow(row.key)}
                      className="bg-white border border-[#d0d0d0] rounded-full size-8 flex items-center justify-center text-[var(--semantic-text-secondary)] mt-6"
                      aria-label="削除"
                    >
                      <img src={iconCancelDark} alt="" aria-hidden="true" className="size-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start pl-6 border-l border-[#d0d0d0]">
                  <div className="flex gap-2 items-center">
                    <p className="text-xl text-[var(--semantic-text-primary)]">権限</p>
                    <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
                  </div>
                  <Pulldown
                    value={row.role}
                    onChange={(value) => updateAssignment(row.key, { role: value as StaffRole })}
                    options={ROLE_OPTIONS.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
                    placeholder="選択してください"
                    className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addAssignmentRow}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
            >
              + 工場追加
            </button>
          </div>

          {!isOnlyOperator && (
            <>
              <div className="flex flex-col gap-1 items-start w-[480px]">
                <div className="flex gap-2 items-center">
                  <p className="text-xl text-[var(--semantic-text-primary)]">メールアドレス</p>
                  <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@example.com"
                  autoComplete="off"
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
                />
              </div>

              <div className="flex flex-col gap-1 items-start w-[480px]">
                <div className="flex gap-2 items-center">
                  <p className="text-xl text-[var(--semantic-text-primary)]">パスワード</p>
                  <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
                </div>
                <p className="text-sm text-[#808080]">
                  管理画面のログイン時使用するパスワードになります。
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="例）Ex@mple123"
                  autoComplete="new-password"
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
                />
              </div>
            </>
          )}
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
