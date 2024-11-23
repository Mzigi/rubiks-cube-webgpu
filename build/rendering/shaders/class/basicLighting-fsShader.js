import { Shader, ShaderType } from "../../core/shader.js";
export class BasicLightingFSShader extends Shader {
    constructor(renderer, label) {
        super(renderer, label, ShaderType.Vertex);
        this.code = `
@group(0) @binding(0) var gBufferNormal: texture_2d<f32>;
@group(0) @binding(1) var gBufferAlbedo: texture_2d<f32>;
@group(0) @binding(2) var gBufferDepth: texture_depth_2d;

//directional light function
fn calculateDirLight(normal: vec3f) -> vec3f {
    var directionalLight : f32 = (dot(normal, normalize(vec3f(1,4,2))) + 0.5) / 2.0;
    var dirLight : vec3f = (vec3f(1,1,1) * max(directionalLight, 0.0));
    return dirLight;
}

@fragment
fn fragmentMain(
    @builtin(position) coord : vec4f
) -> @location(0) vec4f {
    var result : vec3f;

    let normal = textureLoad(
        gBufferNormal,
        vec2i(floor(coord.xy)),
        0
    ).xyz;

    let albedo = textureLoad(
        gBufferAlbedo,
        vec2i(floor(coord.xy)),
        0
    ).rgb;

    let rawDepth = textureLoad(
      gBufferDepth,
      vec2i(floor(coord.xy)),
      0
    );

    // remap depth into something a bit more visible
    let depth = (1.0 - rawDepth) * 50.0;
    result = albedo * calculateDirLight(normal);

    return vec4(result, 1.0);
    //return vec4(result, 1.0);
}
        `;
        this.init();
    }
}
//# sourceMappingURL=basicLighting-fsShader.js.map