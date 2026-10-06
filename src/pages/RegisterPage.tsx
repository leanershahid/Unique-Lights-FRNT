import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, getErrorMessage } from '@/api/axios'
import { staggerContainer, staggerItem } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useRegister } from '@/features/auth/hooks'
import type { RegisterRequest } from '@/types/api'
import { cn } from '@/utils/cn'
import { hasErrors, isEmail, isIndianPhone, passwordProblem, serverErrors, type Errors } from '@/utils/validation'

function strength(pw: string): number {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++
  if (pw.length >= 12) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function RegisterPage() {
  const register = useRegister()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'
  const [values, setValues] = useState<RegisterRequest & { phone: string }>({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Errors<RegisterRequest>>({})
  const [show, setShow] = useState(false)
  const set = (k: keyof RegisterRequest, v: string) => {
    setValues((s) => ({ ...s, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  useEffect(() => {
    document.title = 'Create account · Unique Lights'
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found: Errors<RegisterRequest> = {
      firstName: !values.firstName.trim() ? 'Enter your first name.' : undefined,
      lastName: !values.lastName.trim() ? 'Enter your last name.' : undefined,
      email: !isEmail(values.email) ? 'Enter a valid email address.' : undefined,
      phone: values.phone && !isIndianPhone(values.phone) ? 'Enter a 10-digit mobile number, or leave it empty.' : undefined,
      password: passwordProblem(values.password),
    }
    setErrors(found)
    if (hasErrors(found)) return
    register.mutate(
      { ...values, email: values.email.trim(), firstName: values.firstName.trim(), lastName: values.lastName.trim(), phone: values.phone.trim() || null },
      {
        onSuccess: () => navigate(from, { replace: true }),
        onError: (err) => setErrors(serverErrors<RegisterRequest>(err)),
      },
    )
  }

  const s = strength(values.password)
  const formError = register.error instanceof ApiError && !register.error.errors ? getErrorMessage(register.error) : null

  return (
    <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible">
      <motion.p variants={staggerItem} className="eyebrow mb-3">
        Join Unique Lights
      </motion.p>
      <motion.h1 variants={staggerItem} className="text-[2.6rem]">
        Create your account
      </motion.h1>
      <motion.p variants={staggerItem} className="mt-2 text-muted">
        Already have one?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brass hover:underline">
          Sign in
        </Link>
      </motion.p>

      <motion.form variants={staggerItem} onSubmit={submit} noValidate className="mt-8 grid gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input label="First name" autoComplete="given-name" value={values.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} autoFocus />
          <Input label="Last name" autoComplete="family-name" value={values.lastName} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} />
        </div>
        <Input label="Email" type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
        <Input label="Mobile number" optional type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} hint="For delivery updates only." />
        <div className="grid gap-2">
          <Input
            label="Password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            hint="At least 8 characters with a letter and a number."
            trailing={
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="rounded-full p-2 text-subtle hover:text-ink">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
          <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className="h-1 overflow-hidden rounded-full bg-line">
                <motion.span className={cn('block h-full rounded-full', s <= 1 ? 'bg-danger' : s === 2 ? 'bg-warning' : 'bg-success')} initial={false} animate={{ width: s >= n ? '100%' : '0%' }} transition={{ duration: 0.25 }} />
              </span>
            ))}
          </div>
        </div>
        {formError && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 text-[0.88rem] text-danger" role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" variant="accent" size="lg" fullWidth loading={register.isPending}>
          Create account
        </Button>
      </motion.form>
    </motion.div>
  )
}
