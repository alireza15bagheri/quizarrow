import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ConfirmationContext = createContext(null)

const defaultOptions = {
  title: 'Are you sure?',
  message: 'Please confirm this action.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmButtonClass: 'btn-primary',
}

function ConfirmModal({ isOpen, options, onConfirm, onCancel }) {
  if (!isOpen) return null

  const { title, message, confirmText, cancelText, confirmButtonClass } = options

  return (
    // The modal-open class makes it visible
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4 whitespace-pre-wrap">{message}</p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${confirmButtonClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ConfirmationProvider({ children }) {
  const [options, setOptions] = useState(defaultOptions)
  const [isOpen, setIsOpen] = useState(false)
  const resolveRef = useRef(null)

  const confirmAction = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      setOptions({ ...defaultOptions, ...opts })
      setIsOpen(true)
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(true)
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    if (resolveRef.current) {
      resolveRef.current(false)
    }
    setIsOpen(false)
  }

  return (
    <ConfirmationContext.Provider value={{ confirmAction }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmationContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmationProvider')
  }
  return ctx
}