/* 경성비록 데이터: 전투 — 적·검문·전술·기술·무기 */
var ENEMIES = {
  junsa: { name: '순사', title: '칼을 찬 제복 순사', desc: '호루라기를 불기 전에 끝내야 한다.',
    hp: 8, hit: 50, evade: 10, dmg: { n: 1, s: 4, b: 1 }, chase: 10, reward: { money: 2 }, heat: 2,
    winText: '순사가 쓰러졌다. 호루라기 소리가 퍼지기 전에 골목을 빠져나간다.' },
  kenpei: { name: '헌병', title: '총검을 꽂은 일본 헌병', desc: '훈련받은 군인이다. 정면으로 맞서는 건 위험하다.',
    hp: 14, hit: 75, evade: 25, dmg: { n: 1, s: 6, b: 1 }, chase: 30, reward: { ammo: 2 }, heat: 3,
    winText: '헌병이 총검을 떨어뜨렸다. 이 일은 오래 뒤탈이 남을 것이다.' },
  hyungsa: { name: '고등계 형사', title: '사복 차림의 형사', desc: '중절모 아래 날카로운 눈. 품속에 권총을 숨기고 있다.',
    hp: 12, hit: 60, evade: 15, dmg: { n: 1, s: 6, b: 0 }, chase: 20, reward: { money: 4, ammo: 2 }, heat: 3,
    winText: '형사가 쓰러졌다. 경성 바닥이 한동안 시끄러울 것이다.' },
  ronin: { name: '낭인', title: '본정의 일본인 무뢰배', desc: '술 냄새를 풍기며 칼집을 만지작거린다.',
    hp: 10, hit: 60, evade: 10, dmg: { n: 1, s: 6, b: 0 }, chase: 10, talk: -20, heat: 1,
    talkText: '유창한 일본어로 상회 이름을 대자, 낭인들이 혀를 차며 물러났다.',
    reward: { money: 4 }, winText: '낭인이 쓰러지자 패거리가 흩어진다. 떨어진 지갑을 줍는다.' },
  thief: { name: '소매치기', title: '장터를 누비는 날랜 손', desc: '작은 칼을 쥐고 눈치를 살핀다. 오래 싸울 생각은 없어 보인다.',
    hp: 6, hit: 40, evade: 20, dmg: { n: 1, s: 4, b: 0 }, chase: 25, talk: -10, timid: true,
    talkText: '“순사 부르기 전에 내놔라.” 소매치기가 돈을 던지고 달아났다.',
    reward: { money: 4 }, winText: '소매치기를 제압했다. 잃었던 돈에 얹어 그의 주머니까지 털었다.' },
  wangpae: { name: '왈패', title: '역전 지게꾼 패거리 두목', desc: '어깨가 떡 벌어진 사내. 뒤에 졸개 둘이 있다.',
    hp: 10, hit: 55, evade: 5, dmg: { n: 1, s: 6, b: 0 }, chase: 10, talk: 0,
    talkText: '“그래, 네 말이 맞다. 같은 조선 놈끼리 자릿세는 무슨.” 두목이 피식 웃으며 길을 터 준다.',
    reward: { money: 5 }, winText: '두목이 무릎을 꿇자 졸개들이 물러선다. 오늘부터 역전에서 일할 수 있겠다.' },
  recruiter: { name: '모집원', title: '완장을 찬 근로보국대 모집원', desc: '조선인이지만 일제의 완장을 찼다. 곤봉을 휘두른다.',
    hp: 9, hit: 50, evade: 5, dmg: { n: 1, s: 4, b: 1 }, chase: 15, talk: -10, heat: 1, timid: true,
    talkText: '“우리 집엔 앓는 노모가 있소.” 모집원이 잠시 망설이더니 손을 놓았다.',
    reward: {}, winText: '모집원이 나뒹군다. 명부를 찢어 버리고 골목으로 사라진다.' },
  jolgae: { name: '졸개', title: '왈패 두목의 지게꾼 졸개', desc: '두목 눈치를 보며 몽둥이를 휘두른다. 혼자서는 겁이 많다.',
    hp: 6, hit: 45, evade: 5, dmg: { n: 1, s: 4, b: 0 }, chase: 10, talk: 10, timid: true,
    talkText: '“형님, 저 녀석 독한데요.” 졸개가 슬금슬금 물러났다.',
    reward: { money: 1 }, winText: '졸개가 꽁무니를 뺐다.' },

  youth: { name: '청년단원', title: '학생모를 눌러 쓴 청년', desc: '분노에 찬 눈빛. 싸움은 서툴지만 물러설 생각이 없다.',
    hp: 7, hit: 48, evade: 10, dmg: { n: 1, s: 4, b: 1 }, chase: 20, talk: -10,
    talkText: '“…태수를 위해서라도, 오늘은 그냥 간다.” 청년이 주먹을 풀었다.',
    reward: { money: 1 }, winText: '청년들이 이를 갈며 물러났다.' },
  /* 헌병보조원: 무단통치기 헌병 밑에서 검문을 도맡던 조선인 보조원. 순사 수준 */
  hbojo: { name: '헌병보조원', title: '완장을 찬 조선인 헌병보조원', desc: '같은 조선 사람이지만 헌병의 끄나풀이다. 칼보다 곤봉과 포승을 먼저 꺼낸다.',
    hp: 8, hit: 50, evade: 10, dmg: { n: 1, s: 4, b: 1 }, chase: 15, reward: { money: 2 }, heat: 2,
    winText: '보조원이 완장을 떨어뜨리고 나뒹군다. 헌병이 오기 전에 자리를 떠야 한다.' },
  /* ── 감시도가 오를수록 나오는 강한 적 (PATROL_TIERS 참고) ──
     여럿이 몰려오는 경우(순사 둘·체포조·헌병 분대)는 ENCOUNTERS 에서 개별 적을 묶는다 */
  tokko: { name: '특고 형사', title: '특별고등경찰 사상계 형사', desc: '사상범만 쫓는 자. 이미 당신의 이름과 하숙집을 알고 있다.',
    hp: 14, hit: 62, evade: 20, dmg: { n: 1, s: 6, b: 1 }, chase: 25, reward: { money: 8, ammo: 3 }, heat: 4,
    winText: '특고 형사의 수첩을 빼앗았다. 거기엔 당신 말고도 여러 이름이 적혀 있다.' },
  kibyeong: { name: '기마헌병', title: '말을 탄 일본 헌병', desc: '말 위에서 군도를 휘두른다. 달아나도 금세 따라잡힌다.',
    hp: 18, hit: 62, evade: 15, dmg: { n: 1, s: 8, b: 1 }, chase: 45, reward: { ammo: 4 }, heat: 4,
    winText: '말이 놀라 날뛰고 헌병이 땅바닥에 떨어졌다. 고삐를 끊고 골목으로 몸을 던진다.' },
  gocho: { name: '헌병 오장', title: '독립운동가 사냥으로 이름난 헌병 오장', desc: '만주에서 의병을 쫓던 자. 군도와 권총을 모두 다룬다.',
    hp: 24, hit: 70, evade: 25, dmg: { n: 1, s: 8, b: 2 }, chase: 35, reward: { money: 15, ammo: 6 }, heat: 6,
    winText: '전설 같던 헌병 오장이 무릎을 꿇었다. 이 소문은 만주까지 퍼질 것이다.' }
};

/* 불심검문 상대: 감시도에 따라 '후보가 추가되는' 방식 (기존 상대는 계속 나온다)
   PATROL_POOL 의 각 줄: foe(적 id 또는 ENCOUNTERS id) · from(이 감시도부터 후보) · w(그때의 가중치) · per(감시도 1당 가중치 증감) · min(최소 가중치)
   가중치 = max(min, w + per × (감시도 − from)) — 가중치 비율대로 무작위 하나
   순사·헌병은 감시도 2부터 PATROL_PAIR 확률로 둘이 된다 · 무단통치기(1910년대)는 순사·형사 대신 헌병 */
