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
