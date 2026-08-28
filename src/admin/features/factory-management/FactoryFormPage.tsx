import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { INITIAL_COMPANIES } from "../../../data/companies";
import { ledgerCategories } from "../../../data/ledgers";
import { buildMonthGrid, formatMonthLabel, WEEKDAY_LABELS } from "./calendarUtils";
import { useFactoryManagement } from "./FactoryManagementContext";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

export function FactoryFormPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const isEditing = Boolean(factoryId);
  const { factories, addFactory, updateFactory } = useFactoryManagement();
  const navigate = useNavigate();
  const existing = factories.find((f) => f.id === factoryId);

  const [name, setName] = useState(existing?.name ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [companyId, setCompanyId] = useState(existing?.companyId ?? "");
  const [loginId, setLoginId] = useState(existing?.loginId ?? "");
  const [password, setPassword] = useState("");
  const [closedDays, setClosedDays] = useState<string[]>(existing?.closedDays ?? []);
  const [ledgerSlugs, setLedgerSlugs] = useState<string[]>(existing?.ledgerSlugs ?? []);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [error, setError] = useState("");

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function toggleClosedDay(dateKey: string) {
    setClosedDays((prev) =>
      prev.includes(dateKey) ? prev.filter((d) => d !== dateKey) : [...prev, dateKey]
    );
  }

  function toggleLedgerSlug(slug: string) {
    setLedgerSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function handleSubmit() {
    if (!name || !companyId || !loginId || (!isEditing && !password) || ledgerSlugs.length === 0) {
      setError("必須項目を入力してください");
      return;
    }
    const input = { name, address, companyId, loginId, closedDays, ledgerSlugs, password };
    if (isEditing && existing) {
      updateFactory(existing.id, input);
      navigate(`/admin/factory/${existing.id}`, { state: { justUpdated: true } });
    } else {
      addFactory(input);
      navigate("/admin/factory/new/complete");
    }
  }

  const grid = buildMonthGrid(year, month);
  const closedDaySet = new Set(closedDays);

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "工場管理", to: "/admin/factory" },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">工場名</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）㈱西原食品 本社工場"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <p className="text-xl text-[var(--semantic-text-primary)]">工場住所</p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例）鹿児島県鹿児島市本名町1744番地1号"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
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

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">工場ID</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <p className="text-sm text-[#808080]">アプリのログイン時使用するIDになります。</p>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="例）000000"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">パスワード</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">
                {isEditing ? "※任意" : "※必須"}
              </span>
            </div>
            <p className="text-sm text-[#808080]">
              アプリのログイン時使用するパスワードになります。
              <br />
              ※8文字以上の英数字、記号を含む
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="例）Ex@mple123"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-3 items-start w-full">
            <div className="flex flex-col gap-1 items-start">
              <div className="flex gap-2 items-center">
                <p className="text-xl text-[var(--semantic-text-primary)]">休業日</p>
                <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
              </div>
              <p className="text-sm text-[#808080]">休業日をカレンダーで選択してください。</p>
            </div>
            <div className="flex flex-col gap-2 items-start">
              <div className="flex items-center justify-between w-[560px]">
                <button
                  type="button"
                  onClick={() => goToMonth(-1)}
                  className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
                >
                  <span
                    aria-hidden
                    className="inline-block size-5 shrink-0"
                    style={{
                      WebkitMaskImage: `url("${iconArrowLeft}")`,
                      maskImage: `url("${iconArrowLeft}")`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      backgroundColor: "var(--semantic-brand-primary)",
                    }}
                  />
                </button>
                <p className="text-xl text-[var(--semantic-text-primary)]">
                  {formatMonthLabel(year, month)}
                </p>
                <button
                  type="button"
                  onClick={() => goToMonth(1)}
                  className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
                >
                  <span
                    aria-hidden
                    className="inline-block size-5 shrink-0"
                    style={{
                      WebkitMaskImage: `url("${iconArrowRight}")`,
                      maskImage: `url("${iconArrowRight}")`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      backgroundColor: "var(--semantic-brand-primary)",
                    }}
                  />
                </button>
              </div>
              <div className="bg-white rounded-lg overflow-hidden w-[560px]">
                <div className="flex items-center">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className={`bg-white border border-[#d0d0d0] flex items-center justify-center p-2 h-8 w-20 text-base ${
                        i === 0
                          ? "text-[var(--semantic-brand-danger)]"
                          : i === 6
                            ? "text-[#1057f0]"
                            : "text-[var(--semantic-text-primary)]"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap">
                  {grid.map((cell) => {
                    const isClosed = cell.monthOffset === 0 && closedDaySet.has(cell.dateKey);
                    const weekday = new Date(cell.dateKey).getDay();
                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        disabled={cell.monthOffset !== 0}
                        onClick={() => toggleClosedDay(cell.dateKey)}
                        className={`flex flex-col gap-1 items-end p-1 h-16 w-20 border border-[#d0d0d0] ${
                          isClosed ? "bg-[#ddf3e7]" : "bg-white"
                        }`}
                      >
                        <span
                          className={`text-base ${
                            cell.monthOffset !== 0
                              ? "text-[#d0d0d0]"
                              : weekday === 0
                                ? "text-[var(--semantic-brand-danger)]"
                                : weekday === 6
                                  ? "text-[#1057f0]"
                                  : "text-[var(--semantic-text-primary)]"
                          }`}
                        >
                          {cell.day}
                        </span>
                        {isClosed && (
                          <span className="bg-[var(--semantic-brand-primary)] text-white text-sm rounded-lg px-2 py-1 w-full text-center">
                            休業日
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-start w-full">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">点検項目</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <div className="flex flex-wrap gap-6 items-start">
              {ledgerCategories.map((category) => {
                const checked = ledgerSlugs.includes(category.slug);
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => toggleLedgerSlug(category.slug)}
                    className={`bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-16 w-[270px] flex items-center gap-2 px-2 border ${
                      checked ? "border-[var(--semantic-brand-primary)]" : "border-transparent"
                    }`}
                  >
                    <span
                      className={`size-5 rounded shrink-0 border ${
                        checked
                          ? "bg-[var(--semantic-brand-primary)] border-[var(--semantic-brand-primary)]"
                          : "bg-white border-[#d0d0d0]"
                      }`}
                    />
                    <img src={category.adminIcon} alt="" className="size-6 shrink-0" />
                    <span className="text-base text-[var(--semantic-text-primary)] truncate">
                      {category.adminLabel}
                    </span>
                  </button>
                );
              })}
            </div>
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
