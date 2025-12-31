const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const PASSWORD = '123456';

let DATA_FILE = '';
let prizes = [];
let players = [];
let winners = [];

// Lấy đường dẫn file data từ main process
(async () => {
  DATA_FILE = await ipcRenderer.invoke('get-data-path');
})();

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification ' + type;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    messageEl.textContent = message;
    dialog.style.display = 'flex';

    const handleYes = () => {
      dialog.style.display = 'none';
      yesBtn.removeEventListener('click', handleYes);
      noBtn.removeEventListener('click', handleNo);
      resolve(true);
    };

    const handleNo = () => {
      dialog.style.display = 'none';
      yesBtn.removeEventListener('click', handleYes);
      noBtn.removeEventListener('click', handleNo);
      resolve(false);
    };

    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
  });
}

function login() {
  const password = document.getElementById('password').value;
  if (password === PASSWORD) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadData();
    renderAll();
  } else {
    document.getElementById('error').style.display = 'block';
    setTimeout(() => {
      document.getElementById('error').style.display = 'none';
    }, 3000);
  }
}

document.getElementById('password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    login();
  }
});

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

function saveData() {
  const data = { prizes, players, winners };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  ipcRenderer.send('refresh-main');
}

function addPrize() {
  const nameInput = document.getElementById('prizeName');
  const name = nameInput.value.trim();
  const winnerId = document.getElementById('prizeWinner').value;

  if (!name) {
    showNotification('Vui lòng nhập tên giải thưởng!', 'error');
    nameInput.focus();
    return;
  }

  const prize = {
    id: Date.now().toString(),
    name: name,
    winnerId: winnerId || null
  };

  prizes.push(prize);
  saveData();
  renderPrizes();
  nameInput.value = '';
  document.getElementById('prizeWinner').value = '';
  showNotification('Đã thêm giải thưởng thành công!', 'success');
  nameInput.focus();
}

async function deletePrize(id) {
  const confirmed = await showConfirm('Bạn có chắc muốn xóa giải thưởng này?');
  if (confirmed) {
    prizes = prizes.filter(p => p.id !== id);
    saveData();
    renderPrizes();
    showNotification('Đã xóa giải thưởng!', 'success');
  }
}

function addPlayer() {
  const nameInput = document.getElementById('playerName');
  const name = nameInput.value.trim();

  if (!name) {
    showNotification('Vui lòng nhập tên người chơi!', 'error');
    nameInput.focus();
    return;
  }

  const player = {
    id: Date.now().toString(),
    name: name
  };

  players.push(player);
  saveData();
  renderPlayers();
  updatePrizeWinnerSelect();
  nameInput.value = '';
  showNotification('Đã thêm người chơi thành công!', 'success');
  nameInput.focus();
}

async function deletePlayer(id) {
  const hasWon = winners.some(w => w.playerId === id);
  if (hasWon) {
    showNotification('Không thể xóa người chơi đã trúng thưởng!', 'error');
    return;
  }

  const confirmed = await showConfirm('Bạn có chắc muốn xóa người chơi này?');
  if (confirmed) {
    players = players.filter(p => p.id !== id);
    prizes = prizes.map(prize => {
      if (prize.winnerId === id) {
        return { ...prize, winnerId: null };
      }
      return prize;
    });
    saveData();
    renderPlayers();
    renderPrizes();
    updatePrizeWinnerSelect();
    showNotification('Đã xóa người chơi!', 'success');
  }
}

function renderPrizes() {
  const list = document.getElementById('prizeList');
  if (prizes.length === 0) {
    list.innerHTML = '<p style="color: rgba(255, 255, 255, 0.9); text-align: center; font-weight: 500;">Chưa có giải thưởng nào</p>';
    return;
  }

  list.innerHTML = prizes.map((prize, index) => {
    const winnerName = prize.winnerId
      ? players.find(p => p.id === prize.winnerId)?.name || 'Không xác định'
      : 'Ngẫu nhiên';

    return `
      <div class="list-item">
        <div class="list-item-info">
          <strong>Giải ${index + 1}:</strong> ${prize.name}
          <br>
          <small>Người trúng: ${winnerName}</small>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-danger" onclick="deletePrize('${prize.id}')">Xóa</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPlayers() {
  const list = document.getElementById('playerList');
  if (players.length === 0) {
    list.innerHTML = '<p style="color: rgba(255, 255, 255, 0.9); text-align: center; font-weight: 500;">Chưa có người chơi nào</p>';
    return;
  }

  const wonPlayerIds = winners.map(w => w.playerId);

  list.innerHTML = players.map(player => {
    const hasWon = wonPlayerIds.includes(player.id);
    const badge = hasWon ? '<span class="badge won">Đã trúng</span>' : '<span class="badge">Chưa trúng</span>';

    return `
      <div class="list-item">
        <div class="list-item-info">
          <strong>${player.name}</strong> ${badge}
        </div>
        <div class="list-item-actions">
          ${!hasWon ? `<button class="btn btn-danger" onclick="deletePlayer('${player.id}')">Xóa</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderWinners() {
  const tbody = document.getElementById('winnerTableBody');
  if (winners.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Chưa có người trúng thưởng</td></tr>';
    return;
  }

  tbody.innerHTML = winners.map((winner, index) => {
    const date = new Date(winner.timestamp);
    const timeStr = date.toLocaleString('vi-VN');

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${winner.playerName}</td>
        <td>${winner.prizeName}</td>
        <td>${timeStr}</td>
      </tr>
    `;
  }).join('');
}

function updatePrizeWinnerSelect() {
  const select = document.getElementById('prizeWinner');
  const wonPlayerIds = winners.map(w => w.playerId);
  const availablePlayers = players.filter(p => !wonPlayerIds.includes(p.id));

  select.innerHTML = '<option value="">Ngẫu nhiên</option>';
  availablePlayers.forEach(player => {
    const option = document.createElement('option');
    option.value = player.id;
    option.textContent = player.name;
    select.appendChild(option);
  });
}

function renderAll() {
  renderPrizes();
  renderPlayers();
  renderWinners();
  updatePrizeWinnerSelect();
}

async function resetAll() {
  const confirmed = await showConfirm('Bạn có chắc muốn reset toàn bộ dữ liệu? Hành động này không thể hoàn tác!');
  if (confirmed) {
    prizes = [];
    players = [];
    winners = [];
    saveData();
    renderAll();
    showNotification('Đã reset toàn bộ dữ liệu!', 'success');
  }
}

document.getElementById('prizeName').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addPrize();
  }
});

document.getElementById('playerName').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addPlayer();
  }
});
