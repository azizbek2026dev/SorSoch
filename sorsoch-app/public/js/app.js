// app.js — Frontend logikasi. Ma'lumotlar endi localStorage'da emas,
// balki /api/materials orqali serverdagi SQLite database'da saqlanadi.

let postsData = [];
let isAdminLoggedIn = false;

const postsGrid = document.getElementById('postsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const gradeFilter = document.getElementById('gradeFilter');
const typeFilter = document.getElementById('typeFilter');
const termFilter = document.getElementById('termFilter');

// ----------------- API bilan ishlash -----------------

async function fetchMaterials() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (gradeFilter.value) params.set('grade', gradeFilter.value);
    if (typeFilter.value) params.set('type', typeFilter.value);
    if (termFilter.value) params.set('term', termFilter.value);

    const res = await fetch(`/api/materials?${params.toString()}`);
    postsData = await res.json();
    renderPosts();
}

async function checkAdminStatus() {
    const res = await fetch('/api/admin/status');
    const data = await res.json();
    isAdminLoggedIn = data.isAdmin;
    updateAdminBtnUI();
}

// ----------------- Tema va ko'rinish rejimi (faqat brauzer sozlamasi) -----------------

function changeTheme(themeName) {
    document.body.className = `flex flex-col min-h-full ${themeName} transition-colors duration-300`;
    localStorage.setItem('selectedTheme', themeName);
}

function toggleViewMode() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const viewModeText = document.getElementById('viewModeText');
    const bodyTag = document.getElementById('bodyTag');

    const isDesktopMode = localStorage.getItem('customViewMode') === 'desktop';

    if (isDesktopMode) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        localStorage.setItem('customViewMode', 'mobile');
        if (viewModeText) viewModeText.innerText = 'Desktop rejim';
        bodyTag.style.minWidth = '100%';
    } else {
        viewportMeta.setAttribute('content', 'width=1280');
        localStorage.setItem('customViewMode', 'desktop');
        if (viewModeText) viewModeText.innerText = 'Telefon rejim';
        bodyTag.style.minWidth = '1280px';
    }

    if (window.lucide) lucide.createIcons();
}

function applySavedViewMode() {
    const savedMode = localStorage.getItem('customViewMode');
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const viewModeText = document.getElementById('viewModeText');
    const bodyTag = document.getElementById('bodyTag');

    if (savedMode === 'desktop') {
        viewportMeta.setAttribute('content', 'width=1280');
        if (viewModeText) viewModeText.innerText = 'Telefon rejim';
        bodyTag.style.minWidth = '1280px';
    }
}

// ----------------- Kartochkalarni chizish -----------------

function createCardHtml(post) {
    const isBSB = post.type === 'BSB';
    return `
        <div onclick="openViewerModal(${post.id})" class="glass-card rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative">
            <div>
                <div class="flex items-center justify-between gap-2 mb-4">
                    <span class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${isBSB ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}">
                        ${post.type} • ${post.term}-Chorak
                    </span>
                    <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                        <span class="px-3 py-1 rounded-xl text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/50">
                            ${post.grade}-sinf
                        </span>
                        ${isAdminLoggedIn ? `
                            <button onclick="editMaterial(${post.id})" class="text-blue-400 hover:text-blue-300 p-1" title="Tahrirlash"><i data-lucide="edit" class="w-4 h-4"></i></button>
                            <button onclick="deleteMaterial(${post.id})" class="text-rose-400 hover:text-rose-300 p-1" title="O'chirish"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        ` : ''}
                    </div>
                </div>

                <h3 class="font-bold text-white text-lg leading-snug group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                    ${post.title}
                </h3>
                <p class="text-xs text-slate-400 font-semibold mb-6">${post.subject}</p>
            </div>

            <div class="pt-4 border-t border-slate-800/80 space-y-4">
                <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span class="flex items-center gap-1.5"><i data-lucide="eye" class="w-3.5 h-3.5"></i> ${post.views} ko'rishlar</span>
                    <span class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${post.date}</span>
                </div>

                <div class="grid grid-cols-2 gap-2" onclick="event.stopPropagation()">
                    <button onclick="openViewerModal(${post.id}, 'questions')" class="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold rounded-xl border border-slate-700/50 transition">
                        <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-400"></i> Savollar
                    </button>
                    ${post.answersContent
                        ? `<button onclick="openViewerModal(${post.id}, 'answers')" class="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition">
                            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Javoblar
                           </button>`
                        : `<a href="https://t.me/dok_102_2011" target="_blank" class="flex items-center justify-center gap-2 py-2.5 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-bold rounded-xl transition">
                            <i data-lucide="send" class="w-3.5 h-3.5"></i> Telegram
                           </a>`
                    }
                </div>
            </div>
        </div>
    `;
}

