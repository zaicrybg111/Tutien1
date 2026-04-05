/**
 * Game Data - Chứa danh sách vật phẩm, cảnh giới, thần thông, bản đồ và quái vật.
 */
export const GameData = {
    ranks: [
        { id: 1, name: "Phàm Nhân", expReq: 100, mult: 1.0 },
        // Luyện Khí (9 tầng)
        { id: 2, name: "Luyện Khí Tầng 1", expReq: 200, mult: 1.2 },
        { id: 3, name: "Luyện Khí Tầng 2", expReq: 300, mult: 1.6 },
        { id: 4, name: "Luyện Khí Tầng 3", expReq: 450, mult: 1.6 },
        { id: 5, name: "Luyện Khí Tầng 4", expReq: 650, mult: 1.6 },
        { id: 6, name: "Luyện Khí Tầng 5", expReq: 900, mult: 1.6 },
        { id: 7, name: "Luyện Khí Tầng 6", expReq: 1200, mult: 1.6 },
        { id: 8, name: "Luyện Khí Tầng 7", expReq: 1600, mult: 1.6 },
        { id: 9, name: "Luyện Khí Tầng 8", expReq: 2100, mult: 1.6 },
        { id: 10, name: "Luyện Khí Tầng 9", expReq: 2800, mult: 1.6 },
        // Trúc Cơ (3 giai đoạn)
        { id: 11, name: "Trúc Cơ Sơ Kỳ", expReq: 5000, mult: 1.6 },
        { id: 12, name: "Trúc Cơ Trung Kỳ", expReq: 8000, mult: 1.6 },
        { id: 13, name: "Trúc Cơ Viên Mãn", expReq: 12000, mult: 1.6 },
        // Kết Đan
        { id: 14, name: "Kết Đan Sơ Kỳ", expReq: 25000, mult: 1.6 },
        { id: 15, name: "Kết Đan Trung Kỳ", expReq: 40000, mult: 1.6 },
        { id: 16, name: "Kết Đan Viên Mãn", expReq: 60000, mult: 1.6 },
        // Nguyên Anh
        { id: 17, name: "Nguyên Anh Sơ Kỳ", expReq: 120000, mult: 1.6 },
        { id: 18, name: "Nguyên Anh Trung Kỳ", expReq: 180000, mult: 1.6 },
        { id: 19, name: "Nguyên Anh Viên Mãn", expReq: 250000, mult: 1.6 },
        // Hóa Thần
        { id: 20, name: "Hóa Thần Sơ Kỳ", expReq: 500000, mult: 1.6 },
        { id: 21, name: "Hóa Thần Trung Kỳ", expReq: 750000, mult: 1.6 },
        { id: 22, name: "Hóa Thần Viên Mãn", expReq: 1000000, mult: 1.6 },
        // Luyện Hư
        { id: 23, name: "Luyện Hư Sơ Kỳ", expReq: 2000000, mult: 1.6 },
        { id: 24, name: "Luyện Hư Trung Kỳ", expReq: 3000000, mult: 1.6 },
        { id: 25, name: "Luyện Hư Viên Mãn", expReq: 4500000, mult: 1.6 },
        // Hợp Thể
        { id: 26, name: "Hợp Thể Sơ Kỳ", expReq: 8000000, mult: 1.6 },
        { id: 27, name: "Hợp Thể Trung Kỳ", expReq: 12000000, mult: 1.6 },
        { id: 28, name: "Hợp Thể Viên Mãn", expReq: 18000000, mult: 1.6 },
        // Đại Thừa
        { id: 29, name: "Đại Thừa Sơ Kỳ", expReq: 35000000, mult: 1.6 },
        { id: 30, name: "Đại Thừa Trung Kỳ", expReq: 50000000, mult: 1.6 },
        { id: 31, name: "Đại Thừa Viên Mãn", expReq: 75000000, mult: 1.6 },
        // Độ Kiếp
        { id: 32, name: "Độ Kiếp Sơ Kỳ", expReq: 150000000, mult: 1.6 },
        { id: 33, name: "Độ Kiếp Trung Kỳ", expReq: 250000000, mult: 1.6 },
        { id: 34, name: "Độ Kiếp Viên Mãn", expReq: 400000000, mult: 1.6 },
        // Thiên Tiên
        { id: 35, name: "Thiên Tiên Sơ Kỳ", expReq: 800000000, mult: 1.6 },
        { id: 36, name: "Thiên Tiên Trung Kỳ", expReq: 1200000000, mult: 1.6 },
        { id: 37, name: "Thiên Tiên Viên Mãn", expReq: 1800000000, mult: 1.6 },
        // Kim Tiên
        { id: 38, name: "Kim Tiên Sơ Kỳ", expReq: 3000000000, mult: 1.6 },
        { id: 39, name: "Kim Tiên Trung Kỳ", expReq: 4500000000, mult: 1.6 },
        { id: 40, name: "Kim Tiên Viên Mãn", expReq: 6500000000, mult: 1.6 },
        // Đại La Kim Tiên
        { id: 41, name: "Đại La Kim Tiên Sơ Kỳ", expReq: 10000000000, mult: 1.6 },
        { id: 42, name: "Đại La Kim Tiên Trung Kỳ", expReq: 15000000000, mult: 1.6 },
        { id: 43, name: "Đại La Kim Tiên Viên Mãn", expReq: 22000000000, mult: 1.6 },
        // Thánh Nhân
        { id: 44, name: "Thánh Nhân Sơ Kỳ", expReq: 40000000000, mult: 1.6 },
        { id: 45, name: "Thánh Nhân Trung Kỳ", expReq: 60000000000, mult: 1.6 },
        { id: 46, name: "Thánh Nhân Viên Mãn", expReq: 100000000000, mult: 1.6 }
    ],

    boneQualities: {
        "pham": { id: "pham", name: "Phàm Cốt", color: "#888", cultRate: 1.0, growthMult: 1.0, stats: {}, tribulationReduction: 0 },
        "linh": { id: "linh", name: "Linh Cốt", color: "#4caf50", cultRate: 1.05, growthMult: 1.05, stats: {}, tribulationReduction: 0 },
        "dia": { id: "dia", name: "Địa Cốt", color: "#2196f3", cultRate: 1.1, growthMult: 1.1, stats: { hpMax: 0.05, def: 0.05 }, tribulationReduction: 0 },
        "thien": { id: "thien", name: "Thiên Cốt", color: "#9c27b0", cultRate: 1.15, growthMult: 1.15, stats: { all: 0.07 }, tribulationReduction: 0.05 },
        "tien": { id: "tien", name: "Tiên Cốt", color: "#ffeb3b", cultRate: 1.2, growthMult: 1.2, stats: { all: 0.10 }, tribulationReduction: 0.10 },
        "chiton": { id: "chiton", name: "Chí Tôn Cốt", color: "#ff4444", cultRate: 1.25, growthMult: 1.25, stats: { all: 0.20 }, tribulationReduction: 0.15, aura: true }
    },

    tribulations: {
        0: { 
            id: "trib_1", name: "Thiên Đạo Ý Niệm", 
            desc: "Thiên đạo khẽ liếc nhìn kẻ phàm trần muốn nghịch thiên cải mệnh.",
            hp: 999999999999, maxHp: 99999999999999, atk: 25, def: 10, thanphap: 15, exp: 0,
            isTribulation: true,
            rankName: "Luyện Khí"
        },
        9: { 
            id: "trib_2", name: "Tam Lôi Thiên Kiếp", 
            desc: "Ba đạo thiên lôi giáng xuống thử thách căn cơ để bước vào Trúc Cơ.",
            hp: 10300, atk: 1030, def: 515, thanphap: 257, exp: 0,
            isTribulation: true,
            rankName: "Trúc Cơ"
        },
        13: { 
            id: "trib_3", name: "Lục Lôi Thiên Kiếp", 
            desc: "Sáu đạo thiên lôi cuồng bạo thử thách Kết Đan.",
            hp: 67500, atk: 6750, def: 3375, thanphap: 1687, exp: 0,
            isTribulation: true,
            rankName: "Kết Đan"
        },
        16: { 
            id: "trib_4", name: "Cửu Lôi Thiên Kiếp", 
            desc: "Chín đạo thiên lôi hủy diệt thử thách Nguyên Anh.",
            hp: 276000, atk: 27600, def: 13800, thanphap: 6900, exp: 0,
            isTribulation: true,
            rankName: "Nguyên Anh"
        },
        19: { 
            id: "trib_5", name: "Tứ Tượng Thiên Kiếp", 
            desc: "Bốn đại thần thú ảo ảnh giáng thế thử thách Hóa Thần.",
            hp: 1130000, atk: 113000, def: 56500, thanphap: 28250, exp: 0,
            isTribulation: true,
            rankName: "Hóa Thần"
        }
    },

    items: {
        // --- TIÊU HAO ---
        "spirit_stone": { id: "spirit_stone", name: "Linh Thạch", type: "material", rarity: "rare", icon: "💎", desc: "Chứa đựng linh khí trời đất, dùng để giao dịch hoặc tu luyện.", stackLimit: 10000 },
        "item_hoang_lang_vuong_hach": { 
            id: "item_hoang_lang_vuong_hach", 
            name: "Tinh Hạch Hoang Lang Vương", 
            type: "quest_item", 
            rarity: "epic", 
            icon: "💎", 
            desc: "Tiêu diệt Boss Hoang Lang Vương tại Tân Thủ Thôn, để thu thập 1 Tinh Hạch Boss Hoang Lang Vương cho Người Thần Bí.", 
            stackLimit: 1, 
            isSectBound: true,
            noDiscard: true,
            noTrade: true
        },
        "item_mysterious_token": { 
            id: "item_mysterious_token", name: "Tín Vật Của Người Thần Bí", type: "quest_item", rarity: "mythic", icon: "🧿", 
            desc: "Một miếng ngọc bội đen tuyền tỏa ra khí tức u minh. Có thể tiêu tốn 100 Linh Thạch làm năng lượng để kêu gọi Người Thần Bí. Cảnh báo: Đừng làm phiền người thần bí khi không cần thiết nếu chưa muốn chết.", 
            stackLimit: 1,
            isSectBound: true, // Non-tradable/sellable
            consumeOnUse: false, // Permanent item
            effect: (proxy) => {
                const spiritStoneCount = typeof BagSystem !== 'undefined' ? BagSystem.getItemCount("spirit_stone") : 0;
                if (spiritStoneCount < 100) return "❌ Không đủ Linh Thạch để kích hoạt tín vật! (Cần 100 💎)";
                
                if (typeof BagSystem !== 'undefined') {
                    BagSystem.removeItemsById("spirit_stone", 100);
                }
                
                setTimeout(() => {
                    if (typeof UI !== 'undefined') UI.showMysteriousPerson();
                }, 500);
                return "✨ Đã tiêu tốn 100 Linh Thạch, không gian xung quanh bắt đầu vặn xoắn...";
            }
        },
        "item_mask_mysterious": { 
            id: "item_mask_mysterious", name: "Mặt Nạ Vô Diện", type: "equipment", slot: "head", rarity: "rare", icon: "🎭", 
            desc: "Là sức mạnh, nhưng cũng là gông giềng xiềng xích. Tăng mạnh các chỉ số của ngươi, nhưng cũng làm giới hạn cảnh giới của ngươi, cảnh giới tối đa của ngươi là luyện khí tầng 5. Vật phẩm của người thần bí, hắn có thể cảm nhận được nó và tìm thấy ngươi..... (Cảnh báo: Sau khi trang bị sẽ không thể tháo xuống. Sẽ bị Người Thần Bí thu hồi sau khi hoàn thành nhiệm vụ Tinh Hạch Hoang Lang Vương).", 
            stackLimit: 1, isSectBound: true,
            stats: { atk: 10, def: 10, thanphap: 10, luk: 10, hpMult: 0.5, mpMult: 0.5, staMult: 0.5 }
        },
        "pill_mysterious": { 
            id: "pill_mysterious", name: "Phế Phẩm Hỗn Độn Đan", type: "pill", pillCategory: "stat", rarity: "mythic", icon: "💊", 
            desc: "Viên đan dược bị lỗi trong quá trình luyện chế, tuy vẫn có tác dụng nhưng linh khí đã tiêu tán phần lớn. Tăng vĩnh viễn 100 HP và 20 MP. Tối đa sử dụng 10 viên.",
            stackLimit: 10,
            effect: (proxy) => { 
                if (!proxy.pillUsage) proxy.pillUsage = {};
                const used = proxy.pillUsage["pill_mysterious"] || 0;
                if (used >= 10) {
                    return "❌ Đạo hữu đã sử dụng tối đa 10 viên Phế Phẩm Hỗn Độn Đan, cơ thể không thể hấp thụ thêm linh khí từ loại đan dược này nữa!";
                }
                proxy.pillUsage["pill_mysterious"] = used + 1;
                proxy.hpMax += 100; 
                proxy.mpMax += 20; 
                proxy.hp = proxy.hpMax;
                proxy.currentMp = proxy.mpMax;
                return `✨ Đã sử dụng Phế Phẩm Hỗn Độn Đan! HP +100, MP +20. (Đã dùng: ${used + 1}/10)`; 
            },
            consumeOnUse: (proxy) => {
                const used = (proxy.pillUsage && proxy.pillUsage["pill_mysterious"]) || 0;
                return used < 10;
            }
        },
        "weapon_mysterious_broken": { 
            id: "weapon_mysterious_broken", name: "Cổ Kiếm Tàn Khuyết", type: "equipment", slot: "weapon", rarity: "mythic", icon: "🗡️", 
            desc: "Thanh cổ kiếm đã bị gãy, uy lực giảm sút trầm trọng nhưng vẫn mang theo hơi thở của thời đại thượng cổ. Vốn là Thần Khí hiếm có, không biết vì lý do gì mà trở lên không trọn vẹn...",
            stats: { atk: 200, thanphap: 50, luk: 20 }
        },
        "pet_food_basic": { id: "pet_food_basic", name: "Thức ăn linh thú (Thường)", type: "pet_food", rarity: "common", icon: "🍖", desc: "Thức ăn cơ bản cho linh thú, giúp tăng trung thành.", stackLimit: 100, loyaltyGain: [10, 15] },
        "pet_food_premium": { id: "pet_food_premium", name: "Thức ăn linh thú (Cao cấp)", type: "pet_food", rarity: "rare", icon: "🍗", desc: "Thức ăn ngon miệng cho linh thú, tăng nhiều trung thành.", stackLimit: 100, loyaltyGain: [20, 30] },
        "pet_food_rare": { id: "pet_food_rare", name: "Thức ăn linh thú (Quý hiếm)", type: "pet_food", rarity: "epic", icon: "🥩", desc: "Thức ăn cực phẩm cho linh thú, tăng cực nhiều trung thành.", stackLimit: 100, loyaltyGain: [40, 60] },
        "pet_egg_linh": {
            id: "pet_egg_linh", name: "Trứng linh thú (Linh cấp)", type: "pet_egg", rarity: "rare", icon: "🥚", 
            desc: "Quả trứng chứa đựng linh hồn của linh thú, có tỷ lệ cao nở ra linh thú Linh cấp.",
            stackLimit: 10,
            action: "hatch_pet_linh"
        },
        "pet_egg_dia": {
            id: "pet_egg_dia", name: "Trứng linh thú (Địa cấp)", type: "pet_egg", rarity: "epic", icon: "🥚", 
            desc: "Quả trứng quý hiếm, có tỷ lệ cao nở ra linh thú Địa cấp.",
            stackLimit: 10,
            action: "hatch_pet_dia"
        },
        "pet_egg_thien": {
            id: "pet_egg_thien", name: "Trứng linh thú (Thiên cấp)", type: "pet_egg", rarity: "legendary", icon: "🥚", 
            desc: "Quả trứng cực kỳ quý hiếm, có tỷ lệ cao nở ra linh thú Thiên cấp.",
            stackLimit: 10,
            action: "hatch_pet_thien"
        },
        "pet_egg_than": {
            id: "pet_egg_than", name: "Trứng linh thú (Thần cấp)", type: "pet_egg", rarity: "mythic", icon: "🥚", 
            desc: "Quả trứng huyền thoại, có tỷ lệ cao nở ra linh thú Thần cấp.",
            stackLimit: 10,
            action: "hatch_pet_than"
        },
        "pet_egg_random": {
            id: "pet_egg_random", name: "Trứng linh thú (Ngẫu nhiên)", type: "pet_egg", rarity: "none", icon: "🥚", 
            desc: "Quả trứng bí ẩn, có thể nở ra bất kỳ loại linh thú nào, hoặc cũng có thể bị ung.",
            stackLimit: 10,
            action: "hatch_pet_random"
        },
        "qi_pill": { 
            id: "qi_pill", name: "Bổ Khí Đan", type: "pill", pillCategory: "mana", rarity: "uncommon", icon: "💊", desc: "Tăng 50 Linh khí ngay lập tức.",
            stackLimit: 99,
            effect: (proxy) => { proxy.mana += 50; return "Sử dụng Bổ Khí Đan, cảm thấy linh khí tràn đầy!"; }
        },
        "gift_wine": {
            id: "gift_wine", name: "Rượu Ngon", type: "gift", rarity: "common", icon: "🍶", 
            desc: "Một vò rượu ngon, có thể dùng làm quà tặng cho môn phái để tăng danh vọng.",
            stackLimit: 50,
            reputationValue: 10
        },
        "gift_tea": {
            id: "gift_tea", name: "Linh Trà", type: "gift", rarity: "uncommon", icon: "🍵", 
            desc: "Trà được hái từ đỉnh núi cao, chứa đựng linh khí, quà tặng quý giá cho môn phái.",
            stackLimit: 50,
            reputationValue: 30
        },
        "gift_painting": {
            id: "gift_painting", name: "Cổ Họa", type: "gift", rarity: "rare", icon: "📜", 
            desc: "Bức họa cổ quý hiếm, các bậc tiền bối môn phái rất yêu thích.",
            stackLimit: 10,
            reputationValue: 100
        },
        "gift_jade": {
            id: "gift_jade", name: "Linh Ngọc", type: "gift", rarity: "epic", icon: "💎", 
            desc: "Khối ngọc thạch chứa linh khí thuần khiết, là lễ vật cực phẩm cho môn phái.",
            stackLimit: 5,
            reputationValue: 300
        },
        "hp_pill_1": {
            id: "hp_pill_1", name: "Hồi Xuân Đan", type: "pill", pillCategory: "hp", rarity: "common", icon: "🧪", desc: "Hồi phục 50 HP.",
            stackLimit: 99,
            effect: (proxy) => { proxy.hp = Math.min(proxy.hpMax + (proxy.equipHpBuff || 0), proxy.hp + 50); return "Sử dụng Hồi Xuân Đan, vết thương khép lại."; }
        },
        "mp_pill_1": {
            id: "mp_pill_1", name: "Hồi Khí Đan", type: "pill", pillCategory: "mp", rarity: "common", icon: "🧪", desc: "Hồi phục 40 Linh lực (MP).",
            stackLimit: 99,
            effect: (proxy) => { proxy.currentMp = Math.min(proxy.mpMax + (proxy.equipMpBuff || 0), proxy.currentMp + 40); return "Sử dụng Hồi Khí Đan, linh lực khôi phục."; }
        },

        // --- TRANG BỊ: VŨ KHÍ ---
        "weapon_wooden_sword": { 
            id: "weapon_wooden_sword", name: "Thanh Mộc Kiếm", type: "equipment", slot: "weapon", rarity: "common", icon: "🗡️", 
            desc: "Kiếm gỗ thô sơ, dùng để phòng thân.",
            stats: { atk: 5, thanphap: 2 }
        },
        "weapon_iron_sword": { 
            id: "weapon_iron_sword", name: "Thiết Kiếm", type: "equipment", slot: "weapon", rarity: "uncommon", icon: "⚔️", 
            desc: "Thanh kiếm bằng sắt rèn kỹ.",
            stats: { atk: 15, thanphap: 5 }
        },
        "weapon_spirit_blade": { 
            id: "weapon_spirit_blade", name: "Linh Quang Đao", type: "equipment", slot: "weapon", rarity: "rare", icon: "🪓", 
            desc: "Đao mang linh lực, chém sắt như bùn.",
            stats: { atk: 45, thanphap: 10, luk: 5 }
        },
        "weapon_dragon_slayer": { 
            id: "weapon_dragon_slayer", name: "Trảm Long Kiếm", type: "equipment", slot: "weapon", rarity: "epic", icon: "🔥", 
            desc: "Thần binh truyền thuyết, tỏa ra long uy.",
            stats: { atk: 120, thanphap: 25, luk: 15 }
        },
        "weapon_heaven_shaker": { 
            id: "weapon_heaven_shaker", name: "Thiên Đạo Trấn Thế", type: "equipment", slot: "weapon", rarity: "legendary", icon: "⚡", 
            desc: "Vũ khí tối thượng, có thể chấn động thiên địa.",
            stats: { atk: 500, thanphap: 100, luk: 50 }
        },
        "weapon_void_reaper": { 
            id: "weapon_void_reaper", name: "Hư Không Trảm", type: "equipment", slot: "weapon", rarity: "epic", icon: "🌑", 
            desc: "Lưỡi hái tử thần, cắt đứt không gian.",
            stats: { atk: 250, thanphap: 40, luk: 20 }
        },
        "weapon_chaos_bringer": { 
            id: "weapon_chaos_bringer", name: "Hỗn Độn Ma Kiếm", type: "equipment", slot: "weapon", rarity: "legendary", icon: "👿", 
            desc: "Kiếm mang sức mạnh hỗn mang, thôn phệ linh hồn.",
            stats: { atk: 800, thanphap: 150, luk: 80 }
        },
        "weapon_primordial_origin": { 
            id: "weapon_primordial_origin", name: "Thái Sơ Nguyên Khí", type: "equipment", slot: "weapon", rarity: "mythic", icon: "🌌", 
            desc: "Vũ khí khởi nguyên của vũ trụ, nắm giữ quy tắc.",
            stats: { atk: 2500, thanphap: 500, luk: 200 }
        },
        "weapon_soul_slayer": { 
            id: "weapon_soul_slayer", name: "Diệt Hồn Kiếm", type: "equipment", slot: "weapon", rarity: "mythic", icon: "💀", 
            desc: "Thanh kiếm có thể chém đứt linh hồn, bỏ qua mọi phòng ngự.",
            stats: { atk: 5000, thanphap: 1000, luk: 500 }
        },

        // --- PHÁP BẢO (MAGICAL TREASURES) ---
        "treasure_lang_nha_bong": {
            id: "treasure_lang_nha_bong",
            name: "Lang Nha Bổng",
            type: "equipment",
            slot: "weapon",
            rarity: "epic",
            icon: "🎋",
            desc: "Một cây gậy gai góc, tỏa ra sát khí nồng đậm, chuyên dùng để phá tan phòng ngự kẻ địch.",
            value: 5000,
            stats: {
                atk: [5, 8],
                thanphap: [2, 3]
            }
        },
        "treasure_chu_ma_kiem": {
            id: "treasure_chu_ma_kiem",
            name: "Chu Ma Kiếm",
            type: "equipment",
            slot: "weapon",
            rarity: "epic",
            icon: "🗡️",
            desc: "Thanh kiếm sắc bén có khả năng trảm yêu trừ ma, giúp người sử dụng di chuyển linh hoạt như gió.",
            value: 5000,
            stats: {
                atk: [2, 3],
                thanphap: [5, 8]
            }
        },
        "treasure_khong_gian_gioi_chi": {
            id: "treasure_khong_gian_gioi_chi",
            name: "Không Gian Giới Chỉ",
            type: "equipment",
            slot: "ring",
            rarity: "epic",
            icon: "💍",
            desc: "Nhẫn chứa đựng không gian huyền bí, không chỉ tăng cường tu vi mà còn mở rộng túi đồ của người sở hữu.",
            value: 6000,
            stats: {
                atk: [2, 3],
                thanphap: [2, 3],
                def: [2, 3]
            },
            inventorySpace: 20
        },

        // --- TRANG BỊ: ĐẦU ---
        "head_cloth_cap": { 
            id: "head_cloth_cap", name: "Mũ Vải", type: "equipment", slot: "head", rarity: "common", icon: "🧢", 
            desc: "Mũ vải đơn giản của phàm nhân.",
            stats: { def: 2, hp: 10 }
        },
        "head_iron_helmet": { 
            id: "head_iron_helmet", name: "Mũ Sắt", type: "equipment", slot: "head", rarity: "uncommon", icon: "🪖", 
            desc: "Mũ bảo hộ bằng sắt chắc chắn.",
            stats: { def: 8, hp: 40 }
        },
        "head_spirit_crown": { 
            id: "head_spirit_crown", name: "Linh Quang Quán", type: "equipment", slot: "head", rarity: "rare", icon: "👑", 
            desc: "Vương miện chứa linh khí bảo vệ thần thức.",
            stats: { def: 25, hp: 150, mp: 50 }
        },
        "head_dragon_helm": { 
            id: "head_dragon_helm", name: "Long Lân Mão", type: "equipment", slot: "head", rarity: "epic", icon: "🐲", 
            desc: "Mũ làm từ vảy rồng, uy nghiêm bất phàm.",
            stats: { def: 80, hp: 500, mp: 100 }
        },
        "head_mystic_hood": { 
            id: "head_mystic_hood", name: "Mũ Trùm Huyền Bí", type: "equipment", slot: "head", rarity: "rare", icon: "👤", 
            desc: "Mũ trùm che giấu diện mạo.",
            stats: { def: 20, hp: 100 }
        },
        "head_celestial_tiara": { 
            id: "head_celestial_tiara", name: "Thiên Tiên Quán", type: "equipment", slot: "head", rarity: "epic", icon: "👑", 
            desc: "Mũ miện tiên gia, tỏa ra tiên khí.",
            stats: { def: 60, hp: 400, mp: 150 }
        },
        "head_heavenly_crown": { 
            id: "head_heavenly_crown", name: "Thiên Đế Miện", type: "equipment", slot: "head", rarity: "legendary", icon: "🤴", 
            desc: "Vương miện của bậc chí tôn, vạn pháp bất xâm.",
            stats: { def: 200, hp: 2000, mp: 500 }
        },
        "head_void_mask": { 
            id: "head_void_mask", name: "Mặt Nạ Hư Không", type: "equipment", slot: "head", rarity: "mythic", icon: "🎭", 
            desc: "Mặt nạ che giấu thiên cơ, tăng mạnh thần thức.",
            stats: { def: 500, hp: 10000, mp: 2000 }
        },

        // --- TRANG BỊ: GIÁP ---
        "body_leather_armor": { 
            id: "body_leather_armor", name: "Giáp Da", type: "equipment", slot: "body", rarity: "common", icon: "🧥", 
            desc: "Áo giáp làm từ da thú.",
            stats: { def: 5, hp: 25 }
        },
        "body_iron_armor": { 
            id: "body_iron_armor", name: "Giáp Sắt", type: "equipment", slot: "body", rarity: "uncommon", icon: "👕", 
            desc: "Giáp sắt nặng nề nhưng bảo vệ tốt.",
            stats: { def: 15, hp: 100 }
        },
        "body_mystic_robe": { 
            id: "body_mystic_robe", name: "Huyền Lam Bào", type: "equipment", slot: "body", rarity: "rare", icon: "🥋", 
            desc: "Đạo bào của tu sĩ, có khả năng giảm sát thương pháp thuật.",
            stats: { def: 40, hp: 300, mp: 100 }
        },
        "body_celestial_armor": { 
            id: "body_celestial_armor", name: "Thiên Tiên Giáp", type: "equipment", slot: "body", rarity: "epic", icon: "✨", 
            desc: "Giáp tiên lấp lánh, nhẹ nhàng nhưng cực kỳ bền chắc.",
            stats: { def: 120, hp: 1000, mp: 200 }
        },
        "body_void_plate": { 
            id: "body_void_plate", name: "Hư Không Chiến Giáp", type: "equipment", slot: "body", rarity: "legendary", icon: "🌌", 
            desc: "Bộ giáp rèn từ tinh hoa hư không, miễn dịch nhiều loại sát thương.",
            stats: { def: 350, hp: 5000, mp: 1000 }
        },
        "body_primordial_robe": { 
            id: "body_primordial_robe", name: "Thái Sơ Đạo Bào", type: "equipment", slot: "body", rarity: "mythic", icon: "🧥", 
            desc: "Đạo bào dệt từ quy tắc thái sơ, bất tử bất diệt.",
            stats: { def: 1000, hp: 50000, mp: 5000 }
        },

        // --- TRANG BỊ: QUẦN ---
        "legs_cloth_pants": { 
            id: "legs_cloth_pants", name: "Quần Vải", type: "equipment", slot: "legs", rarity: "common", icon: "👖", 
            stats: { def: 2, thanphap: 2 }
        },
        "legs_straw_sandals": { 
            id: "legs_straw_sandals", name: "Dép Rơm", type: "equipment", slot: "legs", rarity: "common", icon: "👞", 
            desc: "Đôi dép bện bằng rơm khô, giúp đi lại nhẹ nhàng hơn.",
            stats: { def: 1, thanphap: 1 }
        },
        "legs_iron_greaves": { 
            id: "legs_iron_greaves", name: "Xà Cạp Sắt", type: "equipment", slot: "legs", rarity: "uncommon", icon: "🦵", 
            stats: { def: 10, thanphap: 5 }
        },
        "legs_leather_boots": { 
            id: "legs_leather_boots", name: "Ủng Da Thú", type: "equipment", slot: "legs", rarity: "uncommon", icon: "👢", 
            desc: "Đôi ủng làm từ da thú dai chắc.",
            stats: { def: 5, thanphap: 3 }
        },
        "legs_spirit_boots": { 
            id: "legs_spirit_boots", name: "Linh Vân Hài", type: "equipment", slot: "legs", rarity: "rare", icon: "👟", 
            stats: { def: 30, thanphap: 20 }
        },
        "legs_dragon_greaves": { 
            id: "legs_dragon_greaves", name: "Long Lân Khố", type: "equipment", slot: "legs", rarity: "epic", icon: "🐉", 
            stats: { def: 100, thanphap: 60 }
        },
        "legs_heavenly_steps": { 
            id: "legs_heavenly_steps", name: "Thiên Đạo Bộ", type: "equipment", slot: "legs", rarity: "legendary", icon: "👣", 
            stats: { def: 300, thanphap: 200 }
        },
        "legs_void_striders": { 
            id: "legs_void_striders", name: "Hư Không Bộ", type: "equipment", slot: "legs", rarity: "mythic", icon: "👟", 
            desc: "Bước chân xuyên qua hư không, tốc độ cực hạn.",
            stats: { def: 800, thanphap: 1000 }
        },

        // --- TRANG BỊ: NHẪN ---
        "ring_copper": { 
            id: "ring_copper", name: "Nhẫn Đồng", type: "equipment", slot: "ring", rarity: "common", icon: "💍", 
            stats: { mp: 10, luk: 1 }
        },
        "ring_jade": { 
            id: "ring_jade", name: "Nhẫn Ngọc", type: "equipment", slot: "ring", rarity: "uncommon", icon: "💎", 
            stats: { mp: 50, luk: 5 }
        },
        "ring_gold": { 
            id: "ring_gold", name: "Nhẫn Vàng", type: "equipment", slot: "ring", rarity: "rare", icon: "🪙", 
            stats: { mp: 150, luk: 15 }
        },
        "ring_dragon_eye": { 
            id: "ring_dragon_eye", name: "Long Nhãn Giới", type: "equipment", slot: "ring", rarity: "epic", icon: "👁️", 
            stats: { mp: 500, luk: 40, atk: 50 }
        },
        "ring_silver_band": { 
            id: "ring_silver_band", name: "Nhẫn Bạc", type: "equipment", slot: "ring", rarity: "uncommon", icon: "💍", 
            desc: "Nhẫn bạc sáng bóng, tăng linh lực.",
            stats: { mp: 30, luk: 3 }
        },
        "ring_phoenix_ring": { 
            id: "ring_phoenix_ring", name: "Phượng Hoàng Giới", type: "equipment", slot: "ring", rarity: "epic", icon: "🔥", 
            desc: "Nhẫn mang hình phượng hoàng lửa.",
            stats: { mp: 400, luk: 30, atk: 40 }
        },
        "ring_celestial_band": { 
            id: "ring_celestial_band", name: "Thiên Đạo Giới", type: "equipment", slot: "ring", rarity: "legendary", icon: "💍", 
            stats: { mp: 2000, luk: 100, atk: 200 }
        },
        "ring_eternity": { 
            id: "ring_eternity", name: "Vĩnh Hằng Giới", type: "equipment", slot: "ring", rarity: "mythic", icon: "♾️", 
            desc: "Nhẫn mang sức mạnh vĩnh hằng, thời gian ngưng đọng.",
            stats: { mp: 10000, luk: 500, atk: 1000 }
        },

        // --- TRANG BỊ: PHỤ KIỆN ---
        "acc_amulet": { 
            id: "acc_amulet", name: "Bùa Hộ Thân", type: "equipment", slot: "accessory", rarity: "uncommon", icon: "📿", 
            stats: { def: 5, luk: 3 }
        },
        "acc_hemp_bracelet": { 
            id: "acc_hemp_bracelet", name: "Vòng Tay Gai", type: "equipment", slot: "accessory", rarity: "common", icon: "📿", 
            desc: "Vòng tay bện từ sợi gai khô.",
            stats: { def: 1, luk: 1 }
        },
        "acc_jade_bracelet": { 
            id: "acc_jade_bracelet", name: "Vòng Ngọc", type: "equipment", slot: "accessory", rarity: "rare", icon: "📿", 
            desc: "Vòng tay bằng ngọc bích ôn nhuận.",
            stats: { def: 15, luk: 10, mp: 50 }
        },
        "acc_jade_pendant": { 
            id: "acc_jade_pendant", name: "Ngọc Bội Linh Anh", type: "equipment", slot: "accessory", rarity: "rare", icon: "🎐", 
            stats: { def: 20, luk: 15, mp: 100 }
        },
        "acc_spirit_beads": { 
            id: "acc_spirit_beads", name: "Linh Châu Hộ Thể", type: "equipment", slot: "accessory", rarity: "epic", icon: "🔮", 
            stats: { def: 80, luk: 50, mp: 400 }
        },
        "acc_heavenly_mirror": { 
            id: "acc_heavenly_mirror", name: "Thiên Chiếu Kính", type: "equipment", slot: "accessory", rarity: "legendary", icon: "🪞", 
            stats: { def: 250, luk: 150, mp: 1500 }
        },
        "acc_divine_relic": { 
            id: "acc_divine_relic", name: "Thần Khí Tàn Phiến", type: "equipment", slot: "accessory", rarity: "mythic", icon: "🏺", 
            desc: "Mảnh vỡ của thần khí thượng cổ, uy áp kinh người.",
            stats: { def: 700, luk: 400, mp: 6000 }
        },

        // --- TRANG BỊ: LINH HỒN ---
        "soul_orb": { 
            id: "soul_orb", name: "Linh Hồn Châu", type: "equipment", slot: "soul", rarity: "rare", icon: "🔮", 
            stats: { atk: 20, def: 20, mp: 100 }
        },
        "soul_ancient_spirit": { 
            id: "soul_ancient_spirit", name: "Thái Cổ Anh Hồn", type: "equipment", slot: "soul", rarity: "epic", icon: "👻", 
            stats: { atk: 100, def: 100, mp: 500, luk: 20 }
        },
        "soul_divine_essence": { 
            id: "soul_divine_essence", name: "Thần Tính Tinh Hoa", type: "equipment", slot: "soul", rarity: "legendary", icon: "✨", 
            stats: { atk: 400, def: 400, mp: 2000, luk: 80 }
        },
        "soul_cosmic_core": { 
            id: "soul_cosmic_core", name: "Vũ Trụ Chi Tâm", type: "equipment", slot: "soul", rarity: "mythic", icon: "🪐", 
            desc: "Trái tim của vũ trụ, nguồn gốc của mọi sức mạnh.",
            stats: { atk: 2000, def: 2000, mp: 10000, luk: 300 }
        },

        // --- BÍ TỊCH ---
        "book_tram_thien": { 
            id: "book_tram_thien", name: "Bí Tịch: Trảm Thiên", type: "skill_book", rarity: "common", icon: "📜", 
            desc: "[Phàm Cấp] Ghi chép thần thông Trảm Thiên, gây sát thương cực lớn.",
            skillId: "skill_tram_thien", value: 100
        },
        "book_ho_the": { 
            id: "book_ho_the", name: "Bí Tịch: Kim Cang Hộ Thể", type: "skill_book", rarity: "common", icon: "📜", 
            desc: "[Phàm Cấp] Tâm pháp bị động tăng mạnh phòng ngự.",
            skillId: "skill_kim_cang", value: 100
        },
        "book_void_slash": { 
            id: "book_void_slash", name: "Bí Tịch: Hư Không Trảm", type: "skill_book", rarity: "mythic", icon: "📜", 
            desc: "Thần thông tối thượng, chém đứt vạn vật. (Yêu cầu: Nguyên Anh)",
            skillId: "skill_void_slash", value: 10000, minRank: 17
        },
        "book_celestial_shield": { 
            id: "book_celestial_shield", name: "Bí Tịch: Thiên Tiên Thuẫn", type: "skill_book", rarity: "epic", icon: "📜", 
            desc: "Tạo ra lá chắn tiên khí bảo vệ bản thân. (Yêu cầu: Kết Đan)",
            skillId: "skill_celestial_shield", value: 5000, minRank: 14
        },
        // --- BÍ TỊCH MÔN PHÁI (KHÔNG THỂ BÁN) ---
        "book_wudang_ultimate": { id: "book_wudang_ultimate", name: "Bí Tịch: Thái Cực Kiếm", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch môn phái Võ Đang.", skillId: "skill_wudang_ultimate", isSectBound: true },
        "book_wudang_passive_2": { id: "book_wudang_passive_2", name: "Bí Tịch: Lưỡng Nghi Công", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch môn phái Võ Đang.", skillId: "skill_wudang_passive_2", isSectBound: true },
        "book_wudang_active_2": { id: "book_wudang_active_2", name: "Bí Tịch: Vạn Kiếm Quy Tông", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch môn phái Võ Đang.", skillId: "skill_wudang_active_2", isSectBound: true },
        
        "book_emei_basic": { id: "book_emei_basic", name: "Bí Tịch: Nga Mi Cửu Dương Công", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch môn phái Nga Mi.", skillId: "skill_emei_basic", isSectBound: true },
        "book_emei_ultimate": { id: "book_emei_ultimate", name: "Bí Tịch: Diệt Tuyệt Kiếm Pháp", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch môn phái Nga Mi.", skillId: "skill_emei_ultimate", isSectBound: true },
        "book_emei_passive_2": { id: "book_emei_passive_2", name: "Bí Tịch: Thanh Tâm Chú", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch môn phái Nga Mi.", skillId: "skill_emei_passive_2", isSectBound: true },
        "book_emei_active_2": { id: "book_emei_active_2", name: "Bí Tịch: Phật Quang Phổ Chiếu", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch môn phái Nga Mi.", skillId: "skill_emei_active_2", isSectBound: true },

        "book_beggar_basic": { id: "book_beggar_basic", name: "Bí Tịch: Tiêu Dao Du", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Cái Bang.", skillId: "skill_beggar_basic", isSectBound: true },
        "book_beggar_ultimate": { id: "book_beggar_ultimate", name: "Bí Tịch: Hàng Long Thập Bát Chưởng", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Cái Bang.", skillId: "skill_beggar_ultimate", isSectBound: true },
        "book_beggar_passive_2": { id: "book_beggar_passive_2", name: "Bí Tịch: Đả Cẩu Bổng Pháp", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Cái Bang.", skillId: "skill_beggar_passive_2", isSectBound: true },
        "book_beggar_active_2": { id: "book_beggar_active_2", name: "Bí Tịch: Thiên Hạ Vô Cẩu", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Cái Bang.", skillId: "skill_beggar_active_2", isSectBound: true },

        "book_tang_basic": { id: "book_tang_basic", name: "Bí Tịch: Đường Môn Tâm Pháp", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Đường Môn.", skillId: "skill_tang_basic", isSectBound: true },
        "book_tang_ultimate": { id: "book_tang_ultimate", name: "Bí Tịch: Bạo Vũ Lê Hoa Châm", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Đường Môn.", skillId: "skill_tang_ultimate", isSectBound: true },
        "book_tang_passive_2": { id: "book_tang_passive_2", name: "Bí Tịch: Độc Kinh", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Đường Môn.", skillId: "skill_tang_passive_2", isSectBound: true },
        "book_tang_active_2": { id: "book_tang_active_2", name: "Bí Tịch: Khổng Tước Lệnh", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Đường Môn.", skillId: "skill_tang_active_2", isSectBound: true },

        "book_ming_basic": { id: "book_ming_basic", name: "Bí Tịch: Cửu Dương Thần Công", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Minh Giáo.", skillId: "skill_ming_basic", isSectBound: true },
        "book_ming_ultimate": { id: "book_ming_ultimate", name: "Bí Tịch: Càn Khôn Đại Na Di", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Minh Giáo.", skillId: "skill_ming_ultimate", isSectBound: true },
        "book_ming_passive_2": { id: "book_ming_passive_2", name: "Bí Tịch: Thánh Hỏa Lệnh", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Minh Giáo.", skillId: "skill_ming_passive_2", isSectBound: true },
        "book_ming_active_2": { id: "book_ming_active_2", name: "Bí Tịch: Minh Hỏa Phần Thiên", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Minh Giáo.", skillId: "skill_ming_active_2", isSectBound: true },

        "book_kunlun_basic": { id: "book_kunlun_basic", name: "Bí Tịch: Côn Lôn Tiên Pháp", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Côn Lôn.", skillId: "skill_kunlun_basic", isSectBound: true },
        "book_kunlun_ultimate": { id: "book_kunlun_ultimate", name: "Bí Tịch: Thái Thượng Kiếm Khí", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Côn Lôn.", skillId: "skill_kunlun_ultimate", isSectBound: true },
        "book_kunlun_passive_2": { id: "book_kunlun_passive_2", name: "Bí Tịch: Hư Không Quyết", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Côn Lôn.", skillId: "skill_kunlun_passive_2", isSectBound: true },
        "book_kunlun_active_2": { id: "book_kunlun_active_2", name: "Bí Tịch: Hỗn Độn Nhất Kích", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Côn Lôn.", skillId: "skill_kunlun_active_2", isSectBound: true },

        "book_aura_shield": { id: "book_aura_shield", name: "Bí Tịch: Hộ Thể Kim Quang", type: "skill_book", rarity: "legendary", icon: "📜", desc: "Bí tịch hào quang hộ thể.", skillId: "skill_aura_shield", isSectBound: true },
        "book_aura_evil_reflect": { id: "book_aura_evil_reflect", name: "Bí Tịch: Ma Quang Phản Chấn", type: "skill_book", rarity: "legendary", icon: "📜", desc: "Bí tịch hào quang ma đạo.", skillId: "skill_aura_evil_reflect", isSectBound: true },
        "book_aura_vile_poison": { id: "book_aura_vile_poison", name: "Bí Tịch: Vạn Độc Hào Quang", type: "skill_book", rarity: "legendary", icon: "📜", desc: "Bí tịch hào quang vạn độc.", skillId: "skill_aura_vile_poison", isSectBound: true },
        "book_aura_power": { id: "book_aura_power", name: "Bí Tịch: Tiên Nhân Hào Quang", type: "skill_book", rarity: "legendary", icon: "📜", desc: "Bí tịch hào quang tiên nhân.", skillId: "skill_aura_power", isSectBound: true },
        "book_aura_shield_low": { id: "book_aura_shield_low", name: "Bí Tịch: Hộ Thể Hào Quang", type: "skill_book", rarity: "uncommon", icon: "📜", desc: "Bí tịch hào quang hộ thể cấp thấp. (Yêu cầu: Luyện Khí)", skillId: "skill_aura_shield_low", minRank: 2 },
        "book_aura_power_low": { id: "book_aura_power_low", name: "Bí Tịch: Linh Lực Hào Quang", type: "skill_book", rarity: "uncommon", icon: "📜", desc: "Bí tịch hào quang linh lực cấp thấp. (Yêu cầu: Luyện Khí)", skillId: "skill_aura_power_low", minRank: 2 },
        "book_aura_speed_low": { id: "book_aura_speed_low", name: "Bí Tịch: Tốc Biến Hào Quang", type: "skill_book", rarity: "uncommon", icon: "📜", desc: "Bí tịch hào quang tốc độ cấp thấp. (Yêu cầu: Luyện Khí)", skillId: "skill_aura_speed_low", minRank: 2 },
        "book_virtual_armor_low": { id: "book_virtual_armor_low", name: "Bí Tịch: Kim Cang Hộ Thể", type: "skill_book", rarity: "uncommon", icon: "📜", desc: "Bí tịch linh khí hộ thể cấp thấp. (Yêu cầu: Luyện Khí)", skillId: "skill_virtual_armor_low", minRank: 2 },
        "book_aura_celestial_shield": { id: "book_aura_celestial_shield", name: "Bí Tịch: Cửu Thiên Hộ Thể", type: "skill_book", rarity: "legendary", icon: "📜", desc: "Bí tịch tông môn Thiên Đạo.", skillId: "skill_aura_celestial_shield", isSectBound: true },
        "book_aura_celestial_power": { id: "book_aura_celestial_power", name: "Bí Tịch: Cửu Thiên Chiến Ý", type: "skill_book", rarity: "legendary", icon: "📜", desc: "Bí tịch tông môn Thiên Đạo.", skillId: "skill_aura_celestial_power", isSectBound: true },
        "book_fire_burst": { id: "book_fire_burst", name: "Bí Tịch: Hỏa Diễm Toàn", type: "skill_book", rarity: "common", icon: "📜", desc: "[Phàm Cấp] Ghi chép thần thông Hỏa Diễm Toàn.", skillId: "skill_fire_burst", value: 150 },
        "book_fire_spirit": { id: "book_fire_spirit", name: "Bí Tịch: Linh Hỏa Chưởng", type: "skill_book", rarity: "rare", icon: "📜", desc: "[Linh Cấp] Ghi chép thần thông Linh Hỏa Chưởng.", skillId: "skill_fire_spirit", value: 800 },
        "book_fire_earth": { id: "book_fire_earth", name: "Bí Tịch: Địa Hỏa Phần Thiên", type: "skill_book", rarity: "epic", icon: "📜", desc: "[Địa Cấp] Ghi chép thần thông Địa Hỏa Phần Thiên.", skillId: "skill_fire_earth", value: 3000 },
        "book_thien_dao_basic": { id: "book_thien_dao_basic", name: "Bí Tịch: Thiên Đạo Tâm Kinh", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Thiên Đạo Tông.", skillId: "skill_thien_dao_basic", isSectBound: true },
        "book_thien_dao_ultimate": { id: "book_thien_dao_ultimate", name: "Bí Tịch: Thiên Đạo Nhất Kiếm", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Thiên Đạo Tông.", skillId: "skill_thien_dao_ultimate", isSectBound: true },
        "book_thien_dao_passive_2": { id: "book_thien_dao_passive_2", name: "Bí Tịch: Vạn Pháp Quy Tông", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Thiên Đạo Tông.", skillId: "skill_thien_dao_passive_2", isSectBound: true },
        "book_thien_dao_active_2": { id: "book_thien_dao_active_2", name: "Bí Tịch: Thiên Phạt", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Thiên Đạo Tông.", skillId: "skill_thien_dao_active_2", isSectBound: true },

        "book_penglai_basic": { id: "book_penglai_basic", name: "Bí Tịch: Bồng Lai Trường Sinh Thuật", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Bồng Lai.", skillId: "skill_penglai_basic", isSectBound: true },
        "book_penglai_ultimate": { id: "book_penglai_ultimate", name: "Bí Tịch: Vạn Kiếm Quy Tông", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Bồng Lai.", skillId: "skill_penglai_ultimate", isSectBound: true },
        "book_penglai_passive_2": { id: "book_penglai_passive_2", name: "Bí Tịch: Tiên Cốt", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Bồng Lai.", skillId: "skill_penglai_passive_2", isSectBound: true },
        "book_penglai_active_2": { id: "book_penglai_active_2", name: "Bí Tịch: Bồng Lai Tiên Chưởng", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Bồng Lai.", skillId: "skill_penglai_active_2", isSectBound: true },

        "book_magiao_basic": { id: "book_magiao_basic", name: "Bí Tịch: Quỳ Hoa Nội Công", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Nhật Nguyệt Thần Giáo.", skillId: "skill_magiao_basic", isSectBound: true },
        "book_magiao_ultimate": { id: "book_magiao_ultimate", name: "Bí Tịch: Quỳ Hoa Bảo Điển", type: "skill_book", rarity: "rare", icon: "📜", desc: "Bí tịch Nhật Nguyệt Thần Giáo.", skillId: "skill_magiao_ultimate", isSectBound: true },
        "book_magiao_passive_2": { id: "book_magiao_passive_2", name: "Bí Tịch: Hấp Tinh Đại Pháp", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Nhật Nguyệt Thần Giáo.", skillId: "skill_magiao_passive_2", isSectBound: true },
        "book_magiao_active_2": { id: "book_magiao_active_2", name: "Bí Tịch: Nhật Nguyệt Thần Chưởng", type: "skill_book", rarity: "epic", icon: "📜", desc: "Bí tịch Nhật Nguyệt Thần Giáo.", skillId: "skill_magiao_active_2", isSectBound: true },
        "item_forgotten_skill": { 
            id: "item_forgotten_skill", name: "Lãng Quên Đan", type: "pill", rarity: "rare", icon: "🧪", 
            desc: "Đan dược thần bí giúp lãng quên một kỹ năng bất kỳ.",
            effect: (proxy) => {
                if (proxy.skills.length === 0) return "Đạo hữu chưa học kỹ năng nào!";
                
                // Open a sub-modal to pick which skill to forget
                let content = `<div style="display: flex; flex-direction: column; gap: 8px;">`;
                proxy.skills.forEach(sid => {
                    const s = GameData.skills[sid];
                    if (!s) return;
                    content += `
                        <div onclick="Game.forgetSkill('${sid}'); UI.closeModal();" 
                             style="padding: 10px; background: #222; border: 1px solid #444; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.2rem;">${s.icon || '📜'}</span>
                            <div style="flex: 1;">
                                <b style="color: ${s.color || '#fff'}">${s.name}</b>
                                <div style="font-size: 0.7rem; color: #888;">${s.type === 'active' ? 'Chủ động' : 'Bị động'}</div>
                            </div>
                            <span style="color: #ff4444; font-size: 0.7rem;">[QUÊN]</span>
                        </div>`;
                });
                content += `</div>`;
                
                setTimeout(() => {
                    UI.openModal("CHỌN KỸ NĂNG ĐỂ QUÊN", content, false);
                }, 100);

                return "Hãy chọn kỹ năng đạo hữu muốn lãng quên.";
            }
        },
        "item_tay_tuy_dan": { 
            id: "item_tay_tuy_dan", name: "Tẩy Tủy Đan", type: "pill", rarity: "epic", icon: "💊", 
            desc: "Đan dược quý hiếm dùng để tẩy lại căn cốt. Có tỷ lệ nhận được từ Phàm Cốt đến Chí Tôn Cốt.",
            stackLimit: 99
        },
        "item_tay_tuy_dan_cao_cap": { 
            id: "item_tay_tuy_dan_cao_cap", name: "Tẩy Tủy Đan Cao Cấp", type: "pill", rarity: "mythic", icon: "💊", 
            desc: "Đan dược cực kỳ quý hiếm, chứa đựng tinh hoa trời đất. Khi sử dụng sẽ ngẫu nhiên nhận được căn cốt từ Địa Cốt trở lên (Địa Cốt 50%, Thiên Cốt 30%, Tiên Cốt 15%, Chí Tôn Cốt 5%).",
            stackLimit: 99
        },
        "item_tay_tuy_dan_pack_5": { 
            id: "item_tay_tuy_dan_pack_5", name: "Gói 5 Viên Tẩy Tủy Đan", type: "pill", rarity: "epic", icon: "💊", 
            desc: "Gói chứa 5 viên tẩy tủy đan. Có vẻ như người thần bí đang muốn thử thách lòng tham của ngươi...",
            stackLimit: 1,
            isSectBound: true
        },
        "item_supreme_spirit_stone": {
            id: "item_supreme_spirit_stone", name: "Cực Phẩm Linh Thạch", type: "currency", rarity: "mythic", icon: "💎",
            desc: "Viên linh thạch chứa đựng linh khí tinh thuần nhất của trời đất. Chỉ có thể tìm thấy ở những vùng đất thần thánh nhất.",
            stackLimit: 999999
        },
        "item_god_sword_chaos": {
            id: "item_god_sword_chaos", name: "Hỗn Độn Thần Kiếm", type: "equipment", slot: "weapon", rarity: "mythic", icon: "🗡️",
            desc: "Thanh kiếm khai thiên lập địa, chém đứt cả không gian và thời gian.",
            stats: { atk: 99999, thanphap: 5000, luk: 1000 },
            price: 999999,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_armor_heaven": {
            id: "item_god_armor_heaven", name: "Thiên Đế Thần Giáp", type: "equipment", slot: "body", rarity: "mythic", icon: "🛡️",
            desc: "Bộ giáp của Thiên Đế, vạn pháp bất xâm, vạn độc bất hủ.",
            stats: { def: 99999, hpMax: 1000000, hpMult: 5.0 },
            price: 999999,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_ring_void": {
            id: "item_god_ring_void", name: "Hư Không Thần Nhẫn", type: "equipment", slot: "ring", rarity: "mythic", icon: "💍",
            desc: "Chiếc nhẫn chứa đựng cả một bầu trời hư không, tăng cường linh lực vô tận.",
            stats: { mpMax: 500000, mpMult: 3.0, thanphap: 2000 },
            price: 999999,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_soul_eternal": {
            id: "item_god_soul_eternal", name: "Vĩnh Hằng Thần Hồn", type: "equipment", slot: "soul", rarity: "mythic", icon: "👻",
            desc: "Mảnh vỡ linh hồn của một vị thần cổ đại, ban cho sự bất tử và sức mạnh tuyệt đối.",
            stats: { atk: 50000, def: 50000, hpMax: 500000, mpMax: 500000, luk: 5000 },
            price: 999999,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_pill_immortal": {
            id: "item_god_pill_immortal", name: "Bất Tử Thần Đan", type: "pill", rarity: "mythic", icon: "💊",
            desc: "Viên đan dược chứa đựng quy luật của sự sống, giúp người dùng thoát khỏi luân hồi, đạt đến cảnh giới bất tử.",
            effect: (proxy) => {
                proxy.hpMax += 1000000;
                proxy.mpMax += 1000000;
                proxy.atk += 10000;
                proxy.def += 10000;
                proxy.hp = proxy.hpMax;
                proxy.mp = proxy.mpMax;
                return "✨ Đã sử dụng Bất Tử Thần Đan! Thân thể đạo hữu đã đạt đến mức độ bất hoại!";
            },
            price: 500000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_boots_wind": {
            id: "item_god_boots_wind", name: "Phong Thần Khinh Bộ", type: "equipment", slot: "boots", rarity: "mythic", icon: "👟",
            desc: "Đôi hài được dệt từ gió của chín tầng trời, giúp người mang di chuyển nhanh như ý nghĩ.",
            stats: { thanphap: 10000, luk: 500 },
            price: 700000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_necklace_fate": {
            id: "item_god_necklace_fate", name: "Thiên Mệnh Thần Liên", type: "equipment", slot: "necklace", rarity: "mythic", icon: "📿",
            desc: "Sợi dây chuyền nắm giữ vận mệnh của chúng sinh, ban cho người sở hữu sự may mắn tuyệt đối.",
            stats: { luk: 9999, hpMax: 100000, mpMax: 100000 },
            price: 800000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_artifact_chaos_bell": {
            id: "item_god_artifact_chaos_bell", name: "Hỗn Độn Chung", type: "equipment", slot: "artifact", rarity: "mythic", icon: "🔔",
            desc: "Chiếc chuông cổ xưa từ thời khai thiên lập địa, tiếng chuông vang lên có thể làm rung chuyển cả tam giới.",
            stats: { atk: 100000, def: 100000, hpMax: 2000000 },
            price: 1500000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_helmet_crown": {
            id: "item_god_helmet_crown", name: "Thiên Đế Thần Miện", type: "equipment", slot: "head", rarity: "mythic", icon: "👑",
            desc: "Vương miện của Thiên Đế, tỏa ra uy áp khiến vạn vật phải quỳ gối.",
            stats: { def: 50000, mpMax: 500000, luk: 2000 },
            price: 1200000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_belt_dragon": {
            id: "item_god_belt_dragon", name: "Cửu Long Thần Đai", type: "equipment", slot: "belt", rarity: "mythic", icon: "🎗️",
            desc: "Thắt lưng được bện từ gân của chín con rồng thần, tăng cường sức mạnh thể chất vô song.",
            stats: { hpMax: 1000000, def: 30000, staMax: 500 },
            price: 1100000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_cloak_star": {
            id: "item_god_cloak_star", name: "Tinh Thần Thần Bào", type: "equipment", slot: "cloak", rarity: "mythic", icon: "🧥",
            desc: "Áo choàng được dệt từ ánh sáng của hàng vạn ngôi sao, giúp người mặc ẩn mình vào hư không.",
            stats: { thanphap: 5000, def: 40000, luk: 3000 },
            price: 1300000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_bracer_thunder": {
            id: "item_god_bracer_thunder", name: "Lôi Đình Thần Hộ Thủ", type: "equipment", slot: "bracer", rarity: "mythic", icon: "🧤",
            desc: "Hộ thủ chứa đựng sức mạnh của lôi đình vạn trượng, mỗi đòn đánh đều mang theo sấm sét.",
            stats: { atk: 80000, thanphap: 3000 },
            price: 1000000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_manual_creation": {
            id: "item_god_manual_creation", name: "Tạo Hóa Thần Quyết", type: "pill", rarity: "mythic", icon: "📖",
            desc: "Cuốn thần thư ghi chép quy luật tạo hóa, giúp người học thấu hiểu căn nguyên của vạn vật.",
            effect: (proxy) => {
                proxy.atk += 50000;
                proxy.def += 50000;
                proxy.thanphap += 5000;
                proxy.luk += 5000;
                return "✨ Đạo hữu đã thấu hiểu Tạo Hóa Thần Quyết! Sức mạnh tăng tiến vượt bậc!";
            },
            price: 2000000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_shield_void": {
            id: "item_god_shield_void", name: "Hư Không Thần Thuẫn", type: "equipment", slot: "shield", rarity: "mythic", icon: "🛡️",
            desc: "Tấm khiên được đúc từ mảnh vỡ của hư không, có thể phản lại mọi đòn tấn công.",
            stats: { def: 150000, hpMax: 500000 },
            price: 1400000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_bow_starfall": {
            id: "item_god_bow_starfall", name: "Tinh Thần Thần Cung", type: "equipment", slot: "weapon", rarity: "mythic", icon: "🏹",
            desc: "Cây cung bắn ra những mũi tên ánh sáng từ các vì sao, bách phát bách trúng.",
            stats: { atk: 120000, thanphap: 8000, luk: 2000 },
            price: 1600000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_staff_genesis": {
            id: "item_god_staff_genesis", name: "Sáng Thế Thần Trượng", type: "equipment", slot: "weapon", rarity: "mythic", icon: "🪄",
            desc: "Quyền trượng nắm giữ sức mạnh của sự sống và cái chết.",
            stats: { atk: 100000, mpMax: 2000000, mpMult: 5.0 },
            price: 1800000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_pendant_eternity": {
            id: "item_god_pendant_eternity", name: "Vĩnh Hằng Thần Bội", type: "equipment", slot: "pendant", rarity: "mythic", icon: "🧿",
            desc: "Ngọc bội chứa đựng linh khí vĩnh hằng, bảo vệ linh hồn người sở hữu.",
            stats: { def: 60000, mpMax: 1000000, hpMax: 1000000 },
            price: 1500000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_earring_phoenix": {
            id: "item_god_earring_phoenix", name: "Phượng Hoàng Thần Nhẫn", type: "equipment", slot: "earring", rarity: "mythic", icon: "💎",
            desc: "Đôi khuyên tai được rèn từ lửa của Phượng Hoàng, giúp người đeo hồi sinh từ đống tro tàn.",
            stats: { hpMax: 500000, mpMax: 500000, def: 20000, luk: 5000 },
            price: 1300000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_cape_void": {
            id: "item_god_cape_void", name: "Hư Vô Thần Choàng", type: "equipment", slot: "cloak", rarity: "mythic", icon: "🧣",
            desc: "Áo choàng dệt từ bóng tối của hư vô, có thể nuốt chửng mọi đòn tấn công ma pháp.",
            stats: { def: 80000, thanphap: 4000, mpMax: 1000000 },
            price: 1400000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_gauntlet_titan": {
            id: "item_god_gauntlet_titan", name: "Thần Lực Thủ套", type: "equipment", slot: "bracer", rarity: "mythic", icon: "🥊",
            desc: "Găng tay của các vị thần khổng lồ, mang lại sức mạnh phá hủy cả tinh cầu.",
            stats: { atk: 150000, hpMax: 500000 },
            price: 1700000,
            currency: "item_supreme_spirit_stone"
        },
        "item_god_orb_destiny": {
            id: "item_god_orb_destiny", name: "Vận Mệnh Thần Châu", type: "equipment", slot: "artifact", rarity: "mythic", icon: "🔮",
            desc: "Quả cầu tiên tri nắm giữ vận mệnh của cả thế giới.",
            stats: { luk: 10000, atk: 50000, def: 50000 },
            price: 2500000,
            currency: "item_supreme_spirit_stone"
        }
    },

    skills: {
        "skill_basic_active": {
            id: "skill_basic_active", name: "Trảm Kích", type: "active", icon: "⚔️", color: "#fff",
            desc: "[Phàm Cấp] Đòn tấn công cơ bản bằng vũ khí.",
            damageMult: 1.2, rank: "Phàm Cấp"
        },
        "skill_basic_passive": {
            id: "skill_basic_passive", name: "Thanh Tâm Quyết", type: "passive", icon: "🧘", color: "#4caf50",
            buff: { mp: 10, hpMax: 10 },
            desc: "[Phàm Cấp] Tâm pháp cơ bản, tăng nhẹ linh lực và sinh mệnh.",
            rank: "Phàm Cấp"
        },
        "skill_tram_thien": {
            id: "skill_tram_thien", name: "Trảm Thiên", type: "active", icon: "⚔️", color: "#ff4444",
            desc: "[Phàm Cấp] Một kiếm chém ra, uy lực kinh thiên động địa. Gây Phá Giáp trong 4s. Cần tụ lực 1.2s.",
            manaCost: 30, cooldown: 8, damageMult: 1.4, chargeTime: 1200, debuff: "ArmorBreak", duration: 4000, rank: "Phàm Cấp"
        },
        "skill_kim_cang": {
            id: "skill_kim_cang", name: "Kim Cang Hộ Thể", type: "passive", icon: "🧘", color: "#4caf50",
            desc: "[Phàm Cấp] Thân thể cứng như kim cương, bất khả xâm phạm. Tăng mạnh phòng ngự và sinh mệnh.",
            buff: { def: 6, hpMax: 30 }, rank: "Phàm Cấp"
        },
        "skill_void_slash": {
            id: "skill_void_slash", name: "Hư Không Trảm", type: "active", icon: "🌑", color: "#ff4444",
            desc: "[Thần Cấp] Chém đứt không gian, gây sát thương cực lớn, bỏ qua phòng ngự, gây Chảy Máu 3s và tăng Tấn Công bản thân. Cần tụ lực 3s.",
            manaCost: 150, cooldown: 20, damageMult: 13.5, chargeTime: 3000, debuff: "Bleed", duration: 3000, ignoreDef: true,
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, 'AtkBuff', 5000, null, true, caster, source);
                return msg;
            }, rank: "Thần Cấp"
        },
        "skill_celestial_shield": {
            id: "skill_celestial_shield", name: "Thiên Tiên Thuẫn", type: "active", icon: "✨", color: "#ff4444",
            desc: "[Thần Cấp] Tạo lá chắn Vô Địch, miễn nhiễm mọi sát thương trong 3s.",
            manaCost: 80, cooldown: 25, damageMult: 0,
            effect: (proxy, caster, source) => { 
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, 'Invincible', 3000, null, true, caster, source);
                return msg;
            }, rank: "Thần Cấp"
        },
        // --- KỸ NĂNG QUÁI VẬT ---
        "skill_wolf_bite": {
            id: "skill_wolf_bite", name: "Sói Ngoạm", type: "active", icon: "🐺", color: "#ff4444",
            desc: "[Phàm cấp] Cú ngoạm đầy uy lực, gây Chảy Máu trong 5s.",
            damageMult: 1.3, debuff: "Bleed", chance: 1.0, duration: 5000, cooldown: 8, manaCost: 20, rank: "Phàm cấp", isMonsterSkill: true
        },
        "skill_bat_stun": {
            id: "skill_bat_stun", name: "Dơi Kích", type: "active", icon: "🦇", color: "#9c27b0",
            desc: "[Linh cấp] Đòn tấn công bất ngờ từ bóng tối, gây Choáng 2s.",
            damageMult: 1.5, debuff: "Stun", chance: 0.3, duration: 2000, cooldown: 10, manaCost: 25, rank: "Linh cấp", isMonsterSkill: true
        },
        "skill_skeleton_slash": {
            id: "skill_skeleton_slash", name: "Khô Lâu Trảm", type: "active", icon: "⚔️", color: "#9e9e9e",
            desc: "[Linh cấp] Đòn chém lạnh lẽo từ cõi chết, gây Phá Giáp 3s.",
            damageMult: 2.2, debuff: "ArmorBreak", chance: 0.3, duration: 3000, cooldown: 12, manaCost: 30, rank: "Linh cấp", isMonsterSkill: true
        },
        "skill_tiger_pounce": {
            id: "skill_tiger_pounce", name: "Hổ Vồ", type: "active", icon: "🐅", color: "#ff9800",
            desc: "[Địa cấp] Cú vồ dũng mãnh của chúa sơn lâm, gây sát thương lớn và Chảy Máu 5s.",
            damageMult: 3.5, debuff: "Bleed", chance: 0.5, duration: 5000, cooldown: 15, manaCost: 50, rank: "Địa cấp", isMonsterSkill: true
        },
        "skill_eagle_dive": {
            id: "skill_eagle_dive", name: "Ưng Kích", type: "active", icon: "🦅", color: "#2196f3",
            desc: "[Địa cấp] Lao xuống từ trên cao với tốc độ cực nhanh, gây Choáng 3s.",
            damageMult: 3.0, debuff: "Stun", chance: 0.4, duration: 3000, cooldown: 14, manaCost: 60, rank: "Địa cấp", isMonsterSkill: true
        },
        "skill_slime_pollen": {
            id: "skill_slime_pollen", name: "Linh Phấn Phá Giáp", type: "active", icon: "✨", color: "#ff5722",
            desc: "[Phàm cấp] Tung ra linh phấn huyền ảo, khiến đối thủ bị Phá Giáp Nhẹ (giảm 20% thủ) trong 5s.",
            damageMult: 0, debuff: "MinorArmorBreak", chance: 1.0, duration: 5000, cooldown: 10, manaCost: 10, rank: "Phàm cấp", isMonsterSkill: true
        },
        "skill_demon_drain": {
            id: "skill_demon_drain", name: "Huyết Ma Chưởng", type: "active", icon: "🩸", color: "#f44336",
            desc: "[Thiên cấp] Chưởng pháp khát máu, gây sát thương và Hút Máu 50% sát thương gây ra.",
            damageMult: 5.0, type: "active", cooldown: 18, manaCost: 100, effect: { type: "lifesteal", value: 0.5 }, rank: "Thiên cấp", isMonsterSkill: true
        },
        "skill_succubus_charm": {
            id: "skill_succubus_charm", name: "Mị Hoặc", type: "active", icon: "💋", color: "#e91e63",
            desc: "[Thiên cấp] Tiếng cười mê hoặc khiến đối thủ rơi vào trạng thái Hỗn Loạn trong 4s.",
            damageMult: 2.0, debuff: "Confuse", chance: 0.6, duration: 4000, cooldown: 20, manaCost: 120, rank: "Thiên cấp", isMonsterSkill: true
        },
        "skill_angel_judgment": {
            id: "skill_angel_judgment", name: "Thiên Sứ Phán Quyết", type: "active", icon: "⚖️", color: "#ffeb3b",
            desc: "[Thần cấp] Ánh sáng thần thánh phán xét tội lỗi, gây sát thương cực lớn và Câm Lặng 5s.",
            damageMult: 8.0, debuff: "Silence", chance: 0.7, duration: 5000, cooldown: 25, manaCost: 200, rank: "Thần cấp", isMonsterSkill: true
        },
        "skill_god_wrath": {
            id: "skill_god_wrath", name: "Thần Phẫn", type: "active", icon: "⚡", color: "#ff5722",
            desc: "[Cực phẩm cấp] Cơn giận của thần linh, hủy diệt vạn vật, gây sát thương vô hạn và Choáng 5s.",
            damageMult: 15.0, debuff: "Stun", chance: 0.8, duration: 5000, cooldown: 30, manaCost: 500, rank: "Cực phẩm cấp", isMonsterSkill: true
        },
        "skill_boss_roar": {
            id: "skill_boss_roar", name: "Tiếng Gầm Uy Chấn", type: "active", icon: "🦁", color: "#ff4444",
            desc: "[BOSS] Tiếng gầm kinh thiên động địa, gây sát thương lớn lên đối thủ.",
            damageMult: 1.5, cooldown: 10, manaCost: 50, rank: "Boss", isMonsterSkill: true
        },
        // --- KỸ NĂNG MÔN PHÁI ---
        "skill_shaolin_basic": { id: "skill_shaolin_basic", name: "La Hán Công", type: "passive", icon: "🧘", color: "#ffd700", buff: { def: 15, thanphap: -2.5 }, desc: "[Linh Cấp] Nội công cơ bản của Thiếu Lâm, tăng mạnh phòng ngự nhưng giảm thân pháp.", contributionCost: 15, reqReputation: 0, sectId: "sect_shaolin", rank: "Linh Cấp" },
        "skill_shaolin_ultimate": { 
            id: "skill_shaolin_ultimate", name: "Sư Tử Hống", type: "active", icon: "🦁", color: "#ff9800", 
            manaCost: 45, cooldown: 12, damageMult: 1.3, debuff: "Stun", duration: 2000, 
            desc: "[Phàm Cấp] Tiếng gầm chấn động tâm can, gây choáng 2s và nhận Kháng Khống 2s.", 
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, 'CCImmune', 2000, null, true, caster, source);
                return msg;
            },
            contributionCost: 500, reqReputation: 100, sectId: "sect_shaolin", rank: "Phàm Cấp" 
        },
        "skill_shaolin_passive_2": { id: "skill_shaolin_passive_2", name: "Kim Cang Bất Hoại", type: "passive", icon: "🧘", color: "#ffd700", buff: { def: 37.5, thanphap: -7.5, hpMax: 50 }, reflect: 0.25, desc: "[Địa Cấp] Thân thể bất hoại, tăng cực mạnh phòng ngự, sinh mệnh và phản 25% sát thương nhận vào. (Yêu cầu: Trúc Cơ)", contributionCost: 1500, reqReputation: 500, sectId: "sect_shaolin", rank: "Địa Cấp", minRank: 11 },
        "skill_shaolin_active_2": { id: "skill_shaolin_active_2", name: "Như Lai Thần Chưởng", type: "active", icon: "✋", color: "#ffd700", manaCost: 150, cooldown: 25, damageMult: 5.0, debuff: "ArmorBreak", duration: 6000, desc: "[Địa Cấp] Chưởng pháp chí cao vô thượng, gây sát thương lớn và Phá Giáp đối thủ 6s. (Yêu cầu: Trúc Cơ)", contributionCost: 2500, reqReputation: 1000, sectId: "sect_shaolin", rank: "Địa Cấp", minRank: 11 },
        
        "skill_wudang_basic": { id: "skill_wudang_basic", name: "Thái Cực Tâm Pháp", type: "passive", icon: "☯️", color: "#2196f3", buff: { mp: 62.5, hpMax: -12.5 }, desc: "[Linh Cấp] Tâm pháp lấy nhu thắng cương, tăng giới hạn linh lực nhưng giảm sinh mệnh.", contributionCost: 15, reqReputation: 0, sectId: "sect_wudang", rank: "Linh Cấp" },
        "skill_wudang_ultimate": { id: "skill_wudang_ultimate", name: "Thái Cực Kiếm", type: "active", icon: "⚔️", color: "#03a9f4", manaCost: 45, cooldown: 10, damageMult: 1.5, desc: "[Phàm Cấp] Kiếm pháp huyền diệu, mượn lực đả lực.", contributionCost: 500, reqReputation: 100, sectId: "sect_wudang", rank: "Phàm Cấp" },
        "skill_wudang_passive_2": { id: "skill_wudang_passive_2", name: "Lưỡng Nghi Công", type: "passive", icon: "☯️", color: "#2196f3", buff: { mp: 150, hpMax: -37.5, def: 12.5 }, desc: "[Địa Cấp] Cân bằng âm dương, tăng mạnh linh lực và phòng ngự nhưng giảm sinh mệnh. (Yêu cầu: Trúc Cơ)", contributionCost: 1500, reqReputation: 500, sectId: "sect_wudang", rank: "Địa Cấp", minRank: 11 },
        "skill_wudang_active_2": { id: "skill_wudang_active_2", name: "Vạn Kiếm Quy Tông", type: "active", icon: "🗡️", color: "#2196f3", manaCost: 180, cooldown: 25, damageMult: 5.0, debuff: "Silence", duration: 3000, desc: "[Địa Cấp] Ngự kiếm phi hành, vạn kiếm tề phát. Gây Câm Lặng 3s đối thủ. (Yêu cầu: Trúc Cơ)", contributionCost: 3000, reqReputation: 1200, sectId: "sect_wudang", rank: "Địa Cấp", minRank: 11 },
        
        "skill_emei_basic": { id: "skill_emei_basic", name: "Nga Mi Cửu Dương Công", type: "passive", icon: "🌸", color: "#e91e63", buff: { hpMax: 100, atk: -3.75 }, desc: "[Linh Cấp] Nội công thuần dương, tăng mạnh sinh mệnh nhưng giảm tấn công.", contributionCost: 15, reqReputation: 0, sectId: "sect_emei", rank: "Linh Cấp" },
        "skill_emei_ultimate": { id: "skill_emei_ultimate", name: "Diệt Tuyệt Kiếm Pháp", type: "active", icon: "🗡️", color: "#f06292", manaCost: 45, cooldown: 10, damageMult: 1.3, debuff: "Bleed", chance: 0.5, duration: 3000, desc: "[Phàm Cấp] Kiếm pháp tuyệt tình, gây sát thương cao và có 50% tỷ lệ gây Chảy Máu 3s.", contributionCost: 500, reqReputation: 100, sectId: "sect_emei", rank: "Phàm Cấp" },
        "skill_emei_passive_2": { id: "skill_emei_passive_2", name: "Thanh Tâm Chú", type: "passive", icon: "🧘", color: "#e91e63", buff: { hpMax: 250, atk: -10, def: 10 }, desc: "[Địa Cấp] Tâm thanh tịnh, tăng cực mạnh sinh mệnh và phòng ngự nhưng giảm tấn công. (Yêu cầu: Trúc Cơ)", contributionCost: 1500, reqReputation: 500, sectId: "sect_emei", rank: "Địa Cấp", minRank: 11 },
        "skill_emei_active_2": { 
            id: "skill_emei_active_2", name: "Phật Quang Phổ Chiếu", type: "active", icon: "✨", color: "#e91e63", 
            manaCost: 80, cooldown: 15, damageMult: 5.0, lifesteal: 0.3, 
            desc: "[Địa Cấp] Ánh sáng phật pháp, vừa gây sát thương vừa hồi phục, nhận Kháng Khống 2s. (Yêu cầu: Trúc Cơ)", 
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, 'CCImmune', 2000, null, true, caster, source);
                return (msg ? msg + " " : "") + "Phật quang bao phủ, vạn tà bất xâm!";
            },
            contributionCost: 2000, reqReputation: 800, sectId: "sect_emei", rank: "Địa Cấp", minRank: 11 
        },
        
        "skill_beggar_basic": { id: "skill_beggar_basic", name: "Tiêu Dao Du", type: "passive", icon: "🚶", color: "#795548", buff: { thanphap: 10, def: -2.5 }, desc: "[Linh Cấp] Thân pháp phiêu dật, tăng thân pháp tấn công nhưng giảm phòng ngự.", contributionCost: 15, reqReputation: 0, sectId: "sect_beggar", rank: "Linh Cấp" },
        "skill_beggar_ultimate": { id: "skill_beggar_ultimate", name: "Hàng Long Thập Bát Chưởng", type: "active", icon: "🐉", color: "#ff5722", manaCost: 65, cooldown: 15, damageMult: 1.5, desc: "[Phàm Cấp] Chưởng pháp chí dương chí cương, uy lực vô song.", contributionCost: 500, reqReputation: 100, sectId: "sect_beggar", rank: "Phàm Cấp" },
        "skill_beggar_passive_2": { id: "skill_beggar_passive_2", name: "Đả Cẩu Bổng Pháp", type: "passive", icon: "🍢", color: "#795548", buff: { thanphap: 25, def: -7.5, luk: 5 }, desc: "[Địa Cấp] Bổng pháp tinh diệu, tăng cực mạnh thân pháp và may mắn nhưng giảm phòng ngự. (Yêu cầu: Trúc Cơ)", contributionCost: 1500, reqReputation: 500, sectId: "sect_beggar", rank: "Địa Cấp", minRank: 11 },
        "skill_beggar_active_2": { id: "skill_beggar_active_2", name: "Thiên Hạ Vô Cẩu", type: "active", icon: "🍢", color: "#795548", manaCost: 150, cooldown: 25, damageMult: 5.5, debuff: "Weakness", duration: 3000, desc: "[Địa Cấp] Tuyệt kỹ trấn bang, quét sạch kẻ thù và gây Yếu Ớt 3s. (Yêu cầu: Trúc Cơ)", contributionCost: 3000, reqReputation: 1500, sectId: "sect_beggar", rank: "Địa Cấp", minRank: 11 },
        
        "skill_tang_basic": { id: "skill_tang_basic", name: "Đường Môn Tâm Pháp", type: "passive", icon: "🎯", color: "#9c27b0", buff: { luk: 7.5, hpMax: -7.5 }, desc: "[Linh Cấp] Tăng khả năng chính xác và may mắn nhưng giảm sinh mệnh.", contributionCost: 15, reqReputation: 0, sectId: "sect_tang", rank: "Linh Cấp" },
        "skill_tang_ultimate": { id: "skill_tang_ultimate", name: "Bạo Vũ Lê Hoa Châm", type: "active", icon: "🏹", color: "#673ab7", manaCost: 45, cooldown: 8, damageMult: 1.2, debuff: "Poison", chance: 0.6, duration: 3000, desc: "[Phàm Cấp] Ám khí liên hoàn, có 60% tỉ lệ khiến đối thủ bị Trúng Độc trong 3s.", rank: "Phàm Cấp" },
        "skill_tang_passive_2": { id: "skill_tang_passive_2", name: "Độc Kinh", type: "passive", icon: "🧪", color: "#9c27b0", buff: { luk: 20, hpMax: -25, atk: 7.5 }, desc: "[Địa Cấp] Tinh thông độc dược, tăng mạnh may mắn và tấn công nhưng giảm sinh mệnh. (Yêu cầu: Trúc Cơ)", contributionCost: 1500, reqReputation: 500, sectId: "sect_tang", rank: "Địa Cấp", minRank: 11 },
        "skill_tang_active_2": { id: "skill_tang_active_2", name: "Khổng Tước Lệnh", type: "active", icon: "🦚", color: "#9c27b0", manaCost: 150, cooldown: 25, damageMult: 5.8, debuff: "Poison", chance: 0.7, duration: 3000, desc: "[Địa Cấp] Ám khí chí tôn, gây sát thương lớn và có 70% tỉ lệ tẩm độc 3s. (Yêu cầu: Trúc Cơ)", contributionCost: 4000, reqReputation: 2000, sectId: "sect_tang", rank: "Địa Cấp", minRank: 11 },
        
        "skill_ming_basic": { id: "skill_ming_basic", name: "Cửu Dương Thần Công", type: "passive", icon: "🔥", color: "#f44336", buff: { atk: 20, def: -5 }, desc: "[Linh Cấp] Nội công chí tôn, tăng mạnh sức tấn công nhưng giảm phòng ngự.", contributionCost: 15, reqReputation: 0, sectId: "sect_ming", rank: "Linh Cấp" },
        "skill_ming_ultimate": { id: "skill_ming_ultimate", name: "Càn Khôn Đại Na Di", type: "active", icon: "🌀", color: "#d32f2f", manaCost: 65, cooldown: 15, damageMult: 1.3, debuff: "Confuse", chance: 0.5, duration: 2000, desc: "[Phàm Cấp] Chuyển đổi càn khôn, có 50% tỉ lệ khiến đối thủ bị Hỗn Loạn trong 2s.", rank: "Phàm Cấp" },
        "skill_ming_passive_2": { id: "skill_ming_passive_2", name: "Thánh Hỏa Lệnh", type: "passive", icon: "🔥", color: "#f44336", buff: { atk: 50, def: -15, thanphap: 5 }, desc: "[Địa Cấp] Lệnh bài thánh hỏa, tăng cực mạnh tấn công nhưng giảm mạnh phòng ngự. (Yêu cầu: Trúc Cơ)", contributionCost: 2000, reqReputation: 600, sectId: "sect_ming", rank: "Địa Cấp", minRank: 11 },
        "skill_ming_active_2": { id: "skill_ming_active_2", name: "Minh Hỏa Phần Thiên", type: "active", icon: "🔥", color: "#f44336", manaCost: 180, cooldown: 25, damageMult: 6.0, debuff: "Burn", chance: 0.8, duration: 3000, desc: "[Địa Cấp] Ngọn lửa thánh hỏa thiêu rụi tất cả, có 80% tỉ lệ gây Thiêu Đốt 3s. (Yêu cầu: Trúc Cơ)", contributionCost: 5000, reqReputation: 1800, sectId: "sect_ming", rank: "Địa Cấp", minRank: 11 },
        
        "skill_kunlun_basic": { id: "skill_kunlun_basic", name: "Côn Lôn Tiên Pháp", type: "passive", icon: "🏔️", color: "#00bcd4", buff: { atk: 30, def: 30, hpMax: 150, thanphap: -5 }, desc: "[Linh Cấp] Tiên pháp thượng cổ, tăng toàn diện chỉ số nhưng giảm thân pháp.", contributionCost: 15, reqReputation: 0, sectId: "holy_kunlun", rank: "Linh Cấp" },
        "skill_kunlun_ultimate": { 
            id: "skill_kunlun_ultimate", name: "Thái Thượng Kiếm Khí", type: "active", icon: "✨", color: "#b2ebf2", 
            manaCost: 160, cooldown: 25, damageMult: 2.4, chargeTime: 2500, debuff: "Silence", duration: 3000, 
            desc: "[Linh Cấp] Kiếm khí vạn trượng, trảm tiên diệt ma. Gây Câm Lặng 3s và nhận Vô Địch 3s sau khi phát chiêu. Tụ lực 2.5s.", 
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, 'Invincible', 3000, null, true, caster, source);
                return (msg ? msg + " " : "") + "Thái Thượng Kiếm Khí xuất thế, hộ thể tiên khí bao quanh!";
            },
            contributionCost: 2000, reqReputation: 1000, sectId: "holy_kunlun", rank: "Linh Cấp" 
        },
        "skill_kunlun_passive_2": { id: "skill_kunlun_passive_2", name: "Hư Không Quyết", type: "passive", icon: "🌌", color: "#00bcd4", buff: { atk: 75, def: 75, mp: 125, thanphap: -12.5 }, dodge: 0.15, desc: "[Địa Cấp] Quyết pháp hư không, tăng cực mạnh tấn công, phòng ngự và linh lực. Có 15% tỷ lệ Né Tránh. (Yêu cầu: Trúc Cơ)", contributionCost: 5000, reqReputation: 2500, sectId: "holy_kunlun", rank: "Địa Cấp", minRank: 11 },
        "skill_kunlun_active_2": { id: "skill_kunlun_active_2", name: "Hỗn Độn Nhất Kích", type: "active", icon: "💥", color: "#00bcd4", manaCost: 250, cooldown: 25, damageMult: 6.0, chargeTime: 5000, desc: "[Địa Cấp] Sức mạnh hỗn độn, nhất kích tất sát. Cần tụ lực 5s cực lâu. (Yêu cầu: Trúc Cơ)", contributionCost: 10000, reqReputation: 5000, sectId: "holy_kunlun", rank: "Địa Cấp", minRank: 11 },
        
        "skill_aura_shield": { 
            id: "skill_aura_shield", name: "[Thiên Cấp] Thiên Địa Hào Quang", type: "active", icon: "✨", color: "#9c27b0", 
            manaCost: 60, cooldown: 25, damageMult: 0, 
            desc: "[Thiên Cấp] Hào quang bao phủ, tăng 25% Phòng Thủ và 15% Tấn Công trong 10 giây. (Yêu cầu: Kết Đan)", 
            effect: (proxy, caster, source) => {
                let msgs = [];
                if (typeof BattleSystem !== 'undefined') {
                    msgs.push(BattleSystem.applyBuff(proxy, 'DefBuff', 10000, null, true, caster, source));
                    msgs.push(BattleSystem.applyBuff(proxy, 'AtkBuff', 10000, null, true, caster, source));
                }
                return msgs.filter(m => m).join(" và "); 
            },
            contributionCost: 2500, reqReputation: 2000, sectId: "holy_kunlun", rank: "Thiên Cấp", minRank: 14 
        },
        "skill_aura_evil_reflect": { 
            id: "skill_aura_evil_reflect", name: "Ma Quang Phấn Chấn", type: "active", icon: "🪞", color: "#9c27b0", 
            manaCost: 120, cooldown: 25, damageMult: 0, 
            desc: "[Thiên Cấp] Tạo ra hào quang ma đạo, phản lại 35% sát thương nhận vào trong 4s. (Yêu cầu: Kết Đan)", 
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, 'EvilReflect', 4000, null, true, caster, source);
                return msg;
            },
            contributionCost: 4000, reqReputation: 4000, sectId: "sect_magiao", rank: "Thiên Cấp", minRank: 14 
        },
        
        "skill_penglai_basic": { id: "skill_penglai_basic", name: "Bồng Lai Trường Sinh Thuật", type: "passive", icon: "🏝️", color: "#009688", buff: { hpMax: 300, mp: 150, atk: -12.5 }, desc: "[Linh Cấp] Thuật trường sinh, tăng cực mạnh sinh mệnh và linh lực nhưng giảm tấn công.", contributionCost: 15, reqReputation: 0, sectId: "holy_penglai", rank: "Linh Cấp" },
        "skill_penglai_ultimate": { id: "skill_penglai_ultimate", name: "Vạn Kiếm Quy Tông", type: "active", icon: "⚔️", color: "#80cbc4", manaCost: 220, cooldown: 25, damageMult: 2.4, desc: "[Linh Cấp] Vạn kiếm tề phát, hủy thiên diệt địa.", contributionCost: 5000, reqReputation: 2000, sectId: "holy_penglai", rank: "Linh Cấp" },
        "skill_penglai_passive_2": { id: "skill_penglai_passive_2", name: "Tiên Cốt", type: "passive", icon: "🦴", color: "#009688", buff: { hpMax: 750, mp: 375, def: 50, atk: -37.5 }, desc: "[Địa Cấp] Cốt cách tiên nhân, tăng siêu mạnh sinh mệnh, linh lực và phòng ngự nhưng giảm mạnh tấn công. (Yêu cầu: Trúc Cơ)", contributionCost: 10000, reqReputation: 4000, sectId: "holy_penglai", rank: "Địa Cấp", minRank: 11 },
        "skill_penglai_active_2": { id: "skill_penglai_active_2", name: "Bồng Lai Tiên Chưởng", type: "active", icon: "✋", color: "#009688", manaCost: 300, cooldown: 25, damageMult: 6.0, desc: "[Địa Cấp] Chưởng pháp tiên gia, uy lực vô biên. (Yêu cầu: Trúc Cơ)", contributionCost: 20000, reqReputation: 8000, sectId: "holy_penglai", rank: "Địa Cấp", minRank: 11 },

        "skill_aura_vile_poison": { 
            id: "skill_aura_vile_poison", name: "Vạn Độc Hào Quang", type: "active", icon: "🧪", color: "#9c27b0", 
            manaCost: 150, cooldown: 25, damageMult: 0, 
            desc: "[Thiên Cấp] Tạo ra hào quang vạn độc, có tỷ lệ gây Độc lên đối thủ khi tấn công trong 5s. (Yêu cầu: Kết Đan)", 
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, 'VilePoison', 5000, null, true, caster, source);
                return msg;
            },
            contributionCost: 5000, reqReputation: 5000, sectId: "sect_vandoc", rank: "Thiên Cấp", minRank: 14 
        },
        "skill_aura_power": { 
            id: "skill_aura_power", name: "[Thiên Cấp] Vạn Cổ Hào Quang", type: "active", icon: "✨", color: "#9c27b0", 
            manaCost: 65, cooldown: 30, damageMult: 0, 
            desc: "[Thiên Cấp] Hào quang vạn cổ, tăng 25% Tấn Công và 20% Thân Pháp trong 10 giây. (Yêu cầu: Kết Đan)", 
            effect: (proxy, caster, source) => {
                let msgs = [];
                if (typeof BattleSystem !== 'undefined') {
                    msgs.push(BattleSystem.applyBuff(proxy, 'AtkBuff', 10000, null, true, caster, source));
                    msgs.push(BattleSystem.applyBuff(proxy, 'BossThanphapAura', 10000, null, true, caster, source));
                }
                return msgs.filter(m => m).join(" và "); 
            },
            contributionCost: 5000, reqReputation: 5000, sectId: "holy_penglai", rank: "Thiên Cấp", minRank: 14 
        },
        "skill_aura_shield_low": {
            id: "skill_aura_shield_low", name: "[Linh Cấp] Hộ Thể Hào Quang", type: "active", icon: "✨", color: "#4caf50",
            manaCost: 15, cooldown: 20, damageMult: 0,
            desc: "[Linh Cấp] Hào quang hộ thể cơ bản, tăng 15% Phòng Thủ trong 8 giây. (Yêu cầu: Luyện Khí)",
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, "DefBuff", 8000, null, true, caster, source);
                return msg;
            }, rank: "Linh Cấp", minRank: 2
        },
        "skill_aura_power_low": {
            id: "skill_aura_power_low", name: "[Linh Cấp] Linh Lực Hào Quang", type: "active", icon: "⚔️", color: "#4caf50",
            manaCost: 15, cooldown: 20, damageMult: 0,
            desc: "[Linh Cấp] Hào quang linh lực cơ bản, tăng 15% Tấn Công trong 8 giây. (Yêu cầu: Luyện Khí)",
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, "AtkBuff", 8000, null, true, caster, source);
                return msg;
            }, rank: "Linh Cấp", minRank: 2
        },
        "skill_aura_speed_low": {
            id: "skill_aura_speed_low", name: "[Linh Cấp] Tốc Biến Hào Quang", type: "active", icon: "⚡", color: "#4caf50",
            manaCost: 15, cooldown: 20, damageMult: 0,
            desc: "[Linh Cấp] Hào quang tốc biến cơ bản, tăng 15% Thân Pháp trong 8 giây. (Yêu cầu: Luyện Khí)",
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') msg = BattleSystem.applyBuff(proxy, "BossThanphapAura", 8000, null, true, caster, source);
                return msg;
            }, rank: "Linh Cấp", minRank: 2
        },
        "skill_virtual_armor_low": {
            id: "skill_virtual_armor_low", name: "[Linh Cấp] Kim Cang Hộ Thể", type: "active", icon: "💠", color: "#4caf50",
            manaCost: 20, cooldown: 30, damageMult: 0,
            desc: "[Linh Cấp] Tạo một lớp linh khí hộ thể hấp thụ sát thương tương đương 20% Linh lực tối đa trong 15 giây. (Yêu cầu: Luyện Khí)",
            effect: (proxy, caster, source) => {
                let msg = "";
                if (typeof BattleSystem !== 'undefined') {
                    const pStats = BattleSystem.getPlayerTotalStats(proxy);
                    const shieldValue = Math.floor(pStats.mpMax * 0.2);
                    msg = BattleSystem.applyBuff(proxy, "ShieldBuff", 15000, shieldValue, true, caster, source);
                }
                return msg;
            }, rank: "Linh Cấp", minRank: 2
        },
        "skill_aura_celestial_shield": {
            id: "skill_aura_celestial_shield", name: "[Thần Cấp] Cửu Thiên Hộ Thể", type: "active", icon: "🔱", color: "#ff4444",
            manaCost: 80, cooldown: 45, damageMult: 0,
            desc: "[Thần Cấp] Tuyệt kỹ tông môn, tăng 40% Phòng Thủ và tạo linh khí hộ thể 30% Linh lực tối đa trong 15 giây. (Yêu cầu: Nguyên Anh)",
            effect: (proxy, caster, source) => {
                let msgs = [];
                if (typeof BattleSystem !== 'undefined') {
                    const pStats = BattleSystem.getPlayerTotalStats(proxy);
                    const shieldValue = Math.floor(pStats.mpMax * 0.3);
                    msgs.push(BattleSystem.applyBuff(proxy, "DefBuff", 15000, null, true, caster, source));
                    msgs.push(BattleSystem.applyBuff(proxy, "ShieldBuff", 15000, shieldValue, true, caster, source));
                }
                return msgs.filter(m => m).join(" và ");
            }, rank: "Thần Cấp", sectId: "sect_thien_dao", contributionCost: 50000, reqReputation: 20000, minRank: 17
        },
        "skill_aura_celestial_power": {
            id: "skill_aura_celestial_power", name: "[Thần Cấp] Cửu Thiên Chiến Ý", type: "active", icon: "💥", color: "#ff4444",
            manaCost: 85, cooldown: 50, damageMult: 0,
            desc: "[Thần Cấp] Tuyệt kỹ tông môn, tăng 40% Tấn Công và 30% Thân Pháp trong 15 giây. (Yêu cầu: Nguyên Anh)",
            effect: (proxy, caster, source) => {
                let msgs = [];
                if (typeof BattleSystem !== 'undefined') {
                    msgs.push(BattleSystem.applyBuff(proxy, "AtkBuff", 15000, null, true, caster, source));
                    msgs.push(BattleSystem.applyBuff(proxy, "BossThanphapAura", 15000, null, true, caster, source));
                }
                return msgs.filter(m => m).join(" và ");
            }, rank: "Thần Cấp", sectId: "sect_thien_dao", contributionCost: 50000, reqReputation: 20000, minRank: 17
        },
        "skill_thien_dao_basic": { id: "skill_thien_dao_basic", name: "Thiên Đạo Tâm Kinh", type: "passive", icon: "🔱", color: "#ffd700", buff: { hpMax: 200, mp: 100, atk: 20, def: 20 }, desc: "[Linh Cấp] Tâm pháp trấn tông của Thiên Đạo Tông, tăng toàn diện căn cơ.", contributionCost: 15, reqReputation: 0, sectId: "sect_thien_dao", rank: "Linh Cấp" },
        "skill_thien_dao_ultimate": { id: "skill_thien_dao_ultimate", name: "Thiên Đạo Nhất Kiếm", type: "active", icon: "🗡️", color: "#ffd700", manaCost: 120, cooldown: 12, damageMult: 2.5, desc: "[Linh Cấp] Một kiếm ẩn chứa quy tắc thiên đạo, không thể né tránh.", contributionCost: 6000, reqReputation: 2500, sectId: "sect_thien_dao", rank: "Linh Cấp" },
        "skill_thien_dao_passive_2": { id: "skill_thien_dao_passive_2", name: "Vạn Pháp Quy Tông", type: "passive", icon: "📜", color: "#ffd700", buff: { hpMax: 500, mp: 250, atk: 50, def: 50, thanphap: 10 }, desc: "[Địa Cấp] Lĩnh ngộ vạn pháp, đưa về một mối. Tăng mạnh toàn bộ thuộc tính. (Yêu cầu: Trúc Cơ)", contributionCost: 12000, reqReputation: 5000, sectId: "sect_thien_dao", rank: "Địa Cấp", minRank: 11 },
        "skill_thien_dao_active_2": { id: "skill_thien_dao_active_2", name: "Thiên Phạt", type: "active", icon: "⚡", color: "#ffd700", manaCost: 250, cooldown: 25, damageMult: 6.5, debuff: "Stun", duration: 3000, desc: "[Địa Cấp] Triệu hoán thiên lôi trừng phạt kẻ thù, gây sát thương cực lớn và Choáng 3s. (Yêu cầu: Trúc Cơ)", contributionCost: 25000, reqReputation: 10000, sectId: "sect_thien_dao", rank: "Địa Cấp", minRank: 11 },

        "skill_magiao_basic": { id: "skill_magiao_basic", name: "Quỳ Hoa Nội Công", type: "passive", icon: "🌑", color: "#9c27b0", buff: { thanphap: 10, atk: 15, hpMax: -10 }, desc: "[Linh Cấp] Nội công tà dị, tăng mạnh thân pháp và tấn công nhưng giảm sinh mệnh.", contributionCost: 15, reqReputation: 0, sectId: "sect_magiao", rank: "Linh Cấp" },
        "skill_magiao_ultimate": { id: "skill_magiao_ultimate", name: "Quỳ Hoa Bảo Điển", type: "active", icon: "🪡", color: "#e91e63", manaCost: 65, cooldown: 15, damageMult: 1.3, debuff: "Bleed", chance: 0.5, duration: 2000, desc: "[Phàm Cấp] Thân pháp quỷ mị, xuất chiêu nhanh như chớp và có 50% tỷ lệ gây Chảy Máu 2s.", contributionCost: 1000, reqReputation: 300, sectId: "sect_magiao", rank: "Phàm Cấp" },
        "skill_magiao_passive_2": { id: "skill_magiao_passive_2", name: "Hấp Tinh Đại Pháp", type: "passive", icon: "🌀", color: "#9c27b0", buff: { mp: 100, atk: 30, hpMax: -30 }, desc: "[Địa Cấp] Hút linh khí thiên hạ, tăng mạnh linh lực và tấn công nhưng giảm sinh mệnh. (Yêu cầu: Trúc Cơ)", contributionCost: 3000, reqReputation: 1000, sectId: "sect_magiao", rank: "Địa Cấp", minRank: 11 },
        "skill_magiao_active_2": { id: "skill_magiao_active_2", name: "Nhật Nguyệt Thần Chưởng", type: "active", icon: "🌑", color: "#9c27b0", manaCost: 180, cooldown: 25, damageMult: 6.0, debuff: "Stun", chance: 0.3, duration: 2000, desc: "[Địa Cấp] Chưởng pháp thần giáo, bá đạo vô song, có 30% xác suất gây Choáng 2s. (Yêu cầu: Trúc Cơ)", contributionCost: 6000, reqReputation: 2500, sectId: "sect_magiao", rank: "Địa Cấp", minRank: 11 },

        "skill_vandoc_basic": { id: "skill_vandoc_basic", name: "Vạn Độc Tâm Pháp", type: "passive", icon: "🦂", color: "#4caf50", buff: { hpMax: 150, def: 15, thanphap: -5 }, desc: "[Linh Cấp] Kháng độc và tăng sinh mệnh, phòng ngự nhưng giảm thân pháp.", contributionCost: 15, reqReputation: 0, sectId: "sect_vandoc", rank: "Linh Cấp" },
        "skill_vandoc_ultimate": { id: "skill_vandoc_ultimate", name: "Hủ Cốt Phệ Tâm", type: "active", icon: "🧪", color: "#8bc34a", manaCost: 65, cooldown: 15, damageMult: 1.3, debuff: "Poison", duration: 3000, desc: "[Phàm Cấp] Gây sát thương độc liên tục lên đối thủ trong 3s.", contributionCost: 1000, reqReputation: 300, sectId: "sect_vandoc", rank: "Phàm Cấp" },
        "skill_vandoc_passive_2": { id: "skill_vandoc_passive_2", name: "Thiên Độc Thể", type: "passive", icon: "🦂", color: "#4caf50", buff: { hpMax: 375, def: 37.5, thanphap: -12.5, atk: 12.5 }, desc: "[Địa Cấp] Thân thể vạn độc không xâm, tăng mạnh sinh mệnh, phòng ngự and tấn công nhưng giảm mạnh thân pháp. (Yêu cầu: Trúc Cơ)", contributionCost: 3000, reqReputation: 1000, sectId: "sect_vandoc", rank: "Địa Cấp", minRank: 11 },
        "skill_vandoc_active_2": { id: "skill_vandoc_active_2", name: "Vạn Độc Phệ Thiên", type: "active", icon: "🧪", color: "#4caf50", manaCost: 200, cooldown: 25, damageMult: 6.0, debuff: "Poison", duration: 4000, desc: "[Địa Cấp] Độc khí ngập trời, ăn mòn vạn vật, gây Trúng Độc 4s. (Yêu cầu: Trúc Cơ)", contributionCost: 7000, reqReputation: 3000, sectId: "sect_vandoc", rank: "Địa Cấp", minRank: 11 },

        "skill_blood_basic": { id: "skill_blood_basic", name: "Huyết Ma Kinh", type: "passive", icon: "🩸", color: "#f44336", buff: { atk: 25, mp: -12.5 }, desc: "[Linh Cấp] Nội công hút máu, tăng mạnh tấn công nhưng giảm linh lực.", contributionCost: 15, reqReputation: 0, sectId: "sect_blood_demon", rank: "Linh Cấp" },
        "skill_blood_ultimate": { id: "skill_blood_ultimate", name: "Huyết Ma Chưởng", type: "active", icon: "🩸", color: "#d32f2f", manaCost: 75, cooldown: 12, damageMult: 1.4, debuff: "Bleed", chance: 0.6, duration: 4000, lifesteal: 0.4, desc: "[Phàm Cấp] Hút máu đối thủ và có 60% tỷ lệ gây Chảy Máu 4s.", contributionCost: 500, reqReputation: 100, sectId: "sect_blood_demon", rank: "Phàm Cấp" },
        "skill_blood_passive_2": { id: "skill_blood_passive_2", name: "Huyết Sát Quyết", type: "passive", icon: "🩸", color: "#f44336", buff: { atk: 62.5, mp: -37.5, thanphap: 7.5 }, desc: "[Địa Cấp] Sát khí ngập trời, tăng cực mạnh tấn công và thân pháp nhưng giảm mạnh linh lực. (Yêu cầu: Trúc Cơ)", contributionCost: 2500, reqReputation: 800, sectId: "sect_blood_demon", rank: "Địa Cấp", minRank: 11 },
        "skill_blood_active_2": { id: "skill_blood_active_2", name: "Huyết Hải Vô Biên", type: "active", icon: "🌊", color: "#f44336", manaCost: 160, cooldown: 25, damageMult: 6.0, debuff: "Bleed", duration: 4000, desc: "[Địa Cấp] Biển máu mênh mông, nhấn chìm kẻ thù và gây Chảy Máu 4s. (Yêu cầu: Trúc Cơ)", contributionCost: 5000, reqReputation: 2000, sectId: "sect_blood_demon", rank: "Địa Cấp", minRank: 11 },

        "skill_nether_basic": { id: "skill_nether_basic", name: "U Minh Quỷ Bộ", type: "passive", icon: "👻", color: "#607d8b", buff: { thanphap: 12.5, luk: 10, atk: -5 }, desc: "[Linh Cấp] Thân pháp quỷ dị, tăng thân pháp và may mắn nhưng giảm tấn công.", contributionCost: 15, reqReputation: 0, sectId: "sect_nether_palace", rank: "Linh Cấp" },
        "skill_nether_ultimate": { id: "skill_nether_ultimate", name: "U Minh Trảo", type: "active", icon: "🐾", color: "#455a64", manaCost: 65, cooldown: 12, damageMult: 1.3, debuff: "Blind", chance: 0.4, duration: 2000, desc: "[Phàm Cấp] Móng vuốt u minh, gây sát thương và có 40% tỷ lệ làm Mù đối thủ 2s.", contributionCost: 500, reqReputation: 100, sectId: "sect_nether_palace", rank: "Phàm Cấp" },
        "skill_nether_passive_2": { id: "skill_nether_passive_2", name: "Quỷ Đạo Tâm Kinh", type: "passive", icon: "👻", color: "#607d8b", buff: { thanphap: 30, luk: 25, atk: -15 }, desc: "[Địa Cấp] Tâm kinh quỷ đạo, tăng cực mạnh thân pháp và may mắn nhưng giảm mạnh tấn công. (Yêu cầu: Trúc Cơ)", contributionCost: 2000, reqReputation: 700, sectId: "sect_nether_palace", rank: "Địa Cấp", minRank: 11 },
        "skill_nether_active_2": { id: "skill_nether_active_2", name: "Bách Quỷ Dạ Hành", type: "active", icon: "👻", color: "#607d8b", manaCost: 180, cooldown: 25, damageMult: 5.5, debuff: "Confuse", chance: 0.3, duration: 2000, desc: "[Địa Cấp] Triệu hoán bách quỷ, có 30% tỷ lệ gây Hỗn Loạn đối thủ 2s. (Yêu cầu: Trúc Cơ)", contributionCost: 4500, reqReputation: 1800, sectId: "sect_nether_palace", rank: "Địa Cấp", minRank: 11 },
        "skill_fire_burst": {
            id: "skill_fire_burst", name: "Hỏa Diễm Toàn", type: "active", icon: "🔥", color: "#ff5722",
            manaCost: 30, cooldown: 10, damageMult: 1.3, debuff: "Burn", duration: 3000,
            desc: "[Phàm Cấp] Ngọn lửa bùng cháy, gây sát thương và Thiêu Đốt đối thủ trong 3s.",
            rank: "Phàm Cấp"
        },
        "skill_fire_spirit": {
            id: "skill_fire_spirit", name: "Linh Hỏa Chưởng", type: "active", icon: "🔥", color: "#ff5722",
            manaCost: 70, cooldown: 15, damageMult: 2.5, debuff: "Burn", duration: 4000,
            desc: "[Linh Cấp] Chưởng pháp mang linh hỏa, gây sát thương lớn và Thiêu Đốt đối thủ trong 4s.",
            rank: "Linh Cấp"
        },
        "skill_fire_earth": {
            id: "skill_fire_earth", name: "Địa Hỏa Phần Thiên", type: "active", icon: "🌋", color: "#ff5722",
            manaCost: 150, cooldown: 25, damageMult: 5.5, debuff: "Burn", duration: 5000,
            desc: "[Địa Cấp] Lửa từ lòng đất phun trào, thiêu rụi vạn vật và gây Thiêu Đốt đối thủ trong 5s.",
            rank: "Địa Cấp"
        }
    },

    npcNames: {
        surnames: ["Lý", "Trần", "Nguyễn", "Vương", "Trương", "Lâm", "Diệp", "Tiêu", "Tô", "Hàn", "Mạc", "Lục", "Thẩm", "Cố", "Vân"],
        middle: ["Thanh", "Vô", "Thiên", "Minh", "Tử", "Trường", "Đạo", "Vân", "Ngọc", "Linh", "Sơn", "Hải", "Phong", "Lôi", "Kiếm"],
        last: ["Phong", "Vân", "Hải", "Sơn", "Lôi", "Điện", "Kiếm", "Đao", "Tâm", "Linh", "Ngọc", "Thanh", "Minh", "Thiên", "Đạo"]
    },

    sects: {
        "sect_shaolin": { 
            id: "sect_shaolin", name: "Thiếu Lâm Tự", side: "Chính phái", alignment: "righteous", icon: "🏯", desc: "Bắc Đẩu Thái Sơn của võ lâm, thiên về phòng ngự.", 
            reqRank: 2, reqPower: 300, skills: ["skill_shaolin_basic", "skill_shaolin_ultimate", "skill_shaolin_passive_2", "skill_shaolin_active_2"],
            shop: [
                { id: "hp_pill_1", cost: 50, reqReputation: 0 },
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "pet_egg_linh", cost: 500, reqReputation: 100 },
                { id: "pet_egg_dia", cost: 2000, reqReputation: 500 },
                { id: "pet_egg_random", cost: 1000, reqReputation: 300 },
                { id: "spirit_stone", cost: 20, reqReputation: 50 },
                { id: "weapon_iron_sword", cost: 100, reqReputation: 200 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_wudang": { 
            id: "sect_wudang", name: "Võ Đang Phái", side: "Chính phái", alignment: "righteous", icon: "☯️", desc: "Lấy nhu thắng cương, nội công thâm hậu.", 
            reqRank: 2, reqPower: 300, skills: ["skill_wudang_basic", "skill_wudang_ultimate", "skill_wudang_passive_2", "skill_wudang_active_2"],
            shop: [
                { id: "qi_pill", cost: 50, reqReputation: 0 },
                { id: "pet_food_basic", cost: 150, reqReputation: 0 },
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "spirit_stone", cost: 20, reqReputation: 50 },
                { id: "weapon_iron_sword", cost: 100, reqReputation: 200 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_emei": { 
            id: "sect_emei", name: "Nga Mi Phái", side: "Chính phái", alignment: "righteous", icon: "🌸", desc: "Kiếm pháp linh hoạt, sinh mệnh dồi dào.", 
            reqRank: 2, reqPower: 300, skills: ["skill_emei_basic", "skill_emei_ultimate", "skill_emei_passive_2", "skill_emei_active_2"],
            shop: [
                { id: "hp_pill_1", cost: 50, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_beggar": { 
            id: "sect_beggar", name: "Cái Bang", side: "Chính phái", alignment: "righteous", icon: "🍢", desc: "Đệ nhất đại bang, thân pháp phiêu dật.", 
            reqRank: 2, reqPower: 250, skills: ["skill_beggar_basic", "skill_beggar_ultimate", "skill_beggar_passive_2", "skill_beggar_active_2"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_tang": { 
            id: "sect_tang", name: "Đường Môn", side: "Chính phái", alignment: "righteous", icon: "🎯", desc: "Tinh thông ám khí và độc thuật, hành hiệp trượng nghĩa.", 
            reqRank: 2, reqPower: 300, skills: ["skill_tang_basic", "skill_tang_ultimate", "skill_tang_passive_2", "skill_tang_active_2"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_ming": { 
            id: "sect_ming", name: "Minh Giáo", side: "Tà phái", alignment: "evil", icon: "🔥", desc: "Hành tung bí ẩn, công kích bạo liệt.", 
            reqRank: 2, reqPower: 350, skills: ["skill_ming_basic", "skill_ming_ultimate", "skill_ming_passive_2", "skill_ming_active_2"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_magiao": { 
            id: "sect_magiao", name: "Nhật Nguyệt Thần Giáo", side: "Tà phái", alignment: "evil", icon: "🌑", desc: "Giáo chủ Đông Phương Bất Bại, Quỳ Hoa Bảo Điển vô địch thiên hạ, hành tung quỷ dị, võ học tàn độc.", 
            reqRank: 2, reqPower: 350, skills: ["skill_magiao_basic", "skill_magiao_ultimate", "skill_magiao_passive_2", "skill_magiao_active_2"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_vandoc": { 
            id: "sect_vandoc", name: "Vạn Độc Môn", side: "Tà phái", alignment: "evil", icon: "🦂", desc: "Tinh thông độc thuật, lấy độc trị độc, vạn độc bất xâm.", 
            reqRank: 11, reqPower: 3000, skills: ["skill_vandoc_basic", "skill_vandoc_ultimate", "skill_vandoc_passive_2", "skill_vandoc_active_2", "skill_aura_vile_poison"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_blood_demon": { 
            id: "sect_blood_demon", name: "Huyết Ma Giáo", side: "Tà phái", alignment: "evil", icon: "🩸", desc: "Tu luyện huyết ma kinh, lấy máu người làm gốc, tàn bạo vô cùng.", 
            reqRank: 14, reqPower: 5000, skills: ["skill_blood_basic", "skill_blood_ultimate", "skill_blood_passive_2", "skill_blood_active_2"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_nether_palace": { 
            id: "sect_nether_palace", name: "U Minh Cung", side: "Tà phái", alignment: "evil", icon: "👻", desc: "Hành tung quỷ dị, xuất hiện trong bóng tối, điều khiển linh hồn.", 
            reqRank: 11, reqPower: 2500, skills: ["skill_nether_basic", "skill_nether_ultimate", "skill_nether_passive_2", "skill_nether_active_2"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_premium", cost: 400, reqReputation: 100 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "sect_thien_dao": { 
            id: "sect_thien_dao", name: "Thiên Đạo Tông", side: "Thánh địa", alignment: "righteous", icon: "🔱", desc: "Tông môn đứng đầu thiên hạ, nắm giữ quy tắc thiên đạo.", 
            reqRank: 20, reqPower: 25000, skills: ["skill_thien_dao_basic", "skill_thien_dao_ultimate", "skill_thien_dao_passive_2", "skill_thien_dao_active_2", "skill_aura_celestial_shield", "skill_aura_celestial_power"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_rare", cost: 1000, reqReputation: 500 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "book_thien_dao_basic", cost: 1000, reqReputation: 0 },
                { id: "book_thien_dao_ultimate", cost: 6000, reqReputation: 2500 },
                { id: "book_thien_dao_passive_2", cost: 12000, reqReputation: 5000 },
                { id: "book_thien_dao_active_2", cost: 25000, reqReputation: 10000 },
                { id: "book_aura_celestial_shield", cost: 50000, reqReputation: 20000 },
                { id: "book_aura_celestial_power", cost: 50000, reqReputation: 20000 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "holy_kunlun": { 
            id: "holy_kunlun", name: "Côn Luân Thánh Địa", side: "Thánh địa", alignment: "righteous", icon: "🏔️", desc: "Nơi ở của các vị tiên nhân, linh khí dồi dào bậc nhất.", 
            reqRank: 17, reqPower: 12000, skills: ["skill_kunlun_basic", "skill_kunlun_ultimate", "skill_kunlun_passive_2", "skill_kunlun_active_2", "skill_aura_shield"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_rare", cost: 1000, reqReputation: 500 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "weapon_dragon_slayer", cost: 100, reqReputation: 2000 },
                { id: "book_void_slash", cost: 10000, reqReputation: 5000 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        },
        "holy_penglai": { 
            id: "holy_penglai", name: "Bồng Lai Tiên Đảo", side: "Thánh địa", alignment: "righteous", icon: "🏝️", desc: "Tiên đảo ngoài khơi xa, nơi ở của các bậc chân tiên.", 
            reqRank: 17, reqPower: 15000, skills: ["skill_penglai_basic", "skill_penglai_ultimate", "skill_penglai_passive_2", "skill_penglai_active_2", "skill_aura_power"],
            shop: [
                { id: "gift_wine", cost: 100, reqReputation: 0 },
                { id: "pet_food_rare", cost: 1000, reqReputation: 500 },
                { id: "gift_tea", cost: 300, reqReputation: 100 },
                { id: "weapon_heaven_shaker", cost: 100, reqReputation: 5000 },
                { id: "book_void_slash", cost: 15000, reqReputation: 8000 },
                { id: "item_forgotten_skill", cost: 1000, reqReputation: 1000 }
            ]
        }
    },

    maps: [
        { id: "map_forest", name: "Tân Thủ Thôn", difficulty: "10-450 LC", stamina: 5, time: 5000, minPower: 10, maxPower: 450, monsters: ["slime", "wolf"], boss: "wolf", drops: ["spirit_stone", "hp_pill_1", "mp_pill_1", "qi_pill", "weapon_wooden_sword", "legs_straw_sandals", "acc_hemp_bracelet", "book_aura_shield_low"] },
        { id: "map_cave", name: "U Minh Động", difficulty: "Vừa", stamina: 10, time: 10000, monsters: ["bat", "skeleton"], boss: "skeleton", drops: ["spirit_stone", "weapon_iron_sword", "head_iron_helmet", "legs_leather_boots", "ring_silver_band", "book_aura_power_low", "book_aura_speed_low"] },
        { id: "map_mountain", name: "Vạn Kiếp Sơn", difficulty: "Khó", stamina: 20, time: 20000, monsters: ["tiger", "eagle"], boss: "tiger", drops: ["spirit_stone", "weapon_spirit_blade", "body_mystic_robe", "head_mystic_hood", "acc_jade_bracelet", "book_virtual_armor_low"] },
        { id: "map_hell", name: "Huyết Ma Vực", difficulty: "Cực Khó", stamina: 40, time: 30000, monsters: ["demon", "succubus"], boss: "demon", drops: ["spirit_stone", "weapon_void_reaper", "body_celestial_armor", "head_celestial_tiara", "ring_phoenix_ring"] },
        { id: "map_heaven", name: "Thiên Giới", difficulty: "Tử Địa", stamina: 100, time: 60000, monsters: ["angel", "god"], boss: "god", drops: ["spirit_stone", "weapon_chaos_bringer", "weapon_primordial_origin"] }
    ],

    enemies: {
        "slime": { name: "Linh Điệp", icon: "🦋", hp: 200, mp: 30, atk: 20, def: 10, thanphap: 5, exp: 15, rankIndex: 0, desc: "Một loài bướm linh thiêng, lớp vỏ cứng cáp.", skills: [{ id: "skill_slime_pollen" }], drops: [{ id: "spirit_stone", chance: 0.6, count: 1 }, { id: "hp_pill_1", chance: 0.1, count: 1 }, { id: "mp_pill_1", chance: 0.1, count: 1 }, { id: "body_leather_armor", chance: 0.1, count: 1 }] },
        "wolf": { name: "Hoang Lang", icon: "🐺", hp: 240, mp: 60, atk: 24, def: 12, thanphap: 12, exp: 30, rankIndex: 1, desc: "Sói hoang đói khát, tấn công rất nhanh.", skills: [{ id: "skill_wolf_bite" }], drops: [{ id: "spirit_stone", chance: 0.6, count: 2 }, { id: "hp_pill_1", chance: 0.1, count: 1 }, { id: "mp_pill_1", chance: 0.1, count: 1 }, { id: "weapon_wooden_sword", chance: 0.1, count: 1 }, { id: "book_fire_burst", chance: 0.05, count: 1, bossOnly: true }, { id: "item_hoang_lang_vuong_hach", chance: 0.3, count: 1, bossOnly: true }] },
        "bat": { name: "U Minh Biên", icon: "🦇", hp: 983, mp: 245, atk: 98, def: 49, thanphap: 49, exp: 60, rankIndex: 4, desc: "Dơi quỷ trong hang động, có thể gây choáng.", skills: [{ id: "skill_bat_stun" }], drops: [{ id: "hp_pill_1", chance: 0.2, count: 1 }, { id: "mp_pill_1", chance: 0.2, count: 1 }] },
        "skeleton": { name: "Khô Lâu Binh", icon: "💀", hp: 4026, mp: 1000, atk: 402, def: 201, thanphap: 20, exp: 120, rankIndex: 7, desc: "Bộ xương khô cầm kiếm rỉ sét, có thể gây Phá Giáp.", skills: [{ id: "skill_skeleton_slash" }], drops: [
            { id: "spirit_stone", chance: 0.6, count: 5 },
            { id: "treasure_lang_nha_bong", chance: 0.2, count: 1, bossOnly: true },
            { id: "treasure_chu_ma_kiem", chance: 0.2, count: 1, bossOnly: true },
            { id: "treasure_khong_gian_gioi_chi", chance: 0.2, count: 1, bossOnly: true }
        ] },
        "tiger": { name: "Yêu Hổ", icon: "🐅", hp: 16500, mp: 4125, atk: 1650, def: 825, thanphap: 825, exp: 350, rankIndex: 10, desc: "Hổ thành tinh, móng vuốt sắc lẹm, có thể gây Chảy Máu.", skills: [{ id: "skill_tiger_pounce" }, { id: "skill_skeleton_slash" }], drops: [
            { id: "spirit_stone", chance: 0.8, count: 10 },
            { id: "treasure_lang_nha_bong", chance: 0.3, count: 1, bossOnly: true },
            { id: "treasure_chu_ma_kiem", chance: 0.3, count: 1, bossOnly: true },
            { id: "treasure_khong_gian_gioi_chi", chance: 0.3, count: 1, bossOnly: true }
        ] },
        "eagle": { name: "Kim Điêu", icon: "🦅", hp: 10300, mp: 2575, atk: 1030, def: 515, thanphap: 515, exp: 400, rankIndex: 9, desc: "Đại bàng vàng, thân pháp cực nhanh, có thể gây Choáng.", skills: [{ id: "skill_eagle_dive" }, { id: "skill_wolf_bite" }], drops: [{ id: "spirit_stone", chance: 0.7, count: 15 }] },
        "demon": { name: "Huyết Ma", icon: "👹", hp: 108100, mp: 27000, atk: 10810, def: 5405, thanphap: 5405, exp: 1500, rankIndex: 14, desc: "Ma đầu khát máu, có thể Hút Máu and gây Chảy Máu.", skills: [{ id: "skill_demon_drain" }, { id: "skill_tiger_pounce" }], drops: [{ id: "spirit_stone", chance: 1.0, count: 50 }, { id: "qi_pill", chance: 0.3, count: 2 }] },
        "succubus": { name: "Mị Ma", icon: "🧛‍♀️", hp: 172960, mp: 43240, atk: 17296, def: 8648, thanphap: 8648, exp: 1800, rankIndex: 15, desc: "Yêu nữ mê hoặc, có thể khiến đối thủ Hỗn Loạn.", skills: [{ id: "skill_succubus_charm" }, { id: "skill_demon_drain" }], drops: [{ id: "spirit_stone", chance: 1.0, count: 60 }, { id: "qi_pill", chance: 0.4, count: 2 }] },
        "angel": { name: "Thiên Sứ", icon: "👼", hp: 5113000, mp: 1278250, atk: 511300, def: 255650, thanphap: 255650, exp: 15000, rankIndex: 22, desc: "Chiến binh thiên giới, sức mạnh thần thánh, có thể gây Câm Lặng.", skills: [{ id: "skill_angel_judgment" }, { id: "skill_demon_drain" }], drops: [{ id: "spirit_stone", chance: 1.0, count: 500 }, { id: "weapon_heaven_shaker", chance: 0.01, count: 1 }] },
        "god": { name: "Thần Linh", icon: "🔱", hp: 319014600, mp: 79753650, atk: 31901460, def: 15950730, thanphap: 15950730, exp: 150000, rankIndex: 31, desc: "Vị thần cai quản thiên giới, bất khả chiến bại, có thể gây Choáng.", skills: [{ id: "skill_god_wrath" }, { id: "skill_angel_judgment" }], drops: [{ id: "spirit_stone", chance: 1.0, count: 2000 }, { id: "weapon_primordial_origin", chance: 0.01, count: 1 }] },
        
        // --- KẺ THÙ MÔN PHÁI ---
        "sect_disciple": { name: "Đệ Tử Môn Phái", icon: "🤺", hp: 240, mp: 100, atk: 24, def: 12, thanphap: 12, exp: 150, rankIndex: 1, desc: "Đệ tử chính tông của các môn phái.", skills: [], drops: [{ id: "spirit_stone", chance: 0.5, count: 5 }] },
        "sect_elite_disciple": { name: "Tinh Anh Đệ Tử", icon: "⚔️", hp: 2516, mp: 629, atk: 251, def: 125, thanphap: 125, exp: 400, rankIndex: 6, desc: "Đệ tử ưu tú, thực lực bất phàm.", skills: [], drops: [{ id: "spirit_stone", chance: 0.7, count: 15 }, { id: "hp_pill_1", chance: 0.2, count: 1 }] },
        "sect_elder": { name: "Trưởng Lão Môn Phái", icon: "🧙‍♂️", hp: 42200, mp: 10550, atk: 4220, def: 2110, thanphap: 2110, exp: 1500, rankIndex: 12, desc: "Bậc tiền bối trong môn phái, tu vi thâm hậu.", skills: [], drops: [{ id: "spirit_stone", chance: 1.0, count: 50 }, { id: "qi_pill", chance: 0.5, count: 1 }] },
        
        // --- BOSS ĐẶC BIỆT ---
        "mysterious_person_boss": {
            id: "mysterious_person_boss",
            name: "Người Thần Bí",
            icon: "👤",
            rankIndex: 25, // Hợp Thể Sơ Kỳ
            desc: "Một kẻ bí ẩn với sức mạnh thâm sâu khó lường. Hắn dường như không thuộc về thế giới này.",
            hp: 19014600, 
            maxHp: 19014600,
            atk: 1901460, 
            def: 950730,
            thanphap: 950730,
            luk: 20000,
            maxMp: 3000000,
            currentMp: 3000000,
            shield: 600000, // 20% Linh lực
            exp: 0,
            isBoss: true,
            skills: [
                { id: "chaos_strike", name: "Hỗn Độn Kích", damageMult: 2.5, desc: "Một đòn đánh mang theo sức mạnh hỗn độn." },
                { id: "void_gaze", name: "Hư Vô Nhãn", damageMult: 1.5, debuff: "Stun", duration: 2000, desc: "Ánh mắt khiến đối phương đứng hình trong 2s." },
                { id: "chaos_hand", name: "Hỗn Độn Chi Thủ", damageMult: 3.0, desc: "Bàn tay khổng lồ từ hư không bóp nát vạn vật." },
                { id: "ancient_one", name: "Vạn Cổ Quy Nhất", damageMult: 4.0, desc: "Sức mạnh từ thời thái cổ tập trung vào một điểm." },
                { id: "reincarnation_eye", name: "Luân Hồi Nhãn", damageMult: 2.0, debuff: "Weak", duration: 3000, desc: "Nhìn thấu kiếp trước kiếp này, khiến đối phương suy yếu trong 3s." },
                { id: "fate_change", name: "Nghịch Thiên Cải Mệnh", damageMult: 3.5, desc: "Thay đổi vận mệnh, giáng xuống đòn đánh chí mạng." },
                { id: "void_sword", name: "Hư Vô Chi Kiếm", damageMult: 2.8, desc: "Thanh kiếm không hình không tướng, xuyên thấu mọi phòng ngự." },
                { id: "god_demon_trans", name: "Thần Ma Biến", damageMult: 5.0, desc: "Hóa thân Thần Ma, sức mạnh tăng vọt trong nháy mắt." },
                { id: "world_longevity", name: "Thiên Địa Đồng Thọ", damageMult: 3.2, desc: "Mượn sức mạnh của trời đất để trấn áp kẻ thù." },
                { id: "nine_heavens_bolt", name: "Cửu Tiêu Lôi Kiếp", damageMult: 4.5, debuff: "Burn", duration: 3000, desc: "Lôi điện từ chín tầng trời giáng xuống, gây Thiêu Đốt 3s." },
                { id: "star_fall", name: "Tinh Thần Lạc", damageMult: 3.8, desc: "Triệu hồi tinh tú từ vũ trụ va chạm mặt đất." },
                { id: "eternal_night", name: "Vĩnh Hằng Chi Dạ", damageMult: 2.2, debuff: "Blind", duration: 2000, desc: "Bao phủ thế giới trong bóng tối vĩnh cửu, gây Mù 2s." }
            ]
        }
    },

    petRanks: {
        "Phàm cấp": { color: "#888", growth: 1.6, baseMult: 1.05 },
        "Linh cấp": { color: "#4caf50", growth: 1.6, baseMult: 1.1 },
        "Địa cấp": { color: "#2196f3", growth: 1.6, baseMult: 1.15 },
        "Thiên cấp": { color: "#9c27b0", growth: 1.6, baseMult: 1.2 },
        "Thần cấp": { color: "#ffeb3b", growth: 1.6, baseMult: 1.25 },
        "Cực phẩm cấp": { color: "#ff4444", growth: 1.6, baseMult: 1.3 }
    },

    pets: {
        "pet_ice_bird": {
            id: "pet_ice_bird", name: "Băng Điểu", icon: "🐦",
            hpBase: 105, mpBase: 53, shieldBase: 30, atkBase: 11, defBase: 5, thanphapBase: 5, lukBase: 1,
            skills: ["skill_pet_ice_shard", "skill_pet_luck_boost"],
            rank: "Phàm cấp",
            type: "Băng",
            bonusTypes: ["thanphap"],
            desc: "Loài chim sống ở vùng cực bắc, có khả năng điều khiển băng giá. Hỗ trợ tăng Thân pháp."
        },
        "pet_spirit_turtle": {
            id: "pet_spirit_turtle", name: "Linh Quy", icon: "🐢",
            hpBase: 110, mpBase: 55, shieldBase: 100, atkBase: 11, defBase: 6, thanphapBase: 6, lukBase: 1,
            skills: ["skill_pet_earthquake", "skill_pet_protection"],
            rank: "Linh cấp",
            type: "Thủy",
            bonusTypes: ["hp"],
            desc: "Rùa thiêng nghìn năm, mang trong mình sức sống mãnh liệt. Hỗ trợ tăng Sinh mệnh."
        },
        "pet_earth_bear": {
            id: "pet_earth_bear", name: "Thạch Hùng", icon: "🐻",
            hpBase: 156, mpBase: 58, shieldBase: 120, atkBase: 7, defBase: 13, thanphapBase: 4, lukBase: 1,
            skills: ["skill_pet_earthquake", "skill_pet_blessing", "skill_pet_roar"],
            rank: "Địa cấp",
            type: "Thổ",
            bonusTypes: ["def", "hp"],
            desc: "Gấu đá khổng lồ với lớp da cứng cáp như thạch anh. Hỗ trợ tăng Phòng ngự và Sinh mệnh."
        },
        "pet_thunder_cat": {
            id: "pet_thunder_cat", name: "Lôi Miêu", icon: "🐱",
            hpBase: 120, mpBase: 60, shieldBase: 50, atkBase: 12, defBase: 6, thanphapBase: 6, lukBase: 1,
            skills: ["skill_pet_thunder_strike", "skill_pet_ice_shard", "skill_pet_luck_boost"],
            rank: "Thiên cấp",
            type: "Lôi",
            bonusTypes: ["atk", "thanphap", "luk"],
            desc: "Mèo sấm sét di chuyển nhanh như chớp, tấn công tê liệt kẻ thù. Hỗ trợ tăng Tấn công, Thân pháp và May mắn."
        },
        "pet_fire_phoenix": {
            id: "pet_fire_phoenix", name: "Hỏa Phượng", icon: "🦜",
            hpBase: 125, mpBase: 63, shieldBase: 80, atkBase: 13, defBase: 6, thanphapBase: 6, lukBase: 1,
            skills: ["skill_pet_phoenix_flame", "skill_pet_thunder_strike", "skill_pet_blessing"],
            rank: "Thần cấp",
            type: "Hỏa",
            bonusTypes: ["atk", "def", "thanphap", "hp"],
            desc: "Phượng hoàng lửa tái sinh từ tro tàn, mang sức mạnh hủy diệt. Hỗ trợ tăng Tấn công, Phòng ngự, Thân pháp và Sinh mệnh."
        },
        "pet_gold_dragon": {
            id: "pet_gold_dragon", name: "Kim Long", icon: "🐉",
            hpBase: 130, mpBase: 65, shieldBase: 150, atkBase: 13, defBase: 7, thanphapBase: 7, lukBase: 1,
            skills: ["skill_pet_dragon_breath", "skill_pet_phoenix_flame", "skill_pet_thunder_strike", "skill_pet_earthquake"],
            rank: "Cực phẩm cấp",
            type: "Kim",
            bonusTypes: ["all"],
            desc: "Rồng vàng thượng cổ, biểu tượng của sức mạnh tuyệt đối. Hỗ trợ tăng Tất cả chỉ số."
        },
        "pet_wild_rabbit": {
            id: "pet_wild_rabbit", name: "Thỏ Hoang", icon: "🐇",
            hpBase: 105, mpBase: 53, shieldBase: 20, atkBase: 11, defBase: 5, thanphapBase: 5, lukBase: 1,
            skills: ["skill_pet_luck_boost"],
            rank: "Phàm cấp",
            type: "Mộc",
            bonusTypes: ["thanphap", "luk"],
            desc: "Một chú thỏ nhỏ nhắn, nhanh nhẹn, thường thấy ở các bìa rừng. Hỗ trợ tăng Thân pháp và May mắn."
        },
        "pet_wood_deer": {
            id: "pet_wood_deer", name: "Mộc Lộc", icon: "🦌",
            hpBase: 110, mpBase: 55, shieldBase: 50, atkBase: 11, defBase: 6, thanphapBase: 6, lukBase: 1,
            skills: ["skill_pet_nature_gift", "skill_pet_blessing"],
            rank: "Linh cấp",
            type: "Mộc",
            bonusTypes: ["mp", "thanphap"],
            desc: "Linh hươu mang hơi thở của rừng xanh, có khả năng hồi phục linh khí. Hỗ trợ tăng Linh lực và Thân pháp."
        },
        "pet_iron_bull": {
            id: "pet_iron_bull", name: "Thiết Ngưu", icon: "🐂",
            hpBase: 115, mpBase: 58, shieldBase: 150, atkBase: 12, defBase: 6, thanphapBase: 6, lukBase: 1,
            skills: ["skill_pet_earthquake", "skill_pet_protection", "skill_pet_roar"],
            rank: "Địa cấp",
            type: "Thổ",
            bonusTypes: ["def", "hp"],
            desc: "Trâu sắt với lớp da dày cứng như thép, là tấm khiên vững chắc. Hỗ trợ tăng Phòng ngự và Sinh mệnh."
        },
        "pet_wind_falcon": {
            id: "pet_wind_falcon", name: "Phong Ưng", icon: "🦅",
            hpBase: 120, mpBase: 60, shieldBase: 40, atkBase: 12, defBase: 6, thanphapBase: 6, lukBase: 1,
            skills: ["skill_pet_wind_blade", "skill_pet_nature_gift", "skill_pet_thunder_strike"],
            rank: "Thiên cấp",
            type: "Phong",
            bonusTypes: ["thanphap", "atk"],
            desc: "Đại bàng gió với tốc độ kinh hoàng, tấn công chớp nhoáng. Hỗ trợ tăng Thân pháp và Tấn công."
        },
        "pet_dark_tiger": {
            id: "pet_dark_tiger", name: "U Minh Hổ", icon: "🐅",
            hpBase: 125, mpBase: 63, shieldBase: 100, atkBase: 13, defBase: 6, thanphapBase: 6, lukBase: 1,
            skills: ["skill_pet_roar", "skill_pet_blessing", "skill_pet_phoenix_flame"],
            rank: "Thần cấp",
            type: "Ám",
            bonusTypes: ["atk", "luk"],
            desc: "Hổ đen đến từ u minh, mang theo sát khí lạnh lẽo và sức mạnh hủy diệt. Hỗ trợ tăng Tấn công và May mắn."
        },
        "pet_jade_qilin": {
            id: "pet_jade_qilin", name: "Ngọc Kỳ Lân", icon: "🦄",
            hpBase: 130, mpBase: 65, shieldBase: 200, atkBase: 13, defBase: 7, thanphapBase: 7, lukBase: 1,
            skills: ["skill_pet_dragon_breath", "skill_pet_ice_shard", "skill_pet_protection", "skill_pet_nature_gift"],
            rank: "Cực phẩm cấp",
            type: "Thủy",
            bonusTypes: ["all"],
            desc: "Linh thú điềm lành, mang lại may mắn và sự bảo hộ tuyệt đối cho chủ nhân. Hỗ trợ tăng Tất cả chỉ số."
        }
    },

    petSkills: {
        "skill_pet_ice_shard": {
            id: "skill_pet_ice_shard", name: "Băng Tiễn",
            desc: "[Phàm cấp] Bắn ra mảnh băng gây sát thương và giảm 30% Thân pháp của kẻ địch trong 4 giây.",
            power: 1.5, type: "active", cooldown: 8, manaCost: 10, effect: { type: "debuff", debuff: "SpdDebuff", duration: 4000 }, rank: "Phàm cấp"
        },
        "skill_pet_luck_boost": {
            id: "skill_pet_luck_boost", name: "Phúc Tinh Cao Chiếu",
            desc: "[Phàm cấp] Tăng 10 May mắn cho chủ nhân trong 4 giây, giúp dễ dàng né tránh và gây bạo kích.",
            power: 0, type: "active", cooldown: 10, manaCost: 20, effect: { type: "buff", buff: "LuckBuff", duration: 4000, value: 10 }, rank: "Phàm cấp"
        },
        "skill_pet_earthquake": {
            id: "skill_pet_earthquake", name: "Địa Chấn",
            desc: "[Linh cấp] Dẫm mạnh xuống đất gây sát thương và có 30% tỷ lệ gây choáng kẻ địch trong 4 giây.",
            power: 2.0, type: "active", cooldown: 10, manaCost: 25, effect: { type: "stun", chance: 0.3, duration: 4000 }, rank: "Linh cấp"
        },
        "skill_pet_blessing": {
            id: "skill_pet_blessing", name: "Linh Thú Chúc Phúc",
            desc: "[Linh cấp] Tăng 20% Tấn công cho chủ nhân trong 5 giây.",
            power: 0, type: "active", cooldown: 12, manaCost: 25, effect: { type: "buff", buff: "AtkBuff", duration: 5000, value: 0.2 }, rank: "Linh cấp"
        },
        "skill_pet_protection": {
            id: "skill_pet_protection", name: "Linh Thú Hộ Thể",
            desc: "[Linh cấp] Tạo lớp bảo vệ tăng 20% Phòng ngự cho chủ nhân trong 5 giây.",
            power: 0, type: "active", cooldown: 12, manaCost: 25, effect: { type: "buff", buff: "DefBuff", duration: 5000, value: 0.2 }, rank: "Linh cấp"
        },
        "skill_pet_nature_gift": {
            id: "skill_pet_nature_gift", name: "Linh Khí Chúc Phúc",
            desc: "[Linh cấp] Chúc phúc từ thiên nhiên giúp chủ nhân tăng 20% Thân pháp trong 5 giây.",
            power: 0, type: "active", cooldown: 12, manaCost: 25, effect: { type: "buff", buff: "SpdBuff", duration: 5000, value: 0.2 }, rank: "Linh cấp"
        },
        "skill_pet_wind_blade": {
            id: "skill_pet_wind_blade", name: "Phong Đao",
            desc: "[Địa cấp] Tạo ra những lưỡi đao gió sắc bén tấn công kẻ thù và giảm 30% Thân pháp của chúng trong 4 giây.",
            power: 2.5, type: "active", cooldown: 12, manaCost: 35, effect: { type: "debuff", debuff: "SpdDebuff", duration: 4000 }, rank: "Địa cấp"
        },
        "skill_pet_roar": {
            id: "skill_pet_roar", name: "Mãnh Thú Hống",
            desc: "[Địa cấp] Tiếng gầm uy phong làm kẻ địch khiếp sợ, giảm 25% Tấn công của chúng trong 4 giây.",
            power: 1.5, type: "active", cooldown: 14, manaCost: 40, effect: { type: "debuff", debuff: "Weakness", duration: 4000 }, rank: "Địa cấp"
        },
        "skill_pet_thunder_strike": {
            id: "skill_pet_thunder_strike", name: "Lôi Kích",
            desc: "[Thiên cấp] Phóng tia sét gây sát thương lớn và giảm 30% Thân pháp của kẻ địch trong 4 giây. (Cần tụ lực 2s)",
            power: 3.5, type: "active", cooldown: 16, manaCost: 45, chargeTime: 2000, effect: { type: "debuff", debuff: "SpdDebuff", duration: 4000 }, rank: "Thiên cấp", lockRank: 11
        },
        "skill_pet_phoenix_flame": {
            id: "skill_pet_phoenix_flame", name: "Phượng Hỏa",
            desc: "[Thần cấp] Phun lửa thiêu rụi kẻ thù, gây sát thương cực lớn và giảm 50% Phòng ngự của kẻ địch trong 5 giây. (Cần tụ lực 4s)",
            power: 5.0, type: "active", cooldown: 18, manaCost: 80, chargeTime: 4000, effect: { type: "debuff", debuff: "ArmorBreak", duration: 5000 }, rank: "Thần cấp", lockRank: 13
        },
        "skill_pet_dragon_breath": {
            id: "skill_pet_dragon_breath", name: "Long Tức",
            desc: "[Cực phẩm cấp] Hơi thở của rồng thiêng, gây sát thương hủy diệt và làm choáng kẻ địch 6 giây. (Cần tụ lực 6s)",
            power: 8.0, type: "active", cooldown: 20, manaCost: 150, chargeTime: 6000, effect: { type: "stun", chance: 0.5, duration: 6000 }, rank: "Cực phẩm cấp", lockRank: 14
        }
    },

    events: [
        // --- KỲ NGỘ (Rare Opportunities) ---
        { 
            type: "rare", 
            text: "Nhặt được một túi tiền rơi vãi của tu sĩ nào đó.", 
            rewardText: (p) => `+${50 + Math.floor(Math.pow(p.rankIndex, 1.5) * 10)} 💎 Linh Thạch`, 
            effect: (p) => Game.addItem("spirit_stone", 50 + Math.floor(Math.pow(p.rankIndex, 1.5) * 10), true) 
        },
        { 
            type: "rare", 
            text: "Gặp được cao nhân chỉ điểm, đốn ngộ đạo lý.", 
            rewardText: (p) => `+${Math.floor(GameData.ranks[p.rankIndex].expReq * 0.15)} Linh khí`, 
            effect: (p) => p.mana += Math.floor(GameData.ranks[p.rankIndex].expReq * 0.15) 
        },
        { 
            type: "rare", 
            text: "Tìm thấy một gốc Linh Thảo quý hiếm.", 
            rewardText: (p) => `+${Math.max(1, Math.floor((Math.floor(p.rankIndex / 5) + 1) / 2))} Bổ Khí Đan`, 
            effect: (p) => Game.addItem("qi_pill", Math.max(1, Math.floor((Math.floor(p.rankIndex / 5) + 1) / 2)), true) 
        },
        { 
            type: "rare", 
            text: "Phát hiện một tổ chim linh thú bỏ hoang, bên trong còn sót lại ít thức ăn khô.", 
            rewardText: (p) => `+1 Thức ăn linh thú (Thường)`, 
            effect: (p) => Game.addItem("pet_food_basic", 1, true) 
        },
        { 
            type: "rare", 
            text: "Gặp một thương nhân đang gặp nạn, sau khi giúp đỡ ông ta tặng bạn ít thức ăn linh thú cao cấp.", 
            rewardText: (p) => `+1 Thức ăn linh thú (Cao cấp)`, 
            effect: (p) => Game.addItem("pet_food_premium", 1, true) 
        },
        { 
            type: "rare", 
            text: "Phát hiện một hang động bí mật chứa đầy linh khí.", 
            rewardText: (p) => `+${Math.floor(p.hpMax * 0.2)} HP, +${Math.floor(GameData.ranks[p.rankIndex].expReq * 0.1)} Linh khí`, 
            effect: (p) => { 
                p.hp = Math.min(p.hpMax, p.hp + Math.floor(p.hpMax * 0.2)); 
                p.mana += Math.floor(GameData.ranks[p.rankIndex].expReq * 0.1); 
            } 
        },
        { 
            type: "rare", 
            text: "Tìm thấy thi hài một vị tiền bối, nhặt được nhẫn trữ vật.", 
            rewardText: (p) => `+${100 + Math.floor(Math.pow(p.rankIndex, 1.5) * 15)} 💎 Linh Thạch, +1 Bí Tịch Hào Quang`, 
            effect: (p) => { 
                Game.addItem("spirit_stone", 100 + Math.floor(Math.pow(p.rankIndex, 1.5) * 15), true);
                const books = ["book_aura_shield_low", "book_aura_power_low", "book_aura_speed_low", "book_virtual_armor_low"];
                const randomBook = books[Math.floor(Math.random() * books.length)];
                Game.addItem(randomBook, 1, true);
            } 
        },
        { 
            type: "rare", 
            text: "Uống được nước suối linh thiêng, tẩy tủy phạt cốt.", 
            rewardText: (p) => `+${25 * (p.rankIndex + 1)} HP Max, +${10 * (p.rankIndex + 1)} MP Max`, 
            effect: (p) => { 
                p.eventHpMaxBonus += 25 * (p.rankIndex + 1);
                p.eventMpMaxBonus += 10 * (p.rankIndex + 1);
                p.hp = p.hpMax;
                p.currentMp = p.mpMax;
            } 
        },
        { 
            type: "rare", 
            text: "Vô tình đốn ngộ Kiếm Ý của một vị kiếm tu cổ đại.", 
            rewardText: (p) => `+${2 * (p.rankIndex + 1)} Tấn công`, 
            effect: (p) => p.eventAtkBonus += 2 * (p.rankIndex + 1) 
        },
        { 
            type: "rare", 
            text: "Tìm thấy một mảnh tàn giáp chứa đựng linh lực hộ thể.", 
            rewardText: (p) => `+${1 * (p.rankIndex + 1)} Phòng ngự`, 
            effect: (p) => p.eventDefBonus += 1 * (p.rankIndex + 1) 
        },
        { 
            type: "rare", 
            text: "Cảm nhận được sự nhẹ nhàng của gió, ngộ ra Thanh Phong Bộ.", 
            rewardText: (p) => `+${1 * (p.rankIndex + 1)} Thân pháp`, 
            effect: (p) => p.eventSpdBonus += 1 * (p.rankIndex + 1) 
        },
        { 
            type: "rare", 
            text: "Phát hiện một tổ chim linh thiêng trên vách núi cao.", 
            rewardText: (p) => `+1 Trứng linh thú (Linh cấp)`, 
            effect: (p) => Game.addItem("pet_egg_linh", 1, true) 
        },
        { 
            type: "rare", 
            text: "Gặp được một tửu quán ven đường, chủ quán hào phóng tặng một vò rượu ngon.", 
            rewardText: (p) => `+1 Rượu Ngon`, 
            effect: (p) => Game.addItem("gift_wine", 1, true) 
        },
        { 
            type: "rare", 
            text: "Trong rừng sâu phát hiện một vò rượu lâu năm bị vùi lấp.", 
            rewardText: (p) => `+1 Rượu Ngon`, 
            effect: (p) => Game.addItem("gift_wine", 1, true) 
        },
        { 
            type: "rare", 
            text: "Giúp đỡ một lão già say rượu, ông ta tặng bạn một vò rượu quý để cảm ơn.", 
            rewardText: (p) => `+1 Rượu Ngon`, 
            effect: (p) => Game.addItem("gift_wine", 1, true) 
        },
        
        // --- SỰ CỐ (Incidents) ---
        { 
            type: "incident", 
            text: "Vấp phải đá, ngã sấp mặt.", 
            rewardText: "-10% HP", 
            effect: (p) => p.hp = Math.max(1, Math.floor(p.hp - p.hpMax * 0.1)) 
        },
        { 
            type: "incident", 
            text: "Lạc đường trong sương mù, tiêu hao tinh thần.", 
            rewardText: (p) => `-${Math.floor(GameData.ranks[p.rankIndex].expReq * 0.05)} Linh khí`, 
            effect: (p) => p.mana = Math.max(0, p.mana - Math.floor(GameData.ranks[p.rankIndex].expReq * 0.05)) 
        },
        { 
            type: "incident", 
            text: "Bị một con ong linh độc đốt.", 
            rewardText: "-15% HP, -5 Thể lực", 
            effect: (p) => { 
                p.hp = Math.max(1, Math.floor(p.hp - p.hpMax * 0.15)); 
                p.stamina = Math.max(0, p.stamina - 5); 
            } 
        },
        { 
            type: "incident", 
            text: "Gặp phải chướng khí độc hại.", 
            rewardText: "-15% HP hiện tại", 
            effect: (p) => p.hp = Math.max(1, Math.floor(p.hp * 0.85)) 
        },
        { 
            type: "incident", 
            text: "Bị trượt chân rơi xuống hố.", 
            rewardText: "-10 Thể lực", 
            effect: (p) => p.stamina = Math.max(0, p.stamina - 10) 
        },
        { 
            type: "incident", 
            text: "Bị một con khỉ linh tinh nghịch trộm mất túi đồ.", 
            rewardText: (p) => `-${50 + Math.floor(Math.pow(p.rankIndex, 1.5) * 5)} 💎 Linh Thạch`, 
            effect: (p) => p.spiritStone = Math.max(0, p.spiritStone - (50 + Math.floor(Math.pow(p.rankIndex, 1.5) * 5))) 
        }
    ],

    titles: {
        "none": { name: "Vô Danh Tiểu Tốt", color: "#888", desc: "Kẻ vô danh trên giang hồ.", buff: {}, rarity: "common", animation: "", conditionDesc: "Mặc định khi bắt đầu hành trình." },
        "novice": { name: "Sơ Nhập Tu Tiên", color: "#4caf50", desc: "Mới bước chân vào con đường tu luyện. Tăng <span style='color:#4caf50'>1%</span> công thủ.", buff: { atk: 0.01, def: 0.01 }, rarity: "uncommon", animation: "animate-title-glow-green", conditionDesc: "Đạt đến cảnh giới Luyện Khí Tầng 1." },
        "slime_slayer": { name: "Sát Thủ Linh Điệp", color: "#8bc34a", desc: "Kẻ thù của loài Linh Điệp. Tăng <span style='color:#4caf50'>3%</span> tấn công nhưng giảm <span style='color:#ff4444'>1%</span> phòng ngự.", buff: { atk: 0.03, def: -0.01 }, rarity: "uncommon", animation: "animate-title-glow-green", conditionDesc: "Tiêu diệt 100 Linh Điệp." },
        "wolf_hunter": { name: "Đồ Tể Hoang Lang", color: "#ff5722", desc: "Thợ săn sói lão luyện. Tăng <span style='color:#4caf50'>2%</span> thân pháp nhưng giảm <span style='color:#ff4444'>2%</span> sinh mệnh.", buff: { thanphap: 0.02, hpMax: -0.02 }, rarity: "uncommon", animation: "animate-title-glow-orange", conditionDesc: "Tiêu diệt 50 Hoang Lang." },
        "rich_man": { name: "Đại Gia Tu Tiên", color: "#ffeb3b", desc: "Tiền nhiều vô kể. Tăng <span style='color:#4caf50'>4%</span> may mắn nhưng giảm <span style='color:#ff4444'>2%</span> tấn công.", buff: { luk: 0.04, atk: -0.02 }, rarity: "rare", animation: "animate-title-glow-yellow", conditionDesc: "Sở hữu trên 10,000 Linh Thạch." },
        "destroyer": { name: "Kẻ Hủy Diệt", color: "#f44336", desc: "Sức mạnh kinh người. Tăng <span style='color:#4caf50'>10%</span> tấn công và phòng ngự nhưng giảm <span style='color:#ff4444'>6%</span> thân pháp.", buff: { atk: 0.1, def: 0.1, thanphap: -0.06 }, rarity: "epic", animation: "animate-title-glow-red", conditionDesc: "Đạt Lực Chiến trên 5,000." },
        "cultivation_genius": { name: "Thiên Tài Tu Luyện", color: "#00bcd4", desc: "Căn cốt phi phàm. Tăng <span style='color:#4caf50'>8%</span> linh lực nhưng giảm <span style='color:#ff4444'>4%</span> sinh mệnh.", buff: { mp: 0.08, hpMax: -0.04 }, rarity: "rare", animation: "animate-title-glow-blue", conditionDesc: "Đạt cảnh giới Trúc Cơ Kỳ." },
        "sect_loyalist": { name: "Đệ Tử Trung Thành", color: "#2196f3", desc: "Hết lòng vì môn phái. Tăng <span style='color:#4caf50'>3%</span> phòng ngự và <span style='color:#4caf50'>2%</span> may mắn.", buff: { def: 0.03, luk: 0.02 }, rarity: "rare", animation: "animate-title-glow-blue", conditionDesc: "Đạt 1,000 điểm cống hiến môn phái." },
        "blood_thirsty": { name: "Kẻ Khát Máu", color: "#d32f2f", desc: "Luôn tìm kiếm trận chiến. Tăng <span style='color:#4caf50'>20%</span> tấn công nhưng giảm <span style='color:#ff4444'>10%</span> phòng ngự.", buff: { atk: 0.2, def: -0.1 }, rarity: "epic", animation: "animate-title-glow-red-intense", conditionDesc: "Tiêu diệt 2,000 yêu thú." },
        "heaven_sovereign": { name: "Thiên Đế Chí Tôn", color: "#ffd700", desc: "Bậc chí tôn cai quản thiên địa. Tăng <span style='color:#4caf50'>40%</span> toàn diện chỉ số.", buff: { atk: 0.4, def: 0.4, hpMax: 0.4, mp: 0.4, thanphap: 0.2, luk: 0.2 }, rarity: "mythic", animation: "animate-title-glow-gold", conditionDesc: "Đạt cảnh giới Hóa Thần Kỳ." },
        
        // New Titles
        "monster_hunter": { name: "Thợ Săn Yêu Thú", color: "#4caf50", desc: "Tiêu diệt 1,000 quái vật. Tăng <span style='color:#4caf50'>5%</span> tấn công và thân pháp.", buff: { atk: 0.05, thanphap: 0.05 }, rarity: "rare", animation: "animate-title-glow-green", conditionDesc: "Tiêu diệt tổng cộng 1,000 yêu thú." },
        "invincible": { name: "Độc Cô Cầu Bại", color: "#ff9800", desc: "Thắng 50 trận liên tiếp. Tăng <span style='color:#4caf50'>15%</span> tấn công và <span style='color:#4caf50'>5%</span> may mắn.", buff: { atk: 0.15, luk: 0.05 }, rarity: "legendary", animation: "animate-title-glow-orange-pulse", conditionDesc: "Đạt chuỗi 50 trận thắng liên tiếp." },
        "god_of_slaughter": { name: "Sát Thần", color: "#ff0000", desc: "5,000 mạng hạ gục. Tăng <span style='color:#4caf50'>25%</span> tấn công nhưng giảm <span style='color:#ff4444'>15%</span> phòng ngự.", buff: { atk: 0.25, def: -0.15 }, rarity: "mythic", animation: "animate-title-glow-red-intense", conditionDesc: "Tiêu diệt tổng cộng 5,000 yêu thú." },
        "pill_master": { name: "Bậc Thầy Luyện Đan", color: "#8e24aa", desc: "Sử dụng 200 đan dược. Tăng <span style='color:#4caf50'>10%</span> hiệu quả hồi phục.", buff: { hp: 0.1, mp: 0.1 }, rarity: "rare", animation: "animate-title-glow-purple", conditionDesc: "Sử dụng tổng cộng 200 viên đan dược." },
        "heaven_luck": { name: "Vận Khí Nghịch Thiên", color: "#00e5ff", desc: "May mắn > 50. Tăng <span style='color:#4caf50'>15%</span> may mắn và <span style='color:#4caf50'>5%</span> thân pháp.", buff: { luk: 0.15, thanphap: 0.05 }, rarity: "legendary", animation: "animate-title-glow-cyan-sparkle", conditionDesc: "Chỉ số May Mắn cơ bản đạt trên 50." },
        "wanderer": { name: "Kẻ Lang Thang", color: "#795548", desc: "100 lần thám hiểm. Tăng <span style='color:#4caf50'>10%</span> thân pháp và <span style='color:#4caf50'>5%</span> thể lực.", buff: { thanphap: 0.1, staminaMax: 0.05 }, rarity: "rare", animation: "animate-title-glow-brown", conditionDesc: "Thực hiện thám hiểm 100 lần." },
        "sect_elder": { name: "Trưởng Lão Danh Dự", color: "#3f51b5", desc: "10,000 cống hiến. Tăng <span style='color:#4caf50'>10%</span> phòng ngự và <span style='color:#4caf50'>5%</span> linh lực.", buff: { def: 0.1, mp: 0.05 }, rarity: "epic", animation: "animate-title-glow-indigo", conditionDesc: "Đạt 10,000 điểm cống hiến môn phái." },
        "rebel": { name: "Kẻ Phản Nghịch", color: "#212121", desc: "Rời 3 môn phái. Tăng <span style='color:#4caf50'>10%</span> tấn công nhưng giảm <span style='color:#ff4444'>20%</span> danh vọng.", buff: { atk: 0.1 }, rarity: "rare", animation: "animate-title-glow-dark", conditionDesc: "Rời khỏi 3 môn phái khác nhau." },
        "beast_friend": { name: "Linh Thú Chi Hữu", color: "#ff4081", desc: "Sở hữu 3 linh thú. Tăng <span style='color:#4caf50'>10%</span> chỉ số từ linh thú.", buff: { petAtkBuff: 0.1, petDefBuff: 0.1 }, rarity: "rare", animation: "animate-title-glow-pink", conditionDesc: "Sở hữu ít nhất 3 linh thú trong túi đồ." }
    },

    dailyMissions: {
        meditate: { id: "meditate", name: "Tĩnh tâm tu luyện", desc: "Thực hiện tĩnh tâm tu luyện {target} lần để rèn luyện tâm tính.", target1: 20, target2: 30, baseReward: { spiritStone: 100, mana: 50 } },
        explore: { id: "explore", name: "Hoàn thành thám hiểm", desc: "Khám phá những vùng đất mới {target} lần để tìm kiếm cơ duyên.", target1: 10, target2: 15, baseReward: { spiritStone: 150, mana: 75 } },
        killBoss: { id: "killBoss", name: "Tiêu diệt Boss bất kỳ", desc: "Trừ hại cho dân, tiêu diệt {target} thủ lĩnh yêu thú hung hãn.", target1: 3, target2: 5, baseReward: { spiritStone: 300, mana: 150, equipment: true } },
        sectMission: { id: "sectMission", name: "Hoàn thành nhiệm vụ môn phái", desc: "Tận tâm vì môn phái, hoàn thành {target} ủy thác được giao.", target1: 10, target2: 15, baseReward: { spiritStone: 200, mana: 100, sectContribution: 50 } },
        giveGift: { id: "giveGift", name: "Tặng quà cho môn phái", desc: "Giao hảo với các môn phái bằng {target} món quà ý nghĩa.", target1: 2, target2: 3, baseReward: { spiritStone: 100, mana: 50, sectReputation: 100 } },
        feedPet: { id: "feedPet", name: "Cho Linh thú ăn", desc: "Chăm sóc linh thú của đạo hữu {target} lần để tăng tình cảm.", target1: 2, target2: 3, baseReward: { spiritStone: 50, mana: 25, items: [{ id: 'pet_food_basic', count: 2 }] } },
    }
};

window.GameData = GameData;
