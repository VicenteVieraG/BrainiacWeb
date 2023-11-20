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
    0x32a852, // 0 Skin
    0x030712, // 1 Black
    0xa2a832, // 2 Yellow
    0x3ea832, // 3 Green
    0xf472b6, // 4 Pink
    0x0ea5e9, // 5 Sky
    0x1e40af, // 6 Blue
    0xf97316, // 7 Orange
    0x7e22ce, // 8 Purple
    0xa21caf, // 9 Fusha
    0x34d399, // 10 emerald
    0x451a03, // 11 Brown
    0xdc2626, // 12 Red
    0xb45309, // 13 Amber
    0xa3e635, // 14 Lime
    0x4f46e5  // 15 Indigo
];

const createLines = (fibers: Fiber[], number: number, gap: number): [FiberV3[][], Line[][]] => {
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

    // Create the fibersV3 copies
    const fibersV3Total: FiberV3[][] = [];
    for(let i = 0; i < number; i++){
        const fibersV3Copies: FiberV3[] = [];

        for(const fiberV3 of fibersV3){
            const fiberV3Copy: FiberV3 = [];
            for(const vertex of fiberV3){
                fiberV3Copy.push(vertex.clone());
            }
            fibersV3Copies.push(fiberV3Copy);
        }

        fibersV3Total.push(fibersV3Copies);
    }

    // SetUp the vertices position
    for(let i = 0; i < fibersV3Total.length; i++){
        for(const fiberV3 of fibersV3Total[i]){
            for(const vector of fiberV3){
                vector.applyEuler(new Euler((3*Math.PI)/2));
                vector.add(new Vector3(-i * gap - 130, -160, 90));
            }
        }
    }

    // Create the actual vizualization of the fibers based on their gometry
    const totalLines: Line[][] = [];
    for(const fiberV3Array of fibersV3Total){
        const lines: Line[] = [];
        for(const fiberV3 of fiberV3Array){
            const geometry: BufferGeometry = new BufferGeometry().setFromPoints(fiberV3);
            const lineMaterial: LineBasicMaterial = new LineBasicMaterial({
                color: 0xa1a1aa,
                opacity: 0.3,
                transparent: true,
                visible: true
            });

            lines.push(new Line(geometry, lineMaterial));
        }
        totalLines.push(lines);
    }

    return [fibersV3Total, totalLines];
}

const calculateZoneEffect = (fibersV3Array: FiberV3[][], influenceZonesArray: Sphere[][]): FiberZone[][] => {
    // Array containing wich fibers are inside the influence zones
    const fibersZones: FiberZone[][] = [];

    for(let i = 0; i < influenceZonesArray.length; i++){
        const fiberZone: FiberZone[] = [];
        for(let j = 0; j < influenceZonesArray[i].length; j++){
            for(let k = 0; k < fibersV3Array[i].length; k++){
                for(let l = 0; l < fibersV3Array[i][k].length; l++){
                    if(influenceZonesArray[i][j].containsPoint(fibersV3Array[i][k][l])){
                        fiberZone.push({fiber: k, zone: j});
                        break;
                    }
                }
            }
        }
        fibersZones.push(fiberZone);
    }

    return fibersZones;
}

const setNeonWave = (modelFiberZoneMap: FiberZone[][], modelsLines: Line[][]): void => {
    let currentModel: number = 0;
    console.log(modelsLines)
    for(const fiberZoneMap of modelFiberZoneMap){
        for(const map of fiberZoneMap){
            // Defining the wave-neon shader material
            const { fiber, zone } = map;

            // Convert colors from hexadecimal to RGBA
            const r: number = ((colors[zone] >> 16) & 0xFF)/255;
            const g: number = ((colors[zone] >> 8) & 0xFF)/255;
            const b: number = (colors[zone] & 0xFF)/255;

            // fragmentShader.glsl
            const fragmentShader: string = `
                uniform float time;
                uniform float amplitude;
                uniform float wavelength;

                void main() {
                    gl_FragColor = vec4(${r}, ${g}, ${b}, 1.0);
                    // Include your wave effect here using the 'time' uniform
                }
            `;

            const shaderMaterial: ShaderMaterial = new ShaderMaterial({
                uniforms: {
                    time: { value: 0.1 },
                    amplitude: { value: 1.0 },
                    wavelength: { value: 20.0 },
                    lineColor: { value: new Color(colors[zone]) }
                },
                fragmentShader: fragmentShader,
                vertexShader: vertexShader,
                visible: true
            });
            modelsLines[currentModel][fiber].material = shaderMaterial;
        }
        currentModel++;
    }
}

export { createLines, calculateZoneEffect, setNeonWave };