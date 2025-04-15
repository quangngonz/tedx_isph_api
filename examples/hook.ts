import { useEffect, useState } from 'react';
import { createClient, PostgrestError } from '@supabase/supabase-js';

// Define Supabase client
const supabase = createClient(
  'https://quang-is-handsome.supabase.co',    // 🔁 Replace with project URL
  'public-anon-key'                         // 🔁 Replace with anon/public API key
);

// Define the shape of ticket_info table
type TicketInfo = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  attendance: boolean;
};

export function useTicketInfo(): TicketInfo[] {
  const [tickets, setTickets] = useState<TicketInfo[]>([]);

  const fetchTickets = async () => {
    const {
      data,
      error,
    }: { data: TicketInfo[] | null; error: PostgrestError | null } =
      await supabase.from('ticket_info').select('*');
    if (error) {
      console.error('Fetch error:', error);
    } else if (data) {
      setTickets(data);
    }
  };

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('ticket_info_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ticket_info' },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return tickets;
}
