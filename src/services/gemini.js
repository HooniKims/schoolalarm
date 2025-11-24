import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function summarizeNote(text, dateObj) {
    if (!text) return "";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 날짜 포맷팅 (예: 2025년 11월 24일(월))
        const dateStr = dateObj ? new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        }).format(new Date(dateObj)).replace(/ /g, ' ') : '';
        // Intl 포맷은 "2025. 11. 24. (월)" 형태일 수 있으므로 조정이 필요할 수 있음. 
        // 하지만 간단히 프롬프트에 날짜를 주입하는 것이 목적.

        // 더 정확한 포맷을 위해 직접 구성
        const d = new Date(dateObj);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const formattedDate = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일(${days[d.getDay()]})`;

        const prompt = `
다음은 교사가 작성한 알림장 메모입니다. 이를 **학생과 학부모(보호자)** 모두가 보기 편하도록 정리해주세요.

**작성 규칙:**
1. **헤더 필수**: 맨 첫 줄은 반드시 "# ${formattedDate} 전달사항"으로 시작하세요.
2. **인사말 생략**: "학부모님께", "안녕하세요" 같은 인사말이나 수신자 호칭은 **절대 넣지 마세요**.
3. **핵심 내용만**: 바로 본론으로 들어가서 전달 사항을 명확하게 작성하세요.
4. **가독성**: 
   - 중요한 정보는 **굵게** 표시하세요.
   - 항목이 여러 개면 목록(Bullet points)으로 정리하세요.
   - 준비물, 시간, 장소 등은 눈에 띄게 구분하세요.

**메모 내용:**
${text}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
