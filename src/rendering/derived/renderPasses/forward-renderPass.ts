import { BindGroup } from "../../core/material.js";
import { RenderGraph } from "../../core/renderGraph.js";
import { RenderPass } from "../../core/renderPass.js";
import { Texture } from "../../core/texture.js";
import { Renderer } from "../../renderer.js"; 
import { GBufferRenderPass } from "./gBuffer-renderPass.js";

export class ForwardRenderPass extends RenderPass {
    gBufferPass: GBufferRenderPass;

    targetTexture: GPUTexture;
    depthTexture: Texture;

    static texturesBindGroup: BindGroup;

    constructor(renderer: Renderer, renderGraph: RenderGraph, name: string, gBufferPass: GBufferRenderPass, targetTexture: GPUTexture) {
        super(renderer, renderGraph, name);

        if (!renderer.device) throw new Error("Device is missing from Renderer");

        this.gBufferPass = gBufferPass;

        this.depthTexture = new Texture(renderer,
            "ForwardRenderPass-depthTexture",
            [1,1,1],
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            "depth24plus",
            true,
        );

        this.targetTexture = targetTexture;
        this.colorAttachments = [
            {
                view: targetTexture.createView(), //this should be set later
          
                loadOp: 'load',
                storeOp: 'store',
            },
        ];

        if (!this.gBufferPass.depthStencilAttachment) throw new Error("GBufferPass is missing depthStencilAttachment");

        this.depthStencilAttachment = {
            view: this.gBufferPass.depthStencilAttachment.view,
        
            depthLoadOp: "load",
            depthStoreOp: 'store',
        };

        // Forwar
        ForwardRenderPass.texturesBindGroup = new BindGroup(this.renderer, "Textures-ForwardRenderPass");

        //uniforms
        ForwardRenderPass.uniformBuffer = renderer.device.createBuffer({
            size:  1,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        ForwardRenderPass.bindGroup = new BindGroup(this.renderer, "ForwardRenderPass");
        ForwardRenderPass.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                resource: {
                    buffer: ForwardRenderPass.uniformBuffer,
                },
                buffer: {
                    type: "uniform",
                }
            }
        ];
    }

    executeVirtualBefore(): void {
        if (!this.gBufferPass.depthStencilAttachment) throw new Error("GBufferPass is missing depthStencilAttachment");

        this.colorAttachments[0].view = this.targetTexture.createView();
        this.depthStencilAttachment = {
            view: this.gBufferPass.depthStencilAttachment.view,
        
            depthClearValue: 1.0,
            depthLoadOp: "load",
            depthStoreOp: 'store',
        };

    }

    executeVirtual(): void {
        if (!this.passEncoder) throw new Error("PassEncoder is missing from ForwardRenderPass");

        /*for (const model of this.renderer.getModels()) {
            model.prepareRender();
        }*/

        for (const model of this.renderer.getModels()) {
            model.render(this, "forwardMat");
        }
    }
}