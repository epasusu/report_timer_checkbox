// Элементы DOM
const timeDisplay = document.getElementById('timeDisplay');
const phaseLabel = document.getElementById('phaseLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const nextBtn = document.getElementById('nextBtn');
const statusEl = document.getElementById('status');

// Поля ввода времени
const presentationTimeInput = document.getElementById('presentationTime');
const questionsTimeInput = document.getElementById('questionsTime');
const discussionTimeInput = document.getElementById('discussionTime');

// Чекбокс включения фазы обсуждения
const includeDiscussionCheckbox = document.getElementById('includeDiscussion');

// Состояние таймера
let timer = null;
let isRunning = false;
let isPaused = false;
let currentPhase = 0;
let timeLeft = 0;
let includeDiscussion = true;

// Цвета и названия фаз
let phases = [
    { name: 'Доклад', className: 'presentation' },
    { name: 'Ответы на вопросы', className: 'questions' },
    { name: 'Обсуждение', className: 'discussion' }
];

// Флаг для предотвращения множественных кликов
let isProcessingClick = false;

// Обновление списка фаз в зависимости от настроек
function updatePhases() {
    if (includeDiscussion) {
        phases = [
            { name: 'Доклад', className: 'presentation' },
            { name: 'Ответы на вопросы', className: 'questions' },
            { name: 'Обсуждение', className: 'discussion' }
        ];
    } else {
        phases = [
            { name: 'Доклад', className: 'presentation' },
            { name: 'Ответы на вопросы', className: 'questions' }
        ];
    }
}

// Обновление состояния поля ввода времени обсуждения
function updateDiscussionInput() {
    discussionTimeInput.disabled = !includeDiscussion;
}

// Инициализация
function init() {
    includeDiscussion = includeDiscussionCheckbox.checked;
    updatePhases();
    updateDiscussionInput();
    resetTimer();
    updateDisplay();
}

// Сброс таймера
function resetTimer() {
    // Останавливаем таймер
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // Сбрасываем состояние
    isRunning = false;
    isPaused = false;
    currentPhase = 0;
    isProcessingClick = false;
    
    // Устанавливаем начальное время для первой фазы
    const presentationMinutes = parseInt(presentationTimeInput.value) || 5;
    timeLeft = presentationMinutes * 60;
    
    updatePhases();
    updateDisplay();
    updateButtons();
    statusEl.textContent = 'Таймер сброшен и остановлен';
}

// Запуск таймера
function startTimer() {
    if (isProcessingClick) return;
    isProcessingClick = true;
    
    if (isRunning && !isPaused) {
        isProcessingClick = false;
        return;
    }
    
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        statusEl.textContent = `Таймер запущен: ${phases[currentPhase].name}`;
    } else if (isPaused) {
        isPaused = false;
        statusEl.textContent = `Таймер возобновлен: ${phases[currentPhase].name}`;
    }
    
    updateButtons();
    
    // Очищаем предыдущий таймер, если он существует
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // Запускаем новый таймер
    timer = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timer = null;
            timeLeft = 0;
            
            // Проверяем, есть ли следующая фаза
            if (currentPhase < phases.length - 1) {
                currentPhase++;
                setupNextPhase();
                updateDisplay();
                updateButtons();
                
                // Автоматический запуск следующей фазы
                isRunning = true;
                isPaused = false;
                statusEl.textContent = `Автоматический переход: ${phases[currentPhase].name}`;
                
                // Запускаем таймер для следующей фазы
                setTimeout(() => {
                    startTimer();
                }, 100);
            } else {
                // Все фазы завершены
                isRunning = false;
                statusEl.textContent = includeDiscussion ? 
                    'Все этапы завершены!' : 
                    'Доклад и ответы на вопросы завершены!';
                updateButtons();
                playBeep();
            }
            
            updateDisplay();
            return;
        }
        
        updateDisplay();
    }, 1000);
    
    setTimeout(() => {
        isProcessingClick = false;
    }, 300);
}

// Пауза таймера
function pauseTimer() {
    if (isProcessingClick || !isRunning || isPaused) return;
    isProcessingClick = true;
    
    isPaused = true;
    isRunning = false;
    
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    statusEl.textContent = 'Таймер на паузе';
    updateButtons();
    
    setTimeout(() => {
        isProcessingClick = false;
    }, 300);
}

