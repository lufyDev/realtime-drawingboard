const socket = io();

const canvas = document.getElementById('board');
const nameInput = document.getElementById('name');
const statusEl = document.getElementById('status');

const getName = () => (nameInput?.value || '').trim() || 'Unknown User';

let statusTimer;

function showStatus(text) {
  if (!statusEl) return;
  statusEl.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    if (statusEl.textContent === text) statusEl.textContent = '';
  }, 700);
}

const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;

let drawing = false;
let color = '#' + Math.floor(Math.random()*16777215).toString(16);

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!drawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const data = { x, y, color, name: getName() };

  // draw locally
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.arc(data.x, data.y, 3, 0, Math.PI * 2); // radius 3 ≈ 6px diameter
  ctx.fill();

  // local status
  showStatus(`${data.name} is drawing…`);

  // send draw event to others
  socket.emit('draw', data);
}

// receive draw data and draw it locally
socket.on('draw', (data) => {
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.arc(data.x, data.y, 3, 0, Math.PI * 2); // radius 3 ≈ 6px diameter
  ctx.fill();

  const name = (data && data.name) ? data.name : 'Unknown User';
  showStatus(`${name} is drawing…`);
});

// clear board
document.getElementById('clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
});

socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
