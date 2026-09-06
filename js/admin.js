// Admin Panel JavaScript

// Force reset admin account and login state
if (!localStorage.getItem('admin_account')) {
    localStorage.setItem('admin_account', JSON.stringify({
        username: 'admin',
        password: 'admin123',
        email: 'admin@zolotiegrifony.ru'
    }));
}
// Ensure login state is false on page load
if (window.location.pathname.includes('admin.html')) {
    // Don't auto-login, let the modal show
    if (!localStorage.getItem('admin_logged_in')) {
        localStorage.setItem('admin_logged_in', 'false');
    }
}
// Check for and remove duplicates (run once)
if (typeof window._dedupDone === 'undefined') {
    window._dedupDone = true;
    console.log('Cleaning up duplicates...');
}

// ============ AUTHENTICATION SYSTEM ============

// Default admin credentials (first time setup)
const DEFAULT_ADMIN = {
    username: 'Rajshekhar',  // ← Changed from 'admin' to 'Rajshekhar'
    password: 'admin123',
    email: 'zolotiegrifony@mail.ru'
};

// ============ SYNC ADMIN ACCOUNT ============
function syncAdminAccount() {
    const storedAdmin = localStorage.getItem('admin_account');
    const VALID_EMAIL = 'zolotiegrifony@mail.ru';
    
    if (!storedAdmin) {
        const defaultAdmin = {
            username: 'Rajshekhar',  // Match your Supabase username
            password: 'admin123',
            email: VALID_EMAIL
        };
        localStorage.setItem('admin_account', JSON.stringify(defaultAdmin));
        console.log('✅ Default admin created with email:', VALID_EMAIL);
        return;
    }
    
    try {
        const admin = JSON.parse(storedAdmin);
        
        // FORCE the correct email
        if (admin.email !== VALID_EMAIL) {
            const updatedAdmin = {
                username: admin.username || 'Rajshekhar',
                password: admin.password || 'admin123',
                email: VALID_EMAIL
            };
            localStorage.setItem('admin_account', JSON.stringify(updatedAdmin));
            console.log('✅ Email forced to:', VALID_EMAIL);
        }
        
        // Make sure username matches Supabase
        if (admin.username !== 'Rajshekhar') {
            const updatedAdmin = {
                username: 'Rajshekhar',
                password: admin.password || 'admin123',
                email: admin.email || VALID_EMAIL
            };
            localStorage.setItem('admin_account', JSON.stringify(updatedAdmin));
            console.log('✅ Username forced to: Rajshekhar');
        }
    } catch (e) {
        console.error('Error parsing admin account:', e);
        // Recreate if corrupt
        const defaultAdmin = {
            username: 'Rajshekhar',
            password: 'admin123',
            email: VALID_EMAIL
        };
        localStorage.setItem('admin_account', JSON.stringify(defaultAdmin));
    }
}


// Run once on load
syncAdminAccount();
// Initialize admin account if not exists
function initAdminAccount() {
    if (!localStorage.getItem('admin_account')) {
        localStorage.setItem('admin_account', JSON.stringify(DEFAULT_ADMIN));
        console.log('Default admin account created');
    }
}

// Check login
function checkAdminLogin() {
    return localStorage.getItem('admin_logged_in') === 'true';
}

// ============ AUTHENTICATION SYSTEM ============

async function adminLogin(username, password) {
    try {
        const result = await adminLoginAPI(username, password);
        // adminLoginAPI sets sessionStorage 'admin_token'
        console.log('✅ Login SUCCESS');
        return true;
    } catch (error) {
        console.error('❌ Login FAILED:', error.message);
        alert('Неверное имя пользователя или пароль');
        return false;
    }
}

function checkAdminLogin() {
    return !!sessionStorage.getItem('admin_token');
}

// Logout function
function adminLogout() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    localStorage.removeItem('admin_logged_in');
    window.location.reload();
}


// Generate random reset code
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send reset email via EmailJS - FIXED VERSION
async function sendResetEmail(email, resetCode) {
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS not loaded');
        alert('Email сервис не загружен. Код восстановления: ' + resetCode);
        return false;
    }
    
    try {
        await emailjs.send(
            'Maria@2009',
            'template_gz86vcg',
            {
                email: email,                    // ← CHANGED: was 'to_email: email'
                to_name: 'Администратор',
                user_query: 'Запрос на восстановление пароля',
                admin_reply: `Ваш код для сброса пароля: ${resetCode}\n\nВведите этот код в форму восстановления.`,
                reply_date: new Date().toLocaleString('ru-RU')
            },
            'Q0PDtzoS4rqXI8AI5'
        );
        console.log('✅ Reset email sent successfully to:', email);
        alert('Код восстановления отправлен на ваш email');
        return true;
    } catch (error) {
        console.error('❌ Email failed:', error);
        alert('Не удалось отправить email. Код восстановления: ' + resetCode);
        return false;
    }
}

// Data storage keys
const STORAGE_KEYS = {
    NEWS: 'golden_griffons_news',
    EVENTS: 'golden_griffons_events',
    BRANCHES: 'golden_griffons_branches',
    QUERIES: 'golden_griffons_queries' ,
    AWARDS: 'golden_griffons_awards',
    MOMENTS: 'golden_griffons_moments'  // ← ADD THIS LINE
};

// Helper function to escape HTML (add this if you don't have it)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ============ AUTHENTICATION FUNCTIONS ============


