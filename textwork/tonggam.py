# 『망국통감』 — 흩어진 원고 모으기(순서 자유) · 원고 뭉치를 몸에 지님(검문 위험) · 세 갈래 출판 · 압수되면 처음부터
Q = {"name": "『망국통감』 편찬", "start": "qt_start", "startChance": 0.06, "years": [1910, 1919], "loc": "bukchon", "followChance": 0.1,
 "stages": {
  "yun": {"event": "qt_yun", "place": "윤 진사의 조각보", "sub": "보자기 주인이 사람을 보냈다"},
  "collect": {"event": "qt_collect", "place": "흩어진 원고", "sub": "원고 조각을 모으거나, 모은 것을 묶는다"},
  "bind": {"event": "qt_bind", "place": "원고를 어디로", "sub": "묶은 원고 뭉치를 품에 지니고 있다 — 검문 조심"},
  "copy": {"event": "qt_copy", "place": "등잔 밑의 필사", "sub": "밤마다 한 부씩 베낀다"},
  "courier": {"event": "qt_courier", "place": "신의주행 첫 기차", "sub": "원고를 품고 경성역 검문을 지나야 한다", "chance": 0.8},
  "seized": {"event": "qt_seized", "place": "빼앗긴 원고", "sub": "원고가 헌병 손에 들어갔다"},
  "printed": {"event": "qt_printed", "place": "상해에서 온 책", "sub": "책이 찍혀 나왔다는 기별"},
  "betray": {"event": "qt_revenge", "place": "", "sub": ""},
  "met": {"event": "qt_yun", "place": "윤 진사의 조각보", "sub": "보자기 주인이 사람을 보냈다"},
  "gather": {"event": "qt_collect", "place": "흩어진 원고", "sub": "원고 조각을 모으거나, 모은 것을 묶는다"},
  "warned": {"event": "qt_collect", "place": "흩어진 원고", "sub": "원고 조각을 모으거나, 모은 것을 묶는다"},
  "late": {"event": "qt_seized", "place": "빼앗긴 원고", "sub": "원고가 헌병 손에 들어갔다"},
  "caught": {"event": "qt_seized", "place": "빼앗긴 원고", "sub": "원고가 헌병 손에 들어갔다"},
  "success": {"event": "qt_printed", "place": "상해에서 온 책", "sub": "책이 찍혀 나왔다는 기별"}
 }}
