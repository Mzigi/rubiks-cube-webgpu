import { BindGroup, BindGroupLayout, Material } from "../../core/material.js";
import { UsedVertexAttributes } from "../../core/mesh.js";
import { Texture } from "../../core/texture.js";
import { Renderer } from "../../renderer.js";
import { CubeGBufferFSShader, CubeGBufferVSShader } from "../../shaders/class/cubeGBuffer-shader.js";

export class CubeGBufferMaterial extends Material {
    vertexAttributes: GPUVertexAttribute[] = [
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
    vertexAttributesStride: number = 4 * 3 * 2 + 4 * 2;
    usedVertexAttributes: UsedVertexAttributes = new UsedVertexAttributes();

    constructor(renderer: Renderer, label: string) {
        super(renderer, label);

        this.asyncConstructor();
    }

    async asyncConstructor(): Promise<void> {
        if (!this.renderer.device) throw new Error("Renderer is missing Device");

        this.vsShader = new CubeGBufferVSShader(this.renderer, this.label);
        console.log(this.vsShader);

        this.fsShader = new CubeGBufferFSShader(this.renderer, this.label);
        console.log(this.fsShader);

        let cubeTexture: Texture;
        {
            // eslint-disable-next-line @typescript-eslint/typedef
            const response = await fetch('https://webgpu.github.io/webgpu-samples/assets/img/Di-3d.png');
            // eslint-disable-next-line @typescript-eslint/typedef
            const imageBitmap = await createImageBitmap(await response.blob());

            cubeTexture = new Texture(this.renderer,
                "https://webgpu.github.io/webgpu-samples/assets/img/Di-3d.png",
                [imageBitmap.width, imageBitmap.height, 1],
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
                "rgba8unorm",
            );
            cubeTexture.copyFromExternalImage(imageBitmap);
        }

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
                texture: {
                    
                }
            }
        ];

        this.bindGroup = new BindGroup(this.renderer, this.label);
        this.bindGroup.bindGroupLayout = this.bindGroupLayout;
        this.bindGroup.bindGroupEntries = [
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
                resource: this.renderer.device.createSampler(),
            },
            {
                binding: 2,
                resource: cubeTexture.createView(),
            }
        ];

        this.usedVertexAttributes.usesPositions = true;
        this.usedVertexAttributes.usesNormals = true;
        this.usedVertexAttributes.usesUvs = true;

        this.init();
    }

    getTargetInfos(): GPUColorTargetState[] {
        return [
            {
                format: "rgba16float"
            },
            {
                format: "rgba8unorm",
            }
        ];
    }

    static getId(): string {
        return "cubeGBuffer";
    }
}