// Update admin credentials
function updateAdminCredentials(newUsername, newPassword) {
    const admin = JSON.parse(localStorage.getItem('admin_account'));
    if (newUsername) admin.username = newUsername;
    if (newPassword) admin.password = newPassword;
    localStorage.setItem('admin_account', JSON.stringify(admin));
    return true;
}
// Make sure showThemeNotification exists
function showThemeNotification(message) {
    let notification = document.querySelector('.theme-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.animation = '';
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', async function() {
    // ========== TOKEN VALIDATION ==========
    const token = sessionStorage.getItem('admin_token');
    const isLoggedIn = !!token;
    
    console.log('Page loaded - isLoggedIn:', isLoggedIn);

    if (isLoggedIn) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/queries`, {
                headers: { 'Authorization': `Bearer ${token}` },
                method: 'HEAD'
            });
            
            if (response.status === 401 || response.status === 403) {
                console.warn('Token expired on page load');
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                localStorage.removeItem('admin_logged_in');
                const loginModalElem = document.getElementById('loginModal');
                if (loginModalElem) loginModalElem.style.display = 'flex';
                return;
            }
        } catch (error) {
            console.warn('Token validation failed:', error);
            const loginModalElem = document.getElementById('loginModal');
            if (loginModalElem) loginModalElem.style.display = 'flex';
            return;
        }
    }
    
    // ========== GET MODAL ELEMENTS ==========
    const loginModalElem = document.getElementById('loginModal');
    const forgotModalElem = document.getElementById('forgotModal');
    const resetModalElem = document.getElementById('resetModal');
    
    if (!isLoggedIn) {
        // Hide any visible modals first
        if (loginModalElem) loginModalElem.style.display = 'flex';
        if (forgotModalElem) forgotModalElem.style.display = 'none';
        if (resetModalElem) resetModalElem.style.display = 'none';
        
        // Login form handler
        const loginFormElem = document.getElementById('loginForm');
        if (loginFormElem) {
            const newLoginForm = loginFormElem.cloneNode(true);
            loginFormElem.parentNode.replaceChild(newLoginForm, loginFormElem);
            
            newLoginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                
                console.log('Attempting backend login with:', username);
                
                try {
                    const result = await adminLoginAPI(username, password);
                    
                    if (loginModalElem) loginModalElem.style.display = 'none';
                    if (forgotModalElem) forgotModalElem.style.display = 'none';
                    if (resetModalElem) resetModalElem.style.display = 'none';
                    
                    console.log('✅ Backend Login SUCCESS');
                    initAdmin();
                    
                } catch (error) {
                    console.error('❌ Backend Login FAILED:', error.message);
                    alert('Ошибка: ' + error.message);
                }
            });
        }
        
        // Forgot password link
        const forgotLinkElem = document.getElementById('forgotPasswordLink');
        if (forgotLinkElem) {
            forgotLinkElem.addEventListener('click', function(e) {
                e.preventDefault();
                if (loginModalElem) loginModalElem.style.display = 'none';
                if (forgotModalElem) forgotModalElem.style.display = 'flex';
            });
        }
        
    // Forgot form handler - ONLY sends OTP to the registered admin email
const forgotFormElem = document.getElementById('forgotForm');
if (forgotFormElem) {
    forgotFormElem.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email) {
            alert('❌ Пожалуйста, введите email');
            return;
        }
        
        // Get the admin email from localStorage
        const admin = JSON.parse(localStorage.getItem('admin_account'));
        const adminEmail = admin.email;
        
        console.log('📧 Entered email');
        console.log('📧 Admin email in system');
        
        // ONLY send OTP if the email matches the admin email
        if (email !== adminEmail) {
            alert('❌ Пользователь с таким email не найден');
            return;
        }
        
        try {
            localStorage.setItem('reset_email', email);
            const resetCode = generateResetCode();
            localStorage.setItem('reset_code', resetCode);
            await sendResetEmail(email, resetCode);
            
            alert('✅ Код восстановления отправлен на ваш email');
            if (forgotModalElem) forgotModalElem.style.display = 'none';
            if (resetModalElem) resetModalElem.style.display = 'flex';
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Ошибка: ' + error.message);
        }
    });
}
        
  // Reset form handler - INSIDE DOMContentLoaded (KEEP THIS ONE)
const resetFormElem = document.getElementById('resetForm');
if (resetFormElem) {
    resetFormElem.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = document.getElementById('resetCode').value;
        const newUsername = document.getElementById('resetNewUsername').value.trim();
        const newPassword = document.getElementById('resetNewPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;
        
        const savedCode = localStorage.getItem('reset_code');
        const resetEmail = localStorage.getItem('reset_email');
        
        // ONLY check OTP
        if (code !== savedCode) {
            alert('❌ Неверный код подтверждения');
            return;
        }
        
        // Check passwords match
        if (newPassword !== confirmPassword) {
            alert('❌ Пароли не совпадают');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('❌ Пароль должен содержать минимум 6 символов');
            return;
        }
        
        if (!resetEmail) {
            alert('❌ Email не найден. Пожалуйста, запросите сброс заново.');
            return;
        }
        
        try {
            console.log('🔄 Resetting password');
            console.log('📝 New username:', newUsername || 'keeping current');
            
            // ========== USE EMAIL TO FIND THE USER ==========
            const response = await fetch(`${API_BASE_URL}/admin/setup-reset-by-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: resetEmail,  // Find user by EMAIL
                    newPassword: newPassword,
                    newUsername: newUsername || null
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка обновления');
            }
            
            console.log('✅ Reset successful:', data);
            
            // Update localStorage
            const updatedAdmin = {
                username: data.username || 'Natalya',
                password: newPassword,
                email: resetEmail
            };
            localStorage.setItem('admin_account', JSON.stringify(updatedAdmin));
            
            // Clean up
            localStorage.removeItem('reset_code');
            localStorage.removeItem('reset_email');
            localStorage.removeItem('admin_logged_in');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_user');
            
            alert(`✅ Пароль успешно обновлен! Новый логин: ${updatedAdmin.username}`);
            
            // Show login modal
            const resetModalElem = document.getElementById('resetModal');
            const loginModalElem = document.getElementById('loginModal');
            const forgotModalElem = document.getElementById('forgotModal');
            
            if (resetModalElem) resetModalElem.style.display = 'none';
            if (forgotModalElem) forgotModalElem.style.display = 'none';
            if (loginModalElem) {
                loginModalElem.style.display = 'flex';
                document.getElementById('loginUsername').value = updatedAdmin.username;
                document.getElementById('loginPassword').value = '';
            }
            
        } catch (err) {
            console.error('❌ Reset error:', err);
            alert('❌ Ошибка: ' + err.message);
        }
    });
}
        
        // Close modal handlers
        const closeModalBtns = document.querySelectorAll('.close-modal');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (forgotModalElem) forgotModalElem.style.display = 'none';
                if (resetModalElem) resetModalElem.style.display = 'none';
                if (loginModalElem) loginModalElem.style.display = 'flex';
            });
        });
        
    } else {
        if (loginModalElem) loginModalElem.style.display = 'none';
        if (forgotModalElem) forgotModalElem.style.display = 'none';
        if (resetModalElem) resetModalElem.style.display = 'none';
        initAdmin();
    }
    
    // ========== IMAGE PREVIEW HANDLERS ==========
    const mainImageInput = document.getElementById('itemImage');
    if (mainImageInput) {
        mainImageInput.addEventListener('change', function(e) {
            const previewArea = document.getElementById('imagePreview');
            const previewImage = document.getElementById('previewImg');
            if (e.target.files && e.target.files[0]) {
                const fileReader = new FileReader();
                fileReader.onload = function(ev) {
                    previewImage.src = ev.target.result;
                    if (previewArea) previewArea.style.display = 'block';
                };
                fileReader.readAsDataURL(e.target.files[0]);
            } else {
                if (previewArea) previewArea.style.display = 'none';
            }
        });
    }
    
    // Form event listeners
    const awardFormElem = document.getElementById('awardForm');
    if (awardFormElem) {
        awardFormElem.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAward();
        });
    }
    
    const momentFormElem = document.getElementById('momentForm');
    if (momentFormElem) {
        momentFormElem.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Moment form submitted');
            saveMoment();
        });
    }
    
    // Close Modal Handlers
    const awardModalCloseBtn = document.querySelector('#awardModal .close-modal');
    if (awardModalCloseBtn) {
        awardModalCloseBtn.addEventListener('click', function() {
            document.getElementById('awardModal').style.display = 'none';
        });
    }
    
    const momentModalCloseBtn = document.querySelector('#momentModal .close-modal');
    if (momentModalCloseBtn) {
        momentModalCloseBtn.addEventListener('click', function() {
            document.getElementById('momentModal').style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        const awardModalElem = document.getElementById('awardModal');
        const momentModalElem = document.getElementById('momentModal');
        
        if (e.target === awardModalElem) {
            awardModalElem.style.display = 'none';
        }
        if (e.target === momentModalElem) {
            momentModalElem.style.display = 'none';
        }
    });

    // ========== MOMENT THUMBNAIL PREVIEW ==========
    const momentThumbnailInput = document.getElementById('momentThumbnail');
    if (momentThumbnailInput) {
        momentThumbnailInput.addEventListener('change', function(e) {
            const previewContainer = document.getElementById('momentThumbnailPreview');
            if (!previewContainer) return;
            
            if (e.target.files && e.target.files[0]) {
                const fileReader = new FileReader();
                fileReader.onload = function(ev) {
                    previewContainer.innerHTML = `<img src="${ev.target.result}" style="max-width:150px; border-radius:8px; border:2px solid var(--primary);">`;
                };
                fileReader.readAsDataURL(e.target.files[0]);
            } else {
                previewContainer.innerHTML = '';
            }
        });
    }

    // ========== NEWS MULTIPLE IMAGES PREVIEW - USING FILE OBJECTS ==========
const multipleImagesInput = document.getElementById('itemMultipleImages');
if (multipleImagesInput) {
    const newInput = multipleImagesInput.cloneNode(true);
    multipleImagesInput.parentNode.replaceChild(newInput, multipleImagesInput);
    
    // Store File objects in a global array
    if (!window._myImageFiles) {
        window._myImageFiles = [];
    }
    
    newInput.addEventListener('change', function(e) {
        const previewContainer = document.getElementById('multipleImagesPreview');
        if (!previewContainer) return;
        
        const files = e.target.files;
        if (files && files.length > 0) {
            for (let file of files) {
                // Store the actual File object
                window._myImageFiles.push(file);
                
                // Create preview using URL.createObjectURL (no Base64!)
                const imgSrc = URL.createObjectURL(file);
                
                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'position: relative; display: inline-block; margin-right: 10px; margin-bottom: 10px;';
                wrapper.dataset.fileName = file.name;
                wrapper.dataset.fileSize = file.size;
                
                const img = document.createElement('img');
                img.src = imgSrc;
                img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--primary);';
                
                const deleteBtn = document.createElement('span');
                deleteBtn.innerHTML = '&times;';
                deleteBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #e74c3c; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
                
                deleteBtn.onclick = function() {
                    // Find and remove the file from the array by name and size
                    const fileName = wrapper.dataset.fileName;
                    const fileSize = parseInt(wrapper.dataset.fileSize);
                    
                    window._myImageFiles = window._myImageFiles.filter(f => {
                        return !(f.name === fileName && f.size === fileSize);
                    });
                    
                    wrapper.remove();
                    console.log("Remaining files:", window._myImageFiles.length);
                    
                    // Clean up the object URL to free memory
                    URL.revokeObjectURL(imgSrc);
                };
                
                wrapper.appendChild(img);
                wrapper.appendChild(deleteBtn);
                previewContainer.appendChild(wrapper);
            }
            
            // Clear the input so the same files can be selected again if needed
            this.value = '';
            console.log('📸 Files stored:', window._myImageFiles.length);
        }
    });
}

    // ============ RESET THEME BUTTON HANDLER ============
    const resetThemeBtn = document.getElementById('resetMainThemeBtn');
    if (resetThemeBtn) {
        const newResetBtn = resetThemeBtn.cloneNode(true);
        resetThemeBtn.parentNode.replaceChild(newResetBtn, resetThemeBtn);
        
        newResetBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('🔄 Reset button clicked - UPDATING SUPABASE');
            
            const defaultColors = {
                primary: '#F5A623',
                secondary: '#1a1a2e',
                accent: '#764ba2',
                background: '#ffffff'
            };
            
            const defaultThemeData = {
                type: 'default',
                name: 'Стандартная',
                colors: defaultColors
            };
            
            try {
                const { error } = await supabaseAdmin
                    .from('site_settings')
                    .update({ 
                        active_theme: 'default',
                        theme_data: defaultThemeData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', 1);
                
                if (error) {
                    console.error('Supabase error:', error);
                    showThemeNotification('❌ Ошибка обновления базы данных: ' + error.message, 'error');
                    return;
                }
                
                console.log('✅ Supabase updated to default theme');
                localStorage.removeItem('main_page_theme');
                
                const themeNameSpan = document.getElementById('currentThemeName');
                if (themeNameSpan) themeNameSpan.textContent = 'Стандартная';
                
                const previewContainer = document.getElementById('currentMainThemePreview');
                if (previewContainer) {
                    const colorBoxes = previewContainer.querySelectorAll('div div');
                    if (colorBoxes.length >= 3) {
                        colorBoxes[0].style.backgroundColor = defaultColors.primary;
                        colorBoxes[1].style.backgroundColor = defaultColors.secondary;
                        colorBoxes[2].style.backgroundColor = defaultColors.accent;
                    }
                    previewContainer.style.background = `linear-gradient(135deg, ${defaultColors.secondary}, ${defaultColors.primary})`;
                }
                
                const primaryPicker = document.getElementById('mainPrimaryColor');
                const secondaryPicker = document.getElementById('mainSecondaryColor');
                const accentPicker = document.getElementById('mainAccentColor');
                const bgPicker = document.getElementById('mainBackgroundColor');
                
                if (primaryPicker) primaryPicker.value = defaultColors.primary;
                if (secondaryPicker) secondaryPicker.value = defaultColors.secondary;
                if (accentPicker) accentPicker.value = defaultColors.accent;
                if (bgPicker) bgPicker.value = defaultColors.background;
                
                const cards = document.querySelectorAll('.festival-card');
                cards.forEach(card => {
                    card.style.borderColor = '#e0e0e0';
                    card.style.backgroundColor = 'white';
                    card.style.transform = 'scale(1)';
                });
                
                showThemeNotification('✅ Тема сброшена к стандартной! Обновите главную страницу.', 'success');
                
            } catch (err) {
                console.error('Reset error:', err);
                showThemeNotification('❌ Ошибка: ' + err.message, 'error');
            }
        });
    }

    const autoDetectBtn = document.getElementById('autoDetectFestivalBtn');
    if (autoDetectBtn) {
        const newAutoBtn = autoDetectBtn.cloneNode(true);
        autoDetectBtn.parentNode.replaceChild(newAutoBtn, autoDetectBtn);
        
        newAutoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            autoDetectAndApplyFestival();
        });
    }

    // ========== FESTIVAL THEME INITIALIZATION ==========
    setTimeout(async () => {
        initFestivalCards();
        await loadSavedAdminTheme();
        console.log('✅ Festival theme system initialized');
    }, 100);
});

async function initAdmin() {
    initNavigation();
    await loadDashboardData();  // Added await
    await loadNewsTable();      // Added await
    await loadEventsTable();    // Added await
    await loadBranchesTable();  // Added await
    await loadQueries();        // Added await
    await loadAwardsTable();    // Added await
    await loadMomentsTable();   // Added await
    await loadCurrentHeroVideo();
    initHeroVideoUpload();
    initQueryFilters();
    initAutoDeleteSchedule();
    initModals();
    initLogout();
    loadAdminProfile();
    initAvatarUpload();
    initColorSettings();
    initStatsSection();  // <-- ADD THIS LINE
    
    // Get button elements INSIDE the function
    const addNewsBtn = document.getElementById('addNewsBtn');
    const addEventBtn = document.getElementById('addEventBtn');
    const addBranchBtn = document.getElementById('addBranchBtn');
    const addAwardBtn = document.getElementById('addAwardBtn');
    const addMomentBtn = document.getElementById('addMomentBtn');
    
    if (addNewsBtn) addNewsBtn.addEventListener('click', () => openModal('news'));
    if (addEventBtn) addEventBtn.addEventListener('click', () => openModal('event'));
    if (addBranchBtn) addBranchBtn.addEventListener('click', () => openModal('branch'));
    if (addAwardBtn) addAwardBtn.addEventListener('click', () => openAwardModal());
    if (addMomentBtn) addMomentBtn.addEventListener('click', () => openMomentModal());
    
        // ========== FIXED ADMIN SETTINGS FORM (Uses Backend Routes) ==========
    const adminSettingsForm = document.getElementById('adminSettingsForm');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const newUsername = document.getElementById('newUsername').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword && newPassword !== confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }

            try {
                const token = sessionStorage.getItem('admin_token');
                const currentPassword = prompt('Для безопасности введите ваш ТЕКУЩИЙ пароль:');
                if (!currentPassword) {
                    alert('Операция отменена');
                    return;
                }

                // 1. Update Password
                if (newPassword) {
                    const passwordResponse = await fetch(`${API_BASE_URL}/admin/settings/password`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            currentPassword: currentPassword,
                            newPassword: newPassword 
                        })
                    });

                    if (!passwordResponse.ok) {
                        const error = await passwordResponse.json();
                        throw new Error(error.error || 'Не удалось обновить пароль');
                    }
                    alert('✅ Пароль успешно изменен!');
                }

                // 2. Update Username
                if (newUsername) {
                    const usernameResponse = await fetch(`${API_BASE_URL}/admin/settings/username`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ newUsername })
                    });

                    if (!usernameResponse.ok) {
                        const error = await usernameResponse.json();
                        throw new Error(error.error || 'Не удалось обновить логин');
                    }
                    alert('✅ Логин успешно изменен!');
                }

                // 3. Logout and reload
                localStorage.removeItem('admin_logged_in');
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                window.location.reload();

            } catch (error) {
                console.error('Error updating credentials:', error);
                alert('❌ Ошибка: ' + error.message);
            }
        });
    }
    // ==================================================
    
    populateEnhancedFestivals();
    
    // ============ CONNECT CUSTOM THEME BUTTON ============
    const customThemeBtn = document.getElementById('applyCustomMainThemeBtn');
    if (customThemeBtn) {
        // Remove any existing listeners
        const newCustomBtn = customThemeBtn.cloneNode(true);
        customThemeBtn.parentNode.replaceChild(newCustomBtn, customThemeBtn);
        
        newCustomBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎨 Custom theme button clicked');
            window.applyCustomMainTheme();
        });
        console.log('✅ Custom theme button connected');
    } else {
        console.log('❌ Custom theme button not found');
    }
    
    // Also ensure reset button is connected to Supabase
    const resetBtn = document.getElementById('resetMainThemeBtn');
    if (resetBtn) {
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        
        newResetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔄 Reset button clicked - updating Supabase');
            window.resetMainTheme();
        });
    }

}
// Open Award Modal
async function openAwardModal(editId = null) {
    const modal = document.getElementById('awardModal');
    const form = document.getElementById('awardForm');
    form.reset();
    document.getElementById('awardId').value = '';
    document.getElementById('awardImagePreview').innerHTML = '';
    
    // ========== ADD THIS BLOCK TO SHOW NEW IMAGE PREVIEW ==========
    const awardImageInput = document.getElementById('awardImage');
    if (awardImageInput) {
        // Clone the input to remove old listeners
        const newAwardInput = awardImageInput.cloneNode(true);
        awardImageInput.parentNode.replaceChild(newAwardInput, awardImageInput);
        
        // Add a new listener to show the NEW image when picked
        newAwardInput.addEventListener('change', function(e) {
            const previewContainer = document.getElementById('awardImagePreview');
            
            if (e.target.files && e.target.files[0]) {
                // Clear old preview
                previewContainer.innerHTML = ''; 
                
                // Read the new file and show it
                const fileReader = new FileReader();
                fileReader.onload = function(ev) {
                    // Create the img tag and append it to the preview container
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.style.cssText = 'max-width:150px; border-radius:8px;';
                    previewContainer.appendChild(img);
                };
                fileReader.readAsDataURL(e.target.files[0]);
            } else {
                // If the file input is cleared, clear the preview
                previewContainer.innerHTML = ''; 
            }
        });
    }
    // ========== END OF ADDED BLOCK ==========
    
    // ========== POPULATE YEAR DROPDOWN (2019 to current year) ==========
    const yearSelect = document.getElementById('awardYear');
    if (yearSelect) {
        // Store current value if editing
        const currentValue = yearSelect.value;
        
        // Clear and repopulate
        yearSelect.innerHTML = '<option value="">Выберите год</option>';
        const currentYear = new Date().getFullYear();
        const startYear = 2019;
        
        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        
        // Restore value if editing
        if (currentValue && currentValue !== '') {
            yearSelect.value = currentValue;
        }
    }
    // ========== END OF YEAR DROPDOWN ==========
    
    if (editId) {
        const awards = await getAwards();
        const award = awards.find(a => a.id == editId);
        if (award) {
            document.getElementById('awardId').value = award.id;
            document.getElementById('awardTitle').value = award.title;
            document.getElementById('awardOrganization').value = award.organization;
            document.getElementById('awardYear').value = award.year;
            document.getElementById('awardDescription').value = award.description || '';
            document.getElementById('awardLink').value = award.link || '';
            if (award.image) {
                document.getElementById('awardImagePreview').innerHTML = `<img src="${award.image}" style="max-width:150px; border-radius:8px;">`;
            }
            document.querySelector('#awardModal h2').textContent = 'Редактировать награду';
        }
    } else {
        document.querySelector('#awardModal h2').textContent = 'Добавить награду';
    }
    
    modal.style.display = 'flex';
}