/* 감시도 0~HEAT_MAX(20) 기준 */
var PATROL_POOL = [
  { foe: 'junsa',        from: 0,  w: 10,  per: -0.35, min: 2 },
  { foe: 'hyungsa',      from: 4,  w: 2,   per: 0.5,   min: 0 },
  { foe: 'kenpei',       from: 8,  w: 1.5, per: 0.5,   min: 0 },
  { foe: 'tokko',        from: 10, w: 1,   per: 0.5,   min: 0 },
  { foe: 'kibyeong',     from: 13, w: 0.8, per: 0.4,   min: 0 },
  { foe: 'chepo_squad',  from: 13, w: 0.8, per: 0.4,   min: 0 },
  { foe: 'kenpei_squad', from: 16, w: 0.8, per: 0.5,   min: 0 },
  { foe: 'gocho_hunt',   from: 17, w: 0.6, per: 0.5,   min: 0 }
];
/* 무단통치기(1910년대): 헌병경찰 시대 — 순사·형사·특고 자리에 헌병보조원, 체포조 자리에 헌병 분대.
   감시도가 낮을 땐 보조원이 대부분이고, 높아질수록 진짜 헌병이 섞인다 */
var PATROL_E1 = { junsa: 'hbojo', hyungsa: 'hbojo', tokko: 'kenpei', chepo_squad: 'kenpei_squad', patrol_pair: 'hbojo_pair' };
/* (예전 단계식 표 — 지금은 쓰지 않음) */
var PATROL_TIERS = [
  { from: 0, foes: ['junsa'] },
  { from: 3, foes: ['hyungsa', 'patrol_pair'] },
  { from: 5, foes: ['kenpei', 'tokko'] },
  { from: 7, foes: ['kibyeong', 'chepo_squad'] },
  { from: 9, foes: ['kenpei_squad', 'gocho_hunt'] }
];
/* 예전의 순한 표 (보관용): 순사 → 형사(4) → 헌병(6) */
var PATROL_TIERS_EASY = [
  { from: 0, foes: ['junsa'] },
  { from: 4, foes: ['hyungsa'] },
  { from: 6, foes: ['kenpei'] }
];
var PATROL_PAIR = 0.35, PATROL_PAIR_FROM = 4; /* 감시도 PATROL_PAIR_FROM 이상이면 PATROL_PAIR 확률로 둘이 다닌다 */
/* 불심검문이 나올 확률 = base + (감시도 + 밤이면 night) × perHeat, 최대 max (일제 타협도가 낮으면 따로 가산)
   감시도 10 → 15%, 20 → 27% (예전: 감시도 10 → 34%) */
var PATROL_ENC = { base: 0.03, perHeat: 0.012, night: 2, max: 0.3 };
var PATROL_TEXT = {
  junsa: '“이봐, 거기 조선인. 이리 와 봐.” 순사가 곤봉으로 손짓한다.',
  hyungsa: '중절모를 쓴 사내가 어깨를 잡는다. “잠깐, 경찰서까지 같이 좀 가 주셔야겠소.”',
  patrol_pair: '앞뒤로 순사 둘이 길을 막는다. “너, 요즘 이 동네에서 자주 보이더라.”',
  hbojo: '완장을 찬 헌병보조원이 곤봉으로 앞을 막는다. “어이, 거기. 어디 사는 누구야.” 같은 조선말인데 말투가 차갑다.',
  kenpei: '총검을 꽂은 헌병 둘이 길을 막는다. 수배 전단과 당신 얼굴을 번갈아 본다.',
  tokko: '등 뒤에서 낮은 목소리. “{home} 셋방 사는 자네 맞지? 사상계에서 좀 보자는군.”',
  kibyeong: '말발굽 소리가 골목을 메운다. 기마헌병이 군도 끝으로 당신을 가리킨다.',
  chepo_squad: '골목 양쪽 끝에 형사들이 나타났다. 포승줄을 쥔 손이 보인다. 미리 기다리고 있었다.',
  kenpei_squad: '군홧발 소리가 일정하다. 헌병 한 분대가 거리를 봉쇄하고 행인을 하나씩 세운다.',
  gocho_hunt: '“드디어 만났군.” 칼자국 난 얼굴의 헌병 오장이 권총집을 풀며 웃는다.'
};

/* ───── 전장 (거리 전투) ─────
   전투는 길이 len(m)의 한 줄 위에서 벌어진다. 나는 start 근처에, 적은 시작 거리만큼 떨어져 선다.
   covers: 엄폐물 위치(m, 지형이라 고정) · crowd: 군중(총을 쏘면 감시도 +1 추가)
   exit: [최소, 최대] — 출구는 '나'로부터 이만큼 떨어진 곳에 매번 새로 생긴다(도달하면 도주 성공).
     한쪽에서 온 적: 보통 적의 반대편(등 뒤) · EXIT_FRONT 확률로 적 너머
     포위: 왼쪽·오른쪽 중 무작위 (적이 길을 막고 있을 수 있다)
   지역(loc)마다 전장이 다르고, 없으면 default */
var EXIT_FRONT = 0.15;
/* 이름 정하기: 최대 글자 수 · 무작위 이름 재료 */
var NAME_MAX = 12;
var NAME_FAMILY = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '홍', '유'];
var NAME_GIVEN = ['순이', '복동', '덕수', '말순', '용팔', '갑순', '점례', '만석', '귀남', '삼룡', '옥분', '봉수', '영철', '정숙', '창호', '길례', '두칠', '금순', '대식', '분이', '상훈', '경애', '병태', '춘자'];
var ARENAS = {
  jongno:   { name: '종로 장터', len: 30, start: 14, exit: [5, 12], exitName: '피맛골 입구', crowd: true,
              covers: [{ at: 9, name: '싸전 좌판' }, { at: 20, name: '짐수레' }],
              coverNames: ['싸전 좌판', '짐수레', '포목전 차양', '물동이 행렬', '쌀가마 더미'], exitNames: ['피맛골 입구', '종루 뒤 골목', '육의전 뒷문'], veilNames: ['좌판 차양', '장꾼 무리', '국밥집 솥김'] },
  honmachi: { name: '본정 거리', len: 30, start: 12, exit: [8, 14], exitName: '뒷골목',
              covers: [{ at: 6, name: '전봇대' }, { at: 17, name: '상점 진열대' }],
              coverNames: ['전봇대', '상점 진열대', '인력거', '광고탑', '자전거 더미'], exitNames: ['뒷골목', '백화점 통용문', '카페 뒷문'], veilNames: ['상점 차양', '광고 깃발', '오가는 인파'] },
  station:  { name: '경성역 광장', len: 30, start: 15, exit: [10, 16], exitName: '대합실 출입구',
              covers: [{ at: 23, name: '분수대' }],
              coverNames: ['분수대', '짐 더미', '인력거 대기줄', '철제 난간'], exitNames: ['대합실 출입구', '화물 통로', '선로 건널목'], veilNames: ['기관차 증기', '대합실 인파', '신문 가판'] },
  default:  { name: '북촌 골목', len: 24, start: 8, exit: [3, 8], exitName: '담장 틈',
              covers: [{ at: 5, name: '돌담 모퉁이' }, { at: 14, name: '장독대' }],
              coverNames: ['돌담 모퉁이', '장독대', '우물가', '장작더미'], exitNames: ['담장 틈', '쪽문', '개구멍', '지붕 위'], veilNames: ['빨래 줄', '아궁이 연기', '짚단 더미'] }
};
/* 시야 방해: 나와 상대 사이(양 끝에서 margin m 안쪽)에 시야 방해물이나 '시야를 가리는 엄폐물'이 있으면
   서로의 명중이 하나당 -hit (최대 -max). 숨는 것도, 보이지 않게 되는 것도 아니다 · 엄폐물은 coverChance 확률로 시야도 가린다 */
var VEIL = { hit: 15, max: 30, margin: 0.4, coverChance: 0.4 };
/* 엄폐는 총알만 막는다: 근접 공격에는 소용이 없고, 근접 공격에 맞으면 엄폐가 풀린다 (나·적 모두) */
/* 행동력: 내가 행동력 1을 쓸 때마다 적이 한 번씩 움직인다(= 1합). 공격·기술은 무기·기술의 ap 만큼, 이동 1 = step(m) + 민첩/stepAgi.
   (ap·attacks 값은 이제 쓰지 않는다)
   cover: 엄폐 중 적 명중 감소 · crouch: 몸 낮추기 · aim: 적이 겨눈 다음 사격 명중 보너스
   alarm: 호루라기 뒤 증원까지 합 수 · shotAlarm: 총성이 처음 울릴 때 시작되는 증원 시계 · backup: 증원 도착 시 적 강화 */
