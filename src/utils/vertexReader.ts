import * as fs from "fs/promises";
import * as path from "path";
import type { Fiber, Vertex } from "./serialization";

const fibers: Fiber[] = [];

const readDir = async (dir: string): Promise<void> => {
    try {
        const files = await fs.readdir(dir);

        for (const file of files) {
            const fullPath: string = path.join(dir, file);
            const stats = await fs.stat(fullPath);

            if (stats.isDirectory()) {
                await readDir(fullPath);
            } else if (stats.isFile()) {
                const data: string = await fs.readFile(fullPath, "utf8");
                const lines: string[] = data.split('\n');
                const vertices: Vertex[] = [];

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    const axis: number[] = line.split(' ').map(num => parseFloat(num));
                    const [x, y, z] = axis;
                    vertices.push({ x, y, z });
                }

                fibers.push(vertices);
            }
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

// Llama a la función y luego imprime el resultado
readDir("C:/Users/plant/Documents/TEC/Semestre_7/assets/Models/Jessica/Tracks").then(() => {
    console.log(fibers);
});
