import type { ChannelState, MockAction, SalesChannel } from '../types';

interface ChannelCardProps {
  channel: SalesChannel;
  state: ChannelState;
  onRequestAction: (action: MockAction) => void;
}

const stateLabels: Record<ChannelState, string> = {
  ON_SALE: '판매중',
  SOLD_OUT: '품절',
  PENDING: '확인 필요',
};

export function ChannelCard({
  channel,
  state,
  onRequestAction,
}: ChannelCardProps) {
  const isCafe24 = channel.id === 'cafe24';

  return (
    <article className="channel-card">
      <div className="channel-card__topline">
        <div>
          <h4>{channel.name}</h4>
          <p>{channel.integrationLabel}</p>
        </div>
        <span className={`state-badge state-badge--${state.toLowerCase()}`}>
          {isCafe24 ? '연동 준비중' : stateLabels[state]}
        </span>
      </div>
      <div className="channel-card__actions">
        <button
          type="button"
          className="button button--soldout button--small"
          onClick={() => onRequestAction('SOLD_OUT')}
          disabled={isCafe24}
        >
          품절
        </button>
        <button
          type="button"
          className="button button--resume button--small"
          onClick={() => onRequestAction('RESUME')}
          disabled={isCafe24}
        >
          판매재개
        </button>
      </div>
    </article>
  );
}
