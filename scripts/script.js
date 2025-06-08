function showSidebar() {
    const sidebar = document.querySelector('.side-bar')
    sidebar.style.display='flex'
    sidebar.style.right='0'
}

function hideSidebar() {
    const sidebar = document.querySelector('.side-bar')
    sidebar.style.right='-100%'
    sidebar.style.display='none'
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'active');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'inactive');
}

function darkMode() {
    let darkMode = localStorage.getItem('darkMode');
    if (darkMode != 'active') {
        enableDarkMode();
    }
    else {
        disableDarkMode();
    }
}

let mode = localStorage.getItem('modes');

function switchColour() {
    if (mode == null) {
        document.body.classList.add('mode1');
        mode = 1;
    }
    else if (mode == 1) {
        document.body.classList.remove('mode1');
        document.body.classList.add('mode2');
        mode = 2;
    }
    else if (mode == 2) {
        document.body.classList.remove('mode2');
        document.body.classList.add('mode3');
        mode = 3;
    }
    else if (mode == 3) {
        document.body.classList.remove('mode3');
        document.body.classList.add('mode4');
        mode = 4;
    }
    else if (mode == 4) {
        document.body.classList.remove('mode4');
        document.body.classList.add('mode5');
        mode = 5;
    }
    else if (mode == 5) {
        document.body.classList.remove('mode5');
        document.body.classList.add('mode6');
        mode = 6;
    }
    else if (mode == 6) {
        document.body.classList.remove('mode6');
        mode = null;
    }
}
