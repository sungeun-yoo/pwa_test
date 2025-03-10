// pwa.js - PWA 기능 관련 담당

// 서비스 워커 등록
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('서비스 워커 등록 성공:', registration.scope);
            })
            .catch(error => {
                console.log('서비스 워커 등록 실패:', error);
            });
        });
    }
}
