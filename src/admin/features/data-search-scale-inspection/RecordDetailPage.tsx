import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function CheckStatusTag({ status }: { status: "ok" | "ng" }) {
  return (
    <span
      className={`h-7 w-[88px] rounded-lg flex items-center justify-center text-base text-white ${
        status === "ok" ? "bg-[#19c95f]" : "bg-[#f85c5c]"
      }`}
    >
      {status === "ok" ? "正常" : "異常あり"}
    </span>
  );
}

function Dash() {
  return <span className="inline-block w-3 h-px bg-[#333]" />;
}

const HLine = () => <div className="border-t border-[#d0d0d0] w-full" />;

export function RecordDetailPage() {
  const navigate = useNavigate();
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/scale-inspection/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">データが見つかりません</p>
      </div>
    );
  }

  const isNg = !record.skipped && record.operationCheck === "ng";

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/scale-inspection" },
          { label: "データ一覧", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">持ち場</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.post}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.scaleLabel}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">シリアルナンバー</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.serialNumber}</p>
          </div>
          <HLine />

          {record.skipped ? (
            <>
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">動作確認</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2 items-start">
                  <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                  <p className="text-base text-[var(--semantic-text-secondary)] font-normal">
                    使用分銅(g)：{record.referenceWeight}
                  </p>
                </div>
                <Dash />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xl text-[var(--semantic-text-primary)]">動作確認</p>
                  {isNg ? (
                    <CheckStatusTag status="ng" />
                  ) : (
                    <div className="flex flex-col gap-1 items-end">
                      <CheckStatusTag status={record.operationCheck} />
                      <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{record.implementer} {formatDate(record.date)} 09:30</p>
                    </div>
                  )}
                </div>
                {isNg && (
                  <div className="flex flex-col gap-2 items-start w-full">
                    <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
                      <p className="font-normal">原因：{record.operationCause}</p>
                      <p className="font-normal">対応：{record.operationAction}</p>
                    </div>
                    <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{record.implementer} {formatDate(record.date)} 09:30</p>
                  </div>
                )}
              </div>
              <HLine />
              {isNg ? (
                <>
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                      <div className="flex flex-col gap-1 items-end">
                        <CheckStatusTag status="ok" />
                        <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{record.implementer} {formatDate(record.date)} 09:45</p>
                      </div>
                    </div>
                  </div>
                  <HLine />
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                      <div className="flex flex-col gap-1 items-end">
                        <CheckStatusTag status="ok" />
                        <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{record.implementer} {formatDate(record.date)} 09:50</p>
                      </div>
                    </div>
                  </div>
                  <HLine />
                  <div className="flex flex-col gap-2 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-2 items-start">
                        <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">
                          使用分銅(g)：{record.referenceWeight}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <p className="text-xl text-[var(--semantic-text-primary)]">100</p>
                        <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{record.implementer} {formatDate(record.date)} 10:00</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                      <div className="flex flex-col gap-1 items-end">
                        <CheckStatusTag status={record.levelCheck ?? "ok"} />
                        <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{record.implementer} {formatDate(record.date)} 09:45</p>
                      </div>
                    </div>
                  </div>
                  <HLine />
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                      <div className="flex flex-col gap-1 items-end">
                        <CheckStatusTag status={record.dirtCheck ?? "ok"} />
                        <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{record.implementer} {formatDate(record.date)} 09:50</p>
                      </div>
                    </div>
                  </div>
                  <HLine />
                  <div className="flex flex-col gap-2 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-2 items-start">
                        <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">
                          使用分銅(g)：{record.referenceWeight}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <p
                          className={`text-xl ${
                            record.weightCause ? "text-[#f85c5c]" : "text-[var(--semantic-text-primary)]"
                          }`}
                        >
                          {record.displayValue}
                        </p>
                        <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{record.implementer} {formatDate(record.date)} 10:00</p>
                      </div>
                    </div>
                    {record.weightCause && (
                      <p className="text-base text-[var(--semantic-text-secondary)] px-2 font-normal">
                        原因：{record.weightCause}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          <HLine />
          {record.remarks && (
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {record.remarks}
              </p>
            </div>
          )}
        </div>

        {isNg && (
          <div className="flex flex-col gap-1 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
            <div className="bg-white flex items-center justify-between px-4 py-6 rounded-lg w-full">
              <p className="text-sm text-[var(--semantic-text-primary)]">
                修理状況は秤管理にてご確認いただけます。
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/ledger-management/scale-inspection/factories/${factoryId}/scale-management`)
                }
                className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-40 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
              >
                秤管理へ
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
        </div>
      </div>
    </div>
  );
}
