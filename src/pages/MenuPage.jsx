import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { CategoryFilter } from '@/components/landing/CategoryFilter.jsx';
import { Hero } from '@/components/landing/Hero.jsx';
import { PublicMenuFooter } from '@/components/landing/PublicMenuFooter.jsx';
import { AppShell } from '@/components/layouts/AppShell.jsx';
import { CardProducts } from '@/components/products/CardProducts.jsx';
import { ProductDetailDrawer } from '@/components/products/ProductDetailDrawer.jsx';

const SESSION_STORAGE_KEY = 'restaurantos_mock_session';
const PRODUCT_EDITS_STORAGE_KEY = 'restaurantos_product_edits';

function readStoredProductEdits() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCT_EDITS_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
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

export function MenuPage() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(SESSION_STORAGE_KEY) === 'active');

  useEffect(() => {
    fetch('/data/categorias.json')
      .then((res) => res.json())
      .then(setCategorias)
      .catch(() => setCategorias([]));

    fetch('/data/productos.json')
      .then((res) => res.json())
      .then((products) => setProductos(mergeStoredProducts(products)))
      .catch(() => setProductos([]));
  }, []);

  function handleToggleSession() {
    setIsAuthenticated((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        localStorage.setItem(SESSION_STORAGE_KEY, 'active');
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }

      return nextValue;
    });
  }

  function handleOpenProductDetail(product) {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  }

  function handleCloseProductDetail() {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = Array.isArray(productos)
    ? productos.filter((product) => {
        if (!normalizedSearch) {
          return true;
        }

        return `${product.name ?? ''} ${product.description ?? ''} ${product.shortDescription ?? ''}`.toLowerCase().includes(normalizedSearch);
      })
    : [];

  return (
    <AppShell showBottomNavigation={isAuthenticated}>
      <Hero />

      <label className="relative mb-6 block">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          aria-label="Buscar platos o bebidas"
          className="h-12 w-full rounded-md border border-border bg-card pl-12 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar platos o bebidas..."
          type="search"
          value={searchTerm}
        />
      </label>

      <CategoryFilter categories={categorias} activeCategoryId="all" />

      <section className="grid gap-4" aria-label="Menu items">
        {filteredProducts.map((product) => (
          <CardProducts key={product.id} onSelect={handleOpenProductDetail} product={product} />
        ))}
      </section>

      <PublicMenuFooter isAuthenticated={isAuthenticated} onToggleSession={handleToggleSession} />

      <ProductDetailDrawer
        categories={categorias}
        isOpen={isProductDetailOpen}
        onClose={handleCloseProductDetail}
        product={selectedProduct}
      />
    </AppShell>
  );
}
