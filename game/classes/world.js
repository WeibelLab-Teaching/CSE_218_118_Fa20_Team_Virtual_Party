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

        // VR SETUP
        World.avatars = [];
        World.selected_mesh= false;
        World.isSelectingMarker = false;
        World.selectedMarker = false;
        World.marker_scale = new BABYLON.Vector3(1,1,1);
        World.marker_distance = 50;
        World.setupVR();

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
   
    static setupVR() {

        // import cubes
        for(var i = 0; i < 4; i++){
            var cube = BABYLON.MeshBuilder.CreateBox("cube", {height: 1, width: 10, depth: 10}, World.scene);
            cube.material = new BABYLON.StandardMaterial("matAvatar", World.scene);
            cube.material.diffuseColor = new BABYLON.Color3.Green();
            cube.position = new BABYLON.Vector3(0, 0, 0);
            cube.scaling = World.marker_scale;
            World.avatars.push(cube);
        }

        World.vrHelper = World.scene.createDefaultVRExperience({createDeviceOrientationCamera:false});
        World.vrHelper.enableInteractions();
        World.vrHelper.updateGazeTrackerScale = true;
      

        World.vrHelper.onNewMeshSelected.add(function(mesh) {
            if (!World.isSelectingMarker && mesh.name == "cube") {
                World.selected_mesh= mesh;
                World.selected_mesh.material.diffuseColor = BABYLON.Color3.Blue();
                World.isSelectingMarker = true;
            }
            else {
                World.isSelectingMarker = false;
                World.selectedMarker = false;
                World.selected_mesh.material.diffuseColor = BABYLON.Color3.Green();
                World.selected_mesh.scaling.x = 1;
                World.selected_mesh.scaling.y = 1;
                World.selected_mesh.scaling.z = 1;
            }   
            });

            World.scene.registerBeforeRender(function () {
                for (var i = 0; i < World.avatars.length; i++) {
                    World.avatars[i].rotation.y += 0.01;
                }
                if (World.isSelectingMarker && !World.selectedMarker && World.selected_mesh.scaling.x <= 1.5) {
                    World.selected_mesh.scaling.x += 0.005;
                    World.selected_mesh.scaling.y += 0.005;
                    World.selected_mesh.scaling.z += 0.005;

                    if (World.selected_mesh.scaling.x >= 1.2) {
                        World.selectedMarker = true;
                        World.selected_mesh.scaling.x = 1;
                        World.selected_mesh.scaling.y = 1;
                        World.selected_mesh.scaling.z = 1;
                    }
                }
                if (World.selectedMarker) {
                    World.selected_mesh.material.diffuseColor = BABYLON.Color3.Red();
                    // move avatar
                    Avatar.mesh.position.x = World.selected_mesh.position.x;
                    Avatar.mesh.position.z = World.selected_mesh.position.z;
                    // adjust camera
                    World.vrHelper.position.x = Avatar.mesh.position.x;
                    World.vrHelper.position.z = Avatar.mesh.position.z;
                    // reset cube
                    World.selectedMarker = false;
                    World.selected_mesh.scaling.x = World.marker_scale;
                    World.selected_mesh.material.diffuseColor = BABYLON.Color3.Green();

                }
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

        // Import 6 table: 1st
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes) {
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[0], 0, -100 + dz[0]);

            // Shadows
            shadowGenerator.addShadowCaster(table, true);
            for (var index = 0; index < meshes.length; index++) {
                shadowGenerator.addShadowCaster(meshes[index], true);
            }
        });
        // Import 6 table: 2nd
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes) {
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[1], 0, -100 + dz[1]);

            // Shadows
            shadowGenerator.addShadowCaster(table, true);
            for (var index = 0; index < meshes.length; index++) {
                shadowGenerator.addShadowCaster(meshes[index], true);
            }
        });
        // Import 6 table: 3rd
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes) {
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[2], 0, -100 + dz[2]);

            // Shadows
            shadowGenerator.addShadowCaster(table, true);
            for (var index = 0; index < meshes.length; index++) {
                shadowGenerator.addShadowCaster(meshes[index], true);
            }
        });
        // Import 6 table: 4th
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes) {
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[3], 0, -100 + dz[3]);

            // Shadows
            shadowGenerator.addShadowCaster(table, true);
            for (var index = 0; index < meshes.length; index++) {
                shadowGenerator.addShadowCaster(meshes[index], true);
            }
        });
        // Import 6 table: 5th
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes) {
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[4], 0, -100 + dz[4]);

            // Shadows
            shadowGenerator.addShadowCaster(table, true);
            for (var index = 0; index < meshes.length; index++) {
                shadowGenerator.addShadowCaster(meshes[index], true);
            }
        });
        // Import 6 table: 6th
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/dining_table_new.glb', World.scene, function(meshes) {
            var table = meshes[0];
            table.scaling = new BABYLON.Vector3(5, 5, 5);
            table.position = new BABYLON.Vector3(-100 + dx[5], 0, -100 + dz[5]);

            // Shadows
            shadowGenerator.addShadowCaster(table, true);
            for (var index = 0; index < meshes.length; index++) {
                shadowGenerator.addShadowCaster(meshes[index], true);
            }
        });

        // Import Bar Table
        BABYLON.SceneLoader.ImportMesh(null, './', 'assets/models/bar_table.glb', World.scene, function(meshes){
            var bar_table = meshes[0];
            bar_table.scaling = new BABYLON.Vector3(3.5, 3.5, 3.5);
            bar_table.rotate(BABYLON.Axis.Y, Math.PI / 2, World.scene);
            bar_table.position = new BABYLON.Vector3(-220, 0, 0);
            
            // Shadows
            shadowGenerator.addShadowCaster(bar_table, true);
            for (var index = 0; index < meshes.length; index++) {
                shadowGenerator.addShadowCaster(meshes[index], true);
            }
        });
    }

    static updateCamera() {
        if(World.vrHelper.isInVRMode) {
            for(var i = 0; i < World.avatars.length; i++) {
                World.avatars[i].visibility = 1;
            } 
         }
         else {
            for(var i = 0; i < World.avatars.length; i++) {
                World.avatars[i].visibility = 0;
            } 
         }
        if (Avatar.mesh !== null) {
            World.camera.position.x = Avatar.mesh.position.x;
            World.camera.position.y = Avatar.mesh.position.y + Avatar.height;
            World.camera.position.z = Avatar.mesh.position.z;
            World.camera.position.z -= Math.sin(Avatar.absoluteRotation - Math.PI) * -1 * World.cameraDistance;
            World.camera.position.x -= Math.cos(Avatar.absoluteRotation - Math.PI) * -1 * World.cameraDistance;
            var lookAt = new BABYLON.Vector3(Avatar.mesh.position.x, Avatar.mesh.position.y + Avatar.height, Avatar.mesh.position.z);
            World.camera.setTarget(lookAt);

            World.vrHelper.position.x = Avatar.mesh.position.x;
            World.vrHelper.position.y = Avatar.mesh.position.y + Avatar.height;
            World.vrHelper.position.z = Avatar.mesh.position.z;
            World.vrHelper.position.z -= Math.sin(Avatar.absoluteRotation - Math.PI) * -1 * World.cameraDistance;
            World.vrHelper.position.x -= Math.cos(Avatar.absoluteRotation - Math.PI) * -1 * World.cameraDistance;

            var dx = [0, 0, World.marker_distance, -World.marker_distance]
            var dz = [World.marker_distance, -World.marker_distance, 0, 0 ]
            for(var i = 0; i < 4; i++){
                World.avatars[i].position.x = Avatar.mesh.position.x + dx[i];
                World.avatars[i].position.z = Avatar.mesh.position.z + dz[i];
            }
        }
    }
}

World.cameraDistance = .1;