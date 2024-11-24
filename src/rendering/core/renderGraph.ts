import { Renderer } from "../renderer.js";
import { Camera } from "./camera.js";
import { BindGroup, BindGroupLayout } from "./material.js";
import { RenderPass } from "./renderPass.js";

type RenderPassMap = Map<string, RenderPass>

export class RenderGraph { //VIRTUAL CLASS
    renderer: Renderer;

    camera: Camera | undefined;

    renderPasses: RenderPassMap = new Map();

    bindGroup!: BindGroup; //VIRTUAL
    bindGroupLayout!: BindGroupLayout; //VIRTUAL
    uniformBuffer!: GPUBuffer; //VIRTUAL

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    execute(): void {
        throw new Error("Virtual method called!");
    }
}