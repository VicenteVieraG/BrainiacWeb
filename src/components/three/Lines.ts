import {
    Euler,
    BufferGeometry,
    Line,
    LineBasicMaterial,
    ShaderMaterial,
    Vector3,
    Sphere,
    Color
} from "three";
import type { Fiber } from "../../utils/serialization";

import { vertexShader } from "./Shaders";

export type FiberV3 = Vector3[];

export interface FiberZone {
    fiber: number,
    zone: number;
};

// Create the colors array for the electrodes and the influenceSpheres
const colors: number[] = [
    0x32a852,
    0xa83232, // 1 Red
    0xa2a832, // 2 Yellow
    0x3ea832, // 3 Green
    0xf472b6, // 4 Pink
    0x0ea5e9, // 5 Sky
    0x1e40af, // 6 Blue
    0xf97316, // 7 Orange
    0x7e22ce, // 8 Purple
    0x64748b, // 9 Slate
    0xfafafa, // 10 White
    0x451a03, // 11 Brown
    0x0a0a0a  // 12 Black
];

const createLines = (fibers: Fiber[]): [FiberV3[], Line[]] => {
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
            opacity: 0.9,
            transparent: true,
            visible: true
        });

        return new Line(geometry, lineMaterial);
    });

    return [fibersV3, lines];
}

const calculateZoneEffect = (fibersV3: FiberV3[], influenceZones: Sphere[]): FiberZone[] => {
    // Array containing wich fibers are inside the influence zones
    const fibersZones: FiberZone[] = [];

    for(let i=0; i<influenceZones.length; i++){
        for(let j=0; j<fibersV3.length; j++){
            for(const vertex of fibersV3[j]){
                if(influenceZones[i].containsPoint(vertex)){
                    fibersZones.push({fiber: j, zone: i});
                    break;
                }
            }
        }
    }

    return fibersZones;
}

const setNeonWave = (fiberZones: FiberZone[], lines: Line[]): void => {
    for(const fiberZone of fiberZones){
        // Defining the wave-neon shader material
        const { fiber, zone } = fiberZone;

        // Convert colors from hexadecimal to RGBA
        const r: number = ((colors[zone] >> 16) & 0xFF)/255;
        const g: number = ((colors[zone] >> 8) & 0xFF)/255;
        const b: number = (colors[zone] & 0xFF)/255;

        // fragmentShader.glsl
        const fragmentShader: string = `
            void main() {
                gl_FragColor = vec4(${r}, ${g}, ${b}, 1.0);
            }
        `;

        const uniform = {
            time: { value: 1.0 },
            amplitude: { value: 1.0 },
            wavelength: { value: 20.0 },
            lineColor: { value: new Color(colors[zone]) }
        }
        const shaderMaterial: ShaderMaterial = new ShaderMaterial({
            uniforms: uniform,
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            visible: true
        });

        lines[fiber].material = shaderMaterial;
    }
}

export { createLines, calculateZoneEffect, setNeonWave };