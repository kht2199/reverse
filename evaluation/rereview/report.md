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
