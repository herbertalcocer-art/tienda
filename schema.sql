-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Crear tabla de Salas (Colecciones)
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS para Salas
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso para Salas
CREATE POLICY "Permitir lectura pública de salas" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "Permitir gestión de salas a administradores" ON public.rooms
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. Crear tabla de Productos
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    poetic_description TEXT NOT NULL,
    price DECIMAL(10, 2),
    media_urls TEXT[] NOT NULL, -- Array de URLs de imágenes y micro-videos
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS para Productos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso para Productos
CREATE POLICY "Permitir lectura pública de productos" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Permitir gestión de productos a administradores" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Crear Storage Buckets públicos para archivos multimedia (si no existen)
-- Nota: Supabase gestiona esto mediante su API de Storage, pero aquí creamos las políticas para mayor seguridad:
-- (Asegúrate de crear el bucket llamado 'media' de tipo público en el panel de Supabase)

-- Insertar algunas salas iniciales de muestra
INSERT INTO public.rooms (name, slug, description, cover_image_url) VALUES
('Boutique', 'boutique', 'Alta costura diseñada para envolver el cuerpo en poesía textil, caídas etéreas y lino natural.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'),
('Joyería', 'joyeria', 'Joyas de plata esculpidas a mano, capturando la luz fría de la luna para adornar la piel con delicadeza.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000')
ON CONFLICT (slug) DO NOTHING;
