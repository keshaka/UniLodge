// Room listings data for University of Moratuwa, Sri Lanka
const listingsData = [
    {
        id: 1,
        type: 'Room',
        price: 25000,
        address: 'Katubedda Road, Moratuwa',
        addressDetail: '5 minutes walk to UOM Main Gate',
        area: '120 sqft',
        availability: '15 June, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Fully Furnished',
        image: 'assets/images/moratuwa-room1.jpg',
        location: [6.7964, 79.9003],
        amenities: ['WiFi', 'AC', 'Study Table', 'Wardrobe'],
        available: true,
        datePosted: new Date('2025-05-20'),
        nearbyLandmarks: ['UOM Main Gate', 'Katubedda Junction', 'Food City']
    },
    {
        id: 2,
        type: 'Boarding House',
        price: 18000,
        address: 'Templers Road, Moratuwa',
        addressDetail: 'Near Faculty of Engineering',
        area: '100 sqft',
        availability: '1 July, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Partially Furnished',
        image: 'assets/images/moratuwa-boarding1.jpg',
        location: [6.7955, 79.9010],
        amenities: ['WiFi', 'Shared Kitchen', 'Common Area', 'Laundry'],
        available: true,
        datePosted: new Date('2025-05-18'),
        nearbyLandmarks: ['Engineering Faculty', 'Moratuwa Railway Station']
    },
    {
        id: 3,
        type: 'Annex',
        price: 22000,
        address: 'Uyana Road, Moratuwa',
        addressDetail: 'Walking distance to IT Faculty',
        area: '140 sqft',
        availability: '20 June, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Fully Furnished',
        image: 'assets/images/moratuwa-annex1.jpg',
        location: [6.7945, 79.8995],
        amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Area'],
        available: true,
        datePosted: new Date('2025-05-15'),
        nearbyLandmarks: ['IT Faculty', 'Moratuwa Bus Stand', 'Saman Bank']
    },
    {
        id: 4,
        type: 'Room',
        price: 20000,
        address: 'Rawatawatta Road, Moratuwa',
        addressDetail: 'Near Architecture Faculty',
        area: '110 sqft',
        availability: '10 July, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Fully Furnished',
        image: 'assets/images/moratuwa-room2.jpg',
        location: [6.7970, 79.8985],
        amenities: ['WiFi', 'Fan', 'Study Table', 'Security'],
        available: true,
        datePosted: new Date('2025-05-12'),
        nearbyLandmarks: ['Architecture Faculty', 'Moratuwa Hospital', 'Keells Super']
    },
    {
        id: 5,
        type: 'Apartment',
        price: 35000,
        address: 'Galle Road, Moratuwa',
        addressDetail: 'Premium location near main campus',
        area: '200 sqft',
        availability: '25 June, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Fully Furnished',
        image: 'assets/images/moratuwa-apartment1.jpg',
        location: [6.7980, 79.8990],
        amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Security', 'Balcony'],
        available: true,
        datePosted: new Date('2025-05-25'),
        nearbyLandmarks: ['UOM Main Campus', 'Galle Road', 'Commercial Bank']
    },
    {
        id: 6,
        type: 'Studio',
        price: 28000,
        address: 'De Saram Road, Moratuwa',
        addressDetail: 'Modern studio for postgraduate students',
        area: '160 sqft',
        availability: '5 July, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Fully Furnished',
        image: 'assets/images/moratuwa-studio1.jpg',
        location: [6.7935, 79.9015],
        amenities: ['WiFi', 'AC', 'Kitchenette', 'Study Area', 'Parking'],
        available: true,
        datePosted: new Date('2025-05-22'),
        nearbyLandmarks: ['Postgraduate Institute', 'Moratuwa Tech Park', 'Arpico Supercentre']
    },
    {
        id: 7,
        type: 'Boarding House',
        price: 15000,
        address: 'Koralawella Road, Moratuwa',
        addressDetail: 'Budget-friendly option for students',
        area: '90 sqft',
        availability: '1 August, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Basic Furnished',
        image: 'assets/images/moratuwa-boarding2.jpg',
        location: [6.7920, 79.9020],
        amenities: ['WiFi', 'Shared Kitchen', 'Common TV', 'Laundry Area'],
        available: true,
        datePosted: new Date('2025-05-10'),
        nearbyLandmarks: ['Koralawella Junction', 'Public Library', 'Post Office']
    },
    {
        id: 8,
        type: 'Room',
        price: 24000,
        address: 'Mahawatta Road, Moratuwa',
        addressDetail: 'Close to Transport Engineering Faculty',
        area: '130 sqft',
        availability: '15 July, 2025',
        beds: 1,
        baths: 1,
        furnishing: 'Fully Furnished',
        image: 'assets/images/moratuwa-room3.jpg',
        location: [6.7950, 79.9025],
        amenities: ['WiFi', 'AC', 'Study Table', 'Wardrobe', 'Mini Fridge'],
        available: true,
        datePosted: new Date('2025-05-08'),
        nearbyLandmarks: ['Transport Faculty', 'Mahawatta Junction', 'Cargills Food City']
    }
];

