import type { Product } from '../types';

interface DashboardViewProps {
  products: Product[];
  historyCount: number;
  onOpenProducts: () => void;
}

export function DashboardView({
  products,
  historyCount,
  onOpenProducts,
}: DashboardViewProps) {
  const options = products.flatMap((product) => product.options);
  const soldOutOptions = options.filter(
    (option) => option.channelStates.naver === 'SOLD_OUT',
  ).length;
  const pendingChannels = options.reduce(
    (count, option) =>
      count +
      Object.values(option.channelStates).filter((state) => state === 'PENDING')
        .length,
    0,
  );

  return (
    <section className="view dashboard-view" aria-labelledby="dashboard-title">
      <div className="hero-row">
        <div>
          <p className="eyebrow">Dream Kitchen Channel</p>
          <h1 id="dashboard-title">품절은 한 곳에서, 확인은 채널별로.</h1>
          <p className="hero-copy">
            상품과 옵션을 선택한 뒤 모든 판매처의 Mock 품절·판매재개 흐름을
            안전하게 확인하세요.
          </p>
        </div>
        <button type="button" className="button button--primary" onClick={onOpenProducts}>
          상품 상태 관리하기
        </button>
      </div>

      <div className="metric-grid" aria-label="Mock 운영 요약">
        <article className="metric-card metric-card--dark">
          <span>관리 상품</span>
          <strong>{products.length}</strong>
          <small>이카운트 코드 기준</small>
        </article>
        <article className="metric-card">
          <span>관리 옵션</span>
          <strong>{options.length}</strong>
          <small>옵션코드 개별 관리</small>
        </article>
        <article className="metric-card metric-card--alert">
          <span>네이버 품절 옵션</span>
          <strong>{soldOutOptions}</strong>
          <small>Mock 상태 기준</small>
        </article>
        <article className="metric-card">
          <span>확인 필요</span>
          <strong>{pendingChannels}</strong>
          <small>준비중 채널 포함</small>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel quick-guide">
          <div className="panel__heading">
            <div>
              <p className="eyebrow">빠른 시작</p>
              <h2>세 단계로 확인하세요</h2>
            </div>
          </div>
          <ol>
            <li><span>1</span><div><strong>상품 검색</strong><p>상품명이나 이카운트 코드로 찾습니다.</p></div></li>
            <li><span>2</span><div><strong>옵션과 채널 선택</strong><p>전체 옵션 또는 특정 옵션을 고릅니다.</p></div></li>
            <li><span>3</span><div><strong>확인 후 Mock 실행</strong><p>대상 채널을 다시 확인하고 실행합니다.</p></div></li>
          </ol>
        </article>
        <article className="panel activity-summary">
          <p className="eyebrow">현재 세션</p>
          <h2>Mock 작업 {historyCount}건</h2>
          <p>브라우저를 새로고침하면 이번 세션에서 실행한 작업은 초기화됩니다.</p>
          <div className="mock-rule-list">
            <span><b>네이버</b> 품절 0 · 판매재개 999</span>
            <span><b>오늘의집</b> 재고상태 판매중 · 품절</span>
            <span><b>카페24</b> 연동 방식 미확정</span>
          </div>
        </article>
      </div>
    </section>
  );
}
