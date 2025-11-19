'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button, $getRoot, $createParagraphNode, $createTextNode } from "./import"
import { Loader2 } from 'lucide-react'

export function HelpMeWriteDialog({ isOpen, onOpenChange, editorInstance }) {
  const [prompt, setPrompt] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showGenerated, setShowGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate email')
      }

      const data = await response.json()
      setGeneratedEmail(data.email)
      setShowGenerated(true)
    } catch (err) {
      setError(err.message)
      console.error('Email generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = async () => {
    if (!generatedEmail || !editorInstance) {
      setError('Unable to insert. Please try again.')
      return
    }

    try {
      await editorInstance.update(() => {
        const root = $getRoot()
        root.clear()
        
        // Split email by lines and create paragraphs
        const lines = generatedEmail.split('\n').filter(line => line.trim() !== '')
        
        if (lines.length === 0) {
          // If no lines after filtering, just add the whole email
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode(generatedEmail))
          root.append(paragraph)
        } else {
          lines.forEach((line, index) => {
            const paragraph = $createParagraphNode()
            paragraph.append($createTextNode(line))
            root.append(paragraph)
            
            // Add spacing between paragraphs for readability
            if (index < lines.length - 1) {
              const spacer = $createParagraphNode()
              root.append(spacer)
            }
          })
        }
      })

      // Reset and close
      setTimeout(() => {
        setPrompt('')
        setGeneratedEmail('')
        setShowGenerated(false)
        onOpenChange(false)
      }, 100)
    } catch (err) {
      setError('Failed to insert email: ' + err.message)
      console.error('Insert error:', err)
    }
  }

  const handleRefine = async (refinementType) => {
    if (!generatedEmail) {
      setError('No email to refine.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const refinementPrompts = {
        formalise: `Make this email more formal and professional. Keep the same content but use more formal language and structure:`,
        elaborate: `Expand and elaborate on this email. Add more details and explanations while keeping the main message:`,
        shorten: `Make this email shorter and more concise. Remove unnecessary details but keep the main message:`,
      }

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${refinementPrompts[refinementType]}\n\n${generatedEmail}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to refine email')
      }

      const data = await response.json()
      setGeneratedEmail(data.email)
    } catch (err) {
      setError(err.message)
      console.error('Email refinement error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecreate = () => {
    setShowGenerated(false)
    setGeneratedEmail('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Help me write</DialogTitle>
          <DialogDescription>
            Describe what you want to write about and we'll generate an email for you
          </DialogDescription>
        </DialogHeader>

        {!showGenerated ? (
          <div className="space-y-4">
            {/* Prompt Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Describe your email
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., write an email to request a leave of absence for school"
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Generated Email Preview */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Generated email
              </label>
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg max-h-[300px] overflow-y-auto">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generatedEmail}
                </div>
              </div>
            </div>

            {/* Rating Section (like Gmail) */}
            <div className="py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Rate this suggestion:</p>
              <div className="flex gap-3 items-center mb-4">
                <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Helpful">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.23a2 2 0 01-1.789 1.106H9m0 0H7.773c-.802 0-1.569-.687-1.769-1.486m12.318-7.218l3.646-7.23c.196-.39.13-.8-.136-1.126-.265-.327-.734-.447-1.126-.11L15 9m0 0H9m0 0l-2.764-3.464m0 0c.196-.39.13-.8-.136-1.126-.265-.327-.734-.447-1.126-.11C4.5 4.5 4 5.5 4 7" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Not helpful">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.646-7.23a2 2 0 011.789-1.106H15m0 0h2.227c.802 0 1.569.687 1.769 1.486m-12.318 7.218l-3.646-7.23c-.196-.39-.13-.8.136-1.126.265-.327.734-.447 1.126-.11L9 15m0 0h6m0 0l2.764 3.464m0 0c-.196.39-.13.8.136 1.126.265.327.734.447 1.126.11 1.011-.113 1.5-1.113 1.5-3" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="More info">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </button>
              </div>

              {/* Refinement Buttons */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Refine:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRefine('formalise')}
                    disabled={loading}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>📋</span>}
                    Formalise
                  </button>
                  <button
                    onClick={() => handleRefine('elaborate')}
                    disabled={loading}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>📝</span>}
                    Elaborate
                  </button>
                  <button
                    onClick={() => handleRefine('shorten')}
                    disabled={loading}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>✂️</span>}
                    Shorten
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                This is a creative writing aid, and is not intended to be factual.
              </p>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="gap-2 flex justify-between">
              <button
                onClick={handleRecreate}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recreate
              </button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInsert}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Insert
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
