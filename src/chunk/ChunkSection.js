var NibbleArray = require('../utils/NibbleArray');

function ChunkSection(types, skyLight, blockLight) {
    if (types && skyLight && blockLight) {
        this.types = types;
        this.skyLight = skyLight;
        this.blockLight = blockLight;
        this.recount();
    } else {
        this.types = [];
        this.skyLight = new NibbleArray(4096);
        this.blockLight = new NibbleArray(4096);
        this.skyLight.fill(0xf);
    }
}

ChunkSection.prototype.index = function (x, y, z) {
    if (y < 0 || z < 0 || x >= 16 || z >= 16) {
        throw new Error('Coords out of bounds')
    }
    return ((y & 0xf) << 8) | (z << 4) | x;
};

ChunkSection.prototype.recount = function () {
    this.count = 0;
    for (var i = 0; i < this.types.length; i++) {
        if (this.types[i] != 0) {
            this.count++;
        }
    }
};

module.exports = ChunkSection;