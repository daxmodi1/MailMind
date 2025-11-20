'use client'
import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MdLockClock } from "@/lib/Icon-utils"
export function ConfidentialModeComponent({ onToggle }) {
  const [isConfidential, setIsConfidential] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [expiryOption, setExpiryOption] = useState('1week')
  const [passcodeOption, setPasscodeOption] = useState('none')
  const [confidentialData, setConfidentialData]  = useState(null)

  // Calculate expiry date
  const getExpiryDate = (option) => {
    const now = new Date()
    switch (option) {
      case '1day':
        now.setDate(now.getDate() + 1)
        break
      case '1week':
        now.setDate(now.getDate() + 7)
        break
      case '1month':
        now.setMonth(now.getMonth() + 1)
        break
      case '1year':
        now.setFullYear(now.getFullYear() + 1)
        break
      default:
        now.setDate(now.getDate() + 7)
    }
    return now.toISOString().split('T')[0]
  }

  const getExpiryLabel = (option) => {
    switch (option) {
      case '1day':
        return 'Expires in 1 day'
      case '1week':
        return 'Expires in 1 week'
      case '1month':
        return 'Expires in 1 month'
      case '1year':
        return 'Expires in 1 year'
      default:
        return 'Expires in 1 week'
    }
  }

  const handleToggleConfidential = useCallback(() => {
    // Coming soon - feature disabled
    alert('Confidential mode coming soon!')
  }, [])

  const handleSave = useCallback(() => {
    const expiryDate = getExpiryDate(expiryOption)
    const data = {
      enabled: true,
      expiry: expiryDate,
      passcode: passcodeOption === 'sms' ? true : false,
    }

    setConfidentialData(data)
    setIsConfidential(true)
    setShowDialog(false)

    if (onToggle) {
      onToggle(data)
    }
  }, [expiryOption, passcodeOption, onToggle])

  const handleCancel = useCallback(() => {
    setShowDialog(false)
    setExpiryOption('1week')
    setPasscodeOption('none')
  }, [])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            className={`font-semibold text-base p-2 opacity-50 cursor-not-allowed text-gray-400`}
            onClick={handleToggleConfidential}
            disabled
          >
            <MdLockClock className="h-5 w-5 text-gray-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Coming soon
        </TooltipContent>
      </Tooltip>
    </>
  )
}

export default ConfidentialModeComponent