/* 전장 화면: 나와 표적을 함께 비추는 창 (m). 둘 사이 거리 + 양옆 pad 만큼 보이되 min~max 로 제한.
   max 보다 멀면 나를 기준으로 표적 쪽을 비추고, 화면 밖 적·출구는 가장자리에 화살표로 표시 */
var FIELD_VIEW = { min: 14, max: 24, pad: 3, tick: 5 };
/* ───── 전장 절차 생성 ─────
   전투마다 길이·엄폐물·출구를 새로 만든다. ARENAS 의 len 은 기준 길이, coverNames·exitNames 는 그 장소의 이름 후보(모자라면 공용 후보).
   len: 기준 길이에 더하는 범위 [최소, 최대] · minLen/maxLen: 길이 한계 (적·출구가 다 들어가지 않으면 늘린다)
   covers·exits: 개수를 이 목록에서 무작위로 (같은 수가 많을수록 잘 나온다)
   exitGap: 출구끼리 최소 거리 · exitNear~exitFar: 두 번째 출구부터 나와의 거리 · coverGap: 엄폐물끼리 · coverNear: 나와 엄폐물 최소 거리 */
/* 끝없는 전장: 처음엔 나를 중심으로 ±startSpan m 를 만들고, 누군가 끝에서 margin m 안으로 오면 chunk m 씩 더 만든다.
   한번 만든 곳은 그대로 기억한다. chunk 마다: 엄폐물 cCovers · 시야 cVeils · 이동 방해 cHurdles · 겹친 방해물 cCombo 확률 · 출구 cExit 확률
   출구끼리는 exitGap(30m) 안에 붙어 있을 수 없다 */
var ARENA_GEN = { len: [-4, 6], minLen: 20, startSpan: 40, margin: 30, chunk: 20,
  cCovers: [0, 1, 1, 2], cVeils: [0, 0, 1], cHurdles: [0, 0, 1], cCombo: 0.35, cExit: 0.55, backupDist: [12, 16],
  covers: [1, 2, 2, 2, 3, 3, 4], exits: [1], /* 시작 때는 출구 하나 — 나머지는 전장을 만들어 가며 30m 이상 떨어진 곳에 */
  exitGap: 30, exitNear: 30, exitFar: 45, coverGap: 3, coverNear: 2,
  surroundGap: 0.4, /* 포위됐을 때 한쪽 적보다 안쪽에 샛길이 하나 더 생길 확률 */
  veils: [0, 1, 1, 1, 2, 2], veilGap: 2, /* 시야 방해물 개수 · 서로·출구·엄폐물과 최소 거리 */
  hurdles: [0, 1, 1, 1, 2, 2], hurdleGap: 2.5, /* 이동 방해물 개수 · 서로·출구·엄폐물과 최소 거리 */
  veilPool: ['빨래 줄', '천막 차양', '아궁이 연기', '짚단 더미', '걸어 둔 멍석', '솥에서 오르는 김'],
  coverPool: ['전봇대', '짐수레', '나무 궤짝', '가마니 더미', '돌담', '인력거', '빈 술독', '널빤지 더미'],
  exitPool: ['골목 어귀', '담장 틈', '뒷골목', '쪽문', '샛길', '처마 밑 통로'] };
/* ───── 이동 방해물 ─────
   넘어가려면 stat 판정(diff). 실패하면 그 앞에서 멈춘다(행동력은 쓴다). 적은 판정 없이 넘지만 그 앞에서 멈췄다가 다음 한 합을 넘는 데 쓴다.
   이름 · 판정 능력치 · 난이도 · 넘을 때/실패할 때 글 */
var HURDLES = [
  { name: '낮은 돌담', stat: 'str', diff: 'normal', ok: '돌담을 짚고 몸을 끌어올려 넘었다', ng: '돌담에 매달렸다가 미끄러져 내려왔다' },
  { name: '장작 더미', stat: 'str', diff: 'easy', ok: '장작 더미를 밀어젖히고 넘었다', ng: '장작이 무너져 내려 발이 묶였다' },
  { name: '뒤엎어진 수레', stat: 'agi', diff: 'normal', ok: '수레 바퀴를 딛고 훌쩍 넘었다', ng: '수레 끌채에 발이 걸렸다' },
  { name: '시궁창 도랑', stat: 'agi', diff: 'easy', ok: '도랑을 훌쩍 건너뛰었다', ng: '도랑에 발이 빠졌다' },
  { name: '철조망 울타리', stat: 'agi', diff: 'hard', ok: '철조망 틈으로 몸을 비틀어 빠져나갔다', ng: '철조망에 옷자락이 걸렸다' },
  { name: '깨진 독 조각', stat: 'con', diff: 'normal', ok: '깨진 독 조각을 밟고 아픔을 참으며 지나갔다', ng: '발바닥이 찢길 듯해 멈춰 섰다' },
  { name: '얼어붙은 비탈', stat: 'agi', diff: 'normal', ok: '얼음 비탈을 미끄러지듯 내려섰다', ng: '얼음에 미끄러져 넘어졌다' }
];
/* ───── 겹친 방해물 · 임시 방해물 ─────
   한 물건이 여러 성질을 함께 가질 수 있다: cover 엄폐물 · veil 시야 방해 · hurdle 이동 방해(넘기 판정)
   temp: [최소, 최대] 합 동안만 있다가 사라진다 (없으면 끝까지 남음) · come: 전투 중에 나타날 때 글 · gone: 사라질 때 글
   OBST_GEN: 전투 시작 때 겹친 방해물 개수(perm) · 임시 방해물 개수(temp) · 합마다 새 임시 방해물이 나타날 확률(spawn) · 동시에 있을 수 있는 임시 방해물 수(maxTemp) */
var H_CLIMB = function (stat, diff, ok, ng) { return { stat: stat, diff: diff, ok: ok, ng: ng }; };
var OBSTACLES = [
  /* 오래 남는 겹친 방해물 */
  { name: '무너진 돌담', cover: true, hurdle: H_CLIMB('str', 'normal', '무너진 돌담 위로 기어올라 넘었다', '무너진 돌 더미에 발이 미끄러졌다') },
  { name: '천막 친 노점', cover: true, veil: true },
  { name: '쌓아 둔 볏짚 더미', veil: true, hurdle: H_CLIMB('str', 'easy', '볏짚 더미를 헤치고 넘었다', '볏짚에 발이 푹 빠졌다') },
  { name: '빨래 널린 장대 울타리', cover: true, veil: true, hurdle: H_CLIMB('agi', 'normal', '장대 사이로 몸을 빼냈다', '젖은 빨래에 휘감겼다') },
  /* 잠시 있다 사라지는 것 */
  { name: '흙먼지 바람', veil: true, temp: [1, 3], come: '흙먼지 바람이 골목을 휩쓴다', gone: '흙먼지가 가라앉았다' },
  { name: '굴뚝 연기', veil: true, temp: [2, 4], come: '굴뚝에서 시커먼 연기가 내려앉는다', gone: '연기가 걷혔다' },
  { name: '멈춰 선 인력거', cover: true, temp: [2, 4], come: '인력거 하나가 길 한복판에 멈춰 선다', gone: '인력거꾼이 서둘러 인력거를 끌고 가 버렸다' },
  { name: '쏟아진 사과 광주리', hurdle: H_CLIMB('agi', 'easy', '굴러다니는 사과를 피해 건너갔다', '사과를 밟고 미끄러졌다'), temp: [2, 5], come: '광주리가 엎어져 사과가 길바닥에 쏟아진다', gone: '행인들이 사과를 다 주워 갔다' },
  { name: '짐 부리는 달구지', cover: true, hurdle: H_CLIMB('str', 'normal', '달구지 짐칸을 타 넘었다', '달구지 바퀴에 걸려 멈췄다'), temp: [2, 4], come: '달구지 한 대가 들어와 짐을 부리기 시작한다', gone: '달구지가 짐을 다 부리고 떠났다' },
  { name: '지나가는 소 떼', veil: true, hurdle: H_CLIMB('agi', 'normal', '소 떼 사이를 비집고 빠져나갔다', '소 엉덩이에 밀려 물러났다'), temp: [1, 3], come: '소 떼가 우르르 골목으로 몰려든다', gone: '소 떼가 지나갔다' },
  { name: '천막 노점 행렬', cover: true, veil: true, temp: [2, 4], come: '장꾼들이 급히 천막을 펼친다', gone: '장꾼들이 천막을 걷어 달아났다' },
  { name: '멈춰 선 전차', cover: true, veil: true, hurdle: H_CLIMB('agi', 'hard', '전차 발판을 딛고 건너편으로 뛰어내렸다', '전차 발판에서 미끄러졌다'), temp: [2, 3], come: '전차가 종을 울리며 들어와 멈춰 선다', gone: '전차가 다시 종을 울리며 떠났다' },
  { name: '구경꾼 인파', veil: true, hurdle: H_CLIMB('str', 'normal', '구경꾼들을 어깨로 밀치고 지나갔다', '구경꾼들에게 떠밀려 나왔다'), temp: [1, 3], come: '소란을 듣고 구경꾼들이 몰려든다', gone: '구경꾼들이 흩어졌다' }
];
var OBST_GEN = { perm: [0, 0, 1, 1], temp: [0, 0, 0, 1], spawn: 0.15, maxTemp: 2, near: 1.0, gap: 1.5 };
/* 피해 가기: 막아선 적 하나를 지나쳐 그 뒤로 간다 (행동력 1, 판정 없음)
   적 뒤로 떨어지는 거리 = min + 무작위(0~1) × (base + (민첩×agi + 근력×str)/100) — 최대 max m */
