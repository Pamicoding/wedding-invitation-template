// ============================================
// CONFIG — 使用模板時只需要修改這裡
// ============================================
const CONFIG = {
    // 婚禮日期與時間（格式：YYYY-MM-DDTHH:MM:SS），倒數計時與日曆都會依此產生
    weddingDate: '2050-05-20T18:00:00',

    // Google Apps Script Web App URL（賓客驗證 + 回覆寫入 Google Sheets）
    // 保留預設值時會進入「Demo 模式」：任何姓名都能通過驗證，送出的資料只會印在 console
    appsScriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
};

const DEMO_MODE = !CONFIG.appsScriptUrl || CONFIG.appsScriptUrl.startsWith('YOUR_');

// ============================================
// GUEST VALIDATION API
// ============================================

// 儲存當前驗證成功的賓客資訊
let currentGuest = null;

// 呼叫 API 驗證賓客
async function validateGuestAPI(name) {
    if (DEMO_MODE) {
        // Demo 模式：模擬一位受邀參加證婚的賓客
        return { found: true, ceremony: true, alreadySubmitted: false, message: `${name}，好久不見！` };
    }
    try {
        const url = `${CONFIG.appsScriptUrl}?name=${encodeURIComponent(name)}`;
        const response = await fetch(url);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error validating guest:', error);
        return { found: false, error: 'API error' };
    }
}

