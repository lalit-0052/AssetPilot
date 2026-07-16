import * as XLSX from 'xlsx'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { FiActivity, FiBarChart2, FiDownload, FiFileText, FiTool } from 'react-icons/fi'
import Panel from '../components/Panel'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip)

const money = (value) => {
  const amount = Number(value || 0)
  return amount ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '—'
}

const percent = (value) => `${Number(value || 0)}%`

const itemName = (item) => (typeof item === 'string' ? item : item.name)

const themeAwareTextColor = () => (
  document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569'
)

function ReportsPage({ data, currentUser }) {
  const reports = data.reports || {}
  const isAdmin = currentUser?.role === 'Admin'
  const mostUsedAssets = reports.mostUsedAssets || []
  const idleAssets = reports.idleAssets || []
  const dueForMaintenance = reports.dueForMaintenance || []
  const utilization = reports.utilizationByDepartment || []
  const monthlyPurchases = reports.monthlyPurchases || []
  const categoryData = reports.assetsByCategory || []
  const recentReports = reports.recentReports || []
  const totalAssets = Number(reports.totalAssets || 0)
  const utilizationRate = Number(reports.utilizationRate || 0)
  const globalEfficiency = Number(reports.globalEfficiency || 0)
  const chartTextColor = themeAwareTextColor()

  const exportReport = () => {
    const workbook = XLSX.utils.book_new()
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        'Total Assets': totalAssets,
        'Utilization Rate': percent(reports.utilizationRate),
        'Availability Rate': percent(reports.availabilityRate),
        'Maintenance Health': percent(reports.maintenanceHealth),
        'Global Efficiency': percent(reports.globalEfficiency),
      },
    ])

    const assetSheet = XLSX.utils.json_to_sheet([
      ...mostUsedAssets.map((asset) => ({ Type: 'Most Used', Asset: itemName(asset), Uses: asset.uses || '' })),
      ...idleAssets.map((asset) => ({ Type: 'Idle', Asset: itemName(asset), Location: asset.location || '', Value: isAdmin ? asset.value || 0 : 'Admin only' })),
      ...dueForMaintenance.map((asset) => ({ Type: 'Maintenance', Asset: itemName(asset), Status: asset.status || '' })),
    ])

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(utilization), 'Utilization')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(categoryData), 'Categories')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(monthlyPurchases), 'Purchases')
    XLSX.utils.book_append_sheet(workbook, assetSheet, 'Asset Lists')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(recentReports), 'Audit Reports')
    XLSX.writeFile(workbook, `AssetFlow-Report-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const metricCards = [
    {
      label: 'Utilization Rate',
      value: percent(utilizationRate),
      helper: `${reports.allocatedAssets || 0} allocated, ${reports.reservedAssets || 0} reserved`,
      icon: FiActivity,
      bar: utilizationRate,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Maintenance Health',
      value: percent(reports.maintenanceHealth),
      helper: `${reports.underMaintenanceAssets || 0} under maintenance`,
      icon: FiTool,
      bar: reports.maintenanceHealth || 0,
      color: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Global Efficiency',
      value: percent(globalEfficiency),
      helper: 'Utilization + health + booking performance',
      icon: FiBarChart2,
      bar: globalEfficiency,
      color: 'bg-cyan-100 text-cyan-700',
    },
  ]

  const purchaseChartData = {
    labels: monthlyPurchases.map((item) => item.month),
    datasets: [
      {
        label: 'Asset purchase value',
        data: monthlyPurchases.map((item) => Number(item.value || 0)),
        backgroundColor: '#1454ad',
        borderRadius: 6,
      },
    ],
  }

  const categoryChartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        label: 'Assets',
        data: categoryData.map((item) => Number(item.count || 0)),
        backgroundColor: ['#1454ad', '#0891b2', '#b45309', '#64748b', '#16a34a', '#dc2626'],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartTextColor, boxWidth: 12, font: { weight: 700 } } },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.formattedValue}` } },
    },
    scales: {
      x: { ticks: { color: chartTextColor }, grid: { display: false } },
      y: { ticks: { color: chartTextColor }, grid: { color: 'rgba(148, 163, 184, 0.22)' } },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: chartTextColor, boxWidth: 12, font: { weight: 700 } } },
    },
  }

  return (
    <Panel title="Reports & Analytics">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Reports & Analytics</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Calculated from live assets, bookings, maintenance requests, and audit cycles.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800" onClick={exportReport} type="button">
            <FiDownload className="h-4 w-4" />
            Export Excel Report
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map(({ label, value, helper, icon: Icon, bar, color }) => (
            <section className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950" key={label}>
              <div className="flex items-start justify-between">
                <div className={`grid h-9 w-9 place-items-center rounded-md ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{helper}</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
              <div className="mt-3 h-1 w-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full bg-[#1454ad]" style={{ width: `${Math.min(Number(bar || 0), 100)}%` }} />
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
          <section className="min-h-[290px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Monthly Asset Purchases</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Asset value grouped by acquisition month.</p>
              </div>
              <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1454ad] dark:bg-blue-950 dark:text-blue-200">Value</span>
            </div>
            <div className="mt-6 h-64">
              {monthlyPurchases.length ? <Bar data={purchaseChartData} options={chartOptions} /> : (
                <div className="grid h-full w-full place-items-center text-sm text-slate-400">No asset purchase data yet.</div>
              )}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-bold text-slate-900 dark:text-white">Assets by Category</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Inventory count and value by type.</p>
            <div className="mt-6 h-64">
              {categoryData.length ? <Doughnut data={categoryChartData} options={doughnutOptions} /> : <p className="text-sm text-slate-400">No category data available.</p>}
            </div>
          </section>
        </div>

        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Audit Report Archive</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Generated from active audit cycles.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  {['Report Name', 'Generated By', 'Date', 'Status', 'Format'].map((heading) => <th className="px-5 py-3" key={heading}>{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {recentReports.length ? recentReports.map((report) => (
                  <tr key={report.id || report.name}>
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100"><span className="flex items-center gap-2"><FiFileText className="text-rose-500" />{report.name}</span></td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{report.generatedBy}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{report.date}</td>
                    <td className="px-5 py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{report.status}</span></td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{report.format}</td>
                  </tr>
                )) : (
                  <tr><td className="px-5 py-8 text-center text-sm text-slate-400" colSpan="5">No audit reports available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { title: 'Most Used Assets', assets: mostUsedAssets, color: 'border-blue-500', render: (asset) => `${itemName(asset)}${asset.uses ? ` · ${asset.uses} use${asset.uses === 1 ? '' : 's'}` : ''}` },
            { title: 'Idle Assets', assets: idleAssets, color: 'border-amber-500', render: (asset) => `${itemName(asset)}${isAdmin && asset.value ? ` · ${money(asset.value)}` : ''}` },
            { title: 'Due for Maintenance', assets: dueForMaintenance, color: 'border-rose-500', render: (asset) => `${itemName(asset)}${asset.status ? ` · ${asset.status}` : ''}` },
          ].map((section) => (
            <section className={`border border-slate-200 border-t-[3px] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${section.color}`} key={section.title}>
              <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
              <div className="mt-4 space-y-2">
                {section.assets.length ? section.assets.map((asset) => (
                  <p className="border-b border-slate-100 pb-2 text-sm text-slate-600 last:border-0 dark:border-slate-800 dark:text-slate-300" key={itemName(asset)}>
                    {section.render(asset)}
                  </p>
                )) : (
                  <p className="text-sm text-slate-400">No assets to display.</p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Panel>
  )
}

export default ReportsPage