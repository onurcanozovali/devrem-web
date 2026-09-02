import { displayText } from '@/src/admin/presentation';

export function AdminRecordGrid({
  items,
}: {
  items: Array<{ label: string; value: unknown }>;
}) {
  return (
    <dl className="admin-record-grid">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{displayText(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
