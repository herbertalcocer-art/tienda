import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { getRooms, getAllProducts } from '../dataService';
import { 
  Plus, Edit, Trash2, LogOut, Upload, FileText, Layout, 
  Tag, Image as ImageIcon, CircleDollarSign, Check, X, AlertTriangle, Eye 
} from 'lucide-react';

export default function Backstage({ navigateTo }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Estados de datos
  const [rooms, setRooms] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'salas' | 'media'

  // Estados de carga de datos
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estados de formularios
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    poetic_description: '',
    price: '',
    room_id: '',
    in_stock: true,
    media_urls: ['']
  });

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    slug: '',
    description: '',
    cover_image_url: ''
  });

  // Estado de subida de archivos
  const [uploading, setUploading] = useState(false);
  const [mediaList, setMediaList] = useState([]); // Lista visual de archivos en Storage

  // 1. Manejo del Tema Oscuro (Backstage)
  useEffect(() => {
    document.body.classList.add('dark-theme');
    return () => {
      document.body.classList.remove('dark-theme');
    };
  }, []);

  // 2. Manejo de Sesión de Autenticación
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Simulación fuera de línea
      const mockSession = localStorage.getItem('atelier_mock_session');
      if (mockSession) {
        setSession({ user: { email: 'admin@atelier.com' } });
      }
      setAuthLoading(false);
      return;
    }

    // Cargar sesión real
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar datos al autenticarse
  useEffect(() => {
    if (session) {
      loadAllData();
    }
  }, [session]);

  const loadAllData = async () => {
    setLoadingRooms(true);
    setLoadingProducts(true);
    const roomsData = await getRooms();
    setRooms(roomsData);
    setLoadingRooms(false);

    const productsData = await getAllProducts();
    setProducts(productsData);
    setLoadingProducts(false);

    if (isSupabaseConfigured) {
      loadStorageFiles();
    }
  };

  // Cargar archivos del Storage
  const loadStorageFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from('media').list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'desc' }
      });
      if (error) throw error;
      
      if (data) {
        const filesWithUrls = data.map(file => {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(file.name);
          return {
            name: file.name,
            url: publicUrl,
            metadata: file.metadata
          };
        });
        setMediaList(filesWithUrls);
      }
    } catch (err) {
      console.warn('Error al cargar lista de archivos del Storage:', err);
    }
  };

  // 3. Autenticación (Login / Logout)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!isSupabaseConfigured) {
      // Simulación fuera de línea: Acepta admin@atelier.com / admin
      if (email === 'admin@atelier.com' && password === 'admin') {
        localStorage.setItem('atelier_mock_session', 'true');
        setSession({ user: { email: 'admin@atelier.com' } });
      } else {
        setLoginError('Credenciales incorrectas (Fuera de línea: usa admin@atelier.com y clave admin)');
      }
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setLoginError(err.message || 'Error de inicio de sesión');
    }
  };

  const handleLogout = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('atelier_mock_session');
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  // 4. CRUD PRODUCTOS
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    // Validar datos mínimos
    if (!productForm.name || !productForm.slug || !productForm.poetic_description || !productForm.room_id) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const payload = {
      name: productForm.name,
      slug: productForm.slug,
      poetic_description: productForm.poetic_description,
      price: productForm.price ? parseFloat(productForm.price) : null,
      room_id: productForm.room_id,
      in_stock: productForm.in_stock,
      media_urls: productForm.media_urls.filter(url => url.trim() !== '')
    };

    if (!isSupabaseConfigured) {
      // Simulación local
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
      } else {
        setProducts([...products, { ...payload, id: `mock-${Date.now()}` }]);
      }
      resetProductForm();
      return;
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }
      resetProductForm();
      loadAllData();
    } catch (err) {
      alert('Error al guardar producto: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Deseas retirar esta pieza del Atelier?')) return;

    if (!isSupabaseConfigured) {
      setProducts(products.filter(p => p.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err) {
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  const startEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      poetic_description: prod.poetic_description,
      price: prod.price || '',
      room_id: prod.room_id,
      in_stock: prod.in_stock,
      media_urls: prod.media_urls.length > 0 ? prod.media_urls : ['']
    });
    setShowProductForm(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      poetic_description: '',
      price: '',
      room_id: rooms[0]?.id || '',
      in_stock: true,
      media_urls: ['']
    });
    setShowProductForm(false);
  };

  // 5. CRUD SALAS
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.name || !roomForm.slug) {
      alert('Completa los campos obligatorios');
      return;
    }

    if (!isSupabaseConfigured) {
      if (editingRoom) {
        setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...roomForm } : r));
      } else {
        setRooms([...rooms, { ...roomForm, id: `mock-${Date.now()}` }]);
      }
      resetRoomForm();
      return;
    }

    try {
      if (editingRoom) {
        const { error } = await supabase.from('rooms').update(roomForm).eq('id', editingRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rooms').insert([roomForm]);
        if (error) throw error;
      }
      resetRoomForm();
      loadAllData();
    } catch (err) {
      alert('Error al guardar sala: ' + err.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm('¿Eliminar esta sala? Se perderán todos sus productos.')) return;

    if (!isSupabaseConfigured) {
      setRooms(rooms.filter(r => r.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      loadAllData();
    } catch (err) {
      alert('Error al eliminar sala: ' + err.message);
    }
  };

  const startEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      slug: room.slug,
      description: room.description || '',
      cover_image_url: room.cover_image_url || ''
    });
    setShowRoomForm(true);
  };

  const resetRoomForm = () => {
    setEditingRoom(null);
    setRoomForm({ name: '', slug: '', description: '', cover_image_url: '' });
    setShowRoomForm(false);
  };

  // 6. SUBIDA MULTIMEDIA A STORAGE
  const handleFileUpload = async (e, targetField = null, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      // Simulación fuera de línea: crear URL local temporal
      const fakeUrl = URL.createObjectURL(file);
      alert('Modo sin conexión: Se ha generado un enlace de objeto local temporal.');
      updateMediaUrlField(fakeUrl, targetField, index);
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Subir archivo al bucket 'media'
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

      updateMediaUrlField(publicUrl, targetField, index);
      loadStorageFiles();
    } catch (err) {
      alert('Error al subir archivo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const updateMediaUrlField = (url, targetField, index) => {
    if (targetField === 'product') {
      const updatedUrls = [...productForm.media_urls];
      updatedUrls[index] = url;
      setProductForm({ ...productForm, media_urls: updatedUrls });
    } else if (targetField === 'room') {
      setRoomForm({ ...roomForm, cover_image_url: url });
    } else {
      // Si se sube libremente desde el gestor multimedia
      alert(`Archivo subido con éxito:\n${url}`);
    }
  };

  const addMediaUrlField = () => {
    setProductForm({
      ...productForm,
      media_urls: [...productForm.media_urls, '']
    });
  };

  const removeMediaUrlField = (idx) => {
    if (productForm.media_urls.length <= 1) return;
    setProductForm({
      ...productForm,
      media_urls: productForm.media_urls.filter((_, i) => i !== idx)
    });
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-[#121110] text-[#f2ede4]">
        <span className="font-serif italic text-lg tracking-widest animate-pulse">Abriendo el backstage...</span>
      </div>
    );
  }

  // PANTALLA DE LOGIN
  if (!session) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#121110] text-[#f2ede4] px-4">
        <form 
          onSubmit={handleLogin}
          className="w-full max-w-md p-8 border border-[#2d2b28] bg-[#171615] shadow-2xl relative"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] tracking-[0.4em] uppercase text-gray-500 block mb-1">Panel de Control</span>
            <h2 className="text-3xl font-serif">Backstage</h2>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-6 p-3 border border-yellow-800/40 bg-yellow-950/20 text-yellow-300 text-xs flex items-center gap-2 rounded">
              <AlertTriangle size={16} className="shrink-0" />
              <span>Modo Demostración Activo. Usa <b>admin@atelier.com</b> y clave <b>admin</b>.</span>
            </div>
          )}

          {loginError && (
            <div className="mb-6 p-3 border border-red-900/40 bg-red-950/20 text-red-300 text-xs rounded">
              {loginError}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Correo Electrónico</label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Contraseña</label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-[#f2ede4] text-[#121110] text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors font-medium"
          >
            Acceder al Atelier
          </button>

          <button 
            type="button"
            onClick={() => navigateTo('vestibulo')}
            className="w-full mt-4 py-2 border border-[#2d2b28] text-gray-400 text-[10px] uppercase tracking-widest hover:text-white transition-colors"
          >
            Regresar al Sitio Público
          </button>
        </form>
      </div>
    );
  }

  // PANTALLA PRINCIPAL DEL BACKSTAGE
  return (
    <div className="min-h-screen bg-[#121110] text-[#f2ede4] font-light flex flex-col">
      {/* Cabecera Backstage */}
      <header className="border-b border-[#2d2b28] py-4 px-8 md:px-12 flex justify-between items-center bg-[#171615]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-serif tracking-widest uppercase text-[#f2ede4]">Atelier Backstage</h1>
          <span className="text-[9px] tracking-widest uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
            {isSupabaseConfigured ? 'Producción' : 'Offline Mock'}
          </span>
        </div>
        
        <div className="flex items-center space-x-6 text-xs uppercase tracking-widest">
          <span className="text-gray-500 text-[10px] hidden md:inline">{session.user.email}</span>
          <button 
            onClick={() => navigateTo('vestibulo')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Ver Sitio
          </button>
          <button 
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </header>

      {/* Navegación de Pestañas */}
      <div className="border-b border-[#2d2b28] bg-[#141312] px-8 md:px-12 flex space-x-6">
        <button 
          onClick={() => setActiveTab('productos')}
          className={`py-3 text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 ${
            activeTab === 'productos' ? 'border-[#f2ede4] text-[#f2ede4]' : 'border-transparent text-gray-500'
          }`}
        >
          <Tag size={13} />
          Productos
        </button>
        <button 
          onClick={() => setActiveTab('salas')}
          className={`py-3 text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 ${
            activeTab === 'salas' ? 'border-[#f2ede4] text-[#f2ede4]' : 'border-transparent text-gray-500'
          }`}
        >
          <Layout size={13} />
          Salas del Vestíbulo
        </button>
        {isSupabaseConfigured && (
          <button 
            onClick={() => setActiveTab('media')}
            className={`py-3 text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 ${
              activeTab === 'media' ? 'border-[#f2ede4] text-[#f2ede4]' : 'border-transparent text-gray-500'
            }`}
          >
            <ImageIcon size={13} />
            Archivos Multimedia
          </button>
        )}
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
        
        {/* ================= PESTAÑA PRODUCTOS ================= */}
        {activeTab === 'productos' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif">Catálogo Editorial</h2>
                <p className="text-xs text-gray-500 mt-1">Administra las piezas expuestas en las salas lookbook.</p>
              </div>
              {!showProductForm && (
                <button 
                  onClick={() => {
                    resetProductForm();
                    setShowProductForm(true);
                  }}
                  className="px-4 py-2 bg-[#f2ede4] text-[#121110] text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
                >
                  <Plus size={14} />
                  Crear Pieza
                </button>
              )}
            </div>

            {/* FORMULARIO PRODUCTO */}
            {showProductForm && (
              <form 
                onSubmit={handleSaveProduct}
                className="mb-10 p-6 border border-[#2d2b28] bg-[#171615] space-y-6 animate-fade-in"
              >
                <div className="flex justify-between items-center border-b border-[#2d2b28] pb-3">
                  <h3 className="text-lg font-serif">{editingProduct ? 'Editar Pieza' : 'Crear Nueva Pieza'}</h3>
                  <button 
                    type="button"
                    onClick={resetProductForm}
                    className="p-1 text-gray-500 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Campos Básicos */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Nombre de la Pieza *</label>
                      <input 
                        type="text"
                        value={productForm.name}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                        placeholder="Ej. Luna Rota"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Slug de URL (Único) *</label>
                      <input 
                        type="text"
                        value={productForm.slug}
                        onChange={e => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                        className="w-full px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                        placeholder="ej. luna-rota"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Sala / Colección *</label>
                      <select 
                        value={productForm.room_id}
                        onChange={e => setProductForm({ ...productForm, room_id: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                        required
                      >
                        <option value="">Selecciona Sala...</option>
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Precio (CLP)</label>
                        <input 
                          type="number"
                          value={productForm.price}
                          onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                          placeholder="Ej. 180000"
                        />
                      </div>

                      <div className="flex items-center h-full pt-6 pl-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest text-gray-400">
                          <input 
                            type="checkbox"
                            checked={productForm.in_stock}
                            onChange={e => setProductForm({ ...productForm, in_stock: e.target.checked })}
                            className="bg-[#121110] border-[#2d2b28]"
                          />
                          <span>En Atelier (Stock)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Descripción Poética y Archivos Multimedia */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Descripción Poética (Estilo Neruda/Gibran) *</label>
                      <textarea 
                        value={productForm.poetic_description}
                        onChange={e => setProductForm({ ...productForm, poetic_description: e.target.value })}
                        className="w-full h-28 px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none font-serif italic"
                        placeholder="Escribe la caída de la luz sobre la materia..."
                        required
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] tracking-widest uppercase text-gray-400">URLs Multimedia (Imágenes y Videos) *</label>
                        <button 
                          type="button" 
                          onClick={addMediaUrlField}
                          className="text-[10px] tracking-widest uppercase text-[var(--gold-accent)] hover:underline"
                        >
                          + Agregar Enlace
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                        {productForm.media_urls.map((url, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              value={url}
                              onChange={e => {
                                const newUrls = [...productForm.media_urls];
                                newUrls[index] = e.target.value;
                                setProductForm({ ...productForm, media_urls: newUrls });
                              }}
                              className="flex-1 px-3 py-1.5 bg-[#121110] border border-[#2d2b28] text-xs focus:border-gray-500 focus:outline-none"
                              placeholder="https://..."
                              required
                            />
                            
                            {/* Input de archivo oculto para subir a storage */}
                            <label className="p-1.5 border border-[#2d2b28] bg-[#121110] cursor-pointer hover:bg-zinc-800 transition-colors" title="Subir archivo">
                              <Upload size={13} className="text-gray-400" />
                              <input 
                                type="file" 
                                onChange={e => handleFileUpload(e, 'product', index)}
                                className="hidden"
                                accept="image/*,video/*"
                              />
                            </label>

                            {productForm.media_urls.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeMediaUrlField(index)}
                                className="p-1.5 border border-red-900/40 text-red-400 hover:bg-red-950/20"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#2d2b28]">
                  <button 
                    type="button"
                    onClick={resetProductForm}
                    className="px-4 py-2 border border-[#2d2b28] text-xs uppercase tracking-widest hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#f2ede4] text-[#121110] text-xs uppercase tracking-widest hover:bg-gray-300 font-medium"
                  >
                    {uploading ? 'Subiendo...' : editingProduct ? 'Actualizar Pieza' : 'Crear Pieza'}
                  </button>
                </div>
              </form>
            )}

            {/* TABLA DE PRODUCTOS */}
            {loadingProducts ? (
              <div className="text-center py-12 text-gray-500">Cargando piezas del Atelier...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-[#2d2b28] border-dashed">
                No hay piezas registradas en el catálogo.
              </div>
            ) : (
              <div className="border border-[#2d2b28] overflow-x-auto bg-[#171615]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2d2b28] text-[10px] tracking-widest uppercase text-gray-400 bg-[#1e1d1c]">
                      <th className="p-4 font-light">Vista previa</th>
                      <th className="p-4 font-light">Nombre / Colección</th>
                      <th className="p-4 font-light max-w-xs">Descripción Poética</th>
                      <th className="p-4 font-light">Precio</th>
                      <th className="p-4 font-light">Estado</th>
                      <th className="p-4 font-light text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d2b28] text-sm">
                    {products.map(prod => {
                      const room = rooms.find(r => r.id === prod.room_id);
                      const primaryMedia = prod.media_urls[0] || '';
                      const isVideo = primaryMedia.match(/\.(mp4|webm|ogg)/i);

                      return (
                        <tr key={prod.id} className="hover:bg-[#1f1e1d] transition-colors">
                          <td className="p-4">
                            <div className="w-12 h-12 border border-[#2d2b28] overflow-hidden bg-black">
                              {isVideo ? (
                                <video src={primaryMedia} className="w-full h-full object-cover" muted loop playsInline />
                              ) : (
                                <img src={primaryMedia} alt={prod.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#f2ede4]">{prod.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5 tracking-wider uppercase">{room ? room.name : 'Sin Colección'}</div>
                          </td>
                          <td className="p-4 max-w-xs truncate font-serif italic text-gray-400" title={prod.poetic_description}>
                            "{prod.poetic_description}"
                          </td>
                          <td className="p-4 tracking-widest font-mono text-xs">
                            {prod.price ? `${parseFloat(prod.price).toLocaleString('es-CL')} CLP` : '—'}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded font-medium ${
                              prod.in_stock ? 'bg-zinc-800 text-[var(--gold-accent)]' : 'bg-red-950/20 text-red-400 border border-red-900/40'
                            }`}>
                              {prod.in_stock ? 'Disponible' : 'Agotado'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => startEditProduct(prod)}
                              className="p-1.5 text-gray-400 hover:text-white transition-colors"
                              title="Editar pieza"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                              title="Eliminar pieza"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= PESTAÑA SALAS ================= */}
        {activeTab === 'salas' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif">Salas del Vestíbulo</h2>
                <p className="text-xs text-gray-500 mt-1">Puertas de acceso del Slow Shopping. Agrega salas que se escalan dinámicamente.</p>
              </div>
              {!showRoomForm && (
                <button 
                  onClick={() => {
                    resetRoomForm();
                    setShowRoomForm(true);
                  }}
                  className="px-4 py-2 bg-[#f2ede4] text-[#121110] text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
                >
                  <Plus size={14} />
                  Crear Sala
                </button>
              )}
            </div>

            {/* FORMULARIO SALAS */}
            {showRoomForm && (
              <form 
                onSubmit={handleSaveRoom}
                className="mb-10 p-6 border border-[#2d2b28] bg-[#171615] space-y-6 animate-fade-in"
              >
                <div className="flex justify-between items-center border-b border-[#2d2b28] pb-3">
                  <h3 className="text-lg font-serif">{editingRoom ? 'Editar Sala' : 'Crear Nueva Sala'}</h3>
                  <button type="button" onClick={resetRoomForm} className="p-1 text-gray-500 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Nombre de la Sala *</label>
                      <input 
                        type="text"
                        value={roomForm.name}
                        onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                        placeholder="Ej. Accesorios"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Slug de URL (Único) *</label>
                      <input 
                        type="text"
                        value={roomForm.slug}
                        onChange={e => setRoomForm({ ...roomForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                        className="w-full px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                        placeholder="ej. accesorios"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Breve Descripción *</label>
                      <input 
                        type="text"
                        value={roomForm.description}
                        onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none font-serif italic"
                        placeholder="Ej. Pequeños tesoros que acompañan..."
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Imagen de Portada (URL) *</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={roomForm.cover_image_url}
                          onChange={e => setRoomForm({ ...roomForm, cover_image_url: e.target.value })}
                          className="flex-1 px-3 py-2 bg-[#121110] border border-[#2d2b28] text-sm focus:border-gray-500 focus:outline-none"
                          placeholder="https://..."
                          required
                        />
                        <label className="p-2 border border-[#2d2b28] bg-[#121110] cursor-pointer hover:bg-zinc-800 transition-colors">
                          <Upload size={14} className="text-gray-400" />
                          <input 
                            type="file" 
                            onChange={e => handleFileUpload(e, 'room')}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#2d2b28]">
                  <button type="button" onClick={resetRoomForm} className="px-4 py-2 border border-[#2d2b28] text-xs uppercase tracking-widest hover:text-white">
                    Cancelar
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#f2ede4] text-[#121110] text-xs uppercase tracking-widest hover:bg-gray-300 font-medium">
                    Guardar Sala
                  </button>
                </div>
              </form>
            )}

            {/* LISTA DE SALAS */}
            {loadingRooms ? (
              <div className="text-center py-12 text-gray-500">Cargando salas...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {rooms.map(room => (
                  <div 
                    key={room.id}
                    className="border border-[#2d2b28] bg-[#171615] overflow-hidden flex flex-col justify-between"
                  >
                    <div className="h-40 relative bg-black">
                      <img src={room.cover_image_url} alt={room.name} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171615] to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <span className="text-[10px] tracking-widest uppercase text-gray-400">Sala URL: /{room.slug}</span>
                        <h3 className="text-2xl font-serif text-white">{room.name}</h3>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-gray-400 font-serif italic mb-6">"{room.description}"</p>
                      
                      <div className="flex justify-end space-x-2 pt-4 border-t border-[#2d2b28]/60">
                        <button 
                          onClick={() => startEditRoom(room)}
                          className="px-3 py-1.5 border border-[#2d2b28] text-[10px] uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5"
                        >
                          <Edit size={11} />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)}
                          className="px-3 py-1.5 border border-red-950/40 text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-950/20 transition-all flex items-center gap-1.5"
                        >
                          <Trash2 size={11} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= PESTAÑA MEDIA (GESTION STORAGE) ================= */}
        {activeTab === 'media' && isSupabaseConfigured && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif">Gestor de Archivos Multimedia</h2>
                <p className="text-xs text-gray-500 mt-1">Archivos cargados directamente en tu Supabase Storage Bucket ('media').</p>
              </div>
              
              <label className="px-4 py-2 bg-[#f2ede4] text-[#121110] text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium cursor-pointer">
                <Plus size={14} />
                Subir Archivo Libre
                <input 
                  type="file" 
                  onChange={e => handleFileUpload(e)} 
                  className="hidden" 
                  accept="image/*,video/*" 
                />
              </label>
            </div>

            {mediaList.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-[#2d2b28] border-dashed">
                No hay archivos multimedia en el Storage público.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {mediaList.map((file, idx) => {
                  const isVid = file.name.match(/\.(mp4|webm|ogg)/i);
                  return (
                    <div key={idx} className="border border-[#2d2b28] bg-[#171615] overflow-hidden group relative flex flex-col">
                      <div className="aspect-square w-full bg-black flex justify-center items-center overflow-hidden">
                        {isVid ? (
                          <video src={file.url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                      </div>
                      
                      <div className="p-3 text-left">
                        <div className="text-[10px] text-gray-400 truncate" title={file.name}>
                          {file.name}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(file.url);
                            alert('Enlace copiado al portapapeles!');
                          }}
                          className="mt-2 text-[9px] tracking-widest uppercase text-[var(--gold-accent)] hover:underline block text-left"
                        >
                          Copiar Enlace
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