var DODGE = { min: 0.8, base: 0.6, agi: 1.4, str: 0.6, max: 3.5, room: 1.0 };
/* 한 걸음(m) = step + (민첩 − stepMid) / stepAgi, stepMin~stepMax 로 묶음 (민첩 10 → 2.2m · 50 → 3m · 90 → 3.8m) */
/* stepVar: 실제로 움직이는 거리의 편차 (한 걸음 × (1 ± stepVar), 무작위) */
var TACTIC = { ap: 3, step: 3, stepMid: 50, stepAgi: 50, stepMin: 2.2, stepMax: 3.8, stepVar: 0.15, attacks: 1, cover: 35, coverRange: 1, crouch: 15, aim: 20,
  alarm: 4, shotAlarm: 5, backup: { hit: 10, dmg: 1 }, gunFall: 1.5, gunMaxFall: 30,
  /* 먼 거리 사격: 적은 선호 거리 + gunFarFrom 을 넘은 1m마다 명중 -gunFarFall (최대 -gunFarMax, 위 gunFall 과 별도)
     나는 무기의 far(없으면 farFrom)m 를 넘은 1m마다 명중 -farFall (최대 -farMax, 무기 거리 곡선과 별도) */
  gunFarFrom: 4, gunFarFall: 3, gunFarMax: 40, farFrom: 15, farFall: 3, farMax: 45,
  /* 여러 적: surroundRange 안 양쪽에 적이 있으면 포위 — 적 명중 +surroundHit, 도주 -surroundFlee
     증원은 새 적으로 나타난다 (전장 최대 maxFoes 명, 한 전투 maxBackups 번). backupFromExit: 증원이 출구 쪽에서 나타날 확률 */
  surroundRange: 3, surroundHit: 10, surroundFlee: 20, maxFoes: 4, maxBackups: 2, backupFromExit: 0.33,
  /* 적의 잡기: grabReach 안에서 적의 grab 확률로 시도. 잡히면 이동 불가 · 도주 -heldFlee · 그 적의 다음 공격 필중
     뿌리치기: 근력 판정(근력 + breakMod − 적 명중/5), 행동력 1 */
  grabReach: 1.2, heldFlee: 30, breakMod: 10,
  /* 내가 적을 잡으면: 다음 내 공격(잡기 제외)은 반드시 맞는다. 적이 grabHold 번 움직이는 동안 유지 (선제 무료 행동은 세지 않음)
     잡힌 적은 자리를 옮기지 못하고 버둥거리거나 그 자리에서 때린다 · 내가 움직이면 손을 놓는다 */
  grabHold: 3,
  /* 위협당하면 다음 합 내 명중 -shaken · 적이 엄폐하면 내 사격 명중 -foeCover */
  shaken: 10, foeCover: 30,
  /* 항복: 관헌 앞이면 불법 소지품(총·탄환·칼)만 압수 · 관헌이 아닌 상대(왈패·낭인 등)에게는 돈 surrenderMoney 비율을 털린다
     surrenderHp: 예전의 매질 피해 (지금은 쓰지 않음) */
  surrenderHp: { n: 1, s: 4, b: 1 }, surrenderMoney: 0.5 };
/* ───── 적의 성격 ─────
   적이 나타날 때 PERSONA_BY_FOE 가중치로 하나를 뽑는다.
   morale: 시작 사기 · flee: 사기가 이 아래면 달아남 · offer/taunt/retreat/flank/block/cover: 그 행동을 고를 확률
   grabPlus: 잡기 확률 가산 · charge: 거리를 좁힐 때 1m 더 달려듦 · poker: 기색 읽기(지능 판정) 감점
   label: 정확히 읽었을 때 보이는 성격 · look: 흐릿하게 읽었을 때 */
var PERSONALITY = {
  aggressive: { label: '성미가 급하고 거칠다', look: '눈에 핏발이 서 있다', morale: 100, flee: 15, offer: 0.15, taunt: 0.15, retreat: 0.05, flank: 0.3, block: 0.15, cover: 0.2, grabPlus: 0.1, charge: true, poker: 0 },
  cautious:   { label: '신중하고 침착하다', look: '주위를 살피는 눈치다', morale: 85, flee: 25, offer: 0.35, taunt: 0.05, retreat: 0.5, flank: 0.2, block: 0.35, cover: 0.6, grabPlus: 0, charge: false, poker: 5 },
  cunning:    { label: '교활하다 — 수를 읽는다', look: '입꼬리가 묘하게 올라가 있다', morale: 90, flee: 20, offer: 0.4, taunt: 0.25, retreat: 0.3, flank: 0.6, block: 0.6, cover: 0.5, grabPlus: 0.1, charge: false, poker: 15 },
  coward:     { label: '겁이 많다 — 쉽게 꺾인다', look: '손이 떨리고 있다', morale: 60, flee: 40, offer: 0.1, taunt: 0.2, retreat: 0.6, flank: 0.1, block: 0.1, cover: 0.7, grabPlus: -0.1, charge: false, poker: 0 }
};
var PERSONA_BY_FOE = {
  junsa: { aggressive: 3, cautious: 4, cunning: 2, coward: 1 },
  hbojo: { cautious: 4, coward: 3, aggressive: 2, cunning: 1 },
  kenpei: { aggressive: 2, cautious: 5, cunning: 3 },
  hyungsa: { cautious: 4, cunning: 6 },
  ronin: { aggressive: 7, cunning: 2, coward: 1 },
  thief: { coward: 7, cunning: 3 },
  wangpae: { aggressive: 6, cunning: 3, cautious: 1 },
  jolgae: { coward: 6, aggressive: 3, cautious: 1 },
  recruiter: { coward: 4, cautious: 4, cunning: 2 },
  tokko: { cunning: 7, cautious: 3 },
  youth: { aggressive: 5, cautious: 3, coward: 2 },
  kibyeong: { aggressive: 6, cautious: 3, cunning: 1 },
  gocho: { cunning: 6, aggressive: 4 },
  _default: { aggressive: 3, cautious: 4, cunning: 2, coward: 1 }
};
/* 사기: 피해(최대 체력 대비 비율 × moraleHit), 동료가 쓰러지면 -moraleAlly, 총성 -moraleShot */
var MORALE = { hit: 60, ally: 25, shot: 10 };
/* 정확히 읽었을 때의 행동 · 흐릿한 징후 */
var INTENT_TEXT = {
  stunned: '정신을 못 차리고 있다', attack: '덤벼들려 한다', approach: '다가오려 한다', charge: '곧장 달려들려 한다',
  grab: '멱살을 잡으려 한다', flank: '옆으로 돌아 반대편을 노린다', blockExit: '출구 쪽을 막으려 한다',
  retreat: '뒤로 물러서려 한다', flee: '달아나려 한다', subdue: '덤벼들려 한다', bind: '덤벼들려 한다', closein: '다가오려 한다', takeCover: '엄폐물 뒤로 숨으려 한다', aim: '숨을 고르며 겨누려 한다',
  shift: '자리를 옮기려 한다 (이번엔 쏘지 않는다)', shoot: '총을 쏘려 한다', intimidate: '겁을 주려 한다', offer: '항복을 권하려 한다', whistle: '호루라기로 증원을 부르려 한다'
};
var INTENT_HINT = {
  attack: '몸에 힘이 들어간다', approach: '발끝이 이쪽을 향한다', charge: '어깨가 앞으로 쏠린다', grab: '손을 뻗을 듯 어깨가 들썩인다',
  subdue: '몸에 힘이 들어간다', bind: '몸에 힘이 들어간다', closein: '발끝이 이쪽을 향한다', flank: '눈길이 내 옆쪽으로 흐른다', blockExit: '출구 쪽을 힐끗 본다', retreat: '무게가 뒤로 실린다', flee: '뒷걸음질 칠 기색이다',
  takeCover: '주변 엄폐물을 살핀다', aim: '숨이 가라앉는다', shift: '발을 옮길 기색이다', shoot: '방아쇠에 손가락이 걸려 있다',
  intimidate: '입을 열려 한다', offer: '말을 걸려 한다', whistle: '가슴팍의 무언가를 더듬는다'
};
var TAUNT_LINES = ['조선 놈 하나쯤 여기서 죽어도 아무도 모른다.', '무릎 꿇으면 목숨은 살려 주지.', '네 식구들 얼굴도 다 알고 있다.', '헛힘 쓰지 마라. 끝났어.'];
var OFFER_LINES = ['순순히 따라오면 매 몇 대로 끝내 주마.', '항복해라. 지금이면 경찰서까지 걸어서 간다.', '그만하지. 가진 거 내놓으면 보내 주지.'];

