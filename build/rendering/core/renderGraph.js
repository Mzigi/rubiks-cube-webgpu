export class RenderGraph {
    renderer;
    renderPasses = new Map();
    bindGroup; //VIRTUAL
    uniformBuffer; //VIRTUAL
    constructor(renderer) {
        this.renderer = renderer;
    }
    execute() {
        throw new Error("Virtual method called!");
    }
}
//# sourceMappingURL=renderGraph.js.map