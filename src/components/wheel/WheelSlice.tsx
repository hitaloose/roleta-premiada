import { splitLabel } from '../../domain/wheelLabel';

type WheelSliceProps = {
  index: number;
  total: number;
  color: string;
  textColor: string;
  label: string;
  radius: number;
};

const DEG_TO_RAD = Math.PI / 180;

function pointOnCircle(radius: number, angleDeg: number): [number, number] {
  const angleRad = (angleDeg - 90) * DEG_TO_RAD;
  return [radius + radius * Math.cos(angleRad), radius + radius * Math.sin(angleRad)];
}

export function WheelSlice({ index, total, color, textColor, label, radius }: WheelSliceProps) {
  const sliceAngle = 360 / total;
  const startAngle = index * sliceAngle;
  const endAngle = startAngle + sliceAngle;
  const centerAngle = startAngle + sliceAngle / 2;

  const [startX, startY] = pointOnCircle(radius, startAngle);
  const [endX, endY] = pointOnCircle(radius, endAngle);
  const largeArcFlag = sliceAngle > 180 ? 1 : 0;

  const pathD = [
    `M ${radius} ${radius}`,
    `L ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    'Z',
  ].join(' ');

  // Texto radial (do centro para a borda), como em rodas de prêmio reais:
  // ao contrário de texto tangencial, o comprimento do rótulo cresce ao
  // longo do raio em vez da corda da fatia, então nunca "vaza" para a
  // fatia vizinha mesmo em rodas com poucas fatias grandes. Todos os
  // rótulos leem do centro para a borda, como numa roleta física — sem
  // desvirar os da metade esquerda, que ficariam na orientação oposta.
  const rotation = centerAngle - 90;
  const textX = radius * 0.55;

  // Rótulos longos quebram em 2 linhas. A fonte é a maior que cabe no
  // comprimento radial (do miolo até o aro) e na largura da fatia na altura
  // do texto, para não vazar para a fatia vizinha.
  const lines = splitLabel(label);
  const longest = Math.max(...lines.map((l) => l.length));
  const radialRoom = radius * 0.72;
  const chord = 2 * textX * Math.sin(Math.min(sliceAngle, 180) * DEG_TO_RAD * 0.5);
  const fontSize = Math.min(radius * 0.075, radialRoom / (longest * 0.58), chord / (lines.length * 1.25));

  return (
    <g>
      <path d={pathD} fill={color} stroke="var(--color-bg)" strokeWidth={2} />
      <g transform={`translate(${radius}, ${radius}) rotate(${rotation})`}>
        <text
          x={textX}
          y={0}
          fill={textColor}
          fontSize={fontSize}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {lines.length === 1 ? (
            lines[0]
          ) : (
            <>
              <tspan x={textX} dy="-0.55em">
                {lines[0]}
              </tspan>
              <tspan x={textX} dy="1.1em">
                {lines[1]}
              </tspan>
            </>
          )}
        </text>
      </g>
    </g>
  );
}
