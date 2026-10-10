/* =====================================================
   KATUETE TV — Transmisión Directa y Continua
   Player de canal único sin avance manual
   ===================================================== */

// ── Configuración del Canal Principal ─────────────────
// Video en transmisión continua (Looney Tunes en Español Latino)
const LIVE_STREAM_CONFIG = {
  title: "Katuete TV — Señal Oficial en Vivo",
  videoId: "Er5iy1Cyovg"
};

let ytPlayerInstance = null;
let isPlaying = false;

// ── Cargar YouTube IFrame API de forma asíncrona ──────
(function loadYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// ── Callback global llamado automáticamente por YouTube API ──
window.onYouTubeIframeAPIReady = function() {
  ytPlayerInstance = new YT.Player("ytPlayer", {
    videoId: LIVE_STREAM_CONFIG.videoId,
    playerVars: {
      autoplay: 1,         // Iniciar automáticamente
      controls: 0,         // Oculta los controles nativos y barra de progreso (no adelantar)
      disablekb: 1,        // Deshabilita teclas de flechas (no adelantar)
      fs: 0,               // Deshabilita fullscreen nativo (usamos el nuestro)
      modestbranding: 1,   // Branding mínimo
      rel: 0,              // Sin videos relacionados
      playsinline: 1,      // Reproducir en línea en móviles
      iv_load_policy: 3,   // Sin anotaciones
      loop: 1,             // Repetir en bucle continuo de TV
      playlist: LIVE_STREAM_CONFIG.videoId
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

// ── Evento: Player Listo ──────────────────────────────
function onPlayerReady(event) {
  // Intentar reproducir automáticamente
  event.target.playVideo();

  // Verificar si el navegador bloqueó el audio debido a políticas de autoplay
  setTimeout(() => {
    if (ytPlayerInstance && typeof ytPlayerInstance.isMuted === "function") {
      if (ytPlayerInstance.isMuted()) {
        showUnmuteOverlay();
      }
    }
  }, 1000);
}

// ── Evento: Cambio de Estado del Player ───────────────
function onPlayerStateChange(event) {
  const iconPlay = document.getElementById("iconPlay");
  const iconPause = document.getElementById("iconPause");
  const textPlayPause = document.getElementById("textPlayPause");

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (iconPlay) iconPlay.style.display = "none";
    if (iconPause) iconPause.style.display = "inline";
    if (textPlayPause) textPlayPause.textContent = "Pausar";
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    if (iconPlay) iconPlay.style.display = "inline";
    if (iconPause) iconPause.style.display = "none";
    if (textPlayPause) textPlayPause.textContent = "Reproducir";

    // Si terminó, reiniciar para mantener aspecto de transmisión continua
    if (event.data === YT.PlayerState.ENDED) {
      event.target.playVideo();
    }
  }
}

// ── Overlay para activar audio ─────────────────────────
function showUnmuteOverlay() {
  const unmuteBtn = document.getElementById("unmuteOverlay");
  if (unmuteBtn) {
    unmuteBtn.style.display = "inline-flex";
    unmuteBtn.onclick = () => {
      if (ytPlayerInstance) {
        ytPlayerInstance.unMute();
        ytPlayerInstance.setVolume(100);
      }
      unmuteBtn.style.display = "none";
    };
  }
}

// ── Controles personalizados del Player ────────────────
function setupCustomControls() {
  const btnPlayPause = document.getElementById("btnPlayPause");
  const btnFullscreen = document.getElementById("btnFullscreen");
  const playerContainer = document.getElementById("playerContainer");

  // 1. Botón Play / Pausa
  if (btnPlayPause) {
    btnPlayPause.addEventListener("click", () => {
      if (!ytPlayerInstance || typeof ytPlayerInstance.getPlayerState !== "function") return;

      const state = ytPlayerInstance.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayerInstance.pauseVideo();
      } else {
        ytPlayerInstance.unMute();
        ytPlayerInstance.playVideo();
        const unmuteBtn = document.getElementById("unmuteOverlay");
        if (unmuteBtn) unmuteBtn.style.display = "none";
      }
    });
  }

  // 2. Botón Pantalla Completa
  if (btnFullscreen && playerContainer) {
    btnFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        if (playerContainer.requestFullscreen) {
          playerContainer.requestFullscreen();
        } else if (playerContainer.webkitRequestFullscreen) {
          playerContainer.webkitRequestFullscreen();
        } else if (playerContainer.msRequestFullscreen) {
          playerContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });
  }
}

// ── Reloj en vivo ──────────────────────────────────────
function updateClock() {
  const timeEl = document.getElementById("playerTime");
  if (!timeEl) return;
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, "0");
  const mm  = String(now.getMinutes()).padStart(2, "0");
  const ss  = String(now.getSeconds()).padStart(2, "0");
  timeEl.textContent = `${hh}:${mm}:${ss}`;
}

// ── Partículas de fondo animadas ───────────────────────
function createParticles() {
  const container = document.getElementById("bgParticles");
  if (!container) return;
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
  if (!header) return;
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

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  createParticles();
  setupCustomControls();
  initHeaderScroll();

  // Reloj en tiempo real
  updateClock();
  setInterval(updateClock, 1000);
});
