import React, { useState } from 'react';

interface ProgressItem {
  id: string;
  name: string;
  status: 'unchecked' | 'checking' | 'checked' | 'confirmed';
}

interface ProgressSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ProgressItem[];
}

const ProgressManagement: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    section1: true,
    section2: true,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
      unchecked: { label: '未点検', bg: '#9CA3AF', text: 'white' },
      checking: { label: '点検中', bg: '#3B82F6', text: 'white' },
      checked: { label: '点検済み', bg: '#FCD34D', text: 'black' },
      confirmed: { label: '確認完了', bg: '#10B981', text: 'white' },
    };
    const config = statusMap[status] || statusMap.unchecked;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.text,
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          display: 'inline-block',
        }}
      >
        {config.label}
      </span>
    );
  };

  const sections: ProgressSection[] = [
    {
      id: 'section1',
      title: '金属/X線探知機記録',
      icon: '🏢',
      items: [
        { id: '1-1', name: 'XXXXXXX', status: 'unchecked' },
        { id: '1-2', name: 'XXXXXXX', status: 'checking' },
        { id: '1-3', name: 'XXXXXXX', status: 'checked' },
        { id: '1-4', name: 'XXXXXXX', status: 'confirmed' },
      ],
    },
    {
      id: 'section2',
      title: '検体管理',
      icon: '🧬',
      items: [
        { id: '2-1', name: '仕出しした巻き玉子 冷凍', status: 'unchecked' },
        { id: '2-2', name: '厚焼き玉子（本） 500g', status: 'checked' },
        { id: '2-3', name: '製品名○○○○○○○', status: 'confirmed' },
        { id: '2-4', name: '製品名○○○○○○○', status: 'confirmed' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '80px',
          backgroundColor: '#059669',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          📦
        </div>

        {/* Navigation Items */}
        {[
          { icon: '☰', label: '進捗' },
          { icon: '✔️', label: '確認待ち', badge: true },
          { icon: '📅', label: '点検予定' },
          { icon: '🔤', label: 'サイズ' },
          { icon: '❓', label: 'ヘルプ' },
          { icon: '⚙️', label: '設定' },
        ].map((item, idx) => (
          <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              {item.icon}
            </div>
            {item.badge && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                00
              </div>
            )}
            <div style={{ fontSize: '11px', color: 'white', marginTop: '4px', textAlign: 'center' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px' }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: '#10B981',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        >
          📦
          <span>進捗一覧</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            style={{
              padding: '12px 20px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            すべて
          </button>
          <button
            style={{
              padding: '12px 20px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            未点検
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="絞り込み検索"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#F9FAFB',
            }}
          />
        </div>

        {/* Date Section */}
        <div style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
          04/01
        </div>

        {/* Progress Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sections.map((section) => (
            <div key={section.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  backgroundColor: '#F9FAFB',
                }}
                onClick={() => toggleSection(section.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '18px' }}>{section.icon}</span>
                  <span style={{ fontWeight: '600', color: '#059669', fontSize: '16px' }}>
                    {section.title}
                  </span>
                </div>
                <button
                  style={{
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(section.id);
                  }}
                >
                  {expandedSections[section.id] ? '±' : '±'}
                </button>
              </div>

              {/* Section Items */}
              {expandedSections[section.id] && (
                <div>
                  {section.items.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: idx < section.items.length - 1 ? '1px solid #E5E7EB' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>{item.name}</span>
                      <div>{getStatusBadge(item.status)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress Bar */}
              <div style={{ padding: '12px 20px', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                <span>確認完了</span>
                <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: section.id === 'section1' ? '50%' : '75%',
                      height: '100%',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <span>{section.id === 'section1' ? '2/4' : '3/4'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressManagement;
