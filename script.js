document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-text');
    const dateInput = document.getElementById('task-date');
    const openDateBtn = document.getElementById('open-date');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('taskList');
    const filterToggleBtn = document.getElementById('filter-toggle');
    const sortToggleBtn = document.getElementById('sort-toggle');
    const filtersSection = document.querySelector('.filters');
    const filterAll = document.getElementById('filter-all');
    const filterCompleted = document.getElementById('filter-completed');
    const filterActive = document.getElementById('filter-active');
    const filterDate = document.getElementById('filter-date');
    const toast = document.getElementById('toast');

    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    let tasks = [];
    let currentFilter = 'all';
    let sortMode = 'none';

    taskInput.addEventListener('input', () => {
        const firstChar = taskInput.value.trim().charAt(0);
        const isHebrew = /[\u0590-\u05FF]/.test(firstChar);
        taskInput.style.direction = isHebrew ? 'rtl' : 'ltr';
        taskInput.style.textAlign = isHebrew ? 'right' : 'left';
    });

    openDateBtn.addEventListener('click', () => {
        dateInput.showPicker();
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadFromLocalStorage() {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            tasks = JSON.parse(stored);
            renderTasks();
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        let filtered = [...tasks];

        if (currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        } else if (currentFilter === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (currentFilter === 'date') {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(task => task.date >= today);
        }

        if (sortMode === 'asc') {
            filtered.sort((a, b) => a.text.localeCompare(b.text));
        } else if (sortMode === 'desc') {
            filtered.sort((a, b) => b.text.localeCompare(a.text));
        }

        if (filtered.length === 0) {
            const msg = document.createElement('div');
            msg.className = 'no-tasks';
            msg.textContent = 'אין משימות להציג 😎';
            taskList.appendChild(msg);
            return;
        }

        if (sortMode === 'none') {
            filtered.slice().reverse().forEach(addTaskToDOM);
        } else {
            filtered.forEach(addTaskToDOM);
        }
    }

    function addTaskToDOM(task) {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');
        li.setAttribute('data-id', task.id);

        const content = document.createElement('span');
        content.textContent = `${task.text} ${task.date ? '| ' + task.date : ''}`;

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';

        const completeBtn = document.createElement('button');
        completeBtn.textContent = '✔';
        completeBtn.addEventListener('click', () => {
            task.completed = !task.completed;
            saveToLocalStorage();
            renderTasks();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.addEventListener('click', () => {
            li.classList.add('removing');
            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveToLocalStorage();
                renderTasks();
                showToast('🗑️ משימה נמחקה!');
            }, 400);
        });

        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(content);
        li.appendChild(actions);

        taskList.prepend(li);
    }

    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        const date = dateInput.value;
        if (text === '') return;
        const task = {
            id: Date.now(),
            text,
            date,
            completed: false
        };
        tasks.unshift(task);
        saveToLocalStorage();
        renderTasks();
        showToast('🎉 משימה נוספה!');
        taskInput.value = '';
        dateInput.value = '';
    });

    filterToggleBtn.addEventListener('click', () => {
        filtersSection.classList.toggle('show');
    });

    sortToggleBtn.addEventListener('click', () => {
        if (sortMode === 'none') {
            sortMode = 'asc';
            sortToggleBtn.textContent = 'B → A מיון';
        } else if (sortMode === 'asc') {
            sortMode = 'desc';
            sortToggleBtn.textContent = 'A → B מיון';
        } else {
            sortMode = 'none';
            sortToggleBtn.textContent = 'מיון';
        }
        renderTasks();
    });

    function setActiveFilter(button) {
        document.querySelectorAll('.filters button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    filterAll.addEventListener('click', () => {
        currentFilter = 'all';
        setActiveFilter(filterAll);
        renderTasks();
    });

    filterCompleted.addEventListener('click', () => {
        currentFilter = 'completed';
        setActiveFilter(filterCompleted);
        renderTasks();
    });

    filterActive.addEventListener('click', () => {
        currentFilter = 'active';
        setActiveFilter(filterActive);
        renderTasks();
    });

    filterDate.addEventListener('click', () => {
        currentFilter = 'date';
        setActiveFilter(filterDate);
        renderTasks();
    });

    loadFromLocalStorage();

    fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
        .then(res => res.json())
        .then(data => {
            data.forEach(item => {
                const exists = tasks.some(t => t.id === item.id);
                if (!exists) {
                    const task = {
                        id: item.id,
                        text: item.title,
                        date: '',
                        completed: item.completed
                    };
                    tasks.unshift(task);
                    saveToLocalStorage();
                }
            });
            renderTasks();
        });
});