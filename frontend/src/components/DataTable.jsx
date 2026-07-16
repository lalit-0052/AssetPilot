import { statusStyles } from '../data/assetFlowData'
import Pill from './Pill'

const getValueForColumn = (row, column) => {
  const compactKey = column.toLowerCase().replaceAll(' ', '')
  const lowerKey = column.toLowerCase()
  return row[compactKey] ?? row[lowerKey] ?? row[column]
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{columns.map((column) => <th className="px-4 py-3 font-semibold" key={column}>{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr className="bg-white" key={Object.values(row).join('-')}>
              {columns.map((column) => {
                const value = getValueForColumn(row, column)
                return <td className="px-4 py-3 text-slate-700" key={column}>{statusStyles[value] ? <Pill>{value}</Pill> : value}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable