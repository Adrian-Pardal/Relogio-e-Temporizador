document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais ---
    const CLOCK_INTERVAL_MS = 1000;
    let timerInterval = null;
    let totalSeconds = 0; 
    let timeRemaining = 0;

    // --- Mapeamentos ---
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const transitionDurationMs = 300; 

    // --- Seletores de Elementos do Modal ---
    const configTimerBtn = document.getElementById('config-timer');
    const timerModal = document.getElementById('timer-modal');
    const saveTimerBtn = document.getElementById('save-timer');
    const closeModalBtn = document.getElementById('close-modal');
    const configHoursInput = document.getElementById('config-hours');
    const configMinInput = document.getElementById('config-minutes');
    const configSecInput = document.getElementById('config-seconds');

    // --- Outros Seletores de Elementos (Relógio/Timer) ---
    const clockView = document.getElementById('clock-view');
    const timerView = document.getElementById('timer-view');
    const showClockBtn = document.getElementById('show-clock');
    const showTimerBtn = document.getElementById('show-timer');
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    
    // Seletores para as Horas do Timer
    const timerHourTens = document.getElementById('timer-hour-tens');
    const timerHourUnits = document.getElementById('timer-hour-units');

    // --- FUNÇÃO DE LIMITE DE INPUT (2 DÍGITOS E VALOR MÁXIMO) ---
    function limitInput(e) {
        let input = e.target;
        let value = input.value;
        const max = parseInt(input.getAttribute('max'));

        // 1. Limita a 2 dígitos (imediato)
        if (value.length > 2) {
            value = value.slice(0, 2);
            input.value = value;
        }
        
        // 2. Garante que o valor não exceda o máximo (para Minutos/Segundos)
        // Isso é importante, pois o type="number" permite que o usuário digite '60' se 'maxlength' for a única restrição.
        if (max !== null && max !== undefined) {
             let numericValue = parseInt(value);
             
             // Se o valor digitado exceder 59 (Min/Sec), ele é resetado para o valor máximo.
             if (numericValue > max) {
                 input.value = String(max).padStart(2, '0');
             }
        }
    }
    
    // --- FUNÇÃO DE ANIMAÇÃO DE GIRO 3D ---
    function updateDigit(box, newValue) {
        const oldValue = box.textContent;
        
        // Só anima se o valor realmente mudar
        if (oldValue === newValue) return; 

        // 1. Aplica a classe de animação e troca o texto
        box.textContent = newValue;
        box.classList.add('change');

        // 2. Remove a classe de animação após um breve momento
        // O tempo deve ser igual à velocidade da transição no CSS (0.1s = 100ms)
        setTimeout(() => {
            box.classList.remove('change');
        }, 100); 
    }

    // --- LÓGICA DO RELÓGIO (CLOCK) ---

    function updateClockDisplay() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        updateDigit(document.querySelector('#clock-view .hours .tens'), hours[0]);
        updateDigit(document.querySelector('#clock-view .hours .units'), hours[1]);
        
        updateDigit(document.querySelector('#clock-view .minutes .tens'), minutes[0]);
        updateDigit(document.querySelector('#clock-view .minutes .units'), minutes[1]);
        
        updateDigit(document.querySelector('#clock-view .seconds .tens'), seconds[0]);
        updateDigit(document.querySelector('#clock-view .seconds .units'), seconds[1]);

        document.getElementById('day-of-week').textContent = days[now.getDay()];
        document.getElementById('month').textContent = months[now.getMonth()];
        document.getElementById('day-of-month').textContent = String(now.getDate()).padStart(2, '0');
    }

    const clockInterval = setInterval(updateClockDisplay, CLOCK_INTERVAL_MS);

    // --- LÓGICA DO TIMER ---
    
    function formatTime(secs) {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        
        return {
            h: String(h).padStart(2, '0'),
            m: String(m).padStart(2, '0'),
            s: String(s).padStart(2, '0')
        };
    }
    
    function updateTimerDisplay() {
        const formattedTime = formatTime(timeRemaining);
        
        updateDigit(timerHourTens, formattedTime.h[0]);
        updateDigit(timerHourUnits, formattedTime.h[1]);
        
        updateDigit(document.getElementById('timer-min-tens'), formattedTime.m[0]);
        updateDigit(document.getElementById('timer-min-units'), formattedTime.m[1]);
        
        updateDigit(document.getElementById('timer-sec-tens'), formattedTime.s[0]);
        updateDigit(document.getElementById('timer-sec-units'), formattedTime.s[1]);
    }

    function startTimer() {
        if (timeRemaining <= 0 || timerInterval !== null) return;
        
        startTimerBtn.classList.add('hidden');
        pauseTimerBtn.classList.remove('hidden');
        configTimerBtn.classList.add('hidden');
        
        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateTimerDisplay(); 
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                pauseTimerBtn.classList.add('hidden');
                startTimerBtn.classList.remove('hidden');
                configTimerBtn.classList.remove('hidden');
                alert("Tempo esgotado!"); 
            }
        }, CLOCK_INTERVAL_MS);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        pauseTimerBtn.classList.add('hidden');
        startTimerBtn.classList.remove('hidden');
    }

    function resetTimer() {
        pauseTimer();
        timeRemaining = totalSeconds;
        updateTimerDisplay();
        startTimerBtn.textContent = 'INICIAR';
        configTimerBtn.classList.remove('hidden');
    }

    // --- EVENTOS DE CONTROLE ---

    function switchMode(mode) {
        if (mode === 'clock') {
            clockView.classList.remove('hidden');
            timerView.classList.add('hidden');
            showClockBtn.classList.add('active');
            showTimerBtn.classList.remove('active');
            if (timerInterval !== null) pauseTimer(); 
        } else {
            clockView.classList.add('hidden');
            timerView.classList.remove('hidden');
            showClockBtn.classList.remove('active');
            showTimerBtn.classList.add('active');
        }
    }

    showClockBtn.addEventListener('click', () => switchMode('clock'));
    showTimerBtn.addEventListener('click', () => switchMode('timer'));

    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // 3. Lógica do Modal de Configuração 

    function secondsToHms(secs) {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return {
            h: String(h).padStart(2, '0'),
            m: String(m).padStart(2, '0'),
            s: String(s).padStart(2, '0')
        };
    }

    /**
     * Configura a navegação por Enter e aplica o limite de 2 dígitos.
     */
    function setupModalNavigation() {
        const inputs = [configHoursInput, configMinInput, configSecInput];

        inputs.forEach((input, index) => {
            // Adiciona a função de limite de dígitos e valor a cada input
            input.addEventListener('input', limitInput); 
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); 
                    
                    // Garante que a função de limite seja executada antes de pular/salvar
                    limitInput({ target: input });

                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                        inputs[index + 1].select(); 
                    } else {
                        saveTimerBtn.click(); 
                    }
                }
            });
        });
    }

    setupModalNavigation();


    configTimerBtn.addEventListener('click', () => {
        pauseTimer();
        timerModal.classList.remove('hidden');
        
        const currentConfig = secondsToHms(totalSeconds);
        
        configHoursInput.value = currentConfig.h;
        configMinInput.value = currentConfig.m;
        configSecInput.value = currentConfig.s;
        
        configHoursInput.focus();
        configHoursInput.select(); 
    });

    closeModalBtn.addEventListener('click', () => {
        timerModal.classList.add('hidden');
    });

    saveTimerBtn.addEventListener('click', () => {
        // Garante que o valor final nos inputs respeite as regras de limite
        limitInput({ target: configHoursInput });
        limitInput({ target: configMinInput });
        limitInput({ target: configSecInput });
        
        const hours = parseInt(configHoursInput.value) || 0; 
        const min = parseInt(configMinInput.value) || 0;
        const sec = parseInt(configSecInput.value) || 0;

        // VALIDAÇÃO: Minutos e Segundos devem ser <= 59.
        if (hours < 0 || min < 0 || sec < 0 || min > 59 || sec > 59) {
            // Esta linha de erro agora só deve ser alcançada se o usuário manipular o input de forma extrema.
            alert("Por favor, insira valores válidos. Minutos/Segundos devem estar entre 0 e 59.");
            return;
        }

        totalSeconds = (hours * 3600) + (min * 60) + sec;
        timeRemaining = totalSeconds;
        
        updateTimerDisplay();
        timerModal.classList.add('hidden');
        startTimerBtn.textContent = 'INICIAR';
    });

    // Inicialização
    updateClockDisplay();
    updateTimerDisplay(); 
    switchMode('clock');
});