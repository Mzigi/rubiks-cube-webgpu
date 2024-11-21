import { BindGroup, Material } from "../../core/material.js";
import { UsedVertexAttributes } from "../../core/mesh.js";
import { Texture } from "../../core/texture.js";
import { CubeGBufferFSShader, CubeGBufferVSShader } from "../../shaders/class/cubeGBuffer-shader.js";
export class CubeGBufferMaterial extends Material {
    vertexAttributes = [
        {
            // position
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3',
        },
        {
            // normals
            shaderLocation: 1,
            offset: 4 * 3,
            format: 'float32x3',
        },
        {
            // uv
            shaderLocation: 2,
            offset: 4 * 3 * 2,
            format: 'float32x2',
        },
    ];
    vertexAttributesStride = 4 * 3 * 2 + 4 * 2;
    usedVertexAttributes = new UsedVertexAttributes();
    constructor(renderer, label) {
        super(renderer, label);
        this.asyncConstructor();
    }
    async asyncConstructor() {
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        this.vsShader = new CubeGBufferVSShader(this.renderer, this.label);
        console.log(this.vsShader);
        this.fsShader = new CubeGBufferFSShader(this.renderer, this.label);
        console.log(this.fsShader);
        let cubeTexture;
        {
            // eslint-disable-next-line @typescript-eslint/typedef
            const response = await fetch('https://webgpu.github.io/webgpu-samples/assets/img/Di-3d.png');
            // eslint-disable-next-line @typescript-eslint/typedef
            const imageBitmap = await createImageBitmap(await response.blob());
            cubeTexture = new Texture(this.renderer, "https://webgpu.github.io/webgpu-samples/assets/img/Di-3d.png", [imageBitmap.width, imageBitmap.height, 1], GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT, "rgba8unorm");
            cubeTexture.copyFromExternalImage(imageBitmap);
        }
        this.bindGroup = new BindGroup(this.renderer, "BindGroup-" + this.label);
        this.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                resource: {
                    buffer: this.renderer.device.createBuffer({
                        size: 4 * 16,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                    }),
                },
                buffer: {
                    type: "uniform",
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                resource: this.renderer.device.createSampler(),
                sampler: {
                    type: "filtering",
                }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                resource: cubeTexture.createView(),
                texture: {}
            }
        ];
        this.usedVertexAttributes.usesPositions = true;
        this.usedVertexAttributes.usesNormals = true;
        this.usedVertexAttributes.usesUvs = true;
        this.init();
    }
    getTargetInfos() {
        return [
            {
                format: "rgba16float"
            },
            {
                format: "bgra8unorm",
            }
        ];
    }
}
//# sourceMappingURL=cubeGBuffer-material.js.map