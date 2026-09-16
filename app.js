/**
 * Personal Dashboard & Live Timing Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainTimeEl = document.getElementById('mainTime');
    const timeAmPmEl = document.getElementById('timeAmPm');
    const fullDateDisplayEl = document.getElementById('fullDateDisplay');
    const timezoneTextEl = document.getElementById('timezoneText');
    
    const format12Btn = document.getElementById('format12Btn');
    const format24Btn = document.getElementById('format24Btn');
    
    const dayProgressPercentEl = document.getElementById('dayProgressPercent');
    const dayProgressBarEl = document.getElementById('dayProgressBar');
    
    const greetingIconEl = document.getElementById('greetingIcon');
    const greetingTextEl = document.getElementById('greetingText');
    
    // Profile Name Elements
    const userNameDisplayEl = document.getElementById('userNameDisplay');
    const editNameBtn = document.getElementById('editNameBtn');
    const nameContainerEl = document.getElementById('nameContainer');
    const nameEditFormEl = document.getElementById('nameEditForm');
    const nameInputEl = document.getElementById('nameInput');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const cancelNameBtn = document.getElementById('cancelNameBtn');
    const avatarInitialsEl = document.getElementById('avatarInitials');
    
    // World Clocks
    const utcTimeEl = document.getElementById('utcTime');
    const nyTimeEl = document.getElementById('nyTime');
    const londonTimeEl = document.getElementById('londonTime');
    const tokyoTimeEl = document.getElementById('tokyoTime');
    
    // Metrics
    const dayOfYearValEl = document.getElementById('dayOfYearVal');
    const weekNumValEl = document.getElementById('weekNumVal');
    const isLeapYearValEl = document.getElementById('isLeapYearVal');
    const unixTimestampValEl = document.getElementById('unixTimestampVal');
    
    // Timer Widget
    const timerDisplayEl = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    
    // Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');

    // --- State Variables ---
    let use24HourFormat = localStorage.getItem('pref_time_format') === '24';
    let userName = localStorage.getItem('user_name') || 'Chengxuan Wu';
    let isDarkMode = localStorage.getItem('pref_theme') !== 'light';
    
    // Timer State
    let timerInterval = null;
    let timerSeconds = 5 * 60; // 5 minutes default
    let isTimerRunning = false;

    // --- Initial Setup ---
    initTheme();
    initName();
    updateFormatButtons();
    startClockEngine();

    // --- Event Listeners ---
    format12Btn.addEventListener('click', () => {
        use24HourFormat = false;
        localStorage.setItem('pref_time_format', '12');
        updateFormatButtons();
        updateClock();
    });

    format24Btn.addEventListener('click', () => {
        use24HourFormat = true;
        localStorage.setItem('pref_time_format', '24');
        updateFormatButtons();
        updateClock();
    });

    themeToggleBtn.addEventListener('click', toggleTheme);

    // Editable Name handlers
    userNameDisplayEl.addEventListener('click', showNameEditForm);
    editNameBtn.addEventListener('click', showNameEditForm);
    saveNameBtn.addEventListener('click', saveName);
    cancelNameBtn.addEventListener('click', hideNameEditForm);
    nameInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveName();
        if (e.key === 'Escape') hideNameEditForm();
    });

    // Timer Controls
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // --- Functions ---

    function startClockEngine() {
        updateClock();
        setInterval(updateClock, 1000);
    }

    function updateClock() {
        const now = new Date();

        // 1. Time Formatting
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        let ampm = '';

        if (!use24HourFormat) {
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 becomes 12
            timeAmPmEl.style.display = 'inline';
            timeAmPmEl.textContent = ampm;
        } else {
            timeAmPmEl.style.display = 'none';
        }

        const formattedHours = String(hours).padStart(2, '0');
        mainTimeEl.textContent = `${formattedHours}:${minutes}:${seconds}`;

        // 2. Date Formatting
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        fullDateDisplayEl.textContent = now.toLocaleDateString(undefined, options);

        // 3. Timezone Info
        const tzOffsetMinutes = -now.getTimezoneOffset();
        const tzHours = Math.floor(Math.abs(tzOffsetMinutes) / 60);
        const tzMins = Math.abs(tzOffsetMinutes) % 60;
        const tzSign = tzOffsetMinutes >= 0 ? '+' : '-';
        const formattedTZ = `UTC${tzSign}${String(tzHours).padStart(2, '0')}:${String(tzMins).padStart(2, '0')}`;
        
        let tzName = '';
        try {
            tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            tzName = '';
        }
        timezoneTextEl.textContent = tzName ? `${tzName} (${formattedTZ})` : formattedTZ;

        // 4. Dynamic Greeting based on current hour
        updateGreeting(now.getHours());

        // 5. Day Progress
        const secondsPassedInDay = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        const totalSecondsInDay = 86400;
        const progressPercent = ((secondsPassedInDay / totalSecondsInDay) * 100).toFixed(1);
        dayProgressPercentEl.textContent = `${progressPercent}%`;
        dayProgressBarEl.style.width = `${progressPercent}%`;

        // 6. World Clocks
        updateWorldClocks(now);

        // 7. Timing Metrics
        updateMetrics(now);
    }

    function updateGreeting(hour) {
        let icon = '✨';
        let greeting = 'Good Day';

        if (hour >= 5 && hour < 12) {
            icon = '🌅';
            greeting = 'Good Morning';
        } else if (hour >= 12 && hour < 17) {
            icon = '☀️';
            greeting = 'Good Afternoon';
        } else if (hour >= 17 && hour < 22) {
            icon = '🌆';
            greeting = 'Good Evening';
        } else {
            icon = '🌙';
            greeting = 'Good Night';
        }

        greetingIconEl.textContent = icon;
        greetingTextEl.textContent = `${greeting}, ${userName.split(' ')[0]}!`;
    }

    function updateFormatButtons() {
        if (use24HourFormat) {
            format24Btn.classList.add('active');
            format12Btn.classList.remove('active');
        } else {
            format12Btn.classList.add('active');
            format24Btn.classList.remove('active');
        }
    }

    // Name Management
    function initName() {
        userNameDisplayEl.textContent = userName;
        updateAvatarInitials(userName);
    }

    function updateAvatarInitials(name) {
        const parts = name.trim().split(' ');
        let initials = 'YN';
        if (parts.length >= 2) {
            initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts[0] && parts[0].length > 0) {
            initials = parts[0].substring(0, 2).toUpperCase();
        }
        avatarInitialsEl.textContent = initials;
    }

    function showNameEditForm() {
        nameInputEl.value = userName;
        nameContainerEl.classList.add('hidden');
        nameEditFormEl.classList.remove('hidden');
        nameInputEl.focus();
    }

    function hideNameEditForm() {
        nameEditFormEl.classList.add('hidden');
        nameContainerEl.classList.remove('hidden');
    }

    function saveName() {
        const newName = nameInputEl.value.trim();
        if (newName) {
            userName = newName;
            localStorage.setItem('user_name', userName);
            userNameDisplayEl.textContent = userName;
            updateAvatarInitials(userName);
            updateClock();
        }
        hideNameEditForm();
    }

    // Theme Management
    function initTheme() {
        if (!isDarkMode) {
            document.body.classList.add('light-theme');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        localStorage.setItem('pref_theme', isDarkMode ? 'dark' : 'light');
        if (isDarkMode) {
            document.body.classList.remove('light-theme');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            document.body.classList.add('light-theme');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    // World Clocks Generator
    function updateWorldClocks(now) {
        const formatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !use24HourFormat
        };

        try {
            utcTimeEl.textContent = new Intl.DateTimeFormat('en-US', { ...formatOptions, timeZone: 'UTC' }).format(now);
            nyTimeEl.textContent = new Intl.DateTimeFormat('en-US', { ...formatOptions, timeZone: 'America/New_York' }).format(now);
            londonTimeEl.textContent = new Intl.DateTimeFormat('en-US', { ...formatOptions, timeZone: 'Europe/London' }).format(now);
            tokyoTimeEl.textContent = new Intl.DateTimeFormat('en-US', { ...formatOptions, timeZone: 'Asia/Tokyo' }).format(now);
        } catch (e) {
            console.error('World clock calculation error', e);
        }
    }

    // Metrics Calculation
    function updateMetrics(now) {
        // Day of Year
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const diff = now - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        dayOfYearValEl.textContent = `${dayOfYear} / ${isLeapYear(now.getFullYear()) ? 366 : 365}`;

        // Week Number (ISO)
        const weekNum = getISOWeekNumber(now);
        weekNumValEl.textContent = `Week ${weekNum}`;

        // Leap Year
        isLeapYearValEl.textContent = isLeapYear(now.getFullYear()) ? 'Yes' : 'No';

        // Unix Timestamp
        unixTimestampValEl.textContent = Math.floor(now.getTime() / 1000);
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    function getISOWeekNumber(d) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    }

    // Quick Timer Widget logic
    function updateTimerDisplay() {
        const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
        const secs = String(timerSeconds % 60).padStart(2, '0');
        timerDisplayEl.textContent = `${mins}:${secs}`;
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;

        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                startTimerBtn.disabled = false;
                pauseTimerBtn.disabled = true;
                alert('⏳ Quick Timer Complete!');
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isTimerRunning) return;
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerSeconds = 5 * 60;
        updateTimerDisplay();
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
    }
});
