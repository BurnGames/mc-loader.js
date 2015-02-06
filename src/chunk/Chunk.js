var Block = require('../block/Block');
var ChunkSection = require('../chunk/ChunkSection');

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

Chunk.prototype.getData = function (x, z, y) {
    var section = this.getSection(y);
    if (section) {
        return section[section.index(x, y, z)] & 0xF;
    }
    return 0
};

Chunk.prototype.setType = function (x, z, y, type) {
    if (type < 0 || type > 0xfff) {
        throw new Error('Invalid range');
    }
    var section = this.getSection(y);
    if (!section) {
        if (type == 0) {
            return;
        }
        var idx = y >> 4;
        if (y < 0 || y >= 256 || idx > this.sections.length) {
            return;
        }
        this.sections[idx] = section = new ChunkSection();
    }
    // todo delete tile entity

    var index = this.coordToIndex(x, z, y);
    var heightIndex = z * 16 + x;
    if (type === 0) {
        if (section.types[index] != 0) {
            section.count--;
        }
        if (this.heightMap[heightIndex] == y + 1) {
            // erased, redo that column
            this.heightMap[heightIndex] = this.lowerHeightMap(x, y, z);
        }
    } else {
        if (section.types[index] == 0) {
            section.count++;
        }
        if (this.heightMap[heightIndex] <= y) {
            this.heightMap[heightIndex] = Math.min(y + 1, 255);
        }
    }
    section.types[index] = type << 4;

    if (type == 0 && !section.count) {
        section[y / 16] = null;
    }
    // todo maybe create new tile entity
};

Chunk.prototype.setData = function (x, z, y, data) {
    if (data < 0 || data >= 16) {
        throw new Error('Out of range');
    }
    var section = this.getSection(y);
    if (section) {
        var index = section.index(x, y, z);
        var type = section.types[index];
        if (type) {
            section.types[index] = (type & 0xfff0) | data;
        }
    }
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

Chunk.prototype.automaticHeightMap = function () {
    var sy = this.sections.length - 1;
    while (sy-- >= 0) {
        if (this.sections[sy]) {
            break;
        }
    }
    var y = (sy + 1);
    for (var x = 0; x < 16; ++x) {
        for (var z = 0; z < 16; ++z) {
            this.heightMap[z * 16 + x] = this.lowerHeightMap(x, y, z);
        }
    }
};

Chunk.prototype.lowerHeightMap = function (x, y, z) {
    for (--y; y >= 0; y--) {
        if (this.getType(x, z, y) != 0) {
            break;
        }
    }
    return y + 1;
};

Chunk.prototype.coordToIndex = function (x, z, y) {
    if (x < 0 || z < 0 || y < 0 || x >= 16 || z >= 16 || y >= 256) {
        throw new Error('Out of bounds');
    }
    return (y * 16 + z) * 16 + x;
};

module.exports = Chunk;