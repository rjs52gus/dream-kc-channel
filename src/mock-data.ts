import type {
  ChannelId,
  ChannelState,
  Product,
  SalesChannel,
} from './types';

export const salesChannels: SalesChannel[] = [
  { id: 'ably', name: '에이블리', group: 'sabangnet', integrationLabel: '사방넷 전파 검증중' },
  { id: 'zigzag', name: '지그재그', group: 'sabangnet', integrationLabel: '사방넷 전파 검증중' },
  { id: 'toss', name: '토스쇼핑', group: 'sabangnet', integrationLabel: '사방넷 전파 검증중' },
  { id: 'ns', name: 'NS홈쇼핑', group: 'sabangnet', integrationLabel: '사방넷 전파 검증중' },
  { id: 'temu', name: '테무', group: 'sabangnet', integrationLabel: '사방넷 전파 검증중' },
  { id: 'ezendoo', name: 'e-제너두', group: 'sabangnet', integrationLabel: '사방넷 전파 검증중' },
  { id: 'naver', name: '네이버 스마트스토어', group: 'direct', integrationLabel: 'Mock 규칙 확인됨' },
  { id: 'ohouse', name: '오늘의집', group: 'direct', integrationLabel: 'Mock 규칙 확인됨' },
  { id: 'cafe24', name: '카페24', group: 'direct', integrationLabel: '연동 준비중' },
];

function channelStates(
  overrides: Partial<Record<ChannelId, ChannelState>> = {},
): Record<ChannelId, ChannelState> {
  return {
    ably: 'ON_SALE',
    zigzag: 'ON_SALE',
    toss: 'ON_SALE',
    ns: 'ON_SALE',
    temu: 'ON_SALE',
    ezendoo: 'ON_SALE',
    naver: 'ON_SALE',
    ohouse: 'ON_SALE',
    cafe24: 'PENDING',
    ...overrides,
  };
}

export const mockProducts: Product[] = [
  {
    id: 'silicone-tools',
    brand: '꼬앙뜨로',
    name: '꼬앙뜨로 실리콘 조리도구 세트',
    ecountCode: 'DK-SIL-001',
    options: [
      {
        id: 'silicone-olive',
        name: '올리브그린',
        ecountCode: 'DK-SIL-001-OL',
        channelStates: channelStates(),
      },
      {
        id: 'silicone-custard',
        name: '카스타드',
        ecountCode: 'DK-SIL-001-CU',
        channelStates: channelStates({ naver: 'SOLD_OUT' }),
      },
      {
        id: 'silicone-pink',
        name: '베이비핑크',
        ecountCode: 'DK-SIL-001-BP',
        channelStates: channelStates(),
      },
    ],
  },
  {
    id: 'wood-tray',
    brand: '파밍스마켓',
    name: '파밍스마켓 우드 트레이',
    ecountCode: 'DK-WOOD-002',
    options: [
      {
        id: 'wood-medium',
        name: '미디엄',
        ecountCode: 'DK-WOOD-002-M',
        channelStates: channelStates(),
      },
      {
        id: 'wood-large',
        name: '라지',
        ecountCode: 'DK-WOOD-002-L',
        channelStates: channelStates({ toss: 'PENDING' }),
      },
    ],
  },
  {
    id: 'glass-container',
    brand: '꿈꾸는 키친',
    name: '꿈꾸는 키친 내열 유리 저장용기',
    ecountCode: 'DK-GLASS-003',
    options: [
      {
        id: 'glass-640',
        name: '640ml',
        ecountCode: 'DK-GLASS-003-640',
        channelStates: channelStates(),
      },
      {
        id: 'glass-1040',
        name: '1040ml',
        ecountCode: 'DK-GLASS-003-1040',
        channelStates: channelStates({
          ably: 'SOLD_OUT',
          zigzag: 'SOLD_OUT',
          naver: 'SOLD_OUT',
          ohouse: 'SOLD_OUT',
        }),
      },
    ],
  },
];
