import dynamic from 'next/dynamic'
import {useEffect, useRef, useState} from "react";

// import ForceGraph3D from '3d-force-graph';
// import ForceGraph from "./forcegraph"
import {cloneUniformsGroups} from "three/src/renderers/shaders/UniformsUtils";
const ForceGraph = dynamic(() => import('./forcegraph'), {
    ssr: false,
    loading: () => <p>Loading...</p>,
})

export default function OpenHuman() {
    const [wcontainer, setWcontainer] = useState(0);
    const [hcontainer, setHcontainer] = useState(0);
    const wrapperRef = useRef();

    useEffect(() => {
        
    }, [wcontainer, hcontainer]);

    const N = 300;
    const gData = {
        nodes: [...Array(N).keys()].map(i => ({id: i})),
        links: [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                source: id,
                target: Math.round(Math.random() * (id - 1))
            }))
    };

    // console.log('go here')
    return (
        <div ref={wrapperRef} className="w-full">
            {/* h11 */}
            <ForceGraph wcontainer={900} hcontainer={500} data={gData}/>
        </div>
    )
}
