import "./ProgressBar.css"
import {motion, progress} from 'framer-motion'
import { useRef, useState } from "react"
import { useEffect } from "react"

const ProgressBar = ({value, text}) =>{
    const progressInterval = useRef()
    const [progress, setProgress] = useState(0)

    useEffect(()=>{
            clearInterval(progressInterval.current)
            progressInterval.current = setInterval(()=>{
                //console.log(ref.current.style.width)
                setProgress((curProgress, props)=>{
                    return Math.min(lerp(curProgress, value, 0.1).toFixed(2), 100)}
                    )
            }, 10)
            return (() => clearInterval(progressInterval.current))
        
    }, [value, progress])

    return (
        <>
            <motion.div className="progressbar-container"
            animate={{opacity: 1}}
            transition={{duration: 1}}
            initial={{opacity: 0}}
            >
  
            <p className="progress-title">{text}</p>

            <motion.div className="progress-bar"
            animate={{
                '--progress-value': `${progress}%`
            }}
            
            transition={{
                duration: 0.1
            }}
            >
                <progress value="75" min="0" max="100" />
                <p>{progress}%</p>
            </motion.div>     
            </motion.div>
        </>
    )

}

export default ProgressBar


function lerp( a, b, alpha ) 
{
  return a + alpha * (b-a)
 }