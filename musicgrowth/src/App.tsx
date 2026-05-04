import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/sidebar'
import { Dashboard } from './pages/dashboard'
import { Plan } from './pages/plans'
import { LogSession } from './pages/LogSession'
import { Goals } from './pages/goals'
import { Journal } from './pages/journal'
import { Progress } from './pages/progress'
import { SongStudio } from './pages/SongStudio'
import { Challenge } from './pages/Challenge'
import { Login } from './pages/Login'
import { authApi } from './api/auth'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => authApi.isLoggedIn())

  if (!isLoggedIn) {
    return <Login onDone={() => setIsLoggedIn(true)} />
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-cream-100">
        <Sidebar />
        <main className="
          flex-1
          md:ml-60
          pt-14 md:pt-0
          pb-20 md:pb-0
          px-4 py-6
          md:px-10 md:py-10
          min-h-screen
        ">
          <div className="max-w-2xl md:max-w-4xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/studio" element={<SongStudio />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/log" element={<LogSession />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/progress" element={<Progress />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;