import { Renderer } from "../renderer.js";
import { BindGroup } from "./material.js";
import { RenderPass } from "./renderPass.js";

type RenderPassMap = Map<string, RenderPass>

export class RenderGraph { //VIRTUAL CLASS
    renderer: Renderer;

    renderPasses: RenderPassMap = new Map();

    bindGroup!: BindGroup; //VIRTUAL
    uniformBuffer!: GPUBuffer; //VIRTUAL

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    execute(): void {
        throw new Error("Virtual method called!");
    }
}