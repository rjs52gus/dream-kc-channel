import { describe, expect, it } from 'vitest';
import { mockProducts } from '../mock-data';
import type { ProductOption } from '../types';
import { executeMockAction } from './operations';

function createOption(): ProductOption {
  const option = mockProducts[0].options[0];
  return {
    ...option,
    channelStates: { ...option.channelStates },
  };
}

describe('executeMockAction confirmed channel rules', () => {
  it('네이버 품절은 재고수량 0으로 설명한다', () => {
    const outcome = executeMockAction(
      createOption(),
      'SOLD_OUT',
      ['naver'],
      '2026-08-28T09:00:00+09:00',
    );

    expect(outcome.results[0]).toMatchObject({
      channelId: 'naver',
      status: 'SUCCESS',
      nextState: 'SOLD_OUT',
      detail: '재고수량 0',
    });
  });

  it('네이버 판매재개는 재고수량 999로 설명한다', () => {
    const outcome = executeMockAction(
      createOption(),
      'RESUME',
      ['naver'],
      '2026-08-28T09:00:00+09:00',
    );

    expect(outcome.results[0].detail).toBe('재고수량 999');
  });

  it('오늘의집은 재고상태만 변경한다', () => {
    const outcome = executeMockAction(
      createOption(),
      'SOLD_OUT',
      ['ohouse'],
      '2026-08-28T09:00:00+09:00',
    );

    expect(outcome.results[0].detail).toBe('재고상태 품절');
  });
});

describe('executeMockAction unconfirmed channel safeguards', () => {
  it('카페24는 실행하지 않고 준비중 사유를 반환한다', () => {
    const outcome = executeMockAction(
      createOption(),
      'SOLD_OUT',
      ['cafe24'],
      '2026-08-28T09:00:00+09:00',
    );

    expect(outcome.results[0]).toMatchObject({
      channelId: 'cafe24',
      status: 'SKIPPED',
      detail: '연동 방식 미확정',
    });
  });

  it('사방넷 채널은 Mock 성공과 검증중 안내를 함께 반환한다', () => {
    const outcome = executeMockAction(
      createOption(),
      'RESUME',
      ['ably'],
      '2026-08-28T09:00:00+09:00',
    );

    expect(outcome.results[0]).toMatchObject({
      channelId: 'ably',
      status: 'SUCCESS',
      detail: 'Mock 판매재개 · 실제 전파 검증중',
    });
  });

  it('성공한 채널만 옵션 상태를 변경한다', () => {
    const outcome = executeMockAction(
      createOption(),
      'SOLD_OUT',
      ['naver', 'cafe24'],
      '2026-08-28T09:00:00+09:00',
    );

    expect(outcome.option.channelStates.naver).toBe('SOLD_OUT');
    expect(outcome.option.channelStates.cafe24).toBe('PENDING');
  });

  it('확인 필요 상태의 채널 실패를 전체 성공으로 숨기지 않는다', () => {
    const option = createOption();
    const delayedOption: ProductOption = {
      ...option,
      channelStates: { ...option.channelStates, toss: 'PENDING' },
    };

    const outcome = executeMockAction(
      delayedOption,
      'SOLD_OUT',
      ['naver', 'toss'],
      '2026-08-28T09:00:00+09:00',
    );

    expect(outcome.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ channelId: 'naver', status: 'SUCCESS' }),
        expect.objectContaining({
          channelId: 'toss',
          status: 'FAILED',
          detail: 'Mock 응답 지연',
        }),
      ]),
    );
  });
});
