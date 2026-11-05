# reverse CLI 구현 계획

## 목표
Java/Spring 및 React(TypeScript/JavaScript) 소스를 LLM이나 네트워크 없이 정적 분석하여, 근거가 연결된 아키텍처 맵, Mermaid 다이어그램, 기능별 탐색 결과를 만들고 에이전트가 적은 맥락으로 실제 코드를 찾도록 한다. Amos의 backend와 frontend를 각각 및 연계하여 분석하고 구체적 근거로 결과를 평가한다.

## 원칙과 작업 범위
- 모든 기본 분석·검색·다이어그램은 결정적 로컬 코드로 수행한다. LLM 호출, API 키, 네트워크, Ghidra/REA 설치를 필수로 하지 않는다.
- 소스가 정본이다. 직접 관찰한 사실, 정적 분석으로 추론한 관계, 미확인·미해결 사항과 커버리지를 구분한다. 근거에는 파일 경로와 위치, 가능한 경우 해시를 포함한다. 미사용 코드는 후보일 뿐 삭제 가능하다고 확정하지 않는다.
- REA는 선택적 보완재다. 기본 구현을 REA에 종속하지 않는다. 실제 지원하는 통합만 명시하고 REA 증거를 위조하지 말 것. 구현하지 않은 REA 연동은 향후 항목이라고 헬프에 명확하게 표시한다.
- 앞서 논의한 방식: 관련 경로·호출·참조·진입점으로 우선순위를 정하고, 관찰과 추론·미해결을 기록하며, 기능별 근거와 재조사 대상, 구조·흐름 다이어그램을 제공한다. 함수의 참조 수만으로 중요성을 확정하지 않는다. LLM의 해석 및 다중 에이전트 작업은 별도 절차이며 핵심 CLI가 자동 수행한다고 오인하지 않게 한다.
- Amos는 독립 Git 저장소들의 부모다. 대상 저장소의 소스와 기존 변경을 보존하고, 산출물을 reverse 프로젝트의 명시적 평가 폴더 또는 임시 디렉터리에 저장한다. 환경변수·비밀·생성 산출물·의존성은 기본 분석 범위에서 제외한다. Amos의 AGENTS.md 및 하위 지침을 따른다. 앱 실행·배포는 하지 않는다.

## 단계
1. [x] 도구와 대상 조사: Amos backend/frontend 구성, 실제 Spring 라우트와 React API 사용 예시, 빌드 설정, 파일 규모를 조사한다. 이 문서와 AGENTS.md를 읽고 기존 사용자 변경을 보존한다.
2. [x] 설계: 운영체제와 이 환경에 적합한 실행 방식 및 언어별 실제 파서를 선정한다. 정규식만으로 언어를 완전히 분석한다고 주장하지 않는다. 데이터 계약(노드·관계·소스 위치·관찰/추론·제한·누락·스냅샷)과 버전, 보관 정책을 문서화한다.
3. [x] 기본 분석 구현: Java 패키지·타입·메서드·import·Spring REST 라우트 및 확인 가능한 관계, React/TS/JS import·export·컴포넌트·클라이언트/API 호출 후보를 추출한다. Gradle 설정·package.json·tsconfig alias 등 지원 범위를 명시한다. 미해결 대상과 동적 디스패치, 복잡한 경로는 unknown으로 표현한다. 대상 경로 외부 읽기와 제외 규칙을 안전하게 처리한다.
4. [x] 저장·검색: 대상 디렉터리를 지정해 인덱스를 만들고, 파일/심볼/문자열/경로 검색, 한정된 깊이의 참조 확장, JSON 출력과 출력 제한을 제공한다. 변경·삭제·추가 파일과 미커밋 변경을 반영하고 오래된 인덱스를 표시한다. 구조화 데이터는 도구가 읽을 수 있어야 하며 필요 이상으로 원본 전체를 반환하지 않는다.
5. [x] 맵·조회: 전체/모듈 수준 Mermaid, 모듈 요약 및 질문/키워드 기반 관련 파일·근거·한계 컨텍스트를 출력한다. 정확하지 않은 크로스 언어 API 매칭을 사실로 표시하지 않는다. 함수명과 호출자 기반 고정적 점수는 근거와 한계가 있어야 하며 쓰지 않는 기능은 구현했다고 하지 않는다.
6. [x] CLI 경험: --help 및 서브커맨드 --help에 필수 인수, 경로, 출력 위치, 예제, 첫 실행→조회→갱신 순서, 확신도·한계, 코드 변경 전 원본 확인, 에이전트가 자동 참조할 수 있는 구체적 절차를 적는다. README와 에이전트용 안내 문서도 제공한다. 별도 비결정적/LLM 단계나 REA 연동은 실제 지원 유무를 정확히 문서화한다.
7. [x] 검증 및 Amos 평가: 사용자 요청에 따라 기능 검증을 수행한다. 작은 Java·React fixture에서 사실/추론·호출·경로·갱신·출력 제한과 오탐을 확인하고, Amos backend/frontend 전체를 비파괴 분석한다. 실제 코드에서 독립적으로 확인한 표본(각각 최소 5개 가능하면 API 경계 포함)을 인덱스와 대조하고 지원·누락·오탐, 커버리지·처리시간·재현 명령 및 분석 당시 변경 상태를 EVALUATION.md에 기록한다. 산출물을 암묵적으로 Amos 저장소에 쓰지 않는다. 발견한 결함은 고친 뒤 필요한 검사를 다시 수행한다.
8. [x] 마무리: 구현한 것과 미구현·제한을 구분하고 실행법, 산출물 위치, 실제 수행한 검증과 평가 결과, 남은 작업을 보고한다. PLAN.md의 각 단계를 실제 완료에 맞게 갱신한다.

