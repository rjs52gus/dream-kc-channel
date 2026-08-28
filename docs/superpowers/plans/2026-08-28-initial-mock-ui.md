# 꿈꾸는 키친 통합 판매채널 관리 초기 Mock UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 직원이 상품과 옵션을 검색하고 채널별·그룹별·전체 품절 또는 판매재개를 안전하게 Mock 실행한 뒤 결과와 작업 이력을 확인할 수 있는 Netlify 배포형 웹앱을 만든다.

**Architecture:** Vite 기반 React 단일 페이지 앱으로 구성한다. 상품 데이터와 채널 실행 규칙을 화면 컴포넌트 밖의 순수 TypeScript 모듈에 두어 테스트 가능하게 만들고, 화면 상태는 React 메모리에서만 유지한다. Netlify Vite 플러그인과 `netlify.toml`로 정적 배포를 구성한다.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, CSS, Netlify Vite plugin

**Spec:** `docs/superpowers/specs/2026-08-28-initial-mock-ui-design.md`

## Global Constraints

- 실제 이카운트·네이버·오늘의집·카페24·사방넷 API를 호출하지 않는다.
- 모든 실행 화면에 `Mock 실행 · 실제 판매처에는 반영되지 않음`을 명시한다.
- 네이버는 품절 0, 판매재개 999 규칙만 표현한다.
- 오늘의집은 재고상태 `품절`과 `판매중`만 표현한다.
- 카페24는 `연동 준비중`이며 실행 결과를 `SKIPPED`로 처리한다.
- 사방넷 연결 채널의 실제 전파가 완료된 것처럼 표현하지 않는다.
- 로그인, DB, API 키, 자동 품절 조건을 추가하지 않는다.
- 브라우저 새로고침 시 초기 Mock 데이터로 돌아간다.
- Netlify 정적 배포 빌드가 성공해야 한다.

---

### Task 1: 프로젝트 기반과 상품 검색 규칙

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/test/setup.ts`
- Create: `src/types.ts`
- Create: `src/mock-data.ts`
- Create: `src/domain/catalog.test.ts`
- Create: `src/domain/catalog.ts`

**Interfaces:**
- Produces: `Product`, `ProductOption`, `ChannelState`, `SalesChannel` 타입
- Produces: `mockProducts: Product[]`
- Produces: `searchProducts(products: Product[], query: string): Product[]`

- [ ] **Step 1: 프로젝트 구성 파일을 생성하고 의존성을 설치한다**

`package.json`은 다음 스크립트를 제공한다.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  }
}
```

React, React DOM, `@netlify/vite-plugin`을 운영 의존성으로 설치하고 Vite, TypeScript, Vitest, jsdom, Testing Library, React Vite 플러그인과 타입 패키지를 개발 의존성으로 설치한다. `vite.config.ts`의 플러그인은 `react()`와 `netlify()`를 사용하고 테스트 환경을 `jsdom`, 설정 파일을 `src/test/setup.ts`로 지정한다.

- [ ] **Step 2: 상품 검색의 실패 테스트를 작성한다**

`src/domain/catalog.test.ts`에 다음 독립 동작을 작성한다.

```ts
import { describe, expect, it } from 'vitest';
import { searchProducts } from './catalog';
import { mockProducts } from '../mock-data';

describe('searchProducts', () => {
  it('상품명 일부로 검색한다', () => {
    expect(searchProducts(mockProducts, '실리콘').map((item) => item.ecountCode))
      .toEqual(['DK-SIL-001']);
  });

  it('이카운트 상품코드의 대소문자와 공백을 무시한다', () => {
    expect(searchProducts(mockProducts, '  dk-wood-002 ').map((item) => item.ecountCode))
      .toEqual(['DK-WOOD-002']);
  });

  it('옵션코드로 해당 상품을 찾는다', () => {
    expect(searchProducts(mockProducts, 'DK-SIL-001-OL').map((item) => item.ecountCode))
      .toEqual(['DK-SIL-001']);
  });

  it('빈 검색어에는 전체 상품을 반환한다', () => {
    expect(searchProducts(mockProducts, '')).toHaveLength(mockProducts.length);
  });
});
```

- [ ] **Step 3: 검색 테스트가 예상대로 실패하는지 확인한다**

Run: `pnpm test -- src/domain/catalog.test.ts`

Expected: `searchProducts` 또는 관련 모듈이 존재하지 않아 FAIL.

- [ ] **Step 4: 상품 타입, Mock 상품과 최소 검색 구현을 작성한다**

`Product`는 `id`, `brand`, `name`, `ecountCode`, `options`를 포함하고, 옵션은 `id`, `name`, `ecountCode`, `channelStates`를 포함한다. Mock 상품은 다음 세 품목을 사용한다.

