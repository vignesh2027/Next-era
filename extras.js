/* ============================================
   NEXT ERA — EXTRAS
   Augments existing app.js. Does not replace it.
   ============================================ */
(function () {
  // ============================================
  // SECTION NAVIGATOR (dots + counter)
  // ============================================
  function initSectionNav() {
    const labelled = [...document.querySelectorAll('[data-screen-label]')].filter(el => el.id !== 'intro');
    if (!labelled.length) return;
    const nav = document.createElement('aside');
    nav.className = 'section-nav';
    labelled.forEach((sec, i) => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.title = sec.dataset.screenLabel;
      const lbl = document.createElement('span');
      lbl.className = 'lbl';
      lbl.textContent = sec.dataset.screenLabel;
      dot.appendChild(lbl);
      dot.addEventListener('click', () => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      nav.appendChild(dot);
    });
    document.body.appendChild(nav);

    const counter = document.createElement('div');
    counter.className = 'section-counter';
    counter.innerHTML = `<span class="now">01</span><span class="of">/ ${String(labelled.length).padStart(2, '0')}</span>`;
    document.body.appendChild(counter);

    // Show after intro finishes
    const checkShow = () => {
      if (window.NEXUS_SCENE && window.NEXUS_SCENE.isFinished()) {
        nav.classList.add('show');
        counter.classList.add('show');
      } else {
        setTimeout(checkShow, 800);
      }
    };
    checkShow();

    // Active dot tracking via IntersectionObserver
    const dots = nav.querySelectorAll('.dot');
    const nowEl = counter.querySelector('.now');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.3) {
          const idx = labelled.indexOf(e.target);
          if (idx >= 0) {
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            nowEl.textContent = String(idx + 1).padStart(2, '0');
          }
        }
      });
    }, { threshold: [0, 0.3, 0.6, 1] });
    labelled.forEach(s => io.observe(s));
  }

  // ============================================
  // SCROLL VELOCITY BLUR — rAF-throttled
  // ============================================
  function initScrollVelocity() {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let blurring = false;
    let queued = false;
    const targets = document.querySelectorAll('.scene, .arm-section, .cards-section, .stats-section, .tiles-section');
    targets.forEach(t => t.classList.add('velocity'));
    function tick() {
      queued = false;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const velocity = Math.abs(window.scrollY - lastY) / dt;
      lastY = window.scrollY;
      lastT = now;
      if (velocity > 3.0 && !blurring) {
        blurring = true;
        targets.forEach(t => t.classList.add('fast'));
      }
      clearTimeout(window.__velTo);
      window.__velTo = setTimeout(() => {
        blurring = false;
        targets.forEach(t => t.classList.remove('fast'));
      }, 160);
    }
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(tick);
    }, { passive: true });
  }

  // ============================================
  // STICKY-SCRUB STAGE (rAF throttled)
  // ============================================
  function initStickyStage() {
    const stages = document.querySelectorAll('.sticky-stage');
    stages.forEach((stage) => {
      const frames = stage.querySelectorAll('.frame');
      const ticks = stage.querySelectorAll('.stage-progress span');
      if (!frames.length) return;
      let queued = false;
      let lastIdx = -1;
      function tick() {
        queued = false;
        const r = stage.getBoundingClientRect();
        const total = stage.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, Math.min(total, -r.top));
        const p = total > 0 ? scrolled / total : 0;
        const activeIdx = Math.min(frames.length - 1, Math.floor(p * frames.length));
        if (activeIdx !== lastIdx) {
          lastIdx = activeIdx;
          frames.forEach((f, i) => f.classList.toggle('active', i === activeIdx));
          ticks.forEach((t, i) => t.classList.toggle('active', i === activeIdx));
        }
      }
      window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(tick);
      }, { passive: true });
      tick();
    });
  }

  // ============================================
  // NEURAL CONSTELLATION CANVAS
  // ============================================
  function initNeural() {
    const stage = document.querySelector('.neural-stage');
    if (!stage) return;
    const canvas = document.createElement('canvas');
    stage.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    function resize() {
      const r = stage.getBoundingClientRect();
      canvas.width = r.width * (window.devicePixelRatio || 1);
      canvas.height = r.height * (window.devicePixelRatio || 1);
      ctx.setTransform((window.devicePixelRatio || 1), 0, 0, (window.devicePixelRatio || 1), 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const N = 90;
    const nodes = [];
    for (let i = 0; i < N; i++) {
      nodes.push({
        x: Math.random() * stage.offsetWidth,
        y: Math.random() * stage.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.6 + Math.random() * 2.2,
        big: Math.random() < 0.08,
      });
    }
    let mouseX = -1000, mouseY = -1000;
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
    });
    stage.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

    function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, stage.offsetWidth, stage.offsetHeight);
      // links
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            const a = (1 - d / 130) * 0.4;
            ctx.strokeStyle = `rgba(201, 169, 110, ${a})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        // mouse repel
        const mdx = n.x - mouseX, mdy = n.y - mouseY;
        const md = Math.hypot(mdx, mdy);
        if (md < 160) {
          const f = (1 - md / 160) * 0.6;
          n.x += (mdx / md) * f;
          n.y += (mdy / md) * f;
        }
        if (n.x < 0 || n.x > stage.offsetWidth) n.vx *= -1;
        if (n.y < 0 || n.y > stage.offsetHeight) n.vy *= -1;
        if (n.big) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 14);
          g.addColorStop(0, 'rgba(232, 201, 138, 0.9)');
          g.addColorStop(1, 'rgba(232, 201, 138, 0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = n.big ? '#EFD194' : 'rgba(201, 169, 110, 0.9)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    loop();
  }

  // ============================================
  // BEFORE / AFTER SLIDER
  // ============================================
  function initCompareImg() {
    const wrap = document.querySelector('.compare-img');
    if (!wrap) return;
    const b = wrap.querySelector('.b');
    const handle = wrap.querySelector('.handle');
    const grip = wrap.querySelector('.grip');
    let dragging = false;
    function set(px) {
      const r = wrap.getBoundingClientRect();
      const x = Math.max(0, Math.min(r.width, px));
      const pct = (x / r.width) * 100;
      b.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
      grip.style.left = pct + '%';
    }
    set(wrap.getBoundingClientRect().width * 0.5);
    wrap.addEventListener('mousedown', (e) => {
      dragging = true;
      const r = wrap.getBoundingClientRect();
      set(e.clientX - r.left);
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const r = wrap.getBoundingClientRect();
      set(e.clientX - r.left);
    });
    wrap.addEventListener('touchmove', (e) => {
      const r = wrap.getBoundingClientRect();
      set(e.touches[0].clientX - r.left);
    }, { passive: true });
  }

  // ============================================
  // SCROLL-LINKED HORIZONTAL TYPE (rAF)
  // ============================================
  function initScrollType() {
    const section = document.querySelector('.scroll-type-section');
    if (!section) return;
    const lines = section.querySelectorAll('.scroll-type-line');
    let queued = false;
    function tick() {
      queued = false;
      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const center = window.innerHeight / 2;
      const prog = (center - r.top) / (r.height + window.innerHeight);
      lines.forEach((l, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        const speed = 500 + (i * 180);
        l.style.transform = `translate3d(${dir * prog * speed}px, 0, 0)`;
      });
    }
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(tick);
    }, { passive: true });
    tick();
  }

  // ============================================
  // BIG WORD PARALLAX (rAF)
  // ============================================
  function initBigWords() {
    const els = document.querySelectorAll('.big-words');
    if (!els.length) return;
    let queued = false;
    function tick() {
      queued = false;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        const center = window.innerHeight / 2;
        const off = (center - (r.top + r.height / 2)) * 0.35;
        el.style.transform = `translate3d(${off}px, 0, 0)`;
      });
    }
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(tick);
    }, { passive: true });
  }

  // ============================================
  // INTRO RING SCRIBBLE — populate code block + ticker
  // ============================================
  function injectIntroExtras() {
    const intro = document.getElementById('intro');
    if (!intro) return;

    // rings
    const rings = document.createElement('div');
    rings.className = 'intro-rings';
    rings.innerHTML = '<div class="r"></div><div class="r"></div><div class="r"></div><div class="r"></div>';
    intro.appendChild(rings);

    // code
    const code = document.createElement('pre');
    code.className = 'intro-code';
    code.innerHTML = `
