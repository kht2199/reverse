# Amos 실제 평가

빌드 구성 원본 확인: backend/settings.gradle.kts는 tibco-broker, datasource-core, datasource-common, mongo-common, observability-logging을 포함한다. backend/build.gradle.kts는 Java 21/Spring Boot 3.5.5를 선언한다. frontend/package.json은 React ^18.2.0, Vite ^7.2.4, TypeScript ~7.0.2 및 Kubb 생성과 tsc -b/Vite 빌드를 선언한다. CLI는 빌드를 실행하지 않으며 TypeScript 5.9.3 AST로 읽는다. 언어 신기능의 완전한 호환성을 주장하지 않는다.

Hand-labelled from original source before comparison with schema-v2 index. Five backend and five frontend files selected by route/client style; not a random sample.

Amos는 읽기 전용으로 분석했다. 앱 실행·빌드·배포는 수행하지 않았다. 아래 수치는 표본의 정답과 비교한 결과이며 전체 저장소 정확도 추정이 아니다.

## backend

512 source files, 519 source/config files, 27284 nodes, 22790 edges, 0 parse/config errors, 7408 ms. 99 modules. Snapshot: 2026-11-05T00:16:29.944Z. Stale: false. Git status entries: 0.

Resolved imports 784/3889; inferred local call targets 2946/18901. These are extraction/resolution counts, not recall.

- src/main/java/com/skhynix/amhs/amos/api/LogController.java:25: GET /api/v1/amhs/amos/log/transport-analysis/fabs; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/api/LogController.java:44: GET /api/v1/amhs/amos/log/transport-analysis; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/common/controller/CommonController.java:29: GET /api/v1/amhs/amos/fabs/mappings; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/common/controller/CommonController.java:42: GET /api/v1/amhs/amos/menus; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/config/cache/CacheController.java:20: DELETE /api/v1/amhs/amos/cache/{name}; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/custommonitoring/api/CustomMonitoringController.java:33: GET /api/v1/amhs/amos/custom-monitoring/metrics; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/custommonitoring/api/CustomMonitoringController.java:43: GET /api/v1/amhs/amos/custom-monitoring/metrics/recommendations; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/custommonitoring/api/CustomMonitoringController.java:53: GET /api/v1/amhs/amos/custom-monitoring/metrics/recommendations/combos; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/custommonitoring/api/CustomMonitoringController.java:72: POST /api/v1/amhs/amos/custom-monitoring/metrics/history; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/custommonitoring/api/CustomMonitoringController.java:83: PUT /api/v1/amhs/amos/custom-monitoring/metrics; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/domain/agent/AgentChatController.java:30: GET /api/v1/amhs/amos/agent/chats; 원본 annotation 위치 확인.
- src/main/java/com/skhynix/amhs/amos/domain/agent/AgentChatController.java:42: GET /api/v1/amhs/amos/agent/chats/{threadId}; 원본 annotation 위치 확인.

표본 TP=12, FP=0, FN=0.

## frontend

1169 source files, 1173 source/config files, 35617 nodes, 25587 edges, 0 parse/config errors, 2486 ms. 185 modules. Snapshot: 2026-11-05T00:16:33.737Z. Stale: false. Git status entries: 0.

Resolved imports 3457/4967; inferred local call targets 3849/20620. These are extraction/resolution counts, not recall.

