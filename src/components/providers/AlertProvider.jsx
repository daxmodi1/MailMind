'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const AlertContext = createContext()

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const showAlert = useCallback((type, message, duration = 5000) => {
    const id = Date.now()
    const alert = { id, type, message }
    
    setAlerts(prev => [...prev, alert])
    
    if (duration > 0) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id))
      }, duration)
    }
    
    return id
  }, [])

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const showSuccess = useCallback((message, duration) => {
    return showAlert('success', message, duration)
  }, [showAlert])

  const showError = useCallback((message, duration) => {
    return showAlert('error', message, duration)
  }, [showAlert])

  return (
    <AlertContext.Provider value={{ showSuccess, showError, removeAlert }}>
      {children}
      
      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-md">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            className={`relative transition-all duration-300 ease-in-out shadow-lg border ${
              alert.type === 'success' 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            
            <AlertDescription className="pr-8">
              {alert.message}
            </AlertDescription>
            
            <button
              onClick={() => removeAlert(alert.id)}
              className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-sm transition-colors"
              aria-label="Close alert"
            >
              <X className="h-3 w-3" />
            </button>
          </Alert>
        ))}
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}