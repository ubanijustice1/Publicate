import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import CaptionGenerator from './pages/CaptionGenerator'
import PostScore from './pages/PostScore'
import TrendRadar from './pages/TrendRadar'
import MediaKit from './pages/MediaKit'
import Monetization from './pages/Monetization'
import Plans from './pages/Plans'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="captions" element={<CaptionGenerator />} />
        <Route path="post-score" element={<PostScore />} />
        <Route path="trends" element={<TrendRadar />} />
        <Route path="media-kit" element={<MediaKit />} />
        <Route path="monetization" element={<Monetization />} />
        <Route path="plans" element={<Plans />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
