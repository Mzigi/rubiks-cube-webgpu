import { BindGroup, BindGroupLayout } from "../../core/material.js";
import { RenderGraph } from "../../core/renderGraph.js";
import { RenderPass } from "../../core/renderPass.js";
import { Shader } from "../../core/shader.js";
import { Renderer } from "../../renderer.js"; 
import { BasicLightingFSShader } from "../../shaders/class/basicLighting-fsShader.js";
import { QuadVSShader } from "../../shaders/class/quad-vsShader.js";
import { GBufferRenderPass } from "./gBuffer-renderPass.js";

export class BasicLightingRenderPass extends RenderPass {
    gBufferPass: GBufferRenderPass;

    pipeline: GPURenderPipeline;

    vsShader: Shader;
    fsShader: Shader;

    targetTexture: GPUTexture;

    constructor(renderer: Renderer, renderGraph: RenderGraph, name: string, gBufferPass: GBufferRenderPass, targetTexture: GPUTexture) {
        super(renderer, renderGraph, name);

        if (!renderer.device) throw new Error("Device is missing from Renderer");
        if (!renderer.context) throw new Error("Context is missing from Renderer");
        if (!renderer.presentationFormat) throw new Error("presentationFormat is missing from Renderer");

        this.targetTexture = targetTexture;
        this.colorAttachments = [
            {
                view: targetTexture.createView(), //this should be set later
          
                clearValue: [0.0, 0.0, 1.0, 1.0],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ];

        //uniforms
        BasicLightingRenderPass.uniformBuffer = renderer.device.createBuffer({
            size:  1,
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
                bindGroupLayouts: [GBufferRenderPass.texturesBindGroupLayout.getBindGroupLayout(), this.renderGraph.bindGroupLayout.getBindGroupLayout()]
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
                        format: renderer.presentationFormat
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

        this.colorAttachments[0].view = this.targetTexture.createView();
    }

    executeVirtual(): void {
        if (!this.passEncoder) throw new Error("PassEncoder is missing from BasicLightingRenderPass");
        if (!this.renderer.context) throw new Error("Context is missing from Renderer");

        //this.colorAttachments[0].view = this.renderer.context.getCurrentTexture().createView();
        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, GBufferRenderPass.texturesBindGroup.getBindGroup());
        this.passEncoder.setBindGroup(1, BasicLightingRenderPass.bindGroup.getBindGroup());
        this.passEncoder.draw(6);
    }
}