'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Ripple } from '@/components/ui/ripple';
import FetchEmailSubtype from '@/components/emailUI/fetchEmailSubtype';
export default function DonePage() {
  return (
    <FetchEmailSubtype type="inbox" subtype="done" />
  );
}