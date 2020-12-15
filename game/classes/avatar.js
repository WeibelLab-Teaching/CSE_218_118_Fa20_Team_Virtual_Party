/* global BABYLON */
/* global Input */
/* global Socket */
/* global World */

class Avatar {
    
    static init() {
        Avatar.mesh = BABYLON.MeshBuilder.CreateBox("avatar", {height: 0, width: 0, depth: 0}, World.scene);
        Avatar.mesh.position = BABYLON.Vector3.Zero();
        Avatar.mesh.material = new BABYLON.StandardMaterial("matAvatar", World.scene);
        Avatar.mesh.material.diffuseColor = new BABYLON.Color3.Green();
    }   
    
    static rotate(isLeft) {
        //Turning left
        if (isLeft) {
            Avatar.absoluteRotation -= Avatar.rotationSpeed;
            Avatar.mesh.rotate(BABYLON.Axis.Y, Avatar.rotationSpeed, BABYLON.Space.WORLD);
        //Turning right
        } else {
            Avatar.absoluteRotation += Avatar.rotationSpeed;            
            Avatar.mesh.rotate(BABYLON.Axis.Y, -Avatar.rotationSpeed, BABYLON.Space.WORLD);
        }
    }    
    
    static send() {
        var x = Avatar.mesh.position.x;
        var y = Avatar.mesh.position.y;
        var z = Avatar.mesh.position.z;
        var rot = Avatar.absoluteRotation;
        var JSON = `{"command":"transform","data":{"x":${x},"y":${y},"z":${z},"rotation":${rot}}}`;
        Socket.ws.send(JSON);
    }   
    
    static update() {
        if (Avatar.mesh !== null) {
            //Moving forward
            if (Input.key.up) {
                var forward = new BABYLON.Vector3(Avatar.walkSpeed * Math.cos(Avatar.absoluteRotation), 0, Avatar.walkSpeed * Math.sin(Avatar.absoluteRotation));
                Avatar.mesh.moveWithCollisions(forward);
            }
            //Moving backward
            else if (Input.key.down) {
                var backward = new BABYLON.Vector3(-Avatar.walkSpeed * Math.cos(Avatar.absoluteRotation), 0, -Avatar.walkSpeed * Math.sin(Avatar.absoluteRotation));
                Avatar.mesh.moveWithCollisions(backward);
            }
            //Turning left
            if (Input.key.left) {
                Avatar.rotate(false);
            //Turning right
            } else if (Input.key.right) {
                Avatar.rotate(true);
            }
            // detect wall collisions
            if(Avatar.mesh.position.x > 245) {
                Avatar.mesh.position.x = 245;
            }
            if(Avatar.mesh.position.z > 245) {
                Avatar.mesh.position.z = 245;
            }
            if(Avatar.mesh.position.x < -245) {
                Avatar.mesh.position.x = -245;
            }
            if(Avatar.mesh.position.z < -245) {
                Avatar.mesh.position.z = -245;
            }
            Avatar.send();
        }
    }
}

Avatar.absoluteRotation = 0;
Avatar.height = 30;
Avatar.width = 10
Avatar.depth = 10
Avatar.mesh = null;
Avatar.rotationSpeed = 0.02;
Avatar.walkSpeed = .75;
