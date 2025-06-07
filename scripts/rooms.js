// Global variables
let map;
let markers = [];
let filteredListings = [];
let currentSort = 'newest';
let currentMapType = 'googleStreets';
let mapLayers = {};
let intervalId = null;

// DOM elements
const searchInput = document.getElementById('search-input');
const filterBtn = document.getElementById('filter-btn');
const sortBtn = document.getElementById('sort-btn');
const filterPanel = document.getElementById('filter-panel');
const listingsContainer = document.getElementById('listings-container');
const resultsCount = document.getElementById('results-count');
const minPriceSlider = document.getElementById('min-price');
const maxPriceSlider = document.getElementById('max-price');
const minPriceValue = document.getElementById('min-price-value');
const maxPriceValue = document.getElementById('max-price-value');

// --- DATA FETCHING LOGIC: Fetch/update from API every 10 seconds ---

async function fetchRoomData() {
    try {
        // Replace with your real API endpoint
        const response = await fetch('https://webpojja.pasgorasa.site/api/rooms');
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        // If your API returns an array, use it directly. If it returns {rooms: [...]}, use data.rooms
        filteredListings = Array.isArray(data) ? data : data.rooms;

        // Convert date strings to Date objects if needed
        filteredListings.forEach(listing => {
            if (listing.datePosted && typeof listing.datePosted === 'string') {
                listing.datePosted = new Date(listing.datePosted);
            }
        });

        sortListings();
        renderListings();
        addMarkersToMap();
        updateResultsCount();
    } catch (error) {
        console.error('Failed to fetch room data:', error);
        // Optionally, show an error message in the UI
        listingsContainer.innerHTML = `<div class="no-results"><h3>Error loading data</h3><p>${error.message}</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    addMapTypeSwitcher();
    setupEventListeners();
    setupMapEventListeners();
    updatePriceRangeForSriLanka();

    // Fetch and render immediately
    fetchRoomData();

    // Then every 10 seconds
    intervalId = setInterval(fetchRoomData, 10000);
});

// Update price range for Sri Lankan context
function updatePriceRangeForSriLanka() {
    minPriceSlider.min = 10000;
    minPriceSlider.max = 50000;
    minPriceSlider.value = 10000;
    maxPriceSlider.min = 10000;
    maxPriceSlider.max = 50000;
    maxPriceSlider.value = 50000;
    minPriceValue.textContent = 'LKR 10,000';
    maxPriceValue.textContent = 'LKR 50,000';
}

// Map initialization
function initializeMap() {
    if (map) {
        map.remove();
        map = null;
    }
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    try {
        map = L.map('map', {
            preferCanvas: true,
            zoomControl: true,
            attributionControl: true
        }).setView([6.7964, 79.9003], 14);

        mapLayers.googleStreets = L.tileLayer('https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Maps'
        });
        mapLayers.googleSatellite = L.tileLayer('https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Maps'
        });
        mapLayers.googleStreets.addTo(map);

        const baseLayers = {
            "Google Streets": mapLayers.googleStreets,
            "Google Satellite": mapLayers.googleSatellite
        };
        L.control.layers(baseLayers).addTo(map);

        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 100);

        const universityMarker = L.marker([6.7964, 79.9003]).addTo(map);
        universityMarker.bindPopup(`
            <div class="popup-content university-popup">
                <h3>University of Moratuwa</h3>
                <p>Main Campus</p>
            </div>
        `);

        addMarkersToMap();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function showSidebar() {
    const sidebar = document.querySelector('.side-bar')
    sidebar.style.display='flex'
    sidebar.style.right='0'
}

function setupMapEventListeners() {
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (map && map.getContainer() && map.getContainer().offsetParent !== null) {
                map.invalidateSize();
            }
        }, 150);
    });
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 250);
    });
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    });
    const mapContainer = document.getElementById('map');
    if (mapContainer && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && map) {
                    setTimeout(() => {
                        map.invalidateSize();
                    }, 100);
                }
            });
        }, {
            threshold: 0.1
        });
        observer.observe(mapContainer);
    }
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 200);
        }
    });
}

function addMapTypeSwitcher() {
    const mapTypeControl = L.control({ position: 'topright' });
    mapTypeControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'map-type-switcher');
        div.innerHTML = `
            <div class="map-type-buttons">
                <button class="map-type-btn active" data-type="googleStreets">Streets</button>
                <button class="map-type-btn" data-type="googleSatellite">Satellite</button>
            </div>
        `;
        L.DomEvent.disableClickPropagation(div);
        return div;
    };
    mapTypeControl.addTo(map);
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('map-type-btn')) {
            const mapType = e.target.getAttribute('data-type');
            switchMapType(mapType);
            document.querySelectorAll('.map-type-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
}

function switchMapType(mapType) {
    if (mapLayers[currentMapType]) {
        map.removeLayer(mapLayers[currentMapType]);
    }
    if (mapLayers[mapType]) {
        mapLayers[mapType].addTo(map);
        currentMapType = mapType;
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 100);
    }
}

function addMarkersToMap() {
    markers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    markers = [];
    filteredListings.forEach(listing => {
        try {
            if (!listing.location || !Array.isArray(listing.location)) return;
            const marker = L.marker(listing.location).addTo(map);
            const popupContent = `
                <div class="popup-content">
                    <img src="${listing.image}" alt="${listing.type}" class="popup-image" onerror="this.src='assets/images/placeholder-room.jpg'">
                    <div class="popup-price">LKR ${listing.price.toLocaleString()}/month</div>
                    <div class="popup-address">${listing.address}</div>
                    <div class="popup-address">${listing.addressDetail}</div>
                    <div class="popup-landmarks">
                        <small><i class="fas fa-map-marker-alt"></i> ${listing.nearbyLandmarks ? listing.nearbyLandmarks.slice(0, 2).join(', ') : ''}</small>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent);
            markers.push(marker);
        } catch (error) {
            console.error('Error adding marker:', error);
        }
    });
}

