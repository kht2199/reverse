# 의존성 감사 수정

reverse 루트 npm 의존성에서 고위험으로 집계된 7개 패키지는 lodash/lodash-es의 취약점이 java-parser → Chevrotain 계열로 전파된 결과였다. 직접 설치된 java-parser 3.0.1은 lodash 4.17.21을, Chevrotain 계열은 lodash-es 4.17.21을 사용했다. 7개가 각각 독립적인 취약점이라는 뜻은 아니다.

[코드 주입 권고](https://github.com/advisories/GHSA-r5fr-rjxr-66jc)는 lodash/lodash-es 4.17.23 이하에 영향을 주며 4.18.0에서 수정되었다. [prototype pollution 권고](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg)도 기존 4.17.21에 영향을 준다. 전자는 _.template imports key 처리, 후자는 _.unset/_.omit/_.pullAt의 경로 처리 문제다. 이 CLI에 대한 실제 공격 가능성은 별도로 입증하지 않았다.

4.17.24는 npm에 배포되지 않았다(E404). 사용 가능한 같은 major의 수정 릴리스 4.18.1을 다음 npm overrides로 고정했다. 이는 patch 번호만 바꾼 업데이트가 아니라 4.17 → 4.18 minor 업데이트다. 상위 파서의 정확한 의존 버전을 의도적으로 덮어쓰므로 lockfile 재현과 실제 파서 회귀 검사를 수행했다. java-parser, Chevrotain, TypeScript 버전이나 분석 코드는 이 수정에서 변경하지 않았다.

```json
"overrides": {
  "lodash": "4.18.1",
  "lodash-es": "4.18.1"
}
```

package-lock.json에 두 버전과 integrity를 보관한다. `npm install --ignore-scripts` 및 `npm ci --ignore-scripts`가 모두 성공했다. 이후 `npm ls lodash lodash-es`에서 모든 해당 의존성이 4.18.1로 해석됐고, `npm audit --json`의 전체 취약점 수가 7(high=7)에서 0으로 감소했다. 감사 결과는 검사 시점과 이 프로젝트 루트 의존성에 한정하며, 모든 가능한 보안 문제의 부재를 보장하지 않는다. 별도 임시 REA 설치의 감사를 뜻하지 않는다.

검증:

- 기존 테스트 8/8 통과. 로컬 REA missing/present 계획이 실행·다운로드를 하지 않는 검사도 포함한다.
- Amos backend 소스 512개/config 포함 519개, frontend 소스 1,171개/config 포함 1,173개 전체를 다시 분석했다. 파싱/구성 오류는 모두 0.
- 수정 전후 snapshot/nodes/edges/errors를 직렬화한 SHA-256이 각각 정확히 동일했다. 시간 메타데이터는 비교에서 제외했다.
- 독립 표본 backend 12개 라우트와 frontend 11개 호출은 다시 TP=12/11, FP=0, FN=0이었다.
- Amos 소스·구성 해시 및 전체 Git porcelain 상태가 수정 전후 동일했다.

근거: evaluation/npm-audit-before.json, npm-audit.json, dependency-tree.txt, tests.txt, dependency-fix-before.json, dependency-fix-comparison.json, sample-results.json. 실제 처리시간과 언어별 제한은 EVALUATION.md에 있다.

재현:

```sh
npm ci --ignore-scripts
npm ls lodash lodash-es
npm audit --json
npm test
node cli.mjs index --root ~/IdeaProjects/amos/backend --out evaluation/backend.json
node cli.mjs index --root ~/IdeaProjects/amos/frontend --out evaluation/frontend.json
node evaluate.mjs
```

기본 분석은 계속 로컬 소스만 읽는다. REA는 의존성에 추가하지 않았으며 `rea-plan`의 로컬 실행 파일 발견/명시적 직접 호출 절차와 REA.md는 그대로 유지한다. 자동 npx, setup, 글로벌 설치를 도입하지 않았다.
