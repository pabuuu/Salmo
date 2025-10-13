// backend/supabase.js
import { createClient } from "@supabase/supabase-js";

// Supabase URL and Service Role Key
const SUPABASE_URL = "https://iqthmxwjvnnoflzndhhj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdGhteHdqdm5ub2Zsem5kaGhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMyOTgyNiwiZXhwIjoyMDc1OTA1ODI2fQ.5pV_m-cNo_KpR2xCDvcG0QH1u0xTqauhDBKK8RtrpIc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
