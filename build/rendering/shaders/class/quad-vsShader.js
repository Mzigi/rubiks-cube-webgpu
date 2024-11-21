import { Shader, ShaderType } from "../../core/shader.js";
export class QuadVSShader extends Shader {
    constructor(renderer, label) {
        super(renderer, label, ShaderType.Vertex);
        this.code = `
            @vertex
fn vertexMain(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  const pos = array(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
  );

  return vec4f(pos[VertexIndex], 0.0, 1.0);
}
        `;
        this.init();
    }
}
//# sourceMappingURL=quad-vsShader.js.map