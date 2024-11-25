import { GPUObject } from "./gpuObject.js";
export class Texture extends GPUObject {
    renderer;
    gpuTexture;
    size;
    format;
    usage;
    //rendering to texture
    matchCanvas;
    view;
    constructor(renderer, uniqueName, size, usage, format, matchCanvas = false) {
        super(renderer, `Texture-${uniqueName}`);
        this.renderer = renderer;
        this.size = size;
        this.format = format;
        this.usage = usage;
        this.matchCanvas = matchCanvas;
        this.create();
        this.renderer.addTexture(this);
    }
    create() {
        if (this.gpuTexture) {
            this.gpuTexture.destroy();
        }
        if (this.view) {
            this.view = undefined;
        }
        if (this.matchCanvas) {
            this.size = [this.renderer.canvas.width, this.renderer.canvas.height, 1];
        }
        console.log(`Creating texture (${this.label})`);
        this.gpuTexture = this.renderer.device.createTexture({
            size: this.size,
            usage: this.usage,
            format: this.format,
            label: this.label,
        });
    }
    createView(descriptor = {}) {
        if (!this.view) {
            this.view = this.gpuTexture.createView(descriptor);
        }
        return this.view;
    }
    copyFromExternalImage(imageBitmap, flipY = false) {
        this.renderer.device.queue.copyExternalImageToTexture({
            source: imageBitmap,
            flipY: flipY,
        }, {
            texture: this.gpuTexture,
        }, this.size);
    }
    copyExternalImageToTexture(source, destination, sourceSize) {
        destination.texture = this.gpuTexture;
        this.renderer.device.queue.copyExternalImageToTexture(source, destination, sourceSize);
    }
    hasView() {
        return !!this.view;
    }
}
//# sourceMappingURL=texture.js.map