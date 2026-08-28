import type {
  ChannelId,
  ExecutionResult,
  HistoryEntry,
  MockAction,
  ProductOption,
} from '../types';

interface ProductContext {
  productCode: string;
  productName: string;
  scopeLabel?: string;
}

const sabangnetChannelIds = new Set<ChannelId>([
  'ably',
  'zigzag',
  'toss',
  'ns',
  'temu',
  'ezendoo',
]);

export interface MockActionOutcome {
  option: ProductOption;
  results: ExecutionResult[];
  history: HistoryEntry;
}

function successDetail(
  channelId: ChannelId,
  action: MockAction,
): string {
  if (channelId === 'naver') {
    return action === 'SOLD_OUT' ? '재고수량 0' : '재고수량 999';
  }

  if (channelId === 'ohouse') {
    return action === 'SOLD_OUT' ? '재고상태 품절' : '재고상태 판매중';
  }

  if (sabangnetChannelIds.has(channelId)) {
    return `Mock ${action === 'SOLD_OUT' ? '품절' : '판매재개'} · 실제 전파 검증중`;
  }

  throw new Error(`지원되지 않는 Mock 채널: ${channelId}`);
}

export function executeMockAction(
  option: ProductOption,
  action: MockAction,
  targetChannelIds: ChannelId[],
  executedAt: string,
  productContext?: ProductContext,
): MockActionOutcome {
  const nextState = action === 'SOLD_OUT' ? 'SOLD_OUT' : 'ON_SALE';
  const updatedOption: ProductOption = {
    ...option,
    channelStates: { ...option.channelStates },
  };

  const results = targetChannelIds.map<ExecutionResult>((channelId) => {
    const previousState = option.channelStates[channelId];

    if (channelId === 'cafe24') {
      return {
        channelId,
        status: 'SKIPPED',
        previousState,
        nextState: previousState,
        detail: '연동 방식 미확정',
      };
    }

    if (sabangnetChannelIds.has(channelId) && previousState === 'PENDING') {
      return {
        channelId,
        status: 'FAILED',
        previousState,
        nextState: previousState,
        detail: 'Mock 응답 지연',
      };
    }

    updatedOption.channelStates[channelId] = nextState;

    return {
      channelId,
      status: 'SUCCESS',
      previousState,
      nextState,
      detail: successDetail(channelId, action),
    };
  });

  return {
    option: updatedOption,
    results,
    history: {
      id: `${executedAt}-${option.id}-${action}`,
      executedAt,
      employee: 'Mock 사용자',
      productCode: productContext?.productCode ?? option.ecountCode,
      productName: productContext?.productName ?? option.name,
      optionCode: option.ecountCode,
      optionName: option.name,
      action,
      scopeLabel: productContext?.scopeLabel ?? '선택 채널',
      targetChannelIds,
      results,
    },
  };
}
