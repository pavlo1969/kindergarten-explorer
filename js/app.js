// ─────────────────────────────────────────────────────────────────────────────
// Kindergarten Explorer — App Logic
// ─────────────────────────────────────────────────────────────────────────────

const DIRS = ['forward', 'backward', 'left', 'right'];

const MIME = { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', ogv: 'video/ogg' };
function videoMime(path) {
  const ext = path.split('.').pop().toLowerCase();
  return MIME[ext] || 'video/mp4';
}
const KEY_MAP = {
  ArrowUp: 'forward', ArrowDown: 'backward',
  ArrowLeft: 'left',  ArrowRight: 'right',
};

class KindergartenApp {
  constructor() {
    this.current      = null;
    this.videoReady   = false;
    this._phTimer     = null;

    // DOM
    this.app          = document.getElementById('app');
    this.video        = document.getElementById('main-video');
    this.videoSource  = document.getElementById('video-source');
    this.placeholder  = document.getElementById('placeholder');
    this.placeholderBg= document.getElementById('placeholder-bg');
    this.kidFace      = document.getElementById('kid-face');
    this.speechText   = document.getElementById('speech-text');
    this.locationEmoji= document.getElementById('location-emoji');
    this.locationName = document.getElementById('location-name-display');
    this.locationPhoto= document.getElementById('location-photo');
    this.skipBtn      = document.getElementById('skip-btn');
    this.replayBtn    = document.getElementById('replay-btn');
    this.overlay      = document.getElementById('transition-overlay');
    this.mapSvg       = document.getElementById('map-svg');

    // Arrow buttons keyed by direction
    this.arrows = {};
    DIRS.forEach(dir => {
      this.arrows[dir] = document.getElementById(`nav-${dir}`);
    });

    this._bindEvents();
    this._buildMiniMap();
    this.goTo(STARTING_LOCATION);
  }

  // ── Navigate to a location ────────────────────────────────────────────────

  goTo(id, animate = false) {
    if (animate) {
      this._hideArrows();
      this._fadeOut(() => this._arrive(id));
    } else {
      this._arrive(id);
    }
  }

  _arrive(id) {
    this.current = LOCATIONS[id];
    this._updateHUD();
    this._updateMiniMap();
    this._startScene();
    this._fadeIn();
  }

  // ── Scene: try video, fall back to animated placeholder ──────────────────

  _startScene() {
    this.videoReady = false;
    clearTimeout(this._phTimer);

    const loc = this.current;

    // Reset video
    this.video.pause();
    this.video.removeAttribute('src');
    this.videoSource.src = '';
    this.video.load();
    this.video.style.display = 'none';

    // Set placeholder
    this.placeholder.style.display = 'flex';
    this.placeholderBg.style.background = loc.bgGradient;
    this.kidFace.textContent  = loc.kidEmoji;
    this.speechText.textContent = loc.speech;

    // Controls: show skip, hide replay
    this.skipBtn.style.display   = 'block';
    this.replayBtn.style.display = 'none';

    // Try to load a real video
    if (loc.video) {
      const probe = document.createElement('video');
      probe.src     = loc.video;
      probe.preload = 'metadata';

      probe.onloadedmetadata = () => {
        this.videoSource.src  = loc.video;
        this.videoSource.type = videoMime(loc.video);
        this.video.load();
        this.video.style.display  = 'block';
        this.placeholder.style.display = 'none';
        this.video.play().catch(() => {});
        this.videoReady = true;
      };

      // No file → auto-show nav after 5 s of placeholder
      probe.onerror = () => this._startPlaceholderTimer();
    } else {
      this._startPlaceholderTimer();
    }

    // Safety: also start timer (video.ended event handles real videos)
    this._startPlaceholderTimer();
  }

  _startPlaceholderTimer() {
    clearTimeout(this._phTimer);
    this._phTimer = setTimeout(() => {
      if (!this.videoReady) this._showArrows();
    }, 5000);
  }

  // ── Show / hide directional arrows ───────────────────────────────────────

  _showArrows() {
    clearTimeout(this._phTimer);
    this.skipBtn.style.display   = 'none';
    this.replayBtn.style.display = 'block';

    // Show location photo as background (hides video/placeholder beneath)
    const photo = this.locationPhoto;
    const src   = this.current.photo;
    if (src) {
      photo.style.display = 'block';
      if (photo.dataset.src !== src) {
        photo.classList.remove('visible');
        photo.src = src;
        photo.dataset.src = src;
        photo.onload  = () => photo.classList.add('visible');
        photo.onerror = () => { photo.style.display = 'none'; }; // fallback: keep video/placeholder
      } else {
        photo.classList.add('visible');
      }
    }

    DIRS.forEach(dir => {
      const destId = this.current.connections[dir];
      const dest   = destId ? LOCATIONS[destId] : null;
      const btn    = this.arrows[dir];

      if (dest) {
        // Set room label
        btn.querySelector('.arrow-room').textContent = `${dest.emoji} ${dest.name}`;
        // Tint via CSS custom property
        btn.style.setProperty('--btn-color', dest.color);
        // Show with entrance animation
        btn.style.display = 'flex';
        btn.classList.remove('visible');
        // Force reflow so animation re-triggers
        void btn.offsetWidth;
        btn.classList.add('visible');
      } else {
        btn.style.display = 'none';
        btn.classList.remove('visible');
      }
    });
  }

  _hideArrows() {
    DIRS.forEach(dir => {
      this.arrows[dir].style.display = 'none';
      this.arrows[dir].classList.remove('visible');
    });
    // Hide photo so video/placeholder is visible again
    this.locationPhoto.classList.remove('visible');
    this.locationPhoto.style.display = 'none';
  }

  // ── HUD update ───────────────────────────────────────────────────────────

  _updateHUD() {
    const loc = this.current;
    this.locationEmoji.textContent = loc.emoji;
    this.locationName.textContent  = loc.name;
  }

  // ── Mini-map ─────────────────────────────────────────────────────────────

  _buildMiniMap() {
    const svg = this.mapSvg;
    svg.innerHTML = '';

    // Lines
    MAP_CONNECTIONS.forEach(([a, b]) => {
      const pa = LOCATIONS[a].mapPos, pb = LOCATIONS[b].mapPos;
      svg.appendChild(this._svgEl('line', {
        x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y,
        stroke: 'rgba(255,255,255,0.3)', 'stroke-width': 2.5,
      }));
    });

    // Nodes
    Object.values(LOCATIONS).forEach(loc => {
      const g = this._svgEl('g', {
        class: `map-node map-node-${loc.id}`,
        style: 'cursor:pointer',
      });

      g.appendChild(this._svgEl('circle', {
        cx: loc.mapPos.x, cy: loc.mapPos.y, r: 14,
        fill: 'none', stroke: loc.color, 'stroke-width': 2.5,
        class: 'node-ring', opacity: 0,
      }));
      g.appendChild(this._svgEl('circle', {
        cx: loc.mapPos.x, cy: loc.mapPos.y, r: 9,
        fill: loc.color, stroke: '#fff', 'stroke-width': 2,
      }));

      const txt = this._svgEl('text', {
        x: loc.mapPos.x, y: loc.mapPos.y + 5,
        'text-anchor': 'middle', 'font-size': '9',
        class: 'map-emoji',
      });
      txt.textContent = loc.emoji;

      g.appendChild(txt);
      g.addEventListener('click', () => this.goTo(loc.id, true));
      svg.appendChild(g);
    });
  }

  _updateMiniMap() {
    document.querySelectorAll('.node-ring').forEach(r => r.setAttribute('opacity', '0'));
    document.querySelectorAll('.map-node').forEach(n => n.classList.remove('active'));

    const ring = document.querySelector(`.map-node-${this.current.id} .node-ring`);
    if (ring) ring.setAttribute('opacity', '1');
    document.querySelector(`.map-node-${this.current.id}`)?.classList.add('active');
  }

  _svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  // ── Transitions ───────────────────────────────────────────────────────────

  _fadeOut(cb) {
    this.overlay.classList.add('visible');
    this.overlay.addEventListener('transitionend', cb, { once: true });
  }

  _fadeIn() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.overlay.classList.remove('visible');
    }));
  }

  // ── Event bindings ────────────────────────────────────────────────────────

  _bindEvents() {
    // Video ended → show arrows
    this.video.addEventListener('ended', () => this._showArrows());

    // Skip
    this.skipBtn.addEventListener('click', () => {
      this.video.pause();
      this._showArrows();
    });

    // Replay
    this.replayBtn.addEventListener('click', () => {
      this._hideArrows();
      this.skipBtn.style.display   = 'block';
      this.replayBtn.style.display = 'none';
      if (this.videoReady) {
        this.video.currentTime = 0;
        this.video.play();
      } else {
        this._startPlaceholderTimer();
      }
    });

    // Arrow buttons
    DIRS.forEach(dir => {
      const btn = this.arrows[dir];
      // Use touchstart for instant mobile response, fall back to click
      const navigate = (e) => {
        e.preventDefault();
        const destId = this.current.connections[dir];
        if (destId) this.goTo(destId, true);
      };
      btn.addEventListener('touchstart', navigate, { passive: false });
      btn.addEventListener('click', navigate);
    });

    // Keyboard (desktop/accessibility)
    document.addEventListener('keydown', e => {
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      const destId = this.current.connections[dir];
      if (destId) this.goTo(destId, true);
    });
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => { window._app = new KindergartenApp(); });
