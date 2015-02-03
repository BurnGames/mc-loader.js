function Block(chunk, x, y, z) {
    this.chunk = chunk;
    this.x = x;
    this.y = y;
    this.z = z;
}

Block.prototype.getTypeId = function () {
    return this.chunk.getType(this.x & 0xf, this.z & 0xf, this.y);
};

Block.prototype.getData = function() {
    return this.chunk.getData(this.x & 0xf, this.z & 0xf, this.y);
};

module.exports = Block;