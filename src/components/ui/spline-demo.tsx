'use client'

import { SplineScene } from "./spline-scene";
import { Card } from "./card"
import { Spotlight } from "./spotlight"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-slate-800">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Interactive 3D
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Bring your marketing strategy to life with beautiful 3D visualizations. Create immersive experiences 
            that capture attention and enhance your strategic presentations.
          </p>
          <div className="mt-6 flex items-center space-x-4">
            <div className="px-4 py-2 bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 text-white rounded-lg text-sm font-medium">
              AI-Powered
            </div>
            <div className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
              Real-time Data
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}