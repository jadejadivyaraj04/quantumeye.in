/**
 * The mark: an aperture.
 *
 * "DJ" in a black rounded square said nothing the name beside it did not
 * already say, and every second portfolio has one. The domain is
 * quantumeye.in, so the mark is an eye - but drawn as a camera iris rather
 * than the outline-of-an-eyeball that ships with every icon set. It suits a
 * site about mobile work, it is geometric enough to sit beside the mono
 * labels, and it has somewhere to go on hover: the blades rotate and the
 * opening stops down, the way a real aperture closes.
 *
 * Six blades, computed rather than hand-plotted, so the geometry can be
 * retuned by changing a radius.
 */

const CENTRE = 12;
const RING = 10.4;
const OPENING = 4.9;
/** How far each blade leans off its vertex. Shallower than this and the
 *  blades read as loose spokes rather than an iris. */
const SWEEP = 46;

const point = (angle: number, radius: number) => {
  const rad = (angle * Math.PI) / 180;
  return [
    +(CENTRE + radius * Math.cos(rad)).toFixed(2),
    +(CENTRE + radius * Math.sin(rad)).toFixed(2),
  ] as const;
};

const ANGLES = [-90, -30, 30, 90, 150, 210];

const opening = ANGLES.map((a) => point(a, OPENING).join(",")).join(" ");

const blades = ANGLES.map((a) => {
  const [x1, y1] = point(a, OPENING);
  const [x2, y2] = point(a + SWEEP, RING);
  return { x1, y1, x2, y2 };
});

export default function Logo({
  className = "h-7 w-7",
  onDark = false,
}: {
  className?: string;
  /** Inside the condensed pill the ground is near-black, where oxblood on
   *  near-black is barely a mark at all. */
  onDark?: boolean;
}) {
  const blade = onDark ? "var(--color-ground)" : "var(--color-accent)";
  const iris = onDark ? "var(--color-ground)" : "var(--color-accent)";

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={RING}
        fill="none"
        stroke="currentColor"
        strokeOpacity={onDark ? 0.3 : 0.18}
        strokeWidth={1}
      />

      {/* The blades rotate as a group; transform-box keeps the origin on the
          mark rather than on the SVG user space. */}
      <g
        className="origin-center transition-transform duration-500 ease-out group-hover:rotate-[30deg] motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        {blades.map((b, i) => (
          <line
            key={i}
            x1={b.x1}
            y1={b.y1}
            x2={b.x2}
            y2={b.y2}
            stroke={blade}
            strokeOpacity={onDark ? 0.5 : 0.62}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ))}
      </g>

      <polygon
        points={opening}
        fill={iris}
        className="origin-center transition-transform duration-500 ease-out group-hover:scale-[0.72] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    </svg>
  );
}
