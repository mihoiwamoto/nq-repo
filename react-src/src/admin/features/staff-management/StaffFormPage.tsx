import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { FACTORIES } from "../../../data/factories";
import { INITIAL_COMPANIES } from "../../../data/companies";
import {
  ROLE_LABELS,
  SYSTEM_AUTHORITY_LABELS,
  SYSTEM_AUTHORITY_OPTIONS,
  type StaffFactoryAssignment,
  type StaffRole,
  type SystemAuthority,
} from "./types";
import { useStaffManagement } from "./StaffManagementContext";
import iconCancelDark from "@images/Icon/cancel.svg";
import { PlusIcon } from "../../components/PlusIcon";

// 本番は 1 工場に権限をチェックボックスで複数選べる。保存するときは権限ごとに 1 件の割り当てにする
type AssignmentRow = { factoryId: string; roles: StaffRole[]; key: number };

// 本番の権限のチェックボックスの並び（ManageType の順）
const ROLE_CHECK_ORDER: StaffRole[] = ["operator", "checker", "approver"];

function groupAssignments(list: StaffFactoryAssignment[]): AssignmentRow[] {
  const rows: AssignmentRow[] = [];
  for (const a of list) {
    const row = rows.find((r) => r.factoryId === a.factoryId);
    if (row) {
      if (!row.roles.includes(a.role)) row.roles.push(a.role);
    } else rows.push({ factoryId: a.factoryId, roles: [a.role], key: nextRowKey++ });
  }
  return rows;
}

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
    existing ? groupAssignments(existing.assignments) : [{ factoryId: "", roles: [], key: nextRowKey++ }]
  );
  const [email, setEmail] = useState(existing?.email ?? "");
  const [password, setPassword] = useState("");
  // 本番（StoreRequest／UpdateRequest）と同じく項目ごとにエラーを出す。文言は本番の lang/ja/validation.php
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleRole(key: number, role: StaffRole) {
    setAssignments((prev) =>
      prev.map((row) =>
        row.key === key
          ? { ...row, roles: row.roles.includes(role) ? row.roles.filter((r) => r !== role) : [...row.roles, role] }
          : row
      )
    );
  }

  function updateAssignment(key: number, patch: Partial<AssignmentRow>) {
    setAssignments((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addAssignmentRow() {
    setAssignments((prev) => [...prev, { factoryId: "", roles: [], key: nextRowKey++ }]);
  }

  function removeAssignmentRow(key: number) {
    setAssignments((prev) => prev.filter((row) => row.key !== key));
  }

  const validAssignments = assignments.flatMap((row) =>
    row.factoryId ? row.roles.map((role) => ({ factoryId: row.factoryId, role })) : []
  );
  const isOnlyOperator = validAssignments.length > 0 && validAssignments.every((row) => row.role === "operator");

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!name) next.name = "名前は必須です。";
    if (!employeeNumber) next.employeeNumber = "社員番号は必須です。";
    if (!systemAuthority) next.systemAuthority = "システム権限は必須です。";
    if (!companyId) next.companyId = "企業を入力してください。";
    if (!assignments.some((row) => row.factoryId)) next.factories = "複数の工場は必須です。";
    else if (validAssignments.length === 0) next.roles = "工場権限は必須です。";
    if (!isOnlyOperator) {
      const passwordRequired = !isEditing || !existing?.hasPassword;
      if (!password) {
        if (passwordRequired) next.password = "パスワードは必須です。";
      } else if (password.length < 8 || password.length > 64)
        next.password = "パスワードは8〜64文字の間で入力してください。";
      else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/.test(password))
        next.password = "パスワードは英数字記号を組み合わせてください。";
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
        next.email = "メールアドレスは有効なメールアドレス形式で入力してください。";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const input = {
      name,
      employeeNumber,
      systemAuthority: systemAuthority as SystemAuthority,
      companyId,
      assignments: validAssignments,
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
              {!isEditing && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
            </div>
            <p className="text-sm text-[#808080]">※アプリ・管理画面に表示される名前になります。</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）山田太郎"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
            {errors.name && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">社員番号</p>
              {!isEditing && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
            </div>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="0123456"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
            {errors.employeeNumber && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.employeeNumber}</p>}
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">システム権限</p>
              {!isEditing && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
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
            {errors.systemAuthority && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.systemAuthority}</p>}
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">企業</p>
              {!isEditing && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
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
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
              >
                <PlusIcon />
                新規登録
              </Link>
            </div>
            {errors.companyId && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.companyId}</p>}
          </div>

          <div className="flex flex-col gap-6 items-start w-full">
            {assignments.map((row, index) => (
              <div key={row.key} className="flex flex-col gap-1 items-start w-full">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex gap-2 items-center">
                      <p className="text-xl text-[var(--semantic-text-primary)]">工場</p>
                      {!isEditing && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
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
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
                        >
                          <PlusIcon />
                          新規登録
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
                    {!isEditing && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
                  </div>
                  <div className="flex gap-6 items-center h-12">
                    {ROLE_CHECK_ORDER.map((role) => (
                      <label key={role} className="flex gap-2 items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.roles.includes(role)}
                          onChange={() => toggleRole(row.key, role)}
                          className="size-5 accent-[var(--semantic-brand-primary)]"
                        />
                        <span className="text-base text-[var(--semantic-text-primary)]">{ROLE_LABELS[role]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addAssignmentRow}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
            >
              <PlusIcon />
              工場を追加登録
            </button>
            {errors.factories && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.factories}</p>}
            {errors.roles && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.roles}</p>}
          </div>

          {!isOnlyOperator && (
            <>
              <div className="flex flex-col gap-1 items-start w-[480px]">
                <div className="flex gap-2 items-center">
                  <p className="text-xl text-[var(--semantic-text-primary)]">メールアドレス</p>
                  {!isEditing && <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isEditing ? "入力テキスト" : "example@example.com"}
                  autoComplete="off"
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
                />
                {errors.email && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-1 items-start w-[480px]">
                <div className="flex gap-2 items-center">
                  <p className="text-xl text-[var(--semantic-text-primary)]">パスワード</p>
                  {!isEditing && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
                </div>
                <p className="text-sm text-[#808080]">
                  管理画面のログイン時使用するパスワードになります。
                  <br />
                  {isEditing && (
                    <>
                      変更しない場合は、空欄のままで構いません。
                      <br />
                    </>
                  )}
                  ※8文字以上の英数字、大文字、小文字、記号を含む
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? "入力テキスト" : "例）Ex@mple123"}
                  autoComplete="new-password"
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
                />
                {errors.password && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.password}</p>}
              </div>
            </>
          )}
        </div>


        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