## 수용 조건
- 최초 설치와 reverse --help만으로 명령 순서와 에이전트 이용법을 이해할 수 있다.
- 기본 명령은 LLM·네트워크 없이 실행된다. 경로 지정, JSON 결과, 근거·한계, 소스 재확인 및 오래된 정보 표시가 가능하다.
- Java와 React 각각의 실제 Amos 코드를 대상으로 구체적인 확인 근거가 있는 평가 보고서가 있다. 기능이 불완전하면 과장하지 않고 한계를 명시한다.
- 사용자의 Amos 프로젝트 파일 및 기존 변경 사항을 훼손하지 않는다.

## 초기 구현 단계 기록(독립 리뷰 승인 기록이 아님)

1. 대상의 루트/backend/frontend 지침, 빌드 구성(Java 21/Spring Boot, React/Vite/TypeScript), 소스와 API 스타일을 조사했다. Amos에는 파일을 쓰거나 앱을 실행하지 않았다.
2. java-parser CST와 TypeScript AST를 선택했다. README에 schema v2 계약, 근거·불확실성, 스냅샷 교체와 제외·보관 정책을 기록했다.
3. Java 선언/호출/annotation 라우트와 클래스 경로·HTTP 결합, JS/TS import/export/컴포넌트/호출/API 후보, 로컬 tsconfig aliases를 구현했다. Gradle은 파일 근거로만 다룬다. 복잡한 표현식·receiver·외부 관계는 unknown이다.
4. index/status/search/context에 JSON·해시·행 번호·추가/변경/삭제·출력 제한·0..3 깊이 참조 확장을 제공한다. 원본 전체를 저장하지 않는다.
5. summary, module/file import map, 부분 호출 flow, 두 인덱스 간 정적 HTTP boundary 후보를 제공한다. lexical ranking과 경계 추론의 한계를 문서화했다.
6. 모든 서브커맨드 help, README, AGENT_GUIDE에 실행 순서·갱신·원본 확인 절차를 기록했다. 선택적 REA는 로컬 실행 파일 발견 및 기존 명령 계획 출력만 수행하며 실제 fixture 실행 근거는 REA.md에 있다. 자동 설치/실행·LLM 단계는 없다.
7. fixture 회귀 검사와 Amos 전체 분석, 미리 수작업 선정한 backend 5개 파일/12개 라우트 및 frontend 5개 파일/11개 호출과 별도 음성 표본을 대조했다. 표본 FP/FN은 0이며 전체 정확도라고 주장하지 않는다. JSON·실행 로그·맵·변경 보존 비교는 evaluation/에 있다.
8. EVALUATION.md와 REA.md에 실제 결과, 재현 명령 및 제한을 기록했다. Java 동적 dispatch·Gradle DSL·URL 상수 전파·Vite alias·완전한 의미 분석은 지원 범위 밖/남은 개선으로 구분한다. dependency audit 고위험 7건은 lodash/lodash-es 4.18.1 overrides로 해결했고 npm ci, 테스트 8개 및 Amos 전체 재분석에서 회귀가 없음을 확인했다(DEPENDENCIES.md).

