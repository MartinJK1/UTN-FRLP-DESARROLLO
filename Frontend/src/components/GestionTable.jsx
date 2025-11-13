import { useMemo, useState } from 'react';
import '../assets/styles/gestion.css';

// Tabla genérica para vistas de gestión con ordenamiento
export default function GestionTable({ columns = [], data = [], renderActions, emptyMessage = 'Sin registros para mostrar' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  const onHeaderClick = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return data;
    const getValue = (row) => {
      if (typeof col.getSortValue === 'function') return col.getSortValue(row);
      const value = row[col.key];
      if (value == null) return '';
      return typeof value === 'string' ? value.toLowerCase() : value;
    };
    const copy = [...data];
    copy.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir, columns]);

  return (
    <div className="gestion-table__wrapper">
      <table className="gestion-table" role="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                role="columnheader"
                style={col.width ? { width: col.width } : undefined}
                className={col.sortable ? 'is-sortable' : undefined}
                onClick={() => onHeaderClick(col)}
              >
                <span className="th-label">{col.label}</span>
                {col.sortable && (
                  <span className={`sort-indicator ${sortKey === col.key ? sortDir : ''}`}></span>
                )}
              </th>
            ))}
            {renderActions && <th className="acciones-col" role="columnheader">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="empty-cell">{emptyMessage}</td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map(col => (
                  <td key={col.key} title={typeof row[col.key] === 'string' ? row[col.key] : undefined}>
                    {typeof col.render === 'function' ? col.render(row) : (row[col.key] ?? '-')}
                  </td>
                ))}
                {renderActions && (
                  <td className="acciones-cell">
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


