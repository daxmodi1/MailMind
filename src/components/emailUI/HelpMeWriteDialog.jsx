'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button, $getRoot, $createParagraphNode, $createTextNode } from "./import"
import { Loader2 } from 'lucide-react'

export function HelpMeWriteDialog({ isOpen, onOpenChange, editorInstance }) {
  const { data: session } = useSession()
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
      const userName = session?.user?.name || 'Regards'
      const enhancedPrompt = `Write a short, casual, and natural email. Keep it concise and friendly, like you're texting a friend. Don't be overly formal or lengthy. 

Maximum 2 paragraphs only. If it needs multiple points, combine them naturally in 1-2 paragraphs max. Keep paragraphs very short and punchy.
Also if there are gaps in information, make do not make assumptions, just keep it as [name of the info which user has to fill].

${prompt}

End with "Sincerely, ${userName}"`

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhancedPrompt })
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
        
        const lines = generatedEmail.split('\n').filter(line => line.trim() !== '')
        
        if (lines.length === 0) {
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode(generatedEmail))
          root.append(paragraph)
        } else {
          lines.forEach((line, index) => {
            const paragraph = $createParagraphNode()
            paragraph.append($createTextNode(line))
            root.append(paragraph)
            
            if (index < lines.length - 1) {
              const spacer = $createParagraphNode()
              root.append(spacer)
            }
          })
        }
      })

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
        formalise: `Make this email sound more professional but still natural and friendly. Don't overdo the formality. Keep it concise. Maximum 2 paragraphs only.`,
        elaborate: `Add a bit more detail and context to this email, but keep it concise and natural. Don't make it too long or wordy. Maximum 2 paragraphs only.`,
        shorten: `Make this email much shorter and more to the point. Cut any unnecessary parts but keep it friendly and natural. Maximum 2 paragraphs only.`,
      }

      const userName = session?.user?.name || 'Regards'
      const refinedPrompt = `${refinementPrompts[refinementType]}\n\n${generatedEmail}\n\nEnd with "Sincerely, ${userName}"`

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: refinedPrompt
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Floating Panel - positioned at toolbar level */}
      <div className="absolute bottom-20 right-9 w-138 bg-white rounded-lg shadow-xl z-50 max-h-[600px] overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Help me write</h2>
              <p className="text-sm text-gray-600 mt-1">Describe what you want to write about</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

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
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="text-gray-700"
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
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Generated Email Preview */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Generated email
                </label>
                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg max-h-[200px] overflow-y-auto">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {generatedEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Refinement Buttons */}
              <div className="py-2">
                <p className="text-xs text-gray-600 mb-2">Refine:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRefine('formalise')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  >
                    Formalise
                  </button>
                  <button
                    onClick={() => handleRefine('elaborate')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  >
                    Elaborate
                  </button>
                  <button
                    onClick={() => handleRefine('shorten')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  >
                    Shorten
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={handleRecreate}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Recreate
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="text-gray-700 h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInsert}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                  >
                    Insert
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
