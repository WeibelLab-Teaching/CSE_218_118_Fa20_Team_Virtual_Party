/// <reference path="../vendor/babylon.d.ts"/>
/* global Avatar */
/* global BABYLON */

let videoWidth = 1920
let videoHeight = 1080
let videoViewLength = 100
let videoViewHeight = 56.25
let tvThickness = .2

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

        
        //TV Box
        var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, World.scene);
        box.scaling = new BABYLON.Vector3(videoViewLength + tvThickness, videoViewHeight + tvThickness, tvThickness / 2 + .01);
        box.position = new BABYLON.Vector3(0, 30, tvThickness / 2 + .01);

        // The CSS object will follow this mesh
        var videoViewMesh = BABYLON.MeshBuilder.CreatePlane("videoViewMesh", { width: 1, height: 1 }, World.scene);
        videoViewMesh.scaling.x = videoViewLength
        videoViewMesh.scaling.y = videoViewHeight

        // add actionManager
        videoViewMesh.actionManager = new BABYLON.ActionManager(World.scene);
        videoViewMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,
                function (event) {
                    var pickedMesh = event.meshUnderPointer;
                    window.open("https://hiteshsahu.com/FluidSimulation");
                })
        );

        //Setup the CSS css3DRenderer and Youtube object
        let css3DRenderer = setupRenderer(videoViewMesh, 'SCtf4WiXlNc', World.scene, engine);

        css3DRenderer.render(World.scene, World.scene.activeCamera);
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
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), World.scene);
        light.intensity = 0.7;        
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

function removeDomNode(id) {
    let node = document.getElementById(id);
    if (node && node.parentNode) {
        node.parentNode.removeChild(node);
    }
}

setupRenderer = (videoViewMesh, videoID, scene, engine) => {

    //div holding WebGL scene canvas
    let webGLContainer = document.getElementById('canvas')

    //Remove Old Nodes
    removeDomNode("cssContainer")
    removeDomNode("CSS3DRendererDom")

    //Add Container for CSS
    //Canvas Container for css3DRenderer
    let css3DContainer = document.createElement('div')
    css3DContainer.id = 'cssContainer'
    css3DContainer.style.position = 'absolute'
    css3DContainer.style.width = '100%'
    css3DContainer.style.height = '100%'
    css3DContainer.style.zIndex = '-1'

    //add css3DContainer behind WebGl scene
    webGLContainer.insertBefore(css3DContainer, webGLContainer.firstChild)

    //Add CSS3D css3DRenderer
    let css3DRenderer = new CSS3DRenderer()

    //appendcss3DRenderer in css3DContainer behind WebGL scene
    css3DContainer.appendChild(css3DRenderer.domElement)

    //Set CSS container size same as WebGL Container Size
    css3DRenderer.setSize(webGLContainer.offsetWidth, webGLContainer.offsetHeight)

    //add iframe Container
    var iframeContainer = document.createElement('div')
    iframeContainer.style.width = videoWidth + 'px'
    iframeContainer.style.height = videoHeight + 'px'
    iframeContainer.style.backgroundColor = '#000'
    iframeContainer.id = "iframeContainer"

    //CSS Object
    var CSSobject = new CSS3DObject(iframeContainer, scene)
    CSSobject.position.copyFrom(videoViewMesh.getAbsolutePosition())
    CSSobject.rotation.y = -videoViewMesh.rotation.y
    CSSobject.scaling.copyFrom(videoViewMesh.scaling)

    // append iframe
    var iframe = document.createElement('iframe')
    iframe.id = 'video-' + videoID
    iframe.style.width = videoWidth + 'px'
    iframe.style.height = videoHeight + 'px'
    iframe.style.border = '0px'
    iframe.allow = 'autoplay'
    iframe.src = ['https://www.youtube.com/embed/', videoID, '?rel=0&enablejsapi=1&disablekb=1&autoplay=1&controls=0&fs=0&modestbranding=1'].join('')
    iframeContainer.appendChild(iframe)

    //material
    let depthMask = new BABYLON.StandardMaterial('VideoViewMaterial', scene)
    depthMask.backFaceCulling = true
    videoViewMesh.material = depthMask

    //Render Video the mesh
    videoViewMesh.onBeforeRenderObservable.add(() => engine.setColorWrite(false))
    videoViewMesh.onAfterRenderObservable.add(() => engine.setColorWrite(true))

    // swap meshes to put mask first
    var videoPlaneIndex = scene.meshes.indexOf(videoViewMesh)
    scene.meshes[videoPlaneIndex] = scene.meshes[0]
    scene.meshes[0] = videoViewMesh

    return css3DRenderer
}
class CSS3DObject extends BABYLON.Mesh {
    constructor(element, scene) {
        super()
        this.element = element
        this.element.style.position = 'absolute'
        this.element.style.pointerEvents = 'auto'
    }
}