// Open Moment Modal - REMOVED link field
async function openMomentModal(editId = null) {
    const modal = document.getElementById('momentModal');
    const form = document.getElementById('momentForm');
    form.reset();
    document.getElementById('momentId').value = '';
    
    const previewContainer = document.getElementById('momentThumbnailPreview');
    if (previewContainer) previewContainer.innerHTML = '';
    
    if (editId) {
        const moments = await getMoments();
        const moment = moments.find(m => m.id == editId);
        if (moment) {
            document.getElementById('momentId').value = moment.id;
            document.getElementById('momentTitle').value = moment.title;
            document.getElementById('momentDescription').value = moment.description || '';
            document.getElementById('momentVideoUrl').value = moment.video_url;
            // ❌ REMOVED: document.getElementById('momentLink').value = moment.link || '';
            
            if (moment.thumbnail && previewContainer) {
                previewContainer.innerHTML = `<img src="${moment.thumbnail}" style="max-width:150px; border-radius:8px; border:2px solid var(--primary);">`;
            }
            
            document.querySelector('#momentModal h2').textContent = 'Редактировать видео';
        }
    } else {
        document.querySelector('#momentModal h2').textContent = 'Добавить видео';
    }
    
    modal.style.display = 'flex';
}
// Add this helper function to admin.js
async function refreshTokenIfNeeded() {
    try {
        const token = sessionStorage.getItem('admin_token');
        if (!token) return false;
        
        const response = await fetch(`${API_BASE_URL}/admin/refresh-token`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('admin_token', data.token);
            console.log('🔄 Token refreshed');
            return true;
        }
        return false;
    } catch (error) {
        console.warn('Token refresh failed:', error);
        return false;
    }
}
async function saveAward() {
    const id = document.getElementById('awardId').value;
    const title = document.getElementById('awardTitle').value;
    const organization = document.getElementById('awardOrganization').value;
    let year = document.getElementById('awardYear').value;
    const description = document.getElementById('awardDescription').value;
    const link = document.getElementById('awardLink').value;
    const imageFile = document.getElementById('awardImage').files[0];
    
    if (!title || !organization || !year) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Year validation
    year = year.toString().replace(/[^0-9]/g, '');
    if (year.length === 0) {
        alert('Пожалуйста, введите год (только цифры)');
        return;
    }
    if (year.length !== 4) {
        alert('Год должен состоять из 4 цифр (например: 2024)');
        return;
    }
    
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    const minYear = 2019;
    
    if (yearNum < minYear) {
        alert(`Год не может быть меньше ${minYear} (год основания организации)`);
        return;
    }
    if (yearNum > currentYear) {
        alert(`Год не может быть больше ${currentYear} (текущий год)`);
        return;
    }
    
    const saveBtn = document.querySelector('#awardModal .btn-primary');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Сохранение...';
    saveBtn.disabled = true;
    
    const saveWithImage = async (imageData) => {
        try {
            // Refresh token if needed
            await refreshTokenIfNeeded();
            
            let finalImage = imageData;
            
            if (id && !imageFile) {
                const existingAwards = await getAwards();
                const existingAward = existingAwards.find(a => a.id == id);
                if (existingAward && existingAward.image) {
                    finalImage = existingAward.image;
                    console.log('📸 Preserved existing image');
                }
            }
            
            const awardData = { 
                title: title,
                organization: organization,
                year: yearNum,
                description: description || '',
                link: link || '',
                image: finalImage || null
            };
            
            let result;
            if (id) {
                result = await updateAward(parseInt(id), awardData);
                console.log('Award updated:', id);
            } else {
                result = await addAward(awardData);
                console.log('New award added');
            }
            
            document.getElementById('awardModal').style.display = 'none';
            await loadAwardsTable();
            alert('✅ Награда сохранена успешно!');
            
        } catch (error) {
            console.error('Save award error:', error);
            
            // Check if token is the issue
            if (error.message.includes('Invalid or expired token')) {
                alert('❌ Ваша сессия истекла. Пожалуйста, выйдите и войдите заново.');
                adminLogout();
            } else {
                alert('❌ Ошибка при сохранении награды: ' + error.message);
            }
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    };
    
        if (imageFile) {
        // ========== CHANGE: Send the RAW File object, NOT Base64 ==========
        await saveWithImage(imageFile); 
    } else {
        await saveWithImage(null);
    }
}
// Save Moment - REMOVED link field
async function saveMoment() {
    console.log('saveMoment function STARTED');
    
    const id = document.getElementById('momentId').value;
    const title = document.getElementById('momentTitle').value;
    const description = document.getElementById('momentDescription').value;
    const videoUrl = document.getElementById('momentVideoUrl').value;
    // ❌ REMOVED: const link = document.getElementById('momentLink').value;
    const thumbnailFile = document.getElementById('momentThumbnail').files[0];
    
    if (!title || !videoUrl) {
        alert('Пожалуйста, заполните название и ссылку на видео');
        return;
    }
    
    const saveBtn = document.querySelector('#momentModal .btn-primary');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Сохранение...';
    saveBtn.disabled = true;
    
    try {
        let thumbnailData = null;
        
        if (thumbnailFile && thumbnailFile.size > 0) {
            const reader = new FileReader();
            thumbnailData = await new Promise((resolve, reject) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(thumbnailFile);
            });
        }
        
        const momentData = {
            title: title,
            description: description || '',
            videoUrl: videoUrl,
            // ❌ REMOVED: link: link || '',
            thumbnail: thumbnailData
        };
        
        let result;
        if (id && id !== '') {
            result = await updateMoment(parseInt(id), momentData);
            console.log('Moment updated:', id);
        } else {
            result = await addMoment(momentData);
            console.log('New moment added');
        }
        
        if (result && result.error) {
            throw new Error(result.error);
        }
        
        const modal = document.getElementById('momentModal');
        if (modal) modal.style.display = 'none';
        
        await loadMomentsTable();
        await loadDashboardData();
        
        alert('Видео сохранено успешно!');
        
        document.getElementById('momentForm').reset();
        const previewContainer = document.getElementById('momentThumbnailPreview');
        if (previewContainer) previewContainer.innerHTML = '';
        
    } catch (error) {
        console.error('Save moment error:', error);
        alert('Ошибка: ' + error.message);
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}
// Edit Award
window.editAward = function(id) {
    openAwardModal(id);
};

// Delete Award - USING SUPABASE.JS FUNCTION
window.deleteAward = async function(id) {
    if (!confirm('Вы уверены, что хотите удалить эту награду?')) return;
    
    try {
        // Use the deleteAwardFromDB function from supabase.js
        const result = await window.deleteAwardFromDB(id);
        await loadAwardsTable();
        alert('✅ Награда удалена');
    } catch (error) {
        console.error('Error deleting award:', error);
        alert('❌ Ошибка при удалении: ' + error.message);
    }
};

// Edit Moment
window.editMoment = function(id) {
    openMomentModal(id);
};

// Delete Moment - USING SUPABASE.JS FUNCTION
window.deleteMoment = async function(id) {
    if (!confirm('Вы уверены, что хотите удалить это видео?')) return;
    
    try {
        // Use the deleteMomentFromDB function from supabase.js
        const result = await deleteMomentFromDB(id);  // ← CHANGED: use the correct function name
        await loadMomentsTable();
        alert('Видео удалено');
    } catch (error) {
        console.error('Error deleting moment:', error);
        alert('Ошибка при удалении: ' + error.message);
    }
};
// Load Awards Table - USING SUPABASE
async function loadAwardsTable() {
    const awards = await getAwards();  // Changed: uses Supabase
    const tbody = document.getElementById('awardsTableBody');
    if (!tbody) return;
    
    if (awards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Нет добавленных наград</td></tr>';
        return;
    }
    
    tbody.innerHTML = awards.map(item => `
        <tr>
            <td>${item.image ? '<img src="'+item.image+'" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">' : '-'}</td>
            <td>${escapeHtml(item.title)}</td>
            <td>${escapeHtml(item.organization)}</td>
            <td>${item.year}</td>
            <td>
                <button class="btn-edit" onclick="editAward(${item.id})">✏️</button>
                <button class="btn-danger" onclick="deleteAward(${item.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Load Moments Table - USING SUPABASE
async function loadMomentsTable() {
    const moments = await getMoments();  // Changed: uses Supabase
    const tbody = document.getElementById('momentsTableBody');
    if (!tbody) {
        console.log('momentsTableBody not found');
        return;
    }
    
    console.log('Loading moments, count:', moments.length);
    
    if (moments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Нет добавленных видео</td></tr>';
        return;
    }
    
    tbody.innerHTML = moments.map(item => `
        <tr>
            <td>${escapeHtml(item.title)}</td>
            <td><a href="${item.video_url}" target="_blank">Смотреть</a></td>
            <td>
                <button class="btn-edit" onclick="editMoment(${item.id})">✏️</button>
                <button class="btn-danger" onclick="deleteMoment(${item.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
    
    console.log('Moments table loaded, rows:', moments.length);
}

// Edit Moment - REMOVED link field
async function editMoment(id) {
    const moments = await getMoments();
    const moment = moments.find(m => m.id == id);
    if (!moment) return;
    
    document.getElementById('momentId').value = moment.id;
    document.getElementById('momentTitle').value = moment.title;
    document.getElementById('momentDescription').value = moment.description || '';
    document.getElementById('momentVideoUrl').value = moment.video_url;
    // ❌ REMOVED: document.getElementById('momentLink').value = moment.link || '';
    
    document.querySelector('#momentModal h2').textContent = 'Редактировать видео';
    document.getElementById('momentModal').style.display = 'flex';
}


// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show active section
            sections.forEach(sec => sec.classList.remove('active'));
            
            // FIX: Check if element exists before adding class
            const targetSection = document.getElementById(`${section}Section`);
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.warn(`Section not found: ${section}Section`);
            }
        });
    });
}

// REPLACE your existing loadDashboardData with this:

// Dashboard - USING SUPABASE (Fixed to use REAL data including volunteers)
async function loadDashboardData() {
    const [allNews, events, branches, queries, awards, moments, stats] = await Promise.all([
        getNews(),
        getEvents(),
        getBranches(),
        getQueries(),
        getAwards(),
        getMoments(),
        getStats()  // ← ADD THIS to get volunteers count from database
    ]);

    // SEPARATE NEWS FROM EVENTS
    const news = allNews.filter(item => item.category !== 'event');

    // Update stats cards
    const statsCards = document.querySelectorAll('.stat-card .stat-info h3');
    if (statsCards.length >= 7) {
        statsCards[0].textContent = news.length || 0;                          // News
        statsCards[1].textContent = events.length || 0;                        // Events
        statsCards[2].textContent = stats?.active_volunteers || 150;           // ✅ Volunteers - now uses real data!
        statsCards[3].textContent = branches.length || 0;                      // Branches
        statsCards[4].textContent = queries.filter(q => q.status === 'pending').length || 0; // Requests
        statsCards[5].textContent = awards.length || 0;                        // Awards
        statsCards[6].textContent = moments.length || 0;                       // Moments
    }
    
    // Also update the dashboard volunteers count specifically
    const dashboardVolunteersCount = document.getElementById('dashboardVolunteersCount');
    if (dashboardVolunteersCount) {
        dashboardVolunteersCount.textContent = stats?.active_volunteers || 150;
    }
    
    // Load real recent activities
    loadRecentActivities(news, events, branches, queries, awards, moments);
}

