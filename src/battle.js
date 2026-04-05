/**
 * battle.js - Hệ thống Chiến Đấu (Battle System)
 * Chuyên trách: Tính toán sát thương, hiệu ứng, vòng lặp chiến đấu và kết quả.
 */
const BattleSystem = (function() {
    
    // Bảng màu quý hiếm
    const rarityColors = {
        "none": "#888888",
        "common": "#ffffff", 
        "uncommon": "#4caf50", 
        "rare": "#2196f3", 
        "epic": "#a335ee", 
        "legendary": "#ff9800",
        "mythic": "#ff0000",
        "chaos": "#ff00ff",
        "mythic_broken": "#ff0000",
        "chaos_broken": "#ff00ff"
    };

    // Cấu hình các hiệu ứng xấu (Debuffs)
    const debuffConfigs = {
        Poison: { name: "Trúng Độc", icon: "🧪", color: "#a335ee", dot: 0.03, duration: 3000 },
        Burn:   { name: "Thiêu Đốt", icon: "🔥", color: "#ff4500", dot: 0.05, duration: 2000 },
        Stun:   { name: "Choáng",    icon: "💫", color: "#ffff00", dot: 0,    duration: 2000 },
        Freeze: { name: "Đóng Băng", icon: "❄️", color: "#00f2ff", dot: 0,    duration: 2000 },
        Silence:{ name: "Câm Lặng",  icon: "🔇", color: "#9e9e9e", dot: 0,    duration: 2000 },
        ArmorBreak: { name: "Phá Giáp", icon: "🛡️", color: "#ff5722", dot: 0, duration: 3000 },
        MinorArmorBreak: { name: "Phá Giáp Nhẹ", icon: "🛡️", color: "#ffab91", dot: 0, duration: 3000 },
        Weakness: { name: "Yếu Ớt", icon: "📉", color: "#795548", dot: 0, duration: 3000 },
        Weak:     { name: "Yếu Ớt", icon: "📉", color: "#795548", dot: 0, duration: 3000 },
        Confuse: { name: "Hỗn Loạn", icon: "🌀", color: "#ffeb3b", dot: 0, duration: 2000 },
        Bleed: { name: "Chảy Máu", icon: "🩸", color: "#ff1744", dot: 0.04, duration: 3000 },
        Blind: { name: "Mù", icon: "🕶️", color: "#607d8b", dot: 0, duration: 2000 },
        ThanphapDebuff: { name: "Giảm Thân Pháp", icon: "🕸️", color: "#9e9e9e", dot: 0, duration: 3000 },
        SpdDebuff:      { name: "Giảm Thân Pháp", icon: "🕸️", color: "#9e9e9e", dot: 0, duration: 3000 },
        Slow:           { name: "Giảm Thân Pháp", icon: "🕸️", color: "#9e9e9e", dot: 0, duration: 3000 },
        PetWeakened: { name: "Suy Yếu (Linh Thú)", icon: "📉", color: "#795548", dot: 0, duration: 5000, description: "Linh thú kiệt sức, giảm 50% sức mạnh trong 5 giây." }
    };

    // Cấu hình các hiệu ứng tốt (Buffs)
    const buffConfigs = {
        Invincible:    { name: "Vô Địch", icon: "🛡️", color: "#ffd700", duration: 3000 },
        CCImmune:      { name: "Kháng Khống", icon: "✨", color: "#00f2ff", duration: 2000 },
        AtkBuff:       { name: "Tăng Công", icon: "⚔️", color: "#ff4444", duration: 5000 },
        DefBuff:       { name: "Tăng Thủ", icon: "🛡️", color: "#2196f3", duration: 5000 },
        ShieldAura:    { name: "Hộ Thể Kim Quang", icon: "🛡️", color: "#ffd700", duration: 5000 },
        PowerAura:     { name: "Tiên Nhân Hào Quang", icon: "✨", color: "#00f2ff", duration: 5000 },
        EvilReflect:   { name: "Ma Quang Phản Chấn", icon: "🛡️", color: "#9c27b0", duration: 4000 },
        VilePoison:    { name: "Vạn Độc Hào Quang", icon: "🧪", color: "#4caf50", duration: 5000 },
        ShieldBuff:    { name: "Linh lực hộ thể", icon: "🛡️", color: "#2196f3", duration: 10000 },
        LuckBuff:      { name: "Phúc Tinh", icon: "🍀", color: "#ffeb3b", duration: 5000 },
        ThanphapBuff:       { name: "Tăng Thân Pháp", icon: "⚡", color: "#ffeb3b", duration: 5000 },
        SpdBuff:            { name: "Tăng Thân Pháp", icon: "⚡", color: "#ffeb3b", duration: 5000 },
        BossOffenseAura: { name: "Hào Quang Cuồng Bạo cấp cao", icon: "💢", color: "#ff4444", duration: 10000 },
        BossDefenseAura: { name: "Hào Quang Kiên Cố cấp cao", icon: "🛡️", color: "#2196f3", duration: 10000 },
        BossThanphapAura:   { name: "Hào Quang Thân Pháp cấp cao", icon: "⚡", color: "#ffeb3b", duration: 10000 },
        BossImmuneAura:  { name: "Hào Quang Bất Khuất cấp cao", icon: "✨", color: "#00f2ff", duration: 10000 }
    };

    return {
        currentEnemy: null,
        turnCount: 0,

        getSkillCategory: function(skill) {
            if (!skill) return 'other';
            const desc = (skill.desc || "").toLowerCase();
            const name = (skill.name || "").toLowerCase();
            
            if (skill.lifesteal || desc.includes("hồi phục") || desc.includes("hồi hp") || desc.includes("hồi xuân") || desc.includes("hộ thể") || desc.includes("giáp") || desc.includes("hấp thụ")) {
                return 'defense';
            }
            if (skill.debuff === 'Stun' || skill.debuff === 'Silence' || skill.debuff === 'Blind' || skill.debuff === 'Confuse' || desc.includes("choáng") || desc.includes("câm lặng") || desc.includes("mù") || desc.includes("hỗn loạn")) {
                return 'control';
            }
            if (skill.debuff === 'Weakness' || skill.debuff === 'Poison' || skill.debuff === 'Bleed' || skill.debuff === 'Burn' || desc.includes("yếu ớt") || desc.includes("độc") || desc.includes("chảy máu") || desc.includes("thiêu đốt") || desc.includes("giảm thủ")) {
                return 'debuff';
            }
            if (desc.includes("tăng") && (desc.includes("tấn công") || desc.includes("thân pháp") || desc.includes("bạo kích"))) {
                return 'buff';
            }
            return 'attack';
        },

        /**
         * Lấy thông báo tấn công ngẫu nhiên cho người chơi
         */
        getPlayerAttackMsg: function() {
            const msgs = [
                "vung kiếm tấn công",
                "xoay người chém mạnh",
                "đâm một nhát chí mạng",
                "tung chưởng lực tấn công",
                "vận công đánh ra một kích",
                "thi triển kiếm chiêu tấn công",
                "nhảy lên không trung chém xuống"
            ];
            return msgs[Math.floor(Math.random() * msgs.length)];
        },

        /**
         * Lấy thông báo tấn công ngẫu nhiên cho quái vật dựa trên loài
         */
        getEnemyAttackMsg: function(enemy) {
            const name = (enemy.name || "").toLowerCase();
            const id = (enemy.id || "").toLowerCase();
            
            // Các nhóm quái vật
            if (name.includes("lang") || name.includes("hổ") || name.includes("thú") || id.includes("wolf") || id.includes("tiger")) {
                const msgs = [
                    "dùng móng vuốt sắc lẹm vồ tới",
                    "făng nanh cắn xé",
                    "lao lên cắn mạnh",
                    "quật đuôi tấn công",
                    "gầm gừ lao tới vồ lấy"
                ];
                return msgs[Math.floor(Math.random() * msgs.length)];
            }
            
            if (name.includes("điệp") || name.includes("biên") || name.includes("điêu") || id.includes("slime") || id.includes("bat") || id.includes("eagle")) {
                const msgs = [
                    "đập mạnh đôi cánh tạo ra kình lực",
                    "dùng mỏ nhọn mổ tới",
                    "lao xuống từ trên cao tấn công",
                    "vỗ cánh tạo ra linh áp chấn động",
                    "lao tới húc mạnh"
                ];
                return msgs[Math.floor(Math.random() * msgs.length)];
            }
            
            if (name.includes("khô lâu") || name.includes("binh") || name.includes("ma") || id.includes("skeleton") || id.includes("demon")) {
                const msgs = [
                    "vung vũ khí tấn công",
                    "tung ra một đòn nặng nề",
                    "vung tay đánh mạnh",
                    "càn quét tấn công",
                    "vận ma lực tấn công"
                ];
                return msgs[Math.floor(Math.random() * msgs.length)];
            }

            if (name.includes("thần") || name.includes("tiên") || name.includes("sứ") || id.includes("god") || id.includes("angel") || id.includes("succubus")) {
                const msgs = [
                    "thi triển linh lực tấn công",
                    "tung ra một chưởng đầy uy lực",
                    "vẫy tay tạo ra hào quang tấn công",
                    "niệm chú phóng ra linh quang",
                    "nhìn chằm chằm gây áp lực tinh thần"
                ];
                return msgs[Math.floor(Math.random() * msgs.length)];
            }

            // Mặc định
            const defaultMsgs = [
                "lao tới tấn công",
                "tung đòn công kích",
                "áp sát tấn công",
                "vận lực đánh tới"
            ];
            return defaultMsgs[Math.floor(Math.random() * defaultMsgs.length)];
        },

        /**
         * Tính toán giảm sát thương theo % từ chỉ số Phòng Ngự
         * - 0 Def -> 0% giảm
         * - 0 ~ 25%: Dễ đạt được
         * - 26 ~ 40%: Chậm hơn
         * - 41 ~ 60%: Rất chậm
         * - 61 ~ 65%: Cực chậm
         * - 66 ~ 69%: Vô cùng chậm
         * - 70%: Siêu siêu khó, gần như không thể
         */
        calcDamageReduction: function(def) {
            if (!def || def <= 0) def = 0;
            const maxReduction = 0.70;
            const k = 300; // Hằng số điều chỉnh độ dốc
            let reduction = maxReduction * (def / (def + k));
            
            return Math.min(0.6999, reduction); // Gần như không thể chạm 70%
        },

        /**
         * Lấy tổng chỉ số của người chơi (bao gồm trang bị, kỹ năng, linh thú, danh hiệu)
         */
        getPlayerTotalStats: function(proxy) {
            if (typeof Game === 'undefined') return { atk: 0, def: 0, thanphap: 0, luk: 0, hpMax: 1, mpMax: 1, staminaMax: 1, reflect: 0, dodge: 0 };
            
            const totals = Game.getTotals();
            
            // Chỉ số phản đòn và né tránh (Battle-only)
            let reflect = 0;
            let dodge = this.calcDodgeChance(totals.totalThanphap);
            
            // Kỹ năng bị động có thể có phản đòn/né tránh
            if (proxy.skills && typeof GameData !== 'undefined') {
                proxy.skills.forEach(sid => {
                    const s = GameData.skills[sid];
                    if (s && s.type === 'passive') {
                        if (s.reflect) reflect += s.reflect;
                        if (s.dodge) dodge += s.dodge;
                    }
                });
            }
            
            // Buff chiến đấu có thể có phản đòn
            if (proxy.activeBuffs) {
                proxy.activeBuffs.forEach(b => {
                    if (b.type === "EvilReflect") reflect += 0.35;
                });
            }

            return {
                atk: totals.totalAtk,
                def: totals.totalDef,
                thanphap: totals.totalThanphap,
                luk: totals.totalLuk,
                hpMax: totals.totalHpMax,
                mpMax: totals.maxMp,
                staminaMax: totals.totalStaminaMax,
                reflect: reflect,
                dodge: dodge
            };
        },

        /**
         * Tính toán tỉ lệ né tránh từ chỉ số Thân Pháp
         */
        calcDodgeChance: function(thanphap) {
            const baseDodge = 0.05; // Cơ bản 5%
            if (!thanphap || thanphap <= 0) return baseDodge;
            const maxBonusDodge = 0.30; // Tối đa thêm 30% né tránh từ Thân pháp (Tổng 35%)
            const k = 500; // Hằng số điều chỉnh độ dốc
            return baseDodge + (maxBonusDodge * (thanphap / (thanphap + k)));
        },

        /**
         * Tính toán tỉ lệ bạo kích từ chỉ số May Mắn
         */
        calcCritChance: function(luk) {
            const baseCrit = 0.05; // Cơ bản 5%
            if (!luk || luk <= 0) return baseCrit;
            const maxBonusCrit = 0.40; // Tối đa thêm 40% bạo kích từ May mắn (Tổng 45%)
            const k = 1000; // Hằng số điều chỉnh
            return baseCrit + (maxBonusCrit * (luk / (luk + k)));
        },

        /**
         * Tính toán tốc độ tấn công (ms) từ chỉ số Thân Pháp
         */
        calcAttackSpeed: function(thanphapValue) {
            const K = 200; 
            const MIN_SPEED = 1000; // Tối đa 1 giây (1000ms)
            const BASE_OFFSET = 2000;
            return MIN_SPEED + (BASE_OFFSET * (K / (K + (thanphapValue || 0))));
        },

        /**
         * Kiểm tra xem có nên ẩn thông tin kẻ thù không
         */
        shouldHideEnemyStats: function(enemy) {
            if (!enemy) return false;
            const proxy = typeof Game !== 'undefined' ? Game.getProxy() : null;
            if (!proxy) return false;

            const playerRank = proxy.rankIndex || 0;
            const enemyRank = enemy.rankIndex || 0;
            const rankDiff = Math.abs(playerRank - enemyRank);
            
            const playerPower = proxy.power || 0;
            // Ước tính lực chiến kẻ thù tương đương công thức trong core.js
            const enemyPower = (enemy.atk * 2.5 + (enemy.def || 0) * 1.8 + (enemy.thanphap || 1) * 4 + (enemy.hp / 10) * 0.15) * (enemy.isBoss ? 2 : 1);
            
            // Nếu là NPC môn phái (có sectName hoặc trong tên có dấu ngoặc), giảm khả năng ẩn thông tin
            const isSectNPC = enemy.name && (enemy.name.includes("(") || enemy.name.includes("Sát Thủ"));
            const maxRankDiff = isSectNPC ? 20 : 10;

            // Nếu cách nhau quá xa hoặc lực chiến chênh lệch cực lớn (gấp 10 lần)
            return rankDiff > maxRankDiff || (playerPower > 0 && (enemyPower / playerPower > 10 || playerPower / enemyPower > 10));
        },

        /**
         * Hiển thị thông tin chi tiết của kẻ thù
         */
        showEnemyInfo: function(enemy) {
            if (!enemy) return;

            const hideStats = this.shouldHideEnemyStats(enemy);

            const atkSpeedMs = this.calcAttackSpeed(enemy.thanphap || 1);
            const atkSpeedSec = (atkSpeedMs / 1000).toFixed(2);
            
            let skillsHtml = (enemy.skills || []).map(s => {
                const sData = GameData.skills[s.id] || s;
                const dConf = debuffConfigs[sData.debuff];
                const debuffName = dConf ? dConf.name : sData.debuff;
                const debuffText = (sData.debuff && !hideStats) ? `<br><small style="color:#a335ee">✨ Hiệu ứng: ${debuffName}</small>` : "";
                const isMysterious = enemy.name && (enemy.name.includes("Bí Ẩn") || enemy.name.includes("Vô Danh"));
                const name = (hideStats && isMysterious) ? "??????" : sData.name;
                return `<div style="background:#222; padding:8px; border-radius:4px; margin-bottom:5px; border-left:3px solid #d4af37">
                            <b style="color:#ffeb3b">${name}</b> ${hideStats ? '' : `(x${sData.damageMult || 1.0} ST)`}${debuffText}
                            <div style="font-size:0.75rem; color:#aaa; margin-top:2px;">${hideStats ? '???' : (sData.desc || '')}</div>
                        </div>`;
            }).join('') || "<i>Yêu thú này chỉ biết dùng bản năng (Đánh thường)</i>";
            
            const content = `
                <div style="text-align:left; line-height:1.6">
                    <p style="color:#aaa; font-style:italic; margin-bottom:12px;">"${enemy.desc || 'Sinh vật thần bí.'}"</p>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; background:#111; padding:10px; border-radius:5px; border:1px solid #333">
                        <span style="color:#ff4444">🩸 Máu: <b>${hideStats ? '???' : Math.max(0, enemy.hp).toLocaleString()}</b></span>
                        <span style="color:#00e5ff">🛡️ Hộ thể: <b>${hideStats ? '???' : (enemy.maxShield || 0).toLocaleString()}</b></span>
                        <span style="color:#ff9800">⚔️ Công: <b>${hideStats ? '???' : Math.max(0, enemy.atk).toLocaleString()}</b></span>
                        <span style="color:#2196f3">🛡️ Thủ: <b>${hideStats ? '???' : Math.max(0, (enemy.def || 0)).toLocaleString()}</b></span>
                        <span style="color:#4caf50">⚡ Thân pháp: <b>${hideStats ? '???' : Math.max(0, (enemy.thanphap || 1)).toLocaleString()}</b></span>
                        <span style="color:#ffeb3b">⏳ Tốc độ: <b>${hideStats ? '???' : atkSpeedSec + 's/lần'}</b></span>
                    </div>
                    ${hideStats ? `<p style="color:#ff4444; font-size:0.8rem; margin-top:10px; text-align:center;">⚠️ <i>Cảnh giới hoặc lực chiến chênh lệch quá xa, không thể nhìn thấu thực lực đối phương!</i></p>` : ''}
                    <h4 style="margin:15px 0 10px 0; color:#d4af37; border-bottom:1px solid #444; padding-bottom:5px;">Tuyệt kỹ Yêu thú</h4>
                    ${enemy.isBoss ? `
                        <div style="background:rgba(255,152,0,0.1); padding:8px; border-radius:4px; margin-bottom:10px; border:1px solid rgba(255,152,0,0.3);">
                            <b style="color:#ff9800; font-size:0.85rem;">✨ NỘI TẠI BOSS:</b>
                            <div style="font-size:0.75rem; color:#eee; margin-top:4px;">
                                • <b>Kháng Tính:</b> ${hideStats ? '???' : 'Giảm 50% thời gian hiệu lực của mọi hiệu ứng xấu.'}
                            </div>
                            <div style="font-size:0.75rem; color:#eee; margin-top:2px;">
                                • <b>Nghịch Cảnh Hào Quang cấp cao:</b> ${hideStats ? '???' : 'Khi Sinh lực dưới 50%, bộc phát hào quang tăng mạnh thuộc tính trong 10s.'}
                            </div>
                        </div>
                    ` : ""}
                    ${skillsHtml}
                </div>
            `;
            if (typeof UI !== 'undefined') UI.openModal(enemy.name, content, false);
        },

        /**
         * Bắt đầu trận chiến
         * @param {Object} proxy - State của game
         * @param {Object} enemy - Dữ liệu kẻ thù
         * @param {Function} onComplete - Callback khi kết thúc (win: boolean)
         */
        start: function(proxy, enemy, onComplete) {
            // Kiểm tra kỹ năng chủ động trước khi bắt đầu trận chiến (ngoại trừ Thiên Kiếp)
            const activeSkills = proxy.skills.filter(sid => {
                const s = GameData.skills[sid];
                return s && s.type === 'active';
            });

            const toggledActiveSkills = proxy.toggledSkills.filter(sid => {
                const s = GameData.skills[sid];
                return s && s.type === 'active';
            });

            const isAutoSkillEnabled = (typeof Game !== 'undefined') ? Game.isAutoSkillEnabled() : true;

            if (!enemy.isTribulation && activeSkills.length > 0 && (!isAutoSkillEnabled || toggledActiveSkills.length === 0) && (typeof ExploreSystem === 'undefined' || !ExploreSystem.isExploring())) {
                if (typeof UI !== 'undefined' && UI.promptEnableSkills) {
                    UI.promptEnableSkills(() => {
                        this.onComplete = onComplete;
                        this.runBattleLoop(proxy, enemy);
                    });
                    return;
                }
            }

            this.onComplete = onComplete;
            this.runBattleLoop(proxy, enemy);
        },

        /**
         * Vòng lặp chính của trận chiến
         */
        runBattleLoop: function(proxy, enemy) {
            this.currentEnemy = enemy;
            if (typeof Game !== 'undefined') {
                Game.isInBattle = true;
                proxy.isStatsFrozen = true;
                if (typeof UI !== 'undefined') UI.showTab('battle');
            }
            
            // Ghi lại hành động chiến đấu
            if (typeof Game !== 'undefined') {
                Game.recordAction(proxy.activePetId);
            }
            
            // Nhật ký tu tiên: Ghi lại bắt đầu trận chiến
            if (typeof UI !== 'undefined') {
                const battleId = UI.currentBattleId || Date.now();
                UI.addLog(`⚔️ <a href="#" onclick="UI.viewBattleHistory(${battleId}); return false;" style="color: inherit; text-decoration: underline;"><b>Bắt đầu trận chiến:</b></a> Đạo hữu đối đầu với <b style="color:#ff4444">${enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name}</b>!`, true);
            }

            const pStats = this.getPlayerTotalStats(proxy);
            const maxHp = pStats.hpMax;
            const maxMp = pStats.mpMax;
            
            proxy.battleMaxHp = maxHp;
            
            const enemyMaxHp = enemy.maxHp || enemy.hp;
            enemy.maxHp = enemyMaxHp;
            const enemyMaxMp = enemy.mp || 50;
            enemy.maxMp = enemyMaxMp;
            enemy.currentMp = enemyMaxMp;
            
            enemy.skillCDs = {};
            if (enemy.skills) {
                enemy.skills.forEach(s => enemy.skillCDs[s.id] = 0);
            }
            enemy.activeBuffs = enemy.activeBuffs || [];
            enemy.activeDebuffs = enemy.activeDebuffs || [];

            const currentMpBefore = proxy.currentMp || 0;
            proxy.currentMp = Math.min(maxMp, currentMpBefore);
            proxy.skillCDs = {};
            if (proxy.skills) {
                proxy.skills.forEach(sId => proxy.skillCDs[sId] = 0);
            }

            if (typeof UI !== 'undefined' && UI.initBattle) UI.initBattle(enemy);
            
            // Hiển thị kỹ năng ban đầu
            if (typeof UI !== 'undefined' && UI.renderSkillStatus) {
                UI.renderSkillStatus('player', proxy.skills, proxy.skillCDs);
                UI.renderSkillStatus('enemy', enemy.skills, enemy.skillCDs);
            }
            
            // Khởi tạo Pet cho trận chiến
            let pet = null;
            if (typeof PetSystem !== 'undefined' && proxy.activePetId) {
                pet = PetSystem.initPetForBattle(proxy.activePetId, proxy.rankIndex || 0, proxy.pets);
                console.log("Battle: Initialized pet:", pet);
                if (typeof UI !== 'undefined' && UI.initPetUI) UI.initPetUI(pet);
            } else if (typeof UI !== 'undefined' && UI.initPetUI) {
                UI.initPetUI(null);
            }

            proxy.activeDebuffs = [];
            enemy.activeDebuffs = enemy.activeDebuffs || [];
            proxy.activeBuffs = [];
            enemy.activeBuffs = enemy.activeBuffs || [];
            proxy.pillCooldowns = proxy.pillCooldowns || {};
            proxy.potionSlotLastUsed = {}; // Theo dõi thời gian dùng của từng ô thiết lập
            
            // Khởi tạo tỉ lệ bị tấn công
            proxy.targetProb = pet ? 0.5 : 1.0;
            if (pet) pet.targetProb = 0.5;
            
            // Thanh linh lực hộ thể: 
            // Người chơi luôn có (Khởi tạo 10% Linh lực hộ thể tối đa, tối đa 50% Linh lực tối đa)
            const maxShield = Math.floor((Number(maxMp) || 0) * 0.5);
            const initialShield = Math.floor(maxShield * 0.1);
            proxy.shield = initialShield;
            proxy.maxShield = maxShield; // Lưu lại maxShield cho người chơi
            console.log(`Battle: Khởi tạo shield cho người chơi: ${initialShield}/${maxShield}`);
            
            // Quái vật: Linh lực hộ thể tối đa bằng 50% Linh lực tối đa, khởi tạo 10% maxShield
            enemy.maxShield = Math.floor((enemy.maxMp || 100) * 0.5);
            enemy.shield = Math.floor(enemy.maxShield * 0.1);
            console.log(`Battle: Khởi tạo shield cho kẻ địch: ${enemy.shield}/${enemy.maxShield}`);
            
            proxy.chargingSkill = null;
            this.turnCount = 0;
            
            const delay = enemy.isTribulation ? 0 : 1200;
            setTimeout(() => {
                let lastTick = Date.now();
                let pTimer = 0; 
                let eTimer = 0; 
                let petTimer = 0;
                let eSkillTimer = 3000; 
                let shieldRegenTimer = 0;

                const loop = setInterval(() => {
                const now = Date.now();
                const delta = now - lastTick;
                lastTick = now;

                if (proxy.hp <= 0 || enemy.hp <= 0) {
                    clearInterval(loop);
                    this.resolveBattle(proxy, enemy, pet);
                    return;
                }

                const pStats = this.getPlayerTotalStats(proxy);
                const eStats = this.getEnemyTotalStats(enemy);
                const playerAtkSpd = this.calcAttackSpeed(pStats.thanphap);
                const enemyAtkSpd = this.calcAttackSpeed(eStats.thanphap);
                // const petAtkSpd = pet ? this.calcAttackSpeed(pet.thanphap) : 999999;

                for (let s in proxy.skillCDs) if (proxy.skillCDs[s] > 0) proxy.skillCDs[s] -= delta;
                for (let s in enemy.skillCDs) if (enemy.skillCDs[s] > 0) enemy.skillCDs[s] -= delta;
                if (pet && pet.currentCooldowns) {
                    for (let s in pet.currentCooldowns) if (pet.currentCooldowns[s] > 0) pet.currentCooldowns[s] -= delta;
                }
                
                // Linh lực hồi phục trong chiến đấu (1.5% mỗi giây = 0.15% mỗi 100ms)
                proxy.currentMp = Math.min(maxMp, proxy.currentMp + (maxMp * 0.0015));
                enemy.currentMp = Math.min(enemy.maxMp, enemy.currentMp + (enemy.maxMp * 0.0015));
                if (pet && pet.hp > 0) {
                    pet.mp = Math.min(pet.mpMax, pet.mp + (pet.mpMax * 0.0015));
                }

                // Hồi phục Linh lực hộ thể (1% Linh lực tối đa mỗi giây, tối đa 50%) và Thể lực (1% mỗi giây)
                shieldRegenTimer += delta;
                if (shieldRegenTimer >= 1000) {
                    const shieldRegen = Math.max(1, Math.floor(maxMp * 0.01));
                    // Giới hạn hồi phục là maxShield (50% maxMp)
                    proxy.shield = Math.min(proxy.maxShield || (maxMp * 0.5), (proxy.shield || 0) + shieldRegen);

                    // Hồi phục Thể lực 0.5% mỗi giây
                    const staminaRegen = Math.max(1, Math.floor(pStats.staminaMax * 0.005));
                    proxy.stamina = Math.min(pStats.staminaMax, (proxy.stamina || 0) + staminaRegen);

                    // Hồi phục Thể lực cho Linh thú 1% mỗi giây
                    if (pet && pet.hp > 0) {
                        const petStaminaRegen = Math.max(1, Math.floor(pet.staminaMax * 0.01));
                        pet.stamina = Math.min(pet.staminaMax, (pet.stamina || 0) + petStaminaRegen);
                    }

                    // Hồi phục Hộ thể cho kẻ thù (1% Linh lực tối đa mỗi giây)
                    const enemyMaxShield = enemy.maxShield || 0;
                    if (enemyMaxShield > 0) {
                        const enemyShieldRegen = Math.max(1, Math.floor(enemy.maxMp * 0.01));
                        enemy.shield = Math.min(enemyMaxShield, (enemy.shield || 0) + enemyShieldRegen);
                    }

                    // Hồi phục Hộ thể cho Linh thú (1% Linh lực tối đa mỗi giây)
                    if (pet && pet.hp > 0 && pet.shieldMax > 0) {
                        const petShieldRegen = Math.max(1, Math.floor(pet.mpMax * 0.01));
                        pet.shield = Math.min(pet.shieldMax, (pet.shield || 0) + petShieldRegen);
                    }

                    shieldRegenTimer = 0;
                }

                this.processEffects(proxy, "player", now);
                this.processEffects(enemy, "enemy", now);

                // Tự động sử dụng đan dược (Chạy mỗi frame để có thể dùng khi bị khống chế)
                const potionSettings = (typeof Game !== 'undefined') ? Game.getPotionSettings() : { slots: [] };
                if (potionSettings.slots && potionSettings.slots.length > 0) {
                    for (let i = 0; i < potionSettings.slots.length; i++) {
                        const slot = potionSettings.slots[i];
                        if (!slot.enabled || !slot.pillId) continue;

                        let shouldUse = false;
                        const condition = slot.condition || 'hp_low';

                        if (condition === 'hp_low') {
                            if ((proxy.hp / maxHp) * 100 <= slot.threshold) shouldUse = true;
                        } else if (condition === 'mp_low') {
                            if ((proxy.currentMp / maxMp) * 100 <= (slot.threshold || 20)) shouldUse = true;
                        } else if (condition === 'battle_start') {
                            if (this.turnCount === 0 && !proxy.potionSlotLastUsed[i]) shouldUse = true;
                        } else if (condition === 'player_cc') {
                            const isCCed = proxy.activeDebuffs.some(d => ['Stun', 'Freeze', 'Confuse', 'Silence', 'Paralyze'].includes(d.type));
                            if (isCCed) shouldUse = true;
                        } else if (condition === 'interval') {
                            const intervalMs = (slot.interval || 10) * 1000;
                            const lastUsed = proxy.potionSlotLastUsed[i] || 0;
                            if (now - lastUsed >= intervalMs) shouldUse = true;
                        }
                        
                        if (shouldUse) {
                            const pillCount = (typeof BagSystem !== 'undefined') ? BagSystem.getItemCount(slot.pillId) : 0;
                            if (pillCount > 0 && (typeof Game === 'undefined' || Game.canUsePill(slot.pillId))) {
                                const pillData = GameData.items[slot.pillId];
                                if (pillData && pillData.effect) {
                                    const msg = pillData.effect(proxy);
                                    if (typeof Game !== 'undefined') {
                                        if (pillData.pillCategory) proxy.pillCooldowns[pillData.pillCategory] = now;
                                    }
                                    proxy.potionSlotLastUsed[i] = now;
                                    if (typeof BagSystem !== 'undefined') BagSystem.removeItemsById(slot.pillId, 1);
                                    if (typeof UI !== 'undefined') UI.addBattleLog(msg, "✨ Hệ thống");
                                    
                                    // Chỉ dùng 1 viên mỗi frame để tránh spam
                                    break; 
                                }
                            }
                        }
                    }
                }

                if (pet && pet.hp > 0) {
                    this.processEffects(pet, "pet", now);
                }

                // Cập nhật Shield trên UI
                if (typeof UI !== 'undefined') {
                    UI.updateBar('player-shield', proxy.shield || 0, proxy.maxShield || (maxMp * 0.5));
                    UI.updateBar('enemy-shield', enemy.shield || 0, enemy.maxShield || 0);
                    if (pet && pet.hp > 0) {
                        UI.updatePetUI(pet);
                    }
                }

                // Kiểm tra nội tại Boss (HP < 50%)
                if (enemy.isBoss && !enemy.passiveTriggered && enemy.hp < enemyMaxHp * 0.5) {
                    enemy.passiveTriggered = true;
                    this.triggerBossPassive(enemy);
                }

                // Xử lý tụ lực hoặc tăng timer cho người chơi
                if (proxy.chargingSkill) {
                    if (!this.isStunned(proxy)) {
                        proxy.chargingSkill.timeLeft -= delta;
                        
                        // Cập nhật thanh tụ lực
                        const chargeContainer = document.getElementById('charge-progress-container');
                        const chargeBar = document.getElementById('charge-progress-bar');
                        if (chargeContainer && chargeBar) {
                            chargeContainer.style.display = 'block';
                            const percent = Math.max(0, Math.min(100, (1 - proxy.chargingSkill.timeLeft / proxy.chargingSkill.totalTime) * 100));
                            chargeBar.style.width = `${percent}%`;
                        }

                        if (proxy.chargingSkill.timeLeft <= 0) {
                            if (chargeContainer) chargeContainer.style.display = 'none';
                            this.executeChargedSkill(proxy, enemy);
                        }
                    } else {
                        // Bị khống chế khi đang tụ lực, hủy chiêu
                        UI.addBattleLog(`bị khống chế, chiêu thức ${proxy.chargingSkill.name} bị gián đoạn!`, "⚠️ Bạn");
                        proxy.chargingSkill = null;
                        const chargeContainer = document.getElementById('charge-progress-container');
                        if (chargeContainer) chargeContainer.style.display = 'none';
                    }
                } else {
                    const chargeContainer = document.getElementById('charge-progress-container');
                    if (chargeContainer) chargeContainer.style.display = 'none';
                    pTimer += delta;
                }

                eTimer += delta;
                eSkillTimer += delta;

                // Lượt của Pet
                if (pet && pet.hp > 0) {
                    // Kiểm tra mở khóa kỹ năng và gỡ buff bù đắp
                    const petLevel = pet.level || 1;
                    const signatureSkills = {
                        "Thiên cấp": "skill_pet_thunder_strike",
                        "Thần cấp": "skill_pet_phoenix_flame",
                        "Cực phẩm cấp": "skill_pet_dragon_breath"
                    };
                    const signatureSkillId = signatureSkills[pet.rank];
                    if (signatureSkillId && !PetSystem.isSkillLocked(signatureSkillId, petLevel)) {
                        // Nếu đã mở khóa, gỡ buff bù đắp
                        const buffIndex = pet.activeBuffs.findIndex(b => b.type === "PetCompensatoryBuff");
                        if (buffIndex !== -1) {
                            const buff = pet.activeBuffs[buffIndex];
                            pet.activeBuffs.splice(buffIndex, 1);
                            UI.addLog(`✨ Linh thú <b style="color:#ffeb3b">${pet.displayName}</b> đã mở khóa kỹ năng <b style="color:#ff4081">${GameData.petSkills[signatureSkillId].name}</b>! Buff bù đắp đã biến mất.`);
                        }
                    }

                    // Xử lý tụ lực kỹ năng của pet
                    if (pet.chargingSkill) {
                        if (!this.isStunned(pet) && !this.isConfused(pet)) {
                            pet.chargingSkill.timeLeft -= delta;
                            
                            // Cập nhật thanh tụ lực pet (nếu có UI)
                            const petChargeBar = document.getElementById('pet-charge-progress-bar');
                            const petChargeContainer = document.getElementById('pet-charge-progress-container');
                            if (petChargeBar && petChargeContainer) {
                                petChargeContainer.style.display = 'block';
                                const percent = Math.max(0, Math.min(100, (1 - pet.chargingSkill.timeLeft / pet.chargingSkill.totalTime) * 100));
                                petChargeBar.style.width = `${percent}%`;
                            }

                            if (pet.chargingSkill.timeLeft <= 0) {
                                if (petChargeContainer) petChargeContainer.style.display = 'none';
                                const battleLog = [];
                                const petResult = PetSystem.processPetTurn(pet, enemy, battleLog, proxy);
                                let shieldLog = "";
                                if (petResult && petResult.damage > 0) {
                                    shieldLog = this.applyDamage(enemy, petResult.damage, "enemy");
                                }
                                if (battleLog.length > 0 && shieldLog) {
                                    battleLog[battleLog.length - 1] += shieldLog;
                                }
                                battleLog.forEach(log => UI.addBattleLog(log, `[Linh Thú] ${pet.displayName || pet.name}`));
                                if (typeof UI !== 'undefined') UI.updatePetUI(pet);
                            }
                        } else {
                            // Bị khống chế khi đang tụ lực
                            UI.addBattleLog(`bị khống chế, chiêu thức ${pet.chargingSkill.name} bị gián đoạn!`, `⚠️ [Linh Thú] ${pet.displayName}`);
                            pet.chargingSkill = null;
                            const petChargeContainer = document.getElementById('pet-charge-progress-container');
                            if (petChargeContainer) petChargeContainer.style.display = 'none';
                        }
                    } else {
                        const petChargeContainer = document.getElementById('pet-charge-progress-container');
                        if (petChargeContainer) petChargeContainer.style.display = 'none';

                        petTimer += delta;
                        const petAtkSpd = this.calcAttackSpeed(pet.thanphap);
                        if (petTimer >= petAtkSpd) {
                            if (this.isStunned(pet)) {
                                const stunEffect = pet.activeDebuffs.find(d => d.type === "Stun" || d.type === "Freeze");
                                const effectName = stunEffect ? stunEffect.name : "khống chế";
                                const timeLeft = Math.ceil((stunEffect.expiry - Date.now()) / 1000);
                                UI.addBattleLog(`đang bị <b>${effectName}</b>, không thể hành động! (Còn ${timeLeft} giây)`, `[Linh Thú] ${pet.displayName || pet.name}`);
                            } else {
                                // Mỗi lượt hành động tiêu tốn 1 thể lực
                                pet.stamina = Math.max(0, pet.stamina - 1);
                                
                                const battleLog = [];
                                const petResult = PetSystem.processPetTurn(pet, enemy, battleLog, proxy);
                                let shieldLog = "";
                                if (petResult && petResult.damage > 0) {
                                    shieldLog = this.applyDamage(enemy, petResult.damage, "enemy");
                                }
                                
                                // Gộp shieldLog vào dòng cuối cùng của battleLog
                                if (battleLog.length > 0 && shieldLog) {
                                    battleLog[battleLog.length - 1] += shieldLog;
                                }
                                
                                battleLog.forEach(log => UI.addBattleLog(log, `[Linh Thú] ${pet.displayName || pet.name}`));
                                if (typeof UI !== 'undefined') UI.updatePetUI(pet);
                            }
                            petTimer = 0;
                        }
                    }
                }

                if (pTimer >= playerAtkSpd && !proxy.chargingSkill) { 
                    if (this.isStunned(proxy)) {
                        const stunEffect = proxy.activeDebuffs.find(d => d.type === "Stun" || d.type === "Freeze");
                        const effectName = stunEffect ? stunEffect.name : "khống chế";
                        const timeLeft = Math.ceil((stunEffect.expiry - Date.now()) / 1000);
                        UI.addBattleLog(`đang bị <b>${effectName}</b>, không thể hành động! (Còn ${timeLeft} giây)`, "⚠️ Bạn");
                    } else {
                        // Tự động sử dụng đan dược
                        // (Đã di chuyển ra ngoài vòng lặp turn để hỗ trợ dùng khi bị khống chế)

                        this.turnCount++;
                        this.playerAttack(proxy, enemy); 
                    }
                    pTimer = 0; 
                }
                
                if (eTimer >= enemyAtkSpd) { 
                    if (this.isStunned(enemy)) {
                        const stunEffect = enemy.activeDebuffs.find(d => d.type === "Stun" || d.type === "Freeze");
                        const effectName = stunEffect ? stunEffect.name : "khống chế";
                        const timeLeft = Math.ceil((stunEffect.expiry - Date.now()) / 1000);
                        UI.addBattleLog(`đang bị <b>${effectName}</b>, không thể hành động! (Còn ${timeLeft} giây)`, enemy.name);
                    } else {
                        const canUseSkill = (eSkillTimer >= 4000 && enemy.skills?.length > 0 && Math.random() < 0.6);
                        this.enemyAttack(proxy, enemy, canUseSkill, pet); 
                        if (canUseSkill) eSkillTimer = 0; 
                    }
                    eTimer = 0; 
                }

                if (typeof UI !== 'undefined') {
                    UI.updateBar('hp', proxy.hp, maxHp);
                    UI.updateBar('mp', proxy.currentMp, maxMp);
                    UI.updateBar('enemy-hp', enemy.hp, enemy.maxHp);
                    UI.updateBar('enemy-mp', enemy.currentMp, enemy.maxMp);
                    
                    // Cập nhật CD kỹ năng trên UI
                    if (proxy.skills) {
                        UI.renderPlayerSkills(proxy.skills, proxy.skillCDs);
                        UI.renderSkillStatus('player', proxy.skills, proxy.skillCDs);
                    }
                    if (enemy.skills) {
                        UI.renderSkillStatus('enemy', enemy.skills, enemy.skillCDs);
                    }
                    if (pet) {
                        UI.updatePetUI(pet);
                    }
                }
            }, 100);
            }, delay);
        },

        /**
         * Xử lý các hiệu ứng (Buffs & Debuffs) theo thời gian
         */
        processEffects: function(target, side, now) {
            if (!target) return;
            
            // Đảm bảo buffs/debuffs tồn tại
            target.activeBuffs = target.activeBuffs || [];
            target.activeDebuffs = target.activeDebuffs || [];

            // Xử lý Debuffs
            if (target.activeDebuffs.length > 0) {
                let tickMessages = [];
                let totalTickDmg = 0;
                let shieldLogs = [];

                target.activeDebuffs = target.activeDebuffs.filter(d => {
                    if (now > d.expiry) return false;

                    if (now - (d.lastTick || 0) >= 1000) {
                        if (d.dot > 0) {
                            const pStats = this.getPlayerTotalStats(target);
                            const maxHp = side === "player" ? pStats.hpMax : (target.maxHp || 100);
                            let tickDmg = Math.floor(maxHp * d.dot);
                            
                            if (d.type === "Bleed") {
                                tickDmg = Math.max(1, Math.floor(target.hp * d.dot));
                            }

                            // Nếu đang vô địch, không nhận sát thương từ debuff
                            if (this.isInvincible(target)) {
                                tickDmg = 0;
                            }

                            if (tickDmg > 0) {
                                const shieldLog = this.applyDamage(target, tickDmg, side);
                                tickMessages.push(`${d.icon} ${d.name}: -${tickDmg} Sinh lực`);
                                if (shieldLog) shieldLogs.push(shieldLog);
                                totalTickDmg += tickDmg;
                                UI.showBattleEffect('damage', tickDmg, side);
                            } else {
                                this.applyDamage(target, tickDmg, side);
                            }
                        }
                        d.lastTick = now;
                    }
                    return true;
                });

                if (tickMessages.length > 0) {
                    const combinedShieldLog = shieldLogs.length > 0 ? ` (${shieldLogs.join(", ")})` : "";
                    const senderName = side === "player" ? "⚠️ Bạn" : (side === "pet" ? `[Linh Thú] ${target.name}` : target.name);
                    UI.addBattleLog(`bị ${tickMessages.join(", ")}${combinedShieldLog}`, senderName);
                }
            }

            // Xử lý Buffs
            if (target.activeBuffs && target.activeBuffs.length > 0) {
                target.activeBuffs = target.activeBuffs.filter(b => {
                    return now <= b.expiry;
                });
            }

            if (typeof UI !== 'undefined' && UI.renderDebuffs) {
                // Hiển thị cả Buff và Debuff
                UI.renderDebuffs(side, target.activeBuffs, target.activeDebuffs);
            }
        },

        /**
         * Áp dụng hiệu ứng tốt lên mục tiêu
         */
        applyBuff: function(target, buffType, durationOverride, value, silent = false, casterName = null, sourceName = null) {
            const conf = buffConfigs[buffType];
            if (!conf) return "";

            let side = "player";
            if (target === BattleSystem.currentEnemy) side = "enemy";
            else if (target.isPet) side = "pet"; // Giả định pet có cờ isPet

            const targetName = side === "enemy" ? target.name : (side === "pet" ? `[Linh Thú] ${target.name}` : "Bạn");

            if (!target.activeBuffs) target.activeBuffs = [];
            const existing = target.activeBuffs.find(b => b.type === buffType);
            const duration = durationOverride || conf.duration;

            if (existing) {
                existing.expiry = Date.now() + duration;
                if (value !== undefined) existing.value = value;
                if (casterName) existing.casterName = casterName;
                if (sourceName) existing.sourceName = sourceName;
            } else {
                target.activeBuffs.push({ 
                    type: buffType,
                    name: conf.name,
                    icon: conf.icon,
                    color: conf.color,
                    expiry: Date.now() + duration,
                    value: value,
                    casterName: casterName,
                    sourceName: sourceName
                });
            }
            
            let msg = "";
            if (buffType === 'ShieldBuff' && value) {
                const stats = side === "player" ? this.getPlayerTotalStats(target) : target;
                const maxShield = target.maxShield || Math.floor((stats.mpMax || stats.maxMp || 100) * 0.5);
                target.shield = Math.min(maxShield, (target.shield || 0) + value);
                msg = `[[Linh lực hộ thể|ShieldBuff|${casterName || ""}|${sourceName || ""}]] (${value}) trong ${Math.ceil(duration/1000)} giây`;
            } else {
                // Sử dụng định dạng đặc biệt để UI.js có thể parse nguồn gốc
                msg = `[[${conf.name}|${buffType}|${casterName || ""}|${sourceName || ""}]] trong ${Math.ceil(duration/1000)} giây`;
            }

            if (!silent) {
                UI.addBattleLog(`<b>${targetName}</b> nhận hiệu ứng ${msg}`, "Hệ thống");
            }
            return msg;
        },

        /**
         * Áp dụng hiệu ứng xấu lên mục tiêu
         */
        applyDebuff: function(target, skillIdOrData, silent = false, casterName = null, sourceName = null) {
            let debuffType = "";
            let sData = null;

            if (typeof skillIdOrData === 'string') {
                // Nếu là tên debuff trực tiếp (vd: "Poison")
                if (debuffConfigs[skillIdOrData]) {
                    debuffType = skillIdOrData;
                } else {
                    // Nếu là skillId
                    sData = GameData.skills[skillIdOrData];
                    if (sData) {
                        debuffType = sData.debuff || (sData.effect && sData.effect.type === 'debuff' ? sData.effect.debuff : "");
                    }
                }
            } else {
                // Nếu là object data
                sData = skillIdOrData;
                debuffType = sData.debuff || (sData.effect && sData.effect.type === 'debuff' ? sData.effect.debuff : "");
            }

            if (!debuffType) return "";

            const conf = debuffConfigs[debuffType];
            if (!conf) return "";

            const ccTypes = ["Stun", "Freeze", "Silence", "Confuse", "Blind"];
            let side = "player";
            if (target === BattleSystem.currentEnemy) side = "enemy";
            else if (target.isPet) side = "pet";
            const targetName = side === "enemy" ? target.name : (side === "pet" ? `[Linh Thú] ${target.name}` : "Bạn");

            if (ccTypes.includes(debuffType) && this.isImmuneCC(target)) {
                if (!silent) {
                    UI.addBattleLog(`miễn nhiễm hiệu ứng ${conf.name}!`, targetName);
                }
                return `miễn nhiễm hiệu ứng ${conf.name}!`;
            }

            // Kiểm tra tỷ lệ (nếu có)
            if (sData && sData.chance !== undefined && Math.random() > sData.chance) return "";

            if (!target.activeDebuffs) target.activeDebuffs = [];
            const existing = target.activeDebuffs.find(d => d.type === debuffType);
            let duration = (sData && sData.duration) || conf.duration;

            // Nội tại Boss: Giảm 1 nửa thời gian mọi debuff
            if (target.isBoss) {
                duration = Math.floor(duration / 2);
            }

            if (existing) {
                existing.expiry = Date.now() + duration;
                if (casterName) existing.casterName = casterName;
                if (sourceName) existing.sourceName = sourceName;
            } else {
                target.activeDebuffs.push({ 
                    type: debuffType,
                    name: conf.name,
                    icon: conf.icon,
                    color: conf.color,
                    dot: (sData && sData.dot) || conf.dot,
                    expiry: Date.now() + duration, 
                    lastTick: 0, // Đặt về 0 để gây sát thương ngay lập tức khi vừa dính
                    casterName: casterName,
                    sourceName: sourceName
                });
            }

            const displayDuration = Math.ceil(duration / 1000);
            const msg = `[[${conf.name}|${debuffType}|${casterName || ""}|${sourceName || ""}]] trong ${displayDuration} giây`;
            
            if (!silent) {
                UI.addBattleLog(`<b>${targetName}</b> bị hiệu ứng ${msg}`, "Hệ thống");
            }
            
            return { msg, duration: displayDuration };
        },

        /**
         * Kích hoạt nội tại Boss khi dưới 50% máu
         */
        triggerBossPassive: function(enemy) {
            const duration = 10000; // Cố định 10s cho hào quang cấp cao
            let buffType = "BossImmuneAura";
            
            switch(enemy.bossType) {
                case "offense": buffType = "BossOffenseAura"; break;
                case "defense": buffType = "BossDefenseAura"; break;
                case "speed":   buffType = "BossSpeedAura"; break;
                case "immune":  buffType = "BossImmuneAura"; break;
                default: buffType = "BossImmuneAura";
            }
            
            const eName = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
            UI.addBattleLog(`kích hoạt nội tại Nghịch Cảnh Hào Quang cấp cao, bộc phát sức mạnh!`, `🔥 ${eName}`);
            this.applyBuff(enemy, buffType, duration, null, false, eName, "Nghịch Cảnh Hào Quang cấp cao");
        },

        /**
         * Lấy tổng chỉ số của kẻ thù (bao gồm buff/debuff)
         */
        getEnemyTotalStats: function(enemy) {
            let stats = {
                atk: enemy.atk || 0,
                def: enemy.def || 0,
                thanphap: enemy.thanphap || 1,
                luk: enemy.luk || 0,
                staminaMax: enemy.maxStamina || 100
            };

            // Thêm buff từ activeBuffs (Kẻ địch thường chỉ có chỉ số cơ bản nên tính trực tiếp)
            if (enemy.activeBuffs) {
                enemy.activeBuffs.forEach(b => {
                    if (b.type === "AtkBuff") {
                        const val = b.value || 0.2;
                        stats.atk += (enemy.atk * val);
                    } else if (b.type === "PowerAura") {
                        stats.atk += (enemy.atk * 0.2);
                    } else if (b.type === "BossOffenseAura") {
                        stats.atk += (enemy.atk * 0.3);
                    }

                    if (b.type === "DefBuff") {
                        const val = b.value || 0.2;
                        stats.def += (enemy.def * val);
                    } else if (b.type === "PowerAura") {
                        stats.def += (enemy.def * 0.2);
                    } else if (b.type === "BossDefenseAura") {
                        stats.def += (enemy.def * 0.3);
                    }

                    if (b.type === "BossThanphapAura") stats.thanphap += (enemy.thanphap * 0.45);
                });
            }

            if (enemy.activeDebuffs) {
                enemy.activeDebuffs.forEach(d => {
                    if (d.type === "Weakness") stats.atk *= 0.75;
                    if (d.type === "ArmorBreak") stats.def *= 0.5;
                    if (d.type === "MinorArmorBreak") stats.def *= 0.8;
                    if (d.type === "Freeze") stats.def *= 0.8;
                    if (d.type === "ThanphapDebuff") stats.thanphap *= 0.7;
                });
            }

            return stats;
        },

        /**
         * Kiểm tra mục tiêu có đang bị khống chế không
         */
        isStunned: function(target) {
            if (!target.activeDebuffs) return false;
            return target.activeDebuffs.some(d => d.type === "Stun" || d.type === "Freeze");
        },

        isImmuneCC: function(target) {
            if (!target.activeBuffs) return false;
            return target.activeBuffs.some(b => b.type === "CCImmune" || b.type === "BossImmuneAura");
        },

        isInvincible: function(target) {
            if (!target.activeBuffs) return false;
            return target.activeBuffs.some(b => b.type === "Invincible");
        },

        /**
         * Kiểm tra mục tiêu có bị câm lặng không
         */
        isSilenced: function(target) {
            if (!target.activeDebuffs) return false;
            return target.activeDebuffs.some(d => d.type === "Silence");
        },

        isConfused: function(target) {
            if (!target.activeDebuffs) return false;
            return target.activeDebuffs.some(d => d.type === "Confuse");
        },

        isBlind: function(target) {
            if (!target.activeDebuffs) return false;
            return target.activeDebuffs.some(d => d.type === "Blind");
        },

        /**
         * Người chơi tấn công
         */
        playerAttack: function(proxy, enemy) {
            // Kiểm tra Mù (Blind)
            if (this.isBlind(proxy) && Math.random() < 0.4) {
                UI.addBattleLog(`bị Mù, đòn tấn công bị hụt!`, "⚠️ Bạn");
                return;
            }

            // Kiểm tra Hỗn Loạn (Confuse)
            if (this.isConfused(proxy)) {
                if (Math.random() < 0.5) {
                    const pStats = this.getPlayerTotalStats(proxy);
                    const selfDmg = Math.max(1, Math.floor(pStats.atk * 0.5));
                    const shieldLog = this.applyDamage(proxy, selfDmg, "player");
                    UI.addBattleLog(`đang bị <b>Hỗn Loạn</b>, tâm trí bất định tự tấn công bản thân gây <b style="color:#ff4444">${selfDmg} ST</b>${shieldLog}!`, "⚠️ Bạn");
                    return;
                } else {
                    UI.addBattleLog(`đang bị <b>Hỗn Loạn</b>, đầu óc quay cuồng nhưng vẫn cố gắng hành động!`, "⚠️ Bạn");
                }
            }

            const skills = proxy.skills || [];
            let skillUsed = null;
            const pStats = this.getPlayerTotalStats(proxy);
            const isAutoSkillEnabled = (typeof Game !== 'undefined') ? Game.isAutoSkillEnabled() : true;
            const tactic = (typeof Game !== 'undefined') ? Game.getCombatTactic() : 'balanced';

            if (typeof GameData !== 'undefined' && GameData.skills && !this.isSilenced(proxy) && isAutoSkillEnabled) {
                // Chỉ sử dụng các kỹ năng đã được bật (toggled)
                const toggledSkills = proxy.toggledSkills || [];
                const priorityMap = { 'high': 3, 'medium': 2, 'low': 1 };
                const availableSkills = [];
                
                for (let i = 0; i < skills.length; i++) {
                    const sId = skills[i];
                    if (!toggledSkills.includes(sId)) continue;
                    
                    const priority = (proxy.skillPriorities && proxy.skillPriorities[sId]) || 'medium';
                    if (priority === 'off') continue; // Bỏ qua nếu bị tắt
                    
                    const sData = GameData.skills[sId];
                    if (sData && sData.type === "active") {
                        const cd = proxy.skillCDs[sId] || 0;
                        const cost = sData.manaCost || 0;
                        if (cd <= 0 && proxy.currentMp >= cost) {
                            const priority = (proxy.skillPriorities && proxy.skillPriorities[sId]) || 'medium';
                            availableSkills.push({ 
                                ...sData, 
                                id: sId, 
                                priorityValue: priorityMap[priority] || 2,
                                category: this.getSkillCategory(sData),
                                index: i 
                            });
                        }
                    }
                }

                if (availableSkills.length > 0) {
                    // Áp dụng logic chiến thuật
                    if (tactic === 'balanced') {
                        availableSkills.sort((a, b) => {
                            if (b.priorityValue !== a.priorityValue) return b.priorityValue - a.priorityValue;
                            return b.index - a.index;
                        });
                    } else if (tactic === 'defensive') {
                        const hpPercent = proxy.hp / pStats.hpMax;
                        availableSkills.sort((a, b) => {
                            const getScore = (s) => {
                                let score = s.priorityValue * 10;
                                if (s.category === 'defense') score += (hpPercent < 0.7 ? 100 : 50);
                                if (s.category === 'control' && enemy.chargingSkill) score += 80;
                                if (s.category === 'control') score += 40;
                                if (s.category === 'buff') score += 20;
                                return score;
                            };
                            return getScore(b) - getScore(a);
                        });
                    } else if (tactic === 'assassin') {
                        const isEnemyCCed = this.isStunned(enemy) || this.isSilenced(enemy) || this.isBlind(enemy);
                        const isEnemyDebuffed = enemy.activeDebuffs && enemy.activeDebuffs.length > 0;
                        const isSelfBuffed = proxy.activeBuffs && proxy.activeBuffs.length > 0;

                        availableSkills.sort((a, b) => {
                            const getScore = (s) => {
                                let score = s.priorityValue * 10;
                                if (!isEnemyCCed && s.category === 'control') score += 100;
                                if (isEnemyCCed && !isEnemyDebuffed && s.category === 'debuff') score += 80;
                                if (isEnemyCCed && !isSelfBuffed && s.category === 'buff') score += 60;
                                if (isEnemyCCed && s.category === 'attack') score += 120; // Dồn dame khi địch bị khống chế
                                return score;
                            };
                            return getScore(b) - getScore(a);
                        });
                    } else if (tactic === 'suppression') {
                        availableSkills.sort((a, b) => {
                            const getScore = (s) => {
                                let score = s.priorityValue * 10;
                                if (s.category === 'control') score += 100;
                                if (s.category === 'debuff') score += 80;
                                if (s.category === 'attack') score += 40;
                                return score;
                            };
                            return getScore(b) - getScore(a);
                        });
                    } else if (tactic === 'harassment') {
                        availableSkills.sort((a, b) => {
                            const getScore = (s) => {
                                let score = s.priorityValue * 10;
                                const isDOT = s.debuff === 'Poison' || s.debuff === 'Bleed' || s.debuff === 'Burn';
                                if (isDOT) {
                                    const alreadyHasDOT = enemy.activeDebuffs && enemy.activeDebuffs.some(d => d.type === s.debuff);
                                    score += alreadyHasDOT ? 20 : 100; // Ưu tiên DOT chưa có
                                }
                                if (s.category === 'debuff') score += 60;
                                if (s.category === 'attack') score += 40;
                                return score;
                            };
                            return getScore(b) - getScore(a);
                        });
                    } else if (tactic === 'custom') {
                        const hpPercent = proxy.hp / pStats.hpMax;
                        const mpPercent = proxy.currentMp / pStats.mpMax;
                        const enemyHpPercent = enemy.hp / enemy.hpMax;
                        const isEnemyCCed = this.isStunned(enemy) || this.isSilenced(enemy) || this.isBlind(enemy);
                        const isEnemyCharging = !!enemy.chargingSkill;
                        
                        const hasEnemyDebuff = enemy.activeDebuffs && enemy.activeDebuffs.length > 0;
                        const hasEnemyAtkBuff = enemy.activeBuffs && enemy.activeBuffs.some(b => b.type === 'AtkUp' || b.type === 'PowerUp' || b.type === 'Berserk');
                        const hasEnemyDefBuff = enemy.activeBuffs && enemy.activeBuffs.some(b => b.type === 'DefUp' || b.type === 'ShieldAura' || b.type === 'Invincible');
                        const hasPlayerAtkDebuff = proxy.activeDebuffs && proxy.activeDebuffs.some(d => d.type === 'Weakness' || d.type === 'AtkDown');

                        const customRules = (typeof Game !== 'undefined') ? Game.getCustomTacticRules() : [];

                        availableSkills.sort((a, b) => {
                            const getScore = (s) => {
                                let score = s.priorityValue * 10;
                                
                                // Kiểm tra từng quy tắc tùy biến
                                // Quy tắc phía trên (index nhỏ) có trọng số cao hơn để ưu tiên
                                for (let i = 0; i < customRules.length; i++) {
                                    const rule = customRules[i];
                                    let conditionMet = false;
                                    if (rule.condition === 'hp_low' && hpPercent < (rule.threshold / 100)) conditionMet = true;
                                    if (rule.condition === 'enemy_hp_low' && enemyHpPercent < (rule.threshold / 100)) conditionMet = true;
                                    if (rule.condition === 'mp_low' && mpPercent < (rule.threshold / 100)) conditionMet = true;
                                    if (rule.condition === 'battle_start' && this.turnCount === 1) conditionMet = true;
                                    if (rule.condition === 'enemy_cc' && isEnemyCCed) conditionMet = true;
                                    if (rule.condition === 'enemy_cc_end' && !isEnemyCCed) conditionMet = true;
                                    if (rule.condition === 'enemy_debuff_end' && !hasEnemyDebuff) conditionMet = true;
                                    if (rule.condition === 'enemy_atk_up' && hasEnemyAtkBuff) conditionMet = true;
                                    if (rule.condition === 'enemy_def_up' && hasEnemyDefBuff) conditionMet = true;
                                    if (rule.condition === 'player_atk_down' && hasPlayerAtkDebuff) conditionMet = true;
                                    if (rule.condition === 'enemy_charging' && isEnemyCharging) conditionMet = true;

                                    if (conditionMet && s.category === rule.action) {
                                        // Trọng số giảm dần theo thứ tự quy tắc: 500, 480, 460...
                                        score += (500 - i * 20); 
                                        break; 
                                    }
                                }
                                return score;
                            };
                            return getScore(b) - getScore(a);
                        });
                    }
                    
                    skillUsed = availableSkills[0];
                }
            }

            // Nếu kỹ năng cần tụ lực
            if (skillUsed && skillUsed.chargeTime) {
                proxy.currentMp -= (skillUsed.manaCost || 0);
                proxy.chargingSkill = { 
                    ...skillUsed, 
                    timeLeft: skillUsed.chargeTime,
                    totalTime: skillUsed.chargeTime 
                };
                UI.addBattleLog(`đang tập trung linh khí, chuẩn bị thi triển ${skillUsed.name}...`, "✨ Bạn");
                return;
            }

            // Tỷ lệ bạo kích dựa trên May Mắn (Luk)
            const critChance = this.calcCritChance(pStats.luk);
            let isCrit = Math.random() < critChance;
            let critMult = isCrit ? 2.0 : 1.0;

            if (skillUsed) {
                // Trừ linh lực và thiết lập cooldown cho kỹ năng không cần tụ lực
                if (!skillUsed.chargeTime) {
                    proxy.currentMp -= (skillUsed.manaCost || 0);
                    const cdValue = (skillUsed.cooldown || 0) * 1000;
                    proxy.skillCDs[skillUsed.id] = cdValue;
                }
                this.executeSkill(proxy, enemy, skillUsed, pStats, isCrit, critMult);
            } else {
                this.executeBasicAttack(proxy, enemy, pStats, isCrit, critMult);
            }
        },

        /**
         * Thực hiện kỹ năng sau khi tụ lực xong
         */
        executeChargedSkill: function(proxy, enemy) {
            const skillUsed = proxy.chargingSkill;
            proxy.chargingSkill = null;
            if (!skillUsed) return;

            const pStats = this.getPlayerTotalStats(proxy);
            const critChance = this.calcCritChance(pStats.luk);
            let isCrit = Math.random() < critChance;
            let critMult = isCrit ? 2.0 : 1.0;

            // Cooldown tính bằng giây trong data, chuyển sang ms
            const cdValue = skillUsed.cooldown !== undefined ? skillUsed.cooldown * 1000 : 0;
            proxy.skillCDs[skillUsed.id] = cdValue;

            this.executeSkill(proxy, enemy, skillUsed, pStats, isCrit, critMult, true);
        },

        /**
         * Logic thực hiện kỹ năng
         */
        executeSkill: function(proxy, enemy, skillUsed, pStats, isCrit, critMult, isCharged = false) {
            const isSupport = skillUsed.damageMult === 0 && !skillUsed.debuff;
            const targetDisplayName = isSupport ? "Bạn" : (enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name);
            
            // Chỉ lao vào nếu là kỹ năng tấn công
            if (!isSupport) {
                UI.triggerAttackAnimation("player");
            }

            // Tính toán sát thương
            let atk = pStats.atk;
            if (proxy.activeDebuffs?.some(d => d.type === "Weakness")) atk *= 0.75;

            const eStats = this.getEnemyTotalStats(enemy);
            let def = eStats.def;
            const currentReduction = this.calcDamageReduction(def);
            
            let dmg;
            if (skillUsed.ignoreDef) {
                dmg = Math.floor(atk * skillUsed.damageMult * critMult * 0.75);
            } else {
                dmg = Math.floor(atk * skillUsed.damageMult * critMult * (1 - currentReduction));
            }

            // Chỉ áp dụng sát thương tối thiểu 1 nếu kỹ năng có hệ số sát thương > 0
            if (skillUsed.damageMult > 0) {
                dmg = Math.max(1, dmg);
            } else {
                dmg = 0;
            }
            
            // Giảm sát thương nếu mục tiêu có ShieldAura
            if (enemy.activeBuffs?.some(b => b.type === "ShieldAura")) {
                dmg = Math.floor(dmg * 0.5);
            }

            // Nếu mục tiêu đang vô địch, sát thương = 0
            let invincibleMsg = "";
            if (this.isInvincible(enemy)) {
                dmg = 0;
                invincibleMsg = " nhưng đối thủ đang Vô Địch, không gây sát thương";
            }

            const shieldLog = this.applyDamage(enemy, dmg, "enemy");
            // Xử lý hiệu ứng kỹ năng
            let effectMsg = "";
            if (skillUsed.debuff || (skillUsed.effect && skillUsed.effect.type === 'debuff')) {
                const debuffResult = this.applyDebuff(enemy, skillUsed.id, true, "Bạn", skillUsed.name);
                if (debuffResult && debuffResult.msg) {
                    const enemyDisplayName = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
                    effectMsg += `, <b>${enemyDisplayName}</b> bị hiệu ứng ${debuffResult.msg}`;
                }
            }
            
            if (skillUsed.effect && typeof skillUsed.effect === 'function') {
                const effectResult = skillUsed.effect(proxy, "Bạn", skillUsed.name);
                if (effectResult) effectMsg += `, <b>Bạn</b> nhận hiệu ứng ${effectResult}`;
            }

            const critText = isCrit ? ' <b style="color:#ffeb3b; text-shadow: 0 0 5px #ffeb3b;">BẠO KÍCH! 💥</b>' : '';
            const chargeText = isCharged ? ' <b style="color:#00f2ff">[TỤ LỰC HOÀN TẤT]</b>' : '';
            
            // Ghi log kỹ năng gộp
            const enemyDisplayName = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
            const targetText = isSupport ? "" : ` lên <b style="color:#f44336">${enemyDisplayName}</b>`;
            const dmgText = isSupport ? "" : `, gây <b style="color:#ff4444">${dmg} ST</b>${critText}`;
            
            if (isSupport) {
                UI.addBattleLog(`${chargeText} Thi triển kỹ năng ${skillUsed.name} lên <b>${targetDisplayName}</b>${effectMsg}.`, "✨ Bạn");
            } else {
                UI.addBattleLog(`${chargeText} thi triển ${skillUsed.name}${targetText}${invincibleMsg}${dmgText}${effectMsg}${shieldLog}.`, "✨ Bạn");
            }
            
            // Hiệu ứng skill: nếu là buff thì hiện trên bản thân
            UI.showBattleEffect('skill', skillUsed.name, isSupport ? "player" : "enemy");
            
            if (dmg > 0) {
                UI.showBattleEffect(isCrit ? 'crit' : 'damage', dmg, "enemy");
            } else if (this.isInvincible(enemy)) {
                UI.showBattleEffect('miss', 'INVINCIBLE', "enemy");
            }

            // Vạn Độc Hào Quang: Gây độc khi tấn công
            if (proxy.activeBuffs?.some(b => b.type === "VilePoison") && Math.random() < 0.5) {
                this.applyDebuff(enemy, "skill_vandoc_ultimate", false, "Bạn", "Vạn Độc Hào Quang"); // Dùng debuff Poison của Vạn Độc
            }

            // Áp dụng hiệu ứng đặc biệt từ SkillSystem
            if (typeof SkillSystem !== 'undefined') {
                SkillSystem.applyEffect(skillUsed.id, proxy, enemy, dmg);
            }

            this.handleReflect(proxy, enemy, dmg);
        },

        /**
         * Logic đánh thường
         */
        executeBasicAttack: function(proxy, enemy, pStats, isCrit, critMult) {
            UI.triggerAttackAnimation("player");
            let atk = pStats.atk;
            if (proxy.activeDebuffs?.some(d => d.type === "Weakness")) atk *= 0.75;

            const eStats = this.getEnemyTotalStats(enemy);
            let def = eStats.def;
            const currentReduction = this.calcDamageReduction(def);
            let dmg = Math.max(1, Math.floor(atk * critMult * (1 - currentReduction)));

            // Giảm sát thương nếu mục tiêu có ShieldAura
            if (enemy.activeBuffs?.some(b => b.type === "ShieldAura")) {
                dmg = Math.floor(dmg * 0.5);
            }

            // Nếu mục tiêu đang vô địch, sát thương = 0
            let invincibleMsg = "";
            if (this.isInvincible(enemy)) {
                dmg = 0;
                invincibleMsg = " nhưng đối thủ đang Vô Địch, không gây sát thương";
            }

            const shieldLog = this.applyDamage(enemy, dmg, "enemy");
            const critText = isCrit ? ' <b style="color:#ffeb3b; text-shadow: 0 0 5px #ffeb3b;">BẠO KÍCH! 💥</b>' : '';
            const attackMsg = this.getPlayerAttackMsg();
            UI.addBattleLog(`${attackMsg}${invincibleMsg}, gây <b style="color:#ff4444">${dmg} ST</b>${critText}${shieldLog}.`, "⚔️ Bạn");
            
            if (dmg > 0) {
                UI.showBattleEffect(isCrit ? 'crit' : 'damage', dmg, "enemy");
            } else if (this.isInvincible(enemy)) {
                UI.showBattleEffect('miss', 'INVINCIBLE', "enemy");
            }

            // Vạn Độc Hào Quang: Gây độc khi đánh thường
            if (proxy.activeBuffs?.some(b => b.type === "VilePoison") && Math.random() < 0.3) {
                this.applyDebuff(enemy, "skill_vandoc_ultimate", false, "Bạn", "Vạn Độc Hào Quang");
            }

            this.handleReflect(proxy, enemy, dmg);
        },

        /**
         * Xử lý phản sát thương
         */
        handleReflect: function(attacker, defender, dmg) {
            // attacker: người gây sát thương
            // defender: người nhận sát thương (người có khả năng phản đòn)
            let reflectRatio = 0;
            let isPlayerReflecting = false;

            if (defender === BattleSystem.currentEnemy) {
                // Kẻ địch phản đòn (nếu có kỹ năng phản đòn)
                // Hiện tại chưa có quái phản đòn, có thể thêm sau
            } else {
                // Người chơi phản đòn
                const pStats = this.getPlayerTotalStats(defender); // defender là người chơi
                reflectRatio = pStats.reflect || 0;
                isPlayerReflecting = true;
            }

            if (reflectRatio > 0 && dmg > 0) {
                const reflectDmg = Math.floor(dmg * reflectRatio);
                if (reflectDmg > 0) {
                    if (isPlayerReflecting) {
                        const shieldLog = this.applyDamage(BattleSystem.currentEnemy, reflectDmg, "enemy");
                        UI.addBattleLog(`PHẢN ĐÒN phản lại <b style="color:#ff9800">${reflectDmg} ST</b> cho đối thủ${shieldLog}!`, "🛡️ Bạn");
                        UI.showBattleEffect('damage', reflectDmg, "enemy"); // Hiệu ứng lên quái
                    } else {
                        // Quái phản đòn (nếu có)
                    }
                }
            }
        },

        /**
         * Kẻ thù tấn công
         */
        enemyAttack: function(proxy, enemy, useSkill, pet) {
            const enemyName = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
            const eStats = this.getEnemyTotalStats(enemy);

            // Xác định mục tiêu (tỉ lệ chia đều giữa người chơi và linh thú)
            let target = proxy;
            let targetSide = "player";
            let targetDisplayName = "bạn";

            if (pet && pet.hp > 0) {
                if (Math.random() < pet.targetProb) {
                    target = pet;
                    targetSide = "pet";
                    targetDisplayName = `[Linh Thú] ${pet.displayName || pet.name}`;
                    
                    // Pet bị đánh, tăng tỉ lệ bị đánh cho người chơi
                    proxy.targetProb = Math.min(0.9, proxy.targetProb + 0.1);
                    pet.targetProb = 1 - proxy.targetProb;
                } else {
                    // Người chơi bị đánh, tăng tỉ lệ bị đánh cho pet
                    pet.targetProb = Math.min(0.9, pet.targetProb + 0.1);
                    proxy.targetProb = 1 - pet.targetProb;
                }
            }

            const tStats = targetSide === "player" ? this.getPlayerTotalStats(target) : { def: target.def || 0, dodge: 0 };

            // Kiểm tra Mù (Blind)
            if (this.isBlind(enemy) && Math.random() < 0.4) {
                UI.addBattleLog(`bị Mù, đòn tấn công bị hụt!`, enemyName);
                return;
            }

            // Kiểm tra Hỗn Loạn (Confuse)
            if (this.isConfused(enemy)) {
                if (Math.random() < 0.5) {
                    const selfDmg = Math.max(1, Math.floor(eStats.atk * 0.5));
                    const shieldLog = this.applyDamage(enemy, selfDmg, "enemy");
                    UI.addBattleLog(`đang bị <b>Hỗn Loạn</b>, tâm trí bất định tự tấn công bản thân gây <b style="color:#ff4444">${selfDmg} ST</b>${shieldLog}!`, enemyName);
                    return;
                } else {
                    UI.addBattleLog(`đang bị <b>Hỗn Loạn</b>, đầu óc quay cuồng nhưng vẫn cố gắng hành động!`, enemyName);
                }
            }

            // Kiểm tra né tránh của mục tiêu
            if (tStats.dodge > 0 && Math.random() < tStats.dodge) {
                UI.addBattleLog(`nhanh nhẹn né tránh đòn tấn công của đối thủ!`, targetSide === "player" ? "💨 Bạn" : `💨 ${target.name}`);
                UI.showBattleEffect('miss', 'DODGE', targetSide);
                return;
            }

            let dmg = 0; 
            if (useSkill && enemy.skills?.length > 0) {
                // Lọc các kỹ năng không trong thời gian hồi và đủ linh lực
                const availableSkills = enemy.skills.filter(s => {
                    const sId = (s && typeof s === 'object') ? s.id : s;
                    const sData = (s && typeof s === 'object' && s.name) ? s : (GameData.skills ? GameData.skills[sId] : null);
                    if (!sData || sData.type !== 'active') return false;
                    const hasMana = ((enemy.currentMp || 0) >= (sData.manaCost || 0));
                    return (enemy.skillCDs[sId] || 0) <= 0 && hasMana;
                });
                
                if (availableSkills.length > 0) {
                    const skillRef = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                    const sData = GameData.skills[skillRef.id] || skillRef;
                    
                    // Tiêu hao linh lực của quái
                    enemy.currentMp -= (sData.manaCost || 0);

                    // Thiết lập cooldown cho kỹ năng của quái
                    const cdValue = sData.cooldown !== undefined ? sData.cooldown * 1000 : 4000;
                    enemy.skillCDs[skillRef.id] = cdValue;

                    const mult = sData.damageMult !== undefined ? sData.damageMult : 1.0;
                    const isSupport = sData.damageMult === 0 && !sData.debuff;

                    // Chỉ lao vào nếu là kỹ năng tấn công
                    if (!isSupport) {
                        UI.triggerAttackAnimation("enemy");
                    }

                    let def = tStats.def;
                    if (target.activeDebuffs?.some(d => d.type === "ArmorBreak")) def *= 0.5;
                    if (target.activeDebuffs?.some(d => d.type === "MinorArmorBreak")) def *= 0.8;
                    if (target.activeDebuffs?.some(d => d.type === "Freeze")) def *= 0.8;

                    const currentReduction = this.calcDamageReduction(def);
                    dmg = Math.floor((eStats.atk * mult) * (1 - currentReduction));
                    
                    // Chỉ áp dụng sát thương tối thiểu 1 nếu kỹ năng có hệ số sát thương > 0
                    if (mult > 0) {
                        dmg = Math.max(1, dmg);
                    } else {
                        dmg = 0;
                    }
                    
                    // Nếu mục tiêu đang vô địch
                    let invincibleMsg = "";
                    if (this.isInvincible(target)) {
                        dmg = 0;
                        invincibleMsg = ` nhưng ${targetDisplayName} đang Vô Địch, không nhận sát thương`;
                    }

                    const shieldLog = this.applyDamage(target, dmg, targetSide);
                    
                    const hideStats = this.shouldHideEnemyStats(enemy);
                    // Chỉ ẩn tên kỹ năng nếu là quái vật bí ẩn hoặc boss cực mạnh, quái thường vẫn hiện tên chiêu
                    const isMysterious = enemy.name && (enemy.name.includes("Bí Ẩn") || enemy.name.includes("Vô Danh"));
                    const skillName = (hideStats && isMysterious) ? "??????" : sData.name;

                    // Xử lý hiệu ứng kỹ năng của quái
                    let effectMsg = "";
                    if (sData.debuff || (sData.effect && sData.effect.type === 'debuff')) {
                        const debuffResult = this.applyDebuff(target, skillRef.id, true, enemy.name, skillName);
                        if (debuffResult && debuffResult.msg) {
                            const tName = targetDisplayName.includes(' (') ? targetDisplayName.split(' (')[0] : targetDisplayName;
                            effectMsg += `, <b>${tName}</b> bị hiệu ứng ${debuffResult.msg}`;
                        }
                    }
                    
                    if (sData.effect && typeof sData.effect === 'function') {
                        // Kỹ năng có hiệu ứng đặc biệt (thường là buff cho bản thân)
                        const effectResult = sData.effect(enemy, enemy.name, skillName);
                        if (effectResult) {
                            const eName = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
                            // Đảm bảo effectResult là chuỗi (nếu là object thì lấy .msg)
                            const resMsg = (typeof effectResult === 'object' && effectResult.msg) ? effectResult.msg : effectResult;
                            if (typeof resMsg === 'string') {
                                effectMsg += `, <b>${eName}</b> nhận hiệu ứng ${resMsg}`;
                            }
                        }
                    }
                    
                    // Áp dụng hiệu ứng đặc biệt từ SkillSystem (Lifesteal, v.v.)
                    if (typeof SkillSystem !== 'undefined') {
                        SkillSystem.applyEffect(skillRef.id, enemy, target, dmg);
                    }

                    const skillIcon = sData.icon || "💥";
                    const targetColor = (targetSide === "player" || targetSide === "pet") ? "#4caf50" : "#ff4444";
                    
                    const tName = targetDisplayName.includes(' (') ? targetDisplayName.split(' (')[0] : targetDisplayName;
                    const targetText = isSupport ? "" : ` lên <b style="color:${targetColor}">${tName}</b>`;
                    const dmgText = (isSupport || dmg <= 0) ? "" : `, gây <b style="color:#ff4444">${dmg} ST</b>`;

                    const eName = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
                    if (isSupport) {
                        UI.addBattleLog(`Thi triển kỹ năng ${skillName} lên <b>${eName}</b>${effectMsg}.`, enemyName);
                    } else {
                        UI.addBattleLog(`gầm vang, thi triển ${skillName}${targetText}${invincibleMsg}${dmgText}${effectMsg}${shieldLog}.`, enemyName);
                    }
                    
                    // Hiệu ứng skill: nếu là buff thì hiện trên bản thân
                    UI.showBattleEffect('skill', skillName, isSupport ? "enemy" : targetSide);

                    if (dmg > 0) {
                        UI.showBattleEffect('damage', dmg, targetSide);
                    } else if (this.isInvincible(target)) {
                        UI.showBattleEffect('miss', 'INVINCIBLE', targetSide);
                    }
                } else {
                    // Nếu không có kỹ năng nào sẵn sàng, đánh thường
                    this.executeEnemyBasicAttack(proxy, enemy, tStats, eStats, enemyName, target, targetSide, targetDisplayName);
                    return;
                }
            } else {
                this.executeEnemyBasicAttack(proxy, enemy, tStats, eStats, enemyName, target, targetSide, targetDisplayName);
            }
            this.handleReflect(enemy, target, dmg);
        },

        /**
         * Đòn đánh thường của quái
         */
        executeEnemyBasicAttack: function(proxy, enemy, tStats, eStats, enemyName, target, targetSide, targetDisplayName) {
            UI.triggerAttackAnimation("enemy");
            let def = tStats.def;
            if (target.activeDebuffs?.some(d => d.type === "ArmorBreak")) def *= 0.5;
            if (target.activeDebuffs?.some(d => d.type === "MinorArmorBreak")) def *= 0.8;
            if (target.activeDebuffs?.some(d => d.type === "Freeze")) def *= 0.8;

            const currentReduction = this.calcDamageReduction(def);
            let dmg = Math.max(1, Math.floor(eStats.atk * (1 - currentReduction)));

            // Giảm sát thương nếu mục tiêu có ShieldAura
            if (target.activeBuffs?.some(b => b.type === "ShieldAura")) {
                dmg = Math.floor(dmg * 0.5);
            }

            // Nếu mục tiêu đang vô địch
            let invincibleMsg = "";
            if (this.isInvincible(target)) {
                dmg = 0;
                invincibleMsg = ` nhưng ${targetDisplayName} đang Vô Địch, không nhận sát thương`;
            }

            const shieldLog = this.applyDamage(target, dmg, targetSide);
            const attackMsg = this.getEnemyAttackMsg(enemy);
            const targetColor = (targetSide === "player" || targetSide === "pet") ? "#4caf50" : "#ff4444";
            UI.addBattleLog(`${attackMsg} vào <b style="color:${targetColor}">${targetDisplayName}</b>${invincibleMsg}, gây <b style="color:#ff4444">${dmg} ST</b>${shieldLog}.`, enemyName);
            if (dmg > 0) {
                UI.showBattleEffect('damage', dmg, targetSide);
            } else if (this.isInvincible(target)) {
                UI.showBattleEffect('miss', 'INVINCIBLE', targetSide);
            }
            this.handleReflect(enemy, target, dmg);
        },

        /**
         * Áp dụng sát thương lên mục tiêu, ưu tiên trừ vào linh khí hộ thể
         */
        applyDamage: function(target, damage, side) {
            if (damage <= 0) return "";
            
            const targetName = side === "player" ? "bạn" : (side === "pet" ? `[Linh Thú] ${target.name}` : target.name);
            let shieldLog = "";
            
            // Đảm bảo damage là số hợp lệ
            damage = Math.max(0, Math.floor(Number(damage) || 0));
            
            // Lấy giá trị shield hiện tại, đảm bảo là số
            let currentShield = Number(target.shield) || 0;
            
            if (currentShield > 0) {
                const absorbed = Math.min(currentShield, damage);
                let ownerText = "";
                if (side === "enemy") ownerText = "đối phương ";
                else if (side === "player") ownerText = "của bạn ";
                else if (side === "pet") ownerText = "linh thú ";
                
                shieldLog = ` (Hộ thể ${ownerText}hấp thụ <b style="color:#00e5ff">${absorbed} ST</b>)`;
                
                if (currentShield >= damage) {
                    currentShield -= damage;
                    damage = 0;
                } else {
                    damage -= absorbed;
                    currentShield = 0;
                }
                // Cập nhật lại giá trị shield vào đối tượng
                target.shield = currentShield;
            }
            
            if (damage > 0) {
                target.hp = Math.max(0, target.hp - damage);
            }
            
            // Cập nhật UI thủ công cho kẻ địch và linh thú (người chơi được Proxy tự động cập nhật)
            if (typeof UI !== 'undefined') {
                if (side === "enemy") {
                    UI.updateBar('enemy-shield', target.shield || 0, target.maxShield || 0);
                    UI.updateBar('enemy-hp', target.hp, target.maxHp || target.hp);
                } else if (side === "pet") {
                    if (UI.updatePetUI) UI.updatePetUI(target);
                } else if (side === "player") {
                    // Mặc dù có Proxy, đôi khi ép cập nhật UI shield vẫn tốt hơn
                    const stats = this.getPlayerTotalStats(target);
                    const maxMp = stats ? stats.mpMax : 100;
                    const maxShield = target.maxShield || Math.floor(maxMp * 0.5);
                    UI.updateBar('player-shield', target.shield || 0, maxShield);
                }
            }
            
            return shieldLog;
        },

        /**
         * Kết thúc trận chiến và trao thưởng
         */
        resolveBattle: function(proxy, enemy, pet) {
            const isWin = enemy.hp <= 0;
            
            // Dọn dẹp trạng thái chiến đấu trước khi lưu
            delete proxy.skillCDs;
            delete proxy.activeDebuffs;
            delete proxy.activeBuffs;
            delete proxy.chargingSkill;
            delete proxy.battleMaxHp;
            
            if (typeof Game !== 'undefined') {
                // Game.isInBattle = false; // Delay setting to false until UI is closed
                // proxy.isStatsFrozen = false;
            }

            // Giảm trung thành nếu pet tử trận
            if (pet && pet.hp <= 0 && typeof PetSystem !== 'undefined') {
                PetSystem.decreaseLoyalty(proxy, pet.uid, 5);
                UI.addLog(`💔 [Linh Thú] ${pet.displayName || pet.name} đã tử trận, điểm trung thành giảm mạnh!`);
            }

            if (typeof PetSystem !== 'undefined') {
                PetSystem.checkPetLeaving(proxy);
            }

            // Cập nhật hp, mana và stamina cho pet sau trận đấu
            if (pet) {
                const petInstance = proxy.pets.find(p => p.uid === pet.uid);
                if (petInstance) {
                    petInstance.hp = pet.hp;
                    petInstance.mana = pet.mp;
                    petInstance.stamina = pet.stamina;
                    
                    // Nếu thắng, nhận thêm linh khí dựa trên EXP của nhân vật (50%)
                    if (enemy.hp <= 0) {
                        const playerExp = enemy.exp || 0;
                        let totalPetSpiritGain = 0;
                        
                        // Linh thú xuất chiến nhận 50%
                        if (proxy.activePetId === pet.uid) {
                            totalPetSpiritGain += Math.floor(playerExp * 0.5);
                        }
                        
                        // Thú cưỡi nhận 50% (có thể cộng dồn nếu là cùng 1 con)
                        if (proxy.mountedPetUid === pet.uid) {
                            totalPetSpiritGain += Math.floor(playerExp * 0.5);
                        }

                        if (totalPetSpiritGain > 0) {
                            if (PetSystem.canPetGainExp(pet.uid, proxy)) {
                                petInstance.spirit = (petInstance.spirit || 0) + totalPetSpiritGain;
                                UI.addLog(`[Linh Thú] ${pet.displayName || pet.name} nhận được ${totalPetSpiritGain} linh khí!`, "info");
                                proxy.pets = [...proxy.pets];
                            } else {
                                UI.addLog(`[Linh Thú] ${pet.displayName || pet.name} đã đạt giới hạn cảnh giới so với chủ nhân, không thể nhận thêm linh khí!`, "warning");
                            }
                        }
                    }
                }
            }

            // Xử lý linh khí cho thú cưỡi nếu khác với linh thú xuất chiến
            if (enemy.hp <= 0 && proxy.mountedPetUid && proxy.mountedPetUid !== proxy.activePetId) {
                const mountedPet = proxy.pets.find(p => p.uid === proxy.mountedPetUid);
                if (mountedPet) {
                    if (PetSystem.canPetGainExp(mountedPet.uid, proxy)) {
                        const playerExp = enemy.exp || 0;
                        const spiritGain = Math.floor(playerExp * 0.5);
                        mountedPet.spirit = (mountedPet.spirit || 0) + spiritGain;
                        UI.addLog(`[Thú Cưỡi] ${PetSystem.getPetDisplayName(mountedPet.uid, proxy.pets)} nhận được ${spiritGain} linh khí!`, "info");
                        proxy.pets = [...proxy.pets];
                    }
                }
            }

            if (enemy.hp <= 0) {
                // Kiểm tra linh thú bỏ đi sau trận thắng
                if (proxy.activePetId) {
                    const activePet = proxy.pets.find(p => p.uid === proxy.activePetId);
                    if (activePet && activePet.willLeaveAfterBattle) {
                        const petData = PetSystem.getPetData(activePet.id);
                        UI.addLog(`⚠️ <b>${petData.name}</b>: "Ngươi quá yếu đuối, không xứng làm chủ nhân của ta!"`, "red");
                        UI.addLog(`💔 <b>${petData.name}</b> đã vĩnh viễn rời bỏ đạo hữu!`, "red");
                        
                        // Xóa pet
                        proxy.activePetId = null;
                        proxy.pets = proxy.pets.filter(p => p.uid !== activePet.uid);
                        
                        // Cập nhật UI
                        if (typeof UI !== 'undefined' && UI.renderPetTab) {
                            UI.renderPetTab(proxy);
                        }
                    }
                }

                if (enemy.isTribulation) {
                    if (typeof UI !== 'undefined') {
                        UI.endBattle(null);
                    }
                    if (typeof TribulationSystem !== 'undefined' && TribulationSystem.complete) {
                        TribulationSystem.complete(enemy);
                    }
                    return;
                }

                if (typeof UI !== 'undefined') UI.endBattle(`Chiến thắng ${enemy.name}!`);
                proxy.mana += enemy.exp;
                
                // Cập nhật thống kê diệt địch
                if (!proxy.stats) {
                    proxy.stats = { totalKills: 0, monsterKills: {}, totalSpiritStonesEarned: 0, totalStaminaUsed: 0, winStreak: 0 };
                }
                proxy.stats.totalKills = (proxy.stats.totalKills || 0) + 1;
                proxy.stats.winStreak = (proxy.stats.winStreak || 0) + 1;
                
                const mId = enemy.id || enemy.name.toLowerCase(); // Fallback to name if id is missing
                proxy.stats.monsterKills[mId] = (proxy.stats.monsterKills[mId] || 0) + 1;
                // Cập nhật stats để kích hoạt proxy trigger checkTitles
                proxy.stats = { ...proxy.stats };

                // Thưởng Linh Thạch dựa trên sức mạnh quái (exp)
                const baseStones = Math.floor(enemy.exp / 3); 
                const randomBonus = Math.floor(Math.random() * (enemy.exp / 5));
                const totalStones = baseStones + randomBonus;
                
                const addLootFn = (typeof ExploreSystem !== 'undefined' && ExploreSystem.addLoot) ? ExploreSystem.addLoot : Game.addItem;

                // Tăng trung thành cho pet đang xuất chiến
                if (proxy.activePetId && typeof PetSystem !== 'undefined') {
                    PetSystem.increaseLoyalty(proxy, proxy.activePetId, 1);
                }

                let finalStones = totalStones;
                let dropRewards = [];

                if (typeof Game !== 'undefined' && addLootFn) {
                    addLootFn("spirit_stone", totalStones, true);
                }

                // Xử lý rơi vật phẩm từ kẻ địch (nếu có)
                if (enemy.drops && enemy.drops.length > 0) {
                    enemy.drops.forEach(drop => {
                        // Kiểm tra nếu vật phẩm chỉ rơi từ Boss
                        if (drop.bossOnly && !enemy.isBoss) return;

                        // Kiểm tra rơi duy nhất 1 lần cho Tinh Hạch Hoang Lang Vương
                        if (drop.id === "item_hoang_lang_vuong_hach") {
                            if (proxy.receivedWolfKingEssence) return; 
                        }

                        let dropChance = drop.chance || 1.0;
                        // Cơ chế hỗ trợ đan dược: Tăng 20% tỉ lệ nếu không có viên nào trong túi
                        if (["hp_pill_1", "qi_pill", "mp_pill_1"].includes(drop.id)) {
                            if (typeof BagSystem !== 'undefined' && BagSystem.getItemCount(drop.id) < 1) {
                                dropChance += 0.2;
                            }
                        }

                        if (Math.random() < dropChance) {
                            const count = drop.count || 1;
                            if (typeof Game !== 'undefined' && addLootFn) {
                                addLootFn(drop.id, count, true);
                                
                                // Đánh dấu đã nhận Tinh Hạch
                                if (drop.id === "item_hoang_lang_vuong_hach") {
                                    proxy.receivedWolfKingEssence = true;
                                }

                                if (drop.id === "spirit_stone") {
                                    finalStones += count;
                                } else {
                                    const itemData = GameData.items[drop.id];
                                    if (itemData) {
                                        const color = rarityColors[itemData.rarity] || "#fff";
                                        dropRewards.push(`<b style="color:${color}">${itemData.name}</b> x${count}`);
                                    }
                                }
                            }
                        }
                    });
                }

                // Nhật ký tu tiên: Gộp mọi thông báo vào làm một
                const battleId = (typeof UI !== 'undefined' && UI.currentBattleId) || Date.now();
                let rewardParts = [`<b style="color:#4caf50">${enemy.exp} Linh khí</b>`];
                if (finalStones > 0) rewardParts.push(`<b style="color:#ffd700">${finalStones} Linh Thạch</b>`);
                if (dropRewards.length > 0) rewardParts.push(...dropRewards);

                UI.addLog(`🏆 <a href="#" onclick="UI.viewBattleHistory(${battleId}); return false;" style="color: inherit; text-decoration: underline;"><b>Chiến thắng:</b></a> Đã hạ gục <b style="color:#ffeb3b">${enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name}</b>. Nhặt được: ${rewardParts.join(", ")}.`, true);

                // Increment daily mission progress if it's a boss
                if (enemy.isBoss && typeof Game !== 'undefined') {
                    Game.incrementDailyMissionProgress('killBoss', 1);
                }
            } else {
                if (enemy.isTribulation) {
                    if (typeof UI !== 'undefined') {
                        UI.endBattle(null);
                    }
                    if (typeof TribulationSystem !== 'undefined' && TribulationSystem.fail) {
                        TribulationSystem.fail(enemy);
                    }
                    return;
                }

                if (typeof UI !== 'undefined') UI.endBattle(`Bại trận...`);
                
                // Kiểm tra linh thú bỏ đi sau trận thua
                if (proxy.activePetId) {
                    const activePet = proxy.pets.find(p => p.uid === proxy.activePetId);
                    if (activePet && activePet.willLeaveAfterBattle) {
                        const petData = PetSystem.getPetData(activePet.id);
                        UI.addLog(`⚠️ <b>${petData.name}</b>: "Ngươi quá yếu đuối, không xứng làm chủ nhân của ta!"`, "red");
                        UI.addLog(`💔 <b>${petData.name}</b> đã vĩnh viễn rời bỏ đạo hữu!`, "red");
                        
                        // Xóa pet
                        proxy.activePetId = null;
                        proxy.pets = proxy.pets.filter(p => p.uid !== activePet.uid);
                        
                        // Cập nhật UI
                        if (typeof UI !== 'undefined' && UI.renderPetTab) {
                            UI.renderPetTab(proxy);
                        }
                    }
                }
                
                // Reset chuỗi thắng
                if (proxy.stats) {
                    proxy.stats.winStreak = 0;
                    proxy.stats = { ...proxy.stats };
                }
                
                // Nhật ký tu tiên: Ghi lại kết quả thất bại
                const battleId = (typeof UI !== 'undefined' && UI.currentBattleId) || Date.now();
                UI.addLog(`💀 <a href="#" onclick="UI.viewBattleHistory(${battleId}); return false;" style="color: inherit; text-decoration: underline;"><b>Bại trận:</b></a> Đã bị <b style="color:#ff4444">${enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name}</b> đánh bại. Tu vi bị tổn hại, linh lực tiêu tán một phần.`, true);
                
                proxy.hp = 0; 
                
                // Giảm trung thành nếu thua trận
                if (proxy.activePetId && typeof PetSystem !== 'undefined') {
                    PetSystem.decreaseLoyalty(proxy, proxy.activePetId, 2);
                    const petName = (pet && (pet.displayName || pet.name)) || "Linh Thú";
                    UI.addLog(`💔 [Linh Thú] <b style="color:#ffeb3b">${petName}</b> cảm thấy thất vọng vì thất bại, điểm trung thành giảm!`);
                }
                // Nếu đang làm nhiệm vụ tông môn mà bại trận thì thất bại nhiệm vụ
                if (proxy.activeSectMission && typeof Game !== 'undefined' && Game.failSectMission) {
                    Game.failSectMission();
                }
            }
            
            // Kiểm tra danh hiệu sau trận đấu
            if (typeof Game !== 'undefined' && Game.checkTitles) {
                Game.checkTitles();
            }
            
            if (typeof Game !== 'undefined') Game.saveGame();

            // Gọi callback nếu có
            if (this.onComplete) {
                const cb = this.onComplete;
                this.onComplete = null;
                cb(isWin);
            }
        }
    };
})();

window.BattleSystem = BattleSystem;
