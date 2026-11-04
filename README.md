# reverse

Java/Spring과 React(TypeScript/JavaScript)를 LLM 없이 분석하는 로컬 CLI다. Java는 java-parser CST, JS/TS는 TypeScript AST를 사용한다. 설치에는 npm 네트워크가 필요하지만 분석·검색·맵 명령에는 네트워크나 API 키가 필요 없다. Node 24에서 평가했다.

## 설치 및 단계

```sh
npm ci --ignore-scripts
node cli.mjs --help
# 선택: npm link 후 reverse 사용
```

1. 대상별 인덱스를 만든다. 출력은 대상 디렉터리 외부에 명시한다.

```sh
node cli.mjs index --root ~/IdeaProjects/amos/backend --out evaluation/backend.json
node cli.mjs index --root ~/IdeaProjects/amos/frontend --out evaluation/frontend.json
```

2. 상태·모듈을 확인하고 관련 근거를 찾는다.

```sh
node cli.mjs status --index evaluation/backend.json
node cli.mjs summary --index evaluation/backend.json --module cache
node cli.mjs search --index evaluation/backend.json --kind symbol --query evictCache --limit 10
node cli.mjs search --index evaluation/frontend.json --kind string --query axios.get --limit 10
node cli.mjs context --index evaluation/backend.json --query "cache evict" --depth 1 --limit 20
```

3. 구조와 흐름을 확인한다. Mermaid는 stdout으로 출력한다. JSON이 필요하면 `--format json`을 쓴다.

```sh
node cli.mjs map --index evaluation/backend.json --level module --limit 50 > evaluation/backend.mmd
node cli.mjs map --index evaluation/frontend.json --level file --module src/pages --limit 50
node cli.mjs flow --index evaluation/backend.json --query CacheController --limit 30
node cli.mjs boundary --index evaluation/backend.json --other evaluation/frontend.json --limit 20
```

4. `file:line` 원본을 열고 해시·선언·호출 문맥을 확인한 다음 변경한다. 코드·구성이 바뀌면 status 후 같은 index 명령을 다시 실행한다. 스냅샷은 전체 재생성되며 삭제된 파일도 제거한다.

모든 서브커맨드는 `--help`에 필수 인수·예제·에이전트 순서·한계를 포함한다. 인덱스/출력 경로는 현재 디렉터리 기준이다. JSON 결과는 기본 20건, `--limit 1..1000`으로 제한한다. `map`은 선택한 노드 사이 import, `flow`는 선택한 노드의 포함/호출 관계를 그린다. 맵 밖 관계는 생략하므로 전체 그래프로 오인하면 안 된다. string 검색은 변경·삭제된 파일을 건너뛰고 snapshot hash와 일치하는 현재 원본에서 최대 300자짜리 줄을 반환한다.

## 근거와 불확실성

- `observed`: CST/AST에서 직접 읽은 패키지·타입·메서드·import/export·호출 구문.
- `inferred`: 정적으로 해석한 import, 같은 클래스/파일의 유일한 이름을 가진 호출 대상, 대문자 함수 기반 컴포넌트 후보, Spring 경로와 HTTP 클라이언트 후보.
- `unknown`: 동적 경로, 외부 import, 오버로드·receiver·chained 호출 등 해석하지 못한 대상. `to: null`, `path: null` 및 reason으로 남긴다.

Java는 메서드 선언과 호출을 CST로 구분하고 Spring annotation의 HTTP 메서드·리터럴 배열·클래스 prefix를 결합한다. import 안의 GetMapping 이름은 라우트가 아니다. 상수 표현식·커스텀 meta annotation·인터페이스 라우트 상속은 해석하지 않는다. 반환형/타입 체커·DI·실행 순서는 모델링하지 않는다. 호출 추론은 overload, lexical shadowing, 상속을 증명하지 않는다.

TS는 상대 import와 로컬 tsconfig paths/baseUrl, 상대 extends를 읽는다. 여러 tsconfig 후보가 서로 다른 파일을 가리키면 unknown이다. include/exclude와 references별 정확한 프로젝트 귀속·외부 npm exports·Vite alias는 해석하지 않는다. 외부 구성 경로는 읽지 않는다. package.json 및 Gradle settings/build 파일은 해시·경로 근거로 보관하며 실행하거나 의존성 DSL을 평가하지 않는다.

