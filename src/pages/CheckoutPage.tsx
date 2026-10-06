import { Banknote, Check, ChevronLeft, CreditCard, Lock, MapPin, Plus, ShoppingBag, Smartphone, Tag, Truck, X, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '@/api/axios'
import { slideSwap } from '@/animations/variants'
import { AddressForm } from '@/components/account/AddressForm'
import { Button, LinkButton } from '@/components/ui/Button'
import { RadioCard } from '@/components/ui/Choice'
import { Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Overlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/States'
import { useAddresses } from '@/features/account/hooks'
import { useCart } from '@/features/cart/hooks'
import { useCheckoutQuote, useCreateOrder, useValidateCoupon } from '@/features/orders/hooks'
import { useToast } from '@/hooks/useToast'
import type { DeliveryMethod, PaymentMethod } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatDate, formatMoney, paymentMethodLabel } from '@/utils/format'

const STEPS = ['Cart', 'Address', 'Delivery', 'Payment', 'Review'] as const
type Step = 0 | 1 | 2 | 3 | 4

function Progress({ step, onJump }: { step: Step; onJump: (s: Step) => void }) {
  return (
    <ol className="relative flex items-center justify-between" aria-label="Checkout progress">
      <div className="absolute inset-x-4 top-4 h-0.5 bg-line" aria-hidden="true" />
      <motion.div
        className="absolute left-4 top-4 h-0.5 origin-left bg-brass shadow-[0_0_8px_var(--ul-glow)]"
        style={{ right: '1rem' }}
        initial={false}
        animate={{ scaleX: step / (STEPS.length - 1) }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        aria-hidden="true"
      />
      {STEPS.map((label, i) => {
        const done = i < step
        const current = i === step
        return (
          <li key={label} className="relative z-10 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => done && onJump(i as Step)}
              disabled={!done}
              aria-current={current ? 'step' : undefined}
              aria-label={`${label}${done ? ' (completed)' : ''}`}
              className={cn(
                'flex size-8 items-center justify-center rounded-full border-2 font-mono text-[0.78rem] transition-colors duration-300',
                done && 'border-brass bg-brass text-on-brass',
                current && 'border-brass bg-bg text-brass shadow-[0_0_0_4px_var(--ul-glow)]',
                !done && !current && 'border-line-strong bg-bg text-subtle',
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={done ? 'done' : 'n'} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.18 }}>
                  {done ? <Check size={15} strokeWidth={3} /> : i + 1}
                </motion.span>
              </AnimatePresence>
            </button>
            <span className={cn('hidden text-[0.78rem] sm:block', current ? 'text-ink' : 'text-subtle')}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { cart, isLoading: cartLoading } = useCart()
  const addresses = useAddresses()
  const [step, setStep] = useState<Step>(0)
  const [dir, setDir] = useState(1)
  const [addressId, setAddressId] = useState<string | null>(null)
  const [addingAddress, setAddingAddress] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryMethod>('Standard')
  const [payment, setPayment] = useState<PaymentMethod>('CashOnDelivery')
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const quote = useCheckoutQuote(delivery, coupon, cart.items.length > 0)
  const standardQuote = useCheckoutQuote('Standard', coupon, cart.items.length > 0)
  const expressQuote = useCheckoutQuote('Express', coupon, cart.items.length > 0)
  const validateCoupon = useValidateCoupon()
  const createOrder = useCreateOrder()

  useEffect(() => {
    document.title = 'Checkout · Unique Lights'
  }, [])

  useEffect(() => {
    if (addressId || !addresses.data?.length) return
    setAddressId((addresses.data.find((a) => a.isDefault) ?? addresses.data[0])!.id)
  }, [addresses.data, addressId])

  const selectedAddress = useMemo(() => addresses.data?.find((a) => a.id === addressId), [addresses.data, addressId])

  const go = (next: Step) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponError(null)
    validateCoupon.mutate(
      { code, subtotal: cart.subtotal },
      {
        onSuccess: (res) => {
          setCoupon(res.code)
          toast.success({ title: `${res.code} applied`, description: `You save ${formatMoney(res.discountAmount)}` })
        },
        onError: (e) => setCouponError(getErrorMessage(e)),
      },
    )
  }

  const placeOrder = () => {
    if (!addressId) return go(1)
    createOrder.mutate(
      { addressId, deliveryMethod: delivery, paymentMethod: payment, couponCode: coupon, notes: notes.trim() || null },
      {
        onSuccess: (order) => navigate(`/order-confirmed/${order.orderNumber}`, { replace: true }),
        onError: (e) => toast.fromError(e, 'We could not place your order'),
      },
    )
  }

  if (cartLoading) {
    return (
      <div className="container-page grid gap-6 py-12">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (cart.items.length === 0 && !createOrder.isSuccess) {
    return (
      <EmptyState
        className="py-28"
        icon={<ShoppingBag size={30} />}
        title="Nothing to check out yet"
        description="Your cart is empty. Add a light or two first."
        action={
          <LinkButton to="/products" variant="accent">
            Browse lighting
          </LinkButton>
        }
      />
    )
  }

  const q = quote.data
  const canContinue = step === 1 ? Boolean(addressId) : true

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Progress step={step} onJump={go} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.section key={step} custom={dir} variants={slideSwap} initial="enter" animate="center" exit="leave" aria-labelledby="step-title">
              <h1 id="step-title" className="mb-6 text-[clamp(1.8rem,3.4vw,2.6rem)]">
                {['Review your cart', 'Where should we deliver?', 'How fast do you need it?', 'How would you like to pay?', 'Check and place your order'][step]}
              </h1>

              {step === 0 && (
                <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
                  {cart.items.map((i) => (
                    <li key={i.id} className="flex items-center gap-4 p-4">
                      {i.imageUrl && <img src={i.imageUrl} alt="" className="size-16 rounded-lg object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-display text-[1.05rem] leading-snug">{i.productName}</p>
                        <p className="text-[0.82rem] text-muted">
                          {i.variantName} · Qty {i.quantity}
                        </p>
                      </div>
                      <p className="font-mono text-[0.9rem] tabular">{formatMoney(i.lineTotal)}</p>
                    </li>
                  ))}
                  <li className="p-4">
                    <Link to="/cart" className="text-[0.88rem] font-semibold text-brass hover:underline">
                      Edit cart
                    </Link>
                  </li>
                </ul>
              )}

              {step === 1 && (
                <div className="grid gap-3">
                  {addresses.isPending ? (
                    <Skeleton className="h-28" />
                  ) : (
                    addresses.data?.map((a) => (
                      <RadioCard
                        key={a.id}
                        name="address"
                        value={a.id}
                        checked={addressId === a.id}
                        onChange={setAddressId}
                        icon={<MapPin size={18} />}
                        title={
                          <span className="flex flex-wrap items-center gap-2">
                            {a.fullName}
                            {a.label && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.72rem] text-muted">{a.label}</span>}
                            {a.isDefault && <span className="text-[0.72rem] text-brass">Default</span>}
                          </span>
                        }
                        description={
                          <>
                            {a.line1}
                            {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}
                            <br />
                            {a.phone}
                          </>
                        }
                      />
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => setAddingAddress(true)}
                    className="flex items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 text-[0.92rem] font-semibold text-muted transition-colors hover:border-brass hover:text-brass"
                  >
                    <Plus size={18} /> Add a new address
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3">
                  <RadioCard
                    name="delivery"
                    value="Standard"
                    checked={delivery === 'Standard'}
                    onChange={(v) => setDelivery(v as DeliveryMethod)}
                    icon={<Truck size={18} />}
                    title="Standard delivery"
                    description={standardQuote.data ? `Arrives by ${formatDate(standardQuote.data.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'short' })}` : '5 working days'}
                    aside={standardQuote.data ? (standardQuote.data.shipping === 0 ? <span className="font-semibold text-success">Free</span> : formatMoney(standardQuote.data.shipping)) : <Skeleton className="h-4 w-12" />}
                  />
                  <RadioCard
                    name="delivery"
                    value="Express"
                    checked={delivery === 'Express'}
                    onChange={(v) => setDelivery(v as DeliveryMethod)}
                    icon={<Zap size={18} />}
                    title="Express delivery"
                    description={expressQuote.data ? `Arrives by ${formatDate(expressQuote.data.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'short' })}` : '2 working days'}
                    aside={expressQuote.data ? formatMoney(expressQuote.data.shipping) : <Skeleton className="h-4 w-12" />}
                  />
                  <Textarea label="Delivery instructions" optional maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate code, preferred time, a neighbour who can receive it…" className="min-h-20" />
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-3">
                  <RadioCard name="payment" value="CashOnDelivery" checked={payment === 'CashOnDelivery'} onChange={(v) => setPayment(v as PaymentMethod)} icon={<Banknote size={18} />} title="Cash on delivery" description="Pay in cash or by UPI when your order arrives." />
                  <RadioCard name="payment" value="Upi" checked={payment === 'Upi'} onChange={(v) => setPayment(v as PaymentMethod)} icon={<Smartphone size={18} />} title="UPI" description="Google Pay, PhonePe, Paytm or any UPI app." />
                  <RadioCard name="payment" value="Card" checked={payment === 'Card'} onChange={(v) => setPayment(v as PaymentMethod)} icon={<CreditCard size={18} />} title="Credit or debit card" description="Visa, Mastercard, RuPay. Processed securely by our payment partner." />
                </div>
              )}

              {step === 4 && selectedAddress && (
                <div className="grid gap-4">
                  {[
                    {
                      title: 'Deliver to',
                      body: (
                        <>
                          <b className="font-semibold text-ink">{selectedAddress.fullName}</b>, {selectedAddress.line1}
                          {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode} · {selectedAddress.phone}
                        </>
                      ),
                      edit: 1 as Step,
                    },
                    {
                      title: 'Delivery',
                      body: `${delivery} · arrives by ${q ? formatDate(q.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'short' }) : '…'}`,
                      edit: 2 as Step,
                    },
                    { title: 'Payment', body: paymentMethodLabel[payment], edit: 3 as Step },
                  ].map((row) => (
                    <div key={row.title} className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-line p-4">
                      <div>
                        <p className="eyebrow mb-1">{row.title}</p>
                        <p className="text-[0.92rem] text-muted">{row.body}</p>
                      </div>
                      <button type="button" onClick={() => go(row.edit)} className="text-[0.85rem] font-semibold text-brass hover:underline">
                        Change
                      </button>
                    </div>
                  ))}
                  <p className="flex items-center gap-2 text-[0.82rem] text-subtle">
                    <Lock size={13} /> By placing your order you agree to our delivery and returns terms.
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {step > 0 ? (
                  <Button variant="ghost" onClick={() => go((step - 1) as Step)}>
                    <ChevronLeft size={17} /> Back
                  </Button>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {step < 4 ? (
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" disabled={!canContinue} onClick={() => go((step + 1) as Step)}>
                    Continue to {STEPS[step + 1]?.toLowerCase()}
                  </Button>
                ) : (
                  <Button variant="accent" size="lg" className="w-full sm:w-auto" loading={createOrder.isPending} disabled={!q || quote.isFetching} onClick={placeOrder}>
                    <Lock size={16} /> Place order · {q ? formatMoney(q.total) : '…'}
                  </Button>
                )}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        <aside className="h-fit rounded-[var(--radius-card)] border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-[1.4rem]">Summary</h2>
          <ul className="mt-4 grid gap-3">
            {cart.items.slice(0, 3).map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="relative">
                  {i.imageUrl && <img src={i.imageUrl} alt="" className="size-12 rounded-lg object-cover" />}
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-ink font-mono text-[0.65rem] text-bg">{i.quantity}</span>
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.88rem]">{i.productName}</span>
                <span className="font-mono text-[0.82rem] tabular">{formatMoney(i.lineTotal)}</span>
              </li>
            ))}
            {cart.items.length > 3 && <li className="text-[0.82rem] text-subtle">+ {cart.items.length - 3} more</li>}
          </ul>

          <div className="mt-5 border-t border-line pt-5">
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl bg-success/10 px-3 py-2.5 text-[0.88rem] text-success">
                <span className="flex items-center gap-2">
                  <Tag size={15} /> <b className="font-mono">{coupon}</b> applied
                </span>
                <button type="button" onClick={() => setCoupon(null)} aria-label="Remove coupon" className="rounded-full p-1 hover:bg-success/15">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  applyCoupon()
                }}
              >
                <input
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value)
                    setCouponError(null)
                  }}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  className="h-10 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 font-mono text-[0.85rem] uppercase outline-none placeholder:normal-case focus:border-brass"
                />
                <Button type="submit" variant="outline" size="sm" className="!h-10" loading={validateCoupon.isPending}>
                  Apply
                </Button>
              </form>
            )}
            <AnimatePresence>
              {couponError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-[0.8rem] text-danger" role="alert">
                  {couponError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <dl className="mt-5 grid gap-2.5 border-t border-line pt-5 text-[0.9rem]">
            {(
              [
                ['Subtotal', q?.subtotal ?? cart.subtotal],
                ['Discount', q ? -q.discount : 0],
                ['Delivery', q?.shipping],
                ['GST (18%)', q?.tax],
              ] as const
            ).map(([label, value]) =>
              label === 'Discount' && !value ? null : (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted">{label}</dt>
                  <dd className={cn('font-mono tabular', label === 'Discount' && 'text-success')}>
                    {value === undefined ? <Skeleton className="h-4 w-16" /> : label === 'Delivery' && value === 0 ? 'Free' : formatMoney(value)}
                  </dd>
                </div>
              ),
            )}
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-semibold">Total</dt>
              <dd>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={q?.total ?? 'x'} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="inline-block font-display text-[1.6rem] tabular">
                    {q ? formatMoney(q.total) : '—'}
                  </motion.span>
                </AnimatePresence>
              </dd>
            </div>
          </dl>
          {quote.isError && <p className="mt-3 text-[0.8rem] text-danger">{getErrorMessage(quote.error)}</p>}
        </aside>
      </div>

      <Modal open={addingAddress} onClose={() => setAddingAddress(false)} title="New delivery address" size="lg">
        <AddressForm
          defaultChecked={!addresses.data?.length}
          onCancel={() => setAddingAddress(false)}
          onSaved={(a) => {
            if (a) setAddressId(a.id)
            setAddingAddress(false)
          }}
        />
      </Modal>
    </div>
  )
}
