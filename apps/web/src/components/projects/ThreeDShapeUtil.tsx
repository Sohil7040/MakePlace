import React, { Suspense } from 'react';
import { HTMLContainer, ShapeUtil, TLBaseShape, Rectangle2d } from 'tldraw';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import { useLoader } from '@react-three/fiber';

export type IThreeDShape = TLBaseShape<'threeD', { w: number; h: number; url: string; filename: string }>;

function Model({ url }: { url: string }) {
    // Currently only supporting STL as requested, but structured to allow others later.
    const geom = useLoader(STLLoader, url);
    return (
        <mesh>
            <primitive object={geom} attach="geometry" />
            <meshStandardMaterial color="#ff5a36" />
        </mesh>
    );
}

export class ThreeDShapeUtil extends ShapeUtil<IThreeDShape> {
    static type = 'threeD' as const;

    getDefaultProps(): IThreeDShape['props'] {
        return {
            w: 400,
            h: 400,
            url: '',
            filename: '3D Model',
        };
    }

    getGeometry(shape: IThreeDShape) {
        return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
    }

    component(shape: IThreeDShape) {
        return (
            <HTMLContainer
                id={shape.id}
                style={{ 
                    pointerEvents: 'all', 
                    width: shape.props.w, 
                    height: shape.props.h,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
            >
                <div style={{ padding: '8px 12px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: 500, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{shape.props.filename}</span>
                    <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#f3f4f6', borderRadius: '4px', color: '#6b7280' }}>Interactive 3D</span>
                </div>
                <div style={{ flex: 1, position: 'relative' }} onPointerDown={(e) => e.stopPropagation()}>
                    {shape.props.url ? (
                        <Canvas camera={{ position: [0, 0, 100], fov: 50 }}>
                            <ambientLight intensity={0.5} />
                            <directionalLight position={[10, 10, 10]} intensity={1} />
                            <pointLight position={[-10, -10, -10]} intensity={0.5} />
                            <Suspense fallback={null}>
                                <Model url={shape.props.url} />
                            </Suspense>
                            <OrbitControls makeDefault />
                        </Canvas>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '14px' }}>
                            No 3D Model URL provided
                        </div>
                    )}
                </div>
            </HTMLContainer>
        );
    }

    indicator(shape: IThreeDShape) {
        return <rect width={shape.props.w} height={shape.props.h} />;
    }
}