- src/pages/monitoring/fab-layout/useFabLayout.ts:13: axios.get, GET, path="/api/v1/amhs/amos/fab-layout/layout".
- src/pages/monitoring/fab-layout/useFabLayout.ts:27: axios.get, GET, path="/api/v1/amhs/amos/fab-layout/agv/rails/fabs".
- src/pages/monitoring/fab-layout/useFabLayout.ts:37: axios.get, GET, path="/api/v1/amhs/amos/fab-layout/agv/rails".
- src/pages/monitoring/fab-layout/useFabLayout.ts:52: axios.get, GET, path="/api/v1/amhs/amos/fab-layout/ftp/status".
- src/pages/monitoring/fab-layout/useFabLayout.ts:65: axios.get, GET, path="/api/v1/amhs/amos/fab-layout/ftp/history".
- src/pages/monitoring/fab-layout/useFabLayout.ts:80: axios.post, POST, path="/api/v1/amhs/amos/fab-layout/ftp/trigger".
- src/pages/llm/useAgentModels.ts:34: axios.get, GET, path=null.
- src/components/SSOAuth.tsx:156: axios.post, POST, path=null.
- src/components/SSOAuth.tsx:190: axios.post, POST, path=null.
- src/lib/sseStream.ts:95: fetch, GET, path=null.
- src/stores/chatStore.ts:357: fetch, POST, path=null.
- 음성 표본 check-nav.pw.ts:45: menuRoot.getBoundingClientRect(); HTTP 오탐 0.
- 음성 표본 kubb.config.ts:26: pluginClient(; HTTP 오탐 0.
- 음성 표본 public/mockServiceWorker.js:20: self.clients.claim(); HTTP 오탐 0.

표본 TP=11, FP=0, FN=0.

## 실제 제한과 API 경계

이전 평가의 import 라우트 및 일반 client 이름 오탐을 수정했다. Java annotation CST만 라우트로 읽고 클래스 prefix/HTTP 메서드를 결합한다. 프런트엔드 경로는 이제 정적 상수/helper와 symbolic 환경변수 prefix를 추적한다. 경로가 추론되어도 런타임 연결을 확정하지 않는다. boundary 결과는 메서드·리터럴 경로가 같은 후보만 제시한다. 단순 Kubb URL helper는 추적하고 임의 제어 흐름/side effect 함수는 unknown으로 남긴다. 정적 경계 일치 기능은 fixture에서 검증했다. 실제 연결을 보장하지 않는다.

Java 필드의 선언 타입과 유일한 name/arity는 추론하지만 실제 DI/오버로드 선택, 완전한 Gradle 의존성 모델, Vite alias, 런타임 경로·권한·실행 흐름은 지원하지 않는다. tsconfig는 로컬 구성 후보의 paths/baseUrl과 상대 extends만 사용하며 프로젝트 include/exclude별 정확한 소유권은 평가하지 않는다. 모듈은 Java package와 프런트엔드 디렉터리별 요약이다.

## 검증과 재현

```sh
npm ci --ignore-scripts
npm test
node cli.mjs index --root ~/IdeaProjects/amos/backend --out evaluation/backend.json
node cli.mjs index --root ~/IdeaProjects/amos/frontend --out evaluation/frontend.json
node evaluate.mjs
node cli.mjs boundary --index evaluation/backend.json --other evaluation/frontend.json --limit 20
```

fixture 테스트는 annotation/import 구분, 클래스 경로/HTTP 배열, 동적 경로 unknown, 선언/호출, alias, 컴포넌트, HTTP 음성 표본, 추가/수정/삭제/config stale, 제외와 symlink, 출력 제한·경로 보호, 경계 후보, parse 실패를 검사한다. 실제 테스트 로그는 evaluation/tests.txt. 대상 Git 변경 목록은 각 git-status.txt. 분석 전후 상태/해시 비교는 evaluation/preservation.json. npm 의존성 감사는 evaluation/npm-audit.json에 저장했다. lodash/lodash-es 4.18.1 overrides 적용과 npm ci 후 감사 전체 취약점은 7건에서 0건으로 감소했다. 기존 테스트 8개와 전체 Amos 재분석 및 표본 대조를 다시 수행했고 수정 전후 snapshot/nodes/edges/errors가 정확히 일치했다(evaluation/dependency-fix-comparison.json). 근거와 범위는 [DEPENDENCIES.md](DEPENDENCIES.md)에 기록했다. CLI 분석 시 네트워크는 사용하지 않는다.

## 선택적 REA 확인

REA 6.8.0을 임시 설치해 JavaScript 분석/Evidence 저장/재조회와 선택된 TSX 파싱을 실제 확인했다. 전역 설치와 setup은 하지 않았다. rea-plan은 로컬 바이너리의 유무와 직접 호출 절차를 반환하며 자동 설치·실행하지 않는다. REA로 Amos 전체 분석을 수행했다는 주장은 하지 않는다. 공식 문서, 정확한 사용 절차와 제한은 [REA.md](REA.md)에 기록했다.
