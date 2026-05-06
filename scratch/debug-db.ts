import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase-admin';

async function debugNotifications() {
  console.log('--- DEBUG NOTIFICATIONS ---');
  
  // 1. Check table columns
  const { data: sample, error: err1 } = await supabaseAdmin.from('notifications').select('*').limit(1);
  if (err1) {
    console.error('Error selecting from notifications:', err1);
  } else {
    console.log('Sample notification keys:', Object.keys(sample[0] || {}));
  }

  // 2. Check last 5 notifications
  const { data: last5, error: err2 } = await supabaseAdmin.from('notifications').select('*').order('created_at', { ascending: false }).limit(5);
  if (err2) {
    console.error('Error fetching last 5:', err2);
  } else {
    console.log('Last 5 notifications:', (last5 || []).map((n: any) => ({
      id: n.id,
      user_id: n.user_id,
      registration_id: n.registration_id,
      title: n.title,
      created_at: n.created_at
    })));
  }
}

debugNotifications().catch(console.error);
