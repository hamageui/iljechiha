/* 경성비록 데이터: 기본 규칙 — 능력치·판정·시대·태생 */
/* ───────── 데이터: 지역·사건·적·태생·시대는 여기 표만 늘리면 된다 ───────── */
/* 능력치: 근력(힘·완력) · 민첩(몸놀림·도주) · 지능(눈치·말솜씨) · 교육(글·셈·일본어) · 정확(사격·손재주) · 건강(최대 체력·회복) */
var STAT_KEYS = ['str', 'agi', 'int', 'edu', 'acc', 'con'];
var STAT_LABEL = { str: '근력', agi: '민첩', int: '지능', edu: '교육', acc: '정확', con: '건강' };
/* 건강 → 최대 체력, 잠잘 때 회복량 */
function maxHpOf(con) { return 6 + Math.round(con / 4); }
function restHealOf(con) { return 4 + Math.floor(con / 25); }
var FX_LABEL = { hp: '체력', ammo: '탄환', money: '소지금', medkit: '구급약', heat: '감시도', days: '경과 주' };
var TIMES = ['오전', '오후', '밤'];
/* 달력: 1개월 = 5주 고정, 12월 다음은 새해 */
var WEEKS_PER_MONTH = 5;
/* 메인 화면 '설명' 팝업 내용 (title: 소제목, lines: 한 줄씩) */
var HELP_ITEMS = [
  { title: '어떤 게임인가', lines: ['1910년부터 1945년까지, 식민지 조선에서 한 사람이 살아가는 이야기다.', '정해진 목표는 없다. 오래 살아남고, 어떤 길을 걸을지 스스로 고른다.'] },
  { title: '탄생', lines: ['주사위가 출생지·유년·교육·연줄·결점·청소년기를 정한다.', '출생지에 따라 경성·평양·부산 중 한 곳에서 눈을 뜬다.', '마음에 들지 않으면 다시 태어날 수 있다.'] },
  { title: '한 주의 흐름', lines: ['‘다음으로’를 누르면 어딘가에서 일이 벌어진다.', '한 주는 오전·오후·밤으로 흐른다. 밤이 지나면 셋방으로 돌아가 한 주를 마무리하고(‘셋방의 밤’), 다음 주가 시작된다. 한 달은 다섯 주다.', '한 주를 마칠 때마다 한 주 치 방세 1원이 든다. 돈이 없으면 굶은 채 한 주를 넘긴다.'] },
  { title: '판정', lines: ['선택지마다 능력치와 난이도로 성공 확률이 정해진다.', '아주 운이 좋으면 대성공, 아주 나쁘면 대실패가 난다.'] },
  { title: '감시도', lines: ['일제가 나를 얼마나 주시하는지. 도시마다 따로 쌓인다.', '0~20. 높을수록 검문이 잦아지고, 더 무서운 관헌이 나타나며, 관헌이 생포를 빨리 포기한다.', '잠을 자거나 ‘몸을 사린다’로 낮출 수 있다. 떠나 있는 도시의 감시도는 천천히 내려간다.'] },
  { title: '평판', lines: ['일제와 동포가 나를 어떻게 보는지는 화면에 보이지 않게 쌓인다.', '어느 쪽에 기대느냐에 따라 도움을 받기도, 냉대를 받기도 한다.'] },
  { title: '행동', lines: ['‘행동’에서 할 일을 예약하면 다음 차례가 그 일이 된다.', '몸을 사리기, 은닉처 들르기, 이야기의 다음 장면, 다른 도시로 가는 기차가 있다.'] },
  { title: '전투', lines: ['행동력 1을 쓸 때마다 적이 한 번씩 움직인다. 큰 기술은 그만큼 적이 더 움직인다.', '거리가 중요하다. 다가가고, 물러나고, 엄폐하고, 출구로 달아날 수 있다.', '기술을 누르면 타이밍 맞추기가 뜬다. 잘 맞출수록 잘 맞는다.', '전장의 적을 누르면 표적이 바뀐다. ‘이번 합 소식’에서 나와 적이 한 일을 확인하라.'] },
  { title: '소지품 · 기술', lines: ['무기를 바꿔 들고, 전투에 가져갈 기술을 세 칸까지 고른다.', '새 기술은 전투에서 이겨 얻는다.'] }
];
/* ───── 전투 용어 설명 (카드) ─────
   전투 화면의 요소에 마우스를 올리거나, 'ⓘ 설명'을 켜고 누르면 이 카드가 뜬다.
   kind: 분류(카드 머리글) · title · text: 줄 단위 · rel: 함께 볼 용어 (카드 아래에 눌러 볼 수 있는 태그로) */
