import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://qwwhlsqwcpjygpmbxjxd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2hsc3F3Y3BqeWdwbWJ4anhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MDAyMDUsImV4cCI6MjA4MzE3NjIwNX0.Ch2olmOtUK4k1pLoPJuBVpz7sePu57sYyM4gW3mHvSA'
);
