export class UsedVertexAttributes {
    usesPositions = false;
    usesNormals = false;
    usesUvs = false;
    matches(otherAttributes) {
        return this.usesPositions === otherAttributes.usesPositions &&
            this.usesNormals === otherAttributes.usesNormals &&
            this.usesUvs === otherAttributes.usesUvs;
    }
    contains(otherAttributes) {
        return (this.usesPositions || this.usesPositions === otherAttributes.usesPositions) &&
            (this.usesNormals || this.usesNormals === otherAttributes.usesNormals) &&
            (this.usesUvs || this.usesUvs === otherAttributes.usesUvs);
    }
}
export class Mesh {
    positions = [];
    normals = [];
    uvs = [];
    triangles = [];
    vertexBufferData;
    indexBufferData;
    //get arrays
    getPositions() {
        return this.positions;
    }
    getNormals() {
        return this.normals;
    }
    getUvs() {
        return this.uvs;
    }
    //get count
    getVertexCount() {
        return this.positions.length;
    }
    getIndexCount() {
        return this.triangles.length * 3;
    }
    //get buffers
    getVertexBufferData() {
        if (!this.vertexBufferData) {
            if (this.getVertexCount() === 0) {
                console.warn(`Mesh has no vertices`);
            }
            this.vertexBufferData = new Float32Array(this.positions.length * 3 + this.normals.length * 3 + this.uvs.length * 2);
            const usedAttributes = this.getUsedAttributes();
            let offset = 0;
            for (let i = 0; i < this.getVertexCount(); i++) {
                if (usedAttributes.usesPositions) {
                    this.vertexBufferData.set(this.getPositions()[i], offset);
                    offset += 3;
                }
                if (usedAttributes.usesNormals) {
                    this.vertexBufferData.set(this.getNormals()[i], offset);
                    offset += 3;
                }
                if (usedAttributes.usesUvs) {
                    this.vertexBufferData.set(this.getUvs()[i], offset);
                    offset += 2;
                }
            }
        }
        return this.vertexBufferData;
    }
    getIndexBufferData() {
        if (!this.indexBufferData) {
            this.indexBufferData = new Uint16Array(this.triangles.length * 3);
            if (this.triangles.length === 0) {
                console.warn(`Mesh has no indices`);
            }
            for (let i = 0; i < this.triangles.length; i++) {
                this.indexBufferData.set(this.triangles[i], i * 3);
            }
        }
        return this.indexBufferData;
    }
    //misc
    getStride() {
        let stride = 0;
        if (this.getPositions().length > 0)
            stride += 3;
        if (this.getNormals().length > 0)
            stride += 3;
        if (this.getUvs().length > 0)
            stride += 2;
        return stride;
    }
    getUsedAttributes() {
        const usedAttributes = new UsedVertexAttributes();
        usedAttributes.usesPositions = this.getPositions().length > 0;
        usedAttributes.usesNormals = this.getNormals().length > 0;
        usedAttributes.usesUvs = this.getUvs().length > 0;
        return usedAttributes;
    }
}
//# sourceMappingURL=mesh.js.map