var GLOSSARY = {
  ap:        { kind: '규칙', title: '행동력', text: ['내가 행동력 1을 쓸 때마다 모든 적이 한 번씩 움직인다.', '행동력 2짜리 행동이면 적이 두 번 움직인다.'], rel: ['wait', 'free'] },
  free:      { kind: '상태', title: '선제', text: ['먼저 싸움을 걸면 얻는다.', '처음 한 번의 행동에는 적이 대응하지 못한다.'], rel: ['ap'] },
  wait:      { kind: '행동', title: '기다리기', text: ['아무것도 하지 않고 행동력 1을 쓴다. 적이 한 번 움직인다.', '상대의 다음 수를 지켜볼 때 쓴다.'], rel: ['ap', 'intent'] },
  qte:       { kind: '규칙', title: '타이밍 맞추기', text: ['기술을 누르면 타이밍 창이 뜬다.', '가운데 칸에 가까울수록 명중이 오르고, 정중앙은 ‘치명’이다.', '무기마다 타이밍 모양과 조작이 다르다.'], rel: ['ap'] },
  target:    { kind: '규칙', title: '표적', text: ['내 공격이 향하는 적. 금테 두른 큰 원으로 표시된다.', '전장의 적이나 화면 밖 꼬리표를 누르면 표적이 바뀐다.'], rel: ['dist', 'offscreen'] },
  dist:      { kind: '지형', title: '거리', text: ['나와 표적 사이의 거리(m).', '근접 기술은 무기 사거리 안에서만 쓸 수 있고, 총은 거리에 따라 명중과 피해가 달라진다.', '너무 멀면(권총은 약 15m 넘게) 1m마다 명중이 3씩 크게 떨어진다. 적의 총도 마찬가지.'], rel: ['range', 'move'] },
  range:     { kind: '규칙', title: '사거리', text: ['기술이 닿는 최대 거리.', '사거리 밖에 있는 기술은 기술 목록에서 사라진다. 다가가면 다시 나타난다.'], rel: ['dist', 'move:in'] },
  me:        { kind: '인물', title: '나', text: ['파란 원이 나다. 화면은 나와 표적을 함께 비춘다.'], rel: ['target', 'dist'] },
  veil:      { kind: '지형', title: '시야 방해물', text: ['연기·빨래·인파처럼 시야를 가리는 것(옅은 줄무늬 띠).', '나와 상대 사이에 있으면 서로 명중 -15 (여럿이면 최대 -30).', '숨을 수는 없고, 보이지 않게 되는 것도 아니다.'], rel: ['coverVeil', 'veilOn'] },
  coverVeil: { kind: '지형', title: '시야를 가리는 엄폐물', text: ['몸을 숨길 수도 있고 시야도 가리는 엄폐물(빗금 친 높은 기둥).', '엄폐는 보통 엄폐물과 같다.', '나와 상대 사이에 있으면 서로 명중 -15.'], rel: ['veil', 'cover', 'act:cover'] },
  veilOn:    { kind: '상태', title: '시야 방해', text: ['지금 표적과 나 사이에 시야를 가리는 것이 있다.', '나도 상대도 명중이 떨어진다. 근접 공격도 마찬가지.'], rel: ['veil', 'coverVeil'] },
  stance:    { kind: '적', title: '관헌의 태세', text: ['관헌은 태세에 따라 움직인다: 생포(포승·곤봉, 총은 안 쏨) · 근접 · 사격.', '처음엔 모두 생포. 감시도가 높거나, 먼저 덮치거나, 총을 쏘거나, 달아나려 하면 생포를 포기하기 쉬워진다.', '생포 태세에게 붙잡혀 체력이 바닥나면 포박되어 끌려간다.'], rel: ['grab', 'act:surrender'] },
  wall:      { kind: '지형', title: '전장 끝', text: ['빗금 친 곳은 더 갈 수 없는 막다른 곳이다.', '등 뒤가 막히면 물러날 수 없다.'], rel: ['exit'] },
  exit:      { kind: '지형', title: '출구', text: ['전장 밖으로 빠져나가는 길(초록 기둥).', '전투마다 1~3곳이 여러 방향에 새로 생긴다.', '닿으면 도주에 성공해 전투가 끝난다. 적이 그 앞을 막고 있으면 지나갈 수 없다.'], rel: ['move:exit', 'surround'] },
  cover:     { kind: '지형', title: '엄폐물', text: ['몸을 숨길 수 있는 지형(회색 기둥).', '엄폐물에 닿아 ‘엄폐’를 하면 위협이 큰 쪽 적의 사격 명중이 35% 줄어든다.', '총알만 막는다. 근접 공격은 막지 못한다.'], rel: ['move:cover', 'act:cover'] },
  offscreen: { kind: '지형', title: '화면 밖', text: ['화면 밖의 적과 출구는 가장자리에 화살표 꼬리표로 표시된다.', '적의 꼬리표를 누르면 그 적이 표적이 된다.'], rel: ['target'] },
  move:      { kind: '행동', title: '이동', text: ['한 번 움직일 때마다 행동력 1. 적이 한 번 움직인다.', '민첩이 높을수록 한 걸음이 길다.', '붙잡히면 움직일 수 없다.'], rel: ['ap', 'held'] },
  'move:in':    { kind: '이동', title: '다가가기', text: ['표적 쪽으로 한 걸음 다가간다.', '근접 기술의 사거리에 들어가려면 다가가야 한다.'], rel: ['move', 'range'] },
  'move:out':   { kind: '이동', title: '물러나기', text: ['표적 반대쪽으로 한 걸음 물러난다.', '총을 든 쪽은 거리를 벌리는 게 유리할 때가 많다. 등 뒤에 다른 적이 있으면 조심.'], rel: ['move', 'surround'] },
  'move:cover': { kind: '이동', title: '엄폐물로', text: ['가장 가까운 엄폐물 쪽으로 한 걸음씩 간다.', '닿은 뒤 ‘행동’ 탭의 ‘엄폐’로 몸을 숨긴다.'], rel: ['cover', 'act:cover'] },
  'move:exit':  { kind: '이동', title: '출구로 도주', text: ['출구 쪽으로 한 걸음씩 달린다. 닿으면 도주 성공.', '가는 동안에도 적은 계속 움직인다.'], rel: ['exit', 'move'] },
  'act:cover':  { kind: '행동', title: '엄폐', text: ['엄폐물 뒤로 몸을 숨긴다. 행동력 1.', '더 위협적인 쪽 적의 사격 명중 -35%. 매 합 자동으로 방향을 바꾼다.', '근접 공격은 막지 못하고, 근접 공격에 맞거나 움직이면 풀린다.'], rel: ['cover', 'coverOn'] },
  'act:break':  { kind: '행동', title: '뿌리치기', text: ['붙잡혔을 때만 쓸 수 있다. 행동력 1.', '근력 판정에 성공하면 풀려난다.'], rel: ['held'] },
  'act:surrender': { kind: '행동', title: '항복', text: ['적이 항복을 권했을 때만 쓸 수 있다.', '관헌 앞이면 불법 소지품만 빼앗기고, 관헌이 아닌 상대에게는 돈의 절반을 털린다.', '전투가 끝난다.'], rel: ['offer'] },
  'act:medkit': { kind: '행동', title: '구급약', text: ['구급약 하나를 써서 최대 체력의 10~60%를 회복한다.', '행동력 1. 적이 한 번 움직인다.'], rel: ['ap'] },
  'act:talk':   { kind: '행동', title: '설득', text: ['말로 상대를 물러나게 한다. 행동력 2.', '내가 먼저 공격하기 전에만 쓸 수 있다. 한 번 손을 대면 항복 요구로 바뀐다.', '지능 판정. 상대 쪽 평판이 좋을수록, 적이 적을수록 쉽다.'], rel: ['act:demand', 'ap'] },
  'act:plea':   { kind: '행동', title: '무고 주장', text: ['관헌에게 아무 죄도 없다고 우긴다. 행동력 2.', '지능 판정. 일제 평판이 좋을수록 쉽고, 불법 소지품을 지녔거나 감시도가 높을수록, 실패할수록 어렵다.', '성공하면 전투 없이 풀려난다. 내가 먼저 공격하면 쓸 수 없다.'], rel: ['act:demand', 'ap'] },
  'act:demand': { kind: '행동', title: '항복 요구', text: ['한 번이라도 공격한 뒤, 설득 대신 쓴다. 행동력 1.', '상대가 많이 다쳤을수록, 사기가 꺾였을수록, 내가 총을 들었을수록 잘 먹힌다.', '근력(위압)과 지능(말발)이 높으면 조금 더 유리하다 — 보정에는 상한이 있다.', '상대가 총잡이거나 동료가 많으면 어렵다. 결과는 무작위.', '성공하면 그 적은 무기를 버린다 (쓰러뜨린 것으로 친다).'], rel: ['act:talk', 'act:plea'] },
  coverOn:   { kind: '상태', title: '엄폐 중', text: ['엄폐물 뒤에 숨어 있다. 위협이 큰 쪽 적의 사격 명중 -35%.', '근접 공격에 맞거나 움직이면 풀린다.'], rel: ['act:cover'] },
  alarm:     { kind: '상태', title: '증원', text: ['호루라기나 총성이 울렸다.', '표시된 합이 지나면 관헌이 증원으로 나타난다. 출구 쪽에서 올 수도 있다.'], rel: ['exit'] },
  shaken:    { kind: '상태', title: '기가 눌림', text: ['적의 위협에 기가 눌렸다.', '이번 합 내 명중 -10.'], rel: ['intent'] },
  offer:     { kind: '상태', title: '항복 권유', text: ['적이 항복을 권했다.', '이번 합에 ‘행동’ 탭에서 항복할 수 있다.'], rel: ['act:surrender'] },
  held:      { kind: '상태', title: '붙잡힘', text: ['적에게 붙잡혔다. 움직일 수 없고, 도주가 어렵다.', '붙잡은 적의 다음 공격은 반드시 맞는다.'], rel: ['act:break'] },
  surround:  { kind: '상태', title: '포위', text: ['가까운 양쪽에 적이 있다.', '적의 명중 +10, 도주가 어려워진다.'], rel: ['exit', 'move:out'] },
  intent:    { kind: '적', title: '기색', text: ['적이 다음에 하려는 행동.', '지능이 높을수록 정확히 읽힌다.'], rel: ['read', 'persona'] },
  read:      { kind: '적', title: '읽기', text: ['훤히 읽힌다 › 흐릿한 기색 › 읽지 못함.', '내 지능 판정으로 매 합 정해진다.'], rel: ['intent'] },
  persona:   { kind: '적', title: '성격', text: ['적마다 성격이 있다.', '사나움·신중함·교활함·겁 많음에 따라 공격, 엄폐, 도주, 위협, 항복 권유가 달라진다.'], rel: ['intent'] },
  hitme:     { kind: '적', title: '나를 맞힐 확률', text: ['이 적의 공격이 나에게 맞을 확률.', '엄폐, 몸 낮추기, 눈 멂·위축이 낮추고, 포위가 높인다.'], rel: ['coverOn', 'surround'] },
  foeStats:  { kind: '적', title: '적의 능력', text: ['명중률·회피·피해·사거리.', '회피가 높을수록 내 기술이 덜 맞는다.'], rel: ['range'] },
  stun:      { kind: '효과', title: '기절', text: ['그 합 동안 아무것도 하지 못한다.'], rel: ['prone'] },
  prone:     { kind: '효과', title: '빈틈 · 넘어짐', text: ['다음 공격 명중 +20.', '넘어진 적은 한 합 묶인다.'], rel: ['stun'] },
  foeCover:  { kind: '효과', title: '적 엄폐', text: ['적이 엄폐물 뒤에 있다.', '내 사격 명중 -30. 근접 공격에는 영향이 없다.', '근접 공격을 맞히면 엄폐물 밖으로 끌어낸다.'], rel: ['cover'] },
  grab:      { kind: '효과', title: '붙잡은 적', text: ['내가 붙잡은 적은 자리를 옮기지 못한다. 손이 닿으면 그 자리에서 때린다.', '다음 공격(잡기 제외)은 반드시 맞는다. 적이 3번 움직일 때까지 유지.', '내가 움직이면 손을 놓는다.'], rel: ['held'] },
  bleed:     { kind: '효과', title: '출혈', text: ['매 합 정해진 피해를 입는다.', '남은 합 수만큼 계속된다.'], rel: [] },
  blind:     { kind: '효과', title: '눈 멂', text: ['흙 등에 눈이 가려졌다.', '그 적의 명중 -30.'], rel: ['weak'] },
  weak:      { kind: '효과', title: '위축', text: ['위협 사격 등에 겁을 먹었다.', '그 적의 명중 -20. 겁 많은 적은 달아나기도 한다.'], rel: ['blind'] },
  feed:      { kind: '규칙', title: '이번 합 소식', text: ['방금 내가 한 일(나)과 그사이 적들이 한 일(적)이 짧게 정리된다.', '다음 행동을 하면 새 소식으로 바뀐다.'], rel: ['ap'] },
  'tab:skill': { kind: '규칙', title: '기술', text: ['지금 거리에서 쓸 수 있는 공격과 잔꾀.', '누르면 타이밍 맞추기가 뜬다.'], rel: ['qte', 'range'] },
  'tab:move':  { kind: '규칙', title: '이동', text: ['다가가기·물러나기·엄폐물로·출구로.', '한 번에 행동력 1.'], rel: ['move'] },
  'tab:act':   { kind: '규칙', title: '행동', text: ['엄폐, 구급약, 설득, 뿌리치기, 항복처럼 공격도 이동도 아닌 것.', '그때그때 쓸 수 있는 것만 나온다.'], rel: ['act:cover', 'act:medkit'] },
  detail:      { kind: '규칙', title: '자세히', text: ['기술·이동·행동 버튼 아래에 계산식과 설명을 펼친다.'], rel: [] }
};
/* 화면 색 (모두 바탕 종이색 위에서 글자 대비 4.5:1 이상)
   KIND_COLOR: 사건 종류별 머리글·밑줄·번호 도장 색 · STAT_COLOR: 능력치 칩 · TONE_COLOR: 결과 도장 (이득/손해/섞임/변화 없음) */
