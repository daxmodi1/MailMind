'use client'
import ConfidentialModeComponent from "./ConfidentialModePlugin"
import {
  useState, useCallback, useMemo, useEffect, useRef, cn,
  LexicalComposer, RichTextPlugin, ContentEditable,
  HistoryPlugin, ListPlugin, LinkPlugin, OnChangePlugin, useLexicalComposerContext, LexicalErrorBoundary,
  $generateHtmlFromNodes,
  $getRoot, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND,
  CAN_UNDO_COMMAND, CAN_REDO_COMMAND, COMMAND_PRIORITY_LOW,
  INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, HeadingNode, QuoteNode,
  ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND,
  LinkNode, Sparkles, Maximize2, Minus, X, Trash2, EllipsisVertical,
  Bold, Italic, UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, MdScheduleSend, FaCaretDown, Undo2, Redo2,
  IndentDecrease, IndentIncrease, Strikethrough, Button, Input, DropdownMenu, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, ButtonGroup,
  Tooltip, TooltipContent, TooltipTrigger, Separator,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "./import"

import { EditingOptions, FONT_FAMILIES, FONT_SIZES, editorTheme } from "./Editing-options"
import { EmojiPickerComponent } from "./EmojiPickerPlugin"
/* ---------- EditorRefPlugin ----------
   Captures the Lexical editor instance and
   exposes it to the parent via setEditor.
   This is required so you can call editor.update()
   to safely run $generateHtmlFromNodes.
--------------------------------------*/
function EditorRefPlugin({ setEditor }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    setEditor(editor)
    // cleanup not required for this simple case
  }, [editor, setEditor])
  return null
}

