import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImageIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';

const productImages = import.meta.glob('../../assets/productos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

function getProductImage(imageName) {
  return productImages[`../../assets/productos/${imageName}`] ?? '';
}

function formatPrice(price) {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }

  return price ?? '';
}

function getCategoryLabel(product, categories) {
  const categoryValue = product.categoryId ?? product.category ?? product.categoryLabel;

  if (!categoryValue) {
    return '';
  }

  const matchedCategory = categories.find((category) => category.id === categoryValue || category.label === categoryValue);
  return matchedCategory?.label ?? String(categoryValue);
}

export function ProductDetailDrawer({ categories = [], isOpen, onClose, product }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  const imageSrc = product.image ? getProductImage(product.image) : '';
  const categoryLabel = getCategoryLabel(product, categories);
  const shortDescription = product.shortDescription ?? product.description ?? '';
  const fullDescription = product.fullDescription ?? product.description ?? shortDescription;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 backdrop-blur-[2px] sm:items-center sm:px-6"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="product-detail-drawer-title"
        aria-modal="true"
        className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[86vh] sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/95 px-5 pb-3 pt-3 backdrop-blur sm:px-6">
          <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-neutral-300" aria-hidden="true" />
          <Button
            aria-label="Cerrar detalle del producto"
            className="absolute right-3 top-3 size-10 min-h-10 p-0"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-5" strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="aspect-[4/3] overflow-hidden rounded-md bg-neutral-100 sm:aspect-[16/9]">
            {imageSrc ? (
              <img className="size-full object-cover" src={imageSrc} alt={product.imageAlt ?? product.name} />
            ) : (
              <div className="grid size-full place-items-center text-neutral-400">
                <ImageIcon className="size-10" strokeWidth={1.8} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="product-detail-drawer-title" className="text-2xl font-bold leading-tight tracking-normal text-neutral-950 sm:text-3xl">
                {product.name}
              </h2>
              {categoryLabel ? (
                <Badge className="mt-3 w-max" variant="secondary">
                  {categoryLabel}
                </Badge>
              ) : null}
            </div>
            <p className="shrink-0 pt-1 text-xl font-bold leading-none text-neutral-950 sm:text-2xl">{formatPrice(product.price)}</p>
          </div>

          <div className="mt-5 border-t border-neutral-200 pt-5">
            <h3 className="text-sm font-bold leading-5 text-neutral-950">{'Descripci\u00f3n breve'}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{shortDescription}</p>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold leading-5 text-neutral-950">{'Descripci\u00f3n completa'}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{fullDescription}</p>
          </div>

          <Button className="mt-6 w-full" onClick={onClose} type="button">
            {'Volver al men\u00fa'}
          </Button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