var KIND_COLOR = { fight: '#9E2B20', work: '#3F5E2F', shop: '#7E5A12', stash: '#4A5A66', link: '#2C4A5C', quest: '#5E3A6E', align: '#8A5214', era: '#1F5A5A', patrol: '#7A3B12', other: '#7A3B12' };
var STAT_COLOR = { str: '#9E2B20', agi: '#3F5E2F', int: '#2C4A5C', edu: '#5E3A6E', acc: '#7E5A12', con: '#1F5A5A' };
var TONE_COLOR = { good: '#3F5E2F', bad: '#9E2B20', mixed: '#8A5214', none: '#2C4A5C' };
var WEEK_NAMES = ['첫째 주', '둘째 주', '셋째 주', '넷째 주', '다섯째 주'];
/* 난이도: 목표치 = 능력치 + mod (5~95로 제한) */
/* 난이도: 목표치 = 능력치 × mul + add (이후 5~95로 제한)
   쉬움 = 수치+15 · 보통 = 수치 · 어려움 = 수치−10 · 극단 = 수치−25 (빼기 방식: 능력치가 오른 만큼 확률도 그대로 오른다) */
var DIFF = {
  easy: { label: '쉬움', mul: 1, add: 15, note: '+15' },
  normal: { label: '보통', mul: 1, add: 0, note: '' },
  hard: { label: '어려움', mul: 1, add: -10, note: '−10' },
  extreme: { label: '극단', mul: 1, add: -25, note: '−25' }
};
function diffTarget(stat, diffId) { var df = DIFF[diffId] || DIFF.normal; return (stat || 0) * df.mul + df.add; }
/* ───── 판정: 성공 확률(%) 방식 ─────
   성공 확률 = 능력치 × 난이도 배율 + 보정 (소수점까지 그대로 쓴다) → min~max 로 제한
   판정은 0~100 사이 연속 난수 하나로 결정:
     난수 < 확률 × crit   → 대성공 (피해 2배, 효과 +1합)
     난수 < 확률 × hard   → 어려운 성공
     난수 < 확률          → 성공
     난수 ≥ 100 − fumble  → 대실패 (확률과 상관없이 실패)
   예) 확률 37.5% · crit 0.2 → 대성공 7.5% */
