import { BindGroup, BindGroupLayout, Material } from "../../core/material.js";
import { UsedVertexAttributes } from "../../core/mesh.js";
import { Texture } from "../../core/texture.js";
import { CubeGBufferFSShader, CubeGBufferVSShader } from "../../shaders/class/cubeGBuffer-shader.js";
export class CubeGBufferMaterial extends Material {
    beforeInit() {
        this.label = "cubeGBuffer";
        this.vertexAttributes = [
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
        this.vertexAttributesStride = 4 * 3 * 2 + 4 * 2;
        this.bindGroupLayout = new BindGroupLayout(this.renderer, this.label);
        this.bindGroupLayout.bindGroupLayoutEntries = [
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
                sampler: {
                    type: "filtering",
                }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            }
        ];
        this.vsShader = new CubeGBufferVSShader(this.renderer, this.label);
        this.fsShader = new CubeGBufferFSShader(this.renderer, this.label);
        this.usedVertexAttributes = new UsedVertexAttributes();
        this.usedVertexAttributes.usesPositions = true;
        this.usedVertexAttributes.usesNormals = true;
        this.usedVertexAttributes.usesUvs = true;
    }
    afterInit() {
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        this.asyncAfterInit();
    }
    async getBindGroupForTexture(textureURL) {
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        let cubeTexture;
        {
            const response = await fetch(textureURL);
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);
            const foundTexture = this.renderer.getTexture(textureURL);
            if (foundTexture) {
                cubeTexture = foundTexture;
            }
            else {
                cubeTexture = new Texture(this.renderer, textureURL, [imageBitmap.width, imageBitmap.height, 1], GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT, "rgba8unorm");
                cubeTexture.copyFromExternalImage(imageBitmap);
            }
        }
        const bindGroup = new BindGroup(this.renderer, textureURL + "-" + this.label);
        bindGroup.bindGroupLayout = this.bindGroupLayout;
        bindGroup.bindGroupEntries = [
            {
                binding: 0,
                resource: {
                    buffer: this.renderer.device.createBuffer({
                        size: 4 * 16,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                    }),
                },
            },
            {
                binding: 1,
                resource: this.renderer.device.createSampler({ minFilter: "linear", magFilter: "linear" }),
            },
            {
                binding: 2,
                resource: cubeTexture.createView(),
            }
        ];
        return bindGroup;
    }
    async asyncAfterInit() {
        this.defaultBindGroup = await this.getBindGroupForTexture("https://webgpu.github.io/webgpu-samples/assets/img/Di-3d.png");
    }
    getTargetInfos() {
        return [
            {
                format: "rgba16float"
            },
            {
                format: "rgba8unorm",
            }
        ];
    }
}
//# sourceMappingURL=cubeGBuffer-material.js.map