import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Calendar as CalendarIcon, MessageCircle } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import '../styles/ParentPage.css';
import '../styles/TeacherPage.css'; // Reuse calendar styles
import { getNoteByDate } from '../services/firestore';

const ParentPage = () => {
    const [date, setDate] = useState(new Date());
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadNote = async () => {
            setIsLoading(true);
            setSummary('');

            try {
                const dateStr = format(date, 'yyyy-MM-dd');
                const data = await getNoteByDate(dateStr);
                if (data && data.summary) {
                    setSummary(data.summary);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadNote();
    }, [date]);

    return (
        <div className="container parent-container">
            <div className="parent-grid">
                <div className="calendar-section">
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
                        <Calendar
                            onChange={setDate}
                            value={date}
                            locale="ko-KR"
                            calendarType="gregory"
                        />
                        <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            <p>날짜를 선택하여 가정통신문을 확인하세요.</p>
                        </div>
                    </div>
                </div>

                <div className="note-display">
                    <div className="note-date">
                        {format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })} 알림장
                    </div>

                    {isLoading ? (
                        <div className="empty-state">
                            <p>내용을 불러오는 중입니다...</p>
                        </div>
                    ) : summary ? (
                        <div className="markdown-content">
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>등록된 알림장이 없습니다.</p>
                            <p style={{ fontSize: '0.9rem' }}>다른 날짜를 선택해보세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentPage;
