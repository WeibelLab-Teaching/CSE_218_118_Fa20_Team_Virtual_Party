// import CSS3DObject from "./CSS3DObject";
class CSS3DRenderer {
  constructor(videoResolution = { videoWidth: 1920, videoHeight: 1080 }) {
    this.videoHeight = videoResolution.videoHeight;
    this.videoWidth = videoResolution.videoWidth;
    this.cache = {
      camera: { fov: 0, style: "" },
      objects: new WeakMap(),
    };

    var domElement = document.createElement("div");
    domElement.style.overflow = "hidden";
    domElement.id = "CSS3DRendererDom";

    this.domElement = domElement;
    this.cameraElement = document.createElement("div");
    this.isIE =
      !!document["documentMode"] ||
      /Edge/.test(navigator.userAgent) ||
      /Edg/.test(navigator.userAgent);

    if (!this.isIE) {
      this.cameraElement.style.webkitTransformStyle = "preserve-3d";
      this.cameraElement.style.transformStyle = "preserve-3d";
    }
    this.cameraElement.style.pointerEvents = "none";

    domElement.appendChild(this.cameraElement);
  }

  getSize = () => {
    return {
      width: this.width,
      height: this.height,
    };
  };

  setSize = (width, height) => {
    this.width = width;
    this.height = height;
    this.widthHalf = this.width / 2;
    this.heightHalf = this.height / 2;

    this.domElement.style.width = width + "px";
    this.domElement.style.height = height + "px";

    this.cameraElement.style.width = width + "px";
    this.cameraElement.style.height = height + "px";
  };

  epsilon = (value) => {
    return Math.abs(value) < 1e-10 ? 0 : value;
  };

  getCameraCSSMatrix = (matrix) => {
    var elements = matrix.m;

    return (
      "matrix3d(" +
      this.epsilon(elements[0]) +
      "," +
      this.epsilon(-elements[1]) +
      "," +
      this.epsilon(elements[2]) +
      "," +
      this.epsilon(elements[3]) +
      "," +
      this.epsilon(elements[4]) +
      "," +
      this.epsilon(-elements[5]) +
      "," +
      this.epsilon(elements[6]) +
      "," +
      this.epsilon(elements[7]) +
      "," +
      this.epsilon(elements[8]) +
      "," +
      this.epsilon(-elements[9]) +
      "," +
      this.epsilon(elements[10]) +
      "," +
      this.epsilon(elements[11]) +
      "," +
      this.epsilon(elements[12]) +
      "," +
      this.epsilon(-elements[13]) +
      "," +
      this.epsilon(elements[14]) +
      "," +
      this.epsilon(elements[15]) +
      ")"
    );
  };

  getObjectCSSMatrix = (matrix, cameraCSSMatrix) => {
    var elements = matrix.m;
    var matrix3d =
      "matrix3d(" +
      this.epsilon(elements[0]) +
      "," +
      this.epsilon(elements[1]) +
      "," +
      this.epsilon(elements[2]) +
      "," +
      this.epsilon(elements[3]) +
      "," +
      this.epsilon(-elements[4]) +
      "," +
      this.epsilon(-elements[5]) +
      "," +
      this.epsilon(-elements[6]) +
      "," +
      this.epsilon(-elements[7]) +
      "," +
      this.epsilon(elements[8]) +
      "," +
      this.epsilon(elements[9]) +
      "," +
      this.epsilon(elements[10]) +
      "," +
      this.epsilon(elements[11]) +
      "," +
      this.epsilon(elements[12]) +
      "," +
      this.epsilon(elements[13]) +
      "," +
      this.epsilon(elements[14]) +
      "," +
      this.epsilon(elements[15]) +
      ")";

    if (this.isIE) {
      return (
        "translate(-50%,-50%)" +
        "translate(" +
        this.widthHalf +
        "px," +
        this.heightHalf +
        "px)" +
        cameraCSSMatrix +
        matrix3d
      );
    }
    return "translate(-50%,-50%)" + matrix3d;
  };

