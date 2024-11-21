import { DefaultRenderGraph } from "./rendering/derived/renderGraphs/default-renderGraph.js";
import { Renderer } from "./rendering/renderer.js";
class App {
    shouldClose = false;
    canvas;
    renderer;
    renderGraph;
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.renderer = new Renderer(this.canvas);
    }
    async init() {
        this.renderer.init().then(() => {
            this.renderGraph = new DefaultRenderGraph(this.renderer);
        });
        this.update();
    }
    update() {
        if (this.renderer.success && this.renderGraph) {
            this.renderer.render(this.renderGraph);
        }
        if (!this.shouldClose) {
            window.requestAnimationFrame(this.update.bind(this));
        }
        else {
            console.log("App has been closed");
        }
    }
}
const app = new App();
app.init();
window.app = app;
//# sourceMappingURL=app.js.map