class CSS3DRenderer {
    constructor() {
        var matrix = new BABYLON.Matrix()

        this.cache = {
            camera: { fov: 0, style: '' },
            objects: new WeakMap()
        }

        var domElement = document.createElement('div')
        domElement.style.overflow = 'hidden'
        domElement.id = "CSS3DRendererDom"

        this.domElement = domElement
        this.cameraElement = document.createElement('div')
        this.isIE = (!!document['documentMode'] || /Edge/.test(navigator.userAgent) || /Edg/.test(navigator.userAgent))

        if (!this.isIE) {
            this.cameraElement.style.webkitTransformStyle = 'preserve-3d'
            this.cameraElement.style.transformStyle = 'preserve-3d'
        }
        this.cameraElement.style.pointerEvents = 'none'

        domElement.appendChild(this.cameraElement)
    }

    getSize = () => {
        return {
            width: this.width,
            height: this.height
        }
    }

    setSize = (width, height) => {
        this.width = width
        this.height = height
        this.widthHalf = this.width / 2
        this.heightHalf = this.height / 2

        this.domElement.style.width = width + 'px'
        this.domElement.style.height = height + 'px'

        this.cameraElement.style.width = width + 'px'
        this.cameraElement.style.height = height + 'px'
    }

    epsilon(value) {
        return Math.abs(value) < 1e-10 ? 0 : value
    }

    getCameraCSSMatrix = (matrix) => {
        var elements = matrix.m

        return 'matrix3d(' +
            this.epsilon(elements[0]) + ',' +
            this.epsilon(- elements[1]) + ',' +
            this.epsilon(elements[2]) + ',' +
            this.epsilon(elements[3]) + ',' +
            this.epsilon(elements[4]) + ',' +
            this.epsilon(- elements[5]) + ',' +
            this.epsilon(elements[6]) + ',' +
            this.epsilon(elements[7]) + ',' +
            this.epsilon(elements[8]) + ',' +
            this.epsilon(- elements[9]) + ',' +
            this.epsilon(elements[10]) + ',' +
            this.epsilon(elements[11]) + ',' +
            this.epsilon(elements[12]) + ',' +
            this.epsilon(- elements[13]) + ',' +
            this.epsilon(elements[14]) + ',' +
            this.epsilon(elements[15]) +
            ')'
    }

    getObjectCSSMatrix = (matrix, cameraCSSMatrix) => {
        var elements = matrix.m;
        var matrix3d = 'matrix3d(' +
            this.epsilon(elements[0]) + ',' +
            this.epsilon(elements[1]) + ',' +
            this.epsilon(elements[2]) + ',' +
            this.epsilon(elements[3]) + ',' +
            this.epsilon(- elements[4]) + ',' +
            this.epsilon(- elements[5]) + ',' +
            this.epsilon(- elements[6]) + ',' +
            this.epsilon(- elements[7]) + ',' +
            this.epsilon(elements[8]) + ',' +
            this.epsilon(elements[9]) + ',' +
            this.epsilon(elements[10]) + ',' +
            this.epsilon(elements[11]) + ',' +
            this.epsilon(elements[12]) + ',' +
            this.epsilon(elements[13]) + ',' +
            this.epsilon(elements[14]) + ',' +
            this.epsilon(elements[15]) +
            ')'

        if (this.isIE) {
            return 'translate(-50%,-50%)' +
                'translate(' + this.widthHalf + 'px,' + this.heightHalf + 'px)' +
                cameraCSSMatrix +
                matrix3d;
        }
        return 'translate(-50%,-50%)' + matrix3d
    }

