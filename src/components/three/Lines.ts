import { BufferGeometry, LineBasicMaterial, Line, Vector3, Sphere, Group } from "three";
import type { Fiber } from "../../utils/serialization";

const createLine = (fiber: Fiber): Line => {
    const line: Vector3[] = [];

    // Read the vertices to save them in the buffer
    for(const vertex of fiber){
        const {x, y, z} = vertex;
        line.push(new Vector3(x, y, z));
    }

    const geometry: BufferGeometry = new BufferGeometry().setFromPoints(line);

    // Create the line material
    const material: LineBasicMaterial = new LineBasicMaterial({visible: false});

    // Create the Line object
    return new Line(geometry, material);
}

const getZonesLines = (lines: Line[], zones: Sphere[]): void => {
    // For each zone check what lines are within the radious
    for(const zone of zones){
        for(const line of lines){
            // Get each of the vertices of the line
            const positions = line.geometry.attributes.position.array;
            for(let i = 0; i < positions.length; i += 3){
                const x: number = positions[i];
                const y: number = positions[i+1];
                const z: number = positions[i+2];

                // Check if this coord is inside the zone
                if(zone.containsPoint(new Vector3(x, y, z))){
                    line.material = new LineBasicMaterial({
                        color: 0x0000ff,
                        linewidth: 1,
                        fog: false,
                        visible: true
                    });

                    break;
                }else{
                    //console.log("X: ",x, "Y: ", y, "Z: ", z)
                    line.material = new LineBasicMaterial({
                        color: 0x0000ff,
                        linewidth: 1,
                        fog: false,
                        visible: false
                    });
                }
            }
        }
    }

}
export { createLine, getZonesLines };