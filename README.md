# DO SPORTS 실시간 시간표 v6

이 버전은 Netlify Blobs 저장 오류를 더 안정적으로 처리하도록 수정했습니다.

## 변경 사항

- Netlify Blobs `getStore` 호출 방식을 안정적인 object-form으로 변경
- Node 런타임을 20으로 지정
- 저장 실패 시 관리자 화면에 실제 오류 메시지를 표시
- 기존 관리자 비밀번호 `ADMIN_PASSWORD` 환경변수는 그대로 사용

## 배포 후 확인

1. GitHub 저장소 루트에 `public`, `netlify`, `package.json`, `netlify.toml`이 바로 보여야 합니다.
2. Netlify → Deploys → Trigger deploy → Deploy site 로 재배포합니다.
3. `/admin`을 시크릿 창에서 열고 비밀번호를 다시 입력합니다.
4. 저장 성공 후 Netlify → Blobs 화면에 `academy-schedule` 저장소가 생성됩니다.

# DO SPORTS 실시간 시간표 사이트

학부모가 실시간으로 확인할 수 있는 DO SPORTS 시간표 사이트입니다.  
관리자는 `/admin` 화면에서 시간표, 공지사항, 메인 문구, 버튼 링크를 직접 수정할 수 있습니다.

## 주요 기능

- 학부모 화면: `/`
- 관리자 화면: `/admin`
- 농구 / 축구 / 키즈 탭 분리
- 시간 × 요일 형태의 실제 시간표형 UI
- 수업명, 학년, 정원, 현재원, 장소 표기
- 관리자 저장 후 학부모 화면 최대 2초 안에 반영
- 공지사항 직접 수정 가능
- 메인 제목, 메인 설명 직접 수정 가능
- 개설 희망 / 반 모으기 / 상담 및 신청서 작성 버튼명과 링크 직접 수정 가능
- 남색 계열 DO SPORTS 브랜딩 디자인
- API 연결 실패 시 예시 시간표와 안내 메시지 표시

## 폴더 구조

GitHub 저장소 첫 화면에 아래 파일과 폴더가 바로 보여야 합니다.

```text
public/
netlify/
package.json
netlify.toml
README.md
```

아래처럼 한 단계 폴더 안에 들어가 있으면 배포가 제대로 되지 않을 수 있습니다.

```text
academy-live-schedule-v5/
  public/
  netlify/
  package.json
```

GitHub에는 `academy-live-schedule-v5` 폴더 자체가 아니라 그 안의 내용물을 올리세요.

## GitHub 처음 설정

1. GitHub 로그인
2. 오른쪽 위 `+` 클릭
3. `New repository` 클릭
4. Repository name 예시: `academy-live-schedule`
5. Public 또는 Private 선택
6. `Add a README file`은 체크하지 않기
7. `Create repository` 클릭
8. `uploading an existing file` 클릭
9. 압축 해제한 폴더 안의 `public`, `netlify`, `package.json`, `netlify.toml`, `README.md` 업로드
10. `Commit changes` 클릭

## Netlify 처음 설정

1. Netlify 로그인
2. `Add new site` 클릭
3. `Import an existing project` 클릭
4. GitHub 연결
5. GitHub 저장소 선택
6. Build setting 확인

```text
Build command: npm run build
Publish directory: public
Functions directory: netlify/functions
```

7. `Deploy site` 클릭

## 관리자 비밀번호 설정

관리자 저장 기능을 쓰려면 Netlify 환경변수 설정이 필요합니다.

1. Netlify 사이트 선택
2. `Site configuration` 이동
3. `Environment variables` 이동
4. `Add a variable` 클릭
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

## 사용하는 주소

학부모 화면:

```text
https://내사이트주소.netlify.app/
```

관리자 화면:

```text
https://내사이트주소.netlify.app/admin
```

## 관리자에서 수정 가능한 내용

관리자 화면에서 아래 항목을 직접 수정할 수 있습니다.

- 학원명
- 메인 제목
- 메인 설명
- 공지사항
- 개설 희망 버튼명
- 개설 희망 링크
- 반 모으기 버튼명
- 반 모으기 링크
- 상담 및 신청서 작성 버튼명
- 상담 및 신청서 작성 링크
- 수업 종목
- 요일
- 시작시간
- 종료시간
- 수업명
- 학년
- 정원
- 현재원
- 장소

기본 링크는 아래와 같습니다.

```text
개설 희망: https://classroute-site.netlify.app/
반 모으기: https://classroute-site.netlify.app/
상담 및 신청서 작성: https://dosportslink.netlify.app/
```

## 빨간 점과 `연결 재시도 중`이 보일 때

학부모 화면 오른쪽 위에 빨간 점과 `연결 재시도 중`이 보이면 시간표 저장 서버와 연결되지 않은 상태입니다. 이 버전은 연결 오류가 있어도 예시 시간표를 보여주지만, 관리자 저장 기능은 정상 작동하지 않을 수 있습니다.

이때 확인할 것:

1. GitHub 저장소 첫 화면에 `public`, `netlify`, `package.json`, `netlify.toml`이 바로 보이는지 확인
2. Netlify의 `Deploys`에서 배포가 성공했는지 확인
3. Netlify `Functions` 메뉴에 `schedule` 함수가 보이는지 확인
4. Netlify `Environment variables`에 `ADMIN_PASSWORD`가 있는지 확인
5. 환경변수 추가 후 `Trigger deploy → Deploy site`를 했는지 확인

직접 확인할 주소:

```text
https://내사이트주소.netlify.app/.netlify/functions/schedule
```

이 주소에서 JSON 데이터가 보이면 API 연결은 정상입니다.

## 사이트 이름 변경

Netlify 기본 주소가 마음에 들지 않으면 아래에서 바꿀 수 있습니다.

```text
Site configuration → Site details → Change site name
```

예시:

```text
dosports-schedule
```

그러면 주소는 아래처럼 됩니다.

```text
https://dosports-schedule.netlify.app
```
