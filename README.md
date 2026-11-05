# reverse

Java/Spring과 React(TypeScript/JavaScript)를 LLM 없이 분석하는 로컬 CLI다. Java는 java-parser CST, JS/TS는 TypeScript AST를 사용한다. 설치에는 npm 네트워크가 필요하지만 분석·검색·맵 명령에는 네트워크나 API 키가 필요 없다. Node.js 24.22.2에서 평가했다. 최소 지원 버전은 실제 회귀를 통과한 24.0.0이며 package engines와 SQLite import 이전 부트스트랩이 검사한다.

## 다른 프로젝트에서 사용

GitHub 저장소는 비공개이므로 Git이 `https://github.com/kht2199/reverse.git`을 읽을 수 있도록 인증해야 한다. 아래 예시는 Node.js 24.0.0 이상과 npm을 기준으로 하며, 설치할 때는 네트워크가 필요하다. 분석 자체는 LLM이나 네트워크 없이 실행된다. 인덱스 출력 경로는 분석 대상 디렉터리 바깥이어야 한다.

### npx로 일회성 실행

별도 전역 설치 없이 Git 저장소의 CLI를 실행한다. `--package`는 패키지를 지정하고 그 뒤의 `reverse`는 실행할 명령이다.

```sh
cd /path/to/my-project
mkdir -p ~/.cache/reverse

npx --yes --package='git+https://github.com/kht2199/reverse.git' reverse --help
npx --yes --package='git+https://github.com/kht2199/reverse.git' reverse index \
  --root "$PWD" --out "$HOME/.cache/reverse/my-project.rvx"
npx --yes --package='git+https://github.com/kht2199/reverse.git' reverse context \
  --index "$HOME/.cache/reverse/my-project.rvx" --query "order create" --depth 1
```

Git URL에 `#<commit>`을 붙이면 사용할 커밋을 고정할 수 있다. 아래 CLI 변경이 아직 커밋되지 않았다면 원격 Git/npx에 반영된 상태가 아니다. 예시의 `<commit>`은 이 v3 변경을 포함하고 리뷰·커밋된 실제 해시로 바꾼다. `6da74ec`는 비교용 v2 기준선이므로 현재 v3 기능 설치용으로 쓰지 않는다. 커밋을 지정하지 않으면 기본 브랜치가 바뀔 때 설치되는 코드가 달라질 수 있다. `npx`는 필요한 패키지가 캐시에 없으면 다운로드하므로, 매 실행의 오프라인 동작을 보장하려면 다음의 로컬 의존성 방식을 사용한다.

### npm 개발 의존성으로 추가

npm 프로젝트의 루트에서 Git 저장소를 개발 의존성으로 추가한다. 팀에서 재현하려면 `<commit>`을 원하는 실제 커밋 해시로 바꾸고 생성된 lockfile을 함께 관리한다.

```sh
cd /path/to/my-project
npm install --save-dev 'git+https://github.com/kht2199/reverse.git#<commit>'
mkdir -p ~/.cache/reverse

npm exec -- reverse --help
npm exec -- reverse index --root "$PWD" --out "$HOME/.cache/reverse/my-project.rvx"
npm exec -- reverse status --index "$HOME/.cache/reverse/my-project.rvx"
npm exec -- reverse context --index "$HOME/.cache/reverse/my-project.rvx" --query "order create" --depth 1
npm exec -- reverse map --index "$HOME/.cache/reverse/my-project.rvx" --level module > "$HOME/.cache/reverse/my-project.mmd"
```

설치된 실행 파일은 `./node_modules/.bin/reverse`로도 사용할 수 있다. 코드나 구성이 바뀌면 `status`를 확인하고 같은 `index` 명령을 다시 실행한다. CLI는 키워드 기반으로 관련 근거를 찾으므로 에이전트는 반환된 파일과 행의 현재 원본을 확인한 뒤 수정해야 한다.

