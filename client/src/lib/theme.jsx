import { createContext, useContext, useEffect, useState } from 'react'

const ThemeCtx = createContext({
  theme: 'light',
  setTheme: () => {},
  isDark: false,
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeCtx)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('skipq_theme') || 'light'
    } catch {
      return 'light'
    }
  })

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement

    const apply = () => {
      let activeDark = false
      if (theme === 'dark') {
        activeDark = true
      } else if (theme === 'system') {
        activeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        activeDark = false
      }

      setIsDark(activeDark)
      if (activeDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    apply()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') apply()
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = newTheme => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('skipq_theme', newTheme)
    } catch {
      // ignore
    }
  }

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  )
}
