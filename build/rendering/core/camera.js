import { mat4 } from "../../../node_modules/wgpu-matrix/dist/3.x/wgpu-matrix.module.js";
import { Vector3 } from "./model.js";
export class Camera {
    position;
    rotation;
    nearZ = 0.1;
    farZ = 100;
    fov = 70;
    constructor(position = new Vector3(0, 0, 0)) {
        this.position = position;
        this.rotation = new Vector3(0, 0, 0);
    }
    getMatrix() {
        const cameraMatrix = mat4.translation([this.position.x, this.position.y, this.position.z]);
        mat4.rotateY(cameraMatrix, this.rotation.y * Math.PI / 180, cameraMatrix);
        mat4.rotateX(cameraMatrix, this.rotation.x * Math.PI / 180, cameraMatrix);
        mat4.rotateZ(cameraMatrix, this.rotation.z * Math.PI / 180, cameraMatrix);
        return cameraMatrix;
    }
    getViewMatrix() {
        return mat4.inverse(this.getMatrix());
    }
    getInverseViewMatrix() {
        return mat4.inverse(this.getViewMatrix()); //TODO: is this the same as getMatrix()???
    }
    getProjectionMatrix(aspect) {
        return mat4.perspective(this.fov * Math.PI / 180, aspect, this.nearZ, this.farZ);
        ;
    }
}
//# sourceMappingURL=camera.js.map