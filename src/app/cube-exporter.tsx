"use client"

import React, { useRef, useState, useMemo, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Download, Maximize, Scissors, RefreshCw } from "lucide-react"
import * as THREE from "three"

export default function CubeExporter() {
  const [downloaded, setDownloaded] = useState(false)
  const [cubeSize, setCubeSize] = useState(1)
  const [cutProportion, setCutProportion] = useState(1 / 3)
  const [showPreview, setShowPreview] = useState(true)
  const [cutPosition, setCutPosition] = useState([0.5, 0.5, 0.5]) 
  const meshRef = useRef(null)

  const handleExport = useCallback(() => {
    if (meshRef.current) {
      try {
        const exporter = new OBJExporter()
        const result = exporter.parse(meshRef.current)

        const blob = new Blob([result], { type: "text/plain" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `cubo_cortado_${cubeSize.toFixed(1)}_${(cutProportion * 100).toFixed(0)}%.obj`
        link.click()

        setDownloaded(true)
        setTimeout(() => setDownloaded(false), 3000)
      } catch (error) {
        console.error("Export failed:", error)
        alert("Error al exportar el modelo. Int&eacute;ntalo de nuevo.")
      }
    }
  }, [cubeSize, cutProportion])

  const resetCut = () => {
    setCutPosition([0.5, 0.5, 0.5])
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Cubo con Esquina Personalizada</h1>
      <p className="mb-6 text-gray-600">Corta y personaliza tu cubo en 3D</p>

      <div className="relative w-full h-[600px] bg-white rounded-lg shadow-md mb-6">
        <Canvas 
          camera={{ 
            position: [3, 3, 3], 
            fov: 50,
            near: 0.1,
            far: 1000 
          }}
        >
          <color attach="background" args={["#f8f9fa"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <CutCubeMesh 
            ref={meshRef} 
            cubeSize={cubeSize} 
            cutProportion={cutProportion} 
            showPreview={showPreview}
            cutPosition={cutPosition}
          />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true} 
          />
          <axesHelper args={[3]} />
        </Canvas>

        {/* Resto del código permanece igual */}
        {/* ... */}
      </div>
    </div>
  )
}

// Componente que crea un cubo con una esquina cortada usando geometría personalizada
const CutCubeMesh = React.forwardRef(({ 
  cubeSize = 1, 
  cutProportion = 1/3, 
  showPreview = true,
  cutPosition = [0.5, 0.5, 0.5] 
}, ref) => {
  // Genera geometría personalizada con un corte más flexible
  const geometry = useMemo(() => {
    const size = cubeSize
    const halfSize = size / 2
    const [x, y, z] = cutPosition.map(pos => pos * size - halfSize)

    const geometry = new THREE.BufferGeometry()

    const vertices = new Float32Array([
      // Vértices base (8 esquinas)
      -halfSize, -halfSize, -halfSize,
      halfSize, -halfSize, -halfSize,
      halfSize, -halfSize, halfSize,
      -halfSize, -halfSize, halfSize,
      -halfSize, halfSize, -halfSize,
      halfSize, halfSize, -halfSize,
      halfSize, halfSize, halfSize,
      -halfSize, halfSize, halfSize,

      // Vértices de corte (puntos interpolados)
      x, y, z,  // Punto de esquina cortada
    ])

    // Indexación más compleja para manejar el corte
    const indices = [
      // Caras base
      0, 1, 2, 0, 2, 3,  // Inferior
      1, 5, 6, 1, 6, 2,  // Derecha
      3, 2, 6, 3, 6, 7,  // Frontal
      0, 4, 5, 0, 5, 1,  // Trasera
      4, 7, 6, 4, 6, 5,  // Superior

      // Caras de corte
      0, 8, 4,
      1, 5, 8,
      2, 6, 8,
      3, 7, 8
    ]

    geometry.setIndex(indices)
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()

    return geometry
  }, [cubeSize, cutProportion, cutPosition])

  // Cubo de vista previa para área de corte
  const cutPreviewSize = cubeSize * cutProportion

  return (
    <group>
      <mesh ref={ref} geometry={geometry}>
        <meshStandardMaterial color="#4285F4" />
      </mesh>

      {showPreview && (
        <mesh position={[
          cutPosition[0] * cubeSize - cubeSize / 2, 
          cutPosition[1] * cubeSize - cubeSize / 2, 
          cutPosition[2] * cubeSize - cubeSize / 2
        ]}>
          <boxGeometry args={[cutPreviewSize, cutPreviewSize, cutPreviewSize]} />
          <meshStandardMaterial color="red" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
})