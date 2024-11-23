import { GBufferRenderPass } from "../derived/renderPasses/gBuffer-renderPass.js";
import { GPUObject } from "./gpuObject.js";
export class BindGroup extends GPUObject {
    bindGroupEntries = []; //REQUIRED
    bindGroup;
    bindGroupLayout;
    getBindGroupLayoutEntries(isLayout) {
        if (this.bindGroupEntries.length === 0)
            throw new Error("BindGroup is empty");
        if (isLayout) {
            const result = [];
            for (const entry of this.bindGroupEntries) {
                result.push({
                    binding: entry.binding,
                    visibility: entry.visibility,
                    buffer: entry.buffer,
                    texture: entry.texture,
                    sampler: entry.sampler,
                });
            }
            return result;
        }
        else {
            const result = [];
            for (const entry of this.bindGroupEntries) {
                if (entry.resource) {
                    result.push({
                        binding: entry.binding,
                        resource: entry.resource,
                    });
                }
                else {
                    throw new Error("BindGroupEntry is missing resource");
                }
            }
            return result;
        }
    }
    getBindGroupLayout() {
        if (this.bindGroupEntries.length === 0)
            throw new Error("BindGroup is empty");
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        if (!this.bindGroupLayout) {
            const bindGroupLayoutDescriptor = {
                label: "BindGroupLayout-" + this.label,
                entries: this.getBindGroupLayoutEntries(true),
            };
            this.bindGroupLayout = this.renderer.device.createBindGroupLayout(bindGroupLayoutDescriptor);
        }
        return this.bindGroupLayout;
    }
    getBindGroup() {
        if (this.bindGroupEntries.length === 0)
            throw new Error("BindGroup is empty");
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        if (!this.bindGroup) {
            const bindGroupDescriptor = {
                label: "BindGroup-" + this.label,
                layout: this.getBindGroupLayout(),
                entries: this.getBindGroupLayoutEntries(false),
            };
            this.bindGroup = this.renderer.device.createBindGroup(bindGroupDescriptor);
        }
        return this.bindGroup;
    }
    reset() {
        this.bindGroupLayout = undefined;
        this.bindGroup = undefined;
    }
}
export class Material {
    renderer;
    label;
    bindGroup; //VIRTUAL
    vertexAttributes = []; //VIRTUAL
    vertexAttributesStride = 0; //VIRTUAL
    usedVertexAttributes; //VIRTUAL
    pipeline;
    pipelineLayout;
    vsShader;
    fsShader;
    created = false;
    primitiveCullMode = "back";
    static instance;
    constructor(renderer, label) {
        this.renderer = renderer;
        this.label = "Material-" + label;
    }
    init() {
        if (this.vertexAttributes.length === 0 || this.vertexAttributesStride === 0 || !this.vsShader || !this.bindGroup || !this.usedVertexAttributes) {
            console.log(this);
            throw new Error("Material is missing required data");
        }
        this.created = true;
    }
    setBindGroups(renderPass) {
        if (!this.created)
            throw new Error("Material hasn't been initialized");
        if (!renderPass.passEncoder)
            throw new Error("PassEncoder is missing from RenderPass");
        renderPass.passEncoder.setBindGroup(3, this.bindGroup.getBindGroup());
    }
    getVertexBufferLayout() {
        if (!this.created)
            throw new Error("Material hasn't been initialized");
        return {
            arrayStride: this.vertexAttributesStride,
            attributes: this.vertexAttributes,
        };
    }
    getPipelineLayout() {
        if (!this.created)
            throw new Error("Material hasn't been initialized");
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        if (!this.renderer.renderGraph)
            throw new Error("Renderer is missing currentRenderGraph");
        if (!this.pipelineLayout) {
            const pipelineLayoutDescriptor = {
                label: "PipelineLayout-" + this.label,
                bindGroupLayouts: [this.renderer.renderGraph.bindGroup.getBindGroupLayout(), GBufferRenderPass.bindGroup.getBindGroupLayout(), this.renderer.modelBindGroup.getBindGroupLayout(), this.bindGroup.getBindGroupLayout()],
            };
            this.pipelineLayout = this.renderer.device.createPipelineLayout(pipelineLayoutDescriptor);
        }
        return this.pipelineLayout;
    }
    getTargetInfos() {
        throw new Error("Virtual method called");
    }
    getPipeline() {
        if (!this.created)
            throw new Error("Material hasn't been initialized");
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        if (!this.pipeline) {
            let fragment = undefined;
            if (this.fsShader) {
                fragment = {
                    module: this.fsShader.getShaderModule(),
                    targets: this.getTargetInfos(),
                    entryPoint: "fragmentMain",
                };
            }
            const pipelineDescriptor = {
                label: "Pipeline-" + this.label,
                layout: this.getPipelineLayout(),
                vertex: {
                    module: this.vsShader.getShaderModule(),
                    buffers: [this.getVertexBufferLayout()],
                    entryPoint: "vertexMain",
                },
                fragment: fragment,
                depthStencil: {
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                    format: 'depth24plus',
                },
                primitive: {
                    topology: 'triangle-list',
                    cullMode: this.primitiveCullMode,
                },
            };
            this.pipeline = this.renderer.device.createRenderPipeline(pipelineDescriptor);
        }
        return this.pipeline;
    }
    static getId() {
        throw new Error("Virtual method called");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get(materialType, renderer) {
        if (!materialType.instance) {
            materialType.instance = new materialType(renderer, materialType.getId());
            renderer.addMaterial(materialType.getId(), materialType.instance);
        }
        return materialType.instance;
    }
}
//# sourceMappingURL=material.js.map