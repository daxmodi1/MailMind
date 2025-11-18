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
  const [confidentialData, setConfidentialData] = useState(null)

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
    if (!isConfidential) {
      setShowDialog(true)
    } else {
      setIsConfidential(false)
      setConfidentialData(null)
      if (onToggle) {
        onToggle(null)
      }
    }
  }, [isConfidential, onToggle])

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
            className={`font-semibold text-base p-2 ${isConfidential ? 'bg-red-50 text-red-600' : 'text-gray-600'}`}
            onClick={handleToggleConfidential}
          >
            <MdLockClock className={`h-5 w-5 ${isConfidential ? 'text-red-600' : 'text-gray-600'}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isConfidential ? 'Confidential mode ON' : 'Toggle confidential mode'}
        </TooltipContent>
      </Tooltip>

      {/* Confidential Mode Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Confidential mode</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            <p className="text-sm text-gray-600">
              Recipients won't have the option to forward, copy, print or download this email.
              <a href="#" className="text-blue-600 hover:underline ml-1">Learn more</a>
            </p>

            {/* Set Expiry */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-3 block">SET EXPIRY</label>
              <div className="space-y-2">
                <Select value={expiryOption} onValueChange={setExpiryOption}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select expiry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">Expires in 1 day</SelectItem>
                    <SelectItem value="1week">Expires in 1 week</SelectItem>
                    <SelectItem value="1month">Expires in 1 month</SelectItem>
                    <SelectItem value="1year">Expires in 1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {getExpiryLabel(expiryOption)} • {getExpiryDate(expiryOption)}
              </p>
            </div>

            {/* Require Passcode */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-3 block">REQUIRE PASSCODE</label>
              <p className="text-xs text-gray-500 mb-3">All passwords will be generated by Google.</p>
              
              <RadioGroup value={passcodeOption} onValueChange={setPasscodeOption}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="no-sms" />
                  <Label htmlFor="no-sms" className="text-sm cursor-pointer">No SMS passcode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="text-sm cursor-pointer">SMS passcode</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ConfidentialModeComponent