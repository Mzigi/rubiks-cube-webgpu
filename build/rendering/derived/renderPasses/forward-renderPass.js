import { BindGroup, BindGroupLayout } from "../../core/material.js";
import { RenderPass } from "../../core/renderPass.js";
import { Texture } from "../../core/texture.js";
export class ForwardRenderPass extends RenderPass {
    gBufferPass;
    targetTexture;
    depthTexture;
    constructor(renderer, renderGraph, name, gBufferPass, targetTexture) {
        super(renderer, renderGraph, name);
        if (!renderer.device)
            throw new Error("Device is missing from Renderer");
        this.gBufferPass = gBufferPass;
        this.depthTexture = new Texture(renderer, "ForwardRenderPass-depthTexture", [1, 1, 1], GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING, "depth24plus", true);
        this.targetTexture = targetTexture;
        this.colorAttachments = [
            {
                view: targetTexture.createView(), //this should be set later
                loadOp: 'load',
                storeOp: 'store',
            },
        ];
        if (!this.gBufferPass.depthStencilAttachment)
            throw new Error("GBufferPass is missing depthStencilAttachment");
        this.depthStencilAttachment = {
            view: this.gBufferPass.depthStencilAttachment.view,
            depthLoadOp: "load",
            depthStoreOp: 'store',
        };
        // Forwar
        //uniforms
        ForwardRenderPass.uniformBuffer = renderer.device.createBuffer({
            size: 1,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        ForwardRenderPass.bindGroupLayout = new BindGroupLayout(this.renderer, "ForwardRenderPass");
        ForwardRenderPass.bindGroupLayout.bindGroupLayoutEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform",
                }
            }
        ];
        ForwardRenderPass.bindGroup = new BindGroup(this.renderer, "ForwardRenderPass");
        ForwardRenderPass.bindGroup.bindGroupLayout = ForwardRenderPass.bindGroupLayout;
        ForwardRenderPass.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                resource: {
                    buffer: ForwardRenderPass.uniformBuffer,
                },
            }
        ];
    }
    executeVirtualBefore() {
        if (!this.gBufferPass.depthStencilAttachment)
            throw new Error("GBufferPass is missing depthStencilAttachment");
        this.colorAttachments[0].view = this.targetTexture.createView();
        this.depthStencilAttachment = {
            view: this.gBufferPass.depthStencilAttachment.view,
            depthClearValue: 1.0,
            depthLoadOp: "load",
            depthStoreOp: 'store',
        };
    }
    executeVirtual() {
        if (!this.passEncoder)
            throw new Error("PassEncoder is missing from ForwardRenderPass");
        /*for (const model of this.renderer.getModels()) {
            model.prepareRender();
        }*/
        for (const model of this.renderer.getModels()) {
            model.render(this, "forwardMat");
        }
    }
}
//# sourceMappingURL=forward-renderPass.js.map