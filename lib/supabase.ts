
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unssicqbditptzuzmuuv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuc3NpY3FiZGl0cHR6dXptdXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzcxODUsImV4cCI6MjA3ODk1MzE4NX0.gRU7VD51uI0dLDcIRFslXpu68eVnB7ygmgCGfi9pAkY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
