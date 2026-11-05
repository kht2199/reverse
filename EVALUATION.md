# Amos 기능 탐색·compact 저장 평가

Amos backend/frontend는 읽기 전용으로 조사했다. 소스·구성 해시와 Git 상태 보존은 evaluation/preservation.json에 있다. LLM·앱 실행·브라우저·배포를 사용하지 않았다. Node v24.22.2, java-parser 3.0.1, TypeScript 5.9.3을 사용했다. backend는 Java 21/Spring Boot 3.5.5, frontend는 React/Vite/TypeScript 및 직접 axios와 Kubb 클라이언트가 혼재한다.

## 독립 리뷰 상태

구현·회귀 검사·실제 평가는 아래와 같이 수행했다. Opus 5.5의 실제 리뷰에서 H1–H4/M1–M6/L1–L4를 전달받아 수정·재현했다. 남은 재리뷰 1–6도 수정·재현했다. 항목별 결과는 아래 REVIEW 부록에 있으며 Opus 5.5가 별도 fixture로 재리뷰 1–6의 해결을 재확인했다. 상세와 미검증 범위는 REVIEW.md를 참조한다.

## 평가 방법

기능 질문 4개와 표본은 수작업 원본 확인 자료다. 독립적인 시점 증명/사전 등록은 없으며 같은 질문으로 개발·평가한 선택 편향을 배제하지 않는다. questions.json에 질문을 보관했다. cache, custom monitoring 조회/이력, fab-layout 기능이며 타입/호출/API 표본은 해당 소스에서 수작업으로 라벨링했다. samples.json은 원본 선언·호출을 기준으로 하고 추출 결과에서 정답을 생성하지 않았다. 생성 클라이언트의 물리적 디렉터리 casing만 canonical lowercase로 정정했다. 무작위 표본이나 전체 정확도 추정이 아니다. 이전 구현은 로컬 Git 6da74ec4057d244fa7a1b3fecd21b3a7e7003e34와 같은 설치 의존성을 사용했다.

## 실제 분석과 저장 비용

| 대상 | 이전 JSON bytes | compact v3 bytes | 감소 | 이전 전체 CLI 갱신 ms | 현재 전체 CLI 갱신 ms | 현재 분석 ms | 현재 분석+저장 ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| backend | 17147222 | 4382720 | 74.4% | 4072 | 8711 | 7408 | 8364 |
| frontend | 18631596 | 6377472 | 65.8% | 4559 | 4547 | 2486 | 4205 |

증분 파싱은 구현하지 않았다. 매번 파일을 해시하고 전체 CST/AST 및 관계를 다시 계산해 외부 임시 SQLite를 완성한 다음 교체한다. 시간은 이 머신의 단일 실행 관측이며 캐시·부하를 통제한 벤치마크가 아니다. 저장량은 줄었지만 분석 기능 추가로 갱신 시간은 늘었다.

파일 경로·해시와 문자열을 공유하고, 같은 ancillary payload를 intern하며, 일부 payload만 개별 압축한다. context는 전체 이름 메타데이터를 스캔한 후 선택 파일의 상세 payload만 읽는다. status 확인은 전체 소스 해시를 읽으므로 저장 감소가 조회 속도 개선을 보장하지 않는다. 전체 모델에 인덱스를 전달할 필요는 없고, --all/dump는 사용자가 선택한 경우만 전체 graph를 로드·출력한다.

## 호출·경계 해석

| 대상 | 호출 전체 | 이전 연결 | 현재 연결 | 남은 unknown | API 후보 | 이전 경로 unknown | 현재 경로 unknown |
|---|---:|---:|---:|---:|---:|---:|---:|
| backend | 18901 | 1614 | 2946 | 15955 | 0 | 0 | 0 |
| frontend | 20620 | 2958 | 3849 | 16771 | 182 | 176 | 7 |

