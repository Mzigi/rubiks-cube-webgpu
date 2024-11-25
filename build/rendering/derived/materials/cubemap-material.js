import { BindGroup, BindGroupLayout, Material } from "../../core/material.js";
import { UsedVertexAttributes } from "../../core/mesh.js";
import { Texture } from "../../core/texture.js";
import { CubemapFSShader, CubemapVSShader } from "../../shaders/class/cubemap-shader.js";
export class CubemapMaterial extends Material {
    cubemapTexture;
    beforeInit() {
        this.label = "cubemap";
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
        this.usedVertexAttributes = new UsedVertexAttributes();
        this.vsShader = new CubemapVSShader(this.renderer, this.label);
        this.fsShader = new CubemapFSShader(this.renderer, this.label);
        this.primitiveCullMode = "front";
        this.usedVertexAttributes.usesPositions = true;
        this.usedVertexAttributes.usesNormals = true;
        this.usedVertexAttributes.usesUvs = true;
        this.bindGroupLayout = new BindGroupLayout(this.renderer, this.label);
        this.bindGroupLayout.bindGroupLayoutEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "filtering",
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {
                    viewDimension: "cube"
                }
            }
        ];
    }
    afterInit() {
        this.asyncAfterInit();
    }
    async asyncAfterInit() {
        const imgSrcs = [
            './assets/textures/cubemaps/ocean/right.jpg',
            './assets/textures/cubemaps/ocean/left.jpg',
            './assets/textures/cubemaps/ocean/top.jpg',
            './assets/textures/cubemaps/ocean/bottom.jpg',
            './assets/textures/cubemaps/ocean/front.jpg',
            './assets/textures/cubemaps/ocean/back.jpg',
        ];
        const promises = imgSrcs.map(async (src) => {
            const response = await fetch(src);
            return createImageBitmap(await response.blob());
        });
        const imageBitmaps = await Promise.all(promises);
        this.cubemapTexture = new Texture(this.renderer, "cubemap-ocean", [imageBitmaps[0].width, imageBitmaps[0].height, 6], GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT, "rgba8unorm");
        for (let i = 0; i < imageBitmaps.length; i++) {
            this.cubemapTexture.copyExternalImageToTexture({ source: imageBitmaps[i] }, {
                texture: this.cubemapTexture.gpuTexture,
                origin: [0, 0, i]
            }, [imageBitmaps[i].width, imageBitmaps[i].height]);
        }
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        const defaultBindGroup = new BindGroup(this.renderer, this.label);
        defaultBindGroup.bindGroupLayout = this.bindGroupLayout;
        defaultBindGroup.bindGroupEntries = [
            {
                binding: 0,
                resource: this.renderer.device.createSampler({ minFilter: "linear", magFilter: "linear" }),
            },
            {
                binding: 1,
                resource: this.cubemapTexture.createView({ dimension: "cube" }),
            }
        ];
        this.defaultBindGroup = defaultBindGroup;
    }
    getTargetInfos() {
        return [
            {
                format: "rgba8unorm",
            }
        ];
    }
}
//# sourceMappingURL=cubemap-material.js.map