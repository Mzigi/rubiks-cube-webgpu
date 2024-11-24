export class RenderGraph {
    renderer;
    camera;
    renderPasses = new Map();
    bindGroup; //VIRTUAL
    bindGroupLayout; //VIRTUAL
    uniformBuffer; //VIRTUAL
    constructor(renderer) {
        this.renderer = renderer;
    }
    execute() {
        throw new Error("Virtual method called!");
    }
}
//# sourceMappingURL=renderGraph.js.map