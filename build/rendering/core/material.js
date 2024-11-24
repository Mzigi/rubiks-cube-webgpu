import { GBufferRenderPass } from "../derived/renderPasses/gBuffer-renderPass.js";
import { GPUObject } from "./gpuObject.js";
export class BindGroupLayout extends GPUObject {
    bindGroupLayoutEntries = []; //REQUIRED
    bindGroupLayout;
    constructor(renderer, label) {
        super(renderer, "BindGroupLayout-" + label);
    }
    getBindGroupLayoutEntries() {
        if (this.bindGroupLayoutEntries.length === 0)
            throw new Error("BindGroupLayout is empty");
        const result = [];
        for (const entry of this.bindGroupLayoutEntries) {
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
    getBindGroupLayout() {
        if (this.bindGroupLayoutEntries.length === 0)
            throw new Error("BindGroup is empty");
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        if (!this.bindGroupLayout) {
            const bindGroupLayoutDescriptor = {
                label: "BindGroupLayout-" + this.label,
                entries: this.getBindGroupLayoutEntries(),
            };
            this.bindGroupLayout = this.renderer.device.createBindGroupLayout(bindGroupLayoutDescriptor);
        }
        return this.bindGroupLayout;
    }
    reset() {
        this.bindGroupLayout = undefined;
    }
}
export class BindGroup extends GPUObject {
    bindGroupEntries = []; //REQUIRED
    bindGroup;
    bindGroupLayout;
    constructor(renderer, label) {
        super(renderer, "BindGroup-" + label);
    }
    getBindGroupEntries() {
        if (this.bindGroupEntries.length === 0)
            throw new Error("BindGroup is empty");
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
    getBindGroup() {
        if (this.bindGroupEntries.length === 0)
            throw new Error("BindGroup is empty");
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        if (!this.bindGroupLayout)
            throw new Error(`BindGroup (${this.label}) is missing BindGroupLayout`);
        if (!this.bindGroup) {
            const bindGroupDescriptor = {
                label: "BindGroup-" + this.label,
                layout: this.bindGroupLayout.getBindGroupLayout(),
                entries: this.getBindGroupEntries(),
            };
            this.bindGroup = this.renderer.device.createBindGroup(bindGroupDescriptor);
        }
        return this.bindGroup;
    }
    reset() {
        //this.bindGroupLayout = undefined; //should this be done? probably not
        this.bindGroup = undefined;
    }
}
/*export interface BindGroupEntry {
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
}*/
export class Material {
    renderer;
    label = "Material";
    defaultBindGroup; //VIRTUAL (not required)
    bindGroupLayout; //VIRTUAL
    vertexAttributes; //VIRTUAL
    vertexAttributesStride; //VIRTUAL
    usedVertexAttributes; //VIRTUAL
    pipeline;
    pipelineLayout;
    vsShader; //VIRTUAL
    fsShader; //VIRTUAL (not required)
    created = false;
    primitiveCullMode = "back";
    static instance;
    constructor(renderer) {
        if (this.static.instance) {
            throw new Error(`Material (${this.getId()}) already exists`);
        }
        this.renderer = renderer;
        this.beforeInit();
        this.init();
        this.afterInit();
        this.static.instance = this;
        renderer.addMaterial(this.getId(), this);
    }
    get static() {
        return this.constructor;
    }
    beforeInit() { } //making sure all virtual properties are set
    init() {
        if (!this.bindGroupLayout || !this.vertexAttributes || !this.vertexAttributesStride || !this.usedVertexAttributes || !this.vsShader || this.label === "Material") {
            console.log(this);
        }
        if (!this.bindGroupLayout)
            throw new Error("Material is missing bindGroupLayout");
        if (!this.vertexAttributes)
            throw new Error("Material is missing vertexAttributes");
        if (!this.vertexAttributesStride)
            throw new Error("Material is missing vertexAttributesStride");
        if (!this.usedVertexAttributes)
            throw new Error("Material is missing usedVertexAttributes");
        if (!this.vsShader)
            throw new Error("Material is missing vsShader");
        if (this.label === "Material")
            throw new Error("Material is missing label");
        //check if virtual functions are set up
        this.getTargetInfos();
        this.created = true;
    }
    afterInit() { } //setting default bind group
    /*setBindGroups(renderPass: RenderPass): void {
        if (!this.created) throw new Error("Material hasn't been initialized");
        if (!renderPass.passEncoder) throw new Error("PassEncoder is missing from RenderPass");

        renderPass.passEncoder.setBindGroup(3, this.bindGroup.getBindGroup());
    }*/
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
                bindGroupLayouts: [this.renderer.renderGraph.bindGroupLayout.getBindGroupLayout(), GBufferRenderPass.bindGroupLayout.getBindGroupLayout(), this.renderer.modelBindGroupLayout.getBindGroupLayout(), this.bindGroupLayout.getBindGroupLayout()],
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
    getId() {
        return this.label;
    }
    static get(renderer) {
        if (!this.instance) {
            new this(renderer);
        }
        return this.instance;
    }
}
export class MaterialView {
    material;
    bindGroup;
    constructor(material, bindGroup) {
        this.material = material;
        this.bindGroup = bindGroup;
    }
    getBindGroupToUse() {
        return this.bindGroup || this.material.defaultBindGroup;
    }
    isReady() {
        return !!this.getBindGroupToUse() && this.material.created;
    }
    setBindGroups(renderPass) {
        const bindGroupToUse = this.getBindGroupToUse();
        if (!bindGroupToUse)
            throw new Error("MaterialView has no valid BindGroup, MaterialView.isReady() should be checked before calling setBindGroups(RenderPass)");
        if (!renderPass.passEncoder)
            throw new Error("PassEncoder is missing from RenderPass");
        renderPass.passEncoder.setBindGroup(3, bindGroupToUse.getBindGroup());
    }
}
//# sourceMappingURL=material.js.map