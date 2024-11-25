import { Camera } from "../../core/camera.js";
import { BindGroup, BindGroupLayout } from "../../core/material.js";
import { Vector3 } from "../../core/model.js";
import { RenderGraph } from "../../core/renderGraph.js";
import { BasicLightingRenderPass } from "../renderPasses/basicLighting-renderPass.js";
import { DisplayRenderPass } from "../renderPasses/display-renderPass.js";
import { ForwardRenderPass } from "../renderPasses/forward-renderPass.js";
import { GBufferRenderPass } from "../renderPasses/gBuffer-renderPass.js";
import { mat4 } from "../../../../node_modules/wgpu-matrix/dist/3.x/wgpu-matrix.module.js";
/*
struct Global {
    viewProjectionMatrix: mat4x4,
}
*/
export class DefaultRenderGraph extends RenderGraph {
    gBufferPass;
    basicLightingPass;
    forwardPass;
    displayPass;
    camera;
    constructor(renderer) {
        super(renderer);
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        if (!this.renderer.context)
            throw new Error("Context is missing from Renderer");
        this.uniformBuffer = this.renderer.device.createBuffer({
            size: 4 * 16 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.bindGroupLayout = new BindGroupLayout(renderer, "DefaultRenderGraph");
        this.bindGroupLayout.bindGroupLayoutEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform",
                }
            }
        ];
        this.bindGroup = new BindGroup(this.renderer, "DefaultRenderGraph");
        this.bindGroup.bindGroupLayout = this.bindGroupLayout;
        this.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                resource: {
                    buffer: this.uniformBuffer,
                },
            }
        ];
        this.gBufferPass = new GBufferRenderPass(renderer, this, "gBufferPass");
        this.basicLightingPass = new BasicLightingRenderPass(renderer, this, "basicLightingPass", this.gBufferPass);
        this.forwardPass = new ForwardRenderPass(renderer, this, "forwardRenderPass", this.gBufferPass);
        this.displayPass = new DisplayRenderPass(renderer, this, "displayPass", this.basicLightingPass.targetTexture);
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
        const invViewProjectionMatrix = mat4.invert(this.camera.getViewProjectionMatrix(this.renderer.aspect));
        this.renderer.device.queue.writeBuffer(this.uniformBuffer, 0, projectionMatrix);
        this.renderer.device.queue.writeBuffer(this.uniformBuffer, 64, viewMatrix);
        this.renderer.device.queue.writeBuffer(this.uniformBuffer, 64 * 2, invViewProjectionMatrix);
        for (const model of this.renderer.getModels()) {
            model.prepareRender();
        }
        this.gBufferPass.execute();
        this.basicLightingPass.execute();
        this.forwardPass.execute();
        this.displayPass.inputTexture = this.forwardPass.targetTexture;
        this.displayPass.execute();
    }
}
//# sourceMappingURL=default-renderGraph.js.map