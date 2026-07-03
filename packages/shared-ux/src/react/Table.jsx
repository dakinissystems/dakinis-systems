/** Tabla DES — thead/tbody con variantes compact y striped */
export default function Table({
  columns = [],
  rows = [],
  compact = false,
  striped = true,
  emptyMessage = "Sin datos",
  className = "",
}) {
  const cls = [
    "dakinis-table",
    compact ? "dakinis-table--compact" : "",
    striped ? "dakinis-table--striped" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="dakinis-table-wrap">
      <table className={cls}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={col.align ? `dakinis-table__${col.align}` : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className="dakinis-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => (
                  <td key={col.key} className={col.align ? `dakinis-table__${col.align}` : undefined}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
