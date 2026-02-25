import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Perfil from './pages/Perfil'
import HacerEncuesta from './pages/encuestas/HacerEncuesta'
import VerEncuestas from './pages/encuestas/VerEncuestas'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminEncuestas from './pages/admin/EncuestasAdmin'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Estudiante */}
          <Route path="/" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><AppLayout><Perfil /></AppLayout></ProtectedRoute>} />
          <Route path="/encuestas/hacer" element={<ProtectedRoute><AppLayout><HacerEncuesta /></AppLayout></ProtectedRoute>} />
          <Route path="/encuestas/ver" element={<ProtectedRoute><AppLayout><VerEncuestas /></AppLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/usuarios" element={<AdminRoute><AppLayout><AdminUsuarios /></AppLayout></AdminRoute>} />
          <Route path="/admin/encuestas" element={<AdminRoute><AppLayout><AdminEncuestas /></AppLayout></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  )
}
