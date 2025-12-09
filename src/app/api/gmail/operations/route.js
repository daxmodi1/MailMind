import { NextResponse } from 'next/server';
import { getCachedSession } from '@/lib/sessionCache';
import { createGmailClient } from '@/lib/gmailUtils';
import { invalidateUserEmailCache } from '../route';

export async function POST(request) {
  try {
    const session = await getCachedSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation, ids } = await request.json();

    if (!operation || !ids || (Array.isArray(ids) ? ids.length === 0 : !ids)) {
      return NextResponse.json(
        { error: 'Operation and email ID(s) are required' },
        { status: 400 }
      );
    }

    const gmail = createGmailClient(session.accessToken, session.refreshToken);

    // Normalize ids to array
    const emailIds = Array.isArray(ids) ? ids : [ids];

    // Execute operation for all emails
    const results = await Promise.allSettled(
      emailIds.map(id => performOperation(gmail, operation, id))
    );

    // Check for failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      // Some operations failed
      return NextResponse.json(
        {
          success: false,
          error: `${failures.length} operation(s) failed`,
          details: failures.map(f => f.reason?.message)
        },
        { status: 207 } // Multi-Status
      );
    }

    // Don't invalidate cache - UI updates optimistically
    // Cache will refresh on manual refresh or after TTL expires
    
    return NextResponse.json({
      success: true,
      count: emailIds.length
    });

  } catch (error) {
    // Gmail operation error
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

async function performOperation(gmail, operation, id) {
  switch (operation) {
    case 'delete':
      // Soft delete (move to trash)
      return await gmail.users.messages.trash({
        userId: 'me',
        id: id,
      });

    case 'permanentDelete':
      // Hard delete (permanent - cannot be recovered)
      return await gmail.users.messages.delete({
        userId: 'me',
        id: id,
    });
    case 'archive':
      // Remove from inbox
      return await gmail.users.messages.modify({
        userId: 'me',
        id: id,
        requestBody: {
          removeLabelIds: ['INBOX'],
        },
      });
      
    case 'markRead':
      // Remove UNREAD label
      return await gmail.users.messages.modify({
        userId: 'me',
        id: id,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });

    case 'markUnread':
      // Add UNREAD label
      return await gmail.users.messages.modify({
        userId: 'me',
        id: id,
        requestBody: {
          addLabelIds: ['UNREAD'],
        },
      });

    case 'star':
      // Add STARRED label
      return await gmail.users.messages.modify({
        userId: 'me',
        id: id,
        requestBody: {
          addLabelIds: ['STARRED'],
        },
      });

    case 'unstar':
      // Remove STARRED label
      return await gmail.users.messages.modify({
        userId: 'me',
        id: id,
        requestBody: {
          removeLabelIds: ['STARRED'],
        },
      });

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}