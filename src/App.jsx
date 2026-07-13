import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Route-level code splitting: each feature page loads on demand,
// keeping the initial bundle small for slow connections.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Calendar = lazy(() => import('./pages/Calendar'))
const CaptionGenerator = lazy(() => import('./pages/CaptionGenerator'))
const PostScore = lazy(() => import('./pages/PostScore'))
const TrendRadar = lazy(() => import('./pages/TrendRadar'))
const MediaKit = lazy(() => import('./pages/MediaKit'))
const Monetization = lazy(() => import('./pages/Monetization'))
const Plans = lazy(() => import('./pages/Plans'))

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

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
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="calendar"
          element={
            <Suspense fallback={<PageLoader />}>
              <Calendar />
            </Suspense>
          }
        />
        <Route
          path="captions"
          element={
            <Suspense fallback={<PageLoader />}>
              <CaptionGenerator />
            </Suspense>
          }
        />
        <Route
          path="post-score"
          element={
            <Suspense fallback={<PageLoader />}>
              <PostScore />
            </Suspense>
          }
        />
        <Route
          path="trends"
          element={
            <Suspense fallback={<PageLoader />}>
              <TrendRadar />
            </Suspense>
          }
        />
        <Route
          path="media-kit"
          element={
            <Suspense fallback={<PageLoader />}>
              <MediaKit />
            </Suspense>
          }
        />
        <Route
          path="monetization"
          element={
            <Suspense fallback={<PageLoader />}>
              <Monetization />
            </Suspense>
          }
        />
        <Route
          path="plans"
          element={
            <Suspense fallback={<PageLoader />}>
              <Plans />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