E = {}
E["qt_start"] = {"title": "불타는 서고", "kind": "quest", "loc": "bukchon",
 "text": "계동 골목 끝 서당 마당에서 연기가 오른다. 헌병 둘이 서고의 책을 한 아름씩 끌어내 마당 한가운데 불더미에 던져 넣는다.\n『대한매일신보』 묶음이, 손으로 베낀 의병 격문이, 붓으로 쓴 일기책이 불길에 말려 들어간다.\n갓을 쓴 늙은 유생이 헌병의 팔에 매달린다. “그건 역사요! 불사를 수는 있어도 없앨 수는 없소!”\n개머리판이 노인의 어깨를 내리친다. 노인이 쓰러지며 품에서 보자기 하나를 떨어뜨린다. 보자기가 당신 발치까지 굴러온다.",
 "options": [
  {"label": "보자기를 몰래 주워 품에 넣는다", "check": {"stat": "agi", "diff": "normal"},
   "ok": {"text": "발로 보자기를 끌어당겨 허리춤에 넣었다. 헌병들은 불길만 보고 있다.\n돌아서는데 쓰러진 노인과 눈이 마주쳤다. 노인이 아주 작게 고개를 끄덕였다.", "fx": {"heat": 1}, "quest": {"id": "tonggam", "stage": "yun", "wait": 3}},
   "ng": {"text": "보자기를 줍는 손을 헌병이 군홧발로 밟는다. “이놈, 그건 뭐냐!”", "fight": "kenpei", "questFight": {"id": "tonggam", "win": "yun", "other": "yun", "wait": 3}}},
  {"label": "불길 속의 일기책을 건져 낸다", "check": {"stat": "con", "diff": "normal"},
   "ok": {"text": "헌병이 등을 돌린 사이 불더미에 손을 넣었다. 손등이 지글거린다. 겉장이 반쯤 탄 공책 한 권을 끌어냈다.\n의병 진중일기다. 싸우다 죽은 이들의 이름이 빼곡하다.\n노인이 보자기를 당신에게 밀어 보내며 속삭인다. “안국동 윤가를 찾으시오.”", "fx": {"hp": -3, "heat": 1}, "tag": "tg_diary", "quest": {"id": "tonggam", "stage": "yun", "wait": 3}},
   "ng": {"text": "불길이 소매로 옮겨붙었다. 바닥을 구르는 사이 공책은 재가 되었다. 헌병들이 웃는다.", "fx": {"hp": -3}}},
  {"label": "헌병에게 보자기를 가리킨다",
   "ok": {"text": "“저기, 저 영감이 뭘 떨어뜨렸습니다.”\n헌병이 보자기를 펼쳐 보고는 불더미에 던진다. 당신 손에 동전 몇 닢이 떨어진다.\n노인이 불길을 보며 소리 없이 운다.", "fx": {"money": 4, "heat": -1}, "quest": {"id": "tonggam", "stage": "betray", "wait": 7}}},
  {"label": "못 본 척 지나간다", "ok": {"text": "고개를 숙이고 골목을 빠져나왔다. 등 뒤로 종이 타는 냄새가 오래 따라왔다.", "quest": {"id": "tonggam", "stage": "end_ignored"}}}
 ]}
E["qt_yun"] = {"title": "윤 진사의 조각보", "kind": "quest", "loc": "bukchon",
 "text": "댕기 머리 아이가 쪽지를 건넨다. 〈보자기 주인이 뵙기를 청하오.〉\n안국동 낡은 기와집 사랑방. 윤 진사가 어깨에 붕대를 감은 채 방바닥에 조각보처럼 종이를 펼쳐 놓았다.\n“을사년부터 경술년까지, 나라가 어떻게 팔려 갔는지 적은 책이오. 『망국통감』이라 이름 지었소. 헌데 원고가 세 갈래로 흩어졌소.”\n그가 손가락을 하나씩 꼽는다.\n“종로 고서점 영감이 숨겨 둔 의병 진중일기. 서대문 감옥에 갇힌 내 제자가 머릿속에 외워 둔 조약 체결의 전말. 그리고 헌병이 압수해 본정 일본인 헌책방에 팔아넘긴 신문철.”\n“다 모으면 좋고, 못 모으면 모은 만큼이라도 책을 묶어야 하오. 나는 이제 바깥 출입을 못 하오.”",
 "options": [
  {"label": "원고 조각을 모으겠다고 한다", "ok": {"text": "“순서는 그대 편한 대로 하오. 다만 하나를 구할 때마다 이리로 가져오시오. 품에 오래 지니면 위험하오.”", "quest": {"id": "tonggam", "stage": "collect", "wait": 1}}},
  {"label": "종이와 먹값만 보탠다", "cost": {"money": 5}, "ok": {"text": "돈을 내려놓자 윤 진사가 한참 당신을 본다. “고맙소. 허나 돈보다 발이 필요하오.”\n결국 제자들 대신 심부름을 맡게 되었다.", "fx": {"edu": 1}, "quest": {"id": "tonggam", "stage": "collect", "wait": 1}}},
  {"label": "발을 뺀다", "ok": {"text": "“제 목숨 하나 건사하기도 버겁습니다.” 보자기를 돌려주고 일어섰다.\n윤 진사는 붙잡지 않았다.", "quest": {"id": "tonggam", "stage": "end_quit"}}}
 ]}
