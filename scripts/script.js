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