API boundary 후보 1→96. 현재 96개 matched 후보 중 conditional 86개이며 분모는 이 matched 후보 쌍(86/96)이다. 전체 route 79개와 API 182개 중 path 후보 175개를 비교한 결과다. 이는 정적 method/path 모양의 후보 수이며 실제 서버 연결 성공이나 정답률이 아니다. 환경 prefix, 동적 path parameter, request config spread의 override 가능성을 보존한다. 후보 목록과 assumption은 results.json에 있다. spread config는 conditional/effectivePath=null이며 literal 수에 섞지 않는다. 경로 추론의 정답률이나 실제 요청 성공을 이 수량에서 도출하지 않는다. 기존 호출·API 후보를 없애서 unknown 수를 낮춘 것이 아니라 선언/경로 추론을 추가했고 연결된 관계도 inferred로 표시한다.

Java 양성 호출 표본: 0/5→3/5.

- config/cache/CacheController.java:23 cacheAdminService.evict → config/cache/CacheAdminService.java:17
- custommonitoring/api/CustomMonitoringController.java:40 customMonitoringService.getMetrics → custommonitoring/service/CustomMonitoringService.java:39
- custommonitoring/service/CustomMonitoringService.java:87 repository.findChartsByUserId → unknown: inherited overload/override or unresolved ancestor; method selection unknown
- custommonitoring/service/CustomMonitoringService.java:131 fabLayoutMonitoringService.getDetailHistory → unknown: ambiguous overload by name/arity
- fablayout/api/FabLayoutController.java:126 service.getLayout → fablayout/service/FabLayoutService.java:98

상위 타입에 동일 이름의 메서드가 있거나 상위 타입 정보를 해석할 수 없는 경우에도 연결을 철회했다. getDetailHistory의 4인자 overload 두 선언도 선택하지 않는다. unknown 표본과 이유는 바로 위 목록을 따른다. 가능한 declaration 후보는 원본 조사를 위한 근거일 뿐 선택된 runtime 대상이 아니다. CacheManager.getCache, Cache.clear, ResponseEntity.noContent의 외부 타입 음성 표본은 모두 연결하지 않았다. URL 양성 표본은 0/5→5/5. getBoundingClientRect/pluginClient/self.clients.claim HTTP 오탐은 0이고, useAgentModels 및 SSE 함수 매개변수 URL은 unknown을 유지했다. fixture에서는 shadowing, 동일 arity overload, mutable URL, 부작용 helper를 음성으로 검사한다.

## 질문별 원본 탐색과 반환 비용

같은 질문·--depth 2·--limit 20의 기본 context를 비교했다. 현재 기본 바이트 예산은 16000이며 --max-bytes 0/--all로 해제 가능하다. 파일 anchor의 top 결과 포함 여부만 측정했다. 아래 tokens는 실제 모델 tokenizer가 아니라 UTF-8 bytes/4를 올림한 거친 추정치다. 한국어·코드에서 오차가 있다. 에이전트 전체 작업·작업 성공률·실제 토큰 소비나 절감은 실험하지 않았다.

| 질문 query / 대상 | 원본 anchor 이전→현재 | bytes 이전→현재 | tokens 추정 이전→현재 | 조회 wall ms 이전→현재 | 현재 생략 |
|---|---|---:|---:|---:|---|
| evictCache / backend | 1/2→2/2 | 10825→15960 | 2707→3990 | 499→824 | file=true, byte=true, selected=80, omitted=119 |
| getMetrics / backend | 2/3→2/3 | 15781→15718 | 3946→3930 | 441→657 | file=true, byte=true, selected=80, omitted=13 |
| getMetricHistory / backend | 2/2→2/2 | 15792→15636 | 3948→3909 | 457→771 | file=true, byte=true, selected=80, omitted=81 |
| fab-layout layout / backend | 1/2→2/2 | 18380→15252 | 4595→3813 | 448→871 | file=true, byte=true, selected=80, omitted=196 |
| evictCache / frontend | 0/0→0/0 | 14393→15963 | 3599→3991 | 646→931 | file=true, byte=true, selected=80, omitted=455 |
| getMetrics / frontend | 0/0→0/0 | 14512→15612 | 3628→3903 | 459→792 | file=true, byte=true, selected=80, omitted=403 |
| getMetricHistory / frontend | 0/2→2/2 | 1651→15607 | 413→3902 | 453→935 | file=true, byte=true, selected=80, omitted=476 |
| fab-layout layout / frontend | 0/1→1/1 | 13443→15474 | 3361→3869 | 473→1010 | file=true, byte=true, selected=80, omitted=382 |