/* ---------- ToolbarPlugin ----------
   Uses editor commands to control formatting.
--------------------------------------*/
function ToolbarPlugin({
  fontFamily,
  fontSize,
  setFont,
  setTextSize,
  canUndo,
  canRedo,
  onCanUndoChange,
  onCanRedoChange
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor || !onCanUndoChange) return
    const unregister = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        onCanUndoChange(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )
    return () => unregister()
  }, [editor, onCanUndoChange])

  useEffect(() => {
    if (!editor || !onCanRedoChange) return
    const unregister = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        onCanRedoChange(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )
    return () => unregister()
  }, [editor, onCanRedoChange])

  const formatBold = useCallback(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'), [editor])
  const formatItalic = useCallback(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'), [editor])
  const formatUnderline = useCallback(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'), [editor])
  const formatStrikethrough = useCallback(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'), [editor])
  const formatAlignLeft = useCallback(() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'), [editor])
  const formatAlignCenter = useCallback(() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'), [editor])
  const formatAlignRight = useCallback(() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'), [editor])
  const insertBulletList = useCallback(() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined), [editor])
  const insertOrderedList = useCallback(() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined), [editor])
  const handleUndo = useCallback(() => editor.dispatchCommand(UNDO_COMMAND, undefined), [editor])
  const handleRedo = useCallback(() => editor.dispatchCommand(REDO_COMMAND, undefined), [editor])
  const handleIndentDecrease = useCallback(() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined), [editor])
  const handleIndentIncrease = useCallback(() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined), [editor])

  return (
    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 gap-0.5 flex-wrap justify-start">
      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      {/* Font Family */}
      <Select value={fontFamily} onValueChange={setFont}>
        <SelectTrigger className="h-8 w-[100px] border-0 bg-transparent hover:bg-gray-200 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      <Select value={fontSize} onValueChange={setTextSize}>
        <SelectTrigger className="h-8 w-[80px] border-0 bg-transparent hover:bg-gray-200 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={formatBold}>
            <Bold className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={formatItalic}>
            <Italic className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={formatUnderline}>
            <UnderlineIcon className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={formatAlignLeft}>
            <AlignLeft className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={formatAlignCenter}>
            <AlignCenter className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={formatAlignRight}>
            <AlignRight className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align right</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={insertBulletList}>
            <List className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bulleted list</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={insertOrderedList}>
            <ListOrdered className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Numbered list</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200">
            <EllipsisVertical className="h-4 w-4 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={formatStrikethrough}>
            <Strikethrough className="mr-2 h-4 w-4" />
            Strikethrough
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* ---------- Main Component ----------
   Full replacement of the WriteMessage component.
--------------------------------------*/
export default function WriteMessage({ isOpen, onToggle }) {
  // Email fields & UI state
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
  const [editorStateSnapshot, setEditorStateSnapshot] = useState(null) // optional snapshot storage
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // The actual Lexical editor instance reference
  const [editorInstance, setEditorInstance] = useState(null)
  const [isConfidential, setIsConfidential] = useState(false)
  const [confidentialData, setConfidentialData] = useState(null)

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

  /* Register listeners for CAN_UNDO and CAN_REDO commands */
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

  /* ---------- Send email API helper ----------
     Keep your existing /api/send-email endpoint.
     This function POSTs JSON and handles responses.
  ------------------------------------------*/

  // Reset all fields and editor state
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
  const sendEmailViaAPI = useCallback(async (emailData) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: emailData
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error('Email send error response:', result)
        throw new Error(result.error || `Email sending failed: ${response.statusText}`)
      }

      console.log('Email sent successfully:', result)
      alert(`Email sent successfully with ID: ${result.messageId}`)
      resetForm()
      onToggle?.()
      return result

    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error.message}`)
      throw error
    }
  }, [onToggle, resetForm])

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

  const handleUndo = useCallback(() => {
    if (editorInstance) {
      editorInstance.dispatchCommand(UNDO_COMMAND, undefined)
    }
  }, [editorInstance])

  const handleRedo = useCallback(() => {
    if (editorInstance) {
      editorInstance.dispatchCommand(REDO_COMMAND, undefined)
    }
  }, [editorInstance])

  const handleIndentDecrease = useCallback(() => {
    if (editorInstance) {
      editorInstance.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
    }
  }, [editorInstance])

  const handleIndentIncrease = useCallback(() => {
    if (editorInstance) {
      editorInstance.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
    }
  }, [editorInstance])

  const fileInputRef = useRef(null)
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
    // Basic validation
    if (!editorInstance) {
      alert('Editor not ready')
      return
    }

    if (!to.trim()) {
      alert('Please enter a recipient email address')
      return
    }

    if (!subject.trim()) {
      alert('Please enter a subject')
      return
    }

    // Extract email content from Lexical editor
    let emailContent = ''
    try {
      editorInstance.update(() => {
        try {
          const html = $generateHtmlFromNodes(editorInstance, null)
          emailContent = html
        } catch (inner) {
          console.warn('Inner HTML generation failed:', inner)
          emailContent = ''
        }
      })
    } catch (error) {
      console.error('Error generating HTML:', error)
    }

    // Fallback: if HTML empty, read plain text
    if (!emailContent || emailContent.trim() === '') {
      try {
        const editorState = editorInstance.getEditorState?.()
        if (editorState?.read) {
          editorState.read(() => {
            const root = $getRoot()
            emailContent = root.getTextContent()
          })
        } else {
          editorInstance.update(() => {
            const root = $getRoot()
            emailContent = root.getTextContent()
          })
        }
      } catch (err) {
        console.error('Fallback plain text read failed:', err)
      }
    }

    if (!emailContent || emailContent.trim() === '') {
      alert('Please write a message')
      return
    }

    const emailData = new FormData()
    emailData.append('to', to.trim())
    emailData.append('subject', subject.trim())
    emailData.append('message', emailContent)
    emailData.append('cc', cc.trim() || '')
    emailData.append('bcc', bcc.trim() || '')

    // Add confidential mode data
    if (confidentialData) {
      emailData.append('confidential', JSON.stringify({
        enabled: true,
        expiry: confidentialData.expiry,
        passcode: confidentialData.passcode,
      }))
    }

    // Add attachments
    for (const file of attachments) {
      console.log(`Adding attachment: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
      emailData.append('attachments', file)
    }

    console.log('Sending email with', attachments.length, 'attachments to:', to.trim())
    console.log('Confidential:', confidentialData)

    try {
      await sendEmailViaAPI(emailData)
    } catch (error) {
      console.error('Error sending email:', error)
    }

  }, [editorInstance, to, subject, cc, bcc, attachments, confidentialData, sendEmailViaAPI])
  if (!isOpen) return null
  return (
    <>
      {/* Hidden file input for attachments */}
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
        {/* Header */}
        <div className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-300" />
            <h2 className="text-lg font-semibold">New Message</h2>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={toggleMinimized}>
              <Minus className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={toggleMaximized}>
              <Maximize2 className="h-4 w-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={onToggle}>
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* To field + CC/BCC toggles */}
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm font-medium text-gray-700 w-14">To</span>
              <Input
                type="email"
                placeholder="Recipients"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 p-2 h-auto text-sm placeholder:text-gray-400 placeholder:p-2 border-b-2"
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-3 text-xs text-gray-600 hover:bg-gray-100 border py-5 border-b-3" onClick={toggleCC}>CC</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100 border py-5 border-b-3" onClick={toggleBCC}>BCC</Button>
              </div>
            </div>

            {/* CC */}
            {showCC && (
              <div className="flex items-center gap-3 px-4 pt-3">
                <span className="text-sm font-medium text-gray-700 w-13">CC</span>
                <Input
                  type="email"
                  placeholder="CC Recipients"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="flex-1 p-2 h-auto text-sm placeholder:text-gray-400 placeholder:p-2 border-b-2"
                />
              </div>
            )}

            {/* BCC */}
            {showBCC && (
              <div className="flex items-center gap-3 px-4 pt-3">
                <span className="text-sm font-medium text-gray-700 w-13">BCC</span>
                <Input
                  type="email"
                  placeholder="BCC Recipients"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="flex-1 p-2 h-auto text-sm placeholder:text-gray-400 placeholder:p-2 border-b-2"
                />
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm font-medium text-gray-700 w-13">Subject</span>
              <Input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 p-2 h-auto text-sm placeholder:text-gray-400 placeholder:p-2 border-b-2"
              />
            </div>

            <Separator />

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-4 relative">
              <LexicalComposer initialConfig={initialConfig}>
                {/* get editor instance into state */}
                <EditorRefPlugin setEditor={setEditorInstance} />

                {/* Attachments list */}
                {attachments.length > 0 && (
                  <div className="mb-3 p-3 border border-gray-200 bg-gray-50 rounded">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Attachments ({attachments.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-300 text-xs">
                          <span className="text-gray-700 truncate max-w-[150px]">{file.name}</span>
                          <span className="text-gray-500">({(file.size / 1024).toFixed(1)}KB)</span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="ml-1 text-gray-400 hover:text-red-500 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        className="min-h-[200px] w-full text-base leading-relaxed focus:outline-none"
                        style={{ fontFamily, fontSize }}
                      />
                    }
                    placeholder={
                      <div className="absolute top-0 left-0 text-gray-400 pointer-events-none">
                        Write your message...
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <ListPlugin />
                  <LinkPlugin />
                  <OnChangePlugin onChange={(editorState) => setEditorStateSnapshot(editorState)} />
                  {showFormatting && (
                    <div className="mt-4">
                      <ToolbarPlugin
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        setFont={setFontFamily}
                        setTextSize={setFontSize}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onCanUndoChange={setCanUndo}
                        onCanRedoChange={setCanRedo}
                      />
                    </div>
                  )}
                </div>
              </LexicalComposer>
            </div>

            {/* Writing assistant button (UI placeholder) */}
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

            {/* Footer with send */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-row gap-2">
                <ButtonGroup>
                  <Button onClick={handleSend} className="gap-2 bg-indigo-600 hover:bg-indigo-500 border-r-1 border-indigo-800">
                    Send
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" className="bg-indigo-600">
                        <FaCaretDown className="h-5 w-5 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <MdScheduleSend className="mr-2 h-4 w-4 text-blue-400" />
                          Scheduled Send
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroup>

                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-200 disabled:opacity-50"
                        onClick={handleUndo}
                        disabled={!canUndo}
                      >
                        <Undo2 className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-200 disabled:opacity-50"
                        onClick={handleRedo}
                        disabled={!canRedo}
                      >
                        <Redo2 className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo</TooltipContent>
                  </Tooltip>

                  <div className="w-px h-6 bg-gray-300 mx-0.5" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={handleIndentDecrease}>
                        <IndentDecrease className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Decrease indent</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size="icon" className="h-8 w-8 hover:bg-gray-200" onClick={handleIndentIncrease}>
                        <IndentIncrease className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Increase indent</TooltipContent>
                  </Tooltip>

                  <div className="w-px h-6 bg-gray-300 mx-0.5" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' className="font-semibold text-base p-1" onClick={toggleFormatting}>
                        Aa
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Text Formatting</TooltipContent>
                  </Tooltip>

                  {/* Emoji Picker Component */}
                  <EmojiPickerComponent editorInstance={editorInstance} />
                  <ConfidentialModeComponent onToggle={handleConfidentialToggle} />
                  {/* Other editing options */}
                  {EditingOptions.map(({ Icon, hovercontent, action }, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          className="font-semibold text-base p-2"
                          onClick={() => {
                            switch (action) {
                              case 'attach':
                                handleAttachClick()
                                break
                              case 'help':
                                console.log('Help me write clicked')
                                // Add your help write functionality here
                                break
                              case 'link':
                                console.log('Insert link clicked')
                                // Add insert link functionality
                                break
                              case 'drive':
                                console.log('Insert from Drive clicked')
                                break
                              case 'image':
                                console.log('Insert image clicked')
                                break
                              case 'confidential':
                                console.log('Toggle confidential mode clicked')
                                break
                              case 'signature':
                                console.log('Insert signature clicked')
                                break
                              default:
                                break
                            }
                          }}
                        >
                          <Icon className="h-5 w-5 text-gray-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{hovercontent}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                      <EllipsisVertical className="h-5 w-5 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={resetForm}>
                      <Trash2 className="h-5 w-5 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Discard draft</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