이 기록은 초기 구현 당시 지원 범위의 설명이며, 독립 리뷰 승인이나 최종 완료를 뜻하지 않는다. 전체 컴파일러 수준 호출 그래프나 실제 런타임 API 연결을 구현했다고 주장하지 않는다.

## 에이전트 활용성과 compact v3 확장

- [x] 실제 소스에서 기능 질문 4개와 양성·음성 표본을 선정하고 이전 커밋의 크기/호출/경계/검색 기준선을 보관했다. benchmark-before.mjs로 오프라인 재생성한다.
- [x] Java 필드 선언 타입·import·name/arity와 call-site/field/type/method 근거로 선언 연결을 추가했다. shadowing·동일 arity overload·외부/상속/체인 호출과 실제 Spring dispatch는 unknown이다.
- [x] React const/template/named import/Kubb 단순 URL helper를 실행 없이 추적하고 symbolic origin/parameter 및 config override 가정을 표시했다. 임의 제어 흐름·mutable/cycle·미지원 구문은 unknown이다.
- [x] 기능 context를 CamelCase/API 경로/선언 호출·import hop 기반 파일 근거로 개선하고 선택적 --other 교차 언어 후보와 unknown/자름 수량을 제공한다.
- [x] compact SQLite v3: 파일/해시/문자열/동일 payload 공유, 일부 payload 압축, scope별 상세 로딩을 구현했다. v2 JSON 읽기 및 재인덱싱 절차를 문서화했다. 증분 파싱은 미구현이며 전체 갱신 비용을 실측한다.
- [x] --all로 결과·파일 scope·바이트 상한을 해제했다. --limit의 1000 상한을 제거했다. dump 전체 노드·관계 및 map source-page/boundaryNodes로 페이지 간 관계를 열람한다. 기본 생략은 수량과 이유를 표시한다.
- [x] 제외 항목·파싱 실패·unknown 호출/API·미지원 URL 표현식 이유를 coverage에 보존했다. 전체 모드는 저장된 graph의 전체이며 런타임 완전성을 주장하지 않는다.
- [x] fixture 12개 및 전체 Amos 재분석, 원본 anchor 탐색, compact 크기/전체 갱신·조회 비용, 전체 dump/map 합계, 기존 route/API 표본을 검증했다. 실제 수치는 EVALUATION.md와 evaluation/usefulness/ JSON에 있다. 소스·Git 상태와 사용자 README npx/npm 문구를 보존했다.
- [x] 재생성 가능한 대용량 기준선 복사본·compact 인덱스는 Git 무시 경로에 두었다. 원래 사용자 파일은 삭제하지 않았다. REA 선택 워크플로·오프라인 기본 동작과 의존성 override를 보존했다.
- [x] 최초 Opus 5.5 독립 리뷰의 실제 발견사항을 전달받아 아래 14항목 수정과 재평가를 수행했다. 최종 승인은 재리뷰 뒤에 판단한다. 리뷰 세션을 직접 만들지 않는다.

실제 에이전트 전체 작업 성공률·모델 토큰 소비 절감은 실험하지 않았다. bytes/4 토큰 추정과 원본 위치 anchor 포함률만 보고한다.


## Opus 독립 리뷰 수정과 재리뷰 대기