function loadRecentActivities(news, events, branches, queries, awards, moments) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    let allActivities = [];
    
    // Add news activities
    news.forEach(item => {
        allActivities.push({
            type: 'news', title: item.title, action: '📰 Добавлена новость',
            timestamp: item.created_at || item.date || new Date(0),
            icon: 'fa-newspaper', color: '#F5A623'
        });
    });
    
    // Add event activities
    events.forEach(item => {
        allActivities.push({
            type: 'event', title: item.title, action: '📅 Добавлено событие',
            timestamp: item.created_at || item.date || new Date(0),
            icon: 'fa-calendar-alt', color: '#27ae60'
        });
    });
    
    // Add branch activities
    branches.forEach(item => {
        allActivities.push({
            type: 'branch', title: item.title, action: '📍 Добавлен филиал',
            timestamp: item.created_at || new Date(0),
            icon: 'fa-code-branch', color: '#3498db'
        });
    });
    
    // Add query activities
    queries.forEach(item => {
        let actionText = '✉️ Новый запрос';
        if (item.admin_reply) actionText = '✅ Ответ на запрос';
        allActivities.push({
            type: 'query', title: item.name || 'Аноним', action: actionText,
            timestamp: item.created_at || new Date(0),
            icon: 'fa-envelope', color: '#e74c3c'
        });
    });
    
    // Add award activities
    awards.forEach(item => {
        allActivities.push({
            type: 'award', title: item.title, action: '🏆 Добавлена награда',
            timestamp: item.created_at || new Date(0),
            icon: 'fa-trophy', color: '#f39c12'
        });
    });
    
    // Add moment activities
    moments.forEach(item => {
        allActivities.push({
            type: 'moment', title: item.title, action: '🎥 Добавлено видео',
            timestamp: item.created_at || new Date(0),
            icon: 'fa-video', color: '#9b59b6'
        });
    });
    
    // Sort by timestamp descending (newest first)
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Take only last 8 activities
    const recentActivities = allActivities.slice(0, 8);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = `<div class="activity-item"><i class="fas fa-info-circle"></i><span>Нет недавних действий</span></div>`;
        return;
    }
    
    activityList.innerHTML = recentActivities.map(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        return `
            <div class="activity-item">
                <i class="fas ${activity.icon}" style="color: ${activity.color};"></i>
                <span><strong>${activity.action}</strong>: ${escapeHtml(activity.title)}</span>
                <small>${timeAgo}</small>
            </div>
        `;
    }).join('');
}

function getTimeAgo(timestamp) {
    if (!timestamp || isNaN(new Date(timestamp))) return 'Недавно';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    
    if (diffMs < 0) return 'Недавно';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    return past.toLocaleDateString('ru-RU');
}

// ADD THIS NEW FUNCTION RIGHT AFTER loadDashboardData:




// News Management - USING SUPABASE
async function loadNewsTable() {
    const news = await getNews(); // Gets ALL items from news_items table
    
    // ========== FIX: Filter out events ==========
    // Only show items that are NOT events
    const filteredNews = news.filter(item => item.category !== 'event');
    
    const tbody = document.getElementById('newsTableBody');
    
    if (!tbody) return;
    
    if (filteredNews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Нет новостей или анонсов</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredNews.map(item => `
        <tr>
            <td>${escapeHtml(item.title)}</td>
            <td>${item.date}</td>
            <td>${item.category || 'news'}</td>
            <td>
                <button class="btn-edit" onclick="editItem('news', ${item.id})">✏️</button>
                <button class="btn-danger" onclick="deleteItem('news', ${item.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function loadEventsTable() {
    const events = await getEvents();
    const tbody = document.getElementById('eventsTableBody');
    
    if (!tbody) return;
    
    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Нет событий</td></tr>';
        return;
    }
    
    tbody.innerHTML = events.map(item => `
        <tr>
            <td style="padding: 12px;">${escapeHtml(item.title)}</td>
            <td style="padding: 12px;">${item.date}</td>
            <td style="padding: 12px;">${item.location || 'Не указано'}</td>
            <td style="padding: 12px;">
                ${item.video ? `<a href="${item.video}" target="_blank" style="color: var(--primary);">🎥 Видео</a>` : '—'}
                ${item.register_link ? `<br><a href="${item.register_link}" target="_blank" style="color: #27ae60;">📝 Регистрация</a>` : ''}
            </td>
            <td style="padding: 12px;">
                <button class="btn-edit" onclick="editItem('event', ${item.id})">✏️</button>
                <button class="btn-danger" onclick="deleteItem('event', ${item.id})">🗑️</button>
            </td>
         </tr>
    `).join('');
}

// Branches Management - USING SUPABASE
async function loadBranchesTable() {
    const branches = await getBranches();  // Changed: uses Supabase
    const tbody = document.getElementById('branchesTableBody');
    
    if (!tbody) return;
    
    if (branches.length === 0) {
        tbody.innerHTML = '<td><td colspan="5" style="text-align:center;">Нет филиалов</td></tr>';
        return;
    }
    
   tbody.innerHTML = branches.map(item => `
    <tr>
        <td style="padding: 12px;">${item.image ? `<img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">` : '<span style="color:#999;">—</span>'}</td>
        <td style="padding: 12px;">${escapeHtml(item.title)}</td>
        <td style="padding: 12px;">${item.city || '-'}</td>
        <td style="padding: 12px;">${item.date || '-'}</td>
        <td style="padding: 12px;">${item.vk_link ? `<a href="${item.vk_link}" target="_blank" style="color: var(--primary);"><i class="fab fa-vk"></i> VK</a>` : '-'}</td>
        <td style="padding: 12px;">
            <button class="btn-edit" onclick="editItem('branch', ${item.id})">✏️</button>
            <button class="btn-danger" onclick="deleteItem('branch', ${item.id})">🗑️</button>
        </td>
    </tr>
`).join('');
}

// Modal Management
let currentEditType = null;
let currentEditId = null;

function initModals() {
    const itemModal = document.getElementById('itemModal');
    const awardModal = document.getElementById('awardModal');
    const momentModal = document.getElementById('momentModal');
    
    // Close buttons for ALL modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (itemModal) itemModal.style.display = 'none';
            if (awardModal) awardModal.style.display = 'none';
            if (momentModal) momentModal.style.display = 'none';
        });
    });
    
    // Close on outside click for ALL modals
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) itemModal.style.display = 'none';
        if (e.target === awardModal) awardModal.style.display = 'none';
        if (e.target === momentModal) momentModal.style.display = 'none';
    });
    
    // Add buttons for news/events/branches
    const addNewsBtn = document.getElementById('addNewsBtn');
    const addEventBtn = document.getElementById('addEventBtn');
    const addBranchBtn = document.getElementById('addBranchBtn');
    const itemForm = document.getElementById('itemForm');
    
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', () => openModal('news'));
    }
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => openModal('event'));
    }
    if (addBranchBtn) {
        addBranchBtn.addEventListener('click', () => openModal('branch'));
    }
    
    if (itemForm) {
        itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveItem();
        });
    }
}

async function openModal(type, id = null) {
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    const locationGroup = document.getElementById('locationGroup');
    const categoryGroup = document.getElementById('categoryGroup');
    const vkLinkGroup = document.getElementById('vkLinkGroup');
    const cityGroup = document.getElementById('cityGroup');
    const videoGroup = document.getElementById('videoGroup');
    const registerLinkGroup = document.getElementById('registerLinkGroup');
    const multipleImagesGroup = document.getElementById('multipleImagesGroup');
    const imageGroup = document.getElementById('imageGroup');
    const articleLinkGroup = document.getElementById('articleLinkGroup');
    
    // Update date label based on type
    const dateLabel = document.querySelector('#dateGroup label');
    const dateGroup = document.getElementById('dateGroup');
    if (dateLabel) {
        dateLabel.textContent = type === 'branch' ? '📅 Дата основания филиала' : 'Дата';
    }
    
    currentEditType = type;
    currentEditId = id;
    
    document.getElementById('itemForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('multipleImagesPreview').innerHTML = '';
    
    // Clear video and register link fields
    if (document.getElementById('itemVideo')) document.getElementById('itemVideo').value = '';
    if (document.getElementById('itemRegisterLink')) document.getElementById('itemRegisterLink').value = '';
    
    // Show/hide fields based on type
    locationGroup.style.display = type === 'event' ? 'block' : 'none';
    vkLinkGroup.style.display = type === 'branch' ? 'block' : 'none';
    cityGroup.style.display = type === 'branch' ? 'block' : 'none';
    videoGroup.style.display = (type === 'news' || type === 'event') ? 'block' : 'none';
    registerLinkGroup.style.display = type === 'event' ? 'block' : 'none';
    multipleImagesGroup.style.display = type === 'news' ? 'block' : 'none';
    imageGroup.style.display = 'block';
    dateGroup.style.display = 'block';
    
    if (articleLinkGroup) {
        articleLinkGroup.style.display = (type === 'news' || type === 'announcement') ? 'block' : 'none';
    }
    
    // ========== UPDATE CATEGORY DROPDOWN BASED ON TYPE ==========
    const categorySelect = document.getElementById('itemCategory');
    
    if (type === 'news') {
        categoryGroup.style.display = 'block';
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="news">Новость</option>
                <option value="announcement">Анонс</option>
            `;
            categorySelect.disabled = false;
        }
    } else if (type === 'event') {
        categoryGroup.style.display = 'block';
        if (categorySelect) {
            categorySelect.innerHTML = `<option value="event">Событие</option>`;
            categorySelect.disabled = true;
        }
    } else {
        categoryGroup.style.display = 'none';
    }
    
    // Set modal title
    if (id) {
        modalTitle.textContent = type === 'news' ? 'Редактировать новость' : 
                                  type === 'event' ? 'Редактировать событие' : 'Редактировать филиал';
    } else {
        modalTitle.textContent = type === 'news' ? 'Добавить новость' : 
                                  type === 'event' ? 'Добавить событие' : 'Добавить филиал';
    }
    
    // ========== LOAD DATA IF EDITING ==========
    if (id) {
        let items = [];
        
        // Get data from Supabase based on type
        if (type === 'news' || type === 'event') {
            items = await getNews();
            
            // ========== FIX: If editing from news section, filter out events ==========
            if (type === 'news') {
                items = items.filter(item => item.category !== 'event');
            }
        } else if (type === 'branch') {
            items = await getBranches();
        }
        
        const item = items.find(i => i.id === id);
        if (item) {
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemTitle').value = item.title;
            document.getElementById('itemDescription').value = item.description;
            document.getElementById('itemDate').value = item.date;
            
            if (type === 'event' && item.location) {
                document.getElementById('itemLocation').value = item.location;
            }
            if (type === 'news' && item.category) {
                document.getElementById('itemCategory').value = item.category;
            }
            if (type === 'branch') {
                if (item.vk_link) document.getElementById('itemVkLink').value = item.vk_link;
                if (item.city) document.getElementById('itemCity').value = item.city;
            }
            
            // Load video link for news and events
            if ((type === 'news' || type === 'event') && item.video) {
                document.getElementById('itemVideo').value = item.video;
            }
            
            // Load registration link for events
            if (type === 'event' && item.register_link) {
                document.getElementById('itemRegisterLink').value = item.register_link;
            }
            
            // Load article link for news
            if ((type === 'news' || type === 'announcement') && item.link) {
                const articleLinkInput = document.getElementById('itemLink');
                if (articleLinkInput) articleLinkInput.value = item.link;
            }
            
            // Load main image preview if exists
            if (item.image) {
                const preview = document.getElementById('imagePreview');
                const previewImg = document.getElementById('previewImg');
                if (preview && previewImg) {
                    previewImg.src = item.image;
                    preview.style.display = 'block';
                }
            }
            
            // Load multiple images preview for news
            if (type === 'news') {
                const previewContainer = document.getElementById('multipleImagesPreview');
                if (previewContainer) {
                    previewContainer.innerHTML = '';
                    
                    const multiImages = item.multiple_images || item.multipleImages;
                    
                    // THIS IS THE GLOBAL ARRAY WE WILL USE
                    window._myImages = multiImages ? [...multiImages] : [];
                    
                    if (window._myImages.length > 0) {
                        window._myImages.forEach((imgSrc, idx) => {
                            const wrapper = document.createElement('div');
                            wrapper.style.cssText = 'position: relative; display: inline-block; margin-right: 10px;';
                            
                            const img = document.createElement('img');
                            img.src = imgSrc;
                            img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--primary);';
                            
                            const deleteBtn = document.createElement('span');
                            deleteBtn.innerHTML = '&times;';
                            deleteBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #e74c3c; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
                            
                            deleteBtn.onclick = function() {
                                const imgElement = this.parentElement.querySelector('img');
                                const imageSrc = imgElement ? imgElement.src : imgSrc;
                                
                                this.parentElement.remove();
                                window._myImages = window._myImages.filter((url, index) => {
                                    return url !== imageSrc;
                                });
                                
                                console.log("Remaining images after X:", window._myImages);
                                console.log("Removed image:", imageSrc);
                            };
                            
                            wrapper.appendChild(img);
                            wrapper.appendChild(deleteBtn);
                            previewContainer.appendChild(wrapper);
                        });
                    }
                }
            }
        }
    }
    
    modal.style.display = 'flex';
}