var CHECK = { min: 5, max: 95, crit: 0.2, hard: 0.5, fumble: 4, rollMs: 450 };
var LOG_STYLE = { sys: '#5B5246', good: '#3F5E2F', bad: '#9E2B20', roll: '#2C4A5C', foe: '#7A3B12', story: '#1E1B16' };

/* 시대: 시작 연도는 start 범위에서 무작위 */
var ERAS = [
  { id: 'e1', name: '무단통치기', range: '1910–1919', from: 1910, to: 1919, start: [1910, 1918],
    desc: '헌병이 경찰 노릇을 하고, 길에서 태형이 집행되는 시절.' },
  { id: 'e2', name: '문화통치기', range: '1920–1930', from: 1920, to: 1930, start: [1920, 1929],
    desc: '조선어 신문과 활동사진관이 생겼지만, 순사의 수는 오히려 늘었다.' },
  { id: 'e3', name: '민족말살통치기', range: '1931–1945', from: 1931, to: 1945, start: [1937, 1943],
    desc: '전쟁의 그림자. 창씨개명과 공출, 징용이 일상을 덮친다.' }
];
var AFTER = { id: 'e4', name: '광복 이후', range: '1945.8.15–', desc: '나라를 되찾았다. 그러나 삶은 계속된다.' };

/* ───── 태생: d100 열 번 ─────
   기본 수치(BASE)에서 시작해, 각 단계마다 d100을 굴려 표에서 해당 항목의 조정치를 더한다.
   표 항목: max = 이 값 이하가 나오면 해당(위에서부터 차례로 검사) · mod = 능력치 조정 · fx = 돈·구급약·감시도 · flag = 표식
   항목을 늘릴 때는 해당 표에 한 줄 추가하고 max 구간만 다시 나누면 된다.
   special: true = 특별 태생. 1 또는 100, 가장 극단적인 숫자 하나에만 걸린다(표의 맨 앞 max:1 · 맨 끝 max:100). */
var BASE = {stats: {str: 30, agi: 30, int: 30, edu: 0, acc: 30, con: 30}, money: 0, medkit: 0, ammo: 0};
var STAT_MIN = 0, STAT_MAX = 90; /* 제작 단계: 최저값 0 */
var LIFE_STORE_KEY = 'kyungsung.lifeTables.v4';
/* 자동 저장: '다음으로'마다 이 브라우저(localStorage)에 한 칸 · SAVE_VER 를 올리면 예전 저장은 무시된다
   SAVE_SKIP: 저장하지 않는 화면용 값 (태생 표 편집본은 LIFE_STORE_KEY 에 따로 저장) */
var HEAT_MAX = 20; /* 감시도 최대치 (도시마다 따로) */
var SAVE_KEY = 'ilje.save.v1', SAVE_VER = 1; /* SAVE_KEY: 예전 한 칸 저장 (있으면 1번 칸으로 옮김) */
var SAVE_SLOTS = 5, SAVE_SLOT_KEY = 'ilje.save.slot'; /* 저장 칸 수 · 칸별 키 = SAVE_SLOT_KEY + 번호 */
var SAVE_SKIP = ['life', 'base', 'edStage', 'raw', 'importText', 'saveMsg', 'saveOk', 'dice', 'rolling', 'qte', 'tip', 'infoMode',
  'nameOpen', 'nameDraft', 'rerollWarn', 'helpOpen', 'creditOpen', 'resumeOpen', 'invMsg', 'slotDel', 'hudOpen', 'seedDraft', 'seedMsg'];
