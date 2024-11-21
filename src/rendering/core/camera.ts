import { mat4 } from "../../../node_modules/wgpu-matrix/dist/3.x/wgpu-matrix.module.js";
import { Vector3 } from "./model";

export class Camera {
    position: Vector3;
    rotation: Vector3;

    nearZ: number = 0.1;
    farZ: number = 100;

    constructor(position: Vector3 = {x: 0, y: 0, z: 0}) {
        this.position = position;
        this.rotation = {x: 0, y: 0, z: 0};
    }

    getMatrix(): Float32Array {
        const cameraMatrix: Float32Array = mat4.translation([this.position.x, this.position.y, this.position.z]);
        mat4.rotateY(cameraMatrix, this.rotation.y * Math.PI / 180);
        mat4.rotateX(cameraMatrix, this.rotation.x * Math.PI / 180);
        mat4.rotateZ(cameraMatrix, this.rotation.z * Math.PI / 180);

        return cameraMatrix;
    }

    /*lookAt(target: Vector3): void {
        const cameraLookAtMatrix: Float32Array = mat4.aim([this.position.x, this.position.y, this.position.z], [target.x, target.y, target.z], [0,1,0]);
        const cameraTranslation: Float32Array = mat4.getTranslation(cameraLookAtMatrix);
        const camRotX: number = mat4.getAxis(cameraLookAtMatrix, 0); //idk what getAxis does

        this.position = {
            x: cameraTranslation[0],
            y: cameraTranslation[1],
            z: cameraTranslation[2],
        };

    }*/
}