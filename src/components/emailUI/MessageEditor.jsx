'use client'
import { LexicalComposer, RichTextPlugin, ContentEditable, HistoryPlugin, ListPlugin, LinkPlugin, OnChangePlugin, LexicalErrorBoundary } from "./import"
import { editorTheme } from "./Editing-options"
import { EditorRefPlugin } from "./EditorRefPlugin"
import { ToolbarPlugin } from "./ToolbarPlugin"

export function MessageEditor({
  initialConfig,
  setEditorInstance,
  attachments,
  removeAttachment,
  setEditorStateSnapshot,
  fontFamily,
  fontSize,
  showFormatting,
  setFont,
  setTextSize,
  canUndo,
  canRedo,
  onCanUndoChange,
  onCanRedoChange
}) {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorRefPlugin setEditor={setEditorInstance} />

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
              setFont={setFont}
              setTextSize={setTextSize}
              canUndo={canUndo}
              canRedo={canRedo}
              onCanUndoChange={onCanUndoChange}
              onCanRedoChange={onCanRedoChange}
            />
          </div>
        )}
      </div>
    </LexicalComposer>
  )
}
