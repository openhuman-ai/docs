// import ForceGraph3D from '3d-force-graph';
import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {DragControls as ThreeDragControls} from 'three/examples/jsm/controls/DragControls.js';
import dynamic from "next/dynamic";

import ThreeForceGraph from 'three-forcegraph';

export default function ForceGraph({wcontainer, hcontainer, data}) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);

    const [isInitialized, setIsInitialized] = useState(false);

    // console.log('gData', data)

    useEffect(() => {
        if (!isInitialized) {
            // console.log('force graph');
            if (canvasRef.current == null) {
                return
            }

            const scene = new THREE.Scene();
            sceneRef.current = scene;
            const camera = new THREE.PerspectiveCamera(75, wcontainer / hcontainer, 0.1, 1000);
            camera.position.z = 5;
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
            // renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setSize(wcontainer, hcontainer);
            rendererRef.current = renderer;
            // canvasRef.current.appendChild(renderer.domElement);

            const forceGraph = new ThreeForceGraph().graphData(data);
            scene.add(forceGraph);

            // const geometry = new THREE.BoxGeometry();
            // const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
            // const cube = new THREE.Mesh(geometry, material);
            // scene.add(cube);

            const animate = () => {
                requestAnimationFrame(animate);
                forceGraph.tickFrame();
                // cube.rotation.x += 0.01;
                // cube.rotation.y += 0.01;
                renderer.render(sceneRef.current, cameraRef.current);
            };

            animate();
            if (canvasRef.current) {
                canvasRef.current.appendChild(renderer.domElement);
            }

            return () => {
                if (canvasRef.current != null) {
                    console.log('canvasRef.current', canvasRef.current)
                    // canvasRef.current.dispose()
                }

                // if (canvasRef.current.parentNode) {
                //     canvasRef.current.parentNode.removeChild(canvas);
                //     canvasRef.current.remove();
                //     // gui.removeFolder(lightGUI);
                //     // gui.removeFolder(lightGUI);
                // }

                if (rendererRef.current != null) {
                    // rendererRef.current.remove()
                }
                // if (sceneRef.current != null) {
                //     sceneRef.current.remove()
                // }
                // camera.remove()
                // canvasRef.remove()
            }
            setIsInitialized(true)
        }
    }, [wcontainer, hcontainer, isInitialized]);


    return (
        <div className="wrapper">
            <div ref={canvasRef}></div>
        </div>
    );
}
