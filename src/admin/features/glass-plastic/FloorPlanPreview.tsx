import type { MapItem } from "./types";

export function FloorPlanPreview({
  imageUrl,
  items,
  alt,
}: {
  imageUrl: string;
  items: MapItem[];
  alt: string;
}) {
  return (
    <div className="relative inline-block">
      <img src={imageUrl} alt={alt} className="max-h-[400px] rounded-lg border border-[#d0d0d0] block" />
      {items.map((item) => (
        <div
          key={item.id}
          title={`${item.room}／${item.name}`}
          className="absolute bg-[var(--semantic-brand-primary)] rounded-[3px] size-3 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        />
      ))}
    </div>
  );
}
