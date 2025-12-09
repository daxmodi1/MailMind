'use client'
import { useCallback } from 'react'
import { useAlert } from '@/components/providers/AlertProvider'

export const useToggleHandlers = (setIsMinimized, setIsMaximized, setShowCC, setShowBCC, setShowFormatting) => {
  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev)
    setIsMaximized(false)
  }, [setIsMinimized, setIsMaximized])

  const toggleMaximized = useCallback(() => {
    setIsMaximized(prev => !prev)
    setIsMinimized(false)
  }, [setIsMaximized, setIsMinimized])

  const toggleCC = useCallback(() => setShowCC(prev => !prev), [setShowCC])
  const toggleBCC = useCallback(() => setShowBCC(prev => !prev), [setShowBCC])
  const toggleFormatting = useCallback(() => setShowFormatting(prev => !prev), [setShowFormatting])

  return { toggleMinimized, toggleMaximized, toggleCC, toggleBCC, toggleFormatting }
}

export const useAttachmentHandlers = (fileInputRef, setAttachments) => {
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [fileInputRef, setAttachments])

  const removeAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [setAttachments])

  return { handleAttachClick, handleFileSelect, removeAttachment }
}

export const useDraftHandlers = (saveDraft, resetForm, setShowDraftDialog, setShowHelpDialog, setPendingAction, onToggle) => {
  const { showSuccess, showError } = useAlert()
  
  const handleSaveDraft = useCallback(async () => {
    const savedDraft = await saveDraft()
    if (savedDraft) {
      showSuccess('Draft saved successfully!')
      setShowDraftDialog(false)
      resetForm()
      setPendingAction(null)
      onToggle?.()
    } else {
      showError('Failed to save draft. Please try again.')
    }
  }, [saveDraft, resetForm, setShowDraftDialog, setPendingAction, onToggle, showSuccess, showError])

  const handleDiscardDraft = useCallback(() => {
    setShowDraftDialog(false)
    resetForm()
    setPendingAction(null)
    onToggle?.()
  }, [setShowDraftDialog, resetForm, setPendingAction, onToggle])

  return { handleSaveDraft, handleDiscardDraft }
}

export const useSendHandlers = (editorInstance, to, subject, cc, bcc, attachments, confidentialData, sendEmailViaAPI, validateAndPrepareEmail) => {
  const { showError } = useAlert()
  
  const handleSend = useCallback(async () => {
    try {
      if (!editorInstance) {
        showError('Editor not ready')
        return
      }

      const emailData = await validateAndPrepareEmail(
        editorInstance,
        to,
        subject,
        cc,
        bcc,
        attachments,
        confidentialData
      )

      await sendEmailViaAPI(emailData)
    } catch (error) {
      showError(error.message)
      console.error('Error sending email:', error)
    }
  }, [editorInstance, to, subject, cc, bcc, attachments, confidentialData, sendEmailViaAPI, validateAndPrepareEmail, showError])

  return { handleSend }
}

export const useConfirmationHandlers = (hasDraftContent, onToggle, setShowDraftDialog, setPendingAction) => {
  const handleCloseWithConfirmation = useCallback((action) => {
    if (hasDraftContent()) {
      setPendingAction(action)
      setShowDraftDialog(true)
    } else {
      if (action === 'close') {
        onToggle?.()
      }
    }
  }, [hasDraftContent, onToggle, setShowDraftDialog, setPendingAction])

  return { handleCloseWithConfirmation }
}
