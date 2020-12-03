/// <reference path="../vendor/babylon.d.ts"/>
/* global Avatar */
/* global BABYLON */

class World {
    static init() {
        World.canvas = document.getElementById("canvas");
        var engine = new BABYLON.Engine(World.canvas, true);
        MediaStreamTrackEvent
        World.scene = new BABYLON.Scene(engine);
        World.setupCamera();        
        World.setupLights();
        World.setupGround();
        World.setupSkybox();

        // MY METHODS
        World.addMesh();

        engine.runRenderLoop(() => {
            World.scene.render();
            Avatar.update();
            World.updateCamera();
        });        
        
        //Resize event
        window.addEventListener("resize", () => {
            engine.resize();
        });
    }
    
    static setupCamera() {
        World.camera = new BABYLON.FreeCamera("firstPersonCam", BABYLON.Vector3.Zero(), World.scene);
        World.camera.position.x -= Math.sin(-Math.PI/2) * -1 * World.cameraDistance;
        World.camera.position.y = Avatar.height + Avatar.height/2;
        World.camera.position.z -= Math.cos(-Math.PI/2) * -1 * World.cameraDistance;
        var lookAt = BABYLON.Vector3.Zero();
        lookAt.y = Avatar.height + Avatar.height/2;
        World.camera.setTarget(lookAt);
        World.scene.activeCameras.push(World.camera);

        // For testing purpose
        //var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 4, Math.PI / 2.5, 200, BABYLON.Vector3.Zero(), World.scene);
        //camera.attachControl(World.canvas, true);
        //camera.minZ = 0.1;
    }
    
    static setupGround() {
        // Old floor setup
        // var ground = BABYLON.MeshBuilder.CreateGround("ground", { width:1000, height: 1000, subdivisions: 100 }, World.scene);
        // ground.position = new BABYLON.Vector3(0, -50, 0);
        // ground.material = new BABYLON.StandardMaterial("matGround", World.scene);
        // ground.material.diffuseTexture = new BABYLON.Texture("assets/images/worn_white_floor.jpg", World.scene);        

        // Try tiled ground option
        var grid = {
            'h' : 5,
            'w' : 5
        };
        var tiledGround = new BABYLON.MeshBuilder.CreateTiledGround("tiledGround", {xmin: -250, zmin: -250, xmax: 250, zmax: 250, subdivisions: grid});
        var material = new BABYLON.StandardMaterial("matGround", World.scene);
        material.diffuseTexture = new BABYLON.Texture("assets/images/worn_white_floor.jpg", World.scene);  
        const multimat = new BABYLON.MultiMaterial("multi", World.scene);
        multimat.subMaterials.push(material);
        multimat.subMaterials.push(material);

        tiledGround.material = multimat;

        // Needed variables to set subMeshes
        const verticesCount = tiledGround.getTotalVertices();
        const tileIndicesLength = tiledGround.getIndices().length / (grid.w * grid.h);
        
        // Set subMeshes of the tiled ground
        tiledGround.subMeshes = [];
        let base = 0;
        for (let row = 0; row < grid.h; row++) {
            for (let col = 0; col < grid.w; col++) {
                tiledGround.subMeshes.push(new BABYLON.SubMesh(row%2 ^ col%2, 0, verticesCount, base , tileIndicesLength, tiledGround));
                base += tileIndicesLength;
            }
        }
    }

    static setupSkybox() {
        var skybox = BABYLON.MeshBuilder.CreateBox("SkyBox", {size:500.0}, World.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", World.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.HDRCubeTexture("assets/images/Barce_Rooftop_C_3k.hdr", World.scene, 768);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skybox.material = skyboxMaterial;
    }
    
    static setupLights() {
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0.5), World.scene);
        light.intensity = 0.5;        
    }

    static addMesh() {
        var i = 0;
        var table_nums = 6;
        var dz = [0, 200, 0, 200, 0, 200];
        var dx = [0, 0, 100, 100, 200, 200];

        // Import 6 table
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes){
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[i], 0, -100 + dz[i]);

            // for (i = 1; i < table_nums; i++) {			
            //     meshes.forEach(function (m) {
            //         var clone = m.clone("newname");
            //         clone.position.x += dx[i];
            //         clone.position.z += dz[i];
            //     });
            // }
        });
        
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes){
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[1], 0, -100 + dz[1]);
        });
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes){
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[2], 0, -100 + dz[2]);
        });
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes){
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[3], 0, -100 + dz[3]);
        });
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes){
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[4], 0, -100 + dz[4]);
        });
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes){
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[5], 0, -100 + dz[5]);
        });

        // Import Bar Table
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/bar_table.glb', World.scene, function(meshes){
            var bar_table = meshes[0];
            bar_table.scaling = new BABYLON.Vector3(3.5, 3.5, 3.5);
            bar_table.rotate(BABYLON.Axis.Y, Math.PI / 2, World.scene);
            bar_table.position = new BABYLON.Vector3(-220, 0, 0);
        });

    }

    static updateCamera() {
        if (Avatar.mesh !== null) {
            World.camera.position.x = Avatar.mesh.position.x;
            World.camera.position.y = Avatar.mesh.position.y + Avatar.height;
            World.camera.position.z = Avatar.mesh.position.z;
            World.camera.position.z -= Math.sin(Avatar.absoluteRotation - Math.PI) * -1 * World.cameraDistance;
            World.camera.position.x -= Math.cos(Avatar.absoluteRotation - Math.PI) * -1 * World.cameraDistance;
            var lookAt = new BABYLON.Vector3(Avatar.mesh.position.x, Avatar.mesh.position.y + Avatar.height, Avatar.mesh.position.z);
            World.camera.setTarget(lookAt);
        }
    }
}

World.cameraDistance = .1;