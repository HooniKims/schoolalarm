# School Note (안심 알림장)

교사와 학부모/학생을 위한 간편하고 신뢰할 수 있는 소통 웹 앱입니다.

## 주요 기능
- **교사용**: 로그인(비밀번호: `teacher1234`), 달력 기반 메모 작성, AI 자동 정리(Gemini), 저장/수정/삭제.
- **학부모/학생용**: 날짜별 알림장 확인 (읽기 전용).

## 설치 방법

### 1. 프로젝트 클론
```bash
git clone https://github.com/HooniKims/schoolalarm.git
cd schoolalarm
npm install
```

### 2. Firebase 설정
1. [Firebase Console](https://console.firebase.google.com/)에 접속하여 새 프로젝트를 생성합니다.
2. **Firestore Database**를 생성하고, 보안 규칙을 테스트 모드(또는 적절한 규칙)로 설정합니다.
3. 프로젝트 설정 > 일반 > 내 앱 > 웹 앱을 추가합니다.
4. 발급된 `firebaseConfig` 객체 내용을 복사합니다.
5. `src/firebaseConfig.example.js` 파일을 `src/firebaseConfig.js`로 복사하고 내용을 붙여넣습니다:
```bash
cp src/firebaseConfig.example.js src/firebaseConfig.js
```

### 3. Gemini API 설정
1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키를 발급받습니다.
2. `src/services/gemini.example.js` 파일을 `src/services/gemini.js`로 복사하고 API 키를 교체합니다:
```bash
cp src/services/gemini.example.js src/services/gemini.js
```

## 실행 방법
```bash
npm run dev
```
브라우저에서 표시된 주소(예: `http://localhost:5173`)로 접속하세요.

## 기술 스택
- **Frontend**: React + Vite
- **Database**: Firebase Firestore
- **AI**: Google Gemini API (2.0 Flash Exp)
- **UI**: Vanilla CSS + React Calendar + React Markdown
