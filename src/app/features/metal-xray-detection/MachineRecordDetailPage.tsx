import { Fragment } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import {
  MACHINES,
  MACHINE_RECORDS,
  METAL_DETECTOR_CHECKLIST,
  METAL_TEST_PIECES,
  RESULT_COLORS,
  RESULT_LABELS,
  XRAY_DETECTOR_CHECKLIST,
  XRAY_TEST_PIECES,
  type ChecklistGroup,
  type OkNg,
  type TestPieceRow,
} from "./mockData";

function Divider() {
  return <div className="border-t border-[#d0d0d0]" style={{ width: "calc(100% - 1px)" }} />;
}

function StatusBadge({ value }: { value: OkNg }) {
  const result = value === "ok" ? "OK" : "NG";
  return (
    <span
      className="h-6 shrink-0 px-2 rounded-lg text-xs text-white inline-flex items-center justify-center"
      style={{ backgroundColor: RESULT_COLORS[result] }}
    >
      {RESULT_LABELS[result]}
    </span>
  );
}

function DetailRow({
  label,
  value,
  timestamp,
}: {
  label: string;
  value: string;
  timestamp?: string;
}) {
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
        <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
      </div>
      {timestamp && <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">{timestamp}</p>}
    </div>
  );
}

function DetailNoteRow({
  label,
  value,
  note,
  timestamp,
}: {
  label: string;
  value: string;
  note: string;
  timestamp?: string;
}) {
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
        <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
      </div>
      <p className="text-base text-[var(--semantic-text-primary)] whitespace-pre-wrap">{note}</p>
      {timestamp && <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">{timestamp}</p>}
    </div>
  );
}

function DetailCheckRow({ label, value, timestamp }: { label: string; value: OkNg; timestamp: string }) {
  return (
    <div className="flex flex-col gap-2 items-end w-full">
      <div className="flex items-center justify-between gap-4 w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
        <StatusBadge value={value} />
      </div>
      <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">{timestamp}</p>
    </div>
  );
}

