import { BindGroup } from "../../core/material.js";
import { RenderGraph } from "../../core/renderGraph.js";
import { RenderPass } from "../../core/renderPass.js";
import { Texture } from "../../core/texture.js";
import { Renderer } from "../../renderer.js"; 

export class GBufferRenderPass extends RenderPass {
    gBufferTexture2DFloat16: Texture;
    gBufferTextureAlbedo: Texture;
    depthTexture: Texture;

    gBufferTextureViews: GPUTextureView[] = [];

    static texturesBindGroup: BindGroup;

    constructor(renderer: Renderer, renderGraph: RenderGraph, name: string) {
        super(renderer, renderGraph, name);

        if (!renderer.device) throw new Error("Device is missing from Renderer");

        // GBuffer texture render targets
        this.gBufferTexture2DFloat16 = new Texture(renderer,
            "GBufferRenderPass-gBufferTexture2DFloat16",
            [1,1,1],
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            "rgba16float",
            true,
        );
        this.gBufferTextureAlbedo = new Texture(renderer,
            "GBufferRenderPass-gBufferTextureAlbedo",
            [1,1,1],
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            "bgra8unorm",
            true,
        );
        this.depthTexture = new Texture(renderer,
            "GBufferRenderPass-depthTexture",
            [1,1,1],
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            "depth24plus",
            true,
        );

        GBufferRenderPass.texturesBindGroup = new BindGroup(this.renderer, "Textures-GBufferRenderPass");

        this.setupTextures();

        //uniforms
        GBufferRenderPass.uniformBuffer = renderer.device.createBuffer({
            size:  1,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        GBufferRenderPass.bindGroup = new BindGroup(this.renderer, "GBufferRenderPass");
        GBufferRenderPass.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                resource: {
                    buffer: GBufferRenderPass.uniformBuffer,
                },
                buffer: {
                    type: "uniform",
                }
            }
        ];
    }
    
    setupTextures(): void {
        const viewCreated: boolean = this.gBufferTexture2DFloat16.hasView();

        if (viewCreated) return;

        this.gBufferTextureViews = [
            this.gBufferTexture2DFloat16.createView(),
            this.gBufferTextureAlbedo.createView(),
            this.depthTexture.createView(),
        ];

        this.colorAttachments = [
            {
                view: this.gBufferTextureViews[0],
          
                clearValue: [0.0, 0.0, 1.0, 1.0],
                loadOp: 'clear',
                storeOp: 'store',
              },
              {
                view: this.gBufferTextureViews[1],
          
                clearValue: [0, 0, 0, 1],
                loadOp: 'clear',
                storeOp: 'store',
              },
        ];
        
        this.depthStencilAttachment = {
            view: this.depthTexture.createView(),
        
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        };

        GBufferRenderPass.texturesBindGroup.bindGroupEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                resource: this.gBufferTextureViews[0],
                texture: {
                    sampleType: "unfilterable-float",
                },
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                resource: this.gBufferTextureViews[1],
                texture: {
                    sampleType: "unfilterable-float",
                },
            },
            {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                resource: this.gBufferTextureViews[2],
                texture: {
                    sampleType: "depth",
                },
            },
        ];

        GBufferRenderPass.texturesBindGroup.reset();
    }

    executeVirtualBefore(): void {
        this.setupTextures();
    }

    executeVirtual(): void {
        if (!this.passEncoder) throw new Error("PassEncoder is missing from GBufferRenderPass");

        //this.passEncoder.setBindGroup(1, GBufferRenderPass.bindGroup.getBindGroup());

        for (const model of this.renderer.getModels()) {
            model.render(this, "gBufferMat");
        }
    }
}