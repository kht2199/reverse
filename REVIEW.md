# Opus 5.5 독립 리뷰 수정 결과

원본 리뷰는 evaluation/review/opus-review.txt. H1–H4/M1–M6/L1–L4 각각 fixture로 수정 전 실패(14/14), 수정 후 통과를 확인했다. 재리뷰/최종 승인은 아직 대기 중이다.

| 항목 | 수정 전 재현 | 조치/남은 한계 | 상태 |
|---|---|---|---|
| H1 | destructured parameter/local, for-of, catch가 outer URL로 오판됨 | declaration identity와 lexical scope binding을 수집한다. initializer 없는 binding도 outer lookup을 막는다. | fixture 통과, 재리뷰 대기 |
| H2 | export let, Object.assign, 다른 파일의 객체 변경이 literal로 오판됨 | import의 const/변경 여부도 검사하고 일반 object property는 escape/heap 효과를 증명하지 못하면 unknown이다. 순수 helper 내부 fresh local object만 허용한다. | fixture 통과, 재리뷰 대기 |
| H3 | 상속 overload와 lambda/catch가 필드 메서드로 오판됨 | 같은 이름의 inherited method/override 또는 해석 불가 ancestor가 있으면 unknown. lambda/catch 가려짐도 포함한다. 실제 overload type 선택은 미구현이다. | fixture 통과, 재리뷰 대기 |
| H4 | Repo 질문 depth 2의 기본 context에서 Ctl이 빠짐 | 선택 로딩 BFS가 incoming call destination도 확장한다. 못 로드한 source 관계도 버리지 않고 근거/부분 범위를 남긴다. | fixture 통과, 재리뷰 대기 |
| M1 | 40파일 search/flow가 total 24와 잘림 없음으로 응답 | search/flow의 seed-file cap을 제거했다. query 일치 scope에서 건수 페이징하고 totalIsExact/scopeTruncated를 표시한다. flow는 역방향과 boundary node도 표시한다. | fixture 통과, 재리뷰 대기 |
| M2 | 400개 parse failure에서 기본 context가 예산 오류로 실패 | coverage/state 배열은 정확한 Total/Truncated를 남기고 바이트 예산 안의 표본으로 줄인다. --all에는 이 축약이 없다. | fixture 통과, 재리뷰 대기 |
| M3 | helper 인수가 outer const의 동일 이름에 새어 들어감 | 평가 환경을 이름이 아닌 binding record로 keying한다. outer const id는 helper parameter id와 다른 declaration이다. | fixture 통과, 재리뷰 대기 |
| M4 | import 함수와 같은 이름의 parameter 호출이 import로 연결됨 | 호출 대상도 URL과 동일한 lexical binding으로 검사한다. shadow/mutable/unknown binding은 연결하지 않는다. | fixture 통과, 재리뷰 대기 |
| M5 | 익명 클래스 메서드가 outer Svc의 소유로 기록됨 | 익명 클래스 별도 type/owner와 상위 타입을 기록한다. outer service의 method 후보로 섞지 않는다. | fixture 통과, 재리뷰 대기 |
| M6 | request config spread가 있는데도 literal로 분류 | pathResolution=conditional, requestOverrideUnknown=true, effectivePath=null로 표시한다. path는 선언 식 후보이며 실제 적용 경로가 아니다. | fixture 통과, 재리뷰 대기 |
| L1 | 대소문자 alias로 대상 내부 출력이 가능 | safeOutput은 기존 조상 경로의 dev/inode를 비교한다. index와 rea-plan 모두 case/symlink 별칭을 쓰지 못한다. concurrent path substitution까지 방지하는 보안 경계는 아니다. | fixture 통과, 재리뷰 대기 |
| L2 | Java 외부 import와 React 외부 호출이 overload 이유로 분류 | import/call/global/external/member/shadow 등 종류별 unknown 이유로 분리했다. | fixture 통과, 재리뷰 대기 |
| L3 | count만 같고 candidates/owner/file/callee 존재 의미가 바뀜 | encodingRevision=2에서 필드 존재/빈 값/null을 보존한다. 원본 analyze graph의 의미 SHA와 temp DB 복원 SHA가 같고 참조 무결성이 통과해야만 기존 인덱스를 교체한다. | fixture 통과, 재리뷰 대기 |
| L4 | 신규 runtime untracked 및 Node/설치 문서 불일치 | 필수 runtime 파일을 stage하고 files allowlist/engines >=24.0.0(실제 Node floor 회귀 확인)/SQLite 이전 bootstrap을 추가했다. 로컬 npm pack 해제 후 help/index 확인. 원격 Git 설치·commit/push는 하지 않았다. | fixture 통과, 재리뷰 대기 |

## Amos 리뷰 직전 → 수정 후