/* 여러 명이 나오는 전투: foes = 적 id 목록(첫 번째가 우두머리) · form: line(한쪽에서) / surround(앞뒤 포위) / random */
var ENCOUNTER_SURROUND = 0.5;
var ENCOUNTERS = {
  patrol_pair:  { foes: ['junsa', 'junsa'], form: 'random' },
  wangpae_gang: { foes: ['wangpae', 'jolgae', 'jolgae'], form: 'random' },
  ronin_gang:   { foes: ['ronin', 'ronin'], form: 'line' },
  kenpei_pair:  { foes: ['kenpei', 'kenpei'], form: 'line' },
  hbojo_pair:   { foes: ['hbojo', 'hbojo'], form: 'random' },
  /* 강한 상대 (감시도 높을 때 불심검문) — name: 사건 제목에 쓰는 이름 */
  chepo_squad:  { name: '체포조', foes: ['tokko', 'hyungsa', 'hyungsa'], form: 'random' },
  kenpei_squad: { name: '헌병 분대', foes: ['kenpei', 'kenpei', 'kenpei'], form: 'line' },
  gocho_hunt:   { name: '헌병 오장', foes: ['gocho', 'kenpei'], form: 'random' },
  /* 이야기 전투 */
  raid_light:   { foes: ['hyungsa', 'junsa'], form: 'line' },
  raid:         { foes: ['hyungsa', 'junsa', 'junsa'], form: 'surround' },
  youths:       { foes: ['youth', 'youth', 'youth'], form: 'random' }
};
/* 적의 전투 방식 (ENEMIES 에 없으면 이 값). style: melee(붙어서 때림) · gun(선호 거리 pref 에서 쏨) · grab: 붙어 있을 때 잡기를 시도할 확률
   morale: 성격의 시작 사기에 더하는 값 (클수록 잘 안 달아남)
   reach: 근접 공격 거리 · speed: 한 합 이동 거리 · start: 시작 거리 · whistle: 호루라기로 증원을 부름 */
var FOE_TACTICS = {
  junsa:     { style: 'melee', reach: 1.5, speed: 4, start: 4, whistle: true, grab: 0.3 },
  hbojo:     { style: 'melee', reach: 1.5, speed: 4, start: 4, whistle: true, grab: 0.35 },
  kenpei:    { style: 'gun', pref: 10, reach: 2, speed: 3, start: 8 },
  hyungsa:   { style: 'gun', pref: 5, reach: 1.5, speed: 3, start: 5, whistle: true, grab: 0.3 },
  ronin:     { style: 'melee', reach: 2, speed: 4, start: 3 },
  thief:     { style: 'melee', reach: 1.2, speed: 5, start: 2 },
  wangpae:   { style: 'melee', reach: 1.5, speed: 4, start: 2, grab: 0.4 },
  recruiter: { style: 'melee', reach: 1.5, speed: 3, start: 3, whistle: true, grab: 0.5 },
  jolgae:    { style: 'melee', reach: 1.5, speed: 4, start: 3, grab: 0.25 },
  youth:     { style: 'melee', reach: 1.5, speed: 4, start: 3, grab: 0.2 },
  tokko:     { style: 'gun', pref: 6, reach: 1.5, speed: 3, start: 6, whistle: true, grab: 0.3 },
  /* 기마헌병: 말 위라 군도가 길고(2.5m) 빠르다(7m). 잡기는 못 한다 */
  kibyeong:  { style: 'melee', reach: 2.5, speed: 7, start: 12 },
  /* 헌병 오장: 권총(선호 7m) + 군도. 사기가 거의 꺾이지 않는다 */
  gocho:     { style: 'gun', pref: 7, reach: 2, speed: 4, start: 9, grab: 0.2, morale: 40 },
  _default:  { style: 'melee', reach: 1.5, speed: 4, start: 4 }
};

/* ───── 전투 기술 ─────
   stat: 판정 능력치 · mod: 명중 보정 · noEvade: 적 회피 무시 · dmg: 피해 주사위 · bonus: 피해 보너스 능력치(÷30)
   cd: 재사용 대기(합) · ammo/gun: 탄환·권총 필요 · effects: 성공 시 효과(minTier 'hard' = 어려운 성공 이상)
   효과 종류: stun 기절(적 행동 불가) · prone 넘어짐(1합 행동 불가 + 다음 공격 명중 +20)
             bleed 출혈(매 합 피해) · blind 눈 멂(적 명중 -30) · weak 위축(적 명중 -20)
   대성공이면 피해 2배, 효과 지속 +1합 */
