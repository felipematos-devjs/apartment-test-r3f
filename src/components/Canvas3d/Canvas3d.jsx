import { Canvas, useFrame, useLoader} from "@react-three/fiber"
import { useState, useRef, forwardRef } from "react"
import { Environment, OrbitControls, useEnvironment, PerspectiveCamera, useProgress, Html, useHelper, GizmoHelper, Circle, Sphere, RoundedBox, Cylinder, ContactShadows, RandomizedLight} from "@react-three/drei"
import { AmbientLight, CameraHelper, DirectionalLight, DirectionalLightHelper, TextureLoader } from "three"
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { useEffect } from "react"
import { images } from "../../assets/Images/images.js"
import { Suspense } from "react"
import ProgressBar from "../ProgressBar/ProgressBar.jsx"
import {motion as motion3d} from 'framer-motion-3d'
import {motion, AnimatePresence, progress} from 'framer-motion'
import useMediaQuery from "../../hooks/useMediaQuery.jsx"

import "./Canvas3d.css"

function Loader({hide}) {
  const { active, progress, errors, item, loaded, total } = useProgress()
  const totalAssets = 19
  let curProgress = loaded/totalAssets * 100
  console.log(total)

  return (
  <Html fullscreen>
          <ProgressBar value={curProgress} key={'progressbar'} text={curProgress < 100? "(22.0 MB) Carregando Modelo..." : "(22.0 MB) Quase Lá...!"}/>
    </Html>
    )
}

import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'

const globals = {
  toggleHelpers : false,
  envMapIntensity: 0.5,
  ambientLightIntensity: 2.5,
  autoRotate: false,
  blur: 0.0, 
  presetList: ['none', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
  preset: 'none',
  normalScale: 2,
  roughnessMultiplier: 0.67,
  metalnessMultiplier: 1.41,
  floorColor: new THREE.Color("#fff"),
  fov: 25,
  zoom: 1
}

const enableGUI = true

const Canvas3d = () =>{
  const isMobile = useMediaQuery("(max-width: 620px)");

  const [loaded, setLoaded] = useState(false)
  
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotating, setRotating] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [autoRotate, setAutoRotate] = useState(globals.autoRotate)
  const [blur, setBlur] = useState(globals.blur)
  const [preset, setPreset] = useState(globals.preset)
  const [cursor, setCursor] = useState('pointer')
  const [fov, setFov] = useState(25)
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(globals.ambientLightIntensity)
  
  const canvasRef = useRef()
  const modelRef = useRef(null)

  const [helper, setHelper] = useState(false)

  const light1 = useRef()
  const light2 = useRef()

  useEffect(()=>{
    console.log('changed')
  }, [])




  const envMap = useLoader(RGBELoader, './environmentMaps/mountain.hdr')
  envMap.mapping = THREE.EquirectangularReflectionMapping
  envMap.colorSpace = THREE.SRGBColorSpace

  let gui = null

  useEffect(()=>{

    if (loaded)
      updateAllMaterials(modelRef.current)


    if (loaded && enableGUI)
    {
      if (gui == null)
      {
        const gui = new GUI()
  
        gui.add(globals, 'toggleHelpers').onChange(()=>{
          setHelper(globals.toggleHelpers)
        }) 

        gui.add(globals, 'envMapIntensity').onChange(()=>{
          updateAllMaterials(modelRef.current)
        }).min(0).max(1).step(0.001)

        gui.add(globals, 'ambientLightIntensity').onChange(()=>{
          updateAllMaterials(modelRef.current)
          setAmbientLightIntensity(globals.ambientLightIntensity)
        }).min(0).max(10).step(0.001).name('Light Intensity')

        gui.add(globals, 'roughnessMultiplier').onChange(()=>{
          updateAllMaterials(modelRef.current)
        }).min(0).max(3).step(0.001)

        gui.add(globals, 'normalScale').onChange(()=>{
          updateAllMaterials(modelRef.current)
        }).min(0).max(3).step(0.001)

        gui.add(globals, 'metalnessMultiplier').onChange(()=>{
          updateAllMaterials(modelRef.current)
        }).min(0).max(3).step(0.001)

        gui.add(globals, 'autoRotate').onChange(()=>{
          setAutoRotate(globals.autoRotate)
        })

        gui.add(globals, 'blur').onChange(()=>{
          setBlur(globals.blur)
        }).min(0).max(2).step(0.001)

        gui.add(globals, 'preset', globals.presetList).onChange(()=>{
          setPreset(globals.preset)
        })

        gui.add(globals, 'fov', globals.fov).onChange(()=>{
          setFov(globals.fov)
        }).min(10).max(75)

        gui.addColor(globals, "floorColor").onChange()
      
        gui.title('Parâmetros')
        gui.close()
      
      
      }
    }
  }, [loaded])


  return (
        <>
          <>
            <Canvas
            className="canvas3d" 
              shadows={{type: THREE.PCFSoftShadowMap}} 
              gl={{
                toneMapping: THREE.ReinhardToneMapping, 
                antialias: true, 
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                }}
              legacy={false}
              dpr={Math.min(window.devicePixelRatio, 2)}
              ref={canvasRef}
              onMouseDown={(e) =>handleMouseDownOnCanvas(e, setCursor)}
              onMouseUp={(e) =>handleMouseUpOnCanvas(e, setCursor)}
              onMouseLeave={(e) =>handleMouseUpOnCanvas(e, setCursor)}
              style={{cursor: cursor}}
              > 
                <Suspense fallback={<Loader></Loader>}>
                  
                  <motion3d.group>
                    <Model ref={modelRef} setLoaded = {setLoaded}/>
                    {preset != 'none'
                    ?<Environment blur={blur} preset={preset} background />
                    :<Environment map={envMap} blur={blur} background/>
                    }

                    <Light
                    helper={helper}
                    ref={light1}
                    position={[-2.5, 4, -8]} 
                    color={'#f0e2fd'}
                    castShadow={false}
                    shadow-camera-far={30}
                    shadow-camera-near={0.1}
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-normalBias={0.027}
                    shadow-bias={-0.002}
                    
                    intensity={1}
                    target-position={[-2,0,0]}
                    matrixWorldNeedsUpdate = {true}
                    />
        
                    <Light 
                    helper={helper}
                    ref={light2}
                    position={[4.1, 4, 3.6]} 
                    color={'#fff'}
                    castShadow={true}
                    shadow-camera-far={30}
                    shadow-camera-near={0.1}
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-normalBias={0.001}
                    shadow-bias={-0.0005}
                    intensity={ambientLightIntensity}
                    target-position={[0,4,0]}
                    matrixWorldNeedsUpdate = {true}
                    />





    
                    <OrbitControls
                    autoRotate={globals.autoRotate}
                    autoRotateSpeed={0.5}
                    target={[0,1,0]}
                    maxPolarAngle={1.57079632679}
                    />
  
                    <PerspectiveCamera 
                    position={isMobile?[30, 25, -30]: [15, 10, -15]} 
                    makeDefault 
                    zoom={zoomLevel}
                    fov={fov}
                    near={0.1}
                    far={100}
                    />
                  
                </motion3d.group>
                
</Suspense>

            </Canvas>

            {loaded && 
            <AnimatePresence>
              <motion.div id="pagefooter" initial={{scale: 0, opacity: 0}} animate={{scale: 1.0, opacity: 1}} transition={{duration: 0.5, type: "spring"}}> 
                <motion.div>Apartment (13.7 MB)</motion.div>
              </motion.div>
            </AnimatePresence>
            
            }

          </>
          
        </>
        )
}

