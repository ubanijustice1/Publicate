import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const TITLES = {
  '/app/dashboard': 'Dashboard',
  '/app/calendar': 'Content Calendar',
  '/app/captions': 'AI Caption Generator',
  '/app/post-score': 'Post Score',
  '/app/trends': 'Trend Radar',
  '/app/media-kit': 'Media Kit Generator',
  '/app/monetization': 'Monetization Navigator',
  '/app/plans': 'Subscription Plans',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Publicate'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-2 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
