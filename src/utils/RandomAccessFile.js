var fs = require('fs');
var Int64 = require('./Int64');

var RandomAccessFile = function (filename) {
    if (!(this instanceof RandomAccessFile)) return new RandomAccessFile(filename);

    this.filename = filename;
    this.size = fs.statSync(filename).size;
    this.offset = 0;
    this.fd = null;
};

RandomAccessFile.prototype.open = function () {
    if (!this.fd) {
        var exists = fs.existsSync(this.filename);
        var fd = fs.openSync(this.filename, exists ? 'r+' : 'w+');
        fs.truncateSync(this.filename, this.size);
        this.fd = fd;
    }
};

RandomAccessFile.prototype.close = function () {
    if (this.fd) {
        fs.closeSync(this.fd);
    }
};

/**
 * Reads a specified amount of bytes
 */
RandomAccessFile.prototype.read = function (length) {
    if (!length) {
        length = 1;
    }
    this.open();
    var buffer = new Buffer(length);
    var read = fs.readSync(this.fd, buffer, 0, length, this.offset);
    this.offset += length;
    if (read !== length) {
        throw new Error("Range not satisfied. Read: " + read + " length: " + length + " offset: " + (this.offset - length) + " total size: " + this.size);
    }
    return buffer;
};

RandomAccessFile.prototype.write = function (buffer) {
    if (typeof buffer === 'string') buffer = new Buffer(buffer);
    this.open();
    fs.writeSync(self.fd, buffer, 0, buffer.length, this.offset);
    this.size += buffer.length;
};

RandomAccessFile.prototype.readInt = function () {
    var buffer = this.read(4);

    var ch1 = buffer[0];
    var ch2 = buffer[1];
    var ch3 = buffer[2];
    var ch4 = buffer[3];
    if ((ch1 | ch2 | ch3 | ch4) < 0) {
        throw new Error("EOF");
    }
    return ((ch1 << 24) + (ch2 << 16) + (ch3 << 8) + (ch4 << 0));
};

RandomAccessFile.prototype.readByte = function () {
    var buffer = this.read(1);
    var byte = buffer[0];
    if (byte < 0) {
        throw new Error("EOF");
    }
    return byte;
};

RandomAccessFile.prototype.seek = function (offset) {
    if (offset < 0 || offset > this.size) {
        throw new Error("Invalid offset");
    }
    this.offset = offset;
};

RandomAccessFile.prototype.unlink = function () {
    this.close();
    fs.unlinkSync(this.filename);
};

module.exports = RandomAccessFile;