import { Mesh } from "../../core/mesh.js";
const cubeMesh = new Mesh();
export function GetCubeMesh() {
    if (cubeMesh.getIndexCount() === 0) {
        cubeMesh.positions = [
            //FRONT
            [-1, -1, -1],
            [-1, 1, -1],
            [1, -1, -1],
            [1, -1, -1],
            [-1, 1, -1],
            [1, 1, -1],
            //LEFT
            [1, -1, -1],
            [1, 1, -1],
            [1, -1, 1],
            [1, -1, 1],
            [1, 1, -1],
            [1, 1, 1],
            //TOP
            [-1, 1, -1],
            [-1, 1, 1],
            [1, 1, -1],
            [1, 1, -1],
            [-1, 1, 1],
            [1, 1, 1],
            //BACK
            [-1, -1, 1],
            [1, -1, 1],
            [-1, 1, 1],
            [1, -1, 1],
            [1, 1, 1],
            [-1, 1, 1],
            //RIGHT
            [-1, -1, -1],
            [-1, -1, 1],
            [-1, 1, -1],
            [-1, -1, 1],
            [-1, 1, 1],
            [-1, 1, -1],
            //TOP
            [-1, -1, -1],
            [1, -1, -1],
            [-1, -1, 1],
            [1, -1, -1],
            [1, -1, 1],
            [-1, -1, 1],
        ];
        cubeMesh.normals = [
            //FRONT
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            //LEFT
            [1, 0, 0],
            [1, 0, 0],
            [1, 0, 0],
            [1, 0, 0],
            [1, 0, 0],
            [1, 0, 0],
            //TOP
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            //BACK
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 1],
            //RIGHT
            [-1, 0, 0],
            [-1, 0, 0],
            [-1, 0, 0],
            [-1, 0, 0],
            [-1, 0, 0],
            [-1, 0, 0],
            //BOTTOM
            [0, -1, 0],
            [0, -1, 0],
            [0, -1, 0],
            [0, -1, 0],
            [0, -1, 0],
            [0, -1, 0],
        ];
        cubeMesh.uvs = [
            //FRONT
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 0],
            [1, 1],
            [0, 1],
            //LEFT
            [0, 0],
            [0, 1],
            [1, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            //TOP
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 0],
            [1, 1],
            [0, 1],
            //BACK
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            //RIGHT
            [0, 0],
            [1, 0],
            [0, 1],
            [0, 1],
            [1, 0],
            [1, 1],
            //TOP
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 0],
            [0, 1],
            [1, 1],
        ];
        cubeMesh.triangles = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [9, 10, 11],
            [12, 13, 14],
            [15, 16, 17],
            [18, 19, 20],
            [21, 22, 23],
            [24, 25, 26],
            [27, 28, 29],
            [30, 31, 32],
            [33, 34, 35],
        ];
    }
    return cubeMesh;
}
//# sourceMappingURL=cube.js.map