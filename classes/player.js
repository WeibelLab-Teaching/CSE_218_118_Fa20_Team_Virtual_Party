/* global BABYLON */
/* global World */

class Player {
    
    constructor(id, username) {
        var height = 20;
        this.id = id;
        this.mesh = BABYLON.MeshBuilder.CreateCapsule("player", { height: Avatar.height-5, radius: 6, topCapSubdivisions:6, capSubdivisions:1 }, World.scene);
        //this.mesh = BABYLON.MeshBuilder.CreateBox("avatar", {height: Avatar.height + 20, width: Avatar.width + 20, depth: Avatar.depth + 20}, World.scene);

        this.mesh.position = BABYLON.Vector3.Zero();
        this.mesh.position.x = 0;
        this.mesh.position.y = height/2;
        this.mesh.position.z = 0;
        this.mesh.material = Player.material;
        this.billboard = new Billboard(this.mesh, username);
        Player.all.push(this);
    }
    
    //Destroy player meshes
    destroy() {
        this.billboard.mesh.dispose();
        this.mesh.dispose();
    }
    
    //Find existing player or create if not exists
    static find(playerID, username) {       
        //Check if player is in our list
        for (var objPlayer of Player.all) {
            if (objPlayer.id === playerID) {
                //Found player, so lets return it
                return(objPlayer);
            }
        };                
        //Player doesn't exist, so lets create a new one
        return(new Player(playerID, username));
    }
    
    static init() {
        Player.material = new BABYLON.StandardMaterial("matPlayer", World.scene);
        Player.material.diffuseTexture = new BABYLON.Texture("./assets/skins/def_skin.png", World.scene);       
    }
    
    //Find player and move them
    static move(data) {
        var playerID = parseInt(data.id);
        var objPlayer = Player.find(playerID, data.username);
        objPlayer.transform(data.x, data.y, data.z, data.rotation);
    }
    
    //Remove player from world
    static remove(playerID) {
        for (var objPlayer of Player.all) {
            if (objPlayer.id === playerID) {
                objPlayer.destroy();
                break;
            }
        }
        
        //Remove me from list of all players
        Player.all = Player.all.filter((obj) => {
            return obj.id !== playerID;
        });
    }
    
    //Change position and rotation
    transform(x, y, z, rotation) {
        this.mesh.position.x = x;
        this.mesh.position.y = y + 17;
        this.mesh.position.z = z;
        this.mesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, -rotation, 0);
    }
}

Player.all = new Array();