합산 anchor 6/12→11/12. 질문별 실제 반환 anchor는 표를 따른다. 없는 anchor는 누락이며 연결 수를 늘리는 대신 불충분한 호출·경로를 unknown으로 바꾼 효과도 포함한다. returned file/line/hash와 call proof/URL proof를 따라 원본을 확인할 수 있다. 광범위 query는 관련 없는 파일도 많이 가져오고 기본 범위/출력에서 생략될 수 있으므로 점수는 중요도의 증명이 아니다. context metadata와 --all, 더 구체적인 route/symbol query를 사용해야 한다. 조회가 빠르거나 모델 작업이 성공한다는 결론은 내리지 않는다.

## 전체 열람과 조사 범위

### backend

source=512, config=7, parse/config failure files=0. dump --all에서 nodes=27284, edges=22790, 합계=50074가 저장 수와 정확히 일치했다. SQL 작성 전 원본 graph 의미 SHA와 복원 SHA 일치=true, 참조 무결성 검사 0건(동일 DB 두 번 조회의 수 비교와 구별). unknown calls=15955, unknown API paths=0도 유지됐다. 전체 dump 21573159 bytes (tokens 추정 5393290), wall 866 ms. 전체 module map은 99개 모듈/212개 관계, 33232 bytes, 550 ms였다. 전체 출력은 클 수 있으며 기본 조회와 구분한다.

제외 항목: hidden/environment=6, dependency/build/generated/vendor=7. 제외한 디렉터리 내부는 순회하지 않아 자손 파일 수를 알 수 없다. 전체 제외 경로와 unknown reason별 수량은 completeness.json 및 status --all에서 볼 수 있다.

unknown 호출 이유:

- external, inherited, chained or unresolved receiver/method: 15704
- receiver shadowed by parameter/local; no safe binding: 5
- ambiguous overload by name/arity: 27
- inherited overload/override or unresolved ancestor; method selection unknown: 219

unknown API 이유:

- API 후보 없음(Java 대상)

### frontend

source=1169, config=4, parse/config failure files=0. dump --all에서 nodes=35617, edges=25587, 합계=61204가 저장 수와 정확히 일치했다. SQL 작성 전 원본 graph 의미 SHA와 복원 SHA 일치=true, 참조 무결성 검사 0건(동일 DB 두 번 조회의 수 비교와 구별). unknown calls=16771, unknown API paths=7도 유지됐다. 전체 dump 22062092 bytes (tokens 추정 5515523), wall 1125 ms. 전체 module map은 185개 모듈/375개 관계, 46024 bytes, 583 ms였다. 전체 출력은 클 수 있으며 기본 조회와 구분한다.

제외 항목: hidden/environment=11, dependency/build/generated/vendor=2, declaration file=2. 제외한 디렉터리 내부는 순회하지 않아 자손 파일 수를 알 수 없다. 전체 제외 경로와 unknown reason별 수량은 completeness.json 및 status --all에서 볼 수 있다.

unknown 호출 이유:

- unmodelled receiver/property call: 7998
- global/external function or ambiguous lexical binding: 2554
- external import or unresolved imported function: 4871
- shadowing/mutable binding is not a known function declaration: 1290
- unresolved or ambiguous function declaration: 58

unknown API 이유:

- unsupported function event.request.clone: 1
- dynamic template expression: 2
- no safe absolute API pathname: 2
- unsupported or shadowing parameter binding url: 1
- helper has control flow or side effects: 1

