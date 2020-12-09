/* global Avatar */
/* global BABYLON */
/* global World */

class Billboard {

    constructor(playerMesh, username) {
        this.playerMesh = playerMesh;
        this.username = username;
        this.create();
    }
    
    create() {
        this.mesh = BABYLON.MeshBuilder.CreatePlane("billboard", {width: Billboard.width, height: Billboard.height}, World.scene);
        this.mesh.position = BABYLON.Vector3.Zero();
        this.mesh.position.y = Avatar.height - Billboard.height;
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.mesh, 1024, 256);
        advancedTexture.name = "AvatarBillboard";
        var containerUI = new BABYLON.GUI.Rectangle("container");
        containerUI.thickness = 0;
        containerUI.height = "400px";
        containerUI.width = "1000px";
        advancedTexture.addControl(containerUI);
        this.text = new BABYLON.GUI.TextBlock();
        this.text.fontFamily = "Arial";
        this.text.fontWeight = "bold";
        this.text.color = "black";
        this.text.outlineColor = "white";
        this.text.outlineWidth = 10;
        this.text.fontSize = 250;
        containerUI.addControl(this.text);
        this.text.text = this.username;
        this.mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        this.mesh.parent = this.playerMesh;
    }
}

Billboard.height = 5;
Billboard.width = 15;
