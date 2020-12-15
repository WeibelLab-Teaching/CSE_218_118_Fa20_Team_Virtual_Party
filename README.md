# Virtual Party
Enter Project Description Here
## How to Run?
### Online Version
### Local Version

## Why The Project is Useful?


## What Does The Project do?
### Storyboard


### List of Features



### Architectures
#### Project Architecture
index.html                      homepage for application
index.css                       homepage style sheer

/images/                        contains images used in index.html homepage or in README.md

/game/                          contains all files related to the VP game application 

/game/classes/                  contains all classes for objects created in the VP game application
/game/classes/avatar.js         class for local avatar model and movement
/game/classes/billboard.js      class for billboard displayed above player head
/game/classes/input.js          class for reading player input
/game/classes/player.js         class for online player models and movement
/game/classes/socket.js         class for creating socket on client environment
/game/classes/UI.js             class for inititializing events and sockets
/game/classes/world.js          class for creating the virtual environment
/game/CSS*                      classes for live video stream

/game/assets/                   contains all models, player skins, videos, images used inside the VP app

/game/server/server.js          socket server for hosting mulitplayer on local host or over http non-secure connection
/game/server/secureserver.js    socket server for hosting multiplayer over secure HTTPS connection



#### Multiplayer Architecture 
![alt text](images/readme/multiplayer_architecture.PNG)

We enabled multiplayer by running a websocket server. Each player creates a socket node. We update local state changes 
from `/game/classes/avatar.js` and send this information over the socket connection in `/game/classes/socket.js`. 
So if you move your avatar, this information will be sent to the socket server. The socket server then sends the state
change to all other connected sockets / players. The other players then update their state locally.

#### Voice Chat Architecture
![alt text](images/readme/voicechat_architecture.PNG)

We enabled voice chat using a **WebRTC P2P** connection. Clients first connect to a Google **STUN** server to find
their public IP. We are hosting a signaling server that establishes a network channel between users so they
can create a peer to peer connection with each other in `/game/voice_chat/singaling-server.js`. Players can then 
send their voice directly to each other using this connection. This architecture enables real-time voice 
communication between users.

## Contributors


### Helps