E["qt_collect"] = {"title": "흩어진 원고", "kind": "quest", "loc": "bukchon",
 "text": "윤 진사의 사랑방. 방바닥의 조각보 사이사이가 비어 있다.\n“모은 것은 여기 펼쳐 두었소. 아직 빈 자리가 있소.” 윤 진사가 빈 자리를 손바닥으로 쓸어 본다.\n어느 조각을 구하러 갈지, 아니면 모은 것만으로 원고를 묶을지 정해야 한다.",
 "options": [
  {"label": "종로 고서점의 진중일기를 받아 온다", "show": {"noTags": ["tg_diary"]}, "check": {"stat": "int", "diff": "normal"},
   "ok": {"text": "고서점 영감이 책장 뒤에서 기름종이 꾸러미를 꺼낸다. “윤 진사가 보냈다는 증거를 대 보시오.”\n윤 진사에게 들은 서문 첫 구절을 읊자, 영감이 꾸러미를 내민다.\n의병 진중일기 세 권. 을사년 이후 경기·강원에서 죽은 이들의 이름이 빼곡하다.", "tag": "tg_diary", "quest": {"id": "tonggam", "stage": "collect", "wait": 2}},
   "ng": {"text": "영감이 고개를 젓는다. “요즘 헌병 끄나풀이 책 사러 오는 척 드나드오. 당신 얼굴은 모르겠소.”\n빈손으로 돌아왔다. 다음에 다시 가 봐야 한다.", "fx": {"heat": 1}, "quest": {"id": "tonggam", "stage": "collect", "wait": 2}}},
  {"label": "서대문 감옥에서 제자의 기억을 받아 적는다", "show": {"noTags": ["tg_memory"]}, "cost": {"money": 3}, "check": {"stat": "edu", "diff": "hard"},
   "ok": {"text": "철망 너머 제자가 눈을 감고 읊는다. 조약 체결의 밤, 누가 어디에 서 있었고 누가 도장을 찍었는지.\n면회는 고작 일각. 받아 적는 손이 저리다. 마지막 줄을 적을 때 간수가 시계를 두드렸다.", "tag": "tg_memory", "fx": {"edu": 1}, "quest": {"id": "tonggam", "stage": "collect", "wait": 2}},
   "ng": {"text": "제자가 빠르게 읊는 말을 절반도 받아 적지 못했다. 간수가 수상쩍게 종이를 빼앗아 훑어본다.\n“면회 끝.” 다음 면회는 한참 뒤에나 날 것이다.", "fx": {"heat": 2}, "quest": {"id": "tonggam", "stage": "collect", "wait": 3}},
   "alt": [{"when": {"items": ["residence"]}, "ok": {"text": "거주증명서를 내밀자 면회가 쉽게 났다. 간수도 시계를 덜 본다.\n제자가 눈을 감고 조약 체결의 밤을 읊는다. 넉넉한 시간 덕에 한 글자도 놓치지 않았다.", "tag": "tg_memory", "fx": {"edu": 1}, "quest": {"id": "tonggam", "stage": "collect", "wait": 2}}}]},
  {"label": "본정 헌책방에서 압수된 신문철을 사 온다", "show": {"noTags": ["tg_paper"]}, "cost": {"money": 6}, "check": {"stat": "int", "diff": "normal"},
   "ok": {"text": "일본인 주인이 먼지 쌓인 신문철을 저울에 단다. “휴지값이오.”\n『대한매일신보』 마지막 석 달 치. 국권이 넘어가던 날들의 기사가 그대로 남아 있다.", "tag": "tg_paper", "quest": {"id": "tonggam", "stage": "collect", "wait": 2}},
   "ng": {"text": "“조선 신문? 그런 거 찾는 사람 장부에 적어 두라 하더군.” 주인이 수상쩍게 웃는다.\n서둘러 가게를 나왔다.", "fx": {"heat": 2}, "quest": {"id": "tonggam", "stage": "collect", "wait": 2}},
   "alt": [{"when": {"tags": ["lang:ja"]}, "check": False, "ok": {"text": "능숙한 일본어로 ‘골동 수집가’ 행세를 하자 주인이 반색한다. “안목이 있으시군.”\n『대한매일신보』 마지막 석 달 치를 휴지값에 넘겨받았다.", "tag": "tg_paper", "quest": {"id": "tonggam", "stage": "collect", "wait": 2}}}]},
  {"label": "모은 것으로 원고를 묶는다", "show": {"anyTags": ["tg_diary", "tg_memory", "tg_paper"]},
   "ok": {"text": "윤 진사가 떨리는 손으로 모은 조각을 꿰맨다. 한지 묶음이 한 뼘 두께가 되었다.\n“이걸 그대가 맡아 주시오. 이 집은 이미 헌병이 눈여겨보고 있소.”\n원고 뭉치를 품에 넣었다. 이제 검문 한 번이 곧 목숨이다.", "item": "tg_ms", "quest": {"id": "tonggam", "stage": "bind", "wait": 1}}},
  {"label": "오늘은 물러난다", "ok": {"text": "“서두르다 잡히면 다 잃소.” 윤 진사가 고개를 끄덕인다.", "quest": {"id": "tonggam", "stage": "collect", "wait": 2}}}
 ]}
