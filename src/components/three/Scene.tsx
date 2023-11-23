import { useState, useEffect, useRef } from "react";
import { 
    WebGLRenderer,
    Scene as SCN,
    PerspectiveCamera,
    Mesh,
    Object3D,
    Sphere,
    Color
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadAsset } from "..\\..\\utils\\ObjectHandleler";
import { deserializeFiber } from "..\\..\\utils\\serialization";
import { calculateZoneEffect, createLines, setNeonWave } from "./Lines";
import { setUpBrain, setUpMococo, setUpGround, setUpElectrodes } from "./ModelSetup";
import { setUpIlumination } from "./IluminationSetUp";

// ======================<-- TYPE IMPORTS -->====================================================
import type { FC } from "react";
import type { Camera } from "three";
import type { Object } from "..\\..\\utils\\ObjectHandleler";
import type { GLTF } from "three\\examples\\jsm\\loaders\\GLTFLoader.js";
import type { Fiber } from "..\\..\\utils\\serialization";
import type { FiberZone } from "./Lines";

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

        // Ilumination
        const { hemLight, dirLight } = setUpIlumination();

        // Creating the ground.
        const ground: Mesh = setUpGround();

        const objectNum: number = 2;
        const gap: number = 150;

        // Setting the models properties.
        // Create n brains
        const brains: Object3D[] = setUpBrain(brain, objectNum, gap);
        for(const brain of brains) scene.add(brain);
        setUpMococo(mococo[0]);

        const [fibersV3Array, linesArray] = createLines(fibers, objectNum, gap);
        const influenceZonesArray: Sphere[][] = setUpElectrodes(scene, objectNum, gap);
        const modelsEffectZones: FiberZone[][] = calculateZoneEffect(fibersV3Array, influenceZonesArray);
        for(const model of linesArray){
            for(const line of model) scene.add(line);
        }
        setNeonWave(modelsEffectZones, linesArray);

        // Add models to the scene.
        scene.add(mococo[0].scene, hemLight, dirLight);

        // Camera setting.
        camera.position.set( 0, 50, -250 );
        camera.lookAt(brain.position);

        // Main animation loop.
        let deltaTime: number = 0;
        const animate = (): void => {
            requestAnimationFrame(animate);
            deltaTime += 0.01;

            controls.update();
            mococo[0].scene.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        return (): void => {
            // Clean the scene
            scene.remove(mococo[0].scene,
                brain,
                ground,
                hemLight,
                dirLight
            );
            //for(const line of lines) scene.remove(line);
            cancelAnimationFrame(animationFrameID);
            containerRef.current?.removeChild(renderer.domElement);
        }
    }, [mococo, brain, fibers]);

    return <div ref={containerRef}/>
}

export default Scene;