function ChecklistDetailGroup({
  label,
  unit,
  time,
  timestamp,
  checklist,
  checks,
  anomalyNotes,
}: {
  label: string;
  unit: string;
  time: string;
  timestamp: string;
  checklist: ChecklistGroup[];
  checks: Record<string, OkNg>;
  anomalyNotes?: Record<string, { cause: string; response: string }>;
}) {
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-2 py-2 rounded-lg w-full mx-2">
        <p className="text-base font-semibold text-white">{label}</p>
        <p className="text-base font-semibold text-white">{unit}</p>
      </div>
      <div className="flex flex-col gap-3 items-start px-2 w-full">
        <DetailRow label="点検時間" value={time} timestamp={timestamp} />
        <Divider />

        {checklist.map((group) => {
          const items = group.items.filter((item) => checks[item.key]);
          if (items.length === 0) return null;
          return (
            <div key={group.title} className="flex flex-col gap-3 items-start w-full">
              <p className="text-base text-[var(--semantic-brand-primary)]">{group.title}</p>
              {items.map((item, itemIndex) => (
                <Fragment key={item.key}>
                  <DetailCheckRow label={item.label} value={checks[item.key]} timestamp={timestamp} />
                  {checks[item.key] === "ng" && anomalyNotes?.[item.key] && (
                    <div className="flex flex-col gap-3 items-start px-2 w-full text-[var(--semantic-text-secondary)]">
                      <div className="flex flex-col gap-1 items-start w-full">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-semibold">原因：</p>
                          <p className="text-sm">{anomalyNotes[item.key].cause}</p>
                        </div>
                        <p className="text-sm pl-12">{anomalyNotes[item.key].cause === "選択肢01" ? anomalyNotes[item.key].response : ""}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-start w-full">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-semibold">対応：</p>
                          <p className="text-sm">{anomalyNotes[item.key].response}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {itemIndex < items.length - 1 && <Divider />}
                </Fragment>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestPieceDetailGroup({
  label,
  unit,
  time,
  settingNumber,
  pieces,
  values,
  checks,
  timestamp,
  anomalyNotes,
}: {
  label: string;
  unit: string;
  time: string;
  settingNumber: string;
  pieces: TestPieceRow[];
  values: Record<string, string>;
  checks: Record<string, OkNg>;
  timestamp: string;
  anomalyNotes?: Record<string, { cause?: string; responseType?: string; response: string }>;
}) {
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-2 py-2 rounded-lg w-full mx-2">
        <p className="text-base font-semibold text-white">{label}</p>
        <p className="text-base font-semibold text-white">{unit}</p>
      </div>
      <div className="flex flex-col gap-3 items-start px-2 w-full">
        <DetailRow label="点検時間" value={time} timestamp={timestamp} />
        <Divider />
        <DetailRow label="設定番号" value={settingNumber} timestamp={timestamp} />
        <Divider />
        {pieces.map((piece, index) => (
          <Fragment key={piece.key}>
            <div className="flex flex-col gap-3 items-start w-full">
              <DetailRow label={`テストピース：${piece.label}`} value={values[piece.key] ?? ""} timestamp={timestamp} />
              {checks[piece.key] && (
                <DetailCheckRow label={`検知確認：${piece.label}`} value={checks[piece.key]} timestamp={timestamp} />
              )}
              {checks[piece.key] === "ng" && anomalyNotes?.[piece.key] && (
                <div className="flex flex-col gap-3 items-start px-2 w-full text-[var(--semantic-text-secondary)]">
                  {anomalyNotes[piece.key].cause && (
                    <div className="flex flex-col gap-1 items-start w-full">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-semibold">原因：</p>
                        <p className="text-sm">{anomalyNotes[piece.key].cause}</p>
                      </div>
                    </div>
                  )}
                  {anomalyNotes[piece.key].responseType && (
                    <div className="flex flex-col gap-1 items-start w-full">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-semibold">対応：</p>
                        <p className="text-sm">{anomalyNotes[piece.key].responseType}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-semibold">内容：</p>
                      <p className="text-sm">{anomalyNotes[piece.key].response}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {index < pieces.length - 1 && <Divider />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function MachineRecordDetailPage() {
  const { machineId, recordId } = useParams<{ machineId: string; recordId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { inspectionDate?: string; inspectorName?: string } | null;
  const inspectionDate = state?.inspectionDate ?? "";
  const machine = MACHINES.find((m) => m.id === machineId);
  const record = (MACHINE_RECORDS[machineId ?? ""] ?? []).find((r) => r.id === recordId);

  if (!machine || !record) return null;

  const basePath = "/app/ledger-list/metal-xray-detection";
  const confirmPath = `${basePath}/machines/${machineId}/confirm`;
  const detailPath = `${basePath}/machines/${machineId}`;

  const getBackPath = () => {
    const pathname = location.pathname;
    if (pathname.includes("/confirm/")) {
      return confirmPath;
    }
    return detailPath;
  };

  const getDateLabel = () => {
    if (inspectionDate) {
      return inspectionDate.replaceAll("-", "/");
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");
    return `${year}/${month}/${date}`;
  };
  const dateLabel = getDateLabel();
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };
  const timestampFor = (time: string) => `${record.inspectorName} ${dateLabel} ${formatTime(time)}`;

  return (
    <>
      <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start p-4 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{dateLabel}</p>
          </div>
          <Divider />
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">点検内容</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.content}</p>
          </div>
          <Divider />

          {record.content === "動作確認" && record.detail && (
            <>
              <ChecklistDetailGroup
                label="金属探知機"
                unit={record.detail.metalUnit}
                time={record.detail.metalTime}
                timestamp={timestampFor(record.detail.metalTime)}
                checklist={METAL_DETECTOR_CHECKLIST}
                checks={record.detail.metalChecks}
                anomalyNotes={record.detail.metalAnomalyNotes}
              />
              <Divider />
              <ChecklistDetailGroup
                label="X線探知機"
                unit={record.detail.xrayUnit}
                time={record.detail.xrayTime}
                timestamp={timestampFor(record.detail.xrayTime)}
                checklist={XRAY_DETECTOR_CHECKLIST}
                checks={record.detail.xrayChecks}
                anomalyNotes={record.detail.xrayAnomalyNotes}
              />
              <Divider />
            </>
          )}

          {record.content === "テストピース" && record.testPieceDetail && (
            <>
              <DetailRow label="実施区分" value={record.category} />
              <Divider />
              <DetailRow
                label="通過製品/カテゴリ"
                value={record.passedProduct}
                timestamp={timestampFor(record.testPieceDetail.metalTime || record.testPieceDetail.xrayTime)}
              />
              <Divider />
              <TestPieceDetailGroup
                label="金属探知機"
                unit={record.testPieceDetail.metalUnit}
                time={record.testPieceDetail.metalTime}
                settingNumber={record.testPieceDetail.metalSettingNumber}
                pieces={METAL_TEST_PIECES}
                values={record.testPieceDetail.metalPieceValues}
                checks={record.testPieceDetail.metalPieceChecks}
                timestamp={timestampFor(record.testPieceDetail.metalTime)}
                anomalyNotes={record.testPieceDetail.metalPieceAnomalyNotes}
              />
              <Divider />
              <TestPieceDetailGroup
                label="X線探知機"
                unit={record.testPieceDetail.xrayUnit}
                time={record.testPieceDetail.xrayTime}
                settingNumber={record.testPieceDetail.xraySettingNumber}
                pieces={XRAY_TEST_PIECES}
                values={record.testPieceDetail.xrayPieceValues}
                checks={record.testPieceDetail.xrayPieceChecks}
                timestamp={timestampFor(record.testPieceDetail.xrayTime)}
                anomalyNotes={record.testPieceDetail.xrayPieceAnomalyNotes}
              />
              <Divider />
            </>
          )}

          {record.content === "製品通過" && record.productPassDetail && (
            <>
              <DetailRow label="実施区分" value={record.category} />
              <Divider />
              <DetailRow
                label="通過製品/カテゴリ"
                value={record.passedProduct}
                timestamp={timestampFor(record.productPassDetail.weightCheckerTime)}
              />
              <Divider />
              {record.category === "終了" && (
                <>
                  <DetailRow
                    label="通過数量"
                    value={record.productPassDetail.passQuantity}
                    timestamp={timestampFor(record.productPassDetail.weightCheckerTime)}
                  />
                  <Divider />
                </>
              )}
              <div className="flex flex-col gap-3 items-start w-full">
                <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-2 py-2 rounded-lg w-full mx-2">
                  <p className="text-base font-semibold text-white">ウェイトチェッカー</p>
                  <p className="text-base font-semibold text-white">{record.productPassDetail.weightCheckerUnit}</p>
                </div>
                <div className="flex flex-col gap-3 items-start px-2 w-full">
                  <DetailRow
                    label="点検時間"
                    value={record.productPassDetail.weightCheckerTime}
                    timestamp={timestampFor(record.productPassDetail.weightCheckerTime)}
                  />
                  <Divider />
                  <DetailRow
                    label="重量下限値（g）"
                    value={record.productPassDetail.weightLowerLimit}
                    timestamp={timestampFor(record.productPassDetail.weightCheckerTime)}
                  />
                  {record.category === "開始" &&
                    record.productPassDetail.weightCalibrationCheck &&
                    record.productPassDetail.weightPackageMatchCheck && (
                      <>
                        <Divider />
                        <div className="flex flex-col gap-3 items-start w-full">
                          <p className="text-base text-[var(--semantic-brand-primary)]">動作確認</p>
                          <DetailCheckRow
                            label="分銅を乗せての校正点検"
                            value={record.productPassDetail.weightCalibrationCheck}
                            timestamp={timestampFor(record.productPassDetail.weightCheckerTime)}
                          />
                          <DetailCheckRow
                            label="通過させる製品のパッケージ（印字）との照合"
                            value={record.productPassDetail.weightPackageMatchCheck}
                            timestamp={timestampFor(record.productPassDetail.weightCheckerTime)}
                          />
                        </div>
                      </>
                    )}
                </div>
              </div>
              <Divider />
              <div className="flex flex-col gap-3 items-start w-full">
                <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-2 py-2 rounded-lg w-full mx-2">
                  <p className="text-base font-semibold text-white">シーリング</p>
                  <p className="text-base font-semibold text-white" />
                </div>
                <div className="flex flex-col gap-3 items-start px-2 w-full">
                  <DetailRow
                    label="点検時間"
                    value={record.productPassDetail.sealingTime}
                    timestamp={timestampFor(record.productPassDetail.sealingTime)}
                  />
                  <Divider />
                  {record.productPassDetail.sealingCheck && (
                    <DetailCheckRow
                      label="動作確認"
                      value={record.productPassDetail.sealingCheck}
                      timestamp={timestampFor(record.productPassDetail.sealingTime)}
                    />
                  )}
                </div>
              </div>
              <Divider />
            </>
          )}

          {record.content === "異常反応" && record.abnormalDetail && (
            <>
              <DetailRow label="点検時間" value={record.time} timestamp={timestampFor(record.time)} />
              <Divider />
              <DetailRow label="異常製品" value={record.passedProduct} timestamp={timestampFor(record.time)} />
              <Divider />
              <DetailRow
                label="通過数量"
                value={record.abnormalDetail.passedQuantity}
                timestamp={timestampFor(record.time)}
              />
              <Divider />
              <DetailRow
                label="異常数量"
                value={record.abnormalDetail.abnormalQuantity}
                timestamp={timestampFor(record.time)}
              />
              <Divider />
              <DetailNoteRow
                label="原因"
                value={record.abnormalDetail.abnormalCause}
                note={record.abnormalDetail.abnormalCauseNote}
                timestamp={timestampFor(record.time)}
              />
              <Divider />
              <DetailNoteRow
                label="対応"
                value={record.abnormalDetail.abnormalAction}
                note={record.abnormalDetail.abnormalActionNote}
                timestamp={timestampFor(record.time)}
              />
              <Divider />
            </>
          )}

          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-primary)] whitespace-pre-wrap">{record.remarks}</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center">
        <button
          type="button"
          onClick={() =>
            navigate(getBackPath(), { state: { inspectionDate, inspectorName: state?.inspectorName } })
          }
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
      </div>
    </>
  );
}
