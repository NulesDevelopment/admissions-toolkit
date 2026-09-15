import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { SpravaPage } from './pages/SpravaPage'
import { StatystykaPage } from './pages/StatystykaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/sprava" replace />} />
          <Route path="sprava" element={<SpravaPage />} />
          <Route path="statystyka" element={<StatystykaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
