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

  return (
    <g>
      <path d={pathD} fill={color} stroke="var(--color-bg)" strokeWidth={2} />
      <g transform={`translate(${radius}, ${radius}) rotate(${rotation})`}>
        <text
          x={textX}
          y={0}
          fill={textColor}
          fontSize={radius * 0.075}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      </g>
    </g>
  );
}