**의존성 override 주의:** npm은 의존 패키지 자체의 `overrides`를 적용하지 않는다. 따라서 위 npx·개발 의존성 방식에서는 이 저장소의 `lodash`/`lodash-es` override와 독립 저장소 lockfile이 그대로 적용된다고 가정하면 안 된다. 개발 의존성 방식에서 동일하게 고정하려면 사용하는 프로젝트 루트의 기존 `overrides`에 아래 항목을 병합하고 lockfile을 갱신한다. 프로젝트의 다른 의존성에도 적용되므로 호환성을 확인한다.

```json
{
  "overrides": {
    "lodash": "4.18.1",
    "lodash-es": "4.18.1"
  }
}
```

일회성 npx 실행에는 호출 프로젝트의 lockfile 및 override가 동일하게 적용된다고 가정하지 않는다. 의존성 버전을 고정해야 한다면 개발 의존성 방식이나 아래의 독립 체크아웃 방식을 사용한다.

## 독립 체크아웃에서 설치 및 분석 단계

```sh
npm ci --ignore-scripts
node cli.mjs --help
# 선택: npm link 후 reverse 사용
```

1. 대상별 인덱스를 만든다. 출력은 대상 디렉터리 외부에 명시한다.

```sh
node cli.mjs index --root ~/IdeaProjects/amos/backend --out evaluation/backend-v3.rvx
node cli.mjs index --root ~/IdeaProjects/amos/frontend --out evaluation/frontend-v3.rvx
```

2. 상태·모듈을 확인하고 관련 근거를 찾는다.

```sh
node cli.mjs status --index evaluation/backend-v3.rvx
node cli.mjs summary --index evaluation/backend-v3.rvx --module cache
node cli.mjs search --index evaluation/backend-v3.rvx --kind symbol --query evictCache --limit 10
node cli.mjs search --index evaluation/frontend-v3.rvx --kind string --query axios.get --limit 10
node cli.mjs context --index evaluation/backend-v3.rvx --query "cache evict" --depth 1 --limit 20
```

3. 구조와 흐름을 확인한다. Mermaid는 stdout으로 출력한다. JSON이 필요하면 `--format json`을 쓴다.

```sh
node cli.mjs map --index evaluation/backend-v3.rvx --level module --limit 50 > evaluation/backend.mmd
node cli.mjs map --index evaluation/frontend-v3.rvx --level file --module src/pages --limit 50
node cli.mjs flow --index evaluation/backend-v3.rvx --query CacheController --limit 30
node cli.mjs boundary --index evaluation/backend-v3.rvx --other evaluation/frontend-v3.rvx --limit 20
```

4. `file:line` 원본을 열고 해시·선언·호출 문맥을 확인한 다음 변경한다. 코드·구성이 바뀌면 status 후 같은 index 명령을 다시 실행한다. 스냅샷은 전체 재생성되며 삭제된 파일도 제거한다.

모든 서브커맨드는 `--help`에 필수 인수·예제·에이전트 순서·한계를 포함한다. 인덱스/출력 경로는 현재 디렉터리 기준이다. 기본 결과 페이지는 20건이다. `--limit N`에 고정 최대값은 없고 `--all`로 건수·선택 파일·바이트 제한을 해제한다. `--offset N`은 dump/search/summary/map의 다음 페이지를 선택한다. context의 기본 예산은 UTF-8 16,000바이트이며 `--max-bytes 0`으로 해제한다. 모든 생략은 total/truncated/nextOffset, output.byteTruncated, loadCoverage로 표시한다. `map`은 선택한 노드 사이 import, `flow`는 선택한 노드의 포함/호출 관계를 그린다. 맵 밖 관계는 생략하므로 전체 그래프로 오인하면 안 된다. string 검색은 변경·삭제된 파일을 건너뛰고 snapshot hash와 일치하는 현재 원본에서 최대 300자짜리 줄을 반환한다.

## 근거와 불확실성