    renderObject = (object, scene, camera, cameraCSSMatrix) => {
        if (object instanceof CSS3DObject) {
            var style
            var objectMatrixWorld = object.getWorldMatrix().clone()
            var camMatrix = camera.getWorldMatrix()
            var innerMatrix = objectMatrixWorld.m

            // Set scaling
            const youtubeVideoWidth = videoWidth / 100
            const youtubeVideoHeight = videoHeight / 100

            innerMatrix[0] *= 0.01 / youtubeVideoWidth
            innerMatrix[2] *= 0.01 / youtubeVideoWidth
            innerMatrix[5] *= 0.01 / youtubeVideoHeight

            // Set position from camera
            innerMatrix[12] = -camMatrix.m[12] + object.position.x
            innerMatrix[13] = -camMatrix.m[13] + object.position.y
            innerMatrix[14] = camMatrix.m[14] - object.position.z
            innerMatrix[15] = camMatrix.m[15] * 0.00001

            objectMatrixWorld = BABYLON.Matrix.FromArray(innerMatrix)
            if (this.isIE) {
                // IE will round numbers like 1e-005 to zero so we need to scale whole matrix up.
                // Side-effect is reduced accuracy with CSS object mapping to Babylon.js object
                objectMatrixWorld = objectMatrixWorld.scale(100)
            }
            style = this.getObjectCSSMatrix(objectMatrixWorld, cameraCSSMatrix)
            var element = object.element
            var cachedObject = this.cache.objects.get(object)

            if (cachedObject === undefined || cachedObject.style !== style) {
                element.style.webkitTransform = style
                element.style.transform = style
                var objectData = { style: style }
                this.cache.objects.set(object, objectData)
            }
            if (element.parentNode !== this.cameraElement) {
                this.cameraElement.appendChild(element)
            }

        } else if (object instanceof BABYLON.Scene) {
            for (var i = 0, l = object.meshes.length; i < l; i++) {
                this.renderObject(object.meshes[i], scene, camera, cameraCSSMatrix)
            }
        }
    }

    render = (scene, camera) => {
        var projectionMatrix = camera.getProjectionMatrix()
        var fov = projectionMatrix.m[5] * this.heightHalf

        if (this.cache.camera.fov !== fov) {

            if (camera.mode == BABYLON.Camera.PERSPECTIVE_CAMERA) {
                this.domElement.style.webkitPerspective = fov + 'px'
                this.domElement.style.perspective = fov + 'px'
            } else {
                this.domElement.style.webkitPerspective = ''
                this.domElement.style.perspective = ''
            }
            this.cache.camera.fov = fov
        }

        if (camera.parent === null) camera.computeWorldMatrix()

        var matrixWorld = camera.getWorldMatrix().clone()
        var rotation = matrixWorld.clone().getRotationMatrix().transpose()
        var innerMatrix = matrixWorld.m

        innerMatrix[1] = rotation.m[1]
        innerMatrix[2] = -rotation.m[2]
        innerMatrix[4] = -rotation.m[4]
        innerMatrix[6] = -rotation.m[6]
        innerMatrix[8] = -rotation.m[8]
        innerMatrix[9] = -rotation.m[9]

        matrixWorld = BABYLON.Matrix.FromArray(innerMatrix)

        var cameraCSSMatrix = 'translateZ(' + fov + 'px)' + this.getCameraCSSMatrix(matrixWorld)

        var style = cameraCSSMatrix + 'translate(' + this.widthHalf + 'px,' + this.heightHalf + 'px)'

        if (this.cache.camera.style !== style && !this.isIE) {
            this.cameraElement.style.webkitTransform = style
            this.cameraElement.style.transform = style
            this.cache.camera.style = style
        }

        this.renderObject(scene, scene, camera, cameraCSSMatrix)
    }
}