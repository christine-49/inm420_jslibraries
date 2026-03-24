// ============================================================
//  VOYA TRAVEL  —  main.js
//  Libraries imported as ES modules (CDN API format):
//    1. Three.js  r128  —  animated particle hero
//    2. Glide.js        —  destination card carousel
//    3. Leaflet   1.9.4 —  interactive world map
//    4. Popper.js 2     —  experience card tooltips
// ============================================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import Glide     from 'https://cdn.jsdelivr.net/npm/@glidejs/glide@3.6.0/dist/glide.esm.js';
import * as L    from 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js';
import { createPopper } from 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/esm/index.js';

// ============================================================
//  BOOT — each init is isolated; one failure won't block others
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  [
    initNav,
    initThreeHero,
    initGlide,
    initLeafletMap,
    initPopperTooltips,
    initNewsletterForm,
  ].forEach(fn => {
    try {
      fn();
    } catch (err) {
      console.warn('[Voya] ' + fn.name + ' failed:', err);
    }
  });
});

// ============================================================
//  1. NAV — scroll class + mobile hamburger
// ============================================================
function initNav() {
  const header    = document.getElementById('siteHeader');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// ============================================================
//  2. THREE.JS — light-theme particle hero
// ============================================================
function initThreeHero() {
  const canvas = document.getElementById('heroCanvas');

  if (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const initW = (canvas.parentElement && canvas.parentElement.offsetWidth)
      ? canvas.parentElement.offsetWidth
      : window.innerWidth;
    const initH = (canvas.parentElement && canvas.parentElement.offsetHeight)
      ? canvas.parentElement.offsetHeight
      : window.innerHeight;
    renderer.setSize(initW, initH);
    renderer.setClearColor(0xfaf8f5, 1);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, initW / initH, 0.1, 1000);
    camera.position.z = 80;

    const PARTICLE_COUNT = 1800;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    const sizes     = new Float32Array(PARTICLE_COUNT);

    const palette = [
      new THREE.Color('#d4a882'),
      new THREE.Color('#c8724a'),
      new THREE.Color('#e8c8a8'),
      new THREE.Color('#b8d0e4'),
      new THREE.Color('#d8c8b8'),
      new THREE.Color('#c4b098'),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 260;
      positions[i3 + 1] = (Math.random() - 0.5) * 180;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i3]     = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
      sizes[i] = Math.random() * 1.8 + 0.4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const glowGeo = new THREE.SphereGeometry(12, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xd4a882, transparent: true, opacity: 0.06 });
    const glow    = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(-30, 10, -20);
    scene.add(glow);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', () => {
      const w = (canvas.parentElement && canvas.parentElement.offsetWidth)
        ? canvas.parentElement.offsetWidth
        : window.innerWidth;
      const h = (canvas.parentElement && canvas.parentElement.offsetHeight)
        ? canvas.parentElement.offsetHeight
        : window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }, { passive: true });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      particles.rotation.y = t * 0.018;
      particles.rotation.x = t * 0.008;
      camera.position.x += (mouseX * 6 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 4 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      glow.scale.setScalar(1 + Math.sin(t * 0.6) * 0.08);
      renderer.render(scene, camera);
    }
    animate();
  }
}

// ============================================================
//  3. GLIDE.JS — destination carousel
// ============================================================
function initGlide() {
  const glideEl = document.getElementById('destinationsGlide');

  if (glideEl) {
    new Glide('#destinationsGlide', {
      type:              'carousel',
      perView:           3,
      gap:               28,
      autoplay:          4500,
      hoverpause:        true,
      animationDuration: 680,
      breakpoints: {
        1024: { perView: 2 },
        640:  { perView: 1 },
      },
    }).mount();
  }
}