- `observed`: CST/AST에서 직접 읽은 패키지·타입·메서드·import/export·호출 구문.
- `inferred`: 정적으로 해석한 import, 같은 클래스/파일의 유일한 이름을 가진 호출 대상, 대문자 함수 기반 컴포넌트 후보, Spring 경로와 HTTP 클라이언트 후보.
- `unknown`: 동적 경로, 외부 import, 오버로드·receiver·chained 호출 등 해석하지 못한 대상. `to: null`, `path: null` 및 reason으로 남긴다.

Java는 메서드 선언과 호출을 CST로 구분하고 Spring annotation의 HTTP 메서드·리터럴 배열·클래스 prefix를 결합한다. import 안의 GetMapping 이름은 라우트가 아니다. 상수 표현식·커스텀 meta annotation·인터페이스 라우트 상속은 해석하지 않는다. 필드 선언 타입과 import/package, 메서드명·인수 개수가 유일하게 맞는 선언을 연결하며 field/type/method 근거를 제공한다. 인터페이스 메서드 선언은 연결해도 실제 구현체 dispatch는 unknown이다. 동일 arity overload, 람다/catch/지역 변수 가려짐은 unknown이다. 상위 타입에 같은 이름의 메서드가 있거나 상위 타입을 해석할 수 없으면 inherited overload/override 가능성을 남기고 하나를 선택하지 않는다. 익명 클래스 메서드는 별도 owner를 갖는다. 체인 호출·외부 타입·반환형 분석은 해결하지 않는다. Spring bean 선택이나 실제 실행 순서를 증명하지 않는다.

TS는 상대 import와 로컬 tsconfig paths/baseUrl, 상대 extends를 읽는다. 여러 tsconfig 후보가 서로 다른 파일을 가리키면 unknown이다. include/exclude와 references별 정확한 프로젝트 귀속·외부 npm exports·Vite alias는 해석하지 않는다. 외부 구성 경로는 읽지 않는다. package.json 및 Gradle settings/build 파일은 해시·경로 근거로 보관하며 실행하거나 의존성 DSL을 평가하지 않는다.

API 후보는 axios/fetch 호출 또는 method/url 객체 설정으로 제한한다. 일반 getBoundingClientRect, pluginClient, self.clients.claim은 API가 아니다. 이름이 바뀐 axios 인스턴스나 wrapper는 누락될 수 있고 fetch라는 사용자 정의 함수는 후보가 될 수 있다. lexical binding 단위로 immutable primitive const, 템플릿·문자열 결합, 별도 파일의 immutable named export, 단순 반환/object/new URL/toString 기반 Kubb helper를 실행 없이 추적한다. 매개변수·destructuring·loop·catch 바인딩의 가려짐을 검사한다. 일반 객체 상수는 외부 변경/escape 안전성을 증명하지 못하므로 property 경로를 unknown으로 남기고, 제한된 pure helper 내부의 fresh local object만 평가한다. 환경 prefix·helper 인수는 symbolic 가정으로 남기고 mutable binding·임의 제어 흐름/side effect helper는 unknown이다. 요청 spread config가 method/url을 바꿀 수 있으면 requestOverrideUnknown=true와 pathResolution=conditional을 표시한다. path는 원래 선언 식의 후보이며 effectivePath=null이다. 환경/동적 parameter도 effectivePath=null로 남긴다. literal 분류도 실제 HTTP 호출이나 서버 연결 성공을 뜻하지 않는다. boundary는 두 snapshot의 정적·symbolic 메서드/경로 후보를 비교한다. 동일 경로여도 base URL·인증·서버 소유권이 검증된 것은 아니다.

