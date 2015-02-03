var fs = require('fs');
var path = require('path');
var ChunkIoService = require('./src/io/ChunkIoService');
var Chunk = require('./src/chunk/Chunk');
var nbt = require('./src/utils/NBT');

var file = 'C:\\Users\\Paul\\AppData\\Roaming\\.minecraft\\saves\\Joe_Paul';
if (!fs.existsSync(file)) {
    return console.error("No such file");
}
var service = new ChunkIoService(file);
var data = nbt.parse(fs.readFileSync(path.join(file, 'level.dat')));
var chunk = new Chunk(data.Data.SpawnX >> 4, data.Data.SpawnZ >> 4);
var time = Date.now();
service.read(chunk, function (err, chunk) {
    console.log("Took " + (Date.now() - time ) + " to load the spawn chunk");
    if (err) {
        throw err;
    }
    var types = {};
    for (var x = 0; x < 16; x++) {
        for (var z = 0; z < 16; z++) {
            for (var y = 0; y < 256; y++) {
                var block = chunk.getBlock(x, y, z);
                var id = block.getTypeId();
                if (types[id]) {
                    types[id]++;
                } else {
                    types[id] = 1;
                }
            }
        }
    }
    for (var blockId in types) {
        if (types.hasOwnProperty(blockId)) {
            console.log(blockId + " is used: " + types[blockId]);
        }
    }
});