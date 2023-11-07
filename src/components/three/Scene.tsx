import { useState, useEffect, useRef } from "react";
import { 
    WebGLRenderer,
    Scene as SCN,
    Color,
    PerspectiveCamera,
    Mesh,
    PlaneGeometry,
    Object3D,
    SkeletonHelper,
    MeshPhongMaterial,
    MeshStandardMaterial,
    HemisphereLight,
    DirectionalLight
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadAsset } from "..\\..\\utils\\ObjectHandleler";
import { deserializeFiber } from "..\\..\\utils\\serialization";

// ======================<-- TYPE IMPORTS -->====================================================
import type { FC } from "react";
import type { 
    Scene as TSCN,
    Camera,
    WebGLRenderer as WGLR,
    DirectionalLight as DL
} from "three";
import type { Object } from "..\\..\\utils\\ObjectHandleler";
import type { GLTF } from "three\\examples\\jsm\\loaders\\GLTFLoader.js";
import type { Fiber } from "..\\..\\utils\\serialization";

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
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
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
        const fetchData = async() => {
            const data: Fiber[] = await deserializeFiber(DATA_URL);

            setFibers(data);
        }

        fetchData().catch(error => console.log(error));
    }, []);

// ==================<-- SETUP SCENE AND RENDER LOOP -->=============================================
    const camera: Camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    useEffect(() => {
        // Initialize Scene basics.
        // Check for not null objects.
        if(!(containerRef.current && mococo && brain && fibers)) return;

        console.log("FIBERS: ", fibers)
        
        let animationFrameID: number;
        
        // Set Scene parameters.
        const scene: TSCN = new SCN;
        if(scene.background) scene.background = new Color(0xa0a0a0);
        const renderer: WGLR = new WebGLRenderer({antialias: true});
        
        // Ilumination
        const ilumination: HemisphereLight = new HemisphereLight(0xffffff, 0x8d8d8d, 3);
        ilumination.position.set(0, 1000, 0);

        const dirLight: DL = new DirectionalLight(0xffffff, 3);
        dirLight.position.set(0, 50, 0);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 150;
        dirLight.shadow.camera.bottom = -150;
        dirLight.shadow.camera.left = -150;
        dirLight.shadow.camera.right = 150;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 150;

        // Creating the ground.
        const ground: Mesh = new Mesh(
            new PlaneGeometry(4000, 4000),
            new MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
        );
        ground.rotation.x = - Math.PI / 2;
        ground.position.setY(-50)
        ground.receiveShadow = true;

        // Rendering config and add it to the Scene main tag.
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Creating controllers for the camera rotation
        const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        // Setting the models properties.
        mococo[0].scene.traverse(child => (child instanceof Mesh)? child.castShadow = true : null);
        mococo[0].scene.scale.setScalar(30);
        mococo[0].scene.position.y = 1;
        mococo[0].scene.position.z = -1;

        brain.traverse(child => {
            if(child instanceof Mesh){
                child.castShadow = true;
                child.material = new MeshStandardMaterial({
                    color: new Color(0xB5C6DB),
                    metalness: 1,
                    roughness: .4
                });
            }
        });
        brain.position.set(0, 0, 0);
        brain.rotation.set(5, 0, 0);

        // Creating an skeleton.
        const skeleton: SkeletonHelper = new SkeletonHelper(mococo[0].scene);
        skeleton.visible = true;
        
        // Add models to the scene.
        scene.add(mococo[0].scene, brain, skeleton, ilumination, dirLight, ground);

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

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent): void => {
            switch(event.button){
                case 0:
                    setIsDragging(true);
                    setLastMousePosition({ x: event.clientX, y: event.clientY });
                    break;
                default:
                    console.error("Error at handleMouseDown");
                    break;
            }
        };
    
        const handleMouseMove = (event: MouseEvent): void => {
            if(!lastMousePosition || !brain) return;
    
            const deltaX: number = event.clientX - lastMousePosition.x;
            const deltaY: number = event.clientY - lastMousePosition.y;

            brain.rotation.z += deltaX * 0.01;
            brain.rotation.x += deltaY * -0.01;
    
            setLastMousePosition({ x: event.clientX, y: event.clientY });
        };
    
        const handleMouseUp = (event: MouseEvent): void => {
            switch(event.button){
                case 0:
                    setIsDragging(false);
                    break;
                default:
                    console.error("Error at handleMouseUp");
                    break;
            }
            setIsDragging(false);
            setLastMousePosition(null);
        };

        // Prevent the contex menu to default open at right click
        const handleContextMenu = (event: MouseEvent): void => event.preventDefault();
    
        // Add event listeners to the renderer's DOM element
        const rendererElement = containerRef.current?.querySelector('canvas');
        if (rendererElement) {
            rendererElement.addEventListener('mousedown', handleMouseDown);
            rendererElement.addEventListener('mousemove', handleMouseMove);
            rendererElement.addEventListener('mouseup', handleMouseUp);
            rendererElement.addEventListener('contextmenu', handleContextMenu);
        }
    
        // Cleanup event listeners on component unmount
        return () => {
            if (rendererElement) {
                rendererElement.removeEventListener('mousedown', handleMouseDown);
                rendererElement.removeEventListener('mousemove', handleMouseMove);
                rendererElement.removeEventListener('mouseup', handleMouseUp);
                rendererElement.removeEventListener('contextmenu', handleContextMenu);
            }
        };
    }, [isDragging, brain, lastMousePosition]);

    return <div ref={containerRef}/>
}

export default Scene;