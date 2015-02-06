function Block(chunk, x, y, z) {
    this.chunk = chunk;
    this.x = x;
    this.y = y;
    this.z = z;
}

Block.prototype.getTypeId = function () {
    return this.chunk.getType(this.x & 0xf, this.z & 0xf, this.y);
};

Block.prototype.getData = function () {
    return this.chunk.getData(this.x & 0xf, this.z & 0xf, this.y);
};

Block.prototype.setTypeId = function (type) {
    this.chunk.setType(this.x & 0xf, this.z & 0xf, this.y, type);
};

Block.prototype.setData = function (data) {
    this.chunk.setData(this.x & 0xf, this.z & 0xf, this.y, data);
};

module.exports = Block;