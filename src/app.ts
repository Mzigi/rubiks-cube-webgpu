import { RenderGraph } from "./rendering/core/renderGraph.js";
import { DefaultRenderGraph } from "./rendering/derived/renderGraphs/default-renderGraph.js";
import { Renderer } from "./rendering/renderer.js";

class App {
    shouldClose: boolean = false;

    canvas: HTMLCanvasElement;

    renderer: Renderer;

    renderGraph: RenderGraph | undefined;

    constructor() {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        this.renderer = new Renderer(this.canvas);
    }

    async init(): Promise<void> {
        this.renderer.init().then(() => {
            this.renderGraph = new DefaultRenderGraph(this.renderer);
        });
        this.update();
    }

    update(): void {
        if (this.renderer.success && this.renderGraph) {
            this.renderer.render(this.renderGraph);
        }

        if (!this.shouldClose) {
            window.requestAnimationFrame(this.update.bind(this));
        } else {
            console.log("App has been closed");
        }
    }
}

const app: App = new App();
app.init();

declare global {
    interface Window {
        app: App;
    }
}

window.app = app;