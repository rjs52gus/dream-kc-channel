import { salesChannels } from '../mock-data';
import type { HistoryEntry } from '../types';

interface HistoryViewProps {
  entries: HistoryEntry[];
}

const channelNames = new Map(
  salesChannels.map((channel) => [channel.id, channel.name]),
);

export function HistoryView({ entries }: HistoryViewProps) {
  return (
    <section className="view history-view" aria-labelledby="history-title">
      <div className="view-heading">
        <div>
          <p className="eyebrow">현재 브라우저 세션</p>
          <h1 id="history-title">작업 이력</h1>
          <p>실행 직원, 상품, 옵션과 채널별 결과를 확인합니다.</p>
        </div>
        <span className="mock-banner">새로고침 시 초기화</span>
      </div>
      <div className="history-list">
        {entries.length === 0 ? (
          <div className="panel empty-history">
            <strong>아직 실행한 Mock 작업이 없습니다.</strong>
            <p>상품 관리에서 품절 또는 판매재개를 실행하면 여기에 표시됩니다.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <article className="panel history-card" key={entry.id}>
              <div className="history-card__heading">
                <div>
                  <span>{new Date(entry.executedAt).toLocaleString('ko-KR')}</span>
                  <h2>{entry.productName}</h2>
                  <p>{entry.productCode} · {entry.optionName}</p>
                </div>
                <strong>{entry.scopeLabel} {entry.action === 'SOLD_OUT' ? '품절' : '판매재개'}</strong>
              </div>
              <div className="history-results">
                {entry.results.map((result) => (
                  <span key={result.channelId} className={`result-chip result-chip--${result.status.toLowerCase()}`}>
                    {channelNames.get(result.channelId)} · {result.status === 'SUCCESS' ? '성공' : result.status === 'FAILED' ? '실패' : '미실행'}
                  </span>
                ))}
              </div>
              <small>실행 직원: {entry.employee}</small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
