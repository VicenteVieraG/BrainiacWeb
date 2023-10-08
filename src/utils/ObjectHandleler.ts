import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { Texture, TextureLoader } from "three";
import {
    Object3DEventMap,
    Object3D,
    Group,
    BufferGeometry,
    NormalBufferAttributes
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Collada } from "three/examples/jsm/loaders/ColladaLoader.js";

interface LoadAssetOptions {
    type?: ModelType;
}

type ModelType = "obj"
    |"fbx"
    |"gltf"
    |"glb"
    |"collada"
    |"draco"
    |"stl"
    |"ply";

type Loader = OBJLoader
    | FBXLoader
    | GLTFLoader
    | ColladaLoader
    | DRACOLoader
    | STLLoader
    | PLYLoader;

export type Object = Group<Object3DEventMap>
    | Object3D
    | GLTF
    | Collada
    | BufferGeometry<NormalBufferAttributes>;

export const loadAsset = async(assetPaths: string[], options?: LoadAssetOptions): Promise<Object[]> => {
    const type = options?.type || "obj";

    const loadedAssets = assetPaths.map((path) => {
        let loader: Loader;

        switch(type) {
            case "obj":
                loader = new OBJLoader();
                break;
            case "fbx":
                loader = new FBXLoader();
                break;
            case "glb":
                loader = new GLTFLoader();
                break;
            case "gltf":
                loader = new GLTFLoader();
                break;
            case "collada":
                loader = new ColladaLoader();
                break;
            case "draco":
                loader = new DRACOLoader();
                break;
            case "stl":
                loader = new STLLoader();
                break;
            case "ply":
                loader = new PLYLoader();
                break;
            default:
                throw new Error("Unsupported model type");
        }

        return new Promise<Object>((resolve, reject) => {
            loader.load(path, (object): void => {
                console.log("ASSERT: ", object);

                if(type === "glb" || type === "gltf") resolve(object as GLTF);
                resolve(object);
            }, undefined, (error): void => {
                console.log("ERROR: ", error)
                
                reject(error);
            });
        });
    });

    return Promise.all(loadedAssets);
};

/**
 * @VicenteVieraG
 * @description Loads textures to Three.js by passing an string array containing the path to the sources 
 * @param texturePaths 
 * @returns Returns a promise containing an array of loaded textures textures.
 * @async
 */
export const loadTextures = async(texturePaths: string[]): Promise<Texture[]> => {
    const loader: TextureLoader = new TextureLoader;

    const texturePromises: Promise<Texture>[] = texturePaths.map(texturePath => {
        return new Promise<Texture>((resolve, reject) => {
            loader.load(texturePath, texture => resolve(texture), undefined, error => reject(error));
        });
    });

    return Promise.all(texturePromises);
}
