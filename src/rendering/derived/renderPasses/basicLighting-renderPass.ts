import { Camera } from "../../core/camera.js";
import { BindGroup, BindGroupLayout } from "../../core/material.js";
import { RenderGraph } from "../../core/renderGraph.js";
import { RenderPass } from "../../core/renderPass.js";
import { Shader } from "../../core/shader.js";
import { Texture } from "../../core/texture.js";
import { Renderer } from "../../renderer.js"; 
import { BasicLightingFSShader } from "../../shaders/class/basicLighting-fsShader.js";
import { QuadVSShader } from "../../shaders/class/quad-shader.js";
import { GBufferRenderPass } from "./gBuffer-renderPass.js";

export class BasicLightingRenderPass extends RenderPass {
    gBufferPass: GBufferRenderPass;

    pipeline: GPURenderPipeline;

    vsShader: Shader;
    fsShader: Shader;

    targetTexture: Texture;

    constructor(renderer: Renderer, renderGraph: RenderGraph, name: string, gBufferPass: GBufferRenderPass) {
        super(renderer, renderGraph, name);

        if (!renderer.device) throw new Error("Device is missing from Renderer");
        if (!renderer.context) throw new Error("Context is missing from Renderer");
        if (!renderer.presentationFormat) throw new Error("presentationFormat is missing from Renderer");

        this.targetTexture = new Texture(
            renderer,
            "Target-" + this.label,
            [1,1,1],
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            "rgba8unorm",
            true,
        );
        this.colorAttachments = [
            {
                view: this.targetTexture.createView(), //this should be set later
          
                clearValue: [0.0, 0.0, 1.0, 1.0],
                loadOp: "load",
                storeOp: 'store',
            },
        ];

        //uniforms
        BasicLightingRenderPass.uniformBuffer = renderer.device.createBuffer({
            size:  4 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        BasicLightingRenderPass.bindGroupLayout = new BindGroupLayout(this.renderer, "BasicLightingRenderPass");
        BasicLightingRenderPass.bindGroupLayout.bindGroupLayoutEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform",
                }
            }
        ];

        BasicLightingRenderPass.bindGroup = new BindGroup(this.renderer, "BasicLightingRenderPass");
        BasicLightingRenderPass.bindGroup.bindGroupLayout = BasicLightingRenderPass.bindGroupLayout;
        BasicLightingRenderPass.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                resource: {
                    buffer: BasicLightingRenderPass.uniformBuffer,
                },
            }
        ];

        this.vsShader = new QuadVSShader(renderer, "QuadVSShader-BasicLighting");
        this.fsShader = new BasicLightingFSShader(renderer, "BasicLightingFSShader-BasicLighting");

        this.pipeline = renderer.device.createRenderPipeline({
            label: "RenderPipeline-" + this.label,
            layout: renderer.device.createPipelineLayout({
                label: "RenderPipelineLayout-" + this.label,
                bindGroupLayouts: [GBufferRenderPass.texturesBindGroupLayout.getBindGroupLayout(), BasicLightingRenderPass.bindGroupLayout.getBindGroupLayout(), this.renderGraph.bindGroupLayout.getBindGroupLayout()]
            }),
            vertex: {
                module: this.vsShader.getShaderModule(),
                entryPoint: "vertexMain",
            },
            fragment: {
                module: this.fsShader.getShaderModule(),
                entryPoint: "fragmentMain",
                targets: [
                    {
                        format: "rgba8unorm"
                    }
                ]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back',
            }
        });

        this.gBufferPass = gBufferPass;
    }
    
    executeVirtualBefore(): void {
        if (!this.renderer.context) throw new Error("Context is missing from Renderer");
        if (!this.renderer.device) throw new Error("Device is missing from Renderer");

        const camera: Camera | undefined = this.renderGraph.camera;

        if (!camera) {
            throw new Error("RenderGraph is missing Camera");
        }

        this.colorAttachments = [
            {
                view: this.targetTexture.createView(), //this should be set later
          
                clearValue: [0.0, 0.0, 1.0, 1.0],
                loadOp: "load",
                storeOp: 'store',
            },
        ];

        const dlc0: number = 255 / 255;
        const dlc1: number = 239 / 255;
        const dlc2: number = 194 / 255;

        const alc0: number = 29 / 255;
        const alc1: number = 20 / 255;
        const alc2: number = 20 / 255;

        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 0, new Float32Array([-0.419, 0.544, 0.726])); //lightDir
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4, new Float32Array([dlc0 - alc0, dlc1 - alc1, dlc2 - alc2])); //dir light color
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4 * 2, new Float32Array([alc0, alc1, alc2])); //ambient light color
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4 * 3, new Float32Array([camera.position.x, camera.position.y, camera.position.z]));
    }

    executeVirtual(): void {
        if (!this.passEncoder) throw new Error("PassEncoder is missing from BasicLightingRenderPass");
        if (!this.renderer.context) throw new Error("Context is missing from Renderer");

        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, GBufferRenderPass.texturesBindGroup.getBindGroup());
        this.passEncoder.setBindGroup(1, BasicLightingRenderPass.bindGroup.getBindGroup());
        this.passEncoder.setBindGroup(2, this.renderGraph.bindGroup.getBindGroup());
        this.passEncoder.draw(6);
    }
}