/* 경성비록 데이터: 장소 — 지역·은닉처·행동 */
var LOCS = {
  bukchon: { name: '북촌', hanja: '北村', sub: '계동 골목 안 셋방', safe: true,
    desc: '기와지붕 사이 좁은 골목 끝, 한 칸짜리 셋방. 주인 할머니는 밀린 방세에 엄하다.' },
  jongno: { name: '종로', hanja: '鐘路', sub: '조선인 상가 · 보신각 네거리',
    events: ['jn_pickpocket', 'jn_leaflet', 'jn_tavern', 'jn_fortune', 'jn_fire', 'jn_lostchild'], work: ['jn_porter', 'jn_newspaper'],
    desc: '전차 종소리와 장사꾼의 외침이 뒤섞이는 조선인의 거리. 사람이 많은 만큼 순사의 눈도 많다.' },
  honmachi: { name: '본정', hanja: '本町', sub: '혼마치 · 일본인 상권',
    events: ['hn_ronin', 'hn_rickshaw', 'hn_shop', 'hn_officer', 'hn_cafe', 'hn_opium'], work: ['hn_dept'],
    desc: '네온 간판과 백화점 쇼윈도가 늘어선 일본인의 거리. 조선옷 차림은 그 자체로 눈에 띈다.' },
  station: { name: '경성역', hanja: '京城驛', sub: '남대문 밖 정거장',
    events: ['st_check', 'st_wangpae', 'st_broker', 'st_returnee', 'st_luggage', 'st_recruit'], work: ['st_porter'],
    desc: '대륙으로 가는 기차와 사람, 소문이 모이는 곳. 헌병 검문이 잦다.' }
};
/* 사건이 벌어질 수 있는 거리 (북촌 셋방은 잠자는 곳) */
var STREETS = ['jongno', 'honmachi', 'station'];
/* 공통 사건: 지역이 정해져 있지 않아, 어느 도시의 어느 거리에서나 나온다 (각 거리의 events · work 와 함께 뽑힌다)
   개발자 탭의 '공통' 묶음에서 고치고 만든다 */
var COMMON = { events: [], work: [] };

/* ───── 은닉처 ─────
   총·탄환을 숨겨 두는 곳. 숨겨 둔 물건은 몸에 없으니 검문에 걸리지 않는다.
   은닉처가 없고 총이나 탄환을 지니고 있으면 STASH_FIND_CHANCE 확률로 '숨길 곳' 사건이 나온다.
   은닉처가 생기면 '은닉처에 들르기'를 예약할 수 있고, 다음 '다음으로'가 은닉처 방문으로 고정된다. */
var STASH_FIND_CHANCE = 0.1;
var STASH_SPOTS = [
  { id: 'floor', name: '셋방 마루 밑', loc: 'bukchon',
    find: '셋방 마루 한쪽 널빤지가 들뜬 것을 발견했다. 그 아래로 손 하나 들어갈 틈이 있다.',
    visit: '방문을 걸어 잠그고 들뜬 널빤지를 조심스레 들어 올린다.' },
  { id: 'shrine', name: '인왕산 국사당 뒤 바위틈', loc: 'bukchon',
    find: '무당집 뒤편 바위 사이로 사람 발길이 끊긴 틈이 보인다. 기름종이에 싸 두면 비도 피할 수 있겠다.',
    visit: '굿 소리를 뒤로하고 바위틈에 팔을 밀어 넣는다.' },
  { id: 'church', name: '정동 예배당 종탑', loc: 'jongno',
    find: '정동 예배당 종탑 계단 밑에 먼지 쌓인 궤짝이 있다. 선교사들도 거의 올라오지 않는 곳이다.',
    visit: '예배가 끝난 틈을 타 종탑 계단을 오른다.' },
  { id: 'crate', name: '경성역 화물창고 빈 궤짝', loc: 'station',
    find: '화물창고 구석에 몇 달째 주인이 찾아가지 않은 궤짝이 쌓여 있다. 그중 하나는 바닥이 이중이다.',
    visit: '짐꾼들 사이에 섞여 창고 구석의 궤짝으로 다가간다.' }
];
/* ───── 검문 트집 ─────
   조사에 순응해 걸린 게 없어도, chance + 감시도×perHeat 확률로 트집을 잡힌다.
   돈이 있으면 rob(돈 뜯김) / beat(끌려가 맞음) 중 무작위, 돈이 없으면 beat.
   rob: 가진 돈의 robFrac(올림, 최소 1원) · beat: 체력 -(beatDmg 주사위), 시간대가 beatTime 만큼 흐른다(밤이면 그대로) */
