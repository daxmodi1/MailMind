import { useState } from "react"
import { cn } from "@/lib/utils"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

import { Sparkles } from "./sparkels"
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
  { value: 'small', label: 'Small', class: 'text-sm' },
  { value: 'normal', label: 'Normal', class: 'text-base' },
  { value: 'large', label: 'Large', class: 'text-lg' },
  { value: 'huge', label: 'Huge', class: 'text-2xl' },
]

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
]

const HIGHLIGHT_COLORS = [
  'transparent', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff', '#ff0000', '#ffa500',
]

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
  const [fontSize, setFontSize] = useState('normal')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your message...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-0',
      },
    },
  })

  if (!isOpen) return null

  const handleSend = () => {
    const htmlContent = editor?.getHTML() || ''
    console.log({ to, subject, message: htmlContent, cc, bcc, attachments })
  }

  const setTextSize = (size) => {
    setFontSize(size)
    const sizeClass = FONT_SIZES.find(s => s.value === size)?.class || 'text-base'
    
    if (editor) {
      editor.chain().focus().setMark('textStyle', { fontSize: sizeClass }).run()
    }
  }

  const setFont = (font) => {
    setFontFamily(font)
    if (editor) {
      editor.chain().focus().setFontFamily(font).run()
    }
  }

  return (
    <>
      {/* Backdrop for maximized state */}
      {isMaximized && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMaximized(false)}
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
              onClick={() => {
                setIsMinimized(!isMinimized)
                setIsMaximized(false)
              }}
            >
              <Minus className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={() => {
                setIsMaximized(!isMaximized)
                setIsMinimized(false)
              }}
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
                  onClick={() => setShowCC(!showCC)}
                >
                  CC
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100 border py-5 border-b-3"
                  onClick={() => setShowBCC(!showBCC)}
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

            {/* Tiptap Editor */}
            <div className="flex-1 overflow-y-auto p-4">
              <EditorContent 
                editor={editor} 
                className="min-h-full w-full text-base leading-relaxed"
                style={{ fontFamily: fontFamily }}
              />
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="px-4 pb-3">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">PDF</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">{file.size}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-gray-200"
                      onClick={() =>
                        setAttachments(attachments.filter((_, i) => i !== index))
                      }
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

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

            {/* Formatting Toolbar */}
            {showFormatting && editor && (
              <div className="px-4 pb-2">
                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 overflow-x-auto gap-1">
                  {/* Undo/Redo */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
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
                        className="h-8 w-8 hover:bg-gray-200 flex-shrink-0"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
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
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive('bold') && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().toggleBold().run()}
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
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive('italic') && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
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
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive('underline') && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                      >
                        <UnderlineIcon className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Underline</TooltipContent>
                  </Tooltip>

                  {/* Text Color */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-600 font-bold text-lg">A</span>
                          <div className="w-4 h-0.5 bg-gray-600 -mt-1"></div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <div className="grid grid-cols-10 gap-1 p-2">
                        {TEXT_COLORS.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => editor.chain().focus().setColor(color).run()}
                          />
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Highlight Color */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-600 font-bold text-lg">A</span>
                          <div className="w-4 h-0.5 bg-yellow-400 -mt-1"></div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <div className="grid grid-cols-8 gap-1 p-2">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => 
                              color === 'transparent' 
                                ? editor.chain().focus().unsetHighlight().run()
                                : editor.chain().focus().setHighlight({ color }).run()
                            }
                          />
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  {/* Alignment */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive({ textAlign: 'left' }) && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
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
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive({ textAlign: 'center' }) && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
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
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive({ textAlign: 'right' }) && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
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
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive('bulletList') && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
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
                        className={cn(
                          "h-8 w-8 hover:bg-gray-200 flex-shrink-0",
                          editor.isActive('orderedList') && "bg-gray-300"
                        )}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
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
                        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
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
                        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                      >
                        <IndentIncrease className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Increase indent</TooltipContent>
                  </Tooltip>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  {/* More Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200 flex-shrink-0">
                        <EllipsisVertical className="h-4 w-4 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()}>
                        <Strikethrough className="mr-2 h-4 w-4" />
                        Strikethrough
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
                        <RemoveFormatting className="mr-2 h-4 w-4" />
                        Remove formatting
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

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
                  {/* Formatting toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        className="font-semibold text-base p-1"
                        onClick={() => setShowFormatting(!showFormatting)}
                      >
                        Aa
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Text Formatting
                    </TooltipContent>
                  </Tooltip>
                  {/* Editing options */}
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