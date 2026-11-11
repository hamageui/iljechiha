# -*- coding: utf-8 -*-
"""일제치하 — 원본(src/) → 공개용 파일(index.html, data/) 만들기

  python build.py

src/Main.logic.html : 화면과 게임 진행 코드 (원본)
src/*.js            : 게임 데이터 (core · combat · world · events · cities) + 개발자 탭(devtool)
stories/patch.json  : 개발자 탭에서 고친 스토리 (있으면 data/stories.js 로 넣는다)
→ index.html        : GitHub Pages 가 보여 주는 페이지
→ data/*.js         : 데이터 복사본 (?v=내용해시 를 붙여, 바뀌면 브라우저가 바로 새로 받는다)
"""
import hashlib, json, os, re, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
ORDER = ['core', 'combat', 'world', 'events', 'cities', 'stories', 'devtool']
# 원본에 적힌 그림 주소 → 저장소 안의 그림 파일
IMAGES = {
    '/_blob/73c78f0fde08227331189b944d70104f': 'img/title_logo.webp',
    '/_blob/05148b61292172bf90f74989c1c02202': 'img/bg_street.webp',
}

def short_hash(path):
    with open(path, 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()[:10]

def write_stories(out):
    """stories/patch.json (개발자 탭 수정본) → data/stories.js"""
    path = os.path.join(ROOT, 'stories', 'patch.json')
    patch = {'v': 1, 'tables': {}, 'align': {}, 'places': {}}
    if os.path.exists(path):
        with open(path, encoding='utf-8-sig') as f:
            try:
                patch = json.load(f)
            except ValueError as err:
                raise SystemExit('stories/patch.json 형식 오류: %s' % err)
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* 일제치하 — 스토리 수정본 (stories/patch.json 에서 만든 파일 · 직접 고치지 말 것) */\n')
        f.write('var STORY_PATCH = ' + json.dumps(patch, ensure_ascii=False) + ';\n')

def main():
    src = os.path.join(ROOT, 'src')
    data = os.path.join(ROOT, 'data')
    os.makedirs(data, exist_ok=True)
    tags = []
    write_stories(os.path.join(data, 'stories.js'))
    for name in ORDER:
        if name != 'stories':
            shutil.copyfile(os.path.join(src, name + '.js'), os.path.join(data, name + '.js'))
        tags.append('<script src="data/%s.js?v=%s"></script>\n' % (name, short_hash(os.path.join(data, name + '.js'))))
    with open(os.path.join(src, 'Main.logic.html'), encoding='utf-8') as f:
        html = f.read()
    old = '<script src="./support.js"></script>\n'
    assert html.count(old) == 1, 'support.js 줄을 찾지 못했습니다'
    html = html.replace(old, '<script src="support.js?v=%s"></script>\n<!-- 데이터: %s -->\n%s' % (short_hash(os.path.join(ROOT, 'support.js')), ' · '.join(ORDER), ''.join(tags)))
    for blob, path in IMAGES.items():
        html = html.replace(blob, path)
    left = re.findall(r'/_blob/[0-9a-f]+', html)
    assert not left, '저장소에 없는 그림 주소: %s' % left
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    print('index.html · data/ 를 새로 만들었습니다.')

if __name__ == '__main__':
    main()
