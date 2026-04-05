/**
 * mod.js - Hệ thống quản lý Mod/Plugin
 * Chuyên trách: Load, Save và thực thi các đoạn mã mở rộng.
 */
const ModSystem = (function() {
    let mods = {};
    let modSettings = {};

    // Load settings từ localStorage
    function loadSettings() {
        const saved = localStorage.getItem('TuTien_ModSettings');
        if (saved) {
            try {
                modSettings = JSON.parse(saved);
            } catch (e) {
                console.error("Lỗi nạp cài đặt Mod:", e);
            }
        }
    }

    // Lưu settings vào localStorage
    function saveSettings() {
        localStorage.setItem('TuTien_ModSettings', JSON.stringify(modSettings));
    }

    return {
        init: function() {
            loadSettings();
            console.log("🛠️ Hệ thống Mod đã sẵn sàng.");
        },

        /**
         * Đăng ký một Mod mới
         * @param {String} id - ID duy nhất của Mod
         * @param {Object} modObj - Đối tượng chứa logic của Mod
         */
        register: function(id, modObj) {
            if (mods[id]) {
                console.warn(`Mod ${id} đã tồn tại, đang ghi đè...`);
            }
            mods[id] = modObj;
            
            // Khởi tạo settings mặc định nếu chưa có
            if (!modSettings[id]) {
                modSettings[id] = modObj.defaultSettings || {};
            }

            // Chạy hàm init của mod nếu có
            if (modObj.init) {
                modObj.init(modSettings[id]);
            }

            console.log(`✅ Đã nạp Mod: ${modObj.name || id}`);
        },

        /**
         * Lấy cài đặt của một Mod
         */
        getSettings: function(id) {
            return modSettings[id] || {};
        },

        /**
         * Cập nhật cài đặt của một Mod
         */
        updateSettings: function(id, newSettings) {
            modSettings[id] = { ...modSettings[id], ...newSettings };
            saveSettings();
            
            // Thông báo cho mod biết settings đã thay đổi
            if (mods[id] && mods[id].onSettingsChange) {
                mods[id].onSettingsChange(modSettings[id]);
            }
        },

        /**
         * Lấy danh sách tất cả các Mod đã nạp
         */
        getAllMods: function() {
            return Object.keys(mods).map(id => ({
                id,
                name: mods[id].name,
                description: mods[id].description,
                enabled: modSettings[id].enabled !== false
            }));
        },

        /**
         * Hiển thị giao diện quản lý Mod
         */
        showManager: function() {
            const modUI = document.getElementById('mod-manager-ui');
            if (!modUI) return;
            
            const list = modUI.querySelector('.mod-list');
            list.innerHTML = this.getAllMods().map(mod => `
                <div class="mod-item p-3 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <div class="font-bold text-yellow-500">${mod.name || mod.id}</div>
                        <div class="text-xs text-gray-400">${mod.description || 'Không có mô tả'}</div>
                    </div>
                    <button onclick="window.ModSystem.toggle('${mod.id}')" 
                            class="px-3 py-1 rounded text-xs ${mod.enabled ? 'bg-green-600' : 'bg-red-600'}">
                        ${mod.enabled ? 'BẬT' : 'TẮT'}
                    </button>
                </div>
                ${mod.id === 'cheat_mod' && mod.enabled ? `
                <div class="p-2 bg-black/40 flex flex-wrap gap-2 border-b border-gray-800">
                    <button onclick="Cheat.addSpiritStones()" class="bg-yellow-600/80 hover:bg-yellow-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">+10k 💎 Linh Thạch</button>
                    <button onclick="Cheat.addAllReputation()" class="bg-blue-600/80 hover:bg-blue-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">+10k Danh Vọng</button>
                    <button onclick="Cheat.addMana()" class="bg-purple-600/80 hover:bg-purple-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">+10k Linh Khí</button>
                    <button onclick="Cheat.addContribution()" class="bg-pink-600/80 hover:bg-pink-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">+10k Cống Hiến</button>
                    <button onclick="Cheat.unlockAllTitles()" class="bg-indigo-600/80 hover:bg-indigo-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Mở Khóa Danh Hiệu</button>
                    <button onclick="Cheat.learnAllSkills()" class="bg-red-600/80 hover:bg-red-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Học Hết Thần Thông</button>
                    <button onclick="Cheat.setChitonBone()" class="bg-orange-600/80 hover:bg-orange-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Nhận Chí Tôn Cốt</button>
                    <button onclick="Cheat.increaseRank()" class="bg-emerald-600/80 hover:bg-emerald-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Tăng 1 Cảnh Giới</button>
                    <button onclick="Cheat.addPetEggs()" class="bg-pink-500/80 hover:bg-pink-500 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">+5 Trứng Linh Thú</button>
                    <button onclick="Cheat.hatchAllEggs()" class="bg-pink-700/80 hover:bg-pink-700 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Nở Hết Trứng</button>
                    <button onclick="Cheat.levelUpAllPets()" class="bg-cyan-600/80 hover:bg-cyan-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Tăng 1 Cấp Pet</button>
                    <button onclick="Cheat.perfectAllPets()" class="bg-yellow-500/80 hover:bg-yellow-500 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Tố Chất 115% (Perfect)</button>
                    <button onclick="Cheat.decreaseAllPetsLoyalty()" class="bg-red-800/80 hover:bg-red-800 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">Giảm 10% Trung Thành</button>
                    <button onclick="Cheat.addSectGifts()" class="bg-amber-600/80 hover:bg-amber-600 px-2 py-1 rounded text-[10px] font-bold text-white transition-colors">+Đồ Tặng Môn Phái</button>
                </div>
                ` : ''}
            `).join('');
            
            modUI.classList.remove('hidden');
        },

        /**
         * Bật/Tắt một Mod
         */
        toggle: function(id) {
            if (!modSettings[id]) modSettings[id] = {};
            modSettings[id].enabled = modSettings[id].enabled === false;
            saveSettings();
            alert(`Đã ${modSettings[id].enabled ? 'bật' : 'tắt'} Mod: ${id}. Vui lòng tải lại trang để áp dụng.`);
            this.showManager();
        }
    };
})();

window.ModSystem = ModSystem;
ModSystem.init();