/* 기술: reach = 쓸 수 있는 최대 거리(m, 없으면 근접 기술은 무기 사거리, 사격은 제한 없음) · ap = 행동력(없으면 무기 기본값) */
var SKILLS = {
  punch: { name: '기본 격투', group: 'melee', stat: 'str', mod: 0, dmg: { n: 1, s: 6, b: 0 }, bonus: 'str', cd: 0,
    desc: '들고 있는 근접 무기(없으면 맨주먹)로 친다.', hitText: '주먹이 꽂혔다!', missText: '헛손질이다.' },
  combo: { name: '연타', group: 'melee', stat: 'str', mod: -15, dmg: { n: 2, s: 4, b: 0 }, bonus: 'str', cd: 1,
    desc: '빗나가기 쉽지만 묵직하다', hitText: '주먹을 연달아 꽂아 넣었다!', missText: '연타가 모두 막혔다.' },
  headbutt: { name: '박치기', group: 'melee', stat: 'str', mod: -10, dmg: { n: 1, s: 6, b: 2 }, cd: 3,
    effects: [{ type: 'stun', turns: 1 }], selfFail: { hp: -1 },
    desc: '성공 시 기절 1합 · 실패 시 내 체력 -1', hitText: '이마로 정면을 들이받았다!', missText: '빗맞았다. 내 이마만 얼얼하다.' },
  /* 잡기: 초근접(1m) · 피해는 적지만, 성공하면 다음 합 그 적에게 하는 첫 공격이 반드시 맞는다. 잡힌 적은 그 사이 움직이지 못한다 */
  grab: { name: '잡기', group: 'melee', stat: 'str', mod: 5, dmg: { n: 1, s: 2, b: 0 }, cd: 2, reach: 1, ap: 1,
    effects: [{ type: 'grab' }],
    desc: '초근접 · 다음 합 첫 공격 필중 · 잡힌 적은 이동 불가', hitText: '멱살을 움켜쥐었다!', missText: '손이 미끄러졌다.' },
  throw: { name: '업어치기', group: 'melee', stat: 'str', mod: -20, dmg: { n: 2, s: 6, b: 0 }, cd: 3,
    effects: [{ type: 'stun', turns: 1, minTier: 'hard' }],
    desc: '어려운 성공 이상이면 기절 1합', hitText: '멱살을 잡아 바닥에 메다꽂았다!', missText: '붙잡았지만 뿌리쳤다.' },
  vital: { name: '급소 지르기', group: 'melee', stat: 'acc', mod: -10, dmg: { n: 1, s: 4, b: 0 }, cd: 2,
    effects: [{ type: 'bleed', dmg: 2, turns: 3 }],
    desc: '성공 시 출혈 3합 (매 합 2)', hitText: '급소를 정확히 찔렀다!', missText: '급소를 비껴갔다.' },
  trip: { name: '다리 걸기', group: 'trick', stat: 'agi', mod: 0, dmg: null, cd: 2, reach: 1.5, ap: 1,
    effects: [{ type: 'prone' }],
    desc: '피해 없음 · 넘어뜨려 1합 묶고 다음 공격 명중 +20', hitText: '발을 걸어 넘어뜨렸다!', missText: '눈치채고 발을 피했다.' },
  sand: { name: '흙 뿌리기', group: 'trick', stat: 'agi', mod: 10, noEvade: true, dmg: null, cd: 3, reach: 3, ap: 1,
    effects: [{ type: 'blind', turns: 2 }],
    desc: '회피 무시 · 피해 없음 · 2합간 적 명중 -30', hitText: '한 줌 흙이 적의 눈에 들어갔다!', missText: '흙이 바람에 흩어졌다.' },
  shot: { name: '기본 사격', group: 'gun', stat: 'acc', mod: 0, dmg: { n: 2, s: 6, b: 3 }, ammo: 1, gun: true, cd: 0,
    desc: '들고 있는 총으로 한 발 쏜다.', hitText: '명중!', missText: '탄환이 빗나갔다.' },
  aimed: { name: '조준 사격', group: 'gun', stat: 'acc', mod: 20, apPlus: 1, dmg: { n: 3, s: 6, b: 5 }, ammo: 1, gun: true, cd: 2,
    desc: '숨을 고르고 노린다', hitText: '숨을 멈추고 당긴 방아쇠 — 정확히 꿰뚫었다!', missText: '조준했지만 상대가 몸을 틀었다.' },
  double: { name: '연발', group: 'gun', stat: 'acc', mod: -20, dmg: { n: 4, s: 6, b: 6 }, ammo: 2, gun: true, cd: 2,
    desc: '두 발을 연달아', hitText: '탕, 탕! 두 발이 모두 박혔다!', missText: '두 발 모두 허공을 갈랐다.' },
  warn: { name: '위협 사격', group: 'gun', stat: 'acc', mod: 15, noEvade: true, dmg: null, ammo: 1, gun: true, cd: 2, scare: true,
    effects: [{ type: 'weak', turns: 2 }],
    desc: '회피 무시 · 피해 없음 · 2합간 적 명중 -20 · 겁 많은 적은 달아남', hitText: '발치에 총알이 튀었다. 상대가 움찔한다!', missText: '총성에도 상대는 꿈쩍하지 않는다.' }
};
/* 액션 커맨드(타이밍 바): 표시가 0→100% 를 dur ms 동안 지나간다. 목표 중심과의 거리(%)로 등급 결정.
   within = 중심에서 ±몇 % 안이면 그 등급. 기술마다 qteDur 로 속도를 바꿀 수 있다. */
var QTE = {
  dur: 1100, centerMin: 35, centerMax: 80, pause: 650,
  grades: [
    /* 치명: 정중앙(±0.5% ≈ 앞뒤 5.5ms) — 명중 +40, 피해 +1 */
    { id: 'lethal', label: '치명!!', within: 0.5, bonus: 40, dmg: 1, color: '#9E2B20' },
    { label: '완벽!', within: 3, bonus: 30, color: '#3F5E2F' },
    { label: '정확', within: 8, bonus: 20, color: '#3F5E2F' },
    { label: '좋음', within: 15, bonus: 10, color: '#2C4A5C' }
  ],
  late: { label: '아쉬움', bonus: 0, color: '#5B5246' },
  miss: { label: '놓침', bonus: -10, color: '#9E2B20' }
};
/* ───── 무기 ─────
   slot: melee(격투 기술에 적용) · gun(사격 기술에 적용). 잔꾀 기술은 무기와 상관없다.
   dmg: 피해 보정 · hit: 명중 보정 · contraband: 검문에서 걸리는 물건
   reach: 근접 무기 사거리(m) · ap: 공격 한 번의 행동력
   range: 총의 거리 곡선 [{ m, hit, dmg }] — 사이 거리는 앞뒤 값을 비율대로 이어 계산
   qte: 타이밍 바 —
     dur   표시가 한 번 지나가는 시간(ms, 클수록 느림)
     scale 판정 칸 너비 배율(클수록 넓음)
     shape sweep(왼→오 한 번) · pingpong(왕복, 기회 두 번) · accel(점점 빨라짐) · reverse(오→왼)
           ring(속이 빈 원이 줄어든다 — 원형 버튼 테두리와 딱 겹칠 때 누른다. double 명령과는 함께 못 씀)
           track(조준 유지 — 누를 때마다 조준 칸이 오른쪽으로 밀리고 가만두면 왼쪽으로 떨어진다.
                 움직이는 목표를 dur 동안 조준 칸 안에 붙잡아 둔 비율로 판정. cmd 는 mash 로 고정)
     cmd   tap(한 번 누름) · double(두 칸, 두 번 누름 — 평균 보정, 피해 보정 합산) · hold(누르고 있는 동안 움직이고, 떼는 순간 판정) */