const Model = forwardRef((props, ref) => {

    const apartment= useLoader(GLTFLoader, 
        './models/apartment.glb',
        (loader) =>{
          const dracoLoader = new DRACOLoader()
          dracoLoader.setDecoderPath('./draco/')
          loader.setDRACOLoader(dracoLoader)
        }
    )
    
    useEffect(()=>{
      //gltf.scene.position.x = -16.0
      apartment.scene.position.y = 0
      props.setLoaded(true)
      //updateAllMaterials(tv.scene)
      //updateAllMaterials(atari.scene)
      document.body.style.backgroundColor = '#223'
      updateAllMaterials(apartment.scene)

    }, [apartment])

    

    return (
      <motion3d.group rotation={[0,3.1415,0]} initial={{scale: 0}} animate={{scale: [0.0, 1.0], rotateY: [3.1415/2, 3.1415]}} transition={{duration: 1, delay: 2, type: "spring"}} ref={ref}>
        <ContactShadows opacity={0.5} scale={20} blur={1} far={15} resolution={512} color="#000000" />
        <primitive object={apartment.scene} rotation={[0,-3.1415/2,0]}>
        </primitive>
        <motion3d.mesh position={[0,-0.06,0]} initial={{scale: 0}} animate={{scale: [0,1]}} transition={{type: "spring", delay: 1.5}}>
          <Cylinder args={[7,7, 0.1, 128]} receiveShadow>
              <meshStandardMaterial color={'#ccc'} roughness={1} metalness={0}></meshStandardMaterial>
          </Cylinder> 
        </motion3d.mesh>
      </motion3d.group>
    





    )
})

const updateAllMaterials = (scene) =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh && child.material.isMeshStandardMaterial)
        {
            child.material.envMapIntensity = globals.envMapIntensity
            child.material.normalScale.x = globals.normalScale
            child.material.roughness = globals.roughnessMultiplier
            child.material.metalness = globals.metalnessMultiplier
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}


function lerp( a, b, alpha ) 
{
  return a + alpha * (b-a)
 }

const Light = forwardRef(function MyInput(props, ref) {

  const cameraRef = useRef()

  useHelper(globals.toggleHelpers && ref, DirectionalLightHelper, 1, 'white')
  useHelper(globals.toggleHelpers && cameraRef, CameraHelper, 1, 'white')






  return (
  <directionalLight 
  {...props} 
  ref={ref}
  >
    <orthographicCamera 
    attach="shadow-camera" 
    ref={cameraRef}
    far={25}
    top={8}
    bottom={-6}
    left={-8}
    right={5}
    
    />
  </directionalLight>)
});

 export default Canvas3d

 const handleMouseDownOnCanvas = (e, setCursor) =>{
  e.preventDefault()



  if (e.button == 0 && e.buttons != 0)
      {
        setCursor(`url('/rotate-3d.svg') 10 10, auto`)
      }
  else if (e.button == 2  && e.buttons != 0)
      {
        setCursor(`grab`)
      }
 }

const handleMouseUpOnCanvas = (e, setCursor) =>
{
  setCursor('auto')
}
