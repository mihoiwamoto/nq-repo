import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Toast } from "../../components/Toast";
import { FACTORIES, getFactoryName } from "../../../data/factories";
import { loadDevices, saveDevices, popNewDeviceQueue, NEW_DEVICE_EVENT } from "../../../data/deviceStore";
import { DEVICE_STATUS_LABELS, type DeviceStatus, type LoginDevice } from "./types";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconReload from "../../../assets/figma/icons/common/reload.svg";

const PAGE_SIZE = 10;

export function DeviceListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [devices, setDevices] = useState<LoginDevice[]>(() => loadDevices());
  const [filterOpen, setFilterOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [factoryInput, setFactoryInput] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ name: "", factoryId: "" });
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("変更が完了しました");
  const [notifiedDeviceId, setNotifiedDeviceId] = useState<string | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.deleted) {
      setToastMessage("削除されました。");
      setShowToast(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  // アプリ側で初めてログインした端末を、管理画面を開いた時点で通知キューに積む
  useEffect(() => {
    const queued = popNewDeviceQueue();
    if (queued.length > 0) setNotificationQueue((prev) => [...prev, ...queued]);
  }, []);

  // 同一タブでの新規端末登録、他タブでのログイン端末データ変更を検知する
  useEffect(() => {
    function handleNewDevice(e: Event) {
      const device = (e as CustomEvent<LoginDevice>).detail;
      setDevices(loadDevices());
      if (device) setNotificationQueue((prev) => [...prev, device.id]);
    }
    function handleStorage() {
      setDevices(loadDevices());
    }
    window.addEventListener(NEW_DEVICE_EVENT, handleNewDevice);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(NEW_DEVICE_EVENT, handleNewDevice);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // 通知キューに積まれた端末を、ログイン端末認証ダイアログとして1件ずつ表示する
  useEffect(() => {
    if (notifiedDeviceId || notificationQueue.length === 0) return;
    const [nextId, ...rest] = notificationQueue;
    setNotificationQueue(rest);
    const device = devices.find((d) => d.id === nextId && d.status === "pending");
    if (device) setNotifiedDeviceId(device.id);
  }, [notificationQueue, notifiedDeviceId, devices]);

  const filtered = useMemo(
    () =>
      devices.filter((device) => {
        if (appliedFilters.name && !device.name.includes(appliedFilters.name)) return false;
        if (appliedFilters.factoryId && device.factoryId !== appliedFilters.factoryId) return false;
        return true;
      }),
    [devices, appliedFilters]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const notifiedDevice = devices.find((d) => d.id === notifiedDeviceId) ?? null;

  function handleSearch() {
    setAppliedFilters({ name: nameInput, factoryId: factoryInput });
    setPage(1);
  }

  function handleReset() {
    setNameInput("");
    setFactoryInput("");
    setAppliedFilters({ name: "", factoryId: "" });
    setPage(1);
  }

  function updateStatus(id: string, status: DeviceStatus) {
    setDevices((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, status } : d));
      saveDevices(next);
      return next;
    });
    setToastMessage("変更が完了しました");
    setShowToast(true);
  }

  function handleDelete() {
    if (!deleteTargetId) return;
    setDevices((prev) => {
      const next = prev.filter((d) => d.id !== deleteTargetId);
      saveDevices(next);
      return next;
    });
    setDeleteTargetId(null);
    navigate("/admin/devices/deleted", { state: { deleted: true } });
  }

  function handleRefresh() {
    setDevices(loadDevices());
    setPage(1);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  }

  function closeNotification() {
    setNotifiedDeviceId(null);
  }

  function approveFromNotification(id: string) {
    updateStatus(id, "authenticated");
    setNotifiedDeviceId(null);
  }

  return (
    <div>
      <PageTitleBar
        title="ログイン端末管理"
        action={
          <button
            type="button"
            onClick={handleRefresh}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            <span
              aria-hidden
              className={`inline-block size-4 shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                WebkitMaskImage: `url("${iconReload}")`,
                maskImage: `url("${iconReload}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "white",
              }}
            />
            更新
          </button>
        }
      />
      <div className="flex flex-col gap-6 items-end p-6">
        <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex gap-2 items-center text-base text-[var(--semantic-brand-primary)]"
          >
            絞り込み検索 {filterOpen ? "−" : "+"}
          </button>
          {filterOpen && (
            <div className="flex gap-4 items-center w-full flex-wrap">
              <Pulldown
                value={factoryInput}
                onChange={setFactoryInput}
                options={FACTORIES.map((factory) => ({ value: factory.id, label: factory.name }))}
                placeholder="工場選択"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[240px]"
              />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="端末名で探す"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[300px] placeholder:text-[#808080]"
              />
              <div className="flex-1" />
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white border border-[#808080] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg text-sm text-[#808080]"
                >
                  リセット
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg text-base text-white"
                >
                  検索
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start w-full rounded-lg overflow-hidden">
          <div className="bg-[#f6f6f6] flex h-10 items-center w-full">
            <div className="flex-1 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-left w-full">
                ログイン端末名
              </p>
            </div>
            <div className="flex-1 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-left w-full">工場名</p>
            </div>
            <div className="w-40 h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-left w-full">
                ステータス
              </p>
            </div>
            <div className="w-[120px] h-full flex items-center px-2">
              <p className="text-sm text-[var(--semantic-brand-primary)] text-left w-full">操作</p>
            </div>
          </div>
          {pageItems.length === 0 ? (
            <div className="bg-white flex h-14 items-center w-full px-2">
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                該当するログイン端末がありません
              </p>
            </div>
          ) : (
            pageItems.map((device, index) => (
              <div
                key={device.id}
                className={`flex h-14 items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
              >
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">{device.name}</p>
                </div>
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm text-[var(--semantic-text-primary)] truncate">
                    {getFactoryName(device.factoryId)}
                  </p>
                </div>
                <div className="w-40 h-full flex items-center px-2">
                  <Pulldown
                    value={device.status}
                    onChange={(value) => updateStatus(device.id, value as DeviceStatus)}
                    options={[
                      { value: "pending", label: DEVICE_STATUS_LABELS.pending },
                      { value: "authenticated", label: DEVICE_STATUS_LABELS.authenticated },
                    ]}
                    className={`bg-white border border-[#d0d0d0] h-10 px-2 rounded-lg text-sm w-[120px] ${
                      device.status === "authenticated"
                        ? "text-[var(--semantic-brand-primary)]"
                        : "text-[var(--semantic-text-primary)]"
                    }`}
                  />
                </div>
                <div className="w-[120px] h-full flex items-center px-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(device.id)}
                    className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
                  >
                    <img src={iconTrash} alt="削除" className="size-6" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-white size-8 rounded-lg flex items-center justify-center text-[var(--semantic-text-primary)] disabled:opacity-40"
            >
              <span
                aria-hidden
                className="inline-block size-4 shrink-0"
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`size-8 rounded-lg flex items-center justify-center text-sm ${
                  num === currentPage
                    ? "bg-[var(--semantic-brand-primary)] text-white"
                    : "bg-white text-[var(--semantic-text-primary)]"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-white size-8 rounded-lg flex items-center justify-center text-[var(--semantic-text-primary)] disabled:opacity-40"
            >
              <span
                aria-hidden
                className="inline-block size-4 shrink-0"
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
        )}
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTargetId(null)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                ログイン端末情報を削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {notifiedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => closeNotification()} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                ログイン端末認証
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                下記端末のログインを許可しますか？
              </p>
              <div className="bg-white flex flex-col gap-2 items-start px-4 py-4 rounded-lg w-full">
                <div className="flex gap-4 items-center w-full">
                  <span className="w-24 shrink-0 text-base text-[var(--semantic-brand-primary)]">
                    デバイス
                  </span>
                  <span className="text-base text-[var(--semantic-text-primary)]">
                    {notifiedDevice.name}
                  </span>
                </div>
                <div className="flex gap-4 items-center w-full">
                  <span className="w-24 shrink-0 text-base text-[var(--semantic-brand-primary)]">
                    工場
                  </span>
                  <span className="text-base text-[var(--semantic-text-primary)]">
                    {getFactoryName(notifiedDevice.factoryId)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => closeNotification()}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                保留
              </button>
              <button
                type="button"
                onClick={() => approveFromNotification(notifiedDevice.id)}
                className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                認証する
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
