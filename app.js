/* ============================================
   NEXT ERA — Intro sequence, GSAP scroll, sections
   ============================================ */
(function () {
  // ============================================
  // SPLIT TEXT — hydrate any [data-split] into spans
  // ============================================
  document.querySelectorAll('.split[data-split]').forEach((el) => {
    const txt = el.dataset.split;
    el.innerHTML = '';
    const words = txt.split(' ');
    words.forEach((word, wi) => {
      const wEl = document.createElement('span');
      wEl.className = 'word';
      [...word].forEach((ch, ci) => {
        const c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch;
        // stagger via inline transition-delay
        const idx = el.querySelectorAll('.ch').length;
        c.style.transitionDelay = (idx * 35) + 'ms';
        wEl.appendChild(c);
      });
      el.appendChild(wEl);
      if (wi < words.length - 1) {
        const sp = document.createElement('span');
        sp.className = 'word';
        sp.innerHTML = '&nbsp;';
        el.appendChild(sp);
      }
    });
  });

  // ============================================
  // MAGNETIC BUTTONS — spring-pull toward cursor
  // ============================================
  document.querySelectorAll('.magnetic').forEach((el) => {
    let rect = null;
    el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      rect = null;
      el.style.transform = 'translate(0,0)';
    });
  });

  // ============================================
  // CUSTOM CURSOR
  // ============================================
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .flip, .reel-item, .tile, .acc-item, .testi')) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .flip, .reel-item, .tile, .acc-item, .testi')) {
        document.body.classList.remove('cursor-hover');
      }
    });
    document.addEventListener('mousedown', () => {
      cursorDot.style.transform += ' scale(1.6)';
      setTimeout(() => { cursorDot.style.transform = cursorDot.style.transform.replace(' scale(1.6)', ''); }, 150);
    });
  }

  // ============================================
  // INTRO — particle canvas + typewriter + skip
  // ============================================
  const introEl = document.getElementById('intro');
  const introCanvas = document.getElementById('intro-canvas');
  const ictx = introCanvas.getContext('2d');
  let icw = introCanvas.width = window.innerWidth;
  let ich = introCanvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    icw = introCanvas.width = window.innerWidth;
    ich = introCanvas.height = window.innerHeight;
  });

  const ashes = [];
  for (let i = 0; i < 320; i++) {
    ashes.push({
      x: Math.random() * icw,
      y: Math.random() * ich * 1.4 + ich * 0.1,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.15 - Math.random() * 0.4,
      r: 0.4 + Math.random() * 1.5,
      a: 0.05 + Math.random() * 0.12,
      life: Math.random() * 600,
    });
  }
  let introRunning = true;
  function drawIntroParticles() {
    if (!introRunning) return;
    requestAnimationFrame(drawIntroParticles);
    ictx.fillStyle = 'rgba(10, 9, 7, 0.18)';
    ictx.fillRect(0, 0, icw, ich);
    // subtle warm gradient noise hint
    const grad = ictx.createRadialGradient(icw/2, ich*0.55, 20, icw/2, ich*0.55, Math.max(icw, ich)*0.7);
    grad.addColorStop(0, 'rgba(201, 169, 110, 0.045)');
    grad.addColorStop(1, 'rgba(10, 9, 7, 0)');
    ictx.fillStyle = grad;
    ictx.fillRect(0, 0, icw, ich);

    for (const p of ashes) {
      p.x += p.vx; p.y += p.vy; p.life++;
      if (p.y < -10) { p.y = ich + 20; p.x = Math.random() * icw; p.life = 0; }
      const alpha = p.a * (0.6 + 0.4 * Math.sin(p.life * 0.04));
      ictx.fillStyle = `rgba(250, 248, 245, ${alpha})`;
      ictx.beginPath();
      ictx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ictx.fill();
    }
  }
  drawIntroParticles();

  // ----- Typewriter helpers
  function typewrite(el, text, perChar, cb) {
    let i = 0;
    el.style.opacity = '1';
    el.textContent = '';
    const tick = () => {
      if (i >= text.length) { cb && cb(); return; }
      el.textContent += text.charAt(i++);
      setTimeout(tick, perChar);
    };
    tick();
  }
  function letterByLetter(el, text, perChar, cb) {
    el.style.opacity = '1';
    el.innerHTML = '';
    text.split('').forEach((ch) => {
      const sp = document.createElement('span');
      sp.className = 'lt';
      sp.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(sp);
    });
    const spans = el.querySelectorAll('.lt');
    let i = 0;
    const step = () => {
      if (i >= spans.length) { cb && cb(); return; }
      spans[i].classList.add('in');
      i++;
      setTimeout(step, perChar);
    };
    step();
  }

  // ----- Intro choreography
  const introHead = document.querySelector('.intro-headline');
  const introSub = document.querySelector('.intro-subtitle');
  const introEyebrow = document.querySelector('.intro-eyebrow .txt');
  const introStats = document.querySelector('.intro-stats');
  const introCTA = document.querySelector('.intro-cta');
  const introRule = document.querySelector('.intro-rule');
  const introSweep = document.querySelector('.intro-sweep');
  const introSkipBtn = document.querySelector('.intro-skip');

  function fadeIn(el, ms) {
    el.style.transition = `opacity ${ms}ms ease`;
    el.style.opacity = '1';
  }

  function runIntro() {
    if (window.NEXUS_SCENE) window.NEXUS_SCENE.startIntro();

    // ----- 30-second HUD progress + phase ticker
    const hudHost = document.querySelector('.intro-hud');
    const hudPhase = document.getElementById('hud-phase');
    const hudTime = document.getElementById('hud-time');
    const hudPwr = document.getElementById('hud-pwr');
    const hudCore = document.getElementById('hud-core');
    const hudEye = document.getElementById('hud-eye');
    const progFill = document.querySelector('.intro-progress .fill');
    const progPct = document.getElementById('prog-pct');
    const progBox = document.querySelector('.intro-progress');
    if (hudHost) hudHost.classList.add('show');
    if (progBox) progBox.classList.add('show');

    const phases = [
      { at: 0,  label: 'PHASE 0 · VOID',          core: 'stand-by', eye: 'offline' },
      { at: 1,  label: 'PHASE 1 · ASSEMBLY',      core: 'wiring',  eye: 'offline' },
      { at: 8,  label: 'PHASE 2 · SOLIDIFY',      core: 'fusing',  eye: 'pre-init' },
      { at: 14, label: 'PHASE 3 · STABILISE',     core: 'humming', eye: 'init' },
      { at: 18, label: 'PHASE 4 · AWAKEN',        core: 'live',    eye: 'on-line' },
      { at: 24, label: 'PHASE 5 · REVEAL',        core: 'live',    eye: 'tracking' },
      { at: 28, label: 'READY',                    core: 'live',    eye: 'tracking' },
    ];
    const intStart = performance.now();
    function tickHud() {
      const t = (performance.now() - intStart) / 1000;
      const T = Math.min(t, 30);
      const pct = Math.min(100, (T / 30) * 100);
      if (progFill) progFill.style.width = pct + '%';
      if (progPct) progPct.textContent = pct.toFixed(0).padStart(2, '0') + '%';
      if (hudTime) hudTime.textContent = `T+ ${T.toFixed(2).padStart(5, '0')} / 30.00`;
      if (hudPwr) hudPwr.textContent = Math.min(100, Math.round(pct)).toString().padStart(3, '0') + '%';
      const phase = phases.slice().reverse().find(p => T >= p.at);
      if (phase) {
        if (hudPhase) hudPhase.textContent = phase.label;
        if (hudCore) hudCore.textContent = phase.core;
        if (hudEye) hudEye.textContent = phase.eye;
      }
      if (T < 30 && introRunning) requestAnimationFrame(tickHud);
    }
    requestAnimationFrame(tickHud);

    // ----- 21s: hero text begins
    setTimeout(() => {
      letterByLetter(introHead, 'NEXT ERA', 95, () => {
        setTimeout(() => {
          typewrite(introSub, 'The Age of Intelligent Form', 36, () => {
            setTimeout(() => {
              typewrite(introEyebrow, 'GENESIS UNIT — MODEL NX-7', 55);
            }, 200);
          });
        }, 250);
      });
    }, 21000);

    // Skip button appears at 1s
    setTimeout(() => fadeIn(introSkipBtn, 600), 1000);

    // Light sweep at ~24s
    setTimeout(() => {
      introSweep.style.opacity = '1';
      introSweep.style.transition = 'transform 3.0s ease, opacity 3.0s ease';
      introSweep.style.transform = 'translateX(300%)';
    }, 24000);

    // Rule + stats at ~26s
    setTimeout(() => {
      introRule.style.transition = 'width 1.4s ease';
      introRule.style.width = 'min(420px, 60vw)';
      typewrite(introStats, 'PROCESSING... CONSCIOUSNESS LOADED', 28);
    }, 26000);

    // CTA at 28.5s
    setTimeout(() => fadeIn(introCTA, 900), 28500);

    // Auto-dismiss at 31s
    setTimeout(dismissIntro, 31000);
  }

  function dismissIntro() {
    if (!introEl || introEl.classList.contains('gone')) return;
    introEl.classList.add('gone');
    introEl.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
    introEl.style.opacity = '0';
    introEl.style.transform = 'scale(1.04)';
    introEl.style.pointerEvents = 'none';
    setTimeout(() => {
      introEl.style.display = 'none';
      introRunning = false;
    }, 1200);
  }

  introSkipBtn.addEventListener('click', () => {
    if (window.NEXUS_SCENE) window.NEXUS_SCENE.skip();
    dismissIntro();
  });
  document.querySelector('.intro-cta .btn-primary').addEventListener('click', dismissIntro);
  document.querySelector('.intro-cta .btn-secondary').addEventListener('click', () => {
    dismissIntro();
    setTimeout(() => {
      document.getElementById('specs').scrollIntoView({ behavior: 'smooth' });
    }, 700);
  });

  // Kick off after a beat
  setTimeout(runIntro, 300);

  // ============================================
  // LOADING BAR
  // ============================================
  const loadingBar = document.querySelector('.loading-bar');
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, window.scrollY / h));
    loadingBar.style.width = (p * 100) + '%';
  });

  // ============================================
  // PARALLAX (hero layers + arm)
  // ============================================
  const heroParallaxEls = document.querySelectorAll('[data-px]');
  let pmx = 0, pmy = 0;
  window.addEventListener('mousemove', (e) => {
    pmx = (e.clientX / window.innerWidth - 0.5);
    pmy = (e.clientY / window.innerHeight - 0.5);
  });
  function parallaxLoop() {
    heroParallaxEls.forEach((el) => {
      const px = parseFloat(el.dataset.px) || 0;
      el.style.transform = `translate3d(${pmx * px * 30}px, ${pmy * px * 30}px, 0)`;
    });

    const armWrap = document.querySelector('.arm-wrap');
    if (armWrap) {
      const r = armWrap.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        armWrap.style.transform = `rotateY(${-18 + pmx * 14}deg) rotateX(${8 - pmy * 10}deg)`;
      }
    }

    requestAnimationFrame(parallaxLoop);
  }
  parallaxLoop();

  // ============================================
  // INTERSECTION REVEALS
  // ============================================
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        // stat counters
        if (e.target.classList.contains('stat')) {
          const numEl = e.target.querySelector('.num .v');
          if (numEl && !numEl.dataset.done) {
            numEl.dataset.done = '1';
            const target = parseFloat(numEl.dataset.target);
            const decimals = parseInt(numEl.dataset.decimals || '0', 10);
            const useComma = numEl.dataset.format === 'comma';
            const startT = performance.now();
            const dur = 2300;
            const animateNum = (t) => {
              const k = Math.min(1, (t - startT) / dur);
              const eased = 1 - Math.pow(1 - k, 3);
              const v = target * eased;
              numEl.textContent = useComma
                ? Math.round(v).toLocaleString()
                : v.toFixed(decimals);
              if (k < 1) requestAnimationFrame(animateNum);
              else numEl.textContent = useComma ? target.toLocaleString() : target.toFixed(decimals);
            };
            requestAnimationFrame(animateNum);
            const bar = e.target.querySelector('.bar');
            if (bar) { bar.style.transition = 'width 1.6s ease'; bar.style.width = '40px'; }
          }
        }
        // tile bar fill
        if (e.target.classList.contains('tile')) {
          const m = e.target.querySelector('.micro');
          if (m) m.style.setProperty('--p', (e.target.dataset.fill || '60') + '%');
        }
        // stats ruler
        if (e.target.classList.contains('stats-left')) {
          const r = e.target.querySelector('.ruler');
          if (r) { r.style.transition = 'width 1.4s ease'; r.style.width = '80px'; }
        }
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.reveal, .reveal-x, .reveal-scale, .reveal-blur, .split, .stat, .tile, .stats-left, .flip, .reel-item, .testi').forEach((el) => io.observe(el));

  // ============================================
  // FILM REEL — drag to scroll
  // ============================================
  const reel = document.querySelector('.reel-track');
  if (reel) {
    let down = false, sx = 0, sl = 0;
    reel.addEventListener('mousedown', (e) => {
      down = true; sx = e.pageX; sl = reel.scrollLeft;
      reel.classList.add('dragging');
    });
    window.addEventListener('mouseup', () => { down = false; reel.classList.remove('dragging'); });
    window.addEventListener('mousemove', (e) => {
      if (!down) return;
      reel.scrollLeft = sl - (e.pageX - sx);
    });
    // touch
    reel.addEventListener('touchstart', (e) => { sx = e.touches[0].pageX; sl = reel.scrollLeft; down = true; }, { passive: true });
    reel.addEventListener('touchmove', (e) => {
      if (!down) return;
      reel.scrollLeft = sl - (e.touches[0].pageX - sx);
    }, { passive: true });
    reel.addEventListener('touchend', () => { down = false; });
    // wheel → horizontal
    reel.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        reel.scrollLeft += e.deltaY;
      }
    }, { passive: true });
  }

  // ============================================
  // ACCORDION + FAQ
  // ============================================
  document.querySelectorAll('.acc-item').forEach((it) => {
    it.addEventListener('click', () => {
      document.querySelectorAll('.acc-item.open').forEach((o) => { if (o !== it) o.classList.remove('open'); });
      it.classList.toggle('open');
    });
  });
  document.querySelectorAll('.faq-item').forEach((it) => {
    it.addEventListener('click', () => { it.classList.toggle('open'); });
  });

  // ============================================
  // WAVEFORM — build random-height animated bars
  // ============================================
  const wf = document.getElementById('waveform');
  if (wf) {
    const N = 80;
    for (let i = 0; i < N; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      const phase = (i / N) * Math.PI * 2;
      const seed = 0.3 + Math.abs(Math.sin(phase * 2.3) * 0.4) + Math.abs(Math.sin(phase * 5.1) * 0.25);
      bar.style.maxHeight = (40 + seed * 100) + 'px';
      bar.style.animationDelay = (i * 0.04 % 1.6) + 's';
      bar.style.animationDuration = (1.4 + (i % 3) * 0.15) + 's';
      wf.appendChild(bar);
    }
  }

  // ============================================
  // TILT CARD (section 7)
  // ============================================
  const tilt = document.querySelector('.tilt-card');
  const cinemaSection = document.querySelector('.cinema-section');
  if (tilt && cinemaSection) {
    let tx = 0, ty = 0;
    cinemaSection.addEventListener('mousemove', (e) => {
      const r = cinemaSection.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      tx = (px - 0.5) * 22;
      ty = (0.5 - py) * 14;
      tilt.style.transform = `perspective(1100px) rotateY(${tx}deg) rotateX(${ty}deg)`;
      tilt.style.boxShadow = `${-tx * 1.6}px ${-ty * 1.6 + 20}px 60px rgba(0,0,0,0.5), 0 0 80px rgba(201,169,110,0.08)`;
      const cardR = tilt.getBoundingClientRect();
      const mx = ((e.clientX - cardR.left) / cardR.width) * 100;
      const my = ((e.clientY - cardR.top) / cardR.height) * 100;
      tilt.style.setProperty('--mx', mx + '%');
      tilt.style.setProperty('--my', my + '%');
    });
    cinemaSection.addEventListener('mouseleave', () => {
      tilt.style.transform = 'perspective(1100px) rotateY(0) rotateX(0)';
    });
  }

  // ============================================
  // PARALLAX scroll for cinematic layers (rAF throttled)
  // ============================================
  const cinFar = document.querySelector('.cin-far');
  const cinMid = document.querySelector('.cin-mid');
  const cinNear = document.querySelector('.cin-near');
  let scrollQueued = false;
  function scrollTick() {
    scrollQueued = false;
    if (cinemaSection) {
      const r = cinemaSection.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        const progress = 1 - (r.top + r.height) / (window.innerHeight + r.height);
        if (cinFar) cinFar.style.transform = `translate3d(0, ${progress * 80}px, 0) scale(1.1)`;
        if (cinMid) cinMid.style.transform = `translate3d(0, ${progress * 160}px, 0) scale(1.05)`;
        if (cinNear) cinNear.style.transform = `translate3d(0, ${progress * 240}px, 0)`;
      }
    }
    const hero = document.getElementById('hero');
    if (hero) {
      const yp = window.scrollY;
      const grid = hero.querySelector('.hero-grid');
      if (grid) grid.style.transform = `translate3d(0, ${yp * 0.2}px, 0)`;
    }
  }
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(scrollTick);
  }, { passive: true });

  // ============================================
  // FOOTER particle canvas
  // ============================================
  const fc = document.getElementById('footer-canvas');
  if (fc) {
    const fctx = fc.getContext('2d');
    function fcResize() {
      fc.width = fc.offsetWidth;
      fc.height = fc.offsetHeight;
    }
    fcResize();
    window.addEventListener('resize', fcResize);
    const fps = [];
    for (let i = 0; i < 220; i++) {
      fps.push({
        x: Math.random() * 1600,
        y: Math.random() * 400,
        vy: -0.2 - Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.15,
        r: 0.6 + Math.random() * 2.2,
        a: 0.1 + Math.random() * 0.55,
      });
    }
    function fcLoop() {
      requestAnimationFrame(fcLoop);
      fctx.clearRect(0, 0, fc.width, fc.height);
      for (const p of fps) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -8) { p.y = fc.height + 10; p.x = Math.random() * fc.width; }
        const g = fctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(232, 201, 138, ${p.a})`);
        g.addColorStop(1, 'rgba(201, 169, 110, 0)');
        fctx.fillStyle = g;
        fctx.beginPath();
        fctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        fctx.fill();
      }
    }
    fcLoop();
  }

  // Footer mark glow on view
  const footMark = document.querySelector('.foot-mark');
  if (footMark) {
    new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          footMark.classList.add('glow');
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 }).observe(footMark);
  }

  // ============================================
  // ARM: light follows wrist
  // ============================================
  const armLight = document.querySelector('.arm-light');
  const armWristEl = document.querySelector('#arm-wrist');
  function armLightLoop() {
    if (armLight && armWristEl) {
      const stage = document.querySelector('.arm-stage');
      const sr = stage.getBoundingClientRect();
      const wr = armWristEl.getBoundingClientRect();
      armLight.style.left = (wr.left + wr.width/2 - sr.left - 110) + 'px';
      armLight.style.top = (wr.top + wr.height/2 - sr.top - 110) + 'px';
    }
    requestAnimationFrame(armLightLoop);
  }
  armLightLoop();

  // ============================================
  // ARM ANIMATION on scroll-in
  // ============================================
  const armSec = document.querySelector('.arm-section');
  if (armSec) {
    new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const ids = ['arm-shoulder', 'arm-elbow', 'arm-forearm', 'arm-wrist'];
          const targets = [
            { rot: 0,   delay: 0 },
            { rot: 10,  delay: 250 },
            { rot: 5,   delay: 450 },
            { rot: -5,  delay: 650 },
          ];
          ids.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;
            setTimeout(() => {
              el.style.transition = 'transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1.1)';
              el.style.transform = `rotate(${targets[i].rot}deg)`;
            }, targets[i].delay);
          });
          // fingers
          const fingers = document.querySelectorAll('.finger');
          fingers.forEach((f, i) => {
            setTimeout(() => {
              f.style.transition = 'transform 0.5s ease';
              f.style.transform = 'scaleX(1)';
            }, 900 + i * 70);
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 }).observe(armSec);
  }

})();
