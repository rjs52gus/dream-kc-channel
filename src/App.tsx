import { useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import {
  type ActionRequest,
  type OptionSelection,
  ProductView,
} from './components/ProductView';
import { ResultDialog } from './components/ResultDialog';
import { type AppView, Sidebar } from './components/Sidebar';
import { executeMockAction } from './domain/operations';
import { mockProducts } from './mock-data';
import type {
  ChannelId,
  ExecutionResult,
  HistoryEntry,
  Product,
} from './types';

function cloneProducts(): Product[] {
  return mockProducts.map((product) => ({
    ...product,
    options: product.options.map((option) => ({
      ...option,
      channelStates: { ...option.channelStates },
    })),
  }));
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [products, setProducts] = useState<Product[]>(cloneProducts);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [selectedOptionId, setSelectedOptionId] = useState<OptionSelection>(
    products[0].options[0].id,
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pendingRequest, setPendingRequest] = useState<ActionRequest | null>(null);
  const [latestResult, setLatestResult] = useState<{
    action: ActionRequest['action'];
    productName: string;
    optionLabel: string;
    results: ExecutionResult[];
  } | null>(null);

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? products[0];

  const handleActionRequest = (request: ActionRequest) => {
    setPendingRequest(request);
  };

  const handleConfirmAction = () => {
    if (!pendingRequest) return;

    const targetOptions =
      selectedOptionId === 'ALL'
        ? selectedProduct.options
        : selectedProduct.options.filter(
            (option) => option.id === selectedOptionId,
          );
    const executedAt = new Date().toISOString();
    const outcomes = targetOptions.map((option) =>
      executeMockAction(
        option,
        pendingRequest.action,
        pendingRequest.targetChannelIds,
        executedAt,
        {
          productCode: selectedProduct.ecountCode,
          productName: selectedProduct.name,
          scopeLabel: pendingRequest.scopeLabel,
        },
      ),
    );
    const updatedOptions = new Map(
      outcomes.map((outcome) => [outcome.option.id, outcome.option]),
    );

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              options: product.options.map(
                (option) => updatedOptions.get(option.id) ?? option,
              ),
            }
          : product,
      ),
    );

    const results = aggregateResults(
      pendingRequest.targetChannelIds,
      outcomes.map((outcome) => outcome.results),
    );
    const optionLabel =
      selectedOptionId === 'ALL'
        ? `전체 옵션 (${targetOptions.length}개)`
        : targetOptions[0].name;
    const baseHistory = outcomes[0].history;
    const historyEntry: HistoryEntry = {
      ...baseHistory,
      id: `${baseHistory.id}-${history.length}`,
      employee: 'Mock 직원',
      productCode: selectedProduct.ecountCode,
      productName: selectedProduct.name,
      optionCode:
        selectedOptionId === 'ALL'
          ? selectedProduct.ecountCode
          : targetOptions[0].ecountCode,
      optionName: optionLabel,
      scopeLabel: pendingRequest.scopeLabel,
      results,
    };

    setHistory((entries) => [historyEntry, ...entries]);
    setLatestResult({
      action: pendingRequest.action,
      productName: selectedProduct.name,
      optionLabel,
      results,
    });
    setPendingRequest(null);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span><b>Dream Kitchen Channel</b><small>꿈꾸는키친 채널</small></span>
        </div>
        <div className="topbar__status">
          <span className="status-dot" aria-hidden="true" />
          <span><b>Mock 모드</b><small>실제 판매처 미연동</small></span>
        </div>
      </header>
      <div className="workspace">
        <Sidebar activeView={activeView} onChange={setActiveView} />
        <main className="main-content">
          {activeView === 'dashboard' && (
            <DashboardView
              products={products}
              historyCount={history.length}
              onOpenProducts={() => setActiveView('products')}
            />
          )}
          {activeView === 'products' && (
            <ProductView
              products={products}
              selectedProductId={selectedProductId}
              selectedOptionId={selectedOptionId}
              onSelectProduct={setSelectedProductId}
              onSelectOption={setSelectedOptionId}
              onRequestAction={handleActionRequest}
            />
          )}
          {activeView === 'history' && <HistoryView entries={history} />}
        </main>
      </div>
      {pendingRequest && (
        <ConfirmDialog
          product={selectedProduct}
          selectedOptionId={selectedOptionId}
          request={pendingRequest}
          onCancel={() => setPendingRequest(null)}
          onConfirm={handleConfirmAction}
        />
      )}
      {latestResult && (
        <ResultDialog
          action={latestResult.action}
          productName={latestResult.productName}
          optionLabel={latestResult.optionLabel}
          results={latestResult.results}
          onClose={() => setLatestResult(null)}
        />
      )}
    </div>
  );
}

function aggregateResults(
  channelIds: ChannelId[],
  resultGroups: ExecutionResult[][],
): ExecutionResult[] {
  return channelIds.map((channelId) => {
    const channelResults = resultGroups
      .flat()
      .filter((result) => result.channelId === channelId);
    const representative = channelResults[0];
    const failed = channelResults.find((result) => result.status === 'FAILED');
    if (failed) return failed;

    const allSkipped = channelResults.every(
      (result) => result.status === 'SKIPPED',
    );
    if (allSkipped) return representative;

    return {
      ...representative,
      status: 'SUCCESS',
      detail:
        channelResults.length === 1
          ? representative.detail
          : `${channelResults.length}개 옵션 Mock 처리`,
    };
  });
}
