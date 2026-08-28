import type { Product } from '../types';

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('ko-KR');
}

export function searchProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    const productFields = [product.name, product.brand, product.ecountCode];
    const optionFields = product.options.flatMap((option) => [
      option.name,
      option.ecountCode,
    ]);

    return [...productFields, ...optionFields].some((field) =>
      normalize(field).includes(normalizedQuery),
    );
  });
}
