var RegionFileCache = require('./RegionFileCache');
var ChunkSection = require('../chunk/ChunkSection');
var NibbleArray = require('../utils/NibbleArray');
var nbt = require('../utils/NBT');

const REGION_SIZE = 32;

function ChunkIoService(dir) {
    this.dir = dir;
    this.cache = new RegionFileCache('.mca');
}

ChunkIoService.prototype.read = function (chunk) {
    var x = chunk.x;
    var z = chunk.z;
    var time = Date.now();
    var region = this.cache.getRegionFile(this.dir, x, z);
    console.log('Took ' + (Date.now() - time) + ' to load the region file');
    var regionX = x & (REGION_SIZE - 1);
    var regionZ = z & (REGION_SIZE - 1);
    if (!region.hasChunk(regionX, regionZ)) {
        return chunk;
    }
    var dataIn = region.getChunkDataInputStream(regionX, regionZ);
    var parsed = nbt.parse(dataIn);
    var levelTag = parsed.Level;

    var sectionList = levelTag.Sections;
    var sections = [];
    for (var i = 0; i < sectionList.length; i++) {
        var sectionTag = sectionList[i];
        var y = sectionTag.Y;
        var rawTypes = sectionTag.Blocks;
        var extTypes = sectionTag.Add ? new NibbleArray(sectionTag.Add) : null;
        var data = new NibbleArray(sectionTag.Data);
        var blockLight = new NibbleArray(sectionTag.BlockLight);
        var skyLight = new NibbleArray(sectionTag.SkyLight);

        var types = [];
        for (var j = 0; j < rawTypes.length; j++) {
            types[j] = (((extTypes == null ? 0 : extTypes.get(j)) << 12) | ((rawTypes[j] & 0xff) << 4) | data.get(j));
        }
        sections[y] = new ChunkSection(types, skyLight, blockLight);
    }
    chunk.initializeSections(sections);
    chunk.populated = !!levelTag.TerrainPopulated;
    if (levelTag.Biomes) {
        chunk.biomes = levelTag.Biomes;
    }
    if (levelTag.HeightMap) {
        chunk.heightMap = levelTag.HeightMap;
    } else {
        chunk.automaticHeightMap();
    }
    return chunk;
};

module.exports = ChunkIoService;