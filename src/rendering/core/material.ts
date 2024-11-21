import { GBufferRenderPass } from "../derived/renderPasses/gBuffer-renderPass.js";
import { Renderer } from "../renderer.js";
import { GPUObject } from "./gpuObject.js";
import { UsedVertexAttributes } from "./mesh.js";
import { RenderPass } from "./renderPass.js";
import { Shader } from "./shader.js";

/*

BIND GROUP STRUCTURE

group(0) { //global (or rendergraph?)
    binding(0) var<uniform> camera : Camera {
        viewProjectionMatrix: mat4x4f
        invViewProjectionMatrix: mat4x4f
    }
}
group(1) { //render pass specific
    binding(0) var<uniform> dirLight : DirectionalLight {
        directionalVector: vec3f
    }
}
group(2) { //model specific
    binding(0) var<uniform> model : Model {
        modelMatrix: mat4x4f
        normalModelMatrix: mat4x4f
    }
}
group(3) { //material specific
    binding(0) var time : float {
        time: float
    }
}
*/

export interface BindGroupEntry {
    binding: number;
    resource: GPUBindingResource | undefined;
    visibility: GPUShaderStageFlags;

    buffer?: undefined | GPUBufferBindingLayout;
    texture?: undefined | GPUTextureBindingLayout;
    sampler?: undefined | GPUSamplerBindingLayout;
}

export class BindGroup extends GPUObject {
    bindGroupEntries: BindGroupEntry[] = []; //REQUIRED

    private bindGroup: GPUBindGroup | undefined;
    private bindGroupLayout: GPUBindGroupLayout | undefined;

    getBindGroupLayoutEntries(isLayout: boolean): GPUBindGroupEntry[] | GPUBindGroupLayoutEntry[] { //TODO: this should be 2 different functions
        if (this.bindGroupEntries.length === 0) throw new Error("BindGroup is empty");

        if (isLayout) {
            const result: GPUBindGroupLayoutEntry[] = [];

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
        } else {
            const result: GPUBindGroupEntry[] = [];

            for (const entry of this.bindGroupEntries) {
                if (entry.resource) {
                    result.push({
                        binding: entry.binding,
                        resource: entry.resource,
                    });
                } else {
                    throw new Error("BindGroupEntry is missing resource");
                }
            }

            return result;
        }
    }

    getBindGroupLayout(): GPUBindGroupLayout {
        if (this.bindGroupEntries.length === 0) throw new Error("BindGroup is empty");
        if (!this.renderer.device) throw new Error("Renderer is missing Device");

        if (!this.bindGroupLayout) {
            const bindGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor = {
                label: "BindGroupLayout-" + this.label,
                entries: this.getBindGroupLayoutEntries(true) as GPUBindGroupLayoutEntry[],
            };

            this.bindGroupLayout = this.renderer.device.createBindGroupLayout(bindGroupLayoutDescriptor);

            console.log(bindGroupLayoutDescriptor);
        }

        return this.bindGroupLayout;
    }

    getBindGroup(): GPUBindGroup {
        if (this.bindGroupEntries.length === 0) throw new Error("BindGroup is empty");
        if (!this.renderer.device) throw new Error("Renderer is missing Device");

        if (!this.bindGroup) {
            const bindGroupDescriptor: GPUBindGroupDescriptor = {
                label: "BindGroup-" + this.label,
                layout: this.getBindGroupLayout(),
                entries: this.getBindGroupLayoutEntries(false) as GPUBindGroupEntry[],
            };

            this.bindGroup = this.renderer.device.createBindGroup(bindGroupDescriptor);
        }

        return this.bindGroup;
    }

    reset(): void {
        this.bindGroupLayout = undefined;
        this.bindGroup = undefined;
    }
}

export class Material {
    renderer: Renderer;
    label: string;

    bindGroup!: BindGroup; //VIRTUAL
    vertexAttributes: GPUVertexAttribute[] = []; //VIRTUAL
    vertexAttributesStride: number = 0; //VIRTUAL
    usedVertexAttributes!: UsedVertexAttributes; //VIRTUAL

    private pipeline: GPURenderPipeline | undefined;
    private pipelineLayout: GPUPipelineLayout | undefined;

    vsShader!: Shader;
    fsShader: Shader | undefined;

    created: boolean = false;

    primitiveCullMode: GPUCullMode = "back";

    constructor(renderer: Renderer, label: string) {
        this.renderer = renderer;
        this.label = "Material-" + label;
    }

    init(): void {
        if (this.vertexAttributes.length === 0 || this.vertexAttributesStride === 0 || !this.vsShader || !this.bindGroup || !this.usedVertexAttributes) {
            console.log(this);
            throw new Error("Material is missing required data");
        }

        this.created = true;
    }

    setBindGroups(renderPass: RenderPass): void {
        if (!this.created) throw new Error("Material hasn't been initialized");
        if (!renderPass.passEncoder) throw new Error("PassEncoder is missing from RenderPass");

        renderPass.passEncoder.setBindGroup(3, this.bindGroup.getBindGroup());
    }

    getVertexBufferLayout(): GPUVertexBufferLayout {
        if (!this.created) throw new Error("Material hasn't been initialized");

        return {
            arrayStride: this.vertexAttributesStride,
            attributes: this.vertexAttributes,
        };
    }

    getPipelineLayout(): GPUPipelineLayout {
        if (!this.created) throw new Error("Material hasn't been initialized");
        if (!this.renderer.device) throw new Error("Renderer is missing Device");
        if (!this.renderer.currentRenderGraph) throw new Error("Renderer is missing currentRenderGraph");

        if (!this.pipelineLayout) {
            const pipelineLayoutDescriptor: GPUPipelineLayoutDescriptor = {
                label: "PipelineLayout-" + this.label,
                bindGroupLayouts: [this.renderer.currentRenderGraph.bindGroup.getBindGroupLayout(), GBufferRenderPass.bindGroup.getBindGroupLayout(), this.renderer.modelBindGroup.getBindGroupLayout(), this.bindGroup.getBindGroupLayout()],
            };

            this.pipelineLayout = this.renderer.device.createPipelineLayout(pipelineLayoutDescriptor);
        }

        return this.pipelineLayout;
    }

    getTargetInfos(): GPUColorTargetState[] {
        throw new Error("Virtual method called");
    }

    getPipeline(): GPURenderPipeline {
        if (!this.created) throw new Error("Material hasn't been initialized");
        if (!this.renderer.device) throw new Error("Renderer is missing Device");

        if (!this.pipeline) {
            let fragment: GPUFragmentState | undefined = undefined;
            if (this.fsShader) {
                fragment = {
                    module: this.fsShader.getShaderModule(),
                    targets: this.getTargetInfos(),
                    entryPoint: "fragmentMain",
                };
            }

            const pipelineDescriptor: GPURenderPipelineDescriptor = {
                label: "Pipeline-" + this.label,
                layout: this.getPipelineLayout(),
                vertex: {
                    module: this.vsShader.getShaderModule(),
                    buffers: [this.getVertexBufferLayout()],
                    entryPoint: "vertexMain",
                },
                fragment: fragment,
                depthStencil: { //TODO: fix this (that includes primitive)
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
}