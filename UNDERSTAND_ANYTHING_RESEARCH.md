# Understand-Anything 조사와 reverse 적용 후보

조사 대상: https://github.com/Egonex-AI/Understand-Anything (MIT 라이선스). 2026-11-05 기준 문서 및 공개 이슈 조사. 실제 설치·Amos 대상 성능 비교는 수행하지 않았다.

## 구조와 차이

- Tree-sitter 정적 구조 추출과 LLM 기반 요약·계층·도메인 분석을 결합하며 `.ua/knowledge-graph.json`으로 대시보드와 에이전트에 제공한다. 대시보드의 기존 그래프 읽기 자체는 LLM 없이 가능하지만 전체 `/understand` 분석 파이프라인이 LLM 없이 된다고 볼 수는 없다. 출처: https://github.com/Egonex-AI/Understand-Anything/blob/main/README.md
- reverse는 LLM 없는 Java/React 정적 분석·출처·unknown을 기본으로 하며, 대용량 구조의 조회와 보수적 판정을 우선한다. 구조 요약, 투어 및 도메인 명세는 있더라도 선택적 에이전트 단계다.

## 차용 가치가 높은 아이디어

1. **결정적 증분 갱신 계획**: 현재 파일 목록과 이전 기록을 비교하고 변경·추가·삭제·이름 변경·설정 변경을 명시한다. 바이트 해시와 구조 지문은 서로 다른 용도다. 이 저장소는 구조 지문을 사용해 갱신 범위를 결정한다. reverse에 적용한다면 미커밋 변경도 감지하고 타입/경로/설정 변경 시 참조자와 영향을 받는 모듈을 재해석해야 한다. 정확한 영향 범위를 모르면 전체 재분석으로 안전하게 돌아간다. https://github.com/Egonex-AI/Understand-Anything/blob/main/understand-anything-plugin/skills/understand/SKILL.md
2. **원자적 갱신과 기준선 일관성**: 그래프 저장과 검사가 성공하기 전 해시·스냅샷 기준선을 전진시키지 않는다. 저장 실패 시 이전 결과를 유지한다. https://github.com/Egonex-AI/Understand-Anything/blob/main/understand-anything-plugin/hooks/auto-update-prompt.md
3. **그래프 무결성과 누락 확인**: 노드 ID·간선 양끝·파일별 심볼 수, 기존 대비 사라진 항목과 삭제의 이유를 별도로 보고한다. 단순히 저장 후 다시 읽은 개수만 비교하지 않고, 원본 분석 결과와 저장 결과를 비교해야 한다. https://github.com/Egonex-AI/Understand-Anything/issues/680
4. **탐색 경험**: 프로젝트 → 계층/모듈 → 파일 → 심볼로 점진 탐색하고, 선택적 기능 흐름·관계 경로·변경 영향도 조회를 제공한다. 결과마다 출처와 한계는 유지한다. 그래프 뷰어는 선택적 후속 기능이며 정적 분석에 UI나 LLM을 필수로 넣지 않는다. https://github.com/Egonex-AI/Understand-Anything/blob/main/understand-anything-plugin/agents/knowledge-graph-guide.md
5. **계층형 제외 규칙과 설명**: 프로젝트별 제외/포함 패턴을 제공하되 분석하지 않은 경로와 이유를 반드시 노출한다. 보안 이름 패턴으로 `SecretService.java` 같은 일반 코드를 조용히 제외하지 않도록 주의한다. https://github.com/Egonex-AI/Understand-Anything/releases

## 그대로 채택하지 않을 것

- LLM 다중 에이전트 파이프라인이나 자동 post-commit hook을 기본 분석 경로에 넣지 않는다. 별도 사용자의 선택이 있어야 한다.
- JSON 단일 파일 및 10MB 이상 Git LFS 권고를 그대로 따르지 않는다. reverse는 compact SQLite와 필요한 부분 조회를 우선한다.
- 증분 업데이트 기능 설명만으로 정확성을 가정하지 않는다. 해당 저장소의 공개 이슈 #590·#680·#366은 과거 특정 버전에서 오래된 import, 심볼 유실, 파일 이동 후 잘못된 관계가 보고된 사례다. 최신 버전에서 그대로 재현된다는 뜻은 아니다. https://github.com/Egonex-AI/Understand-Anything/issues/590 https://github.com/Egonex-AI/Understand-Anything/issues/680 https://github.com/Egonex-AI/Understand-Anything/issues/366

## 반영 판단

현재 진행 중인 Opus 리뷰의 오확정·조회 누락·저장 충실도 결함을 우선 해결한다. 이후 증분 갱신을 구현한다면 별도의 명시적인 설계와 추가/수정/삭제/이름 변경/설정 변경/의존 대상 변경/실패 복구/미커밋 변경을 포함하는 실제 원본 기반 비교가 필요하다. 동일 입력의 전체 재생성 결과와 증분 결과의 노드·관계·unknown·근거·coverage를 비교하고, 증분이라고 주장하지 않는 중간 구현은 전체 재분석이라고 표시한다. 코드를 복사하거나 상당 부분을 사용하는 경우 해당 라이선스 표시 의무를 확인한다.