| 대상 | 호출 연결 | unknown 경로 | 경로 분류 | literal+override 오분류 | 철회한 연결 | 원본→복원 검증 |
|---|---:|---:|---|---:|---:|---|
| backend | 3077→2946 / 18901 | 0→0 / 0 | {} | 0→0 | 131 | SHA 일치, integrity=0 |
| frontend | 4656→3849 / 20620 | 8→7 / 182 | {"unknown":7,"conditional":160,"symbolic":7,"literal":8} | 115→0 | 847 | SHA 일치, integrity=0 |

연결/경로 수 감소는 잘못된 확정을 보수적으로 철회한 결과를 포함하며 정확도 하락/상승을 수량만으로 단정하지 않는다. 리뷰가 지적한 상속 후보 43건은 모두 오답이라고 검증된 숫자가 아니며, 새 분석도 Java runtime overload/bean dispatch를 해결했다고 주장하지 않는다. ancestor 정보를 해석할 수 없으면 unknown으로 남긴다.

원본→복원 검증은 같은 DB 두 조회의 개수 비교가 아니다. SQL 작성 전 analyze() 원본의 snapshot/nodes/edges/errors/coverage/limitations와 메타데이터를 JSON 의미로 canonical SHA-256 처리한다. temp DB를 복원한 결과에 같은 처리를 하고, null/빈 candidates/빈 callee/owner·file 필드 존재/근거·unknown 이유까지 일치해야 교체한다. JS undefined는 JSON 계약에서 생략되며 이 범위 밖의 AST/원문 전체를 저장하는 것은 아니다. fixture는 원본 JSON 필드 전체 deepEqual도 검사한다. 이전 v3 encoding의 이미 생략된 구분은 소급 복원할 수 없어 재생성을 요구한다.

## 작은 안정성 개선과 후속 계획

UNDERSTAND_ANYTHING_RESEARCH.md를 읽고 참조 무결성 검사·원자적 기준선 보존만 적용했다. dangling edge 검증 실패와 의도적으로 불안정한 source getter를 사용한 roundtrip 실패 주입에서 이전 DB가 byte-identical임을 확인했다. 코드/LLM/hook을 차용하지 않았다.

증분은 미구현이다. 후속 설계는 변경/추가/삭제·동일 해시 이름변경 후보 및 config 변화 목록 → 별도 AST 구조 지문 → 역참조 invalidation → 타입/API/import 재해석 범위를 계획하고, 모르면 full rebuild한다. 추가/삭제/이름변경/설정/의존 대상 변경/미커밋 변경/실패 복구의 결과를 동일 입력 전체 재생성과 의미 비교하기 전에는 증분이라고 표시하지 않는다.

## 배포·보존·평가의 한계

초기 patch 최소값 지적은 후속 R5에서 정정했다. Node >=24.0.0 지원 floor와 package allowlist/bootstrap을 사용하며 실제 Node 24.0.0 및 24.22.2에서 전체 회귀를 확인했다. 다른 모든 플랫폼/버전의 검증을 뜻하지 않는다. npm pack을 임시 경로에 풀고 기존 local node_modules를 연결해 help/index를 확인했다. 원격 비공개 Git npx 설치는 하지 않았다. 필수 runtime 파일은 stage했지만 commit/push/배포는 하지 않았다. 사용자 npx/npm 안내는 유지하며 최소 버전/.rvx/검증된 v3 commit 선택을 의도적으로 정정했다.

질문/표본은 수작업 원본 확인 자료이며 독립적인 시점 증명이나 사전 등록은 없다. 탐색 로직을 같은 질문으로 개발·평가해 편향이 있을 수 있다. 원본 anchor 반환 여부와 bytes/4 추정치를 측정한 것이며 에이전트 성공률·실제 모델 토큰 절감·전체 정확도 100%를 주장하지 않는다. Amos 보존 결과는 evaluation/preservation.json, 실제 회귀 로그는 evaluation/tests.txt다.

## 마지막 재리뷰 R1–R6

# Opus 5.5 재리뷰 1–6 수정 결과

6개 항목 모두 수정 전 fixture 실패와 수정 후 통과를 확인했다. 기존 27개 + 새 6개 = 총 33개 검사다. 이후 별도 Opus 5.5 세션이 아래 최종 재확인을 수행했다.

