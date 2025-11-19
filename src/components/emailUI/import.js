'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { $generateHtmlFromNodes } from "@lexical/html"
import {
  $getRoot,
  $getSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  $createParagraphNode,
  $createTextNode
} from 'lexical'

import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { Sparkles } from "./sparkels"

// ICONS & UI COMPONENTS (adjust paths if necessary)
import {
  Maximize2, Minus, X, Link2, Smile, Trash2, EllipsisVertical,
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, MdScheduleSend, MdAddToDrive, MdOutlineImage,
  MdLockClock, FaCaretDown, FaPenAlt, FaWandMagicSparkles, BsPaperclip,
  Undo2, Redo2, IndentDecrease, IndentIncrease, Strikethrough
} from "@/lib/Icon-utils"

import {
  Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuTrigger, ButtonGroup, Tooltip,
  TooltipContent, TooltipTrigger, Separator, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/lib/shadcnComp"

export {useState, useCallback, useMemo, useEffect, useRef, cn,
  LexicalComposer, RichTextPlugin, ContentEditable,
  HistoryPlugin, ListPlugin, LinkPlugin, OnChangePlugin, useLexicalComposerContext, LexicalErrorBoundary,
  $generateHtmlFromNodes,
  $getRoot, $getSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND,
  CAN_UNDO_COMMAND, CAN_REDO_COMMAND, COMMAND_PRIORITY_LOW,
  INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, HeadingNode, QuoteNode,
  ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND,
  LinkNode, $createParagraphNode, $createTextNode, Sparkles, Maximize2, Minus, X, Link2, Smile, Trash2, EllipsisVertical,
  Bold, Italic, UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, MdScheduleSend, MdAddToDrive, MdOutlineImage, MdLockClock, FaCaretDown,
  FaPenAlt, FaWandMagicSparkles, BsPaperclip, Undo2, Redo2,
  IndentDecrease, IndentIncrease, Strikethrough, Button, Input, DropdownMenu, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, ButtonGroup,
  Tooltip, TooltipContent, TooltipTrigger, Separator,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
}