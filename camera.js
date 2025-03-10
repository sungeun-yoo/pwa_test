// camera.js - 카메라 기능 담당

import { setStatusText, updateButtonStates } from './ui.js';
import { sendImageToFaceMesh } from './facemesh.js';

// 카메라 관련 변수
let camera;
let facingMode = 'user'; // 기본 전면 카메라
let videoElement;
let outputCanvasElement;
let outputCanvasCtx;

// 초기화
export function initCamera() {
    videoElement = document.getElementById('input-video');
    outputCanvasElement = document.getElementById('output-canvas');
    outputCanvasCtx = outputCanvasElement.getContext('2d');
}

// 카메라 시작
export async function startCamera() {
    try {
        initCamera();
        
        // 카메라 접근 요청
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        
        // MediaPipe 카메라 유틸리티 초기화
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await sendImageToFaceMesh(videoElement);
            },
            width: 1280,
            height: 720
        });
        
        await camera.start();
        
        // 버튼 상태 업데이트
        updateButtonStates(true);
        
        // 상태 메시지 업데이트
        setStatusText('카메라가 활성화되었습니다. 얼굴을 화면 중앙에 위치시키세요.');
        
        return true;
    } catch (error) {
        console.error('카메라 접근 에러:', error);
        setStatusText('카메라 접근에 실패했습니다: ' + error.message);
        return false;
    }
}

// 카메라 전환
export async function switchCamera() {
    if (camera) {
        // 카메라 중지
        await camera.stop();
        
        // 현재 스트림 중지
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => {
                track.stop();
            });
        }
        
        // 카메라 방향 전환
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        
        try {
            // 새 스트림 가져오기
            const constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            
            // 카메라 다시 시작
            await camera.start();
            
            // 상태 메시지 업데이트
            setStatusText('카메라가 전환되었습니다.');
            
        } catch (error) {
            console.error('카메라 전환 에러:', error);
            setStatusText('카메라 전환에 실패했습니다: ' + error.message);
        }
    }
}

// 사진 찍기
export function capturePhoto() {
    // 임시 캔버스 생성하여 현재 화면 캡처
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = outputCanvasElement.width;
    captureCanvas.height = outputCanvasElement.height;
    const captureCtx = captureCanvas.getContext('2d');
    
    // 현재 화면 복사
    captureCtx.drawImage(outputCanvasElement, 0, 0);
    
    // 이미지 데이터 URL 생성
    const imageDataURL = captureCanvas.toDataURL('image/png');
    
    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = 'face-mesh-' + new Date().toISOString().replace(/:/g, '-') + '.png';
    link.click();
    
    // 상태 메시지 업데이트
    setStatusText('사진이 저장되었습니다.');
}

// 캔버스 크기 설정
export function setCanvasSize() {
    const width = videoElement.videoWidth || 640;
    const height = videoElement.videoHeight || 480;
    
    // 디스플레이 크기 설정
    outputCanvasElement.style.width = '100%';
    outputCanvasElement.style.height = 'auto';
    
    // 실제 캔버스 해상도 설정 (고해상도)
    outputCanvasElement.width = width;
    outputCanvasElement.height = height;
    
    // 고해상도 렌더링을 위한 스케일 조정
    outputCanvasCtx.scale(1, 1);
}

// 결과 렌더링을 위한 캔버스 컨텍스트 가져오기
export function getCanvasContext() {
    return {
        canvas: outputCanvasElement,
        ctx: outputCanvasCtx
    };
}
