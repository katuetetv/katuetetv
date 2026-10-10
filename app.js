/* =====================================================
   KATUETE TV — JavaScript Principal
   Player em vivo sem controles de avanço
   ===================================================== */

// ── Programas / Videos ─────────────────────────────────
const PROGRAMS = [
  {
    title: "Looney Tunes en Español Latino",
    url: "https://www.youtube.com/watch?v=Er5iy1Cyovg"
  },
  {
    title: "Pink Panther — Compilación 35 Minutos",
    url: "https://www.youtube.com/watch?v=nWNqU0gv_P8"
  },
  {
    title: "Bob Esponja — Cocina Todo Menos Cangreburguers",
    url: "https://www.youtube.com/watch?v=zKMeibdY_SM"
  }
];

// ── Extraer Video ID de YouTube ────────────────────────
function getYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ── Construir URL embed SOLO con play/fullscreen, sin avanzar ──
function buildEmbedUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: "1",
    controls: "1",       // mostrar controles del player
    disablekb: "1",      // deshabilitar teclado (no skip)
    fs: "1",             // botón fullscreen activado
    iv_load_policy: "3", // sin anotaciones
    modestbranding: "1", // branding mínimo
    rel: "0",            // sin videos relacionados
    start: "0",
    playsinline: "1",
    cc_load_policy: "0",
    // No hay forma 100% nativa de ocultar barra de progreso sin API,
    // pero con la API de IFrame podemos gestionar eventos.
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

// ── Estado ─────────────────────────────────────────────
let currentIndex = -1;

// ── DOM ────────────────────────────────────────────────
const playlist       = document.getElementById("playlist");
const playlistCount  = document.getElementById("playlistCount");
const ytPlayer       = document.getElementById("ytPlayer");
const ytContainer    = document.getElementById("ytPlayerContainer");
const placeholder    = document.getElementById("playerPlaceholder");
const titleEl        = document.getElementById("currentProgramTitle");
const timeEl         = document.getElementById("playerTime");

// ── Renderizar Playlist ────────────────────────────────
function renderPlaylist() {
  playlist.innerHTML = "";
  playlistCount.textContent = `${PROGRAMS.length} programa${PROGRAMS.length !== 1 ? "s" : ""}`;

  PROGRAMS.forEach((prog, i) => {
    const li = document.createElement("li");
    li.className = "playlist-item";
    li.id = `prog-${i}`;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", `Ver ${prog.title}`);
    li.setAttribute("tabindex", "0");

    li.innerHTML = `
      <div class="playlist-item-num">${i + 1}</div>
      <div class="playlist-item-info">
        <div class="playlist-item-title">${prog.title}</div>
        <div class="playlist-item-live">● EN VIVO</div>
      </div>
      <div class="playlist-item-play">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    `;

    li.addEventListener("click", () => playProgram(i));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playProgram(i); }
    });

    playlist.appendChild(li);
  });
}

// ── Reproducir Programa ────────────────────────────────
function playProgram(index) {
  if (index === currentIndex) return; // ya está reproduciendo
  currentIndex = index;

  const prog = PROGRAMS[index];
  const videoId = getYouTubeId(prog.url);
  if (!videoId) return;

  // Actualizar título
  titleEl.textContent = prog.title;

  // Cambiar iframe src
  ytPlayer.src = buildEmbedUrl(videoId);

  // Mostrar player, ocultar placeholder
  placeholder.style.display = "none";
  ytContainer.style.display = "block";

  // Marcar activo en playlist
  document.querySelectorAll(".playlist-item").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

  // Scroll suave al player
  document.getElementById("player-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Reloj en vivo ──────────────────────────────────────
function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, "0");
  const mm  = String(now.getMinutes()).padStart(2, "0");
  const ss  = String(now.getSeconds()).padStart(2, "0");
  timeEl.textContent = `${hh}:${mm}:${ss}`;
}

// ── Partículas de fondo animadas ───────────────────────
function createParticles() {
  const container = document.getElementById("bgParticles");
  const count = 30;
  const colors = ["#ed1c31", "#FE851A", "#ff6b6b", "#ffa040"];

  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    const left = Math.random() * 100;
    const dur  = 8 + Math.random() * 12;
    const delay = Math.random() * 10;
    const size = 1 + Math.random() * 3;
    const color = colors[Math.floor(Math.random() * colors.length)];

    span.style.cssText = `
      left: ${left}%;
      bottom: 0;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      --dur: ${dur}s;
      --delay: ${delay}s;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(span);
  }
}

// ── Header scroll shadow ───────────────────────────────
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header.style.borderBottomColor = "rgba(237, 28, 49, 0.3)";
      header.style.boxShadow = "0 4px 30px rgba(0,0,0,0.5)";
    } else {
      header.style.borderBottomColor = "rgba(237, 28, 49, 0.18)";
      header.style.boxShadow = "none";
    }
  });
}

// ── Intersection Observer: animación al entrar ─────────
function initScrollAnimations() {
  const sections = document.querySelectorAll(
    ".hero-section, .player-section, .about-section, .features-section, .contact-section, .feature-card"
  );
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(el => {
    el.style.animationPlayState = "paused";
    obs.observe(el);
  });
}

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  createParticles();
  renderPlaylist();
  initHeaderScroll();
  initScrollAnimations();

  // Reloj
  updateClock();
  setInterval(updateClock, 1000);
});