// ============================================
// COUNTDOWN TIMER
// ============================================
function updateCountdown() {
    const weddingDate = new Date(CONFIG.weddingDate);
    const now = new Date();
    const diff = weddingDate - now;

    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(3, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
}

// ============================================
// CALENDAR (依 CONFIG.weddingDate 產生當月日曆，週一為第一天)
// ============================================
function renderCalendar() {
    const container = document.getElementById('calendarDates');
    if (!container) return;

    const date = new Date(CONFIG.weddingDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push('<span></span>');
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d === day ? `<span class="highlight">${d}</span>` : `<span>${d}</span>`);
    }
    container.innerHTML = cells.join('');

    const monthLabel = document.getElementById('calendarMonth');
    if (monthLabel) {
        monthLabel.textContent = `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    }
}

// ============================================
// FORM HANDLING
// ============================================
const guestNameInput = document.getElementById('guestName');
const nameError = document.getElementById('nameError');
const formFields = document.getElementById('formFields');
const ceremonyGroup = document.getElementById('ceremonyGroup');
const ceremonyPlusOneGroup = document.getElementById('ceremonyPlusOneGroup');
const ceremonyGuestCountGroup = document.getElementById('ceremonyGuestCountGroup');
const dinnerPlusOneGroup = document.getElementById('dinnerPlusOneGroup');
const dinnerGuestCountGroup = document.getElementById('dinnerGuestCountGroup');
const selfDietGroup = document.getElementById('selfDietGroup');
const guestDietGroup = document.getElementById('guestDietGroup');
const highChairGroup = document.getElementById('highChairGroup');
const emailGroup = document.getElementById('emailGroup');
const rsvpForm = document.getElementById('rsvpForm');
const thankYouMessage = document.getElementById('thankYouMessage');

// Guest name validation on blur (呼叫 API)
guestNameInput.addEventListener('blur', async function() {
    const name = this.value.trim();

    if (!name) {
        nameError.textContent = '';
        nameError.classList.remove('show');
        formFields.style.display = 'none';
        currentGuest = null;
        return;
    }

    // 顯示載入中狀態
    nameError.textContent = '驗證中...';
    nameError.classList.add('show');

    // 呼叫 API 驗證
    const result = await validateGuestAPI(name);

    if (result.found) {
        // 儲存賓客資訊供後續使用
        currentGuest = result;

        // 檢查是否已填寫過
        if (result.alreadySubmitted) {
            nameError.textContent = '您已經填寫過囉！如需修改請聯繫新娘或新郎。';
            nameError.classList.add('show');
            formFields.style.display = 'none';
            return;
        }

        // Valid guest - show form fields
        nameError.textContent = '';
        nameError.classList.remove('show');
        formFields.style.display = 'block';

        // Show ceremony field if guest is invited to ceremony
        if (result.ceremony === true) {
            ceremonyGroup.style.display = 'block';
            const ceremonyRadios = document.getElementsByName('attendCeremony');
            ceremonyRadios.forEach(radio => radio.required = true);
        } else {
            ceremonyGroup.style.display = 'none';
            ceremonyPlusOneGroup.style.display = 'none';
            ceremonyGuestCountGroup.style.display = 'none';
            const ceremonyRadios = document.getElementsByName('attendCeremony');
            ceremonyRadios.forEach(radio => {
                radio.required = false;
                radio.checked = false;
            });
        }
    } else {
        // Invalid guest
        currentGuest = null;
        nameError.textContent = '抱歉，您的姓名不在邀請名單中。如有疑問，請聯繫新人。';
        nameError.classList.add('show');
        formFields.style.display = 'none';
    }
});

// ============================================
// CONDITIONAL FIELD HANDLERS
// ============================================

// 證婚出席選擇處理
document.getElementsByName('attendCeremony').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'yes') {
            // 參加證婚 - 顯示攜伴問題
            ceremonyPlusOneGroup.style.display = 'block';
            document.getElementsByName('plusCeremonyOne').forEach(r => r.required = true);
        } else {
            // 不參加證婚 - 隱藏攜伴相關欄位
            ceremonyPlusOneGroup.style.display = 'none';
            ceremonyGuestCountGroup.style.display = 'none';
            document.getElementsByName('plusCeremonyOne').forEach(r => {
                r.required = false;
                r.checked = false;
            });
            document.getElementById('ceremonyGuestCount').value = '1';
        }
        updateEmailVisibility();
    });
});

// 證婚攜伴選擇處理
document.getElementsByName('plusCeremonyOne').forEach(radio => {
    radio.addEventListener('change', function() {
        const ceremonyGuestCount = document.getElementById('ceremonyGuestCount');
        if (this.value === 'yes') {
            ceremonyGuestCountGroup.style.display = 'block';
            ceremonyGuestCount.required = true;
        } else {
            ceremonyGuestCountGroup.style.display = 'none';
            ceremonyGuestCount.required = false;
            ceremonyGuestCount.value = '1';
        }
    });
});

// 晚宴出席選擇處理
document.getElementsByName('attendDinner').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'yes') {
            // 參加晚宴 - 顯示飲食習慣和攜伴問題
            selfDietGroup.style.display = 'block';
            dinnerPlusOneGroup.style.display = 'block';
            document.getElementsByName('plusDinnerOne').forEach(r => r.required = true);
        } else {
            // 不參加晚宴 - 隱藏所有相關欄位
            selfDietGroup.style.display = 'none';
            dinnerPlusOneGroup.style.display = 'none';
            dinnerGuestCountGroup.style.display = 'none';
            guestDietGroup.style.display = 'none';
            highChairGroup.style.display = 'none';
            document.getElementsByName('plusDinnerOne').forEach(r => {
                r.required = false;
                r.checked = false;
            });
            document.getElementById('dinnerGuestCount').value = '1';
            // 重置飲食習慣選項
            document.querySelector('input[name="selfDiet"][value="meat"]').checked = true;
        }
        updateEmailVisibility();
    });
});

// 晚宴攜伴選擇處理
document.getElementsByName('plusDinnerOne').forEach(radio => {
    radio.addEventListener('change', function() {
        const dinnerGuestCount = document.getElementById('dinnerGuestCount');
        if (this.value === 'yes') {
            dinnerGuestCountGroup.style.display = 'block';
            dinnerGuestCount.required = true;
            // 顯示攜帶賓客飲食習慣和嬰兒椅
            guestDietGroup.style.display = 'block';
            highChairGroup.style.display = 'block';
            // 初始化飲食習慣下拉選單和嬰兒椅選項
            const guestCount = parseInt(dinnerGuestCount.value);
            initGuestDietSelects(guestCount);
            updateHighChairOptions(guestCount);
        } else {
            dinnerGuestCountGroup.style.display = 'none';
            dinnerGuestCount.required = false;
            dinnerGuestCount.value = '1';
            // 隱藏攜帶賓客飲食習慣和嬰兒椅
            guestDietGroup.style.display = 'none';
            highChairGroup.style.display = 'none';
        }
    });
});

// ============================================
// GUEST DIET DYNAMIC SELECTS
// ============================================
const guestMeatCount = document.getElementById('guestMeatCount');
const guestVegCount = document.getElementById('guestVegCount');
const guestSharedCount = document.getElementById('guestSharedCount');

// 初始化攜帶賓客飲食習慣下拉選單
function initGuestDietSelects(totalGuests) {
    // 清空並重建選項
    guestMeatCount.innerHTML = '';
    guestVegCount.innerHTML = '';
    guestSharedCount.innerHTML = '';

    // 建立選項 0 到 totalGuests
    for (let i = 0; i <= totalGuests; i++) {
        guestMeatCount.appendChild(new Option(i, i));
        guestVegCount.appendChild(new Option(i, i));
        guestSharedCount.appendChild(new Option(i, i));
    }

    // 預設值：葷食 = totalGuests, 素食 = 0, 共食 = 0
    guestMeatCount.value = totalGuests;
    guestVegCount.value = 0;
    guestSharedCount.value = 0;

    // 更新其他下拉選單的可選範圍
    updateGuestDietOptions();
}

// 更新飲食習慣下拉選單的可選範圍
function updateGuestDietOptions() {
    const totalGuests = parseInt(document.getElementById('dinnerGuestCount').value);
    const meat = parseInt(guestMeatCount.value) || 0;
    const veg = parseInt(guestVegCount.value) || 0;
    const shared = parseInt(guestSharedCount.value) || 0;

    // 計算剩餘可分配的人數
    const remainingAfterMeat = totalGuests - meat;
    const remainingAfterVeg = totalGuests - meat - veg;

    // 更新素食的可選範圍
    updateSelectOptions(guestVegCount, 0, remainingAfterMeat, veg);

    // 更新共食的可選範圍
    updateSelectOptions(guestSharedCount, 0, remainingAfterVeg, shared);

    // 驗證飲食習慣總數
    validateGuestDietTotal();
}

// 驗證攜帶賓客飲食習慣總數
function validateGuestDietTotal() {
    const totalGuests = parseInt(document.getElementById('dinnerGuestCount').value);
    const meat = parseInt(guestMeatCount.value) || 0;
    const veg = parseInt(guestVegCount.value) || 0;
    const shared = parseInt(guestSharedCount.value) || 0;
    const dietTotal = meat + veg + shared;

    const guestDietError = document.getElementById('guestDietError');

    if (dietTotal < totalGuests) {
        const remaining = totalGuests - dietTotal;
        guestDietError.textContent = `還有 ${remaining} 位賓客尚未選擇飲食習慣`;
        guestDietError.classList.add('show');
        return false;
    } else {
        guestDietError.textContent = '';
        guestDietError.classList.remove('show');
        return true;
    }
}

// 更新單個下拉選單的選項
function updateSelectOptions(selectElement, min, max, currentValue) {
    const newValue = Math.min(currentValue, max);
    selectElement.innerHTML = '';

    for (let i = min; i <= max; i++) {
        selectElement.appendChild(new Option(i, i));
    }

    selectElement.value = newValue;
}

// 監聽攜伴人數變化
document.getElementById('dinnerGuestCount').addEventListener('change', function() {
    const totalGuests = parseInt(this.value);
    initGuestDietSelects(totalGuests);
    updateHighChairOptions(totalGuests);
});

// 更新嬰兒椅選項（最大值 = 攜帶賓客人數）
function updateHighChairOptions(maxCount) {
    const highChairSelect = document.getElementById('highChairCount');
    const currentValue = parseInt(highChairSelect.value) || 0;
    const newValue = Math.min(currentValue, maxCount);

    highChairSelect.innerHTML = '';
    for (let i = 0; i <= maxCount; i++) {
        highChairSelect.appendChild(new Option(i, i));
    }
    highChairSelect.value = newValue;
}

// 監聽葷食下拉選單變化
guestMeatCount.addEventListener('change', function() {
    updateGuestDietOptions();
});

// 監聽素食下拉選單變化
guestVegCount.addEventListener('change', function() {
    updateGuestDietOptions();
});

// 監聽共食下拉選單變化
guestSharedCount.addEventListener('change', function() {
    updateGuestDietOptions();
});

// 更新 Email 欄位顯示狀態
function updateEmailVisibility() {
    const attendCeremony = document.querySelector('input[name="attendCeremony"]:checked')?.value;
    const attendDinner = document.querySelector('input[name="attendDinner"]:checked')?.value;
    const emailInput = document.getElementById('email');
    
    // 檢查是否有受邀證婚
    const isInvitedToCeremony = currentGuest?.ceremony === true;
    
    // 判斷是否完全不出席
    const isNotAttending = (attendDinner === 'no') && 
        (!isInvitedToCeremony || attendCeremony === 'no');
    
    if (isNotAttending) {
        emailGroup.style.display = 'none';
        emailInput.required = false;
    } else {
        emailGroup.style.display = 'block';
        emailInput.required = true;
    }
}

// ============================================
// GOOGLE SHEETS INTEGRATION
// ============================================
async function submitToGoogleSheets(formData) {
    if (DEMO_MODE) {
        console.info('[Demo 模式] 未設定 CONFIG.appsScriptUrl，表單資料不會送出：', formData);
        return true;
    }
    try {
        await fetch(CONFIG.appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        return true;
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return false;
    }
}

// ============================================
// FORM SUBMISSION
// ============================================
rsvpForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 驗證攜帶賓客飲食習慣（如果有攜帶賓客的話）
    const attendDinnerChecked = document.querySelector('input[name="attendDinner"]:checked')?.value;
    const plusDinnerOneChecked = document.querySelector('input[name="plusDinnerOne"]:checked')?.value;

    if (attendDinnerChecked === 'yes' && plusDinnerOneChecked === 'yes') {
        if (!validateGuestDietTotal()) {
            // 滾動到錯誤訊息
            document.getElementById('guestDietGroup').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }

    // 取得各欄位的值
    const attendCeremonyValue = document.querySelector('input[name="attendCeremony"]:checked')?.value || 'no';
    const attendDinnerValue = document.querySelector('input[name="attendDinner"]:checked').value;
    const plusCeremonyOneValue = document.querySelector('input[name="plusCeremonyOne"]:checked')?.value || 'no';
    const plusDinnerOneValue = document.querySelector('input[name="plusDinnerOne"]:checked')?.value || 'no';

    // 計算攜伴人數（不攜伴時為 0）
    const bringCeremonyCount = (attendCeremonyValue === 'yes' && plusCeremonyOneValue === 'yes')
        ? document.getElementById('ceremonyGuestCount').value
        : '0';
    const bringDinnerCount = (attendDinnerValue === 'yes' && plusDinnerOneValue === 'yes')
        ? document.getElementById('dinnerGuestCount').value
        : '0';

    // 取得飲食習慣相關欄位（僅在參加晚宴時有效）
    const selfDietValue = attendDinnerValue === 'yes'
        ? (document.querySelector('input[name="selfDiet"]:checked')?.value || 'meat')
        : '';
    const guestMeatValue = (attendDinnerValue === 'yes' && plusDinnerOneValue === 'yes')
        ? document.getElementById('guestMeatCount').value
        : '0';
    const guestVegValue = (attendDinnerValue === 'yes' && plusDinnerOneValue === 'yes')
        ? document.getElementById('guestVegCount').value
        : '0';
    const guestSharedValue = (attendDinnerValue === 'yes' && plusDinnerOneValue === 'yes')
        ? document.getElementById('guestSharedCount').value
        : '0';
    const highChairValue = (attendDinnerValue === 'yes' && plusDinnerOneValue === 'yes')
        ? document.getElementById('highChairCount').value
        : '0';

    // 計算最終餐點數量
    const selfMeatMeals = (selfDietValue === 'meat') ? 1 : 0;
    const selfVegMeals = (selfDietValue === 'vegetarian') ? 1 : 0;
    const totalMeatMeals = attendDinnerValue === 'yes' ? (selfMeatMeals + parseInt(guestMeatValue)) : 0;
    const totalVegMeals = attendDinnerValue === 'yes' ? (selfVegMeals + parseInt(guestVegValue)) : 0;

    // Collect form data
    const formData = {
        name: document.getElementById('guestName').value.trim(),
        attendCeremony: attendCeremonyValue,
        plusCeremonyOne: plusCeremonyOneValue,
        bringCeremonyCount: bringCeremonyCount,
        attendDinner: attendDinnerValue,
        plusDinnerOne: plusDinnerOneValue,
        bringDinnerCount: bringDinnerCount,
        // 新增欄位
        selfDiet: selfDietValue,
        guestMeatCount: guestMeatValue,
        guestVegCount: guestVegValue,
        guestSharedCount: guestSharedValue,
        totalMeatMeals: totalMeatMeals.toString(),
        totalVegMeals: totalVegMeals.toString(),
        highChairCount: highChairValue,
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('guestMessage').value.trim(),
        timestamp: new Date().toISOString()
    };

    // Submit to Google Sheets
    const success = await submitToGoogleSheets(formData);

    // 檢查是否不出席（證婚和晚宴都不參加）
    const isNotAttending = formData.attendDinner === 'no' && 
        (formData.attendCeremony === 'no' || !currentGuest?.ceremony);

    // 根據出席狀況更新訊息
    const welcomeHeaders = thankYouMessage.querySelectorAll('h3');
    const confirmationText = document.querySelector('#thankYouMessage .confirmation-text');
    const thankYouText = document.querySelector('#thankYouMessage .thank-you-text');

    if (isNotAttending) {
        // 不出席的情況
        if (welcomeHeaders[0]) welcomeHeaders[0].style.display = 'none';
        if (thankYouText) thankYouText.textContent = '太可惜你不能來了🥲';
        if (welcomeHeaders[1]) welcomeHeaders[1].style.display = 'none';
        if (confirmationText) confirmationText.textContent = '感謝您的回覆！我們已收到您的資訊\n祝你有美好的一天!';
    } else {
        // 會出席的情況 - 顯示個人化 message（如果有的話）
        if (welcomeHeaders[0]) welcomeHeaders[0].textContent = 'WELCOME';
        if (currentGuest && currentGuest.message && thankYouText) {
            thankYouText.textContent = currentGuest.message;
        }
        if (welcomeHeaders[1]) {
            welcomeHeaders[1].style.display = 'block';
            welcomeHeaders[1].textContent = 'TO OUR WEDDING';
        }
        if (confirmationText) confirmationText.textContent = '感謝您的回覆！我們已收到您的資訊\n電子喜帖將在後續寄送至您的信箱!';
    }

    // Show thank you message regardless (because of no-cors mode we can't verify)
    rsvpForm.style.display = 'none';
    thankYouMessage.style.display = 'block';

    // Scroll to thank you message
    thankYouMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Log for debugging (remove in production)
    console.log('Form submitted:', formData);
});

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();

    // Start countdown timer
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Add fade-in animations on scroll (optional enhancement)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
});

// ============================================
// PLACEHOLDER IMAGE HANDLER
// ============================================
// Handle missing images gracefully
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Create a placeholder
            const placeholder = document.createElement('div');
            placeholder.style.width = '100%';
            placeholder.style.paddingBottom = '66.67%'; // 3:2 aspect ratio
            placeholder.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.position = 'relative';
            placeholder.style.borderRadius = '8px';

            const text = document.createElement('span');
            text.textContent = '照片即將上傳';
            text.style.position = 'absolute';
            text.style.color = '#999';
            text.style.fontSize = '14px';
            text.style.letterSpacing = '2px';

            placeholder.appendChild(text);
            this.parentNode.replaceChild(placeholder, this);
        });
    });
});