var WEAPONS = {
  fist:     { name: '맨손', slot: 'melee', reach: 1.5, ap: 1, dmg: 0, hit: 0, price: 0, desc: '아무것도 들지 않았다.',
              qte: { dur: 1100, scale: 1, shape: 'sweep', cmd: 'tap' } },
  club:     { name: '박달나무 몽둥이', slot: 'melee', reach: 2, ap: 1, dmg: 2, hit: 0, desc: '묵직하고 느리다. 대신 맞히기는 쉽다.',
              qte: { dur: 1500, scale: 1.4, shape: 'sweep', cmd: 'tap' } },
  knife:    { name: '단도', slot: 'melee', reach: 1.2, ap: 1, dmg: 1, hit: 5, contraband: true, desc: '품에 숨기기 좋다. 손이 빨라야 한다.',
              qte: { dur: 750, scale: 0.8, shape: 'pingpong', cmd: 'tap' } },
  saber:    { name: '순사 칼', slot: 'melee', reach: 2.2, ap: 1, dmg: 3, hit: -5, contraband: true, desc: '순사에게서 빼앗은 칼. 휘두를 때마다 무게가 되돌아온다.',
              qte: { dur: 1200, scale: 1, shape: 'pingpong', cmd: 'tap' } },
  browning: { name: '브라우닝 권총', slot: 'gun', ap: 1, range: [{ m: 0, hit: -10 }, { m: 3, hit: 0 }, { m: 10, hit: 0 }, { m: 18, hit: -15, dmg: -1 }, { m: 30, hit: -40, dmg: -3 }], dmg: 0, hit: 0, contraband: true, desc: '흔한 호신용 권총.',
              qte: { dur: 1100, scale: 1, shape: 'sweep', cmd: 'tap' } },
  nambu:    { name: '남부 권총', slot: 'gun', ap: 1, range: [{ m: 0, hit: -5 }, { m: 3, hit: 0 }, { m: 12, hit: 0 }, { m: 20, hit: -12, dmg: -1 }, { m: 30, hit: -35, dmg: -2 }], dmg: 1, hit: 5, contraband: true, desc: '일본 경찰·장교의 권총. 가늠쇠가 과녁에 겹치는 순간을 잡아 당긴다.',
              qte: { dur: 1100, scale: 1, shape: 'ring', cmd: 'tap' } },
  mauser:   { name: '모제르 권총', slot: 'gun', ap: 1, far: 18, range: [{ m: 0, hit: -10 }, { m: 4, hit: 0 }, { m: 15, hit: 0 }, { m: 25, hit: -10 }, { m: 30, hit: -20, dmg: -1 }], dmg: 2, hit: 0, contraband: true, desc: '독립군이 아끼던 대형 권총. 두 번 끊어 당긴다.',
              qte: { dur: 1400, scale: 0.9, shape: 'sweep', cmd: 'double' } },
  rifle:    { name: '38식 보병총', slot: 'gun', ap: 2, far: 26, range: [{ m: 0, hit: -30 }, { m: 6, hit: -5 }, { m: 12, hit: 0 }, { m: 25, hit: 10 }, { m: 30, hit: 10 }], dmg: 4, hit: 10, contraband: true, desc: '숨을 참고 겨누는 동안만 조준선이 움직인다.',
              qte: { dur: 1700, scale: 0.6, shape: 'sweep', cmd: 'hold' } },
  lmg:      { name: '경기관총', slot: 'gun', ap: 2, far: 20, range: [{ m: 0, hit: -20 }, { m: 5, hit: 0 }, { m: 20, hit: 0 }, { m: 30, hit: -10 }], dmg: 3, hit: 0, contraband: true, desc: '광복군이 중국군에게서 얻어 쓰던 체코제 경기관총. 반동을 눌러 가며 과녁을 끝까지 따라가야 한다.',
              qte: { dur: 2600, scale: 1, shape: 'track', cmd: 'mash' } },
  hunting:  { name: '사냥용 엽총', slot: 'gun', ap: 1, far: 12, range: [{ m: 0, hit: 0, dmg: 4 }, { m: 4, hit: 0, dmg: 2 }, { m: 8, hit: 0, dmg: 0 }, { m: 15, hit: -10, dmg: -3 }, { m: 25, hit: -30, dmg: -6 }], dmg: 3, hit: -5, contraband: true, desc: '산탄이 넓게 퍼진다. 점점 빨라지는 손떨림을 다스려야 한다.',
              qte: { dur: 1100, scale: 1.6, shape: 'accel', cmd: 'tap' } }
};
var SHAPE_LABEL = { sweep: '한 번 지나감', pingpong: '왕복', accel: '점점 빨라짐', reverse: '반대 방향', ring: '줄어드는 원', track: '조준 유지' };
/* 조준 유지(track) 물리값 — 단위: 막대 % / 초
   box 조준 칸 너비(× 무기 scale) · gravity 왼쪽으로 끌어내리는 힘 · kick 한 번 누를 때 오른쪽으로 미는 속도 · vmax 최고 속도
   target 목표 너비 · tSpeed 목표 이동 속도 범위 · tHold 목표가 방향을 바꾸는 간격(ms)
   grades 붙잡아 둔 비율(0~1) 이상이면 그 등급 */
var TRACK = { box: 24, gravity: 150, kick: 48, vmax: 130, target: 4, tSpeed: [22, 48], tHold: [450, 1100], tick: 33,
  grades: [{ at: 0.92, i: 0 }, { at: 0.8, i: 1 }, { at: 0.65, i: 2 }, { at: 0.5, i: 3 }, { at: 0.3, late: true }] };
/* 줄어드는 원: 버튼 지름의 RING_FROM 배 → RING_TO 배로 줄어든다. 1배(버튼과 같은 크기)가 되는 순간이 정답.
   매번 속도를 RING_JITTER 만큼 흔들어 외워서 누르기 어렵게 한다 */
var RING_FROM = 2.4, RING_TO = 0.2, RING_JITTER = 0.2;
var RING_CENTER = (RING_FROM - 1) / (RING_FROM - RING_TO) * 100;
var QTE_BTN = 96;
var CMD_LABEL = { tap: '한 번 누르기', double: '두 번 누르기', hold: '누르고 떼기', mash: '두드려 띄우기' };
/* 태생 태그로 시작 무기 (가장 먼저 맞는 줄 하나씩, 칸별) */
var START_WEAPONS = [
  { tag: 'kimjwajin', weapon: 'mauser', ammo: 6 }
];
/* 적을 이기면 확률로 떨어뜨리는 무기 */
var WEAPON_DROPS = {
  junsa: { weapon: 'saber', chance: 0.25 },
  hbojo: { weapon: 'club', chance: 0.25 },
  hyungsa: { weapon: 'nambu', chance: 0.3 },
  kenpei: { weapon: 'rifle', chance: 0.2 },
  ronin: { weapon: 'knife', chance: 0.3 },
  wangpae: { weapon: 'club', chance: 0.4 },
  tokko: { weapon: 'nambu', chance: 0.4 },
  kibyeong: { weapon: 'saber', chance: 0.5 },
  gocho: { weapon: 'mauser', chance: 0.5 }
};
/* 제작용 스위치 (Tweaks 의 unlockAllWeapons 가 매 렌더마다 갱신) — 켜져 있으면 모든 무기를 가진 것으로, 탄환도 줄지 않는다 */
var UNLOCK_ALL_WEAPONS = false;
var SHOW_ALIGN = false;
function ownedWeapons(p) {
  if (UNLOCK_ALL_WEAPONS) { var all = {}; Object.keys(WEAPONS).forEach(function (id) { if (id !== 'fist') all[id] = 1; }); return all; }
  return (p && p.weapons) || (p && p.flags && p.flags.gun ? { browning: 1 } : {});
}
function hasAnyGun(p) { var w = ownedWeapons(p); /* 은닉처에 둔 총은 ownedWeapons 에 없다 */ return Object.keys(w).some(function (id) { return w[id] && WEAPONS[id] && WEAPONS[id].slot === 'gun'; }); }

/* 불법 소지품 목록: has(p) 가 참이면 검문에서 발각된다. 격문·밀서 등은 flag 를 만들고 여기에 한 줄 추가 */
/* 조사 이/가: 마지막 글자에 받침이 있으면 '이' */
function josaIGa(w) { var c = String(w || '').charCodeAt(String(w || '').length - 1) - 0xAC00; return (c >= 0 && c <= 11171 && c % 28) ? '이' : '가'; }
/* 불법 소지품 · spot: 몸수색에서 들킬 확률 (작은 물건일수록 놓치기 쉽다) */
/* 총포 소지 허가증으로 지닐 수 있는 총 (군용 소총·기관총·경찰 권총은 안 된다) */
var GUN_PERMIT_OK = ['hunting', 'browning', 'mauser'];
function permittedGun(p, id) { return hasItem(p, 'gun_permit') && GUN_PERMIT_OK.indexOf(id) >= 0; }
var CONTRABAND = [
  { id: 'gun', name: '총', has: function (p) { var w = ownedWeapons(p); return Object.keys(w).some(function (id) { return w[id] && WEAPONS[id] && WEAPONS[id].slot === 'gun' && !permittedGun(p, id); }); },
    spot: function (p) { var w = ownedWeapons(p); return ['rifle', 'lmg', 'hunting'].some(function (id) { return w[id]; }) ? 0.98 : 0.85; } },
  { id: 'blade', name: '칼', has: function (p) { var w = ownedWeapons(p); return ['knife', 'saber'].some(function (id) { return w[id]; }); },
    spot: function (p) { return ownedWeapons(p).saber ? 0.95 : 0.6; } },
  { id: 'ammo', name: '탄환', has: function (p) { return (p.ammo || 0) > 0 && !hasItem(p, 'gun_permit'); }, spot: function (p) { return (p.ammo || 0) >= 10 ? 0.7 : 0.45; } },
  { id: 'leaflet', name: '격문', has: function (p) { return !!(p.flags && p.flags.leaflet); }, spot: function () { return 0.6; } }
];
/* ───── 몸수색 (조사에 순응) ─────
   1) 불법 소지품마다 spot 확률로 들킨다 (못 본 물건은 그대로 지닌다)
   2) 들켰어도 일제 타협도가 look.from 이상이면 못 본 척해 줄 수 있다: 확률 = look.base + (타협도 − from) × look.per (최대 look.max)
   3) 아무것도 안 들켰어도 일제 타협도가 frame.from 이하면 누명을 씌울 수 있다: 확률 = frame.base + (from − 타협도) × frame.per (최대 frame.max)
   4) 들키거나 누명을 쓰면 '뇌물을 찔러 준다'(bribe.base + 물건 수 × bribe.per 원) 또는 '맞선다'를 고른다
      뇌물이 먹힐 확률 = bribe.chance + 일제 타협도 / bribe.alignDiv (bribe.min ~ bribe.max) — 안 먹혀도 돈은 빼앗긴다 */
