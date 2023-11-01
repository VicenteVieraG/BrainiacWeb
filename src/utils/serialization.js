"use strict";
exports.__esModule = true;
exports.deserializeFiber = exports.serializeFiber = void 0;
var fs = require("fs");
// Calculate Fiber Buffer Size
var bufferSize = function (fibers) {
    // Number of fibers
    var size = 4;
    for (var _i = 0, fibers_1 = fibers; _i < fibers_1.length; _i++) {
        var fiber = fibers_1[_i];
        // Save the number of vertices
        size += 4;
        // Save the space for each of the vertices of the fiber
        size += fiber.length * 12;
    }
    return size;
};
// Serialization
var serializeFiber = function (fibers, filePath) {
    // Calculate the total Buffer size and set offset to 0
    var buffer = Buffer.alloc(bufferSize(fibers));
    var offset = 0;
    // Write the number of fibers and update the offset
    buffer.writeInt32LE(fibers.length, offset);
    offset += 4;
    for (var _i = 0, fibers_2 = fibers; _i < fibers_2.length; _i++) {
        var fiber = fibers_2[_i];
        // Write the number of vertices of each fiber
        buffer.writeInt32LE(fiber.length, offset);
        offset += 4;
        for (var _a = 0, fiber_1 = fiber; _a < fiber_1.length; _a++) {
            var vertex = fiber_1[_a];
            // Write each of the fibers´ vertices coords
            buffer.writeFloatLE(vertex.x, offset);
            offset += 4;
            buffer.writeFloatLE(vertex.y, offset);
            offset += 4;
            buffer.writeFloatLE(vertex.z, offset);
            offset += 4;
        }
    }
    fs.writeFileSync(filePath, buffer);
};
exports.serializeFiber = serializeFiber;
// Deserialization
var deserializeFiber = function (filePath) {
    // Read the content of the binary file and initialize offset to 0
    var buffer = fs.readFileSync(filePath);
    var offset = 0;
    // Read the total number of Fibers
    var numberFiber = buffer.readInt32LE(offset);
    offset += 4;
    var fibers = [];
    for (var i = 0; i < numberFiber; i++) {
        // For each Fiber we read the number of vertices
        var numberVertices = buffer.readInt32LE(offset);
        offset += 4;
        // Save the vertices of the current fiber
        var fiber = [];
        for (var j = 0; j < numberVertices; j++) {
            // Read each of the vertices of the current fiber
            var x = buffer.readFloatLE(offset);
            offset += 4;
            var y = buffer.readFloatLE(offset);
            offset += 4;
            var z = buffer.readFloatLE(offset);
            offset += 4;
            fiber.push({ x: x, y: y, z: z });
        }
        fibers.push(fiber);
    }
    return fibers;
};
exports.deserializeFiber = deserializeFiber;
