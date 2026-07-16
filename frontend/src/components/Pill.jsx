import { statusStyles } from '../data/assetFlowData'

function Pill({ children }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[children] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {children}
    </span>
  )
}

export default Pill