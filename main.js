// API Configuration
const API_CONFIG = {
    discordAPI: 'https://dms-api.mcboss.top/',
    discordKey: 'dk05483CdnB6WBEfm7esQ3J7BvuIrLsC',
    serverAPI: 'https://api.mcsrvstat.us/3/mc-cloudsmp.mcboss.top'
};

// Page content storage
const pageContent = {
    home: null, // Will be the initial content
    gallery: null,
    playerlist: null,
    discord: null,
    feedback: null,
    shop: null
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    // Store initial home content
    pageContent.home = document.getElementById('page-content').innerHTML;
    
    // Load server data
    loadServerData();
    
    // Load Discord server info (for logo)
    loadDiscordServerInfo();
    
    // Set up periodic updates
    setInterval(loadServerData, 60000); // Update every minute
});

// Load server data from API
async function loadServerData() {
    try {
        const response = await fetch(API_CONFIG.serverAPI);
        const data = await response.json();
        
        // Update server info
        updateServerInfo(data);
    } catch (error) {
        console.error('Error loading server data:', error);
        document.getElementById('players-online').textContent = 'Offline';
    }
}

// Update server information on the page
function updateServerInfo(data) {
    const playersOnline = document.getElementById('players-online');
    const serverVersion = document.getElementById('server-version');
    
    if (data.online) {
        playersOnline.textContent = `${data.players.online}/${data.players.max}`;
        if (serverVersion) {
            serverVersion.textContent = data.version || '1.10x - 1.21x';
        }
    } else {
        playersOnline.textContent = 'Offline';
    }
}

// Load Discord server info for logo
async function loadDiscordServerInfo() {
    try {
        const response = await fetch(`${API_CONFIG.discordAPI}api/${API_CONFIG.discordKey}/server-info`);
        const data = await response.json();
        
        if (data.status === 'success' && data.server_info.server_icon_url) {
            const logo = document.getElementById('server-logo');
            logo.src = data.server_info.server_icon_url;
        }
    } catch (error) {
        console.error('Error loading Discord server info:', error);
    }
}

// Page navigation function
function loadPage(page) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.closest('.nav-link').classList.add('active');
    
    // Load page content
    switch(page) {
        case 'home':
            loadHomePage();
            break;
        case 'gallery':
            loadGalleryPage();
            break;
        case 'playerlist':
            loadPlayerListPage();
            break;
        case 'discord':
            loadDiscordPage();
            break;
        case 'feedback':
            loadFeedbackPage();
            break;
        case 'shop':
            loadShopPage();
            break;
    }
}

// Load home page
function loadHomePage() {
    document.getElementById('page-content').innerHTML = pageContent.home;
    loadServerData(); // Refresh server data
}

// Load gallery page
function loadGalleryPage() {
    document.getElementById('page-content').innerHTML = `
        <div class="page-container">
            <h1><i class="fas fa-images"></i> Gallery</h1>
            <div class="gallery-grid">
                <div class="gallery-item">
                    <img src="https://via.placeholder.com/300x200/1a1a2e/55ffff?text=Coming+Soon" alt="Gallery Image">
                    <div class="gallery-overlay">
                        <h3>Server Screenshots</h3>
                        <p>Amazing builds from our community</p>
                    </div>
                </div>
                <div class="gallery-item">
                    <img src="https://via.placeholder.com/300x200/16213e/55ffff?text=Coming+Soon" alt="Gallery Image">
                    <div class="gallery-overlay">
                        <h3>Town Showcases</h3>
                        <p>Beautiful towns built by players</p>
                    </div>
                </div>
                <div class="gallery-item">
                    <img src="https://via.placeholder.com/300x200/0e3460/55ffff?text=Coming+Soon" alt="Gallery Image">
                    <div class="gallery-overlay">
                        <h3>Events & Activities</h3>
                        <p>Fun moments from server events</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    addGalleryStyles();
}

// Load player list page
function loadPlayerListPage() {
    document.getElementById('page-content').innerHTML = `
        <div class="page-container">
            <h1><i class="fas fa-users"></i> Player List</h1>
            <div class="player-stats">
                <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <div>
                        <h3>Online Players</h3>
                        <p id="current-players">Loading...</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-server"></i>
                    <div>
                        <h3>Server Status</h3>
                        <p id="server-status">Loading...</p>
                    </div>
                </div>
            </div>
            <div class="player-list">
                <h2>Currently Online</h2>
                <div id="online-players">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading player data...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    addPlayerListStyles();
    loadPlayerData();
}

