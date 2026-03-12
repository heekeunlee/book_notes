import { useState, useEffect } from 'react';
import { BookOpen, Search, PlusCircle, Library, Camera, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import OCRScanner from './components/OCRScanner';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('library'); // 'library', 'edit'
  const [isScrolled, setIsScrolled] = useState(false);
  const [showOCR, setShowOCR] = useState(false);

  // Data State
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('book_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Edit State
  const [currentNote, setCurrentNote] = useState(null);

  // Save to localStorage when notes change
  useEffect(() => {
    localStorage.setItem('book_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartNewNote = () => {
    setCurrentNote({
      id: uuidv4(),
      title: '',
      author: '',
      category: '문학',
      content: '',
      date: new Date().toISOString().split('T')[0]
    });
    setActiveTab('edit');
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setActiveTab('edit');
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('이 기록을 삭제하시겠습니까?')) {
      setNotes(notes.filter(n => n.id !== id));
      if (currentNote?.id === id) {
        setActiveTab('library');
      }
    }
  };

  const handleSaveNote = () => {
    if (!currentNote.title) {
      alert('책 제목을 입력해주세요.');
      return;
    }

    setNotes(prev => {
      const exists = prev.find(n => n.id === currentNote.id);
      if (exists) {
        return prev.map(n => n.id === currentNote.id ? currentNote : n);
      }
      return [currentNote, ...prev];
    });
    setActiveTab('library');
  };

  const handleTextExtracted = (text) => {
    setCurrentNote(prev => ({
      ...prev,
      content: prev.content ? prev.content + '\n\n' + text : text
    }));
    setShowOCR(false);
  };

  return (
    <div className="app">
      <header className={`header ${isScrolled ? 'glass' : ''}`} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all var(--transition-normal)', padding: '1rem 0',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            className="logo"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('library')}
          >
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary), #8a701c)',
              padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={24} color="#000" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              Book <span className="text-gradient">Notes</span>
            </h1>
          </div>

          <nav style={{ display: 'flex', gap: '1rem' }}>
            {activeTab === 'library' ? (
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleStartNewNote}>
                <PlusCircle size={18} />
                <span>새 기록</span>
              </button>
            ) : (
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => setActiveTab('library')}>
                <Library size={18} />
                <span>목록으로</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="page-wrapper container" style={{ paddingBottom: '6rem' }}>
        {activeTab === 'library' ? (
          <>
            <div style={{ padding: 'var(--space-2xl) 0', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>
                당신의 독서를 <span className="text-gradient">디지털화</span>하세요
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                종이책에 남긴 메모와 밑줄, 이제 사진만 찍어서 간편하게 텍스트로 저장하세요.
              </p>
            </div>

            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--color-text-muted)' }}>
                <Library size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.5 }} />
                <h3>아직 작성된 기록이 없습니다.</h3>
                <p>첫 번째 독서 기록을 남겨보세요.</p>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }} onClick={handleStartNewNote}>
                  기록 시작하기
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--space-xl)', marginTop: 'var(--space-xl)'
              }}>
                {notes.map(note => (
                  <div key={note.id} className="glass-card" style={{ padding: 'var(--space-lg)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => handleEditNote(note)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{note.title}</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{note.author || '작자 미상'}</p>
                      </div>
                      <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-2xl)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {note.category}
                      </div>
                    </div>
                    <p style={{
                      color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginBottom: 'var(--space-lg)',
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-wrap', flex: 1
                    }}>
                      {note.content || '내용이 없습니다.'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)', marginTop: 'auto' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{note.date}</span>
                      <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--color-error)' }} onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Edit Mode */
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingTop: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-xl)' }}>
              <button className="btn-icon" onClick={() => setActiveTab('library')}>
                <ArrowLeft size={24} />
              </button>
              <h2 style={{ margin: 0 }}>기록 편집</h2>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={() => setShowOCR(true)} style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                  <Camera size={18} />
                  <span>스캔(OCR)</span>
                </button>
                <button className="btn btn-primary" onClick={handleSaveNote}>
                  <Save size={18} />
                  <span>저장</span>
                </button>
              </div>
            </div>

            <div className="glass" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>책 제목</label>
                  <input type="text" placeholder="예: 사피엔스" value={currentNote?.title || ''} onChange={e => setCurrentNote({ ...currentNote, title: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>저자</label>
                  <input type="text" placeholder="예: 유발 하라리" value={currentNote?.author || ''} onChange={e => setCurrentNote({ ...currentNote, author: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>카테고리</label>
                <select
                  value={currentNote?.category || '문학'}
                  onChange={e => setCurrentNote({ ...currentNote, category: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', outline: 'none'
                  }}
                >
                  <option value="문학" style={{ background: 'var(--color-surface)' }}>문학/소설</option>
                  <option value="인문" style={{ background: 'var(--color-surface)' }}>인문/철학</option>
                  <option value="역사" style={{ background: 'var(--color-surface)' }}>역사</option>
                  <option value="과학" style={{ background: 'var(--color-surface)' }}>과학/IT</option>
                  <option value="경제" style={{ background: 'var(--color-surface)' }}>경제/경영</option>
                  <option value="자기계발" style={{ background: 'var(--color-surface)' }}>자기계발</option>
                  <option value="기타" style={{ background: 'var(--color-surface)' }}>기타</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  <span>기록 및 메모</span>
                  <span style={{ color: 'var(--color-primary)' }}>상단의 [스캔(OCR)] 버튼을 눌러 사진 속 글자를 불러오세요.</span>
                </label>
                <textarea
                  placeholder="인상 깊은 구절이나 느낀 점을 적어보세요..."
                  value={currentNote?.content || ''}
                  onChange={e => setCurrentNote({ ...currentNote, content: e.target.value })}
                  style={{ minHeight: '300px', resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>

            </div>
          </div>
        )}
      </main>

      {/* OCR Modal */}
      {showOCR && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} onClick={() => setShowOCR(false)} />
          <OCRScanner onTextExtracted={handleTextExtracted} onClose={() => setShowOCR(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