// Global variables
let map;
let markers = [];
let filteredListings = [...listingsData];
let currentSort = 'newest';
let currentMapType = 'googleStreets';
let mapLayers = {};

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    addMapTypeSwitcher();
    renderListings();
    setupEventListeners();
    setupMapEventListeners();
    updateResultsCount();
    updatePriceRangeForSriLanka();
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

// Enhanced map initialization with better error handling
function initializeMap() {
    // Check if map already exists and remove it
    if (map) {
        map.remove();
        map = null;
    }
    
    // Ensure container exists and is visible
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    try {
        // Center map on University of Moratuwa
        map = L.map('map', {
            preferCanvas: true,
            zoomControl: true,
            attributionControl: true
        }).setView([6.7964, 79.9003], 14);
        
        // Only Google Maps layers
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
        
        // Add default layer (Google Streets)
        mapLayers.googleStreets.addTo(map);
        
        // Create layer control with only Google options
        const baseLayers = {
            "Google Streets": mapLayers.googleStreets,
            "Google Satellite": mapLayers.googleSatellite
        };
        
        L.control.layers(baseLayers).addTo(map);
        
        // Force map to recognize its size after a short delay
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 100);
        
        // Add University of Moratuwa marker
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

// Enhanced map event listeners to handle scrolling issues
function setupMapEventListeners() {
    // Handle scroll events with debouncing
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (map && map.getContainer() && map.getContainer().offsetParent !== null) {
                map.invalidateSize();
            }
        }, 150);
    });
    
    // Handle resize events with debouncing
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 250);
    });
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    });
    
    // Intersection Observer for map container
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
    
    // Handle tab visibility
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 200);
        }
    });
}

// Add map type switcher buttons (only 2 options now)
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

// Function to switch map types
function switchMapType(mapType) {
    if (mapLayers[currentMapType]) {
        map.removeLayer(mapLayers[currentMapType]);
    }
    
    if (mapLayers[mapType]) {
        mapLayers[mapType].addTo(map);
        currentMapType = mapType;
        
        // Refresh map after layer change
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 100);
    }
}

// Add markers to map
function addMarkersToMap() {
    // Clear existing markers
    markers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    markers = [];
    
    filteredListings.forEach(listing => {
        try {
            const marker = L.marker(listing.location).addTo(map);
            
            const popupContent = `
                <div class="popup-content">
                    <img src="${listing.image}" alt="${listing.type}" class="popup-image" onerror="this.src='assets/images/placeholder-room.jpg'">
                    <div class="popup-price">LKR ${listing.price.toLocaleString()}/month</div>
                    <div class="popup-address">${listing.address}</div>
                    <div class="popup-address">${listing.addressDetail}</div>
                    <div class="popup-landmarks">
                        <small><i class="fas fa-map-marker-alt"></i> ${listing.nearbyLandmarks.slice(0, 2).join(', ')}</small>
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

// Setup event listeners
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
        filteredListings = [...listingsData];
    } else {
        filteredListings = listingsData.filter(listing => 
            listing.address.toLowerCase().includes(searchTerm) ||
            listing.addressDetail.toLowerCase().includes(searchTerm) ||
            listing.type.toLowerCase().includes(searchTerm) ||
            listing.furnishing.toLowerCase().includes(searchTerm) ||
            listing.nearbyLandmarks.some(landmark => landmark.toLowerCase().includes(searchTerm))
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
            filteredListings.sort((a, b) => b.datePosted - a.datePosted);
            break;
        case 'oldest':
            filteredListings.sort((a, b) => a.datePosted - b.datePosted);
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
        filteredListings = [...listingsData];
    } else {
        filteredListings = listingsData.filter(listing => 
            listing.address.toLowerCase().includes(searchTerm) ||
            listing.addressDetail.toLowerCase().includes(searchTerm) ||
            listing.type.toLowerCase().includes(searchTerm) ||
            listing.furnishing.toLowerCase().includes(searchTerm) ||
            listing.nearbyLandmarks.some(landmark => landmark.toLowerCase().includes(searchTerm))
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
        const furnishingClass = listing.furnishing.toLowerCase().replace(' ', '-');
        
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
                    <span>Near: ${listing.nearbyLandmarks.slice(0, 3).join(', ')}</span>
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