모듈은 Java package, JS/TS의 디렉터리(일반적으로 src 아래 두 단계)로 묶는다. context는 literal/CamelCase/API 경로·마지막 segment 일치와 선언 호출/import hop을 합쳐 파일별 근거를 다양하게 반환한다. 테스트 파일에는 낮은 점수를 주며 호출자 수를 중요도나 미사용 판정으로 쓰지 않는다. --depth N은 음이 아닌 hop 수이고 기본은 2다. context의 기본 선택은 이름·경로 metadata-ranked seed 24파일과 확장 80파일이며 생략 수/이유가 loadCoverage에 표시된다. --all은 이 선택 제한까지 해제한다. search/flow는 query의 모든 일치 파일을 대상으로 건수 페이징하며 24파일 cap을 사용하지 않는다. context의 범위가 제한됐으면 totalIsExact=false/scopeTruncated=true와 loadCoverage를 함께 표시한다. 파일별 references는 기본 3개이며 referencesTotal/referencesTruncated를 표시하고 --all에서 모두 반환한다. --other INDEX를 주면 다른 언어의 관련 파일과 경계 후보도 표시한다. 자연어 의미 해석은 하지 않으므로 도메인 동의어는 사용자가 query에 추가한다.

LLM 해석은 결과와 원본을 읽는 에이전트의 별도 수동 단계다. 자동 에이전트 실행·바이너리 분석은 구현하지 않았다. `rea-plan`은 기존 로컬 REA를 발견해 선택적 직접 호출/Evidence 조회 절차만 출력한다. 자동 다운로드·setup·실행은 하지 않는다. 실제 확인 결과와 정확한 절차는 [REA.md](REA.md)에 있다.

## 데이터 계약과 보관

저장 형식 storageVersion=3/encodingRevision=2는 Node.js 24.0.0 이상의 내장 SQLite를 쓰며 `.rvx` 확장자를 권장한다. 파일 경로·SHA-256은 files 테이블에서 한 번 보관하고 노드/관계는 파일·문자열 ID를 참조한다. 동일 payload를 공유하고 큰 ancillary JSON만 개별 압축한다. 호출 이름·위치는 노드에서 복원하며 파일 근거의 참조도 정규화한다. 디렉터리 밖 임시 DB를 완성한 뒤 원자적으로 교체한다. 원본 중복을 줄이는 저장 방식이지 전체 결과를 모델에 보내도록 요구하는 압축 파일이 아니다.

조회 JSON은 materialized evidence schemaVersion=2와 storageVersion=3을 함께 표시하며 기존 file/line/hash 및 observed/inferred/unknown 계약을 유지한다. import from/to는 파일 경로, call from/to와 owner는 snapshot 내 노드 ID다. pathProof/assumptions, call proof/candidates는 추론의 추가 근거다. 노드 ID는 재생성 간 안정성을 보장하지 않는다. schema v2 JSON 및 이전 v3 encoding도 읽지만 requiresReindex=true이며 새 기능은 재인덱싱해야 생긴다. 이전 v3 encoding은 빈 값/필드 존재를 정규화하던 형식이라 이미 생략된 구분을 복원할 수 없다. 새 writer는 저장 전 원본 graph의 의미 해시와 복원 graph를 검증한 후에만 교체한다. null/빈 candidates/callee/필드 존재와 proof/unknown reason을 보존한다. 기존 JSON을 직접 변환하지 말고 동일 root로 외부 `.rvx`를 새로 만든다. 파일명 확장자가 `.json`이어도 새 index 명령의 출력 내용은 SQLite이므로 JSON.parse하지 않는다.

status/summary/map은 요약·파일 메타데이터를, boundary는 API/route 노드만 읽는다. context/search/flow는 이름 메타데이터로 범위를 고른 후 선택한 파일의 상세 노드·관계 payload를 읽는다. 이름·파일 메타데이터는 전체 스캔하며 stale 확인도 전체 소스 해시를 읽으므로 범위 로딩이 조회 시간의 비례 감소를 보장하지 않는다. --all과 dump는 전체 graph를 메모리에 올릴 수 있다. 전체 갱신이며 증분 파싱은 구현하지 않았다. 추가·수정·삭제·tsconfig/Gradle/package 변경은 status로 확인하고 index를 재실행한다. 실측 갱신/조회 비용은 EVALUATION.md에 있다.

스냅샷에는 원본 전체를 넣지 않는다. API expression 등 짧은 구문은 들어갈 수 있으므로 소스와 같은 수준으로 취급한다. 기본 보관은 같은 --out 덮어쓰기이며 이력·자동 삭제·캐시는 없다. 재현 보관은 명시적으로 파일을 복사한다. schema 변경 시 재인덱싱한다.