function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    filterBtn.addEventListener('click', toggleFilterPanel);
    sortBtn.addEventListener('click', toggleSortOptions);
    minPriceSlider.addEventListener('input', updatePriceRange);
    maxPriceSlider.addEventListener('input', updatePriceRange);
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    document.querySelector('.clear-filters').addEventListener('click', clearAllFilters);
    document.querySelector('.apply-filters').addEventListener('click', applyFilters);
    document.addEventListener('click', function(e) {
        if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) {
            filterPanel.classList.remove('active');
            filterBtn.classList.remove('active');
        }
    });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search input
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === '') {
        // refetch from API or use last fetched
    } else {
        filteredListings = filteredListings.filter(listing => 
            (listing.address && listing.address.toLowerCase().includes(searchTerm)) ||
            (listing.addressDetail && listing.addressDetail.toLowerCase().includes(searchTerm)) ||
            (listing.type && listing.type.toLowerCase().includes(searchTerm)) ||
            (listing.furnishing && listing.furnishing.toLowerCase().includes(searchTerm)) ||
            (listing.nearbyLandmarks && listing.nearbyLandmarks.some(landmark => landmark.toLowerCase().includes(searchTerm)))
        );
    }
    applyCurrentFilters();
    renderListings();
    addMarkersToMap();
    updateResultsCount();
}

// Toggle filter panel
function toggleFilterPanel() {
    filterPanel.classList.toggle('active');
    filterBtn.classList.toggle('active');
}

