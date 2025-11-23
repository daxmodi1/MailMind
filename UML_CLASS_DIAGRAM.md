# MailMind - UML Class Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            MAILMIND APPLICATION ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════════════════
                                  CORE COMPONENTS
════════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐
│   WriteMessage               │
├──────────────────────────────┤
│ - isOpen: boolean            │
│ - to: string                 │
│ - subject: string            │
│ - cc: string                 │
│ - bcc: string                │
│ - attachments: File[]        │
│ - fontFamily: string         │
│ - fontSize: string           │
│ - showFormatting: boolean    │
│ - editorInstance: Lexical    │
│ - canUndo: boolean           │
│ - canRedo: boolean           │
│ - isConfidential: boolean    │
│ - showHelpDialog: boolean    │
├──────────────────────────────┤
│ + handleSend()               │
│ + handleSaveDraft()          │
│ + resetForm()                │
│ + toggleFormatting()         │
│ + handleConfidentialToggle() │
└──────────────────────────────┘
         │
         │ contains
         ├─────────────────────────┬──────────────────────┬──────────────────────┐
         ▼                         ▼                      ▼                      ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  MessageHeader       │  │  MessageEditor   │  │  MessageFooter   │  │ DraftSaveDialog  │
├──────────────────────┤  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ - to: string         │  │ - fontFamily: s  │  │ - onSend()       │  │ - isOpen: bool   │
│ - subject: string    │  │ - fontSize: s    │  │ - onReset()      │  │ - drafts: Draft[]│
│ - showCC: boolean    │  │ - showFormatting │  │ - canUndo: bool  │  ├──────────────────┤
│ - showBCC: boolean   │  ├──────────────────┤  │ - canRedo: bool  │  │ + saveDraft()    │
├──────────────────────┤  │ + insertContent()│  ├──────────────────┤  │ + loadDraft()    │
│ + updateTo()         │  │ + clear()        │  │ + showButtons()  │  │ + deleteDraft()  │
│ + updateSubject()    │  │ + getContent()   │  │ + hideButtons()  │  └──────────────────┘
│ + toggleCC()         │  └──────────────────┘  └──────────────────┘
│ + toggleBCC()        │
└──────────────────────┘


════════════════════════════════════════════════════════════════════════════════════════════
                              FORMATTING & EDITING TOOLS
════════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐
│   ToolbarPlugin              │
├──────────────────────────────┤
│ - fontFamily: string         │
│ - fontSize: string           │
│ - isBold: boolean            │
│ - isItalic: boolean          │
│ - isUnderline: boolean       │
│ - isStrikethrough: boolean   │
│ - alignmentLeft: boolean     │
│ - alignmentCenter: boolean   │
│ - alignmentRight: boolean    │
│ - isBulletList: boolean      │
│ - isOrderedList: boolean     │
├──────────────────────────────┤
│ + formatBold()               │
│ + formatItalic()             │
│ + formatUnderline()          │
│ + formatStrikethrough()      │
│ + alignText(direction)       │
│ + insertList(type)           │
│ + changeFont(font)           │
│ + changeFontSize(size)       │
│ + undo()                     │
│ + redo()                     │
└──────────────────────────────┘
         │
         ├─────────────────────┬──────────────────────┬──────────────────────┐
         ▼                     ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ HelpMeWriteDialog│  │EmojiPickerPlugin │  │ConfidentialMode  │  │  EditorRefPlugin │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ - isOpen: bool   │  │ - showEmoji: b   │  │ - isConfidential │  │ - editorInstance │
│ - prompt: string │  │ - emojiPicker: r │  │ - expiryOption   │  ├──────────────────┤
│ - generatedEmail │  ├──────────────────┤  │ - passcodeOption │  │ + setEditor()    │
│ - loading: bool  │  │ + insertEmoji()  │  ├──────────────────┤  │ + getEditor()    │
│ - showGenerated  │  │ + showPicker()   │  │ + toggleMode()   │  └──────────────────┘
│ - error: string  │  │ + hidePicker()   │  │ + setExpiry()    │
│ - userName: s    │  └──────────────────┘  │ + setPasscode()  │
├──────────────────┤                        └──────────────────┘
│ + handleGenerate()
│ + handleRefine()
│ + handleInsert()
│ + handleRecreate()
└──────────────────┘


════════════════════════════════════════════════════════════════════════════════════════════
                              EMAIL VIEWING COMPONENTS
