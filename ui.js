// ui.js - UI 관련 기능 담당

import { setCurrentEffect } from './effects.js';

// UI 요소
let statusTextElement;
let startBtnElement;
let switchBtnElement;
let captureBtnElement;
let effectButtonsElements;

// UI 초기화
export function initUI() {
    // DOM 요소 참조 가져오기
    statusTextElement = document.getElementById('status');
    startBtnElement = document.getElementById('startBtn');
    switchBtnElement = document.getElementById('switchBtn');
    captureBtnElement = document.getElementById('captureBtn');
    effectButtonsElements = document.querySelectorAll('.effect-button');
    
    // 효과 버튼 이벤트 리스너 설정
    initEffectButtons();
}

// 상태 메시지 설정
export function setStatusText(message) {
    if (statusTextElement) {
        statusTextElement.textContent = message;
    }
}

// 버튼 상태 업데이트
export function updateButtonStates(isRunning) {
    if (startBtnElement) {
        startBtnElement.disabled = isRunning;
    }
    if (switchBtnElement) {
        switchBtnElement.disabled = !isRunning;
    }
    if (captureBtnElement) {
        captureBtnElement.disabled = !isRunning;
    }
}

// 효과 버튼 초기화
function initEffectButtons() {
    effectButtonsElements.forEach(button => {
        button.addEventListener('click', () => {
            // 이전 활성 버튼 비활성화
            document.querySelector('.effect-button.active').classList.remove('active');
            
            // 현재 버튼 활성화
            button.classList.add('active');
            
            // 효과 업데이트
            const effect = button.dataset.effect;
            setCurrentEffect(effect);
            
            // 상태 메시지 업데이트
            setStatusText(`'${button.textContent}' 효과가 적용되었습니다.`);
        });
    });
}

// UI 설정 값 가져오기
export function getUISettings() {
    return {
        meshDensity: document.getElementById('meshDensity').value,
        meshColor: document.getElementById('meshColor').value,
        meshThickness: parseInt(document.getElementById('meshThickness').value)
    };
}
