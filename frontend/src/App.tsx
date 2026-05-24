import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from 'components/ProtectedRoute';
import { AuthProvider } from 'context/AuthContext';
import { CartProvider } from 'context/CartContext';
import { MainLayout } from 'layouts/MainLayout';
import { AdminPage } from 'pages/Admin';
import { CartPage } from 'pages/Cart';
import { CheckoutPage } from 'pages/Checkout';
import { DeliveryAddressPage } from 'pages/DeliveryAddress';
import { HomePage } from 'pages/Home';
import { LoginPage } from 'pages/Login';
import { ProductDetailPage } from 'pages/ProductDetail';
import { RegisterPage } from 'pages/Register';
import { ShopPage } from 'pages/Shop';
import { TransferInstructionsPage } from 'pages/TransferInstructions';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="product/:productId" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout/address" element={<DeliveryAddressPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="checkout/transfer-confirmation" element={<TransferInstructionsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