  renderObject = (object, camera, cameraCSSMatrix) => {
    if (object instanceof CSS3DObject) {
      var style;
      var objectMatrixWorld = object.getWorldMatrix().clone();
      var camMatrix = camera.getWorldMatrix();
      var innerMatrix = objectMatrixWorld.m;

      // Set scaling
      const youtubeVideoWidth = this.videoWidth / 100;
      const youtubeVideoHeight = this.videoHeight / 100;

      innerMatrix[0] *= 0.01 / youtubeVideoWidth;
      innerMatrix[2] *= 0.01 / youtubeVideoWidth;
      innerMatrix[5] *= 0.01 / youtubeVideoHeight;

      // Set position from camera
      innerMatrix[12] = -camMatrix.m[12] + object.position.x;
      innerMatrix[13] = -camMatrix.m[13] + object.position.y;
      innerMatrix[14] = camMatrix.m[14] - object.position.z;
      innerMatrix[15] = camMatrix.m[15] * 0.00001;

      objectMatrixWorld = BABYLON.Matrix.FromArray(innerMatrix);
      if (this.isIE) {
        // IE will round numbers like 1e-005 to zero so we need to scale whole matrix up.
        // Side-effect is reduced accuracy with CSS object mapping to Babylon.js object
        objectMatrixWorld = objectMatrixWorld.scale(100);
      }
      style = this.getObjectCSSMatrix(objectMatrixWorld, cameraCSSMatrix);
      var element = object.element;
      var cachedObject = this.cache.objects.get(object);

      if (cachedObject === undefined || cachedObject.style !== style) {
        element.style.webkitTransform = style;
        element.style.transform = style;
        var objectData = { style: style };
        this.cache.objects.set(object, objectData);
      }
      if (element.parentNode !== this.cameraElement) {
        this.cameraElement.appendChild(element);
      }
    } else if (object instanceof BABYLON.Scene) {
      for (var i = 0, l = object.meshes.length; i < l; i++) {
        this.renderObject(object.meshes[i], camera, cameraCSSMatrix);
      }
    }
  };

  render = (scene, camera) => {
    var projectionMatrix = camera.getProjectionMatrix();
    var fov = projectionMatrix.m[5] * this.heightHalf;

    if (this.cache.camera.fov !== fov) {
      if (camera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
        this.domElement.style.webkitPerspective = fov + "px";
        this.domElement.style.perspective = fov + "px";
      } else {
        this.domElement.style.webkitPerspective = "";
        this.domElement.style.perspective = "";
      }
      this.cache.camera.fov = fov;
    }

    if (camera.parent === null) camera.computeWorldMatrix();

    var matrixWorld = camera.getWorldMatrix().clone();
    var rotation = matrixWorld.clone().getRotationMatrix().transpose();
    var innerMatrix = matrixWorld.m;

    innerMatrix[1] = rotation.m[1];
    innerMatrix[2] = -rotation.m[2];
    innerMatrix[4] = -rotation.m[4];
    innerMatrix[6] = -rotation.m[6];
    innerMatrix[8] = -rotation.m[8];
    innerMatrix[9] = -rotation.m[9];

    matrixWorld = BABYLON.Matrix.FromArray(innerMatrix);

    var cameraCSSMatrix =
      "translateZ(" + fov + "px)" + this.getCameraCSSMatrix(matrixWorld);

    var style =
      cameraCSSMatrix +
      "translate(" +
      this.widthHalf +
      "px," +
      this.heightHalf +
      "px)";

    if (this.cache.camera.style !== style && !this.isIE) {
      this.cameraElement.style.webkitTransform = style;
      this.cameraElement.style.transform = style;
      this.cache.camera.style = style;
    }

    this.renderObject(scene, camera, cameraCSSMatrix);
  };
}
