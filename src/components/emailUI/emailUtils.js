'use client'
import { $getRoot, $generateHtmlFromNodes } from "./import"

export const extractEmailContent = async (editorInstance) => {
  if (!editorInstance) {
    throw new Error('Editor not ready')
  }

  let emailContent = ''
  try {
    editorInstance.update(() => {
      try {
        const html = $generateHtmlFromNodes(editorInstance, null)
        emailContent = html
      } catch (inner) {
        console.warn('Inner HTML generation failed:', inner)
        emailContent = ''
      }
    })
  } catch (error) {
    console.error('Error generating HTML:', error)
  }

  // Fallback: if HTML empty, read plain text
  if (!emailContent || emailContent.trim() === '') {
    try {
      const editorState = editorInstance.getEditorState?.()
      if (editorState?.read) {
        editorState.read(() => {
          const root = $getRoot()
          emailContent = root.getTextContent()
        })
      } else {
        editorInstance.update(() => {
          const root = $getRoot()
          emailContent = root.getTextContent()
        })
      }
    } catch (err) {
      console.error('Fallback plain text read failed:', err)
    }
  }

  return emailContent
}

export const validateAndPrepareEmail = async (editorInstance, to, subject, cc, bcc, attachments, confidentialData) => {
  if (!to.trim()) {
    throw new Error('Please enter a recipient email address')
  }

  if (!subject.trim()) {
    throw new Error('Please enter a subject')
  }

  const emailContent = await extractEmailContent(editorInstance)

  if (!emailContent || emailContent.trim() === '') {
    throw new Error('Please write a message')
  }

  const emailData = new FormData()
  emailData.append('to', to.trim())
  emailData.append('subject', subject.trim())
  emailData.append('message', emailContent)
  emailData.append('cc', cc.trim() || '')
  emailData.append('bcc', bcc.trim() || '')

  if (confidentialData) {
    emailData.append('confidential', JSON.stringify({
      enabled: true,
      expiry: confidentialData.expiry,
      passcode: confidentialData.passcode,
    }))
  }

  for (const file of attachments) {
    console.log(`Adding attachment: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
    emailData.append('attachments', file)
  }

  console.log('Sending email with', attachments.length, 'attachments to:', to.trim())
  console.log('Confidential:', confidentialData)

  return emailData
}
