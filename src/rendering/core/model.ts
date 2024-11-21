import { Renderer } from "../renderer.js";
import { Material } from "./material.js";
import { Mesh } from "./mesh.js";
import { RenderPass } from "./renderPass.js";
import { mat4 } from "../../../node_modules/wgpu-matrix/dist/3.x/wgpu-matrix.module.js";
import { GBufferRenderPass } from "../derived/renderPasses/gBuffer-renderPass.js";

export type MaterialName = "gBufferMat" | "shadowMat" | "forwardMat"; 

/* DEPRECATED
export class BufferData {
    data: Float32Array;

    constructor(data: Float32Array) {
        this.data = data;
    }

    getSize(): number {
        return this.data.byteLength;
    }
}

export class VertexBufferData extends BufferData {

}

export class IndexBufferData extends BufferData {
    indexCount: number;
    
    constructor(data: Float32Array, indexCount: number) {
        super(data);

        this.indexCount = indexCount;
    }
}
*/

export interface Vector3 {
    x: number,
    y: number,
    z: number,
}

/*
struct Model {
    modelMatrix: mat4x4,
    normalModelMatrix: mat4x4,
}
*/

export class Model {
    gBufferMat: Material | undefined;
    shadowMat: Material | undefined;
    forwardMat: Material | undefined;

    renderer: Renderer;

    label: string;

    mesh: Mesh;

    private vertexBuffer: GPUBuffer | undefined;
    private indexBuffer: GPUBuffer | undefined;

    id: number | undefined; //index in renderer's model array

    position: Vector3 = {x: 0, y: 0, z: 0};

    constructor(renderer: Renderer, mesh: Mesh, label: string = "Unknown") {
        this.renderer = renderer;
        this.mesh = mesh;
        this.label = "Model-" + label;

        this.getVertexBuffer();
    }

    render(renderPass: RenderPass, materialName: MaterialName): void {
        if (!this.renderer.device) throw new Error("Device is missing from Renderer");
        if (!renderPass.passEncoder) throw new Error("PassEncoder is missing from RenderPass");
        if (!this.renderer.currentRenderGraph) throw new Error("currentRenderGraph is missing from RenderPass");

        const material: Material | undefined = this[materialName];

        if (material && material.created) {
            if (!this.mesh.getUsedAttributes().matches(material.usedVertexAttributes)) {
                throw new Error(`Mesh (${this.label}) does not have the vertex attributes that match the ones Material (${material.label}) needs`);
            }

            //model uniform
            const modelMatrix: Float32Array = mat4.translation([this.position.x, this.position.y, this.position.z]);
            this.renderer.device.queue.writeBuffer(this.renderer.modelUniformBuffer, 0, modelMatrix);
            const invertTransposeModelMatrix: Float32Array = mat4.invert(modelMatrix);
            mat4.transpose(invertTransposeModelMatrix, invertTransposeModelMatrix);
            const normalModelData: Float32Array = invertTransposeModelMatrix;
            this.renderer.device.queue.writeBuffer(
                this.renderer.modelUniformBuffer,
                4 * 16,
                normalModelData.buffer,
                normalModelData.byteOffset,
                normalModelData.byteLength
            );

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
        } else {
            console.warn(material);
            console.log(`Material (${material?.label}) hasn't been created yet`);
        }
    }

    getVertexBuffer(): GPUBuffer {
        if (!this.renderer.device) throw new Error("Renderer is missing device");
        
        if (!this.vertexBuffer) {
            this.vertexBuffer = this.renderer.device.createBuffer({
                label: "VertexBuffer-" + this.label,
                size: this.mesh.getVertexBufferData().byteLength,
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true,
            });
            const vertexBufferData: Float32Array = this.mesh.getVertexBufferData();
            new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexBufferData);
            this.vertexBuffer.unmap();
        }
        
        return this.vertexBuffer;
    }

    getIndexBuffer(): GPUBuffer {
        if (!this.renderer.device) throw new Error("Renderer is missing device");
        if (!this.indexBuffer) {
            this.indexBuffer = this.renderer.device.createBuffer({
                label: "IndexBuffer-" + this.label,
                size: this.mesh.getIndexBufferData().byteLength,
                usage: GPUBufferUsage.INDEX,
                mappedAtCreation: true,
            });
            const indexBufferData: Uint16Array = this.mesh.getIndexBufferData();
            new Uint16Array(this.indexBuffer.getMappedRange()).set(indexBufferData);
            this.indexBuffer.unmap();
        }

        return this.indexBuffer;
    }
}