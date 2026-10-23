import Image from "next/image"
import { Grid2X2, Move, MousePointer2 } from "lucide-react"
import catalogue from "@/lib/catalog/machines.json"

// Keep the illustration's names and renders tied to the real product catalogue.
const designs = [
  { id: 4, height: 204 },
  { id: 7, height: 200 },
  { id: 13, height: 211 },
  { id: 20, height: 194 },
].map(({ id, height }) => {
  const machine = catalogue.find((item) => item.MachineID === id)
  if (!machine) throw new Error(`Planner illustration product ${id} is missing`)
  return {
    id,
    name: machine.Machine,
    image: `/images/products/carousel-v1/${machine.FolderName}/mobile-300.webp`,
    height,
  }
})

/** An editorial illustration, not a second interactive planner. */
export function PlannerIllustration() {
  return (
    <figure className="pb-planner-illustration">
      <div className="pb-planner-illustration__board">
        <div className="pb-planner-illustration__header">
          <span><Grid2X2 size={17} aria-hidden="true" /> Your venue, your layout</span>
          <span className="pb-planner-illustration__badge">Layout inspiration</span>
        </div>
        <div className="pb-planner-illustration__workspace">
          <div className="pb-planner-illustration__library">
            <p>The Pro Series</p>
            <ul>
              {designs.map((design, index) => (
                <li key={design.id}>
                  <Image src={design.image} alt="" width={300} height={design.height} unoptimized />
                  <span>{design.name}</span>
                  <small aria-hidden="true">0{index + 1}</small>
                </li>
              ))}
            </ul>
          </div>
          <div className="pb-planner-illustration__canvas">
            <span className="pb-planner-illustration__canvas-label">Imagine the possibilities</span>
            <ol className="pb-planner-illustration__layout" aria-label="Example arrangement of four real mini golf designs">
              {designs.map((design, index) => (
                <li key={design.id}>
                  <div className="pb-planner-illustration__miniature">
                    <Image src={design.image} alt={`${design.name} mini golf design`} width={300} height={design.height} unoptimized />
                    {index === 0 && <MousePointer2 className="pb-planner-illustration__cursor" size={27} aria-hidden="true" />}
                  </div>
                  <span><small aria-hidden="true">0{index + 1}</small>{design.name}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="pb-planner-illustration__footer">
          <span><Move size={14} aria-hidden="true" /> Choose. Place. Make it yours.</span>
          <span>Real designs. Fresh possibilities.</span>
        </div>
      </div>
      <figcaption>Real Putt Brothers designs, arranged to inspire. Example layout, not to scale. Open the planner in our enquiry form to create your own.</figcaption>
    </figure>
  )
}
