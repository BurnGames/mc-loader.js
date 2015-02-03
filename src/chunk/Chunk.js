var Block = require('../block/Block');

function Chunk(x, z) {
    this.x = x;
    this.z = z;
}

Chunk.prototype.getBlock = function (x, y, z) {
    return new Block(this, (this.x << 4) | (x & 0xf), y & 0xff, (this.z << 4) | (z & 0xf));
};

Chunk.prototype.getType = function (x, z, y) {
    var section = this.getSection(y);
    if (section) {
        return section.types[section.index(x, y, z)] >> 4;
    }
    return 0;
};

Chunk.prototype.getSection = function (y) {
    var idx = y >> 4;
    if (y < 0 || y >= 256 || !this.loaded || idx >= this.sections.length) {
        return;
    }
    return this.sections[idx];
};

Chunk.prototype.initializeSections = function (initSections) {
    if (this.loaded) {
        throw new Error('Chunk at ' + this.x + ' ' + this.z + ' is already loaded.');
    }
    this.sections = initSections;
    this.biomes = [];
    this.heightMap = [];

    for (var i = 0; i < initSections.length; i++) {
        if (!initSections[i]) {
            continue;
        }
        var by = 16 * i;
        for (var cx = 0; cx < 16; ++cx) {
            for (var cz = 0; cz < 16; ++cz) {
                for (var cy = by; cy < by + 16; ++cy) {
                    // todo try to make tile entity
                }
            }
        }
    }
    this.loaded = true;
};

module.exports = Chunk;