/* 일제치하 — 개발자 탭 (스토리 편집기)
   ───────────────────────────────────────────────
   · 여는 법: 메인 화면에서 비밀 명령을 친다 (휴대폰은 제목 그림을 1초쯤 길게 누르면 입력 칸이 뜬다)
     코드에는 명령 자체가 아니라 SHA-256 해시만 들어 있다.
   · 고친 내용은 ① 이 브라우저에 바로 반영되고 (localStorage 'ilje.dev.patch')
     ② '내보내기 · 저장'에서 iljechiha 폴더의 stories/patch.json 으로 저장한다.
   · STORY_PATCH (stories.js) = 저장소에 반영된 수정본. 원래 데이터(events.js · cities.js) 위에 덮어씌운다.
     형식: { v: 1, tables: { EVENTS: {id: 사건}, LINK_EVENTS, ALIGN_EVENTS, QUEST_EVENTS, QUESTS },
             align: { 사건id: { 선택지문구: {jp, kr, ok, fail} } },   ← 그 사건의 OPTION_ALIGN 을 통째로 바꾼다
             places: { 사건id: ['jongno:events', 'station:work', 'era', …] },  ← 일반 사건이 나오는 곳을 통째로 바꾼다
             life: { life: [태생 단계…], base: {기본 수치} } }  ← 태생 표(LIFE_STAGES · BASE)를 통째로 바꾼다 (없으면 원래 것)
   · 한 사건 안의 여러 번 선택: 사건.steps = { 장면id: { title?, text, options } } · 결과에 step: '장면id' 를 쓰면
     결과 글을 보여 준 뒤 그 장면의 선택지로 이어진다 (시간은 흐르지 않음)
   · 함수로 된 조건(cond 등)은 편집기에서 바꿀 수 없고, 원래 것이 그대로 남는다. */
