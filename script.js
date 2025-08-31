document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const monthDisplay = document.getElementById('month-display');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const modal = document.getElementById('study-log-modal');
    const closeModalButton = document.querySelector('.close-button');
    const modalDateDisplay = document.getElementById('modal-date');
    const studyEntriesContainer = document.getElementById('study-entries');
    const addEntryButton = document.getElementById('add-entry-button');
    const commentInput = document.getElementById('comment-input');
    const saveButton = document.getElementById('save-button');

    const subjects = {
        'english': '英語',
        'math': '数学',
        'japanese': '国語',
        'science': '理科',
        'social': '社会',
        'other': 'その他'
    };

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let studyData = JSON.parse(localStorage.getItem('studyData')) || {};

    const createStudyEntry = (entry = { subject: 'english', time: '' }) => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('study-entry');
        
        const subjectSelect = document.createElement('select');
        for (const [key, value] of Object.entries(subjects)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            subjectSelect.appendChild(option);
        }
        subjectSelect.value = entry.subject;
        
        const timeInput = document.createElement('input');
        timeInput.type = 'number';
        timeInput.placeholder = '時間（分）';
        timeInput.value = entry.time;

        const removeButton = document.createElement('button');
        removeButton.textContent = '削除';
        removeButton.addEventListener('click', () => {
            entryDiv.remove();
        });

        entryDiv.appendChild(subjectSelect);
        entryDiv.appendChild(timeInput);
        entryDiv.appendChild(removeButton);
        studyEntriesContainer.appendChild(entryDiv);
    };

    const renderCalendar = () => {
        calendar.innerHTML = '<div class="day-of-week">日</div><div class="day-of-week">月</div><div class="day-of-week">火</div><div class="day-of-week">水</div><div class="day-of-week">木</div><div class="day-of-week">金</div><div class="day-of-week">土</div>';
        const date = new Date(currentYear, currentMonth, 1);
        const firstDayOfMonth = date.getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        monthDisplay.textContent = `${currentYear}年 ${currentMonth + 1}月`;

        // 前月の余白
        for (let i = 0; i < firstDayOfMonth; i++) {
            const paddingDay = document.createElement('div');
            paddingDay.classList.add('day-box', 'padding-day');
            calendar.appendChild(paddingDay);
        }

        // 今月の日付
        for (let i = 1; i <= daysInMonth; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day-box');
            dayBox.dataset.date = `${currentYear}-${currentMonth + 1}-${i}`;

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = i;
            dayBox.appendChild(dayNumber);

            const studyLogList = document.createElement('ul');
            studyLogList.classList.add('study-log-list');
            dayBox.appendChild(studyLogList);

            // 記録済みの勉強時間を表示
            const dateKey = `${currentYear}-${currentMonth + 1}-${i}`;
            if (studyData[dateKey] && studyData[dateKey].entries) {
                studyData[dateKey].entries.forEach(entry => {
                    if (entry.time > 0) {
                        const listItem = document.createElement('li');
                        listItem.classList.add('study-log-item', `subject-${entry.subject}`);
                        listItem.textContent = `${subjects[entry.subject]}: ${entry.time}分`;
                        studyLogList.appendChild(listItem);
                    }
                });
            }

            dayBox.addEventListener('click', () => {
                selectedDate = dateKey;
                modalDateDisplay.textContent = `${currentYear}年 ${currentMonth + 1}月 ${i}日`;
                
                // 既存のエントリーをクリア
                studyEntriesContainer.innerHTML = '';
                
                // 既存のデータをモーダルに読み込む
                if (studyData[selectedDate]) {
                    studyData[selectedDate].entries.forEach(entry => createStudyEntry(entry));
                    commentInput.value = studyData[selectedDate].comment || '';
                } else {
                    createStudyEntry();
                    commentInput.value = '';
                }
                
                modal.style.display = 'flex';
            });

            calendar.appendChild(dayBox);
        }
    };

    const saveStudyTime = () => {
        if (!selectedDate) return;

        const entries = Array.from(studyEntriesContainer.querySelectorAll('.study-entry')).map(entryDiv => {
            const subject = entryDiv.querySelector('select').value;
            const time = parseInt(entryDiv.querySelector('input').value, 10);
            return { subject, time };
        }).filter(entry => !isNaN(entry.time) && entry.time > 0);

        if (entries.length === 0 && commentInput.value.trim() === '') {
            if (studyData[selectedDate]) {
                delete studyData[selectedDate];
            }
        } else {
            studyData[selectedDate] = {
                entries: entries,
                comment: commentInput.value.trim()
            };
        }

        localStorage.setItem('studyData', JSON.stringify(studyData));
        modal.style.display = 'none';
        renderCalendar();
    };

    prevButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    addEntryButton.addEventListener('click', () => {
        createStudyEntry();
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    saveButton.addEventListener('click', saveStudyTime);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    renderCalendar();
});