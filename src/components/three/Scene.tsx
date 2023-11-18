import { useState, useEffect, useRef } from "react";
import { 
    WebGLRenderer,
    Scene as SCN,
    Color,
    PerspectiveCamera,
    Mesh,
    Sphere,
    Object3D,
    Vector3,
    Group,
    Line,
    LineBasicMaterial,
    BufferGeometry
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadAsset } from "..\\..\\utils\\ObjectHandleler";
import { deserializeFiber } from "..\\..\\utils\\serialization";
import { createLines, getZonesLines } from "./Lines";
import { setUpBrain, setUPFibers, setUpMococo, setUpGround, setUpElectrodes } from "./ModelSetup";
import { setUpIlumination } from "./IluminationSetUp";

// ======================<-- TYPE IMPORTS -->====================================================
import type { FC } from "react";
import type { Camera } from "three";
import type { Object } from "..\\..\\utils\\ObjectHandleler";
import type { GLTF } from "three\\examples\\jsm\\loaders\\GLTFLoader.js";
import type { Fiber } from "..\\..\\utils\\serialization";
import type { FiberV3 } from "./Lines";

// ======================<-- VARIABLES IMPORT -->==========================================
import { ASSETS } from "..\\..\\utils\\resourceSrc";
import { HENRIK } from "..\\..\\utils\\resourceSrc";

// ======================<-- INTERFACES -->======================================================
interface Props {
    children?: JSX.Element;
}

// ==========================<-- CONSTANTS -->==================================================
const DATA_URL: string = "/Fibers.bin";

// ==========================<-- MAIN COMPONENT -->=============================================
const Scene: FC<Props> = (): JSX.Element => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [mococo, setAssets] = useState<GLTF[] | null>(null);
    const [brain, setBrain] = useState<Object3D | null>(null);
    const [fibers, setFibers] = useState<Fiber[]>([]);
  
// =======================<-- LOAD ASSETS -->=======================================================
    useEffect(() => {
        const fetchAssets = async() => {
            const loadedAssets: Object[] = await loadAsset(ASSETS, {type: "glb"});
            const loadedBrain: Object[] = await loadAsset(HENRIK);

            setAssets(loadedAssets as GLTF[]);
            setBrain(loadedBrain[0] as Object3D);
        }
        
        fetchAssets();
    }, []);

// ===========================<-- LOAD FIBERS DATA -->===============================================
    useEffect(() => {
        const fetchData = async(): Promise<void> => {
            const data: Fiber[] = await deserializeFiber(DATA_URL);

            setFibers(data);
        }

        fetchData().catch(error => console.log(error));
    }, []);

// ==================<-- SETUP SCENE AND RENDER LOOP -->=============================================
    useEffect(() => {
        // Initialize Scene basics.
        // Check for not null objects.
        if(!(containerRef.current && mococo && brain && fibers)) return;

        let animationFrameID: number;

        // Set Scene parameters.
        const scene: SCN = new SCN;
        if(scene.background) scene.background = new Color(0xa0a0a0);
        const renderer: WebGLRenderer = new WebGLRenderer({antialias: true});

        // Rendering config and add it to the Scene main tag.
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Creating Camera
        const camera: Camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

        // Creating controllers for the camera rotation
        const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.enableDamping = true;

        // Get the fibers in Vector3 format and add the actual visualization
        // of the fibers on the scene
        const fibersV3: FiberV3[] = createLines(fibers, scene);


        // Create Fiber Lines
        // const lines: Line[] = fibers.map(fiber => createLine(fiber));
        // for(const line of lines){
        //     const vertices = line.geometry.attributes.position.array;
            
        //     for(let i=0; i<vertices.length; i++){
        //         const x: number = vertices[i];
        //         const y: number = vertices[i+1];
        //         const z: number = vertices[i+2];

        //         //console.log("X:", x, "Y:", y, "Z:", z);
        //     }
        //     //console.log(vertices)
        // }

        // Create the lines group
        // const brainFibers: Group = new Group;
        // for(const line of lines) brainFibers.add(line);

        // Ilumination
        const { hemLight, dirLight } = setUpIlumination();

        // Creating the ground.
        const ground: Mesh = setUpGround();

        // Setting the models properties.
        setUpMococo(mococo[0]);
        setUpBrain(brain);
        const influenceZones: Sphere[] = setUpElectrodes(scene);
        
        //setUPFibers(brainFibers);
        //getZonesLines(brainFibers, influenceZones);

        // Add models to the scene.
        scene.add(mococo[0].scene, brain, /*brainFibers,*/ ground, hemLight, dirLight);

        // Camera setting.
        camera.position.set( 0, 50, -250 );
        camera.lookAt(brain.position);

        // Main animation loop.
        const animate = (): void => {
            requestAnimationFrame(animate);
            controls.update();
            mococo[0].scene.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        return (): void => {
            cancelAnimationFrame(animationFrameID);
            containerRef.current?.removeChild(renderer.domElement);
        }
    }, [mococo, brain, fibers]);

    return <div ref={containerRef}/>
}

export default Scene;