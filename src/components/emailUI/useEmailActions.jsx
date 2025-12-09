'use client'
import { useCallback } from 'react'
import { $getRoot, $generateHtmlFromNodes } from "./import"
import { useAlert } from '@/components/providers/AlertProvider'

export const useDraftFunctionality = (editorInstance, to, subject, cc, bcc, attachments, isConfidential, confidentialData) => {
  const saveDraft = useCallback(async () => {
    if (!editorInstance) {
      console.error('Editor not initialized')
      return null
    }

    try {
      let htmlContent = ''
      await editorInstance.update(() => {
        htmlContent = $generateHtmlFromNodes(editorInstance, null)
      })

      console.log('=== Saving Draft ===')
      console.log('To:', to || '(empty)')
      console.log('Subject:', subject || '(empty)')
      console.log('Content length:', htmlContent?.length || 0)
      console.log('CC:', cc || '(empty)')
      console.log('BCC:', bcc || '(empty)')
      console.log('Attachments:', attachments.length)

      const draft = {
        to,
        subject,
        cc,
        bcc,
        content: htmlContent,
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        isConfidential,
        confidentialData,
        savedAt: new Date().toISOString()
      }

      // Save to localStorage
      localStorage.setItem('emailDraft', JSON.stringify(draft))
      console.log('✓ Draft saved to localStorage')

      // Also save to backend API
      try {
        const formData = new FormData()
        formData.append('to', to.trim())
        formData.append('subject', subject.trim())
        formData.append('message', htmlContent)
        formData.append('cc', cc?.trim() || '')
        formData.append('bcc', bcc?.trim() || '')
        formData.append('isDraft', 'true')
        
        if (isConfidential && confidentialData) {
          formData.append('confidential', JSON.stringify(confidentialData))
        }

        attachments.forEach((file) => {
          formData.append('attachments', file)
        })

        console.log('Sending draft to backend API...')
        const response = await fetch('/api/send-email', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (response.ok) {
          console.log('✓ Draft saved to backend:', result.draftId)
          return { ...draft, draftId: result.draftId }
        } else {
          console.warn('⚠️ Backend draft save failed:', result.error)
          return draft
        }
      } catch (backendError) {
        console.warn('⚠️ Error saving draft to backend:', backendError)
        return draft
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error)
      return null
    }
  }, [to, subject, cc, bcc, attachments, isConfidential, confidentialData, editorInstance])

  return { saveDraft }
}

export const useEmailSending = (onToggle, resetForm) => {
  const { showSuccess, showError } = useAlert()
  
  const sendEmailViaAPI = useCallback(async (emailData) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: emailData
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error('Email send error response:', result)
        const errorMessage = result.error || `Email sending failed: ${response.statusText}`
        showError(errorMessage)
        throw new Error(errorMessage)
      }

      console.log('Email sent successfully:', result)
      showSuccess(`Email sent successfully! Message ID: ${result.messageId}`)
      resetForm()
      onToggle?.()
      return result

    } catch (error) {
      console.error('Error sending email:', error)
      if (!error.message.includes('Email sending failed:')) {
        showError(`Failed to send email: ${error.message}`)
      }
      throw error
    }
  }, [onToggle, resetForm, showSuccess, showError])

  return { sendEmailViaAPI }
}
