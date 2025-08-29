import { useEffect, useState } from 'react'

const THEMES = ['autumn', 'dracula']

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dracula')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }

  return (
    <div className="form-control">
      <label className="label cursor-pointer gap-2">
        <span className="label-text">Theme</span>
        <select
          className="select select-bordered select-sm"
          value={theme}
          onChange={handleThemeChange}
        >
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}