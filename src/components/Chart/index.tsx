import React, { useEffect, useRef, useState } from 'react';
import Bg from './bg';

type EcgRawData = {
  time: number;
  isLost: boolean;
  data: number[];
};

let data: number[] = [];

let index = 0;

const ECGChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stoped = false;
    let x = 0;
    let prevIndex = 0;

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let y = canvas.height / 2;
    let row = 0;
    const ratio = -0.3;

    const ctx = canvas.getContext('2d');
    // 设置画布尺寸
    const WIDTH = window.innerWidth;
    canvas.width = WIDTH - 40;
    canvas.height = 500;

    if (!ctx) {
      return;
    }
    let prevFrame = Date.now();
    function animate() {
      setTimeout(() => {
        console.log('animate 🍺');
        if (!canvas || !ctx) {
          return;
        }
        if ((window as any).rawPoints && (window as any).rawPoints.length) {
          if ((window as any).rawPoints.length > 1000) {
            (window as any).rawPoints = (window as any).rawPoints.slice(
              prevIndex,
              (window as any).rawPoints.length
            );
            index = 0;
            prevIndex = 0;
          }
          data = (window as any).rawPoints;
          console.log(
            'animate',
            `prev: ${prevIndex} cur: ${index}`,
            data.length,
            `frame duration: ${Date.now() - prevFrame}`
          );
          prevFrame = Date.now();
          // 解析数据

          // 绘制心电图曲线
          let prevX = x,
            prevY = y;
          for (let i = prevIndex; i < index; i++) {
            const value = data[i];
            x += 0.7;
            y = canvas.height / 2 - value;

            if (x > WIDTH) {
              x = 0;
              prevX = 0;
              ctx.moveTo(0, y);
              if (row === 0) {
                row = 1;
              } else {
                row = 0;
              }
            } else {
              // ctx.clearRect(0, 0, 1000, 500);
              const diff = row === 0 ? 200 : 400;
              ctx.clearRect(x, row * 250, 10, 250);
              ctx.beginPath();
              ctx.moveTo(prevX, prevY * ratio + diff);
              ctx.lineTo(x, y * ratio + diff);
              (prevX = x), (prevY = y);
              ctx.lineWidth = 3;
              ctx.stroke();
            }
            prevX = x;
            prevY = y;
          }
          ctx.strokeStyle = 'green';

          prevIndex = index;
          index = Math.min(index + 20, (window as any).rawPoints.length);
        }

        if (stoped) {
          return;
        }
        animate();
      }, 50);
    }
    animate();

    return () => {
      stoped = true;
      data = [];
      (window as any).rawPoints = [];
    };
  }, []);

  return (
    <div style={{ position: 'relative', marginTop: 0 }}>
      <canvas
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 30 }}
        ref={canvasRef}
      ></canvas>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <Bg />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          fontSize: '16px',
          background: '#ddd',
          padding: '3px 5px',
          opacity: 0.8,
        }}
      >
        增益：10.0mm/mv 时间基准25mm/s
      </div>
    </div>
  );
};

export default ECGChart;
