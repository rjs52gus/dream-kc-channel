export type AppView = 'dashboard' | 'products' | 'history';

interface SidebarProps {
  activeView: AppView;
  onChange: (view: AppView) => void;
}

const navigation: Array<{ id: AppView; label: string; note: string }> = [
  { id: 'dashboard', label: '대시보드', note: '오늘의 운영 현황' },
  { id: 'products', label: '상품 관리', note: '검색·품절·판매재개' },
  { id: 'history', label: '작업 이력', note: '채널별 실행 결과' },
];

export function Sidebar({ activeView, onChange }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="주요 메뉴">
      <p className="sidebar__label">업무 메뉴</p>
      <div className="sidebar__items">
        {navigation.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`sidebar__item ${activeView === item.id ? 'is-active' : ''}`}
            aria-label={item.label}
            aria-current={activeView === item.id ? 'page' : undefined}
            onClick={() => onChange(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.note}</small>
          </button>
        ))}
      </div>
      <div className="sidebar__notice">
        <strong>Mock 운영 중</strong>
        <span>실제 판매처에는 반영되지 않습니다.</span>
      </div>
    </nav>
  );
}
