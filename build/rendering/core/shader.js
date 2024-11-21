import { GPUObject } from "./gpuObject.js";
export var ShaderType;
(function (ShaderType) {
    ShaderType[ShaderType["Vertex"] = 0] = "Vertex";
    ShaderType[ShaderType["Fragment"] = 1] = "Fragment";
    ShaderType[ShaderType["Compute"] = 2] = "Compute";
})(ShaderType || (ShaderType = {}));
export class Shader extends GPUObject {
    code = "";
    shaderModule;
    shaderType;
    constructor(renderer, label, shaderType) {
        if (!renderer.device)
            throw new Error("Device does not exist on renderer");
        super(renderer, "Shader-" + label);
        this.shaderType = shaderType;
    }
    init() {
        if (!this.renderer.device)
            throw new Error("Device is missing from Renderer");
        this.shaderModule = this.renderer.device.createShaderModule({
            code: this.code,
            label: this.label,
        });
    }
    getShaderModule() {
        return this.shaderModule;
    }
}
//# sourceMappingURL=shader.js.map