// Toggle sort options
function toggleSortOptions() {
    const sortOptions = ['newest', 'oldest', 'price-low', 'price-high'];
    const currentIndex = sortOptions.indexOf(currentSort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    currentSort = sortOptions[nextIndex];
    const sortLabels = {
        'newest': 'Sort by Newest',
        'oldest': 'Sort by Oldest',
        'price-low': 'Price: Low to High',
        'price-high': 'Price: High to Low'
    };
    sortBtn.innerHTML = `<i class="fas fa-sort"></i> ${sortLabels[currentSort]}`;
    sortListings();
    renderListings();
}

// Sort listings
function sortListings() {
    switch (currentSort) {
        case 'newest':
            filteredListings.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
            break;
        case 'oldest':
            filteredListings.sort((a, b) => new Date(a.datePosted) - new Date(b.datePosted));
            break;
        case 'price-low':
            filteredListings.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredListings.sort((a, b) => b.price - a.price);
            break;
    }
}

// Update price range display
function updatePriceRange() {
    const minPrice = parseInt(minPriceSlider.value);
    const maxPrice = parseInt(maxPriceSlider.value);
    if (minPrice > maxPrice) {
        if (this === minPriceSlider) {
            maxPriceSlider.value = minPrice;
        } else {
            minPriceSlider.value = maxPrice;
        }
    }
    minPriceValue.textContent = `LKR ${parseInt(minPriceSlider.value).toLocaleString()}`;
    maxPriceValue.textContent = `LKR ${parseInt(maxPriceSlider.value).toLocaleString()}`;
    applyFilters();
}

// Apply current filters
function applyCurrentFilters() {
    const minPrice = parseInt(minPriceSlider.value);
    const maxPrice = parseInt(maxPriceSlider.value);
    const selectedTypes = Array.from(document.querySelectorAll('.checkbox-group input[value="Room"], .checkbox-group input[value="Boarding House"], .checkbox-group input[value="Apartment"], .checkbox-group input[value="Studio"], .checkbox-group input[value="Annex"]:checked'))
        .map(cb => cb.value);
    const selectedFurnishing = Array.from(document.querySelectorAll('.checkbox-group input[value*="Furnished"]:checked'))
        .map(cb => cb.value);
    filteredListings = filteredListings.filter(listing => {
        const priceInRange = listing.price >= minPrice && listing.price <= maxPrice;
        const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(listing.type);
        const furnishingMatch = selectedFurnishing.length === 0 || selectedFurnishing.includes(listing.furnishing);
        return priceInRange && typeMatch && furnishingMatch;
    });
}

// Apply filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === '') {
        // refetch from API or use last fetched
    } else {
        filteredListings = filteredListings.filter(listing => 
            (listing.address && listing.address.toLowerCase().includes(searchTerm)) ||
            (listing.addressDetail && listing.addressDetail.toLowerCase().includes(searchTerm)) ||
            (listing.type && listing.type.toLowerCase().includes(searchTerm)) ||
            (listing.furnishing && listing.furnishing.toLowerCase().includes(searchTerm)) ||
            (listing.nearbyLandmarks && listing.nearbyLandmarks.some(landmark => landmark.toLowerCase().includes(searchTerm)))
        );
    }
    applyCurrentFilters();
    sortListings();
    renderListings();
    addMarkersToMap();
    updateResultsCount();
}

// Clear all filters
function clearAllFilters() {
    minPriceSlider.value = 10000;
    maxPriceSlider.value = 50000;
    minPriceValue.textContent = 'LKR 10,000';
    maxPriceValue.textContent = 'LKR 50,000';
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    searchInput.value = '';
    currentSort = 'newest';
    sortBtn.innerHTML = '<i class="fas fa-sort"></i> Sort by Newest';
    applyFilters();
}

// Render listings to the page
function renderListings() {
    if (filteredListings.length === 0) {
        listingsContainer.innerHTML = `
            <div class="no-results">
                <h3>No accommodations found</h3>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }
    listingsContainer.innerHTML = '';
    filteredListings.forEach(listing => {
        const listingCard = document.createElement('div');
        listingCard.className = 'listing-card';
        listingCard.setAttribute('data-listing-id', listing.id);
        const availabilityClass = listing.available ? 'available' : '';
        const furnishingClass = listing.furnishing ? listing.furnishing.toLowerCase().replace(' ', '-') : '';
        listingCard.innerHTML = `
            <div class="listing-image">
                <img src="${listing.image}" alt="${listing.type}" onerror="this.src='assets/images/placeholder-room.jpg'">
                <div class="listing-type">${listing.type}</div>
            </div>
            <div class="listing-details">
                <div class="listing-price">LKR ${listing.price.toLocaleString()}/month</div>
                <div class="listing-address">${listing.address}</div>
                <div class="listing-address">${listing.addressDetail}</div>
                <div class="listing-area">${listing.area}</div>
                <div class="listing-availability ${availabilityClass}">
                    Available from ${listing.availability}
                </div>
                <div class="listing-amenities">
                    <span><i class="fas fa-bed"></i> ${listing.beds} bed${listing.beds > 1 ? 's' : ''}</span>
                    <span><i class="fas fa-bath"></i> ${listing.baths} bath${listing.baths > 1 ? 's' : ''}</span>
                </div>
                <div class="furnishing ${furnishingClass}">
                    <i class="fas fa-couch"></i>
                    ${listing.furnishing}
                </div>
                <div class="nearby-landmarks">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Near: ${listing.nearbyLandmarks ? listing.nearbyLandmarks.slice(0, 3).join(', ') : ''}</span>
                </div>
                ${listing.amenities ? `
                    <div class="amenities-list">
                        ${listing.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        listingCard.addEventListener('click', () => {
            const marker = markers.find(m => 
                m.getLatLng().lat === listing.location[0] && 
                m.getLatLng().lng === listing.location[1]
            );
            if (marker) {
                map.setView(listing.location, 16);
                marker.openPopup();
            }
        });
        listingsContainer.appendChild(listingCard);
    });
}

// Update results count
function updateResultsCount() {
    resultsCount.textContent = filteredListings.length;
}