E["qt_bind"] = {"title": "원고를 어디로", "kind": "quest", "loc": "bukchon",
 "text": "원고 뭉치를 품고 다닌 지 며칠. 순사가 지나갈 때마다 가슴이 내려앉는다.\n윤 진사가 세 갈래 길을 내놓는다.\n“상해로 보내 활자로 찍는 길. 경성역 검문을 지나야 하오.\n밤마다 베껴 서당마다 몰래 돌리는 길. 느리지만 불태울 수 없소.\n그리고… 총독부 검열을 받아 순하게 고친 책으로 내는 길. 책은 살아남겠지만, 이름만 남은 책이 될 것이오.”",
 "options": [
  {"label": "상해로 보낸다", "ok": {"text": "“신의주행 첫 기차에 제자 하나가 탈 것이오. 역 안까지만 원고를 들고 가 건네 주시오.”", "quest": {"id": "tonggam", "stage": "courier", "wait": 1}}},
  {"label": "필사본으로 베껴 돌린다", "ok": {"text": "등잔 심지를 돋우고 붓을 들었다. 한 부를 베끼는 데 꼬박 한 주가 걸릴 것이다.", "quest": {"id": "tonggam", "stage": "copy", "wait": 1}}},
  {"label": "총독부 검열을 받아 낸다", "show": {"anyTags": ["lang:ja"]},
   "ok": {"text": "검열관 앞에 원고를 펼쳤다. 붉은 먹이 한 장 한 장 내려앉는다. ‘을사’는 ‘보호’로, ‘의병’은 ‘폭도’로.\n석 달 뒤 『조선근세사략』이라는 이름으로 책이 나왔다. 서점마다 꽂혔지만, 윤 진사는 그 책을 펴 보지 않았다.\n그가 원고 원본을 아궁이에 넣으며 말했다. “살았으나 죽은 책이오.”", "unitem": "tg_ms", "fx": {"money": 8, "jp": 15, "kr": -15}, "quest": {"id": "tonggam", "stage": "end_censored"}}}
 ]}
