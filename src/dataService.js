import { supabase, isSupabaseConfigured } from './supabaseClient';

// Datos Mock de alta calidad para la Opción A: "Silencio Mineral" (Wabi-Sabi)
const MOCK_ROOMS = [
  {
    id: 'room-boutique-uuid',
    name: 'Boutique',
    slug: 'boutique',
    description: 'Alta costura diseñada para envolver el cuerpo en poesía textil, caídas etéreas y lino natural.',
    cover_image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'
  },
  {
    id: 'room-joyeria-uuid',
    name: 'Joyería',
    slug: 'joyeria',
    description: 'Joyas de plata esculpidas a mano, capturando la luz fría de la luna para adornar la piel con delicadeza.',
    cover_image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000'
  }
];

const MOCK_PRODUCTS = [
  {
    id: 'prod-hilo-silencio',
    room_id: 'room-boutique-uuid',
    room_slug: 'boutique',
    name: 'El Hilo del Silencio',
    slug: 'el-hilo-del-silencio',
    poetic_description: 'Tejido en lino natural crudo. Un vestido que no busca vestir, sino acompañar el susurro del viento. La caída descansa con la imperfección sagrada de las fibras orgánicas, envolviendo el cuerpo en un abrazo etéreo y pausado.',
    price: 340.00,
    media_urls: [
      'https://images.unsplash.com/photo-1595959183075-c1d0a174d263?q=80&w=1200',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200'
    ],
    in_stock: true
  },
  {
    id: 'prod-eco-viento',
    room_id: 'room-boutique-uuid',
    room_slug: 'boutique',
    name: 'Eco del Viento',
    slug: 'eco-del-viento',
    poetic_description: 'Lana tejida a mano en telares ancestrales. Su textura evoca la aspereza de la roca y la calidez del hogar. Una pieza de abrigo pesado pero blando, que cae como la niebla de la mañana sobre los hombros de quien contempla la inmensidad.',
    price: 260.00,
    media_urls: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200'
    ],
    in_stock: true
  },
  {
    id: 'prod-penumbras',
    room_id: 'room-boutique-uuid',
    room_slug: 'boutique',
    name: 'Vestido Penumbras',
    slug: 'vestido-penumbras',
    poetic_description: 'Seda teñida con pigmentos minerales oscuros. Su textura es el reflejo del agua estancada a la luz de la luna. Una caricia fría que acompaña los movimientos lentos y pausados, dibujando sombras que danzan sobre la piel.',
    price: 410.00,
    media_urls: [
      'https://images.unsplash.com/photo-1539008885868-24859a72e775?q=80&w=1200',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200'
    ],
    in_stock: true
  },
  {
    id: 'prod-luna-rota',
    room_id: 'room-joyeria-uuid',
    room_slug: 'joyeria',
    name: 'Luna Rota',
    slug: 'luna-rota',
    poetic_description: 'Anillo esculpido en plata de ley 950. Sus bordes irregulares y martillados a mano evocan el relieve de una luna agrietada por el paso del tiempo. No busca el reflejo perfecto, sino la belleza honesta de lo inacabado.',
    price: 180.00,
    media_urls: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1200'
    ],
    in_stock: true
  },
  {
    id: 'prod-rocio-inmovil',
    room_id: 'room-joyeria-uuid',
    room_slug: 'joyeria',
    name: 'Rocío Inmóvil',
    slug: 'rocio-inmovil',
    poetic_description: 'Pendientes formados por la solidificación fortuita del metal líquido. Dos lágrimas de plata que cuelgan del lóbulo como gotas de agua congeladas en el instante exacto de su desprendimiento, capturando el eterno invierno del metal.',
    price: 220.00,
    media_urls: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1200',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200'
    ],
    in_stock: true
  },
  {
    id: 'prod-cicatriz-luz',
    room_id: 'room-joyeria-uuid',
    room_slug: 'joyeria',
    name: 'Cicatriz de Luz',
    slug: 'cicatriz-luz',
    poetic_description: 'Brazalete rígido de diseño abierto. El metal ha sido oxidado deliberadamente en sus fisuras para resaltar la cicatriz del fuego en la plata. Una pieza rotunda, un fragmento de luz sólida que abraza la muñeca con fuerza y sobriedad.',
    price: 290.00,
    media_urls: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200'
    ],
    in_stock: false // Agotado para probar el estado de stock
  }
];

// OBTENER SALAS
export async function getRooms() {
  if (!isSupabaseConfigured) {
    return MOCK_ROOMS;
  }
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data && data.length > 0 ? data : MOCK_ROOMS;
  } catch (err) {
    console.error('Error al cargar salas de Supabase, usando mock data:', err);
    return MOCK_ROOMS;
  }
}

// OBTENER PRODUCTOS POR SALA
export async function getProductsByRoom(roomSlug) {
  if (!isSupabaseConfigured) {
    return MOCK_PRODUCTS.filter(p => p.room_slug === roomSlug);
  }
  try {
    // Primero, obtener el id de la sala a partir del slug
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('id')
      .eq('slug', roomSlug)
      .single();

    if (roomError || !roomData) throw roomError || new Error('Sala no encontrada');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('room_id', roomData.id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    // Mapear para asegurar compatibilidad de campos
    return data.map(item => ({
      ...item,
      room_slug: roomSlug
    }));
  } catch (err) {
    console.error(`Error al cargar productos de la sala ${roomSlug} de Supabase, usando mock data:`, err);
    return MOCK_PRODUCTS.filter(p => p.room_slug === roomSlug);
  }
}

// OBTENER UN PRODUCTO POR SLUG
export async function getProductBySlug(slug) {
  if (!isSupabaseConfigured) {
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, rooms(slug)')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      room_slug: data.rooms?.slug
    };
  } catch (err) {
    console.error(`Error al cargar producto ${slug} de Supabase, usando mock data:`, err);
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }
}

// OBTENER TODOS LOS PRODUCTOS
export async function getAllProducts() {
  if (!isSupabaseConfigured) {
    return MOCK_PRODUCTS;
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, rooms(slug)');
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      room_slug: item.rooms?.slug
    }));
  } catch (err) {
    console.error('Error al cargar todos los productos de Supabase, usando mock data:', err);
    return MOCK_PRODUCTS;
  }
}
