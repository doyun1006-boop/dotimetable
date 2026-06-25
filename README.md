# DO SPORTS 실시간 시간표 사이트

GitHub + Netlify로 배포하는 DO SPORTS 실시간 시간표 사이트입니다.
학부모 화면은 `/`, 관리자 화면은 `/admin`에서 확인합니다.

관리자가 저장하면 학부모 화면은 2초마다 새 데이터를 불러와 빠르게 반영합니다.

## 관리자 화면에서 직접 수정 가능한 내용

관리자 화면에서 아래 내용을 직접 수정할 수 있습니다.

- 학원명
- 메인 제목
- 메인 설명 문구
- 공지사항
- 개설 희망 버튼명 / 링크
- 반 모으기 버튼명 / 링크
- 상담 및 신청서 작성 버튼명 / 링크
- 수업 종목: 농구, 축구, 키즈
- 요일
- 시작 시간
- 종료 시간
- 수업명
- 학년
- 정원
- 현재원
- 장소

기본 링크는 아래와 같이 설정되어 있습니다.

- 개설 희망: https://classroute-site.netlify.app/
- 반 모으기: https://classroute-site.netlify.app/
- 상담 및 신청서 작성: https://dosportslink.netlify.app/

## 폴더 구조

```text
public/
  index.html
  admin.html
  viewer.js
  admin.js
  styles.css
  assets/
    do-sports-logo-mark.png
    do-sports-logo-original.png
netlify/
  functions/
    schedule.js
package.json
netlify.toml
README.md
```

## GitHub에 처음 올리는 방법

1. GitHub 로그인
2. 오른쪽 위 `+` 클릭
3. `New repository` 클릭
4. 저장소 이름 입력: `academy-live-schedule`
5. `Add a README file`은 체크하지 않기
6. `Create repository` 클릭
7. 새 저장소 화면에서 `uploading an existing file` 클릭
8. 이 프로젝트 폴더 안의 파일과 폴더를 업로드

GitHub 저장소 첫 화면에 아래 항목들이 바로 보여야 합니다.

```text
public
netlify
package.json
netlify.toml
README.md
```

`academy-live-schedule-v4` 폴더가 한 번 더 감싸진 상태로 올라가면 Netlify 설정이 꼬일 수 있습니다.

## Netlify 배포 방법

1. Netlify 로그인
2. `Add new site`
3. `Import an existing project`
4. GitHub 선택
5. 방금 만든 GitHub 저장소 선택
6. 설정 확인

Netlify가 아래 값을 자동으로 읽습니다.

```text
Build command: npm run build
Publish directory: public
Functions directory: netlify/functions
```

7. `Deploy site` 클릭

## 관리자 비밀번호 설정

관리자 저장 기능을 사용하려면 Netlify 환경변수가 필요합니다.

1. Netlify 사이트로 이동
2. `Site configuration`
3. `Environment variables`
4. `Add a variable`
5. 아래처럼 입력

```text
Key: ADMIN_PASSWORD
Value: 원하는 관리자 비밀번호
```

예시:

```text
ADMIN_PASSWORD = dosports2026!
```

환경변수를 추가한 뒤에는 반드시 다시 배포하세요.

```text
Deploys → Trigger deploy → Deploy site
```

## 사용 주소

학부모 화면:

```text
https://내사이트주소.netlify.app/
```

관리자 화면:

```text
https://내사이트주소.netlify.app/admin
```

## 관리자 사용 순서

1. `/admin` 접속
2. 관리자 비밀번호 입력
3. 기본 문구 / 공지 수정
4. 상단 버튼 / 링크 수정
5. 농구, 축구, 키즈 탭 중 하나 선택
6. 수업 추가 또는 기존 수업 수정
7. 저장하기 클릭
8. 학부모 화면에서 최대 2초 안에 반영 확인

## 로컬 미리보기

터미널에서 프로젝트 폴더로 이동한 뒤 실행합니다.

```bash
npm install
npm run dev
```

로컬 관리자 저장을 테스트하려면 `.env` 파일을 만들고 아래 내용을 넣습니다.

```text
ADMIN_PASSWORD=원하는비밀번호
```

로컬 주소:

```text
http://localhost:8888
http://localhost:8888/admin
```