E["qt_copy"] = {"title": "등잔 밑의 필사", "kind": "quest", "loc": "bukchon",
 "text": "자정 넘은 셋방. 등잔 그을음에 눈이 맵다. 원고를 펼쳐 놓고 한 글자씩 옮긴다.\n바깥에서 발소리가 날 때마다 붓을 멈추고 숨을 죽인다.",
 "options": [
  {"label": "첫 필사본을 마친다", "show": {"noTags": ["tg_copy1"]}, "check": {"stat": "edu", "diff": "normal"},
   "ok": {"text": "닭이 울 무렵 마지막 장을 덮었다. 첫 필사본이다. 북촌 서당 훈장에게 몰래 넘겼다.", "tag": "tg_copy1", "fx": {"days": 7}, "quest": {"id": "tonggam", "stage": "copy", "wait": 1}},
   "ng": {"text": "졸다가 등잔을 엎었다. 베끼던 장이 기름에 젖어 버렸다. 처음부터 다시 해야 한다.", "fx": {"days": 7}, "quest": {"id": "tonggam", "stage": "copy", "wait": 1}}},
  {"label": "둘째 필사본을 마친다", "show": {"tags": ["tg_copy1"], "noTags": ["tg_copy2"]}, "check": {"stat": "edu", "diff": "normal"},
   "ok": {"text": "둘째 부를 마쳤다. 이번엔 개성 서당으로 가는 행상 짐 속에 넣었다.", "tag": "tg_copy2", "fx": {"days": 7}, "quest": {"id": "tonggam", "stage": "copy", "wait": 1}},
   "ng": {"text": "순사가 셋방 문을 두드렸다. 원고를 아궁이 옆에 숨기느라 밤을 다 보냈다.", "fx": {"days": 7, "heat": 1}, "quest": {"id": "tonggam", "stage": "copy", "wait": 1}}},
  {"label": "서당마다 필사본을 돌리고 원본을 묻는다", "show": {"tags": ["tg_copy2"]},
   "ok": {"text": "원본은 기름종이에 싸서 윤 진사 집 뒤뜰 감나무 밑에 묻었다.\n필사본 두 부는 손에서 손으로 건너가 다시 베껴질 것이다. 불태울 수 있는 책은 한 권뿐이지만, 베껴지는 책은 끝이 없다.\n윤 진사가 감나무를 쓰다듬으며 웃는다. “이제 나는 죽어도 되겠소.”", "unitem": "tg_ms", "fx": {"edu": 2, "int": 1, "kr": 12}, "quest": {"id": "tonggam", "stage": "end_letter"}}},
  {"label": "베끼기를 그만두고 상해로 보낸다", "ok": {"text": "더는 시간이 없다. 남은 원고를 품고 경성역으로 가기로 했다.", "quest": {"id": "tonggam", "stage": "courier", "wait": 1}}}
 ]}
E["qt_courier"] = {"title": "신의주행 첫 기차", "kind": "fight", "inspector": "헌병", "noCert": True, "loc": "station",
 "text": "새벽 경성역. 신의주행 첫 기차가 증기를 뿜는다. 개찰구 앞에서 헌병들이 짐을 하나하나 풀어 보고 있다.\n개찰구 너머 기둥 뒤에 윤 진사의 제자가 보인다. 원고 뭉치가 품속에서 돌덩이처럼 무겁다.\n줄이 줄어든다. 당신 차례가 다가온다.",
 "options": [
  {"label": "족보책 사이에 원고를 끼워 넘긴다", "check": {"stat": "int", "diff": "normal"},
   "ok": {"text": "“집안 족보요. 신의주 종가에 갖다 드리는 길이오.”\n헌병이 족보 첫 장만 들춰 보고 손을 젓는다. 개찰구를 지나 기둥 뒤 제자에게 원고를 넘겼다.\n기차가 떠날 때까지 손이 떨렸다.", "unitem": "tg_ms", "fx": {"heat": 1}, "quest": {"id": "tonggam", "stage": "printed", "wait": 8}},
   "ng": {"text": "헌병이 족보를 털자 한지 묶음이 쏟아진다. “이건 족보가 아니잖아!”", "fight": "kenpei_pair", "questFight": {"id": "tonggam", "win": "printed", "other": "seized", "wait": 8}}},
  {"label": "검문 줄에서 소동을 일으킨다", "check": {"stat": "agi", "diff": "normal"},
   "ok": {"text": "일부러 짐 보따리를 엎었다. 쏟아진 사과가 개찰구로 굴러가고, 헌병들이 고함을 친다.\n그 틈에 기둥 뒤로 원고를 던지듯 넘겼다.", "unitem": "tg_ms", "fx": {"heat": 2}, "quest": {"id": "tonggam", "stage": "printed", "wait": 8}},
   "ng": {"text": "헌병이 당신 멱살을 잡는다. 품속에서 원고 뭉치가 빠져나온다.", "fight": "kenpei_pair", "questFight": {"id": "tonggam", "win": "printed", "other": "seized", "wait": 8}}},
  {"label": "짐을 순순히 내놓는다", "comply": True,
   "ok": {"text": "헌병이 보따리를 뒤적이다 지나간다. 원고는 끝내 들키지 않았다.\n개찰구를 지나 제자에게 넘겼다.", "unitem": "tg_ms", "quest": {"id": "tonggam", "stage": "printed", "wait": 8}},
   "ng": {"text": "“이건 뭐냐!” 품속에서 {item}이(가) 나왔다. 헌병이 원고를 펼쳐 보고 얼굴이 굳는다.", "fight": "kenpei_pair", "questFight": {"id": "tonggam", "win": "printed", "other": "seized", "wait": 8}}}
 ]}
