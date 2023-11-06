import * as fs from "fs";

export interface Vertex {
    x: number;
    y: number;
    z: number;
}

export type Fiber = Vertex[];

// Calculate Fiber Buffer Size
const bufferSize = (fibers: Fiber[]): number => {
    // Number of fibers
    let size: number = 4;

    for(const fiber of fibers){
        // Save the number of vertices
        size += 4;

        // Save the space for each of the vertices of the fiber
        size += fiber.length * 12;
    }

    return size;
}

// Serialization
const serializeFiber = (fibers: Fiber[], filePath: string): void => {
    // Calculate the total Buffer size and set offset to 0
    const buffer: Buffer = Buffer.alloc(bufferSize(fibers));
    let offset: number = 0;

    // Write the number of fibers and update the offset
    buffer.writeInt32LE(fibers.length, offset);
    offset += 4;

    for(const fiber of fibers){
        // Write the number of vertices of each fiber
        buffer.writeInt32LE(fiber.length, offset);
        offset += 4;

        for(const vertex of fiber){
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
}

// Deserialization
const deserializeFiber = async(URL: string): Promise<Fiber[]> => {
    // Read the content of the binary file and initialize offset to 0
    const response: Response = await fetch(URL);
    const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
    const buffer: Buffer = Buffer.from(arrayBuffer);
    
    let offset: number = 0;

    // Read the total number of Fibers
    const numberFiber: number = buffer.readInt32LE(offset);
    offset += 4;
    
    const fibers: Fiber[] = [];

    for(let i = 0; i < numberFiber; i++){
        // For each Fiber we read the number of vertices
        const numberVertices: number = buffer.readInt32LE(offset);
        offset += 4;

        // Save the vertices of the current fiber
        const fiber: Fiber = [];
        for(let j = 0; j < numberVertices; j++){
            // Read each of the vertices of the current fiber
            const x = buffer.readFloatLE(offset);
            offset += 4;
            const y = buffer.readFloatLE(offset);
            offset += 4;
            const z = buffer.readFloatLE(offset);
            offset += 4;

            fiber.push({ x, y, z});
        }

        fibers.push(fiber);
    }

    return fibers;
}

export { serializeFiber, deserializeFiber };