### Realtime Whiteboard

A web app where multiple users can draw on a shared canvas — everyone sees lines appear instantly in real time.

### Tech stack
- **Node.js + Express**: serves the app and static assets
- **Socket.IO**: realtime bidirectional events for drawing and clearing
- **HTML5 Canvas**: rendering strokes on the client
- **Vanilla JS + CSS**: lightweight frontend
- **Railway**: hosting for the live demo

### Run the app

#### 1) Locally
- **Prerequisites**: Node.js 18+ recommended
- **Install dependencies**:
```bash
npm install
```
- **Start the server** (either command works):
```bash
node server.js
# or
npm start
```
- Open `http://localhost:3000` in multiple browser windows/tabs to see realtime drawing.

#### 2) Live URL
Visit the hosted demo:

- Realtime Whiteboard on Railway: https://realtime-drawingboard-production.up.railway.app/

