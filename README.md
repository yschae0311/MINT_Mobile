# MINT Mobile

MINT(MotrexEV Intelligence & News Tracker)의 iOS/Android 클라이언트다. 기존 FastAPI API와 React 웹 운영 화면을 유지하고, 모바일에서는 브리핑 소비와 기사 검토에 집중한다.

## 제공 기능

- JWT 로그인 및 OS 보안 저장소 기반 세션 복원
- 사내 계정 가입 신청 및 관리자 승인
- 오늘의 수집·고중요도·AI 탐문 대기 현황
- 최신 AI 데일리 브리핑
- 커뮤니티에서 수집한 고객의 소리
- 오늘의 EV 용어·상식·퀴즈
- 중요 뉴스와 AI 탐문 목록/필터/페이지네이션
- 기사 AI 요약, 사업 영향, 액션 아이템, 원문 링크
- 관리자의 탐문 승인·승격·숨김·AI 요약 재생성
- 데일리 리포트와 관련 게시글
- 기사·요약·정보 소스 통합 검색
- MINT 수집 자료 기반 AI 질의응답과 근거 기사 연결
- 사용자 문의 작성·추가 대화, 관리자 답변·종료
- 관리자 가입 승인과 백그라운드 작업 상태 확인
- 모바일 사용 안내

소스 전체 관리, Slack Webhook 비밀값 설정, 수동 크롤링, 리포트 생성처럼 운영 실수의 영향이 큰 기능은 기존 React 웹에서 수행한다.

## 실행

```bash
cp .env.example .env
npm install
npm start
```

별도 터미널에서 FastAPI를 외부 접속 가능하게 실행한다.

```bash
cd ../MINT_Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8100
```

실기기에서는 `.env`의 API 주소를 개발 PC의 LAN 주소로 지정한다.

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8100
```

- iOS 시뮬레이터: `http://localhost:8100` 사용 가능
- Android 에뮬레이터: `http://10.0.2.2:8100` 사용
- 실기기: 개발 PC와 같은 네트워크의 LAN IP 사용

백엔드 방화벽에서 8100 포트를 외부에 무제한 공개하지 않는다. 개발 LAN 또는 VPN 범위로 제한한다.

## 검증

```bash
npm run typecheck
npm run export:android
```

## 주요 구조

```text
src/
  api/          FastAPI 클라이언트
  components/   공통 UI
  navigation/   탭/스택 내비게이션
  screens/      앱 화면
  store/        보안 세션 상태
  types.ts      API 계약 타입
```
