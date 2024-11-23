import { Game } from "../game.js";
import { Material } from "../rendering/core/material.js";
import { Model } from "../rendering/core/model.js";
import { GetCubeMesh } from "../rendering/data/meshes/cube.js";
import { CubemapMaterial } from "../rendering/derived/materials/cubemap-material.js";
export class Rubiks extends Game {
    renderer;
    renderGraph;
    camera;
    created = false;
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
        const cubemapModel = new Model(this.renderer, GetCubeMesh(), "cubemap");
        cubemapModel.forwardMat = Material.get(CubemapMaterial, this.renderer);
        cubemapModel.getIndexBuffer();
        cubemapModel.getVertexBuffer();
        this.renderer.addModel(cubemapModel);
        this.created = true;
    }
    update() {
        if (!this.created)
            return;
    }
}
//# sourceMappingURL=rubiks.js.map