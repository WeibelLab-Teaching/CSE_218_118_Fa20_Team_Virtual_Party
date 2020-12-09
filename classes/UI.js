/* global Socket */

class UI {
    
    static login() {
        var skin;
        var ele = document.getElementsByName('skin'); 
        for(var i = 0; i < ele.length; i++) { 
            if(ele[i].checked) {
                skin = ele[i].value;
            }
        }
        var username = UI.username.value + "," + skin;
        Socket.init(username);
    }
    
    static setupEvents() {
        UI.username = document.getElementById("username");
        UI.username.addEventListener("keyup", (event) => {
            //Login on enter key press
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("login").click();
            }
        });        
    }
}

