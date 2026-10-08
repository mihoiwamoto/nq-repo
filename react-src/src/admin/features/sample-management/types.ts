/** 予定の製品ごとの製造日・ロットNo.（どちらも任意。2026-10-08 に確定デザインどおり予定の登録・編集で入力するようにした） */
export type ScheduleProductDetail = {
  manufactureDate?: string;
  lotNumber?: string;
};

export type ScheduleEntry = {
  dateKey: string;
  productIds: string[];
  details?: Record<string, ScheduleProductDetail>;
};
