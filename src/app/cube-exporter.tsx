"use client"

import React, { useRef, useState, useMemo, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, TransformControls } from "@react-three/drei"
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
  const [cutPosition, setCutPosition] = useState([0.5, 0.5, 0.5]) // Default to top-left corner
  const meshRef = useRef()

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
        alert("Error al exportar el modelo. Inténtalo de nuevo.")
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

        {/* Control Panel */}
        <div className="absolute top-2 right-2 bg-white/90 p-4 rounded-md shadow-sm w-72">
          <div className="space-y-4">
            {/* Cube Size Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center">
                  <Maximize className="w-4 h-4 mr-2" />
                  Tamaño del cubo
                </label>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                  {cubeSize.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[cubeSize]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(value) => setCubeSize(value[0])}
                className="w-full"
              />
            </div>

            {/* Cut Size Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center">
                  <Scissors className="w-4 h-4 mr-2" />
                  Tamaño del corte
                </label>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                  {(cutProportion * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[cutProportion]}
                min={0.1}
                max={0.5}
                step={0.05}
                onValueChange={(value) => setCutProportion(value[0])}
                className="w-full"
              />
            </div>

            {/* Preview Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mostrar área de corte</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className={showPreview ? "bg-blue-100" : ""}
              >
                {showPreview ? "Ocultar" : "Mostrar"}
              </Button>
            </div>

            {/* Reset Cut Position */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Restablecer corte</label>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCut}
                className="hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar OBJ
          </Button>
        </div>

        {/* Download Success Message */}
        {downloaded && (
          <div className="absolute bottom-16 right-4 p-3 bg-green-100 text-green-700 rounded-md animate-fade-in-out">
            ¡Cubo descargado con éxito!
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-lg">
        <h2 className="text-xl font-semibold mb-2">Instrucciones:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ajusta el <strong>tamaño del cubo</strong> con el primer control deslizante</li>
          <li>Ajusta el <strong>tamaño del corte</strong> con el segundo control deslizante</li>
          <li>Usa el ratón para rotar, mover y hacer zoom en el cubo</li>
          <li>Haz clic en el botón "Descargar OBJ" para guardar el modelo</li>
          <li>El archivo OBJ se puede abrir con Blender, Maya, 3DS Max, etc.</li>
        </ul>
      </div>
    </div>
  )
}

// Custom Cube Mesh Component with Advanced Cutting
const CutCubeMesh = React.forwardRef(({ 
  cubeSize = 1, 
  cutProportion = 1/3, 
  showPreview = true,
  cutPosition = [0.5, 0.5, 0.5] 
}, ref) => {
  // Generate custom geometry with more flexible cutting
  const geometry = useMemo(() => {
    const size = cubeSize
    const halfSize = size / 2
    const cutSize = size * cutProportion
    const [x, y, z] = cutPosition.map(pos => pos * size - halfSize)

    const geometry = new THREE.BufferGeometry()

    const vertices = new Float32Array([
      // Base vertices (8 corners)
      -halfSize, -halfSize, -halfSize,
      halfSize, -halfSize, -halfSize,
      halfSize, -halfSize, halfSize,
      -halfSize, -halfSize, halfSize,
      -halfSize, halfSize, -halfSize,
      halfSize, halfSize, -halfSize,
      halfSize, halfSize, halfSize,
      -halfSize, halfSize, halfSize,

      // Cut vertices (interpolated points)
      x, y, z,  // Cut corner point
    ])

    // More complex indexing to handle the cut
    const indices = [
      // Base faces
      0, 1, 2, 0, 2, 3,  // Bottom
      1, 5, 6, 1, 6, 2,  // Right
      3, 2, 6, 3, 6, 7,  // Front
      0, 4, 5, 0, 5, 1,  // Back
      4, 7, 6, 4, 6, 5,  // Top

      // Cut faces (depends on cut position)
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

  // Preview cube for cut area
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
