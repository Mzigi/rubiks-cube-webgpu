import { Mesh, Vector3 } from "./core/mesh.js";
import { BindGroup } from "./core/material.js";
import { CubeGBufferMaterial } from "./derived/materials/cubeGBuffer-material.js";
import { GetCubeMesh } from "./data/meshes/cube.js";
export class Renderer {
    canvas;
    context;
    presentationFormat;
    aspect = 1;
    adapter;
    device;
    commandEncoder;
    //modelUniformBuffer!: GPUBuffer;
    modelBindGroup;
    renderGraph;
    textures = new Map();
    models = [];
    materials = new Map();
    success = undefined;
    constructor(canvas) {
        this.canvas = canvas;
    }
    async init() {
        this.context = this.canvas.getContext("webgpu");
        this.adapter = await navigator.gpu?.requestAdapter();
        this.device = await this.adapter?.requestDevice();
        this.success = (!!this.adapter && !!this.device && !!this.context);
        if (!this.success || !this.device)
            return;
        this.device.addEventListener("uncapturedevent", () => {
            throw new Error("oh no! uncaptured event!!");
        });
        this.configureCanvas();
        this.modelBindGroup = new BindGroup(this, "ModelBindGroup");
        this.modelBindGroup.bindGroupEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                resource: undefined,
                buffer: {
                    type: "uniform",
                }
            }
        ];
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    const cubeModel = new Mesh(this, GetCubeMesh(), "cube");
                    cubeModel.gBufferMat = CubeGBufferMaterial.getDefault(this);
                    cubeModel.getIndexBuffer();
                    cubeModel.getVertexBuffer();
                    cubeModel.position = new Vector3(x * 2, y * 2, z * 2);
                    cubeModel.size = new Vector3(2 / 3, 2 / 3, 2 / 3);
                    console.log(cubeModel.position);
                    this.addModel(cubeModel);
                }
            }
        }
    }
    configureCanvas() {
        if (!this.context)
            throw new Error("Renderer is missing context");
        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: this.presentationFormat,
        });
        this.resizeCanvas();
    }
    resizeCanvas() {
        if (this.canvas.width === this.canvas.clientWidth && this.canvas.height === this.canvas.clientHeight)
            return;
        this.canvas.width = this.canvas.clientWidth; //TODO: * devicePixelRatio
        this.canvas.height = this.canvas.clientHeight;
        this.aspect = this.canvas.width / this.canvas.height;
        //update texture that are the size of the canvas
        for (const [, texture] of this.textures) {
            if (texture.matchCanvas) {
                texture.create();
            }
        }
    }
    addModel(model) {
        model.id = this.models.length;
        this.models.push(model);
        return model.id;
    }
    removeModel(model) {
        if (model.id !== undefined) {
            this.models[model.id] = this.models[this.models.length - 1];
            this.models[model.id].id = model.id;
            this.models.pop();
        }
    }
    getModels() {
        return this.models;
    }
    addTexture(texture) {
        if (!this.textures.get(texture.label)) {
            this.textures.set(texture.label, texture);
        }
        else {
            throw new Error(`Texture with name "${texture.label}" aleady exists`);
        }
    }
    getTexture(textureName) {
        return this.textures.get(textureName);
    }
    addMaterial(materialId, material) {
        if (!this.materials.get(materialId)) {
            this.materials.set(materialId, material);
        }
        else {
            throw new Error(`Material with id "${materialId}" already exists`);
        }
    }
    render() {
        if (!this.renderGraph)
            throw new Error("Renderer is missing RenderGraph");
        if (!this.device)
            throw new Error("Renderer is missing Device");
        this.resizeCanvas();
        this.commandEncoder = this.device.createCommandEncoder({
            "label": "Renderer.commandEncoder"
        });
        this.renderGraph.execute();
        this.device.queue.submit([this.commandEncoder.finish()]);
    }
}
//# sourceMappingURL=renderer.js.map