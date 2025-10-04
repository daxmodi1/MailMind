import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed. Use POST with { emails: [...] }' 
  }, { status: 405 });
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ 
        error: 'Invalid request. Expected { emails: [...] }' 
      }, { status: 400 });
    }

    if (emails.length === 0) {
      return NextResponse.json({});
    }

    console.log(`Fetching avatars for ${emails.length} email(s)`);

    const avatarUrls = {};

    // Fetch avatars for all emails using multi-tier fallback
    await Promise.all(
      emails.map(async (email) => {
        const normalizedEmail = email.toLowerCase().trim();
        const domain = normalizedEmail.split('@')[1];
        const localPart = normalizedEmail.split('@')[0];

        const avatarData = await getFallbackAvatar(normalizedEmail, domain, localPart);
        avatarUrls[normalizedEmail] = avatarData.url;
      })
    );

    console.log(`Avatar fetch complete: ${Object.keys(avatarUrls).length} avatars found`);

    return NextResponse.json(avatarUrls);
    
  } catch (error) {
    console.error('Error in avatar API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch avatars',
      details: error.message 
    }, { status: 500 });
  }
}

// Multi-tier fallback strategy
async function getFallbackAvatar(email, domain, localPart) {
  // Strategy 1: Try Gravatar (checks if user has one)
  const gravatarUrl = getGravatarUrl(email);
  if (await checkUrlExists(gravatarUrl)) {
    console.log(`✓ Gravatar: ${email}`);
    return { url: gravatarUrl, source: 'gravatar' };
  }

  // Strategy 2: Try Clearbit for company logo (good for corporate emails)
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  if (await checkUrlExists(clearbitUrl)) {
    console.log(`✓ Clearbit: ${email}`);
    return { url: clearbitUrl, source: 'clearbit' };
  }

  // Strategy 3: Try Unavatar (checks multiple sources including GitHub, Twitter, etc.)
  const unavatarUrl = `https://unavatar.io/${email}`;
  if (await checkUrlExists(unavatarUrl)) {
    console.log(`✓ Unavatar: ${email}`);
    return { url: unavatarUrl, source: 'unavatar' };
  }

  // Strategy 4: Try Google Favicon service (always returns something)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  if (domain && !domain.includes('gmail.com') && !domain.includes('outlook.com') && !domain.includes('yahoo.com')) {
    console.log(`→ Favicon: ${email}`);
    return { url: faviconUrl, source: 'favicon' };
  }

  // Strategy 5: Use DiceBear for generated avatar (always works, looks good)
  const dicebearUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(localPart)}&backgroundColor=3b82f6,8b5cf6,ec4899,f59e0b,10b981`;
  console.log(`→ Generated: ${email}`);
  return { url: dicebearUrl, source: 'dicebear' };
}

// Generate Gravatar URL
function getGravatarUrl(email) {
  const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=404`;
}

// Check if URL returns valid image (with timeout)
async function checkUrlExists(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout per check

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok && response.status === 200;
  } catch (error) {
    return false;
  }
}