> init  nx-7  /genesis
<span class="glow">> boot.cortex     [ok]</span>
> boot.kinematic [ok]
> boot.haptic    [ok]
> boot.vision    [..]
> calibrate gyro
<span class="glow">> handshake</span>     · 0.34ps
> stream telemetry
> mount sensorium
> warm magnetics
> bind reasoning
> link memory
<span class="glow">> awaken.</span>
    `.trim();
    intro.appendChild(code);

    // helix
    const helix = document.createElement('div');
    helix.className = 'intro-helix';
    let pathA = 'M30 0 ';
    let pathB = 'M30 0 ';
    const dots = [];
    for (let i = 1; i <= 16; i++) {
      const y = i * 20;
      const xA = 30 + Math.sin(i * 0.7) * 28;
      const xB = 30 - Math.sin(i * 0.7) * 28;
      pathA += `Q ${xA} ${y - 10} 30 ${y} `;
      pathB += `Q ${xB} ${y - 10} 30 ${y} `;
      dots.push(`<circle cx="${xA}" cy="${y - 10}" r="1.5"/><circle cx="${xB}" cy="${y - 10}" r="1.5"/>`);
    }
    helix.innerHTML = `<svg viewBox="0 0 60 320"><path d="${pathA}"/><path d="${pathB}"/>${dots.join('')}</svg>`;
    intro.appendChild(helix);

    // glitch
    const glitch = document.createElement('div');
    glitch.className = 'intro-glitch';
    intro.appendChild(glitch);

    // ticker
    const ticker = document.createElement('div');
    ticker.className = 'intro-ticker';
    const tline = '· LAT 35.011°N · LON 135.768°E · CORE 36.4°C · FLOW 0.42 L/min · ACTUATORS 1248 LOCKED · CORTEX 14 LIT · MEMORY 4.0PB OK · HAPTIC 20480 CELLS WARM · SENSOR 256 ARRAYS LIVE · VOICE 11 STREAMS READY · GENESIS PROTOCOL T+ 0000 ';
    ticker.innerHTML = `<span class="line">${tline.repeat(3)}</span>`;
    intro.appendChild(ticker);
  }

  // ============================================
  // BOOT
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    injectIntroExtras();
    initSectionNav();
    initScrollVelocity();
    initStickyStage();
    initNeural();
    initCompareImg();
    initScrollType();
    initBigWords();
  });
})();
