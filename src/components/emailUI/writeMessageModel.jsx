'use client'
import { useState, useCallback, useMemo, useEffect, useRef, cn, HeadingNode, QuoteNode, ListItemNode, ListNode, LinkNode, Sparkles, Button, $getRoot, CAN_UNDO_COMMAND, CAN_REDO_COMMAND, COMMAND_PRIORITY_LOW } from "./import"
import { editorTheme } from "./Editing-options"
import { DraftSaveDialog } from "./DraftSaveDialog"
import { HelpMeWriteDialog } from "./HelpMeWriteDialog"
import { EditorRefPlugin } from "./EditorRefPlugin"
import { ToolbarPlugin } from "./ToolbarPlugin"
import { MessageHeader } from "./MessageHeader"
import { MessageEditor } from "./MessageEditor"
import { MessageFooter } from "./MessageFooter"
import { useDraftFunctionality, useEmailSending } from "./useEmailActions"
import { validateAndPrepareEmail } from "./emailUtils"
/* ---------- EditorRefPlugin ----------
   Captures the Lexical editor instance and
   exposes it to the parent via setEditor.
--------------------------------------*/

/* ---------- ToolbarPlugin ----------
   Uses editor commands to control formatting.
--------------------------------------*/

/* ---------- Main Component ----------
   Full replacement of the WriteMessage component.
--------------------------------------*/
export default function WriteMessage({ isOpen, onToggle }) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [attachments, setAttachments] = useState([])
  const [showFormatting, setShowFormatting] = useState(false)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontSize, setFontSize] = useState('14px')
  const [editorStateSnapshot, setEditorStateSnapshot] = useState(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [editorInstance, setEditorInstance] = useState(null)
  const [isConfidential, setIsConfidential] = useState(false)
  const [confidentialData, setConfidentialData] = useState(null)
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [showHelpDialog, setShowHelpDialog] = useState(false)

  const handleConfidentialToggle = useCallback((data) => {
    setConfidentialData(data)
    if (data) {
      console.log('Confidential mode enabled:', data)
    } else {
      console.log('Confidential mode disabled')
    }
  }, [])

  const initialConfig = useMemo(() => ({
    namespace: 'EmailEditor',
    theme: editorTheme,
    onError: (error) => console.error('Lexical error:', error),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  }), [])

  // Register undo/redo listeners
  useEffect(() => {
    if (!editorInstance) return

    const unregisterUndo = editorInstance.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )

    const unregisterRedo = editorInstance.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )

    return () => {
      unregisterUndo()
      unregisterRedo()
    }
  }, [editorInstance])

  const fileInputRef = useRef(null)

  const resetForm = useCallback(() => {
    setTo('')
    setSubject('')
    setCc('')
    setBcc('')
    setAttachments([])
    setEditorStateSnapshot(null)
    setShowFormatting(false)
    setIsConfidential(false)
    setConfidentialData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (editorInstance) {
      try {
        editorInstance.update(() => {
          const root = $getRoot()
          root.clear()
        })
      } catch (err) {
        console.warn('Failed to clear editor content:', err)
      }
    }
  }, [editorInstance])

  // Draft and email hooks
  const { saveDraft } = useDraftFunctionality(editorInstance, to, subject, cc, bcc, attachments, isConfidential, confidentialData)
  const { sendEmailViaAPI } = useEmailSending(onToggle, resetForm)

  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev)
    setIsMaximized(false)
  }, [])

  const toggleMaximized = useCallback(() => {
    setIsMaximized(prev => !prev)
    setIsMinimized(false)
  }, [])

  const toggleCC = useCallback(() => setShowCC(prev => !prev), [])
  const toggleBCC = useCallback(() => setShowBCC(prev => !prev), [])
  const toggleFormatting = useCallback(() => setShowFormatting(prev => !prev), [])

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const removeAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSend = useCallback(async () => {
    try {
      if (!editorInstance) {
        alert('Editor not ready')
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
      alert(error.message)
      console.error('Error sending email:', error)
    }
  }, [editorInstance, to, subject, cc, bcc, attachments, confidentialData, sendEmailViaAPI])

  const hasDraftContent = useCallback(() => {
    return !!(to.trim() || subject.trim() || attachments.length > 0 || editorStateSnapshot)
  }, [to, subject, attachments, editorStateSnapshot])

  const handleCloseWithConfirmation = useCallback((action) => {
    if (hasDraftContent()) {
      setPendingAction(action)
      setShowDraftDialog(true)
    } else {
      if (action === 'close') {
        onToggle?.()
      }
    }
  }, [hasDraftContent, onToggle])

  const handleSaveDraft = useCallback(async () => {
    const savedDraft = await saveDraft()
    if (savedDraft) {
      alert('Draft saved successfully!')
      setShowDraftDialog(false)
      resetForm()
      if (pendingAction === 'close') {
        onToggle?.()
      }
    } else {
      alert('Failed to save draft. Please try again.')
    }
  }, [saveDraft, resetForm, pendingAction, onToggle])

  const handleDiscardDraft = useCallback(() => {
    setShowDraftDialog(false)
    resetForm()
    if (pendingAction === 'close') {
      onToggle?.()
    }
  }, [resetForm, pendingAction, onToggle])
  if (!isOpen) return null

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {isMaximized && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={toggleMaximized}
        />
      )}

      <div
        className={cn(
          "fixed bg-white shadow-2xl border border-gray-200 z-50 transition-all duration-200 flex flex-col",
          isMaximized
            ? "inset-4 rounded-lg"
            : isMinimized
              ? "bottom-0 right-6 w-full max-w-xl h-14 rounded-t-lg"
              : "bottom-0 right-6 w-full max-w-xl h-[700px] rounded-t-lg"
        )}
      >
        <MessageHeader
          onMinimize={toggleMinimized}
          onMaximize={toggleMaximized}
          onClose={() => handleCloseWithConfirmation('close')}
          to={to}
          setTo={setTo}
          cc={cc}
          setCc={setCc}
          bcc={bcc}
          setBcc={setBcc}
          subject={subject}
          setSubject={setSubject}
          showCC={showCC}
          toggleCC={toggleCC}
          showBCC={showBCC}
          toggleBCC={toggleBCC}
        />

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 relative">
              <MessageEditor
                initialConfig={initialConfig}
                setEditorInstance={setEditorInstance}
                attachments={attachments}
                removeAttachment={removeAttachment}
                setEditorStateSnapshot={setEditorStateSnapshot}
                fontFamily={fontFamily}
                fontSize={fontSize}
                showFormatting={showFormatting}
                setFont={setFontFamily}
                setTextSize={setFontSize}
                canUndo={canUndo}
                canRedo={canRedo}
                onCanUndoChange={setCanUndo}
                onCanRedoChange={setCanRedo}
              />
            </div>

            <div className="px-4 pb-2">
              <Button
                variant="ghost"
                size="sm"
                className="py-5 rounded-full border border-indigo-200 bg-blue-50 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8"
              >
                <Sparkles stroke="blue" width={20} height={20} />
                <span className="text-sm font-semibold">Writing Assistant</span>
              </Button>
            </div>

            <MessageFooter
              editorInstance={editorInstance}
              onSend={handleSend}
              onReset={resetForm}
              canUndo={canUndo}
              canRedo={canRedo}
              toggleFormatting={toggleFormatting}
              onAttachClick={handleAttachClick}
              onHelpClick={() => setShowHelpDialog(true)}
              handleConfidentialToggle={handleConfidentialToggle}
            />
          </>
        )}

        <DraftSaveDialog 
          isOpen={showDraftDialog} 
          onOpenChange={setShowDraftDialog}
          onSaveDraft={handleSaveDraft}
          onDiscardDraft={handleDiscardDraft}
        />

        <HelpMeWriteDialog
          isOpen={showHelpDialog}
          onOpenChange={setShowHelpDialog}
          editorInstance={editorInstance}
        />
      </div>
    </>
  )
}
