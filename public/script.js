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
let lastX = 0;
let lastY = 0;
let remoteLastByName = {};
let justStarted = false;

// smoother strokes
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.lineWidth = 6; // matches ~6px diameter of previous dots

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  justStarted = true;
});
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);

// touch support (mobile)
canvas.addEventListener('touchstart', (e) => {
  drawing = true;
  if (e && e.cancelable) e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
  if (t) {
    lastX = t.clientX - rect.left;
    lastY = t.clientY - rect.top;
  }
  justStarted = true;
}, { passive: false });
canvas.addEventListener('touchend', () => drawing = false);
canvas.addEventListener('touchcancel', () => drawing = false);
canvas.addEventListener('touchmove', draw, { passive: false });

function draw(e) {
  if (!drawing) return;

  // Determine pointer coordinates for both mouse and touch
  let clientX, clientY;
  if (e && e.touches && e.touches.length) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e && e.changedTouches && e.changedTouches.length) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  // Prevent page scroll/zoom while drawing on touch devices
  if (e && e.cancelable) e.preventDefault();

  const data = { x, y, color, name: getName(), start: justStarted };

  // draw locally (smooth line segment)
  ctx.strokeStyle = data.color;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  lastX = data.x;
  lastY = data.y;
  justStarted = false;

  // local status
  showStatus(`${data.name} is drawing…`);

  // send draw event to others
  socket.emit('draw', data);
}

// receive draw data and draw it locally (smooth per-user lines)
socket.on('draw', (data) => {
  const name = (data && data.name) ? data.name : 'Unknown User';
  const isStart = !!(data && data.start);
  const last = remoteLastByName[name];

  if (!isStart && last) {
    ctx.strokeStyle = data.color;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  } else {
    // first point from this user or new stroke: render a small dot
    ctx.fillStyle = data.color;
    ctx.beginPath();
    ctx.arc(data.x, data.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  remoteLastByName[name] = { x: data.x, y: data.y };
  showStatus(`${name} is drawing…`);
});

// clear board
document.getElementById('clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
});

socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  remoteLastByName = {};
});
