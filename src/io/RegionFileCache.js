var RegionFile = require("./RegionFile");
var path = require('path');
var fs = require('fs');

function RegionFileCache(extension) {
    this.extension = extension;
    this.cache = {};
}

RegionFileCache.prototype.getRegionFile = function (basePath, chunkX, chunkZ) {
    var regionDir = path.join(basePath, "region");
    var file = path.join(regionDir, "r." + (chunkX >> 5) + "." + (chunkZ >> 5) + this.extension);

    var ref = this.cache[file];
    if (ref) {
        return ref;
    }
    var time = Date.now();
    console.log('Took ' + (Date.now() - time) + ' to check if the directory was created');
    if (this.cache.length >= 256) {
        this.clear();
    }
    var reg = new RegionFile(file);
    this.cache[file] = reg;
    return reg;
};

RegionFileCache.prototype.clear = function () {
    for (var property in this.cache) {
        if (this.cache.hasOwnProperty(property)) {
            var reg = this.cache[property];
            if (reg) {
                reg.close();
            }
        }
    }
    this.cache = {};
};

module.exports = RegionFileCache;