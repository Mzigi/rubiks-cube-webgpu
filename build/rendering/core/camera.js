import { mat4 } from "../../../node_modules/wgpu-matrix/dist/3.x/wgpu-matrix.module.js";
export class Camera {
    position;
    rotation;
    nearZ = 0.1;
    farZ = 100;
    constructor(position = { x: 0, y: 0, z: 0 }) {
        this.position = position;
        this.rotation = { x: 0, y: 0, z: 0 };
    }
    getMatrix() {
        const cameraMatrix = mat4.translation([this.position.x, this.position.y, this.position.z]);
        mat4.rotateY(cameraMatrix, this.rotation.y * Math.PI / 180);
        mat4.rotateX(cameraMatrix, this.rotation.x * Math.PI / 180);
        mat4.rotateZ(cameraMatrix, this.rotation.z * Math.PI / 180);
        return cameraMatrix;
    }
}
//# sourceMappingURL=camera.js.map