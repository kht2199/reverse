# 선택적 REA 워크플로 및 실제 확인

REA의 JavaScript application graph와 Evidence 저장·조회 기능은 배포 JavaScript/Electron 조사와 후속 근거 조회에 유용하다. 따라서 해당 기능을 reverse에서 다시 구현하거나 REA Evidence를 자체 스키마인 것처럼 변환하지 않고 기존 CLI를 직접 쓰는 선택적 워크플로를 제공한다. Java/Spring 소스 라우트와 저장소 중심 검색·갱신·alias 분석은 reverse의 기본 오프라인 경로를 유지한다.

공식 [CLI/Evidence 문서](https://github.com/morluto/rea/blob/main/docs/cli.md)와 [JavaScript artifact 문서](https://github.com/morluto/rea/blob/main/docs/javascript-artifact-reconstruction.md)를 확인했다. 실제 설치한 버전의 --help도 evaluation/rea-help.txt와 rea-javascript-help.txt에 저장했다. 공식 main과 배포 버전이 다를 수 있으므로 설치 버전의 도움말이 실행 인수의 기준이다.

## 설치 여부별 동작

```sh
node cli.mjs rea-plan --root /absolute/frontend --out /absolute/reverse/evaluation/rea-evidence.json
# 별도 설치가 이미 있는 경우 명시 가능
node cli.mjs rea-plan --root /absolute/frontend --out /absolute/reverse/evaluation/rea-evidence.json --rea-bin /existing/path/node_modules/.bin/rea
```

- 미설치: available=false, evidenceCommand=null. 다운로드·npx·setup·실행이 없고 기본 index/search/context/map/flow를 그대로 사용한다.
- 설치: PATH의 rea/rea-agents 또는 명시한 로컬 실행 파일을 찾아 available=true와 argv 배열, viewRequest를 출력한다. 명령을 실행하거나 Evidence 파일을 만들지는 않는다. 패키지 버전과 도움말을 확인한 뒤 사용자가 직접 호출한다.
- --out은 아직 존재하지 않는 대상 밖 Evidence 경로여야 한다. REA evidence_output은 덮어쓰지 않으므로 재실행에는 새 경로를 지정한다.

## 기존 명령 직접 실행

```sh
# 로컬 rea가 이미 설치된 경우에만 사용. out 디렉터리는 먼저 준비한다.
rea analyze-javascript-application /absolute/frontend --detail summary --evidence_output /absolute/reverse/evaluation/rea-evidence.json --json > /absolute/reverse/evaluation/rea-summary.json
```

전체 Evidence는 클 수 있으므로 summary를 먼저 읽는다. 정확한 파일만 조사하려면 `--source-path src/path/App.tsx`를 추가한다. 이 옵션은 의존 파일을 자동 포함하지 않아 다른 파일 관계가 unknown으로 남는다. 원본에서 제외해야 할 파일이 있으면 먼저 별도의 검토된 입력 디렉터리를 만들어 사용한다. reverse의 제외 규칙을 REA도 동일하게 적용한다고 가정하지 않는다.

rea-plan의 viewRequest를 `/absolute/reverse/evaluation/view-request.json`으로 저장한다. 파일 내용 예:

```json
{"source":{"kind":"evidence-file","path":"/absolute/reverse/evaluation/rea-evidence.json"},"view":{"kind":"summary"}}
```

```sh
rea inspect-analysis-view /absolute/reverse/evaluation/view-request.json --json > /absolute/reverse/evaluation/rea-view.json
```

이 과정은 REA 자체 Evidence 인증·projection을 재사용한다. REA Evidence와 reverse snapshot은 서로 다른 계약이다. 경로/해시/원본을 확인하며 별도로 읽고 불확실성·coverage를 보존한다. REA 결과를 reverse의 observed 노드라고 주장하지 않는다. Java 소스나 React의 전체 의미·실행 흐름 지원을 보장하지 않는다.

## 이 환경의 실제 결과

초기 PATH에는 rea가 없었다. 사용자 승인 범위에서 `npm install --prefix TEMP --ignore-scripts --no-audit --no-fund rea-agents@6.8.0`으로 임시 경로에 176개 패키지를 설치했다. 전역 설치·setup·에이전트 설정 변경은 하지 않았다. 임시 경로는 evaluation/rea-temp-path.txt에 남겼으며 임시 파일은 영구 설치로 간주하면 안 된다. Node v24.22.2에서 확인했다.

- JS fixture: format.js/index.js/package.json에 대해 analyze-javascript-application 종료 0, Evidence 저장 성공. inspect-analysis-view 종료 0, summary의 parent_evidence_id를 보존한 조회 성공.
- TSX fixture: 타입 주석과 JSX가 있는 App.tsx를 --source-path로 선택. 종료 0, parsed_javascript_files=1, parse_failures=0. 미선택 파일 때문에 graph coverage=partial. 이 검사는 React 프로젝트 전체 지원을 입증하지 않는다.
- 실제 JSON: rea-fixture-evidence.json, rea-fixture-summary.json, rea-view.json, rea-tsx-evidence.json, rea-tsx-summary.json. REA 기본 missing/present 계획 결과도 rea-absent-plan.json, rea-present-plan.json에 보관했다.
- REA로 Amos 전체 분석은 수행하지 않았다. Amos 전체 소스 평가는 reverse로 수행했고 REA 동작은 격리 fixture로 검증했다.

기본 명령은 이 임시 설치나 네트워크와 무관하게 동작한다. reverse는 REA를 자동 호출·설치하지 않는다. 네이티브 도구 설치와 LLM은 이 워크플로에 필요하지 않았다.
