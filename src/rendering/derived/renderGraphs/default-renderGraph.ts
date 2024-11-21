import { mat4 } from "../../../../node_modules/wgpu-matrix/dist/3.x/wgpu-matrix.module.js";
import { BindGroup } from "../../core/material.js";
import { RenderGraph } from "../../core/renderGraph.js";
import { Renderer } from "../../renderer.js";
import { BasicLightingRenderPass } from "../renderPasses/basicLighting-renderPass.js";
import { GBufferRenderPass } from "../renderPasses/gBuffer-renderPass.js";

/*
struct Global {
    viewProjectionMatrix: mat4x4,
}
*/

export class DefaultRenderGraph extends RenderGraph {
    gBufferPass: GBufferRenderPass;
    basicLightingPass: BasicLightingRenderPass;

    constructor(renderer: Renderer) {
        super(renderer);

        if (!this.renderer.device) throw new Error("Device is missing from Renderer");

        this.uniformBuffer = this.renderer.device.createBuffer({
            size:  4 * 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.bindGroup = new BindGroup(this.renderer, "DefaultRenderGraph");
        this.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                resource: {
                    buffer: this.uniformBuffer,
                },
                buffer: {
                    type: "uniform",
                }
            }
        ];

        this.gBufferPass = new GBufferRenderPass(renderer, this, "gBufferPass");
        this.basicLightingPass = new BasicLightingRenderPass(renderer, this, "basicLightingPass", this.gBufferPass);
    }

    execute(): void {
        if (!this.renderer.device) throw new Error("Device is missing from Renderer");

        const projectionMatrix: Float32Array = mat4.perspective(70 * Math.PI / 180, this.renderer.aspect, 0.1, 5);
        const viewMatrix: Float32Array = mat4.lookAt([1.5,1.5,1.5], [0,0,0], [0,1,0]);

        const viewProjectionMatrix: Float32Array = mat4.multiply(projectionMatrix, viewMatrix);

        this.renderer.device.queue.writeBuffer(this.uniformBuffer, 0, viewProjectionMatrix);

        this.gBufferPass.execute();
        this.basicLightingPass.execute();
    }
}