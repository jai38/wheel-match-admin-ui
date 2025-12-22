import React, { useRef, useEffect, useImperativeHandle } from "react";

interface CarCanvasProps {
  carImage: string;
  wheelImage: string;
  x_front: number;
  y_front: number;
  x_rear: number;
  y_rear: number;
  wheelSize?: number;
}

export interface CarCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
}

const CarCanvas = React.forwardRef<CarCanvasRef, CarCanvasProps>(
  (
    {
      carImage,
      wheelImage,
      x_front,
      y_front,
      x_rear,
      y_rear,
      wheelSize = 300, // Default wheel size
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !carImage) {
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      const carImg = new Image();
      carImg.crossOrigin = "anonymous";
      
      carImg.onload = () => {
        canvas.width = carImg.width;
        canvas.height = carImg.height;
        
        // Function to draw everything
        const drawCanvas = (wheelImg?: HTMLImageElement) => {
          // Clear canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          // Draw car image
          context.drawImage(carImg, 0, 0);
          
          // Draw wheels if wheel image is loaded
          if (wheelImg) {
            // Use props coordinates directly
            // Default logic if 0/undefined is handled by parent or initial state
            const frontX = x_front;
            const frontY = y_front;
            const rearX = x_rear;
            const rearY = y_rear;

            // Draw front wheel
            context.drawImage(
              wheelImg,
              frontX - wheelSize / 2,
              frontY - wheelSize / 2,
              wheelSize,
              wheelSize,
            );

            // Draw rear wheel
            context.drawImage(
              wheelImg,
              rearX - wheelSize / 2,
              rearY - wheelSize / 2,
              wheelSize,
              wheelSize,
            );
          }
        };
        
        // Draw car image first
        drawCanvas();

        // Load and draw wheel image if provided
        if (wheelImage) {
          const wheelImg = new Image();
          wheelImg.crossOrigin = "anonymous";
          
          wheelImg.onload = () => {
            drawCanvas(wheelImg);
          };
          
          wheelImg.src = wheelImage;
        }
      };
      
      carImg.src = carImage;
    }, [carImage, wheelImage, x_front, y_front, x_rear, y_rear, wheelSize]);
    
    return <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />;
  },
);

CarCanvas.displayName = "CarCanvas";
export default CarCanvas;