- 꼬앙뜨로 실리콘 조리도구 세트 / `DK-SIL-001`
- 파밍스마켓 우드 트레이 / `DK-WOOD-002`
- 꿈꾸는 키친 내열 유리 저장용기 / `DK-GLASS-003`

`searchProducts`는 검색어를 `trim().toLocaleLowerCase('ko-KR')`로 정규화하고 상품명, 브랜드, 상품코드, 옵션명, 옵션코드 중 하나가 포함되면 상품을 반환한다.

- [ ] **Step 5: 검색 테스트 전체가 통과하는지 확인한다**

Run: `pnpm test -- src/domain/catalog.test.ts`

Expected: 4 tests PASS.

- [ ] **Step 6: 기반 작업을 커밋한다**

```bash
git add package.json pnpm-lock.yaml tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src/test/setup.ts src/types.ts src/mock-data.ts src/domain/catalog.ts src/domain/catalog.test.ts
git commit -m "feat: add product catalog foundation"
```

---

### Task 2: Mock 품절·판매재개 실행 규칙

**Files:**
- Modify: `src/types.ts`
- Create: `src/domain/operations.test.ts`
- Create: `src/domain/operations.ts`

**Interfaces:**
- Consumes: `SalesChannel`, `ChannelState`, `ProductOption`
- Produces: `MockAction = 'SOLD_OUT' | 'RESUME'`
- Produces: `ExecutionResult`와 `HistoryEntry`
- Produces: `executeMockAction(option, action, targetChannels, executedAt): { option, results, history }`

- [ ] **Step 1: 네이버와 오늘의집 규칙의 실패 테스트를 작성한다**

```ts
it('네이버 품절은 재고수량 0으로 설명한다', () => {
  const outcome = executeMockAction(option, 'SOLD_OUT', ['naver'], '2026-08-28T09:00:00+09:00');
  expect(outcome.results[0]).toMatchObject({
    channelId: 'naver',
    status: 'SUCCESS',
    nextState: 'SOLD_OUT',
    detail: '재고수량 0',
  });
});

it('네이버 판매재개는 재고수량 999로 설명한다', () => {
  const outcome = executeMockAction(option, 'RESUME', ['naver'], '2026-08-28T09:00:00+09:00');
  expect(outcome.results[0].detail).toBe('재고수량 999');
});

it('오늘의집은 재고상태만 변경한다', () => {
  const outcome = executeMockAction(option, 'SOLD_OUT', ['ohouse'], '2026-08-28T09:00:00+09:00');
  expect(outcome.results[0].detail).toBe('재고상태 품절');
});
```

- [ ] **Step 2: 테스트가 실행 함수 부재로 실패하는지 확인한다**

Run: `pnpm test -- src/domain/operations.test.ts`

Expected: `executeMockAction` 부재로 FAIL.

- [ ] **Step 3: 확정된 두 채널의 최소 실행 규칙을 구현한다**

네이버와 오늘의집의 `nextState`를 품절은 `SOLD_OUT`, 판매재개는 `ON_SALE`로 설정한다. `detail`은 네이버 `재고수량 0/999`, 오늘의집 `재고상태 품절/판매중`을 사용한다.

- [ ] **Step 4: 네이버와 오늘의집 테스트가 통과하는지 확인한다**

Run: `pnpm test -- src/domain/operations.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 5: 카페24와 사방넷 그룹 규칙의 실패 테스트를 추가한다**

```ts
it('카페24는 실행하지 않고 준비중 사유를 반환한다', () => {
  const outcome = executeMockAction(option, 'SOLD_OUT', ['cafe24'], '2026-08-28T09:00:00+09:00');
  expect(outcome.results[0]).toMatchObject({
    channelId: 'cafe24',
    status: 'SKIPPED',
    detail: '연동 방식 미확정',
  });
});

it('사방넷 채널은 Mock 성공과 검증중 안내를 함께 반환한다', () => {
  const outcome = executeMockAction(option, 'RESUME', ['ably'], '2026-08-28T09:00:00+09:00');
  expect(outcome.results[0]).toMatchObject({
    channelId: 'ably',
    status: 'SUCCESS',
    detail: 'Mock 판매재개 · 실제 전파 검증중',
  });
});

it('성공한 채널만 옵션 상태를 변경한다', () => {
  const outcome = executeMockAction(option, 'SOLD_OUT', ['naver', 'cafe24'], '2026-08-28T09:00:00+09:00');
  expect(outcome.option.channelStates.naver).toBe('SOLD_OUT');
  expect(outcome.option.channelStates.cafe24).toBe('PENDING');
});

