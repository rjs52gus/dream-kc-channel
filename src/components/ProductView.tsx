import { useMemo, useState } from 'react';
import { searchProducts } from '../domain/catalog';
import { salesChannels } from '../mock-data';
import type {
  ChannelId,
  ChannelState,
  MockAction,
  Product,
  ProductOption,
} from '../types';
import { ChannelCard } from './ChannelCard';

export type OptionSelection = string | 'ALL';

export interface ActionRequest {
  action: MockAction;
  targetChannelIds: ChannelId[];
  scopeLabel: string;
}

interface ProductViewProps {
  products: Product[];
  selectedProductId: string;
  selectedOptionId: OptionSelection;
  onSelectProduct: (productId: string) => void;
  onSelectOption: (optionId: OptionSelection) => void;
  onRequestAction: (request: ActionRequest) => void;
}

const sabangnetChannelIds = salesChannels
  .filter((channel) => channel.group === 'sabangnet')
  .map((channel) => channel.id);
const allChannelIds = salesChannels.map((channel) => channel.id);

function aggregateState(options: ProductOption[], channelId: ChannelId): ChannelState {
  const states = options.map((option) => option.channelStates[channelId]);
  if (states.some((state) => state === 'PENDING')) return 'PENDING';
  if (states.every((state) => state === 'SOLD_OUT')) return 'SOLD_OUT';
  return 'ON_SALE';
}

export function ProductView({
  products,
  selectedProductId,
  selectedOptionId,
  onSelectProduct,
  onSelectOption,
  onRequestAction,
}: ProductViewProps) {
  const [query, setQuery] = useState('');
  const filteredProducts = useMemo(
    () => searchProducts(products, query),
    [products, query],
  );
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? products[0];
  const targetOptions =
    selectedOptionId === 'ALL'
      ? selectedProduct.options
      : selectedProduct.options.filter((option) => option.id === selectedOptionId);
  const selectedOption = targetOptions[0] ?? selectedProduct.options[0];
  const selectionLabel =
    selectedOptionId === 'ALL' ? '전체 옵션' : selectedOption.name;

  const channelState = (channelId: ChannelId) =>
    selectedOptionId === 'ALL'
      ? aggregateState(selectedProduct.options, channelId)
      : selectedOption.channelStates[channelId];

  return (
    <section className="view product-view" aria-labelledby="products-title">
      <div className="view-heading">
        <div>
          <p className="eyebrow">상품과 옵션 선택</p>
          <h1 id="products-title">판매상태 관리</h1>
          <p>이카운트 코드를 기준으로 원하는 상품과 옵션을 선택하세요.</p>
        </div>
        <span className="mock-banner">Mock 실행 · 실제 판매처 미반영</span>
      </div>

      <div className="product-layout">
        <aside className="product-browser panel">
          <label className="search-field">
            <span>상품명 / 이카운트 코드</span>
            <input
              type="search"
              aria-label="상품 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: 실리콘 또는 DK-SIL-001"
            />
          </label>
          <p className="result-count">검색 결과 {filteredProducts.length}개</p>
          <div className="product-list">
            {filteredProducts.map((product) => (
              <button
                type="button"
                key={product.id}
                className={`product-list__item ${selectedProduct.id === product.id ? 'is-active' : ''}`}
                onClick={() => {
                  onSelectProduct(product.id);
                  onSelectOption(product.options[0].id);
                }}
              >
                <span>{product.brand}</span>
                <strong>{product.name}</strong>
                <code>{product.ecountCode}</code>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <p className="empty-state">일치하는 상품이 없습니다.</p>
            )}
          </div>
        </aside>

        <div className="product-detail">
          <article className="panel product-summary">
            <div>
              <p className="eyebrow">{selectedProduct.brand}</p>
              <h2>{selectedProduct.name}</h2>
              <code>{selectedProduct.ecountCode}</code>
            </div>
            <div className="option-picker" aria-label="옵션 선택">
              <button
                type="button"
                aria-pressed={selectedOptionId === 'ALL'}
                className={selectedOptionId === 'ALL' ? 'is-active' : ''}
                onClick={() => onSelectOption('ALL')}
              >
                <span>상품 전체</span>
                <small>{selectedProduct.options.length}개 옵션</small>
              </button>
              {selectedProduct.options.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  aria-pressed={selectedOptionId === option.id}
                  aria-label={`${option.name} · ${option.ecountCode}`}
                  className={selectedOptionId === option.id ? 'is-active' : ''}
                  onClick={() => onSelectOption(option.id)}
                >
                  <span>{option.name}</span>
                  <small>{option.ecountCode}</small>
                </button>
              ))}
            </div>
          </article>

          <div className="status-heading">
            <div>
              <p className="eyebrow">선택 대상</p>
              <h2>{selectionLabel} 판매상태</h2>
            </div>
            <div className="global-actions">
              <button
                type="button"
                className="button button--soldout"
                onClick={() =>
                  onRequestAction({
                    action: 'SOLD_OUT',
                    targetChannelIds: allChannelIds,
                    scopeLabel: '전체 판매처',
                  })
                }
              >
                전체 판매처 품절
              </button>
              <button
                type="button"
                className="button button--resume"
                onClick={() =>
                  onRequestAction({
                    action: 'RESUME',
                    targetChannelIds: allChannelIds,
                    scopeLabel: '전체 판매처',
                  })
                }
              >
                전체 판매처 판매재개
              </button>
            </div>
          </div>

          <section className="channel-section panel" aria-labelledby="sabangnet-title">
            <div className="panel__heading">
              <div>
                <p className="eyebrow">기존 연결정보 활용</p>
                <h3 id="sabangnet-title">사방넷 연동 채널</h3>
              </div>
              <div className="group-actions">
                <button type="button" onClick={() => onRequestAction({ action: 'SOLD_OUT', targetChannelIds: sabangnetChannelIds, scopeLabel: '사방넷 그룹' })}>그룹 품절</button>
                <button type="button" onClick={() => onRequestAction({ action: 'RESUME', targetChannelIds: sabangnetChannelIds, scopeLabel: '사방넷 그룹' })}>그룹 판매재개</button>
              </div>
            </div>
            <p className="section-note">실제 쇼핑몰 전파 방식은 검증중이며 현재는 Mock으로만 실행됩니다.</p>
            <div className="channel-grid">
              {salesChannels.filter((channel) => channel.group === 'sabangnet').map((channel) => (
                <ChannelCard key={channel.id} channel={channel} state={channelState(channel.id)} onRequestAction={(action) => onRequestAction({ action, targetChannelIds: [channel.id], scopeLabel: channel.name })} />
              ))}
            </div>
          </section>

          <section className="channel-section panel" aria-labelledby="direct-title">
            <div className="panel__heading">
              <div>
                <p className="eyebrow">직접 관리</p>
                <h3 id="direct-title">직접 관리 채널</h3>
              </div>
            </div>
            <div className="channel-grid channel-grid--direct">
              {salesChannels.filter((channel) => channel.group === 'direct').map((channel) => (
                <ChannelCard key={channel.id} channel={channel} state={channelState(channel.id)} onRequestAction={(action) => onRequestAction({ action, targetChannelIds: [channel.id], scopeLabel: channel.name })} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
