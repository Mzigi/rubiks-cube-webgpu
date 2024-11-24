import { BindGroup, Material } from "../../core/material.js";
import { UsedVertexAttributes } from "../../core/meshData.js";
import { Texture } from "../../core/texture.js";
import { CubemapFSShader, CubemapVSShader } from "../../shaders/class/cubemap-shader.js";
export class CubemapMaterial extends Material {
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
    cubemapTexture;
    constructor(renderer, label) {
        super(renderer, label);
        this.asyncConstructor();
    }
    async asyncConstructor() {
        if (!this.renderer.device)
            throw new Error("Renderer is missing Device");
        this.vsShader = new CubemapVSShader(this.renderer, this.label);
        this.fsShader = new CubemapFSShader(this.renderer, this.label);
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
        this.bindGroup = new BindGroup(this.renderer, "BindGroup-" + this.label);
        this.bindGroup.bindGroupEntries = [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                resource: this.renderer.device.createSampler({
                    magFilter: "linear",
                    minFilter: "linear",
                }),
                sampler: {
                    type: "filtering",
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                resource: this.cubemapTexture.createView({ dimension: "cube" }),
                texture: {
                    viewDimension: "cube"
                }
            }
        ];
        this.primitiveCullMode = "front";
        this.usedVertexAttributes.usesPositions = true;
        this.usedVertexAttributes.usesNormals = true;
        this.usedVertexAttributes.usesUvs = true;
        this.init();
    }
    getTargetInfos() {
        if (!this.renderer.presentationFormat)
            throw new Error("presentationFormat is missing from Renderer");
        return [
            {
                format: this.renderer.presentationFormat,
            }
        ];
    }
    static getId() {
        return "cubemap";
    }
}
//# sourceMappingURL=cubemap-material.js.map