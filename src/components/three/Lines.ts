import {
    Scene,
    Euler,
    BufferGeometry,
    Line,
    LineBasicMaterial,
    Vector3,
    Sphere,
    Group
} from "three";
import type { Fiber } from "../../utils/serialization";

export type FiberV3 = Vector3[];

const createLines = (fibers: Fiber[], scene: Scene): FiberV3[] => {
    // Extract the fiber´s goemtry into FiberV3
    const fibersV3: FiberV3[] = [];

    for(const fiber of fibers){
        const fiberV3: FiberV3 = [];
        for(const vertex of fiber){
            const {x, y, z} = vertex;

            fiberV3.push(new Vector3(x, y, z));
        }
        fibersV3.push(fiberV3);
    }

    // SetUp the vertices position
    for(const fiberV3 of fibersV3){
        for(const vector of fiberV3){
            vector.applyEuler(new Euler((3*Math.PI)/2));
            vector.add(new Vector3(-130, -160, 90));
        }
    }

    // Create the actual vizualization of the fibers based on their gometry
    const lines: Line[] = fibersV3.map(fiberV3 => {
        const geometry: BufferGeometry = new BufferGeometry().setFromPoints(fiberV3);
        const lineMaterial: LineBasicMaterial = new LineBasicMaterial({
            color: 0x5b21b6,
            visible: true
        });

        return new Line(geometry, lineMaterial);
    });
    for(const line of lines) scene.add(line);

    return fibersV3;
}

const getZonesLines = (lines: Group, zones: Sphere[]): void => {
    let xd: number = 0;
    for(const zone of zones){
        for(const line of lines.children){
            // Get each vertex
            for(let i=0; i<line.geometry.attributes.position.array.length; i++){
                const vertex: Vector3 = new Vector3(
                    line.geometry.attributes.position.array[i],
                    line.geometry.attributes.position.array[i+1],
                    line.geometry.attributes.position.array[i+2]
                );

                // console.log("DISTANCE:", xd, zone.distanceToPoint(vertex))
                // console.log("ZONE_CENTER",xd,zone.center)
                // console.log("VERTEX", vertex)

                break
            }
        }
        xd++;
    }
    // For each zone check what lines are within the radious
    // for(const zone of zones){
    //     for(const line of lines){
    //         console.log(line.position)
            
    //     }
    // }

}
export { createLines, getZonesLines };