E["qt_seized"] = {"title": "빼앗긴 원고", "kind": "quest", "loc": "bukchon",
 "text": "원고는 헌병분대로 넘어갔다. 윤 진사는 태형 아흔 대를 맞고 풀려나 건넌방에 엎드려 있다.\n그래도 당신을 보자 몸을 일으키려 한다. “원고는… 다 탔겠지.”\n그가 숨을 고른다. “허나 이것 하나는 놈들도 못 태웠소.” 그가 자기 이마를 손가락으로 두드린다.",
 "options": [
  {"label": "윤 진사의 기억으로 처음부터 다시 모은다", "ok": {"text": "윤 진사가 엎드린 채 읊고, 당신이 받아 적었다. 조약의 밤은 그의 머릿속에 그대로 있었다.\n나머지 조각은 다시 구해야 한다. 처음부터다.", "unitem": "tg_ms", "untag": ["tg_diary", "tg_paper"], "tag": "tg_memory", "fx": {"edu": 1}, "quest": {"id": "tonggam", "stage": "collect", "wait": 3}}},
  {"label": "약값을 대고 의원을 부른다", "cost": {"money": 10}, "ok": {"text": "의원이 다녀가고, 윤 진사는 한 달 뒤 지팡이를 짚고 일어났다.\n원고는 없지만, 그는 그날부터 서당에서 아이들에게 입으로 역사를 가르쳤다.", "unitem": "tg_ms", "fx": {"medkit": 1, "kr": 5}, "quest": {"id": "tonggam", "stage": "end_freed"}}},
  {"label": "고개를 숙이고 돌아선다", "ok": {"text": "할 말이 없었다. 기와집을 나서는 등 뒤로 윤 진사의 기침 소리가 이어졌다.", "unitem": "tg_ms", "quest": {"id": "tonggam", "stage": "end_prison"}}}
 ]}
