import { GoogleGenerativeAI } from "@google/generative-ai";

// TODO: Replace with your actual Gemini API key
// Get your API key from: https://aistudio.google.com/app/apikey
const API_KEY = "YOUR_GEMINI_API_KEY_HERE";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function summarizeNote(text) {
    if (!text) return "";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `
다음 교사의 메모를 학부모가 읽기 쉽도록 깔끔한 마크다운 형식으로 정리해주세요.
- 중요한 정보는 **굵게** 표시
- 항목이 여러 개면 목록으로 정리
- 날짜, 시간, 준비물 등은 명확하게 구분

메모:
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