/* ───── 조건 (선택지 보이기 show · 조건부 결과 alt.when) ─────
   { tags: [모두 있어야], anyTags: [하나라도], noTags: [하나도 없어야], flags: [표식 모두], noFlags: [표식 없어야],
     min: { int: 40, money: 5, heat: 3, jp: 50, … }, max: { … }   ← 능력치·돈·체력·구급약·탄환·감시도·일제(jp)·민족(kr)
     weapon: 'rifle' | 'gun'(총 아무거나) | 'melee'(맨손 말고 근접 무기) | 'none'(무기 없음),
     city: ['gyeongseong', …], time: [0 오전, 1 오후, 2 밤], years: [1919, 1925], chance: 0.3 (조건부 결과에서만) }
   선택지: show = 이 조건이 맞아야 화면에 보임 · alt = [{ when, ok, ng?, check: false? }] = 고를 때 맞는 첫 줄의 결과를 쓴다
   결과: flag / tag (문자열이나 배열) = 표식·태그를 얻음 · untag = 태그를 잃음 */
var COND_TIME = ['오전', '오후', '밤'];
/* ───── 태생 시드 ─────
   같은 시드 = 같은 태생 굴림(단계별 항목 · 능력치 · 소지품 · 첫 기술 · 시작 도시).
   시대 · 날짜와 게임 진행(사건 · 판정 · 전투)은 시드와 상관없이 매번 무작위.
   태생 표를 고치면(개발자 탭 태생 편집) 같은 시드라도 결과가 달라진다. */
