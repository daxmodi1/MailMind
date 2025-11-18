import { Link2, Smile, MdAddToDrive, MdOutlineImage, MdLockClock, FaCaretDown,
  FaPenAlt, FaWandMagicSparkles, BsPaperclip} from "@/lib/Icon-utils"

const EditingOptions = [
  { Icon: BsPaperclip, hovercontent: 'Attach files', action: 'attach' },
  { Icon: FaWandMagicSparkles, hovercontent: 'Help me write', action: 'help' },
  { Icon: FaPenAlt, hovercontent: 'Insert Signature', action: 'signature' },
]

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Sans Serif' },
  { value: 'Georgia', label: 'Serif' },
  { value: 'Courier New', label: 'Fixed Width' },
  { value: 'Comic Sans MS', label: 'Wide' },
  { value: 'Garamond', label: 'Narrow' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Verdana', label: 'Verdana' },
]

const FONT_SIZES = [
  { value: '12px', label: 'Small' },
  { value: '14px', label: 'Normal' },
  { value: '18px', label: 'Large' },
  { value: '24px', label: 'Huge' },
]

const editorTheme = {
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
  list: {
    ul: 'list-disc ml-5',
    ol: 'list-decimal ml-5',
    listitem: 'ml-2',
  },
}

export { EditingOptions, FONT_FAMILIES, FONT_SIZES, editorTheme }