var STORY_PATCH = (typeof STORY_PATCH !== 'undefined' && STORY_PATCH) || { v: 1, tables: {}, align: {}, places: {} };
var DEV_TOOL = (function () {
  var TABLES = { EVENTS: EVENTS, LINK_EVENTS: LINK_EVENTS, ALIGN_EVENTS: ALIGN_EVENTS, QUEST_EVENTS: QUEST_EVENTS, QUESTS: QUESTS };
  var TNAMES = ['EVENTS', 'LINK_EVENTS', 'ALIGN_EVENTS', 'QUEST_EVENTS', 'QUESTS'];
  var LOCAL_KEY = 'ilje.dev.patch';
  var DEV_HASH = '73f6873ba936c67617163d3bd1e34fff801fe04197a42201bf0515cc29d7c3dd';

  /* ───── 공용 ───── */
  function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  function stable(o) {
    if (Array.isArray(o)) return '[' + o.map(stable).join(',') + ']';
    if (o && typeof o === 'object') return '{' + Object.keys(o).filter(function (k) { return o[k] !== undefined && typeof o[k] !== 'function'; }).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(o[k]); }).join(',') + '}';
    return JSON.stringify(o);
  }
  function same(a, b) { return stable(a) === stable(b); }
  function norm(p) {
    p = p || {};
    var n = { v: 1, tables: {}, align: clone(p.align || {}), places: clone(p.places || {}) };
    TNAMES.forEach(function (t) { n.tables[t] = clone((p.tables && p.tables[t]) || {}); });
    if (p.life && Array.isArray(p.life.life) && p.life.base) n.life = clone(p.life);
    return n;
  }
  /* 게임이 실행 중에 붙인 값(타협도 표 등)을 떼고, 함수도 뺀 순수한 사건 데이터 */
  function pure(o) {
    if (!o) return o;
    var c = clone(o);
    delete c.id;
    allOpts(c).forEach(function (op) { delete op.align; delete op.alignOk; delete op.alignNg; });
    return c;
  }
  /* 사건의 모든 선택지 (첫 장면 + 이어지는 장면들) */
  function allOpts(ev) {
    var out = (ev && ev.options || []).slice();
    Object.keys(ev && ev.steps || {}).forEach(function (k) { out = out.concat(ev.steps[k].options || []); });
    return out;
  }
  function alignOf(eid) {
    var m = {};
    Object.keys(OPTION_ALIGN).forEach(function (k) {
      var cut = k.indexOf('|');
      if (cut > 0 && k.slice(0, cut) === eid) m[k.slice(cut + 1)] = clone(OPTION_ALIGN[k]);
    });
    return m;
  }
  function placesOf(eid) {
    var out = [];
    Object.keys(LOCS).forEach(function (l) {
      ['events', 'work'].forEach(function (li) { if ((LOCS[l][li] || []).indexOf(eid) >= 0) out.push(l + ':' + li); });
    });
    ['events', 'work'].forEach(function (li) { if (COMMON[li].indexOf(eid) >= 0) out.push('common:' + li); });
    if (ERA_EVENTS.indexOf(eid) >= 0) out.push('era');
    return out;
  }

  /* ───── 원본 (아무 수정도 안 한 상태) ───── */
  var ORIG = { tables: {}, align: {}, places: {} };
  TNAMES.forEach(function (t) {
    ORIG.tables[t] = {};
    Object.keys(TABLES[t]).forEach(function (id) { ORIG.tables[t][id] = pure(TABLES[t][id]); });
  });
  Object.keys(OPTION_ALIGN).forEach(function (k) { var cut = k.indexOf('|'); if (cut > 0) { var e = k.slice(0, cut); if (!ORIG.align[e]) ORIG.align[e] = alignOf(e); } });
  Object.keys(EVENTS).forEach(function (id) { ORIG.places[id] = placesOf(id); });
  ORIG.life = { life: clone(LIFE_STAGES), base: clone(BASE) };

  /* ───── 덮어쓰기 ───── */
  function attachAlign(eid) {
    if (!OPTION_ALIGN._applied) return;   /* 게임이 아직 시작 전이면 게임이 직접 붙인다 */
    var m = alignOf(eid);
    [EVENTS, LINK_EVENTS, QUEST_EVENTS].forEach(function (P) {
      allOpts(P[eid]).forEach(function (o) {
        delete o.align; delete o.alignOk; delete o.alignNg;
        var a = m[o.label];
        if (!a) return;
        if (a.ok) o.alignOk = { jp: a.jp || 0, kr: a.kr || 0 }; else if (a.jp || a.kr) o.align = { jp: a.jp || 0, kr: a.kr || 0 };
        if (a.fail) o.alignNg = { jp: a.fail.jp || 0, kr: a.fail.kr || 0 };
      });
    });
  }
  function questPlace(qid) {
    if (typeof PLACES === 'undefined' || PLACES.some(function (pl) { return pl.id === 'q_' + qid; })) return;
    PLACES.push({ id: 'q_' + qid, kicker: '이야기 · ' + QUESTS[qid].name,
      open: function (p) { var df = questDue(p, qid); return !!(df && df.place); },
      name: function (p) { return questDue(p, qid).place; },
      sub: function (p) { return questDue(p, qid).sub || ''; },
      loc: function (p) { var ev = QUEST_EVENTS[questDue(p, qid).event]; return (ev && ev.loc) || QUESTS[qid].loc || 'jongno'; },
      event: function (self, d) { return questEvent(qid, questDue(d.player, qid)); } });
  }
  function applyEntry(t, id, obj) {
    var T = TABLES[t], cur = T[id];
    if (obj === null) {
      delete T[id];
      if (t === 'QUESTS' && typeof PLACES !== 'undefined') for (var pi = PLACES.length - 1; pi >= 0; pi--) if (PLACES[pi].id === 'q_' + id) PLACES.splice(pi, 1);
      return;
    }
    var nv = clone(obj);
    if (cur) Object.keys(cur).forEach(function (k) { if (typeof cur[k] === 'function' && !(k in nv)) nv[k] = cur[k]; });
    if (t === 'ALIGN_EVENTS' && typeof nv.cond !== 'function') nv.cond = function () { return false; };
    if (t === 'QUESTS') {
      if (cur) { Object.keys(cur).forEach(function (k) { delete cur[k]; }); Object.assign(cur, nv); } else T[id] = nv;
      questPlace(id);
      return;
    }
    T[id] = nv;
    attachAlign(id);
  }
  function applyAlign(eid, map) {
    Object.keys(OPTION_ALIGN).forEach(function (k) { if (k.indexOf(eid + '|') === 0) delete OPTION_ALIGN[k]; });
    Object.keys(map || {}).forEach(function (lab) { OPTION_ALIGN[eid + '|' + lab] = clone(map[lab]); });
    attachAlign(eid);
  }
  function applyPlaces(eid, list) {
    list = list || [];
    /* 이미 있던 자리는 순서를 지키고, 빠진 곳에서는 지우고, 새 곳은 끝에 붙인다 */
    Object.keys(LOCS).forEach(function (l) {
      ['events', 'work'].forEach(function (li) {
        var a = LOCS[l][li], want = list.indexOf(l + ':' + li) >= 0;
        if (a) for (var i = a.length - 1; i >= 0; i--) if (a[i] === eid && (!want || a.indexOf(eid) !== i)) a.splice(i, 1);
        if (want && LOCS[l] && (!a || a.indexOf(eid) < 0)) (LOCS[l][li] = LOCS[l][li] || []).push(eid);
      });
    });
    ['events', 'work'].forEach(function (li) {
      var a = COMMON[li], want = list.indexOf('common:' + li) >= 0, ci = a.indexOf(eid);
      if (ci >= 0 && !want) a.splice(ci, 1);
      if (ci < 0 && want) a.push(eid);
    });
    var ei = ERA_EVENTS.indexOf(eid), wantEra = list.indexOf('era') >= 0;
    if (ei >= 0 && !wantEra) ERA_EVENTS.splice(ei, 1);
    if (ei < 0 && wantEra) ERA_EVENTS.push(eid);
  }
  /* 태생 표: LIFE_STAGES · BASE 를 통째로 바꾸고, 진행 중인 게임과 예전 '태생 표 편집' 저장본도 맞춘다 */
  function applyLife(v) {
    if (!v) return;
    var L = clone(v.life), B = clone(v.base);
    LIFE_STAGES.length = 0; L.forEach(function (st) { LIFE_STAGES.push(st); });
    Object.keys(BASE).forEach(function (k) { delete BASE[k]; }); Object.assign(BASE, B);
    try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(LIFE_STORE_KEY); } catch (err) {}
    var g = typeof window !== 'undefined' && window.__iljeGame;
    if (g && g.setState) g.setState({ life: clone(L), base: clone(B) });
  }
  function applyPatch(p) {
    if (p.life) applyLife(p.life);
    TNAMES.forEach(function (t) { Object.keys(p.tables[t] || {}).forEach(function (id) { applyEntry(t, id, p.tables[t][id]); }); });
    Object.keys(p.align || {}).forEach(function (e) { applyAlign(e, p.align[e]); });
    Object.keys(p.places || {}).forEach(function (e) { applyPlaces(e, p.places[e]); });
  }

  /* 저장소 수정본 → 원본 위에 */
  var BAKED = norm(STORY_PATCH);
  applyPatch(BAKED);
  function baseEntry(t, id) { return id in BAKED.tables[t] ? BAKED.tables[t][id] : ORIG.tables[t][id]; }
  function baseAlign(e) { return e in BAKED.align ? BAKED.align[e] : (ORIG.align[e] || {}); }
  function baseLife() { return BAKED.life || ORIG.life; }
  function basePlaces(e) { return e in BAKED.places ? BAKED.places[e] : (ORIG.places[e] || []); }

  /* 이 브라우저의 수정 → 그 위에 (저장소 것과 같아진 항목은 버린다) */
  var LOCAL = norm(null);
  function readLocal() { try { var s = window.localStorage.getItem(LOCAL_KEY); return s ? norm(JSON.parse(s)) : norm(null); } catch (err) { return norm(null); } }
  function prune(p) {
    TNAMES.forEach(function (t) { Object.keys(p.tables[t]).forEach(function (id) { if (same(p.tables[t][id], baseEntry(t, id))) delete p.tables[t][id]; }); });
    Object.keys(p.align).forEach(function (e) { if (same(p.align[e], baseAlign(e))) delete p.align[e]; });
    Object.keys(p.places).forEach(function (e) { if (same(p.places[e], basePlaces(e))) delete p.places[e]; });
    if (p.life && same(p.life, baseLife())) delete p.life;
    return p;
  }
  function writeLocal() { try { window.localStorage.setItem(LOCAL_KEY, JSON.stringify(LOCAL)); } catch (err) {} }
  if (typeof window !== 'undefined' && window.localStorage) { LOCAL = prune(readLocal()); applyPatch(LOCAL); writeLocal(); }

  function localCount() {
    var ids = {};
    TNAMES.forEach(function (t) { Object.keys(LOCAL.tables[t]).forEach(function (id) { ids[id] = 1; }); });
    Object.keys(LOCAL.align).forEach(function (e) { ids[e] = 1; });
    Object.keys(LOCAL.places).forEach(function (e) { ids[e] = 1; });
    return Object.keys(ids).length + (LOCAL.life ? 1 : 0);
  }
  function isLocal(t, id) { return !!(LOCAL.tables[t][id] !== undefined || (t !== 'QUESTS' && (LOCAL.align[id] || LOCAL.places[id]))); }
  /* 저장할 전체 수정본 = 저장소 것 + 이 브라우저 것 */
  function fullPatch() {
    var p = norm(BAKED);
    TNAMES.forEach(function (t) { Object.assign(p.tables[t], clone(LOCAL.tables[t])); });
    Object.assign(p.align, clone(LOCAL.align));
    Object.assign(p.places, clone(LOCAL.places));
    if (LOCAL.life) p.life = clone(LOCAL.life);
    p.saved = new Date().toISOString();
    return p;
  }
  /* 한 항목 저장: 사건 내용 + (타협도 표) + (나오는 곳) */
  function saveEntry(t, id, obj, align, places) {
    LOCAL.tables[t][id] = clone(obj);
    applyEntry(t, id, obj);
    if (align !== undefined) { LOCAL.align[id] = clone(align); applyAlign(id, align); }
    if (places !== undefined) { LOCAL.places[id] = clone(places); applyPlaces(id, places); }
    prune(LOCAL); writeLocal();
  }
  /* 이 브라우저의 수정 취소 → 저장소 것(없으면 원본)으로 */
  function revertEntry(t, id) {
    delete LOCAL.tables[t][id];
    var b = baseEntry(t, id);
    applyEntry(t, id, b === undefined ? null : b);
    if (t !== 'QUESTS') {
      if (LOCAL.align[id]) { delete LOCAL.align[id]; applyAlign(id, baseAlign(id)); }
      if (LOCAL.places[id]) { delete LOCAL.places[id]; applyPlaces(id, basePlaces(id)); }
    }
    writeLocal();
  }
  function revertAll() {
    TNAMES.forEach(function (t) { Object.keys(LOCAL.tables[t]).forEach(function (id) { revertEntry(t, id); }); });
    Object.keys(LOCAL.align).forEach(function (e) { delete LOCAL.align[e]; applyAlign(e, baseAlign(e)); });
    Object.keys(LOCAL.places).forEach(function (e) { delete LOCAL.places[e]; applyPlaces(e, basePlaces(e)); });
    if (LOCAL.life) applyLife(baseLife());
    LOCAL = norm(null); writeLocal();
  }
  /* 태생 표 저장 · 되돌리기 */
  function saveLife(v) { LOCAL.life = clone(v); applyLife(v); prune(LOCAL); writeLocal(); }
  function revertLife() { delete LOCAL.life; applyLife(baseLife()); writeLocal(); }
  function importPatch(p) {
    revertAll();
    LOCAL = prune(norm(p));
    applyPatch(LOCAL); writeLocal();
  }

  /* ───── SHA-256 (비밀 명령 확인용, 외부 라이브러리 없이) ───── */
  function sha256(str) {
    var K = [], H = [], i, j, isP = function (n) { for (var f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
    var frac = function (x) { return ((x - Math.floor(x)) * 4294967296) | 0; };
    for (i = 2, j = 0; j < 64; i++) if (isP(i)) { if (j < 8) H[j] = frac(Math.pow(i, 1 / 2)); K[j++] = frac(Math.pow(i, 1 / 3)); }
    var b = unescape(encodeURIComponent(str)), bytes = [];
    for (i = 0; i < b.length; i++) bytes.push(b.charCodeAt(i));
    var bl = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bl >>> (i * 8)) & 255);
    var r = function (x, n) { return (x >>> n) | (x << (32 - n)); };
    for (var o = 0; o < bytes.length; o += 64) {
      var w = [];
      for (i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
      for (i = 16; i < 64; i++) {
        var s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = H.slice();
      for (i = 0; i < 64; i++) {
        var S1 = r(a[4], 6) ^ r(a[4], 11) ^ r(a[4], 25), ch = (a[4] & a[5]) ^ (~a[4] & a[6]);
        var t1 = (a[7] + S1 + ch + K[i] + w[i]) | 0;
        var S0 = r(a[0], 2) ^ r(a[0], 13) ^ r(a[0], 22), mj = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]);
        var t2 = (S0 + mj) | 0;
        a = [(t1 + t2) | 0, a[0], a[1], a[2], (a[3] + t1) | 0, a[4], a[5], a[6]];
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }
  function passOk(s) { return sha256(s) === DEV_HASH; }

  var api = { sha256: sha256, passOk: passOk, saveEntry: saveEntry, revertEntry: revertEntry, fullPatch: fullPatch, importPatch: importPatch,
    localCount: localCount, ORIG: ORIG, BAKED: BAKED, get LOCAL() { return LOCAL; } };
  if (typeof document === 'undefined' || !document.addEventListener) return api;

  /* ═════════════════ 화면 ═════════════════ */
  var FXK = { money: '돈', hp: '체력', ammo: '탄환', medkit: '구급약', heat: '감시도', days: '지난주', jp: '일제타협', kr: '민족타협',
    str: '근력', agi: '민첩', int: '지능', edu: '교육', acc: '정확', con: '건강' };
  var FXR = {}; Object.keys(FXK).forEach(function (k) { FXR[FXK[k]] = k; FXR[k] = k; });
  var KINDS = [['', '일반'], ['work', '일거리'], ['fight', '싸움'], ['link', '연줄'], ['align', '타협도'], ['quest', '이야기'], ['shop', '가게']];
  var DIFFS = [['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움 (−10)'], ['extreme', '극단 (−25)']];
  var CITY_ORDER = Object.keys(CITIES);
  /* ── 설명 글상자에 뜨는 글: 칸 이름 → 설명 ── */
  var TIPS = {
    '스토리 편집': '일반 사건 · 일거리 · 연줄 사건 · 타협도 사건 · 장기 이야기를 고칩니다.',
    '태생 편집': '탄생할 때 굴리는 d100 표(출생 환경 · 유년 활동 · 교육 · 연줄 · 결점 · 청소년기)와 기본 수치를 고칩니다.',
    '제목': '사건 화면 맨 위에 크게 나오는 이름. 비워 둘 수 없습니다.',
    '종류': '사건의 성격. 색깔과 머리글이 바뀝니다.\n일반 · 일거리(돈벌이) · 싸움 · 연줄 · 타협도 · 이야기 · 가게',
    '일어나는 곳': '사건이 벌어지는 장소. 화면 위 장소 이름이 이곳으로 바뀝니다.\n비우면 그 사건이 나온 거리 그대로입니다.',
    '시기 (부터)': '이 해부터 나옵니다. 비우면 1910년부터.',
    '시기 (까지)': '이 해까지 나옵니다. 비우면 1945년까지.\n예: 3·1 운동 사건은 1919 / 1919',
    '필요한 태그': '태생에서 이 태그를 얻은 사람에게만 나옵니다.\n예: link:press = 연줄 단계에서 ‘언론인’이 나온 사람\n비우면 누구에게나.',
    '본문': '사건 설명 글. 줄바꿈은 그대로 화면에 나옵니다.\n{name} 은 주인공 이름으로 바뀝니다.',
    '나오는 곳': '체크한 거리에서 ‘사건’ 또는 ‘일거리’로 나옵니다.\n‘공통’은 지역이 정해져 있지 않아 모든 도시의 모든 거리에서 나옵니다.\n‘시대 사건’은 시기가 맞으면 그 도시 어디서나 나옵니다.\n모두 끄면 게임에 나오지 않습니다.',
    '선택지': '플레이어가 고를 수 있는 버튼들. 위에서부터 순서대로 나옵니다.',
    '선택지 (첫 장면)': '사건이 처음 열릴 때 나오는 선택지들.\n결과에서 ‘이어지는 장면’을 고르면 아래 장면으로 넘어갑니다.',
    '판정 능력치': '이 능력치로 주사위 판정을 합니다.\n‘판정 없음’이면 항상 성공 결과가 나옵니다.',
    '난이도': '쉬움 · 보통 · 어려움(능력치 −10) · 극단(−25).\n어려울수록 성공 확률이 낮아집니다.',
    '비용': '고를 때 나가는 것. 모자라면 고를 수 없습니다.\n예: 돈 5',
    '일제타협': '고르면 더해지는 숨은 수치(일제 쪽 타협). 음수도 됩니다.\n원칙: 일제가 알 수 있는 일(관헌 눈앞의 행동, 들킨 일)만 내립니다.',
    '민족타협': '고르면 더해지는 숨은 수치(민족 쪽 타협). 음수도 됩니다.\n몰래 한 일은 이것만 움직입니다.',
    '성공했을 때만': '체크하면 판정에 성공했을 때만 위 타협도가 반영됩니다.',
    '실패 시 일제': '판정에 실패했을 때만 더해지는 일제타협 값.',
    '실패 시 민족': '판정에 실패했을 때만 더해지는 민족타협 값.',
    '결과 글': '선택한 뒤 나오는 글. 2~4줄을 권장합니다.',
    '효과': '결과로 바뀌는 수치. ‘이름 숫자’를 쉼표로 잇습니다.\n예: 돈 +10, 감시도 +1, 체력 -3\n쓸 수 있는 이름: 돈 · 체력 · 탄환 · 구급약 · 감시도 · 지난주 · 일제타협 · 민족타협 · 근력 · 민첩 · 지능 · 교육 · 정확 · 건강',
    '싸움': '적으면 결과 글 다음에 전투가 시작됩니다.\n칸을 누르면 목록이 뜹니다. 예: patrol_pair(순사 둘)',
    '싸움 거리': '전투가 시작될 때 적과의 거리.\n1.5 = 코앞 · 4 = 멀리서',
    '보이는 조건': '이 조건이 맞을 때만 선택지가 화면에 보입니다. 비우면 늘 보입니다.\n쉼표로 여러 개 = 모두 맞아야 함\n태그:lang:ja · 태그없음:poor · 아무태그:a|b\n표식:met_kim · 표식없음:met_kim\n물건:residence · 물건없음:travel_pass (증명서 id: residence 거주 · travel_pass 여행 · peddler 행상 · gun_permit 총포 · tokko_badge 고등계 증표)\n지능>=40 · 돈<=3 · 감시도>=5 · 일제타협>=50 · 민족타협<=-20 · 체력 · 구급약 · 탄환\n무기:총 · 무기:근접 · 무기:없음 · 무기:rifle\n도시:평양|부산 · 시간:밤 · 연도:1919-1925',
    '조건부 결과': '선택지를 고를 때 조건이 맞으면, 위의 결과 대신 이 결과가 나옵니다.\n여러 줄이면 위에서부터 맞는 첫 줄을 씁니다.',
    '조건': '이 결과가 나올 조건. ‘보이는 조건’과 같은 방식에 더해 확률:30% 도 쓸 수 있습니다.',
    '판정 없이 바로': '체크하면 조건이 맞을 때 주사위 판정 없이 바로 이 결과가 나옵니다.',
    '＋ 조건부 결과': '태그·능력치·표식 등 조건에 따라 다른 결과를 만듭니다.\n예: 평양 출신(태그:region:northwest)이면 주인이 외상을 해 준다',
    '얻는 표식·태그': '이 결과가 나오면 주인공에게 붙는 표식·태그. 나중 사건의 조건에 쓸 수 있습니다.\n예: 표식:met_kim, 태그:debtor, 태그빼기:debtor, 물건:peddler, 물건빼기:residence',
    '이어지는 장면': '한 사건 안에서 선택을 여러 번 하게 합니다.\n결과에서 장면을 고르면, 결과 글을 보여 준 뒤 그 장면의 글과 선택지가 이어서 나옵니다. 시간은 흐르지 않습니다.\n장면은 이 사건 아래 ‘이어지는 장면’에서 만듭니다. 싸움이 있는 결과에는 쓸 수 없습니다.',
    '장면 이름': '장면을 가리키는 이름 (영문 소문자 · 숫자 · _).\n선택지 결과의 ‘이어지는 장면’에 이 이름이 뜹니다.',
    '장면 제목': '이 장면에서 화면 맨 위에 나올 제목. 비우면 사건 제목 그대로.',
    '장면 본문': '이 장면으로 넘어왔을 때 나오는 글.',
    '＋ 장면 추가': '이 사건에 새 장면을 만듭니다. 만든 뒤 선택지 결과의 ‘이어지는 장면’에서 골라 이으세요.',
    '이야기 진행 → 이야기': '이 결과로 장기 이야기를 진행시킵니다. 어느 이야기인지 고르세요.',
    '→ 단계': '이야기가 넘어갈 단계 이름. ⚙ 이야기 설정의 단계 이름과 글자 하나까지 같아야 합니다.\nend_ 로 시작하면 이야기가 끝납니다 (예: end_success).',
    '→ 몇 주 뒤': '다음 단계가 찾아오기까지 기다릴 주. 비우면 곧바로.',
    '기타 설정 (JSON)': '칸에 없는 설정을 JSON 으로 적습니다. 모르면 비워 두세요.\n예: { "weapon": "nambu" } = 남부 권총을 줌\n{ "ambush": true } = 기습으로 싸움 시작',
    '선택지 기타 설정 (JSON)': '선택지에 붙는 그 밖의 설정. 모르면 비워 두세요.\n예: { "needTag": "link:press" } = 그 태그가 있어야 이 선택지가 보임',
    '사건 기타 설정 (JSON)': '사건에 붙는 그 밖의 설정. 모르면 비워 두세요.\n예: { "once": true } = 한 번만 나옴',
    '이야기 이름': '‘갈 곳’ 목록에 ‘이야기 · 이름’으로 나옵니다.',
    '시작 사건': '이 이야기의 첫 사건.',
    '시작 확률': '그 도시에서 한 번 움직일 때 이야기가 시작될 확률.\n0.06 = 6%',
    '이어질 확률': '다음 단계가 때가 되었을 때, 한 번 움직일 때마다 저절로 찾아올 확률.\n단계마다 ‘확률’을 따로 적으면 그것이 우선합니다.',
    '단계': '이야기의 단계 목록. 선택지 결과의 ‘→ 단계’가 여기 이름을 가리킵니다.',
    '단계 이름': '단계를 가리키는 이름 (예: met, strike). 선택지의 ‘→ 단계’에 이 이름을 그대로 씁니다.',
    '사건': '이 단계가 되면 나올 사건.',
    '확률': '이 단계가 한 번 움직일 때마다 찾아올 확률. 비우면 이야기의 ‘이어질 확률’.',
    '갈 곳 이름': '적으면 ‘갈 곳’ 목록에 떠서 플레이어가 직접 찾아갈 수 있습니다.\n비우면 목록에 안 뜨고 불시에 찾아옵니다 (복수 · 습격 등).',
    '갈 곳 설명': '‘갈 곳’ 목록에서 이름 아래 나오는 한 줄 설명.',
    'id (영문 소문자 · 숫자 · _)': '게임 안에서 사건을 구별하는 이름. 만든 뒤에는 바꿀 수 없습니다.',
    '이 사건을 붙일 단계 (선택)': '적으면 그 단계가 이 사건으로 이어집니다. 비우면 사건만 만듭니다.',
    '태생 단계 이름': '탄생 화면에 나오는 이 단계의 이름 (예: 유년 활동).',
    '굴림 횟수': '이 단계에서 주사위를 몇 번 굴릴지. 청소년기 사건은 5번입니다.',
    '굴림 방식': '조건에 따라 주사위를 바꿉니다. 위에서부터 조건(ifTag)이 맞는 첫 줄을 씁니다.\ndie = 주사위 면 수, add = 더하는 값\n예: [ { "ifTag": "child:reading", "die": 40, "add": 60 }, { "die": 100 } ] = 유년 ‘독서’면 d40+60, 아니면 d100\n비우면 d100',
    '항목 (d100 범위)': '주사위 숫자가 들어가는 범위에 따라 항목이 정해집니다.\n위에서 아래로 ‘범위 끝’이 커져야 하고, 마지막은 100입니다.\n막대 위에 마우스를 올리면 각 구간의 확률이 보입니다.',
    '범위 끝': '이 항목 범위의 마지막 숫자. 앞 항목의 끝 다음 숫자부터 여기까지가 이 항목입니다.\n예: 앞 항목이 10이고 여기가 20이면 11~20 (10%)',
    '항목 id': '항목을 구별하는 영문 이름. 자동 태그 ‘단계id:항목id’로도 쓰입니다.\n예: 연줄 단계의 friend → 태그 link:friend\n바꾸면 그 태그를 쓰는 사건이 안 나올 수 있습니다.',
    '특별 태생': '1이나 100처럼 아주 드문 항목. 탄생 화면에서 강조되고, special 태그가 붙습니다.',
    '설명': '탄생 화면에 나오는 이 항목의 설명.',
    '능력치 조정': '이 항목이 나오면 더해지는 능력치.\n예: 근력 +5, 지능 -3\n쓸 수 있는 이름: 근력 · 민첩 · 지능 · 교육 · 정확 · 건강',
    '소지품·감시도': '이 항목이 나오면 더해지는 소지품과 감시도.\n예: 돈 +10, 구급약 +1, 감시도 +1\n쓸 수 있는 이름: 돈 · 구급약 · 감시도 · 탄환',
    '태그': '이 항목이 나온 사람에게 붙는 태그 (쉼표로 구분).\n사건의 ‘필요한 태그’가 이것을 봅니다.\n‘단계id:항목id’ 태그는 따로 적지 않아도 자동으로 붙습니다.',
    '표식': '예전 방식의 표식(flag). 태그처럼도 쓰입니다. 모르면 비워 두세요.',
    '시작 돈': '모든 사람이 가지고 시작하는 돈.',
    '시작 구급약': '모든 사람이 가지고 시작하는 구급약.',
    '시작 탄환': '모든 사람이 가지고 시작하는 탄환.'
  };
  STAT_KEYS.forEach(function (k) { if (!TIPS[STAT_LABEL[k]]) TIPS[STAT_LABEL[k]] = '모든 사람이 시작하는 ' + STAT_LABEL[k] + ' 값 (' + STAT_MIN + '~' + STAT_MAX + ').'; });
  var GROUP_TIPS = {
    q: '여러 단계로 이어지는 이야기. ⚙ 이야기 설정에서 단계를 잇고, 그 아래 사건들을 고칩니다.',
    newq: '새 장기 이야기를 만듭니다. 설정과 시작 사건이 한 번에 생깁니다.',
    l: '이 거리에서 나오는 일반 사건과 일거리.',
    common: '아무 조건 없이 어느 도시의 어느 거리에서나 나오는 사건과 일거리.\n＋ 로 만든 새 사건은 공통 사건이 됩니다.\n시기·태그 조건을 넣으면 공통이 아니게 되니, 그런 사건은 시대 사건이나 각 거리에 두세요.',
    era: '시기가 맞으면 그 도시 어디서나 나오는 사건 (3·1 운동, 창씨개명 등).',
    off: '나오는 곳이 하나도 없어 게임에 안 나오는 사건.',
    link: '태생의 연줄에 따라 찾아오는 사건. 필요한 태그(link:…)가 꼭 있어야 합니다. 일어나는 곳을 비우면 어느 도시에서나 나옵니다.',
    align: '타협도 수치가 높거나 낮을 때 찾아오는 사건. 나오는 조건은 코드라서 글과 선택지만 고칠 수 있습니다.'
  };


  function fxStr(fx) { return Object.keys(fx || {}).map(function (k) { var v = fx[k]; return (FXK[k] || k) + ' ' + (v > 0 ? '+' : '') + v; }).join(', '); }
  function parseFx(s, what) {
    var out = {}, bad = [];
    String(s || '').split(/[,，\n]/).forEach(function (tok) {
      tok = tok.trim();
      if (!tok) return;
      var m = tok.match(/^([^\s:=+\-\d][^\s:=+\-]*)\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)$/);
      if (!m || !FXR[m[1]]) { bad.push(tok); return; }
      out[FXR[m[1]]] = Number(m[2]);
    });
    if (bad.length) throw new Error(what + ': 알 수 없는 항목 “' + bad.join('”, “') + '” — 예: 돈 +10, 감시도 +1');
    return Object.keys(out).length ? out : null;
  }
  /* ── 조건 글 ⇄ 조건 객체 (core.js 의 COND) ──
     예: 태그:lang:ja, 지능>=40, 돈<=3, 표식:met_kim, 표식없음:x, 태그없음:poor, 아무태그:a|b, 무기:총, 도시:평양|부산, 시간:밤, 연도:1919-1925, 확률:30% */
  var CONDK = { '돈': 'money', '체력': 'hp', '구급약': 'medkit', '탄환': 'ammo', '감시도': 'heat', '일제타협': 'jp', '민족타협': 'kr' };
  STAT_KEYS.forEach(function (k) { CONDK[STAT_LABEL[k]] = k; });
  var CONDK_R = {}; Object.keys(CONDK).forEach(function (k) { CONDK_R[CONDK[k]] = k; });
  var WPN_K = { '총': 'gun', '근접': 'melee', '없음': 'none' }, WPN_R = { gun: '총', melee: '근접', none: '없음' };
  function cityKey(n) { var hit = Object.keys(CITIES).filter(function (c) { return CITIES[c].name === n || c === n; })[0]; return hit || null; }
  function condStr(c) {
    if (!c) return '';
    var out = [], arr = function (v) { return v == null ? [] : (Array.isArray(v) ? v : [v]); };
    arr(c.tags).forEach(function (t) { out.push('태그:' + t); });
    if (arr(c.anyTags).length) out.push('아무태그:' + arr(c.anyTags).join('|'));
    arr(c.noTags).forEach(function (t) { out.push('태그없음:' + t); });
    arr(c.flags).forEach(function (t) { out.push('표식:' + t); });
    arr(c.noFlags).forEach(function (t) { out.push('표식없음:' + t); });
    arr(c.items).forEach(function (t) { out.push('물건:' + t); });
    arr(c.noItems).forEach(function (t) { out.push('물건없음:' + t); });
    Object.keys(c.min || {}).forEach(function (k) { out.push((CONDK_R[k] || k) + '>=' + c.min[k]); });
    Object.keys(c.max || {}).forEach(function (k) { out.push((CONDK_R[k] || k) + '<=' + c.max[k]); });
    if (c.weapon) out.push('무기:' + arr(c.weapon).map(function (w) { return WPN_R[w] || w; }).join('|'));
    if (arr(c.city).length) out.push('도시:' + arr(c.city).map(function (x) { return (CITIES[x] && CITIES[x].name) || x; }).join('|'));
    if (arr(c.time).length) out.push('시간:' + arr(c.time).map(function (x) { return COND_TIME[x]; }).join('|'));
    if (c.years) out.push('연도:' + c.years[0] + '-' + c.years[1]);
    if (c.chance != null) out.push('확률:' + Math.round(c.chance * 100) + '%');
    return out.join(', ');
  }
  function parseCond(str, what, allowChance) {
    str = String(str || '').trim();
    if (!str) return null;
    var c = {}, push = function (k, v) { (c[k] = c[k] || []).push(v); };
    str.split(/[,，\n]/).forEach(function (tok) {
      tok = tok.trim(); if (!tok) return;
      var m = tok.match(/^([^<>=:]+?)\s*(>=|<=)\s*(-?\d+)$/);
      if (m) {
        var k = CONDK[m[1].trim()] || (STAT_KEYS.indexOf(m[1].trim()) >= 0 ? m[1].trim() : null);
        if (!k) throw new Error(what + ': “' + m[1] + '”은(는) 비교할 수 없는 이름입니다');
        var g = m[2] === '>=' ? 'min' : 'max'; (c[g] = c[g] || {})[k] = Number(m[3]); return;
      }
      var i = tok.indexOf(':'); if (i < 0) throw new Error(what + ': “' + tok + '”을(를) 알 수 없습니다 — 예: 태그:lang:ja, 지능>=40');
      var key = tok.slice(0, i).trim(), v = tok.slice(i + 1).trim(), parts = v.split('|').map(function (x) { return x.trim(); }).filter(Boolean);
      if (!v) throw new Error(what + ': “' + tok + '” 뒤에 값이 없습니다');
      if (key === '태그') push('tags', v);
      else if (key === '태그없음') push('noTags', v);
      else if (key === '아무태그') c.anyTags = (c.anyTags || []).concat(parts);
      else if (key === '표식') push('flags', v);
      else if (key === '표식없음') push('noFlags', v);
      else if (key === '물건' || key === '물건없음') { if (!ITEMS[v]) throw new Error(what + ': 없는 물건 “' + v + '” (' + Object.keys(ITEMS).join(' · ') + ')'); push(key === '물건' ? 'items' : 'noItems', v); }
      else if (key === '무기') { c.weapon = parts.map(function (x) { return WPN_K[x] || x; }); c.weapon.forEach(function (w) { if (['gun', 'melee', 'none'].indexOf(w) < 0 && !WEAPONS[w]) throw new Error(what + ': 없는 무기 “' + w + '” (총 · 근접 · 없음 또는 무기 id)'); }); if (c.weapon.length === 1) c.weapon = c.weapon[0]; }
      else if (key === '도시') c.city = parts.map(function (x) { var k = cityKey(x); if (!k) throw new Error(what + ': 없는 도시 “' + x + '”'); return k; });
      else if (key === '시간') c.time = parts.map(function (x) { var t = COND_TIME.indexOf(x); if (t < 0) throw new Error(what + ': 시간은 오전 · 오후 · 밤'); return t; });
      else if (key === '연도') { var ym = v.match(/^(\d{4})\s*-\s*(\d{4})$/); if (!ym) throw new Error(what + ': 연도는 1919-1925 처럼'); c.years = [Number(ym[1]), Number(ym[2])]; }
      else if (key === '확률') {
        if (!allowChance) throw new Error(what + ': 확률 조건은 ‘조건부 결과’에서만 쓸 수 있습니다 (보이는 조건에 쓰면 화면이 깜빡입니다)');
        var pm = v.match(/^(\d+(?:\.\d+)?)\s*%?$/); if (!pm) throw new Error(what + ': 확률은 30% 처럼'); c.chance = Math.min(1, Number(pm[1]) / 100);
      }
      else throw new Error(what + ': “' + key + '” 조건은 없습니다 — 태그 · 태그없음 · 아무태그 · 표식 · 표식없음 · 물건 · 물건없음 · 무기 · 도시 · 시간 · 연도 · 확률 · 능력치>=숫자');
    });
    return Object.keys(c).length ? c : null;
  }
  /* 결과로 얻는 표식·태그: 표식:x, 태그:y, 태그빼기:z */
  function gainStr(r) {
    var arr = function (v) { return v == null ? [] : (Array.isArray(v) ? v : [v]); };
    return arr(r.flag).map(function (x) { return '표식:' + x; }).concat(arr(r.tag).map(function (x) { return '태그:' + x; })).concat(arr(r.untag).map(function (x) { return '태그빼기:' + x; })).concat(arr(r.item).map(function (x) { return '물건:' + x; })).concat(arr(r.unitem).map(function (x) { return '물건빼기:' + x; })).join(', ');
  }
  function parseGain(str, what) {
    var o = {};
    String(str || '').split(/[,，\n]/).forEach(function (tok) {
      tok = tok.trim(); if (!tok) return;
      var i = tok.indexOf(':'), k = i > 0 ? tok.slice(0, i).trim() : '', v = i > 0 ? tok.slice(i + 1).trim() : '';
      var key = { '표식': 'flag', '태그': 'tag', '태그빼기': 'untag', '물건': 'item', '물건빼기': 'unitem' }[k];
      if (!key || !v) throw new Error(what + ': “' + tok + '” — 표식:이름, 태그:이름, 태그빼기:이름, 물건:id, 물건빼기:id 로 적어 주세요');
      if ((key === 'item' || key === 'unitem') && !ITEMS[v]) throw new Error(what + ': 없는 물건 “' + v + '” (' + Object.keys(ITEMS).join(' · ') + ')');
      (o[key] = o[key] || []).push(v);
    });
    Object.keys(o).forEach(function (k) { if (o[k].length === 1) o[k] = o[k][0]; });
    return o;
  }
  function parseRest(s, what) {
    s = String(s || '').trim();
    if (!s) return {};
    try { var o = JSON.parse(s); if (o && typeof o === 'object' && !Array.isArray(o)) return o; } catch (err) {}
    throw new Error(what + ': JSON 형식이 맞지 않습니다');
  }
  function restStr(o) { return Object.keys(o).length ? JSON.stringify(o, null, 2) : ''; }
  function omit(o, keys) { var c = {}; Object.keys(o || {}).forEach(function (k) { if (keys.indexOf(k) < 0 && typeof o[k] !== 'function') c[k] = clone(o[k]); }); return c; }
  function fnKeys(o) { return Object.keys(o || {}).filter(function (k) { return typeof o[k] === 'function'; }); }
  function locName(l) { var L = LOCS[l]; return L ? L.name + (L.city && CITIES[L.city] ? ' (' + CITIES[L.city].name + ')' : ' (경성)') : l; }

  /* ── 사건 ⇄ 편집용 모양 ── */
  function resModel(r) {
    r = r || {};
    var q = r.quest || {};
    return { text: r.text || '', fx: fxStr(r.fx), qid: q.id || '', qstage: q.stage || '', qwait: q.wait == null ? '' : String(q.wait),
      qrest: omit(q, ['id', 'stage', 'wait']), fight: r.fight || '', dist: r.dist == null ? '' : String(r.dist), step: r.step || '',
      gain: gainStr(r), rest: restStr(omit(r, ['text', 'fx', 'quest', 'fight', 'dist', 'step', 'flag', 'tag', 'untag', 'item', 'unitem'])) };
  }
  function resBuild(m, what, steps) {
    var r = parseRest(m.rest, what + ' · 기타');
    if (m.text) r.text = m.text;
    var fx = parseFx(m.fx, what + ' · 효과'); if (fx) r.fx = fx;
    if (m.fight) r.fight = m.fight.trim();
    Object.assign(r, parseGain(m.gain, what + ' · 얻는 표식·태그'));
    if (m.dist !== '' && m.dist != null) { if (isNaN(Number(m.dist))) throw new Error(what + ': 거리는 숫자로'); r.dist = Number(m.dist); }
    if (m.qid || m.qstage) {
      if (!m.qid || !m.qstage) throw new Error(what + ': 이야기 진행은 이야기와 단계를 둘 다 적어야 합니다');
      var q = Object.assign({}, m.qrest, { id: m.qid, stage: m.qstage.trim() });
      if (m.qwait !== '') { if (isNaN(Number(m.qwait))) throw new Error(what + ': 기다릴 주는 숫자로'); q.wait = Number(m.qwait); }
      r.quest = q;
    }
    if (m.step) {
      if (!steps[m.step]) throw new Error(what + ': 이어지는 장면 “' + m.step + '”이(가) 없습니다');
      if (r.fight) throw new Error(what + ': 싸움이 있는 결과는 다음 장면으로 이어질 수 없습니다 (싸움 또는 장면 중 하나만)');
      r.step = m.step;
    }
    return r;
  }
  function optModel(o, al) {
    var a = al[o.label] || {};
    var ck = o.check || {};
    var orest = omit(o, ['label', 'check', 'ok', 'ng', 'cost', 'show', 'alt']);
    var crest = omit(ck, ['stat', 'diff']);
    if (Object.keys(crest).length) orest.check = crest;
    return { label: o.label || '', stat: ck.stat || '', diff: ck.diff || 'normal', cost: fxStr(o.cost), rest: restStr(orest),
      ajp: a.jp ? String(a.jp) : '', akr: a.kr ? String(a.kr) : '', aok: !!a.ok,
      afjp: a.fail && a.fail.jp ? String(a.fail.jp) : '', afkr: a.fail && a.fail.kr ? String(a.fail.kr) : '',
      ok: resModel(o.ok), hasNg: !!o.ng, ng: resModel(o.ng), show: condStr(o.show),
      alts: (o.alt || []).map(function (a) { return { when: condStr(a.when), skip: a.check === false, ok: resModel(a.ok), hasNg: !!a.ng, ng: resModel(a.ng) }; }) };
  }
  function newOpt() { return { label: '', stat: '', diff: 'normal', cost: '', rest: '', ajp: '', akr: '', aok: false, afjp: '', afkr: '', ok: resModel(), hasNg: false, ng: resModel(), show: '', alts: [] }; }
  function toModel(t, id) {
    var ev = pure(TABLES[t][id]) || {}, al = t === 'QUESTS' ? {} : alignOf(id);
    var m = { t: t, id: id, title: ev.title || '', kind: ev.kind || '', loc: ev.loc || '', needTag: ev.needTag || '',
      y0: ev.years ? String(ev.years[0]) : '', y1: ev.years ? String(ev.years[1]) : '', text: ev.text || '',
      fns: fnKeys(TABLES[t][id]), rest: restStr(omit(ev, ['title', 'kind', 'loc', 'needTag', 'years', 'text', 'options', 'steps'])),
      places: t === 'EVENTS' ? placesOf(id) : null,
      options: (ev.options || []).map(function (o) { return optModel(o, al); }),
      steps: Object.keys(ev.steps || {}).map(function (k) {
        var st = ev.steps[k];
        return { key: k, title: st.title || '', text: st.text || '', rest: omit(st, ['title', 'text', 'options']),
          options: (st.options || []).map(function (o) { return optModel(o, al); }) };
      }) };
    return m;
  }
  function num(s, what) { s = String(s || '').trim(); if (!s) return 0; var n = Number(s); if (isNaN(n)) throw new Error(what + ': 숫자로 적어 주세요'); return n; }
  function optBuild(o, what, align, labels, steps) {
    if (!o.label.trim()) throw new Error(what + ': 선택지 문구를 적어 주세요');
    if (labels[o.label]) throw new Error(what + ': 같은 문구의 선택지가 이 사건에 이미 있습니다 (장면이 달라도 문구는 달라야 합니다 · 타협도 표가 문구로 구분됩니다)');
    labels[o.label] = 1;
    var op = parseRest(o.rest, what + ' · 기타');
    var crest = op.check || {}; delete op.check;
    var out = { label: o.label };
    if (o.stat) out.check = Object.assign({}, crest, { stat: o.stat, diff: o.diff || 'normal' });
    else if (Object.keys(crest).length) out.check = crest;
    var cost = parseFx(o.cost, what + ' · 비용'); if (cost) out.cost = cost;
    Object.assign(out, op);
    var show = parseCond(o.show, what + ' · 보이는 조건', false); if (show) out.show = show;
    out.ok = resBuild(o.ok, what + (out.check ? ' · 성공' : ' · 결과'), steps);
    if ((out.check || out.comply) && o.hasNg) out.ng = resBuild(o.ng, what + (out.check ? ' · 실패' : ' · 걸렸을 때'), steps);
    if ((o.alts || []).length) {
      out.alt = o.alts.map(function (a, ai) {
        var aw = what + ' · 조건부 결과 ' + (ai + 1), when = parseCond(a.when, aw + ' · 조건', true);
        if (!when) throw new Error(aw + ': 조건을 적어 주세요');
        var x = { when: when, ok: resBuild(a.ok, aw + (out.check && !a.skip ? ' · 성공' : ''), steps) };
        if (out.check && a.skip) x.check = false;
        if (out.check && !a.skip && a.hasNg) x.ng = resBuild(a.ng, aw + ' · 실패', steps);
        return x;
      });
    }
    var jp = num(o.ajp, what + ' · 일제타협'), kr = num(o.akr, what + ' · 민족타협');
    var fjp = num(o.afjp, what + ' · 실패 일제타협'), fkr = num(o.afkr, what + ' · 실패 민족타협');
    if (jp || kr || fjp || fkr) {
      var al = {};
      if (jp) al.jp = jp; if (kr) al.kr = kr; if (o.aok) al.ok = true;
      if (fjp || fkr) { al.fail = {}; if (fjp) al.fail.jp = fjp; if (fkr) al.fail.kr = fkr; }
      align[o.label] = al;
    }
    return out;
  }
  function fromModel(m) {
    var ev = parseRest(m.rest, '사건 · 기타 설정');
    if (!m.title.trim()) throw new Error('제목을 적어 주세요');
    ev.title = m.title;
    if (m.kind) ev.kind = m.kind;
    if (m.loc) ev.loc = m.loc;
    if (m.needTag.trim()) ev.needTag = m.needTag.trim();
    if (m.y0 || m.y1) {
      var a = Number(m.y0 || 1910), b = Number(m.y1 || 1945);
      if (isNaN(a) || isNaN(b) || a > b) throw new Error('시기: 1910 ~ 1945 사이 숫자로, 앞이 뒤보다 작게');
      ev.years = [a, b];
    }
    ev.text = m.text;
    if (!m.options.length) throw new Error('선택지가 하나는 있어야 합니다');
    /* 장면 이름 먼저 확인 (결과가 장면을 가리키므로) */
    var steps = {};
    m.steps.forEach(function (st, i) {
      var k = st.key.trim();
      if (!/^[a-z][a-z0-9_]*$/.test(k)) throw new Error((i + 1) + '번 장면: 장면 이름은 영문 소문자로 시작하고 영문 소문자·숫자·_ 만 씁니다');
      if (steps[k]) throw new Error('장면 이름 “' + k + '”가 겹칩니다');
      steps[k] = st;
    });
    var align = {}, labels = {};
    ev.options = m.options.map(function (o, i) { return optBuild(o, (i + 1) + '번 선택지', align, labels, steps); });
    if (m.steps.length) {
      ev.steps = {};
      m.steps.forEach(function (st) {
        var k = st.key.trim(), what = '장면 “' + k + '”';
        if (!st.options.length) throw new Error(what + ': 선택지가 하나는 있어야 합니다');
        var o = Object.assign({}, st.rest);
        if (st.title.trim()) o.title = st.title;
        o.text = st.text;
        o.options = st.options.map(function (op, i) { return optBuild(op, what + ' ' + (i + 1) + '번 선택지', align, labels, steps); });
        ev.steps[k] = o;
      });
    }
    if (m.t === 'LINK_EVENTS') {
      if (!ev.needTag) throw new Error('연줄 사건은 필요한 태그(link:…)를 적어야 합니다');
    }
    return { ev: ev, align: align };
  }
  /* ── 장기 이야기 설정 ⇄ 편집용 ── */
  function questModel(id) {
    var q = pure(QUESTS[id]) || {};
    return { t: 'QUESTS', id: id, name: q.name || '', start: q.start || '', startChance: q.startChance == null ? '' : String(q.startChance),
      y0: q.years ? String(q.years[0]) : '', y1: q.years ? String(q.years[1]) : '', loc: q.loc || '',
      followChance: q.followChance == null ? '' : String(q.followChance),
      stages: Object.keys(q.stages || {}).map(function (k) { var s = q.stages[k]; return { key: k, event: s.event || '', place: s.place || '', sub: s.sub || '', chance: s.chance == null ? '' : String(s.chance), rest: omit(s, ['event', 'place', 'sub', 'chance']) }; }),
      rest: restStr(omit(q, ['name', 'start', 'startChance', 'years', 'loc', 'followChance', 'stages'])) };
  }
  function questBuild(m) {
    var q = parseRest(m.rest, '이야기 · 기타 설정');
    if (!m.name.trim()) throw new Error('이야기 이름을 적어 주세요');
    if (!QUEST_EVENTS[m.start]) throw new Error('시작 사건을 골라 주세요');
    q.name = m.name; q.start = m.start;
    q.startChance = num(m.startChance, '시작 확률');
    if (m.y0 || m.y1) q.years = [num(m.y0 || 1910, '시기'), num(m.y1 || 1945, '시기')];
    if (m.loc) q.loc = m.loc;
    if (m.followChance !== '') q.followChance = num(m.followChance, '이어질 확률');
    q.stages = {};
    m.stages.forEach(function (s, i) {
      var k = s.key.trim();
      if (!k) throw new Error((i + 1) + '번 단계: 단계 이름을 적어 주세요');
      if (q.stages[k]) throw new Error('단계 이름 “' + k + '”가 겹칩니다');
      var o = Object.assign({}, s.rest);
      if (s.event) { if (!QUEST_EVENTS[s.event]) throw new Error('단계 “' + k + '”: 없는 사건'); o.event = s.event; }
      o.place = s.place; o.sub = s.sub;
      if (s.chance !== '') o.chance = num(s.chance, '단계 “' + k + '” 확률');
      q.stages[k] = o;
    });
    return q;
  }
  function questOfEvent(eid) {
    var hit = '';
    Object.keys(QUESTS).forEach(function (qid) {
      var Q = QUESTS[qid];
      if (Q.start === eid || Object.keys(Q.stages || {}).some(function (k) { return Q.stages[k].event === eid; })) hit = hit || qid;
    });
    return hit;
  }

  /* ───── 화면 상태 ───── */
  var S = { open: false, mode: 'story', lsel: null, lmodel: null, sel: null, q: '', groupsOpen: {}, view: 'list', toast: '', toastBad: false, model: null, modelKey: '', sheet: null, newFor: null };
  var root = null, editScroll = 0;

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'tip') { if (v) el.setAttribute('data-tip', v); }
      else el.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c == null || c === false) return; el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function grow(el) { el.style.height = 'auto'; el.style.height = (el.scrollHeight + 2) + 'px'; }
  function ta(value, oninput, attrs) {
    var el = h('textarea', Object.assign({ value: value, rows: 2 }, attrs || {}));
    el.addEventListener('input', function () { oninput(el.value); grow(el); });
    setTimeout(function () { grow(el); }, 0);
    return el;
  }
  function inp(value, oninput, attrs) {
    var el = h('input', Object.assign({ value: value, type: 'text' }, attrs || {}));
    el.addEventListener('input', function () { oninput(el.type === 'checkbox' ? el.checked : el.value); });
    return el;
  }
  function sel(value, opts, onchange, attrs) {
    var el = h('select', attrs || {}, opts.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
    el.value = value;
    el.addEventListener('change', function () { onchange(el.value); });
    return el;
  }
  function field(label, ctrl, hint, wide) {
    var tip = TIPS[label];
    return h('label', { class: 'ijd-f' + (wide ? ' ijd-wide' : '') }, [h('span', { class: 'ijd-fl' + (tip ? ' has-tip' : ''), tip: tip, text: label }), ctrl, hint ? h('span', { class: 'ijd-hint', text: hint }) : null]);
  }
  function subHead(text) { var tip = TIPS[text]; return h('h4', { class: tip ? 'has-tip' : null, tip: tip, text: text }); }

  /* ───── 설명 글상자: 설명이 있는 글자(점선 밑줄) 위에 마우스를 1초 올려 두면 마우스 자리에 뜬다 ─────
     휴대폰: 그 글자를 0.6초 길게 누르면 뜨고, 손을 떼면 잠시 뒤 사라진다 */
  var tipBox = null, tipEl = null, tipTimer = null, tipX = 0, tipY = 0;
  function hideTip() { clearTimeout(tipTimer); tipTimer = null; if (tipBox) tipBox.style.display = 'none'; }
  function showTip(el) {
    if (!el || !document.body.contains(el)) return;
    if (!tipBox) { tipBox = h('div', { class: 'ijd-tipbox', role: 'tooltip' }); document.body.appendChild(tipBox); }
    tipBox.textContent = el.getAttribute('data-tip');
    tipBox.style.display = 'block'; tipBox.style.left = '0px'; tipBox.style.top = '0px';
    var w = tipBox.offsetWidth, hh = tipBox.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var x = tipX + 14, y = tipY + 18;
    if (x + w > vw - 8) x = Math.max(8, vw - w - 8);
    if (y + hh > vh - 8) y = Math.max(8, tipY - hh - 10);
    tipBox.style.left = x + 'px'; tipBox.style.top = y + 'px';
  }
  function wireTips(el) {
    el.addEventListener('mousemove', function (e) { tipX = e.clientX; tipY = e.clientY; });
    el.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('[data-tip]');
      if (t === tipEl) return;
      hideTip(); tipEl = t; tipX = e.clientX; tipY = e.clientY;
      if (t) tipTimer = setTimeout(function () { showTip(t); }, 1000);
    });
    el.addEventListener('mouseout', function (e) {
      if (tipEl && !(e.relatedTarget && tipEl.contains(e.relatedTarget))) { hideTip(); tipEl = null; }
    });
    el.addEventListener('mousedown', hideTip, true);
    el.addEventListener('scroll', hideTip, true);
    el.addEventListener('touchstart', function (e) {
      var t = e.target.closest && e.target.closest('[data-tip]'), p = e.touches[0];
      hideTip(); if (!t || !p) return;
      tipX = p.clientX; tipY = p.clientY;
      tipTimer = setTimeout(function () { showTip(t); }, 600);
    }, { passive: true });
    el.addEventListener('touchend', function () { clearTimeout(tipTimer); if (tipBox && tipBox.style.display === 'block') setTimeout(hideTip, 2500); });
  }
  function toast(msg, bad) { S.toast = msg; S.toastBad = !!bad; var t = root && root.querySelector('.ijd-toast'); if (t) { t.textContent = msg; t.className = 'ijd-toast' + (bad ? ' bad' : '') + (msg ? ' on' : ''); } }

  /* ── 목록 ── */
  function evTitle(t, id) { var e = TABLES[t][id]; return (e && (e.title || e.name)) || id; }
  function groups() {
    var G = [];
    Object.keys(QUESTS).forEach(function (qid) {
      var Q = QUESTS[qid], seen = {}, items = [{ t: 'QUESTS', id: qid, label: '⚙ 이야기 설정' }];
      [Q.start].concat(Object.keys(Q.stages || {}).map(function (k) { return Q.stages[k].event; })).forEach(function (e) {
        if (e && !seen[e] && QUEST_EVENTS[e]) { seen[e] = 1; items.push({ t: 'QUEST_EVENTS', id: e }); }
      });
      G.push({ key: 'q:' + qid, title: '장기 · ' + Q.name, items: items, add: { t: 'QUEST_EVENTS', quest: qid } });
    });
    var used = {};
    Object.keys(QUESTS).forEach(function (qid) { var Q = QUESTS[qid]; used[Q.start] = 1; Object.keys(Q.stages || {}).forEach(function (k) { used[Q.stages[k].event] = 1; }); });
    var orphanQ = Object.keys(QUEST_EVENTS).filter(function (e) { return !used[e]; }).map(function (e) { return { t: 'QUEST_EVENTS', id: e }; });
    if (orphanQ.length) G.push({ key: 'q:_', title: '장기 · 어느 이야기에도 안 묶인 사건', items: orphanQ });
    G.push({ key: 'newq', title: '＋ 새 장기 이야기 만들기', items: [], add: { t: 'QUESTS' }, addOnly: true });
    /* 공통: 아무 조건 없이 어느 도시의 어느 거리에서나 나오는 사건·일거리 */
    var common = COMMON.events.map(function (e) { return { t: 'EVENTS', id: e }; })
      .concat(COMMON.work.map(function (e) { return { t: 'EVENTS', id: e, tag: '일거리' }; }));
    G.push({ key: 'common', title: '공통 (어디서나)', items: common, add: { t: 'EVENTS', place: 'common:events' } });
    CITY_ORDER.forEach(function (c) {
      Object.keys(LOCS).forEach(function (l) {
        var L = LOCS[l];
        if ((L.city || START_CITY) !== c || (!L.events && !L.work)) return;
        var items = (L.events || []).map(function (e) { return { t: 'EVENTS', id: e }; }).concat((L.work || []).map(function (e) { return { t: 'EVENTS', id: e, tag: '일거리' }; }));
        G.push({ key: 'l:' + l, title: CITIES[c].name + ' · ' + L.name, items: items, add: { t: 'EVENTS', place: l + ':events' } });
      });
    });
    G.push({ key: 'era', title: '시대 사건 (해당 연도에 어디서나)', items: ERA_EVENTS.map(function (e) { return { t: 'EVENTS', id: e }; }), add: { t: 'EVENTS', place: 'era' } });
    var off = Object.keys(EVENTS).filter(function (e) { return !placesOf(e).length; }).map(function (e) { return { t: 'EVENTS', id: e }; });
    if (off.length) G.push({ key: 'off', title: '꺼진 사건 (나오는 곳 없음)', items: off });
    G.push({ key: 'link', title: '연줄 사건', items: Object.keys(LINK_EVENTS).map(function (e) { return { t: 'LINK_EVENTS', id: e, tag: LINK_EVENTS[e].loc ? LOCS[LINK_EVENTS[e].loc] && LOCS[LINK_EVENTS[e].loc].name : '' }; }), add: { t: 'LINK_EVENTS' } });
    G.push({ key: 'align', title: '타협도 사건 (조건은 코드에서)', items: Object.keys(ALIGN_EVENTS).map(function (e) { return { t: 'ALIGN_EVENTS', id: e }; }) });
    return G;
  }
  function matches(it) {
    var q = S.q.trim().toLowerCase();
    if (!q) return true;
    var e = TABLES[it.t][it.id] || {};
    return [it.id, e.title, e.name, e.text].concat((e.options || []).map(function (o) { return o.label; })).some(function (s) { return s && String(s).toLowerCase().indexOf(q) >= 0; });
  }
  function renderList() {
    var box = h('div', { class: 'ijd-groups' });
    groups().forEach(function (g) {
      var items = g.items.filter(matches);
      if (S.q && !items.length) return;
      var open = S.q ? true : !!S.groupsOpen[g.key];
      var head = h('button', { type: 'button', class: 'ijd-gh' + (g.addOnly ? ' add' : ''), tip: GROUP_TIPS[g.key.split(':')[0]], onclick: function () {
        if (g.addOnly) { startNew(g.add); return; }
        S.groupsOpen[g.key] = !open; render();
      } }, [h('span', { text: g.addOnly ? '' : (open ? '▾ ' : '▸ ') }), h('span', { class: 'ijd-gt', text: g.title }), g.addOnly ? null : h('span', { class: 'ijd-gc', text: String(items.length) })]);
      box.appendChild(head);
      if (!open) return;
      var ul = h('div', { class: 'ijd-items' });
      items.forEach(function (it) {
        var on = S.sel && S.sel.t === it.t && S.sel.id === it.id;
        ul.appendChild(h('button', { type: 'button', class: 'ijd-it' + (on ? ' on' : ''), onclick: function () { pick(it.t, it.id); } }, [
          h('span', { class: 'ijd-itt', text: it.label || evTitle(it.t, it.id) }),
          h('span', { class: 'ijd-itm', text: (it.tag ? it.tag + ' · ' : '') + it.id }),
          isLocal(it.t, it.id) ? h('span', { class: 'ijd-dot', tip: '이 브라우저에서 고침 (아직 폴더에 저장 안 했을 수 있음)', text: '●' }) : null
        ]));
      });
      if (g.add && !S.q) ul.appendChild(h('button', { type: 'button', class: 'ijd-it add', onclick: function () { startNew(g.add); } }, [h('span', { class: 'ijd-itt', text: g.add.t === 'QUEST_EVENTS' ? '＋ 이 이야기에 사건 추가' : '＋ 여기에 새 사건' })]));
      box.appendChild(ul);
    });
    return h('aside', { class: 'ijd-list' }, [
      h('input', { class: 'ijd-search', type: 'search', placeholder: '찾기: 제목 · id · 본문 · 선택지', value: S.q, oninput: function (e) { S.q = e.target.value; var keep = e.target.selectionStart; render(); var n = root.querySelector('.ijd-search'); if (n) { n.focus(); try { n.setSelectionRange(keep, keep); } catch (err) {} } } }),
      box
    ]);
  }
  function pick(t, id) {
    if (S.model && S.dirty && !(S.sel && S.sel.t === t && S.sel.id === id)) {
      if (!S.leaveArmed) { S.leaveArmed = { t: t, id: id }; toast('저장하지 않은 고침이 있습니다. 한 번 더 누르면 버리고 넘어갑니다.', true); return; }
    }
    S.leaveArmed = null; S.sel = { t: t, id: id }; S.model = null; S.dirty = false; S.view = 'edit'; editScroll = 0; toast(''); render();
  }

  /* ── 새로 만들기 ── */
  function startNew(spec) { S.newFor = spec; S.newId = ''; S.view = 'edit'; S.sel = null; S.model = null; render(); }
  function renderNew() {
    var spec = S.newFor, what = spec.t === 'QUESTS' ? '새 장기 이야기' : spec.t === 'QUEST_EVENTS' ? '「' + QUESTS[spec.quest].name + '」에 새 사건' : spec.t === 'LINK_EVENTS' ? '새 연줄 사건' : '새 사건';
    var prefix = spec.t === 'QUESTS' ? '' : spec.t === 'QUEST_EVENTS' ? (QUEST_EVENTS[QUESTS[spec.quest].start] ? QUESTS[spec.quest].start.split('_')[0] + '_' : 'q_') : spec.t === 'LINK_EVENTS' ? 'lk_' : (spec.place && spec.place !== 'era' ? spec.place.split(':')[0].split('_')[0].slice(0, 2) + '_' : 'era_');
    if (!S.newId) S.newId = prefix;
    var id = inp(S.newId, function (v) { S.newId = v; }, { placeholder: prefix + 'myevent', autocapitalize: 'off', spellcheck: 'false' });
    var stageKey = inp(S.newStage || '', function (v) { S.newStage = v; }, { placeholder: '예: meet2', autocapitalize: 'off' });
    var go = function () {
      var nid = (S.newId || '').trim();
      if (!/^[a-z][a-z0-9_]*$/.test(nid)) { toast('id 는 영문 소문자로 시작하고, 영문 소문자 · 숫자 · _ 만 씁니다', true); return; }
      var T = TABLES[spec.t];
      if (T[nid] || (spec.t === 'QUESTS' && QUEST_EVENTS[nid + '_start'])) { toast('이미 있는 id 입니다', true); return; }
      try {
        if (spec.t === 'QUESTS') {
          var sid = nid + '_start';
          saveEntry('QUEST_EVENTS', sid, { title: '새 이야기의 시작', kind: 'quest', loc: 'jongno', text: '(본문)', options: [
            { label: '돕는다', ok: { text: '(결과)', quest: { id: nid, stage: 'next', wait: 3 } } },
            { label: '지나친다', ok: { text: '(결과)', quest: { id: nid, stage: 'end_ignored' } } }] }, {});
          saveEntry('QUESTS', nid, { name: '새 장기 이야기', start: sid, startChance: 0.06, loc: 'jongno', followChance: 0.1, stages: { next: { place: '', sub: '' } } });
          S.newFor = null; pick('QUESTS', nid);
          toast('만들었습니다. 시작 사건(' + sid + ')을 고치고, 단계를 이어 붙이세요.');
          return;
        }
        var ev = { title: '새 사건', text: '(본문)', options: [{ label: '선택지 하나', ok: { text: '(결과)' } }] };
        if (spec.t === 'QUEST_EVENTS') {
          ev.kind = 'quest'; ev.loc = QUESTS[spec.quest].loc || 'jongno';
          saveEntry(spec.t, nid, ev, {});
          var key = (S.newStage || '').trim();
          if (key) {
            var Q = pure(QUESTS[spec.quest]);
            Q.stages = Q.stages || {};
            Q.stages[key] = Object.assign({}, Q.stages[key] || { place: '(장소 이름)', sub: '(한 줄 설명)' }, { event: nid });
            saveEntry('QUESTS', spec.quest, Q);
          }
        } else if (spec.t === 'LINK_EVENTS') {
          ev.kind = 'link'; ev.loc = 'jongno'; ev.needTag = 'link:friend';
          saveEntry(spec.t, nid, ev, {});
        } else {
          saveEntry('EVENTS', nid, ev, {}, spec.place ? [spec.place] : []);
        }
        S.newFor = null; S.newStage = ''; pick(spec.t, nid);
        toast('만들었습니다. 내용을 채우고 저장하세요.');
      } catch (err) { toast(err.message, true); }
    };
    return h('div', { class: 'ijd-card' }, [
      h('h3', { text: what }),
      field('id (영문 소문자 · 숫자 · _)', id, '게임 안에서 사건을 구별하는 이름입니다. 나중에 바꿀 수 없습니다.'),
      spec.t === 'QUEST_EVENTS' ? field('이 사건을 붙일 단계 (선택)', stageKey, '비워 두면 사건만 만듭니다. 적으면 그 단계가 이 사건으로 이어집니다. 다른 사건 선택지의 “이야기 진행 → 단계”에 이 이름을 적으면 여기로 넘어옵니다.') : null,
      h('div', { class: 'ijd-row' }, [h('button', { type: 'button', class: 'ijd-btn main', onclick: go, text: '만들기' }), h('button', { type: 'button', class: 'ijd-btn', onclick: function () { S.newFor = null; render(); }, text: '취소' })])
    ]);
  }

  /* ── 사건 편집 ── */
  function mark() { S.dirty = true; var b = root && root.querySelector('.ijd-save'); if (b) b.classList.add('dirty'); }
  function resEditor(r, label, qid, m) {
    var qstages = qid && QUESTS[qid] ? Object.keys(QUESTS[qid].stages || {}) : [];
    var dl = 'ijd-st-' + Math.random().toString(36).slice(2, 8);
    var stepKeys = (m && m.steps || []).map(function (st) { return st.key; }).filter(Boolean);
    return h('div', { class: 'ijd-res' }, [
      h('div', { class: 'ijd-rl', text: label }),
      field('결과 글', ta(r.text, function (v) { r.text = v; mark(); }, { rows: 3 }), null, true),
      h('div', { class: 'ijd-grid' }, [
        field('효과', inp(r.fx, function (v) { r.fx = v; mark(); }, { placeholder: '예: 돈 +10, 감시도 +1' })),
        field('싸움', inp(r.fight, function (v) { r.fight = v; mark(); }, { list: 'ijd-fights', placeholder: '없음' })),
        field('싸움 거리', inp(r.dist, function (v) { r.dist = v; mark(); }, { placeholder: '예: 1.5', inputmode: 'decimal' })),
        field('얻는 표식·태그', inp(r.gain, function (v) { r.gain = v; mark(); }, { placeholder: '예: 표식:met_kim, 태그:debtor', autocapitalize: 'off', spellcheck: 'false' })),
        field('이어지는 장면', sel(r.step, [['', stepKeys.length ? '(여기서 사건 끝)' : '(장면 없음 · 사건 끝)']].concat(stepKeys.map(function (k) { return [k, '→ ' + k]; })), function (v) { r.step = v; mark(); }, { class: 'ijd-stepsel' }))
      ]),
      h('div', { class: 'ijd-grid' }, [
        field('이야기 진행 → 이야기', sel(r.qid, [['', '없음']].concat(Object.keys(QUESTS).map(function (q) { return [q, QUESTS[q].name]; })), function (v) { r.qid = v; mark(); render(); })),
        field('→ 단계', h('span', {}, [inp(r.qstage, function (v) { r.qstage = v; mark(); }, { list: dl, placeholder: 'end_… 로 쓰면 끝', autocapitalize: 'off' }), h('datalist', { id: dl }, qstages.map(function (k) { return h('option', { value: k }); }))])),
        field('→ 몇 주 뒤', inp(r.qwait, function (v) { r.qwait = v; mark(); }, { placeholder: '예: 5', inputmode: 'numeric' }))
      ]),
      h('details', { class: 'ijd-adv' + (r.rest ? ' has' : '') }, [h('summary', { tip: TIPS['기타 설정 (JSON)'], text: '기타 설정 (JSON)' + (r.rest ? ' · 있음' : '') }),
        ta(r.rest, function (v) { r.rest = v; mark(); }, { class: 'mono', rows: 2, placeholder: '예: { "ambush": true, "weapon": "nambu" }', spellcheck: 'false' })])
    ]);
  }
  /* list = 이 선택지가 속한 목록 (첫 장면 m.options 또는 장면의 options) */
  function optEditor(m, list, o, i) {
    var qid = m.t === 'QUEST_EVENTS' ? questOfEvent(m.id) : '';
    var move = function (d) { var j = i + d; if (j < 0 || j >= list.length) return; var a = list[i]; list[i] = list[j]; list[j] = a; mark(); render(); };
    return h('div', { class: 'ijd-opt' }, [
      h('div', { class: 'ijd-oh' }, [
        h('span', { class: 'ijd-on', text: String(i + 1) }),
        inp(o.label, function (v) { o.label = v; mark(); }, { class: 'ijd-olab', placeholder: '선택지 문구' }),
        h('button', { type: 'button', class: 'ijd-mini', tip: '이 선택지를 위로 올립니다', onclick: function () { move(-1); }, text: '↑' }),
        h('button', { type: 'button', class: 'ijd-mini', tip: '이 선택지를 아래로 내립니다', onclick: function () { move(1); }, text: '↓' }),
        h('button', { type: 'button', class: 'ijd-mini bad', tip: '이 선택지를 지웁니다 (두 번 눌러야 지워짐)', onclick: function () { if (o._del) { list.splice(i, 1); mark(); render(); } else { o._del = true; toast('한 번 더 누르면 ' + (i + 1) + '번 선택지를 지웁니다', true); } }, text: '✕' })
      ]),
      h('div', { class: 'ijd-grid' }, [
        field('판정 능력치', sel(o.stat, [['', '판정 없음 (항상 성공)']].concat(STAT_KEYS.map(function (k) { return [k, STAT_LABEL[k]]; })), function (v) { o.stat = v; if (v && !o.hasNg) o.hasNg = true; mark(); render(); })),
        o.stat ? field('난이도', sel(o.diff, DIFFS, function (v) { o.diff = v; mark(); })) : null,
        field('비용', inp(o.cost, function (v) { o.cost = v; mark(); }, { placeholder: '예: 돈 5' }))
      ]),
      h('div', { class: 'ijd-grid' }, [
        field('일제타협', inp(o.ajp, function (v) { o.ajp = v; mark(); }, { inputmode: 'numeric', placeholder: '0' })),
        field('민족타협', inp(o.akr, function (v) { o.akr = v; mark(); }, { inputmode: 'numeric', placeholder: '0' })),
        o.stat ? h('label', { class: 'ijd-f ijd-chk' }, [h('input', { type: 'checkbox', checked: o.aok, onchange: function (e) { o.aok = e.target.checked; mark(); } }), h('span', { tip: TIPS['성공했을 때만'], text: '성공했을 때만' })]) : null,
        o.stat ? field('실패 시 일제', inp(o.afjp, function (v) { o.afjp = v; mark(); }, { inputmode: 'numeric', placeholder: '0' })) : null,
        o.stat ? field('실패 시 민족', inp(o.afkr, function (v) { o.afkr = v; mark(); }, { inputmode: 'numeric', placeholder: '0' })) : null
      ]),
      field('보이는 조건', inp(o.show, function (v) { o.show = v; mark(); }, { placeholder: '비우면 늘 보임 · 예: 태그:lang:ja, 지능>=40', autocapitalize: 'off', spellcheck: 'false' }), null, true),
      resEditor(o.ok, o.stat ? '성공했을 때' : '고르면', qid, m),
      !o.stat && o.hasNg && /"comply"\s*:\s*true/.test(o.rest || '') ? resEditor(o.ng, '검문에서 불법 소지품이 걸렸을 때', qid, m) : null,
      o.stat ? (o.hasNg ? resEditor(o.ng, '실패했을 때', qid, m) : h('button', { type: 'button', class: 'ijd-btn', tip: '판정에 실패했을 때 나올 글과 효과를 따로 씁니다', onclick: function () { o.hasNg = true; mark(); render(); }, text: '＋ 실패 결과 쓰기' })) : null,
      o.stat && o.hasNg ? h('button', { type: 'button', class: 'ijd-link', onclick: function () { o.hasNg = false; mark(); render(); }, text: '실패 결과 빼기 (실패하면 “아무 일도 일어나지 않았다.”만 나옴)' }) : null,
      altsEditor(m, o, qid),
      h('details', { class: 'ijd-adv' + (o.rest ? ' has' : '') }, [h('summary', { tip: TIPS['선택지 기타 설정 (JSON)'], text: '선택지 기타 설정 (JSON)' + (o.rest ? ' · 있음' : '') }),
        ta(o.rest, function (v) { o.rest = v; mark(); }, { class: 'mono', rows: 2, placeholder: '예: { "needTag": "link:press" }', spellcheck: 'false' })])
    ]);
  }
  /* 장면 이름을 바꾸면 그 장면을 가리키던 결과도 같이 바꾸고, 화면의 장면 고르기 칸을 그 자리에서 고친다
     (다시 그리면 바로 다음 ‘저장’ 클릭이 사라지므로 다시 그리지 않는다) */
  function renameStep(m, st, nk) {
    var old = st.key;
    var fix = function (r) { if (r && old && r.step === old) r.step = nk; };
    m.options.concat.apply(m.options, m.steps.map(function (x) { return x.options; })).forEach(function (o) { fix(o.ok); fix(o.ng); });
    st.key = nk;
    var keys = m.steps.map(function (x) { return x.key; }).filter(Boolean);
    Array.prototype.forEach.call(root.querySelectorAll('select.ijd-stepsel'), function (el) {
      var cur = el.value === old ? nk : el.value;
      el.innerHTML = '';
      el.appendChild(h('option', { value: '', text: '(여기서 사건 끝)' }));
      keys.forEach(function (k) { el.appendChild(h('option', { value: k, text: '→ ' + k })); });
      el.value = cur;
    });
  }
  /* 조건부 결과: 고를 때 조건이 맞으면 위의 결과 대신 이 결과 (위에서부터 맞는 첫 줄) */
  function altsEditor(m, o, qid) {
    return h('div', { class: 'ijd-alts' }, [
      o.alts.length ? subHead('조건부 결과') : null,
      h('div', {}, o.alts.map(function (a, ai) {
        return h('div', { class: 'ijd-alt' }, [
          h('div', { class: 'ijd-grid' }, [
            field('조건', inp(a.when, function (v) { a.when = v; mark(); }, { placeholder: '예: 태그:region:northwest, 확률:30%', autocapitalize: 'off', spellcheck: 'false' })),
            o.stat ? h('label', { class: 'ijd-f ijd-chk' }, [h('input', { type: 'checkbox', checked: a.skip, onchange: function (e) { a.skip = e.target.checked; mark(); render(); } }), h('span', { class: 'has-tip', tip: TIPS['판정 없이 바로'], text: '판정 없이 바로' })]) : null,
            h('button', { type: 'button', class: 'ijd-mini bad', tip: '이 조건부 결과를 지웁니다 (두 번 눌러야 지워짐)', onclick: function () { if (a._del) { o.alts.splice(ai, 1); mark(); render(); } else { a._del = true; toast('한 번 더 누르면 조건부 결과 ' + (ai + 1) + '을(를) 지웁니다', true); } }, text: '✕' })
          ]),
          resEditor(a.ok, o.stat && !a.skip ? '조건이 맞고 성공하면' : '조건이 맞으면', qid, m),
          o.stat && !a.skip ? (a.hasNg ? resEditor(a.ng, '조건이 맞고 실패하면', qid, m) : h('button', { type: 'button', class: 'ijd-link', onclick: function () { a.hasNg = true; mark(); render(); }, text: '＋ 실패 결과도 따로 쓰기 (안 쓰면 위의 실패 결과)' })) : null
        ]);
      })),
      h('button', { type: 'button', class: 'ijd-btn', tip: TIPS['＋ 조건부 결과'], onclick: function () { o.alts.push({ when: '', skip: false, ok: resModel(), hasNg: false, ng: resModel() }); mark(); render(); }, text: '＋ 조건부 결과' })
    ]);
  }
  /* 이어지는 장면들: 한 사건 안에서 선택을 여러 번 하게 한다 */
  function stepsEditor(m) {
    return h('div', {}, [
      subHead('이어지는 장면'),
      h('p', { class: 'ijd-hint', text: '선택지 결과의 ‘이어지는 장면’에서 장면을 고르면, 결과 글을 보여 준 뒤 그 장면의 글과 선택지가 이어서 나옵니다. 장면의 결과에서 또 다른 장면을 고르면 몇 번이든 이어집니다. 시간은 흐르지 않습니다.' }),
      h('div', {}, m.steps.map(function (st, si) {
        return h('div', { class: 'ijd-step' }, [
          h('div', { class: 'ijd-grid' }, [
            field('장면 이름', inp(st.key, function (v) { renameStep(m, st, v.trim()); mark(); }, { autocapitalize: 'off', spellcheck: 'false', placeholder: '예: talk2' })),
            field('장면 제목', inp(st.title, function (v) { st.title = v; mark(); }, { placeholder: '(비우면 사건 제목)' })),
            h('button', { type: 'button', class: 'ijd-mini bad', tip: '이 장면을 지웁니다 (두 번 눌러야 지워짐). 이 장면을 가리키던 결과는 저장할 때 오류로 알려 줍니다.', onclick: function () { if (st._del) { m.steps.splice(si, 1); mark(); render(); } else { st._del = true; toast('한 번 더 누르면 장면 “' + st.key + '”을(를) 지웁니다', true); } }, text: '✕' })
          ]),
          field('장면 본문', ta(st.text, function (v) { st.text = v; mark(); }, { rows: 4 }), null, true),
          h('div', { class: 'ijd-stepopts' }, st.options.map(function (o, i) { return optEditor(m, st.options, o, i); })),
          h('button', { type: 'button', class: 'ijd-btn', onclick: function () { st.options.push(newOpt()); mark(); render(); }, text: '＋ 이 장면에 선택지 추가' })
        ]);
      })),
      h('button', { type: 'button', class: 'ijd-btn', tip: TIPS['＋ 장면 추가'], onclick: function () {
        var n = m.steps.length + 2, k = 'scene' + n;
        while (m.steps.some(function (x) { return x.key === k; })) k = 'scene' + (++n);
        m.steps.push({ key: k, title: '', text: '', rest: {}, options: [newOpt()] }); mark(); render();
      }, text: '＋ 장면 추가' })
    ]);
  }
  function placeEditor(m) {
    var specs = [['common:events', '공통 · 사건 (모든 도시의 거리 어디서나)'], ['common:work', '공통 · 일거리 (모든 도시의 거리 어디서나)'], ['era', '시대 사건 (해당 시기, 어디서나)']];
    Object.keys(LOCS).forEach(function (l) { if (LOCS[l].events || LOCS[l].work) { specs.push([l + ':events', locName(l) + ' · 사건']); specs.push([l + ':work', locName(l) + ' · 일거리']); } });
    return h('div', { class: 'ijd-places' }, specs.map(function (s) {
      return h('label', { class: 'ijd-pl' }, [h('input', { type: 'checkbox', checked: m.places.indexOf(s[0]) >= 0, onchange: function (e) {
        var i = m.places.indexOf(s[0]);
        if (e.target.checked && i < 0) m.places.push(s[0]); if (!e.target.checked && i >= 0) m.places.splice(i, 1);
        mark();
      } }), h('span', { text: s[1] })]);
    }));
  }
  function doSave() {
    var m = S.model;
    try {
      if (m.t === 'QUESTS') { saveEntry('QUESTS', m.id, questBuild(m)); }
      else {
        /* 공통 사건은 아무 조건 없이 어디서나 나오는 것만 */
        if (m.t === 'EVENTS' && m.places.some(function (x) { return x.indexOf('common:') === 0; }) && (m.y0 || m.y1 || m.needTag.trim()))
          throw new Error('공통 사건에는 시기·필요한 태그 조건을 넣을 수 없습니다. 조건이 있는 사건은 시대 사건이나 각 거리에 두세요.');
        var r = fromModel(m); saveEntry(m.t, m.id, r.ev, r.align, m.t === 'EVENTS' ? m.places.slice() : undefined); }
      S.dirty = false; S.model = null; render();
      toast('저장했습니다 — 이 브라우저의 게임에 바로 반영됩니다. 폴더에도 남기려면 위의 ‘내보내기 · 저장’.');
    } catch (err) { toast(err.message, true); }
  }
  function doTest() {
    if (S.dirty) { toast('먼저 저장하세요', true); return; }
    var g = window.__iljeGame;
    if (!g || !g.devOpen) { toast('게임을 찾지 못했습니다', true); return; }
    var r = g.devOpen(S.sel.t, S.sel.id);
    if (r !== true) { toast(r || '시험할 수 없습니다', true); return; }
    close();
  }
  function renderEventEdit() {
    var t = S.sel.t, id = S.sel.id;
    if (!TABLES[t][id]) return h('div', { class: 'ijd-card' }, [h('p', { text: '없는 항목입니다: ' + id })]);
    var key = t + ':' + id;
    if (!S.model || S.modelKey !== key) { S.model = t === 'QUESTS' ? questModel(id) : toModel(t, id); S.modelKey = key; S.dirty = false; }
    var m = S.model;
    var head = h('div', { class: 'ijd-eh' }, [
      h('div', {}, [h('div', { class: 'ijd-kick', text: ({ EVENTS: '일반 사건', LINK_EVENTS: '연줄 사건', ALIGN_EVENTS: '타협도 사건', QUEST_EVENTS: '장기 이야기 사건' + (questOfEvent(id) ? ' · ' + QUESTS[questOfEvent(id)].name : ''), QUESTS: '장기 이야기 설정' })[t] }),
        h('div', { class: 'ijd-eid', text: id + (isLocal(t, id) ? '  ● 이 브라우저에서 고침' : (BAKED.tables[t][id] ? '  · 수정본' : '')) })]),
      h('div', { class: 'ijd-row' }, [
        t !== 'QUESTS' ? h('button', { type: 'button', class: 'ijd-btn', onclick: doTest, tip: '진행 중인 게임에서 이 사건을 바로 띄웁니다. 먼저 게임을 시작(탄생)해 두고, 고친 것은 저장한 뒤에 누르세요. 시기·태그 조건은 무시하고 띄웁니다.', text: '▶ 시험해 보기' }) : null,
        isLocal(t, id) ? h('button', { type: 'button', class: 'ijd-btn', onclick: function () {
          if (!S.revArmed) { S.revArmed = true; toast('한 번 더 누르면 이 브라우저에서 고친 내용을 버립니다', true); return; }
          S.revArmed = false; revertEntry(t, id); S.model = null; S.dirty = false; if (!TABLES[t][id]) { S.sel = null; S.view = 'list'; } render(); toast('되돌렸습니다');
        }, text: '고친 것 버리기' }) : null
      ])
    ]);
    var body;
    if (t === 'QUESTS') {
      body = [
        h('div', { class: 'ijd-grid' }, [
          field('이야기 이름', inp(m.name, function (v) { m.name = v; mark(); })),
          field('시작 사건', sel(m.start, Object.keys(QUEST_EVENTS).map(function (e) { return [e, e + ' · ' + QUEST_EVENTS[e].title]; }), function (v) { m.start = v; mark(); })),
          field('일어나는 곳', sel(m.loc, [['', '(시작 사건을 따름)']].concat(Object.keys(LOCS).map(function (l) { return [l, locName(l)]; })), function (v) { m.loc = v; mark(); }))
        ]),
        h('div', { class: 'ijd-grid' }, [
          field('시작 확률', inp(m.startChance, function (v) { m.startChance = v; mark(); }, { inputmode: 'decimal' }), '0.06 = 그 도시에서 한 번 움직일 때 6%'),
          field('이어질 확률', inp(m.followChance, function (v) { m.followChance = v; mark(); }, { inputmode: 'decimal', placeholder: '기본값' }), '다음 단계가 나올 확률'),
          field('시기 (부터)', inp(m.y0, function (v) { m.y0 = v; mark(); }, { inputmode: 'numeric', placeholder: '1910' })),
          field('시기 (까지)', inp(m.y1, function (v) { m.y1 = v; mark(); }, { inputmode: 'numeric', placeholder: '1945' }))
        ]),
        subHead('단계'),
        h('p', { class: 'ijd-hint', text: '사건 선택지의 “이야기 진행 → 단계”에 적은 이름이 여기 단계 이름과 맞으면, 그 단계의 사건이 ‘갈 곳’ 목록에 나타납니다. 갈 곳 이름을 비워 두면 목록에 안 뜨고 바로 찾아옵니다 (복수 등). end_ 로 시작하는 단계는 이야기의 끝입니다.' }),
        h('div', {}, m.stages.map(function (s, i) {
          return h('div', { class: 'ijd-stage' }, [
            h('div', { class: 'ijd-grid' }, [
              field('단계 이름', inp(s.key, function (v) { s.key = v; mark(); }, { autocapitalize: 'off' })),
              field('사건', sel(s.event, [['', '(없음)']].concat(Object.keys(QUEST_EVENTS).map(function (e) { return [e, e + ' · ' + QUEST_EVENTS[e].title]; })), function (v) { s.event = v; mark(); })),
              field('확률', inp(s.chance, function (v) { s.chance = v; mark(); }, { inputmode: 'decimal', placeholder: '기본' })),
              h('button', { type: 'button', class: 'ijd-mini bad', onclick: function () { m.stages.splice(i, 1); mark(); render(); }, text: '✕' })
            ]),
            h('div', { class: 'ijd-grid' }, [
              field('갈 곳 이름', inp(s.place, function (v) { s.place = v; mark(); })),
              field('갈 곳 설명', inp(s.sub, function (v) { s.sub = v; mark(); }), null, true)
            ])
          ]);
        })),
        h('button', { type: 'button', class: 'ijd-btn', onclick: function () { m.stages.push({ key: '', event: '', place: '', sub: '', chance: '', rest: {} }); mark(); render(); }, text: '＋ 단계 추가' }),
        h('details', { class: 'ijd-adv' + (m.rest ? ' has' : '') }, [h('summary', { tip: TIPS['기타 설정 (JSON)'], text: '기타 설정 (JSON)' }), ta(m.rest, function (v) { m.rest = v; mark(); }, { class: 'mono', spellcheck: 'false' })])
      ];
    } else {
      body = [
        h('div', { class: 'ijd-grid' }, [
          field('제목', inp(m.title, function (v) { m.title = v; mark(); })),
          field('종류', sel(m.kind, KINDS, function (v) { m.kind = v; mark(); })),
          field('일어나는 곳', sel(m.loc, [['', t === 'EVENTS' ? '(나온 거리)' : '(정하지 않음)']].concat(Object.keys(LOCS).map(function (l) { return [l, locName(l)]; })), function (v) { m.loc = v; mark(); }))
        ]),
        h('div', { class: 'ijd-grid' }, [
          field('시기 (부터)', inp(m.y0, function (v) { m.y0 = v; mark(); }, { inputmode: 'numeric', placeholder: '1910' })),
          field('시기 (까지)', inp(m.y1, function (v) { m.y1 = v; mark(); }, { inputmode: 'numeric', placeholder: '1945' })),
          field('필요한 태그', inp(m.needTag, function (v) { m.needTag = v; mark(); }, { list: 'ijd-tags', placeholder: '없음 (예: link:press)', autocapitalize: 'off' }))
        ]),
        field('본문', ta(m.text, function (v) { m.text = v; mark(); }, { rows: 6, class: 'ijd-body' }), '{name} = 주인공 이름 · 줄바꿈은 그대로 · 빈 줄로 문단을 나눕니다', true),
        m.fns.length ? h('p', { class: 'ijd-hint', text: '※ 코드로 된 조건(' + m.fns.join(', ') + ')이 있습니다. 편집기로는 바꿀 수 없고 그대로 남습니다.' }) : null,
        t === 'EVENTS' ? h('div', {}, [subHead('나오는 곳'), placeEditor(m), h('p', { class: 'ijd-hint', text: '모두 끄면 게임에 나오지 않습니다 (지워지지는 않음).' })]) : null,
        subHead(m.steps.length ? '선택지 (첫 장면)' : '선택지'),
        h('div', {}, m.options.map(function (o, i) { return optEditor(m, m.options, o, i); })),
        h('button', { type: 'button', class: 'ijd-btn', onclick: function () { m.options.push(newOpt()); mark(); render(); }, text: '＋ 선택지 추가' }),
        stepsEditor(m),
        h('details', { class: 'ijd-adv' + (m.rest ? ' has' : '') }, [h('summary', { tip: TIPS['사건 기타 설정 (JSON)'], text: '사건 기타 설정 (JSON)' + (m.rest ? ' · 있음' : '') }), ta(m.rest, function (v) { m.rest = v; mark(); }, { class: 'mono', spellcheck: 'false', placeholder: '예: { "once": true }' })])
      ];
    }
    return h('div', { class: 'ijd-card' }, [head].concat(body).concat([
      h('div', { class: 'ijd-savebar' }, [h('button', { type: 'button', class: 'ijd-btn main ijd-save' + (S.dirty ? ' dirty' : ''), onclick: doSave, text: '저장 (게임에 바로 반영)' })])
    ]));
  }
  function renderHome() {
    var n = localCount();
    return h('div', { class: 'ijd-card' }, [
      h('h3', { text: '스토리 편집기' }),
      h('p', { text: '왼쪽 목록에서 사건을 골라 고치고 ‘저장’을 누르면, 이 브라우저의 게임에 바로 반영됩니다.' }),
      h('p', { text: '고친 것을 남기려면 위의 ‘내보내기 · 저장’에서 iljechiha 폴더를 고르세요. stories/patch.json 으로 저장되고, Claude 에게 “스토리 고친 거 적용해줘”라고 하면 그 파일을 읽어 claude.ai 판과 GitHub 판에 모두 반영합니다.' }),
      h('ul', {}, [
        h('li', { text: '장기 · ○○ : 여러 단계로 이어지는 이야기 (설정 + 단계별 사건)' }),
        h('li', { text: '도시 · 장소 : 그 거리에서 나오는 일반 사건과 일거리' }),
        h('li', { text: '연줄 · 타협도 : 태생 연줄, 타협도 수치에 따라 찾아오는 사건' }),
        h('li', { text: '효과 쓰는 법: ' + Object.keys(FXK).map(function (k) { return FXK[k]; }).join(' · ') + '  (예: 돈 +10, 감시도 +1)' }),
        h('li', { text: '‘▶ 시험해 보기’ : 진행 중인 게임에서 그 사건을 바로 띄웁니다. 게임을 시작한 뒤 화면 왼쪽 아래 ✎ 단추로 이 탭을 다시 여세요.' }),
        h('li', { text: '‘잠그기’ : ✎ 단추를 숨깁니다. 다시 열려면 메인 화면에서 비밀 명령을 입력합니다.' })
      ]),
      h('p', { class: 'ijd-hint', text: n ? '이 브라우저에서 고친 항목: ' + n + '개' : '이 브라우저에서 고친 항목이 아직 없습니다.' })
    ]);
  }

  /* ═════════ 태생 편집: LIFE_STAGES (단계별 d100 표) · BASE (기본 수치) ═════════ */
  var LIFE_FX = { money: '돈', medkit: '구급약', heat: '감시도', ammo: '탄환' };
  function curLife() { var g = window.__iljeGame; return clone((g && g.state && g.state.life) || LIFE_STAGES); }
  function curBase() { var g = window.__iljeGame; return clone((g && g.state && g.state.base) || BASE); }
  function lineOf(o, names) { return Object.keys(o || {}).map(function (k) { var v = o[k]; return (names[k] || k) + ' ' + (v > 0 ? '+' : '') + v; }).join(', '); }
  function parseLine(s, allowed, what) {
    var o = parseFx(s, what) || {}, bad = Object.keys(o).filter(function (k) { return !allowed[k]; });
    if (bad.length) throw new Error(what + ': 여기에는 ' + Object.keys(allowed).map(function (k) { return allowed[k]; }).join('·') + '만 쓸 수 있습니다');
    return Object.keys(o).length ? o : null;
  }
  function lifeRowModel(e) {
    return { max: String(e.max == null ? '' : e.max), id: e.id || '', name: e.name || '', desc: e.desc || '', special: !!e.special,
      tags: (e.tags || []).join(', '), mod: lineOf(e.mod, STAT_LABEL), fx: lineOf(e.fx, LIFE_FX), flag: e.flag || '',
      rest: restStr(omit(e, ['max', 'id', 'name', 'desc', 'special', 'tags', 'mod', 'fx', 'flag'])) };
  }
  function lifeModel(key) {
    if (key === 'base') {
      var B = curBase();
      var m = { key: 'base', money: String(B.money || 0), medkit: String(B.medkit || 0), ammo: String(B.ammo || 0), stats: {} };
      STAT_KEYS.forEach(function (k) { m.stats[k] = String((B.stats || {})[k] || 0); });
      return m;
    }
    var st = curLife()[key];
    return { key: key, id: st.id, label: st.label || '', times: String(st.times || 1), rolls: st.rolls ? JSON.stringify(st.rolls, null, 2) : '',
      rest: restStr(omit(st, ['id', 'label', 'times', 'rolls', 'table'])), rows: (st.table || []).map(lifeRowModel) };
  }
  function lifeBuild(m) {
    var life = curLife(), base = curBase();
    if (m.key === 'base') {
      var stats = {};
      STAT_KEYS.forEach(function (k) { var v = num(m.stats[k], '기본 ' + STAT_LABEL[k]); if (v < STAT_MIN || v > STAT_MAX) throw new Error('기본 ' + STAT_LABEL[k] + ': ' + STAT_MIN + '~' + STAT_MAX + ' 사이로'); stats[k] = v; });
      base = Object.assign({}, base, { stats: stats, money: num(m.money, '기본 돈'), medkit: num(m.medkit, '기본 구급약'), ammo: num(m.ammo, '기본 탄환') });
      return { life: life, base: base };
    }
    var st = parseRest(m.rest, '단계 · 기타 설정');
    st.id = m.id;
    if (!m.label.trim()) throw new Error('단계 이름을 적어 주세요');
    st.label = m.label;
    var times = num(m.times, '굴림 횟수'); if (times < 1 || times > 20 || times % 1) throw new Error('굴림 횟수: 1~20 사이 정수');
    st.times = times;
    if (m.rolls.trim()) {
      var rl; try { rl = JSON.parse(m.rolls); } catch (err) { throw new Error('굴림 방식: JSON 형식이 맞지 않습니다'); }
      if (!Array.isArray(rl)) throw new Error('굴림 방식: [ … ] 목록으로 적어야 합니다');
      st.rolls = rl;
    }
    if (!m.rows.length) throw new Error('항목이 하나는 있어야 합니다');
    var prev = 0, ids = {};
    st.table = m.rows.map(function (r, i) {
      var what = (i + 1) + '번 항목' + (r.name ? ' “' + r.name + '”' : '');
      var mx = Number(String(r.max).trim());
      if (!String(r.max).trim() || isNaN(mx) || mx % 1 || mx < 1 || mx > 100) throw new Error(what + ': 범위 끝은 1~100 정수');
      if (mx <= prev) throw new Error(what + ': 범위 끝(' + mx + ')이 앞 항목(' + prev + ')보다 커야 합니다 — 위에서 아래로 커지게');
      prev = mx;
      var id = r.id.trim();
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(id)) throw new Error(what + ': id 는 영문으로 시작하고 영문·숫자·_ 만');
      if (ids[id]) throw new Error(what + ': id “' + id + '”가 겹칩니다');
      ids[id] = 1;
      if (!r.name.trim()) throw new Error(what + ': 이름을 적어 주세요');
      var e = parseRest(r.rest, what + ' · 기타');
      e.max = mx;
      if (r.special) e.special = true;
      e.id = id; e.name = r.name; e.desc = r.desc;
      e.tags = r.tags.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
      var mod = parseLine(r.mod, STAT_LABEL, what + ' · 능력치 조정'); if (mod) e.mod = mod;
      var fx = parseLine(r.fx, LIFE_FX, what + ' · 소지품·감시도'); if (fx) e.fx = fx;
      if (r.flag.trim()) e.flag = r.flag.trim();
      return e;
    });
    if (prev !== 100) throw new Error('마지막 항목의 범위 끝은 100이어야 합니다 (지금 ' + prev + ')');
    life[m.key] = st;
    return { life: life, base: base };
  }
  function renderLifeList() {
    var L = curLife();
    var items = [{ key: 'base', title: '기본 수치', sub: '모든 태생이 시작하는 능력치 · 소지품' }].concat(L.map(function (st, i) {
      return { key: i, title: st.label, sub: st.id + ' · ' + (st.table || []).length + '항목' + ((st.times || 1) > 1 ? ' · ' + st.times + '번 굴림' : '') };
    }));
    return h('aside', { class: 'ijd-list' }, [h('div', { class: 'ijd-groups' }, [
      h('div', { class: 'ijd-gh', tip: '탄생할 때 위에서부터 차례로 단계마다 주사위(보통 d100)를 굴려, 나온 숫자가 들어가는 항목의 효과를 더합니다.' }, [h('span', { class: 'ijd-gt', text: '태생 표 (위에서부터 차례로 굴림)' })]),
      h('div', { class: 'ijd-items' }, items.map(function (it) {
        var on = S.lsel === it.key;
        return h('button', { type: 'button', class: 'ijd-it' + (on ? ' on' : ''), onclick: function () { pickLife(it.key); } }, [
          h('span', { class: 'ijd-itt', text: it.title }), h('span', { class: 'ijd-itm', text: it.sub })]);
      }))
    ])]);
  }
  function pickLife(key) {
    if (S.lmodel && S.dirty && S.lsel !== key && !S.leaveArmed) { S.leaveArmed = { life: key }; toast('저장하지 않은 고침이 있습니다. 한 번 더 누르면 버리고 넘어갑니다.', true); return; }
    S.leaveArmed = null; S.lsel = key; S.lmodel = null; S.dirty = false; S.view = 'edit'; editScroll = 0; toast(''); render();
  }
  function lifeBar(rows) {
    var prev = 0;
    return h('div', { class: 'ijd-lbar' }, rows.map(function (r) {
      var mx = Math.max(prev, Math.min(100, Number(r.max) || prev)), w = mx - prev, lo = prev + 1; prev = mx;
      return w > 0 ? h('span', { class: 'ijd-lseg' + (r.special ? ' sp' : ''), style: 'flex:' + w, tip: lo + (w > 1 ? '–' + mx : '') + ' (' + w + '%) · ' + (r.name || '?') }) : null;
    }));
  }
  function rangeText(m, i) {
    var prevMax = i ? Number(m.rows[i - 1].max) || 0 : 0, mx = Number(m.rows[i].max) || 0, w = mx - prevMax;
    return w > 0 ? (prevMax + 1) + (w > 1 ? '–' + mx : '') + ' · ' + w + '%' : '범위 확인';
  }
  function refreshRanges(m) {
    Array.prototype.forEach.call(root.querySelectorAll('.ijd-range'), function (el) { el.textContent = rangeText(m, Number(el.getAttribute('data-i'))); });
    var bar = root.querySelector('.ijd-lbar'); if (bar) bar.replaceWith(lifeBar(m.rows));
  }
  function renderLifeEdit() {
    if (S.lsel == null) return h('div', { class: 'ijd-card' }, [
      h('h3', { text: '태생 편집' }),
      h('p', { text: '왼쪽에서 단계를 골라 d100 표의 항목(범위 · 이름 · 설명 · 능력치 조정 · 태그)을 고칩니다. ‘저장’하면 다음 ‘탄생’부터 바로 적용됩니다.' }),
      h('p', { text: '스토리 편집과 똑같이 ‘내보내기 · 저장’으로 stories/patch.json 에 함께 저장되고, Claude 에게 적용을 부탁하면 게임 파일에 반영됩니다.' }),
      h('p', { class: 'ijd-hint', text: LOCAL.life ? '이 브라우저에서 고친 태생 표가 있습니다.' : '이 브라우저에서 고친 태생 표가 아직 없습니다.' })
    ]);
    if (!S.lmodel) { S.lmodel = lifeModel(S.lsel); S.dirty = false; }
    var m = S.lmodel, body;
    var headRow = h('div', { class: 'ijd-eh' }, [
      h('div', {}, [h('div', { class: 'ijd-kick', text: '태생 편집' }), h('div', { class: 'ijd-eid', text: (m.key === 'base' ? 'BASE' : m.id) + (LOCAL.life ? '  ● 이 브라우저에서 고친 태생 표' : (BAKED.life ? '  · 수정본' : '')) })]),
      LOCAL.life ? h('button', { type: 'button', class: 'ijd-btn', tip: '이 브라우저에서 고친 태생 표 전체를 버리고, 반영된 수정본(없으면 원래 것)으로 되돌립니다.', onclick: function () {
        if (!S.revArmed) { S.revArmed = true; toast('한 번 더 누르면 이 브라우저에서 고친 태생 표 전체를 버립니다', true); return; }
        S.revArmed = false; revertLife(); S.lmodel = null; S.dirty = false; render(); toast('되돌렸습니다');
      }, text: '고친 것 버리기' }) : null
    ]);
    if (m.key === 'base') {
      body = [h('h3', { text: '기본 수치' }),
        h('p', { class: 'ijd-hint', text: '모든 사람이 이 값에서 시작해, 단계마다 굴린 항목의 조정치를 더합니다. 능력치는 마지막에 ' + STAT_MIN + '~' + STAT_MAX + ' 로 잘립니다.' }),
        h('div', { class: 'ijd-grid' }, STAT_KEYS.map(function (k) { return field(STAT_LABEL[k], inp(m.stats[k], function (v) { m.stats[k] = v; mark(); }, { inputmode: 'numeric' })); })),
        h('div', { class: 'ijd-grid' }, [
          field('시작 돈', inp(m.money, function (v) { m.money = v; mark(); }, { inputmode: 'numeric' })),
          field('시작 구급약', inp(m.medkit, function (v) { m.medkit = v; mark(); }, { inputmode: 'numeric' })),
          field('시작 탄환', inp(m.ammo, function (v) { m.ammo = v; mark(); }, { inputmode: 'numeric' }))])];
    } else {
      body = [
        h('div', { class: 'ijd-grid' }, [
          field('태생 단계 이름', inp(m.label, function (v) { m.label = v; mark(); })),
          field('굴림 횟수', inp(m.times, function (v) { m.times = v; mark(); }, { inputmode: 'numeric' }))]),
        h('details', { class: 'ijd-adv' + (m.rolls ? ' has' : '') }, [h('summary', { tip: TIPS['굴림 방식'], text: '굴림 방식 (JSON)' + (m.rolls ? ' · 있음' : ' · 없음 = d100') }),
          ta(m.rolls, function (v) { m.rolls = v; mark(); }, { class: 'mono', spellcheck: 'false', placeholder: '[ { "ifTag": "child:reading", "die": 40, "add": 60 }, { "die": 100 } ]' })]),
        subHead('항목 (d100 범위)'),
        lifeBar(m.rows),
        h('div', {}, m.rows.map(function (r, i) {
          var prevMax = i ? Number(m.rows[i - 1].max) || 0 : 0, mx = Number(r.max) || 0, w = mx - prevMax;
          var move = function (d) { var j = i + d; if (j < 0 || j >= m.rows.length) return; var a = m.rows[i]; m.rows[i] = m.rows[j]; m.rows[j] = a; mark(); render(); };
          return h('div', { class: 'ijd-opt' + (r.special ? ' ijd-sp' : '') }, [
            h('div', { class: 'ijd-oh' }, [
              h('span', { class: 'ijd-range', 'data-i': String(i), tip: '주사위가 이 범위에서 나오면 이 항목이 됩니다. 범위는 앞 항목의 끝 다음 숫자부터 ‘범위 끝’까지입니다.', text: rangeText(m, i) }),
              inp(r.name, function (v) { r.name = v; mark(); }, { class: 'ijd-olab', placeholder: '항목 이름' }),
              h('button', { type: 'button', class: 'ijd-mini', tip: '위로 올립니다 (범위 끝 숫자도 맞춰 고쳐야 합니다)', onclick: function () { move(-1); }, text: '↑' }),
              h('button', { type: 'button', class: 'ijd-mini', tip: '아래로 내립니다 (범위 끝 숫자도 맞춰 고쳐야 합니다)', onclick: function () { move(1); }, text: '↓' }),
              h('button', { type: 'button', class: 'ijd-mini bad', tip: '이 항목을 지웁니다 (두 번 눌러야 지워짐). 빈 범위는 다음 항목이 넘겨받습니다.', onclick: function () { if (r._del) { m.rows.splice(i, 1); mark(); render(); } else { r._del = true; toast('한 번 더 누르면 “' + r.name + '” 항목을 지웁니다', true); } }, text: '✕' })
            ]),
            h('div', { class: 'ijd-grid' }, [
              field('범위 끝', inp(r.max, function (v) { r.max = v; mark(); refreshRanges(m); }, { inputmode: 'numeric' })),
              field('항목 id', inp(r.id, function (v) { r.id = v; mark(); }, { autocapitalize: 'off', spellcheck: 'false' })),
              h('label', { class: 'ijd-f ijd-chk' }, [h('input', { type: 'checkbox', checked: r.special, onchange: function (e) { r.special = e.target.checked; mark(); render(); } }), h('span', { class: 'has-tip', tip: TIPS['특별 태생'], text: '특별 태생' })])
            ]),
            field('설명', ta(r.desc, function (v) { r.desc = v; mark(); }, { rows: 2 }), null, true),
            h('div', { class: 'ijd-grid' }, [
              field('능력치 조정', inp(r.mod, function (v) { r.mod = v; mark(); }, { placeholder: '예: 근력 +5, 지능 -3' })),
              field('소지품·감시도', inp(r.fx, function (v) { r.fx = v; mark(); }, { placeholder: '예: 돈 +10, 감시도 +1' }))
            ]),
            h('div', { class: 'ijd-grid' }, [
              field('태그', inp(r.tags, function (v) { r.tags = v; mark(); }, { placeholder: '쉼표로 구분: city, lang:ja', autocapitalize: 'off', spellcheck: 'false' })),
              field('표식', inp(r.flag, function (v) { r.flag = v; mark(); }, { placeholder: '없음', autocapitalize: 'off', spellcheck: 'false' }))
            ]),
            h('details', { class: 'ijd-adv' + (r.rest ? ' has' : '') }, [h('summary', { tip: TIPS['기타 설정 (JSON)'], text: '기타 설정 (JSON)' + (r.rest ? ' · 있음' : '') }),
              ta(r.rest, function (v) { r.rest = v; mark(); }, { class: 'mono', rows: 2, spellcheck: 'false' })])
          ]);
        })),
        h('button', { type: 'button', class: 'ijd-btn', tip: '맨 아래에 새 항목을 붙입니다. 범위가 1~100 을 빈틈없이 나누도록 앞 항목들의 ‘범위 끝’을 함께 고치세요.', onclick: function () {
          var last = m.rows[m.rows.length - 1];
          if (last && Number(last.max) === 100) last.max = '99';
          m.rows.push({ max: '100', id: 'new' + (m.rows.length + 1), name: '새 항목', desc: '', special: false, tags: '', mod: '', fx: '', flag: '', rest: '' });
          mark(); render();
        }, text: '＋ 항목 추가' }),
        h('details', { class: 'ijd-adv' + (m.rest ? ' has' : '') }, [h('summary', { text: '단계 기타 설정 (JSON)' }), ta(m.rest, function (v) { m.rest = v; mark(); }, { class: 'mono', spellcheck: 'false' })])
      ];
    }
    return h('div', { class: 'ijd-card' }, [headRow].concat(body).concat([
      h('div', { class: 'ijd-savebar' }, [h('button', { type: 'button', class: 'ijd-btn main ijd-save' + (S.dirty ? ' dirty' : ''), onclick: function () {
        try { saveLife(lifeBuild(S.lmodel)); S.dirty = false; S.lmodel = null; render(); toast('저장했습니다 — 다음 ‘탄생’부터 바로 적용됩니다. 폴더에도 남기려면 위의 ‘내보내기 · 저장’.'); }
        catch (err) { toast(err.message, true); }
      }, text: '저장 (다음 탄생부터 반영)' })])
    ]));
  }

  /* ── 내보내기 · 저장 ── */
  function idb(fn) {
    return new Promise(function (res, rej) {
      var rq = indexedDB.open('ilje-dev', 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore('h'); };
      rq.onerror = function () { rej(rq.error); };
      rq.onsuccess = function () { var tx = rq.result.transaction('h', 'readwrite'); var r = fn(tx.objectStore('h')); tx.oncomplete = function () { res(r && r.result); }; tx.onerror = function () { rej(tx.error); }; };
    });
  }
  function saveToFolder() {
    var text = JSON.stringify(fullPatch(), null, 1);
    var pick = function () { return window.showDirectoryPicker({ id: 'iljechiha', mode: 'readwrite' }); };
    var getDir = function () {
      return idb(function (st) { return st.get('dir'); }).catch(function () { return null; }).then(function (d) {
        if (!d || !d.queryPermission) return pick();
        return d.queryPermission({ mode: 'readwrite' }).then(function (p) { return p === 'granted' ? p : d.requestPermission({ mode: 'readwrite' }); })
          .then(function (p) { return p === 'granted' ? d : pick(); }).catch(function () { return pick(); });
      });
    };
    return getDir().then(function (dir) {
      return dir.getFileHandle('build.py').then(function () { return dir; }, function () { throw new Error('고른 폴더에 build.py 가 없습니다. iljechiha 폴더(D:\\일제강점기 텍스트 rpg\\iljechiha)를 골라 주세요.'); });
    }).then(function (dir) {
      idb(function (st) { return st.put(dir, 'dir'); }).catch(function () {});
      return dir.getDirectoryHandle('stories', { create: true });
    }).then(function (sd) { return sd.getFileHandle('patch.json', { create: true }); })
      .then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(text).then(function () { return w.close(); }); });
  }
  /* claude.ai 화면 안(다른 사이트의 iframe)인지: 이때는 폴더 선택 창이 막힌다 */
  function inFrame() { try { return window.self !== window.top; } catch (err) { return true; } }
  /* claude.ai 판의 기능(저장소 db · 내려받기)을 쓸 수 있으면 그 이름공간, 아니면 null */
  function cap(name) {
    var c = window.claude;
    if (!c || typeof c.use !== 'function') return Promise.resolve(null);
    return Promise.resolve(c.use(name)).catch(function () { return null; });
  }
  /* Claude 에게 보내기: 아티팩트의 db 문서 devtool/patch 에 수정본을 넣는다 (Claude 가 바로 읽음) */
  function sendToClaude() {
    var p = fullPatch(), text = JSON.stringify(p);
    if (text.length > 240000) return Promise.reject(new Error('수정본이 너무 큽니다 (' + Math.round(text.length / 1024) + 'KB). ‘복사’로 대화창에 붙여 넣어 주세요.'));
    return cap('db').then(function (db) {
      if (!db) throw new Error('이 화면에서는 보낼 수 없습니다');
      return db.doc('devtool/patch').set({ json: text, saved: p.saved, count: localCount() });
    });
  }
  function download() {
    var text = JSON.stringify(fullPatch(), null, 1);
    if (inFrame()) {
      return cap('downloads').then(function (dl) {
        if (!dl) throw new Error('이 화면에서는 파일을 받을 수 없습니다');
        return dl.save({ filename: 'patch.json', data: text });
      });
    }
    var a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: 'patch.json' });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return Promise.resolve({ status: 'saved' });
  }
  function renderSheet() {
    var text = JSON.stringify(fullPatch(), null, 1), n = localCount();
    var framed = inFrame(), canFolder = typeof window.showDirectoryPicker === 'function' && !framed;
    var canSend = !!(window.claude && typeof window.claude.use === 'function');
    var out = h('textarea', { class: 'mono ijd-out', readonly: true, value: text, rows: 8, onfocus: function (e) { e.target.select(); } });
    var imp = h('textarea', { class: 'mono ijd-out', rows: 4, placeholder: '여기에 patch.json 내용을 붙여 넣고 ‘불러오기’' });
    return h('div', { class: 'ijd-sheet', onclick: function (e) { if (e.target.classList.contains('ijd-sheet')) { S.sheet = null; render(); } } }, [h('div', { class: 'ijd-card ijd-sheetbox' }, [
      h('h3', { text: '내보내기 · 저장' }),
      h('p', { text: '이 브라우저에서 고친 항목 ' + n + '개 + 이미 반영된 수정본 = 전체 수정본(patch.json)을 저장합니다.' }),
      h('div', { class: 'ijd-row' }, [
        canFolder ? h('button', { type: 'button', class: 'ijd-btn main', onclick: function () {
          toast('저장하는 중…');
          saveToFolder().then(function () { toast('폴더에 저장했습니다: stories/patch.json — Claude 에게 “스토리 고친 거 적용해줘”라고 하세요.'); }, function (err) { toast(err && err.name === 'AbortError' ? '취소했습니다' : '폴더 저장 실패: ' + ((err && err.message) || err) + ' — 아래 ‘파일로 받기’나 ‘복사’를 쓰세요.', true); });
        }, text: '📁 iljechiha 폴더에 저장' }) : null,
        canSend ? h('button', { type: 'button', class: 'ijd-btn main', tip: '수정본을 이 게임(claude.ai 판)의 저장소에 넣어 둡니다. Claude 가 바로 읽어 게임 파일에 반영할 수 있습니다.', onclick: function () {
          toast('보내는 중…');
          sendToClaude().then(function () { toast('Claude 에게 보냈습니다. 대화창에 “스토리 고친 거 적용해줘”라고 하세요.'); }, function (err) { toast('보내기 실패: ' + ((err && (err.message || err.code)) || err) + ' — 아래 ‘복사’를 쓰세요.', true); });
        }, text: '✉ Claude 에게 보내기' }) : null,
        h('button', { type: 'button', class: 'ijd-btn', onclick: function () {
          download().then(function (r) { toast(r && r.status === 'delivered' ? '보냈습니다.' : 'patch.json 을 받았습니다. iljechiha\\stories 폴더에 넣어 주세요.'); },
            function (err) { toast(err && err.code === 'declined' ? '취소했습니다' : '받기 실패: ' + ((err && (err.message || err.code)) || err) + ' — 아래 ‘복사’를 쓰세요', true); });
        }, text: '⬇ 파일로 받기' }),
        h('button', { type: 'button', class: 'ijd-btn', onclick: function () {
          var ok = function () { toast('복사했습니다. Claude 대화창에 붙여 넣어도 됩니다.'); };
          var fb = function () { out.focus(); out.select(); try { document.execCommand('copy'); ok(); } catch (err) { toast('자동 복사가 막혔습니다. 아래 글을 직접 전체 선택해 복사하세요.', true); } };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fb); else fb();
        }, text: '⧉ 복사' })
      ]),
      canFolder ? h('p', { class: 'ijd-hint', text: '처음 한 번은 폴더를 고르는 창이 뜹니다. D:\\일제강점기 텍스트 rpg\\iljechiha 를 고르고 ‘편집 허용’을 누르세요. 다음부터는 그 폴더에 바로 저장됩니다.' })
        : h('p', { class: 'ijd-hint', text: framed ? 'claude.ai 안에서는 브라우저가 폴더 선택 창을 막아 폴더에 바로 저장할 수 없습니다. ‘✉ Claude 에게 보내기’를 누른 뒤 대화창에 “스토리 고친 거 적용해줘”라고 하세요.' : '이 브라우저에서는 폴더에 바로 저장할 수 없습니다 (크롬·엣지가 아님). ‘파일로 받기’나 ‘복사’를 쓰세요.' }),
      out,
      h('h4', { text: '불러오기' }),
      imp,
      h('div', { class: 'ijd-row' }, [
        h('button', { type: 'button', class: 'ijd-btn', onclick: function () {
          try { var p = JSON.parse(imp.value); if (!p || !p.tables) throw new Error(); importPatch(p); S.model = null; S.sheet = null; render(); toast('불러왔습니다'); }
          catch (err) { toast('patch.json 형식이 아닙니다', true); }
        }, text: '불러오기 (이 브라우저의 고침을 바꿈)' }),
        n ? h('button', { type: 'button', class: 'ijd-btn bad', onclick: function () {
          if (!S.clearArmed) { S.clearArmed = true; toast('한 번 더 누르면 이 브라우저에서 고친 ' + n + '개를 모두 버립니다 (폴더에 저장한 파일은 그대로)', true); return; }
          S.clearArmed = false; revertAll(); S.model = null; S.sheet = null; render(); toast('모두 버렸습니다');
        }, text: '이 브라우저의 고침 모두 버리기' }) : null,
        h('button', { type: 'button', class: 'ijd-btn', onclick: function () { S.sheet = null; render(); }, text: '닫기' })
      ])
    ])]);
  }

  /* ── 틀 ── */
  function render() {
    if (!S.open) { if (root) { root.remove(); root = null; } return; }
    var ed = root && root.querySelector('.ijd-edit');
    if (ed) editScroll = ed.scrollTop;
    var listEl = root && root.querySelector('.ijd-groups');
    var listScroll = listEl ? listEl.scrollTop : 0;
    if (!root) { root = h('div', { class: 'ijd', role: 'dialog', 'aria-label': '개발자 탭' }); document.body.appendChild(root); wireTips(root); }
    hideTip(); tipEl = null;
    root.innerHTML = '';
    var n = localCount();
    root.appendChild(h('style', { text: CSS }));
    root.appendChild(h('datalist', { id: 'ijd-fights' }, Object.keys(ENCOUNTERS).concat(Object.keys(ENEMIES)).map(function (k) { return h('option', { value: k, label: (ENEMIES[k] && ENEMIES[k].name) || (ENCOUNTERS[k] && ENCOUNTERS[k].name) || k }); })));
    var tags = {}; [EVENTS, LINK_EVENTS, QUEST_EVENTS].forEach(function (P) { Object.keys(P).forEach(function (e) { if (P[e].needTag) tags[P[e].needTag] = 1; }); });
    root.appendChild(h('datalist', { id: 'ijd-tags' }, Object.keys(tags).sort().map(function (k) { return h('option', { value: k }); })));
    root.appendChild(h('header', { class: 'ijd-bar' }, [
      h('button', { type: 'button', class: 'ijd-btn ijd-back' + (S.view === 'edit' ? ' on' : ''), onclick: function () { S.view = 'list'; render(); }, text: '← 목록' }),
      h('div', { class: 'ijd-tt' }, [h('b', { text: '개발자 탭' })]),
      h('div', { class: 'ijd-modes', role: 'tablist' }, [['story', '스토리 편집'], ['life', '태생 편집']].map(function (md) {
        return h('button', { type: 'button', role: 'tab', 'aria-selected': S.mode === md[0] ? 'true' : 'false', class: 'ijd-mode' + (S.mode === md[0] ? ' on' : ''), tip: TIPS[md[1]], onclick: function () {
          if (S.mode === md[0]) return;
          if (S.dirty && !S.leaveArmed) { S.leaveArmed = { mode: md[0] }; toast('저장하지 않은 고침이 있습니다. 한 번 더 누르면 버리고 넘어갑니다.', true); return; }
          S.leaveArmed = null; S.dirty = false; S.model = null; S.lmodel = null; S.mode = md[0]; S.view = 'list'; editScroll = 0; toast(''); render();
        }, text: md[1] });
      })),
      h('button', { type: 'button', class: 'ijd-btn', onclick: function () { S.sheet = 'export'; render(); }, text: '내보내기 · 저장' + (n ? ' (' + n + ')' : '') }),
      h('button', { type: 'button', class: 'ijd-btn', onclick: lock, tip: '구석의 ✎ 단추를 숨깁니다. 다시 열려면 메인 화면에서 비밀 명령을 입력하세요.', text: '잠그기' }),
      h('button', { type: 'button', class: 'ijd-btn', onclick: close, text: '닫기' })
    ]));
    root.appendChild(h('div', { class: 'ijd-toast' + (S.toast ? ' on' : '') + (S.toastBad ? ' bad' : ''), text: S.toast, onclick: function () { toast(''); } }));
    var life = S.mode === 'life';
    var main = h('main', { class: 'ijd-edit' }, [life ? renderLifeEdit() : S.newFor ? renderNew() : S.sel ? renderEventEdit() : renderHome()]);
    root.appendChild(h('div', { class: 'ijd-main view-' + S.view }, [life ? renderLifeList() : renderList(), main]));
    if (S.sheet) root.appendChild(renderSheet());
    main.scrollTop = editScroll;
    var g2 = root.querySelector('.ijd-groups'); if (g2) g2.scrollTop = listScroll;
  }
  /* 한 번 연 브라우저에서는 화면 구석에 작은 ✎ 단추가 남아, 게임 중에도 바로 열 수 있다 ('잠그기'로 숨김) */
  var FLAG = 'ilje.dev.on', fab = null;
  function unlocked() { try { return window.localStorage.getItem(FLAG) === '1'; } catch (err) { return false; } }
  function showFab() {
    if (fab || !unlocked() || !document.body) return;
    fab = h('button', { type: 'button', class: 'ijd-fab', title: '개발자 탭', 'aria-label': '개발자 탭 열기', onclick: function () { open(); }, text: '✎' });
    fab.appendChild(h('style', { text: '.ijd-fab{position:fixed;left:8px;bottom:8px;z-index:2147482999;width:34px;height:34px;border-radius:50%;border:1.5px solid #1E1B16;background:#F6EFDF;color:#1E1B16;font-size:16px;line-height:1;opacity:.55;cursor:pointer;padding:0}.ijd-fab:hover{opacity:1}' }));
    document.body.appendChild(fab);
  }
  function lock() {
    try { window.localStorage.removeItem(FLAG); } catch (err) {}
    if (fab) { fab.remove(); fab = null; }
    close();
  }
  function open() {
    try { window.localStorage.setItem(FLAG, '1'); } catch (err) {}
    S.open = true; if (!S.sel && !S.newFor) S.view = 'list'; render();
    if (fab) fab.style.display = 'none';
  }
  function close() { hideTip(); S.open = false; S.sheet = null; render(); showFab(); if (fab) fab.style.display = ''; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showFab); else showFab();

  /* ───── 비밀 명령 ───── */
  function onTitle() { var g = window.__iljeGame; return !!(g && g.state && g.state.screen === 'title'); }
  var buf = '';
  var SHIFT_DIGIT = { Digit1: '!', Digit2: '@', Digit3: '#', Digit4: '$', Digit5: '%', Digit6: '^', Digit7: '&', Digit8: '*', Digit9: '(', Digit0: ')' };
  function keyChar(e) {
    if (e.key && e.key.length === 1 && e.key.charCodeAt(0) < 128) return e.key;
    /* 한글 입력 상태여도 자판 위치로 영문을 읽는다 */
    var c = e.code || '';
    if (/^Key[A-Z]$/.test(c)) { var ch = c.slice(3); return e.shiftKey ? ch : ch.toLowerCase(); }
    if (/^Digit\d$/.test(c)) return e.shiftKey ? SHIFT_DIGIT[c] : c.slice(5);
    return '';
  }
  document.addEventListener('keydown', function (e) {
    if (S.open || !onTitle()) { buf = ''; return; }
    var tg = e.target && e.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA') return;
    var ch = keyChar(e);
    if (!ch) return;
    buf = (buf + ch).slice(-40);
    for (var n = 8; n <= buf.length; n++) if (passOk(buf.slice(-n))) { buf = ''; open(); return; }
  }, true);
  /* 휴대폰: 제목 그림을 길게 누르면 입력 칸 */
  var lp = null;
  function isLogo(t) { return t && t.closest && t.closest('img[alt^="日帝治下"]'); }
  document.addEventListener('pointerdown', function (e) {
    if (S.open || !onTitle() || !isLogo(e.target)) return;
    clearTimeout(lp);
    lp = setTimeout(askPass, 900);
  }, true);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { document.addEventListener(n, function () { clearTimeout(lp); }, true); });
  document.addEventListener('contextmenu', function (e) { if (onTitle() && isLogo(e.target)) e.preventDefault(); }, true);
  function askPass() {
    if (document.querySelector('.ijd-pass')) return;
    var box, input = h('input', { type: 'password', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: '', class: 'ijd-pi' });
    var done = function () { box.remove(); };
    var go = function () { var v = input.value; done(); if (passOk(v)) open(); };
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); if (e.key === 'Escape') done(); });
    box = h('div', { class: 'ijd-pass', onclick: function (e) { if (e.target === box) done(); } }, [h('style', { text: CSS }), h('div', { class: 'ijd-pbox' }, [input, h('button', { type: 'button', class: 'ijd-btn main', onclick: go, text: '확인' })])]);
    document.body.appendChild(box);
    setTimeout(function () { input.focus(); }, 30);
  }

  var CSS = [
    '.ijd{position:fixed;inset:0;z-index:2147483000;background:#E9E0CC;color:#1E1B16;display:flex;flex-direction:column;font-family:"Nanum Myeongjo",serif;font-size:15px;line-height:1.55}',
    '.ijd *{box-sizing:border-box}',
    '.ijd-bar{flex:none;display:flex;align-items:center;gap:8px;padding:10px 14px;background:#1E1B16;color:#F6EFDF;flex-wrap:wrap}',
    '.ijd-tt{flex:1;min-width:120px;font-size:16px}.ijd-tt span{opacity:.7}',
    '.ijd-bar .ijd-btn{background:#2E2A22;color:#F6EFDF;border-color:#6B604E}',
    '.ijd-back{display:none}',
    '.ijd-main{flex:1;min-height:0;display:flex}',
    '.ijd-list{width:330px;flex:none;display:flex;flex-direction:column;border-right:1.5px solid #1E1B16;background:#F1E9D6;min-height:0}',
    '.ijd-search{margin:10px;padding:9px 10px;border:1.5px solid #1E1B16;background:#FBF7EE;font:inherit;font-size:14px}',
    '.ijd-groups{flex:1;overflow-y:auto;padding:0 6px 20px}',
    '.ijd-gh{display:flex;width:100%;align-items:center;gap:4px;padding:8px 8px;margin-top:4px;background:none;border:0;border-bottom:1px solid #CDBF9F;font:inherit;font-weight:800;font-size:14px;text-align:left;cursor:pointer;color:#1E1B16}',
    '.ijd-gh.add{color:#9E2B20}.ijd-gt{flex:1}.ijd-gc{font-size:12px;color:#6B604E;font-weight:400}',
    '.ijd-items{display:flex;flex-direction:column;padding:2px 0 6px 10px}',
    '.ijd-it{position:relative;display:flex;flex-direction:column;align-items:flex-start;padding:6px 22px 6px 8px;background:none;border:0;border-left:3px solid transparent;font:inherit;text-align:left;cursor:pointer;color:#1E1B16}',
    '.ijd-it:hover{background:#FBF7EE}.ijd-it.on{background:#FBF7EE;border-left-color:#9E2B20}.ijd-it.add .ijd-itt{color:#9E2B20;font-size:13px}',
    '.ijd-itt{font-size:14px}.ijd-itm{font-size:11.5px;color:#6B604E;font-family:"Nanum Gothic Coding",monospace}',
    '.ijd-dot{position:absolute;right:6px;top:8px;color:#9E2B20;font-size:11px}',
    '.ijd-edit{flex:1;min-width:0;overflow-y:auto;padding:16px}',
    '.ijd-card{max-width:900px;margin:0 auto;background:#F6EFDF;border:1.5px solid #1E1B16;padding:18px;display:flex;flex-direction:column;gap:12px}',
    '.ijd-card h3{margin:0;font-family:"Song Myung",serif;font-weight:400;font-size:22px}.ijd-card h4{margin:10px 0 0;font-size:15px;border-bottom:1.5px solid #1E1B16;padding-bottom:4px}',
    '.ijd-card p,.ijd-card ul{margin:0}.ijd-card li{margin:3px 0}',
    '.ijd-eh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}',
    '.ijd-kick{font-size:12.5px;letter-spacing:.12em;color:#9E2B20;font-weight:800}.ijd-eid{font-family:"Nanum Gothic Coding",monospace;font-size:13px;color:#6B604E}',
    '.ijd-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.ijd-grid{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start}.ijd-grid>.ijd-f{flex:1 1 150px}',
    '.ijd-f{display:flex;flex-direction:column;gap:3px;min-width:0}.ijd-wide{flex-basis:100%!important}',
    '.ijd-fl{font-size:12.5px;font-weight:800;color:#3A342B}.ijd-hint{font-size:12.5px;color:#6B604E}',
    '.ijd input[type=text],.ijd input[type=search],.ijd input:not([type]),.ijd select,.ijd textarea{width:100%;padding:7px 9px;border:1.5px solid #8F8268;background:#FFFDF7;font:inherit;font-size:14.5px;color:#1E1B16;border-radius:0}',
    '.ijd input:focus,.ijd select:focus,.ijd textarea:focus{outline:2px solid #2C4A5C;outline-offset:0;border-color:#2C4A5C}',
    '.ijd textarea{resize:vertical;line-height:1.6;overflow:hidden}.ijd textarea.ijd-body{min-height:140px;font-size:15.5px}',
    '.ijd .mono,.ijd textarea.mono{font-family:"Nanum Gothic Coding",monospace;font-size:13px;overflow:auto}',
    '.ijd-chk{flex-direction:row!important;align-items:center;gap:6px;flex:0 0 auto!important;padding-bottom:8px;font-size:13px}',
    '.ijd-opt{border:1.5px solid #1E1B16;background:#FBF7EE;padding:12px;display:flex;flex-direction:column;gap:10px;margin-bottom:12px}',
    '.ijd-oh{display:flex;gap:6px;align-items:center}.ijd-on{flex:none;width:28px;height:28px;border:1.5px solid #1E1B16;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Song Myung",serif}',
    '.ijd-olab{flex:1;font-weight:800}',
    '.ijd-res{border-left:3px solid #CDBF9F;padding-left:10px;display:flex;flex-direction:column;gap:8px}.ijd-rl{font-size:12.5px;font-weight:800;color:#2C4A5C;letter-spacing:.08em}',
    '.ijd-stage{border:1px dashed #8F8268;padding:10px;margin-bottom:8px;display:flex;flex-direction:column;gap:8px}',
    '.ijd-places{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:4px 12px}.ijd-pl{display:flex;gap:6px;align-items:center;font-size:13.5px}',
    '.ijd-adv summary{cursor:pointer;font-size:12.5px;color:#6B604E}.ijd-adv.has summary{color:#9E2B20}.ijd-adv textarea{margin-top:6px}',
    '.ijd-btn{padding:7px 13px;border:1.5px solid #1E1B16;background:#FBF7EE;color:#1E1B16;font:inherit;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap}',
    '.ijd-btn:hover{filter:brightness(1.05)}.ijd-btn.main{background:#1E1B16;color:#F6EFDF}.ijd-btn.bad{color:#9E2B20;border-color:#9E2B20}',
    '.ijd-grid>.ijd-mini{margin-top:22px}.ijd-chk{margin-top:24px}.ijd-mini{flex:none;width:30px;height:30px;border:1.5px solid #8F8268;background:#FFFDF7;font:inherit;cursor:pointer;color:#1E1B16}.ijd-mini.bad{color:#9E2B20}',
    '.ijd-link{align-self:flex-start;background:none;border:0;color:#6B604E;text-decoration:underline;font:inherit;font-size:12.5px;cursor:pointer;padding:0}',
    '.ijd-savebar{position:sticky;bottom:-16px;margin:0 -18px -18px;padding:12px 18px;background:#F6EFDF;border-top:1.5px solid #1E1B16;display:flex;justify-content:flex-end}',
    '.ijd-save.dirty{background:#9E2B20;border-color:#9E2B20}',
    '.ijd-toast{display:none;padding:8px 14px;background:#2C4A5C;color:#F6EFDF;font-size:14px;cursor:pointer}.ijd-toast.on{display:block}.ijd-toast.bad{background:#9E2B20}',
    '.ijd-sheet{position:absolute;inset:0;background:rgba(30,27,22,.55);display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto}',
    '.ijd-sheetbox{width:100%;max-width:760px}.ijd-out{max-height:220px}',
    '.ijd-modes{display:flex;gap:0;border:1.5px solid #6B604E}.ijd-mode{padding:7px 13px;border:0;background:#2E2A22;color:#CFC4AE;font:inherit;font-size:14px;font-weight:800;cursor:pointer}.ijd-mode.on{background:#F6EFDF;color:#1E1B16}',
    '.ijd-lbar{display:flex;height:16px;border:1.5px solid #1E1B16;background:#FFFDF7}.ijd-lseg{border-right:1px solid #1E1B16;background:#D9CDB2}.ijd-lseg:nth-child(2n){background:#C7B894}.ijd-lseg.sp{background:#9E2B20}.ijd-lseg:last-child{border-right:0}',
    '.ijd-range{flex:none;min-width:86px;padding:4px 8px;border:1.5px solid #1E1B16;font-family:"Nanum Gothic Coding",monospace;font-size:12.5px;text-align:center;background:#FFFDF7}.ijd-sp{background:#F3E6C4}',
    '.ijd-tipbox{position:fixed;z-index:2147483002;max-width:320px;padding:8px 11px;background:#1E1B16;color:#F6EFDF;font-family:"Nanum Myeongjo",serif;font-size:13px;line-height:1.55;box-shadow:0 4px 14px rgba(0,0,0,.25);pointer-events:none;white-space:pre-line;display:none}',
    '.ijd .has-tip{text-decoration:underline dotted #8F8268;text-underline-offset:3px;cursor:help}',
    '.ijd-alt{border:1.5px dashed #7E5A12;background:#F7EEDC;padding:10px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px}',
    '.ijd-step{border:1.5px dashed #2C4A5C;padding:12px;margin-bottom:12px;display:flex;flex-direction:column;gap:10px;background:#F1EDE2}',
    '.ijd-pass{position:fixed;inset:0;z-index:2147483001;background:rgba(30,27,22,.5);display:flex;align-items:center;justify-content:center;padding:16px}',
    '.ijd-pbox{display:flex;gap:8px;background:#F6EFDF;border:1.5px solid #1E1B16;padding:14px;width:100%;max-width:340px}',
    '.ijd-pi{flex:1;min-width:0;padding:9px;border:1.5px solid #1E1B16;font-size:16px;background:#FFFDF7}',
    '@media (max-width:820px){.ijd-list{width:100%;border-right:0}.ijd-main.view-edit .ijd-list{display:none}.ijd-main.view-list .ijd-edit{display:none}.ijd-main.view-edit .ijd-edit{padding:10px}',
    '.ijd-back.on{display:inline-block}.ijd-mode{padding:6px 9px;font-size:13px}.ijd-tt span{display:none}.ijd-bar{padding:8px 10px;gap:6px}.ijd-bar .ijd-btn{padding:6px 9px;font-size:13px}.ijd-card{padding:12px}.ijd-savebar{margin:0 -12px -12px;padding:10px 12px;bottom:-10px}.ijd-edit{padding:10px}}',
  ].join('\n');

  api.open = open; api.close = close;
  return api;
})();
