-- Enable Row Level Security (RLS) for remaining Supabase tables to resolve any future vulnerabilities
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CycleWindow" ENABLE ROW LEVEL SECURITY;
