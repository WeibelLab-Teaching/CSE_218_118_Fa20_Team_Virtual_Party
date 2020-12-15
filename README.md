# CSE 218/118 FA20 Team Virtual Party
Website: cspears.site

    Why the project is useful
        Add the general goals of the project 
    What the project does
        Add your storyboard as a way to give the general idea
        Add detailed list of features with representative images of the features.
        Add details of architecture and data flow, including images
    How users can get started with the project
        Explain and link to the general structure of the Github repository
        Point to the main components of your code with links to specific repository folders
    Who maintains and contributes to the project
        Add your team name
        Add all team members with a short description of who they are (e.g. MS Student at UC San Diego...)
    Where users can get help with your project
        How to get in contact with you



# Architecture 

## Multiplayer Architecture 
![alt text](images/readme/multiplayer_architecture.PNG)

We enabled multiplayer by running a Websocket server. Each player creates a socket node. We update local state changes 
from /game/classes/avatar.js and send this information over the socket connection. So if you move your avatar, this 
information will be sent to the socket server. The socket server then sends the state change to all other connected sockets / players.
The other players then update their state locally.

## Voice Chat Architecture
![alt text](images/readme/voicechat_architecture.PNG)

We enabled voice chat using a WebRTC P2P connection. Clients first connect to a google STUN server to find
their public IP. We are hosting a signaling server that establishes a network channel between users so they
can create a peer to peer connection with each other. Players can then send their voice directly to each other
using this connection. This architecture enables real-time voice chat between users.


# Setup

## How to Run the App Locally 
First, navigate to the folder `game/server` in a terminal. Then type in `node server.js` to host the server locally.

Then install the **Live Server** extention by Ritwick Dey in VSCode.

Once the installation is finished, click 'Go Live' on the `index.html`.

A new window should popup with the app in the tab.





## How to Set Up on Server 
index.html: Uncomment code for voice
classes/Socket.js: Uncomment code for Socket.host 

### Install dependencies
cd voice_chat
npm i

### Must have root access 
pm2 start voice_chat/signaling-server.js 
pm2 start server/secureserver.js
