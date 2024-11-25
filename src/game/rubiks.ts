import { App } from "../app.js";
import { Game } from "../game.js";
import { Camera } from "../rendering/core/camera.js";
import { BindGroup, MaterialView } from "../rendering/core/material.js";
import { Model, Vector3 } from "../rendering/core/model.js";
import { RenderGraph } from "../rendering/core/renderGraph.js";
import { GetCubeMesh } from "../rendering/data/meshes/cube.js";
import { CubeGBufferMaterial } from "../rendering/derived/materials/cubeGBuffer-material.js";
import { CubemapMaterial } from "../rendering/derived/materials/cubemap-material.js";
import { Renderer } from "../rendering/renderer.js";

export class Rubiks extends Game {
    renderer: Renderer;

    renderGraph!: RenderGraph;
    camera!: Camera;

    created: boolean = false;

    constructor(app: App) {
        super(app);

        this.renderer = app.renderer;
    }

    init(): void {
        if (!this.renderer.renderGraph) throw new Error("Renderer is missing RenderGraph");

        this.renderGraph = this.renderer.renderGraph;

        if (!this.renderGraph.camera) throw new Error("RenderGraph is missing Camera");

        this.camera = this.renderGraph.camera;

        document.body.addEventListener("keydown", (e: KeyboardEvent) => {
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

    doStuff(): void {
        for (let x: number = 0; x < 3; x++) {
            for (let y: number = 0; y < 3; y++) {
                for (let z: number = 0; z < 3; z++) {
                    const cubeModel: Model = new Model(this.renderer, GetCubeMesh(), "cube");
                    cubeModel.gBufferMat = new MaterialView(CubeGBufferMaterial.get(this.renderer));
                    cubeModel.getIndexBuffer();
                    cubeModel.getVertexBuffer();
                    cubeModel.position = new Vector3(x * 2,y * 2,z * 2);
                    cubeModel.size = new Vector3(2 / 3, 2 / 3, 2 / 3);

                    if (x === 2) {
                        (CubeGBufferMaterial.get(this.renderer) as CubeGBufferMaterial).getBindGroupForTexture('./assets/textures/cubemaps/ocean/bottom.jpg').then((bindGroup: BindGroup) => {
                            if (cubeModel.gBufferMat) {
                                cubeModel.gBufferMat.bindGroup = bindGroup;
                            }
                        });
                    }

                    this.renderer.addModel(cubeModel);
                }
            }
        }

        const cubemapModel: Model = new Model(this.renderer, GetCubeMesh(), "cubemap");
        cubemapModel.forwardMat = new MaterialView(CubemapMaterial.get(this.renderer));
        cubemapModel.getIndexBuffer();
        cubemapModel.getVertexBuffer();
        
        this.renderer.addModel(cubemapModel);

        this.created = true;
    }

    update(): void {
        if (!this.created) return;
    }
}