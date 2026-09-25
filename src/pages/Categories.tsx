import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { MainLayout } from '@components/layout/MainLayout';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@core/entities/category.entity';
import { categoryService } from '@infrastructure/services';
import { authStore } from '@state/auth.store';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Plus, Edit, Trash2, Tag, RefreshCw, AlertCircle, CheckCircle2, X, ShieldAlert } from 'lucide-solid';

export const CategoriesPage: Component = () => {
  const [categories, setCategories] = createSignal<Category[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string | null>(null);
  const [successMsg, setSuccessMsg] = createSignal<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = createSignal<boolean>(false);
  const [editingCategory, setEditingCategory] = createSignal<Category | null>(null);
  const [formData, setFormData] = createSignal<{ name: string; description: string; isActive: boolean }>({
    name: '',
    description: '',
    isActive: true,
  });
  const [modalError, setModalError] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal<boolean>(false);

  // Delete modal state
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories({ activeOnly: false });
      setCategories(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las categorías';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    fetchCategories();
  });

  const canManage = () => {
    const role = authStore.userRole();
    return role === 'ADMIN' || role === 'RESTAURANT';
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setModalError(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setModalError(null);

    const name = formData().name.trim();
    if (!name) {
      setModalError('El nombre de la categoría es requerido.');
      return;
    }
    if (name.length > 100) {
      setModalError('El nombre no puede exceder 100 caracteres.');
      return;
    }

    const token = authStore.token();
    if (!token) {
      setModalError('Sesión no válida. Vuelve a iniciar sesión.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory()) {
        const dto: UpdateCategoryDTO = {
          name,
          description: formData().description.trim() || null,
          isActive: formData().isActive,
        };
        await categoryService.updateCategory(editingCategory()!.id, dto, token);
        setSuccessMsg(`Categoría "${name}" actualizada con éxito.`);
      } else {
        const dto: CreateCategoryDTO = {
          name,
          description: formData().description.trim() || null,
        };
        await categoryService.createCategory(dto, token);
        setSuccessMsg(`Categoría "${name}" creada con éxito.`);
      }
      closeModal();
      fetchCategories();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la categoría';
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = authStore.token();
    if (!token) return;

    try {
      await categoryService.deleteCategory(id, token);
      setSuccessMsg('Categoría eliminada con éxito (Soft Delete).');
      setDeletingId(null);
      fetchCategories();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la categoría';
      setError(msg);
      setDeletingId(null);
    }
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
                Se requiere el rol de Administrador (ADMIN) o Restaurante (RESTAURANT) para gestionar categorías (RF-03).
              </p>
            </div>
          </div>
        </Show>

        {/* Top Header */}
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
              <h1 style={{ 'font-size': '28px', 'font-weight': '800', color: 'var(--app-white)', margin: '0' }}>
                Gestión de Categorías
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
                RF-03 CRUD
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', 'font-size': '14px', 'margin-top': '4px' }}>
              Administra las categorías del menú bajo Clean Architecture y Repository Pattern.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" size="sm" onClick={fetchCategories} icon={<RefreshCw size={14} />}>
              Refrescar
            </Button>
            <Show when={canManage()}>
              <Button variant="primary" onClick={openCreateModal} icon={<Plus size={16} />}>
                Nueva Categoría
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

        {/* Categories Table */}
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
              <span>Cargando categorías...</span>
            </div>
          </Show>

          <Show when={!isLoading() && categories().length === 0}>
            <div style={{ padding: '60px 20px', 'text-align': 'center', color: 'var(--text-muted)' }}>
              <Tag size={40} style={{ margin: '0 auto 12px auto' }} />
              <p style={{ 'font-size': '16px', color: 'var(--app-white)', margin: '0' }}>
                No hay categorías registradas
              </p>
              <p style={{ 'font-size': '14px', margin: '4px 0 0 0' }}>
                Haz clic en "Nueva Categoría" para crear la primera.
              </p>
            </div>
          </Show>

          <Show when={!isLoading() && categories().length > 0}>
            <div style={{ 'overflow-x': 'auto' }}>
              <table style={{ width: '100%', 'border-collapse': 'collapse', 'text-align': 'left' }}>
                <thead>
                  <tr style={{ 'border-bottom': '1px solid var(--border-color)', 'background-color': 'var(--app-dark-200)' }}>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>
                      Categoría
                    </th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>
                      Descripción
                    </th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600' }}>
                      Estado
                    </th>
                    <th style={{ padding: '14px 20px', 'font-size': '13px', color: 'var(--text-muted)', 'font-weight': '600', 'text-align': 'right' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <For each={categories()}>
                    {(cat) => (
                      <tr style={{ 'border-bottom': '1px solid var(--border-color)', transition: 'var(--transition-fast)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                'border-radius': 'var(--radius-sm)',
                                'background-color': 'var(--app-green-light)',
                                color: 'var(--app-green)',
                                display: 'flex',
                                'align-items': 'center',
                                'justify-content': 'center',
                              }}
                            >
                              <Tag size={16} />
                            </div>
                            <span style={{ 'font-weight': '700', color: 'var(--app-white)', 'font-size': '15px' }}>
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', 'font-size': '14px', 'max-width': '300px' }}>
                          {cat.description || <span style={{ color: 'var(--text-muted)', 'font-style': 'italic' }}>Sin descripción</span>}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              'border-radius': 'var(--radius-pill)',
                              'font-size': '11px',
                              'font-weight': '700',
                              'background-color': cat.isActive ? 'rgba(6, 193, 103, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                              color: cat.isActive ? '#06C167' : 'var(--text-muted)',
                              border: cat.isActive ? '1px solid rgba(6, 193, 103, 0.3)' : '1px solid var(--border-color)',
                            }}
                          >
                            {cat.isActive ? 'ACTIVA' : 'INACTIVA'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', 'text-align': 'right' }}>
                          <Show when={canManage()}>
                            <div style={{ display: 'flex', 'justify-content': 'flex-end', gap: '8px' }}>
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(cat)} icon={<Edit size={14} />}>
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingId(cat.id)}
                                icon={<Trash2 size={14} color="var(--app-danger)" />}
                              >
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
        </div>

        {/* Modal Create / Edit */}
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
                'max-width': '480px',
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
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
                  {editingCategory() ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button
                  onClick={closeModal}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body / Form */}
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

                <Input
                  label="Nombre de la Categoría *"
                  placeholder="ej. Hamburguesas, Bebidas, Postres"
                  value={formData().name}
                  onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                  required
                />

                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px' }}>
                  <label style={{ 'font-size': '13px', 'font-weight': '600', color: 'var(--text-secondary)' }}>
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descripción opcional de la categoría..."
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

                <Show when={editingCategory()}>
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="isActiveCat"
                      checked={formData().isActive}
                      onChange={(e) => setFormData({ ...formData(), isActive: e.currentTarget.checked })}
                      style={{ width: '18px', height: '18px', 'accent-color': 'var(--app-green)' }}
                    />
                    <label for="isActiveCat" style={{ color: 'var(--app-white)', 'font-size': '14px', cursor: 'pointer' }}>
                      Categoría Activa en el Menú
                    </label>
                  </div>
                </Show>

                <div style={{ display: 'flex', 'justify-content': 'flex-end', gap: '12px', 'margin-top': '8px' }}>
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSubmitting()}>
                    {editingCategory() ? 'Guardar Cambios' : 'Crear Categoría'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Show>

        {/* Delete Confirmation Modal */}
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
                ¿Estás seguro de que deseas eliminar esta categoría? Se aplicará un Soft Delete (`deletedAt`).
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
