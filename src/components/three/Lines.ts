import { BufferGeometry, LineBasicMaterial, Line, Vector3 } from "three";
import type { Fiber } from "../../utils/serialization";

const createLine = (fiber: Fiber): Line => {
    const line: Vector3[] = [];

    // Read the vertices to save them in the buffer
    for(const vertex of fiber){
        const { x, y, z} = vertex;
        line.push(new Vector3(x, y, z));
    }

    const geometry: BufferGeometry = new BufferGeometry().setFromPoints(line);

    // Create the line material
    const material: LineBasicMaterial = new LineBasicMaterial({color: 0x0000ff, linewidth: 1, fog: false, opacity: 0.9, visible: false});

    // Create the Line object
    return new Line(geometry, material);
}

export default createLine;