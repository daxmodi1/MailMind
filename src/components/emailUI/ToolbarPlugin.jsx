'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  useLexicalComposerContext,
  FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND,
  CAN_UNDO_COMMAND, CAN_REDO_COMMAND, COMMAND_PRIORITY_LOW,
  INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND,
  Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tooltip, TooltipContent, TooltipTrigger,
  Bold, Italic, UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Strikethrough
} from "./import"
import { FONT_FAMILIES, FONT_SIZES } from "./Editing-options"

export function ToolbarPlugin({
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
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)

  // Update format states on selection change
  useEffect(() => {
    if (!editor) return
    
    const updateFormats = () => {
      editor.read(() => {
        const selection = editor._editorState._selection
        if (selection) {
          setIsBold(selection.hasFormat('bold'))
          setIsItalic(selection.hasFormat('italic'))
          setIsUnderline(selection.hasFormat('underline'))
          setIsStrikethrough(selection.hasFormat('strikethrough'))
        }
      })
    }

    // Listen for selection changes
    const unsubscribe = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = editorState._selection
        if (selection) {
          setIsBold(selection.hasFormat('bold'))
          setIsItalic(selection.hasFormat('italic'))
          setIsUnderline(selection.hasFormat('underline'))
          setIsStrikethrough(selection.hasFormat('strikethrough'))
        }
      })
    })

    return () => unsubscribe()
  }, [editor])

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

  return (
    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 gap-1 justify-start">

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
      
      {/* Font Size */}
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
      {/* Bold,italic, underline */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}`}
            onClick={formatBold}
          >
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}`}
            onClick={formatItalic}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${isUnderline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}`}
            onClick={formatUnderline}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      {/* Alignment (left,right,center) */}
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
      
      {/* Lists (bulleted, numbered) */}
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

      {/* strikethrough */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${isStrikethrough ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}`}
              onClick={formatStrikethrough}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
