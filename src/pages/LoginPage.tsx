import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, getErrorMessage } from '@/api/axios'
import { staggerContainer, staggerItem } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useLogin } from '@/features/auth/hooks'
import { hasErrors, isEmail, type Errors } from '@/utils/validation'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'
  const [values, setValues] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors<LoginForm>>({})
  const [show, setShow] = useState(false)
  const [shake, setShake] = useState(0)

  useEffect(() => {
    document.title = 'Sign in · Unique Lights'
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found: Errors<LoginForm> = {
      email: !isEmail(values.email) ? 'Enter a valid email address.' : undefined,
      password: !values.password ? 'Enter your password.' : undefined,
    }
    setErrors(found)
    if (hasErrors(found)) return setShake((s) => s + 1)
    login.mutate(
      { email: values.email.trim(), password: values.password },
      {
        onSuccess: (auth) => navigate(auth.user.roles.includes('Admin') && from === '/account' ? '/admin' : from, { replace: true }),
        onError: () => setShake((s) => s + 1),
      },
    )
  }

  const formError = login.error instanceof ApiError || login.error ? getErrorMessage(login.error) : null

  return (
    <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible">
      <motion.p variants={staggerItem} className="eyebrow mb-3">
        Welcome back
      </motion.p>
      <motion.h1 variants={staggerItem} className="text-[2.6rem]">
        Sign in
      </motion.h1>
      <motion.p variants={staggerItem} className="mt-2 text-muted">
        New to Unique Lights?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-brass hover:underline">
          Create an account
        </Link>
      </motion.p>

      <motion.form variants={staggerItem} onSubmit={submit} noValidate className="mt-8 grid gap-5">
        <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : undefined} transition={{ duration: 0.4 }} className="grid gap-5">
          <Input label="Email" type="email" autoComplete="email" leading={<Mail size={17} />} value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} error={errors.email} autoFocus />
          <Input
            label="Password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            leading={<Lock size={17} />}
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            error={errors.password}
            trailing={
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="rounded-full p-2 text-subtle hover:text-ink">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
        </motion.div>
        {formError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-danger/10 px-4 py-3 text-[0.88rem] text-danger" role="alert">
            {formError}
          </motion.p>
        )}
        <Button type="submit" variant="accent" size="lg" fullWidth loading={login.isPending}>
          Sign in
        </Button>
      </motion.form>
    </motion.div>
  )
}