API 후보는 axios/fetch 호출 또는 method/url 객체 설정으로 제한한다. 일반 getBoundingClientRect, pluginClient, self.clients.claim은 API가 아니다. 이름이 바뀐 axios 인스턴스나 wrapper는 누락될 수 있고 fetch라는 사용자 정의 함수는 후보가 될 수 있다. URL 상수 전파와 생성 클라이언트 URL helper는 미지원이다. boundary는 두 snapshot의 리터럴 메서드/경로 후보만 비교한다. 동일 경로여도 base URL·인증·서버 소유권이 검증된 것은 아니다.

모듈은 Java package, JS/TS의 디렉터리(일반적으로 src 아래 두 단계)로 묶는다. context는 일치한 단어 수 순서, 경로·행 번호 순으로 정렬한다. 호출자 수를 중요도나 미사용 판정으로 쓰지 않는다. depth는 현재 frontier를 기준으로 import와 해석 가능한 call 관계를 양방향으로 0..3회 확장한다. 동일 파일의 추가 근거도 제한된 출력 안에서 제공한다. 자연어 의미 해석은 하지 않으므로 도메인 동의어는 사용자가 query에 추가한다.

LLM 해석은 결과와 원본을 읽는 에이전트의 별도 수동 단계다. 자동 에이전트 실행·바이너리 분석은 구현하지 않았다. `rea-plan`은 기존 로컬 REA를 발견해 선택적 직접 호출/Evidence 조회 절차만 출력한다. 자동 다운로드·setup·실행은 하지 않는다. 실제 확인 결과와 정확한 절차는 [REA.md](REA.md)에 있다.

## 데이터 계약과 보관

JSON schemaVersion=2. `snapshot`은 상대 file/hash(SHA-256), `nodes`는 snapshot 내부 id/kind/name/file/line/hash/evidence와 종류별 owner/path/httpMethod, `edges`는 kind/from/to/evidence와 file/line/specifier/callee/reason을 담는다. import의 from/to는 파일 경로이고 call의 from/to는 노드 id다. owner는 노드 id다. 행은 1부터 시작한다. ID는 스냅샷 간 안정성을 보장하지 않는다. root는 절대 경로이고 createdAt/elapsedMs는 실행 메타데이터다. errors와 limitations를 항상 함께 참조한다.

스냅샷에는 원본 전체를 넣지 않는다. API expression 등 짧은 구문은 들어갈 수 있으므로 소스와 같은 수준으로 취급한다. 기본 보관은 같은 --out 덮어쓰기이며 이력·자동 삭제·캐시는 없다. 재현 보관은 명시적으로 파일을 복사한다. schema 변경 시 재인덱싱한다.

심볼릭 링크는 파일·디렉터리 모두 순회하지 않는다. 숨김 파일, 환경 파일, secret/credential/private-key 이름, node_modules, build/dist/target/out/coverage/vendor/generated, .d.ts를 제외한다. 규칙 밖의 생성 코드나 테스트 코드는 포함될 수 있다. 디렉터리 밖 출력 경로만 허용하고 출력 symlink도 거부한다. 인덱싱 시 소스는 읽기만 한다. 원본이 분석 중 바뀔 수 있으므로 status를 재확인한다.

## 검증과 실제 평가

```sh
npm test
node evaluate.mjs
```

[EVALUATION.md](EVALUATION.md)에 Amos 표본 선정·대조, 실제 처리시간, 알려진 누락과 제한을 기록했다. [evaluation/expected.json](evaluation/expected.json)은 원본에서 미리 정한 정답이다. 실제 인덱스·맵·컨텍스트·Git 상태·테스트 로그는 로컬 evaluation/ 아래에 있다. 대용량 backend.json과 frontend.json 인덱스는 Git에 포함하지 않으며 위 index 명령으로 다시 만든다. 자동 검사에서 다루지 않은 전체 정확도를 주장하지 않는다. lodash/lodash-es 4.18.1 overrides를 적용하고 npm ci 후 npm audit 전체 취약점 0건을 확인했다. 범위와 호환성 검증은 [DEPENDENCIES.md](DEPENDENCIES.md), 감사 원본은 evaluation/npm-audit.json에 있다.
