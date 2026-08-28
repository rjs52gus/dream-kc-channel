import { salesChannels } from '../mock-data';
import type { ExecutionResult, MockAction } from '../types';

interface ResultDialogProps {
  action: MockAction;
  productName: string;
  optionLabel: string;
  results: ExecutionResult[];
  onClose: () => void;
}

const channelNames = new Map(
  salesChannels.map((channel) => [channel.id, channel.name]),
);

const resultLabels = {
  SUCCESS: '성공',
  FAILED: '실패',
  SKIPPED: '미실행',
} as const;

export function ResultDialog({
  action,
  productName,
  optionLabel,
  results,
  onClose,
}: ResultDialogProps) {
  const successCount = results.filter((result) => result.status === 'SUCCESS').length;
  const failedCount = results.filter((result) => result.status === 'FAILED').length;
  const skippedCount = results.filter((result) => result.status === 'SKIPPED').length;

  return (
    <div className="dialog-backdrop">
      <section
        className="dialog-card dialog-card--wide"
        role="dialog"
        aria-modal="true"
        aria-label="채널별 실행 결과"
      >
        <div className="result-summary">
          <div className="dialog-card__icon dialog-card__icon--success" aria-hidden="true">✓</div>
          <div>
            <p className="eyebrow">Mock 실행 완료</p>
            <h2>{productName} · {optionLabel}</h2>
            <p>{action === 'SOLD_OUT' ? '품절' : '판매재개'} 결과를 채널별로 확인하세요.</p>
          </div>
        </div>

        <div className="result-counts" aria-label="실행 결과 요약">
          <span><b>{successCount}</b> 성공</span>
          <span><b>{failedCount}</b> 실패</span>
          <span><b>{skippedCount}</b> 미실행</span>
        </div>

        <div className="result-list">
          {results.map((result) => (
            <div className="result-row" key={result.channelId}>
              <div>
                <strong>{channelNames.get(result.channelId)}</strong>
                <span>{resultLabels[result.status]} · {result.detail}</span>
              </div>
              <span className={`result-chip result-chip--${result.status.toLowerCase()}`}>
                {resultLabels[result.status]}
              </span>
            </div>
          ))}
        </div>

        <p className="dialog-card__warning">
          Mock 실행 · 실제 판매처에는 반영되지 않음
        </p>
        <div className="dialog-actions dialog-actions--single">
          <button type="button" className="button button--primary" onClick={onClose}>
            결과 닫기
          </button>
        </div>
      </section>
    </div>
  );
}
