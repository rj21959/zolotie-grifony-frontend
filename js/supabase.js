// Supabase Configuration - PUBLIC ONLY (Safe for client-side)
const SUPABASE_URL = 'https://pwpepihnluwclxdrimmi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cGVwaWhubHV3Y2x4ZHJpbW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTU0NDQsImV4cCI6MjA5Mjk5MTQ0NH0.fiCKvzURAQVJC9Kn-fFV1NN59W4QfVoQsk84Q-vixhg';

// NO SERVICE KEY HERE - IT'S NOW ON THE BACKEND!

// Public client for READ operations
const supabasePublic = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabasePublic = supabasePublic;

// ============ API BASE URL ============
// Change this to your deployed backend URL
const API_BASE_URL = 'https://rj21959-zolotie-grifony-backend-35cc.twc1.net/api';

// ============ PUBLIC READ FUNCTIONS (No auth needed) ============

async function getNews() {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
}

async function getEvents() {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
}

async function getBranches() {
    const response = await fetch(`${API_BASE_URL}/branches`);
    if (!response.ok) throw new Error('Failed to fetch branches');
    return response.json();
}

async function getAwards() {
    const response = await fetch(`${API_BASE_URL}/awards`);
    if (!response.ok) throw new Error('Failed to fetch awards');
    return response.json();
}

async function getMoments() {
    const response = await fetch(`${API_BASE_URL}/moments`);
    if (!response.ok) throw new Error('Failed to fetch moments');
    return response.json();
}

async function getQueries() {
    const token = sessionStorage.getItem('admin_token');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/admin/queries`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch queries');
    return response.json();
}

async function getActiveTheme() {
    const response = await fetch(`${API_BASE_URL}/theme`);
    if (!response.ok) throw new Error('Failed to fetch theme');
    const data = await response.json();
    return data.theme_data || null;
}

async function getHeroVideo() {
    const response = await fetch(`${API_BASE_URL}/hero-video`);
    if (!response.ok) throw new Error('Failed to fetch hero video');
    return response.json();
}

// Add this function to check token validity
async function isTokenValid() {
    const token = sessionStorage.getItem('admin_token');
    if (!token) return false;
    
    try {
        // Try a lightweight request to check if token works
        const response = await fetch(`${API_BASE_URL}/admin/queries`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
            // Token is invalid
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_user');
            localStorage.removeItem('admin_logged_in');
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Update getQueries to handle invalid tokens gracefully
async function getQueries() {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
        console.warn('No admin token found');
        return [];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/queries`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
            console.warn('Token expired, clearing session');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_user');
            localStorage.removeItem('admin_logged_in');
            // Show a friendly message to the user
            alert('Ваша сессия истекла. Пожалуйста, войдите заново.');
            window.location.reload();
            return [];
        }
        
        if (!response.ok) {
            console.error('Failed to fetch queries:', response.status);
            return [];
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching queries:', error);
        return [];
    }
}

// ============ ADMIN WRITE FUNCTIONS (Require JWT token) ============

// Add token refresh timer function ABOVE adminLoginAPI
function startTokenRefreshTimer() {
    // Refresh token every 7 hours (tokens expire in 8 hours)
    setInterval(async () => {
        const token = sessionStorage.getItem('admin_token');
        if (!token) return;
        
        try {
            // Call a refresh endpoint (you need to add this to your server)
            const response = await fetch(`${API_BASE_URL}/admin/refresh-token`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('admin_token', data.token);
                console.log('🔄 Token refreshed automatically');
            }
        } catch (error) {
            console.warn('Token refresh failed:', error);
        }
    }, 7 * 60 * 60 * 1000); // 7 hours
}

// Updated adminLoginAPI with token refresh
async function adminLoginAPI(username, password) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    sessionStorage.setItem('admin_token', data.token);
    sessionStorage.setItem('admin_user', JSON.stringify(data.user));
    
    // ========== START TOKEN REFRESH TIMER ==========
    startTokenRefreshTimer();
    
    return data;
}

function getAuthHeaders() {
    const token = sessionStorage.getItem('admin_token');
    if (!token) throw new Error('Not authenticated');
    return { 'Authorization': `Bearer ${token}` };
}

