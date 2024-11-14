'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Shuffle, ArrowDownUp, Trash2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import confetti from 'canvas-confetti'

export function WheelOfNames() {
  const [names, setNames] = useState([
    'Ny',
    'TA',
    'LLA',
    'VAN HAO',
    'TAN TAN',
    'Rosé',
  ])
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [newName, setNewName] = useState('')
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = ['#49225B', '#6E3482', '#A56ABD', '#6E473B']

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)

    const sliceAngle = (2 * Math.PI) / names.length

    names.forEach((name, index) => {
      const startAngle = index * sliceAngle
      const endAngle = startAngle + sliceAngle

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = colors[index % colors.length]
      ctx.fill()

      // Draw text
      ctx.save()
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText(name, radius - 20, 6)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(0, 0, 20, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.restore()
  }

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    const spins = 5
    const baseRotation = rotation
    const targetRotation = baseRotation + spins * 360 + Math.random() * 360
    const duration = 5000
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
      const currentRotation =
        baseRotation + (targetRotation - baseRotation) * easeOut(progress)

      setRotation(currentRotation)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        const selectedIndex = Math.floor(
          ((currentRotation % 360) / 360) * names.length
        )
        const selected = names[names.length - 1 - selectedIndex]
        setSelectedName(selected)
        setShowModal(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }

    requestAnimationFrame(animate)
  }

  const addName = () => {
    if (newName.trim()) {
      setNames([...names, newName.trim()])
      setNewName('')
    }
  }

  const shuffleNames = () => {
    setNames([...names].sort(() => Math.random() - 0.5))
  }

  const sortNames = () => {
    setNames([...names].sort())
  }

  const removeName = (indexToRemove: number) => {
    setNames(names.filter((_, index) => index !== indexToRemove))
  }

  useEffect(() => {
    drawWheel()
  }, [rotation, names])

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-2xl mx-auto ">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="cursor-pointer"
          onClick={spinWheel}
        />
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none',
            'bg-white rounded-full w-16 h-16 flex items-center justify-center text-sm font-medium'
          )}
        >
          {isSpinning ? 'Spinning...' : 'Spin!'}
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1/2">
          <ArrowRight
            className={cn('h-10 w-14 text-foreground', {
              'scale-150': isSpinning,
            })}
          />
        </div>
      </div>

      <div className="flex gap-2 w-full max-w-md">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add new name"
          onKeyDown={(e) => e.key === 'Enter' && addName()}
        />
        <Button onClick={addName} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={shuffleNames} size="icon" variant="outline">
          <Shuffle className="h-4 w-4" />
        </Button>
        <Button onClick={sortNames} size="icon" variant="outline">
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full max-w-md space-y-1">
        {names.map((name, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span>{name}</span>
            </div>
            <Button
              onClick={() => removeName(index)}
              size="icon"
              variant="ghost"
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove {name}</span>
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>The wheel has chosen:</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <span className="text-4xl font-bold">{selectedName}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
