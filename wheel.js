const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let DATA_FILE = '';
let prizes = [];
let players = [];
let winners = [];
let currentRotation = 0;
let isSpinning = false;

// Lấy đường dẫn file data từ main process
(async () => {
  DATA_FILE = await ipcRenderer.invoke('get-data-path');
  // Load data sau khi có đường dẫn
  loadData();
  drawWheel();

  if (prizes.length === 0) {
    document.getElementById('result').textContent = 'Chưa có giải thưởng! Mở quản trị để thêm.';
    document.getElementById('spinBtn').disabled = true;
  } else if (getAvailablePlayers().length === 0) {
    document.getElementById('result').textContent = 'Không còn người chơi!';
    document.getElementById('spinBtn').disabled = true;
  }
})();

function showNotification(message, type = 'error') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification ' + type;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      prizes = data.prizes || [];
      players = data.players || [];
      winners = data.winners || [];
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function getAvailablePlayers() {
  const wonPlayerIds = winners.map(w => w.playerId);
  return players.filter(p => !wonPlayerIds.includes(p.id));
}

function drawWheel() {
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const availablePlayers = getAvailablePlayers();

  if (availablePlayers.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Không còn người chơi', canvas.width / 2, canvas.height / 2);
    document.getElementById('result').textContent = 'Tất cả người chơi đã trúng thưởng!';
    document.getElementById('spinBtn').disabled = true;
    return;
  }

  canvas.width = 500;
  canvas.height = 500;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - 10;

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const sliceAngle = (2 * Math.PI) / availablePlayers.length;

  availablePlayers.forEach((player, index) => {
    const startAngle = index * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'center';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(player.name, radius * 0.6, 10);
    ctx.restore();
  });
}

function spin() {
  if (isSpinning) return;

  const availablePlayers = getAvailablePlayers();
  if (availablePlayers.length === 0) {
    showNotification('Không còn người chơi để quay!', 'error');
    return;
  }

  if (prizes.length === 0) {
    showNotification('Chưa có giải thưởng! Vui lòng thêm giải thưởng trong phần quản trị.', 'error');
    return;
  }

  const currentPrize = prizes[0];
  if (!currentPrize) return;

  let selectedPlayer;
  if (currentPrize.winnerId) {
    selectedPlayer = availablePlayers.find(p => p.id === currentPrize.winnerId);
    if (!selectedPlayer) {
      showNotification('Người được chỉ định đã trúng giải hoặc không tồn tại!', 'error');
      return;
    }
  } else {
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    selectedPlayer = availablePlayers[randomIndex];
  }

  const selectedIndex = availablePlayers.findIndex(p => p.id === selectedPlayer.id);

  isSpinning = true;
  document.getElementById('spinBtn').disabled = true;
  document.getElementById('result').textContent = 'Đang quay...';

  const sliceAngle = 360 / availablePlayers.length;
  const sliceStart = selectedIndex * sliceAngle;
  const randomOffset = Math.random() * sliceAngle * 0.8 + sliceAngle * 0.1;
  const slicePosition = sliceStart + randomOffset;
  const spins = 5;
  const extraRotation = 360 * spins;

  const currentNormalized = currentRotation % 360;
  const targetPosition = 270 - slicePosition;
  let rotationNeeded = targetPosition - currentNormalized;
  if (rotationNeeded < 0) rotationNeeded += 360;

  const finalRotation = extraRotation + rotationNeeded;

  const wheel = document.getElementById('wheel');
  currentRotation += finalRotation;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    wheel.classList.add('winner-glow');
    const resultEl = document.getElementById('result');
    resultEl.textContent = `🎉 ${selectedPlayer.name} 🎉`;
    resultEl.classList.add('winner');

    setTimeout(() => {
      wheel.classList.remove('winner-glow');
      resultEl.classList.remove('winner');

      winners.push({
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        prizeId: currentPrize.id,
        prizeName: currentPrize.name,
        timestamp: new Date().toISOString()
      });

      prizes.shift();

      saveData();

      showWinner(selectedPlayer.name, currentPrize.name);

      setTimeout(() => {
        drawWheel();
        isSpinning = false;

        if (prizes.length === 0) {
          document.getElementById('result').textContent = 'Đã hết giải thưởng!';
          document.getElementById('spinBtn').disabled = true;
        } else if (getAvailablePlayers().length === 0) {
          document.getElementById('result').textContent = 'Đã hết người chơi!';
          document.getElementById('spinBtn').disabled = true;
        } else {
          document.getElementById('result').textContent = 'Nhấn nút QUAY để tiếp tục!';
          document.getElementById('spinBtn').disabled = false;
        }
      }, 1000);
    }, 2500);
  }, 10000);
}

function showWinner(playerName, prizeName) {
  document.getElementById('winnerName').textContent = playerName;
  document.getElementById('winnerPrize').textContent = `Trúng: ${prizeName}`;
  document.getElementById('winnerPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('winnerPopup').style.display = 'none';
}

function saveData() {
  const data = { prizes, players, winners };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

ipcRenderer.on('data-updated', () => {
  loadData();
  drawWheel();

  if (prizes.length === 0) {
    document.getElementById('result').textContent = 'Chưa có giải thưởng!';
    document.getElementById('spinBtn').disabled = true;
  } else if (getAvailablePlayers().length === 0) {
    document.getElementById('result').textContent = 'Không còn người chơi!';
    document.getElementById('spinBtn').disabled = true;
  } else {
    document.getElementById('result').textContent = 'Nhấn nút QUAY để bắt đầu!';
    document.getElementById('spinBtn').disabled = false;
  }
});

document.getElementById('spinBtn').addEventListener('click', spin);