// Add this helper function BEFORE saveItem (add it anywhere above saveItem)
function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Helper to compress multiple images
async function compressMultipleImages(files, maxWidth = 400, maxHeight = 400, quality = 0.6) {
    const compressed = [];
    for (const file of files) {
        try {
            const result = await compressImage(file, maxWidth, maxHeight, quality);
            compressed.push(result);
        } catch (error) {
            console.error('Error compressing image:', error);
        }
    }
    return compressed;
}

async function saveItem() {
    const title = document.getElementById('itemTitle').value;
    const description = document.getElementById('itemDescription').value;
    const date = document.getElementById('itemDate').value;
    const category = document.getElementById('itemCategory')?.value || currentEditType;
    const articleLink = document.getElementById('itemLink')?.value || '';
    const vkLink = document.getElementById('itemVkLink')?.value || '';

    if (!title || !description || !date) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    if (currentEditType === 'news' && category === 'event') {
        alert('❌ События нельзя добавлять через раздел "Новости". Используйте раздел "События"!');
        return;
    }

    const imageFile = document.getElementById('itemImage').files[0];
    const video = document.getElementById('itemVideo')?.value || '';
    const registerLink = document.getElementById('itemRegisterLink')?.value || '';
    const location = document.getElementById('itemLocation')?.value || '';
    const city = document.getElementById('itemCity')?.value || '';

    const saveBtn = document.querySelector('#itemModal .btn-primary');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Сохранение...';
    saveBtn.disabled = true;

    try {
        let mainImage = null;
        if (imageFile && imageFile.size > 0) {
            mainImage = imageFile;
        } else if (currentEditId) {
            const existingItems = await getNews();
            const existingItem = existingItems.find(i => i.id === currentEditId);
            if (existingItem && existingItem.image) {
                mainImage = existingItem.image; // Keep existing URL
            }
        }

        // ========== USE FILE OBJECTS FROM window._myImageFiles ==========
        let multipleImages = [];
        
        if (window._myImageFiles && window._myImageFiles.length > 0) {
            // These are actual File objects - keep them as-is
            multipleImages = window._myImageFiles;
            console.log('📸 Using File objects:', multipleImages.length);
        } else {
            // No new files, check for existing URLs from database
            if (currentEditId) {
                const existingItems = await getNews();
                const existingItem = existingItems.find(i => i.id === currentEditId);
                if (existingItem && existingItem.multiple_images) {
                    // These are URLs from the database
                    multipleImages = existingItem.multiple_images;
                    console.log('📸 Using existing URLs:', multipleImages.length);
                }
            }
        }

        let itemData = {
            title: title,
            description: description,
            date: date,
            category: currentEditType === 'event' ? 'event' : category,
            video: video,
            register_link: registerLink,
            location: location,
            image: mainImage,
            link: articleLink,
            multiple_images: multipleImages // File objects OR URLs
        };

        if (currentEditType === 'branch') {
            let finalImage = mainImage;
            if (!imageFile && currentEditId) {
                const existingBranches = await getBranches();
                const existingBranch = existingBranches.find(b => b.id === currentEditId);
                if (existingBranch && existingBranch.image) {
                    finalImage = existingBranch.image;
                }
            }
            
            itemData = {
                title: title,
                city: city,
                vk_link: vkLink,
                description: description,
                image: finalImage,
                date: date,
                created_at: currentEditId ? undefined : new Date().toISOString()
            };
            
            delete itemData.category;
            delete itemData.video;
            delete itemData.register_link;
            delete itemData.location;
            delete itemData.multiple_images;
            delete itemData.link;
        }

        let result;
        if (currentEditId) {
            if (currentEditType === 'news' || currentEditType === 'event') {
                result = await updateNews(currentEditId, itemData);
            } else if (currentEditType === 'branch') {
                result = await updateBranch(currentEditId, itemData);
            }
        } else {
            if (currentEditType === 'news' || currentEditType === 'event') {
                result = await addNews(itemData);
            } else if (currentEditType === 'branch') {
                result = await addBranch(itemData);
            }
        }

        document.getElementById('itemModal').style.display = 'none';
        await refreshTables();
        
        // CLEAN UP: Clear the file array and revoke object URLs
        if (window._myImageFiles) {
            // Revoke all object URLs
            document.querySelectorAll('#multipleImagesPreview img').forEach(img => {
                if (img.src && img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                }
            });
            window._myImageFiles = [];
        }
        
        alert('Сохранено успешно!');

    } catch (error) {
        console.error('Save error:', error);
        alert('Ошибка сохранения: ' + error.message);
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}
// Delete item - USING SUPABASE
window.deleteItem = async function(type, id) {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
        let success = false;
        
        // ========== FIX: Properly identify if it's an event ==========
        if (type === 'news' || type === 'event') {
            // Check if it's actually an event before deleting as news
            const allItems = await getNews();
            const item = allItems.find(i => i.id === id);
            
            if (item && item.category === 'event' && type === 'news') {
                alert('❌ Это событие. Удаляйте его через раздел "События"');
                return;
            }
            
            success = await deleteNews(id);
        } else if (type === 'branch') {
            success = await deleteBranch(id);
        }
        
        if (success) {
            await refreshTables();
            alert('Удалено успешно!');
        } else {
            alert('Ошибка при удалении');
        }
    }
};
window.editItem = async function(type, id) {
    let item = null;
    
    if (type === 'news') {
        const items = await getNews();
        item = items.find(i => i.id === id);
        
        // ========== FIX: Prevent editing events from news section ==========
        if (item && item.category === 'event') {
            alert('❌ Это событие. Редактируйте его через раздел "События"');
            return;
        }
    } else if (type === 'event') {
        const items = await getEvents();
        item = items.find(i => i.id === id);
    } else if (type === 'branch') {
        const items = await getBranches();
        item = items.find(i => i.id === id);
    }
    
    if (item) {
        await openModal(type, id);
    } else {
        alert('Элемент не найден');
    }
};

// Helper functions
function getStorageKey(type) {
    switch(type) {
        case 'news': return STORAGE_KEYS.NEWS;
        case 'event': return STORAGE_KEYS.EVENTS;
        case 'branch': return STORAGE_KEYS.BRANCHES;
        case 'queries': return STORAGE_KEYS.QUERIES;
        default: return STORAGE_KEYS.NEWS;
    }
}

function getData(key) {
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    
    // Return default data if none exists
    return getDefaultData(key);
}

function getDefaultData(key) {
    switch(key) {
        case STORAGE_KEYS.NEWS:
            return [
                { id: 1, title: 'Весенняя экологическая акция', description: 'Приглашаем всех желающих принять участие в весенней уборке парка и посадке деревьев.', date: '2024-03-15', category: 'news', timestamp: '2024-03-01T00:00:00Z' },
                { id: 2, title: 'Помощь приюту для животных', description: 'Состоялся выезд в приют для бездомных животных. Добровольцы помогли с уборкой и уходом.', date: '2024-03-10', category: 'news', timestamp: '2024-03-01T00:00:00Z' },
                { id: 3, title: 'День добровольца', description: 'Праздничное мероприятие, посвященное Дню добровольца. Награждение активных участников.', date: '2024-03-05', category: 'event', timestamp: '2024-03-01T00:00:00Z' }
            ];
        case STORAGE_KEYS.EVENTS:
            return [
                { id: 1, title: 'Эко-субботник', description: 'Уборка городского парка', date: '2024-04-20', location: 'Центральный парк', category: 'event', timestamp: '2024-03-01T00:00:00Z' },
                { id: 2, title: 'Помощь ветеранам', description: 'Поздравление ветеранов с Днем Победы', date: '2024-05-09', location: 'Разные адреса', category: 'event', timestamp: '2024-03-01T00:00:00Z' }
            ];
        case STORAGE_KEYS.BRANCHES:
            return [
                { id: 1, title: 'Московская область', city: 'Москва', vkLink: 'https://vk.com/zolotiegrifony', description: 'Центральный офис организации', date: '2024-01-01', timestamp: '2024-01-01T00:00:00Z' },
                { id: 2, title: 'Санкт-Петербург', city: 'Санкт-Петербург', vkLink: '', description: 'Северо-Западное отделение', date: '2024-01-01', timestamp: '2024-01-01T00:00:00Z' },
                { id: 3, title: 'Нижний Новгород', city: 'Нижний Новгород', vkLink: '', description: 'Приволжское отделение', date: '2024-01-01', timestamp: '2024-01-01T00:00:00Z' },
                { id: 4, title: 'Екатеринбург', city: 'Екатеринбург', vkLink: '', description: 'Уральское отделение', date: '2024-01-01', timestamp: '2024-01-01T00:00:00Z' },
                { id: 5, title: 'Новосибирск', city: 'Новосибирск', vkLink: '', description: 'Сибирское отделение', date: '2024-01-01', timestamp: '2024-01-01T00:00:00Z' },
                { id: 6, title: 'Краснодар', city: 'Краснодар', vkLink: '', description: 'Южное отделение', date: '2024-01-01', timestamp: '2024-01-01T00:00:00Z' }
                
            ];
        case STORAGE_KEYS.QUERIES:
            return [];
        default:
            return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


async function refreshTables() {
    await loadDashboardData();
    await loadNewsTable();
    await loadEventsTable();
    await loadBranchesTable();
    await loadQueries();
    await loadAwardsTable();
    await loadMomentsTable();
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            adminLogout();
        });
    }
}
// ============ QUERY MANAGEMENT SYSTEM ============