var HARASS = { chance: 0.2, perHeat: 0.015, robFrac: 0.5, beatDmg: { n: 1, s: 4, b: 1 }, beatTime: 1 };
var HARASS_TEXT = {
  rob: [
    '“가 봐.” 하더니 다시 불러 세운다. “잠깐, 이거 무슨 돈이냐? 출처가 수상하군.” 지갑이 {nm}의 주머니로 들어갔다.',
    '아무것도 나오지 않자 {nm}{iga} 혀를 찬다. “통행세다. 조선 놈이 길을 막았으니.” 손바닥을 내민다.',
    '“이 동전, 위조 아니냐?” 억지 트집 끝에 가진 돈 절반이 압수되었다. 영수증 같은 건 없다.'
  ],
  beat: [
    '“눈빛이 마음에 안 드는군.” 파출소 뒷방으로 끌려가 곤봉으로 몇 대 맞고서야 풀려났다.',
    '“불령선인 같은 얼굴이야.” 이유도 없이 주재소로 끌려갔다. 몇 시간 뒤, 멍든 채로 문밖에 내던져졌다.',
    '대답이 늦었다는 이유로 뺨이 날아온다. 골목으로 끌려가 실컷 걷어차인 뒤에야 놓여났다.'
  ]
};

/* ───── 행동 (탭) ─────
   예약하면 다음 '다음으로'가 그 행동으로 고정된다. 한 번에 하나만 예약.
   항목: id · name(p) 이름 · sub(p) 한 줄 설명 · open(p) 지금 할 수 있는지 · loc(p) 지역
     event(self, d) 사건을 만들어 돌려준다 · 또는 direct(self, d) 사건 없이 바로 결과를 낸다
   새 행동·장소는 여기에 한 줄 추가하면 탭에 나타난다 */
/* 먼저 싸움을 걸면(선택지 결과에 ambush: true): 처음 ap 번의 행동에 적이 대응하지 못함 · 표적이 빈틈(prone, 다음 공격 명중 +20)
   · 증원 호루라기는 늦게(alarm 무시) · 일제 쪽 상대(ENEMY_SIDE 'jp')가 있으면 일제 타협도 jp 만큼 변화 */
var AMBUSH = { ap: 1, prone: true, jp: -10 };
/* 몸을 사린다: 한 시간대를 숨어 지내며 감시도 -heat */
var LIE_LOW = { heat: 2 };
var LIE_LOW_TEXT = ['셋방 문을 걸어 잠그고 숨을 죽였다. 골목을 지나는 구둣발 소리가 멀어진다.', '사람 많은 곳을 피해 뒷골목만 골라 다녔다. 아무 일도 일어나지 않았다.',
  '하루 종일 장독대 뒤에서 짚신을 삼았다. 바깥 일에는 귀를 막았다.', '모자를 눌러쓰고 조용히 지냈다. 눈에 띄지 않는 것도 기술이다.'];
