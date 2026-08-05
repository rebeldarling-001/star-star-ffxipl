// ffxipl-celebration.js
// Full-screen "SOLD!" / "UNSOLD" moment with confetti, shared across pages.
// Requires this markup somewhere in the page body (same IDs everywhere):
//
// <div id="celebrationOverlay">
//   <div id="celebrationConfetti"></div>
//   <div class="celebration-card" id="celebrationCard">
//     <div class="celebration-icon" id="celebrationIcon"></div>
//     <div class="celebration-title" id="celebrationTitle"></div>
//     <div class="celebration-sub" id="celebrationSub"></div>
//     <button class="celebration-close" id="celebrationClose">✕</button>
//   </div>
// </div>
//
// Call: ffxiplCelebrate('sold', 'SOLD!', 'Player Name → TEAM for ₹50L')
//       ffxiplCelebrate('unsold', 'UNSOLD', 'Player Name goes unsold')

let _ffxiplCelebrateTimer = null;

function ffxiplCelebrate(type, title, sub) {
  const overlay = document.getElementById('celebrationOverlay');
  if (!overlay) return;
  const card = document.getElementById('celebrationCard');
  const confettiWrap = document.getElementById('celebrationConfetti');

  document.getElementById('celebrationIcon').textContent = type === 'sold' ? '🎉' : '🔨';
  document.getElementById('celebrationTitle').textContent = title;
  document.getElementById('celebrationSub').textContent = sub;
  card.className = 'celebration-card ' + type;

  confettiWrap.innerHTML = '';
  if (type === 'sold') {
    const colors = ['#eab34a', '#f6dfa3', '#4ade80', '#ffffff', '#a9791f'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (2 + Math.random() * 1.8) + 's';
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      piece.style.setProperty('--drift', (Math.random() * 140 - 70) + 'px');
      piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      confettiWrap.appendChild(piece);
    }
  }

  overlay.classList.add('show');
  clearTimeout(_ffxiplCelebrateTimer);
  _ffxiplCelebrateTimer = setTimeout(() => overlay.classList.remove('show'), 5200);

  const closeBtn = document.getElementById('celebrationClose');
  closeBtn.onclick = () => {
    overlay.classList.remove('show');
    clearTimeout(_ffxiplCelebrateTimer);
  };
}

// Detects sold/unsold transitions from a players array and fires the
// celebration once per player. Call this every time you refetch players.
// `resolveMessage(player)` returns { title, sub } for the given player.
function ffxiplWatchForResults(players, prevMapRef, resolveMessage) {
  const newById = {};
  players.forEach(p => newById[p.id] = p);
  if (prevMapRef.current) {
    for (const id in newById) {
      const now = newById[id], before = prevMapRef.current[id];
      if (before && before.status !== now.status && (now.status === 'sold' || now.status === 'unsold')) {
        const msg = resolveMessage(now);
        ffxiplCelebrate(now.status === 'sold' ? 'sold' : 'unsold', msg.title, msg.sub);
      }
    }
  }
  prevMapRef.current = newById;
}