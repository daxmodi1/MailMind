'use client'
import { useEffect } from 'react'
import { useLexicalComposerContext } from "./import"

export function EditorRefPlugin({ setEditor }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    setEditor(editor)
  }, [editor, setEditor])
  return null
}
