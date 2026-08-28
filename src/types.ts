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
