import { Game } from "../game.js";
import { PointLight } from "../rendering/core/light.js";
import { MaterialView } from "../rendering/core/material.js";
import { Model, Vector3 } from "../rendering/core/model.js";
import { GetCubeMesh } from "../rendering/data/meshes/cube.js";
import { CubeGBufferMaterial } from "../rendering/derived/materials/cubeGBuffer-material.js";
import { CubemapMaterial } from "../rendering/derived/materials/cubemap-material.js";
export class Rubiks extends Game {
    renderer;
    renderGraph;
    camera;
    created = false;
    pointLights = [];
    constructor(app) {
        super(app);
        this.renderer = app.renderer;
    }
    init() {
        if (!this.renderer.renderGraph)
            throw new Error("Renderer is missing RenderGraph");
        this.renderGraph = this.renderer.renderGraph;
        if (!this.renderGraph.camera)
            throw new Error("RenderGraph is missing Camera");
        this.camera = this.renderGraph.camera;
        document.body.addEventListener("keydown", (e) => {
            switch (e.code) {
                case "KeyW":
                    this.camera.position.z -= 0.1;
                    break;
                case "KeyA":
                    this.camera.position.x -= 0.1;
                    break;
                case "KeyD":
                    this.camera.position.x += 0.1;
                    break;
                case "KeyS":
                    this.camera.position.z += 0.1;
                    break;
                case "Space":
                    this.camera.position.y += 0.1;
                    break;
                case "KeyQ":
                    this.camera.position.y -= 0.1;
                    break;
                case "ArrowRight":
                    this.camera.rotation.y -= 3;
                    break;
                case "ArrowLeft":
                    this.camera.rotation.y += 3;
                    break;
                case "ArrowUp":
                    this.camera.rotation.x += 3;
                    break;
                case "ArrowDown":
                    this.camera.rotation.x -= 3;
                    break;
            }
            //console.log(e.code);
        });
        this.doStuff();
    }
    doStuff() {
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    const cubeModel = new Model(this.renderer, GetCubeMesh(), "cube");
                    cubeModel.gBufferMat = new MaterialView(CubeGBufferMaterial.get(this.renderer));
                    cubeModel.getIndexBuffer();
                    cubeModel.getVertexBuffer();
                    cubeModel.position = new Vector3(x * 2, y * 2, z * 2);
                    cubeModel.size = new Vector3(2 / 3, 2 / 3, 2 / 3);
                    if (x === 2) {
                        CubeGBufferMaterial.get(this.renderer).getBindGroupForTexture('./assets/textures/cubemaps/ocean/bottom.jpg').then((bindGroup) => {
                            if (cubeModel.gBufferMat) {
                                cubeModel.gBufferMat.bindGroup = bindGroup;
                            }
                        });
                    }
                    this.renderer.addModel(cubeModel);
                }
            }
        }
        const cubeModel = new Model(this.renderer, GetCubeMesh(), "cube");
        cubeModel.gBufferMat = new MaterialView(CubeGBufferMaterial.get(this.renderer));
        cubeModel.getIndexBuffer();
        cubeModel.getVertexBuffer();
        cubeModel.position = new Vector3(0, 0, 0);
        cubeModel.size = new Vector3(0.1, 0.1, 0.1);
        CubeGBufferMaterial.get(this.renderer).getBindGroupForTexture('./assets/textures/cubemaps/ocean/top.jpg').then((bindGroup) => {
            if (cubeModel.gBufferMat) {
                cubeModel.gBufferMat.bindGroup = bindGroup;
            }
        });
        this.renderer.addModel(cubeModel);
        const cubemapModel = new Model(this.renderer, GetCubeMesh(), "cubemap");
        cubemapModel.forwardMat = new MaterialView(CubemapMaterial.get(this.renderer));
        cubemapModel.getIndexBuffer();
        cubemapModel.getVertexBuffer();
        this.renderer.addModel(cubemapModel);
        CubeGBufferMaterial.get(this.renderer).getBindGroupForTexture('./assets/textures/cubemaps/ocean/left.jpg').then((bindGroup) => {
            for (let i = 0; i < 64; i++) {
                const pointLight = new PointLight();
                pointLight.position.x = Math.random() * 5;
                pointLight.position.y = Math.random() * 5;
                pointLight.position.z = Math.random() * 5;
                pointLight.diffuseColor.r = Math.random() * 255;
                pointLight.diffuseColor.g = Math.random() * 255;
                pointLight.diffuseColor.b = Math.random() * 255;
                pointLight.distance = Math.random() * 5 + 10;
                pointLight.specularColor = pointLight.diffuseColor.clone();
                const cubeModel = new Model(this.renderer, GetCubeMesh(), "cube");
                cubeModel.gBufferMat = new MaterialView(CubeGBufferMaterial.get(this.renderer));
                cubeModel.getIndexBuffer();
                cubeModel.getVertexBuffer();
                cubeModel.position = pointLight.position;
                cubeModel.size = new Vector3(0.1, 0.1, 0.1);
                if (cubeModel.gBufferMat) {
                    cubeModel.gBufferMat.bindGroup = bindGroup;
                }
                this.renderer.addModel(cubeModel);
                this.renderer.addLight(pointLight);
                this.pointLights.push(pointLight);
            }
        });
        this.created = true;
    }
    update() {
        if (!this.created)
            return;
        for (const pointLight of this.pointLights) {
            pointLight.position.x += (Math.random() - 0.5) / 60;
            pointLight.position.y = (pointLight.position.y + (Math.random()) / 60) % 5;
            pointLight.position.z += (Math.random() - 0.5) / 60;
        }
    }
}
//# sourceMappingURL=rubiks.js.map