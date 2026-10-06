import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/api/axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Card } from '@/components/ui/Misc'
import { useChangePassword, useUpdateProfile } from '@/features/account/hooks'
import { useAppSelector } from '@/store/hooks'
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/api'
import { formatDate } from '@/utils/format'
import { hasErrors, isIndianPhone, passwordProblem, serverErrors, type Errors } from '@/utils/validation'

function ProfileForm() {
  const user = useAppSelector((s) => s.auth.user)
  const update = useUpdateProfile()
  const [values, setValues] = useState<UpdateProfileRequest & { phone: string }>({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' })
  const [errors, setErrors] = useState<Errors<UpdateProfileRequest>>({})
  const dirty = values.firstName !== user?.firstName || values.lastName !== user?.lastName || (values.phone || null) !== (user?.phone || null)

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const found: Errors<UpdateProfileRequest> = {
          firstName: !values.firstName.trim() ? 'Enter your first name.' : undefined,
          lastName: !values.lastName.trim() ? 'Enter your last name.' : undefined,
          phone: values.phone && !isIndianPhone(values.phone) ? 'Enter a 10-digit mobile number.' : undefined,
        }
        setErrors(found)
        if (hasErrors(found)) return
        update.mutate({ firstName: values.firstName.trim(), lastName: values.lastName.trim(), phone: values.phone.trim() || null }, { onError: (err) => setErrors(serverErrors(err)) })
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Input label="First name" value={values.firstName} onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))} error={errors.firstName} autoComplete="given-name" />
      <Input label="Last name" value={values.lastName} onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))} error={errors.lastName} autoComplete="family-name" />
      <Input label="Email" value={user?.email ?? ''} disabled hint="Contact us to change the email on your account." />
      <Input label="Mobile number" optional type="tel" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} error={errors.phone} autoComplete="tel" />
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" variant="accent" loading={update.isPending} disabled={!dirty}>
          Save profile
        </Button>
      </div>
    </form>
  )
}

function PasswordForm() {
  const change = useChangePassword()
  const [values, setValues] = useState<ChangePasswordRequest & { confirm: string }>({ currentPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState<Errors<ChangePasswordRequest & { confirm: string }>>({})

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const found = {
          currentPassword: !values.currentPassword ? 'Enter your current password.' : undefined,
          newPassword: passwordProblem(values.newPassword),
          confirm: values.confirm !== values.newPassword ? 'Passwords do not match.' : undefined,
        }
        setErrors(found)
        if (hasErrors(found)) return
        change.mutate(
          { currentPassword: values.currentPassword, newPassword: values.newPassword },
          {
            onSuccess: () => setValues({ currentPassword: '', newPassword: '', confirm: '' }),
            onError: (err) => setErrors({ ...serverErrors(err), currentPassword: serverErrors<ChangePasswordRequest>(err).currentPassword ?? getErrorMessage(err) }),
          },
        )
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      <Input label="Current password" type="password" autoComplete="current-password" value={values.currentPassword} onChange={(e) => setValues((v) => ({ ...v, currentPassword: e.target.value }))} error={errors.currentPassword} />
      <Input label="New password" type="password" autoComplete="new-password" value={values.newPassword} onChange={(e) => setValues((v) => ({ ...v, newPassword: e.target.value }))} error={errors.newPassword} />
      <Input label="Confirm new password" type="password" autoComplete="new-password" value={values.confirm} onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))} error={errors.confirm} />
      <div className="flex justify-end sm:col-span-3">
        <Button type="submit" variant="outline" loading={change.isPending}>
          Change password
        </Button>
      </div>
    </form>
  )
}

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user)
  useEffect(() => {
    document.title = 'My account · Unique Lights'
  }, [])
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[1.5rem]">Profile</h2>
          <p className="text-[0.82rem] text-subtle">Member since {formatDate(user?.createdAt, { month: 'long', year: 'numeric' })}</p>
        </div>
        <ProfileForm key={user?.id} />
      </Card>
      <Card className="p-6">
        <h2 className="mb-5 text-[1.5rem]">Password</h2>
        <PasswordForm />
      </Card>
    </div>
  )
}