async function addNews(item) {
    const formData = new FormData();
    formData.append('title', item.title);
    formData.append('description', item.description);
    formData.append('date', item.date);
    formData.append('category', item.category || 'news');
    
    // Handle main image
    if (item.image) {
        if (item.image instanceof File) {
            formData.append('image', item.image);
        } else if (typeof item.image === 'string') {
            // It's a URL (existing image)
            formData.append('image', JSON.stringify(item.image));
        }
    }
    
    if (item.video) formData.append('video', item.video);
    if (item.register_link) formData.append('register_link', item.register_link);
    if (item.location) formData.append('location', item.location);
    if (item.link) formData.append('link', item.link);
    
    // ========== Handle multiple_images - File objects OR URLs ==========
    if (item.multiple_images && item.multiple_images.length > 0) {
        // Check if we have File objects
        const hasFiles = item.multiple_images.some(img => img instanceof File);
        
        if (hasFiles) {
            // Append each File object
            for (let i = 0; i < item.multiple_images.length; i++) {
                if (item.multiple_images[i] instanceof File) {
                    formData.append('multiple_images', item.multiple_images[i]);
                }
            }
            console.log('📤 Sending multiple image files:', item.multiple_images.filter(f => f instanceof File).length);
        } else {
            // Send URLs as JSON string
            formData.append('multiple_images', JSON.stringify(item.multiple_images));
            console.log('📤 Sending multiple image URLs:', item.multiple_images.length);
        }
    } else {
        formData.append('multiple_images', JSON.stringify([]));
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/news`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add news');
    }
    return response.json();
}

async function updateNews(id, item) {
    const formData = new FormData();
    formData.append('title', item.title);
    formData.append('description', item.description);
    formData.append('date', item.date);
    formData.append('category', item.category || 'news');
    
    if (item.image) {
        if (item.image instanceof File) {
            formData.append('image', item.image);
        } else if (typeof item.image === 'string') {
            formData.append('image', JSON.stringify(item.image));
        }
    }
    if (item.video) formData.append('video', item.video);
    if (item.register_link) formData.append('register_link', item.register_link);
    if (item.location) formData.append('location', item.location);
    if (item.link) formData.append('link', item.link);
    
    if (item.multiple_images && item.multiple_images.length > 0) {
        const hasFiles = item.multiple_images.some(img => img instanceof File);
        
        if (hasFiles) {
            for (let i = 0; i < item.multiple_images.length; i++) {
                if (item.multiple_images[i] instanceof File) {
                    formData.append('multiple_images', item.multiple_images[i]);
                }
            }
        } else {
            formData.append('multiple_images', JSON.stringify(item.multiple_images));
        }
    } else {
        formData.append('multiple_images', JSON.stringify([]));
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update news');
    }
    return response.json();
}

async function deleteNews(id) {
    const response = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete news');
    }
    return response.json();
}

// Branches
async function addBranch(item) {
    const formData = new FormData();
    formData.append('title', item.title);
    if (item.city) formData.append('city', item.city);
    if (item.vk_link) formData.append('vk_link', item.vk_link);
    if (item.description) formData.append('description', item.description);
    if (item.date) formData.append('date', item.date);
    if (item.image) formData.append('image', item.image);
    
    const response = await fetch(`${API_BASE_URL}/admin/branches`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add branch');
    }
    return response.json();
}

async function updateBranch(id, item) {
    const formData = new FormData();
    formData.append('title', item.title);
    if (item.city) formData.append('city', item.city);
    if (item.vk_link) formData.append('vk_link', item.vk_link);
    if (item.description) formData.append('description', item.description);
    if (item.date) formData.append('date', item.date);
    if (item.image) formData.append('image', item.image);
    
    const response = await fetch(`${API_BASE_URL}/admin/branches/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update branch');
    }
    return response.json();
}

async function deleteBranch(id) {
    const response = await fetch(`${API_BASE_URL}/admin/branches/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete branch');
    }
    return response.json();
}

// Awards
async function addAward(item) {
    const formData = new FormData();
    formData.append('title', item.title);
    formData.append('organization', item.organization);
    formData.append('year', item.year);
    if (item.description) formData.append('description', item.description);
    if (item.link) formData.append('link', item.link);
    if (item.image) formData.append('image', item.image);
    
    const response = await fetch(`${API_BASE_URL}/admin/awards`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add award');
    }
    return response.json();
}

async function updateAward(id, item) {
    const formData = new FormData();
    formData.append('title', item.title);
    formData.append('organization', item.organization);
    formData.append('year', item.year);
    if (item.description) formData.append('description', item.description);
    if (item.link) formData.append('link', item.link);
    if (item.image) formData.append('image', item.image);
    
    const response = await fetch(`${API_BASE_URL}/admin/awards/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update award');
    }
    return response.json();
}

