'use client'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  Button 
} from "./import"

export function DraftSaveDialog({ 
  isOpen, 
  onOpenChange, 
  onSaveDraft, 
  onDiscardDraft 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save your draft?</DialogTitle>
          <DialogDescription>
            You have unsaved changes. Would you like to save them as a draft or discard them?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 flex justify-end">
          <Button 
            variant="outline" 
            onClick={onDiscardDraft}
            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            Discard
          </Button>
          <Button 
            onClick={onSaveDraft}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
