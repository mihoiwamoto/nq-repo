import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { getFactoryName } from "../../../data/factories";
import { useStorageManagement } from "./StorageManagementContext";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";

export function StorageDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const { storageLocations } = useStorageManagement();
  const routeLocation = useLocation();
  const location = storageLocations.find((item) => item.id === locationId);

  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if ((routeLocation.state as any)?.justSaved) {
      setShowUpdateToast(true);
    }
  }, [routeLocation.state]);

  return (
    <div>
      {showUpdateToast && <Toast message="更新されました。" onClose={() => setShowUpdateToast(false)} />}
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "保管場所管理", to: "/admin/storage" },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="flex items-center justify-end w-full gap-2">
          <Link
            to={`/admin/storage/${locationId}/edit`}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            <img src={iconEdit} alt="編集" className="size-5" />
            編集
          </Link>
        </div>
        <div className="bg-white rounded-lg w-full">
          <div className="flex items-center px-6 py-6 gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">保管場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{location?.name}</p>
          </div>
          <div className="h-px bg-[#e0e0e0] mx-6"></div>
          <div className="flex items-center px-6 py-6 gap-4">
            <p className="text-xl text-[var(--semantic-brand-primary)] w-[152px]">工場</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {getFactoryName(location?.factoryId)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