심볼릭 링크는 파일·디렉터리 모두 순회하지 않는다. 숨김 파일, 환경 파일, secret/credential/private-key 이름, node_modules, build/dist/target/out/coverage/vendor/generated, .d.ts를 제외한다. 규칙 밖의 생성 코드나 테스트 코드는 포함될 수 있다. 디렉터리 밖 출력 경로만 허용하고 출력 symlink도 거부한다. 인덱싱 시 소스는 읽기만 한다. 원본이 분석 중 바뀔 수 있으므로 status를 재확인한다.

## 검증과 실제 평가

```sh
npm test
node evaluate.mjs
node evaluate-usefulness.mjs
```

[EVALUATION.md](EVALUATION.md)에 Amos 표본 선정·대조, 실제 처리시간, 알려진 누락과 제한을 기록했다. [evaluation/expected.json](evaluation/expected.json)은 원본에서 미리 정한 정답이다. 실제 인덱스·맵·컨텍스트·Git 상태·테스트 로그는 로컬 evaluation/ 아래에 있다. 대용량 backend.json과 frontend.json 인덱스는 Git에 포함하지 않으며 위 index 명령으로 다시 만든다. 자동 검사에서 다루지 않은 전체 정확도를 주장하지 않는다. lodash/lodash-es 4.18.1 overrides를 적용하고 npm ci 후 npm audit 전체 취약점 0건을 확인했다. 범위와 호환성 검증은 [DEPENDENCIES.md](DEPENDENCIES.md), 감사 원본은 evaluation/npm-audit.json에 있다.

## 누락 없이 전체 열람

```sh
node cli.mjs dump --index evaluation/backend-v3.rvx --all > /tmp/reverse-backend-full.json
node cli.mjs dump --index evaluation/backend-v3.rvx --kind edge --limit 100 --offset 0
node cli.mjs map --index evaluation/backend-v3.rvx --relation all --all > /tmp/reverse-full.mmd
node cli.mjs map --index evaluation/backend-v3.rvx --relation all --limit 20 --offset 20 --json
node cli.mjs context --index evaluation/backend-v3.rvx --other evaluation/frontend-v3.rvx --query getMetricHistory --all
```

dump의 node/edge 합계는 저장 데이터 전체와 일치하며 unknown도 포함한다. map은 페이지 source에 속한 모든 관계를 반환하고 페이지 밖 target은 boundaryNodes로 표시한다. source 페이지를 모두 모으면 페이지 사이 관계도 누락되지 않는다. `map --query`/`--module`은 선택적 필터다. flow는 요청 hop 안의 호출 흐름이며 전체 저장 데이터 열람은 dump --all을 쓴다.

coverage에 source/config 파일 수, 제외 항목 수/이유, parseFailureFiles, unknownCalls/unknownApiPaths와 이유를 담는다. `status --all`/`dump --all`로 제외 경로 목록도 본다. 제외 디렉터리의 자손은 순회하지 않으므로 제외된 내부 파일 수는 unknown이다. 0개 검색 결과와 파싱 실패·범위 생략을 구분해야 한다. 전체 모드는 조사한 graph를 전부 보여주는 것이며 런타임·동적 로딩의 완전한 정확성을 뜻하지 않는다.

단순 URL 해석의 재귀 깊이는 cycle/폭주 방지를 위해 24이며 초과는 unknown으로 남긴다. 원본 소스 전체는 저장하지 않고 API expression은 최대 240자 및 expressionTruncated로 요약한다. 원본 근거는 file/line/hash로 재확인한다. string 검색의 줄 요약은 기본 300자/nameTruncated이며 --all은 해당 요약도 해제한다. --all에는 임의의 결과 수/바이트 상한이 없지만 물리적 메모리·실행 시간·stdout 소비자의 제약은 남는다.

