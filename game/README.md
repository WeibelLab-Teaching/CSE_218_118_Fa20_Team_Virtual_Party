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



## How to Run the App Locally ####################################################################################
First, navigate to the folder `server` in a terminal. Then type in `node server.js` to host the server locally.

Then install the **Live Server** extention by Ritwick Dey in VSCode.

Once the installation is finished, click 'Go Live' on the `index.html`.

A new window should popup with the app in the tab.


# How to set up on server 
index.html: Uncomment code for voice
classes/Socket.js: Uncomment code for Socket.host 

# install dependencies
cd voice_chat
npm i

# Must have root access 
pm2 start voice_chat/signaling-server.js 
pm2 start server/secureserver.js