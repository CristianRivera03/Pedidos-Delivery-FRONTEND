import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { MainLayout } from '@components/layout/MainLayout';
import { Product, PaginationMeta } from '@core/entities/product.entity';
import { Category } from '@core/entities/category.entity';
import { productService, categoryService } from '@infrastructure/services';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Search, ShoppingBag, ChevronLeft, ChevronRight, RefreshCw, Tag, AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-solid';

export const Catalog: Component = () => {
  const [products, setProducts] = createSignal<Product[]>([]);
  const [categories, setCategories] = createSignal<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = createSignal<string>('');
  const [searchQuery, setSearchQuery] = createSignal<string>('');
  const [page, setPage] = createSignal<number>(1);
  const [limit] = createSignal<number>(8);
  const [pagination, setPagination] = createSignal<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string | null>(null);
  const [cartCount, setCartCount] = createSignal<number>(0);
  const [notification, setNotification] = createSignal<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories({ activeOnly: true });
      setCategories(data);
    } catch (err: unknown) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts({
        categoryId: selectedCategory() || undefined,
        search: searchQuery() || undefined,
        activeOnly: true,
        page: page(),
        limit: limit(),
      });
      setProducts(res.items);
      setPagination(res.pagination || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el catálogo de productos';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    fetchCategories();
    fetchProducts();
  });

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
    fetchProducts();
  };

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    setPage(1);
    fetchProducts();
  };

  const handlePrevPage = () => {
    if (page() > 1) {
      setPage(page() - 1);
      fetchProducts();
    }
  };

  const handleNextPage = () => {
    if (pagination() && pagination()!.hasNextPage) {
      setPage(page() + 1);
      fetchProducts();
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCartCount(cartCount() + 1);
    setNotification(`¡"${product.name}" añadido al carrito!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const getCategoryName = (catId: string) => {
    const found = categories().find((c) => c.id === catId);
    return found ? found.name : 'Categoría';
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '28px' }}>
        {/* Header section */}
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
              <h1 style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)', margin: '0' }}>
                Catálogo de Productos
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
                RF-03 & RF-09
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', 'font-size': '14px', 'margin-top': '4px' }}>
              Explora y filtra nuestro menú en tiempo real con stock actualizado.
            </p>
          </div>

          <div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '8px',
                padding: '8px 16px',
                'background-color': 'var(--app-dark-200)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-pill)',
                color: 'var(--app-white)',
                'font-size': '14px',
                'font-weight': '600',
              }}
            >
              <ShoppingCart size={18} color="var(--app-green)" />
              <span>Carrito: </span>
              <span style={{ color: 'var(--app-green)', 'font-size': '16px', 'font-weight': '800' }}>
                {cartCount()}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchProducts()} icon={<RefreshCw size={14} />}>
              Actualizar
            </Button>
          </div>
        </div>

        {/* Floating Notification */}
        <Show when={notification()}>
          <div
            class="animate-fade-in"
            style={{
              padding: '12px 18px',
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
            <span>{notification()}</span>
          </div>
        </Show>

        {/* Search & Category Filter Section */}
        <div
          style={{
            'background-color': 'var(--app-dark-100)',
            border: '1px solid var(--border-color)',
            'border-radius': 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            'flex-direction': 'column',
            gap: '16px',
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Buscar productos por nombre..."
              value={searchQuery()}
              onInput={(e) => handleSearchInput(e.currentTarget.value)}
              style={{
                width: '100%',
                'padding-left': '42px',
                'padding-right': '16px',
                height: '44px',
                'background-color': 'var(--app-dark-300)',
                border: '1px solid var(--border-color)',
                'border-radius': 'var(--radius-md)',
                color: 'var(--app-white)',
                'font-size': '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', 'align-items': 'center', gap: '8px', 'overflow-x': 'auto', 'padding-bottom': '4px' }}>
            <span style={{ color: 'var(--text-muted)', 'font-size': '13px', 'font-weight': '600', 'margin-right': '6px', display: 'flex', 'align-items': 'center', gap: '4px' }}>
              <Tag size={14} /> Categorías:
            </span>
            <button
              onClick={() => handleCategorySelect('')}
              style={{
                padding: '6px 14px',
                'border-radius': 'var(--radius-pill)',
                'font-size': '13px',
                'font-weight': '600',
                cursor: 'pointer',
                border: selectedCategory() === '' ? '1px solid var(--app-green)' : '1px solid var(--border-color)',
                'background-color': selectedCategory() === '' ? 'var(--app-green)' : 'var(--app-dark-200)',
                color: selectedCategory() === '' ? '#000' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
                'white-space': 'nowrap',
              }}
            >
              Todas
            </button>
            <For each={categories()}>
              {(cat) => (
                <button
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    padding: '6px 14px',
                    'border-radius': 'var(--radius-pill)',
                    'font-size': '13px',
                    'font-weight': '600',
                    cursor: 'pointer',
                    border: selectedCategory() === cat.id ? '1px solid var(--app-green)' : '1px solid var(--border-color)',
                    'background-color': selectedCategory() === cat.id ? 'var(--app-green)' : 'var(--app-dark-200)',
                    color: selectedCategory() === cat.id ? '#000' : 'var(--text-secondary)',
                    transition: 'var(--transition-fast)',
                    'white-space': 'nowrap',
                  }}
                >
                  {cat.name}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Error Alert */}
        <Show when={error()}>
          <div
            style={{
              padding: '16px',
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
            <AlertCircle size={20} />
            <span>{error()}</span>
          </div>
        </Show>

        {/* Loading State */}
        <Show when={isLoading()}>
          <div style={{ display: 'flex', 'justify-content': 'center', 'align-items': 'center', padding: '60px 0', color: 'var(--text-muted)', gap: '12px' }}>
            <RefreshCw size={24} class="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ 'font-weight': '600' }}>Cargando catálogo...</span>
          </div>
        </Show>

        {/* Product Grid */}
        <Show when={!isLoading() && products().length > 0}>
          <div
            style={{
              display: 'grid',
              'grid-template-columns': 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            <For each={products()}>
              {(prod) => (
                <div
                  style={{
                    'background-color': 'var(--app-dark-100)',
                    border: '1px solid var(--border-color)',
                    'border-radius': 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    'flex-direction': 'column',
                    transition: 'var(--transition-smooth)',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {/* Product Image / Placeholder */}
                  <div
                    style={{
                      height: '170px',
                      'background-color': 'var(--app-dark-300)',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Show
                      when={prod.imageUrl}
                      fallback={
                        <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', color: 'var(--text-muted)', gap: '8px' }}>
                          <ShoppingBag size={40} />
                          <span style={{ 'font-size': '12px' }}>Sin imagen</span>
                        </div>
                      }
                    >
                      <img
                        src={prod.imageUrl!}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', 'object-fit': 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </Show>

                    {/* Stock Status Badge */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <Show
                        when={prod.stock > 0}
                        fallback={
                          <span
                            style={{
                              padding: '4px 10px',
                              'background-color': 'var(--app-danger)',
                              color: '#fff',
                              'font-size': '11px',
                              'font-weight': '700',
                              'border-radius': 'var(--radius-pill)',
                            }}
                          >
                            Agotado
                          </span>
                        }
                      >
                        <span
                          style={{
                            padding: '4px 10px',
                            'background-color': 'rgba(6, 193, 103, 0.9)',
                            color: '#000',
                            'font-size': '11px',
                            'font-weight': '700',
                            'border-radius': 'var(--radius-pill)',
                          }}
                        >
                          Stock: {prod.stock} un.
                        </span>
                      </Show>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '20px', flex: '1', display: 'flex', 'flex-direction': 'column', 'justify-content': 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'margin-bottom': '6px' }}>
                        <span style={{ 'font-size': '12px', color: 'var(--app-green)', 'font-weight': '600' }}>
                          {getCategoryName(prod.categoryId)}
                        </span>
                      </div>
                      <h3 style={{ 'font-size': '17px', 'font-weight': '700', color: 'var(--app-white)', margin: '0 0 6px 0' }}>
                        {prod.name}
                      </h3>
                      <p
                        style={{
                          'font-size': '13px',
                          color: 'var(--text-secondary)',
                          margin: '0',
                          display: '-webkit-box',
                          '-webkit-line-clamp': '2',
                          '-webkit-box-orient': 'vertical',
                          overflow: 'hidden',
                          'text-overflow': 'ellipsis',
                          'min-height': '36px',
                        }}
                      >
                        {prod.description || 'Sin descripción detallada.'}
                      </p>
                    </div>

                    {/* Price and Action */}
                    <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'border-top': '1px solid var(--border-color)', 'padding-top': '14px' }}>
                      <div>
                        <span style={{ 'font-size': '11px', color: 'var(--text-muted)', display: 'block' }}>Precio</span>
                        <span style={{ 'font-size': '20px', 'font-weight': '800', color: 'var(--app-white)' }}>
                          ${Number(prod.price).toFixed(2)}
                        </span>
                      </div>

                      <Button
                        variant={prod.stock > 0 ? 'primary' : 'outline'}
                        size="sm"
                        disabled={prod.stock <= 0}
                        onClick={() => handleAddToCart(prod)}
                        icon={<ShoppingCart size={15} />}
                      >
                        {prod.stock > 0 ? 'Agregar' : 'Agotado'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        {/* Empty State */}
        <Show when={!isLoading() && products().length === 0}>
          <div
            style={{
              padding: '60px 20px',
              'text-align': 'center',
              'background-color': 'var(--app-dark-100)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-lg)',
              display: 'flex',
              'flex-direction': 'column',
              'align-items': 'center',
              gap: '12px',
            }}
          >
            <ShoppingBag size={48} color="var(--text-muted)" />
            <h3 style={{ color: 'var(--app-white)', 'font-size': '18px', margin: '0' }}>
              No se encontraron productos
            </h3>
            <p style={{ color: 'var(--text-muted)', 'font-size': '14px', margin: '0' }}>
              Intenta cambiando la categoría o borrando la búsqueda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setPage(1);
                fetchProducts();
              }}
            >
              Restablecer Filtros
            </Button>
          </div>
        </Show>

        {/* Pagination Bar */}
        <Show when={pagination() && pagination()!.totalPages > 1}>
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              padding: '16px 20px',
              'background-color': 'var(--app-dark-100)',
              border: '1px solid var(--border-color)',
              'border-radius': 'var(--radius-lg)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', 'font-size': '14px' }}>
              Página <strong style={{ color: 'var(--app-white)' }}>{pagination()?.page}</strong> de{' '}
              <strong style={{ color: 'var(--app-white)' }}>{pagination()?.totalPages}</strong> ({pagination()?.totalItems} productos en total)
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination()?.hasPreviousPage}
                onClick={handlePrevPage}
                icon={<ChevronLeft size={16} />}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination()?.hasNextPage}
                onClick={handleNextPage}
                icon={<ChevronRight size={16} />}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Show>
      </div>
    </MainLayout>
  );
};