var SEARCH = {
  look: { from: 60, base: 0.15, per: 0.0023, max: 0.7 },
  frame: { from: -60, base: 0.1, per: 0.0017, max: 0.5, item: '불온 전단' },
  bribe: { base: 3, per: 2, chance: 0.65, alignDiv: 600, min: 0.3, max: 0.95 }
};
var SKILL_GROUPS = [{ id: 'melee', label: '격투 기술' }, { id: 'trick', label: '잔꾀' }, { id: 'gun', label: '사격 기술' }];
/* 상시 기술 — 칸을 차지하지 않고 전투에 항상 나온다. 가져갈 기술 목록·전투 보상에서는 빠진다 */
var DEFAULT_SKILLS = ['punch', 'shot'];
/* 가져갈 수 있는 기술 칸 수 (소지품·기술 화면에서 고른다. 전투에는 상시 기술 + 가져간 기술이 나온다) */
var SKILL_SLOTS = 3;
/* 전투 승리 시 얻는 기술: 이 목록에서 하나를 무작위로(중복 가능). 적마다 skillDrops: [...] 를 주면 그 목록을 대신 쓴다.
   특정 기술을 자주 나오게 하려면 같은 id 를 여러 번 넣으면 된다. */
/* 시작 기술: 태생을 굴릴 때 SKILL_DROP_POOL 에서 하나를 무작위로 준다.
   정확 ≤ START_SKILL_ACC 이면 격투 기술(melee), 초과면 사격 기술(gun)의 가중치에 START_SKILL_BONUS 를 곱한다 */
var START_SKILL_ACC = 50;
var START_SKILL_BONUS = 2;
var SKILL_DROP_POOL = ['combo', 'headbutt', 'throw', 'vital', 'grab', 'trip', 'sand', 'aimed', 'double', 'warn'];

/* ───── 관헌에게 무고 주장 (내가 공격하기 전에만) ─────
   확률 = 지능 + foe[적] + 일제 타협도 보정 − 불법 소지품 contraband − 감시도×heat − 실패 횟수×fail − (머릿수−1)×crowd
   성공하면 전투 없이 풀려난다 (감시도 변화 없음) · 행동력 ap */
var PLEA = { ap: 2, contraband: 20, heat: 2.5, fail: 15, crowd: 5,
  foe: { hbojo: -5, junsa: -10, hyungsa: -15, kenpei: -10, tokko: -35, kibyeong: -15, gocho: -40 },
  ok: {
    junsa: '“…됐다. 가 봐. 다음엔 눈에 띄지 마라.” 순사가 턱짓으로 길을 내준다.',
    hyungsa: '형사가 수첩과 얼굴을 한참 번갈아 보더니 혀를 찬다. “사람을 잘못 봤나. 꺼져.”',
    kenpei: '헌병이 총검을 거두고 일본어로 무언가 투덜댄다. 손짓 한 번에 길이 열렸다.',
    tokko: '“오늘은 증거가 모자라군.” 특고 형사가 웃으며 모자를 고쳐 쓴다. “다음엔 그렇지 않을 거야.”',
    kibyeong: '기마헌병이 말머리를 돌린다. “조센징 따위, 시간 낭비다.”',
    gocho: '헌병 오장이 오래 노려보다 권총집을 닫는다. “이번만이다.”'
  },
  okText: '억울하다고, 아무 일도 하지 않았다고 거듭 말하자 관헌이 혀를 차며 손을 내저었다.',
  failLines: ['“거짓말 마라. 다 알고 왔다.”', '“변명은 서에 가서 해라.”', '“조선 놈 말을 누가 믿나.”', '“입 다물고 따라와.”'] };
/* ───── 항복 요구 (내가 한 번이라도 공격한 뒤 — 설득 대신) ─────
   확률(무작위) = base + 잃은 체력 비율×hurt + 꺾인 사기×morale + 내가 총을 들었으면 gunMe − 상대가 총잡이면 gunFoe
                − 남은 동료 수×ally + 성격 pers + 기절·넘어짐 down − 관헌 official
                + 능력치 보정: (근력×str + 지능×int − pivot) × statMul, statMin~statMax 로 제한
                  → 능력치가 높을수록 유리하지만 상처·사기·총 같은 상황 요소가 더 크게 작용한다
   성공하면 그 적은 무기를 버리고 손을 든다 (쓰러뜨린 것으로 친다 — 보상·감시도 그대로) · 행동력 ap */
var DEMAND = { ap: 1, base: 10, str: 0.6, int: 0.4, pivot: 30, statMul: 0.5, statMin: -10, statMax: 20, hurt: 55, morale: 0.4, gunMe: 15, gunFoe: 20, ally: 12, down: 10, official: 10,
  pers: { coward: 20, cautious: 5, cunning: -5, aggressive: -15 },
  okLines: ['무기를 내던지고 두 손을 들었다.', '무릎을 꿇고 고개를 떨군다.', '“알, 알았다! 그만!” 뒷걸음질 치며 손을 든다.'],
  failLines: ['“웃기지 마라!”', '“누가 누구한테 항복하라는 거냐.”', '코웃음을 친다.', '대꾸 없이 자세를 고쳐 잡는다.'] };

/* ───── 관헌의 태세 (전투 AI) ─────
   관헌(OFFICIALS)은 태세 하나를 지니고 그에 따라 움직인다: capture 생포 · melee 근접 · shoot 사격
   - 시작은 모두 '생포' — 포승과 곤봉으로 붙잡아 끌고 가려 한다 (총을 쏘지 않는다)
   - 생포 포기: 내가 총을 쏘거나, 쓰러진 사람이 giveUp 중 하나(관헌마다 무작위 1~2명) 이상이면 근접/사격 태세로 바뀐다
     (한번 바뀌면 생포로 돌아가지 않는다) · esc 수치는 이제 쓰지 않음(기록용)
   - 바뀔 때: 총이 있는 관헌(총잡이)은 내가 총을 쐈거나 거리가 shootDist 보다 멀면 사격, 아니면 근접
     근접 태세의 총잡이도 내가 멀어지면(shootDist 초과) switchShoot 확률로 총을 뽑는다
   capture: grab 붙잡으려 할 확률 · offerPlus 항복 권유 가산 · blockPlus 출구 막기 가산 · softDmg 제압 피해 감소
            생포 태세의 공격(곤봉·멱살)으로 체력이 0이 되면 죽지 않고 포박되어 끌려간다 (그 전에는 전투가 이어진다) */
var STANCE = { heat: 2.5, ambush: 45, attack: 6, shot: 35, hurt: 12, ally: 25, flee: 12, fleeAct: 25, cap: 95,
  shootDist: 3, switchShoot: 0.3, giveUp: [1, 2],
  capture: { grab: 0.6, offerPlus: 0.25, blockPlus: 0.2, softDmg: 2, bindHp: 0.35, bindTurns: 2 },
  label: { capture: '생포', melee: '근접', shoot: '사격' },
  text: { capture: '포승과 곤봉으로 붙잡으려 한다', melee: '때려눕히려 한다', shoot: '쏘려 한다' } };
/* 포박: 생포 태세의 관헌에게 묶여 끌려가면 — 항복과 같은 손해에 더해 jailWeeks 주가 흐른다 */
var ARREST = { jailWeeks: 1 };
