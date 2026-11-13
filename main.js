// ===== 共通の動き =====
document.addEventListener('DOMContentLoaded', () => {
  // ハンバーガーメニュー（スマホ）
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }

  // 写真の拡大表示（ライトボックス）
  const zoomables = [...document.querySelectorAll('[data-zoom]')];
  if (zoomables.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lb-close" aria-label="閉じる">×</button>' +
      '<button class="lb-prev" aria-label="前の写真">‹</button>' +
      '<img alt=""><div class="caption"></div>' +
      '<button class="lb-next" aria-label="次の写真">›</button>';
    document.body.appendChild(lb);
    const img = lb.querySelector('img');
    const cap = lb.querySelector('.caption');
    let idx = 0;
    const show = (i) => {
      idx = (i + zoomables.length) % zoomables.length;
      const el = zoomables[idx];
      const src = el.dataset.zoom || el.src;
      img.src = src;
      img.alt = el.alt || '';
      cap.textContent = el.dataset.caption || el.alt || '';
      lb.classList.add('show');
    };
    zoomables.forEach((el, i) => el.addEventListener('click', () => show(i)));
    lb.querySelector('.lb-close').addEventListener('click', () => lb.classList.remove('show'));
    lb.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.classList.remove('show'); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape') lb.classList.remove('show');
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  // メニューのカテゴリ絞り込み
  document.querySelectorAll('.filter').forEach((f) => {
    const target = document.querySelector(f.dataset.target);
    f.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        f.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        const cat = b.dataset.cat;
        target.querySelectorAll('.menu-item').forEach((item) => {
          item.classList.toggle('hide', cat !== 'all' && item.dataset.cat !== cat);
        });
      });
    });
  });

  // 営業中かどうかを自動表示
  // data-open="11:30-14:30,17:30-22:00"（休憩ありは「,」区切り） data-closed-days="1"（0=日曜〜6=土曜）
  // ※決まった営業時間・定休日にだけ対応。臨時休業や祝日は自動では反映されません。
  document.querySelectorAll('[data-open]').forEach((el) => {
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const closedDays = (el.dataset.closedDays || '').split(',').filter(Boolean).map(Number);
    let open = el.dataset.open.split(',').some((range) => {
      const [s, e] = range.trim().split('-');
      const start = toMin(s), end = toMin(e);
      return end <= start ? (cur >= start || cur < end) : (cur >= start && cur < end);
    });
    if (closedDays.includes(now.getDay())) open = false;
    el.textContent = open ? 'ただいま営業中' : '営業時間外';
    el.classList.add(open ? 'open' : 'closed');
  });

  // トップへ戻るボタン
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'ページの先頭へ');
  toTop.textContent = '↑';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 400));

  // スクロールでふわっと表示
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach((el) => io.observe(el));

  // お問い合わせフォーム（サンプルなので実際の送信はせず、届くメールの例を表示）
  document.querySelectorAll('.contact-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const shop = document.querySelector('.logo').textContent.trim();
      const val = (id) => (form.querySelector('#' + id)?.value || '').trim();
      const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const box = form.nextElementSibling;
      box.innerHTML =
        '<h3>送信が完了しました（サンプル）</h3>' +
        '<p>実際のサイトでは、次の2通のメールが自動で送られます。</p>' +
        '<div class="mail"><div class="mail-head">① お店に届くメール（宛先：info@〇〇〇.jp）</div>' +
        '件名：【' + esc(shop) + '】ご予約・お問い合わせがありました<br>' +
        'お名前：' + esc(val('name')) + '<br>メール：' + esc(val('email')) + '<br>電話：' + esc(val('tel')) +
        '<br>ご希望日：' + esc(val('date')) + '　人数：' + esc(val('people')) +
        '<br>ご用件：' + esc(val('kind')) + '<br>内容：' + esc(val('msg')).replace(/\n/g, '<br>') + '</div>' +
        '<div class="mail"><div class="mail-head">② お客様に届く自動返信メール（宛先：' + esc(val('email')) + '）</div>' +
        '件名：【' + esc(shop) + '】お問い合わせを受け付けました<br>' +
        esc(val('name')) + ' 様<br>このたびはご連絡ありがとうございます。内容を確認のうえ、お店からご連絡いたします。</div>' +
        '<button class="btn outline" type="button">フォームに戻る</button>';
      form.hidden = true;
      box.hidden = false;
      box.querySelector('button').addEventListener('click', () => { box.hidden = true; form.hidden = false; });
    });
  });

  // 空席カレンダー（サンプル：日付から決まった○△×を表示）
  document.querySelectorAll('.rsv-calendar').forEach((cal) => {
    const closed = (cal.dataset.closedDays || '').split(',').filter(Boolean).map(Number);
    const week = ['日', '月', '火', '水', '木', '金', '土'];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      let mark = ['○', '○', '△', '○', '×', '○', '△'][(d.getDate() * 3 + d.getMonth()) % 7];
      if (closed.includes(d.getDay())) mark = '×';
      if (i === 0 && today.getHours() >= 15) mark = '×';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cal-day' + (mark === '×' ? ' full' : '') + (d.getDay() === 0 ? ' sun' : '') + (d.getDay() === 6 ? ' sat' : '');
      b.innerHTML = '<span>' + (d.getMonth() + 1) + '/' + d.getDate() + '（' + week[d.getDay()] + '）</span><b>' + mark + '</b>';
      if (mark === '×') b.disabled = true;
      const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      b.addEventListener('click', () => {
        const date = document.querySelector('#date');
        if (date) { date.value = iso; date.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        cal.querySelectorAll('.cal-day').forEach((x) => x.classList.remove('picked'));
        b.classList.add('picked');
      });
      cal.appendChild(b);
    }
  });

  // 「このコースで予約」を押すとフォームにコース名を入れる
  document.querySelectorAll('.course-btn').forEach((b) => {
    b.addEventListener('click', () => {
      const msg = document.querySelector('#msg');
      if (msg) msg.value = '【コース】' + b.dataset.course + 'を希望します。\n' + msg.value.replace(/^【コース】.*\n/, '');
    });
  });

  // 日本語／英語の切り替え
  document.querySelectorAll('.lang-demo').forEach((demo) => {
    demo.querySelectorAll('.lang-switch button').forEach((b) => {
      b.addEventListener('click', () => {
        demo.querySelectorAll('.lang-switch button').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        demo.querySelectorAll('[data-ja]').forEach((el) => { el.textContent = el.dataset[b.dataset.lang]; });
      });
    });
  });

  // スマホ下部の「電話する」「ネット予約」ボタン（店舗ページのみ）
  if (document.body.matches('.cafe, .izakaya, .restaurant')) {
    const bar = document.createElement('div');
    bar.className = 'cta-bar';
    bar.innerHTML = '<a class="btn" href="tel:0000000000">電話する</a><a class="btn" href="#contact">ネット予約</a>';
    document.body.appendChild(bar);
  }

  // ほかの送信方法：メールアプリ（mailto）と予約サイト（サンプル）
  document.querySelectorAll('.mailto-btn').forEach((a) => {
    a.addEventListener('click', () => {
      const v = (id) => (document.querySelector('#' + id)?.value || '').trim();
      const shop = document.querySelector('.logo').textContent.trim();
      const body = 'お名前：' + v('name') + '\nメール：' + v('email') + '\n電話：' + v('tel') + '\nご希望日：' + v('date') + '\n人数：' + v('people') + '\nご用件：' + v('kind') + '\n内容：' + v('msg');
      a.href = 'mailto:info@example.com?subject=' + encodeURIComponent('【' + shop + '】ご予約・お問い合わせ') + '&body=' + encodeURIComponent(body);
    });
  });
  document.querySelectorAll('.rsv-site-btn').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      alert('サンプルのため移動しません。実際は、お店が契約している予約サイト（空席確認・ネット予約のページ）に移動します。');
    });
  });

  // タブ切り替え
  document.querySelectorAll('[data-tabs]').forEach((wrap) => {
    const btns = wrap.querySelectorAll('.tabs button');
    const panels = wrap.querySelectorAll('.tab-panel');
    btns.forEach((b, i) => b.addEventListener('click', () => {
      btns.forEach((x) => x.classList.remove('active'));
      panels.forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      panels[i].classList.add('active');
    }));
  });

  // スライドショー
  document.querySelectorAll('.slider').forEach((sl) => {
    const imgs = sl.querySelectorAll('img');
    let i = 0;
    setInterval(() => {
      imgs[i].classList.remove('active');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('active');
    }, 3000);
  });

  // 注文数の計算デモ
  document.querySelectorAll('.counter').forEach((c) => {
    const price = Number(c.dataset.price);
    const qty = c.querySelector('.qty');
    const total = c.querySelector('.total');
    let n = 1;
    const render = () => { qty.textContent = n; total.textContent = '合計 ' + (price * n).toLocaleString() + '円（税込）'; };
    c.querySelector('.minus').addEventListener('click', () => { if (n > 1) n--; render(); });
    c.querySelector('.plus').addEventListener('click', () => { if (n < 20) n++; render(); });
    render();
  });
});
