import { WheelOfNames } from '@/components/wheel-of-names'

export default function Home() {
  return (
    <div className="w-full h-full flex items-center justify-start flex-col bg-sidebar">
      <WheelOfNames />
    </div>
  )
}
