// main.js - 앱의 진입점과 초기화 담당

// 모듈 로드
import { initUI, setStatusText } from './ui.js';
import { startCamera, switchCamera, capturePhoto } from './camera.js';
import { initFaceMesh } from './facemesh.js';
import { registerServiceWorker } from './pwa.js';

// 앱 초기화
function initApp() {
    // UI 초기화
    initUI();
    
    // 서비스 워커 등록
    registerServiceWorker();
    
    // 상태 메시지 초기화
    setStatusText('카메라를 시작하려면 버튼을 클릭하세요.');
    
    // 이벤트 리스너 추가
    document.getElementById('startBtn').addEventListener('click', async () => {
        try {
            // FaceMesh 초기화
            await initFaceMesh();
            
            // 카메라 시작
            await startCamera();
            
        } catch (error) {
            console.error('카메라 접근 에러:', error);
            setStatusText('카메라 접근에 실패했습니다: ' + error.message);
        }
    });
    
    document.getElementById('switchBtn').addEventListener('click', switchCamera);
    document.getElementById('captureBtn').addEventListener('click', capturePhoto);
}

// 페이지 로드 시 앱 초기화
window.addEventListener('DOMContentLoaded', initApp);
