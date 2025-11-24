import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sparkles, Save, Trash2, Loader2, List, X, CheckSquare, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import 'react-calendar/dist/Calendar.css';
import '../styles/TeacherPage.css';
import { summarizeNote } from '../services/gemini';
import { saveNote, getNoteByDate, deleteNote, getAllNotes } from '../services/firestore';

const TeacherPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // List Management States
  const [showList, setShowList] = useState(false);
  const [noteList, setNoteList] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState(new Set());

  // Load note when date changes
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadNote = async () => {
      setIsFetching(true);
      setNote('');
      setSummary('');
      setStatusMsg('');

      try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const data = await getNoteByDate(dateStr);
        if (data) {
          setNote(data.originalContent || '');
          setSummary(data.summary || '');
        }
      } catch (err) {
        console.error(err);
        setStatusMsg('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsFetching(false);
      }
    };

    loadNote();
  }, [date, isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'teacher1234') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSummarize = async () => {
    if (!note.trim()) {
      alert('메모 내용을 입력해주세요.');
      return;
    }

    setIsSummarizing(true);
    setStatusMsg('AI가 내용을 정리 중입니다...');

    try {
      const result = await summarizeNote(note, date);
      setSummary(result);
      setIsEditingSummary(false); // Switch to preview mode
      setStatusMsg('정리가 완료되었습니다. 내용을 확인하고 저장하세요.');
    } catch (err) {
      console.error(err);
      setStatusMsg('AI 호출 중 오류가 발생했습니다. API 키를 확인해주세요.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = async () => {
    if (!note.trim() && !summary.trim()) {
      alert('저장할 내용이 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      await saveNote(dateStr, note, summary);
      setStatusMsg('성공적으로 저장되었습니다!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg('저장 중 오류가 발생했습니다. Firebase 설정을 확인해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 날짜의 기록을 삭제하시겠습니까?')) return;

    setIsSaving(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      await deleteNote(dateStr);
      setNote('');
      setSummary('');
      setStatusMsg('삭제되었습니다.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // List Management Functions
  const openListModal = async () => {
    setShowList(true);
    setIsFetching(true);
    try {
      const notes = await getAllNotes();
      // Filter valid notes that have a date
      const validNotes = notes.filter(n => n.date);
      setNoteList(validNotes);
      setSelectedNotes(new Set());
    } catch (err) {
      console.error(err);
      alert('목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsFetching(false);
    }
  };

  const toggleNoteSelection = (dateStr) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedNotes(newSelected);
  };

  const toggleSelectAll = () => {
    if (noteList.length === 0) return;

    const allSelected = noteList.length > 0 && noteList.every(item => selectedNotes.has(item.date));

    if (allSelected) {
      setSelectedNotes(new Set());
    } else {
      const allDates = new Set(noteList.map(item => item.date));
      setSelectedNotes(allDates);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotes.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedNotes.size}개의 알림장을 삭제하시겠습니까?`)) return;

    setIsFetching(true);
    try {
      const deletePromises = Array.from(selectedNotes).map(dateStr => deleteNote(dateStr));
      await Promise.all(deletePromises);

      // Refresh list
      const notes = await getAllNotes();
      const validNotes = notes.filter(n => n.date);
      setNoteList(validNotes);
      setSelectedNotes(new Set());

      // If current date was deleted, clear editor
      const currentDateStr = format(date, 'yyyy-MM-dd');
      if (selectedNotes.has(currentDateStr)) {
        setNote('');
        setSummary('');
      }

      alert('삭제되었습니다.');
    } catch (err) {
      console.error(err);
      alert('일괄 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsFetching(false);
    }
  };

  const isAllSelected = noteList.length > 0 && noteList.every(item => selectedNotes.has(item.date));

  if (!isLoggedIn) {
    return (
      <div className="container teacher-container">
        <div className="login-container">
          <div className="login-card">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>교사 로그인</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                className="login-input"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</p>}
              <button type="submit" className="login-btn">로그인</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container teacher-container">
      <div className="dashboard-grid">
        <div className="calendar-section">
          <Calendar
            onChange={setDate}
            value={date}
            locale="ko-KR"
            calendarType="gregory"
          />
          <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <p>날짜를 선택하여 내용을 작성하거나 확인하세요.</p>
          </div>
          <button
            onClick={openListModal}
            className="action-btn"
            style={{ marginTop: '1rem', width: '100%', backgroundColor: 'var(--secondary-color)' }}
          >
            <List size={20} />
            전체 목록 관리
          </button>
        </div>

        <div className="editor-section">
          <div className="date-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })} 전달 사항</span>
            {statusMsg && <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'normal' }}>{statusMsg}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
            <textarea
              className="note-textarea"
              placeholder={isFetching ? "내용을 불러오는 중..." : "오늘의 전달 사항을 자유롭게 입력하세요..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ minHeight: '150px' }}
            />

            {summary && (
              <div style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: 'var(--secondary-color)', margin: 0 }}>AI 정리 결과</h4>
                  <button
                    onClick={() => setIsEditingSummary(!isEditingSummary)}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.3rem 0.6rem',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius)',
                      background: 'white',
                      color: 'var(--text-color)'
                    }}
                  >
                    {isEditingSummary ? '미리보기' : '직접 수정'}
                  </button>
                </div>

                {isEditingSummary ? (
                  <textarea
                    className="note-textarea"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    style={{ minHeight: '200px', backgroundColor: '#F9FAFB' }}
                    placeholder="AI가 정리한 내용이 여기에 표시됩니다. 필요시 수정하세요."
                  />
                ) : (
                  <div className="markdown-preview" style={{
                    padding: '1rem',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-color)',
                    minHeight: '200px',
                    overflowY: 'auto',
                    maxHeight: '400px'
                  }}>
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              className="action-btn"
              onClick={handleSummarize}
              disabled={isSummarizing || !note.trim() || isFetching}
              style={{ flex: 1, backgroundColor: 'var(--primary-color)' }}
            >
              {isSummarizing ? <Loader2 className="spin" size={20} /> : <Sparkles size={20} />}
              {isSummarizing ? '정리 중...' : 'AI로 정리하기'}
            </button>

            <button
              className="action-btn"
              onClick={handleSave}
              disabled={isSaving || isFetching}
              style={{ backgroundColor: 'var(--success-color)' }}
            >
              {isSaving ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
              저장
            </button>

            <button
              className="action-btn"
              onClick={handleDelete}
              disabled={isSaving || isFetching || (!note && !summary)}
              style={{ backgroundColor: 'var(--danger-color)' }}
            >
              <Trash2 size={20} />
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* List Modal */}
      {showList && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius)',
            width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>알림장 목록 관리</h3>
              <button onClick={() => setShowList(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
              {noteList.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>등록된 알림장이 없습니다.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {noteList.map((item) => (
                    <li key={item.date} style={{
                      padding: '1rem', borderBottom: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                      backgroundColor: selectedNotes.has(item.date) ? '#F3F4F6' : 'white'
                    }}
                      onClick={() => toggleNoteSelection(item.date)}
                    >
                      <div style={{ color: selectedNotes.has(item.date) ? 'var(--primary-color)' : '#ccc' }}>
                        {selectedNotes.has(item.date) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{item.date}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                          {item.summary ? item.summary.substring(0, 50) + '...' : '(내용 없음)'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={toggleSelectAll}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}
                >
                  {isAllSelected ? (
                    <CheckSquare size={20} color="var(--primary-color)" />
                  ) : (
                    <Square size={20} color="#ccc" />
                  )}
                  <span style={{ fontSize: '0.9rem' }}>전체 선택 ({selectedNotes.size}/{noteList.length})</span>
                </button>
              </div>
              <button
                onClick={handleBulkDelete}
                disabled={selectedNotes.size === 0 || isFetching}
                className="action-btn"
                style={{ backgroundColor: 'var(--danger-color)', width: 'auto', padding: '0.5rem 1.5rem' }}
              >
                <Trash2 size={18} style={{ marginRight: '0.5rem' }} />
                선택 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPage;
