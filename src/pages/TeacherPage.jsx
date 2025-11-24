import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sparkles, Save, Trash2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import 'react-calendar/dist/Calendar.css';
import '../styles/TeacherPage.css';
import { summarizeNote } from '../services/gemini';
import { saveNote, getNoteByDate, deleteNote } from '../services/firestore';

const TeacherPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [isFetching, setIsFetching] = useState(false); // New state for data fetching
  const [isSummarizing, setIsSummarizing] = useState(false); // Renamed from isLoading
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Load note when date changes
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadNote = async () => {
      setIsFetching(true); // Use isFetching
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
        setIsFetching(false); // Use isFetching
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

    setIsSummarizing(true); // Use isSummarizing
    setStatusMsg('AI가 내용을 정리 중입니다...');

    try {
      const result = await summarizeNote(note);
      setSummary(result);
      setStatusMsg('정리가 완료되었습니다. 내용을 확인하고 저장하세요.');
    } catch (err) {
      console.error(err);
      setStatusMsg('AI 호출 중 오류가 발생했습니다. API 키를 확인해주세요.');
    } finally {
      setIsSummarizing(false); // Use isSummarizing
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
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                backgroundColor: '#F9FAFB',
                overflowY: 'auto',
                maxHeight: '300px'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>AI 정리 미리보기</h4>
                <div className="markdown-preview">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
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
    </div>
  );
};

export default TeacherPage;