var SEED_LEN = 8, SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; /* 헷갈리는 0·O·1·I 는 뺌 */
function newSeed() { var s = ''; for (var i = 0; i < SEED_LEN; i++) s += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)]; return s; }
function cleanSeed(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24); }
function seedLabel(s) { return s.length > 4 ? s.slice(0, 4) + '-' + s.slice(4) : s; }
/* 시드 문자열 → 0~1 난수 함수 (cyrb53 해시 + mulberry32) */
function seedRng(str) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (var i = 0; i < str.length; i++) { var c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  var a = h1 >>> 0;
  return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/* 편집기에서 숫자로 고칠 수 있는 칸 */
var ED_NUMS = [
  { k: 'str', kind: 'mod', label: '근력' }, { k: 'agi', kind: 'mod', label: '민첩' }, { k: 'int', kind: 'mod', label: '지능' },
  { k: 'edu', kind: 'mod', label: '교육' }, { k: 'acc', kind: 'mod', label: '정확' }, { k: 'con', kind: 'mod', label: '건강' },
  { k: 'money', kind: 'fx', label: '돈(원)' }, { k: 'medkit', kind: 'fx', label: '구급약' }, { k: 'heat', kind: 'fx', label: '감시도' }
];
var LIFE_STAGES = [
  { id: 'birth', label: '출생 환경', times: 1, table: [
    {max: 1, special: true, id: "america", name: "미주", desc: "하와이 사탕수수 농장 이민자의 자식. 영어를 하고 서양 문물에 밝지만, 조선 땅은 낯설다.", tags: ["home:america", "region:abroad", "abroad", "city", "lang:en", "western"], mod: {int: 5, acc: 5, str: 3, agi: 2}, fx: {money: 5, medkit: 1, heat: -1}, flag: "born_america"},
    {max: 10, id: "gyeongseong", name: "경성", desc: "종로 뒷골목에서 나고 자랐다. 전차와 신문이 익숙하다.", tags: ["home:gyeongseong", "region:central", "city", "capital"], mod: {int: 4, agi: 3, str: 4, acc: -5, con: 5}, fx: {medkit: 2, money: 5}},
    {max: 20, id: "sinuiju", name: "신의주", desc: "압록강 건너 만주가 보이는 국경 도시. 혹독한 겨울을 견디며 자랐다.", tags: ["home:sinuiju", "region:northwest", "city", "border"], mod: {str: 3, agi: 7, int: -3, acc: 4, con: 5}, fx: {medkit: 1, heat: 1}},
    {max: 30, id: "busan", name: "부산", desc: "부두와 일본인 거리가 가까운 항구 도시. 일본말을 일찍 귀에 익혔다.", tags: ["home:busan", "region:southeast", "city", "port", "lang:ja"], mod: {agi: 3, str: 3, con: 5, acc: 2, int: 3}, fx: {medkit: 1}},
    {max: 40, id: "gando", name: "간도", desc: "두만강 건너 간도의 조선인 마을. 마적과 독립군 이야기를 들으며 사냥총을 만졌다.", tags: ["home:gando", "region:manchuria", "abroad", "border", "rural", "lang:zh", "hunter"], mod: {acc: 14, str: 1, agi: 1}, fx: {heat: 1, medkit: 1}},
    {max: 50, id: "shanghai", name: "상해", desc: "상해 프랑스 조계의 조선인 거리. 임시정부 사람들이 이웃이었다.", tags: ["home:shanghai", "region:china", "abroad", "city", "lang:zh", "near_kpg"], mod: {int: 10, con: -2, acc: 2}, fx: {medkit: 1, heat: 1, money: 10}},
    {max: 60, id: "gaeseong", name: "개성", desc: "송상의 고장. 셈 빠른 어른들 틈에서 장사 수완을 보고 자랐다.", tags: ["home:gaeseong", "region:central", "city", "merchant_culture"], mod: {str: 1, acc: -5, int: 4}, fx: {money: 25, medkit: 2}},
    {max: 70, id: "primorsky", name: "연해주", desc: "블라디보스토크 신한촌. 러시아 말과 모진 추위에 익숙하다.", tags: ["home:primorsky", "region:russia", "abroad", "rural", "lang:ru"], mod: {con: 7, agi: 2, acc: 4, int: -2, str: 2}, fx: {heat: 1}},
    {max: 80, id: "cheonan", name: "천안", desc: "삼남으로 가는 길목의 농촌. 너른 들판에서 흙을 만지며 자랐다.", tags: ["home:cheonan", "region:central", "rural", "farming"], mod: {str: 1, con: 5, acc: 4, agi: 4}, fx: {medkit: 1}},
    {max: 90, id: "unsan", name: "운산", desc: "미국인이 운영하는 금광 마을. 광부들 틈에서 거칠게 자랐다.", tags: ["home:unsan", "region:northwest", "rural", "mining", "western"], mod: {str: 18, con: -3, int: -3}, fx: {money: 2, medkit: 1}},
    {max: 99, id: "daegu", name: "대구", desc: "영남의 큰 장터 도시. 약령시의 약초 냄새가 몸에 배어 있다.", tags: ["home:daegu", "region:southeast", "city", "herbal"], mod: {int: 13, con: 4}, fx: {medkit: 1, money: 5}},
    {max: 100, special: true, id: "tokyo", name: "도쿄", desc: "도쿄에서 태어난 재일 조선인. 일본어가 모국어처럼 유창하지만, 어디에서도 온전히 속하지 못한다.", tags: ["home:tokyo", "region:japan", "abroad", "city", "lang:ja", "zainichi"], mod: {con: 5, str: 3, agi: 3, int: 7}, fx: {money: 20, medkit: 2, heat: -1}, flag: "born_tokyo"}
  ] },
  { id: 'child', label: '유년 활동', times: 1, table: [
    {max: 1, special: true, id: "herbshop", name: "한약방 심부름", desc: "한약방에서 일하면서 한약을 만드는 법을 배웠다.", tags: ["herbal", "medicine"], mod: {int: 30}, fx: {medkit: 4}},
    {max: 10, id: "reading", name: "독서", desc: "책을 많이 읽었다. 구한말 소설부터 신문 연재까지 닥치는 대로.", tags: ["bookish"], mod: {int: 40}},
    {max: 21, id: "play", name: "운동", desc: "친구들과 골목을 누비며 뛰어놀았다.", tags: ["athletic"], mod: {agi: 40}},
    {max: 32, id: "labor", name: "노동", desc: "어려서부터 가족 일을 도우며 지게를 졌다.", tags: ["laborer"], mod: {str: 40}},
    {max: 43, id: "stone", name: "돌 던지기", desc: "연못에 돌을 던지며 놀았다. 물수제비 실력이 일품이다.", tags: ["thrower"], mod: {acc: 40}},
    {max: 53, id: "newsboy", name: "신문판매", desc: "길거리를 돌아다니면서 신문을 팔았다.", tags: ["street_kid", "newspaper"], mod: {agi: 30}, fx: {money: 30}},
    {max: 63, id: "crafting", name: "물건 만들기", desc: "뭔가를 뚝딱뚝딱 만들면서 지냈다.", tags: ["crafter"], mod: {int: 20, acc: 20}},
    {max: 72, id: "stories", name: "이야기 듣기", desc: "마을 어른에게서 옛이야기를 많이 들었다.", tags: ["folklore"], mod: {int: 20, con: 20}},
    {max: 81, id: "farmwork", name: "농사일 돕기", desc: "농사일을 도우며 땡볕에서 일했다.", tags: ["farming", "laborer"], mod: {str: 20, con: 20}},
    {max: 90, id: "glutton", name: "먹보", desc: "잘 먹고 튼튼하게 컸다.", tags: ["hearty"], mod: {con: 40}},
    {max: 99, id: "hiking", name: "등산", desc: "산을 타면서 모험을 했다.", tags: ["mountain"], mod: {str: 20, agi: 20}},
    {max: 100, special: true, id: "trading", name: "장사 참여", desc: "특출난 장사 수완으로 돈을 많이 벌었다.", tags: ["trader", "merchant_culture"], mod: {int: 25}, fx: {money: 60}}

  ] },
  /* rolls: 단계의 굴림 방식을 바꿀 때 쓴다 (위에서부터 조건 ifTag 가 맞는 첫 줄 · die = 주사위 면 수, add = 더하는 값). 없으면 d100
     교육: 예전엔 유년 '교육을 받음'에 따라 d40+60/d60 → 지금은 모두 d100. 교육 항목은 지능을 올리지 않는다 (교육 수치만) */
  { id: 'edu', label: '교육', times: 1, table: [
    {max: 30, id: "none", name: "다니지 않음", desc: "학교 문턱을 넘어 본 적이 없다. 이름 석 자 쓰는 것도 버겁다.", tags: ["illiterate"], mod: {edu: 10}},
    {max: 40, id: "night", name: "야학 교육", desc: "일을 마친 밤마다 야학에서 한글과 셈을 익혔다.", tags: ["literate", "hangul", "night_school"], mod: {edu: 20}, fx: {heat: 1}},
    {max: 55, id: "seodang", name: "서당 교육", desc: "훈장 앞에서 천자문과 소학을 외웠다. 한문은 읽지만 신학문은 모른다.", tags: ["literate", "hanmun"], mod: {edu: 30}},
    {max: 64, id: "simple", name: "간이학교 교육", desc: "2년제 간이학교에서 일본어와 산술 기초를 배웠다.", tags: ["literate", "lang:ja"], mod: {edu: 35}},
    {max: 70, id: "primary_drop", name: "보통학교 중퇴", desc: "보통학교에 다니다 집안 형편 때문에 그만두었다.", tags: ["literate", "lang:ja", "dropout"], mod: {edu: 50}},
    {max: 75, id: "vocational_drop", name: "실업학교 중퇴", desc: "상업학교에 들어갔다가 끝을 보지 못했다. 손재주는 남았다.", tags: ["literate", "lang:ja", "vocational", "dropout"], mod: {edu: 55}},
    {max: 76, id: "primary", name: "보통학교 졸업", desc: "보통학교에서 조선어와 일본어, 산술을 배웠다.", tags: ["literate", "lang:ja"], mod: {edu: 55}},
    {max: 90, id: "vocational", name: "실업학교 졸업", desc: "농업·상업학교를 마치고 장부와 기계를 다룰 줄 안다.", tags: ["literate", "lang:ja", "vocational"], mod: {edu: 65}},
    {max: 91, id: "secondary_drop", name: "고등보통학교 중퇴", desc: "고보에 다니다 동맹휴학에 휘말려 학교를 떠났다.", tags: ["literate", "lang:ja", "dropout", "student_strike"], mod: {edu: 65}},
    {max: 96, special: true, id: "secondary", name: "고등보통학교 졸업", desc: "고등보통학교까지 마쳤다. 동네에서 손꼽히는 인텔리다.", tags: ["literate", "lang:ja", "intelligentsia"], mod: {edu: 75}},
    {max: 99, special: true, id: "college", name: "전문학교 학생", desc: "연희·보성 같은 전문학교에 다니는 수재. 신학문과 새 사상에 밝아 일경이 눈여겨본다.", tags: ["literate", "lang:ja", "intelligentsia", "student"], mod: {edu: 85}, flag: "edu_college"},
    {max: 100, special: true, id: "imperial", name: "경성제국대학 학생", desc: "조선인 입학생이 손에 꼽히는 경성제국대학의 학생. 사각모 하나로 대접이 달라진다.", tags: ["literate", "lang:ja", "intelligentsia", "student", "elite"], mod: {edu: 90}, flag: "edu_imperial"}
  ] },
  { id: 'link', label: '연줄', times: 1, table: [
    {max: 1, special: true, id: "kimjwajin", name: "독립군 사령관", desc: "만주 독립군 부대의 사령관이 집안 어른이다. 그 이름 하나로 목숨이 오간다.", tags: ["kimjwajin"], fx: {heat: 3}, flag: "link_commander"},
    {max: 10, id: "friend", name: "친구", desc: "어릴 적부터 붙어 다닌 동무가 있다. 힘들 때 기댈 곳이다.", tags: ["friend"], flag: "link_friend"},
    {max: 19, id: "locals", name: "지역 주민", desc: "동네 사람들이 밥 한술은 챙겨 준다.", tags: ["community"], flag: "link_locals"},
    {max: 20, special: true, id: "kimgeushick", name: "파리 위원부 요인", desc: "친척이 임시정부 활동을 위해 프랑스로 떠났다. 이후 함께할 기회가 올 수도 있다.", tags: ["kimgeushick"]},
    {max: 28, id: "merchant", name: "상인", desc: "장사하는 친척이 있다. 가끔 일거리와 용돈을 쥐여 준다.", tags: ["merchant"], flag: "link_merchant"},
    {max: 29, special: true, id: "okada", name: "오카다와의 연줄", desc: "본정 오카다 상회 주인과 묘한 인연이 있다. 뒷방 물건도 반값에 내준다.", tags: ["okada"], flag: "link_okada"},
    {max: 30, special: true, id: "Leesangjae", name: "교육운동가", desc: "유명한 교육운동가를 알고 있다. 사회운동에 참여하기 쉽다.", tags: ["Leesangjae"]},
    {max: 40, id: "scholar", name: "지식인", desc: "신문물을 아는 선생 한 분이 책을 빌려준다.", tags: ["intellectual"], flag: "link_scholar"},
    {max: 43, id: "buddha_religion", name: "종교인", desc: "절 스님이 뒤를 봐준다. 아플 때 찾아갈 곳이 있다.", tags: ["buddha_religion"], flag: "link_religious"},
    {max: 47, id: "christ_religion", name: "종교인", desc: "교회 목사님이 뒤를 봐준다. 아플 때 찾아갈 곳이 있다.", tags: ["christ_religion"]},
    {max: 50, id: "big_religion", name: "종교인", desc: "대종교에서 뒤를 봐준다. 훗날 중광단으로 갈 수 있다.", tags: ["big_religion"]},
    {max: 60, id: "press", name: "언론인", desc: "조선어 신문사 기자와 안면이 있다. 소식이 빠르다.", tags: ["press"], mod: {int: 3}, flag: "link_press"},
    {max: 70, id: "landlord", name: "지주", desc: "먼 친척이 땅 많은 지주다. 넉넉하진 않아도 굶지는 않는다.", tags: ["wealth", "landlord"], flag: "link_landlord"},
    {max: 80, id: "activist", name: "독립운동가", desc: "집안 어른이 독립운동에 몸담았다. 일경의 눈길이 따라다닌다.", tags: ["independence", "watched"], mod: {int: 3}, flag: "link_activist"},
    {max: 90, id: "police", name: "경찰", desc: "조선인 순사보 하나가 먼 친척이다. 검문에서 얼굴 한 번은 봐준다.", tags: ["police_contact"], flag: "link_police"},
    {max: 99, id: "foreigner", name: "외국인", desc: "서양인과 왕래가 있다. 외국으로 향할 때 도움이 될 수 있다.", tags: ["western"], flag: "link_foreigner"},
    {max: 100, special: true, id: "kimgu", name: "임시정부 요인", desc: "상해 임시정부의 요인이 집안 어른이다. 밀서와 군자금이 오가는 길목에 서 있다.", tags: ["kimgu"], flag: "link_kpg"}
  ] },
  { id: 'flaw', label: '결점', times: 1, table: [
    {max: 1, special: true, id: "none", name: "딱히 없음", desc: "흠잡을 데 없이 자랐다. 이 시대에 보기 드문 일이다.", tags: []},
    {max: 11, id: "frail", name: "약한 체력", desc: "쉽게 지치고 자주 앓는다.", tags: ["frail"], mod: {con: -8, str: -2}},
    {max: 19, id: "collab", name: "친일 경력", desc: "한때 일본인 밑에서 앞잡이 노릇을 했다. 일경은 너그럽지만 동포들의 눈길이 차갑다.", tags: ["pro_japanese"], fx: {heat: -2, money: 5}, flag: "flaw_collab"},
    {max: 29, id: "clumsy", name: "둔함", desc: "몸놀림이 굼뜨다는 소리를 자주 들었다.", tags: ["clumsy"], mod: {agi: -10}},
    {max: 39, id: "anemia", name: "빈혈", desc: "조금만 무리해도 눈앞이 핑 돈다.", tags: ["anemia"], mod: {con: -10}},
    {max: 49, id: "dim", name: "멍청함", desc: "머리 회전이 느려 속기 쉽다.", tags: ["dim"], mod: {int: -10}},
    {max: 59, id: "weak", name: "약한 힘", desc: "타고난 몸이 가늘고 힘이 없다.", tags: ["weak"], mod: {str: -10}},
    {max: 69, id: "shy", name: "내성적", desc: "낯선 사람 앞에서는 말문이 막힌다.", tags: ["shy"], mod: {int: -6}},
    {max: 79, id: "poor", name: "빈곤함", desc: "집안이 찢어지게 가난하다. 가진 것을 털어 빚을 갚았다.", tags: ["poor"], fx: {money: -8, medkit: -1}},
    {max: 89, id: "tactless", name: "눈치없음", desc: "분위기를 읽지 못해 자주 화를 산다.", tags: ["tactless"], mod: {int: -5, agi: -3}},
    {max: 99, id: "distracted", name: "산만함", desc: "한 가지에 집중하지 못한다. 손끝이 늘 흔들린다.", tags: ["distracted"], mod: {acc: -10}},
    {max: 100, special: true, id: "limp", name: "절름발이", desc: "어릴 적 사고로 한쪽 다리를 전다. 뛰는 것은 남보다 몇 배 힘들다.", tags: ["limp"], mod: {agi: -20}, flag: "flaw_limp"}
  ] },
  { id: 'teen', label: '청소년기 사건', times: 5, table: [
    {max: 5, id: "brawl", name: "패싸움", desc: "동네 패거리와 주먹다짐을 벌였다. 맞으며 단단해졌다.", tags: ["brawler"], mod: {str: 4, con: -1}},
    {max: 10, id: "errand", name: "장터 심부름", desc: "장터 어른들 심부름을 하며 셈과 눈치를 익혔다.", tags: ["street_smart"], mod: {int: 3}, fx: {money: 2}},
    {max: 15, id: "illness", name: "큰 병치레", desc: "한겨울을 앓아누웠다. 머리맡의 책이 유일한 벗이었다.", tags: ["sickly"], mod: {con: -1, int: 5}},
    {max: 20, id: "manse", name: "만세 행렬", desc: "어른들 틈에 섞여 만세를 불렀다. 붙잡혀 주재소에서 매를 맞고 풀려났다.", tags: ["protest", "watched", "grudge_police"], mod: {int: 2, con: -2, agi: 2, str: 2}, fx: {heat: 2}},
    {max: 25, id: "smithy", name: "대장간 견습", desc: "대장간에서 풀무질과 망치질을 배웠다. 손이 거칠어지고 눈이 정확해졌다.", tags: ["blacksmith", "crafter"], mod: {str: 2, acc: 2}},
    {max: 30, id: "hunting", name: "사냥 따라가기", desc: "포수 아저씨를 따라 산짐승을 쫓았다. 숨을 죽이고 겨누는 법을 익혔다.", tags: ["hunter", "mountain"], mod: {acc: 3, agi: 1}},
    {max: 35, id: "tram", name: "전차 매달리기", desc: "달리는 전차 뒤에 매달려 동네를 누볐다. 차장에게 걸려 순사에게 넘겨진 적도 있다.", tags: ["daredevil"], mod: {agi: 5, con: -1}},
    {max: 40, id: "ruin", name: "가세 몰락", desc: "아버지가 빚보증을 잘못 서 집이 넘어갔다. 일찍 철이 들었다.", tags: ["family_ruin", "poor"], mod: {int: 5}, fx: {money: -5}},
    {max: 45, id: "rescue", name: "물에 빠진 아이 구함", desc: "냇가에 빠진 아이를 건져 냈다. 동네 어른들이 두고두고 칭찬했다.", tags: ["local_hero", "community"], mod: {agi: 2, con: 1}, fx: {money: 2}},
    {max: 50, id: "shopboy", name: "일본인 상점 사환", desc: "잡화점에서 사환으로 일했다. 일본말은 늘었고 눈치도 늘었다.", tags: ["lang:ja", "shop_boy", "japanese_contact"], mod: {int: 2}, fx: {heat: -1}},
    {max: 55, id: "gambling", name: "노름판 기웃", desc: "골방 투전판을 들락거렸다. 판돈을 따기도 하고, 사람 속을 읽는 법도 배웠다.", tags: ["gambler", "underworld"], mod: {int: 2, con: -1}, fx: {money: 5}},
    {max: 60, id: "temple", name: "산사에서 한 철", desc: "몸을 추스르러 산사에 들어가 한 철을 보냈다. 마음이 고요해졌다.", tags: ["temple", "religion"], mod: {con: 2, int: 1}, fx: {heat: -1}},
    {max: 65, id: "ssireum", name: "씨름대회 우승", desc: "단오 씨름판에서 황소를 탔다. 힘깨나 쓴다는 소문이 돌았다.", tags: ["wrestler", "local_hero"], mod: {str: 5, int: -2}, fx: {money: 3}},
    {max: 70, id: "fire", name: "화재에서 살아남음", desc: "불길에 휩싸인 집에서 동생을 업고 뛰쳐나왔다. 연기를 너무 마셨다.", tags: ["fire_survivor"], mod: {agi: 3, con: -2, str: 3}},
    {max: 75, id: "english", name: "선교사의 영어 교습", desc: "예배당 선교사에게 영어 알파벳과 성경 구절을 배웠다.", tags: ["lang:en", "western", "missionary"], mod: {edu: 3, int: 1}},
    {max: 80, id: "pickpocket", name: "소매치기 패거리", desc: "장터 소매치기 무리에 끼어 손을 놀렸다. 발은 빨라졌지만 이름이 순사 수첩에 올랐다.", tags: ["pickpocket", "underworld"], mod: {agi: 3}, fx: {money: 3, heat: 1}},
    {max: 85, id: "baduk", name: "바둑 신동", desc: "동네 사랑방에서 어른들을 차례로 이기며 바둑 신동 소리를 들었다.", tags: ["strategist"], mod: {int: 5, str: -1}},
    {max: 90, id: "porter", name: "객주 짐꾼", desc: "객주에서 소금과 쌀가마를 날랐다. 어깨가 넓어지고 지구력이 붙었다.", tags: ["porter", "laborer"], mod: {str: 2, con: 3, int: -1}},
    {max: 95, id: "runaway", name: "가출", desc: "어릴 적 집을 뛰쳐나와 열차에 올랐다. 반년 만에 거지꼴로 돌아왔다.", tags: ["runaway", "manchuria_trip"], mod: {agi: 2, con: 2, str: 1}, fx: {money: -2}},
    {max: 99, id: "photo", name: "사진관 조수", desc: "사진관에서 조수로 일하며 카메라와 약품을 만졌다.", tags: ["photographer", "modern"], mod: {acc: 3, edu: 2}},
    {max: 100, special: true, id: "protest", name: "독립운동 참여", desc: "독립운동에 참여한 적이 있다. 적극적으로 참여하기 더 쉬울 것이다.", tags: ["protest"], mod: {int: 2, acc: 3}}
  ] }
];
