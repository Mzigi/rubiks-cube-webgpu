import { Game } from "./game.js";
import { Rubiks } from "./game/rubiks.js";
import { DefaultRenderGraph } from "./rendering/derived/renderGraphs/default-renderGraph.js";
import { Renderer } from "./rendering/renderer.js";

declare global {
    interface Window {
        app: App;
    }
}

export class App {
    shouldClose: boolean = false;

    canvas: HTMLCanvasElement;

    game: Game;
    renderer: Renderer;

    elapsedTime: number = performance.now()/1000;
    fpsTimer: number = 0;
    fpsCounter: number = 0;

    constructor() {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        this.renderer = new Renderer(this.canvas);

        this.game = new Rubiks(this);
    }

    async init(): Promise<void> {
        await this.renderer.init();
        if (!this.renderer.success) {
            alert("Your browser or device doesn't support WebGPU, try using the newest version of Edge or Chrome on a computer.");
        } //TODO: alert that webgpu is unavailable
        this.renderer.renderGraph = new DefaultRenderGraph(this.renderer);
        this.game.init();
        this.update();
    }

    update(): void {
        const deltaTime: number = performance.now()/1000 - this.elapsedTime;
        this.fpsCounter += 1;
        this.fpsTimer += deltaTime;

        if (this.fpsTimer >= 1) {
            const fpsElement: HTMLElement | null = document.getElementById("fps");
            if (fpsElement) {
                fpsElement.innerText = "FPS: " + this.fpsCounter;
            }
            this.fpsTimer = 0;
            this.fpsCounter = 0;
        }
        this.elapsedTime = performance.now()/1000;

        if (this.renderer.success && this.renderer.renderGraph) {
            this.renderer.render();
        }

        this.game.update();

        if (!this.shouldClose) {
            window.requestAnimationFrame(this.update.bind(this));
        } else {
            console.log("App has been closed");
        }
    }
}

const app: App = new App();
app.init();

window.app = app;