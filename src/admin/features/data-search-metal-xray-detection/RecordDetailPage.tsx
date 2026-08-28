import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import type { InspectionResult, MachineSearchRecord } from "./types";

const RESULT_LABELS: Record<InspectionResult, string> = { OK: "正常", NG: "異常あり" };
const RESULT_COLORS: Record<InspectionResult, string> = {
  OK: "var(--semantic-status-success)",
  NG: "var(--semantic-status-error)",
};

function StatusTag({ status }: { status: string }) {
  const isError = status === "異常あり";
  return (
    <div className={`flex h-7 items-center justify-center px-2 rounded-lg text-sm text-white w-[88px] ${isError ? "bg-[var(--semantic-status-error)]" : "bg-[var(--semantic-status-success)]"}`}>
      <p>{status}</p>
    </div>
  );
}

function ResultTag({ result }: { result: InspectionResult }) {
  return (
    <span
      className="h-7 w-22 rounded-lg flex items-center justify-center text-sm text-white shrink-0"
      style={{ backgroundColor: RESULT_COLORS[result] }}
    >
      {RESULT_LABELS[result]}
    </span>
  );
}

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function formatDateTime(date: string, time: string) {
  return `${formatDate(date)} ${time}`;
}

const METAL_CHECKS = [
  { id: "power", label: "電源ON", detail: "電源が正常に入り始動する" },
  { id: "panel", label: "操作パネル", detail: "操作パネルに異常がなく操作できる" },
  { id: "compare", label: "コンベア・プーリー・モーター", detail: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
  { id: "roller", label: "ローラー", detail: "ローラーに引っ掛かりがないか（サーチコイルに接触していないか）" },
  { id: "setting", label: "設定", detail: "各設定基準が正しいか" },
  { id: "lever", label: "はね板（フリッパー）", detail: "正常に反応し作動する" },
];

const XRAY_CHECKS = [
  { id: "power", label: "電源ON", detail: "電源が正常に入り始動する" },
  { id: "panel", label: "操作パネル", detail: "操作パネルに異常がなく操作できる" },
  { id: "sensor", label: "コンベア・センサー", detail: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
  { id: "contact", label: "機械同士の接触が無いか", detail: "機械同士の接触が無いか" },
  { id: "lever", label: "はね板（フリッパー）", detail: "正常に反応し作動する" },
];

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/metal-xray-detection/factories/${factoryId}`;

  useLayoutEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
    requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (main) {
        main.scrollTop = 0;
      }
    });
  }, [recordId]);

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const inspectionRecord = record.records.find((r) => r.content === "異常反応");
  const operationCheckRecord = record.records.find((r) => r.content === "動作確認");

  if (operationCheckRecord?.content === "動作確認") {
    return <OperationCheckDetailPage record={record} factoryName={factoryName} recordId={recordId} basePath={basePath} />;
  }

  if (inspectionRecord?.content === "異常反応") {
    return (
      <div>
        <PageTitleBar title="詳細" showBack />
        <Breadcrumb
          items={[
            { label: "データ検索", to: "/admin/data-search" },
            { label: "工場選択", to: "/admin/data-search/metal-xray-detection" },
            { label: "データ一覧", to: basePath },
            { label: "点検内容一覧", to: `${basePath}/records/${recordId}` },
            { label: "詳細" },
          ]}
        />
        <div className="flex flex-col gap-4 p-6">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
            <p className="text-xl text-[#333]">{factoryName}</p>
          </div>

          <div className="bg-white rounded-lg w-full overflow-hidden">
            <div className="flex flex-col gap-3 px-4 py-6">
              {/* 実施者 */}
              <div className="flex gap-6 items-center justify-center w-full">
                <div className="flex-1">
                  <p className="text-xl font-semibold text-[#333]">実施者</p>
                </div>
                <p className="text-xl text-[#333]">{inspectionRecord.inspectorName}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 点検内容 */}
              <div className="flex gap-6 items-center justify-center w-full">
                <div className="flex-1">
                  <p className="text-xl font-semibold text-[#333]">点検内容</p>
                </div>
                <p className="text-xl text-[#333]">{inspectionRecord.content}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 点検時間 */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex gap-6 items-center justify-between w-full">
                  <p className="text-xl font-semibold text-[#333]">点検時間</p>
                  <p className="text-xl text-[#333]">{inspectionRecord.time}</p>
                </div>
                <p className="text-xs text-[#808080] text-right w-full">{inspectionRecord.inspectorName} 2026/08/27 {inspectionRecord.time}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 異常製品 */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex gap-6 items-center justify-between w-full">
                  <p className="text-xl font-semibold text-[#333]">異常製品</p>
                  <p className="text-xl text-[#333]">{inspectionRecord.passedProduct}</p>
                </div>
                <p className="text-xs text-[#808080] text-right w-full">{inspectionRecord.inspectorName} 2026/08/27 {inspectionRecord.time}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 通過数量 */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex gap-6 items-center justify-between w-full">
                  <p className="text-xl font-semibold text-[#333]">通過数量</p>
                  <p className="text-xl text-[#333]">200</p>
                </div>
                <p className="text-xs text-[#808080] text-right w-full">{inspectionRecord.inspectorName} 2026/08/27 {inspectionRecord.time}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 異常数量 */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex gap-6 items-center justify-between w-full">
                  <p className="text-xl font-semibold text-[#333]">異常数量</p>
                  <p className="text-xl text-[#333]">5</p>
                </div>
                <p className="text-xs text-[#808080] text-right w-full">{inspectionRecord.inspectorName} 2026/08/27 {inspectionRecord.time}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 原因 */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-6 items-center justify-between w-full">
                  <p className="text-xl font-semibold text-[#333]">原因</p>
                  <p className="text-xl text-[#333]">異物混入</p>
                </div>
                <p className="text-base text-[#808080]">検査時に金属異物が検知され、金属探知機が反応しました。原因は食材の加工過程で混入した金属片と推定されます。</p>
                <p className="text-xs text-[#808080] text-right w-full">{inspectionRecord.inspectorName} 2026/08/27 {inspectionRecord.time}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 対応 */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-6 items-center justify-between w-full">
                  <p className="text-xl font-semibold text-[#333]">対応</p>
                  <p className="text-xl text-[#333]">点検調整</p>
                </div>
                <p className="text-base text-[#808080]">異常が検知された製品は廃棄処理しました。金属探知機の感度を確認し、キャリブレーションを実施しました。今後は同じロットの製品について追加検査を実施します。</p>
                <p className="text-xs text-[#808080] text-right w-full">{inspectionRecord.inspectorName} 2026/08/27 {inspectionRecord.time}</p>
              </div>
              <div className="h-px bg-[#d0d0d0] w-full" />

              {/* 備考 */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-xl font-semibold text-[#333]">備考</p>
                <p className="text-base text-[#333]">{inspectionRecord.remarks || "検査日時における異常検知について報告いたします。該当製品は速やかに隔離し、廃棄処理を完了いたしました。"}</p>
              </div>
            </div>

            {/* Comments Section */}
            <Comments comments={inspectionRecord.comments || []} />
          </div>
        </div>
      </div>
    );
  }

  const metalItems = record.records.slice(0, METAL_CHECKS.length);
  const xrayItems = record.records.slice(METAL_CHECKS.length, METAL_CHECKS.length + XRAY_CHECKS.length);

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/metal-xray-detection" },
          { label: "データ一覧", to: basePath },
          { label: "点検内容一覧", to: `${basePath}/records/${recordId}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[#333]">{factoryName}</p>
        </div>

        <div className="bg-white rounded-lg w-full overflow-hidden">
          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex gap-6 items-center justify-center w-full">
              <div className="flex-1">
                <p className="text-xl font-semibold text-[#333]">実施者</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xl text-[#333]">田中太郎</p>
                <p className="text-xl text-[#333]">佐藤花子</p>
              </div>
            </div>
            <div className="h-px bg-[#d0d0d0] w-full" />
            <div className="flex gap-6 items-center justify-center w-full">
              <div className="flex-1">
                <p className="text-xl font-semibold text-[#333]">点検内容</p>
              </div>
              <p className="text-xl text-[#333]">動作確認</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0]" />

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="bg-[#094] flex flex-col gap-2 items-start justify-center p-2 rounded-lg w-full">
              <div className="flex gap-6 items-center justify-center w-full">
                <div className="flex-1">
                  <p className="text-xl font-semibold text-white">金属探知機</p>
                </div>
                <p className="text-xl font-semibold text-white">{record.metalDetectorModel}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-center justify-center w-full">
              <div className="flex gap-6 items-center justify-between w-full">
                <p className="text-xl text-[#333]">点検時間</p>
                <p className="text-xl text-[#333]">08:25</p>
              </div>
              <p className="text-xs text-[#808080] text-right w-full">田中太郎 2026/08/27 08:25</p>
            </div>

            <div className="h-px bg-[#d0d0d0] w-full" />

            {METAL_CHECKS.map((check, index) => {
              const recordItem = metalItems[index];
              return (
                <div key={check.id} className="flex flex-col gap-2">
                  <p className="text-xl font-semibold text-[#094]">{check.label}</p>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[#333]">{check.detail}</p>
                    <StatusTag status="正常" />
                  </div>
                  <p className="text-xs text-[#808080] text-right w-full">田中太郎 2026/08/27 08:25</p>
                  {index < METAL_CHECKS.length - 1 && <div className="h-px bg-[#d0d0d0] w-full" />}
                </div>
              );
            })}

            <div className="h-px bg-[#d0d0d0] w-full mt-4" />

            {/* Metal Detector Comments */}
            <div className="pt-4">
              <Comments comments={record.metalComments || []} />
            </div>
          </div>

          <div className="border-t border-[#d0d0d0]" />

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="bg-[#094] flex flex-col gap-2 items-start justify-center p-2 rounded-lg w-full">
              <div className="flex gap-6 items-center justify-center w-full">
                <div className="flex-1">
                  <p className="text-xl font-semibold text-white">X線探知機</p>
                </div>
                <p className="text-xl font-semibold text-white">{record.xrayDetectorModel}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-center justify-center w-full">
              <div className="flex gap-6 items-center justify-between w-full">
                <p className="text-xl text-[#333]">点検時間</p>
                <p className="text-xl text-[#333]">08:25</p>
              </div>
              <p className="text-xs text-[#808080] text-right w-full">田中太郎 2026/08/27 08:25</p>
            </div>

            <div className="h-px bg-[#d0d0d0] w-full" />

            {XRAY_CHECKS.map((check, index) => {
              const recordItem = xrayItems[index];
              return (
                <div key={check.id} className="flex flex-col gap-2">
                  <p className="text-xl font-semibold text-[#094]">{check.label}</p>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[#333]">{check.detail}</p>
                    <StatusTag status="正常" />
                  </div>
                  <p className="text-xs text-[#808080] text-right w-full">田中太郎 2026/08/27 08:25</p>
                  {index < XRAY_CHECKS.length - 1 && <div className="h-px bg-[#d0d0d0] w-full" />}
                </div>
              );
            })}

            <div className="h-px bg-[#d0d0d0] w-full mt-4" />

            {/* X-ray Detector Comments */}
            <div className="pt-4">
              <Comments comments={record.xrayComments || []} />
            </div>
          </div>

          <div className="border-t border-[#d0d0d0]" />

          <div className="flex flex-col gap-2 px-4 py-6">
            <p className="text-xl font-semibold text-[#333]">備考</p>
            <p className="text-base text-[#333]">
              本日の検査は予定通り完了しました。全ての検査項目において良好な結果が得られています。機械の動作に異常は認められません。次回の定期検査は2026年9月27日の予定です。
            </p>
          </div>

          <div className="border-t border-[#d0d0d0] px-4 mx-4 pt-6">
            <div className="flex flex-col gap-4 items-start w-full">
              <Comments comments={record.comments || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OperationCheckDetailPageProps {
  record: MachineSearchRecord;
  factoryName: string;
  recordId: string;
  basePath: string;
}

const METAL_OPERATION_CHECKS = [
  { label: "電源ON", detail: "電源が正常に入り始動する" },
  { label: "操作パネル", detail: "操作パネルに異常がなく操作できる" },
  { label: "コンベア・プーリー・モーター", detail: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
  { label: "ローラー", detail: "ローラーに引っ掛かりがないか（サーチコイルに接触していないか）" },
  { label: "設定", detail: "各設定基準が正しいか" },
  { label: "はね板（フリッパー）", detail: "正常に反応し作動する" },
];

const XRAY_OPERATION_CHECKS = [
  { label: "電源ON", detail: "電源が正常に入り始動する" },
  { label: "操作パネル", detail: "操作パネルに異常がなく操作できる" },
  { label: "コンベア・センサー", detail: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
  { label: "機械同士の接触が無いか", detail: "機械同士の接触が無いか" },
  { label: "はね板（フリッパー）", detail: "正常に反応し作動する" },
];

const inspectionStatuses = [
  { label: "正常", status: true },
  { label: "異常あり", status: false },
  { label: "正常", status: true },
  { label: "正常", status: true },
  { label: "正常", status: true },
  { label: "正常", status: true },
];

function OperationCheckDetailPage({
  record,
  factoryName,
  recordId,
  basePath,
}: OperationCheckDetailPageProps) {
  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/metal-xray-detection" },
          { label: "データ一覧", to: basePath },
          { label: "点検内容一覧", to: `${basePath}/records/${recordId}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        {/* Summary Info */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex gap-6 items-center justify-between w-full">
              <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">実施者</p>
              <div className="flex flex-col gap-2">
                <p className="text-xl text-[var(--semantic-text-primary)]">山田太郎</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">鈴木花子</p>
              </div>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex gap-6 items-center justify-between w-full">
              <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">点検内容</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">動作確認</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] px-4 mx-4" />

          {/* Metal Detector Section */}
          <div className="bg-[#094] px-4 py-3 flex gap-6 items-center justify-between mx-4 rounded-lg mt-3">
            <p className="text-xl font-semibold text-white">金属探知機</p>
            <p className="text-xl font-semibold text-white">{record.metalDetectorModel}</p>
          </div>

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex gap-6 items-center justify-between">
              <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">点検時間</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">08:25</p>
            </div>
            <p className="text-sm text-[#808080] text-right">山田太郎 2026/08/27 08:25</p>

            <div className="border-t border-[#d0d0d0] w-full" />

            {METAL_OPERATION_CHECKS.map((check, index) => (
              <div key={index} className="flex flex-col gap-2">
                <p className="text-xl font-semibold text-[#094]">{check.label}</p>
                <div className="flex items-center justify-between w-full">
                  <p className="text-xl text-[var(--semantic-text-primary)]">{check.detail}</p>
                  <StatusTag status={inspectionStatuses[index].label} />
                </div>
                {!inspectionStatuses[index].status && (
                  <div className="px-4 py-3 text-base text-[#333] space-y-2">
                    <div className="flex gap-2">
                      <span className="font-semibold">原因：</span>
                      <div className="flex flex-col">
                        <span>操作パネルの不具合</span>
                        <span className="text-sm">操作パネルの表示が不安定になっており、一部のボタンが反応しない状態です。</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">対応：</span>
                      <div className="flex flex-col">
                        <span>パネルの再起動と点検</span>
                        <span className="text-sm">操作パネルを再起動し、配線と接触部分を点検・調整いたしました。</span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-sm text-[#808080] text-right">山田太郎 2026/08/27 08:25</p>
                {index < METAL_OPERATION_CHECKS.length - 1 && <div className="border-t border-[#d0d0d0] w-full" />}
              </div>
            ))}

            <div className="border-t border-[#d0d0d0] w-full mt-4" />

            {/* Metal Detector Operation Comments */}
            <div className="pt-4">
              <Comments comments={record.metalOperationComments || []} />
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] px-4 mx-4" />

          {/* X-ray Detector Section */}
          <div className="bg-[#094] px-4 py-3 flex gap-6 items-center justify-between mx-4 rounded-lg mt-3">
            <p className="text-xl font-semibold text-white">X線探知機</p>
            <p className="text-xl font-semibold text-white">{record.xrayDetectorModel}</p>
          </div>

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex gap-6 items-center justify-between">
              <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">点検時間</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">08:25</p>
            </div>
            <p className="text-sm text-[#808080] text-right">鈴木花子 2026/08/27 08:25</p>

            <div className="border-t border-[#d0d0d0] w-full" />

            {XRAY_OPERATION_CHECKS.map((check, index) => (
              <div key={index} className="flex flex-col gap-2">
                <p className="text-xl font-semibold text-[#094]">{check.label}</p>
                <div className="flex items-center justify-between w-full">
                  <p className="text-xl text-[var(--semantic-text-primary)]">{check.detail}</p>
                  <StatusTag status="正常" />
                </div>
                <p className="text-sm text-[#808080] text-right">鈴木花子 2026/08/27 08:25</p>
                {index < XRAY_OPERATION_CHECKS.length - 1 && <div className="border-t border-[#d0d0d0] w-full" />}
              </div>
            ))}

            <div className="border-t border-[#d0d0d0] w-full mt-4" />

            {/* X-ray Detector Operation Comments */}
            <div className="pt-4">
              <Comments comments={record.xrayOperationComments || []} />
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] px-4 mx-4" />

          {/* Remarks Section */}
          <div className="px-4 py-6">
            <p className="text-xl font-semibold text-[var(--semantic-text-primary)] mb-3">備考</p>
            <p className="text-base text-[var(--semantic-text-primary)] leading-relaxed">
              本日の動作確認は予定通り完了しました。金属探知機・X線探知機共に全ての検査項目において正常に動作することが確認されました。機械の動作に異常は認められません。次回の定期検査は2026年9月27日の予定です。
            </p>
          </div>

          {/* Comments Section */}
          <div className="border-t border-[#d0d0d0] px-4 pt-6">
            <Comments comments={record.comments || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
