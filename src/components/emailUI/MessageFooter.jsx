'use client'
import { useCallback } from 'react'
import {
  Button, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, ButtonGroup,
  Tooltip, TooltipContent, TooltipTrigger, EllipsisVertical, Trash2,
  Undo2, Redo2, IndentDecrease, IndentIncrease, MdScheduleSend, FaCaretDown,
  UNDO_COMMAND, REDO_COMMAND, OUTDENT_CONTENT_COMMAND, INDENT_CONTENT_COMMAND
} from "./import"
import { EditingOptions } from "./Editing-options"
import { EmojiPickerComponent } from "./EmojiPickerPlugin"
import ConfidentialModeComponent from "./ConfidentialModePlugin"

export function MessageFooter({
  editorInstance,
  onSend,
  onReset,
  canUndo,
  canRedo,
  toggleFormatting,
  onAttachClick,
  onHelpClick,
  handleConfidentialToggle
}) {
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

  const handleEditingOption = useCallback((action) => {
    switch (action) {
      case 'attach':
        onAttachClick()
        break
      case 'help':
        console.log('Opening help me write dialog')
        onHelpClick()
        break
      case 'link':
        console.log('Insert link clicked')
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
  }, [onAttachClick, onHelpClick])

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-row gap-2">
        <ButtonGroup>
          <Button onClick={onSend} className="gap-2 bg-indigo-600 hover:bg-indigo-500 border-r-1 border-indigo-800">
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

          <EmojiPickerComponent editorInstance={editorInstance} />
          <ConfidentialModeComponent onToggle={handleConfidentialToggle} />

          {EditingOptions.map(({ Icon, hovercontent, action }, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  className="font-semibold text-base p-2"
                  onClick={() => handleEditingOption(action)}
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
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={onReset}>
              <Trash2 className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </div>
    </div>
  )
}