기본 status/context/dump도 failure/unknown/제외 수량과 이유를 표시한다. 0개 match는 미분석 또는 런타임 부재와 구분한다. dump는 node/edge 페이지를, map은 source 페이지와 외부 target boundaryNodes를 제공하며 페이지 간 관계를 버리지 않는다. fixture에서 기본 제한보다 많은 65개 모듈을 만들어 전체 조회 합계·페이지 합계·map 관계 합계의 동일성, unknown 보존, 0건+파싱 실패 구별을 검사했다. --limit 고정 상한은 없고 --all은 건수·바이트·파일 scope cap을 해제한다. map은 동일 group 내부 관계를 접고 동일 source/target 쌍을 합친 투영이며 raw 개별 관계는 dump에서 모두 본다. 전체 정확도 100%는 주장하지 않는다.

## 실제 제한과 검증

Java의 declared field/import/name/arity는 선언 연결만 제공한다. 실제 Spring bean 선택, 상속 메서드, reflection, 반환형 receiver 체인과 overload 타입 선택은 지원하지 않는다. React URL evaluator는 immutable const/단순 helper만 읽고 재귀 24단계 초과·cycle·임의 제어 흐름을 unknown으로 남긴다. 동적 import/번들 runtime·Vite aliases·tsconfig 프로젝트 귀속·Gradle DSL 실행 의미는 완전하게 모델링하지 않는다. 파서가 인식하지 못한 코드는 errors/unknown으로 조사 범위를 설명한다.

회귀 검사 33개 통과(기존 27개 + 마지막 재리뷰 6항목), 실제 Node 24.0.0 및 24.22.2에서 확인(evaluation/tests.txt). 기존 Amos route/API 표본 12/11개의 TP/FP/FN은 evaluation/route-api-evaluation.md와 sample-results.json에 별도로 기록했다. compact roundtrip, 파일 추가/수정/삭제 및 config stale/refresh, 선택 로딩과 크기 감소, 출력 예산/--all/페이지 경계를 검사했다. REA는 여전히 로컬 바이너리 발견/명시적 절차만 제공하며 자동 실행·다운로드·setup을 하지 않는다. REA 자체를 이번 개선의 Java/React 정확도 근거로 사용하지 않았다. 이전 lodash override와 lockfile도 유지했다. README 사용자 npx/npm 안내의 구조·명령·override 경고는 보존하고, 사용자 지시에 따라 최소 Node 버전·.rvx 확장자·v3 커밋 선택을 정정했다. 이전 byte-identical 주장은 현재 수정본에 적용하지 않는다.

## 재현

```sh
npm ci --ignore-scripts
node benchmark-before.mjs ~/IdeaProjects/amos
node cli.mjs index --root ~/IdeaProjects/amos/backend --out evaluation/backend-v3.rvx
node cli.mjs index --root ~/IdeaProjects/amos/frontend --out evaluation/frontend-v3.rvx
npm test
node evaluate.mjs
node evaluate-usefulness.mjs
node measure-completeness.mjs
node evaluate-review.mjs
node evaluate-rereview.mjs
node evaluate-review.mjs # 마지막 수정 부록 반영
node write-evaluation.mjs
node cli.mjs context --index evaluation/backend-v3.rvx --other evaluation/frontend-v3.rvx --query getMetricHistory --depth 2
node cli.mjs dump --index evaluation/backend-v3.rvx --all > /tmp/reverse-all.json
node cli.mjs map --index evaluation/backend-v3.rvx --relation all --all
```

기준선 재생성은 위 고정 Git commit이 로컬에 있어야 하며 자동 fetch/설치를 하지 않는다. 최종 시간·전체 조회 비용은 별도 JSON(rebuild.json, before/rebuild.json, completeness.json)에 실측했다. 인덱스와 기준선 대용량 복사본은 재생성 가능한 Git 무시 경로에 두고 원본 사용자 파일은 삭제하지 않았다. 결과 보고서·수작업 정답·작은 비교 JSON만 버전 관리 대상으로 남긴다.

## 독립 리뷰 항목별 수정 부록

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

6개 항목 모두 수정 전 fixture 실패와 수정 후 통과를 확인했다. 기존 27개 + 새 6개 = 총 33개 검사다. 사용자 다음 리뷰를 대기하며 최종 승인으로 표시하지 않는다.

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
