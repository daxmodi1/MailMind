'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Ripple } from '@/components/ui/ripple';
import FetchAndShowEmail from '@/components/emailUI/fetchAndShowEmail';

export default function ArchivePage() {
  return (
    <FetchAndShowEmail type="archive" />
  );
}
