var RandomAccessFile = require('../utils/RandomAccessFile');
var fs = require('fs');
var zlib = require('zlib');

const SECTOR_BYTES = 4096;
const SECTOR_INTS = SECTOR_BYTES / 4;

function RegionFile(path) {
    this.offsets = [];
    this.chunkTimestamps = [];

    this.sizeDelta = 0;
    if (fs.existsSync(path)) {
        this.lastModified = new Date(fs.statSync(path).mtime).getTime();
    }
    var file = new RandomAccessFile(path);
    file.seek(file.size);
    if (file.size < SECTOR_BYTES) {
        this.sizeDelta += 2 * SECTOR_BYTES;
        if (this.lastModified != 0) {
            console.warn('Region "' + path + '" under 8K: ' + file.size + ' increasing by ' + (2 * SECTOR_BYTES - file.size));
        }
        for (var i = file.size; i < 2 * SECTOR_BYTES; ++i) {
            var buffer = new Buffer(1);
            buffer[0] = 0;
            file.write(buffer);
        }
    }
    if ((file.size & 0xfff) != 0) {
        console.warn('Region "' + path + '" not aligned: ' + file.size + " increasing by " + (SECTOR_BYTES - (file.length & 0xfff)));
        for (i = 0; i < file.size & 0xfff; ++i) {
            buffer = new Buffer(1);
            buffer[0] = 0;
            file.write(buffer);
        }
    }
    var nSectors = (file.size / SECTOR_BYTES);
    this.sectorFree = [];
    for (i = 0; i < nSectors; i++) {
        this.sectorFree.push(true);
    }
    this.sectorFree.splice(0, 0, false);
    this.sectorFree.splice(1, 0, false);
    file.seek(0);
    for (i = 0; i < SECTOR_INTS; i++) {
        var fileOffset = file.readInt();
        this.offsets[i] = fileOffset;
        var startSector = fileOffset >> 8;
        var numSectors = fileOffset & 0xff;

        if (fileOffset != 0 && startSector >= 0 && startSector + numSectors < this.sectorFree.length) {
            for (var sectorNum = 0; sectorNum < numSectors; ++sectorNum) {
                this.sectorFree.splice(startSector + sectorNum, 0, false);
            }
        } else {
            console.warn('Region "' + path + '" offsets[' + i + '] = ' + fileOffset + ' -> ' + startSector + ',' + numSectors + ' does not fit')
        }
    }
    for (i = 0; i < SECTOR_INTS; ++i) {
        this.chunkTimestamps[i] = file.readInt();
    }
    this.file = file;
}

RegionFile.prototype.getChunkDataInputStream = function (x, z, callback) {
    if (this.outOfBounds(x, z)) {
        throw new Error('Out of bounds');
    }
    var offset = this.getOffset(x, z);
    if (offset == 0) {
        return;
    }
    var sectorNumber = offset >> 8;
    var numSectors = offset & 0xFF;

    if (sectorNumber + numSectors > this.sectorFree.length) {
        throw new Error('Invalid sector');
    }

    this.file.seek(sectorNumber * SECTOR_BYTES);
    var length = this.file.readInt();

    if (length > SECTOR_BYTES * numSectors) {
        throw new Error('Invalid length');
    }

    var version = this.file.readByte();
    if (version == 1) {
        // gzip
        var buffer = this.file.read(length - 1);
        zlib.gunzip(buffer, callback);
    } else if (version == 2) {
        // deflate
        buffer = this.file.read(length - 1);
        zlib.inflate(buffer, callback);
    } else {
        throw new Error('Invalid version "' + version + '"');
    }
};

RegionFile.prototype.getOffset = function (x, z) {
    return this.offsets[x + z * 32];
};

RegionFile.prototype.hasChunk = function (x, z) {
    return this.getOffset(x, z) != 0;
};

RegionFile.prototype.outOfBounds = function (x, z) {
    return x < 0 || x >= 32 || z < 0 || z >= 32;
};

RegionFile.prototype.close = function () {
    this.file.close();
};

module.exports = RegionFile;