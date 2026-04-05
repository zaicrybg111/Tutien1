/**
 * ui.js - Chuyên trách hiển thị, Màn hình khởi đầu và Nhật ký (Log)
 * Cập nhật [2026-02-16]: 
 * 1. ĐỒNG BỘ KEY: mana -> manaCost, cd -> cooldown, ratio -> damageMult.
 * 2. FIX UI BATTLE: Khớp các ID mới (battle-player-hp-bar, battle-enemy-hp-bar).
 * 3. FIX HIỆU ỨNG CHIẾN ĐẤU: Tô màu Choáng, Độc, Đóng băng và Sát thương hiệu ứng.
 */
const UI = (function() {
    let lastLogMsg = "";
    let lastLogHighlight = false;
    let logCount = 1;
    let lastEnemyObject = null;
    let statBreakdowns = {};

    let battleLogQueue = [];
    let logInterval = null;
    let actionsShown = 0; 
    let cachedReplacements = null;
    let replacementRegex = null;
    let lastDataVersion = 0;
    
    // Pre-compiled regexes for performance
    const ST_REGEX = /(\d+) ST/g;
    const HP_HEAL_REGEX = /hồi (\d+) HP/g;
    const HP_LOSS_REGEX = /-(\d+) HP/g;
    const TIME_REGEX = /\(⏳ (\d+)s\)/g;
    
    // Caching DOM elements for performance
    const domCache = {
        battleUI: null,
        effectLayer: null,
        flashOverlay: null,
        lightningSVG: null,
        lightningGlow: null,
        lightningPoly: null,
        lightningCore: null,
        bars: {},
        texts: {}
    };

    const effectPool = [];
    const MAX_POOL_SIZE = 20;

    const EFFECT_SPEED = 200;      
    const TEXT_LOG_SPEED = 400;    
    const FAST_ACTION_SPEED = 100; 

    const slotMapping = {
        "head": "MŨ", "body": "GIÁP", "legs": "QUẦN", 
        "weapon": "VŨ KHÍ", "ring": "NHẪN", "accessory": "TRANG SỨC", "soul": "PHÁP BẢO"
    };

    let collapsedRanks = {}; // { "rank_type": boolean }

    const rarityColors = {
        "none": "#888888",
        "common": "#ffffff", "uncommon": "#4caf50", "rare": "#2196f3", 
        "epic": "#a335ee", "legendary": "#ff9800", "mythic": "#ff0000", "chaos": "#ff00ff",
        "mythic_broken": "#ff0000", "chaos_broken": "#ff00ff"
    };

    /**
     * Định dạng số: 1000 -> 1K, 1,000,000 -> 1M, 1,000,000,000 -> 1B
     */
    const formatNumber = (num) => {
        if (num === null || num === undefined) return "0";
        const n = Number(num);
        if (isNaN(n)) return "0";
        if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return Math.floor(n).toString();
    };

    const skillRankMapping = {
        "Phàm Cấp": "common",
        "Linh Cấp": "uncommon",
        "Địa Cấp": "rare",
        "Thiên Cấp": "epic",
        "Thần Cấp": "legendary",
        "Boss": "mythic"
    };

    const STATUS_STYLE = {
        "Stun": { 
            color: "#ffeb3b", 
            icon: "💫", 
            shadow: "rgba(255, 235, 59, 0.5)", 
            name: "Choáng", 
            desc: "Bị choáng váng, không thể thực hiện bất kỳ hành động nào trong lượt này." 
        },
        "Poison": { 
            color: "#a335ee", 
            icon: "🧪", 
            shadow: "rgba(163, 53, 238, 0.5)", 
            name: "Trúng Độc", 
            desc: "Chất độc ngấm vào máu, giảm khả năng hồi phục và mất Sinh lực theo thời gian." 
        },
        "Freeze": { 
            color: "#00f2ff", 
            icon: "❄️", 
            shadow: "rgba(0, 242, 255, 0.5)", 
            name: "Đóng Băng", 
            desc: "Bị đóng băng hoàn toàn, không thể thực hiện bất kỳ hành động nào trong lượt này." 
        },
        "Burn": { 
            color: "#ff4500", 
            icon: "🔥", 
            shadow: "rgba(255, 69, 0, 0.5)", 
            name: "Thiêu Đốt", 
            desc: "Cơ thể bị lửa bao phủ, mất một lượng Sinh lực cố định mỗi giây." 
        },
        "Silence": { 
            color: "#9e9e9e", 
            icon: "🔇", 
            shadow: "rgba(158, 158, 158, 0.5)", 
            name: "Câm Lặng", 
            desc: "Không thể sử dụng các kỹ năng chủ động." 
        },
        "ArmorBreak": { 
            color: "#ff5722", 
            icon: "💥", 
            shadow: "rgba(255, 87, 34, 0.5)", 
            name: "Phá Giáp", 
            desc: "Phòng ngự bị giảm mạnh, nhận thêm nhiều sát thương từ các đòn đánh." 
        },
        "Weakness": { 
            color: "#795548", 
            icon: "📉", 
            shadow: "rgba(121, 85, 72, 0.5)", 
            name: "Yếu Ớt", 
            desc: "Sức mạnh bị suy giảm, sát thương gây ra bị giảm 30%." 
        },
        "Confuse": { 
            color: "#ffeb3b", 
            icon: "🌀", 
            shadow: "rgba(255, 235, 59, 0.5)", 
            name: "Hỗn Loạn", 
            desc: "Tâm trí bất định, có 50% xác suất tự tấn công bản thân gây sát thương bằng 50% sức mạnh của mình." 
        },
        "Bleed": { 
            color: "#ff1744", 
            icon: "🩸", 
            shadow: "rgba(255, 23, 68, 0.5)", 
            name: "Chảy Máu", 
            desc: "Vết thương hở khiến máu chảy liên tục, mất Sinh lực dựa trên % Sinh lực hiện tại." 
        },
        "Blind": { 
            color: "#607d8b", 
            icon: "🕶️", 
            shadow: "rgba(96, 125, 139, 0.5)", 
            name: "Mù", 
            desc: "Giảm mạnh độ chính xác, khiến đòn đánh dễ bị né tránh." 
        },
        "Invincible": { 
            color: "#ffd700", 
            icon: "✨", 
            shadow: "rgba(255, 215, 0, 0.5)", 
            name: "Vô Địch", 
            desc: "Trạng thái thần thánh, miễn nhiễm với mọi loại sát thương và hiệu ứng xấu." 
        },
        "PetWeakened": {
            color: "#795548",
            icon: "📉",
            shadow: "rgba(121, 85, 72, 0.5)",
            name: "Suy Yếu (Linh Thú)",
            desc: "Linh thú kiệt sức, giảm 50% sức mạnh tấn công."
        },
        "PetCompensatoryBuff": {
            color: "#ffeb3b",
            icon: "⚡",
            shadow: "rgba(255, 235, 59, 0.5)",
            name: "Thân Pháp (Bù đắp)",
            desc: "Linh thú được tăng 10% Thân Pháp do có kỹ năng chưa được khai phá."
        },
        "PowerAura": {
            color: "#00f2ff",
            icon: "✨",
            shadow: "rgba(0, 242, 255, 0.5)",
            name: "Tiên Nhân Hào Quang",
            desc: "Hào quang tiên gia bao phủ, tăng 20% Tấn Công và Phòng Ngự."
        },
        "EvilReflect": {
            color: "#9c27b0",
            icon: "🛡️",
            shadow: "rgba(156, 39, 176, 0.5)",
            name: "Ma Quang Phản Chấn",
            desc: "Lớp ma quang bảo hộ, phản lại một phần sát thương nhận vào."
        },
        "VilePoison": {
            color: "#4caf50",
            icon: "🧪",
            shadow: "rgba(76, 175, 80, 0.5)",
            name: "Vạn Độc Hào Quang",
            desc: "Hào quang kịch độc, khiến kẻ địch tấn công bị trúng độc."
        },
        "LuckBuff": {
            color: "#ffeb3b",
            icon: "🍀",
            shadow: "rgba(255, 235, 59, 0.5)",
            name: "Phúc Tinh",
            desc: "Được vận may mỉm cười, tăng tỉ lệ bạo kích và né tránh."
        },
        "ShieldBuff": {
            color: "#2196f3",
            icon: "🛡️",
            shadow: "rgba(33, 150, 243, 0.5)",
            name: "Linh Lực Hộ Thể",
            desc: "Lớp linh lực bao phủ cơ thể, hấp thụ sát thương nhận vào."
        },
        "CCImmune": { 
            color: "#00f2ff", 
            icon: "✨", 
            shadow: "rgba(0, 242, 255, 0.5)", 
            name: "Kháng Khống", 
            desc: "Miễn nhiễm với các hiệu ứng khống chế (Choáng, Đóng băng...)." 
        },
        "BossOffenseAura": {
            color: "#ff4444",
            icon: "💢",
            shadow: "rgba(255, 68, 68, 0.5)",
            name: "Hào Quang Cuồng Bạo",
            desc: "Boss bộc phát sức mạnh, tăng 20% Tấn Công trong thời gian ngắn."
        },
        "BossDefenseAura": {
            color: "#2196f3",
            icon: "🧱",
            shadow: "rgba(33, 150, 243, 0.5)",
            name: "Hào Quang Kiên Cố",
            desc: "Boss bộc phát phòng ngự, tăng 20% Phòng Ngự trong thời gian ngắn."
        },
        "BossSpeedAura": {
            color: "#ffeb3b",
            icon: "⚡",
            shadow: "rgba(255, 235, 59, 0.5)",
            name: "Hào Quang Tốc Biến",
            desc: "Boss bộc phát tốc độ, tăng 30% Thân Pháp trong thời gian ngắn."
        },
        "BossImmuneAura": {
            color: "#00f2ff",
            icon: "✨",
            shadow: "rgba(0, 242, 255, 0.5)",
            name: "Hào Quang Bất Khuất",
            desc: "Boss bộc phát ý chí, miễn nhiễm hoàn toàn các hiệu ứng khống chế."
        },
        "AtkBuff": { 
            color: "#ff4444", 
            icon: "⚔️", 
            shadow: "rgba(255, 68, 68, 0.5)", 
            name: "Tăng Công", 
            desc: "Tăng chỉ số Tấn Công cơ bản thêm 20%." 
        },
        "DefBuff": { 
            color: "#2196f3", 
            icon: "⬆️", 
            shadow: "rgba(33, 150, 243, 0.5)", 
            name: "Tăng Thủ", 
            desc: "Tăng chỉ số Phòng Ngự cơ bản thêm 20%." 
        },
        "ShieldAura": { 
            color: "#ffd700", 
            icon: "💠", 
            shadow: "rgba(255, 215, 0, 0.5)", 
            name: "Hộ Thể", 
            desc: "Tạo một lớp màng bảo vệ, giảm 50% sát thương nhận vào." 
        },
        "PowerAura": { 
            color: "#00f2ff", 
            icon: "✨", 
            shadow: "rgba(0, 242, 255, 0.5)", 
            name: "Hào Quang", 
            desc: "Hào quang tiên nhân tăng toàn bộ thuộc tính chiến đấu." 
        },
        "EvilReflect": { 
            color: "#9c27b0", 
            icon: "🪞", 
            shadow: "rgba(156, 39, 176, 0.5)", 
            name: "Phản Chấn", 
            desc: "Phản lại 35% sát thương nhận vào cho kẻ tấn công." 
        },
        "ShieldBuff": { 
            color: "#2196f3", 
            icon: "🛡️", 
            shadow: "rgba(33, 150, 243, 0.5)", 
            name: "Linh Lực Hộ Thể", 
            desc: "Lớp linh lực bao phủ cơ thể, hấp thụ sát thương thay cho HP." 
        },
        "LuckBuff": { 
            color: "#ffeb3b", 
            icon: "🍀", 
            shadow: "rgba(255, 235, 59, 0.5)", 
            name: "Phúc Tinh", 
            desc: "Được vận may mỉm cười, tăng tỉ lệ bạo kích và né tránh." 
        },
        "ThanphapBuff": { 
            color: "#ffeb3b", 
            icon: "⚡", 
            shadow: "rgba(255, 235, 59, 0.5)", 
            name: "Tăng Thân Pháp", 
            desc: "Cơ thể nhẹ nhàng như gió, tăng 20% Thân Pháp." 
        },
        "SpdBuff": { 
            color: "#ffeb3b", 
            icon: "⚡", 
            shadow: "rgba(255, 235, 59, 0.5)", 
            name: "Tăng Thân Pháp", 
            desc: "Cơ thể nhẹ nhàng như gió, tăng 20% Thân Pháp." 
        },
        "BossThanphapAura": {
            color: "#ffeb3b",
            icon: "⚡",
            shadow: "rgba(255, 235, 59, 0.5)",
            name: "Hào Quang Thân Pháp",
            desc: "Boss bộc phát tốc độ cực hạn, tăng mạnh Thân Pháp."
        },
        "MinorArmorBreak": { 
            color: "#ffab91", 
            icon: "🛡️", 
            shadow: "rgba(255, 171, 145, 0.5)", 
            name: "Phá Giáp Nhẹ", 
            desc: "Phòng ngự bị giảm một phần, nhận thêm sát thương." 
        },
        "ThanphapDebuff": { 
            color: "#9e9e9e", 
            icon: "🕸️", 
            shadow: "rgba(158, 158, 158, 0.5)", 
            name: "Giảm Thân Pháp", 
            desc: "Bị tơ nhện hoặc bùn lầy quấn chân, giảm 20% Thân Pháp." 
        },
        "SpdDebuff": { 
            color: "#9e9e9e", 
            icon: "🕸️", 
            shadow: "rgba(158, 158, 158, 0.5)", 
            name: "Giảm Thân Pháp", 
            desc: "Bị tơ nhện hoặc bùn lầy quấn chân, giảm 20% Thân Pháp." 
        },
        "PetWeakened": { 
            color: "#795548", 
            icon: "📉", 
            shadow: "rgba(121, 85, 72, 0.5)", 
            name: "Suy Yếu (Linh Thú)", 
            desc: "Linh thú kiệt sức, giảm 50% sức mạnh trong 5 giây." 
        },
        "PetCompensatoryBuff": { 
            color: "#ffeb3b", 
            icon: "⚡", 
            shadow: "rgba(255, 235, 59, 0.5)", 
            name: "Thân Pháp Linh Thú (Bù đắp)", 
            desc: "Linh thú nhận được hiệu ứng tăng 10% Thân Pháp khi có kỹ năng bị khóa." 
        },
        "VilePoison": { 
            color: "#4caf50", 
            icon: "🧪", 
            shadow: "rgba(76, 175, 80, 0.5)", 
            name: "Vạn Độc", 
            desc: "Khiến đòn đánh có xác suất gây độc cực mạnh." 
        }
    };

    return {
        buyFromMysterious: function(itemId, cost, currencyName) {
            const proxy = Game.getProxy();
            const itemData = GameData.items[itemId];
            const msgEl = document.getElementById('mysterious-msg');
            
            const setNPCMsg = (msg, isError = false) => {
                if (!msgEl) return;
                const color = isError ? "#4fc3f7" : "#eee"; // Màu xanh cho lỗi (đỡ đau mắt)
                const shadow = isError ? "0 0 10px rgba(79,195,247,0.3)" : "0 0 5px rgba(255,255,255,0.2)";
                const animation = isError ? "shake-anim 0.5s cubic-bezier(.36,.07,.19,.97) both" : "none";
                
                // Chữ bé lại (0.85rem)
                msgEl.innerHTML = `<div style="margin-bottom: 15px; font-style: italic; color: ${color}; text-shadow: ${shadow}; font-weight: bold; animation: ${animation}; font-size: 0.85rem;">${msg}</div>`;
            };

            // Tương tác ẩn cho Gói 5 Viên Tẩy Tủy Đan
            if (itemId === "item_tay_tuy_dan_pack_5") {
                const hiddenMsg = `"Hừm... Ngươi thực sự muốn lấy thứ này sao? Ngươi có biết cái giá phải trả cho lòng tham là gì không?"`;
                setNPCMsg(hiddenMsg);
                
                // Thay đổi hành động của NPC
                const actionsEl = document.getElementById('mysterious-actions');
                if (actionsEl) {
                    actionsEl.innerHTML = `
                        <button class="mysterious-btn-menu" id="hidden-confirm" style="background: #ff4444; color: #fff;">XÁC NHẬN</button>
                        <button class="mysterious-btn-menu" id="hidden-cancel">TỪ CHỐI</button>
                    `;
                    
                    document.getElementById('hidden-confirm').onclick = () => {
                        // Xóa các nút ngay lập tức để tránh click nhiều lần
                        actionsEl.innerHTML = '';
                        
                        Game.addItem("item_tay_tuy_dan", 5, true, true);
                        const finalMsg = `"Hahaha.... Ta chỉ đùa chút thôi.. Sống không vì mình trời chu đất diệt mà... Hahaha. Hóa ra là mấy thứ này ở đây. Ta có quá nhiều vật phẩm đến mức quên phéng mất việc phải ném mấy viên đan dược rác rưởi này đi... Coi như tiện nghi cho ngươi vậy. Cầm lấy rồi biến cho khuất mắt ta."`;
                        setNPCMsg(finalMsg);
                        this.showNotification("Bạn đã nhận được 5 viên Tẩy Tủy Đan!");
                        this.addLog("Người Thần Bí: 'Hahaha.... Ta chỉ đùa chút thôi.. Sống không vì mình trời chu đất diệt mà... Hahaha. Hóa ra là mấy thứ này ở đây. Ta có quá nhiều vật phẩm đến mức quên phéng mất việc phải ném mấy viên đan dược rác rưởi này đi... Coi như tiện nghi cho ngươi vậy.'");
                        
                        // Thêm nút thoát quay lại menu chính
                        actionsEl.innerHTML = `
                            <button class="mysterious-btn-menu" id="back-to-mysterious-menu" style="grid-column: span 2;">QUAY LẠI</button>
                        `;
                        
                        document.getElementById('back-to-mysterious-menu').onclick = () => {
                            const container = document.querySelector('.mysterious-person-container');
                            if (container) container.remove();
                            this.showMysteriousPerson(null, false, 'trade');
                        };
                        
                        // Vẫn giữ tự động đóng sau 10 giây nếu người chơi không làm gì (tăng thời gian lên)
                        setTimeout(() => {
                            const modal = document.getElementById('mysterious-person-modal');
                            if (modal && actionsEl.contains(document.getElementById('back-to-mysterious-menu'))) {
                                this.closeModal();
                            }
                        }, 10000);
                    };
                    
                    document.getElementById('hidden-cancel').onclick = () => {
                        // Xóa các nút ngay lập tức
                        actionsEl.innerHTML = '';
                        
                        const cancelMsg = `"Khôn ngoan đấy. Kẻ biết dừng lại đúng lúc mới là kẻ sống lâu nhất."`;
                        setNPCMsg(cancelMsg);
                        
                        // Thêm nút thoát quay lại menu chính
                        actionsEl.innerHTML = `
                            <button class="mysterious-btn-menu" id="back-to-mysterious-menu-cancel" style="grid-column: span 2;">QUAY LẠI</button>
                        `;
                        
                        document.getElementById('back-to-mysterious-menu-cancel').onclick = () => {
                            const container = document.querySelector('.mysterious-person-container');
                            if (container) container.remove();
                            this.showMysteriousPerson(null, false, 'trade');
                        };
                        
                        // Tự động quay lại sau 5 giây nếu không nhấn gì
                        setTimeout(() => {
                            const modal = document.getElementById('mysterious-person-modal');
                            if (modal && actionsEl.contains(document.getElementById('back-to-mysterious-menu-cancel'))) {
                                const container = document.querySelector('.mysterious-person-container');
                                if (container) container.remove();
                                this.showMysteriousPerson(null, false, 'trade');
                            }
                        }, 5000);
                    };
                }
                return true; // Trả về true để UI.closeModal() được gọi trong showMysteriousDetail nếu cần, 
                             // nhưng ở đây ta xử lý riêng trong modal
            }

            const tauntsLT = [
                `"Haha! Ngươi nghĩ thứ này rẻ mạt đến mức hạng phàm phu như ngươi có thể chạm vào sao? Đủ Linh Thạch rồi hãy quay lại!"`,
                `"Ngươi định dùng mấy viên đá vụn này để đổi lấy bảo vật của ta sao? Nực cười!"`,
                `"Tu vi thì thấp, túi tiền thì rỗng... Ngươi lấy gì để nghịch thiên cải mệnh đây?"`,
                `"Nhìn cái vẻ mặt ngơ ngác của ngươi kìa. Đi kiếm thêm Linh Thạch đi, đồ phàm nhân!"`,
                `"Bảo vật này không dành cho kẻ nghèo hèn. Cút đi và đừng làm phiền ta!"`,
                `"Ngươi nghĩ ta là kẻ làm từ thiện sao? Haha! Có tiền thì nói chuyện, không tiền thì biến!"`,
                `"Đến cả một viên Linh Thạch cũng không đủ mà đòi chạm vào tiên cơ? Mơ mộng hão huyền!"`,
                `"Ta đã thấy nhiều kẻ ngông cuồng, nhưng kẻ vừa ngông vừa nghèo như ngươi thì hiếm thấy đấy."`,
                `"Đừng dùng đôi bàn tay trắng trẻo đó chạm vào hàng của ta. Bẩn hết bảo vật rồi!"`
            ];

            const tauntsCPLT = [
                `"Haha! Cực Phẩm Linh Thạch? Ngươi còn chẳng biết nó trông thế nào mà dám hỏi mua sao? Nực cười! Haha!"`,
                `"Thứ này quý giá hơn cả mạng sống của ngươi đấy. Đủ bản lĩnh thì hãy quay lại!"`,
                `"Ngươi nghĩ Cực Phẩm Linh Thạch dễ kiếm như cỏ rác ven đường sao? Ngu ngốc!"`,
                `"Tỉnh lại đi! Kẻ như ngươi mà cũng đòi sở hữu vật phẩm cấp Thần sao?"`,
                `"Cực Phẩm Linh Thạch không phải thứ mà hạng tép riu như ngươi có thể có được đâu!"`
            ];

            if (currencyName === "Linh Thạch") {
                if (proxy.spiritStone >= cost) {
                    proxy.spiritStone -= cost;
                    Game.addItem(itemId, 1, true, true);
                    const successMsg = `"Đã giao dịch thành công <b>${itemData.name}</b>. Đừng làm ta thất vọng."`;
                    setNPCMsg(successMsg);
                    this.showNotification(`Mua thành công: ${itemData.name}`);
                    this.addLog(`Người Thần Bí: 'Đã giao dịch thành công <b>${itemData.name}</b>. Đừng làm ta thất vọng.'`);
                    return true;
                } else {
                    const randomTaunt = tauntsLT[Math.floor(Math.random() * tauntsLT.length)];
                    setNPCMsg(randomTaunt, true);
                    return false;
                }
            } else if (currencyName === "Cực Phẩm Linh Thạch") {
                const supremeStoneCount = typeof BagSystem !== 'undefined' ? BagSystem.getItemCount("item_supreme_spirit_stone") : 0;
                
                if (supremeStoneCount >= cost) {
                    if (typeof BagSystem !== 'undefined') {
                        BagSystem.removeItemsById("item_supreme_spirit_stone", cost);
                    }
                    Game.addItem(itemId, 1, true, true);
                    const successMsg = `"Ngươi... làm sao ngươi có được thứ này? Thôi được, <b>${itemData.name}</b> thuộc về ngươi."`;
                    setNPCMsg(successMsg);
                    this.showNotification(`Mua thành công: ${itemData.name}`);
                    this.addLog(`Người Thần Bí: 'Ngươi... làm sao ngươi có được thứ này? Thôi được, <b>${itemData.name}</b> thuộc về ngươi.'`);
                    return true;
                } else {
                    const randomTaunt = tauntsCPLT[Math.floor(Math.random() * tauntsCPLT.length)];
                    setNPCMsg(randomTaunt, true);
                    return false;
                }
            }
            return false;
        },
        isTribulation: false,
        // --- QUẢN LÝ MÀN HÌNH KHỞI ĐẦU ---
        renderStartScreen: function(state) {
            const startUI = document.getElementById('start-ui');
            const mainUI = document.getElementById('ui-exp');
            const remainingEl = document.getElementById('gift-remaining');

            if (!startUI || !mainUI) return;

            if (state.giftChoicesLeft <= 0) {
                startUI.style.display = 'none';
                mainUI.style.display = 'block';
                
                // Trigger Mysterious Person for testing
                if (!state.mysteriousPersonMet) {
                    setTimeout(() => {
                        this.showMysteriousPerson(() => {
                            state.mysteriousPersonMet = true;
                        }, true); // Truyền true cho isFirstMeeting
                    }, 500);
                }
                return;
            }

            startUI.style.display = 'flex';
            mainUI.style.display = 'none';
            
            if (remainingEl) remainingEl.innerText = state.giftChoicesLeft;
            
            const giftMapping = {
                'gift-pills': 'gift_pills',
                'gift-equips': 'gift_equips',
                'gift-skills': 'gift_skills',
                'gift-pets': 'gift_pets'
            };

            for (let htmlId in giftMapping) {
                const el = document.getElementById(htmlId);
                if (el) {
                    if (state.pickedGifts.includes(giftMapping[htmlId])) {
                        el.classList.add('disabled');
                        el.style.opacity = "0.5";
                        el.style.pointerEvents = "none";
                        el.style.borderColor = "#333";
                    } else {
                        el.classList.remove('disabled');
                        el.style.opacity = "1";
                        el.style.pointerEvents = "auto";
                    }
                }
            }
        },

        /**
         * Hiển thị thông báo yêu cầu bật kỹ năng trước khi chiến đấu
         */
        promptEnableSkills: function(onContinue) {
            const proxy = Game.getProxy();
            const activeSkills = proxy.skills.filter(sid => {
                const s = GameData.skills[sid];
                return s && s.type === 'active';
            });

            if (activeSkills.length === 0) {
                onContinue();
                return;
            }

            const content = `
                <div style="text-align: center; padding: 10px;">
                    <p style="color: #ffeb3b; font-size: 0.9rem; margin-bottom: 15px;">
                        ⚠️ Đạo hữu chưa bật tự động sử dụng bất kỳ <b>Thần Thông</b> nào. Việc này sẽ khiến trận chiến trở nên khó khăn hơn!
                    </p>
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid #444; margin-bottom: 15px; text-align: left;">
                        <div style="color: #888; font-size: 0.7rem; margin-bottom: 5px;">Gợi ý kỹ năng có thể bật:</div>
                        ${activeSkills.slice(0, 3).map(sid => {
                            const s = GameData.skills[sid];
                            return `<div style="color: #00f2ff; font-size: 0.8rem; margin-bottom: 2px;">📜 ${s.name}</div>`;
                        }).join('')}
                        ${activeSkills.length > 3 ? `<div style="color: #666; font-size: 0.7rem;">... và ${activeSkills.length - 3} kỹ năng khác</div>` : ''}
                    </div>
                </div>
            `;

            this.openModal("CHUẨN BỊ CHIẾN ĐẤU", content);
            const ctrl = document.getElementById('modal-controls');
            if (ctrl) {
                // Nút Tự động chọn
                const autoBtn = document.createElement('button');
                autoBtn.className = "btn-main btn-purple";
                autoBtn.innerText = "TỰ ĐỘNG CHỌN";
                autoBtn.onclick = () => {
                    // Tự động bật tối đa 6 kỹ năng mạnh nhất (theo rank)
                    const rankOrder = ["Thần Cấp", "Thiên Cấp", "Địa Cấp", "Linh Cấp", "Phàm Cấp"];
                    const sortedSkills = [...activeSkills].sort((a, b) => {
                        const sA = GameData.skills[a];
                        const sB = GameData.skills[b];
                        return rankOrder.indexOf(sA.rank || "Phàm Cấp") - rankOrder.indexOf(sB.rank || "Phàm Cấp");
                    });

                    const toToggle = sortedSkills.slice(0, 6);
                    proxy.toggledSkills = toToggle;
                    if (!Game.isAutoSkillEnabled()) Game.toggleAutoSkill();
                    Game.saveGame();
                    this.renderPlayerSkills(proxy.skills);
                    this.addLog(`✅ Đã tự động bật <b>${toToggle.length}</b> thần thông mạnh nhất.`);
                    this.closeModal();
                    onContinue();
                };
                ctrl.prepend(autoBtn);

                // Nút Tiếp tục
                const continueBtn = document.createElement('button');
                continueBtn.className = "btn-main";
                continueBtn.style.marginTop = "6px";
                continueBtn.innerText = "VẪN TIẾP TỤC";
                continueBtn.onclick = () => {
                    this.closeModal();
                    onContinue();
                };
                ctrl.prepend(continueBtn);
            }
        },

        promptHighDifficulty: function(loc, onContinue) {
            const title = `<span style='color: #ff9800;'>CẢNH BÁO NGUY HIỂM</span>`;
            const difficultyText = {
                "Khó": "KHÓ",
                "Cực Khó": "CỰC KHÓ",
                "Tử Địa": "TỬ ĐỊA"
            }[loc.difficulty] || "NGUY HIỂM";
            
            const desc = `
                <div style="text-align: center; padding: 10px;">
                    <p style="color: #ff4444; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">
                        ⚠️ CẢNH BÁO: KHU VỰC ${difficultyText} ⚠️
                    </p>
                    <p style="color: #e0e0e0; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
                        Bản đồ <b>${loc.name}</b> có độ khó rất cao. Nếu đạo hữu <b>thất bại (chết)</b> trong quá trình thám hiểm, 
                        <b style="color: #ff9800;">toàn bộ vật phẩm và Linh Thạch</b> thu thập được trong lần thám hiểm này sẽ <b style="color: #ff4444;">BỊ MẤT TRẮNG</b>!
                    </p>
                    <p style="color: #888; font-size: 0.8rem; font-style: italic;">
                        Đạo hữu có chắc chắn muốn dấn thân vào nơi nguy hiểm này không?
                    </p>
                </div>
            `;
            
            this.openModal(title, desc);
            const ctrl = document.getElementById('modal-controls');
            
            if(ctrl) {
                const continueBtn = document.createElement('button'); 
                continueBtn.className = "btn-main";
                continueBtn.innerText = "DẤN THÂN";
                continueBtn.style.background = "#ff9800";
                continueBtn.style.color = "#000";
                continueBtn.style.padding = "12px";
                continueBtn.style.border = "none";
                continueBtn.style.borderRadius = "4px";
                continueBtn.style.fontWeight = "bold";
                continueBtn.style.cursor = "pointer";
                continueBtn.style.flex = "1";
                continueBtn.onclick = () => { 
                    this.closeModal();
                    onContinue();
                };
                ctrl.prepend(continueBtn);
                
                ctrl.style.display = "flex";
                ctrl.style.gap = "10px";
            }
        },

        renderPlayerSkills: function(skillIds, skillCDs = {}) {
            const activeContainer = document.getElementById('active-skills-list');
            const passiveContainer = document.getElementById('passive-skills-list');
            
            if (!activeContainer || !passiveContainer) return;
            
            const isUpdateOnly = Object.keys(skillCDs).length > 0;

            if (!skillIds || skillIds.length === 0) {
                activeContainer.innerHTML = '<i style="color: #444; font-size: 0.6rem; text-align: center; width: 100%;">Trống...</i>';
                passiveContainer.innerHTML = '<i style="color: #444; font-size: 0.6rem; text-align: center; width: 100%;">Trống...</i>';
                return;
            }

            if (isUpdateOnly) {
                skillIds.forEach(id => {
                    const skill = GameData.skills[id];
                    if (!skill || skill.type === 'passive') return;
                    const cdMs = skillCDs[id] || 0;
                    const cdSec = Math.ceil(cdMs / 1000);
                    const maxCd = (skill.cooldown || 1) * 1000;
                    const cdPercent = Math.max(0, Math.min(100, (cdMs / maxCd) * 100));
                    
                    const cdOverlay = document.getElementById(`skill-cd-overlay-${id}`);
                    const cdText = document.getElementById(`skill-cd-text-${id}`);
                    if (cdOverlay) {
                        cdOverlay.style.height = `${cdPercent}%`;
                        cdOverlay.style.display = cdMs > 0 ? 'block' : 'none';
                    }
                    if (cdText) {
                        cdText.innerText = cdMs > 0 ? `${cdSec}s` : '';
                        cdText.style.display = cdMs > 0 ? 'flex' : 'none';
                    }
                });
                return;
            }

            activeContainer.innerHTML = '';
            passiveContainer.innerHTML = '';

            const rankOrder = ["Phàm Cấp", "Linh Cấp", "Địa Cấp", "Thiên Cấp", "Thần Cấp"];
            const groupedActive = {};
            const groupedPassive = {};
            
            rankOrder.forEach(r => {
                groupedActive[r] = [];
                groupedPassive[r] = [];
            });

            skillIds.forEach(id => {
                const skill = GameData.skills[id];
                if (!skill) return;
                const rank = skill.rank || "Phàm Cấp";
                if (skill.type === 'passive') {
                    if (groupedPassive[rank]) groupedPassive[rank].push(id);
                    else groupedPassive["Phàm Cấp"].push(id);
                } else {
                    if (groupedActive[rank]) groupedActive[rank].push(id);
                    else groupedActive["Phàm Cấp"].push(id);
                }
            });

            const renderGroup = (container, groups, typeLabel) => {
                let hasAny = false;
                rankOrder.forEach(rank => {
                    const ids = groups[rank];
                    if (ids.length === 0) return;
                    hasAny = true;
                    
                    const groupKey = `${rank}_${typeLabel}`;
                    const isCollapsed = collapsedRanks[groupKey];
                    
                    const groupHeader = document.createElement('div');
                    groupHeader.style.cssText = `
                        width: 100%; padding: 4px 6px; background: rgba(255,255,255,0.05); 
                        border-bottom: 1px solid rgba(255,255,255,0.1); margin-top: 8px; margin-bottom: 4px;
                        font-size: 0.55rem; color: #aaa; font-weight: bold; display: flex; align-items: center; justify-content: space-between;
                        cursor: pointer; transition: background 0.2s;
                    `;
                    groupHeader.onmouseover = () => groupHeader.style.background = 'rgba(255,255,255,0.1)';
                    groupHeader.onmouseout = () => groupHeader.style.background = 'rgba(255,255,255,0.05)';
                    groupHeader.onclick = () => {
                        collapsedRanks[groupKey] = !collapsedRanks[groupKey];
                        UI.renderPlayerSkills(skillIds);
                    };

                    const rankColors = {
                        "Phàm Cấp": "#888",
                        "Linh Cấp": "#4caf50",
                        "Địa Cấp": "#2196f3",
                        "Thiên Cấp": "#9c27b0",
                        "Thần Cấp": "#ff4444"
                    };
                    
                    groupHeader.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <span style="width: 4px; height: 4px; border-radius: 50%; background: ${rankColors[rank] || '#fff'}"></span> 
                            ${rank.toUpperCase()}
                        </div>
                        <div style="font-size: 0.45rem; opacity: 0.6; font-weight: normal;">
                            ${isCollapsed ? 'Nhấn để xem kỹ năng ▾' : 'Nhấn để thu gọn ▴'}
                        </div>
                    `;
                    container.appendChild(groupHeader);

                    if (!isCollapsed) {
                        ids.forEach(id => {
                            const skill = GameData.skills[id];
                            const isPassive = skill.type === 'passive';
                            const color = isPassive ? '#ffeb3b' : '#00f2ff';
                            const borderStyle = isPassive ? 'dashed' : 'solid';
                            const proxy = Game.getProxy();
                            const isToggled = proxy.toggledSkills && proxy.toggledSkills.includes(id);
                            const priority = (proxy.skillPriorities && proxy.skillPriorities[id]) || 'medium';
                            const priorityLabels = { 'high': 'CAO', 'medium': 'VỪA', 'low': 'THẤP', 'off': 'TẮT' };
                            const priorityColors = { 'high': '#ff4444', 'medium': '#ffeb3b', 'low': '#4caf50', 'off': '#9e9e9e' };

                            const skillDiv = document.createElement('div');
                            skillDiv.className = "skill-item-card";
                            skillDiv.id = `skill-card-${id}`;
                            skillDiv.onclick = () => UI.showSkillDetail(id);
                            
                            // Tăng kích thước cho kỹ năng chủ động (đã điều chỉnh giảm nhẹ)
                            const cardPadding = isPassive ? '4px' : '5px 4px';
                            const cardGap = isPassive ? '4px' : '6px';
                            const cardBorderWidth = isPassive ? '2px' : '2.5px';
                            const cardBg = isPassive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.07)';
                            
                            skillDiv.style.cssText = `position: relative; border-left: ${cardBorderWidth} ${borderStyle} ${color}; background: ${cardBg}; padding: ${cardPadding}; margin: 0; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: ${cardGap}; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; margin-bottom: 3px;`;
                            
                            const iconSize = isPassive ? '0.9rem' : '1.05rem';
                            const iconMinWidth = isPassive ? '22px' : '26px';
                            const iconPadding = isPassive ? '2px' : '3px';
                            const iconBg = isPassive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)';

                            skillDiv.innerHTML = `
                                ${!isPassive ? `
                                <div id="skill-cd-overlay-${id}" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; background: rgba(0,0,0,0.6); pointer-events: none; transition: height 0.1s linear; z-index: 1;"></div>
                                <div id="skill-cd-text-${id}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 0.8rem; text-shadow: 0 0 3px #000; z-index: 2; pointer-events: none;"></div>
                                ` : ''}
                                <div style="color: ${color}; font-size: ${iconSize}; font-weight: bold; min-width: ${iconMinWidth}; text-align: center; background: ${iconBg}; padding: ${iconPadding}; border-radius: 4px; position: relative; z-index: 3; ${!isPassive ? `border: 1px solid ${color}22;` : ''}">
                                    ${skill.icon || '📜'}
                                </div>
                                <div style="flex: 1; min-width: 0; position: relative; z-index: 3;">
                                    <div style="color: #eee; font-size: 0.65rem; font-weight: bold; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${skill.name}
                                    </div>
                                    <div style="color: #888; font-size: 0.5rem; margin-top: 1px; display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden;">
                                        ${skill.sectId ? `<span style="color: #ff9800; font-size: 0.45rem; background: rgba(255,152,0,0.1); padding: 0 2px; border-radius: 2px;">${GameData.sects[skill.sectId]?.name || ''}</span>` : ''}
                                        ${!isPassive ? `<span style="color: #f44336; font-size: 0.45rem;">⏳ ${skill.cooldown || 0}s</span>` : ''}
                                        ${!isPassive ? `<span onclick="event.stopPropagation(); Game.cycleSkillPriority('${id}'); UI.renderPlayerSkills(Game.getProxy().skills);" style="color: ${priorityColors[priority]}; font-size: 0.45rem; border: 1px solid ${priorityColors[priority]}44; padding: 0 2px; border-radius: 2px; cursor: pointer; background: ${priorityColors[priority]}11;">${priorityLabels[priority]}</span>` : ''}
                                    </div>
                                </div>
                                ${!isPassive ? `
                                <div onclick="event.stopPropagation(); Game.toggleSkill('${id}')" 
                                     style="position: relative; z-index: 3; padding: 2px 4px; background: ${isToggled ? '#4caf50' : '#444'}; color: #fff; border-radius: 3px; font-size: 0.5rem; font-weight: bold; cursor: pointer; min-width: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                                    ${isToggled ? 'BẬT' : 'TẮT'}
                                </div>` : ''}
                            `;
                            container.appendChild(skillDiv);
                        });
                    }
                });
                
                if (!hasAny) {
                    container.innerHTML = `<i style="color: #444; font-size: 0.6rem; text-align: center; width: 100%;">Trống...</i>`;
                }
            };

            renderGroup(activeContainer, groupedActive, "CHỦ ĐỘNG");
            renderGroup(passiveContainer, groupedPassive, "BỊ ĐỘNG");
        },

        showSkillDetail: function(skillId, isEnemy = false, petLevel = null, petUid = null) {
            let skill = GameData.skills[skillId];
            if (!skill && GameData.petSkills) {
                skill = GameData.petSkills[skillId];
            }
            
            const proxy = (typeof Game !== 'undefined') ? Game.getProxy() : null;
            if (!skill || !proxy) return;

            let detailHtml = `<div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; border: 1px solid #444; text-align: left;">`;
            
            const rankKey = skillRankMapping[skill.rank] || "common";
            const rankColor = rarityColors[rankKey] || "#ffeb3b";

            if (skill.sectId) {
                const sect = GameData.sects[skill.sectId];
                detailHtml += `<div style="text-align: center; margin-bottom: 8px;">
                                <span style="background: rgba(255,152,0,0.2); color: #ff9800; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; border: 1px solid rgba(255,152,0,0.3);">
                                    ${sect?.name || 'Môn phái'}
                                </span>
                               </div>`;
            }
            
            detailHtml += `<div style="text-align: center; margin-bottom: 5px;">
                            <span style="color: ${rankColor}; font-weight: bold; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">
                                [${skill.rank || 'Vô Cấp'}]
                            </span>
                           </div>`;

            detailHtml += `<p style="color: #aaa; font-style: italic; margin-bottom: 10px; font-size: 0.75rem; line-height: 1.3; text-align: center;">"${skill.desc}"</p>`;
            
            // Hiển thị thông tin khóa nếu có
            const isPetSkill = GameData.petSkills && GameData.petSkills[skillId];
            if (isPetSkill && typeof PetSystem !== 'undefined') {
                const petData = petUid ? PetSystem.getPetData(petUid, proxy.pets) : null;
                const petInstance = petUid ? proxy.pets.find(p => p.uid === petUid) : null;
                const petSkills = petInstance ? (petInstance.skills || []) : (petData ? (petData.skills || []) : []);
                const petName = petUid ? PetSystem.getPetDisplayName(petUid, proxy.pets) : "Linh thú";
                
                if (PetSystem.isSkillLocked(skillId, petLevel || proxy.rankId, petSkills)) {
                    const lockDesc = PetSystem.getSkillLockDesc(skillId, petName);
                    detailHtml += `<div style="background: rgba(244,67,54,0.1); border: 1px solid #f44336; padding: 8px; border-radius: 4px; margin-bottom: 10px; text-align: center;">
                                    <span style="color: #f44336; font-weight: bold; font-size: 0.75rem;">🔒 ${lockDesc}</span>
                                   </div>`;
                }
            }

            detailHtml += `<hr style="border: 0.5px solid #333; margin: 8px 0;">`;

            if (skill.type === 'passive') {
                detailHtml += `<p style="color: #ffeb3b; font-weight: bold; margin-bottom: 6px; font-size: 0.8rem;">✨ HIỆU QUẢ NỘI TẠI:</p>`;
                detailHtml += `<div style="background: rgba(255, 255, 255, 0.03); padding: 8px; border-radius: 4px; border-left: 3px solid #ffeb3b;">`;
                
                const buffs = skill.buff || skill.stats || {};
                const statMap = { 
                    atk: "Tấn Công", 
                    def: "Phòng Ngự", 
                    thanphap: "Thân Pháp", 
                    luk: "May Mắn", 
                    hp: "Sinh Mệnh", 
                    mana: "Linh Lực", 
                    mp: "Linh Lực",
                    hpMult: "Bội Số Sinh lực",
                    mpMult: "Bội Số Linh lực",
                    staMult: "Bội Số Thể lực"
                };
                
                let hasBuff = false;
                for (let stat in buffs) {
                    const val = buffs[stat];
                    const statName = statMap[stat] || stat.toUpperCase();
                    const isPositive = val >= 0;
                    const color = isPositive ? "#4caf50" : "#ff4444";
                    const label = isPositive ? "Tăng" : "Giảm";
                    const sign = isPositive ? "+" : "-";
                    const absVal = Math.abs(val);
                    
                    detailHtml += `<div style="color: ${color}; display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 0.75rem;">`;
                    detailHtml += `<span>● ${label}:</span> <b>${sign}${absVal} ${statName}</b>`;
                    detailHtml += `</div>`;
                    hasBuff = true;
                }

                if (skill.reflect) {
                    detailHtml += `<div style="color: #ff9800; display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 0.75rem;">`;
                    detailHtml += `<span>● Phản đòn:</span> <b>+${Math.floor(skill.reflect * 100)}%</b>`;
                    detailHtml += `</div>`;
                    hasBuff = true;
                }

                if (skill.dodge) {
                    detailHtml += `<div style="color: #00f2ff; display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 0.75rem;">`;
                    detailHtml += `<span>● Né tránh:</span> <b>+${Math.floor(skill.dodge * 100)}%</b>`;
                    detailHtml += `</div>`;
                    hasBuff = true;
                }

                if (!hasBuff) detailHtml += `<div style="color: #888; text-align: center; font-size: 0.7rem;">Nội tại ẩn chưa khai mở...</div>`;
                detailHtml += `</div>`;
            } else {
                const currentAtk = (proxy.atk || 0) + (proxy.bonusAtk || 0);
                const estimatedDmg = Math.floor(currentAtk * (skill.damageMult || skill.power || 0));

                detailHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
                detailHtml += `<div style="background: #222; padding: 6px; border-radius: 4px; text-align: center;">
                                    <small style="color: #00f2ff; display: block; font-size: 0.6rem;">LINH LỰC</small>
                                    <b style="color: #fff; font-size: 0.75rem;">${skill.manaCost || 0} Linh lực</b>
                                </div>`;
                detailHtml += `<div style="background: #222; padding: 6px; border-radius: 4px; text-align: center;">
                                    <small style="color: #f44336; display: block; font-size: 0.6rem;">HỒI CHIÊU</small>
                                    <b style="color: #fff; font-size: 0.75rem;">${skill.cooldown || 0}s</b>
                                </div>`;
                if (skill.chargeTime) {
                    detailHtml += `<div style="background: #222; padding: 6px; border-radius: 4px; text-align: center; grid-column: span 2;">
                                        <small style="color: #ffeb3b; display: block; font-size: 0.6rem;">TỤ LỰC</small>
                                        <b style="color: #fff; font-size: 0.75rem;">${(skill.chargeTime / 1000).toFixed(1)}s</b>
                                    </div>`;
                }
                detailHtml += `</div>`;

                detailHtml += `<div style="margin-top: 8px; padding: 8px; background: rgba(255,152,0,0.05); border: 1px solid #ff980033; border-radius: 4px;">`;
                detailHtml += `<div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                                    <span style="color: #aaa;">⚔️ Hệ số ST:</span>
                                    <b style="color: #ff9800;">x${skill.damageMult || skill.power || 1}</b>
                                </div>`;
                if (skill.debuff || (skill.effect && skill.effect.debuff)) {
                    const debuffType = skill.debuff || skill.effect.debuff;
                    const dConf = STATUS_STYLE[debuffType] || { color: "#fff", icon: "✨", name: debuffType };
                    detailHtml += `<div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.75rem;">
                                        <span style="color: #aaa;">✨ Hiệu ứng:</span>
                                        <b style="color: ${dConf.color};">${dConf.icon} ${dConf.name}</b>
                                    </div>`;
                }
                if (skill.effect && skill.effect.buff) {
                    const buffType = skill.effect.buff;
                    const bConf = STATUS_STYLE[buffType] || { color: "#00f2ff", icon: "🛡️", name: buffType };
                    detailHtml += `<div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.75rem;">
                                        <span style="color: #aaa;">🛡️ Hỗ trợ:</span>
                                        <b style="color: ${bConf.color};">${bConf.icon} ${bConf.name}</b>
                                    </div>`;
                }
                detailHtml += `<div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.75rem;">
                                    <span style="color: #aaa;">💥 Ước tính:</span>
                                    <b style="color: #ff4444;">${(estimatedDmg || 0).toLocaleString()} ST</b>
                                </div>`;
                detailHtml += `</div>`;

                // Thêm phần chọn mức ưu tiên - Hiện cho người chơi nếu họ sở hữu kỹ năng này hoặc linh thú sở hữu
                const isPlayerSkill = proxy.skills && proxy.skills.includes(skillId);
                
                // Tìm xem linh thú đang xuất chiến có kỹ năng này không
                let isPetSkill = false;
                if (proxy.activePetId) {
                    const activePet = proxy.pets.find(p => p.uid === proxy.activePetId);
                    if (activePet && activePet.skills && activePet.skills.includes(skillId)) {
                        isPetSkill = true;
                    }
                }
                
                if (!isEnemy && (isPlayerSkill || isPetSkill)) {
                    const currentPriority = (proxy.skillPriorities && proxy.skillPriorities[skillId]) || 'medium';
                    detailHtml += `<div style="margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; border: 1px solid #444;">
                                        <p style="color: #eee; font-size: 0.7rem; margin-bottom: 6px; font-weight: bold;">🎯 MỨC ƯU TIÊN SỬ DỤNG:</p>
                                        <div style="display: flex; gap: 4px;">
                                            ${['high', 'medium', 'low', 'off'].map(p => {
                                                const labels = { 'high': 'CAO', 'medium': 'VỪA', 'low': 'THẤP', 'off': 'TẮT' };
                                                const colors = { 'high': '#ff4444', 'medium': '#ffeb3b', 'low': '#4caf50', 'off': '#9e9e9e' };
                                                const isActive = currentPriority === p;
                                                return `<button onclick="Game.setSkillPriority('${skillId}', '${p}'); UI.showSkillDetail('${skillId}')" 
                                                                style="flex: 1; padding: 4px; font-size: 0.6rem; border-radius: 3px; cursor: pointer; border: 1px solid ${isActive ? colors[p] : '#444'}; background: ${isActive ? colors[p] + '33' : '#222'}; color: ${isActive ? colors[p] : '#888'}; font-weight: bold;">
                                                            ${labels[p]}
                                                        </button>`;
                                            }).join('')}
                                        </div>
                                        <p style="color: #888; font-size: 0.55rem; margin-top: 4px; font-style: italic;">* Kỹ năng có mức ưu tiên cao hơn sẽ được sử dụng trước. Chọn TẮT để không dùng trong chiến đấu.</p>
                                    </div>`;
                }
            }

            detailHtml += `</div>`;
            this.openModal(`<span style="color: ${rankColor}">${skill.icon || ''} ${skill.name}</span>`, detailHtml, false);
        },

        showStatusDetail: function(statusType, timeLeft, casterName = "", sourceName = "") {
            const style = STATUS_STYLE[statusType];
            if (!style) return;

            const color = style.color || "#ffeb3b";
            
            let sourceHtml = "";
            if (casterName || sourceName) {
                sourceHtml = `
                    <div style="margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; border: 1px solid ${color}22;">
                        <div style="font-size: 0.7rem; color: #888; margin-bottom: 4px;">Nguồn gốc:</div>
                        <div style="font-size: 0.8rem; color: #eee;">
                            ${casterName ? `Bởi: <b style="color: ${color}">${casterName}</b>` : ""}
                            ${sourceName ? `${casterName ? " | " : ""}Từ: <b style="color: #ffeb3b">${sourceName}</b>` : ""}
                        </div>
                    </div>
                `;
            }

            let detailHtml = `
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid ${color}44; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <div style="width: 40px; height: 40px; background: rgba(0,0,0,0.5); border: 2px solid ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 0 10px ${color}44;">
                            ${style.icon}
                        </div>
                        <div>
                            <h4 style="margin: 0; color: ${color}; font-size: 1.1rem; text-shadow: 0 0 5px ${color}88;">${style.name}</h4>
                            <span style="color: #ffeb3b; font-size: 0.75rem; font-weight: bold;">⏳ Còn lại: ${timeLeft}s</span>
                        </div>
                    </div>
                    
                    <p style="color: #eee; font-size: 0.85rem; line-height: 1.5; margin: 0; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; border-left: 3px solid ${color};">
                        ${style.desc || "Không có mô tả chi tiết."}
                    </p>

                    ${sourceHtml}
                    
                    <div style="margin-top: 12px; font-size: 0.7rem; color: #888; text-align: center; font-style: italic;">
                        * Hiệu ứng sẽ tự động biến mất khi hết thời gian.
                    </div>
                </div>
            `;

            this.openModal(`<span style="color: ${color}">${style.icon} THÔNG TIN HIỆU ỨNG</span>`, detailHtml, false);
        },

        updateBar: function(id, current, max) {
            let barIds = [];
            let textIds = [];
            
            if (id === 'bone') {
                const boneEl = document.getElementById('main-player-bone');
                if (boneEl && typeof GameData !== 'undefined') {
                    const boneData = GameData.boneQualities[current] || GameData.boneQualities["pham"];
                    boneEl.innerText = boneData.name;
                    boneEl.style.color = boneData.color;
                    
                    // Aura effect for Chí Tôn Cốt
                    const avatar = document.getElementById('main-player-avatar');
                    if (avatar) {
                        if (current === 'chiton') {
                            avatar.style.boxShadow = `0 0 20px ${boneData.color}, inset 0 0 10px ${boneData.color}`;
                            avatar.style.borderColor = boneData.color;
                        } else {
                            avatar.style.boxShadow = '0 0 8px rgba(212, 175, 55, 0.2)';
                            avatar.style.borderColor = '#d4af37';
                        }
                    }

                    // Cập nhật UI trong tab Tu Luyện
                    this.updateBoneUI(current);
                }
                return;
            }

            if (id === 'hp') { 
                barIds = ['hp-progress', 'hp-progress-battle', 'battle-player-hp-bar']; 
                textIds = ['stat-hp', 'stat-hp-battle', 'battle-player-hp-text']; 
            }
            else if (id === 'pet-hp') {
                barIds = ['pet-hp-progress', 'pet-hp-progress-battle'];
                textIds = ['stat-pet-hp', 'stat-pet-hp-battle'];
            }
            else if (id === 'stamina-battle') {
                barIds = ['stamina-progress-battle'];
                textIds = ['stat-stamina-battle-text'];
            }
            else if (id === 'mp') { 
                barIds = ['mp-progress', 'battle-player-mp-bar']; 
                textIds = ['stat-mp', 'battle-player-mp-text']; 
            }
            else if (id === 'pet-mp') {
                barIds = ['pet-mp-progress', 'battle-pet-mp-bar'];
                textIds = ['stat-pet-mp', 'battle-pet-mp-text'];
            }
            else if (id === 'mana' || id === 'exp') { 
                barIds = ['mana-progress']; 
                textIds = ['stat-mana', 'exp-percent']; 
                
                // Hiển thị nút đột phá nếu đủ linh khí
                const breakthroughBtn = document.getElementById('breakthrough-btn');
                const breakthroughCultivateBtn = document.getElementById('breakthrough-cultivate-btn');
                const autoCultivateBtn = document.getElementById('auto-cultivate-main-btn');
                
                if (current >= max) {
                    if (breakthroughBtn) breakthroughBtn.style.display = 'block';
                    if (breakthroughCultivateBtn) breakthroughCultivateBtn.style.display = 'block';
                    if (autoCultivateBtn) autoCultivateBtn.style.display = 'none';
                } else {
                    if (breakthroughBtn) breakthroughBtn.style.display = 'none';
                    if (breakthroughCultivateBtn) breakthroughCultivateBtn.style.display = 'none';
                    if (autoCultivateBtn) autoCultivateBtn.style.display = 'block';
                }
            }
            else if (id === 'enemy-hp') { 
                barIds = ['enemy-hp-progress', 'battle-enemy-hp-bar']; 
                textIds = ['stat-enemy-hp', 'battle-enemy-hp-text']; 
            }
            else if (id === 'enemy-mp') {
                barIds = ['battle-enemy-mp-bar'];
                textIds = ['battle-enemy-mp-text'];
            }
            else if (id === 'player-shield') {
                barIds = ['player-shield-progress'];
                textIds = ['battle-player-shield-text'];
                const container = document.getElementById('player-shield-bar-container');
                if (container) container.style.display = (max > 0) ? 'flex' : 'none';
            }
            else if (id === 'enemy-shield') {
                barIds = ['enemy-shield-progress'];
                textIds = ['battle-enemy-shield-text'];
                const container = document.getElementById('enemy-shield-bar-container');
                if (container) container.style.display = (max > 0) ? 'flex' : 'none';
            }
            else if (id === 'stamina') {
                barIds = ['stamina-progress'];
                textIds = ['stat-stamina'];
            }
            else if (id === 'pet-stamina') {
                barIds = ['pet-stamina-progress', 'pet-stamina-progress-battle'];
                textIds = ['stat-pet-stamina', 'stat-pet-stamina-battle-text'];
            }
            else if (id === 'explore') {
                barIds = ['explore-progress-bar'];
                textIds = ['explore-time-text'];
            }

            const percent = Math.max(0, Math.min(100, (current / (max || 1)) * 100));
            barIds.forEach(bid => {
                if (!domCache.bars[bid]) domCache.bars[bid] = document.getElementById(bid);
                const bar = domCache.bars[bid];
                if (bar) {
                    const newWidth = percent + "%";
                    if (bar.style.width !== newWidth) {
                        bar.style.width = newWidth;
                    }
                }
            });
            textIds.forEach(tid => {
                if (!domCache.texts[tid]) domCache.texts[tid] = document.getElementById(tid);
                const text = domCache.texts[tid];
                if (text) {
                    let textValue = "";
                    if (tid === 'exp-percent') {
                        textValue = Math.floor(percent) + "%";
                    } else if (this.currentEnemy && (this.currentEnemy.isTribulation || this.shouldHideEnemyStats(this.currentEnemy)) && (tid === 'stat-enemy-hp' || tid === 'battle-enemy-hp-text' || tid === 'battle-enemy-mp-text')) {
                        textValue = "????? / ?????";
                    } else if (document.body.classList.contains('in-tribulation') && (tid === 'stat-enemy-hp' || tid === 'battle-enemy-hp-text' || tid === 'battle-enemy-mp-text')) {
                        textValue = "????? / ?????";
                    } else if (tid === 'battle-enemy-shield-text' && (this.currentEnemy && this.shouldHideEnemyStats(this.currentEnemy))) {
                        textValue = "?????";
                    } else if (tid === 'battle-player-shield-text' || tid === 'battle-enemy-shield-text') {
                        textValue = `${formatNumber(current)}/${formatNumber(max)}`;
                    } else {
                        textValue = `${formatNumber(current)}/${formatNumber(max)}`;
                    }
                    
                    if (text.innerText !== textValue) {
                        text.innerText = textValue;
                    }
                }
            });
        },

        renderDebuffs: function(side, buffs = [], debuffs = []) {
            const buffContainer = document.getElementById(`ui-${side}-buffs`);
            const debuffContainer = document.getElementById(`ui-${side}-debuffs`);
            
            if (!buffContainer || !debuffContainer) return;

            const now = Date.now();

            const renderStatus = (status, borderColor) => {
                const timeLeft = Math.ceil((status.expiry - now) / 1000);
                const isInfinite = timeLeft > 100000;
                const style = STATUS_STYLE[status.type] || { color: status.color || borderColor, icon: status.icon || "✨", name: status.name, desc: status.desc };
                const iconColor = style.color || borderColor;
                
                const caster = status.casterName ? status.casterName.replace(/'/g, "\\'") : "";
                const source = status.sourceName ? status.sourceName.replace(/'/g, "\\'") : "";

                return `
                    <div class="status-icon pulse" title="${style.name || status.name}: ${style.desc || status.desc || ''}" 
                         onclick="UI.showStatusDetail('${status.type}', ${timeLeft}, '${caster}', '${source}')" 
                         style="
                        width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
                        background: rgba(0,0,0,0.9); border: 1px solid ${borderColor}; border-radius: 50%;
                        position: relative; cursor: pointer;
                        box-shadow: 0 0 4px ${borderColor};
                    ">
                        <span style="font-size: 10px; z-index: 1; opacity: 1; color: ${iconColor}; text-shadow: 0 0 2px rgba(0,0,0,0.8);">${style.icon || status.icon}</span>
                        ${!isInfinite ? `
                        <div style="
                            position: absolute; bottom: -2px; right: -2px;
                            background: rgba(0,0,0,0.95); color: #fff;
                            font-size: 6px; padding: 0 1px; border-radius: 2px;
                            border: 1px solid ${borderColor}; z-index: 2;
                            font-weight: bold; line-height: 1;
                        ">${timeLeft}</div>
                        ` : ''}
                    </div>
                `;
            };

            const activeBuffs = (buffs || []).filter(b => b.expiry > now);
            buffContainer.innerHTML = activeBuffs.map(b => renderStatus(b, "#4caf50")).join('');

            const activeDebuffs = (debuffs || []).filter(d => d.expiry > now);
            debuffContainer.innerHTML = activeDebuffs.map(d => renderStatus(d, "#f44336")).join('');
        },

        renderSkillStatus: function(side, skillIds = [], skillCDs = {}, petLevel = null) {
            const container = document.getElementById(`ui-${side}-skills-status`);
            if (!container) return;

            const proxy = (typeof Game !== 'undefined') ? Game.getProxy() : null;

            if (!skillIds || skillIds.length === 0) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = skillIds.map(item => {
                if (!item) return '';
                const id = (item && typeof item === 'object') ? item.id : item;
                let skill = (item && typeof item === 'object' && item.name) ? item : (GameData.skills ? GameData.skills[id] : null);
                
                // Nếu không tìm thấy trong skills, tìm trong petSkills
                if (!skill && GameData.petSkills) {
                    skill = GameData.petSkills[id];
                }
                
                if (!skill || skill.type === 'passive') return '';

                // Nếu là phía người chơi hoặc linh thú, kiểm tra xem kỹ năng có bị tắt không
                if ((side === 'player' || side === 'pet') && proxy) {
                    const toggledSkills = proxy.toggledSkills || [];
                    const priority = (proxy.skillPriorities && proxy.skillPriorities[id]) || 'medium';
                    
                    // Với linh thú, không cần kiểm tra toggledSkills (vì nó luôn tự động)
                    // Nhưng vẫn cần kiểm tra priority 'off'
                    if (priority === 'off') return '';
                    
                    // Với người chơi, kiểm tra cả toggledSkills
                    if (side === 'player' && !toggledSkills.includes(id)) return '';
                }

                const cdMs = skillCDs[id] || 0;
                const isReady = cdMs <= 0;
                const cdSec = Math.ceil(cdMs / 1000);
                const maxCd = (skill.cooldown || 4) * 1000;
                const cdPercent = Math.max(0, Math.min(100, (cdMs / maxCd) * 100));
                
                const rankKey = skillRankMapping[skill.rank] || "common";
                const rankColor = rarityColors[rankKey] || "#fff";
                
                // Kiểm tra khóa kỹ năng cho pet
                const isLocked = side === 'pet' && typeof PetSystem !== 'undefined' && PetSystem.isSkillLocked(id, petLevel || (proxy ? proxy.rankId : 1), skillIds);
                
                const color = (isReady && !isLocked) ? rankColor : '#666';
                const opacity = (isReady && !isLocked) ? '1' : '0.7';
                const filter = (isReady && !isLocked) ? 'none' : 'grayscale(80%)';

                const hideStats = (side === 'enemy') && this.shouldHideEnemyStats(this.currentEnemy);
                const icon = hideStats ? '❓' : (skill.icon || '📜');
                const onclick = hideStats ? '' : `onclick="UI.showSkillDetail('${id}', ${side === 'enemy' || side === 'pet'}, ${petLevel || 0}, '${side === 'pet' ? (proxy ? proxy.activePetId : '') : ''}')"`;

                return `
                    <div ${onclick} style="
                        width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
                        background: rgba(0,0,0,0.7); border: 1px solid ${color}; border-radius: 4px;
                        position: relative; opacity: ${opacity}; filter: ${filter};
                        box-shadow: ${isReady && !isLocked ? `0 0 6px ${color}55` : 'none'};
                        overflow: hidden; cursor: pointer;
                    ">
                        <!-- Lock Icon -->
                        ${isLocked ? `
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 2; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 10px;">🔒</span>
                        </div>
                        ` : ''}
                        <!-- Cooldown Overlay -->
                        ${!isReady && !isLocked ? `
                        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${cdPercent}%; background: rgba(0,0,0,0.6); z-index: 1;"></div>
                        <span style="position: absolute; font-size: 8px; color: #fff; font-weight: bold; text-shadow: 0 0 2px #000; z-index: 2;">${cdSec}</span>
                        ` : ''}
                        <span style="font-size: 13px; position: relative; z-index: 0;">${icon}</span>
                    </div>
                `;
            }).filter(html => html !== '').slice(0, side === 'enemy' ? 6 : 99).join('');
        },

        renderBattleAvatars: function(enemy) {
            const playerAvatarId = 'player-avatar-container';
            const enemyAvatarId = 'enemy-avatar-container';
            
            const playerAvatar = document.getElementById(playerAvatarId);
            const enemyAvatar = document.getElementById(enemyAvatarId);
            
            if (playerAvatar) {
                const playerRank = (typeof Game !== 'undefined' && Game.player) ? (Game.player.rank || 0) : 0;
                const avatars = ['🧑‍🌾', '🚶', '🏃', '🤺', '⚔️', '🔥', '⚡', '🐉', '✨', '🌌'];
                playerAvatar.innerText = avatars[Math.min(playerRank, avatars.length - 1)];
            }
            
            if (enemyAvatar) {
                if (this.isTribulation) {
                    enemyAvatar.innerHTML = `
                        👁️
                        <span class="mystical-eye eye-left">👁️</span>
                        <span class="mystical-eye eye-right">👁️</span>
                    `;
                    enemyAvatar.style.borderColor = "#d4af37";
                    enemyAvatar.style.boxShadow = "0 0 40px rgba(212, 175, 55, 0.6)";
                } else {
                    enemyAvatar.innerText = enemy.icon || '👾';
                    if (enemy.color) {
                        enemyAvatar.style.borderColor = enemy.color;
                        enemyAvatar.style.boxShadow = `0 0 10px ${enemy.color}4d`;
                    } else {
                        enemyAvatar.style.borderColor = '#f44336';
                        enemyAvatar.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.3)';
                    }
                }
            }
        },

        showBattleEffect: function(type, value, isPlayerTarget = true) {
            let layerId = 'battle-effects-layer';
            if (this.isTribulation) layerId = 'trib-effects-layer';
            
            const layer = document.getElementById(layerId);
            if (!layer) return;

            let effect;
            if (effectPool.length > 0) {
                effect = effectPool.pop();
                effect.style.display = 'block';
                effect.className = 'animate-float-up'; // Reset classes
            } else {
                effect = document.createElement('div');
                effect.className = 'animate-float-up';
                effect.style.position = 'absolute';
                effect.style.fontWeight = 'bold';
                effect.style.fontSize = '1.2rem';
                effect.style.zIndex = '20';
                effect.style.textShadow = '2px 2px 0 #000';
                effect.style.pointerEvents = 'none';
            }

            // Position based on target avatar
            let targetId;
            if (isPlayerTarget === "player" || isPlayerTarget === true) {
                targetId = 'player-avatar-container';
            } else if (isPlayerTarget === "pet") {
                targetId = 'pet-avatar-battle';
            } else {
                targetId = 'enemy-avatar-container';
            }

            if (this.isTribulation) {
                targetId = isPlayerTarget === "player" || isPlayerTarget === true ? 'trib-player-avatar' : 'trib-enemy-avatar';
            }
            
            const targetEl = document.getElementById(targetId);

            if (targetEl) {
                const layerRect = layer.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();
                const left = targetRect.left - layerRect.left + (targetRect.width / 2);
                const top = targetRect.top - layerRect.top + (targetRect.height / 2);
                
                effect.style.left = `${left}px`;
                effect.style.top = `${top}px`;
            } else {
                // Fallback to percentages if element not found
                if (isPlayerTarget) {
                    effect.style.left = '50%';
                    effect.style.bottom = '30%';
                } else {
                    effect.style.left = '50%';
                    effect.style.top = '30%';
                }
            }

            switch (type) {
                case 'damage':
                    effect.innerText = `-${value}`;
                    effect.style.color = '#ff4444';
                    this.triggerShake(isPlayerTarget);
                    this.triggerFlash(isPlayerTarget, 'red');
                    break;
                case 'heal':
                    effect.innerText = `+${value}`;
                    effect.style.color = '#4caf50';
                    this.triggerFlash(isPlayerTarget, 'green');
                    break;
                case 'skill':
                    effect.innerText = value;
                    effect.style.color = '#ffeb3b';
                    effect.style.fontSize = '1rem';
                    effect.style.top = '30%';
                    break;
                case 'miss':
                    effect.innerText = 'MISS';
                    effect.style.color = '#aaa';
                    break;
                case 'crit':
                    effect.innerText = `CRIT! -${value}`;
                    effect.style.color = '#ff9800';
                    effect.style.fontSize = '1.5rem';
                    this.triggerShake(isPlayerTarget, true);
                    this.triggerFlash(isPlayerTarget, 'red');
                    break;
                case 'lightning':
                    effect.innerText = value;
                    effect.style.color = arguments[3] || '#00f2ff';
                    effect.style.fontSize = '2.5rem';
                    effect.style.textShadow = `0 0 20px ${effect.style.color}, 0 0 40px ${effect.style.color}`;
                    effect.style.zIndex = '100';
                    this.triggerShake(isPlayerTarget, true);
                    this.triggerFlash(isPlayerTarget, effect.style.color);
                    
                    // Hiệu ứng tấm khiên biến to khi trúng sét
                    const shield = document.getElementById('player-tribulation-defense-icon');
                    if (shield && document.body.classList.contains('in-tribulation')) {
                        shield.classList.remove('shield-defend');
                        requestAnimationFrame(() => {
                            shield.classList.add('shield-defend');
                        });
                    }
                    
                    // Reuse Lightning SVG
                    if (!domCache.lightningSVG) {
                        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        svg.style.position = 'fixed';
                        svg.style.top = '0';
                        svg.style.left = '0';
                        svg.style.width = '100vw';
                        svg.style.height = '100vh';
                        svg.style.zIndex = '10000000';
                        svg.style.pointerEvents = 'none';
                        svg.style.display = 'none';
                        
                        domCache.lightningGlow = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                        domCache.lightningGlow.setAttribute("fill", "none");
                        domCache.lightningGlow.setAttribute("stroke-linecap", "round");
                        domCache.lightningGlow.setAttribute("stroke-linejoin", "round");
                        domCache.lightningGlow.style.opacity = "0.4";
                        
                        domCache.lightningPoly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                        domCache.lightningPoly.setAttribute("fill", "none");
                        domCache.lightningPoly.setAttribute("stroke-linecap", "round");
                        domCache.lightningPoly.setAttribute("stroke-linejoin", "round");
                        domCache.lightningPoly.style.opacity = "0.9";
                        
                        domCache.lightningCore = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                        domCache.lightningCore.setAttribute("fill", "none");
                        domCache.lightningCore.setAttribute("stroke", "white");
                        domCache.lightningCore.setAttribute("stroke-width", "3");
                        domCache.lightningCore.setAttribute("stroke-linecap", "round");
                        domCache.lightningCore.setAttribute("stroke-linejoin", "round");
                        
                        svg.appendChild(domCache.lightningGlow);
                        svg.appendChild(domCache.lightningPoly);
                        svg.appendChild(domCache.lightningCore);
                        document.body.appendChild(svg);
                        domCache.lightningSVG = svg;
                    }

                    const svg = domCache.lightningSVG;
                    let targetX = window.innerWidth / 2;
                    let targetY = window.innerHeight / 2;

                    if (targetEl) {
                        const rect = targetEl.getBoundingClientRect();
                        targetX = rect.left + rect.width / 2;
                        // Nhắm vào phần trên của avatar để trông thật hơn
                        targetY = rect.top + rect.height * 0.3;
                    }

                    const startX = targetX + (Math.random() * 400 - 200);
                    const segments = 8;
                    let points = `${startX},-50`;
                    const stepY = (targetY + 50) / segments;
                    
                    for(let i = 1; i < segments; i++) {
                        const progress = i / segments;
                        // Càng gần mục tiêu càng ít lệch X
                        const spread = 120 * (1 - progress);
                        const x = targetX + (Math.random() * spread * 2 - spread);
                        const y = -50 + stepY * i;
                        points += ` ${x},${y}`;
                    }
                    points += ` ${targetX},${targetY}`;
                    
                    domCache.lightningGlow.setAttribute("points", points);
                    domCache.lightningGlow.setAttribute("stroke", effect.style.color);
                    domCache.lightningGlow.setAttribute("stroke-width", "15");
                    
                    domCache.lightningPoly.setAttribute("points", points);
                    domCache.lightningPoly.setAttribute("stroke", effect.style.color);
                    domCache.lightningPoly.setAttribute("stroke-width", "6");
                    
                    domCache.lightningCore.setAttribute("points", points);
                    
                    svg.style.display = 'block';
                    setTimeout(() => svg.style.display = 'none', 120);

                    const targetUI = document.getElementById(this.isTribulation ? 'tribulation-ui-new' : 'battle-ui');
                    if (targetUI) {
                        targetUI.classList.add('animate-shake');
                        setTimeout(() => targetUI.classList.remove('animate-shake'), 400);
                    }
                    break;
            }

            layer.appendChild(effect);
            effect.classList.add('animate-float-up');
            
            setTimeout(() => {
                effect.classList.remove('animate-float-up');
                effect.style.display = 'none';
                if (effectPool.length < MAX_POOL_SIZE) {
                    effectPool.push(effect);
                } else {
                    effect.remove();
                }
            }, 1000);
        },

        triggerShake: function(isPlayer, isStrong = false) {
            let containerId = isPlayer ? 'player-avatar-container' : 'enemy-avatar-container';
            if (this.isTribulation) {
                containerId = isPlayer ? 'trib-player-avatar' : 'trib-enemy-avatar';
            }
            const el = document.getElementById(containerId);
            if (el) {
                el.classList.remove('animate-shake');
                requestAnimationFrame(() => {
                    el.classList.add('animate-shake');
                });
            }
        },

        triggerAttackAnimation: function(side) {
            let targetId;
            let animClass;
            
            if (side === "player" || side === true) {
                targetId = this.isTribulation ? 'trib-player-avatar' : 'player-avatar-container';
                animClass = 'dash-attack-player';
            } else if (side === "pet") {
                targetId = 'pet-avatar-battle';
                animClass = 'dash-attack-pet';
            } else {
                targetId = this.isTribulation ? 'trib-enemy-avatar' : 'enemy-avatar-container';
                animClass = 'dash-attack-enemy';
            }
            
            const el = document.getElementById(targetId);
            if (el) {
                el.classList.remove('dash-attack-player', 'dash-attack-enemy', 'dash-attack-pet');
                void el.offsetWidth; // Trigger reflow
                el.classList.add(animClass);
                
                // Tự động gỡ bỏ class sau khi animation kết thúc (0.3s)
                setTimeout(() => {
                    if (el) el.classList.remove(animClass);
                }, 350);
            }
        },

        triggerFlash: function(isPlayer, color) {
            const containerId = this.isTribulation ? 'tribulation-ui-new' : 'battle-ui';
            const container = document.getElementById(containerId);
            if (container) {
                let flashOverlay = container.querySelector('.flash-overlay');
                if (!flashOverlay) {
                    flashOverlay = document.createElement('div');
                    flashOverlay.className = 'flash-overlay';
                    flashOverlay.style.position = 'absolute';
                    flashOverlay.style.top = '0';
                    flashOverlay.style.left = '0';
                    flashOverlay.style.width = '100%';
                    flashOverlay.style.height = '100%';
                    flashOverlay.style.pointerEvents = 'none';
                    flashOverlay.style.zIndex = '50';
                    flashOverlay.style.borderRadius = '8px';
                    flashOverlay.style.transition = 'opacity 0.15s';
                    flashOverlay.style.display = 'none';
                    container.appendChild(flashOverlay);
                }

                flashOverlay.style.backgroundColor = color;
                flashOverlay.style.opacity = '0.3';
                flashOverlay.style.display = 'block';

                setTimeout(() => {
                    flashOverlay.style.opacity = '0';
                    setTimeout(() => flashOverlay.style.display = 'none', 150);
                }, 80);
            }
        },

        addBattleLog: function(msg, targetName = "") {
            if (actionsShown < 2) {
                const bLog = document.getElementById('battle-log-detail');
                if (bLog) {
                    const el = this.createBattleLogElement(msg, targetName);
                    if (bLog.children.length > 50) bLog.removeChild(bLog.firstChild);
                    bLog.appendChild(el);
                    requestAnimationFrame(() => {
                        bLog.scrollTop = bLog.scrollHeight;
                    });
                }
                actionsShown++;
            } else {
                battleLogQueue.push({ msg, targetName });
            }

            if (!logInterval && battleLogQueue.length > 0) {
                const processQueue = () => {
                    if (battleLogQueue.length > 0) {
                        const bLog = document.getElementById('battle-log-detail');
                        if (!bLog) {
                            logInterval = null;
                            return;
                        }

                        const fragment = document.createDocumentFragment();
                        // Process more items if the queue is long to catch up
                        const batchSize = Math.min(battleLogQueue.length, battleLogQueue.length > 10 ? 10 : 5);
                        for (let i = 0; i < batchSize; i++) {
                            const item = battleLogQueue.shift();
                            const el = this.createBattleLogElement(item.msg, item.targetName);
                            fragment.appendChild(el);
                        }

                        const currentCount = bLog.children.length;
                        const newCount = fragment.childNodes.length;
                        if (currentCount + newCount > 50) {
                            const toRemove = (currentCount + newCount) - 50;
                            for (let i = 0; i < toRemove; i++) {
                                if (bLog.firstChild) bLog.removeChild(bLog.firstChild);
                            }
                        }

                        bLog.appendChild(fragment);
                        bLog.scrollTop = bLog.scrollHeight;
                        
                        logInterval = requestAnimationFrame(processQueue);
                    } else {
                        logInterval = null;
                    }
                };
                logInterval = requestAnimationFrame(processQueue);
            }
        },

        createBattleLogElement: function(msg, targetName) {
            let styledMsg = msg;
            
            // Format numbers in the message (e.g., 1000 -> 1K)
            styledMsg = styledMsg.replace(/\d{4,}/g, (match) => {
                return formatNumber(parseInt(match));
            });
            
            // Parse định dạng mới [[Name|Type|Caster|Source]] để hiển thị nguồn gốc
            const META_STATUS_REGEX = /\[\[([^|]*)\|([^|]*)\|([^|]*)\|(.*?)\]\]/g;
            styledMsg = styledMsg.replace(META_STATUS_REGEX, (match, name, type, caster, source) => {
                const style = STATUS_STYLE[type];
                if (!style) return name;
                
                // Escape single quotes for onclick
                const escCaster = (caster || "").replace(/'/g, "\\'");
                const escSource = (source || "").replace(/'/g, "\\'");
                
                // Đánh dấu phần này là đã xử lý để tránh replacementRegex lặp lại icon
                return `<b class="processed-status" style="color:${style.color}; text-shadow: 0 0 5px ${style.shadow}; cursor:pointer;" onclick="UI.showStatusDetail('${type}', 0, '${escCaster}', '${escSource}')">${style.icon} ${name}</b>`;
            });

            if (!cachedReplacements) {
                cachedReplacements = {};
                const names = [];
                if (typeof GameData !== 'undefined') {
                    for (let id in GameData.skills) {
                        const skill = GameData.skills[id];
                        cachedReplacements[skill.name] = `<b style="color:${skill.color}; text-shadow: 0 0 5px ${skill.color}88; cursor:pointer;" onclick="UI.showSkillDetail('${id}')">${skill.icon} ${skill.name}</b>`;
                        names.push(skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                    }
                }
                for (let type in STATUS_STYLE) {
                    const style = STATUS_STYLE[type];
                    cachedReplacements[style.name] = `<b style="color:${style.color}; text-shadow: 0 0 5px ${style.shadow}; cursor:pointer;" onclick="UI.showStatusDetail('${type}', 0)">${style.icon} ${style.name}</b>`;
                    names.push(style.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                }
                names.sort((a, b) => b.length - a.length);
                replacementRegex = new RegExp(names.join('|'), 'g');
            }

            if (replacementRegex) {
                // Tách chuỗi thành các phần: text, HTML tags, và [[...]] blocks để tránh replace nhầm
                const parts = styledMsg.split(/(<[^>]*>|\[\[.*?\]\])/g);
                let tagStack = [];
                
                styledMsg = parts.map(part => {
                    if (part.startsWith('<') && part.endsWith('>')) {
                        // Theo dõi việc đóng mở thẻ để tránh replace text bên trong thẻ
                        if (part.startsWith('</')) {
                            tagStack.pop();
                        } else if (!part.endsWith('/>')) {
                            tagStack.push(part);
                        }
                        return part;
                    }
                    
                    // Nếu là block [[...]] thì bỏ qua (đã hoặc sẽ được xử lý bởi META_STATUS_REGEX)
                    if (part.startsWith('[[') && part.endsWith(']]')) {
                        return part;
                    }
                    
                    // Nếu đang ở trong một thẻ HTML, bỏ qua việc thay thế
                    if (tagStack.length > 0) {
                        return part;
                    }
                    
                    // Nếu là text, thực hiện thay thế
                    // Thêm định dạng số K, M, B cho các số lớn trong log
                    let formattedPart = part.replace(/([+-]?\d{4,})/g, (match) => {
                        const num = parseFloat(match);
                        if (isNaN(num)) return match;
                        return formatNumber(num);
                    });
                    
                    // Tối ưu: Nếu phần text này nằm ngay sau một icon/emoji thì không replace nữa để tránh 2 icon
                    return formattedPart.replace(replacementRegex, (match, offset, fullPart) => {
                        // Kiểm tra xem phía trước match có emoji nào không (trong cùng 1 part)
                        const before = fullPart.substring(0, offset).trim();
                        // Regex kiểm tra emoji rộng hơn để bao phủ hầu hết các icon game dùng
                        if (/[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]$/u.test(before)) {
                            return match; // Giữ nguyên nếu đã có icon phía trước
                        }
                        return cachedReplacements[match] || match;
                    });
                }).join('');
            }
            
            styledMsg = styledMsg.replace(ST_REGEX, '<span style="color:#ff4444; font-weight:bold; text-shadow: 0 0 3px #000;">$1 ST</span>')
                                .replace(HP_HEAL_REGEX, '<span style="color:#4caf50; font-weight:bold;">hồi $1 Sinh lực</span>')
                                .replace(HP_LOSS_REGEX, '<span style="color:#ff4444; font-weight:bold;">-$1 Sinh lực</span>')
                                .replace(TIME_REGEX, '<span style="color:#ffeb3b; font-size:0.65rem; background:rgba(0,0,0,0.5); padding:1px 6px; border-radius:10px; margin-left:6px; border:1px solid #d4af37; box-shadow: 0 0 5px rgba(212, 175, 55, 0.3);">⏳ $1s</span>');

            const p = document.createElement('div'); 
            p.className = 'battle-log-item';
            
            const avatarSpan = document.createElement('span');
            avatarSpan.className = 'battle-log-avatar';

            let displayTarget = targetName;
            if (targetName) {
                // Loại bỏ icon ở đầu targetName để tránh hiển thị 2 icon (vì avatarSpan đã có icon)
                displayTarget = targetName.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]\s*/u, '');
                // Loại bỏ tên môn phái trong ngoặc đơn (ví dụ: "Lục Lôi Thiên (Thiếu Lâm Tự)" -> "Lục Lôi Thiên")
                if (displayTarget.includes(' (')) {
                    displayTarget = displayTarget.split(' (')[0];
                }
            }

            // Ưu tiên kiểm tra đồng đội trước kẻ địch để tránh nhầm lẫn màu sắc
            if (targetName && (targetName.includes("Bạn") || targetName.includes("Đạo Hữu") || targetName.includes("Linh Thú") || targetName.startsWith("🐾"))) {
                displayTarget = `<b style="color:#4caf50;">${displayTarget}</b>`;
                p.style.borderLeftColor = '#4caf50';
                
                if (targetName.includes("Linh Thú") || targetName.startsWith("🐾")) {
                    avatarSpan.innerText = '🐾';
                } else {
                    const playerRank = (typeof Game !== 'undefined' && Game.player) ? (Game.player.rank || 0) : 0;
                    const avatars = ['🧑‍🌾', '🚶', '🏃', '🤺', '⚔️', '🔥', '⚡', '🐉', '✨', '🌌'];
                    avatarSpan.innerText = avatars[Math.min(playerRank, avatars.length - 1)];
                }
            } else if (lastEnemyObject && targetName && targetName.includes(lastEnemyObject.name)) {
                displayTarget = `<b style="color:#f44336;">${displayTarget}</b>`;
                p.style.borderLeftColor = '#f44336';
                avatarSpan.innerText = lastEnemyObject.icon || '👾';
            } else if (targetName === "Hệ thống") {
                displayTarget = `<b style="color:#ffeb3b;">${displayTarget}</b>`;
                p.style.background = 'rgba(255, 235, 59, 0.05)';
                p.style.borderLeftColor = '#ffeb3b';
                avatarSpan.innerText = '📜';
            } else if (targetName === "⚡ Thiên Đạo" || targetName === "⚖️ Thiên Phạt") {
                displayTarget = `<b style="color:#e0e0e0; text-shadow: 0 0 5px #fff;">${displayTarget}</b>`;
                p.style.background = 'rgba(255, 255, 255, 0.05)';
                p.style.borderLeftColor = '#e0e0e0';
                avatarSpan.innerText = targetName === "⚡ Thiên Đạo" ? '⚡' : '⚖️';
                avatarSpan.style.filter = 'grayscale(100%) brightness(1.5)';
                
                if (msg.includes("ĐỘ KIẾP THÀNH CÔNG")) {
                    p.style.background = 'rgba(76, 175, 80, 0.25)';
                    p.style.border = '1px solid #4caf50';
                    p.style.borderLeft = '5px solid #4caf50';
                    p.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.5)';
                    p.style.fontSize = '0.75rem';
                    p.style.fontWeight = 'bold';
                } else if (msg.includes("ĐỘ KIẾP THẤT BẠI")) {
                    p.style.background = 'rgba(244, 67, 54, 0.25)';
                    p.style.border = '1px solid #f44336';
                    p.style.borderLeft = '5px solid #f44336';
                    p.style.boxShadow = '0 0 15px rgba(244, 67, 54, 0.5)';
                    p.style.fontSize = '0.75rem';
                    p.style.fontWeight = 'bold';
                }
            } else {
                avatarSpan.innerText = '📜';
            }
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'battle-log-content';
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            contentDiv.innerHTML = `<span class="battle-log-time">[${timeStr}]</span> ` + 
                            (displayTarget ? displayTarget + ": " : "") + styledMsg;
            
            p.appendChild(avatarSpan);
            p.appendChild(contentDiv);
            
            return p;
        },

        // --- Các hàm phụ trợ khác giữ nguyên logic nhưng tối ưu hiệu năng ---
        lastTab: 'cultivate',
        showTab: function(tabName) {
            console.log("Showing tab:", tabName);
            if (tabName !== 'battle') this.lastTab = tabName;
            const tabs = ['cultivate', 'map', 'pet', 'skill', 'battle', 'bag', 'sect', 'auto', 'guide', 'quest', 'battle-settings'];
            tabs.forEach(t => {
                const el = document.getElementById(`${t}-ui`);
                if (el) el.style.display = 'none';
                const btn = document.getElementById(`tab-${t}-btn`); 
                if (btn) { btn.style.background = "#333"; btn.style.color = "#fff"; }
            });
            const target = document.getElementById(`${tabName}-ui`);
            if (target) target.style.display = (tabName === 'battle') ? 'flex' : 'block';
            const targetBtn = document.getElementById(`tab-${tabName}-btn`);
            if (targetBtn) { targetBtn.style.background = "#d4af37"; targetBtn.style.color = "#121212"; }
            
            const proxy = (typeof Game !== 'undefined') ? Game.getProxy() : null;

            if (tabName === 'cultivate') {
                if (proxy) this.updateBoneUI(proxy.boneQualityId);
            }

            if (tabName === 'pet') {
                if (proxy) this.renderPetTab(proxy);
            }

            if (tabName === 'quest') {
                if (proxy) this.renderQuestTab(proxy);
            }

            if (tabName === 'battle-settings') {
                if (proxy) {
                    this.renderBattleSettingsTab(proxy);
                    this.renderPotionSettingsTab(proxy);
                }
            }

            if (tabName === 'map') {
                if (typeof Game !== 'undefined') {
                    const proxy = Game.getProxy();
                    Game.recalculateStats();
                    this.renderMapList(proxy);
                }
            }

            // Xử lý nút "Đang chiến đấu"
            const indicator = document.getElementById('battle-status-indicator');
            if (indicator) {
                if (typeof Game !== 'undefined' && Game.isInBattle && tabName !== 'battle') {
                    indicator.style.display = 'block';
                } else {
                    indicator.style.display = 'none';
                }
            }
        },

        initAutoCultivate: function() {
            const toggleBtn = document.getElementById('auto-cultivate-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    if (typeof Game !== 'undefined') {
                        const isEnabled = Game.toggleAutoCultivate();
                        toggleBtn.innerText = isEnabled ? "BẬT" : "TẮT";
                        toggleBtn.style.background = isEnabled ? "#4caf50" : "#d4af37";
                    }
                });
            }

            const thresholdSelect = document.getElementById('auto-cultivate-threshold');
            if (thresholdSelect) {
                thresholdSelect.addEventListener('change', (e) => {
                    if (typeof Game !== 'undefined') {
                        Game.setAutoCultivateThreshold(parseFloat(e.target.value));
                    }
                });
            }
        },

        initBattleSettings: function() {
            // Đã loại bỏ tự động thám hiểm
        },

        expandedTacticId: null,

        renderPotionSettingsTab: function(proxy) {
            const container = document.getElementById('potion-settings-list');
            if (!container) return;

            const settings = (typeof Game !== 'undefined') ? Game.getPotionSettings() : { slots: [] };
            
            // Lấy danh sách đan dược có trong túi đồ và có tác dụng chiến đấu
            const inventory = proxy.inventory || [];
            const inventoryPillIds = [...new Set(inventory.map(i => i.id))];
            const usablePills = inventoryPillIds
                .map(id => GameData.items[id])
                .filter(item => item && item.type === 'pill' && (item.pillCategory === 'hp' || item.pillCategory === 'mp' || item.effect));

            let slotsHtml = '';
            if (settings.slots.length === 0) {
                slotsHtml = `
                    <div style="text-align: center; padding: 30px; color: #666; background: #111; border-radius: 8px; border: 1px dashed #333; margin-bottom: 10px;">
                        <span style="font-size: 2rem; display: block; margin-bottom: 10px;">🧪</span>
                        <p style="font-size: 0.75rem;">Chưa có thiết lập nào. Hãy thêm ô mới để bắt đầu!</p>
                    </div>
                `;
            } else {
                settings.slots.forEach((slot, index) => {
                    const pill = GameData.items[slot.pillId];
                    const pillColor = pill ? (pill.rarity === 'mythic' ? '#ffeb3b' : (pill.rarity === 'legendary' ? '#ff9800' : (pill.rarity === 'epic' ? '#9c27b0' : (pill.rarity === 'rare' ? '#2196f3' : '#fff')))) : '#888';

                    slotsHtml += `
                        <div style="background: #1a1a1a; padding: 12px; border-radius: 8px; border: 1px solid ${slot.enabled ? '#4caf50' : '#333'}; margin-bottom: 10px; transition: all 0.3s; position: relative;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="background: #333; color: #aaa; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.6rem;">${index + 1}</span>
                                    <span style="color: #fff; font-size: 0.8rem; font-weight: bold;">Thiết lập ${index + 1}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div id="toggle-slot-${index}" style="width: 36px; height: 18px; background: ${slot.enabled ? '#4caf50' : '#444'}; border-radius: 9px; position: relative; cursor: pointer; transition: all 0.3s;">
                                        <div style="width: 14px; height: 14px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: ${slot.enabled ? '20px' : '2px'}; transition: all 0.3s;"></div>
                                    </div>
                                    <button id="remove-slot-${index}" style="background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; width: 22px; height: 22px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">×</button>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="color: #888; font-size: 0.6rem;">Chọn đan dược (trong túi):</span>
                                    <select id="pill-select-${index}" style="width: 100%; background: #222; color: ${pillColor}; border: 1px solid #444; border-radius: 4px; padding: 4px; font-size: 0.75rem; outline: none;">
                                        <option value="" ${!slot.pillId ? 'selected' : ''}>-- Trống --</option>
                                        ${usablePills.map(p => `
                                            <option value="${p.id}" ${slot.pillId === p.id ? 'selected' : ''} style="color: ${p.rarity === 'mythic' ? '#ffeb3b' : (p.rarity === 'legendary' ? '#ff9800' : (p.rarity === 'epic' ? '#9c27b0' : (p.rarity === 'rare' ? '#2196f3' : '#fff')))}">
                                                ${p.icon} ${p.name}
                                            </option>
                                        `).join('')}
                                        ${(slot.pillId && !usablePills.find(p => p.id === slot.pillId)) ? `
                                            <option value="${slot.pillId}" selected style="color: #ff4444;">
                                                ⚠️ ${GameData.items[slot.pillId]?.name || 'Đã mất'} (Hết hàng)
                                            </option>
                                        ` : ''}
                                    </select>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="color: #888; font-size: 0.6rem;">Điều kiện sử dụng:</span>
                                    <div style="display: flex; align-items: center; gap: 5px;">
                                        <select id="condition-select-${index}" style="flex: 1; background: #222; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 4px; font-size: 0.75rem; outline: none;">
                                            <option value="hp_low" ${slot.condition === 'hp_low' ? 'selected' : ''}>Máu <</option>
                                            <option value="mp_low" ${slot.condition === 'mp_low' ? 'selected' : ''}>Linh lực <</option>
                                            <option value="battle_start" ${slot.condition === 'battle_start' ? 'selected' : ''}>Bắt đầu trận</option>
                                            <option value="player_cc" ${slot.condition === 'player_cc' ? 'selected' : ''}>Khi bị khống chế</option>
                                            <option value="interval" ${slot.condition === 'interval' ? 'selected' : ''}>Cứ mỗi... giây</option>
                                        </select>
                                        ${(slot.condition === 'hp_low' || slot.condition === 'mp_low') ? `
                                            <input type="number" id="threshold-input-${index}" value="${slot.threshold || 30}" style="width: 40px; background: #222; color: #ffeb3b; border: 1px solid #444; border-radius: 4px; padding: 4px; font-size: 0.75rem; text-align: center;" />
                                            <span style="color: #aaa; font-size: 0.7rem;">%</span>
                                        ` : ''}
                                        ${slot.condition === 'interval' ? `
                                            <input type="number" id="interval-input-${index}" value="${slot.interval || 10}" min="6" max="15" style="width: 40px; background: #222; color: #ffeb3b; border: 1px solid #444; border-radius: 4px; padding: 4px; font-size: 0.75rem; text-align: center;" />
                                            <span style="color: #aaa; font-size: 0.7rem;">s</span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            container.innerHTML = `
                <div style="max-height: 380px; overflow-y: auto; padding-right: 5px;">
                    ${slotsHtml}
                </div>
                <button id="add-potion-slot" ${settings.slots.length >= 10 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="width: 100%; margin-top: 10px; padding: 8px; font-size: 0.7rem; background: #1a1a1a; color: #4caf50; border: 1px dashed #4caf50; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: bold;">
                    ${settings.slots.length >= 10 ? 'Đã đạt giới hạn 10 thiết lập' : '+ THÊM THIẾT LẬP MỚI'}
                </button>
                <p style="font-size: 0.6rem; color: #888; font-style: italic; margin-top: 10px; text-align: center; line-height: 1.4;">
                    * Hệ thống sẽ kiểm tra lần lượt từ trên xuống dưới. <br/>
                    * Chỉ hiển thị đan dược đang có sẵn trong túi đồ.
                </p>
            `;

            // Event Listeners
            const addBtn = document.getElementById('add-potion-slot');
            if (addBtn) {
                addBtn.onclick = () => {
                    settings.slots.push({ enabled: true, pillId: '', threshold: 30, type: 'hp' });
                    Game.setPotionSettings(settings);
                    this.renderPotionSettingsTab(proxy);
                };
            }

            settings.slots.forEach((slot, index) => {
                const toggle = document.getElementById(`toggle-slot-${index}`);
                if (toggle) {
                    toggle.onclick = () => {
                        slot.enabled = !slot.enabled;
                        Game.setPotionSettings(settings);
                        this.renderPotionSettingsTab(proxy);
                    };
                }

                const removeBtn = document.getElementById(`remove-slot-${index}`);
                if (removeBtn) {
                    removeBtn.onclick = () => {
                        settings.slots.splice(index, 1);
                        Game.setPotionSettings(settings);
                        this.renderPotionSettingsTab(proxy);
                    };
                }

                const select = document.getElementById(`pill-select-${index}`);
                if (select) {
                    select.onchange = (e) => {
                        slot.pillId = e.target.value;
                        const pill = GameData.items[slot.pillId];
                        // Tự động gán condition dựa trên pillCategory nếu có
                        if (pill && pill.pillCategory) {
                            if (pill.pillCategory === 'hp') slot.condition = 'hp_low';
                            else if (pill.pillCategory === 'mp') slot.condition = 'mp_low';
                        }
                        Game.setPotionSettings(settings);
                        this.renderPotionSettingsTab(proxy);
                    };
                }

                const conditionSelect = document.getElementById(`condition-select-${index}`);
                if (conditionSelect) {
                    conditionSelect.onchange = (e) => {
                        slot.condition = e.target.value;
                        Game.setPotionSettings(settings);
                        this.renderPotionSettingsTab(proxy);
                    };
                }

                const input = document.getElementById(`threshold-input-${index}`);
                if (input) {
                    input.onchange = (e) => {
                        slot.threshold = Math.max(1, Math.min(99, parseInt(e.target.value) || 30));
                        Game.setPotionSettings(settings);
                        this.renderPotionSettingsTab(proxy);
                    };
                }

                const intervalInput = document.getElementById(`interval-input-${index}`);
                if (intervalInput) {
                    intervalInput.onchange = (e) => {
                        slot.interval = Math.max(6, Math.min(15, parseInt(e.target.value) || 10));
                        Game.setPotionSettings(settings);
                        this.renderPotionSettingsTab(proxy);
                    };
                }
            });
        },

        renderBattleSettingsTab: function(proxy) {
            const container = document.getElementById('combat-tactics-list');
            if (!container) return;

            const tactics = [
                {
                    id: 'balanced',
                    name: 'Cân Bằng (Mặc định)',
                    desc: 'Sử dụng kỹ năng một cách ổn định, theo đúng sự sắp xếp của đạo hữu, không thiên hướng cụ thể.',
                    priority: 'Theo cài đặt thủ công của đạo hữu (CAO > VỪA > THẤP).'
                },
                {
                    id: 'defensive',
                    name: 'Chậm Mà Chắc (Phòng Thủ & Sinh Tồn)',
                    desc: 'Nếu Máu (HP) < 70%: Ưu tiên tuyệt đối các chiêu hồi phục hoặc tạo giáp. Nếu đối phương đang chuẩn bị tung chiêu mạnh: Ưu tiên dùng chiêu Khống chế để ngắt quãng.',
                    priority: 'Hồi máu/Giáp > Khống chế > Buff Phòng thủ > Tấn công.'
                },
                {
                    id: 'assassin',
                    name: 'Sát Thủ (Combo Master)',
                    desc: 'Nhân vật sẽ cố gắng thực hiện các chuỗi chiêu thức (Combo) tối ưu. Chuỗi chuẩn: Khống chế -> Giảm thủ -> Buff bản thân -> Tuyệt kỹ sát thương mạnh nhất.',
                    priority: 'Khống chế -> Giảm thủ -> Buff bản thân -> Tấn công.'
                },
                {
                    id: 'suppression',
                    name: 'Áp Chế (Khống Chế & Suy Yếu)',
                    desc: 'Giữ cho đối thủ luôn trong trạng thái không thể phản kháng. Ưu tiên các chiêu có hiệu ứng Câm lặng, Choáng, Mù ngay khi hết thời gian hồi chiêu.',
                    priority: 'Câm lặng/Choáng > Giảm thủ/Yếu ớt > Tấn công > Phòng thủ.'
                },
                {
                    id: 'harassment',
                    name: 'Hành Hạ (Debuff Master)',
                    desc: 'Duy trì hiệu ứng: Ưu tiên giữ cho đối thủ luôn bị dính các trạng thái xấu (Độc, Chảy máu, Thiêu đốt) 100% thời gian. Làm yếu: Luôn ưu tiên các chiêu Giảm công, Giảm thủ.',
                    priority: 'Trạng thái xấu (DOT) > Giảm công/thủ > Tấn công.'
                },
                {
                    id: 'custom',
                    name: 'Tùy Biến (Custom Script)',
                    desc: 'Tự đặt điều kiện đơn giản cho nhân vật. Ví dụ: Nếu Máu < 50% dùng [Hồi Máu], Nếu đối thủ bị Choáng dùng [Sát Thương].',
                    priority: 'Theo điều kiện tùy chỉnh của đạo hữu.'
                }
            ];

            const currentTactic = (typeof Game !== 'undefined') ? Game.getCombatTactic() : 'balanced';
            const customRules = (typeof Game !== 'undefined') ? Game.getCustomTacticRules() : [];

            container.innerHTML = '';
            tactics.forEach(t => {
                const isActive = currentTactic === t.id;
                const isExpanded = this.expandedTacticId === t.id;
                const item = document.createElement('div');
                item.style.background = isActive ? 'rgba(212, 175, 55, 0.1)' : '#1a1a1a';
                item.style.padding = '12px';
                item.style.borderRadius = '8px';
                item.style.border = isActive ? '1px solid #d4af37' : '1px solid #333';
                item.style.cursor = 'pointer';
                item.style.transition = 'all 0.3s ease';
                item.style.overflow = 'hidden';
                item.style.marginBottom = '8px';
                
                let content = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${isActive ? '#d4af37' : '#555'}; display: flex; align-items: center; justify-content: center;">
                                ${isActive ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: #d4af37;"></div>' : ''}
                            </div>
                            <span style="color: ${isActive ? '#d4af37' : '#fff'}; font-weight: bold; font-size: 0.85rem;">${t.name}</span>
                        </div>
                        <span style="font-size: 0.8rem; color: #666; transform: rotate(${isExpanded ? '180deg' : '0deg'}); transition: transform 0.3s;">▼</span>
                    </div>
                `;

                if (isExpanded) {
                    content += `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #444; animation: fadeIn 0.3s;">
                            <p style="font-size: 0.7rem; color: #ccc; margin-bottom: 8px; line-height: 1.4;">${t.desc}</p>
                            <p style="font-size: 0.7rem; color: #d4af37; font-weight: 500; margin-bottom: 12px;">Ưu tiên: ${t.priority}</p>
                            
                            ${t.id === 'custom' ? `
                                <div id="custom-rules-container" style="background: #000; padding: 10px; borderRadius: 6px; border: 1px solid #333; margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <h6 style="color: #d4af37; font-size: 0.7rem; margin: 0;">LẬP TRÌNH CHIẾN THUẬT:</h6>
                                        ${customRules.length > 0 ? `<button id="clear-rules-btn" style="background: none; border: none; color: #ff4444; font-size: 0.6rem; cursor: pointer; text-decoration: underline;">Xóa tất cả</button>` : ''}
                                    </div>
                                    <p style="font-size: 0.6rem; color: #888; margin-bottom: 10px; font-style: italic;">* Thứ tự từ trên xuống dưới thể hiện mức độ ưu tiên (Quy tắc phía trên sẽ được xét trước).</p>
                                    <div id="rules-list" style="display: flex; flex-direction: column; gap: 8px;">
                                        ${customRules.map((rule, index) => `
                                            <div style="display: flex; flex-direction: column; gap: 4px; background: #1a1a1a; padding: 8px; border-radius: 6px; border: 1px solid #333; position: relative; padding-left: 24px;">
                                                <div style="position: absolute; left: 6px; top: 8px; color: #d4af37; font-weight: bold; font-size: 0.7rem;">${index + 1}.</div>
                                                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: #fff; padding-right: 20px;">
                                                    <span style="color: #888;">Nếu</span>
                                                    <select class="rule-condition" data-index="${index}" style="background: #333; color: #fff; border: 1px solid #444; font-size: 0.6rem; padding: 2px; flex: 1; min-width: 0;">
                                                        <option value="hp_low" ${rule.condition === 'hp_low' ? 'selected' : ''}>Máu bản thân <</option>
                                                        <option value="enemy_hp_low" ${rule.condition === 'enemy_hp_low' ? 'selected' : ''}>Máu đối thủ <</option>
                                                        <option value="mp_low" ${rule.condition === 'mp_low' ? 'selected' : ''}>Linh lực bản thân <</option>
                                                        <option value="battle_start" ${rule.condition === 'battle_start' ? 'selected' : ''}>Bắt đầu trận chiến</option>
                                                        <option value="enemy_cc" ${rule.condition === 'enemy_cc' ? 'selected' : ''}>Địch bị Khống chế</option>
                                                        <option value="enemy_cc_end" ${rule.condition === 'enemy_cc_end' ? 'selected' : ''}>Địch hết Khống chế</option>
                                                        <option value="enemy_debuff_end" ${rule.condition === 'enemy_debuff_end' ? 'selected' : ''}>Địch hết Hiệu ứng xấu</option>
                                                        <option value="enemy_atk_up" ${rule.condition === 'enemy_atk_up' ? 'selected' : ''}>Địch tăng Tấn công</option>
                                                        <option value="enemy_def_up" ${rule.condition === 'enemy_def_up' ? 'selected' : ''}>Địch tăng Phòng thủ</option>
                                                        <option value="player_atk_down" ${rule.condition === 'player_atk_down' ? 'selected' : ''}>Bản thân bị giảm Tấn công</option>
                                                        <option value="enemy_charging" ${rule.condition === 'enemy_charging' ? 'selected' : ''}>Địch đang Tụ lực</option>
                                                    </select>
                                                    ${(rule.condition === 'hp_low' || rule.condition === 'enemy_hp_low' || rule.condition === 'mp_low') ? `
                                                        <input type="number" class="rule-threshold" data-index="${index}" value="${rule.threshold || 50}" style="width: 30px; background: #333; color: #fff; border: 1px solid #444; font-size: 0.6rem; padding: 2px;" />
                                                        <span style="font-size: 0.6rem;">%</span>
                                                    ` : ''}
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: #fff; padding-right: 20px;">
                                                    <span style="color: #888;">thì dùng</span>
                                                    <select class="rule-action" data-index="${index}" style="background: #333; color: #fff; border: 1px solid #444; font-size: 0.6rem; padding: 2px; flex: 1;">
                                                        <option value="defense" ${rule.action === 'defense' ? 'selected' : ''}>[Phòng Thủ]</option>
                                                        <option value="control" ${rule.action === 'control' ? 'selected' : ''}>[Khống Chế]</option>
                                                        <option value="attack" ${rule.action === 'attack' ? 'selected' : ''}>[Sát Thương]</option>
                                                        <option value="buff" ${rule.action === 'buff' ? 'selected' : ''}>[Buff]</option>
                                                        <option value="debuff" ${rule.action === 'debuff' ? 'selected' : ''}>[Debuff]</option>
                                                    </select>
                                                </div>
                                                <button class="remove-rule-btn" data-index="${index}" style="position: absolute; top: 50%; right: 6px; transform: translateY(-50%); background: rgba(255, 68, 68, 0.2); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; width: 22px; height: 22px; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: all 0.2s;">×</button>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <button id="add-rule-btn" ${customRules.length >= 10 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="width: 100%; margin-top: 8px; padding: 6px; font-size: 0.65rem; background: #1a1a1a; color: #d4af37; border: 1px dashed #d4af37; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
                                        ${customRules.length >= 10 ? 'Đã đạt giới hạn 10 điều kiện' : '+ Thêm điều kiện mới'}
                                    </button>
                                </div>
                            ` : ''}

                            ${!isActive ? `
                                <button class="confirm-tactic-btn" data-id="${t.id}" style="width: 100%; padding: 8px; font-size: 0.75rem; background: #d4af37; color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
                                    XÁC NHẬN CHIẾN THUẬT
                                </button>
                            ` : `
                                <div style="text-align: center; color: #4caf50; font-size: 0.7rem; font-weight: bold; padding: 8px; background: rgba(76, 175, 80, 0.1); border-radius: 4px;">
                                    ✓ ĐANG SỬ DỤNG
                                </div>
                            `}
                        </div>
                    `;
                } else {
                    content += `
                        <p style="font-size: 0.6rem; color: #666; margin-top: 4px; font-style: italic;">Nhấn vào để xem thông tin chi tiết</p>
                    `;
                }

                item.innerHTML = content;

                // Ngăn chặn sự kiện click lan tỏa khi nhấn vào các input/select bên trong
                item.querySelectorAll('select, input, button').forEach(el => {
                    el.onclick = (e) => e.stopPropagation();
                });

                // Xử lý các nút trong Chế độ Tùy Biến
                if (isExpanded && t.id === 'custom') {
                    const clearBtn = item.querySelector('#clear-rules-btn');
                    if (clearBtn) {
                        clearBtn.onclick = (e) => {
                            e.stopPropagation();
                            // Thay thế confirm bằng UI tùy chỉnh
                            this.openModal("XÁC NHẬN XÓA", `
                                <div style="text-align: center; padding: 10px;">
                                    <p style="color: #fff; margin-bottom: 20px;">Đạo hữu có chắc chắn muốn xóa tất cả các quy tắc chiến thuật tùy biến không?</p>
                                    <div style="display: flex; gap: 10px; justify-content: center;">
                                        <button id="confirm-clear-btn" style="padding: 8px 20px; background: #ff4444; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">XÓA TẤT CẢ</button>
                                        <button id="cancel-clear-btn" style="padding: 8px 20px; background: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer;">HỦY</button>
                                    </div>
                                </div>
                            `, false);

                            // Đợi modal render xong rồi gán sự kiện
                            setTimeout(() => {
                                const confirmBtn = document.getElementById('confirm-clear-btn');
                                const cancelBtn = document.getElementById('cancel-clear-btn');
                                if (confirmBtn) {
                                    confirmBtn.onclick = () => {
                                        Game.setCustomTacticRules([]);
                                        this.renderBattleSettingsTab(proxy);
                                        const modal = document.getElementById('info-modal');
                                        if (modal) modal.style.display = 'none';
                                    };
                                }
                                if (cancelBtn) {
                                    cancelBtn.onclick = () => {
                                        const modal = document.getElementById('info-modal');
                                        if (modal) modal.style.display = 'none';
                                    };
                                }
                            }, 100);
                        };
                    }

                    const addBtn = item.querySelector('#add-rule-btn');
                    if (addBtn && customRules.length < 10) {
                        addBtn.onclick = (e) => {
                            e.stopPropagation();
                            const rules = [...customRules, { condition: 'hp_low', threshold: 50, action: 'defense' }];
                            Game.setCustomTacticRules(rules);
                            this.renderBattleSettingsTab(proxy);
                        };
                    }

                    item.querySelectorAll('.remove-rule-btn').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            const index = parseInt(btn.getAttribute('data-index'));
                            const rules = customRules.filter((_, i) => i !== index);
                            Game.setCustomTacticRules(rules);
                            this.renderBattleSettingsTab(proxy);
                        };
                    });

                    item.querySelectorAll('.rule-condition, .rule-action, .rule-threshold').forEach(el => {
                        el.onchange = (e) => {
                            const index = parseInt(el.getAttribute('data-index'));
                            const rules = [...customRules];
                            const field = el.classList.contains('rule-condition') ? 'condition' : 
                                         el.classList.contains('rule-action') ? 'action' : 'threshold';
                            
                            rules[index][field] = field === 'threshold' ? parseInt(e.target.value) : e.target.value;
                            Game.setCustomTacticRules(rules);
                            this.renderBattleSettingsTab(proxy);
                        };
                    });
                }

                const confirmBtn = item.querySelector('.confirm-tactic-btn');
                if (confirmBtn) {
                    confirmBtn.onclick = (e) => {
                        e.stopPropagation();
                        const tacticId = confirmBtn.getAttribute('data-id');
                        if (typeof Game !== 'undefined') {
                            Game.setCombatTactic(tacticId);
                            this.addLog(`⚔️ Đã chuyển sang chiến thuật: <b>${t.name}</b>`);
                            this.renderBattleSettingsTab(proxy);
                        }
                    };
                }

                if (!item.onclick) {
                    item.onclick = () => {
                        this.expandedTacticId = (this.expandedTacticId === t.id) ? null : t.id;
                        this.renderBattleSettingsTab(proxy);
                    };
                }

                container.appendChild(item);
            });
        },

        modalHistory: [],
        onClose: null,

        generateNPCName: function() {
            const surnames = GameData.npcNames.surnames;
            const middle = GameData.npcNames.middle;
            const last = GameData.npcNames.last;
            const s = surnames[Math.floor(Math.random() * surnames.length)];
            const m = middle[Math.floor(Math.random() * middle.length)];
            const l = last[Math.floor(Math.random() * last.length)];
            return s + " " + m + " " + l;
        },
        showMeetingEvent: function(npcName, sectName, scenarioType, npcRank, onInteract) {
            const scenarios = {
                "cultivating": {
                    title: "GẶP MẶT TU SĨ",
                    desc: `Bạn bắt gặp <b>${npcName}</b> (${npcRank}) của <b>${sectName}</b> đang tọa thiền tu luyện, linh khí xung quanh dao động mạnh.`,
                    icon: "🧘",
                    color: "#4caf50"
                },
                "passing": {
                    title: "TÌNH CỜ GẶP GỠ",
                    desc: `Bạn tình cờ đi ngang qua <b>${npcName}</b> (${npcRank}) của <b>${sectName}</b>, người này khẽ gật đầu chào bạn.`,
                    icon: "🚶",
                    color: "#2196f3"
                },
                "fighting": {
                    title: "CHỨNG KIẾN CHIẾN ĐẤU",
                    desc: `Bạn thấy <b>${npcName}</b> (${npcRank}) của <b>${sectName}</b> đang kịch chiến với một con yêu thú hung hãn.`,
                    icon: "⚔️",
                    color: "#ff9800"
                },
                "fleeing": {
                    title: "GẶP KẺ ĐANG CHẠY TRỐN",
                    desc: `Bạn bắt gặp <b>${npcName}</b> (${npcRank}) của <b>${sectName}</b> đang hớt hải chạy trốn, dường như đang bị thứ gì đó đáng sợ truy đuổi.`,
                    icon: "🏃",
                    color: "#f44336"
                }
            };

            const scenario = scenarios[scenarioType] || scenarios["passing"];
            
            const content = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 3rem; margin-bottom: 15px; animation: float 3s ease-in-out infinite;">${scenario.icon}</div>
                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; box-shadow: inset 0 0 15px rgba(0,0,0,0.2);">
                        <p style="color: #eee; font-size: 0.9rem; line-height: 1.6; margin: 0;">
                            ${scenario.desc}
                        </p>
                    </div>
                    <div style="color: #888; font-size: 0.75rem; margin-bottom: 15px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold;">
                        — LỰA CHỌN HÀNH ĐỘNG —
                    </div>
                </div>
            `;

            this.openModal(scenario.title, content);
            const ctrl = document.getElementById('modal-controls');
            if (ctrl) {
                ctrl.innerHTML = ''; 
                ctrl.style.display = "grid";
                ctrl.style.gridTemplateColumns = "repeat(2, 1fr)";
                ctrl.style.gap = "8px";
                ctrl.style.padding = "0 10px 10px";
                
                const buttons = [
                    { id: 'talk', text: '💬 NÓI CHUYỆN', color: '#4caf50', action: 'talk' },
                    { id: 'gift', text: '🎁 TẶNG QUÀ', color: '#ffeb3b', action: 'gift' }
                ];

                // Thêm nút Đánh Lén nếu đang tu luyện, ngược lại thêm nút Tấn Công thường
                if (scenarioType === 'cultivating') {
                    buttons.push({ id: 'sneak', text: '🗡️ ĐÁNH LÉN', color: '#e91e63', action: 'sneak_attack' });
                } else {
                    buttons.push({ id: 'attack', text: '⚔️ TẤN CÔNG', color: '#ff4444', action: 'attack' });
                }

                buttons.push({ id: 'ignore', text: '🚶 RỜI ĐI', color: '#888', action: 'ignore' });

                buttons.forEach(btn => {
                    const b = document.createElement('button');
                    b.className = "btn-main";
                    b.innerHTML = btn.text;
                    b.style.background = "#1a1a1a";
                    b.style.border = `1px solid ${btn.color}88`;
                    b.style.color = btn.color;
                    b.style.fontSize = "0.8rem";
                    b.style.padding = "12px 4px";
                    b.style.margin = "0";
                    b.style.fontWeight = "bold";
                    b.style.borderRadius = "6px";
                    b.style.transition = "all 0.2s ease";
                    b.style.boxShadow = `0 2px 4px rgba(0,0,0,0.3)`;
                    
                    b.onmouseover = () => {
                        b.style.background = `${btn.color}22`;
                        b.style.transform = "translateY(-2px)";
                        b.style.boxShadow = `0 4px 8px ${btn.color}33`;
                    };
                    b.onmouseout = () => {
                        b.style.background = "#1a1a1a";
                        b.style.transform = "translateY(0)";
                        b.style.boxShadow = `0 2px 4px rgba(0,0,0,0.3)`;
                    };

                    b.onclick = () => {
                        onInteract(btn.action);
                    };
                    ctrl.appendChild(b);
                });
            }
        },

        handleMeetingInteraction: function(npcName, sectName, scenarioType, npcRank, choice) {
            const proxy = Game.getProxy();
            
            if (choice === "ignore") {
                this.closeModal();
                this.addLog(`Bạn lẳng lặng rời đi, không làm phiền <b>${npcName}</b> của <b>${sectName}</b>.`);
                return;
            }

            if (choice === "attack") {
                this.addLog(`⚠️ Bạn chủ động tấn công <b>${npcName}</b> của <b>${sectName}</b>!`, true);
                this.startNPCBattle(npcName, sectName, npcRank);
                return;
            }

            if (choice === "talk") {
                const sectId = Object.keys(GameData.sects).find(id => GameData.sects[id].name === sectName);
                const sect = sectId ? GameData.sects[sectId] : null;
                const isEvil = sect && sect.alignment === "evil";
                
                const rand = Math.random();
                let content = "";
                
                // Tà phái có xu hướng bạo lực hơn (tăng tỉ lệ tấn công)
                const attackChance = isEvil ? 0.6 : 0.3;
                const giftChance = isEvil ? 0.1 : 0.3;
                
                if (rand < (1 - attackChance - giftChance)) {
                    const exp = 100 + (proxy.rankIndex * 50);
                    Game.addExp(exp);
                    if (isEvil) {
                        content = `Bạn và <b>${npcName}</b> trao đổi vài câu. Người này cười lạnh lùng, buông vài lời đe dọa nhưng cũng vô tình lộ ra vài bí quyết tu luyện tà môn.<br><br><span style="color: #4caf50;">+${exp} Linh khí</span>`;
                    } else {
                        content = `Bạn và <b>${npcName}</b> trao đổi vài câu về võ học. Người này tỏ ra khá thân thiện và chỉ điểm cho bạn một vài kinh nghiệm.<br><br><span style="color: #4caf50;">+${exp} Linh khí</span>`;
                    }
                    this.addLog(`Bạn đàm đạo với <b>${npcName}</b>, nhận được một ít kinh nghiệm tu luyện.`);
                } else if (rand < (1 - attackChance)) {
                    const stones = 200 + (proxy.rankIndex * 100);
                    proxy.spiritStone += stones;
                    if (isEvil) {
                        content = `<b>${npcName}</b> ném cho bạn một túi linh thạch với vẻ khinh khỉnh: "Cầm lấy mà cút đi, đừng để ta thấy mặt ngươi lần nữa!"<br><br><span style="color: #ffeb3b;">+${stones} Linh Thạch</span>`;
                    } else {
                        content = `<b>${npcName}</b> cảm thấy bạn có duyên, liền tặng bạn một ít Linh Thạch làm lộ phí.<br><br><span style="color: #ffeb3b;">+${stones} Linh Thạch</span>`;
                    }
                    this.addLog(`<b>${npcName}</b> tặng bạn <b>${stones}</b> Linh Thạch.`);
                } else {
                    if (isEvil) {
                        content = `<b>${npcName}</b> cười gằn: "Gặp được ta là cái xui của ngươi! Để lại mạng sống và bảo vật rồi ta sẽ cho ngươi toàn thây!" nói đoạn liền lao vào tấn công!`;
                    } else {
                        content = `<b>${npcName}</b> bỗng nhiên biến sắc, rút vũ khí ra tấn công bạn! Có vẻ như người này không muốn bị làm phiền hoặc có ý đồ xấu.`;
                    }
                    this.addLog(`⚠️ <b>${npcName}</b> của <b>${sectName}</b> tấn công bạn!`, true);
                    this.startNPCBattle(npcName, sectName, npcRank);
                }
                this.openModal("KẾT QUẢ NÓI CHUYỆN", `<div style="text-align: center; padding: 10px;">${content}</div>`);
                return;
            }

            if (choice === "gift") {
                this.showGiftSelection(npcName, sectName, npcRank);
                return;
            }

            if (choice === "sneak_attack") {
                this.handleSneakAttack(npcName, sectName, npcRank);
                return;
            }
        },

        handleSneakAttack: function(npcName, sectName, npcRank) {
            const proxy = Game.getProxy();
            const totals = Game.getTotals();
            
            // Tính tỉ lệ thành công
            // Cơ bản 30% + (May mắn / 10) + (Lực chiến chênh lệch * 20)
            const luckBonus = (proxy.luk || 0) / 10;
            const powerRatio = totals.power / (100 + proxy.rankIndex * 500); // Ước lượng LC đối thủ
            const successChance = Math.max(1, Math.min(99, 30 + luckBonus + (powerRatio * 20)));
            
            const isSuccess = Math.random() * 100 < successChance;
            let content = "";
            let initialDamage = 0;

            if (isSuccess) {
                // Thành công: Gây sát thương lớn (200% - 400% ATK)
                initialDamage = Math.floor(totals.totalAtk * (2 + Math.random() * 2));
                content = `
                    <div style="color: #4caf50; font-weight: bold; margin-bottom: 10px;">🗡️ ĐÁNH LÉN THÀNH CÔNG!</div>
                    Bạn lặng lẽ tiếp cận <b>${npcName}</b> khi người này đang tập trung tu luyện. 
                    Một đòn chí mạng giáng xuống khiến đối phương trọng thương trước khi kịp phản ứng!
                    <br><br><span style="color: #ff4444;">Gây ${initialDamage} sát thương khởi đầu!</span>
                `;
                this.addLog(`Bạn đánh lén thành công <b>${npcName}</b>, gây <b>${initialDamage}</b> sát thương!`, "success");
            } else {
                // Thất bại: Bị phát hiện, đối phương phản công (vào trận bình thường)
                content = `
                    <div style="color: #f44336; font-weight: bold; margin-bottom: 10px;">❌ ĐÁNH LÉN THẤT BẠI!</div>
                    Vừa định ra tay, <b>${npcName}</b> bỗng mở mắt, linh khí bùng nổ đẩy lùi bạn. 
                    Đối phương đã phát hiện ý đồ xấu xa của bạn và lập tức phản công!
                `;
                this.addLog(`Bạn đánh lén thất bại <b>${npcName}</b> và bị phát hiện!`, "danger");
            }

            this.openModal("KẾT QUẢ ĐÁNH LÉN", `<div style="text-align: center; padding: 10px;">${content}</div>`);
            this.modalHistory = []; // Xóa lịch sử để khi đóng (X hoặc overlay) luôn gọi closeModal
            
            // Đảm bảo bất kể đóng modal bằng cách nào (X, overlay, nút) đều vào chiến đấu
            this.onClose = () => {
                this.startNPCBattle(npcName, sectName, npcRank, initialDamage);
            };

            // Thêm nút CHIẾN ĐẤU thủ công để người chơi chủ động vào trận
            const ctrl = document.getElementById('modal-controls');
            if (ctrl) {
                ctrl.innerHTML = '';
                const battleBtn = document.createElement('button');
                battleBtn.className = "btn-main";
                battleBtn.style.background = "#ff4444";
                battleBtn.style.color = "#fff";
                battleBtn.style.border = "1px solid #ff0000";
                battleBtn.style.fontWeight = "bold";
                battleBtn.style.width = "100%";
                battleBtn.innerText = "⚔️ BẮT ĐẦU CHIẾN ĐẤU";
                battleBtn.onclick = () => {
                    this.closeModal();
                };
                ctrl.appendChild(battleBtn);
            }
        },

        startNPCBattle: function(npcName, sectName, npcRank, initialDamage = 0) {
            const proxy = Game.getProxy();
            if (typeof Game !== 'undefined') Game.isInBattle = true;
            this.onClose = null; // Tránh gọi lại từ closeModal
            this.closeModal();
            
            setTimeout(() => {
                let enemyKey = "sect_disciple";
                if (npcRank.includes("Tinh Anh")) enemyKey = "sect_elite_disciple";
                if (npcRank.includes("Trưởng Lão")) enemyKey = "sect_elder";

                const r = Math.random();
                let rankOffset = 0;
                
                // Nếu có linh thú xuất chiến, tỉ lệ thay đổi: 70% hơn 1 cấp, 30% bằng cấp
                if (proxy.activePetId) {
                    if (r < 0.7) rankOffset = 1; // 70% hơn 1 tiểu cảnh giới
                    else rankOffset = 0; // 30% bằng cảnh giới
                } else {
                    // Tỉ lệ bình thường khi không có linh thú
                    if (r < 0.2) rankOffset = -1; // 20% dưới 1 tiểu cảnh giới
                    else if (r < 0.6) rankOffset = 0; // 40% bằng cảnh giới
                    else rankOffset = 1; // 40% hơn 1 tiểu cảnh giới
                }

                let enemyRankIndex = proxy.rankIndex + rankOffset;
                
                // Giới hạn không vượt quá cảnh giới tối đa và không nhỏ hơn 0
                if (enemyRankIndex >= GameData.ranks.length) enemyRankIndex = GameData.ranks.length - 1;
                if (enemyRankIndex < 0) enemyRankIndex = 0;

                // Không được cao hơn đại cảnh giới hiện tại của người chơi
                const playerMajorRank = (typeof Game !== 'undefined' && Game.getMajorRankIndex) ? Game.getMajorRankIndex(proxy.rankIndex) : 0;
                
                // Nếu vượt quá đại cảnh giới, lùi lại cho đến khi bằng đại cảnh giới của người chơi
                while (enemyRankIndex > 0 && Game.getMajorRankIndex(enemyRankIndex) > playerMajorRank) {
                    enemyRankIndex--;
                }

                const enemyData = GameData.enemies[enemyKey];
                const rankMult = (typeof Game !== 'undefined' && Game.getRankMultiplier) ? Game.getRankMultiplier(enemyRankIndex) : (1 + enemyRankIndex * 0.1);
                
                // Đảm bảo không yếu hơn chỉ số cơ bản của nhân vật đó (rankMult >= 1.0 vì rankIndex >= 0)
                const baseHp = Math.floor(enemyData.hp * rankMult);
                
                // --- XỬ LÝ KỸ NĂNG NPC ---
                const allSkills = Object.values(GameData.skills);
                const sectId = Object.keys(GameData.sects).find(id => GameData.sects[id].name === sectName);
                const sectSkills = sectId ? GameData.sects[sectId].skills.map(sid => GameData.skills[sid]).filter(s => s) : [];
                
                let pickedSkills = [];
                let sectSkillCount = 1;
                if (npcRank.includes("Tinh Anh")) sectSkillCount = 2;
                if (npcRank.includes("Trưởng Lão")) sectSkillCount = 3;

                const rankMap = ["Phàm Cấp", "Linh Cấp", "Địa Cấp", "Thiên Cấp", "Thần Cấp"];
                const rankMapLower = rankMap.map(r => r.toLowerCase());
                
                // Cân bằng lại: Luyện Khí (<11) -> Phàm/Linh, Trúc Cơ (11-13) -> Địa, Kết Đan (14-16) -> Thiên, Nguyên Anh+ (17+) -> Thần
                let npcRankLevel = 0;

                if (enemyRankIndex < 2) {
                    npcRankLevel = 0;
                } else if (enemyRankIndex < 11) {
                    npcRankLevel = 1;
                } else if (enemyRankIndex < 14) {
                    npcRankLevel = 2;
                } else if (enemyRankIndex < 17) {
                    npcRankLevel = 3;
                } else {
                    npcRankLevel = 4;
                }

                const targetRank = rankMap[npcRankLevel];

                // Chọn kỹ năng môn phái (Lọc theo rank để tránh Luyện Khí dùng Địa Cấp)
                const availableSectSkills = sectSkills.filter(s => {
                    if (!s.rank) return true;
                    const skillLevel = rankMapLower.indexOf(s.rank.toLowerCase());
                    // Đệ tử thường: chỉ dùng kỹ năng <= rank hiện tại
                    // Tinh anh/Trưởng lão: có thể dùng kỹ năng cao hơn 1 bậc nếu cần
                    const maxAllowedLevel = (npcRank.includes("Tinh Anh") || npcRank.includes("Trưởng Lão")) ? npcRankLevel + 1 : npcRankLevel;
                    return skillLevel !== -1 && skillLevel <= maxAllowedLevel;
                });
                
                // Phân loại kỹ năng môn phái
                const sectAttackPool = availableSectSkills.filter(s => s.type === "active" && (s.damageMult || 0) > 0);
                const sectSupportPool = availableSectSkills.filter(s => s.type === "passive" || (s.type === "active" && (s.damageMult || 0) === 0));

                // Chọn kỹ năng môn phái
                let sectPicked = [];
                // Ưu tiên 1 kỹ năng tấn công
                if (sectAttackPool.length > 0) {
                    const idx = Math.floor(Math.random() * sectAttackPool.length);
                    sectPicked.push(sectAttackPool[idx]);
                }
                
                // Các kỹ năng môn phái còn lại ưu tiên hỗ trợ/bị động (hào quang)
                let remainingSect = sectSkillCount - sectPicked.length;
                let supportPool = [...sectSupportPool];
                for (let i = 0; i < remainingSect; i++) {
                    if (supportPool.length > 0) {
                        const idx = Math.floor(Math.random() * supportPool.length);
                        sectPicked.push(supportPool.splice(idx, 1)[0]);
                    } else {
                        // Nếu hết kỹ năng hỗ trợ thì mới lấy thêm tấn công
                        const fallback = sectAttackPool.filter(s => !sectPicked.includes(s));
                        if (fallback.length > 0) {
                            const idx = Math.floor(Math.random() * fallback.length);
                            sectPicked.push(fallback[idx]);
                        }
                    }
                }
                pickedSkills = [...sectPicked];

                // Chọn 1 kỹ năng ngẫu nhiên (tùy sức mạnh)
                const generalSkills = allSkills.filter(s => (s.type === "active" || s.type === "passive") && !s.sectId && s.id.startsWith("skill_") && !s.id.includes("pet_") && !s.id.includes("boss_") && !s.isMonsterSkill);
                if (generalSkills.length > 0) {
                    const appropriateSkills = generalSkills.filter(s => {
                        if (!s.rank) return true;
                        const skillLevel = rankMapLower.indexOf(s.rank.toLowerCase());
                        return skillLevel !== -1 && skillLevel <= npcRankLevel;
                    });
                    
                    const pool = appropriateSkills.length > 0 ? appropriateSkills : generalSkills;
                    // Ưu tiên chọn kỹ năng bị động/hào quang cho slot ngẫu nhiên này nếu đã có kỹ năng tấn công
                    const hasAttack = pickedSkills.some(s => s.type === "active" && (s.damageMult || 0) > 0);
                    
                    let finalPool = pool;
                    if (hasAttack) {
                        const supportPool = pool.filter(s => s.type === "passive" || (s.type === "active" && (s.damageMult || 0) === 0));
                        if (supportPool.length > 0) finalPool = supportPool;
                    }
                    
                    pickedSkills.push(finalPool[Math.floor(Math.random() * finalPool.length)]);
                }

                // Đảm bảo có ít nhất 1 kỹ năng chủ động
                if (pickedSkills.length > 0) {
                    // No longer need to ensure active skill as we only picked active ones
                }

                const rankTitle = (npcRank || "").toString().includes("Trưởng Lão") ? "Trưởng Lão" : ((npcRank || "").toString().includes("Tinh Anh") ? "Đệ Tử Tinh Anh" : "Đệ Tử");
                const baseMp = Math.floor((enemyData.mp || 100) * rankMult);
                const baseStamina = 100 + ((typeof Game !== 'undefined' && Game.getMajorRankIndex) ? Game.getMajorRankIndex(enemyRankIndex) : 0) * 10;
                const rankName = GameData.ranks[enemyRankIndex] ? GameData.ranks[enemyRankIndex].name : "Vô Danh";
 
                // Thiết lập Linh khí (EXP) cố định theo cấp bậc
                let finalExp = 100;
                if (rankTitle === "Đệ Tử Tinh Anh") finalExp = 300;
                if (rankTitle === "Trưởng Lão") finalExp = 1400;
 
                // Thiết lập rơi vật phẩm (Drops) theo yêu cầu
                const drops = [];
                const pillPool = ["hp_pill_1", "qi_pill", "mp_pill_1"];
                const randomPill = pillPool[Math.floor(Math.random() * pillPool.length)];
 
                if (rankTitle === "Trưởng Lão") {
                    // 40% rơi đan dược
                    drops.push({ id: randomPill, chance: 0.4, count: 1 });
                    // 20% rơi bí tịch ngẫu nhiên môn phái
                    if (sectSkills.length > 0) {
                        const randomSectSkill = sectSkills[Math.floor(Math.random() * sectSkills.length)];
                        // Tìm bí tịch tương ứng
                        const book = Object.values(GameData.items).find(it => it.type === "skill_book" && it.skillId === randomSectSkill.id);
                        if (book) drops.push({ id: book.id, chance: 0.2, count: 1 });
                    }
                    // 20% rơi trang bị trong cửa hàng môn phái
                    if (sectId && GameData.sects[sectId].shop) {
                        const shopItems = GameData.sects[sectId].shop.filter(sid => {
                            const it = GameData.items[sid];
                            return it && it.type === "equipment";
                        });
                        if (shopItems.length > 0) {
                            drops.push({ id: shopItems[Math.floor(Math.random() * shopItems.length)], chance: 0.2, count: 1 });
                        }
                    }
                } else if (rankTitle === "Đệ Tử Tinh Anh") {
                    // 35% rơi đan dược
                    drops.push({ id: randomPill, chance: 0.35, count: 1 });
                    // 15% rơi bí tịch bị động cấp thấp môn phái
                    const lowPassiveSkills = sectSkills.filter(s => s.type === "passive" && (!s.rank || s.rank === "Phàm Cấp" || s.rank === "Linh Cấp"));
                    if (lowPassiveSkills.length > 0) {
                        const skill = lowPassiveSkills[Math.floor(Math.random() * lowPassiveSkills.length)];
                        const book = Object.values(GameData.items).find(it => it.type === "skill_book" && it.skillId === skill.id);
                        if (book) drops.push({ id: book.id, chance: 0.15, count: 1 });
                    }
                    // 15% rơi trang bị cấp thấp trong cửa hàng môn phái
                    if (sectId && GameData.sects[sectId].shop) {
                        const lowEquips = GameData.sects[sectId].shop.filter(sid => {
                            const it = GameData.items[sid];
                            return it && it.type === "equipment" && (it.rarity === "common" || it.rarity === "uncommon");
                        });
                        if (lowEquips.length > 0) {
                            drops.push({ id: lowEquips[Math.floor(Math.random() * lowEquips.length)], chance: 0.15, count: 1 });
                        }
                    }
                } else {
                    // Đệ tử thường
                    // 30% rơi đan dược
                    drops.push({ id: randomPill, chance: 0.3, count: 1 });
                    // 10% rơi bí tịch bị động cấp thấp môn phái
                    const lowPassiveSkills = sectSkills.filter(s => s.type === "passive" && (!s.rank || s.rank === "Phàm Cấp" || s.rank === "Linh Cấp"));
                    if (lowPassiveSkills.length > 0) {
                        const skill = lowPassiveSkills[Math.floor(Math.random() * lowPassiveSkills.length)];
                        const book = Object.values(GameData.items).find(it => it.type === "skill_book" && it.skillId === skill.id);
                        if (book) drops.push({ id: book.id, chance: 0.1, count: 1 });
                    }
                    // 10% rơi trang bị cấp thấp trong cửa hàng môn phái
                    if (sectId && GameData.sects[sectId].shop) {
                        const lowEquips = GameData.sects[sectId].shop.filter(sid => {
                            const it = GameData.items[sid];
                            return it && it.type === "equipment" && (it.rarity === "common" || it.rarity === "uncommon");
                        });
                        if (lowEquips.length > 0) {
                            drops.push({ id: lowEquips[Math.floor(Math.random() * lowEquips.length)], chance: 0.1, count: 1 });
                        }
                    }
                }
 
                // Thêm tỷ lệ rơi trang bị bất kỳ tại map hiện tại (Tăng phần thưởng tỷ lệ với rủi ro)
                if (typeof ExploreSystem !== 'undefined' && ExploreSystem.isExploring()) {
                    const currentLoc = ExploreSystem.getCurrentLoc();
                    if (currentLoc && currentLoc.drops) {
                        const mapEquips = currentLoc.drops.filter(sid => {
                            const it = GameData.items[sid];
                            return it && it.type === "equipment";
                        });
                        if (mapEquips.length > 0) {
                            const randomMapEquip = mapEquips[Math.floor(Math.random() * mapEquips.length)];
                            let mapEquipChance = 0.1; // Đệ tử
                            if (rankTitle === "Đệ Tử Tinh Anh") mapEquipChance = 0.15;
                            if (rankTitle === "Trưởng Lão") mapEquipChance = 0.2;
                            drops.push({ id: randomMapEquip, chance: mapEquipChance, count: 1 });
                        }
                    }
                }
 
                const enemy = {
                    ...enemyData,
                    name: `${npcName} (${sectName}) - ${rankTitle} [${rankName}]`,
                    maxHp: baseHp,
                    hp: Math.max(1, baseHp - initialDamage),
                    maxMp: baseMp,
                    currentMp: baseMp,
                    maxStamina: baseStamina,
                    stamina: baseStamina,
                    atk: Math.floor(enemyData.atk * rankMult),
                    def: Math.floor(enemyData.def * rankMult),
                    thanphap: Math.floor(enemyData.thanphap * rankMult),
                    exp: finalExp,
                    rankIndex: enemyRankIndex,
                    skills: pickedSkills,
                    drops: drops,
                    desc: `${rankTitle} chính tông của môn phái ${sectName}.`
                };

                // Áp dụng chỉ số từ kỹ năng bị động cho NPC
                pickedSkills.forEach(s => {
                    if (s.type === "passive" && s.buff) {
                        const b = s.buff;
                        // Áp dụng buff theo tỷ lệ phần trăm (vì các chỉ số NPC đã được scale theo rankIndex)
                        if (b.atk) enemy.atk += Math.floor(enemy.atk * (b.atk / 100));
                        if (b.def) enemy.def += Math.floor(enemy.def * (b.def / 100));
                        if (b.hpMax || b.hp) {
                            const hpBonus = Math.floor(enemy.maxHp * ((b.hpMax || b.hp) / 100));
                            enemy.maxHp += hpBonus;
                            enemy.hp += hpBonus;
                        }
                        if (b.mp || b.mana) {
                            const mpBonus = Math.floor(enemy.maxMp * ((b.mp || b.mana) / 100));
                            enemy.maxMp += mpBonus;
                            enemy.currentMp += mpBonus;
                        }
                        if (b.thanphap) enemy.thanphap += Math.floor(enemy.thanphap * (b.thanphap / 100));
                    }
                });

                // Khởi tạo hệ thống hộ thể (Shield) cho NPC
                // Tối đa 50% Linh lực, khi vào trận nhận 10% maxShield
                enemy.maxShield = Math.floor(enemy.maxMp * 0.5);
                enemy.shield = Math.floor(enemy.maxShield * 0.1);

                // --- DYNAMIC RANK SCALING ---
                if (typeof Game !== 'undefined' && Game.getEffectiveRank) {
                    const effectiveRankIndex = Game.getEffectiveRank(enemy);
                    if (effectiveRankIndex > enemy.rankIndex) {
                        enemy.rankIndex = effectiveRankIndex;
                        const effectiveRank = GameData.ranks[effectiveRankIndex];
                        if (effectiveRank) {
                            // Cập nhật tên hiển thị để phản ánh cảnh giới mới
                            enemy.name = `${npcName} (${effectiveRank.name})`;
                        }
                    }
                }

                if (typeof BattleSystem !== 'undefined') {
                    this.showTab('battle');
                    BattleSystem.start(proxy, enemy, (win) => {
                        if (!win && typeof ExploreSystem !== 'undefined' && ExploreSystem.isExploring()) {
                            ExploreSystem.failCurrent(proxy, `bị <b>${enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name}</b> đánh bại`);
                        }
                    });
                }
            }, 800);
        },

        showGiftSelection: function(npcName, sectName, npcRank) {
            const proxy = Game.getProxy();
            const gifts = proxy.bag.filter(item => {
                const data = GameData.items[item.id];
                return data && data.type === "gift";
            });

            let content = `
                <div style="text-align: center; padding: 10px;">
                    <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 15px;">Chọn vật phẩm muốn tặng cho <b>${npcName}</b>:</p>
                    <div id="gift-list-container" style="max-height: 200px; overflow-y: auto; display: flex; flexDirection: column; gap: 8px; padding: 5px;">
            `;

            if (gifts.length === 0) {
                content += `<p style="color: #666; font-style: italic; margin-top: 20px;">Bạn không có vật phẩm quà tặng nào trong túi đồ...</p>`;
            } else {
                gifts.forEach((item, idx) => {
                    const data = GameData.items[item.id];
                    content += `
                        <div class="clickable" onclick="UI.processGift('${item.id}', '${npcName}', '${sectName}', '${npcRank}')" style="background: rgba(255,255,255,0.05); border: 1px solid #444; padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <div style="font-size: 1.5rem;">${data.icon}</div>
                            <div style="flex: 1; text-align: left;">
                                <div style="color: ${rarityColors[data.rarity]}; font-weight: bold; font-size: 0.85rem;">${data.name}</div>
                                <div style="color: #888; font-size: 0.7rem;">Số lượng: ${item.count}</div>
                            </div>
                            <div style="color: #4caf50; font-size: 0.7rem; font-weight: bold;">+${data.reputationValue} Cảm tình</div>
                        </div>
                    `;
                });
            }

            content += `</div></div>`;

            this.openModal("TẶNG QUÀ", content);
            const ctrl = document.getElementById('modal-controls');
            if (ctrl) {
                ctrl.innerHTML = '';
                const backBtn = document.createElement('button');
                backBtn.className = "btn-main btn-gray";
                backBtn.innerText = "QUAY LẠI";
                backBtn.onclick = () => {
                    this.closeModal();
                    // Re-trigger the meeting event UI
                    // We need to store the current meeting info somewhere or pass it back
                    // For now, just close is okay, or we can re-open the meeting modal
                };
                ctrl.appendChild(backBtn);
            }
        },

        processGift: function(itemId, npcName, sectName, npcRank) {
            const proxy = Game.getProxy();
            const itemData = GameData.items[itemId];
            
            if (typeof BagSystem !== 'undefined') {
                BagSystem.removeItemsById(itemId, 1);
            }
            
            const repGain = itemData.reputationValue || 10;
            // Logic: Tặng quà tăng danh vọng môn phái hoặc nhận quà đáp lễ
            const rand = Math.random();
            let rewardContent = "";
            
            if (rand < 0.7) {
                // Nhận quà đáp lễ
                const stones = (repGain * 10) + Math.floor(Math.pow(proxy.rankIndex, 1.5) * 20);
                proxy.spiritStone += stones;
                rewardContent = `<b>${npcName}</b> rất vui mừng nhận lấy <b>${itemData.name}</b>. Người này liền đáp lễ bạn một túi Linh Thạch.<br><br><span style="color: #ffeb3b;">+${stones} Linh Thạch</span>`;
                this.addLog(`Bạn tặng <b>${itemData.name}</b> cho <b>${npcName}</b>, nhận được <b>${stones}</b> Linh Thạch đáp lễ.`);
            } else {
                // Nhận bí tịch hoặc đan dược hiếm
                const curRank = GameData.ranks[proxy.rankIndex] || GameData.ranks[0];
                const exp = Math.floor(curRank.expReq * (0.05 + Math.random() * 0.1)); // 5-15% expReq
                Game.addExp(exp);
                rewardContent = `<b>${npcName}</b> vô cùng cảm kích tấm lòng của bạn. Người này đã chỉ dạy cho bạn một vài tâm pháp cao thâm.<br><br><span style="color: #4caf50;">+${exp} Linh khí</span>`;
                this.addLog(`Bạn tặng <b>${itemData.name}</b> cho <b>${npcName}</b>, nhận được rất nhiều linh khí tu luyện.`);
            }

            this.openModal("KẾT QUẢ TẶNG QUÀ", `<div style="text-align: center; padding: 10px;">${rewardContent}</div>`);
        },

        openModal: function(title, desc, isAction, index, actionType, itemId, shopInfo, isBack = false) {
            if (!isBack) {
                this.onClose = null;
            }
            console.log("UI: openModal called", { title, isAction, index, actionType, itemId });
            const modal = document.getElementById('info-modal');
            if (!modal) return;

            // Nếu không phải là quay lại, lưu trạng thái hiện tại vào lịch sử
            if (!isBack) {
                const currentTitle = document.getElementById('modal-title')?.innerHTML;
                const currentDesc = document.getElementById('modal-desc')?.innerHTML;
                const currentControls = document.getElementById('modal-controls')?.innerHTML;
                const currentDisplay = modal.style.display;

                if (currentDisplay === 'flex' && currentTitle && currentTitle !== title) {
                    this.modalHistory.push({
                        title: currentTitle,
                        desc: currentDesc,
                        controls: currentControls
                    });
                }
            }

            document.getElementById('modal-title').innerHTML = title;
            document.getElementById('modal-desc').innerHTML = desc;
            const ctrl = document.getElementById('modal-controls');
            if(ctrl) {
                ctrl.innerHTML = '';
                ctrl.style.display = 'flex'; // Reset về flex mặc định
                ctrl.style.gridTemplateColumns = 'none';
                ctrl.style.gap = '10px';

                if (isAction) {
                    if (actionType === 'buy' && shopInfo) {
                        // ... (giữ nguyên logic mua đồ)
                        const qtyContainer = document.createElement('div');
                        qtyContainer.style.cssText = "display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 6px; border: 1px solid #444;";
                        
                        const label = document.createElement('span');
                        label.innerText = "SỐ LƯỢNG:";
                        label.style.fontSize = "0.65rem";
                        label.style.color = "#aaa";
                        
                        const minusBtn = document.createElement('button');
                        minusBtn.innerText = "-";
                        minusBtn.style.cssText = "width: 20px; height: 20px; border: none; background: #444; color: #fff; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.75rem;";
                        
                        const qtyInput = document.createElement('input');
                        qtyInput.type = "number";
                        qtyInput.value = 1;
                        qtyInput.min = 1;
                        qtyInput.max = 20;
                        qtyInput.style.cssText = "width: 24px; text-align: center; background: transparent; border: none; color: #ffeb3b; font-weight: bold; font-size: 0.85rem;";
                        
                        const plusBtn = document.createElement('button');
                        plusBtn.innerText = "+";
                        plusBtn.style.cssText = "width: 20px; height: 20px; border: none; background: #444; color: #fff; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.75rem;";
                        
                        const updateCost = () => {
                            let val = parseInt(qtyInput.value) || 1;
                            if (val < 1) val = 1;
                            if (val > 20) val = 20;
                            qtyInput.value = val;
                            const total = shopInfo.finalCost * val;
                            buyBtn.innerText = `MUA (${total} ⭐)`;
                            buyBtn.disabled = (Game.getProxy().sectContribution < total);
                            if (buyBtn.disabled) buyBtn.classList.add('disabled');
                            else buyBtn.classList.remove('disabled');
                        };

                        minusBtn.onclick = () => { qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1); updateCost(); };
                        plusBtn.onclick = () => { qtyInput.value = Math.min(20, parseInt(qtyInput.value) + 1); updateCost(); };
                        qtyInput.onchange = updateCost;

                        qtyContainer.appendChild(label);
                        qtyContainer.appendChild(minusBtn);
                        qtyContainer.appendChild(qtyInput);
                        qtyContainer.appendChild(plusBtn);
                        ctrl.appendChild(qtyContainer);

                        const buyBtn = document.createElement('button'); 
                        buyBtn.className = "btn-main btn-purple";
                        buyBtn.style.flex = "1";
                        buyBtn.style.padding = "6px 12px";
                        buyBtn.style.fontSize = "0.75rem";
                        buyBtn.innerText = `MUA (${shopInfo.finalCost} ⭐)`;
                        if (!shopInfo.canAfford) {
                            buyBtn.disabled = true;
                            buyBtn.classList.add('disabled');
                        }
                        buyBtn.onclick = () => {
                            const qty = parseInt(qtyInput.value) || 1;
                            Game.buySectItem(itemId, shopInfo.cost, shopInfo.reqReputation, qty);
                            this.closeModal();
                        };
                        ctrl.appendChild(buyBtn);
                    } else if (actionType === 'title') {
                        const btn = document.createElement('button');
                        btn.className = "btn-main";
                        btn.style.flex = "1";
                        btn.style.padding = "6px 12px";
                        btn.style.fontSize = "0.75rem";
                        btn.innerText = "TRANG BỊ";
                        const titleName = GameData.titles[itemId].name.replace(/'/g, "\\'");
                        btn.setAttribute('onclick', `Game.getProxy().currentTitleId = '${itemId}'; UI.closeModal(); UI.addLog('🎭 Đã trang bị danh hiệu: <b>[${titleName}]</b>');`);
                        ctrl.appendChild(btn);
                    } else {
                        const btn = document.createElement('button'); 
                        btn.className = "btn-main";
                        btn.style.flex = "1";
                        btn.style.padding = "6px 12px";
                        btn.style.fontSize = "0.75rem";
                        let btnText = "SỬ DỤNG";
                        let btnClass = "btn-main";
                        if (actionType === 'equip') btnText = "MẶC";
                        else if (actionType === 'skill_book') btnText = "LĨNH NGỘ";
                        else if (actionType === 'hatch') {
                            btnText = "ẤP NỞ";
                            btnClass = "btn-main btn-yellow";
                        }
                        btn.innerText = btnText;
                        btn.className = btnClass;
                        if (actionType === 'equip') {
                            btn.setAttribute('onclick', `if (window.EquipSystem) EquipSystem.equip(${index}); UI.closeModal();`);
                        } else {
                            btn.setAttribute('onclick', `Game.useItem(${index}); UI.closeModal();`);
                        }
                        ctrl.appendChild(btn);

                        // Thêm nút BÁN nếu vật phẩm có giá trị và không phải đồ môn phái
                        const itemData = GameData.items[itemId];
                        if (itemData && itemData.value > 0 && !itemData.isSectBound && !itemData.noTrade && index !== undefined && index !== null) {
                            const sellBtn = document.createElement('button');
                            sellBtn.className = "btn-main btn-yellow";
                            sellBtn.style.flex = "1";
                            sellBtn.style.padding = "6px 12px";
                            sellBtn.style.fontSize = "0.75rem";
                            sellBtn.innerText = `BÁN (${itemData.value} ⭐)`;
                            sellBtn.onclick = () => {
                                this.confirmSellItem(index);
                            };
                            ctrl.appendChild(sellBtn);
                        }
                    }
                }

                // Nút Đóng hoặc Quay lại
                const closeBtn = document.createElement('button');
                closeBtn.className = "btn-main btn-gray";
                closeBtn.style.flex = "1";
                closeBtn.style.padding = "6px 12px";
                closeBtn.style.fontSize = "0.75rem";
                closeBtn.style.minWidth = "60px";
                
                if (this.modalHistory.length > 0) {
                    closeBtn.innerText = "QUAY LẠI";
                    closeBtn.setAttribute('onclick', "UI.goBackModal()");
                } else {
                    closeBtn.innerText = "ĐÓNG";
                    closeBtn.setAttribute('onclick', "UI.closeModal()");
                }
                ctrl.appendChild(closeBtn);
            }
            modal.style.display = 'flex';
        },

        goBackModal: function() {
            if (this.modalHistory.length === 0) {
                this.closeModal();
                return;
            }
            const prevState = this.modalHistory.pop();
            const modal = document.getElementById('info-modal');
            if (!modal) return;

            document.getElementById('modal-title').innerHTML = prevState.title;
            document.getElementById('modal-desc').innerHTML = prevState.desc;
            document.getElementById('modal-controls').innerHTML = prevState.controls;
            
            // Gán lại sự kiện cho các nút trong controls nếu cần
            // Tuy nhiên, vì chúng ta lưu innerHTML, các sự kiện onclick dạng chuỗi sẽ hoạt động.
            // Nếu là sự kiện gán bằng JS, chúng ta cần cách tiếp cận khác.
            // Trong trường hợp này, Profile modal được tạo bằng chuỗi HTML nên sẽ ổn.
        },

        closeModal: function() { 
            this.modalHistory = []; // Xóa lịch sử khi đóng hẳn
            document.getElementById('info-modal').style.display = 'none'; 
            if (this.onClose) {
                const cb = this.onClose;
                this.onClose = null;
                cb();
            }
        },

        isModalOpen: function() {
            const modal = document.getElementById('info-modal');
            return modal && modal.style.display === 'flex';
        },

        /**
         * Cập nhật chỉ số văn bản
         */
        updateStat: function(id, val, bonus = 0, breakdown = null) {
            if (breakdown) {
                statBreakdowns[id] = breakdown;
            }
            const el = document.getElementById(`stat-${id}`);
            if (el) {
                let displayVal = val;
                // Nếu là số, định dạng K, M, B
                if (typeof val === 'number') {
                    displayVal = formatNumber(val);
                } else if (typeof val === 'string' && val.includes('/')) {
                    // Xử lý HP/MP dạng "100/100"
                    const parts = val.split('/');
                    if (parts.length === 2) {
                        const current = parseFloat(parts[0]);
                        const max = parseFloat(parts[1]);
                        displayVal = `${formatNumber(current)}/${formatNumber(max)}`;
                    }
                }

                if (bonus !== 0) {
                    const sign = bonus > 0 ? "+" : "";
                    const color = bonus > 0 ? "#4caf50" : "#ff4444";
                    el.innerHTML = `${displayVal} <small style="color: ${color}; font-weight: bold;">(${sign}${formatNumber(bonus)})</small>`;
                } else {
                    el.innerText = displayVal;
                }
            }
        },

        /**
         * Thêm nhật ký chung (Nhật ký tu tiên)
         */
        addLog: function(msg, isHighlight = false, type = null) {
            const logContainer = document.getElementById('game-logs');
            if (!logContainer) return;

            const targetMsg = msg.trim();
            const timeStr = `<span style="color: #666; font-size: 0.55rem; margin-right: 4px;">[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>`;

            let targetP = null;
            let isConsecutive = false;

            // 1. Kiểm tra xem có trùng với tin nhắn cuối cùng không (Gộp liên tiếp)
            const firstP = logContainer.firstChild;
            if (firstP) {
                const firstContent = (firstP.innerHTML.split('</span> ')[1] || firstP.innerHTML).split(' <b')[0].trim();
                if (firstContent === targetMsg) {
                    targetP = firstP;
                    isConsecutive = true;
                }
            }

            // 2. Đặc biệt cho tin nhắn "Save": Nếu không liên tiếp, tìm trong 5 tin nhắn gần nhất để gộp
            if (!targetP && targetMsg.includes("Đã ghi lại thần thức")) {
                const children = logContainer.children;
                for (let i = 0; i < Math.min(children.length, 5); i++) {
                    const p = children[i];
                    const pContent = (p.innerHTML.split('</span> ')[1] || p.innerHTML).split(' <b')[0].trim();
                    if (pContent === targetMsg) {
                        targetP = p;
                        break;
                    }
                }
            }

            if (targetP) {
                // Tìm số lượng hiện tại
                let currentCount = 1;
                const bTag = targetP.querySelector('b');
                if (bTag && bTag.innerText.includes('x ')) {
                    currentCount = parseInt(bTag.innerText.replace('x ', '')) || 1;
                }
                currentCount++;

                const cleanContent = (targetP.innerHTML.split('</span> ')[1] || targetP.innerHTML).split(' <b')[0];
                // Cập nhật nội dung và timestamp mới nhất
                targetP.innerHTML = `${timeStr} ${cleanContent} <b style="color: #ffeb3b;">x ${currentCount}</b>`;
                
                // Nếu không phải tin nhắn đầu tiên, đưa nó lên đầu để người dùng thấy hành động mới nhất
                if (targetP !== logContainer.firstChild) {
                    logContainer.prepend(targetP);
                }
                
                // Cập nhật trạng thái global để đồng bộ với logic cũ nếu cần
                lastLogMsg = targetMsg;
                lastLogHighlight = isHighlight;
                logCount = currentCount;
            } else {
                lastLogMsg = targetMsg;
                lastLogHighlight = isHighlight;
                logCount = 1;
                const p = document.createElement('p');
                p.style.margin = "2px 0";
                p.style.padding = "2px 4px";
                p.style.borderRadius = "3px";
                p.style.fontSize = "0.7rem";
                p.style.lineHeight = "1.3";
                
                if (type === 'success') {
                    p.classList.add('log-tribulation-success');
                } else if (type === 'fail') {
                    p.classList.add('log-tribulation-fail');
                } else if (isHighlight) {
                    p.style.color = "#d4af37";
                    p.style.background = "rgba(212, 175, 55, 0.1)";
                    p.style.borderLeft = "2px solid #d4af37";
                    p.style.fontWeight = "bold";
                } else {
                    p.style.color = "#eee";
                    p.style.borderLeft = "2px solid transparent";
                }

                // Thêm tính năng click để xem lịch sử chiến đấu
                if (targetMsg.includes("Bắt đầu trận chiến") || targetMsg.includes("Chiến thắng") || targetMsg.includes("Bại trận")) {
                    p.style.cursor = "pointer";
                    p.title = "Nhấp để xem chi tiết trận chiến";
                    
                    // Tìm battleId từ chuỗi (ví dụ từ link <a>)
                    const battleIdMatch = targetMsg.match(/viewBattleHistory\((\d+)\)/);
                    const battleId = battleIdMatch ? battleIdMatch[1] : null;
                    
                    p.onclick = () => {
                        if (battleId) {
                            this.viewBattleHistory(parseInt(battleId));
                        } else {
                            this.showTab('battle');
                        }
                    };
                    
                    const originalBg = isHighlight ? "rgba(212, 175, 55, 0.1)" : "transparent";
                    p.onmouseenter = () => { p.style.background = "rgba(255, 255, 255, 0.15)"; };
                    p.onmouseleave = () => { p.style.background = originalBg; };
                }
                
                p.innerHTML = `${timeStr} ${targetMsg}`;
                logContainer.prepend(p);
                if (logContainer.children.length > 100) logContainer.lastChild.remove();
            }
            
            logContainer.scrollTop = 0;
        },

        showNotification: function(msg, type = 'success') {
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '20%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.zIndex = '20000';
            container.style.background = type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)';
            container.style.color = '#fff';
            container.style.padding = '12px 24px';
            container.style.borderRadius = '10px';
            container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            container.style.fontWeight = 'bold';
            container.style.fontSize = '0.9rem';
            container.style.pointerEvents = 'none';
            container.style.animation = 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            container.innerHTML = `✨ ${msg}`;
            
            document.body.appendChild(container);
            
            setTimeout(() => {
                container.style.transition = 'all 0.5s ease';
                container.style.opacity = '0';
                container.style.transform = 'translate(-50%, -100%)';
                setTimeout(() => container.remove(), 500);
            }, 2000);
        },

        showFullLog: function() {
            const logContainer = document.getElementById('game-logs');
            if (!logContainer) return;
            
            const content = `<div style="height: 400px; overflow-y: auto; background: #0a0a0a; padding: 10px; border-radius: 8px; font-size: 0.75rem; border: 1px solid #333;">
                ${logContainer.innerHTML}
            </div>`;
            
            this.openModal("TOÀN BỘ NHẬT KÝ", content, false);
        },

        toggleLog: function() {
            const logSection = document.querySelector('.log-section');
            const logContainer = document.getElementById('game-logs');
            const toggleBtn = document.getElementById('log-toggle-btn');
            
            if (logContainer.style.height === '250px') {
                logContainer.style.height = '120px';
                if (toggleBtn) toggleBtn.innerText = '🔼';
            } else {
                logContainer.style.height = '250px';
                if (toggleBtn) toggleBtn.innerText = '🔽';
            }
        },

        currentEnemy: null,
        lastQuote: null,
        quoteRepeatCount: 0,
        showArrogantQuote: function() {
            const uiId = this.isTribulation ? 'tribulation-ui' : 'battle-ui';
            const enemyId = this.isTribulation ? 'trib-enemy-side' : 'enemy-side-container';
            const closeBtnId = this.isTribulation ? 'trib-close-btn' : 'battle-close-btn';
            
            const battleUI = document.getElementById(uiId);
            const enemySide = document.getElementById(enemyId);
            const closeBtn = document.getElementById(closeBtnId);
            
            // Stop if close button is visible or elements missing
            if (!battleUI || !enemySide) return;
            if (closeBtn && closeBtn.style.display !== 'none') return;

            const sideRect = enemySide.getBoundingClientRect();
            const uiRect = battleUI.getBoundingClientRect();

            const quotes = [
                "Sâu kiến.. haha",
                "Phàm nhân... Trảm!",
                "Nghịch thiên? Chết!",
                "Thiên đạo bất khả nhục!",
                "Tan thành mây khói đi!",
                "Chút tài mọn..",
                "Ngươi không xứng!",
                "Hủy diệt!",
                "Vô ích thôi...",
                "Chịu chết đi!"
            ];
            
            let quoteIndex = Math.floor(Math.random() * quotes.length);
            let quote = quotes[quoteIndex];
            
            // Repetition logic
            if (this.lastQuote === quote) {
                this.quoteRepeatCount++;
                if (this.quoteRepeatCount === 1) {
                    // Lengthen the quote on first repeat
                    quote = quote.replace(/([a-zA-ZÀ-ỹ])(\s|\.|\!|\?|$)/g, (match, p1, p2) => {
                        return p1.repeat(4) + p2;
                    });
                } else {
                    // Force a different quote if repeated more than twice
                    let attempts = 0;
                    while (quote === this.lastQuote && attempts < 10) {
                        quoteIndex = Math.floor(Math.random() * quotes.length);
                        quote = quotes[quoteIndex];
                        attempts++;
                    }
                    this.lastQuote = quote;
                    this.quoteRepeatCount = 0;
                }
            } else {
                this.lastQuote = quote;
                this.quoteRepeatCount = 0;
            }

            const colors = ["#ff4444", "#ff8800", "#ffff44", "#44ff44", "#44ffff", "#8888ff", "#ff44ff", "#ffffff"];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const quoteEl = document.createElement('div');
            // Random shape
            const shapes = ['jagged', 'diamond', 'circle', 'quad', 'hex'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            // Random side: left or right of the stats container
            const isLeft = Math.random() > 0.5;
            quoteEl.className = `arrogant-quote quote-shape-${shape} ${isLeft ? 'quote-left' : 'quote-right'}`;
            
            const horizontalOffset = 80 + Math.random() * 40; // distance from center
            
            // Move higher up (closer to the avatar/name)
            const top = (sideRect.top - uiRect.top) + 20 + (Math.random() * 30); 
            const left = (sideRect.left - uiRect.left) + (sideRect.width / 2) + (isLeft ? -horizontalOffset : horizontalOffset);
            
            quoteEl.style.position = 'absolute';
            quoteEl.style.top = `${top}px`;
            quoteEl.style.left = `${left}px`;
            quoteEl.style.transform = 'translateX(-50%)';
            quoteEl.innerHTML = `<span style="display: block;">${quote}</span>`;
            quoteEl.style.color = color;
            
            // Create separate arrow element
            const arrowEl = document.createElement('div');
            arrowEl.className = `arrogant-quote-arrow ${isLeft ? 'arrow-left' : 'arrow-right'}`;
            arrowEl.style.top = `${top - 20}px`;
            arrowEl.style.left = `${left + (isLeft ? 20 : -20)}px`;
            arrowEl.style.background = `linear-gradient(to top, ${color}, transparent)`;
            
            battleUI.appendChild(quoteEl);
            battleUI.appendChild(arrowEl);

            // Flashing name effect
            if (enemyName) {
                enemyName.classList.add('speaking');
                setTimeout(() => enemyName.classList.remove('speaking'), 1500);
            }
            
            setTimeout(() => {
                if (quoteEl.parentNode) quoteEl.remove();
                if (arrowEl.parentNode) arrowEl.remove();
            }, 3000);
        },

        /**
         * Khởi tạo giao diện chiến đấu
         */
        battleHistory: [],
        currentBattleId: null,

        viewBattleHistory: function(id) {
            console.log("Viewing battle history for ID:", id);
            const battle = this.battleHistory.find(b => b.id === id);
            if (!battle) return;
            
            const battleUI = document.getElementById('battle-ui');
            if (battleUI) battleUI.style.display = 'flex';
            
            const eName = document.getElementById('enemy-name');
            const enemyAvatarEl = document.getElementById('enemy-avatar-container');
            const enemyDescContainer = document.getElementById('enemy-desc-container');
            
            if (eName) {
                eName.innerText = battle.enemy.name.includes(' (') ? battle.enemy.name.split(' (')[0] : battle.enemy.name;
                eName.style.color = battle.enemy.isBoss ? '#f44336' : (battle.enemy.isElite ? '#ff9800' : '#ffeb3b');
                eName.style.textShadow = battle.enemy.isBoss ? '0 0 10px #f44336, 0 0 20px #f44336' : (battle.enemy.isElite ? '0 0 10px #ff9800' : '0 0 5px rgba(255, 235, 59, 0.5)');
                eName.style.animation = battle.enemy.isBoss ? 'pulse 1.5s infinite' : 'none';
            }
            
            if (enemyAvatarEl) {
                enemyAvatarEl.innerText = battle.enemy.icon || (battle.enemy.isBoss ? "👹" : (battle.enemy.isElite ? "💀" : "👾"));
            }
            
            if (enemyDescContainer) enemyDescContainer.style.display = 'none';
            
            const logDetail = document.getElementById('battle-log-detail');
            if (logDetail) {
                logDetail.innerHTML = battle.log;
            }
            
            // Show close buttons
            const closeBtnView = document.getElementById('battle-close-btn');
            if (closeBtnView) {
                closeBtnView.style.display = 'flex';
                closeBtnView.innerText = "×";
            }
            
            const closeBtnResult = document.getElementById('battle-close-btn-result');
            if (closeBtnResult) {
                closeBtnResult.style.display = 'flex';
                closeBtnResult.innerText = "ĐÓNG";
            }
            
            this.showTab('battle');
        },

        initBattle: function(enemy) {
            this.currentEnemy = enemy;
            this.isTribulation = !!enemy.isTribulation;
            this.currentBattleId = Date.now();
            lastEnemyObject = enemy;
            actionsShown = 0;
            battleLogQueue = [];
            
            // Transition logic
            const overlay = document.getElementById('battle-transition-overlay');
            const transitionText = document.getElementById('battle-transition-text');
            
            if (overlay && transitionText) {
                overlay.style.display = 'flex';
                // Trigger reflow
                overlay.offsetHeight;
                overlay.style.opacity = '1';
                
                setTimeout(() => {
                    transitionText.style.opacity = '1';
                    transitionText.style.transform = 'scale(1)';
                }, 100);
            }

            if (this.isTribulation) {
                if (typeof TribulationUI !== 'undefined') {
                    TribulationUI.init(enemy);
                }
                if (overlay) {
                    setTimeout(() => {
                        overlay.style.opacity = '0';
                        setTimeout(() => { overlay.style.display = 'none'; }, 400);
                    }, 1000);
                }
                return;
            }

            const logId = 'battle-log-detail';
            const logDetail = document.getElementById(logId);
            if (logDetail) logDetail.innerHTML = "";

            // Clear buffs and debuffs UI
            const playerBuffs = document.getElementById('ui-player-buffs');
            const playerDebuffs = document.getElementById('ui-player-debuffs');
            const enemyBuffs = document.getElementById('ui-enemy-buffs');
            const enemyDebuffs = document.getElementById('ui-enemy-debuffs');
            const playerSkillsStatus = document.getElementById('ui-player-skills-status');
            const enemySkillsStatus = document.getElementById('ui-enemy-skills-status');
            
            if (playerBuffs) playerBuffs.innerHTML = "";
            if (playerDebuffs) playerDebuffs.innerHTML = "";
            if (enemyBuffs) enemyBuffs.innerHTML = "";
            if (enemyDebuffs) enemyDebuffs.innerHTML = "";
            if (playerSkillsStatus) playerSkillsStatus.innerHTML = "";
            if (enemySkillsStatus) enemySkillsStatus.innerHTML = "";
            
            const closeBtnInit = document.getElementById('battle-close-btn');
            if (closeBtnInit) closeBtnInit.style.display = 'none';
            
            const closeBtnResultInit = document.getElementById('battle-close-btn-result');
            if (closeBtnResultInit) closeBtnResultInit.style.display = 'none';
            
            if (logInterval) {
                clearInterval(logInterval);
                logInterval = null;
            }

            if (this.arrogantTimer) {
                clearInterval(this.arrogantTimer);
                this.arrogantTimer = null;
            }

            // Clear pet UI
            const petBuffs = document.getElementById('ui-pet-buffs');
            const petDebuffs = document.getElementById('ui-pet-debuffs');
            if (petBuffs) petBuffs.innerHTML = "";
            if (petDebuffs) petDebuffs.innerHTML = "";
            
            // Wait for transition effect
            setTimeout(() => {
                const battleUI = document.getElementById('battle-ui');
                const tribulationUI = document.getElementById('tribulation-ui');

                document.body.classList.remove('tribulation-active');
                if (battleUI) battleUI.style.display = 'flex';
                if (tribulationUI) tribulationUI.style.display = 'none';

                const eName = document.getElementById('enemy-name');
                const enemyAvatarEl = document.getElementById('enemy-avatar-container');
                const enemyDescContainer = document.getElementById('enemy-desc-container');

                if (eName) {
                    eName.innerText = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
                    eName.className = "";
                    eName.style.color = '#ffeb3b';
                    eName.style.textShadow = '0 0 5px rgba(255, 235, 59, 0.5)';
                    eName.style.fontWeight = 'bold';
                    eName.style.fontSize = '0.85rem';
                    eName.style.animation = 'none';
                    
                    if (enemyAvatarEl) {
                        enemyAvatarEl.className = "avatar-box";
                        enemyAvatarEl.innerText = enemy.icon || (enemy.isBoss ? "👹" : (enemy.isElite ? "💀" : "👾"));
                    }
                    if (enemyDescContainer) enemyDescContainer.style.display = 'none';

                    if (enemy.isBoss) {
                        eName.style.color = '#f44336';
                        eName.style.textShadow = '0 0 10px #f44336, 0 0 20px #f44336';
                        eName.style.animation = 'pulse 1.5s infinite';
                    }
                }
                
                this.renderBattleAvatars(enemy);
                this.updateBar('enemy-hp', enemy.hp, enemy.hpMax || enemy.hp);
                this.updateBar('enemy-mp', enemy.mp || 0, enemy.mpMax || 0);
                this.showTab('battle');
                this.addBattleLog(`Cảnh báo: <b>${enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name}</b> xuất hiện!`, "Hệ thống");

                if (overlay) {
                    overlay.style.opacity = '0';
                    setTimeout(() => { 
                        overlay.style.display = 'none';
                        if (transitionText) {
                            transitionText.style.opacity = '0';
                            transitionText.style.transform = 'scale(0.5)';
                        }
                    }, 400);
                }
            }, 1200);
        },

        initPetUI: function(pet) {
            const petContainer = document.getElementById('pet-battle-container');
            if (!petContainer) {
                console.error("UI: Không tìm thấy pet-battle-container");
                return;
            }

            if (!pet) {
                console.log("UI: Ẩn giao diện pet (pet is null)");
                petContainer.style.display = 'none';
                return;
            }

            console.log("UI: Hiển thị giao diện pet cho:", pet.name, "ShieldMax:", pet.shieldMax, "MpMax:", pet.mpMax);
            petContainer.style.display = 'flex';
            
            // Show pet stats column in main UI
            const petStatsCol = document.getElementById('pet-stats-column');
            if (petStatsCol) petStatsCol.style.display = 'flex';

            const petName = document.getElementById('pet-name-battle');
            const petAvatar = document.getElementById('pet-avatar-battle');
            const petHpText = document.getElementById('stat-pet-hp-battle');
            const petHpBar = document.getElementById('pet-hp-progress-battle');

            if (petName) {
                let realmName = pet.realm || 'Phàm Nhân';
                if (realmName === 'Phàm Nhân') realmName = 'Phàm Yêu';
                petName.innerText = `${pet.displayName || pet.name} (${realmName})`;
            }
            if (petAvatar) petAvatar.innerText = pet.avatar || "🐾";
            
            const pHp = Number(pet.hp) || 0;
            const pHpMax = Math.max(100, Number(pet.hpMax) || 100);
            
            // Update main UI pet bars
            this.updateBar('pet-hp', pHp, pHpMax);

            if (petHpText) petHpText.innerText = `${formatNumber(pHp)}/${formatNumber(pHpMax)}`;
            if (petHpBar) petHpBar.style.width = '100%';

            // Xử lý Hộ thể (Linh lực hộ thể)
            const petShieldContainer = document.getElementById('pet-shield-bar-container');
            const petMpContainer = document.getElementById('pet-mp-bar-container');
            
            if (petShieldContainer) {
                // Luôn hiển thị nếu có linh thú, giá trị mặc định là 0
                petShieldContainer.style.display = 'flex';
                const shieldText = document.getElementById('battle-pet-shield-text');
                const shieldBar = document.getElementById('pet-shield-progress');
                const sMax = Number(pet.shieldMax) || Math.floor((Number(pet.mpMax) || 0) * 0.5);
                const sVal = Number(pet.shield) || 0;
                if (shieldText) shieldText.innerText = `${formatNumber(sVal)}/${formatNumber(sMax)}`;
                if (shieldBar) {
                    const percent = Math.max(0, Math.min(100, (sVal / sMax) * 100));
                    shieldBar.style.width = `${percent}%`;
                }
            }

            if (petMpContainer) {
                // Luôn hiển thị nếu có linh thú
                petMpContainer.style.display = 'flex';
                const mpText = document.getElementById('battle-pet-mp-text');
                const mpBar = document.getElementById('battle-pet-mp-bar');
                const mMax = Math.max(60, Number(pet.mpMax) || 0);
                const mVal = Number(pet.mp) || 0;

                // Update main UI pet MP
                this.updateBar('pet-mp', mVal, mMax);

                if (mpText) mpText.innerText = `${Math.floor(mVal)}/${Math.floor(mMax)}`;
                if (mpBar) {
                    const percent = Math.max(0, Math.min(100, (mVal / mMax) * 100));
                    mpBar.style.width = `${percent}%`;
                }
            }

            // Xử lý Thể lực
            const petStaminaContainer = document.getElementById('pet-stamina-bar-battle-container');
            const pSta = Number(pet.stamina) || 0;
            const pStaMax = Number(pet.staminaMax) || 100;
            
            // Update main UI pet Stamina
            this.updateBar('pet-stamina', pSta, pStaMax);

            if (petStaminaContainer) {
                if (pet.staminaMax && pet.staminaMax > 0) {
                    petStaminaContainer.style.display = 'flex';
                    const staminaText = document.getElementById('stat-pet-stamina-battle-text');
                    const staminaBar = document.getElementById('pet-stamina-progress-battle');
                    if (staminaText) staminaText.innerText = `${Math.floor(pSta)}/${pStaMax}`;
                    if (staminaBar) {
                        const percent = (pSta / pStaMax) * 100;
                        staminaBar.style.width = `${percent}%`;
                    }
                } else {
                    petStaminaContainer.style.display = 'none';
                }
            }

            // Xử lý Linh khí (Kinh nghiệm) - Đã loại bỏ khỏi UI chiến đấu
            /*
            const petSpiritContainer = document.getElementById('pet-spirit-bar-battle-container');
            if (petSpiritContainer) {
                if (pet.maxSpirit && pet.maxSpirit > 0) {
                    petSpiritContainer.style.display = 'flex';
                    const spiritText = document.getElementById('stat-pet-spirit-battle-text');
                    const spiritBar = document.getElementById('pet-spirit-progress-battle');
                    if (spiritText) spiritText.innerText = `${pet.spirit || 0}/${pet.maxSpirit}`;
                    if (spiritBar) {
                        const percent = (pet.spirit / pet.maxSpirit) * 100;
                        spiritBar.style.width = `${percent}%`;
                    }
                } else {
                    petSpiritContainer.style.display = 'none';
                }
            }
            */

            // Hiển thị kỹ năng pet
            if (pet.skills) {
                this.renderSkillStatus('pet', pet.skills, pet.currentCooldowns || {}, pet.level);
            }

            // Hiển thị buff/debuff pet ngay khi khởi tạo
            if (this.renderDebuffs) {
                this.renderDebuffs('pet', pet.activeBuffs || [], pet.activeDebuffs || []);
            }
        },

        updatePetUI: function(pet) {
            if (!pet) {
                const petStatsCol = document.getElementById('pet-stats-column');
                if (petStatsCol) petStatsCol.style.display = 'none';
                return;
            }

            // Show pet stats column in main UI
            const petStatsCol = document.getElementById('pet-stats-column');
            if (petStatsCol) petStatsCol.style.display = 'flex';

            // Lấy chỉ số chuẩn từ PetSystem để đảm bảo hiển thị đúng Max
            let pStats = null;
            if (typeof PetSystem !== 'undefined') {
                pStats = PetSystem.getPetStats(pet.id, pet.level || 1, pet.statMultiplier || 1.0);
            }

            const pHpMax = pStats ? pStats.hpMax : (Number(pet.hpMax) || 100);
            const pHp = typeof pet.hp !== 'undefined' ? Number(pet.hp) : pHpMax;
            
            // Update main UI pet bars
            this.updateBar('pet-hp', pHp, pHpMax);

            const petHpText = document.getElementById('stat-pet-hp-battle');
            const petHpBar = document.getElementById('pet-hp-progress-battle');
            if (petHpText) petHpText.innerText = `${formatNumber(pHp)}/${formatNumber(pHpMax)}`;
            if (petHpBar) {
                const percent = Math.max(0, Math.min(100, (pHp / pHpMax) * 100));
                petHpBar.style.width = `${percent}%`;
            }

            // Cập nhật Hộ thể (Linh lực hộ thể)
            const petShieldContainer = document.getElementById('pet-shield-bar-container');
            if (petShieldContainer) {
                petShieldContainer.style.display = 'flex';
                const shieldText = document.getElementById('battle-pet-shield-text');
                const shieldBar = document.getElementById('pet-shield-progress');
                
                const sMax = Number(pet.shieldMax) || (pStats ? Math.floor(pStats.mpMax * 0.5) : Math.floor((Number(pet.mpMax) || 60) * 0.5));
                const sVal = Number(pet.shield) || 0;
                
                if (shieldText) shieldText.innerText = `${formatNumber(sVal)}/${formatNumber(sMax)}`;
                if (shieldBar) {
                    const percent = Math.max(0, Math.min(100, (sVal / sMax) * 100));
                    shieldBar.style.width = `${percent}%`;
                }
            }

            // Cập nhật Linh lực
            const pMpMax = pStats ? pStats.mpMax : (Number(pet.mpMax) || 60);
            const pMp = typeof pet.mp !== 'undefined' ? Number(pet.mp) : (typeof pet.mana !== 'undefined' ? Number(pet.mana) : pMpMax);

            // Update main UI pet MP
            this.updateBar('pet-mp', pMp, pMpMax);

            const petMpContainer = document.getElementById('pet-mp-bar-container');
            if (petMpContainer) {
                petMpContainer.style.display = 'flex';
                const mpText = document.getElementById('battle-pet-mp-text');
                const mpBar = document.getElementById('battle-pet-mp-bar');
                if (mpText) mpText.innerText = `${formatNumber(pMp)}/${formatNumber(pMpMax)}`;
                if (mpBar) {
                    const percent = Math.max(0, Math.min(100, (pMp / pMpMax) * 100));
                    mpBar.style.width = `${percent}%`;
                }
            }

            // Cập nhật Thể lực
            const pStaMax = pStats ? pStats.stamina : (Number(pet.staminaMax) || 100);
            const pSta = typeof pet.stamina !== 'undefined' ? Number(pet.stamina) : pStaMax;

            // Update main UI pet Stamina
            this.updateBar('pet-stamina', pSta, pStaMax);

            const petStaminaContainer = document.getElementById('pet-stamina-bar-battle-container');
            if (petStaminaContainer) {
                if (pStaMax > 0) {
                    petStaminaContainer.style.display = 'flex';
                    const staminaText = document.getElementById('stat-pet-stamina-battle-text');
                    const staminaBar = document.getElementById('pet-stamina-progress-battle');
                    if (staminaText) staminaText.innerText = `${formatNumber(pSta)}/${formatNumber(pStaMax)}`;
                    if (staminaBar) {
                        const percent = Math.max(0, Math.min(100, (pSta / pStaMax) * 100));
                        staminaBar.style.width = `${percent}%`;
                    }
                } else {
                    petStaminaContainer.style.display = 'none';
                }
            }

            // Cập nhật Linh khí - Đã loại bỏ khỏi UI chiến đấu
            /*
            const petSpiritContainer = document.getElementById('pet-spirit-bar-battle-container');
            if (petSpiritContainer && pet.maxSpirit > 0) {
                const spiritText = document.getElementById('stat-pet-spirit-battle-text');
                const spiritBar = document.getElementById('pet-spirit-progress-battle');
                if (spiritText) spiritText.innerText = `${pet.spirit || 0}/${pet.maxSpirit}`;
                if (spiritBar) {
                    const percent = Math.max(0, Math.min(100, (pet.spirit / pet.maxSpirit) * 100));
                    spiritBar.style.width = `${percent}%`;
                }
            }
            */

            if (this.renderDebuffs) {
                this.renderDebuffs('pet', pet.activeBuffs || [], pet.activeDebuffs || []);
            }
            
            // Cập nhật kỹ năng pet
            if (pet.skills) {
                this.renderSkillStatus('pet', pet.skills, pet.currentCooldowns || {}, pet.level);
            }
        },

        /**
         * Kết thúc chiến đấu
         */
        endBattle: function(resultMsg) {
            if (resultMsg) {
                this.addBattleLog(`Kết thúc: <b>${resultMsg}</b>`, "Hệ thống");
            }
            
            const logId = 'battle-log-detail';
            const logDetail = document.getElementById(logId);
            
            if (logDetail && this.currentEnemy) {
                const battleData = {
                    id: this.currentBattleId,
                    enemy: JSON.parse(JSON.stringify(this.currentEnemy)),
                    log: logDetail.innerHTML,
                    time: new Date().toLocaleTimeString()
                };
                this.battleHistory.unshift(battleData);
                if (this.battleHistory.length > 5) this.battleHistory.pop();
            }

            const closeBtnId = 'battle-close-btn-result';
            const closeBtn = document.getElementById(closeBtnId);
            if (closeBtn) {
                closeBtn.style.display = 'flex';
                closeBtn.innerText = "ĐÓNG";
            }
            
            const closeBtnTop = document.getElementById('battle-close-btn');
            if (closeBtnTop) {
                closeBtnTop.style.display = 'flex';
            }
            
            this.showTab('battle');
        },

        closeBattleUI: function() {
            console.log("Closing battle UI...");
            document.body.classList.remove('tribulation-active');
            this.isTribulation = false;
            
            if (this.arrogantTimer) {
                clearInterval(this.arrogantTimer);
                this.arrogantTimer = null;
            }

            const overlay = document.getElementById('battle-transition-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
                // Trigger reflow
                overlay.offsetHeight;
                overlay.style.opacity = '1';
                
                setTimeout(() => {
                    const battleUI = document.getElementById('battle-ui');
                    if (battleUI) battleUI.style.display = 'none';

                    const tribulationUI = document.getElementById('tribulation-ui');
                    if (tribulationUI) tribulationUI.style.display = 'none';
                    
                    const indicator = document.getElementById('battle-status-indicator');
                    if (indicator) indicator.style.display = 'none';

                    const closeBtn = document.getElementById('battle-close-btn');
                    if (closeBtn) closeBtn.style.display = 'none';
                    
                    const closeBtnResult = document.getElementById('battle-close-btn-result');
                    if (closeBtnResult) closeBtnResult.style.display = 'none';

                    if (typeof Game !== 'undefined') {
                        Game.isInBattle = false;
                        const proxy = Game.getProxy();
                        if (proxy) proxy.isStatsFrozen = false;
                    }

                    this.showTab(this.lastTab || 'map');
                    
                    overlay.style.opacity = '0';
                    setTimeout(() => { overlay.style.display = 'none'; }, 400);
                }, 600);
            } else {
                const battleUI = document.getElementById('battle-ui');
                if (battleUI) battleUI.style.display = 'none';

                const tribulationUI = document.getElementById('tribulation-ui');
                if (tribulationUI) tribulationUI.style.display = 'none';
                
                const indicator = document.getElementById('battle-status-indicator');
                if (indicator) indicator.style.display = 'none';

                const closeBtn = document.getElementById('battle-close-btn');
                if (closeBtn) closeBtn.style.display = 'none';
                
                const closeBtnResult = document.getElementById('battle-close-btn-result');
                if (closeBtnResult) closeBtnResult.style.display = 'none';

                if (typeof Game !== 'undefined') {
                    Game.isInBattle = false;
                }

                this.showTab(this.lastTab || 'map');
            }
        },

        /**
         * Hiển thị chi tiết vật phẩm
         */
        showItemDetail: function(itemId, shopInfo = null) {
            const item = GameData.items[itemId];
            if (!item) return;

            const rarityColor = this.getRarityColor(item.rarity);
            const nameColor = itemId === 'pet_egg_random' ? '#ff0000' : rarityColor;
            let content = `
                <div style="display: flex; flex-direction: column; gap: 6px; align-items: center; padding: 0;">
                    <div style="font-size: 2.2rem; filter: drop-shadow(0 0 6px ${rarityColor}44);">${item.icon}</div>
                    <div style="text-align: center; width: 100%;">
                        <b style="color: ${nameColor}; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px;">${item.name}</b>
                        <div style="font-size: 0.6rem; color: #888; margin-top: 0px; text-transform: uppercase; cursor: pointer;" onclick="UI.showRarityInfo()">Phẩm chất: <span style="color: ${rarityColor}; font-weight: bold;">${this.getRarityName(item.rarity)}</span></div>
                        <p style="color: #ccc; font-size: 0.75rem; margin-top: 4px; line-height: 1.2; font-style: italic; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 6px; border: 1px solid #333;">"${item.desc || "Không có mô tả."}"</p>
                    </div>
            `;

            // Hiển thị thông tin cửa hàng nếu có
            if (shopInfo) {
                const repInfo = this.getReputationInfo(shopInfo.reqReputation || 0);
                content += `
                    <div style="width: 100%; background: rgba(142, 36, 170, 0.1); padding: 6px; border-radius: 6px; border: 1px solid #8e24aa44;">
                        <b style="color: #8e24aa; font-size: 0.65rem; display: block; margin-bottom: 2px; border-bottom: 1px solid #8e24aa33; padding-bottom: 1px;">MUA:</b>
                        <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #eee;">
                            <span>📜 Yêu Cầu Danh Vọng: <b style="color: ${repInfo.color};">${shopInfo.reqReputation}</b></span>
                            <span>💰 Giá: <b style="color: #ffeb3b;">${shopInfo.finalCost} ⭐</b></span>
                        </div>
                    </div>
                `;
            }

            // Hiển thị chỉ số trang bị
            if (item.stats) {
                content += `<div style="width: 100%; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 6px; border: 1px solid #444;">`;
                content += `<b style="color: #ffeb3b; font-size: 0.65rem; display: block; margin-bottom: 3px; border-bottom: 1px solid #444; padding-bottom: 1px;">THUỘC TÍNH:</b>`;
                content += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px;">`;
                for (const [key, val] of Object.entries(item.stats)) {
                    const statName = { 
                        atk: "Tấn Công", 
                        def: "Phòng Ngự", 
                        hp: "Sinh Mệnh", 
                        mp: "Linh Lực", 
                        thanphap: "Thân Pháp", 
                        luk: "May Mắn",
                        hpMult: "Bội Số Sinh lực",
                        mpMult: "Bội Số Linh lực",
                        staMult: "Bội Số Thể lực"
                    }[key] || key.toUpperCase();
                    const isPositive = val >= 0;
                    const sign = isPositive ? "+" : "-";
                    const color = isPositive ? "#4caf50" : "#ff4444";
                    const absVal = Math.abs(val);
                    content += `<div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #eee;">
                                    <span>${statName}:</span>
                                    <b style="color: ${color};">${sign}${absVal}</b>
                                 </div>`;
                }
                content += `</div></div>`;
            }

            // Hiển thị thông tin đan dược/vật phẩm tiêu hao
            if (item.type === 'pill' || item.effect) {
                content += `<div style="width: 100%; background: rgba(76, 175, 80, 0.1); padding: 6px; border-radius: 6px; border: 1px solid #4caf5044;">
                    <b style="color: #4caf50; font-size: 0.65rem; display: block; margin-bottom: 2px; border-bottom: 1px solid #4caf5033; padding-bottom: 1px;">DƯỢC LỰC:</b>`;
                if (item.effect) {
                    content += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px;">`;
                    for (const [key, val] of Object.entries(item.effect)) {
                        const statName = { hp: "HP", mp: "MP", stamina: "Thể Lực", exp: "Tu Vi", potential: "Tiềm Năng" }[key] || key.toUpperCase();
                        content += `<div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #eee;">
                                        <span>⚡ ${statName}:</span>
                                        <b style="color: #4caf50;">+${val}</b>
                                     </div>`;
                    }
                    content += `</div>`;
                } else {
                    content += `<span style="color: #eee; font-size: 0.65rem;">${item.desc}</span>`;
                }
                content += `</div>`;
            }

            // Hiển thị kỹ năng nếu là sách kỹ năng
            if (item.type === 'skill_book' && item.skillId) {
                const skill = GameData.skills[item.skillId];
                    if (skill) {
                        const cd = skill.type !== 'passive' ? ` <span style="color:#f44336; font-size:0.6rem;">(Hồi chiêu: ${skill.cooldown || 0}s)</span>` : "";
                        content += `<div style="width: 100%; background: rgba(0, 242, 255, 0.1); padding: 6px; border-radius: 6px; border: 1px solid #00f2ff44;">
                            <b style="color: #00f2ff; font-size: 0.65rem; display: block; margin-bottom: 2px; border-bottom: 1px solid #00f2ff33; padding-bottom: 1px;">📜 THẦN THÔNG:</b>
                            <div style="color: #eee; font-size: 0.7rem; font-weight: bold;">${skill.name}${cd}</div>
                            <div style="color: #aaa; font-size: 0.6rem; margin-top: 0px;">${skill.desc}</div>
                        </div>`;
                    }
            }

            content += `</div>`;
            if (shopInfo) {
                this.openModal("THÔNG TIN VẬT PHẨM", content, true, null, 'buy', itemId, shopInfo);
            } else {
                this.openModal("THÔNG TIN VẬT PHẨM", content, false);
            }
        },

        /**
         * Lấy tên phẩm chất theo độ hiếm
         */
        getRarityName: function(rarity) {
            const names = {
                "none": "Không có",
                "common": "Phàm Cấp",
                "uncommon": "Linh Cấp",
                "rare": "Địa Cấp",
                "epic": "Thiên Cấp",
                "legendary": "Thần Cấp",
                "mythic": "Hỗn Độn Cấp",
                "mythic_broken": "Thần Cấp (Tàn Khuyết)",
                "chaos_broken": "Hỗn Độn Cấp (Tàn Khuyết)"
            };
            return names[rarity] || rarity;
        },

        /**
         * Lấy màu theo độ hiếm
         */
        getRarityColor: function(rarity) {
            return rarityColors[rarity] || "#ffffff";
        },

        /**
         * Hiển thị thông tin chi tiết các phẩm chất và chất lượng trang bị
         */
        showRarityInfo: function() {
            const names = {
                "common": "Phàm phẩm nhất giai",
                "uncommon": "Phàm phẩm nhị giai",
                "rare": "Linh phẩm",
                "epic": "Huyền phẩm",
                "legendary": "Địa phẩm",
                "mythic": "Thần Cấp",
                "chaos": "Hỗn Độn Cấp"
            };
            const colors = {
                "common": "#ffffff", 
                "uncommon": "#4caf50", 
                "rare": "#2196f3", 
                "epic": "#a335ee", 
                "legendary": "#ff9800",
                "mythic": "#ff0000",
                "chaos": "#ff00ff"
            };
            const descriptions = {
                "common": "Vật phẩm phổ thông, dễ dàng tìm thấy ở khắp nơi.",
                "uncommon": "Vật phẩm có chút linh tính, hiếm gặp hơn bình thường.",
                "rare": "Vật phẩm mang linh lực rõ rệt, có giá trị cao.",
                "epic": "Vật phẩm quý hiếm, ẩn chứa sức mạnh to lớn.",
                "legendary": "Vật phẩm truyền thuyết, cực kỳ hiếm có và mạnh mẽ.",
                "mythic": "Vật phẩm tối cao, chỉ có trong thần thoại.",
                "chaos": "Vật phẩm vượt ngoài quy tắc, nắm giữ sức mạnh hỗn độn."
            };

            let content = `<div style="text-align: left; line-height: 1.6;">`;
            
            content += `<b style="color: #ffeb3b; display: block; margin-bottom: 10px; border-bottom: 1px solid #ffeb3b33; padding-bottom: 5px;">I. PHẨM CHẤT (ĐỘ HIẾM)</b>`;
            for (let key in names) {
                content += `<div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; border-left: 3px solid ${colors[key]};">
                                <b style="color: ${colors[key]}; display: block; font-size: 0.85rem; margin-bottom: 2px;">${names[key]}</b>
                                <span style="font-size: 0.7rem; color: #aaa;">${descriptions[key]}</span>
                             </div>`;
            }

            content += `<b style="color: #ffeb3b; display: block; margin: 15px 0 10px 0; border-bottom: 1px solid #ffeb3b33; padding-bottom: 5px;">II. CHẤT LƯỢNG (CHỈ SỐ XÊ DỊCH)</b>`;
            content += `<p style="font-size: 0.75rem; color: #ccc; margin-bottom: 10px;">Mỗi món trang bị khi thu thập được sẽ có chất lượng ngẫu nhiên từ <b>90% đến 110%</b> so với chỉ số cơ bản. <br><i style="color: #ffeb3b; font-size: 0.7rem;">* Lưu ý: Chỉ số May Mắn không ảnh hưởng và không bị ảnh hưởng bởi Chất lượng.</i></p>`;
            
            const qualities = [
                { name: "(cực tốt)", range: "110%", color: "#ffeb3b", desc: "Chỉ số đạt mức tối đa, cực kỳ hiếm gặp.", bold: true },
                { name: "(tốt)", range: "101% - 109%", color: "#ffeb3b", desc: "Chỉ số cao hơn mức bình thường.", bold: false },
                { name: "(bình thường)", range: "100%", color: "#4caf50", desc: "Chỉ số giữ nguyên theo thông số gốc.", bold: false },
                { name: "(tệ)", range: "91% - 99%", color: "#ff4444", desc: "Chỉ số thấp hơn mức bình thường.", bold: true },
                { name: "(cực tệ)", range: "90%", color: "#ff4444", desc: "Chỉ số ở mức tối thiểu, chất lượng rất kém.", bold: true }
            ];

            qualities.forEach(q => {
                content += `<div style="margin-bottom: 6px; padding: 6px 10px; background: rgba(0,0,0,0.2); border-radius: 4px; display: flex; align-items: center; gap: 10px;">
                                <b style="color: ${q.color}; font-size: 0.75rem; min-width: 85px; ${q.bold ? 'text-shadow: 0 0 5px ' + q.color + '44;' : ''}">${q.name}</b>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.7rem; color: #eee;">Tỉ lệ: <b style="color: ${q.color}">${q.range}</b></div>
                                    <div style="font-size: 0.65rem; color: #888;">${q.desc}</div>
                                </div>
                            </div>`;
            });

            content += `<b style="color: #ffeb3b; display: block; margin: 15px 0 10px 0; border-bottom: 1px solid #ffeb3b33; padding-bottom: 5px;">III. CHỈ SỐ MAY MẮN ẨN</b>`;
            content += `<p style="font-size: 0.75rem; color: #ccc; margin-bottom: 10px;">Khi nhận được trang bị, có <b>35% cơ hội</b> trang bị đó sẽ sở hữu thêm dòng chỉ số <b>May Mắn</b> ẩn (màu vàng).</p>`;
            content += `<p style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px;">Chỉ số này không bị ảnh hưởng bởi <i>Chất lượng</i> và có giá trị dao động tùy theo phẩm chất trang bị:</p>`;
            
            const luckRanges = [
                { rank: "Phàm", val: "1 ~ 4" },
                { rank: "Linh", val: "4 ~ 10" },
                { rank: "Địa", val: "10 ~ 25" },
                { rank: "Thiên", val: "25 ~ 50" },
                { rank: "Thần", val: "50 ~ 80" },
                { rank: "Cực phẩm", val: "80 ~ 150" },
                { rank: "Hỗn độn", val: "150 ~ 300" }
            ];

            content += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.65rem; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">`;
            luckRanges.forEach(r => {
                content += `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding: 2px 0;">
                                <span style="color: #888;">${r.rank}:</span>
                                <b style="color: #ffeb3b;">+${r.val}</b>
                            </div>`;
            });
            content += `</div>`;

            content += `<p style="font-size: 0.65rem; color: #888; margin-top: 10px; font-style: italic;">* Lưu ý: Chất lượng ảnh hưởng trực tiếp đến các chỉ số chiến đấu của trang bị (ngoại trừ May Mắn).</p>`;
            content += `</div>`;

            this.openModal("THÔNG TIN PHẨM CHẤT & CHẤT LƯỢNG", content, false);
        },

        getReputationInfo: function(value) {
            if (value < -2000) return { name: "Không Chết Không Thôi", color: "#8b0000" };
            if (value < -1000) return { name: "Thù hận", color: "#ff4444" };
            if (value < -500) return { name: "Đối địch", color: "#ff9800" };
            if (value < -200) return { name: "Ghét Bỏ", color: "#ff5722" };
            if (value < 0) return { name: "Lạnh nhạt", color: "#888" };
            if (value < 50) return { name: "Sơ nhập", color: "#eee" };
            if (value < 200) return { name: "Bình thường", color: "#eee" };
            if (value < 500) return { name: "Quen thuộc", color: "#ddd" };
            if (value < 1500) return { name: "Thân thiện", color: "#4caf50" };
            if (value < 3000) return { name: "Tin cậy", color: "#2196f3" };
            if (value < 6000) return { name: "Tôn kính", color: "#9c27b0" };
            return { name: "Chí tôn", color: "#ffeb3b" };
        },

        /**
         * Hiển thị chi tiết Cống Hiến Môn Phái
         */
        showSectContributionInfo: function() {
            const proxy = Game.getProxy();
            const contrib = proxy.sectContribution || 0;
            this.openModal(
                "Cống Hiến Môn Phái",
                `Điểm Cống Hiến dùng để mua vật phẩm trong Cửa Hàng Môn Phái và học các Thần Thông cấp cao.<br><br>` +
                `<b>Cống hiến hiện tại:</b> <span style="color: #d4af37;">${contrib} ⭐</span><br><br>` +
                `<i>Cách nhận:</i><br>` +
                `- Điểm danh hàng ngày.<br>` +
                `- Hoàn thành Nhiệm vụ Môn Phái.<br>` +
                `- Tham gia các sự kiện Môn Phái.`,
                false
            );
        },

        /**
         * Hiển thị chi tiết Danh Vọng Môn Phái
         */
        showSectReputationInfo: function() {
            const proxy = Game.getProxy();
            const repValue = proxy.sectReputation[proxy.currentSectId] || 0;
            const repInfo = this.getReputationInfo(repValue);
            
            let levelsHtml = `
                <div style="margin-top: 10px; font-size: 0.75rem; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px;">
                    <div style="color: #d4af37; margin-bottom: 6px; border-bottom: 1px solid #444; padding-bottom: 4px;">Các cấp độ Danh Vọng:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                        <span style="color: #8b0000;">Không Chết Không Thôi:</span> <span>< -2000</span>
                        <span style="color: #ff4444;">Thù hận:</span> <span>< -1000</span>
                        <span style="color: #ff9800;">Đối địch:</span> <span>< -500</span>
                        <span style="color: #ff5722;">Ghét Bỏ:</span> <span>< -200</span>
                        <span style="color: #888;">Lạnh nhạt:</span> <span>< 0</span>
                        <span style="color: #eee;">Bình thường:</span> <span>0 - 499</span>
                        <span style="color: #4caf50;">Thân thiện:</span> <span>500 - 1499</span>
                        <span style="color: #2196f3;">Tin cậy:</span> <span>1500 - 2999</span>
                        <span style="color: #9c27b0;">Tôn kính:</span> <span>3000 - 5999</span>
                        <span style="color: #ffeb3b;">Chí tôn:</span> <span>>= 6000</span>
                    </div>
                </div>
            `;

            this.openModal(
                "Danh Vọng Môn Phái",
                `Danh Vọng thể hiện sự tin tưởng của Môn Phái đối với bạn. Danh vọng càng cao, bạn càng mở khóa được nhiều vật phẩm hiếm và nhiệm vụ cao cấp.<br><br>` +
                `<b>Danh vọng hiện tại:</b> <span style="color: ${repInfo.color};">${repValue}</span><br>` +
                levelsHtml,
                false
            );
        },

        /**
         * Hiển thị chi tiết chỉ số
         */
        updateBoneUI: function(boneId) {
            const container = document.getElementById('bone-quality-container');
            if (!container) return;

            const boneData = GameData.boneQualities[boneId] || GameData.boneQualities["pham"];
            
            let benefitsHtml = '';
            if (boneId === 'pham') {
                benefitsHtml = '<div style="color: #888; font-size: 0.85rem;">Không có hiệu quả đặc biệt.</div>';
            } else {
                benefitsHtml = '<ul style="margin: 0; padding-left: 20px; color: #aaa; font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px;">';
                if (boneData.cultRate > 1) benefitsHtml += `<li>Tăng <b>${Math.round((boneData.cultRate - 1) * 100)}%</b> tốc độ tu luyện.</li>`;
                if (boneData.growthMult > 1) benefitsHtml += `<li>Hệ số tăng trưởng: <b>${boneData.growthMult}</b>.</li>`;
                
                if (boneData.stats) {
                    if (boneData.stats.all) {
                        benefitsHtml += `<li>Tăng <b>${Math.round(boneData.stats.all * 100)}%</b> tất cả chỉ số.</li>`;
                    } else {
                        if (boneData.stats.hpMax) benefitsHtml += `<li>Tăng <b>${Math.round(boneData.stats.hpMax * 100)}%</b> máu tối đa.</li>`;
                        if (boneData.stats.def) benefitsHtml += `<li>Tăng <b>${Math.round(boneData.stats.def * 100)}%</b> phòng ngự.</li>`;
                    }
                }
                
                if (boneData.tribulationReduction > 0) {
                    benefitsHtml += `<li>Giảm <b>${Math.round(boneData.tribulationReduction * 100)} %</b> sát thương lôi kiếp.</li>`;
                }
                
                if (boneData.aura) {
                    const auraSkills = [
                        "skill_aura_shield",
                        "skill_aura_evil_reflect",
                        "skill_aura_vile_poison",
                        "skill_aura_power"
                    ];
                    const proxy = Game.getProxy();
                    const playerAura = proxy.skills.find(sid => auraSkills.includes(sid));
                    
                    if (playerAura) {
                        const skillData = GameData.skills[playerAura];
                        benefitsHtml += `<li>Sở hữu <b>Hào Quang Chí Tôn</b> (Đã thức tỉnh <b>${skillData.name}</b>).</li>`;
                    } else {
                        benefitsHtml += `<li>Sở hữu <b>Hào Quang Chí Tôn</b> (Thần thông ngẫu nhiên).</li>`;
                    }
                }
                benefitsHtml += '</ul>';
            }

            container.innerHTML = `
                <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 12px; border: 1px solid #444; display: flex; flex-direction: column; gap: 12px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">Căn Cốt Hiện Tại</div>
                            <div style="color: ${boneData.color}; font-size: 1.2rem; font-weight: bold; text-shadow: 0 0 10px ${boneData.color}44;">${boneData.name}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="UI.confirmRerollBone(false)" title="Sử dụng Tẩy Tủy Đan thường" style="background: #d4af37; color: #000; border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; box-shadow: 0 3px 0 #b38f2d;" onmouseover="this.style.transform='translateY(-2px)'; this.style.background='#f1c40f'" onmouseout="this.style.transform='translateY(0)'; this.style.background='#d4af37'">
                                Tẩy Tủy
                            </button>
                            <button onclick="UI.confirmRerollBone(true)" title="Sử dụng Tẩy Tủy Đan cao cấp" style="background: #e74c3c; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; box-shadow: 0 3px 0 #c0392b;" onmouseover="this.style.transform='translateY(-2px)'; this.style.background='#ff5e4d'" onmouseout="this.style.transform='translateY(0)'; this.style.background='#e74c3c'">
                                Tẩy Tủy (Cao Cấp)
                            </button>
                        </div>
                    </div>
                    
                    <div style="height: 1px; background: rgba(255,255,255,0.1);"></div>
                    
                    <div>
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Hiệu Quả Căn Cốt</div>
                        ${benefitsHtml}
                    </div>
                    
                    <div style="font-size: 0.7rem; color: #888; font-style: italic; text-align: center; margin-top: 5px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
                        <div>* Tẩy Tủy thường: 1000 LT + 1 Tẩy Tủy Đan. (Phàm -> Chí Tôn)</div>
                        <div>* Tẩy Tủy cao cấp: 5000 LT + 1 Tẩy Tủy Đan Cao Cấp. (Địa -> Chí Tôn)</div>
                    </div>
                </div>
            `;
        },

        showPlayerProfile: function() {
            const proxy = (typeof Game !== 'undefined') ? Game.getProxy() : null;
            if (!proxy) return;

            const rank = (typeof GameData !== 'undefined' && GameData.ranks) ? (GameData.ranks[proxy.rankIndex] || { name: "Phàm Nhân" }) : { name: "Phàm Nhân" };
            const title = (typeof GameData !== 'undefined' && GameData.titles) ? (GameData.titles[proxy.currentTitleId] || { name: "Vô Danh Tiểu Tốt" }) : { name: "Vô Danh Tiểu Tốt" };
            const boneData = (typeof GameData !== 'undefined' && GameData.boneQualities) ? (GameData.boneQualities[proxy.boneQualityId] || GameData.boneQualities["pham"]) : { name: "Phàm Cốt", color: "#888" };
            
            // Lấy chỉ số tổng cộng từ breakdowns nếu có
            const getStat = (id, base) => {
                const b = statBreakdowns[id];
                if (b) return b.base + b.equip + b.skill + (b.pet || 0) + (b.title || 0) + (b.bone || 0);
                return base;
            };

            const totalAtk = getStat('atk', proxy.atk);
            const totalDef = getStat('def', proxy.def);
            const totalThanphap = getStat('thanphap', proxy.thanphap);
            const totalLuk = getStat('luk', proxy.luk);
            
            const bHp = statBreakdowns['hp'] || statBreakdowns['hpMax'];
            const maxHp = bHp ? (bHp.base + bHp.equip + bHp.skill + (bHp.pet || 0) + (bHp.title || 0) + (bHp.bone || 0)) : 100;
            
            const bMp = statBreakdowns['mp'] || statBreakdowns['mpMax'];
            const maxMp = bMp ? (bMp.base + bMp.equip + bMp.skill + (bMp.pet || 0) + (bMp.title || 0) + (bMp.bone || 0)) : 50;

            let html = `
                <div style="display: flex; flex-direction: column; gap: 12px; padding: 5px;">
                    <div style="display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: inset 0 0 15px rgba(0,0,0,0.5);">
                        <div style="width: 60px; height: 60px; background: #1a1a1a; border: 2px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; box-shadow: 0 0 12px rgba(212, 175, 55, 0.3)">
                            🧑‍🌾
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; justify-content: center;">
                            <div style="display: flex;">
                                <div onclick="UI.openTitleMenu()" style="color: ${title.color || '#888'}; font-size: 0.85rem; font-weight: bold; line-height: 1.2; padding: 2px 0; cursor: pointer;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">[${title.name}] <span style="font-size: 0.6rem; color: #666; font-weight: normal;">(Thay đổi)</span></div>
                            </div>
                            <div style="color: #d4af37; font-size: 1.4rem; font-weight: bold; text-shadow: 0 0 8px rgba(212, 175, 55, 0.5); line-height: 1.2;">${proxy.name || "Đạo Hữu"}</div>
                            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                <span onclick="UI.showRankDetail(${proxy.rankIndex})" style="background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 4px; color: #fff; font-size: 0.75rem; cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">${rank.name}</span>
                                <span style="color: #666;">|</span>
                                <span onclick="UI.showBoneDetail('${proxy.boneQualityId}')" style="color: ${boneData.color}; font-weight: bold; font-size: 0.75rem; cursor: pointer;" onmouseover="this.style.textShadow='0 0 8px ${boneData.color}'" onmouseout="this.style.textShadow='none'">${boneData.name}</span>
                                <span style="color: #666;">|</span>
                                <span style="color: #ff9800; font-size: 0.75rem;">Lực chiến: ${formatNumber(proxy.power)}</span>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid #333;">
                            <div style="color: #888; font-size: 0.65rem; margin-bottom: 6px; letter-spacing: 1px; font-weight: bold;">THUỘC TÍNH</div>
                            <div onclick="UI.showStatDetail('hp')" style="display: flex; justify-content: space-between; margin-bottom: 4px; cursor: pointer; padding: 2px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"><span style="color: #aaa; font-size: 0.75rem;">Sinh mệnh:</span> <b style="color: #ff4444; font-size: 0.75rem;">${formatNumber(maxHp)}</b></div>
                            <div onclick="UI.showStatDetail('mp')" style="display: flex; justify-content: space-between; margin-bottom: 4px; cursor: pointer; padding: 2px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"><span style="color: #aaa; font-size: 0.75rem;">Linh lực:</span> <b style="color: #2196f3; font-size: 0.75rem;">${formatNumber(maxMp)}</b></div>
                            <div onclick="UI.showStatDetail('stamina')" style="display: flex; justify-content: space-between; cursor: pointer; padding: 2px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"><span style="color: #aaa; font-size: 0.75rem;">Thể lực:</span> <b style="color: #4caf50; font-size: 0.75rem;">${formatNumber(proxy.staminaMax)}</b></div>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid #333;">
                            <div style="color: #888; font-size: 0.65rem; margin-bottom: 6px; letter-spacing: 1px; font-weight: bold;">CHIẾN ĐẤU</div>
                            <div onclick="UI.showStatDetail('atk')" style="display: flex; justify-content: space-between; margin-bottom: 4px; cursor: pointer; padding: 2px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"><span style="color: #aaa; font-size: 0.75rem;">Tấn công:</span> <b style="color: #eee; font-size: 0.75rem;">${formatNumber(totalAtk)}</b></div>
                            <div onclick="UI.showStatDetail('def')" style="display: flex; justify-content: space-between; margin-bottom: 4px; cursor: pointer; padding: 2px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"><span style="color: #aaa; font-size: 0.75rem;">Phòng ngự:</span> <b style="color: #eee; font-size: 0.75rem;">${formatNumber(totalDef)}</b></div>
                            <div onclick="UI.showStatDetail('thanphap')" style="display: flex; justify-content: space-between; margin-bottom: 4px; cursor: pointer; padding: 2px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"><span style="color: #aaa; font-size: 0.75rem;">Thân pháp:</span> <b style="color: #eee; font-size: 0.75rem;">${formatNumber(totalThanphap)}</b></div>
                            <div onclick="UI.showStatDetail('luk')" style="display: flex; justify-content: space-between; cursor: pointer; padding: 2px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"><span style="color: #aaa; font-size: 0.75rem;">May mắn:</span> <b style="color: #eee; font-size: 0.75rem;">${formatNumber(totalLuk)}</b></div>
                        </div>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid #333;">
                        <div style="color: #888; font-size: 0.65rem; margin-bottom: 8px; letter-spacing: 1px; font-weight: bold;">THẦN THÔNG ĐÃ LĨNH NGỘ</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${proxy.skills && proxy.skills.length > 0 ? proxy.skills.map(sid => {
                                const s = GameData.skills[sid];
                                if (!s) return '';
                                return `<div onclick="UI.showSkillDetail('${sid}')" style="background: rgba(255,255,255,0.05); border: 1px solid ${s.color || '#444'}; color: ${s.color || '#eee'}; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                    <span>${s.icon || '📜'}</span>
                                    <span>${s.name}</span>
                                    ${s.type !== 'passive' ? `<span style="color: #f44336; font-size: 0.6rem; margin-left: 2px;">(Hồi chiêu: ${s.cooldown || 0}s)</span>` : ''}
                                </div>`;
                            }).join('') : '<i style="color: #555; font-size: 0.7rem; width: 100%; text-align: center; display: block; padding: 10px;">Chưa lĩnh ngộ thần thông nào...</i>'}
                        </div>
                    </div>
                </div>
            `;

            this.openModal("HỒ SƠ ĐẠO HỮU", html, false);
        },

        showStatDetail: function(statId) {
            const statMap = {
                power: { name: "Lực Chiến", desc: "Tổng hợp sức mạnh dựa trên Công, Thủ, Thân Pháp và Cảnh Giới. Quyết định khả năng gia nhập môn phái và uy danh giang hồ." },
                hp: { name: "Sinh Mệnh", desc: "Máu của bạn. Khi về 0, bạn sẽ bại trận và mất một phần tu vi hoặc linh thạch. Tăng cấp Cảnh giới và trang bị Giáp/Trang sức để tăng mạnh Sinh mệnh." },
                mp: { name: "Linh Lực", desc: "Năng lượng cần thiết để thi triển Thần Thông. Linh lực càng cao, bạn càng dùng được nhiều chiêu thức mạnh. Tăng cấp Cảnh giới và trang bị Pháp bảo để tăng Linh lực." },
                stamina: { name: "Thể Lực", desc: "Năng lượng dùng cho các hoạt động Tu Luyện, Thám Hiểm và làm nhiệm vụ Môn Phái. Hồi phục theo thời gian hoặc dùng đan dược." },
                atk: { name: "Tấn Công", desc: "Sức mạnh tấn công cơ bản. Ảnh hưởng trực tiếp đến sát thương gây ra cho kẻ thù. Vũ khí là nguồn cung cấp Tấn công chính." },
                def: { name: "Phòng Ngự", desc: "Khả năng chống chịu. Giảm sát thương nhận vào từ các đòn tấn công của kẻ thù. Giảm tối đa 70% sát thương." },
                thanphap: { 
                    name: "Thân Pháp", 
                    desc: "Tốc độ ra đòn và khả năng né tránh. Thân pháp cao giúp bạn tấn công nhanh hơn và có cơ hội né hoàn toàn đòn đánh của địch.",
                    hidden: [
                        { name: "Tốc độ tấn công", desc: "Mỗi 100 điểm Thân pháp giảm 0.1s thời gian chờ giữa các đòn đánh (Tối thiểu 1.0s)." },
                        { name: "Tỉ lệ Né tránh", desc: "Tăng khả năng né tránh đòn đánh. Cơ bản 5%, tối đa 35%." }
                    ]
                },
                luk: { 
                    name: "May Mắn", 
                    desc: "Ảnh hưởng đến vận khí của đạo hữu trên con đường tu tiên.",
                    hidden: [
                        { name: "Bạo kích", desc: "Tăng tỉ lệ gây sát thương bạo kích (x1.5). Cơ bản 5%, tối đa 45%." },
                        { name: "Kỳ ngộ", desc: "Tăng xác suất gặp các sự kiện may mắn, rớt đồ hiếm và nhận được trang bị có chỉ số tốt." }
                    ]
                }
            };
            const info = statMap[statId] || { name: statId.toUpperCase(), desc: "Thuộc tính nhân vật." };
            
            let content = `<div style="text-align: left;"><p style="color: #eee; font-size: 0.85rem; margin-bottom: 12px; line-height: 1.4;">${info.desc}</p>`;
            
            if (info.hidden) {
                content += `<div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 235, 59, 0.05); border: 1px solid rgba(255, 235, 59, 0.2); border-radius: 8px;">
                                <b style="color: #ffeb3b; font-size: 0.75rem; display: block; margin-bottom: 8px;">✨ CHỈ SỐ ẨN ẢNH HƯỞNG:</b>`;
                info.hidden.forEach(h => {
                    content += `<div style="margin-bottom: 6px;">
                                    <span style="color: #ffeb3b; font-size: 0.7rem;">• ${h.name}:</span>
                                    <span style="color: #aaa; font-size: 0.65rem; display: block; margin-left: 10px;">${h.desc}</span>
                                </div>`;
                });
                content += `</div>`;
            }

            const breakdownKey = info.key || statId;
            const b = statBreakdowns[breakdownKey] || (statId === 'hp' ? statBreakdowns['hp'] : null) || (statId === 'mp' ? statBreakdowns['mp'] : null);
            
            if (b) {
                content += `<b style="color: #888; font-size: 0.65rem; display: block; margin-bottom: 6px; letter-spacing: 1px;">NGUỒN CHỈ SỐ:</b>`;
                content += `<div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; border: 1px solid #444;">`;
                
                const rows = [
                    { label: "Chỉ số cơ bản", value: b.base, color: "#eee" },
                    { label: "Trang bị", value: b.equip, color: "#4caf50" },
                    { label: "Thần thông", value: b.skill, color: "#2196f3" },
                    { label: "Linh thú", value: b.pet, color: "#ff9800" },
                    { label: "Căn cốt", value: b.bone, color: "#00f2ff" },
                    { label: "Danh hiệu", value: b.title, color: "#a335ee" },
                    { label: "Kỳ ngộ", value: b.event || 0, color: "#ffeb3b" }
                ];
                
                rows.forEach(row => {
                    if (row.value !== 0 || row.label === "Chỉ số cơ bản") {
                        const sign = row.value > 0 ? "+" : "";
                        const valStr = row.label === "Chỉ số cơ bản" ? row.value : `${sign}${row.value}`;
                        content += `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.8rem;">
                                <span style="color: #888;">${row.label}:</span>
                                <b style="color: ${row.color}">${valStr}</b>
                            </div>`;
                    }
                });
                
                const total = b.base + b.equip + b.skill + (b.pet || 0) + (b.title || 0) + (b.bone || 0) + (b.event || 0);
                content += `<hr style="border: 0.5px solid #333; margin: 8px 0;">`;
                content += `
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: bold;">
                        <span style="color: #fff;">TỔNG CỘNG:</span>
                        <span style="color: #ffeb3b;">${total}</span>
                    </div>`;
                
                // Hiển thị giảm sát thương nếu là Phòng Ngự
                if (statId === 'def' && typeof BattleSystem !== 'undefined') {
                    const reduction = BattleSystem.calcDamageReduction(total);
                    content += `
                        <div style="margin-top: 12px; padding: 10px; background: rgba(0, 242, 255, 0.1); border: 1px solid rgba(0, 242, 255, 0.3); border-radius: 6px; text-align: center;">
                            <span style="color: #aaa; font-size: 0.8rem;">Giảm sát thương hiện tại:</span>
                            <div style="color: #00f2ff; font-size: 1.2rem; font-weight: bold; margin-top: 4px;">${Math.round(reduction * 100)} %</div>
                            <p style="color: #666; font-size: 0.65rem; margin-top: 4px; font-style: italic;">(Giảm tối đa 70 % sát thương nhận vào)</p>
                        </div>`;
                }
                
                content += `</div>`;
            }
            
            content += `</div>`;
            this.openModal(info.name, content, false);
        },

        showRankDetail: function(rankIndex) {
            const rank = GameData.ranks[rankIndex];
            if (!rank) return;

            const nextRank = GameData.ranks[rankIndex + 1];
            const multiplier = rank.mult || 1.0;
            const percentage = Math.round((multiplier - 1) * 100);

            let content = `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid #d4af37; text-align: center;">
                        <div style="color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Cảnh Giới Hiện Tại</div>
                        <div style="color: #d4af37; font-size: 1.5rem; font-weight: bold; text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);">${rank.name}</div>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid #333;">
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Chỉ Số Cộng Thêm</div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span style="color: #aaa;">Hệ số tăng trưởng:</span>
                                <b style="color: #4caf50;">x${multiplier}</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span style="color: #aaa;">Tăng tất cả chỉ số:</span>
                                <b style="color: #ff9800;">+${percentage}%</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span style="color: #aaa;">Linh khí yêu cầu:</span>
                                <b style="color: #2196f3;">${(rank.expReq || 0).toLocaleString()}</b>
                            </div>
                        </div>
                        <div style="color: #666; font-size: 0.75rem; font-style: italic; margin-top: 10px; line-height: 1.4; border-top: 1px solid #333; padding-top: 8px;">
                            * Khi đột phá lên cảnh giới này, các chỉ số cơ bản (Công, Thủ, Thân Pháp, May Mắn, Máu) của bạn sẽ được nhân với hệ số đột phá.
                        </div>
                    </div>

                    ${nextRank ? `
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid #333;">
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Cảnh Giới Tiếp Theo</div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                            <span style="color: #aaa;">${nextRank.name}:</span>
                            <b style="color: #4caf50;">x${nextRank.mult} (+${Math.round((nextRank.mult - 1) * 100)}%)</b>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;

            this.openModal("CHI TIẾT CẢNH GIỚI", content, false);
        },

        showBoneDetail: function(boneId) {
            const bone = GameData.boneQualities[boneId];
            if (!bone) return;

            const proxy = Game.getProxy();
            const auraSkills = [
                "skill_aura_shield",
                "skill_aura_evil_reflect",
                "skill_aura_vile_poison",
                "skill_aura_power"
            ];
            const playerAura = proxy.skills.find(sid => auraSkills.includes(sid));

            let benefitsHtml = '';
            if (boneId === 'pham') {
                benefitsHtml = '<div style="color: #888; font-size: 0.85rem;">Không có hiệu quả đặc biệt.</div>';
            } else {
                benefitsHtml = '<ul style="margin: 0; padding-left: 20px; color: #aaa; font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px;">';
                if (bone.cultRate > 1) benefitsHtml += `<li>Tốc độ tu luyện: <b style="color: #4caf50;">+${Math.round((bone.cultRate - 1) * 100)}%</b></li>`;
                if (bone.growthMult > 1) benefitsHtml += `<li>Hệ số tăng trưởng: <b style="color: #2196f3;">x${bone.growthMult}</b></li>`;
                
                if (bone.stats) {
                    if (bone.stats.all) {
                        benefitsHtml += `<li>Tất cả chỉ số: <b style="color: #ff9800;">+${Math.round(bone.stats.all * 100)}%</b></li>`;
                    } else {
                        if (bone.stats.hpMax) benefitsHtml += `<li>Máu tối đa: <b style="color: #ff4444;">+${Math.round(bone.stats.hpMax * 100)}%</b></li>`;
                        if (bone.stats.def) benefitsHtml += `<li>Phòng ngự: <b style="color: #eee;">+${Math.round(bone.stats.def * 100)}%</b></li>`;
                    }
                }
                
                if (bone.tribulationReduction > 0) {
                    benefitsHtml += `<li>Giảm sát thương lôi kiếp: <b style="color: #00f2ff;">${Math.round(bone.tribulationReduction * 100)} %</b></li>`;
                }
                
                if (bone.aura) {
                    if (playerAura) {
                        const skillData = GameData.skills[playerAura];
                        benefitsHtml += `<li><b style="color: #ff4444;">Hào Quang Chí Tôn:</b> Đã thức tỉnh <b>${skillData.name}</b>.</li>`;
                    } else {
                        benefitsHtml += `<li><b style="color: #ff4444;">Hào Quang Chí Tôn:</b> Sở hữu ngẫu nhiên 1 loại thần thông hào quang.</li>`;
                    }
                    benefitsHtml += `<li><i style="color: #ffeb3b; font-size: 0.75rem;">* Đặc biệt: Thần thông hào quang từ Chí Tôn Cốt sẽ bỏ qua mọi yêu cầu về cảnh giới.</i></li>`;
                }
                benefitsHtml += '</ul>';
            }

            let content = `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid ${bone.color}; text-align: center;">
                        <div style="color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Căn Cốt Hiện Tại</div>
                        <div style="color: ${bone.color}; font-size: 1.5rem; font-weight: bold; text-shadow: 0 0 10px ${bone.color}88;">${bone.name}</div>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid #333;">
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Lợi Ích Căn Cốt</div>
                        ${benefitsHtml}
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid #333;">
                        <div style="color: #888; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Miêu Tả</div>
                        <p style="color: #aaa; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                            Căn cốt là thiên phú bẩm sinh của mỗi người khi bước vào con đường tu tiên. Căn cốt càng cao, tốc độ hấp thụ linh khí và khả năng lĩnh ngộ đạo pháp càng mạnh mẽ. Một căn cốt tốt có thể giúp tu sĩ vượt qua những thử thách gian nan nhất trên con đường trường sinh.
                        </p>
                    </div>
                </div>
            `;

            this.openModal("CHI TIẾT CĂN CỐT", content, false);
        },

        /**
         * Mở menu danh hiệu
         */
        openTitleMenu: function() {
            const proxy = Game.getProxy();
            let content = `<div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; padding: 5px;">`;
            proxy.unlockedTitles.forEach(tid => {
                const t = GameData.titles[tid];
                if (!t) return;
                const isCurrent = proxy.currentTitleId === tid;
                content += `
                    <div onclick="UI.showTitleDetail('${tid}')" 
                         style="padding: 10px; background: ${isCurrent ? '#d4af3722' : '#222'}; border: 1px solid ${isCurrent ? '#d4af37' : '#444'}; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <b class="${t.animation || ''}" style="color: ${t.color};">[${t.name}]</b>
                            ${isCurrent ? '<span style="color: #d4af37; font-size: 0.6rem; font-weight: bold; background: rgba(212, 175, 55, 0.1); padding: 2px 4px; border-radius: 3px; border: 1px solid #d4af3744;">ĐANG DÙNG</span>' : ''}
                        </div>
                        <div style="font-size: 0.7rem; color: #888;">${t.desc}</div>
                    </div>`;
            });
            content += `</div>`;
            this.openModal("DANH HIỆU", content, false);
        },

        showTitleDetail: function(tid) {
            const t = GameData.titles[tid];
            if (!t) return;
            const proxy = Game.getProxy();
            const isCurrent = proxy.currentTitleId === tid;

            let html = `
                <div style="text-align: center; padding: 10px;">
                    <h3 class="${t.animation || ''}" style="color: ${t.color}; margin-bottom: 15px; font-size: 1.4rem;">[${t.name}]</h3>
                    
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #444; margin-bottom: 15px; text-align: left;">
                        <div style="color: #ffd700; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px;">📜 MÔ TẢ:</div>
                        <div style="color: #eee; font-size: 0.85rem; line-height: 1.4; margin-bottom: 15px;">${t.desc}</div>
                        
                        <div style="color: #4caf50; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px;">🎯 ĐIỀU KIỆN NHẬN:</div>
                        <div style="color: #aaa; font-size: 0.85rem; font-style: italic; margin-bottom: 15px;">${t.conditionDesc || "Không rõ."}</div>
                        
                        <div style="color: #2196f3; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px;">✨ HIỆU ỨNG:</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${Object.entries(t.buff || {}).length > 0 ? Object.entries(t.buff).map(([k, v]) => {
                                const color = v > 0 ? "#4caf50" : "#ff4444";
                                const sign = v > 0 ? "+" : "";
                                return `<span style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; color: ${color}; border: 1px solid ${color}44;">${k.toUpperCase()} ${sign}${v * 100}%</span>`;
                            }).join('') : '<span style="color: #666; font-size: 0.75rem;">Không có hiệu ứng đặc biệt.</span>'}
                        </div>
                    </div>
                    ${isCurrent ? `
                        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af3744; padding: 8px; border-radius: 6px; color: #d4af37; font-size: 0.75rem; font-weight: bold;">
                            ✨ ĐANG TRANG BỊ ✨
                        </div>
                    ` : ''}
                </div>
            `;

            this.openModal("CHI TIẾT DANH HIỆU", html, !isCurrent, null, 'title', tid);
        },

        /**
         * Xác nhận Reset game (Thay thế confirm bị chặn trong iframe)
         */
        confirmReset: function() {
            const title = "<span style='color: #ff4444;'>XÁC NHẬN RESET</span>";
            const desc = "Đạo hữu có chắc chắn muốn xóa sạch tu vi, bắt đầu lại từ đầu không? Hành động này không thể hoàn tác!";
            
            this.openModal(title, desc);
            const ctrl = document.getElementById('modal-controls');
            
            if(ctrl) {
                const btn = document.createElement('button'); 
                btn.className = "btn-main";
                btn.innerText = "XÁC NHẬN XÓA";
                btn.style.background = "#c62828";
                btn.style.color = "#fff";
                btn.style.padding = "12px";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.fontWeight = "bold";
                btn.style.cursor = "pointer";
                btn.onclick = () => { 
                    Game.resetGame();
                };
                ctrl.prepend(btn);
            }
        },

        confirmRerollBone: function(isAdvanced = false) {
            const pillName = isAdvanced ? "Tẩy Tủy Đan Cao Cấp" : "Tẩy Tủy Đan";
            const stoneCost = isAdvanced ? 5000 : 1000;
            const title = `<span style='color: #d4af37; font-weight: 800; letter-spacing: 1px;'>XÁC NHẬN TẨY TỦY</span>`;
            
            let ratesHtml = "";
            if (isAdvanced) {
                ratesHtml = `
                    <div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.5); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); box-shadow: inset 0 0 10px rgba(0,0,0,0.3);">
                        <div style="color: #ff9800; font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Tỉ lệ nhận được</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #ff00ff;">Chí Tôn Cốt</span>
                                <span style="font-weight: bold;">5%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #ff0000;">Tiên Cốt</span>
                                <span style="font-weight: bold;">15%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #ff9800;">Thiên Cốt</span>
                                <span style="font-weight: bold;">30%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #a335ee;">Địa Cốt</span>
                                <span style="font-weight: bold;">50%</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                ratesHtml = `
                    <div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.5); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); box-shadow: inset 0 0 10px rgba(0,0,0,0.3);">
                        <div style="color: #ff9800; font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Tỉ lệ nhận được</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.7rem;">
                            <div style="display: flex; justify-content: space-between; padding: 3px 6px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #ff00ff;">Chí Tôn</span> <span style="font-weight: bold;">0.5%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 3px 6px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #ff0000;">Tiên Cốt</span> <span style="font-weight: bold;">1.5%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 3px 6px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #ff9800;">Thiên Cốt</span> <span style="font-weight: bold;">5%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 3px 6px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #a335ee;">Địa Cốt</span> <span style="font-weight: bold;">13%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 3px 6px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #2196f3;">Linh Cốt</span> <span style="font-weight: bold;">30%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 3px 6px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                                <span style="color: #ffffff;">Phàm Cốt</span> <span style="font-weight: bold;">50%</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            const desc = `
                <div style="text-align: center; padding: 5px 0;">
                    <div style="color: #fff; font-size: 0.9rem; margin-bottom: 15px; font-weight: 500;">
                        Bạn có muốn sử dụng <span style="color: #00f2ff;">${pillName}</span> để tẩy tủy không?
                    </div>
                    <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 5px;">
                        <div style="background: rgba(0,242,255,0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(0,242,255,0.2); display: flex; flex-direction: column; align-items: center; min-width: 100px;">
                            <span style="font-size: 0.65rem; color: #888; margin-bottom: 2px;">VẬT PHẨM</span>
                            <span style="color: #00f2ff; font-weight: bold; font-size: 0.8rem;">1x ${pillName}</span>
                        </div>
                        <div style="background: rgba(255,215,0,0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,215,0,0.2); display: flex; flex-direction: column; align-items: center; min-width: 100px;">
                            <span style="font-size: 0.65rem; color: #888; margin-bottom: 2px;">CHI PHÍ</span>
                            <span style="color: #ffd700; font-weight: bold; font-size: 0.8rem;">${stoneCost} Linh Thạch</span>
                        </div>
                    </div>
                    ${ratesHtml}
                </div>
            `;
            
            this.openModal(title, desc);
            const ctrl = document.getElementById('modal-controls');
            if(ctrl) {
                const btn = document.createElement('button'); 
                btn.className = isAdvanced ? "btn-main btn-red" : "btn-main btn-yellow";
                btn.innerText = "XÁC NHẬN";
                btn.style.flex = "1";
                btn.style.height = "40px";
                btn.onclick = () => { 
                    Game.rerollBone(isAdvanced);
                    this.closeModal(); 
                };
                ctrl.prepend(btn);
                
                const closeBtn = ctrl.querySelector('.btn-gray');
                if (closeBtn) {
                    closeBtn.style.flex = "1";
                    closeBtn.style.height = "40px";
                }
            }
        },

        /**
         * Xác nhận phóng sinh linh thú
         */
        confirmReleasePet: function(petUid) {
            const pet = Game.getProxy().pets.find(p => p.uid === petUid);
            if (!pet) return;
            
            const petName = PetSystem.getPetDisplayName(petUid, Game.getProxy().pets);
            const title = "<span style='color: #f44336;'>PHÓNG SINH LINH THÚ</span>";
            const desc = `Đạo hữu có chắc chắn muốn phóng sinh <b>${petName}</b>? Linh thú sẽ rời đi vĩnh viễn và không thể tìm lại!`;
            
            this.openModal(title, desc);
            const ctrl = document.getElementById('modal-controls');
            
            if(ctrl) {
                const btn = document.createElement('button'); 
                btn.className = "btn-main";
                btn.innerText = "XÁC NHẬN PHÓNG SINH";
                btn.style.background = "#f44336";
                btn.style.color = "#fff";
                btn.style.padding = "12px";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.fontWeight = "bold";
                btn.style.cursor = "pointer";
                btn.onclick = () => { 
                    PetSystem.releasePet(petUid);
                    this.closeModal();
                    this.renderPetTab();
                };
                ctrl.prepend(btn);
            }
        },

        /**
         * Xác nhận bán vật phẩm
         */
        confirmSellItem: function(itemIndex) {
            const proxy = Game.getProxy();
            const item = proxy.items[itemIndex];
            if (!item) return;
            
            const itemData = BagSystem.getItemData(item.id);
            if (!itemData) return;
            
            const title = "<span style='color: #ffeb3b;'>XÁC NHẬN BÁN VẬT PHẨM</span>";
            const desc = `Đạo hữu chắc chắn muốn bán <b>${itemData.name}</b> với giá <b>${itemData.value}</b> Linh Thạch?`;
            
            this.openModal(title, desc);
            const ctrl = document.getElementById('modal-controls');
            
            if(ctrl) {
                const btn = document.createElement('button'); 
                btn.className = "btn-main";
                btn.innerText = "XÁC NHẬN BÁN";
                btn.style.background = "#4caf50";
                btn.style.color = "#fff";
                btn.style.padding = "12px";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.fontWeight = "bold";
                btn.style.cursor = "pointer";
                btn.onclick = () => { 
                    BagSystem.sellItem(itemIndex, 1);
                    this.closeModal();
                    this.renderInventoryTab();
                };
                ctrl.prepend(btn);
            }
        },

        /**
         * Cập nhật giao diện trang bị
         */
        updateEquipUI: function(equipments) {
            const slots = ['head', 'body', 'legs', 'weapon', 'ring', 'accessory', 'soul'];
            slots.forEach(slot => {
                const el = document.getElementById(`slot-${slot}`);
                if (!el) return;

                const item = equipments[slot];
                if (item) {
                    const data = GameData.items[item.id];
                    if (data) {
                        const color = this.getRarityColor(data.rarity);
                        
                        let qualityLabel = "";
                        if (item.variance) {
                            if (item.variance >= 110) qualityLabel = `<span style="font-size: 0.5rem; color: #ffeb3b; display: block; font-weight: bold;">&nbsp;(cực tốt)</span>`;
                            else if (item.variance > 100) qualityLabel = `<span style="font-size: 0.5rem; color: #ffeb3b; display: block;">&nbsp;(tốt)</span>`;
                            else if (item.variance === 100) qualityLabel = `<span style="font-size: 0.5rem; color: #4caf50; display: block;">&nbsp;(bình thường)</span>`;
                            else if (item.variance <= 90) qualityLabel = `<span style="font-size: 0.5rem; color: #ff4444; display: block; font-weight: bold;">&nbsp;(cực tệ)</span>`;
                            else qualityLabel = `<span style="font-size: 0.5rem; color: #ff4444; display: block; font-weight: bold;">&nbsp;(tệ)</span>`;
                        }

                        el.innerHTML = `<div style="color: ${color}; font-size: 1.2rem;">${data.icon || '📦'}</div>
                                        <div style="font-size: 0.5rem; color: ${color}; margin-top: 2px;">
                                            ${data.name}
                                            ${qualityLabel}
                                        </div>`;
                        el.style.borderColor = color;
                        el.style.background = `${color}11`;
                        el.onclick = () => this.showEquipDetail(slot);
                    }
                } else {
                    const slotNames = { head: 'MŨ', body: 'GIÁP', legs: 'QUẦN', weapon: 'VŨ KHÍ', ring: 'NHẪN', accessory: 'TRANG SỨC', soul: 'PHÁP BẢO' };
                    el.innerHTML = `<small style="color: #444;">${slotNames[slot]}</small>`;
                    el.style.borderColor = "#333";
                    el.style.background = "transparent";
                    el.onclick = null;
                }
            });
        },

        /**
         * Hiển thị chi tiết trang bị đang mặc để tháo
         */
        showEquipDetail: function(slot) {
            const proxy = Game.getProxy();
            const item = proxy.equipments[slot];
            if (!item) return;

            const data = GameData.items[item.id];
            if (!data) return;

            const color = this.getRarityColor(data.rarity);
            
            let qualityLabel = "";
            if (item.variance) {
                if (item.variance >= 110) qualityLabel = ` <span style="font-size: 0.65rem; color: #ffeb3b; vertical-align: middle; font-weight: bold;">&nbsp;(cực tốt)</span>`;
                else if (item.variance > 100) qualityLabel = ` <span style="font-size: 0.65rem; color: #ffeb3b; vertical-align: middle;">&nbsp;(tốt)</span>`;
                else if (item.variance === 100) qualityLabel = ` <span style="font-size: 0.65rem; color: #4caf50; vertical-align: middle;">&nbsp;(bình thường)</span>`;
                else if (item.variance <= 90) qualityLabel = ` <span style="font-size: 0.65rem; color: #ff4444; vertical-align: middle; font-weight: bold;">&nbsp;(cực tệ)</span>`;
                else qualityLabel = ` <span style="font-size: 0.65rem; color: #ff4444; vertical-align: middle; font-weight: bold;">&nbsp;(tệ)</span>`;
            }

            const title = `<span style="color: ${color}">${data.name}${qualityLabel}</span>`;
            let desc = `<div style="text-align: left; line-height: 1.6;">`;
            desc += `<div style="font-size: 0.7rem; color: #888; margin-bottom: 4px; text-transform: uppercase; cursor: pointer;" onclick="UI.showRarityInfo()">Phẩm chất: <span style="color: ${color}; font-weight: bold;">${this.getRarityName(data.rarity)}</span></div>`;
            
            if (item.variance) {
                desc += `<div style="font-size: 0.6rem; color: #aaa; margin-bottom: 4px; opacity: 0.7;">Chất lượng: <b style="color: ${item.variance >= 100 ? (item.variance > 100 ? '#ffeb3b' : '#4caf50') : '#ff4444'}">${item.variance}%</b> so với cơ bản</div>`;
            }

            desc += `<p style="color: #aaa; font-style: italic; margin-bottom: 10px;">"${data.desc}"</p>`;
            desc += `<div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; border: 1px solid #333;">`;
            desc += `<b style="color: #ffeb3b; display: block; margin-bottom: 5px;">THUỘC TÍNH:</b>`;
            desc += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;">`;
            
            const displayStats = item.stats || data.stats;

            // Hiển thị May mắn trước nếu có (màu vàng), chiếm trọn dòng đầu
            if (displayStats.luk) {
                desc += `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ffeb3b; font-weight: bold; grid-column: span 2; border-bottom: 1px solid rgba(255,235,59,0.1); padding-bottom: 2px; margin-bottom: 2px;">
                            <span>May Mắn:</span>
                            <b>+${displayStats.luk}</b>
                         </div>`;
            }

            for (let s in displayStats) {
                if (s === 'luk') continue; // Đã hiển thị ở trên

                const statName = { 
                    atk: "Tấn Công", 
                    def: "Phòng Ngự", 
                    hp: "Sinh Mệnh", 
                    mp: "Linh Lực", 
                    thanphap: "Thân Pháp", 
                    hpMult: "Bội Số Sinh lực",
                    mpMult: "Bội Số Linh lực",
                    staMult: "Bội Số Thể lực"
                }[s] || s.toUpperCase();

                const val = displayStats[s];
                const isPositive = val >= 0;
                const sign = isPositive ? "+" : "-";
                const statColor = "#4caf50";
                const absVal = Math.abs(val);
                desc += `<div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                            <span style="color: #aaa;">${statName}:</span>
                            <b style="color: ${statColor};">${sign}${absVal}${s.endsWith('Mult') ? '%' : ''}</b>
                         </div>`;
            }
            desc += `</div></div>`;

            this.openModal(title, desc);
            const ctrl = document.getElementById('modal-controls');
            if(ctrl) {
                const btn = document.createElement('button'); 
                btn.className = "btn-main btn-red";
                btn.style.flex = "1";
                btn.style.padding = "6px 12px";
                btn.style.fontSize = "0.75rem";
                btn.innerText = "THÁO TRANG BỊ";
                btn.onclick = () => { 
                    if (window.EquipSystem) EquipSystem.unequip(slot);
                    this.closeModal(); 
                };
                ctrl.prepend(btn);
            }
        },
        shouldHideEnemyStats: function(enemy) {
            if (!enemy) return false;
            const proxy = typeof Game !== 'undefined' ? Game.getProxy() : null;
            if (!proxy) return false;

            const playerRank = proxy.rankIndex || 0;
            const enemyRank = enemy.rankIndex || 0;
            
            // Ẩn nếu đối thủ mạnh hơn từ 3 cảnh giới trở lên
            if (enemyRank > playerRank + 3) return true;
            
            const playerPower = proxy.power || 0;
            // Ước tính lực chiến kẻ thù tương đương công thức trong core.js
            const enemyPower = (enemy.atk * 2.5 + (enemy.def || 0) * 1.8 + (enemy.thanphap || 1) * 4 + (enemy.hp / 10) * 0.15) * (enemy.isBoss ? 2 : 1);
            
            // Nếu lực chiến chênh lệch gấp 3 lần
            return (playerPower > 0 && (enemyPower / playerPower > 3));
        },

        showEnemyDetail: function() {
            if (!this.currentEnemy) return;
            const enemy = this.currentEnemy;
            const hideStats = this.shouldHideEnemyStats(enemy);

            let bossPassive = "";
            if (enemy.isBoss) {
                bossPassive = `
                    <div style="background:rgba(255,152,0,0.1); padding:8px; border-radius:4px; margin-bottom:10px; border:1px solid rgba(255,152,0,0.3); text-align: left;">
                        <b style="color:#ff9800; font-size:0.8rem;">✨ NỘI TẠI BOSS:</b>
                        <div style="font-size:0.7rem; color:#eee; margin-top:4px;">
                            • <b>Kháng Tính:</b> ${hideStats ? '??????' : 'Giảm 50% thời gian hiệu lực của mọi hiệu ứng xấu.'}
                        </div>
                        <div style="font-size:0.7rem; color:#eee; margin-top:2px;">
                            • <b>Nghịch Cảnh Hào Quang cấp cao:</b> ${hideStats ? '??????' : 'Khi HP dưới 50%, bộc phát hào quang tăng mạnh thuộc tính trong 10s.'}
                        </div>
                    </div>
                `;
            }

            let skillList = "";
            if (enemy.skills && enemy.skills.length > 0) {
                skillList = `
                    <div style='margin-top:10px; border-top:1px solid #333; padding-top:10px;'>
                        <b style='color:#d4af37'>Kỹ năng:</b>
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-top:8px;">
                `;
                enemy.skills.forEach(s => {
                    const skillData = GameData.skills[s.id] || s;
                    if (skillData) {
                        const isMysterious = enemy.name && (enemy.name.includes("Bí Ẩn") || enemy.name.includes("Vô Danh"));
                        const name = (hideStats && isMysterious) ? "??????" : skillData.name;
                        const cd = skillData.cooldown ? ` <span style="color:#f44336; font-size:0.6rem;">(${skillData.cooldown}s)</span>` : "";
                        skillList += `
                            <div style="background:#1a1a1a; padding:6px; border-radius:4px; border:1px solid #333; font-size:0.7rem; text-align:center; cursor:pointer;" 
                                 onclick="${hideStats ? '' : `UI.showSkillDetail('${s.id}', true)`}">
                                <div style="color:#ffeb3b; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${name}</div>
                                ${hideStats ? '' : `<div style="color:#888; font-size:0.6rem; margin-top:2px;">${cd}</div>`}
                            </div>`;
                    }
                });
                skillList += "</div></div>";
            }

            const hpVal = (enemy.isTribulation || hideStats) ? "?????" : formatNumber(enemy.maxHp || enemy.hp);
            const atkVal = (enemy.isTribulation || hideStats) ? "?????" : formatNumber(enemy.atk);
            const defVal = (enemy.isTribulation || hideStats) ? "?????" : formatNumber(enemy.def || 0);
            const thanphapVal = (enemy.isTribulation || hideStats) ? "?????" : formatNumber(enemy.thanphap || 1);
            const shieldVal = (enemy.isTribulation || hideStats) ? "?????" : formatNumber(enemy.shield || 0);
            const defRed = (enemy.isTribulation || hideStats) ? "" : `<small style="color:#00f2ff">(Giảm ${Math.round(BattleSystem.calcDamageReduction(enemy.def) * 100)} %)</small>`;

            let rankName = (enemy.isTribulation || hideStats) ? "???" : (GameData.ranks[enemy.rankIndex]?.name || "Phàm Nhân");
            if (rankName === "Phàm Nhân") rankName = "Phàm Yêu";

            const desc = `
                ${bossPassive}
                <div style="text-align:center; margin-bottom:10px;">
                    <div style="font-size: 0.8rem; color: #d4af37; margin-bottom: 4px;">Cảnh giới: <b>${rankName}</b></div>
                    <i style="color:#888;">"${enemy.desc || "Một yêu thú bí ẩn."}"</i>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; background:#222; padding:10px; border-radius:4px;">
                    <span>HP: <b style="color:#4caf50">${hpVal}</b></span>
                    <span>Công: <b style="color:#f44336">${atkVal}</b></span>
                    <span>Thủ: <b style="color:#2196f3">${defVal}</b> ${defRed}</span>
                    <span>Thân pháp: <b style="color:#ff9800">${thanphapVal}</b></span>
                </div>
                ${hideStats ? `<p style="color:#ff4444; font-size:0.75rem; margin-top:8px; text-align:center;">⚠️ <i>Thực lực chênh lệch quá xa, không thể nhìn thấu!</i></p>` : ''}
                ${skillList}
            `;
            this.openModal(enemy.name, desc);
        },

        /**
         * Hiển thị danh sách linh thú
         */
        renderQuestTab: function(proxy) {
            this.renderDailyMissions(proxy);
            
            const container = document.getElementById('quest-list');
            if (!container) return;
            container.innerHTML = "";

            if (!proxy.quests || proxy.quests.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: #666; padding: 40px 20px; font-style: italic;">Hiện tại đạo hữu chưa có nhiệm vụ nào...</div>`;
                return;
            }

            proxy.quests.forEach(quest => {
                const isCompleted = quest.status === 'completed';
                const card = document.createElement('div');
                card.className = 'quest-card';
                card.style.cssText = `
                    background: rgba(255,255,255,0.05);
                    border: 1px solid ${isCompleted ? '#4caf50' : '#d4af37'}44;
                    padding: 12px;
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                `;

                // Check actual progress from inventory if it's a collection quest
                let currentProgress = quest.progress;
                if (quest.targetItem) {
                    const itemCount = proxy.inventory.reduce((acc, item) => item.id === quest.targetItem ? acc + item.count : acc, 0);
                    currentProgress = itemCount;
                }

                const progressPercent = Math.min(100, (currentProgress / quest.target) * 100);

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <b style="color: ${isCompleted ? '#4caf50' : '#d4af37'}; font-size: 0.9rem;">${quest.name}</b>
                        <span style="font-size: 0.65rem; color: ${isCompleted ? '#4caf50' : '#ff9800'}; border: 1px solid; padding: 1px 5px; border-radius: 4px;">
                            ${isCompleted ? 'ĐÃ HOÀN THÀNH' : 'ĐANG THỰC HIỆN'}
                        </span>
                    </div>
                    <p style="font-size: 0.75rem; color: #aaa; margin-bottom: 10px; line-height: 1.4;">${quest.desc}</p>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="flex: 1; background: #222; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${progressPercent}%; height: 100%; background: ${progressPercent >= 100 ? '#4caf50' : '#d4af37'}; transition: width 0.3s;"></div>
                        </div>
                        <span style="font-size: 0.7rem; color: #eee; min-width: 40px; text-align: right;">${currentProgress}/${quest.target}</span>
                    </div>
                `;

                if (currentProgress >= quest.target && !isCompleted) {
                    const btn = document.createElement('button');
                    if (quest.id === 'mysterious_quest_1') {
                        btn.innerText = "Dùng tín vật gọi Người Thần Bí";
                        btn.style.cssText = `
                            width: 100%;
                            margin-top: 12px;
                            padding: 8px;
                            background: #9c27b0;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-weight: bold;
                            cursor: pointer;
                            font-size: 0.75rem;
                            box-shadow: 0 0 10px rgba(156, 39, 176, 0.4);
                        `;
                        btn.onclick = () => {
                            const spiritStoneCount = typeof BagSystem !== 'undefined' ? BagSystem.getItemCount("spirit_stone") : 0;
                            if (spiritStoneCount < 100) {
                                UI.addLog("❌ Không đủ linh thạch để sử dụng!", true);
                                return;
                            }
                            
                            if (typeof BagSystem !== 'undefined') {
                                BagSystem.removeItemsById("spirit_stone", 100);
                            }
                            
                            UI.addLog("✨ Đã tiêu tốn 100 Linh Thạch, không gian xung quanh bắt đầu vặn xoắn...");
                            setTimeout(() => {
                                UI.showMysteriousPerson();
                            }, 500);
                        };
                    } else {
                        btn.innerText = "TRẢ NHIỆM VỤ";
                        btn.style.cssText = `
                            width: 100%;
                            margin-top: 12px;
                            padding: 8px;
                            background: #4caf50;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-weight: bold;
                            cursor: pointer;
                            font-size: 0.75rem;
                        `;
                        btn.onclick = () => {
                            // Logic cho các nhiệm vụ khác nếu có
                        };
                    }
                    card.appendChild(btn);
                }

                container.appendChild(card);
            });
        },

        /**
         * Hiển thị danh sách linh thú
         */
        renderDailyMissions: function(proxy) {
            const container = document.getElementById('daily-mission-list');
            if (!container) return;
            container.innerHTML = "";

            if (!proxy.dailyMissions || Object.keys(proxy.dailyMissions).length === 0) {
                container.innerHTML = `<div style="text-align: center; color: #666; padding: 10px; font-style: italic; font-size: 0.75rem;">Hôm nay không có nhiệm vụ hàng ngày...</div>`;
                return;
            }

            Object.values(proxy.dailyMissions).forEach(mission => {
                const missionDef = GameData.dailyMissions[mission.id];
                if (!missionDef) return;

                const isCompleted = mission.progress >= mission.target;
                const isClaimed = mission.claimed;
                const levelColor = '#ffffff';
                const levelName = mission.level === 2 ? 'CẤP 2 (130% Thưởng)' : 'CẤP 1 (100% Thưởng)';

                const card = document.createElement('div');
                card.style.cssText = `
                    background: rgba(255,255,255,0.03);
                    border: 1px solid ${isClaimed ? '#333' : (isCompleted ? '#4caf50' : '#d4af37')}44;
                    padding: 10px;
                    border-radius: 8px;
                    opacity: ${isClaimed ? '0.6' : '1'};
                `;

                const progressPercent = Math.min(100, (mission.progress / mission.target) * 100);
                const description = missionDef.desc.replace('{target}', mission.target);

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                        <div>
                            <b style="color: ${isClaimed ? '#888' : (isCompleted ? '#4caf50' : '#d4af37')}; font-size: 0.85rem;">${missionDef.name}</b>
                            <div style="font-size: 0.6rem; color: ${levelColor}; font-weight: bold; margin-top: 2px;">${levelName}</div>
                        </div>
                        <span style="font-size: 0.6rem; color: ${isClaimed ? '#888' : (isCompleted ? '#4caf50' : '#ff9800')}; border: 1px solid; padding: 1px 4px; border-radius: 3px;">
                            ${isClaimed ? 'ĐÃ NHẬN' : (isCompleted ? 'HOÀN THÀNH' : 'ĐANG LÀM')}
                        </span>
                    </div>
                    <p style="font-size: 0.7rem; color: #888; margin-bottom: 8px;">${description}</p>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; background: #222; height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="width: ${progressPercent}%; height: 100%; background: ${isClaimed ? '#555' : (progressPercent >= 100 ? '#4caf50' : '#d4af37')}; transition: width 0.3s;"></div>
                        </div>
                        <span style="font-size: 0.65rem; color: #eee; min-width: 35px; text-align: right;">${mission.progress}/${mission.target}</span>
                    </div>
                `;

                if (isCompleted) {
                    const btn = document.createElement('button');
                    btn.innerText = isClaimed ? "ĐÃ NHẬN THƯỞNG" : "NHẬN THƯỞNG";
                    btn.disabled = isClaimed;
                    btn.style.cssText = `
                        width: 100%;
                        margin-top: 10px;
                        padding: 6px;
                        background: ${isClaimed ? '#333' : '#4caf50'};
                        color: ${isClaimed ? '#888' : 'white'};
                        border: none;
                        border-radius: 4px;
                        font-weight: bold;
                        cursor: ${isClaimed ? 'default' : 'pointer'};
                        font-size: 0.7rem;
                        opacity: ${isClaimed ? '0.6' : '1'};
                    `;
                    if (!isClaimed) {
                        btn.onclick = () => Game.claimDailyMissionReward(mission.id);
                    }
                    card.appendChild(btn);
                }

                container.appendChild(card);
            });
        },

        renderPetTab: function(proxy) {
            if (!proxy && typeof Game !== 'undefined') proxy = Game.getProxy();
            if (!proxy) return;
            
            const hatcheryList = document.getElementById('pet-hatchery-list');
            const petList = document.getElementById('pet-list');
            if (!petList || !hatcheryList) return;
            
            // --- PHẦN 1: LÒ ẤP TRỨNG ---
            hatcheryList.innerHTML = '';
            const incubatingCount = proxy.incubatingEggs ? proxy.incubatingEggs.length : 0;
            const hatcheryCountEl = document.querySelector('#pet-ui h4 span');
            if (hatcheryCountEl) hatcheryCountEl.innerText = `(${incubatingCount}/3)`;

            if (!proxy.incubatingEggs || proxy.incubatingEggs.length === 0) {
                hatcheryList.innerHTML = `
                    <div style="text-align: center; padding: 10px; color: #666; font-size: 0.8rem; font-style: italic;">
                        Chưa có trứng nào đang được ấp...
                    </div>
                `;
            } else {
                let incubationHTML = `<div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">`;
                proxy.incubatingEggs.forEach((egg, index) => {
                    const itemData = GameData.items[egg.itemId];
                    const elapsed = Date.now() - egg.startTime;
                    const progress = Math.min(100, (elapsed / egg.duration) * 100);
                    const remaining = Math.max(0, Math.ceil((egg.duration - elapsed) / 1000));
                    
                    incubationHTML += `
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border: 1px solid #333;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.8rem;">
                                <span style="color: #fff;">${itemData ? itemData.name : 'Trứng Lạ'}</span>
                                <span style="color: #ffeb3b;">${remaining}s</span>
                            </div>
                            <div style="width: 100%; height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
                                <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #ff9800, #ffeb3b); box-shadow: 0 0 5px #ff9800;"></div>
                            </div>
                        </div>
                    `;
                });
                incubationHTML += `</div>`;
                hatcheryList.innerHTML = incubationHTML;
            }

            // --- PHẦN 2: DANH SÁCH LINH THÚ ---
            petList.innerHTML = '';
            
            if (!proxy.pets || proxy.pets.length === 0) {
                petList.innerHTML = `
                    <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid #444; text-align: center;">
                        <div style="font-size: 3rem; text-align: center;">🥚</div>
                        <h4 style="color: #fff; margin: 5px 0; text-align: center;">Chưa có Linh Thú</h4>
                        <div style="font-size: 0.75rem; color: #aaa; text-align: center;">Đang chờ duyên phận...</div>
                    </div>
                `;
                return;
            }

            proxy.pets.forEach((petObj, index) => {
                // Hỗ trợ cả ID cũ (string), Object cũ (id) và Object mới (uid)
                const petId = typeof petObj === 'string' ? petObj : petObj.id;
                const petUid = (typeof petObj === 'object' && petObj.uid) ? petObj.uid : petId;
                const petData = PetSystem.getPetData(petId);
                if (!petData) return;
                
                const petLevel = (typeof petObj === 'object' && petObj.level) ? petObj.level : 1;
                const isActive = proxy.activePetId === petUid;
                const stats = PetSystem.getPetStats(petId, petLevel, petObj.statMultiplier || 1.0);
                
                const petDisplayName = PetSystem.getPetDisplayName(petUid, proxy.pets);
                const isMutated = (typeof petObj === 'object' && petObj.isMutated);
                
                const petItem = document.createElement('div');
                petItem.style.cssText = `
                    background: ${isActive ? 'rgba(76, 175, 80, 0.1)' : '#1a1a1a'};
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid ${isActive ? '#4caf50' : (isMutated ? '#ffeb3b' : '#333')};
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    position: relative;
                `;
                petItem.onmouseover = () => {
                    petItem.style.borderColor = '#d4af37';
                    petItem.style.transform = 'translateY(-2px)';
                };
                petItem.onmouseout = () => {
                    petItem.style.borderColor = isActive ? '#4caf50' : (isMutated ? '#ffeb3b' : '#333');
                    petItem.style.transform = 'translateY(0)';
                };
                petItem.onclick = () => this.showPetDetail(petUid, petId);

                const rankColor = (GameData.petRanks[petData.rank] || { color: "#00f2ff" }).color;
                petItem.innerHTML = `
                    <div style="font-size: 2.2rem; min-width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; position: relative;">
                        ${petData.icon || '🐾'}
                        ${isActive ? '<div style="position:absolute; top:-4px; right:-4px; background:#4caf50; color:#fff; font-size:6.5px; padding:1px 3px; border-radius:3px; border:1px solid #fff; font-weight:bold; box-shadow: 0 0 3px rgba(76,175,80,0.5); z-index: 2; white-space: nowrap;">XUẤT CHIẾN</div>' : ''}
                        ${isMutated ? '<div style="position:absolute; bottom:-4px; left:-4px; color:#ffeb3b; font-size:6px; font-weight:bold; text-shadow: 0 0 3px #000; z-index: 2;">ĐỘT BIẾN</div>' : ''}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                            <span style="color: ${isActive ? '#4caf50' : '#fff'}; font-weight: bold; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${petDisplayName} <span style="font-size:0.65rem; color:#888; font-weight: normal;">(${stats.realm})</span>
                                ${stats.isSealed ? '<span style="font-size:0.5rem; color:#f44336; font-weight:bold;">[PHONG ẤN]</span>' : ''}
                            </span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                                ${isActive ? '<span style="font-size:0.5rem; background:rgba(76,175,80,0.2); color:#4caf50; padding:1px 4px; border-radius:4px; border:1px solid #4caf50; font-weight: bold;">ĐANG XUẤT CHIẾN</span>' : ''}
                                ${proxy.mountedPetUid === petUid ? '<span style="font-size:0.5rem; color:#ffeb3b; font-weight:bold;">🏇 ĐANG CƯỠI</span>' : ''}
                            </div>
                        </div>
                        <div style="font-size: 0.75rem; color: #aaa; display: flex; gap: 8px;">
                            <span>HP: <b style="color: #ff4444;">${formatNumber(stats.hpMax)}</b></span>
                            <span>ATK: <b style="color: #ff9800;">${formatNumber(stats.atk)}</b></span>
                            <span>DEF: <b style="color: #2196f3;">${formatNumber(stats.def)}</b></span>
                        </div>
                        <div style="font-size: 0.7rem; color: #888; margin-top: 4px; display: flex; justify-content: space-between;">
                            <span>Phẩm cấp: <span style="color:${rankColor}; font-weight: bold;">${petData.rank}</span></span>
                            <span style="color: #4caf50; font-size: 0.65rem;">Tố chất: ${Math.floor((petObj.statMultiplier || 1.0) * 100)}%</span>
                        </div>
                    </div>
                `;
                petList.appendChild(petItem);
            });
        },

        /**
         * Hiển thị chi tiết linh thú trong Modal
         */
        /**
         * Xác nhận xuất chiến linh thú (có kiểm tra cảnh giới)
         */
        confirmActivatePet: function(petUid, petId, isActive) {
            const proxy = Game.getProxy();
            if (isActive) {
                Game.setActivePet('');
                UI.closeModal();
                UI.showPetDetail(petUid, petId);
                return;
            }

            const pet = proxy.pets.find(p => p.uid === petUid);
            if (!pet) return;

            const petRankIndex = PetSystem.getPetRankIndex(petId, pet.level, pet.statMultiplier || 1.0);
            const playerRankIndex = proxy.rankIndex || 0;

            if (petRankIndex > playerRankIndex) {
                const petData = PetSystem.getPetData(petId);
                const petName = petData ? petData.name : "Linh thú";
                
                UI.openModal("CẢNH BÁO LINH THÚ", `
                    <div style="text-align: center; padding: 10px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                        <h3 style="color: #ff4444; margin-bottom: 10px;">CẢNH BÁO CẢNH GIỚI</h3>
                        <p style="color: #ccc; font-size: 0.9rem; line-height: 1.5;">
                            Cảnh giới của <b>${petName}</b> cao hơn đạo hữu. 
                            Nó cảm thấy đạo hữu quá yếu đuối, không xứng tầm làm chủ nhân của nó nữa.
                        </p>
                        <p style="color: #ffeb3b; font-size: 0.9rem; margin-top: 10px; font-weight: bold;">
                            Nếu đạo hữu quyết định cho nó xuất chiến, sau trận đấu này nó sẽ vĩnh viễn bỏ đi!
                        </p>
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            <button onclick="Game.setActivePet('${petUid}', true); UI.closeModal();" 
                                    style="flex: 1; background: #d32f2f; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                                VẪN XUẤT CHIẾN
                            </button>
                            <button onclick="UI.closeModal(); UI.showPetDetail('${petUid}', '${petId}');" 
                                    style="flex: 1; background: #444; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">
                                THÔI QUAY LẠI
                            </button>
                        </div>
                    </div>
                `, true);
                return;
            }

            Game.setActivePet(petUid);
            UI.closeModal();
            UI.showPetDetail(petUid, petId);
        },

        showPetDetail: function(petUid, petId) {
            const proxy = Game.getProxy();
            const petData = PetSystem.getPetData(petId);
            if (!petData) return;
            
            const petDisplayName = PetSystem.getPetDisplayName(petUid, proxy.pets);
            
            // Tìm pet instance trong danh sách của người chơi
            const petInstance = proxy.pets.find(p => p.uid === petUid) || { level: 1, affinity: 10, mana: 0, stamina: 0, spirit: 0, statMultiplier: 1.0 };
            const petLevel = petInstance.level || 1;
            const stats = PetSystem.getPetStats(petId, petLevel, petInstance.statMultiplier || 1.0);
            const isActive = proxy.activePetId === petUid;
            
            // Tính toán chỉ số cộng thêm chính xác
            let bonusTypes = [...(petData.bonusTypes || ["atk"])];
            if (bonusTypes.includes("all") || petData.rank === "Cực phẩm cấp") {
                bonusTypes = ["atk", "def", "thanphap", "hp", "mp", "luk"];
            }
            
            let bonusHtml = `<div style="font-size: 0.85rem; line-height: 1.6;">`;
            bonusTypes.forEach(type => {
                if (type === "atk") bonusHtml += `<div style="color: #ff4444;">⚔️ Tấn công: <span style="font-weight: bold;">+${formatNumber(Math.max(1, Math.floor(stats.atk * 0.2)))}</span></div>`;
                if (type === "def") bonusHtml += `<div style="color: #2196f3;">🛡️ Phòng ngự: <span style="font-weight: bold;">+${formatNumber(Math.max(1, Math.floor(stats.def * 0.2)))}</span></div>`;
                if (type === "thanphap") bonusHtml += `<div style="color: #ffeb3b;">⚡ Thân pháp: <span style="font-weight: bold;">+${formatNumber(Math.max(1, Math.floor(stats.thanphap * 0.1)))}</span></div>`;
                if (type === "hp") bonusHtml += `<div style="color: #ff4444;">🩸 Sinh mệnh: <span style="font-weight: bold;">+${formatNumber(Math.max(1, Math.floor(stats.hpMax * 0.1)))}</span></div>`;
                if (type === "mp") bonusHtml += `<div style="color: #2196f3;">🔷 Linh lực: <span style="font-weight: bold;">+${formatNumber(Math.max(1, Math.floor(stats.mpMax * 0.1)))}</span></div>`;
                if (type === "luk") bonusHtml += `<div style="color: #ffeb3b;">🍀 May mắn: <span style="font-weight: bold;">+${formatNumber(Math.max(1, Math.floor(stats.luk * 0.5)))}</span></div>`;
            });
            bonusHtml += `</div>`;
            
            const loyalty = petInstance.loyalty || 60;
            const loyaltyPercent = Math.min(100, loyalty);
            
            // Xác định trạng thái trung thành
            let loyaltyStatus = "Bình thường";
            let loyaltyColor = "#ff4081"; // Magenta/Pink
            if (loyalty >= 90) loyaltyStatus = "Thân thiết";
            else if (loyalty >= 70) loyaltyStatus = "Yêu quý";
            else if (loyalty >= 40) loyaltyStatus = "Bình thường";
            else if (loyalty >= 20) loyaltyStatus = "Lạnh nhạt";
            else loyaltyStatus = "Muốn bỏ đi";

            const spiritPercent = Math.min(100, ((petInstance.spirit || 0) / stats.maxSpirit) * 100);
            const canLevelUp = (petInstance.spirit || 0) >= stats.maxSpirit;
            const isMutated = petInstance.isMutated;
            const potential = Math.floor((petInstance.statMultiplier || 1.0) * 100);
            
            const skillList = petData.skills.map(sid => {
                const s = GameData.petSkills[sid];
                if (!s) return '';
                const priority = (proxy.skillPriorities && proxy.skillPriorities[sid]) || 'medium';
                const priorityLabels = { 'high': 'CAO', 'medium': 'VỪA', 'low': 'THẤP', 'off': 'TẮT' };
                const priorityColors = { 'high': '#ff4444', 'medium': '#ffeb3b', 'low': '#4caf50', 'off': '#9e9e9e' };
                
                const isLocked = PetSystem.isSkillLocked(sid, petInstance.level || 1, petInstance.skills || petData.skills);
                const lockDesc = isLocked ? PetSystem.getSkillLockDesc(sid, petDisplayName) : "";

                return `
                    <div onclick="UI.showSkillDetail('${sid}', false, ${petInstance.level || 1}, '${petUid}')" 
                         style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; margin-top: 10px; border: 1px solid #333; cursor: pointer; position: relative; border-left: 3px solid ${s.color || '#ffeb3b'}; opacity: ${isLocked ? '0.6' : '1'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="color: #ffeb3b; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.1rem;">${s.icon || '🐾'}</span> ${s.name}
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="background: rgba(255,235,59,0.1); color: ${priorityColors[priority]}; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; border: 1px solid ${priorityColors[priority]}44;">
                                    ${priorityLabels[priority]}
                                </span>
                                <span style="color: #888; font-size: 0.8rem;">▶</span>
                            </div>
                        </div>
                        <div style="font-size: 0.8rem; color: #aaa; line-height: 1.4; margin-bottom: 8px;">${s.desc}</div>
                        ${isLocked ? `<div style="color: #f44336; font-size: 0.7rem; margin-top: 4px; font-weight: bold;">⚠️ ${lockDesc}</div>` : ''}
                        <div style="display: flex; gap: 12px; font-size: 0.7rem; color: #777;">
                            <span>⏳ Hồi: ${s.cooldown}s</span>
                            <span>🔷 Linh lực: ${s.manaCost || 0}</span>
                        </div>
                    </div>
                `;
            }).join('');

            const desc = `
                <div style="text-align: center; margin-bottom: 15px; padding: 0 10px;">
                    <div style="font-size: 2.5rem; margin-bottom: 5px;">${petData.icon || '🐾'}</div>
                    <div style="font-style: italic; color: #888; font-size: 0.8rem; line-height: 1.4; padding: 0 15px;">
                        "${petData.desc || 'Một linh thú trung thành luôn đồng hành cùng đạo hữu.'}"
                    </div>
                </div>

                <!-- Hỗ Trợ Xuất Chiến -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid #333; border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                    <div style="color: #4caf50; font-weight: bold; font-size: 0.85rem; margin-bottom: 8px; border-bottom: 1px solid #222; padding-bottom: 4px;">
                        Hỗ Trợ Xuất Chiến (Cộng cho Nhân Vật)
                    </div>
                    ${bonusHtml}
                </div>

                <!-- Thông Tin Cơ Bản -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid #333; border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #222; padding-bottom: 4px;">
                        <span style="color: #ffeb3b; font-weight: bold; font-size: 0.85rem;">Thông Tin Cơ Bản</span>
                        <span style="font-size: 0.75rem; color: #888;">Cảnh giới: <span style="color: #ffeb3b;">${stats.realm}</span> ${stats.isSealed ? '<span style="color: #f44336; font-size: 0.65rem; font-weight: bold;">(BỊ PHONG ẤN)</span>' : ''}</span>
                    </div>
                    <div style="font-size: 0.85rem; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <span>Phẩm cấp: <span style="color: ${GameData.petRanks[petData.rank]?.color || '#fff'}; font-weight: bold;">${petData.rankName || petData.rank}</span></span>
                        <span style="color: #4caf50; font-size: 0.8rem;">Tố chất: <b style="color: ${isMutated ? '#ffeb3b' : '#4caf50'};">${potential}%</b></span>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
                            <span style="color: #ff9800;">Thể lực</span>
                            <span style="color: #fff;">${formatNumber(Math.floor(petInstance.stamina || 0))}/${formatNumber(stats.stamina)}</span>
                        </div>
                        <div style="height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${Math.min(100, (Math.floor(petInstance.stamina || 0) / stats.stamina) * 100)}%; background: #ff9800;"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
                            <span style="color: #2196f3;">Linh lực</span>
                            <span style="color: #fff;">${formatNumber(Math.floor(petInstance.mana || 0))}/${formatNumber(stats.mpMax)}</span>
                        </div>
                        <div style="height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${Math.min(100, (Math.floor(petInstance.mana || 0) / stats.mpMax) * 100)}%; background: #2196f3;"></div>
                        </div>
                    </div>
                </div>

                <!-- Linh Khí -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid #333; border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="color: #00f2ff; font-weight: bold; font-size: 0.85rem;">Linh Khí (Kinh Nghiệm): ${formatNumber(petInstance.spirit || 0)}/${formatNumber(stats.maxSpirit)}</span>
                        <span style="color: #666; font-size: 0.7rem;">${Math.floor(spiritPercent)}%</span>
                    </div>
                    <div style="height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${spiritPercent}%; background: #00f2ff;"></div>
                    </div>
                </div>

                <!-- Trung Thành -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid #333; border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="color: #ff4081; font-weight: bold; font-size: 0.85rem;">Trung Thành: ${loyaltyPercent}%</span>
                        <span style="color: #888; font-size: 0.75rem;">${loyaltyStatus}</span>
                    </div>
                    <div style="height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${loyaltyPercent}%; background: #ff4081;"></div>
                    </div>
                </div>

                <!-- Chỉ Số Chiến Đấu -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid #333; border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                    <div style="color: #ffeb3b; font-weight: bold; font-size: 0.85rem; margin-bottom: 8px; border-bottom: 1px solid #222; padding-bottom: 4px;">
                        Chỉ Số Chiến Đấu
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem;">
                        <div style="display: flex; justify-content: space-between; padding-right: 10px;">
                            <span style="color: #aaa;">HP:</span>
                            <span style="color: #fff; font-weight: bold;">${formatNumber(stats.hpMax)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">ATK:</span>
                            <span style="color: #fff; font-weight: bold;">${formatNumber(stats.atk)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-right: 10px;">
                            <span style="color: #aaa;">DEF:</span>
                            <span style="color: #fff; font-weight: bold;">${formatNumber(stats.def)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">SPD:</span>
                            <span style="color: #fff; font-weight: bold;">${formatNumber(stats.thanphap)}</span>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="color: #ffeb3b; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px;">Kỹ Năng</div>
                    ${skillList}
                </div>
            `;

            this.openModal(`<span style="color: ${isActive ? '#4caf50' : '#fff'};">${petDisplayName}</span>`, desc);

            // Inject sticky controls
            const ctrl = document.getElementById('modal-controls');
            if (ctrl) {
                ctrl.style.flexDirection = 'column';
                ctrl.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; width: 100%; margin-bottom: 6px;">
                        <button onclick="UI.confirmActivatePet('${petUid}', '${petId}', ${isActive})" 
                                style="background: ${isActive ? '#d32f2f' : '#388e3c'}; color: #fff; border: none; border-radius: 6px; padding: 8px; font-size: 0.7rem; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <span style="font-size: 0.85rem;">${isActive ? '💤' : '⚔️'}</span> ${isActive ? 'NGHỈ' : 'XUẤT CHIẾN'}
                        </button>
                        <button onclick="Game.setMountedPet('${proxy.mountedPetUid === petUid ? '' : petUid}'); UI.closeModal(); UI.showPetDetail('${petUid}', '${petId}');" 
                                style="background: ${proxy.mountedPetUid === petUid ? '#ef6c00' : '#1976d2'}; color: #fff; border: none; border-radius: 6px; padding: 8px; font-size: 0.7rem; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <span style="font-size: 0.85rem;">🏇</span> ${proxy.mountedPetUid === petUid ? 'XUỐNG' : 'CƯỠI THÚ'}
                        </button>
                        <button onclick="PetSystem.openFeedMenu('${petUid}')" 
                                style="background: #7b1fa2; color: #fff; border: none; border-radius: 6px; padding: 8px; font-size: 0.7rem; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <span style="font-size: 0.85rem;">🍎</span> CHO ĂN
                        </button>
                        <button onclick="UI.confirmReleasePet('${petUid}')" 
                                style="background: #546e7a; color: #fff; border: none; border-radius: 6px; padding: 8px; font-size: 0.7rem; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <span style="font-size: 0.85rem;">🍃</span> PHÓNG SINH
                        </button>
                    </div>
                    <button onclick="UI.closeModal()" 
                            style="width: 100%; background: #263238; color: #fff; border: 1px solid #37474f; border-radius: 6px; padding: 8px; font-size: 0.8rem; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 6px; letter-spacing: 1px;">
                        <span style="font-size: 0.9rem;">✖️</span> ĐÓNG
                    </button>
                `;
            }
        },

        showMysteriousPerson: function(callback, isFirstMeeting = false, initialAction = null) {
            // Ngăn chặn hiển thị chồng chéo
            if (document.querySelector('.mysterious-person-container')) return;

            const container = document.createElement('div');
            container.className = 'mysterious-person-container';
            const initialMsg = isFirstMeeting 
                ? `"Ngươi... kẻ phàm trần kia. <br> Ta đã quan sát ngươi thám hiểm Tân Thủ Thôn bấy lâu nay. <br> Có chút thú vị..."`
                : `"Ngươi lại gọi ta?! Có phải đã tìm thấy Tinh Hạch Hoang Lang Vương rồi không?!"`;

            container.innerHTML = `
                <div class="mysterious-person-avatar">
                    <div class="mysterious-eye left"></div>
                    <div class="mysterious-eye right"></div>
                    <img src="https://cdn.pixabay.com/photo/2023/12/21/01/15/mysterious-8460971_1280.jpg" alt="Mysterious Person" referrerPolicy="no-referrer">
                </div>
                <div class="mysterious-dialog">
                    <p class="mysterious-text" id="mysterious-msg">
                        ${initialMsg}
                    </p>
                    <div id="mysterious-actions" class="mysterious-menu">
                        <button class="mysterious-btn-menu" data-action="talk" style="grid-column: span 2; border-color: #ff4444; box-shadow: 0 0 10px rgba(255, 68, 68, 0.2);">💬 Nói chuyện <span style="color: #ff4444; font-size: 1rem; margin-left: 5px; animation: pulse 1.5s infinite; font-weight: bold;">!!!</span></button>
                        ${!isFirstMeeting ? '<button class="mysterious-btn-menu" data-action="trade">⚖️ Giao dịch</button>' : ''}
                        <button class="mysterious-btn-menu" data-action="info">📜 Thông tin</button>
                        <button class="mysterious-btn-menu" data-action="equip" style="grid-column: span ${isFirstMeeting ? '1' : '1'};">⚔️ Xem Trang Bị</button>
                        ${!isFirstMeeting ? '<button class="mysterious-btn-menu" style="grid-column: span 1; background: #4caf50; color: #fff;" data-action="submit_quest">💎 Giao nộp</button>' : ''}
                    </div>
                </div>
            `;
            
            document.body.appendChild(container);
            
            const msgEl = container.querySelector('#mysterious-msg');
            const actionsEl = container.querySelector('#mysterious-actions');

            const showMainMenu = () => {
                msgEl.innerHTML = isFirstMeeting ? `"Hừ! Thiên địa bất nhân, coi vạn vật như chó rơm, ngươi có hiểu chăng?! <br> Đáng tiếc! A đáng tiếc! Một thiên tài như vậy mà lại sinh nhầm thời đại!"` : `"Ngươi đã có thứ ta cần chưa?!"`;
                actionsEl.innerHTML = `
                    <button class="mysterious-btn-menu" data-action="talk" style="grid-column: span 2; border-color: #ff4444; box-shadow: 0 0 10px rgba(255, 68, 68, 0.2);">💬 Nói chuyện <span style="color: #ff4444; font-size: 1rem; margin-left: 5px; animation: pulse 1.5s infinite; font-weight: bold;">!!!</span></button>
                    ${!isFirstMeeting ? '<button class="mysterious-btn-menu" data-action="trade">⚖️ Giao dịch</button>' : ''}
                    <button class="mysterious-btn-menu" data-action="info">📜 Thông tin</button>
                    <button class="mysterious-btn-menu" data-action="equip" style="grid-column: span ${isFirstMeeting ? '1' : '1'};">⚔️ Xem Trang Bị</button>
                    ${!isFirstMeeting ? '<button class="mysterious-btn-menu" style="grid-column: span 1; background: #4caf50; color: #fff;" data-action="submit_quest">💎 Giao nộp</button>' : ''}
                `;
                bindEvents();
            };

            const bindEvents = () => {
                const btns = actionsEl.querySelectorAll('button');
                btns.forEach(btn => {
                    btn.onclick = () => {
                        const action = btn.getAttribute('data-action');
                        handleAction(action);
                    };
                });
            };

            const handleAction = (action) => {
                switch(action) {
                    case 'talk': {
                        // Kích hoạt hiệu ứng đôi mắt rực sáng (không còn đỏ)
                        const avatar = container.querySelector('.mysterious-person-avatar');
                        if (avatar) {
                            avatar.classList.add('eye-bright');
                            setTimeout(() => {
                                avatar.classList.remove('eye-bright');
                            }, 1500);
                        }

                        if (isFirstMeeting) {
                            msgEl.innerHTML = `
                                "Con đường tu tiên không chỉ có linh khí, mà còn có những bí mật cổ xưa. <br>
                                Ngươi thấy đó, Tân Thủ Thôn chỉ là khởi đầu của một vòng lặp vô tận."
                                <br><br>
                                <span style="color:#888; font-size:0.8rem; font-style: italic;">(Hắn nở một nụ cười ghê rợ phía sau lớp mặt nạ, đôi mắt rực sáng lên trong bóng tối)</span>
                            `;
                            actionsEl.innerHTML = `
                                <button class="mysterious-btn" id="continue-listening" style="grid-column: span 2; justify-self: center;">TIẾP TỤC LẮNG NGHE</button>
                            `;
                            container.querySelector('#continue-listening').onclick = () => {
                                msgEl.innerHTML = `
                                    "Ngươi có bao giờ tự hỏi, tại sao những quái vật ở đây cứ hồi sinh mãi không? <br>
                                    Tại sao thời gian ở đây dường như đứng yên? <br>
                                    Thế giới này... nó không giống như những gì ngươi thấy đâu."
                                    <br><br>
                                    <span style="color:#888; font-size:0.8rem; font-style: italic;">(Hắn nhìn về phía chân trời xa xăm, giọng nói trầm xuống đầy u uất)</span>
                                `;
                                actionsEl.innerHTML = `
                                    <button class="mysterious-btn" id="ask-why" style="grid-column: span 2; justify-self: center;">Tại Saoo ????</button>
                                `;
                                container.querySelector('#ask-why').onclick = () => {
                                    msgEl.innerHTML = `
                                        "Tại vì Bọn Chúng... Haizzz <br>
                                        Mà thôi, biết quá nhiều, đối với các ngươi mà nói chết càng thêm thê thảm... hahaha khụ khụ... <br>
                                        Này người bạn trẻ, giúp ta một việc được chứ?"
                                        <br><br>
                                        <span style="color:#888; font-size:0.8rem; font-style: italic;">(Người thần bí ngoảnh lại nhìn chằm chằm ngươi một lúc... rồi lại ai oán lắc đầu thở dài... Đáng tiếc, a đáng tiếc...)</span>
                                    `;
                                    actionsEl.innerHTML = `
                                        <button class="mysterious-btn" id="accept-quest">CHẤP NHẬN</button>
                                        <button class="mysterious-btn" id="refuse-quest">TỪ CHỐI</button>
                                    `;
                                    container.querySelector('#refuse-quest').onclick = () => {
                                        // Đánh dấu đã gặp để không hiện lại nếu có re-render
                                        if (isFirstMeeting && callback) {
                                            callback();
                                        }

                                        let timeLeft = 3;
                                        msgEl.innerHTML = `
                                            "Hừ... Một kẻ hèn nhát... <br>
                                            Là ta đã xem trọng ngươi rồi... <br>
                                            <span class="mystical-scream">Ngươii Đáng Chếttt</span>"
                                            <br><br>
                                            <span style="color:#ff4444; font-weight:bold; font-size:1.2rem;">BẮT ĐẦU CHIẾN ĐẤU TRONG ${timeLeft}S...</span>
                                        `;
                                        actionsEl.innerHTML = ''; // Xóa các nút
                                        
                                        const countdownInterval = setInterval(() => {
                                            timeLeft--;
                                            if (timeLeft > 0) {
                                                msgEl.innerHTML = `
                                                    "Hừ... Một kẻ hèn nhát... <br>
                                                    Là ta đã xem trọng ngươi rồi... <br>
                                                    <span class="mystical-scream">Ngươii Đáng Chếttt</span>"
                                                    <br><br>
                                                    <span style="color:#ff4444; font-weight:bold; font-size:1.2rem;">BẮT ĐẦU CHIẾN ĐẤU TRONG ${timeLeft}S...</span>
                                                `;
                                            } else {
                                                clearInterval(countdownInterval);
                                            }
                                        }, 1000);
                                        
                                        // ... (phần code chiến đấu giữ nguyên bên dưới)

                                        setTimeout(() => {
                                            container.remove(); // Xóa UI Người Thần Bí
                                            
                                            // Lấy dữ liệu từ GameData
                                            const mysteriousEnemy = JSON.parse(JSON.stringify(GameData.enemies.mysterious_person_boss));
                                            
                                            // Cộng chỉ số từ trang bị (Thần Khí Tàn Khuyết)
                                            mysteriousEnemy.atk += 3350;
                                            mysteriousEnemy.def += 1400;
                                            mysteriousEnemy.maxHp += 24000;
                                            mysteriousEnemy.hp += 24000;
                                            mysteriousEnemy.thanphap += 1430;
                                            mysteriousEnemy.luk += 480;
                                            mysteriousEnemy.maxMp += 7500;
                                            mysteriousEnemy.currentMp += 7500;
                                            
                                            // Thêm các hào quang (buffs) cho Người Thần Bí để tăng độ ngầu
                                            const now = Date.now();
                                            mysteriousEnemy.activeBuffs = [
                                                { type: "BossOffenseAura", name: "Hào Quang Cuồng Bạo cấp cao", icon: "💢", color: "#ff4444", expiry: now + 10000 },
                                                { type: "BossDefenseAura", name: "Hào Quang Kiên Cố cấp cao", icon: "🛡️", color: "#2196f3", expiry: now + 10000 },
                                                { type: "BossSpeedAura", name: "Hào Quang Tốc Biến cấp cao", icon: "⚡", color: "#ffeb3b", expiry: now + 10000 },
                                                { type: "BossImmuneAura", name: "Hào Quang Bất Khuất cấp cao", icon: "✨", color: "#00f2ff", expiry: now + 10000 }
                                            ];
                                            mysteriousEnemy.activeDebuffs = [];
                                            
                                            if (typeof BattleSystem !== 'undefined') {
                                                const proxy = Game.getProxy();
                                                BattleSystem.start(proxy, mysteriousEnemy, (win) => {
                                                    if (win) {
                                                        UI.addLog("🎉 Chúc mừng đạo hữu đã đánh bại Người Thần Bí! Một kỳ tích chưa từng có!");
                                                    } else {
                                                        UI.addLog("💀 Đạo hữu đã bị Người Thần Bí đánh bại. Hắn biến mất vào hư vô...");
                                                        proxy.mysteriousPersonKilledPlayer = true;
                                                        proxy.meditationCountAfterDeath = 0;
                                                    }
                                                });
                                            }
                                        }, 3000);
                                    };
                                    container.querySelector('#accept-quest').onclick = () => {
                                        msgEl.innerHTML = `
                                            "Tốt. Ta quả là đã không nhìn lầm người. <br>
                                            Thực ra chuyện này cũng rất đơn giản... <br>
                                            Ta đang cần Tinh Hạch Boss Hoang Lang Vương để làm.. Thí nghiệ.m.. Khụ... Thực ra nó là nguyên liệu đan dược còn thiếu. <br>
                                            Nhưng chết tiệt Boss Hoang Lang Vương cảnh giới còn thấp... Tỉ lệ sinh ra Tinh Hạch quá thấp, ta đã giết đến... Mỏi cả tay... Mà vẫn chưa tìm thấy. <br>
                                            Tiểu tử ngươi tu luyện quanh đây, nếu có giao chiến với nó mà may mắn nhận được Tinh Hạch, thì nhớ liên lạc với ta nhé... <br>
                                            Ta sẽ trả công thật hậu hĩnh."
                                        `;
                                        actionsEl.innerHTML = `<button class="mysterious-btn" id="exit-mysterious" style="grid-column: span 2; justify-self: center;">THOÁT & NHẬN NHIỆM VỤ</button>`;
                                        container.querySelector('#exit-mysterious').onclick = () => {
                                            // Nhận nhiệm vụ và tín vật (silent = true để không hiện thông báo lẻ)
                                            Game.addItem("item_mysterious_token", 1, true, true);
                                            
                                            // Nếu là lần đầu gặp, tặng thêm Mặt Nạ Vô Diện
                                            if (isFirstMeeting) {
                                                Game.addItem("item_mask_mysterious", 1, true, true);
                                            }

                                            const proxy = Game.getProxy();
                                            if (proxy.quests && !proxy.quests.find(q => q.id === 'mysterious_quest_1')) {
                                                proxy.quests = [...proxy.quests, {
                                                    id: 'mysterious_quest_1',
                                                    name: 'Truy Tìm Tinh Hạch Hoang Lang Vương',
                                                    desc: 'Tiêu diệt Boss Hoang Lang Vương tại Tân Thủ Thôn, để thu thập 1 Tinh Hạch Boss Hoang Lang Vương cho Người Thần Bí.',
                                                    status: 'active',
                                                    progress: 0,
                                                    target: 1,
                                                    targetItem: 'item_hoang_lang_vuong_hach'
                                                }];
                                            }

                                            // Gộp thông báo vào làm một
                                            const tokenData = GameData.items["item_mysterious_token"];
                                            const tokenColor = UI.getRarityColor(tokenData.rarity);
                                            let logMsg = `🎁 <b>Người Thần Bí</b> đã giao cho bạn nhiệm vụ: <b>Truy Tìm Tinh Hạch Hoang Lang Vương</b> và tặng bạn ${tokenData.icon} <b style="color: ${tokenColor}">${tokenData.name}</b>`;
                                            
                                            if (isFirstMeeting) {
                                                const maskData = GameData.items["item_mask_mysterious"];
                                                const maskColor = UI.getRarityColor(maskData.rarity);
                                                logMsg += ` cùng ${maskData.icon} <b style="color: ${maskColor}">${maskData.name}</b>`;
                                            }
                                            logMsg += ".";
                                            
                                            UI.addLog(logMsg);
                                            
                                            container.style.opacity = '0';
                                            container.style.transition = 'opacity 1s ease-out';
                                            setTimeout(() => {
                                                container.remove();
                                                if (callback) callback();
                                            }, 1000);
                                        };
                                    };
                                };
                            };
                        } else {
                            msgEl.innerHTML = `
                                "Ngươi vẫn đang nỗ lực đó chứ? <br>
                                Đừng để ta thất vọng. Thế giới này đang thay đổi, và ngươi cần phải mạnh mẽ hơn."
                                <br><br>
                                <span style="color:#888; font-size:0.8rem; font-style: italic;">(Hắn nhìn thấu qua tâm can ngươi, giọng nói mang theo một chút kỳ vọng mờ nhạt)</span>
                            `;
                            actionsEl.innerHTML = `<button class="mysterious-btn" id="back-to-menu" style="grid-column: span 2; justify-self: center;">QUAY LẠI</button>`;
                            container.querySelector('#back-to-menu').onclick = showMainMenu;
                        }
                        break;
                    }

                    case 'submit_quest': {
                        const proxy = Game.getProxy();
                        const hachCount = typeof BagSystem !== 'undefined' ? BagSystem.getItemCount("item_hoang_lang_vuong_hach") : 0;
                        
                        if (hachCount >= 1) {
                            msgEl.innerHTML = `
                                "Ồ! Ngươi thực sự đã tìm thấy nó? <br>
                                Tốt lắm... Tốt lắm... <br>
                                Đây là phần thưởng xứng đáng cho nỗ lực của ngươi."
                            `;
                            actionsEl.innerHTML = `
                                <button class="mysterious-btn" id="confirm-submit">GIAO NỘP & NHẬN THƯỞNG</button>
                                <button class="mysterious-btn" id="cancel-submit" style="background: #666;">QUAY LẠI</button>
                            `;
                            
                            container.querySelector('#confirm-submit').onclick = () => {
                                if (typeof BagSystem !== 'undefined') {
                                    BagSystem.removeItemsById("item_hoang_lang_vuong_hach", 1);
                                }
                                
                                // Hoàn thành nhiệm vụ
                                if (proxy.quests) {
                                    const q = proxy.quests.find(q => q.id === 'mysterious_quest_1');
                                    if (q) {
                                        q.status = 'completed';
                                        q.progress = 1;
                                    }
                                }
                                
                                // Thu hồi Mặt Nạ Vô Diện
                                let maskRecovered = false;
                                // Kiểm tra trong trang bị
                                if (proxy.equipments.head && proxy.equipments.head.id === 'item_mask_mysterious') {
                                    proxy.equipments.head = null;
                                    maskRecovered = true;
                                    // Cập nhật lại chỉ số sau khi tháo cưỡng chế
                                    Game.recalculateStats();
                                }
                                // Kiểm tra trong túi đồ (nếu chưa đeo)
                                if (!maskRecovered && typeof BagSystem !== 'undefined') {
                                    if (BagSystem.getItemCount("item_mask_mysterious") > 0) {
                                        BagSystem.removeItemsById("item_mask_mysterious", 1);
                                        maskRecovered = true;
                                    }
                                }

                                // Thưởng: Hỗn Độn Đan
                                Game.addItem("pill_mysterious", 1, false, true);
                                let logMsg = "🎉 Chúc mừng! Bạn đã hoàn thành nhiệm vụ và nhận được 💊 <b>Hỗn Độn Đan</b>!";
                                if (maskRecovered) {
                                    logMsg += " <br> 🎭 <b>Mặt Nạ Vô Diện</b> đã bị Người Thần Bí thu hồi.";
                                }
                                UI.addLog(logMsg);
                                
                                msgEl.innerHTML = `"Được rồi, giờ hãy đi đi. Ta còn nhiều việc phải làm."`;
                                actionsEl.innerHTML = ``; // Xóa hết nút
                                setTimeout(() => {
                                    container.style.opacity = '0';
                                    container.style.transition = 'opacity 1s ease-out';
                                    setTimeout(() => {
                                        container.remove();
                                        if (callback) callback();
                                    }, 1000);
                                }, 2000);
                            };
                            
                            container.querySelector('#cancel-submit').onclick = showMainMenu;
                        } else {
                            let timeLeft = 3;
                            msgEl.innerHTML = `
                                "Ngươi định lừa ta sao? Ngươi vẫn chưa có Tinh Hạch Hoang Lang Vương!"
                                <br><br>
                                <span class="mystical-scream" style="font-weight:bold; font-size:1.5rem; text-shadow: 0 0 10px #ff0000; filter: blur(0.5px); display: block;">Ngươii Đáng Chếttt</span>
                                <br>
                                <span style="color:#ff4444; font-weight:bold; font-size:1.2rem;">BẮT ĐẦU CHIẾN ĐẤU TRONG ${timeLeft}S...</span>
                            `;
                            actionsEl.innerHTML = ``; // Xóa hết nút

                            const countdownInterval = setInterval(() => {
                                timeLeft--;
                                if (timeLeft > 0) {
                                    msgEl.innerHTML = `
                                        "Ngươi định lừa ta sao? Ngươi vẫn chưa có Tinh Hạch Hoang Lang Vương!"
                                        <br><br>
                                        <span class="mystical-scream" style="font-weight:bold; font-size:1.5rem; text-shadow: 0 0 10px #ff0000; filter: blur(0.5px); display: block;">Ngươii Đáng Chếttt</span>
                                        <br>
                                        <span style="color:#ff4444; font-weight:bold; font-size:1.2rem;">BẮT ĐẦU CHIẾN ĐẤU TRONG ${timeLeft}S...</span>
                                    `;
                                } else {
                                    clearInterval(countdownInterval);
                                }
                            }, 1000);

                            setTimeout(() => {
                                // Đánh dấu đã gặp để không hiện lại nếu có re-render
                                if (isFirstMeeting && callback) {
                                    callback();
                                }
                                
                                container.remove();
                                const mysteriousEnemy = JSON.parse(JSON.stringify(GameData.enemies.mysterious_person_boss));
                                
                                // Cộng chỉ số từ trang bị (Thần Khí Tàn Khuyết)
                                mysteriousEnemy.atk += 3350;
                                mysteriousEnemy.def += 1400;
                                mysteriousEnemy.maxHp += 24000;
                                mysteriousEnemy.hp += 24000;
                                mysteriousEnemy.thanphap += 1430;
                                mysteriousEnemy.luk += 480;
                                mysteriousEnemy.maxMp += 7500;
                                mysteriousEnemy.currentMp += 7500;

                                const now = Date.now();
                                mysteriousEnemy.activeBuffs = [
                                    { type: "BossOffenseAura", name: "Hào Quang Cuồng Bạo cấp cao", icon: "💢", color: "#ff4444", expiry: now + 10000 },
                                    { type: "BossDefenseAura", name: "Hào Quang Kiên Cố cấp cao", icon: "🛡️", color: "#2196f3", expiry: now + 10000 },
                                    { type: "BossSpeedAura", name: "Hào Quang Tốc Biến cấp cao", icon: "⚡", color: "#ffeb3b", expiry: now + 10000 },
                                    { type: "BossImmuneAura", name: "Hào Quang Bất Khuất cấp cao", icon: "✨", color: "#00f2ff", expiry: now + 10000 }
                                ];
                                mysteriousEnemy.activeDebuffs = [];
                                
                                if (typeof BattleSystem !== 'undefined') {
                                    const proxy = Game.getProxy();
                                    BattleSystem.start(proxy, mysteriousEnemy, (win) => {
                                        if (win) {
                                            UI.addLog("🎉 Chúc mừng đạo hữu đã đánh bại Người Thần Bí! Một kỳ tích chưa từng có!");
                                        } else {
                                            UI.addLog("💀 Đạo hữu đã bị Người Thần Bí đánh bại. Hắn biến mất vào hư vô...");
                                            proxy.mysteriousPersonKilledPlayer = true;
                                            proxy.meditationCountAfterDeath = 0;
                                        }
                                    });
                                }
                            }, 3000);
                        }
                        break;
                    }

                    case 'trade': {
                        const shopItems = [
                            { id: "pill_mysterious", cost: 10000, currency: "Linh Thạch" },
                            { id: "weapon_mysterious_broken", cost: 50000, currency: "Linh Thạch" },
                            { id: "item_god_sword_chaos", cost: 999999, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_armor_heaven", cost: 999999, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_ring_void", cost: 999999, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_soul_eternal", cost: 999999, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_pill_immortal", cost: 500000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_boots_wind", cost: 700000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_necklace_fate", cost: 800000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_artifact_chaos_bell", cost: 1500000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_helmet_crown", cost: 1200000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_belt_dragon", cost: 1100000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_cloak_star", cost: 1300000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_bracer_thunder", cost: 1000000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_manual_creation", cost: 2000000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_shield_void", cost: 1400000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_bow_starfall", cost: 1600000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_staff_genesis", cost: 1800000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_pendant_eternity", cost: 1500000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_earring_phoenix", cost: 1300000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_cape_void", cost: 1400000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_gauntlet_titan", cost: 1700000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_god_orb_destiny", cost: 2500000, currency: "Cực Phẩm Linh Thạch" },
                            { id: "item_tay_tuy_dan_pack_5", cost: 0, currency: "Linh Thạch" }
                        ];

                        const renderShop = () => {
                            msgEl.innerHTML = `<div style="margin-bottom: 15px; font-style: italic; color: #eee; text-shadow: 0 0 5px rgba(255,255,255,0.2);">"Ngươi muốn xem thứ gì? Đừng làm mất thời gian của ta."</div>`;
                            
                            let html = `
                                <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 12px; width: 100%; min-width: 300px;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; border-bottom: 2px solid #ffd70044; padding-bottom: 6px;">
                                        <span style="font-size: 1.1rem;">🏪</span>
                                        <span style="font-size: 0.9rem; font-weight: bold; color: #ffd700; letter-spacing: 1px;">CỬA HÀNG THẦN BÍ</span>
                                    </div>
                                    <div class="mysterious-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 350px; overflow-y: auto; padding: 5px; width: 100%;">
                            `;

                            shopItems.forEach(itemInfo => {
                                const item = GameData.items[itemInfo.id];
                                if (!item) return;
                                
                                const color = rarityColors[item.rarity] || "#fff";
                                const isMythic = item.rarity === 'mythic';
                                
                                const shopInfo = JSON.stringify({
                                    cost: itemInfo.cost,
                                    currency: itemInfo.currency,
                                    isMysterious: true
                                }).replace(/"/g, '&quot;');

                                html += `
                                    <div class="sect-item ${isMythic ? 'animate-border-flash' : ''}" 
                                         onclick="window.showMysteriousDetail('${itemInfo.id}', ${shopInfo})"
                                         style="background: linear-gradient(145deg, #1a1a1a, #111); padding: 12px; border-radius: 12px; border: 1px solid ${isMythic ? color + '66' : '#333'}; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.3); width: 100%; box-sizing: border-box;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="font-size: 2rem; background: rgba(0,0,0,0.4); width: 45px; height: 45px; min-width: 45px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid ${isMythic ? color + '44' : '#444'};">${item.icon}</div>
                                            <div style="flex: 1; min-width: 0;">
                                                <b style="color: ${color}; font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 0 5px ${color}33;">${item.name}</b>
                                                <div style="color: ${color}; font-size: 0.6rem; opacity: 0.7; margin-top: 2px;">${UI.getRarityName(item.rarity)}</div>
                                            </div>
                                        </div>
                                        <div style="background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(255,215,0,0.2); display: flex; justify-content: center; align-items: center;">
                                            <span style="color: #ffd700; font-size: 0.85rem; font-weight: bold; text-shadow: 0 0 5px rgba(255,215,0,0.3);">
                                                ${itemInfo.id === 'item_tay_tuy_dan_pack_5' ? '000.000' : itemInfo.cost.toLocaleString()} ${itemInfo.currency === 'Linh Thạch' ? 'LT' : 'CPLT'}
                                            </span>
                                        </div>
                                    </div>
                                `;
                            });

                            html += `</div>`;
                            html += `<button class="mysterious-btn" id="back-to-menu" style="width: 100%; height: 40px; margin-top: 10px; background: linear-gradient(to bottom, #333, #222); border: 1px solid #444; border-radius: 10px; font-weight: bold; color: #eee; cursor: pointer;">QUAY LẠI</button>`;
                            html += `</div>`;
                            
                            actionsEl.innerHTML = html;
                            container.querySelector('#back-to-menu').onclick = showMainMenu;
                        };

                        window.showMysteriousDetail = (itemId, shopInfo) => {
                            const item = GameData.items[itemId];
                            if (!item) return;

                            const rarityColor = UI.getRarityColor(item.rarity);
                            let content = `
                                <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 5px;">
                                    <div style="font-size: 3rem; filter: drop-shadow(0 0 10px ${rarityColor}88); margin-bottom: 5px;">${item.icon}</div>
                                    <div style="text-align: center; width: 100%;">
                                        <b style="color: ${rarityColor}; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px ${rarityColor}44;">${item.name}</b>
                                        <div style="font-size: 0.7rem; color: #888; margin-top: 3px;">Phẩm chất: <span style="color: ${rarityColor}; font-weight: bold;">${UI.getRarityName(item.rarity)}</span></div>
                                        <p style="color: #eee; font-size: 0.85rem; margin-top: 10px; line-height: 1.5; font-style: italic; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 0 10px rgba(0,0,0,0.3);">"${item.desc || "Không có mô tả."}"</p>
                                    </div>
                            `;
                            content += `
                                <div style="width: 100%; background: linear-gradient(to right, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05)); padding: 10px; border-radius: 10px; border: 1px solid #ffd70066; box-shadow: 0 0 15px rgba(255,215,0,0.1);">
                                    <b style="color: #ffd700; font-size: 0.75rem; display: block; margin-bottom: 5px; border-bottom: 1px solid #ffd70033; padding-bottom: 3px; text-transform: uppercase;">GIÁ BÁN:</b>
                                    <div style="display: flex; justify-content: center; font-size: 1.1rem; color: #ffd700; font-weight: bold; text-shadow: 0 0 10px rgba(255,215,0,0.4);">
                                        <span>${itemId === 'item_tay_tuy_dan_pack_5' ? '000.000' : shopInfo.cost.toLocaleString()} ${shopInfo.currency === 'Linh Thạch' ? 'Linh Thạch' : 'Cực Phẩm Linh Thạch'}</span>
                                    </div>
                                </div>
                            `;

                            if (item.stats) {
                                content += `<div style="width: 100%; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 10px; border: 1px solid #444; box-shadow: inset 0 0 15px rgba(0,0,0,0.5);">`;
                                content += `<b style="color: #4caf50; font-size: 0.75rem; display: block; margin-bottom: 6px; border-bottom: 1px solid #444; padding-bottom: 4px; text-transform: uppercase;">THUỘC TÍNH BẢO VẬT:</b>`;
                                content += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
                                for (const [key, val] of Object.entries(item.stats)) {
                                    const statName = { 
                                        atk: "Tấn Công", def: "Phòng Ngự", hpMax: "Sinh Mệnh", mpMax: "Linh Lực", 
                                        thanphap: "Thân Pháp", luk: "May Mắn", staMax: "Thể Lực"
                                    }[key] || key.toUpperCase();
                                    const valStr = typeof val === 'number' && val < 2 ? `+${(val * 100).toFixed(0)}%` : `+${val.toLocaleString()}`;
                                    content += `<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #eee; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 2px;">
                                                    <span style="color: #aaa;">${statName}:</span>
                                                    <b style="color: #4caf50;">${valStr}</b>
                                                 </div>`;
                                }
                                content += `</div></div>`;
                            }

                            content += `</div>`;

                            UI.openModal("BẢO VẬT THẦN BÍ", content);
                            
                            const ctrl = document.getElementById('modal-controls');
                            if (ctrl) {
                                ctrl.innerHTML = "";
                                const buyBtn = document.createElement('button');
                                buyBtn.className = "btn-main btn-purple";
                                buyBtn.style.width = "100%";
                                buyBtn.style.padding = "12px";
                                buyBtn.style.fontSize = "0.9rem";
                                buyBtn.style.fontWeight = "bold";
                                buyBtn.style.borderRadius = "10px";
                                buyBtn.style.boxShadow = "0 4px 10px rgba(142, 36, 170, 0.4)";
                                buyBtn.innerText = `XÁC NHẬN MUA`;
                                buyBtn.onclick = () => {
                                    const success = UI.buyFromMysterious(itemId, shopInfo.cost, shopInfo.currency);
                                    if (success) {
                                        UI.closeModal();
                                    } else {
                                        // Hiệu ứng rung modal khi thất bại
                                        const modal = document.getElementById('modal-container');
                                        if (modal) {
                                            modal.classList.add('shake-anim');
                                            setTimeout(() => {
                                                modal.classList.remove('shake-anim');
                                                UI.closeModal(); // Quay lại giao diện giao dịch (đóng modal chi tiết)
                                            }, 500);
                                        } else {
                                            UI.closeModal();
                                        }
                                    }
                                };
                                ctrl.appendChild(buyBtn);
                            }
                        };

                        renderShop();
                        break;
                    }

                    case 'info': {
                        const bossData = GameData.enemies.mysterious_person_boss;
                        const hideStats = UI.shouldHideEnemyStats(bossData);
                        const rankName = hideStats ? "???" : (GameData.ranks[bossData.rankIndex]?.name || "Hư Vô Chi Chủ");
                        
                        // Danh sách trang bị để tính toán chỉ số (khớp với danh sách ở case 'equip')
                        const mysteriousEquip = [
                            { stats: { atk: 500, thanphap: 100, luk: 50 } },
                            { stats: { def: 150, hpMax: 2000, mpMax: 500 } },
                            { stats: { def: 300, hpMax: 5000, mpMax: 1000 } },
                            { stats: { def: 200, hpMax: 3000, thanphap: 80 } },
                            { stats: { thanphap: 250, luk: 30, def: 100 } },
                            { stats: { atk: 150, def: 150, mpMax: 2000 } },
                            { stats: { hpMax: 4000, mpMax: 4000, luk: 40 } },
                            { stats: { thanphap: 400, atk: 200, luk: 60 } },
                            { stats: { atk: 2500, thanphap: 500, luk: 200, hpMax: 10000 } },
                            { stats: { def: 500, luk: 100, thanphap: 100 } }
                        ];

                        let bonusAtk = 0, bonusDef = 0, bonusHp = 0, bonusThanphap = 0, bonusLuk = 0;
                        mysteriousEquip.forEach(eq => {
                            if (eq.stats.atk) bonusAtk += eq.stats.atk;
                            if (eq.stats.def) bonusDef += eq.stats.def;
                            if (eq.stats.hpMax) bonusHp += eq.stats.hpMax;
                            if (eq.stats.thanphap) bonusThanphap += eq.stats.thanphap;
                            if (eq.stats.luk) bonusLuk += eq.stats.luk;
                        });

                        const totalAtk = bossData.atk + bonusAtk;
                        const totalDef = bossData.def + bonusDef;
                        const totalHp = bossData.maxHp + bonusHp;
                        const totalThanphap = bossData.thanphap + bonusThanphap;
                        const totalLuk = bossData.luk + bonusLuk;

                        const atkStr = hideStats ? "???" : totalAtk.toLocaleString();
                        const defStr = hideStats ? "???" : totalDef.toLocaleString();
                        const hpStr = hideStats ? "???" : totalHp.toLocaleString();
                        const thanphapStr = hideStats ? "???" : totalThanphap.toLocaleString();
                        const lukStr = hideStats ? "???" : totalLuk.toLocaleString();

                        msgEl.innerHTML = `
                            <div style="text-align: left; padding: 5px;">
                                <b style="color: #d4af37; font-size: 1rem;">📜 HỒ SƠ: NGƯỜI THẦN BÍ</b>
                                <div style="margin-top: 10px; font-size: 0.8rem; color: #ccc; line-height: 1.6;">
                                    <div style="margin-bottom: 5px;"><span style="color: #888;">Thân phận:</span> ??? (Kẻ không thuộc về thế giới này)</div>
                                    <div style="margin-bottom: 10px;"><span style="color: #888;">Mục tiêu:</span> ??? (Không thể nhìn thấu)</div>
                                    
                                    <div style="margin-top: 15px; padding: 10px; background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 10px; text-align: center;">
                                        <div style="color: #d4af37; font-size: 0.65rem; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">TU VI CẢNH GIỚI</div>
                                        <div style="color: #fff; font-size: 1rem; font-weight: bold; text-shadow: 0 0 8px #d4af37;">${rankName.toUpperCase()}</div>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; font-size: 0.65rem; color: #aaa;">
                                            <span style="display: flex; align-items: center; gap: 4px;">💥 Công: <b style="color: #ff4444;">${atkStr}</b></span>
                                            <span style="display: flex; align-items: center; gap: 4px;">🛡️ Thủ: <b style="color: #2196f3;">${defStr}</b></span>
                                            <span style="display: flex; align-items: center; gap: 4px;">❤️ Máu: <b style="color: #4caf50;">${hpStr}</b></span>
                                            <span style="display: flex; align-items: center; gap: 4px;">⚡ Thân Pháp: <b style="color: #ffeb3b;">${thanphapStr}</b></span>
                                            <span style="display: flex; align-items: center; gap: 4px; grid-column: span 2; justify-content: center;">🍀 May Mắn: <b style="color: #9c27b0;">${lukStr}</b></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        actionsEl.innerHTML = `<button class="mysterious-btn" id="back-to-menu" style="grid-column: span 2; justify-self: center; margin-top: 10px; background: #333; color: #eee; border: 1px solid #444; padding: 8px 25px; border-radius: 15px; cursor: pointer;">QUAY LẠI</button>`;
                        container.querySelector('#back-to-menu').onclick = showMainMenu;
                        break;
                    }

                    case 'equip': {
                        const bossData = GameData.enemies.mysterious_person_boss;
                        const hideStats = UI.shouldHideEnemyStats(bossData);
                        
                        msgEl.innerHTML = hideStats ? `"Ngươi không đủ tư cách để nhìn thấu trang bị của ta!"` : `"Ngươi tò mò về sức mạnh của ta sao?!"`;
                        
                        const mysteriousEquip = [
                            { id: 'me_weapon', name: hideStats ? '???' : 'Tàn Khuyết Hư Vô Kiếm', icon: hideStats ? '❓' : '🗡️', color: hideStats ? '#555' : '#ff4444', rarity: 'mythic_broken', stats: { atk: 500, thanphap: 100, luk: 50 }, desc: hideStats ? '???' : 'Thanh kiếm gãy nát từ thời thượng cổ, dù chỉ còn một mảnh nhưng vẫn mang theo uy lực chấn động thiên địa. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_hat', name: hideStats ? '???' : 'Tàn Khuyết Thiên Mệnh Quán', icon: hideStats ? '❓' : '👑', color: hideStats ? '#555' : '#ffd700', rarity: 'mythic_broken', stats: { def: 150, hpMax: 2000, mpMax: 500 }, desc: hideStats ? '???' : 'Chiếc vương miện đã mất đi hào quang vốn có, nhưng vẫn chứa đựng một phần thiên mệnh lực. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_armor', name: hideStats ? '???' : 'Tàn Khuyết Hắc Ám Pháp Bào', icon: hideStats ? '❓' : '👘', color: hideStats ? '#555' : '#9c27b0', rarity: 'mythic_broken', stats: { def: 300, hpMax: 5000, mpMax: 1000 }, desc: hideStats ? '???' : 'Bộ pháp bào rách nát thấm đẫm khí tức hắc ám, có khả năng thôn phệ một phần sát thương. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_pants', name: hideStats ? '???' : 'Mảnh Vỡ Hỗn Độn Khố', icon: hideStats ? '❓' : '👖', color: hideStats ? '#555' : '#4caf50', rarity: 'chaos_broken', stats: { def: 200, hpMax: 3000, thanphap: 80 }, desc: hideStats ? '???' : 'Chiếc quần được dệt từ tơ hỗn độn, giúp người mặc di chuyển linh hoạt giữa các chiều không gian. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_shoes', name: hideStats ? '???' : 'Tàn Khuyết Tinh Không Bộ', icon: hideStats ? '❓' : '👟', color: hideStats ? '#555' : '#2196f3', rarity: 'mythic_broken', stats: { thanphap: 250, luk: 30, def: 100 }, desc: hideStats ? '???' : 'Đôi giày rách nát nhưng vẫn mang theo sức mạnh của tinh không, bước đi như lướt trên dải ngân hà. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_ring', name: hideStats ? '???' : 'Tàn Khuyết Luân Hồi Giới', icon: hideStats ? '❓' : '💍', color: hideStats ? '#555' : '#e91e63', rarity: 'mythic_broken', stats: { atk: 150, def: 150, mpMax: 2000 }, desc: hideStats ? '???' : 'Chiếc nhẫn mang theo quy tắc luân hồi, dù đã tàn khuyết nhưng vẫn có thể bảo vệ linh hồn. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_neck', name: hideStats ? '???' : 'Tàn Khuyết Thái Sơ Hạng Liên', icon: hideStats ? '❓' : '📿', color: hideStats ? '#555' : '#00bcd4', rarity: 'mythic_broken', stats: { hpMax: 4000, mpMax: 4000, luk: 40 }, desc: hideStats ? '???' : 'Sợi dây chuyền từ thời thái sơ, chứa đựng linh khí thuần khiết nhất của vũ trụ. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_wings', name: hideStats ? '???' : 'Tàn Khuyết Vĩnh Hằng Dực', icon: hideStats ? '❓' : '🧚', color: hideStats ? '#555' : '#ff9800', rarity: 'mythic_broken', stats: { thanphap: 400, atk: 200, luk: 60 }, desc: hideStats ? '???' : 'Đôi cánh đã gãy rụng lông vũ, nhưng vẫn có thể giúp người sở hữu bay vọt qua vạn dặm. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_eye', name: hideStats ? '???' : 'Mảnh Vỡ Mắt Thần Hỗn Độn', icon: hideStats ? '❓' : '🧿', color: hideStats ? '#555' : '#ff0000', rarity: 'chaos_broken', stats: { atk: 2500, thanphap: 500, luk: 200, hpMax: 10000 }, desc: hideStats ? '???' : 'Một mảnh vỡ của con mắt thần từ thời hỗn độn, nắm giữ sức mạnh nhìn thấu vạn vật và hủy diệt quy tắc. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' },
                            { id: 'me_mask', name: hideStats ? '???' : 'Tàn Khuyết Vô Diện Chân Nhân', icon: hideStats ? '❓' : '🎭', color: hideStats ? '#555' : '#ffeb3b', rarity: 'mythic_broken', stats: { def: 500, luk: 100, thanphap: 100 }, desc: hideStats ? '???' : 'Chiếc mặt nạ vô diện che giấu mọi nhân quả, khiến thiên đạo cũng khó lòng nhìn thấu. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...' }
                        ];

                        let equipHtml = `
                            <style>
                                @keyframes flicker-broken {
                                    0%, 100% { opacity: 1; filter: brightness(1); }
                                    50% { opacity: 0.6; filter: brightness(0.5); }
                                }
                                .mysterious-equip-item {
                                    animation: flicker-broken 4s infinite ease-in-out;
                                }
                                .mysterious-equip-item:nth-child(2n) { animation-delay: 1s; }
                                .mysterious-equip-item:nth-child(3n) { animation-delay: 2s; }
                                .mysterious-equip-item:nth-child(4n) { animation-delay: 0.5s; }
                                .mysterious-equip-item:hover { animation-play-state: paused; opacity: 1 !important; filter: brightness(1.2) !important; }
                            </style>
                            <div style="grid-column: span 2; width: 100%; margin-top: 5px; background: rgba(10, 10, 10, 0.95); border: 1px solid #d4af37; border-radius: 12px; padding: 8px; box-shadow: 0 0 20px rgba(212, 175, 55, 0.15); position: relative; max-height: 260px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #d4af37 #111;">
                                <div style="text-align: center; color: #d4af37; font-weight: bold; font-size: 0.75rem; margin-bottom: 8px; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 4px;">
                                    📜 TRANG BỊ CỦA NGƯỜI THẦN BÍ
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                        `;

                        mysteriousEquip.forEach(item => {
                            equipHtml += `
                                <div class="mysterious-equip-item" data-id="${item.id}" style="display: flex; align-items: center; gap: 5px; padding: 5px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(212, 175, 55, 0.15); cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='rgba(212, 175, 55, 0.2)'; this.style.borderColor='rgba(212, 175, 55, 0.5)';" onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='rgba(212, 175, 55, 0.15)';">
                                    <div style="font-size: 1.1rem; filter: drop-shadow(0 0 3px ${item.color});">${item.icon}</div>
                                    <div style="flex: 1; text-align: left; min-width: 0;">
                                        <div style="color: ${item.color}; font-weight: bold; font-size: 0.6rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                                        <div style="color: #555; font-size: 0.5rem; letter-spacing: 0.5px;">${hideStats ? 'BỊ PHONG ẤN' : 'CHI TIẾT'}</div>
                                    </div>
                                </div>
                            `;
                        });

                        equipHtml += `
                                </div>
                            </div>
                            <button class="mysterious-btn" id="back-to-menu" style="grid-column: span 2; justify-self: center; margin-top: 8px; background: linear-gradient(to bottom, #222, #111); color: #d4af37; font-weight: bold; border: 1px solid #d4af37; padding: 6px 30px; border-radius: 20px; cursor: pointer; font-size: 0.75rem; box-shadow: 0 2px 5px rgba(0,0,0,0.5); transition: all 0.2s;" onmouseover="this.style.background='#d4af37'; this.style.color='#000';" onmouseout="this.style.background='linear-gradient(to bottom, #222, #111)'; this.style.color='#d4af37';">
                                QUAY LẠI
                            </button>
                        `;
                        
                        actionsEl.innerHTML = equipHtml;
                        container.querySelector('#back-to-menu').onclick = showMainMenu;

                        // Add click listeners for items
                        container.querySelectorAll('.mysterious-equip-item').forEach(el => {
                            el.onclick = () => {
                                if (hideStats) {
                                    UI.showNotification("Cảnh giới quá thấp, không thể nhìn thấu!", "error");
                                    return;
                                }
                                const itemId = el.getAttribute('data-id');
                                const item = mysteriousEquip.find(i => i.id === itemId);
                                if (item) {
                                    window.showMysteriousEquipDetail(item);
                                }
                            };
                        });

                        window.showMysteriousEquipDetail = (item) => {
                            const rarityColor = item.color;
                            let content = `
                                <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 5px;">
                                    <div style="font-size: 3rem; filter: drop-shadow(0 0 10px ${rarityColor}88); margin-bottom: 5px;">${item.icon}</div>
                                    <div style="text-align: center; width: 100%;">
                                        <b style="color: ${rarityColor}; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px ${rarityColor}44;">${item.name}</b>
                                        <div style="font-size: 0.7rem; color: #888; margin-top: 3px;">Phẩm chất: <span style="color: ${rarityColor}; font-weight: bold;">${UI.getRarityName(item.rarity).toUpperCase()} (TÀN KHUYẾT)</span></div>
                                        <p style="color: #eee; font-size: 0.85rem; margin-top: 10px; line-height: 1.5; font-style: italic; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 0 10px rgba(0,0,0,0.3);">"${item.desc}"</p>
                                    </div>
                                    
                                    <div style="width: 100%; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 10px; border: 1px solid #444; box-shadow: inset 0 0 15px rgba(0,0,0,0.5);">
                                        <b style="color: #4caf50; font-size: 0.75rem; display: block; margin-bottom: 6px; border-bottom: 1px solid #444; padding-bottom: 4px; text-transform: uppercase;">THUỘC TÍNH THẦN KHÍ:</b>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            `;
                            
                            for (const [key, val] of Object.entries(item.stats)) {
                                const statName = { 
                                    atk: "Tấn Công", def: "Phòng Ngự", hpMax: "Sinh Mệnh", mpMax: "Linh Lực", 
                                    thanphap: "Thân Pháp", luk: "May Mắn"
                                }[key] || key.toUpperCase();
                                content += `
                                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #eee; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 2px;">
                                        <span style="color: #aaa;">${statName}:</span>
                                        <b style="color: #4caf50;">+${val.toLocaleString()}</b>
                                    </div>`;
                            }
                            
                            content += `
                                        </div>
                                    </div>
                                    <div style="width: 100%; text-align: center; color: #ff4444; font-size: 0.65rem; font-style: italic; margin-top: 5px;">
                                        ⚠️ Đây là trang bị của Người Thần Bí, không thể giao dịch hay sở hữu.
                                    </div>
                                </div>
                            `;

                            UI.openModal("CHI TIẾT THẦN KHÍ", content);
                            
                            const ctrl = document.getElementById('modal-controls');
                            if (ctrl) {
                                ctrl.innerHTML = "";
                                const closeBtn = document.createElement('button');
                                closeBtn.className = "btn-main";
                                closeBtn.style.width = "100%";
                                closeBtn.style.padding = "10px";
                                closeBtn.style.background = "#333";
                                closeBtn.style.color = "#fff";
                                closeBtn.style.border = "none";
                                closeBtn.style.borderRadius = "8px";
                                closeBtn.innerText = "ĐÓNG";
                                closeBtn.onclick = () => UI.closeModal();
                                ctrl.appendChild(closeBtn);
                            }
                        };
                        break;
                    }

                    case 'leave':
                        msgEl.innerHTML = `"Chúng ta sẽ còn gặp lại... nếu ngươi đủ mạng để đi tiếp."`;
                        actionsEl.innerHTML = ``;
                        container.style.opacity = '0';
                        container.style.transition = 'opacity 1s ease-out';
                        setTimeout(() => {
                            container.remove();
                            if (callback) callback();
                        }, 1000);
                        break;
                }
            };

            bindEvents();

            if (initialAction) {
                handleAction(initialAction);
            }
        },

        /**
         * Hiển thị danh sách bản đồ thám hiểm
         */
        renderMapList: function(proxy) {
            const mapList = document.getElementById('map-list');
            if (!mapList || !GameData.maps) return;
            
            mapList.innerHTML = '';
            const pPower = proxy.power || 0;

            // Tạo ngăn xếp KHU VỰC 1: PHÀM GIỚI
            const groupName = "KHU VỰC 1: PHÀM GIỚI";
            const isCollapsed = collapsedRanks[groupName] === true;

            const groupHeader = document.createElement('div');
            groupHeader.className = "skill-rank-header"; 
            groupHeader.style.cssText = `
                background: linear-gradient(90deg, #1a1a1a, #333);
                color: #d4af37;
                padding: 1px 6px;
                margin: 0 0 4px 0;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-left: 2px solid #d4af37;
                font-weight: bold;
                font-size: 0.7rem;
                box-shadow: 0 1px 2px rgba(0,0,0,0.3);
                grid-column: span 2;
                white-space: nowrap;
            `;
            
            groupHeader.innerHTML = `
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span>🗺️ ${groupName}</span>
                    <small style="font-weight:normal; opacity:0.6; font-size:0.6rem;">(Nhấn để mở/đóng)</small>
                </div>
                <span style="font-size: 0.65rem;">${isCollapsed ? '▼' : '▲'}</span>
            `;
            
            groupHeader.onclick = () => {
                collapsedRanks[groupName] = !isCollapsed;
                this.renderMapList(proxy);
            };
            
            mapList.appendChild(groupHeader);

            if (isCollapsed) return;

            const mapContainer = document.createElement('div');
            mapContainer.style.cssText = `
                display: flex;
                overflow-x: auto;
                gap: 8px;
                padding: 4px 0 8px 0;
                grid-column: span 2;
                scrollbar-width: none;
                -ms-overflow-style: none;
            `;
            // Hide scrollbar for Chrome, Safari and Opera
            mapContainer.innerHTML = `<style>div::-webkit-scrollbar { display: none; }</style>`;
            mapList.appendChild(mapContainer);

            GameData.maps.forEach(loc => {
                // Tính toán lực chiến trung bình của quái trong map
                let totalMapPower = 0;
                if (loc.monsters && loc.monsters.length > 0) {
                    loc.monsters.forEach(mId => {
                        const m = GameData.enemies[mId];
                        if (m) {
                            // Công thức tính lực chiến quái (khớp với công thức người chơi)
                            const mPower = (m.atk * 2.5) + (m.def * 1.8) + (m.thanphap * 4) + (m.hp * 0.15);
                            totalMapPower += mPower;
                        }
                    });
                    totalMapPower /= loc.monsters.length;
                }

                // Xác định độ khó và màu sắc
                let color = "#333";
                let textColor = "#d4af37";
                let difficultyText = "Bình thường";
                let warning = "";

                const ratio = totalMapPower / (pPower || 1);

                if (ratio < 0.6) {
                    color = "#444";
                    textColor = "#888";
                    difficultyText = "Yếu";
                } else if (ratio < 1.5) {
                    color = "#1a1a1a";
                    textColor = "#d4af37";
                    difficultyText = "Bình thường";
                } else if (ratio < 4.0) {
                    color = "#1b2e1b";
                    textColor = "#4caf50";
                    difficultyText = "Trung bình";
                } else if (ratio < 8.0) {
                    color = "#2e1f0a";
                    textColor = "#ff9800";
                    difficultyText = "Khó";
                    warning = "⚠️ Nguy hiểm!";
                } else if (ratio < 15.0) {
                    color = "#2e0a0a";
                    textColor = "#f44336";
                    difficultyText = "Cực khó";
                    warning = "💀 Tử địa!";
                } else {
                    color = "#000";
                    textColor = "#ff0000";
                    difficultyText = "Tuyệt diệt";
                    warning = "☠️ Một đi không trở lại!";
                }

                const exploreCount = (proxy.mapExploration && proxy.mapExploration[loc.id]) || 0;
                const progress = Math.min(10, exploreCount);
                const isCompleted = exploreCount >= 10;
                const isBossReady = !isCompleted && progress === 9; // Lần thứ 10 sẽ gặp boss đầu tiên

                const div = document.createElement('div');
                div.className = "map-item";
                div.style.cssText = `
                    background: linear-gradient(145deg, ${color}, #0a0a0a); 
                    border: 1px solid ${textColor}44; 
                    padding: 8px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    text-align: center;
                    transition: all 0.2s;
                    min-width: 130px;
                    flex: 0 0 130px;
                    min-height: 65px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                `;
                
                if (warning) {
                    div.onmouseover = () => div.style.transform = "scale(1.02)";
                    div.onmouseout = () => div.style.transform = "scale(1)";
                }

                div.innerHTML = `
                    <div style="position: absolute; top: 3px; right: 6px; font-size: 0.55rem; color: ${textColor}; opacity: 0.7;">
                        ${difficultyText}
                    </div>
                    <b style="color:${textColor}; display:block; margin-bottom:2px; font-size: 0.85rem; text-shadow: 0 0 5px ${textColor}44;">${loc.name}</b>
                    <div style="font-size: 0.65rem; color: #aaa; margin-bottom: 2px;">
                        ⚡ ${loc.stamina} | ⏳ ${loc.time/1000}s
                    </div>
                    <div style="width: 100%; height: 3px; background: #222; border-radius: 2px; margin: 2px 0; overflow: hidden;">
                        <div style="width: ${(progress/10)*100}%; height: 100%; background: ${isCompleted ? '#4caf50' : (isBossReady ? '#ff4444' : '#4caf50')}; transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 0.6rem; color: ${isCompleted ? '#4caf50' : (isBossReady ? '#ff4444' : '#888')}; font-weight: ${isCompleted || isBossReady ? 'bold' : 'normal'};">
                        ${isCompleted ? '✅ Thăm dò hoàn thành' : (isBossReady ? '👹 Boss sắp xuất hiện' : `Thăm dò: ${progress}/10`)}
                    </div>
                `;
                div.onclick = () => {
                    if (typeof ExploreSystem !== 'undefined') ExploreSystem.start(proxy, loc);
                };
                mapContainer.appendChild(div);
            });
        },

        /**
         * Hiển thị giao diện thám hiểm
         */
        renderExploreUI: function(locName, duration) {
            const exploreUI = document.getElementById('explore-ui');
            const exploreLocName = document.getElementById('explore-loc-name');
            if (exploreUI) exploreUI.style.display = 'block';
            if (exploreLocName) exploreLocName.innerText = `Đang thám hiểm: ${locName}`;
            this.updateBar('explore', 0, duration / 1000);
        },

        /**
         * Cập nhật tiến độ thám hiểm
         */
        updateExploreProgress: function(elapsed, duration) {
            this.updateBar('explore', elapsed / 1000, duration / 1000);
        },

        /**
         * Ẩn giao diện thám hiểm
         */
        hideExploreUI: function() {
            const exploreUI = document.getElementById('explore-ui');
            if (exploreUI) exploreUI.style.display = 'none';
        },

        /**
         * Hiển thị danh sách môn phái hoặc Đại Điện nếu đã gia nhập
         */
        renderSectList: function(proxy) {
            const sectList = document.getElementById('sect-list');
            if (!sectList || !GameData.sects) return;

            if (proxy.currentSectId) {
                this.renderSectHall(proxy);
                return;
            }

            sectList.innerHTML = '<h3 style="color: #d4af37; text-align: center; margin-bottom: 20px; letter-spacing: 2px; text-shadow: 0 0 10px rgba(212,175,55,0.3);">DANH SÁCH MÔN PHÁI</h3>';
            for (let id in GameData.sects) {
                const sect = GameData.sects[id];
                const canJoinRank = proxy.rankIndex >= sect.reqRank;
                const canJoinPower = proxy.power >= sect.reqPower;

                const repValue = proxy.sectReputation[id] || 0;
                const repInfo = this.getReputationInfo(repValue);

                const sideColor = sect.side === 'Chính phái' ? '#4caf50' : (sect.side === 'Tà phái' ? '#f44336' : '#2196f3');
                const div = document.createElement('div');
                div.className = 'sect-card';
                div.innerHTML = `
                    <div style="position: absolute; top: -5px; right: -5px; font-size: 3rem; opacity: 0.05; pointer-events: none;">${sect.icon}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 1.5rem; background: rgba(0,0,0,0.3); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #444;">${sect.icon}</div>
                            <div>
                                <b style="color: #d4af37; font-size: 0.9rem; letter-spacing: 0.5px;">${sect.name}</b>
                                <div style="display: flex; gap: 4px; margin-top: 2px;">
                                    <span style="font-size: 0.55rem; color: ${sideColor}; border: 1px solid ${sideColor}44; background: ${sideColor}11; padding: 0px 4px; border-radius: 3px; font-weight: bold; text-transform: uppercase;">${sect.side}</span>
                                    <span style="font-size: 0.55rem; color: ${repInfo.color}; background: rgba(0,0,0,0.4); padding: 0px 6px; border-radius: 8px; border: 1px solid ${repInfo.color}33;">Danh vọng: ${repValue}</span>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 0.6rem;">
                            <div style="color: #888; margin-bottom: 2px; font-size: 0.5rem; text-transform: uppercase;">Điều kiện Gia Nhập:</div>
                            <div style="color: ${canJoinRank ? '#4caf50' : '#f44336'}; font-weight: bold;">Cảnh giới: ${GameData.ranks[sect.reqRank].name}</div>
                            <div style="color: ${canJoinPower ? '#4caf50' : '#f44336'}; font-weight: bold; margin-top: 1px;">Lực chiến: ${sect.reqPower}</div>
                        </div>
                    </div>
                `;
                div.onclick = () => this.showSectDetail(id);
                sectList.appendChild(div);
            }
        },

        /**
         * Hiển thị Đại Điện Môn Phái
         */
        renderSectHall: function(proxy) {
            const sectList = document.getElementById('sect-list');
            const sect = GameData.sects[proxy.currentSectId];
            if (!sectList || !sect) return;

            // Kiểm tra xem đã ở trong giao diện Đại Điện chưa
            const hallContainer = document.getElementById('sect-hall-container');
            const repValue = proxy.sectReputation[proxy.currentSectId] || 0;
            const repInfo = this.getReputationInfo(repValue);
            
            if (hallContainer) {
                // Chỉ cập nhật các thông số thay đổi (Cống hiến, Danh vọng)
                const contribEl = document.getElementById('sect-contribution-val');
                if (contribEl) contribEl.innerText = proxy.sectContribution || 0;
                const repEl = document.getElementById('sect-reputation-val');
                if (repEl) {
                    repEl.innerText = `${repValue}`;
                    repEl.style.color = repInfo.color;
                }
                return;
            }

            sectList.innerHTML = `
                <div id="sect-hall-container">
                    <div style="text-align: center; margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.1);">
                        <div style="font-size: 1rem; color: #d4af37; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">ĐẠI ĐIỆN ${sect.name.toUpperCase()}</div>
                        <div style="font-size: 0.65rem; color: #888; font-style: italic; margin-top: 2px;">"${sect.desc}"</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-around; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(212, 175, 55, 0.2); font-size: 0.7rem;">
                        <div onclick="UI.showSectContributionInfo()" style="color: #eee; cursor: pointer; flex: 1; text-align: center;">
                            <span style="color: #d4af37;">⭐</span> Cống hiến: <span id="sect-contribution-val" style="font-weight: bold;">${proxy.sectContribution || 0}</span>
                        </div>
                        <div style="width: 1px; background: rgba(255,255,255,0.1); height: 14px; align-self: center;"></div>
                        <div onclick="UI.showSectReputationInfo()" style="color: #eee; cursor: pointer; flex: 1; text-align: center;">
                            <span style="color: #aaa;">📜</span> Danh vọng: <span id="sect-reputation-val" style="color: ${repInfo.color}; font-weight: bold;">${repValue}</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px;">
                        <div class="sect-action-btn green" onclick="UI.showSectAttendance()">
                            <i>📅</i> ĐIỂM DANH
                        </div>
                        <div class="sect-action-btn blue" onclick="UI.showSectMissions()">
                            <i>📜</i> NHIỆM VỤ
                        </div>
                        <div class="sect-action-btn purple" onclick="UI.showSectShop()">
                            <i>🏪</i> CỬA HÀNG
                        </div>
                        <div class="sect-action-btn cyan" onclick="UI.showSectDetail('${proxy.currentSectId}')">
                            <i>📖</i> THẦN THÔNG
                        </div>
                        <div class="sect-action-btn orange" onclick="UI.showSectGifting()" style="grid-column: span 2;">
                            <i>🎁</i> TẶNG QUÀ MÔN PHÁI
                        </div>
                        <div class="sect-action-btn red" onclick="UI.confirmLeaveSect()" style="grid-column: span 2;">
                            <i>👋</i> RỜI KHỎI MÔN PHÁI
                        </div>
                    </div>

                    <div id="sect-hall-content" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px; border: 1px solid #333; min-height: 100px;">
                        <p style="color: #555; text-align: center; font-size: 0.7rem; margin-top: 20px; font-style: italic;">Chọn chức năng để bắt đầu...</p>
                    </div>
                </div>
            `;
        },

        showSectAttendance: function() {
            const proxy = Game.getProxy();
            const content = document.getElementById('sect-hall-content');
            if (!content) return;

            const sectId = proxy.currentSectId;
            if (!sectId) return;

            const now = new Date();
            const todayStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
            
            const sectLastCheckIn = proxy.sectLastCheckIn || {};
            const lastCheckIn = sectLastCheckIn[sectId] || 0;
            const lastCheckInDate = new Date(lastCheckIn);
            const lastCheckInStr = lastCheckInDate.getFullYear() + '-' + (lastCheckInDate.getMonth() + 1) + '-' + lastCheckInDate.getDate();
            const isCheckedInToday = (todayStr === lastCheckInStr);

            const sectCheckInDay = proxy.sectCheckInDay || {};
            const currentDay = sectCheckInDay[sectId] || 0;

            let html = `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 4px;">
                <span style="font-size: 0.9rem;">📅</span>
                <span style="font-size: 0.8rem; font-weight: bold; color: #4caf50;">ĐIỂM DANH TUẦN</span>
            </div>`;

            html += `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 15px;">`;
            
            for (let i = 1; i <= 7; i++) {
                const isClaimed = i <= currentDay;
                const isCurrent = i === currentDay + 1 && !isCheckedInToday;
                const rewardContrib = Math.floor(20 * Math.pow(1.5, i - 1));
                const rewardStone = Math.floor(100 * Math.pow(1.2, i - 1));
                
                let bgColor = "rgba(255,255,255,0.05)";
                let borderColor = "#333";
                let opacity = "1";
                let statusIcon = "💎";
                let statusText = `Ngày ${i}`;
                let checkMark = "";

                if (isClaimed) {
                    bgColor = "rgba(76, 175, 80, 0.15)";
                    borderColor = "#4caf50";
                    statusIcon = "✅";
                    statusText = "Đã nhận";
                    checkMark = `<div style="position: absolute; top: -5px; right: -5px; background: #4caf50; color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #121212; z-index: 2;">✓</div>`;
                } else if (isCurrent) {
                    bgColor = "rgba(33, 150, 243, 0.1)";
                    borderColor = "#2196f3";
                    statusIcon = "🎁";
                    statusText = "Hôm nay";
                } else {
                    opacity = "0.6";
                }

                html += `
                    <div style="background: ${bgColor}; border: 1px solid ${borderColor}; padding: 6px; border-radius: 8px; text-align: center; opacity: ${opacity}; position: relative; transition: transform 0.2s; box-shadow: ${isClaimed ? '0 0 10px rgba(76, 175, 80, 0.2)' : 'none'};">
                        ${checkMark}
                        <div style="font-size: 0.55rem; color: #aaa; margin-bottom: 2px;">Ngày ${i}</div>
                        <div style="font-size: 1.2rem; margin-bottom: 2px;">${statusIcon}</div>
                        <div style="font-size: 0.6rem; color: #ffeb3b; font-weight: bold; margin-bottom: 1px;">+${rewardContrib} ⭐</div>
                        <div style="font-size: 0.6rem; color: #03a9f4; font-weight: bold;">+${rewardStone} 💎</div>
                        <div style="font-size: 0.5rem; color: #eee; margin-top: 2px;">${statusText}</div>
                    </div>
                `;
            }
            
            html += `</div>`;

            if (!isCheckedInToday) {
                html += `
                    <button class="sect-action-btn green" style="width: 100%; padding: 12px; font-size: 0.9rem; margin-top: 5px; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);" onclick="Game.claimAttendanceReward()">
                        ✨ ĐIỂM DANH NGAY (Ngày ${currentDay + 1})
                    </button>
                `;
            } else {
                html += `
                    <div style="text-align: center; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid #444;">
                        <p style="color: #4caf50; font-size: 0.8rem; margin-bottom: 5px;">✅ Đã điểm danh hôm nay!</p>
                        <p style="color: #888; font-size: 0.65rem; font-style: italic;">Hãy quay lại vào ngày mai để tiếp tục hành trình tu luyện.</p>
                    </div>
                `;
            }

            content.innerHTML = html;
        },

        showSectMissions: function(isAutoUpdate = false) {
            const proxy = Game.getProxy();
            const content = document.getElementById('sect-hall-content');
            if (!content) return;

            // Nếu là cập nhật tự động, chỉ cập nhật nếu đang ở tab nhiệm vụ
            if (isAutoUpdate) {
                const titleEl = content.querySelector('h4');
                if (!titleEl || !titleEl.innerText.includes("NHIỆM VỤ MÔN PHÁI")) return;
            } else {
                // Nếu người dùng chủ động mở tab và không có nhiệm vụ đang làm, làm mới danh sách
                if (!proxy.activeSectMission) {
                    Game.refreshSectMissions();
                }
            }

            let html = `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 4px;">
                <span style="font-size: 0.9rem;">📜</span>
                <span style="font-size: 0.8rem; font-weight: bold; color: #2196f3;">NHIỆM VỤ MÔN PHÁI</span>
            </div>`;
            
            if (proxy.activeSectMission) {
                const m = proxy.activeSectMission;
                const progress = Math.min(100, Math.floor(m.progress));
                html += `
                    <div style="background: rgba(21, 101, 192, 0.05); padding: 15px; border-radius: 12px; border: 1px solid #1565c066; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center;">
                            <b style="color: #00f2ff; font-size: 0.85rem;">⚡ Đang làm: ${m.name}</b>
                            <span style="color: #ffeb3b; font-weight: bold; font-size: 0.9rem; text-shadow: 0 0 5px #ffeb3b44;">${progress}%</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; margin-bottom: 12px; border: 1px solid #333;">
                            <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #1565c0, #00f2ff); box-shadow: 0 0 10px #00f2ff44; transition: width 0.5s;"></div>
                        </div>
                        <p style="color: #aaa; font-size: 0.7rem; font-style: italic; line-height: 1.4;">"${m.desc}"</p>
                        <div style="margin-top: 12px; font-size: 0.7rem; color: #4caf50; background: rgba(76, 175, 80, 0.1); padding: 6px; border-radius: 6px; border: 1px solid #4caf5033; display: flex; justify-content: space-between;">
                            <span>🎁 Thưởng: <b>${m.reward}</b> Linh khí</span>
                            <span>⭐ <b>+${m.contrib}</b> Cống hiến</span>
                        </div>
                    </div>
                `;
            }

            if (!proxy.currentSectMissions || proxy.currentSectMissions.length === 0) {
                html += `<div style="text-align: center; color: #666; padding: 30px; font-style: italic; font-size: 0.8rem;">Hôm nay đã hết nhiệm vụ, hãy quay lại sau!</div>`;
            } else {
                proxy.currentSectMissions.forEach(m => {
                    const isStarted = proxy.activeSectMission && proxy.activeSectMission.id === m.id;
                    html += `
                        <div style="background: #1a1a1a; padding: 12px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #333; opacity: ${isStarted ? 0.5 : 1}; transition: 0.2s; position: relative; overflow: hidden;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <b style="color: #eee; font-size: 0.85rem;">${m.name}</b>
                                <span style="color: #4caf50; font-size: 0.7rem; font-weight: bold; background: rgba(76, 175, 80, 0.1); padding: 1px 6px; border-radius: 4px;">+${m.reward} EXP</span>
                            </div>
                            <p style="color: #888; font-size: 0.7rem; margin: 6px 0; line-height: 1.4;">${m.desc}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px solid #222; padding-top: 8px;">
                                <div style="display: flex; gap: 8px;">
                                    <span style="color: #ffeb3b; font-size: 0.65rem; font-weight: bold;">⭐ +${m.contrib}</span>
                                    <span style="color: #aaa; font-size: 0.65rem;">⏳ ${m.time}s</span>
                                </div>
                                ${!proxy.activeSectMission ? 
                                    `<button class="btn-main btn-blue" onclick="Game.startSectMission('${m.id}')" style="padding: 4px 12px; font-size: 0.65rem; border-radius: 4px;">NHẬN</button>` : 
                                    (isStarted ? `<span style="color: #00f2ff; font-size: 0.7rem; font-weight: bold; animation: pulse 1.5s infinite;">ĐANG LÀM...</span>` : '')
                                }
                            </div>
                        </div>
                    `;
                });
            }
            content.innerHTML = html;
        },

        showSectGifting: function(targetSectId = null) {
            const proxy = Game.getProxy();
            const sectId = targetSectId || proxy.currentSectId;
            const sect = GameData.sects[sectId];
            
            // Nếu đang ở trong Đại Điện, dùng content của Đại Điện, nếu không dùng Modal
            let content;
            const hallContent = document.getElementById('sect-hall-content');
            const isHall = hallContent && (targetSectId === null || targetSectId === proxy.currentSectId);
            
            if (isHall) {
                content = hallContent;
            } else {
                // Mở modal nếu không phải trong Đại Điện
                this.openModal(`${sect.icon} TẶNG QUÀ ${sect.name.toUpperCase()}`, `<div id="sect-gift-modal-content"></div>`, false);
                content = document.getElementById('sect-gift-modal-content');
            }

            if (!content || !sect) return;

            const giftItems = proxy.inventory.filter(i => {
                const item = GameData.items[i.id];
                return item && item.type === 'gift';
            });

            const currentSpiritGifted = proxy.sectSpiritGifts[sectId] || 0;
            const maxSpiritGift = 10000;
            const remainingSpirit = maxSpiritGift - currentSpiritGifted;

            let spiritHtml = `
                <div style="background: rgba(0,242,255,0.05); border: 1px solid rgba(0,242,255,0.2); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <b style="color: #00f2ff; font-size: 0.9rem;">💎 TẶNG LINH THẠCH</b>
                        <span style="font-size: 0.7rem; color: #888;">Tối đa: ${(maxSpiritGift || 0).toLocaleString()}</span>
                    </div>
                    <p style="font-size: 0.7rem; color: #aaa; margin-bottom: 10px;">5 Linh thạch = 1 Cống hiến. Giúp tăng tiến địa vị trong môn phái.</p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="number" id="gift-spirit-amount" placeholder="Nhập số lượng..." 
                               style="flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 6px; border-radius: 4px; font-size: 0.8rem;"
                               min="5" max="${Math.min(proxy.spiritStone, remainingSpirit)}">
                        <button onclick="UI.doGiftSpiritToSect('${sectId}')" 
                                style="background: #00f2ff; color: #000; border: none; padding: 6px 15px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; cursor: pointer;">
                            TẶNG
                        </button>
                    </div>
                    <div style="font-size: 0.65rem; color: #888; margin-top: 8px; display: flex; justify-content: space-between;">
                        <span>Đã tặng: ${(currentSpiritGifted || 0).toLocaleString()} / ${(maxSpiritGift || 0).toLocaleString()}</span>
                        <span>Hiện có: ${(proxy.spiritStone || 0).toLocaleString()} 💎</span>
                    </div>
                </div>
            `;

            let giftsHtml = giftItems.length === 0 ? 
                `<p style="color: #666; text-align: center; font-size: 0.75rem; padding: 10px;">Đạo hữu không có vật phẩm quà tặng nào.</p>` :
                giftItems.map(invItem => {
                    const item = GameData.items[invItem.id];
                    return `
                        <div class="gift-card" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,152,0,0.2); border-radius: 8px; padding: 10px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 1.5rem; background: rgba(0,0,0,0.3); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid rgba(255,152,0,0.3);">
                                ${item.icon}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 0.85rem; font-weight: bold; color: ${this.getRarityColor(item.rarity)}">${item.name}</div>
                                <div style="font-size: 0.7rem; color: #aaa;">${item.desc}</div>
                                <div style="font-size: 0.7rem; color: #ff9800; margin-top: 2px;">+${item.reputationValue} Danh vọng / cái</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.75rem; color: #eee; margin-bottom: 5px;">Sở hữu: <b>${invItem.count}</b></div>
                                <button onclick="UI.doGiftToSect('${invItem.id}', '${sectId}')" style="background: #ff9800; color: #000; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">TẶNG</button>
                            </div>
                        </div>
                    `;
                }).join('');

            content.innerHTML = `
                <div style="margin-bottom: 10px;">
                    ${spiritHtml}
                    <div style="font-size: 0.85rem; color: #ff9800; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,152,0,0.2); padding-bottom: 4px;">🎁 VẬT PHẨM QUÀ TẶNG</div>
                    <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                        ${giftsHtml}
                    </div>
                </div>
            `;
        },

        doGiftToSect: function(itemId, targetSectId = null) {
            if (Game.giftToSect(itemId, 1, targetSectId)) {
                const proxy = Game.getProxy();
                if (proxy.currentSectId === (targetSectId || proxy.currentSectId)) {
                    this.renderSectHall(proxy);
                }
                this.showSectGifting(targetSectId);
            }
        },

        doGiftSpiritToSect: function(targetSectId = null) {
            const input = document.getElementById('gift-spirit-amount');
            if (!input) return;
            const amount = parseInt(input.value);
            if (isNaN(amount) || amount <= 0) {
                UI.addLog("❌ Số lượng không hợp lệ!", false, "fail");
                return;
            }

            if (Game.giftSpiritToSect(amount, targetSectId)) {
                const proxy = Game.getProxy();
                if (proxy.currentSectId === (targetSectId || proxy.currentSectId)) {
                    this.renderSectHall(proxy);
                }
                this.showSectGifting(targetSectId);
            }
        },

        showSectShop: function() {
            const proxy = Game.getProxy();
            const content = document.getElementById('sect-hall-content');
            const sect = GameData.sects[proxy.currentSectId];
            if (!content || !sect || !sect.shop) return;

            let html = `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 4px;">
                <span style="font-size: 0.9rem;">🏪</span>
                <span style="font-size: 0.8rem; font-weight: bold; color: #9c27b0;">CỬA HÀNG MÔN PHÁI</span>
            </div>`;
            html += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">`;
            
            sect.shop.forEach(itemInfo => {
                const item = GameData.items[itemInfo.id];
                if (!item) return;
                
                const currentRep = proxy.sectReputation[proxy.currentSectId] || 0;
                const discount = Math.min(0.5, currentRep / 20000);
                const finalCost = Math.floor(itemInfo.cost * (1 - discount));
                const canAfford = proxy.sectContribution >= finalCost && currentRep >= (itemInfo.reqReputation || 0);
                const repInfo = this.getReputationInfo(itemInfo.reqReputation || 0);
                
                const shopInfo = JSON.stringify({
                    cost: itemInfo.cost,
                    reqReputation: itemInfo.reqReputation || 0,
                    finalCost: finalCost,
                    canAfford: canAfford
                }).replace(/"/g, '&quot;');

                const isRandomEgg = itemInfo.id === 'pet_egg_random';
                const itemClass = isRandomEgg ? "sect-item animate-border-flash" : "sect-item";
                const nameColor = isRandomEgg ? "#ff0000" : this.getRarityColor(item.rarity);

                html += `
                    <div class="${itemClass}" onclick="UI.showItemDetail('${itemInfo.id}', ${shopInfo})" 
                         style="background: linear-gradient(145deg, #1a1a1a, #111); padding: 10px; border-radius: 10px; border: ${isRandomEgg ? 'none' : '1px solid #333'}; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: 0.2s; position: relative;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 1.8rem; background: rgba(0,0,0,0.3); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #444;">${item.icon}</div>
                            <div style="flex: 1; min-width: 0;">
                                <b style="color: ${nameColor}; font-size: 0.75rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</b>
                                <div style="color: ${this.getRarityColor(item.rarity)}; font-size: 0.5rem; opacity: 0.8; margin-top: 1px;">${this.getRarityName(item.rarity)}</div>
                                <b style="color: #ffeb3b; font-size: 0.85rem; display: block; margin-top: 2px;">${finalCost} ⭐</b>
                            </div>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 6px; border: 1px solid #222; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #888; font-size: 0.55rem; text-transform: uppercase;">Yêu Cầu Danh Vọng:</span>
                            <span style="color: ${currentRep >= (itemInfo.reqReputation || 0) ? '#4caf50' : '#f44336'}; font-size: 0.6rem; font-weight: bold;">
                                ${itemInfo.reqReputation || 0}
                            </span>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            content.innerHTML = html;
        },

        confirmLeaveSect: function() {
            const title = "<span style='color: #ff4444;'>XÁC NHẬN XUẤT SƯ</span>";
            const desc = "Đạo hữu có chắc chắn muốn rời khỏi môn phái không? Mọi cống hiến sẽ mất hết, nhưng đạo hữu có thể gia nhập phái khác.";
            
            this.openModal(title, desc);
            const ctrl = document.getElementById('modal-controls');
            if(ctrl) {
                const btn = document.createElement('button'); 
                btn.className = "btn-main";
                btn.innerText = "XÁC NHẬN RỜI PHÁI";
                btn.style.background = "#c62828";
                btn.style.color = "#fff";
                btn.style.padding = "10px";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.fontWeight = "bold";
                btn.style.cursor = "pointer";
                btn.onclick = () => { 
                    Game.leaveSect();
                    this.closeModal(); 
                };
                ctrl.prepend(btn);
            }
        },

        /**
         * Hiển thị chi tiết môn phái
         */
        showSectDetail: function(sectId) {
            const sect = GameData.sects[sectId];
            const proxy = Game.getProxy();
            if (!sect || !proxy) return;

            const repValue = proxy.sectReputation[sectId] || 0;
            
            // --- HIỆU ỨNG KHÔNG CHẾT KHÔNG THÔI ---
            if (repValue < -2000) {
                this.closeModal();
                UI.addLog(`⚠️ Đạo hữu vừa bước chân vào lãnh thổ <b>${sect.name}</b>, đệ tử môn phái lập tức bao vây!`, true);
                UI.addLog(`⚔️ Quan hệ <b>Không Chết Không Thôi</b> khiến họ tấn công ngay lập tức!`, true);
                
                // Tạo kẻ thù mạnh dựa trên cảnh giới
                const enemy = {
                    name: `Trưởng Lão ${sect.name}`,
                    hp: 1000 + (proxy.rankIndex * 500),
                    atk: 150 + (proxy.rankIndex * 80),
                    def: 80 + (proxy.rankIndex * 40),
                    thanphap: 40 + (proxy.rankIndex * 15),
                    exp: 1000,
                    desc: `Trưởng lão của ${sect.name} đang truy sát bạn để giải quyết ân oán.`,
                    skills: []
                };
                BattleSystem.runBattleLoop(proxy, enemy);
                return;
            }

            const isMember = proxy.currentSectId === sectId;
            const canJoin = proxy.rankIndex >= sect.reqRank && proxy.power >= sect.reqPower;

            let content = `<div style="text-align: left;">`;
            content += `<p style="color: #aaa; font-style: italic; margin-bottom: 12px;">"${sect.desc}"</p>`;
            
            content += `<b style="color: #d4af37; font-size: 0.95rem;">ĐIỀU KIỆN GIA NHẬP:</b>`;
            content += `<ul style="font-size: 0.85rem; color: #ccc; margin: 8px 0 20px 20px; line-height: 1.6;">
                            <li style="color: ${proxy.rankIndex >= sect.reqRank ? '#4caf50' : '#f44336'}">Cảnh giới: ${GameData.ranks[sect.reqRank].name}</li>
                            <li style="color: ${proxy.power >= sect.reqPower ? '#4caf50' : '#f44336'}">Lực chiến: ${sect.reqPower}</li>
                        </ul>`;

            content += `<b style="color: #00f2ff; font-size: 0.95rem;">KỸ NĂNG MÔN PHÁI:</b>`;
            content += `<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">`;
            sect.skills.forEach(sid => {
                const skill = GameData.skills[sid];
                if (skill) {
                    const hasSkill = proxy.skills.includes(sid);
                    const currentRep = proxy.sectReputation[sectId] || 0;
                    const reqRep = skill.reqReputation || 0;
                    const canAfford = isMember && proxy.sectContribution >= (skill.contributionCost || 0) && currentRep >= reqRep;
                    const repInfo = this.getReputationInfo(reqRep);
                    
                    content += `
                        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid ${skill.type === 'passive' ? '#ffeb3b' : '#00f2ff'}; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <b style="color: #eee; font-size: ${skill.type === 'passive' ? '0.9rem' : '1.0rem'};">${skill.icon} ${skill.name}</b>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    ${skill.type !== 'passive' ? `<span style="color: #f44336; font-size: 0.65rem; font-weight: bold;">⏳ ${skill.cooldown || 0}s</span>` : ''}
                                    <span style="font-size: 0.65rem; color: ${skill.type === 'passive' ? '#ffeb3b' : '#00f2ff'}; border: 1px solid ${skill.type === 'passive' ? '#ffeb3b' : '#00f2ff'}; padding: 1px 6px; border-radius: 4px;">${skill.type === 'passive' ? 'Bị động' : 'Chủ động'}</span>
                                </div>
                            </div>
                            <div style="font-size: 0.8rem; color: #aaa; margin: 6px 0; line-height: 1.4;">${skill.desc}</div>
                            <div style="color: ${currentRep >= reqRep ? '#4caf50' : '#f44336'}; font-size: 0.7rem; margin: 4px 0;">
                                📜 Yêu Cầu Danh Vọng: ${reqRep}
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                                <span style="color: #ffeb3b; font-size: 0.8rem; font-weight: bold;">Cần Cống Hiến: ${skill.contributionCost || 0} ⭐</span>
                                ${!hasSkill ? 
                                    `<button class="btn-main btn-orange" 
                                             ${canAfford ? '' : 'disabled'} 
                                             onclick="Game.learnSectSkill('${sid}', ${skill.contributionCost || 0}, ${reqRep})">
                                        HỌC
                                    </button>` : 
                                    `<span style="color: #4caf50; font-size: 0.8rem; font-weight: bold;">ĐÃ HỌC</span>`
                                }
                            </div>
                        </div>`;
                }
            });
            content += `</div>`;
            content += `</div>`;

            this.openModal(`${sect.icon} ${sect.name}`, content);
            const ctrl = document.getElementById('modal-controls');
            if (ctrl) {
                if (!isMember) {
                    const joinBtn = document.createElement('button');
                    joinBtn.className = "btn-main";
                    joinBtn.innerText = "GIA NHẬP";
                    joinBtn.style.background = "#d4af37";
                    joinBtn.style.color = "#121212";
                    joinBtn.style.padding = "6px 12px";
                    joinBtn.style.border = "none";
                    joinBtn.style.borderRadius = "4px";
                    joinBtn.style.fontWeight = "bold";
                    joinBtn.style.cursor = "pointer";
                    joinBtn.style.fontSize = "0.75rem";
                    joinBtn.style.flex = "1";
                    joinBtn.style.minWidth = "80px";
                    joinBtn.onclick = () => {
                        Game.joinSect(sectId);
                    };
                    ctrl.prepend(joinBtn);

                    const giftBtn = document.createElement('button');
                    giftBtn.className = "btn-main";
                    giftBtn.innerText = "TẶNG QUÀ";
                    giftBtn.style.background = "#ff9800";
                    giftBtn.style.color = "#121212";
                    giftBtn.style.padding = "6px 12px";
                    giftBtn.style.border = "none";
                    giftBtn.style.borderRadius = "4px";
                    giftBtn.style.fontWeight = "bold";
                    giftBtn.style.cursor = "pointer";
                    giftBtn.style.fontSize = "0.75rem";
                    giftBtn.style.flex = "1";
                    giftBtn.style.minWidth = "80px";
                    giftBtn.onclick = () => {
                        this.showSectGifting(sectId);
                    };
                    ctrl.prepend(giftBtn);
                } 
            }
        },

        showTribulationDefenseDetail: function() {
            const proxy = Game.getProxy();
            const totals = Game.getTotals();
            
            // Re-calculate the logic from core.js
            const rawReduction = typeof BattleSystem !== 'undefined' ? BattleSystem.calcDamageReduction(totals.totalDef) : 0;
            const appliedReduction = Math.min(0.40, rawReduction);
            
            const boneData = GameData.boneQualities[proxy.boneQualityId] || GameData.boneQualities["pham"];
            const boneReduction = boneData.tribulationReduction || 0;
            
            const totalReduction = Math.min(0.80, appliedReduction + boneReduction);
            
            const html = `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid #444;">
                        <div style="color: #d4af37; font-size: 0.9rem; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 4px;">PHÒNG NGỰ LÔI KIẾP</div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: #aaa; font-size: 0.8rem;">Từ Phòng Ngự (${totals.totalDef}):</span>
                            <b style="color: #4caf50; font-size: 0.8rem;">Giảm ${Math.round(appliedReduction * 100)} %</b>
                        </div>
                        <div style="font-size: 0.65rem; color: #666; margin-top: -4px; margin-bottom: 8px;">(Tối đa 40 % cho Lôi Kiếp)</div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: #aaa; font-size: 0.8rem;">Từ Căn Cốt (${boneData.name}):</span>
                            <b style="color: #2196f3; font-size: 0.8rem;">Giảm ${Math.round(boneReduction * 100)} %</b>
                        </div>
                        
                        <div style="height: 1px; background: #444; margin: 8px 0;"></div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #eee; font-weight: bold;">TỔNG GIẢM SÁT THƯƠNG:</span>
                            <b style="color: #ffeb3b; font-size: 1.1rem; text-shadow: 0 0 10px rgba(255, 235, 59, 0.4);">${Math.round(totalReduction * 100)} %</b>
                        </div>
                        <div style="font-size: 0.65rem; color: #666; text-align: right; margin-top: 2px;">(Giới hạn tối đa 80 %)</div>
                    </div>
                    
                    <div style="font-size: 0.75rem; color: #888; font-style: italic; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                        * Lôi kiếp gây sát thương theo % máu tối đa. Giảm sát thương giúp đạo hữu trụ vững trước thiên uy.
                    </div>
                </div>
            `;
            
            this.openModal("CHI TIẾT PHÒNG NGỰ", html, false);
        },

        showRealmGuide: function(realmName) {
            // 1. Show the guide tab
            this.showTab('guide');
            
            // 2. Switch to the 'Cảnh Giới' sub-tab
            const ranksTabBtn = document.getElementById('guide-tab-ranks');
            if (ranksTabBtn) {
                ranksTabBtn.click();
            }
            
            // 3. Scroll to the specific realm
            setTimeout(() => {
                const realmEl = document.getElementById(`guide-rank-${realmName.replace(/\s+/g, '')}`);
                if (realmEl) {
                    realmEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the realm
                    realmEl.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.8)';
                    realmEl.style.transform = 'scale(1.02)';
                    realmEl.style.transition = 'all 0.3s';
                    setTimeout(() => {
                        realmEl.style.boxShadow = '';
                        realmEl.style.transform = '';
                    }, 2000);
                }
            }, 100);
        },

        showRankDetail: function() {
            const proxy = Game.getProxy();
            const currentRank = GameData.ranks[proxy.rankId - 1] || GameData.ranks[0];
            const nextRank = GameData.ranks[proxy.rankId];
            const boneData = GameData.boneQualities[proxy.boneQualityId] || GameData.boneQualities["pham"];
            
            const growthMult = currentRank ? (currentRank.mult || 1.0) : 1.0;
            const nextGrowthMult = nextRank ? (nextRank.mult || 1.2) : 0;
            const boneGrowth = boneData.growthMult || 1.0;
            
            const totalNextMult = nextGrowthMult * boneGrowth;
            const nextBonusPercent = Math.round((totalNextMult - 1) * 100);

            const html = `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="background: rgba(212, 175, 55, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.3); text-align: center;">
                        <div style="color: #aaa; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">CẢNH GIỚI HIỆN TẠI</div>
                        <div style="color: #d4af37; font-size: 1.8rem; font-weight: bold; text-shadow: 0 0 15px rgba(212, 175, 55, 0.4);">${currentRank ? currentRank.name : 'Phàm Nhân'}</div>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px; border: 1px solid #333;">
                        <div style="color: #aaa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #222; padding-bottom: 8px;">CHỈ SỐ CỘNG THÊM</div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #888; font-size: 0.9rem;">Hệ số tăng trưởng:</span>
                            <b style="color: #4caf50; font-size: 0.9rem;">x${growthMult.toFixed(1)}</b>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #888; font-size: 0.9rem;">Tăng tất cả chỉ số:</span>
                            <b style="color: #ff9800; font-size: 0.9rem;">+${Math.round((growthMult - 1) * 100)}%</b>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #888; font-size: 0.9rem;">Linh khí yêu cầu:</span>
                            <b style="color: #2196f3; font-size: 0.9rem;">${currentRank ? (currentRank.expReq || 0).toLocaleString() : '0'}</b>
                        </div>

                        <div style="height: 1px; background: #222; margin: 12px 0;"></div>
                        
                        <p style="font-size: 0.75rem; color: #777; font-style: italic; line-height: 1.4;">
                            * Khi đột phá lên cảnh giới này, các chỉ số cơ bản (Công, Thủ, Thân Pháp, May Mắn, Máu) của bạn sẽ được nhân với hệ số đột phá.
                        </p>
                    </div>

                    ${nextRank ? `
                    <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; border: 1px solid #444;">
                        <div style="color: #aaa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">CẢNH GIỚI TIẾP THEO</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #eee; font-size: 0.95rem; font-weight: 500;">${nextRank.name}:</span>
                            <b style="color: #4caf50; font-size: 1rem;">x${totalNextMult.toFixed(1)} (+${nextBonusPercent}%)</b>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;

            this.openModal("CHI TIẾT CẢNH GIỚI", html, false);
        }
    };
})();

window.UI = UI;
window.UISystem = UI;
