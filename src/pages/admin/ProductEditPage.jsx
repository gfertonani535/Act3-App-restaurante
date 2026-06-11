import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Upload } from 'lucide-react';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { cn } from '@/lib/utils';

const productImages = import.meta.glob('../../assets/productos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const categoryByProductId = {
  'pizza-margherita': 'pizzas',
  'hamburguesa-gourmet': 'hamburguesas',
  'lomo-completo': 'lomos',
  sorrentinos: 'pastas',
  empanadas: 'empanadas',
  'flan-casero': 'postres',
};

const defaultCategories = [
  { id: 'pizzas', label: 'Pizzas' },
  { id: 'hamburguesas', label: 'Hamburguesas' },
  { id: 'lomos', label: 'Lomos' },
  { id: 'pastas', label: 'Pastas' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'empanadas', label: 'Empanadas' },
  { id: 'postres', label: 'Postres' },
];

const EDITS_STORAGE_KEY = 'restaurantos_product_edits';

const emptyProductForm = {
  name: '',
  categoryId: '',
  shortDescription: '',
  price: '',
  description: '',
  image: '',
  imageAlt: 'Imagen del producto',
  isActive: true,
  isVisibleInMenu: true,
  isQuickAccess: false,
  trackStock: false,
  stock: '0',
};

function getProductImage(imageName) {
  return productImages[`../../assets/productos/${imageName}`] ?? '';
}

function parsePrice(price) {
  if (typeof price === 'number') {
    return price;
  }

  return Number(String(price).replace('$', '').trim()) || 0;
}

