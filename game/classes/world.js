/// <reference path="../vendor/babylon.d.ts"/>
/* global Avatar */
/* global BABYLON */

class World {
    static init() {
        World.canvas = document.getElementById("canvas");

        // Initialize the main engine
        World.engine = new BABYLON.Engine(World.canvas, true);
        MediaStreamTrackEvent
        World.scene = new BABYLON.Scene(World.engine);
        World.scene.imageProcessingConfiguration.exposure = 1.3;
        World.scene.imageProcessingConfiguration.contrast = 1;

        // Adjust in-game audio volume
        // World.audioEngine = World.engine.audioEngine();
        // World.audioEngine.setGlobalVolume(0.01);

        // Set overall HDR texture
        var hdrTexture = new BABYLON.HDRCubeTexture("assets/images/Barce_Rooftop_C_3k.hdr", World.scene, 512);

        // Finish setting up the virtual space
        World.setupCamera();
        World.setupSkybox(hdrTexture);
        World.setupGround();       
        var shadowGenerator = World.setupLights();
        

        // Import Meshes
        World.addMesh(shadowGenerator);

        // Setting in order for the video to be seen
        World.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        var videoID = 'UnA7tepsc7s';
        // var css3DRenderer = World.setupVideo(videoID);

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
        World.setupLocalVid();

        World.engine.runRenderLoop(() => {
            World.scene.render();
            Avatar.update();
            World.updateCamera();
            // World.scene.onBeforeRenderObservable.add(() => {
            //     css3DRenderer.render(World.scene, World.camera);
            // })
        });        
        
        //Resize event
        window.addEventListener("resize", () => {
            World.engine.resize();
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
        // World.vrHelper.enableInteractions();
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

    static setupLocalVid() {
        var ANote0 = BABYLON.MeshBuilder.CreateBox("ANote0", {width: 200, height: 112, depth: 0.1 }, World.scene);
        // ANote0.position = BABYLON.Vector3(0, 70, 0);
        ANote0.position.x = 250;
        ANote0.position.y = 70;
        ANote0.position.z = 0;
        ANote0.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
        var mat = new BABYLON.StandardMaterial("ANote0Mat",World.scene);
        mat.diffuseColor = new BABYLON.Color4(0, 0, 0, 1);
        ANote0.material = mat;
        var planeOpts = {
                height: 112, 
                width: 200, 
                // sideOrientation: BABYLON.Mesh.BACKSIDE
        };
        var ANote0Video = BABYLON.MeshBuilder.CreatePlane("plane", planeOpts, World.scene);
        // var vidPos = (new BABYLON.Vector3(0,0,0.1)).addInPlace(ANote0.position);
        // var vidPos = ANote0.position;
        // ANote0Video.position = vidPos;
        ANote0Video.position.x = 250 - 0.3;
        ANote0Video.position.y = 70;
        ANote0Video.position.z = 0;
        ANote0Video.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
        var ANote0VideoMat = new BABYLON.StandardMaterial("m", World.scene);
        var ANote0VideoVidTex = new BABYLON.VideoTexture("vidtex","assets/nfl_highlights.mp4", World.scene);
        ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
        ANote0VideoMat.roughness = 1;
        ANote0VideoMat.emissiveColor = new BABYLON.Color3.White();
        ANote0Video.material = ANote0VideoMat;
        World.scene.onPointerObservable.add(function(evt){
                if(evt.pickInfo.pickedMesh === ANote0Video){
                    //console.log("picked");
                        if(ANote0VideoVidTex.video.paused)
                            ANote0VideoVidTex.video.play();
                        else
                            ANote0VideoVidTex.video.pause();
                        console.log(ANote0VideoVidTex.video.paused?"paused":"playing");
                }
        }, BABYLON.PointerEventTypes.POINTERPICK);
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
        skybox.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
    }
    
    static setupLights() {   
        var hemilight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, -100, 0), World.scene);
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

    static addMesh(shadowGenerator) {
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

    static setupVideo(videoID) {
        let videoViewLength = 200
        let videoViewHeight = 112
        let tvThickness = 2

         //TV Box
        var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, World.scene);
        box.scaling = new BABYLON.Vector3(tvThickness / 2 + .01, videoViewHeight + tvThickness, videoViewLength + tvThickness);
        box.position = new BABYLON.Vector3(250 - tvThickness, 70, tvThickness / 2 + .01);
        box.rotation = new BABYLON.Vector3(0, -Math.PI, 0);


        // The CSS object will follow this mesh
        var videoViewMesh = BABYLON.MeshBuilder.CreatePlane("videoViewMesh", { width: 1, height: 1 }, World.scene);
        videoViewMesh.scaling.x = videoViewLength
        videoViewMesh.scaling.y = videoViewHeight
        // videoViewMesh.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
        // videoViewMesh.position.y = 70;
        // videoViewMesh.position.x = 250 - tvThickness - 1;
        // videoViewMesh.position.z = 1;


        // Setup the CSS css3DRenderer and Youtube object
        var [css3DRenderer, container] = World.setupRenderer(videoViewMesh, videoID, World.scene);

        // add actionManager
        videoViewMesh.actionManager = new BABYLON.ActionManager(World.scene);
        videoViewMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,
                function (event) {
                    console.log(`hit`)
                    console.log(container)
                    container.style.zIndex = 10
                })
        );

        document.addEventListener("click", (e) => {
            console.log(e.target)
            if (e.target.id === "CSS3DRendererDom") {
                // console.log(hiding)
                container.style.zIndex = "-1"
            }
        })

        return css3DRenderer;
    }

