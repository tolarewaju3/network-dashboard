-- Enable public read access to events table
CREATE POLICY "Allow public read access to events"
ON public.events
FOR SELECT
USING (true);