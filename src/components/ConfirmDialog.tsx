import { salesChannels } from '../mock-data';
import type { Product } from '../types';
import type { ActionRequest, OptionSelection } from './ProductView';

interface ConfirmDialogProps {
  product: Product;
  selectedOptionId: OptionSelection;
  request: ActionRequest;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  product,
  selectedOptionId,
  request,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const option = product.options.find((item) => item.id === selectedOptionId);
  const optionLabel = selectedOptionId === 'ALL' ? '전체 옵션' : option?.name;
  const targetChannels = salesChannels.filter((channel) =>
    request.targetChannelIds.includes(channel.id),
  );
  const actionLabel = request.action === 'SOLD_OUT' ? '품절' : '판매재개';
  const includesCafe24 = request.targetChannelIds.includes('cafe24');

  return (
    <div className="dialog-backdrop">
      <section
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-label="Mock 실행 확인"
      >
        <div className="dialog-card__icon" aria-hidden="true">!</div>
        <p className="eyebrow">실행 전 마지막 확인</p>
        <h2>{request.scopeLabel} {actionLabel}을 Mock 실행할까요?</h2>
        <p className="dialog-card__warning">
          실제 판매처에는 반영되지 않습니다.
        </p>

        <dl className="confirmation-list">
          <div><dt>상품</dt><dd>{product.name}</dd></div>
          <div><dt>이카운트 코드</dt><dd>{product.ecountCode}</dd></div>
          <div><dt>옵션</dt><dd>{optionLabel}</dd></div>
          <div><dt>실행 명령</dt><dd>{request.scopeLabel} {actionLabel}</dd></div>
        </dl>

        <div className="target-list">
          <strong>대상 판매채널 {targetChannels.length}개</strong>
          <div>
            {targetChannels.map((channel) => (
              <span key={channel.id}>{channel.name}</span>
            ))}
          </div>
        </div>

        {includesCafe24 && (
          <p className="pending-notice">
            카페24는 연동 준비중으로 미실행됩니다.
          </p>
        )}

        <div className="dialog-actions">
          <button type="button" className="button button--ghost" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className={`button ${request.action === 'SOLD_OUT' ? 'button--soldout' : 'button--resume'}`}
            onClick={onConfirm}
          >
            Mock {actionLabel} 실행
          </button>
        </div>
      </section>
    </div>
  );
}
