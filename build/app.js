import { Rubiks } from "./game/rubiks.js";
import { DefaultRenderGraph } from "./rendering/derived/renderGraphs/default-renderGraph.js";
import { Renderer } from "./rendering/renderer.js";
export class App {
    shouldClose = false;
    canvas;
    game;
    renderer;
    elapsedTime = performance.now() / 1000;
    fpsTimer = 0;
    fpsCounter = 0;
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.renderer = new Renderer(this.canvas);
        this.game = new Rubiks(this);
    }
    async init() {
        await this.renderer.init();
        if (!this.renderer.success) {
            alert("Your browser or device doesn't support WebGPU, try using the newest version of Edge or Chrome on a computer.");
        } //TODO: alert that webgpu is unavailable
        this.renderer.renderGraph = new DefaultRenderGraph(this.renderer);
        this.game.init();
        this.update();
    }
    update() {
        const deltaTime = performance.now() / 1000 - this.elapsedTime;
        this.fpsCounter += 1;
        this.fpsTimer += deltaTime;
        if (this.fpsTimer >= 1) {
            const fpsElement = document.getElementById("fps");
            if (fpsElement) {
                fpsElement.innerText = "FPS: " + this.fpsCounter;
            }
            this.fpsTimer = 0;
            this.fpsCounter = 0;
        }
        this.elapsedTime = performance.now() / 1000;
        if (this.renderer.success && this.renderer.renderGraph) {
            this.renderer.render();
        }
        this.game.update();
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