it('확인 필요 상태의 채널 실패를 전체 성공으로 숨기지 않는다', () => {
  const delayedOption = {
    ...option,
    channelStates: { ...option.channelStates, toss: 'PENDING' as const },
  };
  const outcome = executeMockAction(delayedOption, 'SOLD_OUT', ['naver', 'toss'], '2026-08-28T09:00:00+09:00');
  expect(outcome.results).toEqual(expect.arrayContaining([
    expect.objectContaining({ channelId: 'naver', status: 'SUCCESS' }),
    expect.objectContaining({ channelId: 'toss', status: 'FAILED', detail: 'Mock 응답 지연' }),
  ]));
});
```

- [ ] **Step 6: 새 테스트가 규칙 미구현으로 실패하는지 확인한다**

Run: `pnpm test -- src/domain/operations.test.ts`

Expected: 카페24 또는 사방넷 분기가 기대값과 달라 FAIL.

- [ ] **Step 7: 카페24 제외와 사방넷 Mock 규칙을 구현한다**

카페24는 상태를 변경하지 않는다. `PENDING` 상태인 사방넷 채널은 `FAILED · Mock 응답 지연`으로 남기고, 정상 상태인 사방넷 채널은 화면 상태만 변경하며 `실제 전파 검증중` 문구를 포함한다. 한 번의 실행마다 대상 채널별 `ExecutionResult`와 하나의 `HistoryEntry`를 반환한다.

- [ ] **Step 8: 실행 규칙 테스트 전체가 통과하는지 확인한다**

Run: `pnpm test -- src/domain/operations.test.ts`

Expected: 모든 operations tests PASS.

- [ ] **Step 9: 실행 규칙을 커밋한다**

```bash
git add src/types.ts src/domain/operations.ts src/domain/operations.test.ts
git commit -m "feat: add mock channel operation rules"
```

---

### Task 3: 직원용 대시보드와 안전 확인 흐름

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.test.tsx`
- Create: `src/App.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/DashboardView.tsx`
- Create: `src/components/ProductView.tsx`
- Create: `src/components/ChannelCard.tsx`
- Create: `src/components/ConfirmDialog.tsx`
- Create: `src/components/ResultDialog.tsx`
- Create: `src/components/HistoryView.tsx`

**Interfaces:**
- Consumes: `mockProducts`, `searchProducts`, `executeMockAction`
- Produces: 대시보드·상품 관리·작업 이력 화면과 Mock 실행 상호작용

- [ ] **Step 1: 상품 검색과 옵션 선택의 실패 테스트를 작성한다**

```tsx
it('상품명으로 검색하고 개별 옵션을 선택한다', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '상품 관리' }));
  await user.type(screen.getByRole('searchbox', { name: '상품 검색' }), '실리콘');
  expect(screen.getByText('꼬앙뜨로 실리콘 조리도구 세트')).toBeInTheDocument();
  expect(screen.queryByText('파밍스마켓 우드 트레이')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /올리브그린/ }));
  expect(screen.getByRole('heading', { name: /올리브그린 판매상태/ })).toBeInTheDocument();
});
```

- [ ] **Step 2: UI가 없어 테스트가 실패하는지 확인한다**

Run: `pnpm test -- src/App.test.tsx`

Expected: 메뉴 또는 검색 화면이 없어 FAIL.

- [ ] **Step 3: 메뉴, 대시보드, 검색과 상품 상세의 최소 UI를 구현한다**

상단에는 `꿈꾸는 키친 · 통합 판매채널 관리`와 `Mock 모드` 배지를 표시한다. 좌측 메뉴는 대시보드, 상품 관리, 작업 이력 세 가지이며 모바일에서는 상단 탭으로 이동한다. 상품 관리 화면은 검색 결과, 옵션 선택, 사방넷 채널 그룹, 직접 관리 채널과 전체 실행 영역을 표시한다.

- [ ] **Step 4: 상품 검색과 옵션 선택 테스트를 통과시킨다**

Run: `pnpm test -- src/App.test.tsx`

Expected: 상품 검색 테스트 PASS.

- [ ] **Step 5: 확인창 안전장치의 실패 테스트를 추가한다**

```tsx
it('전체 품절은 확인창을 거쳐야 실행된다', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '상품 관리' }));
  await user.click(screen.getByRole('button', { name: '전체 판매처 품절' }));
  expect(screen.getByRole('dialog', { name: 'Mock 실행 확인' })).toBeInTheDocument();
  expect(screen.getByText('실제 판매처에는 반영되지 않습니다.')).toBeInTheDocument();
  expect(screen.getByText('카페24는 연동 준비중으로 미실행됩니다.')).toBeInTheDocument();
  expect(screen.queryByRole('dialog', { name: '채널별 실행 결과' })).not.toBeInTheDocument();
});

it('확인 후 채널별 결과와 작업 이력을 표시한다', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '상품 관리' }));
  await user.click(screen.getByRole('button', { name: '전체 판매처 품절' }));
  await user.click(screen.getByRole('button', { name: 'Mock 품절 실행' }));
  expect(screen.getByRole('dialog', { name: '채널별 실행 결과' })).toBeInTheDocument();
  expect(screen.getByText('미실행 · 연동 방식 미확정')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '결과 닫기' }));
  await user.click(screen.getByRole('button', { name: '작업 이력' }));
  expect(screen.getByText('전체 판매처 품절')).toBeInTheDocument();
});
```

