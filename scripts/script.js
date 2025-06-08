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
<<<<<<< Updated upstream
}
=======
}

// Advanced Review Section Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const reviewCards = document.querySelectorAll('.review-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            
            reviewCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    const category = card.getAttribute('data-category');
                    if (category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // Helpful button functionality
    const helpfulBtns = document.querySelectorAll('.helpful-btn');
    helpfulBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const countSpan = this.querySelector('.count');
            let count = parseInt(countSpan.textContent);
            
            if (this.classList.contains('voted')) {
                count--;
                this.classList.remove('voted');
                this.style.background = '';
                this.style.color = '';
            } else {
                count++;
                this.classList.add('voted');
                this.style.background = 'var(--black)';
                this.style.color = 'var(--white)';
            }
            
            countSpan.textContent = count;
        });
    });

    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more reviews
            this.innerHTML = '<span class="text">Loading...</span>';
            
            setTimeout(() => {
                this.innerHTML = '<span class="text">Load More Reviews</span><span class="icon">↓</span>';
                // Here you would typically load more reviews from your API
            }, 1000);
        });
    }
});
>>>>>>> Stashed changes
