/* global Socket */

class UI {
    
    static login() {
        var username = localStorage.getItem("username");
        var skin = localStorage.getItem("skin");
        var userinput = username + "," + skin;
        Socket.init(userinput);
    }
    
    static setupEvents() {
    }
}