| 항목 | 재현 | 조치와 한계 | 결과 |
|---|---|---|---|
| R1 | 필드 lambda/field initializer/static/instance block의 repo 가려짐 4건 | 모든 초기화 실행 문맥에서 call별 shadowNames를 보존하고 owner가 없어도 검사한다. this.repo는 별도로 취급한다. 완전한 Java 타입/제어 흐름 모델은 아니다. | 수정 전 실패 / 수정 후 통과 |
| R2 | axios.post/put/patch 본문 url/method/spread 오인 | 공유 httpShape가 URL·data·config 인수 위치를 구분한다. bound axios 메서드는 첫 URL과 고정 verb를 사용하며 body는 설정으로 읽지 않는다. fetch/config-call도 별도 위치를 쓴다. | 수정 전 실패 / 수정 후 통과 |
| R3 | loadall/svc.loadall의 기본 search/flow가 --all보다 작음 | 사전 선택은 원래 이름과 CamelCase 분리 이름을 모두 포함해 실제 대소문자 무시 부분 일치를 덮는 superset이다. fixture에서 default/--all 결과 배열과 합계를 비교한다. | 수정 전 실패 / 수정 후 통과 |
| R4 | roundtrip 실패 후 전체 temp DB가 남음 | 핸들된 실패 시 해당 writer가 만든 temp DB/-journal/-wal/-shm만 정리하고 원래 인덱스를 보존한다. synchronous=FULL과 파일 fsync 후 rename을 쓰지만 전원 차단/디렉터리 내구성은 미검증이다. 강제 kill에서는 cleanup handler가 실행되지 않을 수 있다. | 수정 전 실패 / 수정 후 통과 |
| R5 | 개발 머신 patch를 최소 Node 버전으로 주장 | 공식 Node 24.0.0 arm64 Darwin 파일을 SHA 검증 후 임시 경로에서 실제 실행했다. 전체 33개 fixture가 통과한 Node 24.0.0을 지원 floor로 사용한다. 모든 Node/OS 버전 검증이나 API가 오직 24부터 가능하다는 주장은 아니다. | 수정 전 실패 / 수정 후 통과 |
| R6 | context crossLanguage에 조건부 분류가 없고 boundary 96건의 분모 불명확 | context/boundary/evaluation에 resolution/conditional/effectivePath/requestOverrideUnknown을 함께 표시한다. matched-pair 분모, API/route scope 및 conditional 비율을 별도 기록한다. 실제 요청 성공률이 아니다. | 수정 전 실패 / 수정 후 통과 |

## Amos 영향

- backend: 연결 2946→2946/18901. owner 없는 기존 연결 0건 중 shadow 근거로 철회한 연결 0건. API 후보 0→0, 직접 axios post/put/patch 후보 0건, 경로/메서드가 바뀐 기존 API 후보 0건. 원본→복원 SHA 일치, integrity 0건. 인덱스 4374528→4382720 bytes.
- frontend: 연결 3849→3849/20620. owner 없는 기존 연결 712건 중 shadow 근거로 철회한 연결 0건. API 후보 182→182, 직접 axios post/put/patch 후보 4건, 경로/메서드가 바뀐 기존 API 후보 0건. 원본→복원 SHA 일치, integrity 0건. 인덱스 6369280→6377472 bytes.

경계 96개 matched method/path 후보 중 conditional 86개 (86/96). 분류={"conditional":86,"symbolic":7,"literal":3}. 분모는 route/API index scope에서 경로/메서드가 맞는 후보 쌍이며, 전체 API 182개 중 path 후보 175개와 route 79개를 비교한 결과다. 실제 요청·성공·정답률을 뜻하지 않는다. context --other는 선택된 scope 안의 별도 분모이며 --all과 기본 scope를 구분한다.

Node 24.0.0은 공식 배포 archive와 SHA를 확인하고 실제 실행한 전체 테스트 결과다. 비교 머신 Node 24.22.2에서도 동일 33개를 실행했다. node-floor.json과 tests-node-24.0.0.txt, evaluation/tests.txt에 근거가 있다. 나머지 모든 버전/플랫폼의 검증을 주장하지 않는다. Node 22가 기술적으로 불가능하다는 주장도 하지 않는다.

기존 사용자 npx/npm 절차는 유지했고 사용자의 명시적 지시에 따라 버전·확장자·v3 commit 안내를 정정했다. 문구 정정에 별도 승인이 필요하다는 리뷰어의 추론은 사용자 지시로 해소됐다. 사용자 조사 문서는 유지하며 코드/LLM/hook을 기본 경로에 추가하지 않았다. 증분은 여전히 미구현 full rebuild다. Amos는 읽기 전용이며 보존은 evaluation/preservation.json에서 확인했다.

## Opus 5.5 최종 재확인

별도 Claude Opus 5.5 세션에서 재리뷰 1–6을 기존 및 추가 임시 fixture로 다시 확인했다. 6건 모두 해결됐고 추가로 발견된 차단 결함은 없었다. 리뷰어는 Node 24.0.0 실행 결과와 Amos 전체 수치를 직접 재실행하지 않고 기록을 확인했으며, 원격 Git을 통한 npx 설치는 검증하지 않았다. Node 24.0.0의 SQLite ExperimentalWarning은 stderr에 출력된다. 증분 갱신, 완전한 Java overload/Spring 런타임 dispatch 및 전원 차단 시 내구성은 미검증이다. 상세 보고: evaluation/rereview/opus-final.md.
