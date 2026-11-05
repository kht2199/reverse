# Opus 5.5 최종 재확인: 재리뷰 1~6번 모두 해결

재리뷰에서 보고한 6건은 이전 fixture와 새 변형 fixture로 다시 재현해 보니 모두 해결됐습니다. 새로 막히는 결함은 찾지 못했습니다. 소스와 Amos는 수정하지 않았고, 새 fixture는 `/tmp/revrev-cross.*`, `/tmp/revrev-ts.*/root/src/post2.ts`에만 만들었습니다.

## 해결 확인

**1. Java 초기화 영역의 가려짐**
- 필드 초기화 람다, static 블록, 인스턴스 초기화 블록, 필드 초기화 람다의 매개변수 4건이 모두 unknown("receiver shadowed")으로 바뀌었습니다.
- 같은 클래스의 일반 메서드 `k()`에서 부르는 `repo.save(7)`은 정상적으로 연결되어, 과도하게 막지 않는 것도 확인했습니다.

**2. axios 요청 본문 인수**
- 본문 객체의 `url`/`method` 키는 더 이상 쓰이지 않습니다.
  - `axios.post('/api/links',{url:…})` → `POST /api/links`
  - `axios.post('/api/jobs',{method:'email'})` → `POST /api/jobs`
- 추가 변형도 axios의 실제 동작과 일치합니다.

  | 호출 | 결과 |
  |---|---|
  | 세 번째 인수(설정)에 `url`이 있는 `post` | 첫 인수 경로 사용 |
  | `get` + 설정의 `method:'post'` | `GET` 유지 |
  | `axios({method,url})`, `axios.request({...})` | 설정 객체의 값 사용 |
  | `fetch` + `body` 안의 `url` | 첫 인수 경로 사용 |
  | `put(url, data)` | 첫 인수 경로 사용 |

**3. 사전 필터의 대소문자 검색 누락**
- `loadall`, `LOADALL`, `adall`, `chartsbyuser`, `flow svc.loadall`이 모두 기본 실행과 `--all`에서 같은 수를 반환합니다(각각 1, 1, 1, 2, 5건).
- 40개 파일 검색도 두 방식 모두 40건, `totalIsExact:true`입니다.

**4. 저장 실패 시 임시 DB 정리**
- roundtrip 불일치를 주입하면 기존 인덱스의 해시가 그대로 유지되고, 임시 파일도 남지 않습니다.

**5. 지원 Node 하한**
- 하한이 `>=24.0.0`으로 내려갔고, `cli.mjs`와 `package.json`이 일치합니다.
- `evaluation/rereview`에 공식 Node 24.0.0에서 전체 회귀가 status 0으로 통과한 기록이 있습니다. 제가 직접 24.0.0으로 실행하지는 않았습니다.

**6. crossLanguage 분류와 분모**
- 두 언어 fixture에서 `classificationCounts {conditional:1, literal:1}`이 나왔습니다.
- spread가 있는 후보는 `effectivePath:null`, `requestOverrideUnknown:true`로 표시됩니다.
- 분모(`denominator`)에 범위 설명과 `scopePartial`이 함께 나옵니다.
- `EVALUATION.md`에도 "conditional 86/96"이 명시되어 있습니다.

## 추가 발견 (사소함)

- **[정보] Node 24.0.0의 SQLite 경고:** 24.0.0에서는 실행할 때마다 stderr에 `ExperimentalWarning: SQLite…`가 찍힙니다(기록된 로그에서 확인). stdout JSON에는 영향이 없지만, stderr를 오류로 취급하는 래퍼나 에이전트에서는 잡음이 될 수 있습니다. 결함은 아니고 문서에 적어 둘 만한 수준입니다.

## 미확인 한계

- **전원 차단 내구성:** `synchronous=OFF` 상태에서 fsync 없이 rename하므로, 프로세스가 죽는 경우의 원자성만 확인했습니다. 전원 차단 시는 재현하지 않았습니다.
- **Node 24.0.0:** 직접 실행하지 않고 산출물 기록만 확인했습니다.
- **EVALUATION 수치:** "전체 route 79개" 같은 숫자는 직접 다시 집계하지 않았습니다.
- **원격 설치:** 원격 Git으로 npx 설치하는 경로는 검증하지 않았습니다.
- **구현 범위:** 증분 갱신, 실제 Java overload 타입 선택, Spring bean dispatch는 여전히 구현되지 않았고, 문서에도 그렇게 적혀 있습니다.
