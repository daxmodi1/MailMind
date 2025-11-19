'use client'
import {
  Button,
  Minus, Maximize2, X,
  Input,
  Separator
} from "./import"

export function MessageHeader({
  onMinimize,
  onMaximize,
  onClose,
  to,
  setTo,
  cc,
  setCc,
  bcc,
  setBcc,
  subject,
  setSubject,
  showCC,
  toggleCC,
  showBCC,
  toggleBCC
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-300" />
          <h2 className="text-lg font-semibold">New Message</h2>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={onMinimize}>
            <Minus className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={onMaximize}>
            <Maximize2 className="h-4 w-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* To field + CC/BCC toggles */}
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
          <Button variant="ghost" size="sm" className="h-7 px-3 text-xs text-gray-600 hover:bg-gray-100 border py-5 border-b-3" onClick={toggleCC}>CC</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100 border py-5 border-b-3" onClick={toggleBCC}>BCC</Button>
        </div>
      </div>

      {/* CC */}
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

      {/* BCC */}
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

      {/* Subject */}
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
    </>
  )
}