════════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐
│  UnifiedEmailComponent       │
├──────────────────────────────┤
│ - type: string (inbox/sent)  │
│ - subtype: string            │
│ - emails: Email[]            │
│ - loading: boolean           │
│ - selectedEmails: string[]   │
│ - hoveredEmail: string       │
├──────────────────────────────┤
│ + fetchEmails()              │
│ + toggleEmailSelection()     │
│ + handleSelectAll()          │
│ + handleDeselectAll()        │
│ + markAsRead()               │
│ + deleteEmail()              │
│ + archiveEmail()             │
│ + filterEmails()             │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  ShowEmailViaID              │
├──────────────────────────────┤
│ - id: string                 │
│ - email: Email               │
│ - loading: boolean           │
│ - summary: string            │
│ - summarizing: boolean       │
├──────────────────────────────┤
│ + fetchEmail()               │
│ + handleSummarize()          │
│ + generateSummary()          │
│ + rewriteLinks()             │
│ + formatHtml()               │
└──────────────────────────────┘


════════════════════════════════════════════════════════════════════════════════════════════
                            LEXICAL EDITOR STRUCTURE
════════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐
│    Editor                    │
│  (Lexical Composer)          │
├──────────────────────────────┤
│ - editorState: JSON          │
│ - editorSerializedState: {}  │
│ - theme: editorTheme         │
│ - nodes: LexicalNode[]       │
├──────────────────────────────┤
│ + initialize()               │
│ + onChange()                 │
│ + onSerializedChange()       │
│ + executeCommand()           │
│ + update()                   │
│ + read()                     │
└──────────────────────────────┘
         │
         ├─────────────┬────────────────┬────────────────┬────────────────┐
         ▼             ▼                ▼                ▼                ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ ParagraphNode  │ │   TextNode     │ │   LinkNode     │ │   ListNode     │ │  HeadingNode   │
├────────────────┤ ├────────────────┤ ├────────────────┤ ├────────────────┤ ├────────────────┤
│ - format: s    │ │ - text: string │ │ - url: string  │ │ - tag: string  │ │ - tag: string  │
│ - indent: num  │ │ - format: num  │ │ - title: str   │ │ - children: [] │ │ - level: num   │
├────────────────┤ ├────────────────┤ ├────────────────┤ ├────────────────┤ ├────────────────┤
│ + append()     │ │ + setText()    │ │ + setUrl()     │ │ + append()     │ │ + setTag()     │
│ + remove()     │ │ + getFormat()  │ │ + open()       │ │ + remove()     │ │ + getLevel()   │
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘


════════════════════════════════════════════════════════════════════════════════════════════
                              UI COMPONENT LIBRARY
════════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────┐
│    Button            │
├──────────────────────┤
│ - variant: string    │
│ - size: string       │
│ - disabled: boolean  │
├──────────────────────┤
│ + onClick()          │
└──────────────────────┘

┌──────────────────────┐
│    Dialog            │
├──────────────────────┤
│ - isOpen: boolean    │
│ - title: string      │
├──────────────────────┤
│ + open()             │
│ + close()            │
└──────────────────────┘

┌──────────────────────┐
│    Select            │
├──────────────────────┤
│ - value: string      │
│ - options: any[]     │
├──────────────────────┤
│ + onChange()         │
│ + getValue()         │
└──────────────────────┘

┌──────────────────────┐
│    Sidebar           │
├──────────────────────┤
│ - open: boolean      │
│ - variant: string    │
├──────────────────────┤
│ + toggle()           │
│ + setOpen()          │
└──────────────────────┘


════════════════════════════════════════════════════════════════════════════════════════════
                                  DATA MODELS
════════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐
│      Email                   │
├──────────────────────────────┤
│ - id: string                 │
│ - from: string               │
│ - to: string[]               │
│ - subject: string            │
│ - body: string               │
│ - htmlBody: string           │
│ - textBody: string           │
│ - timestamp: Date            │
│ - isRead: boolean            │
│ - isStarred: boolean         │
│ - isArchived: boolean        │
│ - labels: string[]           │
│ - attachments: Attachment[]  │
├──────────────────────────────┤
│ + markAsRead()               │
│ + archive()                  │
│ + delete()                   │
│ + star()                     │
│ + addLabel()                 │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│    Attachment                │
├──────────────────────────────┤
│ - id: string                 │
│ - filename: string           │
│ - mimeType: string           │
│ - size: number               │
│ - downloadUrl: string        │
├──────────────────────────────┤
│ + download()                 │
│ + preview()                  │
└──────────────────────────────┘

┌──────────────────────────────┐
│      Draft                   │
├──────────────────────────────┤
│ - id: string                 │
│ - to: string                 │
│ - subject: string            │
│ - body: string               │
│ - createdAt: Date            │
│ - updatedAt: Date            │
├──────────────────────────────┤
│ + save()                     │
│ + restore()                  │
│ + delete()                   │
└──────────────────────────────┘