E["qt_printed"] = {"title": "상해에서 온 책", "kind": "quest", "loc": "bukchon",
 "text": "한겨울, 셋방 문 앞에 짚신 장수가 짚신 꾸러미를 두고 간다. 짚신 바닥에 얇은 책 한 권이 숨겨져 있다.\n『망국통감(亡國痛鑑)』. 상해에서 찍었다는 표지. 첫 장에 윤 진사의 서문이 있다.\n〈나라는 망하였으나 역사는 망하지 아니하였다.〉",
 "options": [
  {"label": "책장을 넘긴다",
   "ok": {"text": "빈 장이 군데군데 있다. ‘원고 일실(逸失)’이라는 작은 글씨가 그 자리를 지킨다.\n모으지 못한 조각들의 자리다. 그래도 책은 책이다. 밤새 읽었다.", "unitem": "tg_ms", "fx": {"int": 1, "edu": 1}, "quest": {"id": "tonggam", "stage": "end_success"}},
   "alt": [{"when": {"tags": ["tg_diary", "tg_memory", "tg_paper"]}, "ok": {"text": "빈 장이 하나도 없다. 진중일기의 이름들, 조약의 밤, 마지막 신문 기사까지.\n완본이다. 마지막 장에 작은 글씨가 있다. 〈이 책을 모아 준 이름 모를 동지에게.〉\n그 밤, 책을 품고 한참을 앉아 있었다.", "unitem": "tg_ms", "fx": {"int": 2, "edu": 2, "kr": 10}, "quest": {"id": "tonggam", "stage": "end_success"}}}]},
  {"label": "서당 아이들에게 읽힌다",
   "ok": {"text": "북촌 서당 훈장에게 책을 건넸다. 아이들이 소리 내어 읽는 소리가 담장 너머로 새어 나온다.", "unitem": "tg_ms", "fx": {"edu": 2, "kr": 8, "heat": 1}, "quest": {"id": "tonggam", "stage": "end_success"}}}
 ]}
E["qt_revenge"] = {"title": "“서고를 판 자”", "kind": "quest", "loc": "bukchon",
 "text": "해 진 골목. 망건을 쓴 젊은 유생 셋이 길을 막는다. 하나는 손에 목검을 들었다.\n“계동 서당에서 헌병에게 보자기를 가리킨 자, 그대가 맞소?” 가운데 유생의 목소리가 떨린다.\n“그 보자기에 우리 스승님이 십 년을 들인 원고가 있었소. 스승님은 그날 이후 붓을 꺾으셨소.”",
 "options": [
  {"label": "가진 돈을 내놓으며 사죄한다", "cost": {"money": 8}, "ok": {"text": "돈을 내밀며 고개를 숙였다. 유생이 돈을 받지 않고 바닥에 내던진다. “이걸로 원고가 돌아오오?”\n그래도 목검은 내려갔다.", "quest": {"id": "tonggam", "stage": "end_betray"}}},
  {"label": "맞선다", "ok": {"text": "말로는 끝나지 않을 일이다. 주먹을 쥐었다.", "fight": "youths", "questFight": {"id": "tonggam", "win": "end_betray", "other": "end_betray", "wait": 0}}},
  {"label": "골목으로 달아난다", "check": {"stat": "agi", "diff": "normal"},
   "ok": {"text": "담을 넘어 달아났다. 등 뒤에서 “부끄러운 줄 아시오!” 하는 소리가 따라왔다.", "fx": {"heat": 1}, "quest": {"id": "tonggam", "stage": "end_betray"}},
   "ng": {"text": "막다른 골목이다.", "fight": "youths", "questFight": {"id": "tonggam", "win": "end_betray", "other": "end_betray", "wait": 0}}}
 ]}
ALIGN = {
 "qt_start|보자기를 몰래 주워 품에 넣는다": {"kr": 10, "ok": True},
 "qt_start|불길 속의 일기책을 건져 낸다": {"kr": 12, "ok": True},
 "qt_start|헌병에게 보자기를 가리킨다": {"jp": 15, "kr": -25},
 "qt_yun|원고 조각을 모으겠다고 한다": {"kr": 8},
 "qt_yun|발을 뺀다": {"kr": -3},
 "qt_collect|모은 것으로 원고를 묶는다": {"kr": 5},
 "qt_bind|상해로 보낸다": {"kr": 5},
 "qt_bind|필사본으로 베껴 돌린다": {"kr": 5},
 "qt_courier|족보책 사이에 원고를 끼워 넘긴다": {"kr": 10, "ok": True},
 "qt_courier|검문 줄에서 소동을 일으킨다": {"kr": 10, "ok": True},
 "qt_revenge|가진 돈을 내놓으며 사죄한다": {"kr": 5}
}
