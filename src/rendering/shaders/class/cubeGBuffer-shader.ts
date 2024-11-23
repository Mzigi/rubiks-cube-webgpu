import { Shader, ShaderType } from "../../core/shader.js";
import { Renderer } from "../../renderer.js";

export class CubeGBufferVSShader extends Shader {
    constructor(renderer: Renderer, label: string) {
        super(renderer, label, ShaderType.Vertex);

        this.code = `
struct Global {
    projectionMatrix: mat4x4f,
    viewMatrix: mat4x4f,
}

struct Model {
    modelMatrix: mat4x4f,
    normalModelMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> global : Global;
@group(2) @binding(0) var<uniform> model : Model;

struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(0) fragNormal: vec3f,    // normal in world space
    @location(1) fragUV: vec2f,
}

@vertex
fn vertexMain(
    @location(0) position : vec3f,
    @location(1) normal : vec3f,
    @location(2) uv : vec2f
) -> VertexOutput {
    var viewProjectionMatrix : mat4x4f = global.projectionMatrix * global.viewMatrix;

    var output : VertexOutput;
    let worldPosition = (model.modelMatrix * vec4(position, 1.0)).xyz;
    output.Position = viewProjectionMatrix * vec4(worldPosition, 1.0);
    output.fragNormal = normalize((model.normalModelMatrix * vec4(normal, 1.0)).xyz);
    output.fragUV = uv;
    return output;
}
    `;

        this.init();
    }
}

export class CubeGBufferFSShader extends Shader {
    constructor(renderer: Renderer, label: string) {
        super(renderer, label, ShaderType.Fragment);

        this.code = `
        struct GBufferOutput {
  @location(0) normal : vec4f,

  // Textures: diffuse color, specular color, smoothness, emissive etc. could go here
  @location(1) albedo : vec4f,
}

@fragment
fn fragmentMain(
  @location(0) fragNormal: vec3f,
  @location(1) fragUV : vec2f
) -> GBufferOutput {
  // faking some kind of checkerboard texture
  let uv = floor(30.0 * fragUV);
  var c = 0.2 + 0.5 * ((uv.x + uv.y) - 2.0 * floor((uv.x + uv.y) / 2.0));
  c = 0.5;

  var output : GBufferOutput;
  output.normal = vec4(normalize(fragNormal), 1.0);
  output.albedo = vec4(0, 1, 0, 1.0);

  return output;
}
  `;

        this.init();
    }
}