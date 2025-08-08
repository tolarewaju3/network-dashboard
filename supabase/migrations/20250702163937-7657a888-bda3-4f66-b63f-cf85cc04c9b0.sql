
-- Enable realtime for remediation_events table
ALTER TABLE public.remediation_events REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.remediation_events;
