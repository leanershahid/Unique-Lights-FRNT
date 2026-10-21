import { lazy } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/Toaster'
import { AccountLayout } from '@/layouts/AccountLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { StoreLayout } from '@/layouts/StoreLayout'
import { GuestOnly, RequireAdmin, RequireAuth } from './guards'
import { RouteError } from './RouteError'

// Every page is code-split; layouts stay in the main bundle so the shell paints immediately.
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'))
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'))
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage'))

const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/ProductsPage'))
const AdminProductEditPage = lazy(() => import('@/pages/admin/ProductEditPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'))
const AdminInventoryPage = lazy(() => import('@/pages/admin/InventoryPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/OrdersPage'))
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/OrderDetailPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/CustomersPage'))
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/CustomerDetailPage'))
const AdminCouponsPage = lazy(() => import('@/pages/admin/CouponsPage'))

/**
 * Wraps every route so app-wide UI that uses router links (toast "View cart" / "View wishlist" actions)
 * renders inside the router. Rendering it outside crashes with "Cannot destructure property 'basename'".
 */
function RootShell() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootShell />,
    children: [
  {
    element: <StoreLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'categories/:slug', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: 'order-confirmed/:orderNumber',
        element: (
          <RequireAuth>
            <OrderSuccessPage />
          </RequireAuth>
        ),
      },
      {
        path: 'account',
        element: (
          <RequireAuth>
            <AccountLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <ProfilePage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:orderNumber', element: <OrderDetailPage /> },
          { path: 'addresses', element: <AddressesPage /> },
          { path: 'wishlist', element: <WishlistPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: (
      <GuestOnly>
        <AuthLayout />
      </GuestOnly>
    ),
    errorElement: <RouteError />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: 'admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/new', element: <AdminProductEditPage /> },
      { path: 'products/:id', element: <AdminProductEditPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'inventory', element: <AdminInventoryPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'orders/:orderNumber', element: <AdminOrderDetailPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'customers/:id', element: <AdminCustomerDetailPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
    ],
  },
    ],
  },
])
