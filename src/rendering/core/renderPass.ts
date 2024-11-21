import { Renderer } from "../renderer.js";
import { GPUObject } from "./gpuObject.js";
import { BindGroup } from "./material.js";
import { RenderGraph } from "./renderGraph.js";

export class RenderPass extends GPUObject { //VIRTUAL CLASS
    renderGraph: RenderGraph;

    passEncoder: GPURenderPassEncoder | undefined;

    colorAttachments: GPURenderPassColorAttachment[] = []; //VIRTUAL
    depthStencilAttachment: GPURenderPassDepthStencilAttachment | undefined = undefined; //VIRTUAL

    static bindGroup: BindGroup;
    static uniformBuffer: GPUBuffer;

    constructor(renderer: Renderer, renderGraph: RenderGraph, name: string) {
        super(renderer, `RenderPass-${name}`);

        this.renderGraph = renderGraph;
    }

    executeVirtualBefore(): void {
        
    }

    executeVirtual(): void {
        throw new Error("Virtual method called");
    }

    execute(): void {
        if (!this.renderer.commandEncoder) throw new Error("The renderer does not have a command encoder");

        this.executeVirtualBefore();

        this.passEncoder = this.renderer.commandEncoder.beginRenderPass(this.getDescriptor());

        this.passEncoder.setBindGroup(0, this.renderGraph.bindGroup.getBindGroup());

        this.executeVirtual();
        this.passEncoder.end();
    }

    getDescriptor(): GPURenderPassDescriptor {
        const descriptor: GPURenderPassDescriptor = {
            "colorAttachments": this.colorAttachments,
            "label": this.label,
        };

        if (this.depthStencilAttachment) {
            descriptor.depthStencilAttachment = this.depthStencilAttachment;
        }

        return descriptor;
    }
}