var PLACES = [
  { id: 'lie_low', kicker: '행동',
    open: function () { return true; },
    name: function () { return '몸을 사린다'; },
    sub: function (p) { return '이번 차례를 숨어 지낸다 · 감시도 -' + LIE_LOW.heat + ' (지금 ' + (p.heat || 0) + ')'; },
    loc: function (p) { return cityDef(p && p.city).home; },
    direct: function (self, d) {
      var parts = self.applyFx(d, { heat: -LIE_LOW.heat });
      d.event = null;
      d.outcome = { title: '몸을 사리다', text: self.pick(LIE_LOW_TEXT), summary: parts.join(' · ') || '감시도 변화 없음', fight: null };
      d.screen = 'outcome';
      self.log(d, TIMES[d.time] + ' · 몸을 사렸다. ' + (parts.join(', ') || ''), 'sys');
    } },
  { id: 'stash', kicker: '은닉처',
    open: function (p) { return !!(p.stash && stashSpot(p.stash.spot)); },
    name: function (p) { return stashSpot(p.stash.spot).name; },
    sub: function (p, self) { return '숨겨 둔 것: ' + self.stashText(p); },
    loc: function (p) { return stashSpot(p.stash.spot).loc; },
    event: function (self, d) { return self.makeStashVisit(d); } },
  { id: 'okada', kicker: '연줄',
    open: function (p) { return !!(p.tags && p.tags.okada); },
    name: function () { return '오카다 상회'; },
    sub: function () { return '본정 뒷골목 잡화상 · 오카다와의 연줄로 반값'; },
    loc: function () { return 'honmachi'; },
    event: function () { return Object.assign({ id: 'hn_shop' }, EVENTS.hn_shop); } }
];
/* 장기 이야기의 후속 단계도 행동 탭에 뜬다 (QUESTS 를 읽어 자동으로 추가) */
function questDue(p, qid) {
  var st = p && p.quests && p.quests[qid]; if (!st || /^end/.test(st.stage)) return null;
  var def = QUESTS[qid] && QUESTS[qid].stages[st.stage];
  if (!def || !def.event || (p.daysLived || 0) < (st.due || 0)) return null;
  return def;
}
function questEvent(qid, def) {
  var ev = Object.assign({ id: def.event, quest: qid }, QUEST_EVENTS[def.event]);
  return ev;
}
function placeById(id) { return PLACES.filter(function (x) { return x.id === id; })[0] || null; }
function stashSpot(id) { return STASH_SPOTS.filter(function (x) { return x.id === id; })[0] || null; }
function carriedGuns(p) { var w = (p && p.weapons) || {}; return Object.keys(w).filter(function (id) { return w[id] && WEAPONS[id] && WEAPONS[id].slot === 'gun'; }); }
function stashedGuns(p) { var w = (p && p.stash && p.stash.weapons) || {}; return Object.keys(w).filter(function (id) { return w[id]; }); }
/* 은닉처에 넣고 뺄 수 있는 물건: 무기(맨손 제외 · 총과 근접 무기 모두) · 탄환 · 격문
   key: 'w:무기id' / 'ammo' / 'leaflet' · contra: 검문에 걸리는 물건인지 */
function stashItemList(weapons, ammo, leaflet) {
  var out = [];
  Object.keys(weapons || {}).forEach(function (id) {
    if (!weapons[id] || id === 'fist' || !WEAPONS[id]) return;
    out.push({ key: 'w:' + id, label: WEAPONS[id].name, sub: WEAPONS[id].slot === 'gun' ? '총' : '근접 무기', contra: !!WEAPONS[id].contraband });
  });
  if (ammo > 0) out.push({ key: 'ammo', label: '탄환 ' + ammo + '발', sub: '탄환', contra: true });
  if (leaflet) out.push({ key: 'leaflet', label: '격문', sub: '종이', contra: true });
  return out;
}
function carriedStashables(p) { return stashItemList(p && p.weapons, (p && p.ammo) || 0, !!(p && p.flags && p.flags.leaflet)); }
function stashedItems(p) { var st = (p && p.stash) || {}; return stashItemList(st.weapons, st.ammo || 0, !!st.leaflet); }
/* 아무 일 없는 장면: 흐름 조절용 */
var QUIET = [
  { loc: 'jongno', title: '전차 종소리', text: '종로 네거리에 전차가 지나간다. 상점 처마 밑에서 잠시 볕을 쬐었다. 별일 없는 하루다.' },
  { loc: 'jongno', title: '보신각 앞', text: '장꾼들의 흥정 소리, 엿장수의 가위 소리. 사람 사는 소리가 오늘따라 정겹다.' },
  { loc: 'honmachi', title: '쇼윈도 너머', text: '본정 백화점 쇼윈도에 진열된 양복과 구두. 한참을 바라보다 발길을 돌렸다.' },
  { loc: 'station', title: '떠나는 기차', text: '만주행 기차가 기적을 울린다. 저 기차에 탄 사람들은 어디로 가는 걸까.' },
  { loc: 'bukchon', title: '골목의 아이들', text: '북촌 골목에서 아이들이 제기를 찬다. 주인 할머니가 고구마 하나를 쥐여 주었다.', fx: { hp: 1 } },
  { loc: 'station', title: '비 오는 오후', text: '갑자기 쏟아진 소나기. 역 처마 밑에서 낯선 사람들과 나란히 비를 피했다.' }
];
/* 시대 사건: years 범위 안에서만, 어느 거리에서든 나타난다 */
/* ───── 연줄 사건 ─────
   '다음으로'를 누를 때 LINK_EVENT_CHANCE 확률로, 태생 연줄(needTag 'link:항목id')에 맞는 사건 하나가 나온다.
   years: [시작, 끝] 연도 제한 · once: 한 인생에 한 번만 · loc: 일어나는 곳(없으면 무작위 거리)
   선택지 결과(ok/ng)에는 fx(돈·체력·능력치 등), weapon(무기 획득), skill(기술 획득), fight(전투)를 쓸 수 있다 */
