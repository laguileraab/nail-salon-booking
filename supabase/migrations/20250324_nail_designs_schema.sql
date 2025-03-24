-- Migration: Add nail_designs table and related functionality
-- Date: 2025-03-24

-- Create nail_designs table
CREATE TABLE public.nail_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  fallback_image_url TEXT, -- Fallback image if main image fails to load
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('manicure', 'pedicure', 'gelPolish', 'acrylicExtensions', 'nailArt', 'other')),
  popular BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Add translations support for nail designs
CREATE TABLE public.nail_design_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nail_design_id UUID REFERENCES public.nail_designs(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'de', 'es')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (nail_design_id, language)
);

-- Indexes for performance
CREATE INDEX idx_nail_designs_category ON public.nail_designs(category);
CREATE INDEX idx_nail_designs_popular ON public.nail_designs(popular) WHERE popular = true;
CREATE INDEX idx_nail_designs_active ON public.nail_designs(is_active) WHERE is_active = true;
CREATE INDEX idx_nail_design_translations_design_id ON public.nail_design_translations(nail_design_id);
CREATE INDEX idx_nail_design_translations_language ON public.nail_design_translations(language);

-- Enable RLS
ALTER TABLE public.nail_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nail_design_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nail_designs

-- Everyone can view active nail designs
CREATE POLICY "Nail designs are viewable by everyone."
  ON public.nail_designs FOR SELECT
  USING (is_active = true);

-- Admin can view all designs including inactive ones
CREATE POLICY "Admins can view all nail designs."
  ON public.nail_designs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can insert nail designs
CREATE POLICY "Only admins can add nail designs."
  ON public.nail_designs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can update nail designs
CREATE POLICY "Only admins can update nail designs."
  ON public.nail_designs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can delete nail designs
CREATE POLICY "Only admins can delete nail designs."
  ON public.nail_designs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for nail_design_translations

-- Everyone can view translations
CREATE POLICY "Nail design translations are viewable by everyone."
  ON public.nail_design_translations FOR SELECT
  USING (true);

-- Only admins can insert translations
CREATE POLICY "Only admins can add nail design translations."
  ON public.nail_design_translations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can update translations
CREATE POLICY "Only admins can update nail design translations."
  ON public.nail_design_translations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can delete translations
CREATE POLICY "Only admins can delete nail design translations."
  ON public.nail_design_translations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insert some sample nail designs
INSERT INTO public.nail_designs (name, description, image_url, fallback_image_url, price, category, popular)
VALUES
  ('Classic French Manicure', 'Timeless and elegant french tips that suit any occasion.', 'images/designs/french-manicure.jpg', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80', 35.00, 'manicure', true),
  ('Gel Polish Full Color', 'Long-lasting gel polish in the color of your choice.', 'images/designs/gel-polish.jpg', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&auto=format&fit=crop&q=80', 40.00, 'gelPolish', true),
  ('Acrylic Extensions', 'Full set of acrylic extensions for added length and strength.', 'images/designs/acrylic-extensions.jpg', 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3?w=400&auto=format&fit=crop&q=80', 55.00, 'acrylicExtensions', false),
  ('Nail Art Design', 'Custom nail art designs created by our skilled technicians.', 'images/designs/nail-art.jpg', 'https://images.unsplash.com/photo-1607779097040-28d8a56e32b0?w=400&auto=format&fit=crop&q=80', 45.00, 'nailArt', true),
  ('Spa Pedicure', 'Relaxing pedicure with exfoliation, massage, and polish.', 'images/designs/spa-pedicure.jpg', 'https://images.unsplash.com/photo-1582291652525-cde3dbd88162?w=400&auto=format&fit=crop&q=80', 50.00, 'pedicure', true),
  ('Marble Nail Art', 'Elegant marble effect created with specialized techniques.', 'images/designs/marble-art.jpg', 'https://images.unsplash.com/photo-1604902396830-aca29e19b2b3?w=400&auto=format&fit=crop&q=80', 60.00, 'nailArt', false);

-- Add translations for the sample nail designs
-- English translations are already in the main table
-- German translations
INSERT INTO public.nail_design_translations (nail_design_id, language, name, description)
VALUES
  ((SELECT id FROM public.nail_designs WHERE name = 'Classic French Manicure'), 'de', 'Klassische Französische Maniküre', 'Zeitlose und elegante französische Spitzen, die zu jedem Anlass passen.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Gel Polish Full Color'), 'de', 'Gel-Lack Vollfarbe', 'Langanhaltender Gel-Lack in der Farbe Ihrer Wahl.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Acrylic Extensions'), 'de', 'Acryl-Verlängerungen', 'Komplettes Set Acryl-Verlängerungen für zusätzliche Länge und Stärke.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Nail Art Design'), 'de', 'Nagelkunst-Design', 'Benutzerdefinierte Nagelkunst-Designs, erstellt von unseren qualifizierten Technikern.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Spa Pedicure'), 'de', 'Spa-Pediküre', 'Entspannende Pediküre mit Peeling, Massage und Lack.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Marble Nail Art'), 'de', 'Marmor-Nagelkunst', 'Eleganter Marmoreffekt, der mit speziellen Techniken erstellt wird.');

-- Spanish translations
INSERT INTO public.nail_design_translations (nail_design_id, language, name, description)
VALUES
  ((SELECT id FROM public.nail_designs WHERE name = 'Classic French Manicure'), 'es', 'Manicura Francesa Clásica', 'Puntas francesas atemporales y elegantes que se adaptan a cualquier ocasión.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Gel Polish Full Color'), 'es', 'Esmalte de Gel Color Completo', 'Esmalte de gel de larga duración en el color de su elección.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Acrylic Extensions'), 'es', 'Extensiones Acrílicas', 'Juego completo de extensiones acrílicas para mayor longitud y resistencia.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Nail Art Design'), 'es', 'Diseño de Arte de Uñas', 'Diseños personalizados de arte de uñas creados por nuestros técnicos calificados.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Spa Pedicure'), 'es', 'Pedicura Spa', 'Pedicura relajante con exfoliación, masaje y esmalte.'),
  ((SELECT id FROM public.nail_designs WHERE name = 'Marble Nail Art'), 'es', 'Arte de Uñas Marmolado', 'Elegante efecto de mármol creado con técnicas especializadas.');