function renderPosts() {
    if (postsData.length === 0) {
        postsGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        postsGrid.innerHTML = postsData.map(post => createCardHtml(post)).join('');
    }

    lucide.createIcons();
    updateAdminBtnUI();
}

// ----------------- Batafsil ko'rish oynasi -----------------

async function openViewerModal(id, section = 'all') {
    // Serverdan bitta materialni olib kelamiz — bu ko'rishlar sonini ham +1 oshiradi
    const res = await fetch(`/api/materials/${id}`);
    if (!res.ok) return;
    const item = await res.json();

    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalSubtitle').innerText = `${item.subject} • ${item.grade}-sinf • ${item.type} • ${item.term}-Chorak (${item.date})`;

    let contentHtml = '';

    if (section === 'questions') {
        contentHtml = `
            <div class="p-4 glass-input rounded-2xl space-y-2 border border-blue-500/30">
                <p class="font-bold text-blue-400 text-base">📄 Savollar matni:</p>
                <p class="whitespace-pre-line text-slate-300 leading-relaxed">${item.questionsContent}</p>
            </div>
        `;
    } else if (section === 'answers') {
        contentHtml = `
            <div class="p-4 glass-input rounded-2xl space-y-2 border border-emerald-500/30">
                <p class="font-bold text-emerald-400 text-base">✅ Javoblar matni:</p>
                <p class="whitespace-pre-line text-slate-300 leading-relaxed">${item.answersContent || 'Javoblar mavjud emas.'}</p>
            </div>
        `;
    } else {
        contentHtml = `
            <div class="space-y-4">
                <div class="p-4 glass-input rounded-2xl space-y-2 border border-blue-500/30">
                    <p class="font-bold text-blue-400 text-base">📄 Savollar matni:</p>
                    <p class="whitespace-pre-line text-slate-300 leading-relaxed">${item.questionsContent}</p>
                </div>
                ${item.answersContent ? `
                <div class="p-4 glass-input rounded-2xl space-y-2 border border-emerald-500/30">
                    <p class="font-bold text-emerald-400 text-base">✅ Javoblar matni:</p>
                    <p class="whitespace-pre-line text-slate-300 leading-relaxed">${item.answersContent}</p>
                </div>
                ` : `
                <div class="p-4 glass-input rounded-2xl text-slate-300 text-center text-xs flex flex-col items-center gap-3 border border-sky-500/30">
                    <p>🔒 Javoblar yopiq. Javobni olish uchun ijtimoiy tarmoqlarimiz orqali bog'laning:</p>
                    <div class="flex items-center gap-2">
                        <a href="https://t.me/dok_102_2011" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-500 transition">
                            <i data-lucide="send" class="w-3.5 h-3.5"></i> Telegram
                        </a>
                        <a href="https://instagram.com/cyber_hack102" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-500 transition">
                            <i data-lucide="instagram" class="w-3.5 h-3.5"></i> Instagram
                        </a>
                    </div>
                </div>
                `}
            </div>
        `;
    }

    document.getElementById('modalContent').innerHTML = contentHtml;

    const textToDownload = `--- ${item.title} ---\n\n[SAVOLLAR]:\n${item.questionsContent}\n\n[JAVOBLAR]:\n${item.answersContent || 'Javoblar kiritilmagan'}`;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const btn = document.getElementById('modalDownloadBtn');
    btn.href = URL.createObjectURL(blob);
    btn.download = `${item.title}.txt`;

    document.getElementById('viewerModal').classList.remove('hidden');
    lucide.createIcons();

    // Ro'yxatdagi ko'rishlar sonini yangilash uchun qayta yuklaymiz
    fetchMaterials();
}

function closeViewerModal() {
    document.getElementById('viewerModal').classList.add('hidden');
}

// ----------------- Admin panel -----------------

function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.toggle('hidden');

    if (isAdminLoggedIn) {
        document.getElementById('adminAuthScreen').classList.add('hidden');
        document.getElementById('adminDashboardScreen').classList.remove('hidden');
        document.getElementById('adminDashboardScreen').classList.add('flex');
    } else {
        document.getElementById('adminAuthScreen').classList.remove('hidden');
        document.getElementById('adminDashboardScreen').classList.add('hidden');
    }
}

async function loginAdmin() {
    const pass = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('adminError');

    const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
    });

    if (res.ok) {
        isAdminLoggedIn = true;
        errorEl.classList.add('hidden');
        document.getElementById('adminPassword').value = '';
        toggleAdminModal();
        renderPosts();
    } else {
        errorEl.classList.remove('hidden');
    }
}

async function logoutAdmin() {
    await fetch('/api/admin/logout', { method: 'POST' });
    isAdminLoggedIn = false;
    toggleAdminModal();
    renderPosts();
}

function updateAdminBtnUI() {
    const btnText = document.getElementById('adminBtnText');
    btnText.innerText = isAdminLoggedIn ? "Admin (Faol)" : "Admin Panel";
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editItemId').value;

    const payload = {
        title: document.getElementById('newTitle').value,
        subject: document.getElementById('newSubject').value,
        grade: parseInt(document.getElementById('newGrade').value),
        type: document.getElementById('newType').value,
        term: parseInt(document.getElementById('newTerm').value),
        questionsContent: document.getElementById('newQuestions').value,
        answersContent: document.getElementById('newAnswers').value || null
    };

    const url = editId ? `/api/materials/${editId}` : '/api/materials';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        await fetchMaterials();
        resetForm();
        toggleAdminModal();
    } else {
        const data = await res.json();
        alert(data.error || 'Xatolik yuz berdi');
    }
}

async function editMaterial(id) {
    const item = postsData.find(p => p.id === id);
    if (!item) return;

    document.getElementById('editItemId').value = item.id;
    document.getElementById('newTitle').value = item.title;
    document.getElementById('newSubject').value = item.subject;
    document.getElementById('newGrade').value = item.grade;
    document.getElementById('newType').value = item.type;
    document.getElementById('newTerm').value = item.term;
    document.getElementById('newQuestions').value = item.questionsContent;
    document.getElementById('newAnswers').value = item.answersContent || '';

    document.getElementById('formModeTitle').innerText = "Materialni Tahrirlash";
    document.getElementById('submitBtn').innerText = "O'zgarishlarni Saqlash";

    toggleAdminModal();
}

function resetForm() {
    document.getElementById('editItemId').value = '';
    document.getElementById('addMaterialForm').reset();
    document.getElementById('formModeTitle').innerText = "Yangi Material Qo'shish";
    document.getElementById('submitBtn').innerText = "Saqlash";
}

async function deleteMaterial(id) {
    if (!confirm("Ushbu materialni o'chirmoqchimisiz?")) return;

    const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    if (res.ok) {
        await fetchMaterials();
    } else {
        const data = await res.json();
        alert(data.error || 'Xatolik yuz berdi');
    }
}

// ----------------- Ishga tushirish -----------------

searchInput.addEventListener('input', fetchMaterials);
gradeFilter.addEventListener('change', fetchMaterials);
typeFilter.addEventListener('change', fetchMaterials);
termFilter.addEventListener('change', fetchMaterials);

const savedTheme = localStorage.getItem('selectedTheme') || 'theme-dark';
document.getElementById('themeSelector').value = savedTheme;
changeTheme(savedTheme);

applySavedViewMode();
checkAdminStatus();
fetchMaterials();
