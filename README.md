# CSE 218/118 FA20 Team Virtual Party
## How to Run the App
First, navigate to the folder `server` in a terminal. Then type in `node server.js` to host the server locally.

Then install the **Live Server** extention by Ritwick Dey in VSCode.

Once the installation is finished, click 'Go Live' on the `index.html`.

A new window should popup with the app in the tab.


# How to set up on server ##############################################
index.html: Uncomment code for voice 
classes/Socket.js: Uncomment code for Socket.host 

# install dependencies
cd voice_chat
npm i

# Must have root access 
pm2 start voice_chat/signaling-server.js 
pm2 start server/secureserver.js