function readStoredProductEdits() {
  try {
    return JSON.parse(localStorage.getItem(EDITS_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeStoredProductEdits(edits) {
  localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(edits));
}

function persistProductEdit(productId, payload) {
  const currentEdits = readStoredProductEdits();
  writeStoredProductEdits({
    ...currentEdits,
    [productId]: {
      ...(currentEdits[productId] ?? {}),
      ...payload,
      id: productId,
    },
  });
}

function getInitialForm(product) {
  return {
    name: product.name ?? '',
    categoryId: product.categoryId ?? categoryByProductId[product.id] ?? '',
    shortDescription: product.shortDescription ?? product.description ?? '',
    price: String(parsePrice(product.price).toFixed(2)),
    description: product.fullDescription ?? product.description ?? '',
    image: product.image ?? '',
    imageAlt: product.imageAlt ?? product.name ?? 'Imagen del producto',
    isActive: product.isActive ?? true,
    isVisibleInMenu: product.isVisibleInMenu ?? true,
    isQuickAccess: product.isQuickAccess ?? true,
    trackStock: product.trackStock ?? false,
    stock: String(product.stock ?? 0),
  };
}

function slugifyProductName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getUniqueProductId(name, products) {
  const baseId = slugifyProductName(name) || `producto-${Date.now()}`;
  const existingIds = new Set(products.map((product) => product.id));

  if (!existingIds.has(baseId)) {
    return baseId;
  }

  let suffix = 2;
  let nextId = `${baseId}-${suffix}`;

  while (existingIds.has(nextId)) {
    suffix += 1;
    nextId = `${baseId}-${suffix}`;
  }

  return nextId;
}

function mergeStoredProducts(menuProducts) {
  const storedEdits = readStoredProductEdits();
  const baseProducts = Array.isArray(menuProducts)
    ? menuProducts.map((product) => ({ ...product, ...(storedEdits[product.id] ?? {}) }))
    : [];
  const baseIds = new Set(baseProducts.map((product) => product.id));
  const createdProducts = Object.entries(storedEdits)
    .filter(([id, product]) => product?.__isCreated && !baseIds.has(id))
    .map(([id, product]) => ({ id, ...product }));

  return [...baseProducts, ...createdProducts];
}

function createProductEdit(payload, products) {
  const productId = getUniqueProductId(payload.name, products);
  const currentEdits = readStoredProductEdits();

  writeStoredProductEdits({
    ...currentEdits,
    [productId]: {
      ...payload,
      id: productId,
      __isCreated: true,
    },
  });

  return productId;
}

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <p className="text-xs font-medium leading-5 text-red-700">{children}</p>;
}

function FormField({ children, className, error, label }) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label>{label}</Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}

function SwitchRow({ checked, description, label, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-950">{label}</p>
        {description ? <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p> : null}
      </div>
      <Switch checked={checked} onClick={() => onCheckedChange(!checked)} />
    </div>
  );
}

export function ProductEditPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(productId);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch('/data/productos.json').then((response) => response.json()),
      fetch('/data/categorias.json').then((response) => response.json()),
    ])
      .then(([menuProducts, menuCategories]) => {
        if (!isMounted) {
          return;
        }

        const normalizedProducts = mergeStoredProducts(menuProducts);
        const normalizedCategories = Array.isArray(menuCategories)
          ? menuCategories
              .filter((category) => category.id !== 'all')
              .map((category) => ({ id: category.id, label: category.label }))
          : defaultCategories;

        const currentProduct = isEditMode ? normalizedProducts.find((product) => product.id === productId) : null;

        setProducts(normalizedProducts);
        setCategories(normalizedCategories.length > 0 ? normalizedCategories : defaultCategories);
        setForm(isEditMode ? (currentProduct ? getInitialForm(currentProduct) : null) : emptyProductForm);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setProducts([]);
        setForm(isEditMode ? null : emptyProductForm);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isEditMode, productId]);

  const product = useMemo(() => products.find((item) => item.id === productId), [productId, products]);
  const imageSrc = form?.image ? getProductImage(form.image) : '';
  const pageTitle = isEditMode ? 'Editar producto' : 'Nuevo producto';
  const pageDescription = isEditMode
    ? 'Gestion\u00e1 la informaci\u00f3n visible en la carta digital.'
    : 'Carg\u00e1 la informaci\u00f3n visible en la carta digital.';
  const submitLabel = isEditMode ? 'Guardar cambios' : 'Crear producto';

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setSaveMessage('');
  }

  function validateForm() {
    const nextErrors = {};
    const normalizedPrice = Number(form.price);
    const normalizedStock = Number(form.stock);

    if (!form.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.';
    }

    if (!form.categoryId) {
      nextErrors.categoryId = 'Seleccion\u00e1 una categor\u00eda.';
    }

    if (!form.shortDescription.trim()) {
      nextErrors.shortDescription = 'La descripci\u00f3n breve es obligatoria.';
    }

    if (form.price.trim() === '') {
      nextErrors.price = 'El precio es obligatorio.';
    } else if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      nextErrors.price = 'El precio debe ser mayor o igual a 0.';
    }

    if (form.trackStock && (form.stock.trim() === '' || Number.isNaN(normalizedStock) || normalizedStock < 0)) {
      nextErrors.stock = 'El stock actual no puede ser negativo.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...form,
      imageAlt: form.imageAlt || form.name || 'Imagen del producto',
      price: Number(form.price),
      stock: form.trackStock ? Number(form.stock) : 0,
    };

    if (isEditMode) {
      persistProductEdit(productId, payload);
      setSaveMessage('Cambios guardados correctamente.');
    } else {
      createProductEdit(payload, products);
      setSaveMessage('Producto creado correctamente.');
    }

    navigate('/admin/productos');
  }

  if (isLoading) {
    return (
      <AdminPageContainer>
        <p className="text-sm text-neutral-500">Cargando producto...</p>
      </AdminPageContainer>
    );
  }

  if (isEditMode && (!product || !form)) {
    return (
      <AdminPageContainer>
        <div className="max-w-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-neutral-950">Producto no encontrado</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">No pudimos encontrar el producto solicitado.</p>
          <Button className="mt-5" onClick={() => navigate('/admin/productos')} type="button" variant="secondary">
            Volver a Productos
          </Button>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <AdminPageContainer className="pb-28">
        <header className="grid gap-3">
          <NavLink
            className="inline-flex w-max items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
            to="/admin/productos"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver a Productos
          </NavLink>
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-neutral-950 sm:text-[32px]">{pageTitle}</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500 sm:text-base">{pageDescription}</p>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-6">
            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-14 border-neutral-200 px-5 sm:px-6">
                <CardTitle>{'Informaci\u00f3n principal'}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
                  <FormField error={errors.name} label="Nombre del producto">
                    <Input
                      className="rounded-none border-neutral-200 bg-white"
                      onChange={(event) => updateField('name', event.target.value)}
                      value={form.name}
                    />
                  </FormField>

                  <FormField error={errors.categoryId} label={'Categor\u00eda'}>
                    <select
                      className="flex min-h-11 w-full rounded-none border border-neutral-200 bg-white px-4 text-base text-foreground outline-none transition-colors hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                      onChange={(event) => updateField('categoryId', event.target.value)}
                      value={form.categoryId}
                    >
                      <option value="">{'Seleccionar categor\u00eda'}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                  <FormField error={errors.shortDescription} label={'Descripci\u00f3n breve'}>
                    <Textarea
                      className="min-h-20 resize-none rounded-none border-neutral-200 bg-white"
                      maxLength={120}
                      onChange={(event) => updateField('shortDescription', event.target.value)}
                      value={form.shortDescription}
                    />
                    <span className="justify-self-end text-xs text-neutral-400">{form.shortDescription.length}/120</span>
                  </FormField>

                  <FormField error={errors.price} label="Precio">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500">$</span>
                      <Input
                        className="rounded-none border-neutral-200 bg-white pl-8"
                        min="0"
                        onChange={(event) => updateField('price', event.target.value)}
                        step="0.01"
                        type="number"
                        value={form.price}
                      />
                    </div>
                  </FormField>
                </div>

                <FormField label={'Descripci\u00f3n completa'}>
                  <Textarea
                    className="min-h-28 resize-none rounded-none border-neutral-200 bg-white"
                    maxLength={500}
                    onChange={(event) => updateField('description', event.target.value)}
                    value={form.description}
                  />
                  <span className="justify-self-end text-xs text-neutral-400">{form.description.length}/500</span>
                </FormField>
              </CardContent>
            </Card>

            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-14 border-neutral-200 px-5 sm:px-6">
                <CardTitle>Inventario simple</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <Label className="min-w-36">Controlar stock</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.trackStock} onClick={() => updateField('trackStock', !form.trackStock)} />
                    <span className="text-sm text-neutral-500">{form.trackStock ? 'Activado' : 'Desactivado'}</span>
                  </div>
                </div>

                <FormField className="sm:grid-cols-[140px_minmax(0,1fr)] sm:items-start" error={errors.stock} label="Stock actual">
                  <div className="grid gap-2">
                    <Input
                      className="rounded-none border-neutral-200 bg-white disabled:bg-neutral-50"
                      disabled={!form.trackStock}
                      min="0"
                      onChange={(event) => updateField('stock', event.target.value)}
                      type="number"
                      value={form.stock}
                    />
                    <p className="text-sm leading-5 text-neutral-500">
                      {'Us\u00e1 este campo solo si quer\u00e9s controlar unidades disponibles.'}
                    </p>
                  </div>
                </FormField>
              </CardContent>
            </Card>
          </div>

          <aside className="grid h-max gap-6">
            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-14 border-neutral-200 px-5 sm:px-6">
                <CardTitle>Imagen del producto</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 sm:p-6">
                <div className="aspect-[4/3] overflow-hidden border border-neutral-200 bg-neutral-100">
                  {imageSrc ? (
                    <img className="size-full object-cover" src={imageSrc} alt={form.imageAlt} />
                  ) : (
                    <div className="grid size-full place-items-center text-sm text-neutral-400">Sin imagen</div>
                  )}
                </div>

                <Button className="w-full" type="button">
                  <Upload className="size-4" aria-hidden="true" />
                  Cambiar imagen
                </Button>
                <Button className="w-full" onClick={() => updateField('image', '')} type="button" variant="secondary">
                  <Trash2 className="size-4" aria-hidden="true" />
                  Quitar imagen
                </Button>

                <p className="text-sm leading-6 text-neutral-500">
                  Formatos recomendados: JPG, PNG o WebP.
                  <br />
                  {'Tama\u00f1o recomendado: 800x800px. M\u00e1x. 5MB.'}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-14 border-neutral-200 px-5 sm:px-6">
                <CardTitle>{'Configuraci\u00f3n del producto'}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <SwitchRow checked={form.isActive} label="Producto activo" onCheckedChange={(value) => updateField('isActive', value)} />
                <Separator />
                <SwitchRow
                  checked={form.isVisibleInMenu}
                  label="Visible en carta digital"
                  onCheckedChange={(value) => updateField('isVisibleInMenu', value)}
                />
                <Separator />
                <SwitchRow checked={form.isQuickAccess} label={'Acceso r\u00e1pido'} onCheckedChange={(value) => updateField('isQuickAccess', value)} />
              </CardContent>
            </Card>
          </aside>
        </div>

        {saveMessage ? <p className="text-sm font-medium text-emerald-700">{saveMessage}</p> : null}
      </AdminPageContainer>

      <div className="sticky bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => navigate('/admin/productos')} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="size-4" aria-hidden="true" />
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
