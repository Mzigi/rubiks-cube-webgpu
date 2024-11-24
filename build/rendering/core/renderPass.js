import { GPUObject } from "./gpuObject.js";
export class RenderPass extends GPUObject {
    renderGraph;
    passEncoder;
    colorAttachments = []; //VIRTUAL
    depthStencilAttachment = undefined; //VIRTUAL
    static bindGroup;
    static bindGroupLayout;
    static uniformBuffer;
    constructor(renderer, renderGraph, name) {
        super(renderer, `RenderPass-${name}`);
        this.renderGraph = renderGraph;
    }
    executeVirtualBefore() {
    }
    executeVirtual() {
        throw new Error("Virtual method called");
    }
    execute() {
        if (!this.renderer.commandEncoder)
            throw new Error("The renderer does not have a command encoder");
        this.executeVirtualBefore();
        this.passEncoder = this.renderer.commandEncoder.beginRenderPass(this.getDescriptor());
        this.passEncoder.setBindGroup(0, this.renderGraph.bindGroup.getBindGroup());
        this.executeVirtual();
        this.passEncoder.end();
    }
    getDescriptor() {
        const descriptor = {
            "colorAttachments": this.colorAttachments,
            "label": this.label,
        };
        if (this.depthStencilAttachment) {
            descriptor.depthStencilAttachment = this.depthStencilAttachment;
        }
        return descriptor;
    }
}
//# sourceMappingURL=renderPass.js.map