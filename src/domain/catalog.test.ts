import { describe, expect, it } from 'vitest';
import { mockProducts } from '../mock-data';
import { searchProducts } from './catalog';

describe('searchProducts', () => {
  it('상품명 일부로 검색한다', () => {
    expect(
      searchProducts(mockProducts, '실리콘').map((item) => item.ecountCode),
    ).toEqual(['DK-SIL-001']);
  });

  it('이카운트 상품코드의 대소문자와 공백을 무시한다', () => {
    expect(
      searchProducts(mockProducts, '  dk-wood-002 ').map(
        (item) => item.ecountCode,
      ),
    ).toEqual(['DK-WOOD-002']);
  });

  it('옵션코드로 해당 상품을 찾는다', () => {
    expect(
      searchProducts(mockProducts, 'DK-SIL-001-OL').map(
        (item) => item.ecountCode,
      ),
    ).toEqual(['DK-SIL-001']);
  });

  it('빈 검색어에는 전체 상품을 반환한다', () => {
    expect(searchProducts(mockProducts, '')).toHaveLength(mockProducts.length);
  });
});
