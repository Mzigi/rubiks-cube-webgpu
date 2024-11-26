import { LightType } from "../../core/light.js";
import { BindGroup, BindGroupLayout } from "../../core/material.js";
import { RenderPass } from "../../core/renderPass.js";
import { Texture } from "../../core/texture.js";
import { BasicLightingFSShader } from "../../shaders/class/basicLighting-fsShader.js";
import { QuadVSShader } from "../../shaders/class/quad-shader.js";
import { GBufferRenderPass } from "./gBuffer-renderPass.js";
const maxPointLights = 64;
const pointLightSize = 4 * 4 * 4; //4 * vec3 * float
export class BasicLightingRenderPass extends RenderPass {
    gBufferPass;
    pipeline;
    vsShader;
    fsShader;
    targetTexture;
    pointLightBuffer;
    constructor(renderer, renderGraph, name, gBufferPass) {
        super(renderer, renderGraph, name);
        if (!renderer.device)
            throw new Error("Device is missing from Renderer");
        if (!renderer.context)
            throw new Error("Context is missing from Renderer");
        if (!renderer.presentationFormat)
            throw new Error("presentationFormat is missing from Renderer");
        this.targetTexture = new Texture(renderer, "Target-" + this.label, [1, 1, 1], GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING, "rgba8unorm", true);
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
            size: 80,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.pointLightBuffer = renderer.device.createBuffer({
            size: maxPointLights * pointLightSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        BasicLightingRenderPass.bindGroupLayout = new BindGroupLayout(this.renderer, "BasicLightingRenderPass");
        BasicLightingRenderPass.bindGroupLayout.bindGroupLayoutEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform",
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "read-only-storage",
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
            },
            {
                binding: 1,
                resource: {
                    buffer: this.pointLightBuffer,
                }
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
    executeVirtualBefore() {
        if (!this.renderer.context)
            throw new Error("Context is missing from Renderer");
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        const camera = this.renderGraph.camera;
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
        /*const dlc0: number = 255 / 255;
        const dlc1: number = 239 / 255;
        const dlc2: number = 194 / 255;*/
        const dlc0 = 0 / 255;
        const dlc1 = 0 / 255;
        const dlc2 = 0 / 255;
        const alc0 = 29 / 255;
        const alc1 = 20 / 255;
        const alc2 = 20 / 255;
        const fc0 = Math.max(0, dlc0 - alc0);
        const fc1 = Math.max(0, dlc1 - alc1);
        const fc2 = Math.max(0, dlc2 - alc2);
        //lightInfo
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 0, new Float32Array([-0.419, 0.544, 0.726])); //lightDir
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4, new Float32Array([fc0, fc1, fc2])); //dir light color
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4 * 2, new Float32Array([alc0, alc1, alc2])); //ambient light color
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4 * 3, new Float32Array([camera.position.x, camera.position.y, camera.position.z])); //camera pos
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4 * 4, new Float32Array([this.renderer.canvas.width, this.renderer.canvas.height])); //resolution
        //pointLightsArray
        let pointLightIndex = 0;
        let pointLightOffset = pointLightIndex * pointLightSize;
        for (const light of this.renderer.getLights(LightType.Point).sort((a, b) => {
            return a.position.minus(camera.position).magnitude() - b.position.minus(camera.position).magnitude();
        }).slice(0, maxPointLights)) {
            this.renderer.device.queue.writeBuffer(this.pointLightBuffer, pointLightOffset, new Float32Array(light.position.toArray())); //position
            pointLightOffset += 4 * 4;
            this.renderer.device.queue.writeBuffer(this.pointLightBuffer, pointLightOffset, new Float32Array(light.specularColor.toArray().map((val) => { return val / 255; }))); //specular color
            pointLightOffset += 4 * 4;
            this.renderer.device.queue.writeBuffer(this.pointLightBuffer, pointLightOffset, new Float32Array(light.diffuseColor.toArray().map((val) => { return val / 255; }))); //diffuse color
            pointLightOffset += 4 * 4;
            this.renderer.device.queue.writeBuffer(this.pointLightBuffer, pointLightOffset, new Float32Array([light.constant, light.linear, light.quadratic])); //constant, linear, quadratic
            pointLightOffset += 4 * 4;
            pointLightIndex += 1;
        }
        this.renderer.device.queue.writeBuffer(BasicLightingRenderPass.uniformBuffer, 4 * 4 * 4 + 4 * 2, new Uint32Array([pointLightIndex])); //point light count
    }
    executeVirtual() {
        if (!this.passEncoder)
            throw new Error("PassEncoder is missing from BasicLightingRenderPass");
        if (!this.renderer.context)
            throw new Error("Context is missing from Renderer");
        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, GBufferRenderPass.texturesBindGroup.getBindGroup());
        this.passEncoder.setBindGroup(1, BasicLightingRenderPass.bindGroup.getBindGroup());
        this.passEncoder.setBindGroup(2, this.renderGraph.bindGroup.getBindGroup());
        this.passEncoder.draw(6);
    }
}
//# sourceMappingURL=basicLighting-renderPass.js.map