    static removeDomNode(id) {
        let node = document.getElementById(id);
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    static setupRenderer(videoViewMesh, videoID, scene) {
        let videoWidth = 1920;
        let videoHeight = 1080;

        //div holding WebGL scene canvas
        let webGLContainer = document.getElementById('canvasZone');
    
        //Remove Old Nodes
        World.removeDomNode("cssContainer");
        World.removeDomNode("CSS3DRendererDom");
    
        //Add Container for CSS
        //Canvas Container for css3DRenderer
        let css3DContainer = document.createElement('div');
        css3DContainer.id = 'cssContainer';
        css3DContainer.style.position = 'absolute';
        css3DContainer.style.width = '100%';
        css3DContainer.style.height = '100%';
        css3DContainer.style.zIndex = '-1';
    
        //add css3DContainer behind WebGl scene
        webGLContainer.insertBefore(css3DContainer, webGLContainer.firstChild);
    
        //Add CSS3D css3DRenderer
        let css3DRenderer = new CSS3DRenderer();
    
        //appendcss3DRenderer in css3DContainer behind WebGL scene
        css3DContainer.appendChild(css3DRenderer.domElement);
    
        //Set CSS container size same as WebGL Container Size
        css3DRenderer.setSize(webGLContainer.offsetWidth, webGLContainer.offsetHeight);
    
        //add iframe Container
        var iframeContainer = document.createElement('div');
        iframeContainer.style.width = videoWidth + 'px';
        iframeContainer.style.height = videoHeight + 'px';
        iframeContainer.style.backgroundColor = '#000';
        iframeContainer.id = "iframeContainer";
    
        //CSS Object
        var CSSobject = new CSS3DObject(iframeContainer, scene);
        CSSobject.position.copyFrom(videoViewMesh.getAbsolutePosition());
        CSSobject.rotation.y = -videoViewMesh.rotation.y;
        CSSobject.scaling.copyFrom(videoViewMesh.scaling);
    
        // append iframe
        var iframe = document.createElement('iframe');
        iframe.id = 'video-' + videoID;
        iframe.style.width = videoWidth + 'px';
        iframe.style.height = videoHeight + 'px';
        iframe.style.border = '0px';
        iframe.allow = 'autoplay';
        iframe.src = ['https://www.youtube.com/embed/', videoID, '?rel=0&enablejsapi=1&disablekb=1&autoplay=1&controls=0&fs=0&modestbranding=1'].join('');
        iframeContainer.appendChild(iframe);
    
        //material
        let depthMask = new BABYLON.StandardMaterial('VideoViewMaterial', scene);
        depthMask.backFaceCulling = true;
        videoViewMesh.material = depthMask;
    
        //Render Video the mesh
        videoViewMesh.onBeforeRenderObservable.add(() => World.engine.setColorWrite(false));
        videoViewMesh.onAfterRenderObservable.add(() => World.engine.setColorWrite(true));
    
        // swap meshes to put mask first
        var videoPlaneIndex = scene.meshes.indexOf(videoViewMesh);
        scene.meshes[videoPlaneIndex] = scene.meshes[0];
        scene.meshes[0] = videoViewMesh;
    
        return [css3DRenderer, css3DContainer];
    }
}

World.cameraDistance = .1;