- [x] H1–H4/M1–M6/L1–L4를 모두 읽고 전용 14개 fixture의 수정 전 실패를 기록했다. 항목별 조치/회귀 결과는 REVIEW.md와 evaluation/review/에 기록한다.
- [x] lexical declaration identity, mutable import/object unknown, helper env 격리와 import-call shadow 보호를 구현했다. spread 후보는 conditional/effectivePath=null이다.
- [x] Java inherited overload/override·불명 ancestor는 선택하지 않으며 lambda/catch와 anonymous owner를 구분했다.
- [x] incoming-call scope BFS와 context/flow 역방향 호출, search/flow 전체 query 파일 페이징, scope/byte/metadata truncation을 수정했다.
- [x] case/symlink 별칭의 대상 내부 출력은 실제 dev/inode 조상 관계로 차단했다.
- [x] 원본 graph→복원 graph의 JSON 의미·근거·unknown 비교, 참조 무결성, 검증 실패 시 기존 DB byte-identical 보존을 검사했다. source digest는 SQL 작성 전에 계산한다.
- [x] 당시 최소 Node >=24.22.2와 bootstrap/allowlist를 추가했고 마지막 R5에서 실제 하한 런타임 검증 후 >=24.0.0으로 정정했다. local pack smoke를 실행했고 remote Git/npx 설치·commit/push는 하지 않았다.
- [x] README 사용자 npx/npm 안내는 보존하면서 최소 버전/.rvx/v3 commit 선택을 정정한다. 사전 표본 시점 증명·literal 경로·토큰/작업 효과에 관한 오해를 보고서에서 제거한다.
- [x] UNDERSTAND_ANYTHING_RESEARCH.md의 작은 개선으로 graph 무결성·원자적 기준선 보존을 적용했다. LLM/hook/외부 코드를 기본 경로에 추가하지 않았다.
- [x] 수정 후 Amos 전체 재분석·회귀 27개·평가·보고서 갱신을 수행했다.
- [x] 재리뷰 발견사항 1–6을 수신해 아래와 같이 수정했다. 최종 승인은 마지막 독립 재확인 이후다.

증분은 미구현(full rebuild)이다. 후속 계획은 변경/추가/삭제/이름변경 후보·config 목록과 AST 구조 지문을 분리하고 역참조 invalidation, 모르면 full fallback을 계획한다. 동일 입력 전체 재생성과 모든 graph/unknown/근거/coverage가 의미상 일치하는 변경·삭제·이름변경·설정·실패 복구 fixture가 통과하기 전에는 증분 기능이라고 표시하지 않는다.


## 마지막 Opus 재리뷰 1–6

- [x] R1: owner 없는 Java field/lambda/static/instance initializer의 shadow 근거를 보존·검사한다.
- [x] R2: HTTP 인수 역할을 공유 httpShape로 구분하여 axios 본문 url/method를 설정으로 오인하지 않는다.
- [x] R3: 사전 필터에 원래 이름을 포함해 case-insensitive 부분 일치와 --all의 결과를 일치시켰다.
- [x] R4: 핸들된 실패의 temp DB/sidecar를 정리하고 기존 인덱스를 보존한다. 파일 fsync를 추가했지만 전원 차단·디렉터리 내구성은 미검증이다.
- [x] R5: 공식 SHA로 확인한 Node 24.0.0과 현재 24.22.2에서 33개 전체 회귀를 실행했다. 검증한 floor >=24.0.0으로 engines/bootstrap/사용자 설치 안내를 정정했다.
- [x] R6: context/boundary/evaluation 경계 후보에 같은 분류와 matched-pair 분모를 표시했다.
- [x] Amos 전체 재분석·원본→복원 의미 검증·실제 영향 및 비용 보고를 수행했다. 각 재현과 결과는 evaluation/rereview/에 기록했다. 기존 npx/npm 절차·사용자 조사 문서·Amos 원본은 보존했다.
- [x] 별도 Opus 5.5 세션이 재리뷰 1–6을 재현해 해결 여부를 확인했다. 상세 및 미검증 범위는 REVIEW.md와 evaluation/rereview/opus-final.md에 기록했다.