// ============================================================
//  4. LEAFLET.JS — interactive destination map
// ============================================================
function initLeafletMap() {
  const mapEl = document.getElementById('leafletMap');

  if (mapEl) {
    const destinations = [
      { lat: 35.0116,  lng: 135.7681, name: 'Kyoto, Japan',           desc: 'Ancient temples, bamboo groves & cherry blossoms.',          region: 'Asia' },
      { lat: 40.6341,  lng: 14.6025,  name: 'Amalfi Coast, Italy',    desc: 'Cliffside villages tumbling into turquoise seas.',            region: 'Europe' },
      { lat: -50.9423, lng: -73.4068, name: 'Patagonia, Argentina',   desc: 'Jagged granite towers and ancient glaciers.',                 region: 'South America' },
      { lat: 31.6295,  lng: -7.9811,  name: 'Marrakech, Morocco',     desc: 'Labyrinthine medinas and spice-scented souks.',              region: 'Africa' },
      { lat: 64.9631,  lng: -19.0208, name: 'Iceland',                 desc: 'Lava fields, geysers & aurora-lit Arctic skies.',            region: 'Europe' },
      { lat: 38.6431,  lng: 34.8307,  name: 'Cappadocia, Turkey',     desc: 'Fairy chimneys and hot air balloon sunrises.',               region: 'Asia' },
      { lat: -18.2871, lng: 147.6992, name: 'Great Barrier Reef, AU', desc: "The world's largest coral reef system.",                     region: 'Oceania' },
      { lat: -1.0413,  lng: 29.6694,  name: 'Bwindi, Uganda',         desc: 'Mountain gorilla trekking in the mist.',                     region: 'Africa' },
      { lat: 68.3557,  lng: 27.5023,  name: 'Lapland, Finland',       desc: 'Husky safaris and Northern Lights under the Arctic sky.',    region: 'Europe' },
      { lat: 42.8782,  lng: -8.5448,  name: 'Santiago de Compostela', desc: 'The ancient Camino de Santiago pilgrimage route ends here.', region: 'Europe' },
      { lat: 61.1152,  lng: 7.0981,   name: 'Sognefjord, Norway',     desc: 'The king of fjords — perfect for sea kayaking.',             region: 'Europe' },
    ];

    const accentIcon = L.divIcon({
      className: '',
      html: '<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">'
          + '<path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="#b85c35"/>'
          + '<circle cx="14" cy="14" r="5" fill="#faf8f5"/>'
          + '</svg>',
      iconSize:    [28, 36],
      iconAnchor:  [14, 36],
      popupAnchor: [0, -38],
    });

    const map = L.map('leafletMap', {
      center: [20, 10],
      zoom: 2,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/" target="_blank">CARTO</a> &copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    destinations.forEach(d => {
      L.marker([d.lat, d.lng], { icon: accentIcon })
        .addTo(map)
        .bindPopup(
          '<h4>' + d.name + '</h4><p>' + d.desc + '</p><small>' + d.region + '</small>',
          { className: 'voya-popup', maxWidth: 220 }
        );
    });
  }
}

// ============================================================
//  5. POPPER.JS — experience card tooltips
// ============================================================
function initPopperTooltips() {
  const pairs = [
    { card: 'exp1', tip: 'tt1' },
    { card: 'exp2', tip: 'tt2' },
    { card: 'exp3', tip: 'tt3' },
    { card: 'exp4', tip: 'tt4' },
    { card: 'exp5', tip: 'tt5' },
    { card: 'exp6', tip: 'tt6' },
  ];

  pairs.forEach(({ card, tip }) => {
    const cardEl = document.getElementById(card);
    const tipEl  = document.getElementById(tip);

    if (cardEl && tipEl) {
      const popperInstance = createPopper(cardEl, tipEl, {
        placement: 'top',
        modifiers: [
          { name: 'offset',          options: { offset: [0, 10] } },
          { name: 'preventOverflow', options: { padding: 8 } },
          { name: 'flip',            options: { fallbackPlacements: ['bottom', 'right', 'left'] } },
          { name: 'arrow',           options: { element: '[data-popper-arrow]' } },
        ],
      });

      const show = () => { tipEl.setAttribute('data-show', ''); popperInstance.update(); };
      const hide = () => { tipEl.removeAttribute('data-show'); };
      ['mouseenter', 'focus' ].forEach(ev => cardEl.addEventListener(ev, show));
      ['mouseleave', 'blur'  ].forEach(ev => cardEl.addEventListener(ev, hide));
    }
  });
}

// ============================================================
//  6. NEWSLETTER FORM — validation & feedback
// ============================================================
function initNewsletterForm() {
  const form    = document.getElementById('newsletterForm');
  const nameIn  = document.getElementById('nameInput');
  const emailIn = document.getElementById('emailInput');
  const msg     = document.getElementById('formMessage');

  if (form && nameIn && emailIn && msg) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name  = nameIn.value.trim();
      const email = emailIn.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (name.length === 0) {
        msg.style.color = '#c03a1a';
        msg.textContent = 'Please enter your name.';
        nameIn.focus();
        return;
      }

      if (email.length === 0 || emailPattern.test(email) === false) {
        msg.style.color = '#c03a1a';
        msg.textContent = 'Please enter a valid email address.';
        emailIn.focus();
        return;
      }

      msg.style.color = '#b85c35';
      msg.textContent = 'Welcome aboard, ' + name + '! Check your inbox for a confirmation.';
      nameIn.value  = '';
      emailIn.value = '';
      setTimeout(() => { msg.textContent = ''; }, 6000);
    });
  }
}
