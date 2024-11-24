import { Camera } from "../../core/camera.js";
import { BindGroup } from "../../core/material.js";
import { Vector3 } from "../../core/mesh.js";
import { RenderGraph } from "../../core/renderGraph.js";
import { BasicLightingRenderPass } from "../renderPasses/basicLighting-renderPass.js";
import { ForwardRenderPass } from "../renderPasses/forward-renderPass.js";
import { GBufferRenderPass } from "../renderPasses/gBuffer-renderPass.js";
/*
struct Global {
    viewProjectionMatrix: mat4x4,
}
*/
export class DefaultRenderGraph extends RenderGraph {
    gBufferPass;
    basicLightingPass;
    forwardPass;
    camera;
    constructor(renderer) {
        super(renderer);
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        if (!this.renderer.context)
            throw new Error("Context is missing from Renderer");
        this.uniformBuffer = this.renderer.device.createBuffer({
            size: 4 * 16 * 2,
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
        this.basicLightingPass = new BasicLightingRenderPass(renderer, this, "basicLightingPass", this.gBufferPass, this.renderer.context.getCurrentTexture());
        this.forwardPass = new ForwardRenderPass(renderer, this, "forwardRenderPass", this.gBufferPass, this.renderer.context.getCurrentTexture());
        this.camera = new Camera(new Vector3(0.7, 0, 5.29));
    }
    execute() {
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        if (!this.renderer.context)
            throw new Error("Context is missing from Renderer");
        const projectionMatrix = this.camera.getProjectionMatrix(this.renderer.aspect);
        //const viewMatrix: Float32Array = mat4.lookAt([1.5,1.5,1.5], [0,0,0], [0,1,0]);
        const viewMatrix = this.camera.getViewMatrix();
        //const viewProjectionMatrix: Float32Array = mat4.multiply(projectionMatrix, viewMatrix);
        this.renderer.device.queue.writeBuffer(this.uniformBuffer, 0, projectionMatrix);
        this.renderer.device.queue.writeBuffer(this.uniformBuffer, 64, viewMatrix);
        for (const model of this.renderer.getModels()) {
            model.prepareRender();
        }
        this.basicLightingPass.targetTexture = this.renderer.context.getCurrentTexture();
        this.forwardPass.targetTexture = this.renderer.context.getCurrentTexture();
        this.gBufferPass.execute();
        this.basicLightingPass.execute();
        this.forwardPass.execute();
    }
}
//# sourceMappingURL=default-renderGraph.js.map