// Rename this function in supabase.js
async function deleteAwardFromDB(id) {
    const response = await fetch(`${API_BASE_URL}/admin/awards/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete award');
    }
    return response.json();
}


// Moments
async function addMoment(item) {
    const response = await fetch(`${API_BASE_URL}/admin/moments`, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add moment');
    }
    return response.json();
}

async function updateMoment(id, item) {
    const response = await fetch(`${API_BASE_URL}/admin/moments/${id}`, {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: item.title,
            description: item.description || '',
            videoUrl: item.videoUrl,
            // ❌ REMOVED: link: item.link || '',
            thumbnail: item.thumbnail || null
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update moment');
    }
    return response.json();
}

// In supabase.js - Rename this function
async function deleteMomentFromDB(id) {
    const response = await fetch(`${API_BASE_URL}/admin/moments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete moment');
    }
    return response.json();
}

async function updateQueryReply(id, reply) {
    const response = await fetch(`${API_BASE_URL}/admin/queries/${id}/reply`, {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            reply: reply,
            status: 'replied'  // ← Explicitly set status
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update query');
    }
    return response.json();
}

async function deleteQuery(id) {
    const response = await fetch(`${API_BASE_URL}/admin/queries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete query');
    }
    return response.json();
}

// Contact form submission (no auth needed)
async function submitQuery(name, email, message) {
    const response = await fetch(`${API_BASE_URL}/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit query');
    }
    return response.json();
}

// Theme
async function updateActiveTheme(themeData) {
    const response = await fetch(`${API_BASE_URL}/admin/theme`, {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ themeData })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update theme');
    }
    return response.json();
}

// Hero Video
async function saveHeroVideo(file) {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await fetch(`${API_BASE_URL}/admin/hero-video`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload hero video');
    }
    return response.json();
}

async function resetHeroVideo() {
    const response = await fetch(`${API_BASE_URL}/admin/hero-video`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset hero video');
    }
    return response.json();
}
async function getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
}

async function updateStats(statsData) {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(statsData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stats');
    }
    return response.json();
}

// Archive a query - WITH CALLBACK
async function archiveQuery(id, onSuccess = null) {
    if (!confirm('Переместить запрос в архив?')) return;
    
    try {
        const token = sessionStorage.getItem('admin_token');
        const response = await fetch(`${API_BASE_URL}/admin/queries/${id}/archive`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to archive query');
        }
        
        // Call the callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
            await onSuccess();
        } else {
            // Fallback: reload the page
            window.location.reload();
        }
        alert('✅ Запрос перемещен в архив');
    } catch (error) {
        console.error('Error archiving query:', error);
        alert('❌ Ошибка: ' + error.message);
    }
}

// Unarchive a query - WITH CALLBACK
async function unarchiveQuery(id, onSuccess = null) {
    if (!confirm('Восстановить запрос из архива?')) return;
    
    try {
        const token = sessionStorage.getItem('admin_token');
        const response = await fetch(`${API_BASE_URL}/admin/queries/${id}/unarchive`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to unarchive query');
        }
        
        // Call the callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
            await onSuccess();
        } else {
            // Fallback: reload the page
            window.location.reload();
        }
        alert('✅ Запрос восстановлен из архива');
    } catch (error) {
        console.error('Error unarchiving query:', error);
        alert('❌ Ошибка: ' + error.message);
    }
}



// ============ EXPORT FUNCTIONS ============
window.adminLoginAPI = adminLoginAPI;
window.startTokenRefreshTimer = startTokenRefreshTimer; // ← ADD THIS LINE
window.getNews = getNews;
window.getEvents = getEvents;
window.getBranches = getBranches;
window.getAwards = getAwards;
window.getMoments = getMoments;
window.getQueries = getQueries;
window.getActiveTheme = getActiveTheme;
window.getHeroVideo = getHeroVideo;
window.submitQuery = submitQuery;

window.addNews = addNews;
window.updateNews = updateNews;
window.deleteNews = deleteNews;
window.addBranch = addBranch;
window.updateBranch = updateBranch;
window.deleteBranch = deleteBranch;
window.addAward = addAward;
window.updateAward = updateAward;
window.deleteAwardFromDB = deleteAwardFromDB;
window.deleteAward = deleteAwardFromDB;window.addMoment = addMoment;
window.updateMoment = updateMoment;
window.deleteMomentFromDB = deleteMomentFromDB;
window.updateQueryReply = updateQueryReply;
window.deleteQuery = deleteQuery;
window.updateActiveTheme = updateActiveTheme;
window.saveHeroVideo = saveHeroVideo;
window.resetHeroVideo = resetHeroVideo;
window.getAuthHeaders = getAuthHeaders;
window.getStats = getStats;
window.updateStats = updateStats;


console.log('✅ Supabase public client initialized (NO SERVICE KEY exposed)');
console.log('✅ Backend API URL:', API_BASE_URL);