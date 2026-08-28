export type ChannelState = 'ON_SALE' | 'SOLD_OUT' | 'PENDING';

export type ChannelId =
  | 'ably'
  | 'zigzag'
  | 'toss'
  | 'ns'
  | 'temu'
  | 'ezendoo'
  | 'naver'
  | 'ohouse'
  | 'cafe24';

export type ChannelGroup = 'sabangnet' | 'direct';

export interface SalesChannel {
  id: ChannelId;
  name: string;
  group: ChannelGroup;
  integrationLabel: string;
}

export interface ProductOption {
  id: string;
  name: string;
  ecountCode: string;
  channelStates: Record<ChannelId, ChannelState>;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  ecountCode: string;
  options: ProductOption[];
}

export type MockAction = 'SOLD_OUT' | 'RESUME';
export type ExecutionStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED';

export interface ExecutionResult {
  channelId: ChannelId;
  status: ExecutionStatus;
  previousState: ChannelState;
  nextState: ChannelState;
  detail: string;
}

export interface HistoryEntry {
  id: string;
  executedAt: string;
  employee: string;
  productCode: string;
  productName: string;
  optionCode: string;
  optionName: string;
  action: MockAction;
  scopeLabel: string;
  targetChannelIds: ChannelId[];
  results: ExecutionResult[];
}
