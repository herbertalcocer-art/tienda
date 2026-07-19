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

-- =============================================================================
-- MEJORAS DE ESCALABILIDAD Y PREPARACIÓN IA (Schema v2)
-- Ejecutar en el SQL Editor de Supabase para actualizar el esquema.
-- =============================================================================

-- 4. Campos de preparación para integración de IA y experiencias 3D
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS model_3d_url TEXT,          -- URL al modelo .glb/.gltf para visualización 3D
  ADD COLUMN IF NOT EXISTS try_on_ready BOOLEAN DEFAULT FALSE,  -- Activa el módulo de Virtual Try-On
  ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}', -- Etiquetas de IA para búsqueda semántica
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0; -- Control manual de orden de presentación

-- 5. Tabla de roles de administrador (reemplaza el permisivo auth.role() = 'authenticated')
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'editor', -- 'editor' | 'super_admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS en admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden leer la tabla de administradores
CREATE POLICY IF NOT EXISTS "Solo admins ven la tabla de admins" ON public.admin_users
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 6. Actualizar políticas RLS de productos y salas para usar la tabla admin_users
--    (Más seguro que 'authenticated': solo usuarios registrados como admins pueden modificar)
DROP POLICY IF EXISTS "Permitir gestión de salas a administradores" ON public.rooms;
CREATE POLICY "Solo admin_users pueden gestionar salas" ON public.rooms
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "Permitir gestión de productos a administradores" ON public.products;
CREATE POLICY "Solo admin_users pueden gestionar productos" ON public.products
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 7. Insertar al usuario administrador actual como super_admin
--    IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con el UID real de tu usuario en la tabla auth.users.
--    Puedes obtenerlo desde Authentication > Users en el panel de Supabase.
-- INSERT INTO public.admin_users (user_id, role)
-- VALUES ('TU_USER_ID_AQUI', 'super_admin')
-- ON CONFLICT (user_id) DO NOTHING;

-- 8. Índice de rendimiento para paginación eficiente por sala y orden
CREATE INDEX IF NOT EXISTS idx_products_room_order ON public.products(room_id, sort_order ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

