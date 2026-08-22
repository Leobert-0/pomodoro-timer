import { Routes, Route, useLocation } from 'react-router-dom'
import TimerPage from './pages/TimerPage/TimerPage'
import StatsPage from './pages/StatsPage/StatsPage'
import NavBar from './components/NavBar/NavBar'
import styles from './App.module.css'

function App() {
  const { pathname } = useLocation()
  const isTimerPage = pathname === '/'

  return (
    <>
      <div className={styles.backgroundDecor}>
        <div className={`${styles.glow} ${styles.glow1}`} />
        <div className={`${styles.glow} ${styles.glow2}`} />
      </div>
      <main className={styles.main}>
        <div className={styles.timerPage} hidden={!isTimerPage}>
          <TimerPage isActive={isTimerPage} />
        </div>
        <Routes>
          <Route path="/" element={null} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={null} />
        </Routes>
      </main>
      <NavBar />
    </>
  )
}

export default App
