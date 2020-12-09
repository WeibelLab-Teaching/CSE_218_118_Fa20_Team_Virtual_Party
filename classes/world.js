/// <reference path="../vendor/babylon.d.ts"/>
/* global Avatar */
/* global BABYLON */

class World {
    static init() {
        World.canvas = document.getElementById("canvas");

        // Initialize the main engine
        var engine = new BABYLON.Engine(World.canvas, true);
        MediaStreamTrackEvent
        World.scene = new BABYLON.Scene(engine);
        World.scene.imageProcessingConfiguration.exposure = 1.5;
        World.scene.imageProcessingConfiguration.contrast = 1;

        // Set overall HDR texture
        var hdrTexture = new BABYLON.HDRCubeTexture("assets/images/Barce_Rooftop_C_3k.hdr", World.scene, 512);

        // Finish setting up the virtual space
        World.setupCamera();
        World.setupSkybox(hdrTexture);
        World.setupGround();       
        var shadowGenerator = World.setupLights();
        

        // Import Meshes
        World.addMesh(shadowGenerator, hdrTexture);

        // Set environmental texture based on the texture of the skybox
        World.scene.environmentTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("assets/images/Barce_Rooftop_C_3k.hdr", World.scene);

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

        // DO NOT DELETE! This part is for testing purpose, to create a free camera for fast env check
        // var camera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), World.scene);
        // camera.attachControl(World.canvas, true);
        // camera.minZ = 0.1;
    }
    
    static setupGround() {    
        // Setup tiled ground
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

        // Enable shadow receiving on ground
        tiledGround.receiveShadows = true;
    }

    static setupSkybox(hdrTexture) {
        var skybox = BABYLON.Mesh.CreateBox("SkyBox", 500.0, World.scene);
        var skyboxMaterial = new BABYLON.PBRMaterial("skyBox", World.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = hdrTexture.clone();
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.microSurface = 1.0;
        skyboxMaterial.disableLighting = true;
        // skybox.infiniteDistance = true;
        skybox.material = skyboxMaterial;
    }
    
    static setupLights() {   
        var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-0.5, -0.6, 0.3), World.scene);
        // var light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(-1, 1, -1), new BABYLON.Vector3(0, -1, 0), Math.PI / 2, 10, World.scene);
        light.position = new BABYLON.Vector3(250, 100, 250);
        light.shadowOrthoScale = 0.2; 
        light.intensity = 1.2;  
        light.diffuse = new BABYLON.Color3(0.95, 0.85, 0.71, 0.43);

        var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        shadowGenerator.setDarkness(0.6);
        return shadowGenerator;
    }

    static addMesh(shadowGenerator, hdrTexture) {
        var dz = [0, 200, 0, 200, 0, 200];
        var dx = [0, 0, 100, 100, 200, 200];
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