// Load queries function - WITH FILTERING
async function loadQueries() {
    console.log('loadQueries started - fetching from Supabase');
    
    const queriesList = document.getElementById('queriesList');
    if (!queriesList) {
        console.log('queriesList element not found');
        return;
    }
    
    // Get the active filter
    const activeFilter = document.querySelector('.filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';
    
    console.log('🔍 Active filter:', filter);
    
    // Show loading state
    queriesList.innerHTML = '<p>Загрузка запросов...</p>';
    
    // Get queries from Supabase
    const queries = await getQueries();
    console.log('Queries from Supabase:', queries);
    
    if (!queries || queries.length === 0) {
        queriesList.innerHTML = '<p>Нет запросов</p>';
        return;
    }
    
    // ========== FILTER THE QUERIES ==========
    let filteredQueries = queries;
    
    switch(filter) {
        case 'pending':
            filteredQueries = queries.filter(q => q.status === 'pending' || q.status === 'new');
            break;
        case 'replied':
            filteredQueries = queries.filter(q => q.status === 'replied' || q.admin_reply);
            break;
        case 'archived':
            filteredQueries = queries.filter(q => q.status === 'archived');
            break;
        case 'all':
        default:
            // ========== FIX: Exclude archived from "All" ==========
            filteredQueries = queries.filter(q => q.status !== 'archived');
            break;
    }
    
    console.log('📊 Filtered queries:', filteredQueries.length);
    
    // Update stats
    updateQueryStats(queries);
    
    if (filteredQueries.length === 0) {
        queriesList.innerHTML = `<p>Нет запросов в категории "${filter}"</p>`;
        return;
    }
    
    // Display filtered queries with archive buttons
    queriesList.innerHTML = filteredQueries.map(q => `
        <div class="query-item" style="border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:8px; ${q.status === 'replied' ? 'border-left: 4px solid #27ae60;' : q.status === 'archived' ? 'border-left: 4px solid #95a5a6; opacity: 0.7;' : 'border-left: 4px solid #F5A623;'}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong>${escapeHtml(q.name)}</strong> 
                <span style="font-size:12px; color:${q.status === 'replied' ? '#27ae60' : q.status === 'archived' ? '#95a5a6' : '#F5A623'};">
                    ${q.status === 'replied' ? '✅ Отвечено' : q.status === 'archived' ? '📦 В архиве' : '📩 Новый'}
                </span>
            </div>
            <div style="font-size:13px; color:#666; margin-bottom:5px;">
                ${escapeHtml(q.email)} • ${new Date(q.created_at).toLocaleString()}
            </div>
            <p style="margin:8px 0; background:#f8f9fa; padding:10px; border-radius:6px;">
                ${escapeHtml(q.message)}
            </p>
            ${q.admin_reply ? `
                <div style="margin-top:8px; padding:10px; background:#e8f5e9; border-radius:6px; border-left: 3px solid #27ae60;">
                    <strong style="color:#27ae60;">Ответ:</strong> ${escapeHtml(q.admin_reply)}
                </div>
            ` : ''}
            <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                ${!q.admin_reply && q.status !== 'archived' ? `
                    <button onclick="replyToQuery(${q.id})" style="background:#F5A623; border:none; padding:5px 15px; border-radius:5px; cursor:pointer; color:white;">
                        Ответить
                    </button>
                ` : q.status === 'replied' ? `
                    <span style="font-size:12px; color:#27ae60; padding:5px 15px; background:#e8f5e9; border-radius:5px;">
                        ✅ Ответ отправлен
                    </span>
                ` : ''}
                ${q.status !== 'archived' ? `
                    <button onclick="archiveQuery(${q.id}, loadQueries)" style="background:#7f8c8d; border:none; padding:5px 15px; border-radius:5px; cursor:pointer; color:white;">
                        📦 В архив
                    </button>
                ` : `
                    <button onclick="unarchiveQuery(${q.id}, loadQueries)" style="background:#3498db; border:none; padding:5px 15px; border-radius:5px; cursor:pointer; color:white;">
                        📤 Восстановить
                    </button>
                `}
                <button onclick="deleteQuery(${q.id})" style="background:#e74c3c; border:none; padding:5px 15px; border-radius:5px; cursor:pointer; color:white;">
                    🗑️ Удалить
                </button>
            </div>
        </div>
    `).join('');
}

// Reply to query - WITH STATUS UPDATE
async function replyToQuery(id) {
    const reply = prompt('Введите ваш ответ:');
    if (!reply) return;
    
    // Get the query data first (to get name and email)
    const queries = await getQueries();
    const query = queries.find(q => q.id === id);
    
    if (!query) {
        alert('Запрос не найден');
        return;
    }

    const adminName = 'Наталья Алексеенко';
    
    // Update reply in Supabase
    await updateQueryReply(id, reply);
    
    // Send email notification to user
    await sendEmailNotification(query.name, query.email, query.message, reply, adminName);
    
    // Refresh the list
    await loadQueries();
    
    alert('Ответ сохранен и отправлен на email!');
}

// Delete query - NOW USING BACKEND API
async function deleteQuery(id) {
    if (!confirm('Удалить запрос?')) return;
    
    try {
        // Call the backend API to delete (NOT supabaseAdmin)
        const response = await fetch(`${API_BASE_URL}/admin/queries/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders() // This works because it uses sessionStorage token
        });
        
        if (!response.ok) throw new Error('Failed to delete query');
        
        await loadQueries();
        alert('Запрос удален');
    } catch (error) {
        console.error('Error deleting query:', error);
        alert('Ошибка при удалении: ' + error.message);
    }
}

// Update query statistics and badge
function updateQueryStats(queries) {
    // Active queries = not archived
    const activeQueries = queries.filter(q => q.status !== 'archived');
    const pendingCount = activeQueries.filter(q => q.status === 'pending' || q.status === 'new').length;
    const totalCount = activeQueries.length;  // ← Only active queries
    const repliedCount = activeQueries.filter(q => q.status === 'replied' || q.admin_reply).length;
    const archivedCount = queries.filter(q => q.status === 'archived').length;
    
    const pendingBadge = document.querySelector('.pending-count');
    const totalBadge = document.querySelector('.total-count');
    const queriesBadge = document.getElementById('queriesBadge');
    
    // Update the filter buttons with counts
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        let count = 0;
        switch(filter) {
            case 'all': count = totalCount; break;
            case 'pending': count = pendingCount; break;
            case 'replied': count = repliedCount; break;
            case 'archived': count = archivedCount; break;
        }
        btn.textContent = `${btn.textContent.split('(')[0].trim()} (${count})`;
    });
    
    if (pendingBadge) pendingBadge.innerHTML = `Новых: ${pendingCount}`;
    if (totalBadge) totalBadge.innerHTML = `Всего: ${totalCount}`;
    
    if (queriesBadge) {
        if (pendingCount > 0) {
            queriesBadge.style.display = 'inline';
            queriesBadge.textContent = pendingCount;
        } else {
            queriesBadge.style.display = 'none';
        }
    }
}


// Send email notification (simulated - integrate with EmailJS for real)
// Real email sending with EmailJS
async function sendEmailNotification(name, email, userQuery, adminReply, adminName = 'Наталья Алексеенко') {
    console.log('=== SENDING EMAIL ===');
    console.log('To:', email);
    console.log('Name:', name);
    console.log('Query:', userQuery);
    console.log('Reply:', adminReply);
    
    try {
        // First, check if emailjs is available
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS not loaded!');
            alert('EmailJS не загружен. Проверьте интернет соединение.');
            return;
        }
        
        // Send with ONLY the most common variable names
        const result = await emailjs.send(
            'Maria@2009',
            'template_gz86vcg',
            {
                to_name: name,
                email: email,
                user_query: userQuery,           // Must match {{user_query}}
                admin_reply: adminReply,  
                admin_name: adminName,  // ← ADD THIS LINE
                reply_to: email,
                reply_date: new Date().toLocaleString('ru-RU')
            },
            'Q0PDtzoS4rqXI8AI5'
        );
        
        console.log('✅ Email sent successfully!', result);
        alert('✅ Email отправлен на ' + email);
        
    } catch (error) {
        console.error('❌ Email failed. Full error:', error);
        console.error('Error text:', error.text);
        console.error('Error status:', error.status);
        
        // Show the actual error message
        let errorMsg = error.text || error.message || 'Unknown error';
        alert('❌ Ошибка отправки email: ' + errorMsg + '\n\nПроверьте консоль (F12) для деталей.');
    }
}

// Mark query as read - USING SUPABASE
async function markAsRead(queryId) {
    // Update status in Supabase
    const { error } = await supabaseAdmin
        .from('queries')
        .update({ is_read: true })
        .eq('id', queryId);
    
    if (error) {
        console.error('Error marking query as read:', error);
    } else {
        console.log('✅ Query marked as read');
        await loadQueries(); // Refresh the list
    }
}

// Format date time helper
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Initialize query filters - FIXED
function initQueryFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            filters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            this.classList.add('active');
            // Reload queries with the new filter
            loadQueries();
        });
    });
}

// ============ PROFILE & THEME SETTINGS ============

// Load admin profile data
function loadAdminProfile() {
    const savedAvatar = localStorage.getItem('admin_avatar');
    const savedName = localStorage.getItem('admin_display_name');
    
    if (savedAvatar) {
        const avatarImg = document.getElementById('adminAvatar');
        if (avatarImg) avatarImg.src = savedAvatar;
    }
    
    if (savedName) {
        const nameDisplay = document.getElementById('adminNameDisplay');
        if (nameDisplay) nameDisplay.textContent = savedName;
    }
    
    // Load color settings
    const sidebarColor = localStorage.getItem('admin_sidebar_color');
    const accentColor = localStorage.getItem('admin_accent_color');
    const theme = localStorage.getItem('admin_theme');
    
    if (sidebarColor) {
        document.documentElement.style.setProperty('--admin-sidebar-bg', sidebarColor);
        document.querySelector('.admin-sidebar').style.backgroundColor = sidebarColor;
        // Also update the color picker value
        const sidebarPicker = document.getElementById('sidebarColor');
        if (sidebarPicker) sidebarPicker.value = sidebarColor;
    }
    
    if (accentColor) {
        document.documentElement.style.setProperty('--primary', accentColor);
        document.documentElement.style.setProperty('--admin-accent', accentColor);
        
        // IMPORTANT: Update all buttons with the saved accent color
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.style.backgroundColor = accentColor;
        });
        
        // Update the color picker value
        const accentPicker = document.getElementById('accentColor');
        if (accentPicker) accentPicker.value = accentColor;
    }
    
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        const themeSelect = document.getElementById('themeMode');
        if (themeSelect) themeSelect.value = 'light';
    }
}

// Save admin avatar
function initAvatarUpload() {
    const avatarInput = document.getElementById('avatarUpload');
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const avatarImg = document.getElementById('adminAvatar');
                    if (avatarImg) {
                        avatarImg.src = ev.target.result;
                        localStorage.setItem('admin_avatar', ev.target.result);
                        alert('Аватар обновлен!');
                    }
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
}

// Save color settings - FIXED VERSION
function initColorSettings() {
    const saveColorsBtn = document.getElementById('saveColorSettings');
    const resetColorsBtn = document.getElementById('resetColors');
    const saveThemeBtn = document.getElementById('saveTheme');
    
    if (saveColorsBtn) {
        saveColorsBtn.addEventListener('click', function() {
            const sidebarColor = document.getElementById('sidebarColor').value;
            const accentColor = document.getElementById('accentColor').value;
            
            console.log('Applying colors - Sidebar:', sidebarColor, 'Accent:', accentColor);
            
            // 1. Change sidebar background
            document.querySelector('.admin-sidebar').style.backgroundColor = sidebarColor;
            document.documentElement.style.setProperty('--admin-sidebar-bg', sidebarColor);
            
            // 2. Change accent color for buttons and navigation
            document.documentElement.style.setProperty('--primary', accentColor);
            document.documentElement.style.setProperty('--admin-accent', accentColor);
            
            // 3. Update ALL buttons with btn-primary class
            document.querySelectorAll('.btn-primary').forEach(btn => {
                btn.style.backgroundColor = accentColor;
                btn.style.borderColor = accentColor;
            });
            
            // 4. Update navigation item hover and active states
            document.querySelectorAll('.nav-item:hover, .nav-item.active').forEach(item => {
                item.style.color = accentColor;
                item.style.borderLeftColor = accentColor;
            });
            
            // 5. Update the CSS variable for nav hover background
            document.documentElement.style.setProperty('--admin-sidebar-hover', `rgba(${hexToRgb(accentColor)}, 0.2)`);
            
            // 6. Save to localStorage
            localStorage.setItem('admin_sidebar_color', sidebarColor);
            localStorage.setItem('admin_accent_color', accentColor);
            
            alert('Цвета сохранены!');
        });
    }
    
    if (resetColorsBtn) {
        resetColorsBtn.addEventListener('click', function() {
            const defaultSidebar = '#1a1a2e';
            const defaultAccent = '#F5A623';
            
            document.querySelector('.admin-sidebar').style.backgroundColor = defaultSidebar;
            document.documentElement.style.setProperty('--admin-sidebar-bg', defaultSidebar);
            document.documentElement.style.setProperty('--primary', defaultAccent);
            document.documentElement.style.setProperty('--admin-accent', defaultAccent);
            
            document.getElementById('sidebarColor').value = defaultSidebar;
            document.getElementById('accentColor').value = defaultAccent;
            
            localStorage.removeItem('admin_sidebar_color');
            localStorage.removeItem('admin_accent_color');
            
            alert('Цвета сброшены!');
            location.reload();
        });
    }
    
    if (saveThemeBtn) {
        saveThemeBtn.addEventListener('click', function() {
            const theme = document.getElementById('themeMode').value;
            const savedSidebarColor = localStorage.getItem('admin_sidebar_color');
            
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                // Use saved color or default
                if (savedSidebarColor) {
                    document.querySelector('.admin-sidebar').style.backgroundColor = savedSidebarColor;
                }
            } else {
                document.documentElement.removeAttribute('data-theme');
                const defaultColor = localStorage.getItem('admin_sidebar_color') || '#1a1a2e';
                document.querySelector('.admin-sidebar').style.backgroundColor = defaultColor;
            }
            localStorage.setItem('admin_theme', theme);
            alert('Тема применена!');
        });
    }
}

// Helper function to convert hex to rgb
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '245, 166, 35';
}



async function autoDeleteOldQueries() {
    // Ensure token exists
    if (!sessionStorage.getItem('admin_token')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/queries/delete-old`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        // Log the status, but don't worry about it
        console.log("Auto-delete status:", response.status);
    } catch (error) {
        // Silently ignore network errors
        console.log("Auto-delete silently ignored:", error.message);
    }
}


function initAutoDeleteSchedule() {
    autoDeleteOldQueries(); // This runs immediately when the admin page loads
    setInterval(() => {
        autoDeleteOldQueries();
    }, 86400000); // 24 hours
}
const enhancedFestivals = {
    winter_arctic: {
        name: 'Арктическая зима',
        themeStyle: 'Ледяная синева, северное сияние',
        colors: { primary: '#00B4D8', secondary: '#03045E', accent: '#90E0EF', background: '#0A1128' },
        animation: 'aurora'
    },
    spring: {
        name: 'Весеннее пробуждение',
        themeStyle: 'Пастельные тона, цветущие сады',
        colors: { primary: '#FFB7B2', secondary: '#B5EAD7', accent: '#C7CEEA', background: '#FFF5F0' },
        animation: 'petals'
    },
    summer: {
        name: 'Летнее солнцестояние',
        themeStyle: 'Яркий, энергичный, солнечный',
        colors: { primary: '#FF6B35', secondary: '#F7931E', accent: '#FFD700', background: '#FFF8E7' },
        animation: 'sunrays'
    },
    autumn: {
        name: 'Золотая осень',
        themeStyle: 'Тёплый, уютный, янтарный',
        colors: { primary: '#D2691E', secondary: '#8B4513', accent: '#FFA500', background: '#FFF3E0' },
        animation: 'leaves'
    },
    new_year: {
        name: 'Новый Год',
        themeStyle: 'Праздничный, фейерверки, sparkles',
        colors: { primary: '#D32F2F', secondary: '#0D47A1', accent: '#FFD700', background: '#1a1a2e' },
        animation: 'fireworks'
    },
    orthodox_christmas: {
    name: 'Рождество Христово',
    themeStyle: 'Традиционное, сани с оленями, рождественские украшения',
    colors: { primary: '#C41E3A', secondary: '#2E5A2E', accent: '#FFD700', background: '#0D1B2A' },
    animation: 'santaSleigh',
    decorations: true
},
    maslenitsa: {
        name: 'Масленица',
        themeStyle: 'Костер, вращающееся солнце',
        colors: { primary: '#FF8F00', secondary: '#E65100', accent: '#FDD835', background: '#FFF3E0' },
        animation: 'bonfire'
    },
    victory_day: {
        name: 'День Победы',
        themeStyle: 'Патриотичный, фейерверки, Вечный огонь',
        colors: { primary: '#2E7D32', secondary: '#B71C1C', accent: '#FFD700', background: '#1a1a2e' },
        animation: 'fireworks'
    },
    may_day: {
        name: 'Первомай',
        themeStyle: 'Весна, солидарность, голуби мира',
        colors: { primary: '#E31E24', secondary: '#FFD700', accent: '#005BBB', background: '#FFF5F5' },
        animation: 'mayday'
    },
    environment_day: {
        name: 'День окружающей среды',
        themeStyle: 'Эко-зеленый, бабочки, рост растений',
        colors: { primary: '#2E7D32', secondary: '#1B5E20', accent: '#81C784', background: '#E8F5E9' },
        animation: 'greenleaves'
    },
    russia_day: {
        name: 'День России',
        themeStyle: 'Триколор, конфетти, гордость',
        colors: { primary: '#003399', secondary: '#CC0000', accent: '#FFFFFF', background: '#f0f0f0' },
        animation: 'confetti'
    },
    white_nights: {
        name: 'Белые ночи',
        themeStyle: 'Элегантный, звезды, лунный свет',
        colors: { primary: '#6A4C9C', secondary: '#2D1B4E', accent: '#C77DFF', background: '#0F0B1A' },
        animation: 'stars'
    },
    scarlet_sails: {
        name: 'Алые паруса',
        themeStyle: 'Мечтательный, парусник, отражения',
        colors: { primary: '#DC143C', secondary: '#8B0000', accent: '#FFD700', background: '#1a0a2e' },
        animation: 'ship'
    },
    reindeer_day: {
        name: 'День оленевода',
        themeStyle: 'Арктический, бегущие олени, северное сияние',
        colors: { primary: '#8B7355', secondary: '#4A3728', accent: '#D4A373', background: '#FAF0E6' },
        animation: 'reindeer'
    },
    knowledge_day: {
        name: 'День Знаний',
        themeStyle: 'Осенние листья, уют',
        colors: { primary: '#5D4037', secondary: '#FF9800', accent: '#4CAF50', background: '#FFF8E1' },
        animation: 'books'
    },
    halloween: {
        name: 'Хэллоуин',
        themeStyle: 'Мистический, летучие мыши, туман',
        colors: { primary: '#FF6B00', secondary: '#2D0A0A', accent: '#FFB347', background: '#1a0a0a' },
        animation: 'pumpkins'
    },
    unity_day: {
        name: 'День Народного Единства',
        themeStyle: 'Красный, Синий, Золотой, ленты',
        colors: { primary: '#D32F2F', secondary: '#1976D2', accent: '#FFC107', background: '#1a1a2e' },
        animation: 'ribbons'
    },
    griffin_day: {
        name: 'День Золотого Грифона',
        themeStyle: 'Премиум бренд — летящий грифон, золотое сияние',
        colors: { primary: '#FFD700', secondary: '#1a1a1a', accent: '#B8860B', background: '#0a0a0a' },
        animation: 'griffin',
        signature: true
    }
};

// Populate enhanced festivals in admin panel
function populateEnhancedFestivals() {
    const container = document.querySelector('.festival-themes-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const festivalList = [
        { id: 'winter_arctic', icon: '❄️', name: 'Арктическая зима' },
        { id: 'spring', icon: '🌸', name: 'Весна' },
        { id: 'summer', icon: '☀️', name: 'Лето' },
        { id: 'autumn', icon: '🍂', name: 'Осень' },
        { id: 'new_year', icon: '🎄', name: 'Новый Год' },
        { id: 'orthodox_christmas', icon: '✝️', name: 'Рождество' },
        { id: 'maslenitsa', icon: '🥞', name: 'Масленица' },
        { id: 'victory_day', icon: '🎖️', name: 'День Победы' },
        { id: 'may_day', icon: '🌷', name: 'Первомай' },
        { id: 'environment_day', icon: '🌍', name: 'День окружающей среды' },
        { id: 'white_nights', icon: '🌙', name: 'Белые ночи' },
        { id: 'scarlet_sails', icon: '⛵', name: 'Алые паруса' },
        { id: 'reindeer_day', icon: '🦌', name: 'День оленевода' },
        { id: 'halloween', icon: '🎃', name: 'Хэллоуин' },
        { id: 'griffin_day', icon: '🦅', name: 'День Золотого Грифона 🔥' }
    ];
    
    festivalList.forEach(festival => {
        const theme = enhancedFestivals[festival.id];
        if (theme) {
            const card = document.createElement('div');
            card.className = 'festival-card';
            card.setAttribute('data-festival', festival.id);
            card.onclick = () => applyEnhancedTheme(festival.id);
            card.innerHTML = `
                <div style="font-size: 48px; text-align: center;">${festival.icon}</div>
                <h4 style="margin: 10px 0 5px; text-align: center;">${festival.name}</h4>
                <p style="font-size: 11px; color: #666; text-align: center;">${theme.themeStyle}</p>
                <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px;">
                    <div style="width: 25px; height: 25px; border-radius: 50%; background: ${theme.colors.primary};"></div>
                    <div style="width: 25px; height: 25px; border-radius: 50%; background: ${theme.colors.secondary};"></div>
                    <div style="width: 25px; height: 25px; border-radius: 50%; background: ${theme.colors.accent};"></div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}
// ============ ENHANCED FESTIVAL THEMES DATA ============


// Apply theme and save to Supabase (shared for ALL visitors)
window.applyEnhancedTheme = async function(festivalId) {
    const theme = enhancedFestivals[festivalId];
    if (!theme) {
        console.error('Theme not found:', festivalId);
        alert('Тема не найдена!');
        return;
    }
    
    console.log('🎨 Applying theme:', theme.name);
    
    const themeData = {
        type: 'festival',
        festivalId: festivalId,
        name: theme.name,
        colors: theme.colors,
        animation: theme.animation,
        signature: theme.signature || false,
        appliedAt: new Date().toISOString()
    };
    
    // Show notification
    showThemeNotification('⏳ Сохранение темы для всех посетителей...', 'info');
    
    try {
        // SAVE TO SUPABASE (SHARED FOR ALL VISITORS)
        await updateActiveTheme(themeData);
        
        console.log('✅ Theme saved to Supabase (shared for all visitors)');
        showThemeNotification(`✅ Тема "${theme.name}" применена для ВСЕХ посетителей сайта!`, 'success');
        
        // Also save to localStorage for admin preview
        localStorage.setItem('main_page_theme', JSON.stringify(themeData));
        
    } catch (err) {
        console.error('Error saving theme:', err);
        showThemeNotification('❌ Ошибка сохранения темы в базу данных', 'error');
        return;
    }
    
    // Update UI preview on admin page
    updateAdminThemePreview(theme.colors, theme.name);
    highlightSelectedFestivalCard(festivalId);
    
    // Update color pickers
    document.getElementById('mainPrimaryColor').value = theme.colors.primary;
    document.getElementById('mainSecondaryColor').value = theme.colors.secondary;
    document.getElementById('mainAccentColor').value = theme.colors.accent;
    document.getElementById('mainBackgroundColor').value = theme.colors.background;
    
    // Play preview animation
    playPreviewAnimation(theme.animation);
    
    if (festivalId === 'griffin_day') {
        showGriffinPreview();
    }
};

// ============ ADD THIS FUNCTION RIGHT HERE ============
function autoDetectAndApplyFestival() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    console.log('Auto-detecting festival for date:', month, '/', day);
    
    // Auto-detect festival based on date
    if (month === 1 && day === 1) applyEnhancedTheme('new_year');
    else if (month === 1 && day === 7) applyEnhancedTheme('orthodox_christmas');
    else if (month === 5 && day === 9) applyEnhancedTheme('victory_day');
    else if (month === 6 && day === 12) applyEnhancedTheme('russia_day');
    else if (month === 5 && day === 1) applyEnhancedTheme('may_day');
    else if (month === 6 && day === 5) applyEnhancedTheme('environment_day');
    else if (month === 10 && day === 31) applyEnhancedTheme('halloween');
    else if (month === 9 && day === 1) applyEnhancedTheme('knowledge_day');
    else if (month === 11 && day === 4) applyEnhancedTheme('unity_day');
    else if (month === 3 && day === 15) applyEnhancedTheme('griffin_day');
    else {
        alert('Сегодня нет праздничной темы. Выберите тему вручную.');
    }
}

// Update admin theme preview
function updateAdminThemePreview(colors, themeName) {
    const previewContainer = document.getElementById('currentMainThemePreview');
    const themeNameSpan = document.getElementById('currentThemeName');
    
    if (themeNameSpan) {
        themeNameSpan.textContent = themeName;
    }
    
    if (previewContainer) {
        const colorBoxes = previewContainer.querySelectorAll('div div');
        if (colorBoxes.length >= 3) {
            colorBoxes[0].style.backgroundColor = colors.primary;
            colorBoxes[1].style.backgroundColor = colors.secondary;
            colorBoxes[2].style.backgroundColor = colors.accent;
        }
        
        // Update gradient background
        previewContainer.style.background = `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`;
    }
}

// Highlight selected festival card
function highlightSelectedFestivalCard(festivalId) {
    const cards = document.querySelectorAll('.festival-card');
    cards.forEach(card => {
        card.style.borderColor = '#e0e0e0';
        card.style.backgroundColor = 'white';
        card.style.transform = 'scale(1)';
    });
    
    const selectedCard = document.querySelector(`.festival-card[data-festival="${festivalId}"]`);
    if (selectedCard) {
        selectedCard.style.borderColor = '#FFD700';
        selectedCard.style.backgroundColor = '#fff8f0';
        selectedCard.style.transform = 'scale(1.02)';
    }
}



// Play preview animation on admin page
function playPreviewAnimation(animationType) {
    // Remove existing preview animation
    const existingPreview = document.getElementById('preview-animation');
    if (existingPreview) existingPreview.remove();
    
    const container = document.createElement('div');
    container.id = 'preview-animation';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    `;
    document.body.appendChild(container);
    
    // Quick preview animations (reduced count for performance)
    const count = 30;
    
    switch(animationType) {
        case 'snow':
        case 'aurora':
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.innerHTML = '❄️';
                particle.style.cssText = `
                    position: absolute; left: ${Math.random() * 100}%; top: -20px;
                    font-size: ${12 + Math.random() * 15}px;
                    animation: snowFall ${2 + Math.random() * 3}s linear infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                container.appendChild(particle);
            }
            break;
        case 'petals':
        case 'leaves':
            const items = animationType === 'petals' ? ['🌸', '🌼'] : ['🍂', '🍁'];
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.innerHTML = items[Math.floor(Math.random() * items.length)];
                particle.style.cssText = `
                    position: absolute; left: ${Math.random() * 100}%; top: -20px;
                    font-size: ${14 + Math.random() * 15}px;
                    animation: leafFall ${2 + Math.random() * 3}s linear infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                container.appendChild(particle);
            }
            break;
        case 'fireworks':
        case 'confetti':
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const firework = document.createElement('div');
                    firework.innerHTML = animationType === 'fireworks' ? '🎆' : '🎉';
                    firework.style.cssText = `
                        position: absolute;
                        left: ${20 + Math.random() * 60}%;
                        top: ${20 + Math.random() * 40}%;
                        font-size: ${25 + Math.random() * 30}px;
                        animation: explode 0.5s ease-out forwards;
                        opacity: 0;
                    `;
                    container.appendChild(firework);
                    setTimeout(() => firework.remove(), 500);
                }, i * 200);
            }
            break;
        default:
            // Default confetti effect
            for (let i = 0; i < 30; i++) {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: absolute; left: ${Math.random() * 100}%; top: -10px;
                    width: 8px; height: 8px;
                    background: ${['#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 3)]};
                    animation: confettiFall ${2 + Math.random() * 2}s linear infinite;
                `;
                container.appendChild(confetti);
            }
            break;
    }
    
    // Remove preview animation after 5 seconds
    setTimeout(() => {
        if (container.parentNode) container.remove();
    }, 5000);
}

// Special preview for Griffin Day
function showGriffinPreview() {
    const container = document.createElement('div');
    container.id = 'griffin-preview';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
        overflow: visible;
    `;
    document.body.appendChild(container);
    
    const griffin = document.createElement('div');
    griffin.innerHTML = '🦅';
    griffin.style.cssText = `
        position: absolute;
        top: 100px;
        left: -100px;
        font-size: 50px;
        animation: griffinPreview 2s ease-in-out forwards;
        filter: drop-shadow(0 0 10px gold);
    `;
    container.appendChild(griffin);
    
    // Add trail effect
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const trail = document.createElement('div');
            trail.innerHTML = '✨';
            trail.style.cssText = `
                position: absolute;
                top: ${100 + Math.random() * 20}px;
                left: ${-100 + i * 15}px;
                font-size: ${12 + Math.random() * 12}px;
                opacity: ${1 - i / 20};
                animation: fadeOut 0.3s ease-out forwards;
            `;
            container.appendChild(trail);
            setTimeout(() => trail.remove(), 300);
        }, i * 50);
    }
    
    setTimeout(() => {
        if (container.parentNode) container.remove();
    }, 2500);
}

// Add animation keyframes if not exists
if (!document.getElementById('theme-keyframes')) {
    const keyframes = document.createElement('style');
    keyframes.id = 'theme-keyframes';
    keyframes.textContent = `
        @keyframes snowFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes leafFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(180deg); opacity: 0; }
        }
        @keyframes confettiFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes explode {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
        }
        @keyframes griffinPreview {
            0% { left: -100px; transform: scale(1); }
            50% { left: 45%; transform: scale(1.2); filter: drop-shadow(0 0 20px gold); }
            100% { left: calc(100% + 100px); transform: scale(1); }
        }
        @keyframes fadeOut {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.5); }
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(keyframes);
}

// Initialize festival cards with event listeners
function initFestivalCards() {
    const cards = document.querySelectorAll('.festival-card');
    console.log('Found festival cards:', cards.length);
    
    cards.forEach(card => {
        // Remove any existing onclick to avoid duplicates
        const festivalId = card.getAttribute('data-festival');
        if (festivalId) {
            card.onclick = function() {
                console.log('Festival clicked:', festivalId);
                window.applyEnhancedTheme(festivalId);
            };
        }
    });
}

// Load saved theme from Supabase on page load
async function loadSavedAdminTheme() {
    try {
        const themeData = await getActiveTheme();  // ← READ FROM SUPABASE
        
        if (themeData && themeData.colors) {
            updateAdminThemePreview(themeData.colors, themeData.name || 'Стандартная');
            if (themeData.festivalId) {
                highlightSelectedFestivalCard(themeData.festivalId);
            }
            console.log('✅ Loaded theme from Supabase:', themeData.name);
        } else {
            console.log('No active theme in Supabase, using default');
        }
    } catch(e) {
        console.error('Error loading saved theme from Supabase:', e);
    }
}


// Reset theme - This is what the button should call
window.resetMainTheme = async function() {
    console.log('Reset button clicked - forcing database reset');
    
    const defaultThemeData = {
        type: 'default',
        name: 'Стандартная',
        colors: {
            primary: '#F5A623',
            secondary: '#1a1a2e',
            accent: '#764ba2',
            background: '#ffffff'
        }
    };
    
    try {
        // Direct update to Supabase (this worked in your test)
        const { error } = await supabaseAdmin
            .from('site_settings')
            .update({ 
                active_theme: 'default',
                theme_data: defaultThemeData,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);
        
        if (error) {
            alert('Ошибка: ' + error.message);
            return;
        }
        
        // Clear local storage
        localStorage.removeItem('main_page_theme');
        
        // Update UI preview
        const previewContainer = document.getElementById('currentMainThemePreview');
        if (previewContainer) {
            const colorBoxes = previewContainer.querySelectorAll('div div');
            if (colorBoxes.length >= 3) {
                colorBoxes[0].style.backgroundColor = defaultThemeData.colors.primary;
                colorBoxes[1].style.backgroundColor = defaultThemeData.colors.secondary;
                colorBoxes[2].style.backgroundColor = defaultThemeData.colors.accent;
            }
        }
        
        document.getElementById('currentThemeName').textContent = 'Стандартная';
        
        alert('✅ Тема сброшена! Обновите главную страницу.');
        
    } catch(err) {
        alert('Ошибка: ' + err.message);
    }
};
// Apply custom theme from color pickers
window.applyCustomMainTheme = async function() {
    const primary = document.getElementById('mainPrimaryColor').value;
    const secondary = document.getElementById('mainSecondaryColor').value;
    const accent = document.getElementById('mainAccentColor').value;
    const background = document.getElementById('mainBackgroundColor').value;
    
    const themeData = {
        type: 'custom',
        name: 'Пользовательская тема',
        colors: {
            primary: primary,
            secondary: secondary,
            accent: accent,
            background: background
        },
        appliedAt: new Date().toISOString()
    };
    
    showThemeNotification('⏳ Сохранение пользовательской темы...', 'info');
    
    try {
        // Save to Supabase
        await updateActiveTheme(themeData);
        
        console.log('✅ Custom theme saved to Supabase');
        showThemeNotification('✅ Пользовательская тема применена для ВСЕХ посетителей!', 'success');
        
        // Update UI preview
        updateAdminThemePreview(themeData.colors, themeData.name);
        
        // Remove highlight from festival cards
        document.querySelectorAll('.festival-card').forEach(card => {
            card.style.borderColor = '#e0e0e0';
            card.style.backgroundColor = 'white';
            card.style.transform = 'scale(1)';
        });
        
        // Also save to localStorage for backup
        localStorage.setItem('main_page_theme', JSON.stringify(themeData));
        
    } catch (err) {
        console.error('Error saving custom theme:', err);
        showThemeNotification('❌ Ошибка: ' + err.message, 'error');
    }
};

// ============ HERO VIDEO MANAGEMENT ============

// Load current hero video in admin panel
async function loadCurrentHeroVideo() {
    const heroVideo = await getHeroVideo();
    const currentVideo = document.getElementById('currentHeroPreview');
    if (currentVideo && heroVideo?.video_url) {
        currentVideo.src = heroVideo.video_url;
        currentVideo.load();
    }
}

// Handle hero video selection preview
function initHeroVideoUpload() {
    const heroVideoInput = document.getElementById('heroVideoInput');
    if (heroVideoInput) {
        heroVideoInput.addEventListener('change', function(e) {
            const previewContainer = document.getElementById('heroVideoPreview');
            const previewVideo = document.getElementById('previewHeroVideo');
            
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const url = URL.createObjectURL(file);
                previewVideo.src = url;
                previewVideo.load();
                previewContainer.style.display = 'block';
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }
    
       // Save hero video button
    const saveBtn = document.getElementById('saveHeroVideoBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            const fileInput = document.getElementById('heroVideoInput');
            const file = fileInput?.files[0];
            
            if (!file) {
                alert('Пожалуйста, выберите видео файл');
                return;
            }
            
            // ========== ADD THIS CHECK ==========
            if (file.size > 200 * 1024 * 1024) { // 200MB
                alert('Файл слишком большой! Максимальный размер 200MB.');
                return;
            }
            // =====================================

            saveBtn.disabled = true;
            saveBtn.textContent = 'Загрузка...';
            
            const result = await saveHeroVideo(file);
            
            if (result) {
                alert('Hero видео успешно обновлено!');
                fileInput.value = '';
                document.getElementById('heroVideoPreview').style.display = 'none';
                await loadCurrentHeroVideo();
            } else {
                // Just in case it still fails for another reason
                alert('Ошибка при загрузке видео');
            }
            
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить Hero видео';
        });
    }
    
    // Reset hero video button
    const resetBtn = document.getElementById('resetHeroVideoBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async function() {
            if (confirm('Сбросить hero видео на стандартное?')) {
                resetBtn.disabled = true;
                resetBtn.textContent = 'Сброс...';
                
                const result = await resetHeroVideo();
                
                if (result) {
                    alert('Hero видео сброшено на стандартное');
                    await loadCurrentHeroVideo();
                } else {
                    alert('Ошибка при сбросе видео');
                }
                
                resetBtn.disabled = false;
                resetBtn.textContent = 'Сбросить на стандартное';
            }
        });
    }
}

// Add this function for year validation
function validateYear(input) {
    let year = input.value;
    const currentYear = new Date().getFullYear();
    const minYear = 2019;
    
    if (year && (year < minYear || year > currentYear)) {
        alert(`Год должен быть от ${minYear} до ${currentYear}`);
        input.value = '';
    }
}

// Add this for festival themes (placeholder - implement as needed)
function applyFestivalTheme(themeName) {
    console.log('Applying festival theme:', themeName);
    // This function should apply CSS theme to main website
    // For now, just show alert
    alert(`Тема "${themeName}" применена. Обновите главную страницу для просмотра.`);
    
    // Save to localStorage for main page to read
    localStorage.setItem('festival_theme', themeName);
    
}
async function initStatsSection() {
    // Load current stats into the form
    try {
        const stats = await getStats(); 
        console.log("Stats loaded:", stats);

        const vol = document.getElementById('statVolunteers');
        const proj = document.getElementById('statProjects');
        const help = document.getElementById('statHelp');

        // Set to DB values or defaults
        if (vol) vol.value = (stats && stats.active_volunteers) ? stats.active_volunteers : 150;
        if (proj) proj.value = (stats && stats.completed_projects) ? stats.completed_projects : 50;
        if (help) help.value = (stats && stats.help_provided) ? stats.help_provided : 5000;

    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('statVolunteers').value = 150;
        document.getElementById('statProjects').value = 50;
        document.getElementById('statHelp').value = 5000;
    }

    // Handle form submission
    const statsForm = document.getElementById('statsForm');
    if (statsForm) {
        statsForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const volunteers = parseInt(document.getElementById('statVolunteers').value);
            const projects = parseInt(document.getElementById('statProjects').value);
            const help = parseInt(document.getElementById('statHelp').value);

            // ========== STRICT LIMITS ==========
            if (isNaN(volunteers) || volunteers < 100 || volunteers > 1000000) {
                alert("❌ Добровольцы: Значение должно быть от 100 до 1,000,000!");
                return;
            }
            if (isNaN(projects) || projects < 10 || projects > 100000) {
                alert("❌ Проекты: Значение должно быть от 10 до 100,000!");
                return;
            }
            if (isNaN(help) || help < 100 || help > 1000000) {
                alert("❌ Помощь: Значение должно быть от 100 до 1,000,000!");
                return;
            }
            // ===================================

            const statsData = {
                active_volunteers: volunteers,
                completed_projects: projects,
                help_provided: help
            };

            try {
                await updateStats(statsData);
                alert('✅ Статистика успешно обновлена!');
            } catch (error) {
                alert('❌ Ошибка: ' + error.message);
            }
        });
    }

    // ========== ADD THIS RESET LOGIC ==========
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!confirm('Сбросить статистику на значения по умолчанию (150, 50, 5000)?')) {
                return;
            }

            const defaultData = {
                active_volunteers: 150,
                completed_projects: 50,
                help_provided: 5000
            };

            try {
                await updateStats(defaultData);
                
                // Update the input fields
                document.getElementById('statVolunteers').value = 150;
                document.getElementById('statProjects').value = 50;
                document.getElementById('statHelp').value = 5000;
                
                alert('✅ Статистика сброшена до значений по умолчанию!');
            } catch (error) {
                alert('❌ Ошибка: ' + error.message);
            }
        });
    }
    // ========== END RESET LOGIC ==========
}
// At the very bottom of admin.js
window.loadQueries = loadQueries;