// Load Discord page
function loadDiscordPage() {
    document.getElementById('page-content').innerHTML = `
        <div class="page-container">
            <h1><i class="fab fa-discord"></i> Discord Community</h1>
            <div class="discord-info">
                <div class="discord-card">
                    <div class="discord-header">
                        <img src="" id="discord-server-icon" alt="Discord Icon">
                        <div>
                            <h2 id="discord-server-name">Loading...</h2>
                            <p id="discord-server-description">Loading server information...</p>
                        </div>
                    </div>
                    <div class="discord-stats">
                        <div class="stat">
                            <i class="fas fa-users"></i>
                            <div>
                                <h3>Total Members</h3>
                                <p id="discord-members">-</p>
                            </div>
                        </div>
                        <div class="stat">
                            <i class="fas fa-circle" style="color: #43b581;"></i>
                            <div>
                                <h3>Online</h3>
                                <p id="discord-online">-</p>
                            </div>
                        </div>
                    </div>
                    <div class="discord-actions">
                        <a href="#" id="discord-invite" class="discord-btn" target="_blank">
                            <i class="fab fa-discord"></i>
                            Join Our Discord
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    addDiscordStyles();
    loadDiscordInfo();
}

// Load feedback page
function loadFeedbackPage() {
    document.getElementById('page-content').innerHTML = `
        <div class="page-container">
            <h1><i class="fas fa-comments"></i> Feedback Forum</h1>
            <div class="feedback-form">
                <h2>Send us your feedback</h2>
                <form id="feedback-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Your Message</label>
                        <textarea id="message" name="message" rows="6" required></textarea>
                    </div>
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-paper-plane"></i>
                        Send Feedback
                    </button>
                </form>
            </div>
        </div>
    `;
    addFeedbackStyles();
    setupFeedbackForm();
}

// Load shop page
function loadShopPage() {
    document.getElementById('page-content').innerHTML = `
        <div class="page-container">
            <h1><i class="fas fa-shopping-cart"></i> Server Shop</h1>
            <div class="shop-coming-soon">
                <i class="fas fa-tools"></i>
                <h2>Coming Soon!</h2>
                <p>We're working hard to bring you an amazing shop experience.</p>
                <p>Stay tuned for updates!</p>
            </div>
        </div>
    `;
    addShopStyles();
}

// Load player data
async function loadPlayerData() {
    try {
        const response = await fetch(API_CONFIG.serverAPI);
        const data = await response.json();
        
        document.getElementById('current-players').textContent = data.online ? `${data.players.online}/${data.players.max}` : 'Offline';
        document.getElementById('server-status').textContent = data.online ? 'Online' : 'Offline';
        
        // Since the API doesn't provide individual player names, show a message
        document.getElementById('online-players').innerHTML = `
            <div class="no-players">
                <i class="fas fa-info-circle"></i>
                <p>Player names are not available through the server API.</p>
                <p>Join the server to see who's online!</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading player data:', error);
    }
}

// Load Discord information
async function loadDiscordInfo() {
    try {
        const response = await fetch(`${API_CONFIG.discordAPI}api/${API_CONFIG.discordKey}/server-info`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const info = data.server_info;
            document.getElementById('discord-server-name').textContent = info.server_name;
            document.getElementById('discord-server-description').textContent = info.server_description || 'Welcome to our Discord community!';
            document.getElementById('discord-members').textContent = info.server_member_count;
            document.getElementById('discord-online').textContent = info.server_online_member_count;
            
            if (info.server_icon_url) {
                document.getElementById('discord-server-icon').src = info.server_icon_url;
            }
            
            if (info.generated_invite && info.generated_invite.url) {
                document.getElementById('discord-invite').href = info.generated_invite.url;
            }
        }
    } catch (error) {
        console.error('Error loading Discord info:', error);
    }
}

// Setup feedback form
function setupFeedbackForm() {
    const form = document.getElementById('feedback-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        try {
            const response = await fetch(`${API_CONFIG.discordAPI}api/${API_CONFIG.discordKey}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    message: message
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('Feedback sent successfully! Thank you for your message.');
                form.reset();
            } else {
                alert('Error sending feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert('Error sending feedback. Please try again.');
        }
    });
}

// Add dynamic styles for different pages
function addGalleryStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        .gallery-item {
            position: relative;
            border-radius: 15px;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        .gallery-item:hover {
            transform: scale(1.05);
        }
        .gallery-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .gallery-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            color: white;
            padding: 20px;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }
        .gallery-item:hover .gallery-overlay {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

function addPlayerListStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .player-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(26, 26, 46, 0.8);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #0e3460;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .stat-card i {
            font-size: 2rem;
            color: #55ffff;
        }
        .player-list {
            background: rgba(26, 26, 46, 0.8);
            padding: 30px;
            border-radius: 15px;
            border: 1px solid #0e3460;
        }
        .loading-spinner {
            text-align: center;
            padding: 40px;
        }
        .loading-spinner i {
            font-size: 2rem;
            color: #55ffff;
            margin-bottom: 10px;
        }
        .no-players {
            text-align: center;
            padding: