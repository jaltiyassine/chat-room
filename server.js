const path = require("path");
const fastify = require("fastify")({
  logger: false,
});

const { WebSocketServer, WebSocket } = require('ws');

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.register(require("@fastify/formbody"));

fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
  root: path.join(__dirname, "src", "pages"),
  defaultContext: {
    seo: require("./src/seo.json")
  },
  options: {
    partials: {
    }
  }
});

fastify.get("/", function (request, reply) {
  reply.send("Hello, World");
});

fastify.post("/", function (request, reply) {
  let params = {};
  let color = request.body.color;

  if (color) {
    const colors = require("./src/colors.json");
    color = color.toLowerCase().replace(/\s/g, "");
    if (colors[color]) {
      params.color = colors[color];
      params.colorError = null;
    } else {
      params.colorError = request.body.color;
    }
  }
  return reply.view("index.hbs", params);
});

const connections = new Set();

fastify.get("/room", (request, reply) => {
  return reply.view("room.hbs", {});
});

fastify.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    console.log(`Chat room available at ${address}/room`);

    const wss = new WebSocketServer({
        server: fastify.server,
        path: "/room/ws"
    });

    wss.on('connection', (wsClient) => {
      console.log('Client connected to chat room');
      wsClient.activeUsername = null;
      connections.add(wsClient);

      wsClient.on('message', (messageData) => {
        const messageString = messageData.toString();
        let messageObject;
        try {
            messageObject = JSON.parse(messageString);
        } catch (e) {
            console.error("Received non-JSON message:", messageString);
            return; 
        }

        if (messageObject.user && wsClient.activeUsername !== messageObject.user) {
            wsClient.activeUsername = messageObject.user;
        }
        
        console.log(`Received: ${messageObject.type} from ${wsClient.activeUsername || 'unknown'}`);

        if (messageObject.type === 'chat') {
            for (const client of connections) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageObject));
                }
            }

            if (wsClient.activeUsername) {
                const stopTypingPayload = JSON.stringify({ type: 'user_stopped_typing', user: wsClient.activeUsername });
                for (const client of connections) {
                    if (client !== wsClient && client.readyState === WebSocket.OPEN) {
                        client.send(stopTypingPayload);
                    }
                }
            }
        } else if (messageObject.type === 'start_typing') {
            if (!wsClient.activeUsername) return;
            const typingPayload = JSON.stringify({ type: 'user_typing', user: wsClient.activeUsername });
            for (const client of connections) {
                if (client !== wsClient && client.readyState === WebSocket.OPEN) {
                    client.send(typingPayload);
                }
            }
        } else if (messageObject.type === 'stop_typing') {
            if (!wsClient.activeUsername) return;
            const stopTypingPayload = JSON.stringify({ type: 'user_stopped_typing', user: wsClient.activeUsername });
            for (const client of connections) {
                if (client !== wsClient && client.readyState === WebSocket.OPEN) {
                    client.send(stopTypingPayload);
                }
            }
        } else if (messageObject.type === 'system') {
             for (const client of connections) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageObject));
                }
            }
        }
      });

      wsClient.on('close', () => {
        console.log(`Client ${wsClient.activeUsername || 'unknown'} disconnected`);
        connections.delete(wsClient);
        
        if (wsClient.activeUsername) {
            const stopTypingPayload = JSON.stringify({ type: 'user_stopped_typing', user: wsClient.activeUsername });
            const leaveMessage = JSON.stringify({ type: 'system', text: `${wsClient.activeUsername} has left the chat.` });
            for (const client of connections) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(stopTypingPayload);
                    client.send(leaveMessage);
                }
            }
        }
      });

      wsClient.on('error', (error) => {
        console.error(`WebSocket error for ${wsClient.activeUsername || 'unknown'}:`, error);
      });

      const joinMessage = JSON.stringify({ type: 'system', text: 'A new user has joined the chat!' });
      for (const client of connections) {
        if (client !== wsClient && client.readyState === WebSocket.OPEN) {
          client.send(joinMessage);
        }
      }
      wsClient.send(JSON.stringify({ type: 'system', text: 'Welcome to the chat room!' }));
    });

    console.log('WebSocket server initialized and listening on path /room/ws');
  }
);