import { useState } from 'react'
import { getErrorMessage } from '@/api/axios'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Choice'
import { Input, Select } from '@/components/ui/Field'
import { useSaveAddress } from '@/features/account/hooks'
import type { AddressDto, AddressRequest } from '@/types/api'
import { hasErrors, isIndianPhone, isPin, serverErrors, type Errors } from '@/utils/validation'

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const empty: AddressRequest = { label: '', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false }

function validate(v: AddressRequest): Errors<AddressRequest> {
  return {
    fullName: v.fullName.trim().length < 2 ? 'Enter the recipient’s full name.' : undefined,
    phone: !isIndianPhone(v.phone) ? 'Enter a 10-digit mobile number.' : undefined,
    line1: v.line1.trim().length < 3 ? 'Enter the house number and street.' : undefined,
    city: !v.city.trim() ? 'Enter the city.' : undefined,
    state: !v.state ? 'Choose a state.' : undefined,
    postalCode: !isPin(v.postalCode) ? 'Enter a 6-digit PIN code.' : undefined,
  }
}

export function AddressForm({ address, onSaved, onCancel, defaultChecked }: { address?: AddressDto; onSaved: (a: AddressDto | void) => void; onCancel?: () => void; defaultChecked?: boolean }) {
  const [values, setValues] = useState<AddressRequest>(address ? { ...address, label: address.label ?? '', line2: address.line2 ?? '' } : { ...empty, isDefault: defaultChecked ?? false })
  const [errors, setErrors] = useState<Errors<AddressRequest>>({})
  const save = useSaveAddress()
  const set = <K extends keyof AddressRequest>(key: K, value: AddressRequest[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (hasErrors(found)) return
    save.mutate(
      { id: address?.id, body: { ...values, label: values.label?.trim() || null, line2: values.line2?.trim() || null, phone: values.phone.replace(/[\s-]/g, '') } },
      { onSuccess: onSaved, onError: (err) => setErrors(serverErrors<AddressRequest>(err)) },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="Full name" autoComplete="name" value={values.fullName} onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} data-autofocus />
      <Input label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} placeholder="98765 43210" />
      <Input containerClassName="sm:col-span-2" label="House / flat, street" autoComplete="address-line1" value={values.line1} onChange={(e) => set('line1', e.target.value)} error={errors.line1} />
      <Input containerClassName="sm:col-span-2" label="Area, landmark" optional autoComplete="address-line2" value={values.line2 ?? ''} onChange={(e) => set('line2', e.target.value)} />
      <Input label="City" autoComplete="address-level2" value={values.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
      <Input label="PIN code" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={values.postalCode} onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, ''))} error={errors.postalCode} />
      <Select label="State" value={values.state} onChange={(e) => set('state', e.target.value)} error={errors.state} autoComplete="address-level1">
        <option value="">Choose state</option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Input label="Label" optional placeholder="Home, Office…" value={values.label ?? ''} onChange={(e) => set('label', e.target.value)} />
      <div className="sm:col-span-2">
        <Checkbox checked={values.isDefault} onChange={(c) => set('isDefault', c)} label="Use as my default delivery address" />
      </div>
      {save.isError && !hasErrors(serverErrors(save.error)) && <p className="text-[0.85rem] text-danger sm:col-span-2">{getErrorMessage(save.error)}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="accent" loading={save.isPending}>
          {address ? 'Save changes' : 'Save address'}
        </Button>
      </div>
    </form>
  )
}