┌──────────────────────────────┐
│    User Session              │
├──────────────────────────────┤
│ - name: string               │
│ - email: string              │
│ - avatar: string             │
│ - accessToken: string        │
│ - refreshToken: string       │
├──────────────────────────────┤
│ + login()                    │
│ + logout()                   │
│ + refreshToken()             │
└──────────────────────────────┘


════════════════════════════════════════════════════════════════════════════════════════════
                               API INTEGRATION LAYER
════════════════════════════════════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────┐
│                      API Routes                                │
├────────────────────────────────────────────────────────────────┤
│ • /api/auth/[...nextauth]          - NextAuth authentication  │
│ • /api/gmail/*                     - Gmail API integration    │
│ • /api/generate-email              - AI email generation      │
│ • /api/summarize                   - Email summarization      │
│ • /api/send-email                  - Send email               │
│ • /api/people                      - Contact management       │
└────────────────────────────────────────────────────────────────┘


════════════════════════════════════════════════════════════════════════════════════════════
                            RELATIONSHIPS & DEPENDENCIES
════════════════════════════════════════════════════════════════════════════════════════════

WriteMessage
├── uses: Lexical Editor
├── contains: MessageHeader, MessageEditor, MessageFooter
├── contains: ToolbarPlugin (formatting)
├── contains: EmojiPickerPlugin (emoji insertion)
├── contains: ConfidentialModeComponent (confidential mode)
├── contains: HelpMeWriteDialog (AI writing assist)
├── contains: DraftSaveDialog (draft management)
├── manages: User Session (from NextAuth)
└── calls: API endpoints (send, save draft, generate, summarize)

MessageEditor
├── wraps: Lexical LexicalComposer
├── manages: EditorRefPlugin (editor instance)
├── contains: ContentEditable (editable content area)
├── initializes: Various Lexical Nodes (Paragraph, Text, Link, List, etc.)
└── applies: Font family & size styling

UnifiedEmailComponent
├── fetches: Email[] from Gmail API
├── displays: Email list with actions
├── uses: useEmailActions hook
├── manages: Selection state
└── provides: Email operations (read, delete, archive, star)

ShowEmailViaID
├── fetches: Single Email by ID
├── displays: Email content with formatting
├── provides: Summarize functionality
├── calls: /api/summarize endpoint
└── handles: HTML/Text rendering


════════════════════════════════════════════════════════════════════════════════════════════
                              INTERACTION FLOW
════════════════════════════════════════════════════════════════════════════════════════════

User Writing Email:
1. WriteMessage opens
2. User types in MessageEditor (Lexical)
3. ToolbarPlugin provides formatting options
4. EmojiPickerPlugin allows emoji insertion
5. HelpMeWriteDialog assists with AI generation
6. Optional: Set ConfidentialMode
7. User can save as Draft or Send
8. API call to /api/send-email

User Reading Email:
1. UnifiedEmailComponent fetches emails
2. User clicks on email
3. ShowEmailViaID loads email content
4. User can summarize with /api/summarize
5. User can reply, forward, archive, delete

AI Assistance:
1. HelpMeWriteDialog opens
2. User enters prompt
3. Calls /api/generate-email with prompt
4. AI generates email (with user's name as signature)
5. User can refine (Formalise/Elaborate/Shorten)
6. Final email inserted into MessageEditor


════════════════════════════════════════════════════════════════════════════════════════════
```

## Key Features by Component:

### WriteMessage (Main Editor)
- Full email composition interface
- Rich text editing with Lexical
- Draft saving and management
- Confidential mode support
- AI-powered writing assistance

### ToolbarPlugin
- Text formatting (Bold, Italic, Underline, Strikethrough)
- Alignment (Left, Center, Right)
- Lists (Bullet, Numbered)
- Font family and size selection
- Undo/Redo functionality

### HelpMeWriteDialog
- Natural language email generation
- AI refinement options (Formalise, Elaborate, Shorten)
- Skeleton loading state
- User's name auto-signature
- Maximum 2 paragraph formatting

### EmojiPickerPlugin
- Emoji insertion with search
- Frequently used emoji tracking
- Smooth picker UI with categories

### ConfidentialModeComponent
- Currently in "Coming Soon" mode
- Planned: Expiry dates, SMS passcode protection
- Beautiful dialog UI

### UnifiedEmailComponent
- Multi-label email display
- Batch operations
- Selection management
- Real-time status updates

### ShowEmailViaID
- Full email rendering
- HTML content display
- Email summarization
- Attachment handling

