import { useState } from 'react'
import { motion } from 'framer-motion'
import Select from 'react-select'
import { organizationOptions } from '../data/organizations'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 46,
    borderRadius: 0,
    borderColor: state.isFocused ? '#1454ad' : '#cbd5e1',
    backgroundColor: '#f8fafc',
    boxShadow: state.isFocused ? '0 0 0 2px rgb(219 234 254)' : 'none',
    '&:hover': { borderColor: '#1454ad' },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#1454ad' : state.isFocused ? '#e0f2fe' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#0f172a',
    fontWeight: 700,
  }),
}

function LoginPage({ onLogin, onCreateAccount, authError }) {
  const [mode, setMode] = useState('login')
  const [loginType, setLoginType] = useState('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organization: 'AssetFlow Demo Org',
    department: '',
    role: 'Employee',
  })

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const selectedOrganization = organizationOptions.find((option) => option.value === form.organization) || {
    label: form.organization,
    value: form.organization,
  }

  const validate = () => {
    if (!form.email || !form.password || !form.organization) return 'Email, password, and organization are required'
    if (!emailRegex.test(form.email)) return 'Enter a valid email address'
    if (mode === 'create' && !form.name) return 'Name is required'
    if (mode === 'create' && form.password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    if (mode === 'create') {
      await onCreateAccount(form)
      return
    }
    await onLogin({ email: form.email, password: form.password, organization: form.organization, loginType })
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 px-4 py-6 sm:px-6 lg:grid lg:place-items-center lg:p-8">
      <motion.section initial={{ opacity: 0, scale: 0.98, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="mx-auto grid min-h-[700px] w-full max-w-[1180px] overflow-hidden border border-slate-300 bg-white shadow-2xl shadow-slate-300/60 lg:grid-cols-[1.04fr_0.96fr]">
        <aside className="relative hidden overflow-hidden bg-[#1454ad] px-10 py-12 text-white lg:flex lg:flex-col xl:px-12">
          <div className="relative flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border-2 border-white text-sm font-black">AF</div>
            <span className="text-lg font-bold tracking-tight">AssetFlow</span>
          </div>
          <div className="relative my-auto max-w-[470px] pt-12">
            <h1 className="text-4xl font-bold leading-[1.14] tracking-tight xl:text-5xl">Manage enterprise assets with clarity and control.</h1>
            <p className="mt-10 max-w-md text-base leading-7 text-blue-50 xl:text-lg">Admins control the ERP workspace. Employees can create accounts, request resources, and track their allocations.</p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
          <motion.form initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.08 }} className="w-full max-w-[390px]" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{mode === 'login' ? 'Sign in to the correct AssetFlow workspace.' : 'Create an admin or employee account for your organization.'}</p>

            {mode === 'login' && (
              <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                {['admin', 'employee'].map((type) => (
                  <button className={`rounded-md px-3 py-2 text-sm font-bold ${loginType === type ? 'bg-white text-[#1454ad] shadow-sm' : 'text-slate-600'}`} key={type} onClick={() => setLoginType(type)} type="button">
                    {type === 'admin' ? 'Admin Login' : 'Employee Login'}
                  </button>
                ))}
              </div>
            )}
            {mode === 'create' && (
              <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                {['Admin', 'Employee'].map((type) => (
                  <button className={`rounded-md px-3 py-2 text-sm font-bold ${form.role === type ? 'bg-white text-[#1454ad] shadow-sm' : 'text-slate-600'}`} key={type} onClick={() => updateForm('role', type)} type="button">
                    {type}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-7 space-y-5">
              {mode === 'create' && (
                <label className="block text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-800">
                  Name
                  <input className="mt-2 w-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1454ad] focus:bg-white focus:ring-2 focus:ring-blue-100" value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
                </label>
              )}
              <label className="block text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-800">
                Organization
                <Select
                  className="mt-2 text-sm normal-case tracking-normal"
                  isClearable
                  isSearchable
                  onChange={(option) => updateForm('organization', option?.value || '')}
                  options={organizationOptions}
                  placeholder="Search organization..."
                  styles={selectStyles}
                  value={selectedOrganization.value ? selectedOrganization : null}
                />
              </label>
              <label className="block text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-800">
                Email
                <input className="mt-2 w-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1454ad] focus:bg-white focus:ring-2 focus:ring-blue-100" placeholder={loginType === 'admin' ? 'admin@assetflow.com' : 'name@company.com'} type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
              </label>
              <label className="block text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-800">
                Password
                <div className="mt-2 flex border border-slate-300 bg-slate-50 focus-within:border-[#1454ad] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                  <input className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 outline-none" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => updateForm('password', event.target.value)} />
                  <button className="px-4 text-sm font-bold text-[#1454ad]" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </label>
              {mode === 'create' && form.role === 'Employee' && (
                <label className="block text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-800">
                  Department
                  <input className="mt-2 w-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1454ad] focus:bg-white focus:ring-2 focus:ring-blue-100" value={form.department} onChange={(event) => updateForm('department', event.target.value)} />
                </label>
              )}
              {(error || authError) && <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error || authError}</div>}
              <button className="w-full bg-[#1454ad] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0f438d]" type="submit">{mode === 'login' ? 'Log In' : `Create ${form.role} Account`}</button>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-600">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button className="font-bold text-[#1454ad]" type="button" onClick={() => { setMode(mode === 'login' ? 'create' : 'login'); setError('') }}>
                {mode === 'login' ? 'Create Account' : 'Back to Login'}
              </button>
            </p>
          </motion.form>
        </div>
      </motion.section>
    </main>
  )
}

export default LoginPage