// Переход к следующей фазе
function nextPhase() {
    if (isProcessingClick || currentPhase >= phases.length - 1) {
        isProcessingClick = false;
        return;
    }
    
    isProcessingClick = true;
    
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    isRunning = false;
    isPaused = false;
    
    currentPhase++;
    setupNextPhase();
    
    statusEl.textContent = `Переход к фазе: ${phases[currentPhase].name}. Для запуска нажмите "Старт"`;
    updateDisplay();
    updateButtons();
    
    setTimeout(() => {
        isProcessingClick = false;
    }, 300);
}

// Настройка следующей фазы
function setupNextPhase() {
    let minutes = 0;
    
    switch(currentPhase) {
        case 0: // Доклад
            minutes = parseInt(presentationTimeInput.value) || 5;
            break;
        case 1: // Ответы на вопросы
            minutes = parseInt(questionsTimeInput.value) || 7;
            break;
        case 2: // Обсуждение (если включено)
            minutes = parseInt(discussionTimeInput.value) || 3;
            break;
    }
    
    timeLeft = minutes * 60;
}

// Обновление отображения
function updateDisplay() {
    // Форматирование времени MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Обновление названия фазы и цвета
    phaseLabel.textContent = phases[currentPhase].name;
    
    // Удаляем все классы цветов
    timeDisplay.classList.remove('presentation', 'questions', 'discussion');
    phaseLabel.classList.remove('presentation', 'questions', 'discussion');
    
    // Добавляем текущий класс цвета
    timeDisplay.classList.add(phases[currentPhase].className);
    phaseLabel.classList.add(phases[currentPhase].className);
}

// Обновление состояния кнопок
function updateButtons() {
    startBtn.disabled = isRunning && !isPaused;
    pauseBtn.disabled = !isRunning || isPaused;
    stopBtn.disabled = false;
    
    // Кнопка "Далее" неактивна на последней фазе
    nextBtn.disabled = currentPhase >= phases.length - 1;
    
    // Меняем текст кнопки Старт
    startBtn.textContent = isPaused ? 'Продолжить' : 'Старт';
    
    // Если таймер не запущен, кнопка пауза должна быть "Пауза"
    if (!isRunning) {
        pauseBtn.textContent = 'Пауза';
    }
}

// Воспроизведение звукового сигнала
function playBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    } catch (e) {
        console.log("Звук не поддерживается");
    }
}

// Обработчики событий
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', resetTimer);
nextBtn.addEventListener('click', nextPhase);

// Обработчик чекбокса включения/выключения фазы обсуждения
includeDiscussionCheckbox.addEventListener('change', function() {
    includeDiscussion = this.checked;
    updatePhases();
    updateDiscussionInput();
    
    // Если таймер не запущен, сбрасываем его
    if (!isRunning) {
        resetTimer();
    }
});

// Обновление таймера при изменении настроек (только если таймер не запущен)
function updateTimeFromInputs() {
    if (!isRunning) {
        let minutes = 0;
        switch(currentPhase) {
            case 0:
                minutes = parseInt(presentationTimeInput.value) || 5;
                break;
            case 1:
                minutes = parseInt(questionsTimeInput.value) || 7;
                break;
            case 2:
                minutes = parseInt(discussionTimeInput.value) || 3;
                break;
        }
        timeLeft = minutes * 60;
        updateDisplay();
    }
}

presentationTimeInput.addEventListener('change', updateTimeFromInputs);
presentationTimeInput.addEventListener('input', updateTimeFromInputs);

questionsTimeInput.addEventListener('change', updateTimeFromInputs);
questionsTimeInput.addEventListener('input', updateTimeFromInputs);

discussionTimeInput.addEventListener('change', updateTimeFromInputs);
discussionTimeInput.addEventListener('input', updateTimeFromInputs);

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', init);

// Предотвращение ввода недопустимых значений
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
        let value = parseInt(input.value);
        if (isNaN(value) || value < 1) input.value = 1;
        if (value > 60) input.value = 60;
        updateTimeFromInputs();
    });
    
    input.addEventListener('blur', () => {
        if (input.value === '') input.value = input.defaultValue;
        updateTimeFromInputs();
    });
});

// Оптимизация для изменения размеров окна
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateDisplay();
    }, 100);
});