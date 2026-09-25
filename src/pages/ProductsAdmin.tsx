import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { MainLayout } from '@components/layout/MainLayout';
import { Product, CreateProductDTO, UpdateProductDTO, PaginationMeta } from '@core/entities/product.entity';
import { Category } from '@core/entities/category.entity';
import { productService, categoryService } from '@infrastructure/services';
import { authStore } from '@state/auth.store';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Plus, Edit, Trash2, Package, Search, RefreshCw, AlertCircle, CheckCircle2, X, ChevronLeft, ChevronRight, ShieldAlert, Image } from 'lucide-solid';

export const ProductsAdminPage: Component = () => {
  const [products, setProducts] = createSignal<Product[]>([]);
  const [categories, setCategories] = createSignal<Category[]>([]);
  const [filterCategory, setFilterCategory] = createSignal<string>('');
  const [searchQuery, setSearchQuery] = createSignal<string>('');
  const [page, setPage] = createSignal<number>(1);
  const [limit] = createSignal<number>(10);
  const [pagination, setPagination] = createSignal<PaginationMeta | null>(null);

  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string | null>(null);
  const [successMsg, setSuccessMsg] = createSignal<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = createSignal<boolean>(false);
  const [editingProduct, setEditingProduct] = createSignal<Product | null>(null);
  const [formData, setFormData] = createSignal<{
    categoryId: string;
    name: string;
    description: string;
    price: string;
    stock: string;
    imageUrl: string;
    isActive: boolean;
  }>({
    categoryId: '',
    name: '',
    description: '',
    price: '0.00',
    stock: '0',
    imageUrl: '',
    isActive: true,
  });
  const [modalError, setModalError] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal<boolean>(false);

  // Delete modal state
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories({ activeOnly: true });
      setCategories(data);
    } catch (err: unknown) {
      console.error('Error al obtener categorías:', err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts({
        categoryId: filterCategory() || undefined,
        search: searchQuery() || undefined,
        activeOnly: false,
        page: page(),
        limit: limit(),
      });
      setProducts(res.items);
      setPagination(res.pagination || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    fetchCategories();
    fetchProducts();
  });

  const canManage = () => {
    const role = authStore.userRole();
    return role === 'ADMIN' || role === 'RESTAURANT';
  };

  const openCreateModal = () => {
    const firstCategory = categories().length > 0 ? categories()[0].id : '';
    setEditingProduct(null);
    setFormData({
      categoryId: firstCategory,
      name: '',
      description: '',
      price: '',
      stock: '0',
      imageUrl: '',
      isActive: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      categoryId: prod.categoryId,
      name: prod.name,
      description: prod.description || '',
      price: String(prod.price),
      stock: String(prod.stock),
      imageUrl: prod.imageUrl || '',
      isActive: prod.isActive,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setModalError(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setModalError(null);

    const categoryId = formData().categoryId;
    const name = formData().name.trim();
    const priceNum = parseFloat(formData().price);
    const stockNum = parseInt(formData().stock, 10);

    // Dynamic validations matching Domain & Zod constraints
    if (!categoryId) {
      setModalError('Debes seleccionar una categoría.');
      return;
    }
    if (!name || name.length < 2) {
      setModalError('El nombre del producto debe tener al menos 2 caracteres.');
      return;
    }
    if (name.length > 150) {
      setModalError('El nombre no puede exceder 150 caracteres.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError('El precio debe ser un número mayor a 0 (precio > 0).');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setModalError('El stock debe ser un número entero mayor o igual a 0 (stock >= 0).');
      return;
    }

    const token = authStore.token();
    if (!token) {
      setModalError('Sesión expirada. Vuelve a iniciar sesión.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct()) {
        const dto: UpdateProductDTO = {
          categoryId,
          name,
          description: formData().description.trim() || null,
          price: priceNum,
          stock: stockNum,
          imageUrl: formData().imageUrl.trim() || null,
          isActive: formData().isActive,
        };
        await productService.updateProduct(editingProduct()!.id, dto, token);
        setSuccessMsg(`Producto "${name}" actualizado exitosamente.`);
      } else {
        const dto: CreateProductDTO = {
          categoryId,
          name,
          description: formData().description.trim() || null,
          price: priceNum,
          stock: stockNum,
          imageUrl: formData().imageUrl.trim() || null,
        };
        await productService.createProduct(dto, token);
        setSuccessMsg(`Producto "${name}" creado exitosamente.`);
      }
      closeModal();
      fetchProducts();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto';
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = authStore.token();
    if (!token) return;

    try {
      await productService.deleteProduct(id, token);
      setSuccessMsg('Producto eliminado exitosamente (Soft Delete).');
      setDeletingId(null);
      fetchProducts();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(msg);
      setDeletingId(null);
    }
  };

  const getCategoryName = (catId: string) => {
    const found = categories().find((c) => c.id === catId);
    return found ? found.name : 'Categoría';
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '28px' }}>
        {/* Permission Guard Notice */}
        <Show when={!canManage()}>
          <div
            style={{
              padding: '24px',
              'background-color': 'var(--app-dark-100)',
              border: '1px solid var(--app-warning)',
              'border-radius': 'var(--radius-lg)',
              color: 'var(--app-warning)',
              display: 'flex',
              'align-items': 'center',
              gap: '14px',
            }}
          >
            <ShieldAlert size={28} />
            <div>
              <h3 style={{ margin: '0 0 4px 0', 'font-size': '16px' }}>Acceso Restringido</h3>
              <p style={{ margin: '0', 'font-size': '14px', color: 'var(--text-secondary)' }}>
                Se requiere rol de Administrador (ADMIN) o Restaurante (RESTAURANT) para gestionar productos (RF-09).
              </p>
            </div>
          </div>
        </Show>

        {/* Top Header */}
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
              <h1 style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)', margin: '0' }}>
                Gestión de Productos
              </h1>
              <span
                style={{
                  'background-color': 'var(--app-green-light)',
                  color: 'var(--app-green)',
                  padding: '4px 10px',
                  'border-radius': 'var(--radius-pill)',
                  'font-size': '12px',
                  'font-weight': '700',
                }}
              >
                RF-09 CRUD
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', 'font-size': '14px', 'margin-top': '4px' }}>
              Administración completa del catálogo, precios (precio &gt; 0) y control de stock (stock &gt;= 0).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" size="sm" onClick={fetchProducts} icon={<RefreshCw size={14} />}>
              Refrescar
            </Button>
            <Show when={canManage()}>
              <Button variant="primary" onClick={openCreateModal} icon={<Plus size={16} />}>
                Nuevo Producto
              </Button>
            </Show>
          </div>
        </div>

        {/* Notifications */}
        <Show when={successMsg()}>
          <div
            class="animate-fade-in"
            style={{
              padding: '14px 18px',
              'background-color': 'var(--app-green-light)',
              border: '1px solid var(--app-green)',
              'border-radius': 'var(--radius-md)',
              color: 'var(--app-green)',
              display: 'flex',
              'align-items': 'center',
              gap: '10px',
              'font-size': '14px',
              'font-weight': '600',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg()}</span>
          </div>
        </Show>

        <Show when={error()}>
          <div
            style={{
              padding: '14px 18px',
              'background-color': 'var(--app-danger-light)',
              border: '1px solid var(--app-danger)',
              'border-radius': 'var(--radius-md)',
              color: 'var(--app-danger)',
              display: 'flex',
              'align-items': 'center',
              gap: '10px',
              'font-size': '14px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error()}</span>
          </div>
        </Show>

        {/* Search & Category Filter Controls */}
        <div
          style={{
            'background-color': 'var(--app-dark-100)',
            border: '1px solid var(--border-color)',
            'border-radius': 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            'gap': '16px',
            'flex-wrap': 'wrap',
          }}
        >
          <div style={{ flex: '1', 'min-width': '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={searchQuery()}
              onInput={(e) => {
                setSearchQuery(e.currentTarget.value);
                setPage(1);
                fetchProducts();
              }}
              style={{
                width: '100%',
                'padding-left': '42px',
                'padding-right': '16px',
                height: '42px',
                'background-color': 'var(--app-dark-300)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-md)',
                color: 'var(--app-white)',
                'font-size': '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ width: '220px' }}>
            <select
              value={filterCategory()}
              onChange={(e) => {
                setFilterCategory(e.currentTarget.value);
                setPage(1);
                fetchProducts();
              }}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 14px',
                'background-color': 'var(--app-dark-300)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-md)',
                color: 'var(--app-white)',
                'font-size': '14px',
                outline: 'none',
              }}
            >
              <option value="">Todas las Categorías</option>
              <For each={categories()}>
                {(cat) => <option value={cat.id}>{cat.name}</option>}
              </For>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div
          style={{
            'background-color': 'var(--app-dark-100)',
            border: '1px solid var(--border-color)',
            'border-radius': 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <Show when={isLoading()}>
            <div style={{ display: 'flex', 'justify-content': 'center', 'align-items': 'center', padding: '60px 0', color: 'var(--text-muted)', gap: '12px' }}>
              <RefreshCw size={24} class="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Cargando productos...</span>
            </div>
          </Show>

          <Show when={!isLoading() && products().length === 0}>
            <div style={{ padding: '60px 20px', 'text-align': 'center', color: 'var(--text-muted)' }}>
              <Package size={40} style={{ margin: '0 auto 12px auto' }} />
              <p style={{ 'font-size': '16px', color: 'var(--app-white)', margin: '0' }}>
                No se encontraron productos
              </p>
              <p style={{ 'font-size': '14px', margin: '4px 0 0 0' }}>
                Crea un nuevo producto o limpia los filtros.
              </p>
            </div>
          </Show>

          <Show when={!isLoading() && products().length > 0}>
            <div style={{ 'overflow-x': 'auto' }}>
              <table style={{ width: '100%', 'border-collapse': 'collapse', 'text-align': 'left' }}>
                <thead>
                  <tr style={{ 'border-bottom': '1px solid var(--border-color)', 'background-color': 'var(--app-dark-200)' }}>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>Producto</th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>Categoría</th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>Precio</th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>Stock</th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>Estado</th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600', 'text-align': 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={products()}>
                    {(prod) => (
                      <tr style={{ 'border-bottom': '1px solid var(--border-color)', transition: 'var(--transition-fast)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                'border-radius': 'var(--radius-md)',
                                'background-color': 'var(--app-dark-300)',
                                display: 'flex',
                                'align-items': 'center',
                                'justify-content': 'center',
                                overflow: 'hidden',
                                'flex-shrink': '0',
                              }}
                            >
                              <Show when={prod.imageUrl} fallback={<Image size={20} color="var(--text-muted)" />}>
                                <img src={prod.imageUrl!} alt={prod.name} style={{ width: '100%', height: '100%', 'object-fit': 'cover' }} />
                              </Show>
                            </div>
                            <div>
                              <div style={{ 'font-weight': '700', color: 'var(--app-white)', 'font-size': '14px' }}>{prod.name}</div>
                              <div style={{ 'font-size': '12px', color: 'var(--text-muted)' }}>{prod.description || 'Sin descripción'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ 'font-size': '13px', color: 'var(--app-green)', 'font-weight': '600' }}>
                            {getCategoryName(prod.categoryId)}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', 'font-weight': '700', color: 'var(--app-white)', 'font-size': '15px' }}>
                          ${Number(prod.price).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              'border-radius': 'var(--radius-pill)',
                              'font-size': '12px',
                              'font-weight': '700',
                              'background-color': prod.stock > 0 ? 'rgba(6, 193, 103, 0.15)' : 'rgba(225, 25, 0, 0.15)',
                              color: prod.stock > 0 ? '#06C167' : '#E11900',
                            }}
                          >
                            {prod.stock} un.
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              'border-radius': 'var(--radius-pill)',
                              'font-size': '11px',
                              'font-weight': '700',
                              'background-color': prod.isActive ? 'rgba(39, 110, 241, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                              color: prod.isActive ? '#276EF1' : 'var(--text-muted)',
                            }}
                          >
                            {prod.isActive ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', 'text-align': 'right' }}>
                          <Show when={canManage()}>
                            <div style={{ display: 'flex', 'justify-content': 'flex-end', gap: '8px' }}>
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(prod)} icon={<Edit size={14} />}>
                                Editar
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeletingId(prod.id)} icon={<Trash2 size={14} color="var(--app-danger)" />}>
                                Eliminar
                              </Button>
                            </div>
                          </Show>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>

          {/* Pagination Footer */}
          <Show when={pagination() && pagination()!.totalPages > 1}>
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'space-between',
                padding: '16px 20px',
                'border-top': '1px solid var(--border-color)',
                'background-color': 'var(--app-dark-200)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', 'font-size': '13px' }}>
                Página <strong>{pagination()?.page}</strong> de <strong>{pagination()?.totalPages}</strong> ({pagination()?.totalItems} productos)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination()?.hasPreviousPage}
                  onClick={() => { setPage(page() - 1); fetchProducts(); }}
                  icon={<ChevronLeft size={16} />}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination()?.hasNextPage}
                  onClick={() => { setPage(page() + 1); fetchProducts(); }}
                  icon={<ChevronRight size={16} />}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </Show>
        </div>

        {/* Create / Edit Modal */}
        <Show when={isModalOpen()}>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              'background-color': 'rgba(0, 0, 0, 0.8)',
              'backdrop-filter': 'blur(4px)',
              'z-index': '1000',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              padding: '20px',
            }}
          >
            <div
              class="animate-fade-in"
              style={{
                'background-color': 'var(--app-dark-100)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-lg)',
                width: '100%',
                'max-width': '540px',
                'max-height': '90vh',
                overflow: 'y-auto',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px',
                  'border-bottom': '1px solid var(--border-color)',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'space-between',
                }}
              >
                <h3 style={{ margin: '0', color: 'var(--app-white)', 'font-size': '18px', 'font-weight': '700' }}>
                  {editingProduct() ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
                <Show when={modalError()}>
                  <div
                    style={{
                      padding: '12px',
                      'background-color': 'var(--app-danger-light)',
                      border: '1px solid var(--app-danger)',
                      'border-radius': 'var(--radius-md)',
                      color: 'var(--app-danger)',
                      'font-size': '13px',
                      display: 'flex',
                      'align-items': 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{modalError()}</span>
                  </div>
                </Show>

                {/* Category Select */}
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px' }}>
                  <label style={{ 'font-size': '13px', 'font-weight': '600', color: 'var(--text-secondary)' }}>
                    Categoría *
                  </label>
                  <select
                    value={formData().categoryId}
                    onChange={(e) => setFormData({ ...formData(), categoryId: e.currentTarget.value })}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      'background-color': 'var(--app-dark-300)',
                      border: '1px solid var(--border-color)',
                      'border-radius': 'var(--radius-md)',
                      color: 'var(--app-white)',
                      'font-size': '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    <For each={categories()}>
                      {(cat) => <option value={cat.id}>{cat.name}</option>}
                    </For>
                  </select>
                </div>

                <Input
                  label="Nombre del Producto *"
                  placeholder="ej. Hamburguesa Doble Queso"
                  value={formData().name}
                  onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                  required
                />

                <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Precio ($) * (precio > 0)"
                    type="number"
                    step="0.01"
                    placeholder="9.99"
                    value={formData().price}
                    onInput={(e) => setFormData({ ...formData(), price: e.currentTarget.value })}
                    required
                  />

                  <Input
                    label="Stock (unidades) * (stock >= 0)"
                    type="number"
                    step="1"
                    placeholder="25"
                    value={formData().stock}
                    onInput={(e) => setFormData({ ...formData(), stock: e.currentTarget.value })}
                    required
                  />
                </div>

                <Input
                  label="URL de Imagen (Opcional)"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData().imageUrl}
                  onInput={(e) => setFormData({ ...formData(), imageUrl: e.currentTarget.value })}
                />

                <Show when={formData().imageUrl}>
                  <div style={{ height: '100px', 'border-radius': 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', 'background-color': 'var(--app-dark-300)' }}>
                    <img src={formData().imageUrl} alt="Preview" style={{ width: '100%', height: '100%', 'object-fit': 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                </Show>

                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px' }}>
                  <label style={{ 'font-size': '13px', 'font-weight': '600', color: 'var(--text-secondary)' }}>
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ingredientes o descripción del producto..."
                    value={formData().description}
                    onInput={(e) => setFormData({ ...formData(), description: e.currentTarget.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      'background-color': 'var(--app-dark-300)',
                      border: '1px solid var(--border-color)',
                      'border-radius': 'var(--radius-md)',
                      color: 'var(--app-white)',
                      'font-size': '14px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <Show when={editingProduct()}>
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="isActiveProd"
                      checked={formData().isActive}
                      onChange={(e) => setFormData({ ...formData(), isActive: e.currentTarget.checked })}
                      style={{ width: '18px', height: '18px', 'accent-color': 'var(--app-green)' }}
                    />
                    <label for="isActiveProd" style={{ color: 'var(--app-white)', 'font-size': '14px', cursor: 'pointer' }}>
                      Producto Activo en el Menú
                    </label>
                  </div>
                </Show>

                <div style={{ display: 'flex', 'justify-content': 'flex-end', gap: '12px', 'margin-top': '8px' }}>
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSubmitting()}>
                    {editingProduct() ? 'Guardar Cambios' : 'Crear Producto'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Show>

        {/* Delete confirmation modal */}
        <Show when={deletingId()}>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              'background-color': 'rgba(0, 0, 0, 0.8)',
              'backdrop-filter': 'blur(4px)',
              'z-index': '1000',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              padding: '20px',
            }}
          >
            <div
              class="animate-fade-in"
              style={{
                'background-color': 'var(--app-dark-100)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-lg)',
                padding: '24px',
                width: '100%',
                'max-width': '420px',
                display: 'flex',
                'flex-direction': 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', 'align-items': 'center', gap: '12px', color: 'var(--app-danger)' }}>
                <Trash2 size={24} />
                <h3 style={{ margin: '0', color: 'var(--app-white)', 'font-size': '18px' }}>Confirmar Eliminación</h3>
              </div>
              <p style={{ margin: '0', color: 'var(--text-secondary)', 'font-size': '14px' }}>
                ¿Estás seguro de eliminar este producto? Se aplicará Soft Delete (`deletedAt`).
              </p>
              <div style={{ display: 'flex', 'justify-content': 'flex-end', gap: '12px' }}>
                <Button variant="outline" onClick={() => setDeletingId(null)}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(deletingId()!)}>
                  Sí, Eliminar
                </Button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MainLayout>
  );
};
