import { mat4 } from "../../../node_modules/wgpu-matrix/dist/3.x/wgpu-matrix.module.js";
import { GBufferRenderPass } from "../derived/renderPasses/gBuffer-renderPass.js";
/*
struct Model {
    modelMatrix: mat4x4,
    normalModelMatrix: mat4x4,
}
*/
export class Model {
    gBufferMat;
    shadowMat;
    forwardMat;
    renderer;
    label;
    mesh;
    vertexBuffer;
    indexBuffer;
    id; //index in renderer's model array
    position = { x: 0, y: 0, z: 0 };
    constructor(renderer, mesh, label = "Unknown") {
        this.renderer = renderer;
        this.mesh = mesh;
        this.label = "Model-" + label;
        this.getVertexBuffer();
    }
    render(renderPass, materialName) {
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        if (!renderPass.passEncoder)
            throw new Error("PassEncoder is missing from RenderPass");
        if (!this.renderer.currentRenderGraph)
            throw new Error("currentRenderGraph is missing from RenderPass");
        const material = this[materialName];
        if (material && material.created) {
            if (!this.mesh.getUsedAttributes().matches(material.usedVertexAttributes)) {
                throw new Error(`Mesh (${this.label}) does not have the vertex attributes that match the ones Material (${material.label}) needs`);
            }
            //model uniform
            const modelMatrix = mat4.translation([this.position.x, this.position.y, this.position.z]);
            this.renderer.device.queue.writeBuffer(this.renderer.modelUniformBuffer, 0, modelMatrix);
            const invertTransposeModelMatrix = mat4.invert(modelMatrix);
            mat4.transpose(invertTransposeModelMatrix, invertTransposeModelMatrix);
            const normalModelData = invertTransposeModelMatrix;
            this.renderer.device.queue.writeBuffer(this.renderer.modelUniformBuffer, 4 * 16, normalModelData.buffer, normalModelData.byteOffset, normalModelData.byteLength);
            //configure passEncoder
            renderPass.passEncoder.setPipeline(material.getPipeline());
            renderPass.passEncoder.setBindGroup(0, this.renderer.currentRenderGraph.bindGroup.getBindGroup());
            renderPass.passEncoder.setBindGroup(1, GBufferRenderPass.bindGroup.getBindGroup());
            renderPass.passEncoder.setBindGroup(2, this.renderer.modelBindGroup.getBindGroup());
            material.setBindGroups(renderPass);
            renderPass.passEncoder.setVertexBuffer(0, this.getVertexBuffer());
            renderPass.passEncoder.setIndexBuffer(this.getIndexBuffer(), "uint16");
            renderPass.passEncoder.drawIndexed(this.mesh.getIndexCount());
            //window.app.shouldClose = true;
        }
        else {
            console.warn(material);
            console.log(`Material (${material?.label}) hasn't been created yet`);
        }
    }
    getVertexBuffer() {
        if (!this.renderer.device)
            throw new Error("Renderer is missing device");
        if (!this.vertexBuffer) {
            this.vertexBuffer = this.renderer.device.createBuffer({
                label: "VertexBuffer-" + this.label,
                size: this.mesh.getVertexBufferData().byteLength,
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true,
            });
            const vertexBufferData = this.mesh.getVertexBufferData();
            new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexBufferData);
            this.vertexBuffer.unmap();
        }
        return this.vertexBuffer;
    }
    getIndexBuffer() {
        if (!this.renderer.device)
            throw new Error("Renderer is missing device");
        if (!this.indexBuffer) {
            this.indexBuffer = this.renderer.device.createBuffer({
                label: "IndexBuffer-" + this.label,
                size: this.mesh.getIndexBufferData().byteLength,
                usage: GPUBufferUsage.INDEX,
                mappedAtCreation: true,
            });
            const indexBufferData = this.mesh.getIndexBufferData();
            new Uint16Array(this.indexBuffer.getMappedRange()).set(indexBufferData);
            this.indexBuffer.unmap();
        }
        return this.indexBuffer;
    }
}
//# sourceMappingURL=model.js.map