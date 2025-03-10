// facemesh.js - MediaPipe FaceMesh 관련 기능 담당

import { setStatusText } from './ui.js';
import { setCanvasSize, getCanvasContext } from './camera.js';
import { drawFaceMeshEffects } from './effects.js';

// FaceMesh 관련 변수
let faceMesh;
let isInitialized = false;
let detectedFaces = [];

// FaceMesh 초기화
export async function initFaceMesh() {
    if (isInitialized) return;
    
    return new Promise((resolve, reject) => {
        try {
            faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });
            
            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            faceMesh.onResults(onResults);
            
            faceMesh.initialize().then(() => {
                setStatusText('FaceMesh가 초기화되었습니다.');
                isInitialized = true;
                resolve(true);
            });
        } catch (error) {
            console.error('FaceMesh 초기화 에러:', error);
            reject(error);
        }
    });
}

// 이미지를 FaceMesh로 보내기
export async function sendImageToFaceMesh(imageElement) {
    if (!faceMesh || !isInitialized) return;
    
    try {
        await faceMesh.send({image: imageElement});
    } catch (error) {
        console.error('FaceMesh 처리 에러:', error);
    }
}

// FaceMesh 결과 처리
function onResults(results) {
    const { canvas, ctx } = getCanvasContext();
    if (!canvas) return;
    
    // 캔버스 크기가 설정되지 않았다면 설정
    if (canvas.width === 0) {
        setCanvasSize();
    }
    
    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 비디오 프레임 그리기
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 감지된 얼굴 저장
    detectedFaces = results.multiFaceLandmarks;
    
    // 얼굴이 감지되었을 때만 처리
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        // 각 얼굴에 대해 처리
        for (const landmarks of results.multiFaceLandmarks) {
            drawFaceMeshEffects(landmarks, ctx, canvas);
        }
    }
}

// 감지된 얼굴 데이터 가져오기
export function getDetectedFaces() {
    return detectedFaces;
}
