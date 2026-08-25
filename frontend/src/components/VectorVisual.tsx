import { useState } from 'react'

/**
 * 空间向量 · 斜二测投影 2D 可视化
 * 把 3D 向量用斜二测投影画成 2D SVG：x 水平、y 右上 45°、z 竖直
 * 滑块调整 x/y/z 分量 → 向量实时变化，分量虚线投影清晰可见
 * 纯 SVG，无 3D 库，零依赖（用户明确要求 2D 斜二测，不用 3D）
 */

// 斜二测投影：3D (x,y,z) → 2D (sx,sy)
// x 沿水平，y 沿 45° 右上（缩短 0.5），z 竖直向上
const AXIS_LEN = 90 // 轴长（SVG 单位）
const ORIGIN = { x: 130, y: 235 } // 原点位置

function project(x: number, y: number, z: number) {
  const sx = ORIGIN.x + x * 26 + y * 26 * 0.5 * 0.707
  const sy = ORIGIN.y - z * 26 - y * 26 * 0.5 * 0.707
  return { x: sx, y: sy }
}

// 四舍五入到 1 位小数
const r1 = (n: number) => Math.round(n * 10) / 10

export default function VectorVisual() {
  const [v, setV] = useState({ x: 2, y: 1, z: 2 })

  // 端点与投影点
  const end = project(v.x, v.y, v.z)
  const projXY = project(v.x, v.y, 0) // z=0 投影
  const projX = project(v.x, 0, 0)
  const projY = project(0, v.y, 0)
  const projZ = project(0, 0, v.z)

  const len = r1(Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2))

  const setter = (key: 'x' | 'y' | 'z') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV(prev => ({ ...prev, [key]: Number(e.target.value) }))

  const sliderStyle: React.CSSProperties = {
    flex: 1, accentColor: '#185FA5', cursor: 'pointer'
  }

  return (
    <div className="card" style={{ marginTop: 'var(--space-lg)', background: '#F8FBFE', border: '1px solid var(--color-border, #D3D1C7)' }}>
      <div style={{ fontSize: 'var(--text-md)', fontWeight: 500, color: '#0C447C', marginBottom: 8 }}>
        🧭 动手看看：拖动滑块调整向量分量（斜二测投影 2D 视图）
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
        {/* SVG 图 */}
        <svg viewBox="0 0 360 300" style={{ width: 340, height: 285, flexShrink: 0 }}>
          {/* 网格辅助线 */}
          {[0, 1, 2, 3].map(i => {
            const p1 = project(i, 0, 0)
            const p2 = project(i, 3, 0)
            return <line key={`gx${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#D3D1C7" strokeWidth="0.6" />
          })}
          {[0, 1, 2, 3].map(i => {
            const p1 = project(0, i, 0)
            const p2 = project(3, i, 0)
            return <line key={`gy${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#D3D1C7" strokeWidth="0.6" />
          })}

          {/* 坐标轴 */}
          <g stroke="#888780" strokeWidth="1.5">
            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x + AXIS_LEN} y2={ORIGIN.y} />
            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={project(0, 4.5, 0).x} y2={project(0, 4.5, 0).y} />
            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x} y2={ORIGIN.y - AXIS_LEN} />
          </g>
          {/* 轴标签 */}
          <g fontSize="13" fontWeight="700">
            <text x={ORIGIN.x + AXIS_LEN + 6} y={ORIGIN.y + 5} fill="#E24B4A">x</text>
            <text x={project(0, 4.9, 0).x - 4} y={project(0, 4.9, 0).y + 2} fill="#639922">y</text>
            <text x={ORIGIN.x - 14} y={ORIGIN.y - AXIS_LEN - 4} fill="#378ADD">z</text>
            <text x={ORIGIN.x - 18} y={ORIGIN.y + 16} fill="#5F5E5A">O</text>
          </g>

          {/* 分量投影虚线 */}
          <g stroke="#185FA5" strokeWidth="1" strokeDasharray="4 3" fill="none">
            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={projXY.x} y2={projXY.y} />
            <line x1={projXY.x} y1={projXY.y} x2={end.x} y2={end.y} />
            <line x1={projX.x} y1={projX.y} x2={projXY.x} y2={projXY.y} />
            <line x1={projY.x} y1={projY.y} x2={projXY.x} y2={projXY.y} />
          </g>
          {/* z 轴投影虚线 */}
          <g stroke="#378ADD" strokeWidth="1" strokeDasharray="4 3" fill="none">
            <line x1={projZ.x} y1={projZ.y} x2={end.x} y2={end.y} />
          </g>

          {/* 端点标记 */}
          <circle cx={end.x} cy={end.y} r="4.5" fill="#185FA5" />
          {/* 向量箭头 */}
          <line
            x1={ORIGIN.x} y1={ORIGIN.y} x2={end.x} y2={end.y}
            stroke="#185FA5" strokeWidth="3" markerEnd="url(#vecArrow)"
          />
          {/* 分量坐标标签 */}
          <g fontSize="12" fontWeight="500">
            <text x={projX.x - 6} y={projX.y + 16} fill="#E24B4A">({v.x},0,0)</text>
            <text x={projY.x + 10} y={projY.y - 8} fill="#639922">(0,{v.y},0)</text>
            <text x={projZ.x - 40} y={projZ.y - 6} fill="#378ADD">(0,0,{v.z})</text>
            <text x={end.x + 10} y={end.y - 10} fill="#0C447C" fontSize="14" fontWeight="700">a=({v.x},{v.y},{v.z})</text>
          </g>
          {/* 向量长度标签 */}
          <text x={end.x - 30} y={end.y + 26} fontSize="12" fill="#5F5E5A">|a| = {len}</text>

          <defs>
            <marker id="vecArrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="#185FA5" />
            </marker>
          </defs>
        </svg>

        {/* 滑块控制 */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
              <span style={{ color: '#E24B4A', fontWeight: 700 }}>x 分量（沿 x 轴）</span>
              <span style={{ fontWeight: 700, color: '#0C447C' }}>{v.x}</span>
            </div>
            <input type="range" min="-3" max="3" step="0.5" value={v.x} onChange={setter('x')} style={sliderStyle} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
              <span style={{ color: '#639922', fontWeight: 700 }}>y 分量（沿 y 轴）</span>
              <span style={{ fontWeight: 700, color: '#0C447C' }}>{v.y}</span>
            </div>
            <input type="range" min="-3" max="3" step="0.5" value={v.y} onChange={setter('y')} style={sliderStyle} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
              <span style={{ color: '#378ADD', fontWeight: 700 }}>z 分量（沿 z 轴）</span>
              <span style={{ fontWeight: 700, color: '#0C447C' }}>{v.z}</span>
            </div>
            <input type="range" min="-3" max="3" step="0.5" value={v.z} onChange={setter('z')} style={sliderStyle} />
          </div>
          <div className="analogy-box" style={{ marginTop: 4 }}>
            <div className="analogy-label">📖 怎么读这张图</div>
            <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              向量 <strong>a = ({v.x}, {v.y}, {v.z})</strong> 从原点出发，先沿 x 走 <strong>{v.x}</strong>、再沿 y 走 <strong>{v.y}</strong>、最后沿 z 走 <strong>{v.z}</strong>（虚线是它在各坐标面上的投影）。长度 <strong>|a| = {len}</strong>。试着把 x 拖成负数，看看向量怎么反向。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
