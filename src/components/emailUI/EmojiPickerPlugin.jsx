'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import EmojiPickerReact from 'emoji-picker-react'
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@/lib/shadcnComp"
import { Smile } from "@/lib/Icon-utils"
import { $getSelection } from 'lexical'

export function EmojiPickerComponent({ editorInstance }) {
  const [showEmoji, setShowEmoji] = useState(false)
  const emojiPickerRef = useRef(null)

  const handleEmojiClick = useCallback((emojiObject) => {
    if (!editorInstance) {
      console.warn('Editor instance not available')
      return
    }

    const emoji = emojiObject.emoji

    try {
      editorInstance.update(() => {
        const selection = $getSelection()
        if (selection) {
          selection.insertText(emoji)
        }
      })
      setShowEmoji(false)
    } catch (error) {
      console.error('Error inserting emoji:', error)
    }
  }, [editorInstance])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false)
      }
    }

    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmoji])

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            className="font-semibold text-base p-2"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert emoji</TooltipContent>
      </Tooltip>

      {/* Emoji Picker */}
      {showEmoji && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-12 right-0 z-50 shadow-lg rounded-lg border border-gray-200"
        >
          <EmojiPickerReact
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme="light"
            width={300}
            height={400}
            searchDisabled={false}
          />
        </div>
      )}
    </div>
  )
}

export default EmojiPickerComponent