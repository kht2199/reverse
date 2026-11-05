# 에이전트 사용 절차

1. 대상의 AGENTS.md를 읽는다. 분석 산출물은 대상 외부 reverse 프로젝트에 둔다. Amos는 읽기 전용이다.
2. `node cli.mjs index --help`를 읽고 backend/frontend를 각각 index한다. 이후 모든 명령도 자체 --help를 제공한다.
3. 질문마다 status를 실행한다. stale이면 동일 root/out으로 재생성한다. parse/config errors와 unknown의 존재를 확인한다.
4. summary로 모듈을 고르고, search --kind symbol|file|path|string 또는 context --query "질문에 나온 코드 용어" --depth 1 --limit 20으로 근거를 얻는다. 결과가 잘리면 query/module을 좁힌다.
5. map은 import 구조, flow는 구문 포함과 부분 호출 대상 추론을 제공한다. boundary는 backend --index / frontend --other로 정적 후보만 제공한다.
6. evidence의 file/line과 hash를 원본과 대조한다. observed 구문과 inferred 관계, unknown을 보고서에서 구분한다. 동적 경로는 실제 호출 API라고 확정하지 않는다. 소스 확인 없이 수정하거나 미사용 후보를 삭제하지 않는다.
7. 해석/설계는 이 결과를 읽는 별도 에이전트 단계다. reverse는 LLM·REA·자동 다중 에이전트 작업을 실행하지 않는다. 남은 불확실성은 추가 원본 조사 질문으로 기록한다.

실행 예제 및 저장 계약은 README.md, Amos의 실제 결과와 한계는 EVALUATION.md에 있다.

선택적 배포 JS/Electron 조사: `rea-plan --root DIR --out NEW_EVIDENCE.json`으로 로컬 REA 유무를 확인한다. available=false이면 기본 절차를 계속 쓴다. true이면 REA.md에 따라 기존 분석/Evidence 명령을 직접 호출한다. 자동 설치·setup은 수행하지 않는다.

## 기능 추적과 compact v3

새 인덱스는 `.rvx`로 만든다. JSON v2는 읽기 호환만 제공하므로 requiresReindex를 확인하고 재생성한다. context --query getMetrics --depth 2는 Controller→선언된 Service→Repository의 근거와 unknown 후보를 반환한다. --other FRONTEND.rvx로 UI/API 경계 후보를 같이 조사한다. 필드 선언 타입과 유일한 name/arity 연결은 inferred이며 Spring 실제 주입 구현체 선택을 증명하지 않는다.

기본 context는 파일별 요약·참조·관계와 UTF-8 16,000바이트 예산을 사용한다. total/truncated, output.byteTruncated, relationsTruncated, referencesTruncated, loadCoverage를 확인한다. --all은 파일 선택·건수·바이트 제한을 해제하고 --max-bytes 0은 바이트 예산만 해제한다. 전체 저장 노드/관계는 dump --all, 전체 모듈 맵은 map --relation all --all로 얻는다. 큰 결과를 무조건 모델에 붙이지 말고 원본 위치 조사와 선택적 필터를 사용한다.

coverage의 제외 경로·파싱 실패·unknown 수를 함께 보고한다. 0개 match는 분석 실패나 런타임 부재를 뜻하지 않는다. 토큰/작업 성공 절감은 실제 에이전트 실험이 없으면 주장하지 않는다.


Opus 리뷰 후 주의: path는 선언 식의 후보다. spread config 후보는 conditional/effectivePath=null이며 실제 호출 경로로 확정하면 안 된다. 상속 overload/override와 외부 ancestor도 unknown을 유지한다. context의 totalIsExact/scopeTruncated와 coverage 배열의 *Total/*Truncated를 확인한다. search/flow는 모든 query 일치 파일에 대해 페이징한다. 이전 v3 encoding은 새 index 명령으로 재생성한다. Node.js >=24.0.0(24.0.0/24.22.2에서 실제 전체 회귀 확인)가 필요하다.

최종 재리뷰: crossLanguage 분류와 matched-pair 분모를 함께 읽는다. conditional 후보를 실제 경로로 확정하지 않는다. Java owner 없는 초기화 문맥도 shadow 검사를 한다. 저장 실패 cleanup은 핸들된 예외 범위이며 전원 차단 내구성 실험은 하지 않았다.
