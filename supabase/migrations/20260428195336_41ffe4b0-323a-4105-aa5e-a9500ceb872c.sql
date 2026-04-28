
CREATE TABLE public.test_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  marks_obtained NUMERIC NOT NULL,
  total_marks NUMERIC NOT NULL,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.test_marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own marks"
ON public.test_marks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marks"
ON public.test_marks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marks"
ON public.test_marks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marks"
ON public.test_marks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER set_test_marks_updated_at
BEFORE UPDATE ON public.test_marks
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
