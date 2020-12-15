# Virtual Party
<img src="images/readme/virtual_party_logo.png" width="250" height="250" align="right">

*Tired of being along by yourself? Fear of going out but still want to connect? Using camera all the times gives you anxiety?*  
***Virtual Party*** *will help you!*

## How to Run?
### Online Version
Lastest Branch is hosted live at [cspears.site](https://cspears.site/)
### How to Set Up on Your Own Server
index.html: Uncomment code for voice

classes/Socket.js: Uncomment code for Socket.host 

#### Install dependencies
```
cd voice_chat
npm i
```
#### Must have root access
```
pm2 start voice_chat/signaling-server.js 
pm2 start server/secureserver.js
```
### Local Version
1. Navigate to the folder `game/server` in a terminal  

2. Type in `node server.js` to host the server locally  
3. Then install the **Live Server** extention by *Ritwick Dey* in **VSCode**  
4. Once the installation is finished, click **Go Live** on the `index.html`  
5. A new window should popup with the app as a new tab in your preferred browser  
6. You can always visit `localhost:5500` (the defaut port by the extention)  

## Why The Project is Useful?


## What Does The Project do?
### Storyboard


### List of Features

<img src="images/readme/features1.png">
<img src="images/readme/features2.png">


### Architectures
In this section, we are going to introduce the architectures of our application from 3 perspectives:
- [Multiplayer Architecture](#multiplayer-architecture)
- [Project Architecture](#project-architecture)
- [Voice Chat Architecture](#voice-chat-architecture)

#### Project Architecture
In the root, we have:
- [index.html](index.html)                                            homepage for application
- [index.css](index.css)                                              homepage style sheet  

The two main folders:
- [/images/](/images/)                                                contains images used in `index.html` homepage or in `README.md`
- [/game/](/game/)                                                    contains all files related to the VP game application

The `/game/` folder is what the game made up of:
1. [/game/classes/]([/game/classes/]) contains all classes for objects created in the Virtual Party game application
    * [/game/classes/avatar.js](/game/classes/avatar.js)                  class for local avatar model and movement
    * [/game/classes/billboard.js](/game/classes/billboard.js)            class for billboard displayed above player head
    * [/game/classes/input.js](/game/classes/input.js)                    class for reading player input
    * [/game/classes/player.js](/game/classes/player.js)                  class for online player models and movement
    * [/game/classes/socket.js](/game/classes/socket.js)                  class for creating socket on client environment
    * [/game/classes/UI.js](/game/classes/UI.js)                          class for inititializing events and sockets
    * [/game/classes/world.js](/game/classes/world.js)                    class for creating the virtual environment
    * [/game/classes/CSS3DObject.js](/game/CSS/CSS3DObject.js)            class for live video stream rendering (Provided by *ozRocker* at [here](https://forum.babylonjs.com/t/youtube-videos-on-a-mesh-port-of-css3drenderer-js/10600))
    * [/game/classes/CSS3DRenderer.js](/game/CSS/CSS3DRenderer.js)            class for live video stream rendering(Provided by *ozRocker* at [here](https://forum.babylonjs.com/t/youtube-videos-on-a-mesh-port-of-css3drenderer-js/10600))

2. [/game/assets/ ](/game/assets/)                                     contains all models, player skins, videos, images used inside the Virtual Party app
    - [/game/server/server.js](/game/server/server.js)                    socket server for hosting mulitplayer on local host or over HTTP non-secure connection
    - [/game/server/secureserver.js](/game/server/secureserver.js)        socket server for hosting multiplayer over secure HTTPS connection



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

#### Live Video Architecture 
![alt text](images/readme/livevideo_architecture.PNG)

We enabled a live interactive stream of a youtube video with `CSS3DRenderer.js` and `CSS3DObject.js`. We first create an
iframe that holds the youtube video and inject it into the game.html code. We then append this iframe into the virtual 
environment and render it inside the virtual world created in the world.js file. 


## Contributors
Virtual Party was created at UC San Diego by Team Virtual Party. Our team consists of:
</br>
Caiting Wu: &nbsp; c1wu@eng.ucsd.edu
Curtis Spears:  cspears@ucsd.edu
Haotian Qiu:    h1qiu@ucsd.edu
Haozhe Luo:     h2luo@ucsd.edu   
</br>
If you have any questions regarding Virtual Party, please email any one of our team members.

### Helps
