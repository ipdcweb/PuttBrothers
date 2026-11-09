import Image from "next/image"

/** Use the same original planner illustration as the enquiry form. */
export function PlannerIllustration() {
  return (
    <figure className="pb-planner-illustration">
      <Image
        src="/images/layout-drag-drop.png"
        alt="Drag and drop course holes into your venue layout"
        width={1429}
        height={879}
        sizes="(max-width: 767px) 100vw, 55vw"
        className="pb-planner-illustration__original"
      />
      <figcaption>A look at the drag-and-drop planner available in our enquiry form.</figcaption>
    </figure>
  )
}