- [ ] **Step 6: 확인창·결과·이력 테스트가 기능 부재로 실패하는지 확인한다**

Run: `pnpm test -- src/App.test.tsx`

Expected: 확인창 또는 실행 결과 요소가 없어 FAIL.

- [ ] **Step 7: 확인창, 실행 결과와 현재 세션 작업 이력을 구현한다**

`ConfirmDialog`는 상품, 옵션, 명령, 대상 채널과 Mock 경고를 보여준다. 실행 시 `executeMockAction`을 호출하고 성공한 채널의 상태만 현재 상품 데이터에 반영한다. `ResultDialog`는 채널별 `SUCCESS`, `FAILED`, `SKIPPED`를 따로 표시한다. `HistoryView`는 초기 Mock 이력과 현재 세션에서 생성된 이력을 최신순으로 표시한다.

- [ ] **Step 8: 화면 상호작용 테스트 전체를 통과시킨다**

Run: `pnpm test -- src/App.test.tsx`

Expected: 모든 App tests PASS.

- [ ] **Step 9: UI 기능을 커밋한다**

```bash
git add src/main.tsx src/App.tsx src/App.test.tsx src/components
git commit -m "feat: build mock inventory workflow UI"
```

---

### Task 4: 반응형 디자인과 Netlify 배포 구성

**Files:**
- Create: `src/app.css`
- Create: `netlify.toml`
- Create: `.gitignore`
- Create: `README.md`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: Task 3의 화면 구조와 접근 가능한 역할·이름
- Produces: PC·모바일 반응형 스타일과 Netlify 정적 배포 설정

- [ ] **Step 1: 완성 화면의 스타일을 작성한다**

밝은 웜그레이 배경, 짙은 녹색 텍스트와 연두색 포인트를 사용한다. 판매중, 품절, 준비중 상태는 색상과 텍스트를 함께 표시한다. 데스크톱은 좌측 메뉴와 넓은 업무 패널, 900px 이하는 상단 탭과 카드형 채널 목록을 사용한다. 버튼에는 hover, focus-visible, disabled 상태를 제공하고 모달은 키보드 포커스가 보이도록 한다.

- [ ] **Step 2: Netlify 설정과 운영 설명을 작성한다**

`netlify.toml`:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

`README.md`는 Mock 범위, 로컬 실행, 테스트, 빌드, Netlify 배포 설정, 실제 API 미연동 주의를 설명한다. 비밀값을 저장하지 않는다.

- [ ] **Step 3: 자동 테스트 전체를 실행한다**

Run: `pnpm test`

Expected: catalog, operations, App tests 모두 PASS이며 경고나 오류가 없다.

- [ ] **Step 4: TypeScript와 Netlify용 빌드를 검증한다**

Run: `pnpm build`

Expected: TypeScript 오류 없이 `dist`가 생성되고 Vite build가 성공한다.

- [ ] **Step 5: 로컬 화면 응답을 확인한다**

Run: `pnpm dev --host 127.0.0.1`

Expected: Vite가 출력한 로컬 주소가 HTTP 200을 반환하고 초기 화면에 `꿈꾸는 키친` 제목이 표시된다.

- [ ] **Step 6: 배포 준비 작업을 커밋하고 GitHub에 반영한다**

```bash
git add src/app.css src/main.tsx netlify.toml .gitignore README.md
git commit -m "feat: prepare responsive Netlify release"
git push origin main
```

- [ ] **Step 7: Netlify 연결 상태를 확인하고 배포한다**

Run: `pnpm dlx netlify-cli status`

로그인되어 있으면 다음 순서로 Git 원격 주소를 연결하고 배포한다.

```bash
pnpm dlx netlify-cli link --git-remote-url https://github.com/rjs52gus/dream-kitchen-channel-manager.git
pnpm dlx netlify-cli deploy --build
pnpm dlx netlify-cli deploy --build --prod
```

Git 원격 주소로 연결할 기존 사이트가 없는 경우 다음 명령으로 `dream-kitchen-channel-manager` 사이트를 먼저 만든 뒤 같은 배포 명령을 실행한다.

```bash
pnpm dlx netlify-cli sites:create --name dream-kitchen-channel-manager
```

미리보기 주소에서 빌드 결과를 확인한 후에만 초기 운영 버전을 배포한다. Netlify 로그에 실제 API나 비밀값이 포함되지 않아야 한다.
