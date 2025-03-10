// effects.js - 시각 효과 관련 기능 담당

import { getUISettings } from './ui.js';

// 효과 관련 변수
let currentEffect = 'mesh';

// 현재 효과 설정
export function setCurrentEffect(effect) {
    currentEffect = effect;
}

// 현재 효과 가져오기
export function getCurrentEffect() {
    return currentEffect;
}

// 얼굴 메시 효과 그리기
export function drawFaceMeshEffects(landmarks, ctx, canvas) {
    // 현재 설정값 가져오기
    const { meshDensity, meshColor, meshThickness } = getUISettings();
    
    switch (currentEffect) {
        case 'mesh':
            drawMesh(landmarks, meshDensity, meshColor, meshThickness, ctx, canvas);
            break;
        case 'contour':
            drawContour(landmarks, meshColor, meshThickness, ctx, canvas);
            break;
        case 'irises':
            drawIrises(landmarks, meshColor, meshThickness, ctx, canvas);
            break;
        case 'fun':
            drawFunEffect(landmarks, ctx, canvas);
            break;
        case 'none':
            // 효과 없음 - 아무것도 그리지 않음
            break;
    }
}

// 메시 그리기 함수
function drawMesh(landmarks, density, color, thickness, ctx, canvas) {
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '20'; // 약간 투명하게
    
    // 밀도에 따라 다른 연결점 사용
    let connections;
    if (density === 'sparse') {
        connections = FACEMESH_TESSELATION.filter((_, i) => i % 5 === 0);
    } else if (density === 'medium') {
        connections = FACEMESH_TESSELATION.filter((_, i) => i % 2 === 0);
    } else {
        connections = FACEMESH_TESSELATION;
    }
    
    // 점 연결선 그리기
    drawConnectors(ctx, landmarks, connections, {
        color: color,
        lineWidth: thickness
    });
    
    // 점 그리기
    for (const landmark of landmarks) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, thickness * 0.8, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// 윤곽선 그리기 함수
function drawContour(landmarks, color, thickness, ctx, canvas) {
    ctx.lineWidth = thickness * 1.5;
    ctx.strokeStyle = color;
    
    // 얼굴 윤곽선
    drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
        color: color,
        lineWidth: thickness * 1.5
    });
    
    // 눈썹
    drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: color,
        lineWidth: thickness
    });
    drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: color,
        lineWidth: thickness
    });
    
    // 눈
    drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
        color: color,
        lineWidth: thickness
    });
    drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
        color: color,
        lineWidth: thickness
    });
    
    // 입술
    drawConnectors(ctx, landmarks, FACEMESH_LIPS, {
        color: color,
        lineWidth: thickness
    });
}

// 홍채 그리기 함수
function drawIrises(landmarks, color, thickness, ctx, canvas) {
    if (!landmarks[468] || !landmarks[473]) return;
    
    // 기본 색상
    const irisColor = '#ffffff';
    const pupilColor = '#000000';
    
    // 왼쪽 홍채
    const leftIris = landmarks[468];
    const lx = leftIris.x * canvas.width;
    const ly = leftIris.y * canvas.height;
    const lRadius = canvas.width * 0.018;
    
    // 오른쪽 홍채
    const rightIris = landmarks[473];
    const rx = rightIris.x * canvas.width;
    const ry = rightIris.y * canvas.height;
    const rRadius = canvas.width * 0.018;
    
    // 홍채 그리기
    ctx.beginPath();
    ctx.arc(lx, ly, lRadius, 0, 2 * Math.PI);
    ctx.fillStyle = irisColor;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness * 0.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(rx, ry, rRadius, 0, 2 * Math.PI);
    ctx.fillStyle = irisColor;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness * 0.5;
    ctx.stroke();
    
    // 동공 그리기
    ctx.beginPath();
    ctx.arc(lx, ly, lRadius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = pupilColor;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rx, ry, rRadius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = pupilColor;
    ctx.fill();
    
    // 하이라이트 그리기
    ctx.beginPath();
    ctx.arc(lx - lRadius * 0.2, ly - lRadius * 0.2, lRadius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rx - rRadius * 0.2, ry - rRadius * 0.2, rRadius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

// 재미 효과 그리기 함수
function drawFunEffect(landmarks, ctx, canvas) {
    if (!landmarks) return;
    
    // 얼굴 윤곽선 그리기
    drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
        color: 'rgba(255,255,255,0.8)',
        lineWidth: 3
    });
    
    // 다양한 색상의 입체적 메시
    const totalPoints = landmarks.length;
    for (let i = 0; i < totalPoints; i++) {
        const landmark = landmarks[i];
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        const z = landmark.z;
        
        // 랜덤 색상 (얼굴의 각 부분에 따라 다른 색상 사용)
        const hue = (i / totalPoints * 360 + Date.now() / 100) % 360;
        const saturation = 70 + Math.sin(Date.now() / 1000) * 30;
        const lightness = 50 + Math.sin(Date.now() / 1500) * 10;
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // z값에 따라 점 크기 조정
        const size = Math.max(1, 3 - z * 20);
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // 눈 위치 강조 효과
    if (landmarks[468] && landmarks[473]) {
        const leftEye = landmarks[468];
        const rightEye = landmarks[473];
        
        // 왼쪽 눈
        const lx = leftEye.x * canvas.width;
        const ly = leftEye.y * canvas.height;
        
        // 오른쪽 눈
        const rx = rightEye.x * canvas.width;
        const ry = rightEye.y * canvas.height;
        
        // 눈에 빛나는 효과
        const glowRadius = 20 + Math.sin(Date.now() / 500) * 5;
        
        // 왼쪽 눈 효과
        ctx.beginPath();
        const leftGradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, glowRadius);
        leftGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        leftGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = leftGradient;
        ctx.arc(lx, ly, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 오른쪽 눈 효과
        ctx.beginPath();
        const rightGradient = ctx.createRadialGradient(rx, ry, 0, rx, ry, glowRadius);
        rightGradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        rightGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = rightGradient;
        ctx.arc(rx, ry, glowRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}
