import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('상품 관리 화면', () => {
  it('상단에 영문 서비스명을 표시하고 기존 아이콘은 사용하지 않는다', () => {
    render(<App />);

    const header = screen.getByRole('banner');
    expect(
      within(header).getByText('Dream Kitchen Channel'),
    ).toBeInTheDocument();
    expect(within(header).queryByText('꿈')).not.toBeInTheDocument();
  });

  it('상품명으로 검색하고 개별 옵션을 선택한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '상품 관리' }));
    await user.type(
      screen.getByRole('searchbox', { name: '상품 검색' }),
      '실리콘',
    );

    const productBrowser = screen.getByRole('complementary');
    expect(
      within(productBrowser).getByText('꼬앙뜨로 실리콘 조리도구 세트'),
    ).toBeInTheDocument();
    expect(
      within(productBrowser).queryByText('파밍스마켓 우드 트레이'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /올리브그린/ }));

    expect(
      screen.getByRole('heading', { name: /올리브그린 판매상태/ }),
    ).toBeInTheDocument();
  });

  it('상품 전체에서 옵션별 상태가 다르면 혼합 상태로 표시한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '상품 관리' }));
    await user.click(screen.getByRole('button', { name: /상품 전체/ }));

    const naverCard = screen
      .getByRole('heading', { name: '네이버 스마트스토어' })
      .closest('article');

    expect(naverCard).not.toBeNull();
    expect(within(naverCard!).getByText('혼합 상태')).toBeInTheDocument();
  });

  it('전체 품절은 확인창을 거쳐야 실행된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '상품 관리' }));
    await user.click(
      screen.getByRole('button', { name: '전체 판매처 품절' }),
    );

    const dialog = screen.getByRole('dialog', { name: 'Mock 실행 확인' });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByText('실제 판매처에는 반영되지 않습니다.'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('카페24는 연동 준비중으로 미실행됩니다.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: '채널별 실행 결과' }),
    ).not.toBeInTheDocument();
  });

  it('확인 후 채널별 결과와 작업 이력을 표시한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '상품 관리' }));
    await user.click(
      screen.getByRole('button', { name: '전체 판매처 품절' }),
    );
    await user.click(screen.getByRole('button', { name: 'Mock 품절 실행' }));

    const resultDialog = screen.getByRole('dialog', {
      name: '채널별 실행 결과',
    });
    expect(resultDialog).toBeInTheDocument();
    expect(
      within(resultDialog).getByText('미실행 · 연동 방식 미확정'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '결과 닫기' }));
    await user.click(screen.getByRole('button', { name: '작업 이력' }));

    expect(screen.getByText('전체 판매처 품절')).toBeInTheDocument();
  });
});
