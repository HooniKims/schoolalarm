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
- **AI**: Google Gemini API (1.5 Flash Latest)
- **UI**: Vanilla CSS + React Calendar + React Markdown

## 최근 수정사항

### 2025-11-24
- **Gemini API 모델 업데이트**: `gemini-1.5-flash`에서 `gemini-1.5-flash-latest`로 변경
  - 기존 모델이 v1beta API에서 404 오류 발생하는 문제 해결
  - 최신 안정화 버전으로 업데이트하여 API 호출 안정성 향상
  - 파일: `src/services/gemini.js`

## Vercel 배포 방법

### 1. Vercel에 프로젝트 연결
1. [Vercel](https://vercel.com)에 로그인합니다.
2. "Add New Project"를 클릭합니다.
3. GitHub 저장소 `HooniKims/schoolalarm`을 선택합니다.

### 2. 환경 변수 설정
Vercel 프로젝트 설정에서 다음 환경 변수들을 추가합니다:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. 배포
"Deploy" 버튼을 클릭하면 자동으로 배포됩니다.

> **참고**: 로컬 개발 시에는 `.env` 파일을 생성하여 위 환경 변수들을 설정하세요. (`.env.example` 파일 참고)
