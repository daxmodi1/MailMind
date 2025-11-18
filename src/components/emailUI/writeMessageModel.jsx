'use client'

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { $generateHtmlFromNodes } from "@lexical/html"
import {
  $getRoot,
  $getSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND
} from 'lexical'

import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { Sparkles } from "./sparkels"

// ICONS & UI COMPONENTS (adjust paths if necessary)
import {
  Maximize2, Minus, X, Link2, Smile, Trash2, EllipsisVertical,
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, MdScheduleSend, MdAddToDrive, MdOutlineImage,
  MdLockClock, FaCaretDown, FaPenAlt, FaWandMagicSparkles, BsPaperclip,
  Undo2, Redo2, IndentDecrease, IndentIncrease, Strikethrough
} from "@/lib/Icon-utils"

import {
  Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuTrigger, ButtonGroup, Tooltip,
  TooltipContent, TooltipTrigger, Separator, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue
} from "@/lib/shadcnComp"

const EditingOptions = [
  { Icon: BsPaperclip, hovercontent: 'Attach files' },
  { Icon: FaWandMagicSparkles, hovercontent: 'Help me write' },
  { Icon: Link2, hovercontent: 'Insert link' },
  { Icon: Smile, hovercontent: 'Insert emoji' },
  { Icon: MdAddToDrive, hovercontent: 'Insert from Drive' },
  { Icon: MdOutlineImage, hovercontent: 'Insert image' },
  { Icon: MdLockClock, hovercontent: 'Toggle confidential mode' },
  { Icon: FaPenAlt, hovercontent: 'Insert Signature' },
]

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Sans Serif' },
  { value: 'Georgia', label: 'Serif' },
  { value: 'Courier New', label: 'Fixed Width' },
  { value: 'Comic Sans MS', label: 'Wide' },
  { value: 'Garamond', label: 'Narrow' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Verdana', label: 'Verdana' },
]

const FONT_SIZES = [
  { value: '12px', label: 'Small' },
  { value: '14px', label: 'Normal' },
  { value: '18px', label: 'Large' },
  { value: '24px', label: 'Huge' },
]

const editorTheme = {
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
  list: {
    ul: 'list-disc ml-5',
    ol: 'list-decimal ml-5',
    listitem: 'ml-2',
  },
}

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
    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 overflow-x-auto gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0 disabled:opacity-50"
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
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0 disabled:opacity-50"
            onClick={handleRedo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Select value={fontFamily} onValueChange={setFont}>
        <SelectTrigger className="h-8 w-[120px] border-0 bg-transparent hover:bg-gray-200">
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

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Select value={fontSize} onValueChange={setTextSize}>
        <SelectTrigger className="h-8 w-[100px] border-0 bg-transparent hover:bg-gray-200">
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

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={formatBold}>
            <Bold className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={formatItalic}>
            <Italic className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={formatUnderline}>
            <UnderlineIcon className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={formatAlignLeft}>
            <AlignLeft className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={formatAlignCenter}>
            <AlignCenter className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={formatAlignRight}>
            <AlignRight className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align right</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={insertBulletList}>
            <List className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bulleted list</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={insertOrderedList}>
            <ListOrdered className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Numbered list</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={handleIndentDecrease}>
            <IndentDecrease className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Decrease indent</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0" onClick={handleIndentIncrease}>
            <IndentIncrease className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Increase indent</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0">
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

  const initialConfig = useMemo(() => ({
    namespace: 'EmailEditor',
    theme: editorTheme,
    onError: (error) => console.error('Lexical error:', error),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  }), [])

  /* ---------- Send email API helper ----------
     Keep your existing /api/send-email endpoint.
     This function POSTs JSON and handles responses.
  ------------------------------------------*/
  const sendEmailViaAPI = useCallback(async (emailData) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || `Email sending failed: ${response.statusText}`)
      }

      console.log('Email sent successfully:', result)
      alert('Email sent successfully!')
      resetForm()
      onToggle?.()
      return result

    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error.message}`)
      throw error
    }
  }, [onToggle])

  // Reset all fields and editor state
  const resetForm = useCallback(() => {
    setTo('')
    setSubject('')
    setCc('')
    setBcc('')
    setAttachments([])
    setEditorStateSnapshot(null)
    setShowFormatting(false)

    // Reset Lexical editor content if instance available
    if (editorInstance) {
      try {
        editorInstance.update(() => {
          const root = $getRoot()
          root.clear() // clear content
        })
      } catch (err) {
        // best-effort
        console.warn('Failed to clear editor content:', err)
      }
    }
  }, [editorInstance])

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

  /* ---------- handleSend ----------
     Generate HTML via editor.update() — this is the correct, safe way.
     If HTML generation fails we fallback to plain text via read().
  ----------------------------------*/
  const handleSend = useCallback(async () => {
    // basic validation
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

    let emailContent = ''

    try {
      // Use editor.update so that $-helpers can be used safely.
      editorInstance.update(() => {
        // $generateHtmlFromNodes accepts an EditorState or node list.
        // Passing the editor instance here has worked reliably in prior Lexical usage
        // — this is the same pattern used in the patch above.
        try {
          const html = $generateHtmlFromNodes(editorInstance, null)
          emailContent = html
        } catch (inner) {
          // If html generation inside update() throws, swallow and fallback below
          console.warn('Inner HTML generation failed inside update():', inner)
          emailContent = ''
        }
      })
    } catch (error) {
      console.error('Error generating HTML (update):', error)
    }

    // Fallback: if HTML empty, read plain text (safe read)
    if (!emailContent || emailContent.trim() === '') {
      try {
        // getEditorState().read uses a read-only transform
        const editorState = editorInstance.getEditorState && editorInstance.getEditorState()
        if (editorState && editorState.read) {
          editorState.read(() => {
            const root = $getRoot()
            emailContent = root.getTextContent()
          })
        } else {
          // as a final fallback, attempt a small read via update (best-effort)
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

    const emailData = {
      to: to.trim(),
      subject: subject.trim(),
      message: emailContent,
      cc: cc.trim() || null,
      bcc: bcc.trim() || null,
    }

    console.log('Sending email:', emailData)

    try {
      await sendEmailViaAPI(emailData)
    } catch (error) {
      console.error('Error sending email:', error)
    }

  }, [editorInstance, to, subject, cc, bcc, sendEmailViaAPI])

  if (!isOpen) return null

  return (
    <>
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
                      <Button variant='ghost' className="font-semibold text-base p-1" onClick={toggleFormatting}>
                        Aa
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Text Formatting</TooltipContent>
                  </Tooltip>

                  {EditingOptions.map(({ Icon, hovercontent }, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button variant='ghost' className="font-semibold text-base p-2">
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
