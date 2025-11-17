'use client'
import { useState, useCallback, useMemo } from "react"
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

// ...rest of your code stays the same...

import {
  Maximize2, Minus, X, Link2, Smile, Trash2, EllipsisVertical,
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, MdScheduleSend, MdAddToDrive, MdOutlineImage,
  MdLockClock, FaCaretDown, FaPenAlt, FaWandMagicSparkles, BsPaperclip,
  Undo2, Redo2, IndentDecrease, IndentIncrease, Strikethrough, RemoveFormatting
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

  // Track undo/redo state
  useMemo(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        onCanUndoChange(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor, onCanUndoChange])

  useMemo(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        onCanRedoChange(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor, onCanRedoChange])

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }, [editor])

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }, [editor])

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  }, [editor])

  const formatStrikethrough = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
  }, [editor])

  const formatAlignLeft = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
  }, [editor])

  const formatAlignCenter = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
  }, [editor])

  const formatAlignRight = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
  }, [editor])

  const insertBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  }, [editor])

  const insertOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  }, [editor])

  const handleUndo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }, [editor])

  const handleRedo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }, [editor])

  const handleIndentDecrease = useCallback(() => {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
  }, [editor])

  const handleIndentIncrease = useCallback(() => {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
  }, [editor])
  return (
    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 overflow-x-auto gap-1">
      {/* Undo/Redo */}
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

      {/* Font Family */}
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

      {/* Font Size */}
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

      {/* Text Formatting */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={formatBold}
          >
            <Bold className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={formatItalic}
          >
            <Italic className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={formatUnderline}
          >
            <UnderlineIcon className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={formatAlignLeft}
          >
            <AlignLeft className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={formatAlignCenter}
          >
            <AlignCenter className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={formatAlignRight}
          >
            <AlignRight className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align right</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={insertBulletList}
          >
            <List className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bulleted list</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={insertOrderedList}
          >
            <ListOrdered className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Numbered list</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Indent */}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={handleIndentDecrease}
          >
            <IndentDecrease className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Decrease indent</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
            onClick={handleIndentIncrease}
          >
            <IndentIncrease className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Increase indent</TooltipContent>
      </Tooltip>
      {/* More Options */}
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
  const [editorState, setEditorState] = useState(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const initialConfig = useMemo(() => ({
    namespace: 'EmailEditor',
    theme: editorTheme,
    onError: (error) => console.error(error),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  }), [])

  // Replace the handleSend function (around line 432)
  const handleSend = useCallback(() => {
    if (!editorState) {
      console.warn('No content to send')
      return
    }

    let emailContent = ''

    editorState.read(() => {
      const root = $getRoot()

      // Get HTML content for rich formatting
      try {
        emailContent = $generateHtmlFromNodes(editorState, null)
      } catch (error) {
        // Fallback to plain text if HTML generation fails
        emailContent = root.getTextContent()
      }
    })

    // Validate required fields
    if (!to.trim()) {
      alert('Please enter a recipient email address')
      return
    }

    if (!subject.trim()) {
      alert('Please enter a subject')
      return
    }

    if (!emailContent.trim()) {
      alert('Please write a message')
      return
    }

    // Email data object
    const emailData = {
      to: to.trim(),
      subject: subject.trim(),
      message: emailContent,
      cc: cc.trim() || null,
      bcc: bcc.trim() || null,
      attachments: attachments || [],
      timestamp: new Date().toISOString(),
      format: 'html' // Since we're using HTML content
    }

    console.log('Sending email:', emailData)

    // Here you would integrate with your email sending service
    // Examples:

    // Option 1: Send via API
    sendEmailViaAPI(emailData)

    // Option 2: Send via backend endpoint
    // fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(emailData)
    // })

    // Show success message
    alert('Email sent successfully!')

    // Clear form after sending
    resetForm()

  }, [editorState, to, subject, cc, bcc, attachments])

  // Add these helper functions after handleSend
  const sendEmailViaAPI = useCallback(async (emailData) => {
    try {
      // Replace with your actual email service (e.g., SendGrid, Mailgun, etc.)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Email sent successfully:', result)
      return result

    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error.message}`)
      throw error
    }
  }, [])

  const resetForm = useCallback(() => {
    setTo('')
    setSubject('')
    setCc('')
    setBcc('')
    setAttachments([])
    setEditorState(null)

    // Clear the editor content
    // This will reset the editor to initial state
    setShowFormatting(false)
  }, [])
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop for maximized state */}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={toggleMinimized}
            >
              <Minus className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={toggleMaximized}
            >
              <Maximize2 className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={onToggle}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* To Field */}
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-gray-600 hover:bg-gray-100 border py-5 border-b-3"
                  onClick={toggleCC}
                >
                  CC
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100 border py-5 border-b-3"
                  onClick={toggleBCC}
                >
                  BCC
                </Button>
              </div>
            </div>

            {/* CC Field */}
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

            {/* BCC Field */}
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

            {/* Subject Field */}
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

            {/* Lexical Editor */}
            <div className="flex-1 overflow-y-auto p-4 relative">
              <LexicalComposer initialConfig={initialConfig}>
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
                  <OnChangePlugin
                    onChange={(editorState) => {
                      setEditorState(editorState)
                    }}
                  />
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

            {/* Writing Assistant */}
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

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-row gap-2">
                <ButtonGroup>
                  <Button
                    onClick={handleSend}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-500 border-r-1 border-indigo-800"
                  >
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
                        variant='ghost'
                        className="font-semibold text-base p-1"
                        onClick={toggleFormatting}
                      >
                        Aa
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Text Formatting
                    </TooltipContent>
                  </Tooltip>
                  {EditingOptions.map(({ Icon, hovercontent }, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button variant='ghost' className="font-semibold text-base p-2">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {hovercontent}
                      </TooltipContent>
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
                  <TooltipContent>
                    More options
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                      <Trash2 className="h-5 w-5 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Discard draft
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}