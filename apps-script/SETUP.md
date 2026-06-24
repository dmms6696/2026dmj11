# 동명중 1-1 Google Sheets + Apps Script 연결 안내

이 단계의 목표는 구글 시트를 앱의 데이터 저장소처럼 쓰고, `Code.gs`가 그 시트와 웹앱 사이의 통로가 되게 만드는 것입니다.

## 1. 구글 시트 만들기

1. `classroom_hq_google_sheet_template.xlsx` 파일을 구글 드라이브에 업로드합니다.
2. 업로드한 파일을 열고, 상단 메뉴에서 `파일 > Google 스프레드시트로 저장`을 선택합니다.
3. 변환된 구글 시트에서 아래 탭이 있는지 확인합니다.
   - `Students`
   - `Settings`
   - `Notices`
   - `PointLogs`
   - `Surveys`
   - `SurveyOptions`
   - `SurveyResponses`
   - `AvatarItems`
   - `Rewards`

## 2. 학생 비밀번호와 교사 코드 입력

1. `Students` 탭의 `password_code` 열에 학생별 비밀번호를 입력합니다.
2. 학생 비밀번호는 학생에게 따로 알려주면 됩니다.
3. `Settings` 탭의 `teacher_code` 값을 실제 교사 관리자 코드로 바꿉니다.
4. 이 값들은 앱 화면 파일에 직접 넣지 않고, 구글 시트 안에만 둡니다.

## 3. Apps Script 붙여넣기

1. 구글 시트 상단 메뉴에서 `확장 프로그램 > Apps Script`를 엽니다.
2. 기본으로 열리는 `Code.gs` 내용을 모두 지웁니다.
3. 이 폴더의 `Code.gs` 내용을 그대로 붙여넣습니다.
4. 저장 버튼을 누릅니다.
5. 함수 선택 드롭다운에서 `setupCheck`를 선택하고 실행합니다.
6. 권한 요청이 나오면 본인 구글 계정으로 승인합니다.

## 4. 웹 앱으로 배포

1. Apps Script 오른쪽 위의 `배포 > 새 배포`를 누릅니다.
2. 유형 선택에서 `웹 앱`을 선택합니다.
3. 설정은 아래처럼 둡니다.
   - 실행 계정: `나`
   - 액세스 권한: `모든 사용자`
4. 배포 후 표시되는 `웹 앱 URL`을 복사해 둡니다.

## 5. 연결 테스트

복사한 웹 앱 URL 끝에 아래처럼 붙여서 브라우저에서 열어 봅니다.

```text
?action=ping
```

정상이라면 이런 형태의 JSON이 보입니다.

```json
{
  "ok": true,
  "data": {
    "app": "Classroom HQ API",
    "spreadsheetName": "...",
    "time": "2026-06-23 10:00",
    "timezone": "Asia/Seoul"
  }
}
```

## 6. 현재 준비된 주요 기능

- 학생 로그인: `studentLogin`
- 교사 로그인: `teacherLogin`
- 학생 홈 데이터 불러오기: `getStudentHome`
- 교사 관리 데이터 불러오기: `getTeacherDashboard`
- 공지 생성: `addNotice`
- 포인트 기록 추가: `addPoints`
- 학생 칭호 수정: `updateStudentTitle`
- 선택형/주관식 설문 생성: `createSurvey`
- 설문 응답 제출: `submitSurveyResponse`
- 아바타 선택 저장: `updateAvatar`

## 7. 다음 단계

다음 작업은 웹앱의 `app.js`에서 지금의 임시 데이터를 걷어내고, 위에서 복사한 웹 앱 URL로 로그인과 데이터 저장을 요청하도록 바꾸는 것입니다.

브라우저에서 바로 `fetch`로 Apps Script를 호출할 때는 CORS 문제가 생길 수 있으므로, 연결 작업에서는 우선 `text/plain` JSON 요청 방식으로 붙이는 것이 좋습니다.

```js
fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({
    action: "studentLogin",
    number: "1",
    password: "123456"
  })
});
```

구글 시트 자체를 공개할 필요는 없습니다. 웹 앱은 선생님 계정 권한으로 실행되고, 학생은 웹 앱 API를 통해 필요한 데이터만 받게 됩니다.
