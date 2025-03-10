// camera.js - 카메라 기능 담당

import { setStatusText, updateButtonStates } from './ui.js';
import { sendImageToFaceMesh } from './facemesh.js';

// 카메라 관련 변수
let camera;
let facingMode = 'user'; // 기본 전면 카메라
let videoElement;
let outputCanvasElement;
let outputCanvasCtx;
let videoContainer;
let isIOS = false;

// 초기화
export function initCamera() {
    videoElement = document.getElementById('input-video');
    outputCanvasElement = document.getElementById('output-canvas');
    outputCanvasCtx = outputCanvasElement.getContext('2d');
    videoContainer = document.querySelector('.video-container');
    
    // iOS 기기 감지
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 카메라 시작
export async function startCamera() {
    try {
        initCamera();
        
        // 현재 기기 방향
        const isPortrait = window.innerHeight > window.innerWidth;
        
        // iOS 특화 설정
        let constraints;
        if (isIOS) {
            // iOS는 항상 가로 방향으로 비디오를 캡처함
            constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
        } else {
            // 다른 기기는 방향에 맞게 설정
            constraints = {
                video: {
                    facingMode: facingMode,
                    width: isPortrait ? { ideal: 720 } : { ideal: 1280 },
                    height: isPortrait ? { ideal: 1280 } : { ideal: 720 }
                }
            };
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        
        // 비디오가 로드되면 캔버스 크기 설정
        videoElement.onloadedmetadata = () => {
            console.log(`비디오 크기: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
            setCanvasSize();
        };
        
        // MediaPipe 카메라 유틸리티 초기화
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await sendImageToFaceMesh(videoElement);
            },
            width: 1280,
            height: 720
        });
        
        await camera.start();
        
        // 윈도우 리사이즈 이벤트 처리
        window.addEventListener('resize', handleResize);
        // 기기 회전 이벤트 처리
        window.addEventListener('orientationchange', handleOrientationChange);
        
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

// 기기 방향 변경 처리
function handleOrientationChange() {
    setTimeout(() => {
        handleResize();
    }, 300); // 방향 변경 후 약간의 딜레이를 두고 리사이즈 처리
}

// 화면 리사이즈 처리
function handleResize() {
    if (camera && videoElement.srcObject) {
        setCanvasSize();
    }
}

// 카메라 전환
export async function switchCamera() {
    if (camera) {
        // 이벤트 리스너 제거
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
        
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
            // iOS 특화 설정
            let constraints;
            if (isIOS) {
                constraints = {
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
            } else {
                const isPortrait = window.innerHeight > window.innerWidth;
                constraints = {
                    video: {
                        facingMode: facingMode,
                        width: isPortrait ? { ideal: 720 } : { ideal: 1280 },
                        height: isPortrait ? { ideal: 1280 } : { ideal: 720 }
                    }
                };
            }
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            
            // 비디오가 로드되면 캔버스 크기 설정
            videoElement.onloadedmetadata = () => {
                setCanvasSize();
            };
            
            // 카메라 다시 시작
            await camera.start();
            
            // 이벤트 리스너 다시 추가
            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', handleOrientationChange);
            
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
    if (!videoElement || !outputCanvasElement || !videoContainer) return;
    
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    
    if (!videoWidth || !videoHeight) return;
    
    // 현재 기기 방향
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // iOS에서 비디오가 항상 가로 방향으로 캡처되는 문제 처리
    let calculatedWidth, calculatedHeight;
    
    if (isIOS && isPortrait) {
        // iOS 세로 모드: 비디오가 가로로 캡처되더라도 세로 방향으로 표시되도록 처리
        // 비디오 컨테이너의 너비
        calculatedWidth = videoContainer.clientWidth;
        
        // 비디오 비율을 고려하여 컨테이너 높이 계산 (비율 반전)
        // iOS에서는 비디오가 항상 가로 방향으로 캡처되므로 세로 모드에서는 비율을 뒤집음
        const aspectRatio = videoWidth / videoHeight;
        calculatedHeight = calculatedWidth / aspectRatio;
        
        // 비디오 컨테이너 스타일 설정
        videoContainer.style.height = `${calculatedHeight}px`;
        
        // 캔버스 회전 처리를 위한 스타일 설정
        outputCanvasElement.style.transform = 'scaleX(-1) rotate(-90deg)';
        outputCanvasElement.style.width = `${calculatedHeight}px`;
        outputCanvasElement.style.height = `${calculatedWidth}px`;
        outputCanvasElement.style.transformOrigin = 'center center';
        
        // 캔버스의 물리적 크기 설정
        outputCanvasElement.width = videoWidth;
        outputCanvasElement.height = videoHeight;
    } else {
        // iOS 가로 모드 또는 다른 기기: 일반적인 처리
        // 비디오 컨테이너의 너비
        calculatedWidth = videoContainer.clientWidth;
        
        // 비율에 맞게 높이 계산
        const aspectRatio = videoHeight / videoWidth;
        calculatedHeight = calculatedWidth * aspectRatio;
        
        // 비디오 컨테이너 스타일 설정
        videoContainer.style.height = `${calculatedHeight}px`;
        
        // 캔버스 스타일 설정
        outputCanvasElement.style.transform = 'scaleX(-1)'; // 좌우 반전만 적용
        outputCanvasElement.style.width = '100%';
        outputCanvasElement.style.height = '100%';
        
        // 캔버스의 물리적 크기 설정
        outputCanvasElement.width = videoWidth;
        outputCanvasElement.height = videoHeight;
    }
    
    console.log(`캔버스 크기 설정: ${outputCanvasElement.width}x${outputCanvasElement.height}`);
    console.log(`컨테이너 크기: ${calculatedWidth}x${calculatedHeight}`);
}

// 결과 렌더링을 위한 캔버스 컨텍스트 가져오기
export function getCanvasContext() {
    return {
        canvas: outputCanvasElement,
        ctx: outputCanvasCtx
    };
}