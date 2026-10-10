/* =====================================================
   KATUETE TV — Transmisión Directa y Continua
   Control de Player en Vivo (Play/Pausa, Audio y Pantalla Completa)
   ===================================================== */

let isPlaying = true;
let isMuted = true;

// ── Enviar comando al reproductor de YouTube mediante postMessage ──
function sendCommand(func, args) {
  const iframe = document.getElementById("ytIframe");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: func,
        args: args || []
      }),
      "*"
    );
  }
}

// ── Actualizar interfaz del botón Play / Pausa ───────
function updatePlayState(playing) {
  isPlaying = playing;
  const iconPlay = document.getElementById("iconPlay");
  const iconPause = document.getElementById("iconPause");
  const textPlayPause = document.getElementById("textPlayPause");

  if (iconPlay && iconPause && textPlayPause) {
    if (isPlaying) {
      iconPlay.style.display = "none";
      iconPause.style.display = "inline";
      textPlayPause.textContent = "Pausar";
    } else {
      iconPlay.style.display = "inline";
      iconPause.style.display = "none";
      textPlayPause.textContent = "Reproducir";
    }
  }
}

// ── Actualizar interfaz del botón de Audio (Abajo de la pantalla) ──
function updateAudioState(muted) {
  isMuted = muted;
  const iconMuted = document.getElementById("iconMuted");
  const iconUnmuted = document.getElementById("iconUnmuted");
  const textAudio = document.getElementById("textAudio");
  const btnAudio = document.getElementById("btnAudio");

  if (iconMuted && iconUnmuted && textAudio && btnAudio) {
    if (isMuted) {
      iconMuted.style.display = "inline";
      iconUnmuted.style.display = "none";
      textAudio.textContent = "Activar Sonido";
      btnAudio.classList.add("pulse-audio");
    } else {
      iconMuted.style.display = "none";
      iconUnmuted.style.display = "inline";
      textAudio.textContent = "Silenciar";
      btnAudio.classList.remove("pulse-audio");
    }
  }
}

// ── Configurar Controles ────────────────────────────
function setupControls() {
  const btnPlayPause = document.getElementById("btnPlayPause");
  const btnAudio = document.getElementById("btnAudio");
  const btnFullscreen = document.getElementById("btnFullscreen");
  const playerContainer = document.getElementById("playerContainer");

  // 1. Botón Play / Pausa
  if (btnPlayPause) {
    btnPlayPause.addEventListener("click", () => {
      if (isPlaying) {
        sendCommand("pauseVideo");
        updatePlayState(false);
      } else {
        sendCommand("playVideo");
        updatePlayState(true);
      }
    });
  }

  // 2. Botón Activar / Silenciar Sonido (Abajo de la pantalla)
  if (btnAudio) {
    btnAudio.addEventListener("click", () => {
      if (isMuted) {
        sendCommand("unMute");
        sendCommand("setVolume", [100]);
        sendCommand("playVideo");
        updatePlayState(true);
        updateAudioState(false);
      } else {
        sendCommand("mute");
        updateAudioState(true);
      }
    });
  }

  // 3. Botón Pantalla Completa
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

// ── Escuchar respuestas del reproductor de YouTube ───
window.addEventListener("message", (event) => {
  try {
    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    if (data && data.event === "onStateChange") {
      // 1 = Reproduciendo, 2 = Pausado, 0 = Terminado
      if (data.info === 1) {
        updatePlayState(true);
      } else if (data.info === 2) {
        updatePlayState(false);
      } else if (data.info === 0) {
        // Al terminar, reiniciar automáticamente (bucle TV continua)
        sendCommand("playVideo");
        updatePlayState(true);
      }
    }
  } catch (e) {
    // Mensajes no relacionados con el player
  }
});

// ── Reloj en tiempo real para transmisión en vivo ─────
function updateClock() {
  const timeEl = document.getElementById("playerTime");
  if (!timeEl) return;
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, "0");
  const mm  = String(now.getMinutes()).padStart(2, "0");
  const ss  = String(now.getSeconds()).padStart(2, "0");
  timeEl.textContent = `${hh}:${mm}:${ss}`;
}

// ── Partículas de fondo animadas ──────────────────────
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

// ── Inicialización ────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  createParticles();
  setupControls();

  // Reloj
  updateClock();
  setInterval(updateClock, 1000);

  // Asegurar inicio inmediato de reproducción
  setTimeout(() => {
    sendCommand("playVideo");
  }, 500);
});
