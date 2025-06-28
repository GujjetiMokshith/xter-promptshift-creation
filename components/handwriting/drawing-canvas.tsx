"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Pen, 
  Eraser, 
  Grid3X3, 
  Minus, 
  RotateCcw, 
  Download, 
  Upload,
  Palette,
  Settings,
  Hand,
  Square,
  Circle,
  Triangle,
  AlignLeft,
  Grid,
  Ruler,
  Eye,
  EyeOff
} from 'lucide-react'

interface Point {
  x: number
  y: number
  pressure?: number
}

interface Stroke {
  points: Point[]
  color: string
  thickness: number
  opacity: number
  tipStyle: 'round' | 'square' | 'calligraphy'
  tool: 'pen' | 'pencil'
}

interface CanvasSettings {
  showGrid: boolean
  showRuler: boolean
  showMargins: boolean
  gridSpacing: number
  marginSize: number
  backgroundColor: string
}

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  
  // Tool states
  const [activeTool, setActiveTool] = useState<'pen' | 'pencil' | 'eraser'>('pen')
  const [penColor, setPenColor] = useState('#000000')
  const [penThickness, setPenThickness] = useState(3)
  const [penOpacity, setPenOpacity] = useState(100)
  const [tipStyle, setTipStyle] = useState<'round' | 'square' | 'calligraphy'>('round')
  
  // Eraser states
  const [eraserSize, setEraserSize] = useState(20)
  const [eraserMode, setEraserMode] = useState<'precision' | 'area' | 'stroke'>('precision')
  
  // Canvas settings
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    showGrid: false,
    showRuler: false,
    showMargins: false,
    gridSpacing: 20,
    marginSize: 50,
    backgroundColor: '#ffffff'
  })
  
  // Advanced settings
  const [pressureSensitivity, setPressureSensitivity] = useState(50)
  const [smoothingLevel, setSmoothingLevel] = useState(30)
  const [writingAngle, setWritingAngle] = useState(0)
  const [palmRejection, setPalmRejection] = useState(true)
  
  // Preset colors
  const presetColors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#800000'
  ]

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear canvas
    ctx.fillStyle = canvasSettings.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    if (canvasSettings.showGrid) {
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 0.5
      ctx.setLineDash([])
      
      for (let x = 0; x <= canvas.width; x += canvasSettings.gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      for (let y = 0; y <= canvas.height; y += canvasSettings.gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }
    
    // Draw ruler lines
    if (canvasSettings.showRuler) {
      ctx.strokeStyle = '#d0d0d0'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      
      // Horizontal lines every 30px
      for (let y = 30; y < canvas.height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }
    
    // Draw margins
    if (canvasSettings.showMargins) {
      ctx.strokeStyle = '#ff9999'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.strokeRect(canvasSettings.marginSize, canvasSettings.marginSize, 
                    canvas.width - 2 * canvasSettings.marginSize, 
                    canvas.height - 2 * canvasSettings.marginSize)
    }
  }, [canvasSettings])

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return
    
    ctx.globalAlpha = stroke.opacity / 100
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.thickness
    ctx.lineCap = stroke.tipStyle === 'square' ? 'square' : 'round'
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    
    if (stroke.tipStyle === 'calligraphy') {
      // Calligraphy effect with variable width
      for (let i = 1; i < stroke.points.length; i++) {
        const prevPoint = stroke.points[i - 1]
        const currentPoint = stroke.points[i]
        
        ctx.beginPath()
        ctx.moveTo(prevPoint.x, prevPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        
        // Vary thickness based on direction
        const dx = currentPoint.x - prevPoint.x
        const dy = currentPoint.y - prevPoint.y
        const angle = Math.atan2(dy, dx)
        const thickness = stroke.thickness * (0.5 + 0.5 * Math.abs(Math.sin(angle + writingAngle * Math.PI / 180)))
        ctx.lineWidth = thickness
        ctx.stroke()
      }
    } else {
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      
      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i]
        ctx.lineTo(point.x, point.y)
      }
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }, [writingAngle])

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    drawBackground(ctx, canvas)
    
    // Draw all strokes
    strokes.forEach(stroke => drawStroke(ctx, stroke))
    
    // Draw current stroke
    if (currentStroke.length > 1) {
      const stroke: Stroke = {
        points: currentStroke,
        color: penColor,
        thickness: penThickness,
        opacity: penOpacity,
        tipStyle,
        tool: activeTool === 'pen' ? 'pen' : 'pencil'
      }
      drawStroke(ctx, stroke)
    }
  }, [strokes, currentStroke, penColor, penThickness, penOpacity, tipStyle, activeTool, drawBackground, drawStroke])

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  const getEventPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number
    
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 }
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      pressure: 0.5 + (pressureSensitivity / 100) * 0.5
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === 'eraser') return
    
    setIsDrawing(true)
    const point = getEventPoint(e)
    setCurrentStroke([point])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'eraser') return
    
    const point = getEventPoint(e)
    setCurrentStroke(prev => [...prev, point])
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    if (currentStroke.length > 1) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: penColor,
        thickness: penThickness,
        opacity: penOpacity,
        tipStyle,
        tool: activeTool === 'pen' ? 'pen' : 'pencil'
      }
      setStrokes(prev => [...prev, newStroke])
    }
    setCurrentStroke([])
  }

  const handleErase = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'eraser') return
    
    const point = getEventPoint(e)
    
    if (eraserMode === 'stroke') {
      // Remove entire strokes that intersect with eraser
      setStrokes(prev => prev.filter(stroke => {
        return !stroke.points.some(p => 
          Math.sqrt((p.x - point.x) ** 2 + (p.y - point.y) ** 2) < eraserSize / 2
        )
      }))
    } else {
      // Remove parts of strokes (simplified implementation)
      setStrokes(prev => prev.filter(stroke => {
        return !stroke.points.some(p => 
          Math.sqrt((p.x - point.x) ** 2 + (p.y - point.y) ** 2) < eraserSize / 2
        )
      }))
    }
  }

  const clearCanvas = () => {
    setStrokes([])
    setCurrentStroke([])
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'drawing.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Horizontal Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Tool Selection */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === 'pen' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('pen')}
                    className="flex items-center gap-2"
                  >
                    <Pen className="h-4 w-4" />
                    Pen
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pen tool for smooth writing</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === 'pencil' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('pencil')}
                    className="flex items-center gap-2"
                  >
                    <Pen className="h-4 w-4" />
                    Pencil
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pencil tool for sketching</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === 'eraser' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('eraser')}
                    className="flex items-center gap-2"
                  >
                    <Eraser className="h-4 w-4" />
                    Eraser
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eraser tool</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Quick Settings */}
          <div className="flex items-center gap-4">
            {/* Thickness */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Size:</Label>
              <div className="w-20">
                <Slider
                  value={activeTool === 'eraser' ? [eraserSize] : [penThickness]}
                  onValueChange={(value) => {
                    if (activeTool === 'eraser') {
                      setEraserSize(value[0])
                    } else {
                      setPenThickness(value[0])
                    }
                  }}
                  max={activeTool === 'eraser' ? 50 : 10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-500 w-8">
                {activeTool === 'eraser' ? eraserSize : penThickness}px
              </span>
            </div>

            {/* Color Picker */}
            {activeTool !== 'eraser' && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Color:</Label>
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <div className="flex gap-1">
                  {presetColors.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={clearCanvas}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear canvas</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={downloadCanvas}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download drawing</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Vertical Settings Panel */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Pen/Pencil Settings */}
            {activeTool !== 'eraser' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Pen className="h-4 w-4" />
                  {activeTool === 'pen' ? 'Pen' : 'Pencil'} Settings
                </h3>
                
                {/* Opacity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Opacity: {penOpacity}%</Label>
                  <Slider
                    value={[penOpacity]}
                    onValueChange={(value) => setPenOpacity(value[0])}
                    max={100}
                    min={10}
                    step={5}
                  />
                </div>

                {/* Tip Style */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tip Style</Label>
                  <Select value={tipStyle} onValueChange={(value: any) => setTipStyle(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">
                        <div className="flex items-center gap-2">
                          <Circle className="h-4 w-4" />
                          Round
                        </div>
                      </SelectItem>
                      <SelectItem value="square">
                        <div className="flex items-center gap-2">
                          <Square className="h-4 w-4" />
                          Square
                        </div>
                      </SelectItem>
                      <SelectItem value="calligraphy">
                        <div className="flex items-center gap-2">
                          <Triangle className="h-4 w-4" />
                          Calligraphy
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Presets */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Color Presets</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setPenColor(color)}
                        className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                          penColor === color ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Eraser Settings */}
            {activeTool === 'eraser' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Eraser className="h-4 w-4" />
                  Eraser Settings
                </h3>
                
                {/* Eraser Mode */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Eraser Mode</Label>
                  <Select value={eraserMode} onValueChange={(value: any) => setEraserMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="precision">Precision Erase</SelectItem>
                      <SelectItem value="area">Area Erase</SelectItem>
                      <SelectItem value="stroke">Entire Stroke</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Writing Guides */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Writing Guides
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Grid Lines</Label>
                  <Switch
                    checked={canvasSettings.showGrid}
                    onCheckedChange={(checked) => 
                      setCanvasSettings(prev => ({ ...prev, showGrid: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Ruled Lines</Label>
                  <Switch
                    checked={canvasSettings.showRuler}
                    onCheckedChange={(checked) => 
                      setCanvasSettings(prev => ({ ...prev, showRuler: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Margins</Label>
                  <Switch
                    checked={canvasSettings.showMargins}
                    onCheckedChange={(checked) => 
                      setCanvasSettings(prev => ({ ...prev, showMargins: checked }))
                    }
                  />
                </div>

                {canvasSettings.showGrid && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Grid Spacing: {canvasSettings.gridSpacing}px</Label>
                    <Slider
                      value={[canvasSettings.gridSpacing]}
                      onValueChange={(value) => 
                        setCanvasSettings(prev => ({ ...prev, gridSpacing: value[0] }))
                      }
                      max={50}
                      min={10}
                      step={5}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pressure Sensitivity: {pressureSensitivity}%</Label>
                  <Slider
                    value={[pressureSensitivity]}
                    onValueChange={(value) => setPressureSensitivity(value[0])}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Smoothing: {smoothingLevel}%</Label>
                  <Slider
                    value={[smoothingLevel]}
                    onValueChange={(value) => setSmoothingLevel(value[0])}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Writing Angle: {writingAngle}°</Label>
                  <Slider
                    value={[writingAngle]}
                    onValueChange={(value) => setWritingAngle(value[0])}
                    max={90}
                    min={-90}
                    step={5}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Palm Rejection</Label>
                  <Switch
                    checked={palmRejection}
                    onCheckedChange={setPalmRejection}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 inline-block">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onClick={activeTool === 'eraser' ? handleErase : undefined}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}