평가용 대용량 기준선 복사본과 `.rvx`는 Git 무시 경로다. 기존 사용자 파일은 삭제하지 않았다. `node benchmark-before.mjs`는 로컬 Git의 고정된 이전 커밋으로 기준선을 재생성한다(해당 커밋과 기존 npm 의존성 필요, 자동 fetch/설치 없음).

모듈/파일 map은 raw 호출 그래프의 투영이다. 같은 group 내부 관계는 지도에서 접고 동일 source/target 쌍은 합친다. raw 관계의 모든 개별 근거와 unknown은 dump --all에서 열람한다. 페이지 map은 source를 기준으로 관계를 배정하며 페이지 밖 target을 boundaryNodes로 추가한다. 독립 리뷰 결과와 남은 한계는 REVIEW.md에 있다.

## 독립 리뷰 수정과 설치 확인 범위

Opus의 H1–H4/M1–M6/L1–L4 수정·재현 결과는 REVIEW.md 및 evaluation/review/에 있다. 구버전 guard는 version override fixture로 검사했고, 별도로 공식 배포 SHA를 확인한 실제 Node 24.0.0 arm64 Darwin에서 전체 33개 회귀를 통과했다. Node 24.22.2에서도 같은 검사를 통과했다. 최소 버전은 이 검증된 지원 floor이며 모든 버전/OS를 검증했거나 Node 22의 실행이 기술적으로 불가능하다는 뜻은 아니다. npm pack 산출물을 임시 경로에 풀어 로컬 의존성으로 help/index를 실행했고, 필수 모듈 포함을 확인했다. 원격 비공개 Git에서 npx 설치·push·배포는 수행하지 않았다. npx/npm 안내는 보존하면서 최소 버전·.rvx 이름·v3 커밋 선택을 정정했다.

기본 context는 실패 파일·unknown 이유가 많아도 메타데이터의 표본만 줄이고 정확한 Total/Truncated를 남긴다. 모든 경로/이유는 status --all 또는 dump --all에서 본다. 출력 경로는 문자열 prefix만 비교하지 않고 실제 파일 시스템 dev/inode 조상 관계로 검사하므로 대소문자·symlink 별칭으로 대상 안에 쓸 수 없다. 다른 프로세스가 검사 직후 디렉터리를 바꾸는 악의적 동시 변경까지 원자적으로 방지하는 보안 경계는 아니다.

## 마지막 재리뷰 수정

Java 필드 초기화·lambda·static/instance 초기화 블록의 call은 method owner가 없어도 shadow 근거를 검사한다. `axios.post/put/patch(url, data, config)`에서 본문은 설정이 아니며 본문의 url/method/spread로 요청 경로·verb를 바꾸지 않는다. get/delete 등의 config는 두 번째, post/put/patch config는 세 번째 인수다. fetch와 config 기반 request도 서로 구분한다. search/flow의 파일 사전 선택은 원래 이름과 CamelCase 분리 이름을 모두 검색하므로 loadall/LOADALL/svc.loadall 부분 일치를 잃지 않는다.

context --other의 crossLanguage도 boundary와 같은 resolution/conditional/effectivePath/requestOverrideUnknown을 제공한다. classificationCounts의 분모는 명시된 scope의 matched method/path 후보 쌍이다. API 전체 수, 경로가 있는 후보 수와 실제 요청 성공률을 혼동하면 안 된다.

핸들된 저장 실패에서는 writer 소유 임시 DB와 journal/WAL/SHM을 정리한다. 이전 인덱스는 의미 검증 성공 전까지 교체하지 않는다. synchronous=FULL 및 DB 파일 fsync 후 rename을 하지만, 전원 차단·디렉터리 entry 내구성은 실험하지 않았고 보장하지 않는다. 강제 kill에서는 cleanup handler가 실행되지 않을 수 있으며 OS가 삭제를 거부하면 오류에 명시한다. R1–R6 실제 결과는 REVIEW.md 및 evaluation/rereview/report.md에 있다. 사용자 조사 문서는 유지했다.
