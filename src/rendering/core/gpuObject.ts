import { Renderer } from "../renderer.js";

export class GPUObject {
    renderer: Renderer;
    label: string;

    constructor(renderer: Renderer, label: string) {
        this.renderer = renderer;
        this.label = label;

        console.log(`Created ${this.label}`);
    }
}