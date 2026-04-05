const Game = (function() {
    // 1. Trạng thái gốc (Private State)
    let state = {
        mana: 0,            
        rankIndex: 0, 
        hp: 100, 
        hpMax: 100,
        mpMax: 50,
        currentMp: 50,      
        stamina: 100, 
        staminaMax: 100, 
        atk: 10, 
        def: 5, 
        thanphap: 5, 
        luk: 1, 
        power: 0, 
        inventory: [], 
        unlockedTitles: ["none"], 
        currentTitleId: "none",    
        
        // Nhóm Bonus
        petAtkBuff: 0, 
        petDefBuff: 0,
        equipAtkBuff: 0, 
        equipDefBuff: 0, 
        equipThanphapBuff: 0, 
        equipLukBuff: 0,
        equipHpBuff: 0,
        equipMpBuff: 0,
        equipHpMult: 0,
        equipMpMult: 0,
        equipStaMult: 0,
        inventorySpaceBuff: 0,
        maxInventory: 50,
        
        equipments: { 
            head: null, body: null, legs: null, weapon: null, 
            ring: null, accessory: null, soul: null 
        },
        giftChoicesLeft: 2, 
        pickedGifts: [],
        eventAtkBonus: 0,
        eventDefBonus: 0,
        eventThanphapBonus: 0,
        eventHpMaxBonus: 0,
        eventMpMaxBonus: 0,
        skills: [],
        currentSectId: null,
        lastCheckIn: 0,
        currentSectMissions: [],
        sectContribution: 0,
        sectContributions: {}, // { sectId: value }
        checkInDay: 0,
        activeSectMission: null,
        sectReputation: {}, // { sectId: value }
        sectCheckInDay: {}, // { sectId: day }
        sectLastCheckIn: {}, // { sectId: timestamp }
        sectSpiritGifts: {}, // { sectId: totalSpiritStonesGifted }
        toggledSkills: [], // List of skill IDs that are toggled for auto-use
        stats: {
            totalKills: 0,
            monsterKills: {}, // { monsterId: count }
            totalSpiritStonesEarned: 0,
            totalStaminaUsed: 0,
            winStreak: 0,
            pillsUsed: 0,
            exploreCount: 0,
            sectsLeft: 0
        },
        pets: [],
        skillPriorities: {}, // { skillId: 'high' | 'medium' | 'low' }
        mapExploration: {}, // { mapId: count }
        autoCultivateEnabled: false,
        autoCultivatePaused: false,
        autoCultivateThreshold: 0.5,
        potionSettings: {
            slots: [
                { enabled: true, pillId: 'hp_pill_1', condition: 'hp_low', threshold: 30 },
                { enabled: true, pillId: 'mp_pill_1', condition: 'mp_low', threshold: 20 }
            ]
        },
        pillCooldowns: {},
        autoCultivateInterval: null,
        autoSkillEnabled: true,
        autoExploreEnabled: false,
        combatTactic: 'balanced',
        customTacticRules: [
            { condition: 'hp_low', threshold: 50, action: 'defense' },
            { condition: 'enemy_cc', action: 'attack' }
        ],
        boneQualityId: "pham",
        mapBossLosses: {}, // { mapId: count }
        mysteriousPersonMet: false,
        mysteriousPersonKilledPlayer: false,
        meditationCountAfterDeath: 0,
        activePetId: null,
        mountedPetUid: null,
        neglectCount: 0,
        interactedPetUids: [], // UIDs of pets interacted with in the current 30-action cycle
        incubatingEggs: [], // { itemId: string, startTime: number, duration: number }
        spiritStone: 0,
        bonusAtk: 0,
        bonusDef: 0,
        bonusThanphap: 0,
        bonusHp: 0,
        bonusMp: 0,
        pillCooldowns: {}, // { pillCategory: timestamp }
        pillUsage: {}, // { pillId: count }
        isStatsFrozen: false,
        shield: 0,
        quests: [], // { id, name, desc, status: 'active' | 'completed', progress, target }
        dailyMissions: {}, // { missionId: { progress, target, level, claimed } }
        dailyMissionLastReset: 0,
        activeBuffs: [],
        activeDebuffs: []
    };

    let isInBattle = false;

    const getMajorRankIndex = function(rankIndex) {
        if (!rankIndex || rankIndex <= 0) return 0;
        if (rankIndex <= 9) return 1; // Luyện Khí (9 tầng)
        return 2 + Math.floor((rankIndex - 10) / 3); // Trúc Cơ trở đi (mỗi đại cảnh giới 3 giai đoạn)
    };

    // 2. Proxy Handler
    const calculateTotals = (target) => {
        const boneData = (typeof GameData !== 'undefined' && GameData.boneQualities)
            ? (GameData.boneQualities[target.boneQualityId] || GameData.boneQualities["pham"])
            : { stats: {} };
        const boneStats = boneData.stats || {};

        const titleData = (typeof GameData !== 'undefined' && GameData.titles) 
            ? (GameData.titles[target.currentTitleId] || GameData.titles["none"]) 
            : {name: "Vô Danh", buff:{}};
        const titleBuff = titleData.buff || {};

        const rankPowerMap = {
            "Phàm Cấp": 100,
            "Linh Cấp": 500,
            "Địa Cấp": 2000,
            "Thiên Cấp": 10000,
            "Thần Cấp": 50000
        };

        let skillBuffs = { atk: 0, def: 0, thanphap: 0, luk: 0, hpMax: 0, mp: 0 };
        
        let skillPowerBonus = 0;
        
        // Tính toán chỉ số từ Pet nếu có
        let petAtkBonus = 0;
        let petDefBonus = 0;
        let petThanphapBonus = 0;
        let petHpBonus = 0;
        let petLukBonus = 0;
        let petMpBonus = 0;
        let petPowerBonus = 0;
        if (target.activePetId && typeof PetSystem !== 'undefined') {
            const pet = target.pets.find(p => p.uid === target.activePetId);
            if (pet) {
                const petStats = PetSystem.getPetStats(pet.id, pet.level || 1, pet.statMultiplier || 1.0);
                const petData = PetSystem.getPetData(pet.id);
                if (petStats && petData) {
                    // Cải tiến: Pet cộng chỉ số dựa trên chính sức mạnh của nó
                    // Giai cấp quyết định số lượng thuộc tính được cộng
                    let bonusTypes = [...(petData.bonusTypes || ["atk"])];
                    if (bonusTypes.includes("all") || petData.rank === "Cực phẩm cấp") {
                        bonusTypes = ["atk", "def", "thanphap", "hp", "mp", "luk"];
                    }
                    
                    bonusTypes.forEach(type => {
                        if (type === "atk") petAtkBonus = Math.max(1, Math.floor(petStats.atk * 0.2));
                        if (type === "def") petDefBonus = Math.max(1, Math.floor(petStats.def * 0.2));
                        if (type === "thanphap") petThanphapBonus = Math.max(1, Math.floor(petStats.thanphap * 0.1));
                        if (type === "hp") petHpBonus = Math.max(1, Math.floor(petStats.hpMax * 0.1));
                        if (type === "mp") petMpBonus = Math.max(1, Math.floor(petStats.mpMax * 0.1));
                        if (type === "luk") petLukBonus = Math.max(1, Math.floor(petStats.luk * 0.5)); // Sửa: Dựa trên chỉ số luk của pet
                    });
                    
                    // Lực chiến cộng thêm từ pet
                    const rank = (petData.rank || "Phàm cấp");
                    const rankMult = { 
                        "Phàm cấp": 1, 
                        "Linh cấp": 1.2, 
                        "Địa cấp": 1.5, 
                        "Thiên cấp": 2, 
                        "Thần cấp": 3,
                        "Cực phẩm cấp": 5
                    };
                    const mult = rankMult[rank] || 1;
                    petPowerBonus = Math.floor((petStats.atk + petStats.def + petStats.thanphap + petStats.hp/10) * mult);
                    
                    // Cập nhật vào target để battle.js có thể truy cập qua proxy
                    target.petAtkBuff = petAtkBonus;
                    target.petDefBuff = petDefBonus;
                    target.petThanphapBuff = petThanphapBonus;
                    target.petHpBuff = petHpBonus;
                    target.petLukBuff = petLukBonus;
                    target.petMpBuff = petMpBonus;
                }
            }
        } else {
            // Reset nếu không có pet xuất chiến
            target.petAtkBuff = 0;
            target.petDefBuff = 0;
            target.petThanphapBuff = 0;
            target.petHpBuff = 0;
            target.petLukBuff = 0;
            target.petMpBuff = 0;
        }

        if (target.skills && typeof GameData !== 'undefined') {
            target.skills.forEach(sid => {
                const s = GameData.skills[sid];
                if (!s) return;
                
                if (s.type === 'passive') {
                    const b = s.buff || s.stats || {};
                    if (b.atk) skillBuffs.atk += b.atk;
                    if (b.def) skillBuffs.def += b.def;
                    if (b.thanphap) skillBuffs.thanphap += b.thanphap;
                    if (b.luk) skillBuffs.luk += b.luk;
                    if (b.hpMax || b.hp) skillBuffs.hpMax += (b.hpMax || b.hp);
                    if (b.mp || b.mana) skillBuffs.mp += (b.mp || b.mana);

                    // Add flat power bonus for passive skill
                    const rank = s.rank || "Phàm Cấp";
                    const basePower = rankPowerMap[rank] || 100;
                    skillPowerBonus += basePower;
                } else if (s.type === 'active') {
                    // Only add to power if toggled for auto-use
                    const isToggled = target.toggledSkills && target.toggledSkills.includes(sid);
                    if (isToggled) {
                        const rank = s.rank || "Phàm Cấp";
                        const basePower = rankPowerMap[rank] || 100;
                        const mult = s.damageMult || 1;
                        skillPowerBonus += Math.floor(basePower * mult);
                    }
                }
            });
        }

        const majorRankIdx = getMajorRankIndex(target.rankIndex || 0);
        const baseStamina = 100 + (majorRankIdx * 10);

        const breakdowns = {
            atk: { base: target.atk || 0, equip: target.equipAtkBuff || 0, skill: skillBuffs.atk, pet: petAtkBonus, event: target.eventAtkBonus || 0, bone: 0 },
            def: { base: target.def || 0, equip: target.equipDefBuff || 0, skill: skillBuffs.def, pet: petDefBonus, event: target.eventDefBonus || 0, bone: 0 },
            thanphap: { base: target.thanphap || 0, equip: target.equipThanphapBuff || 0, skill: skillBuffs.thanphap, pet: petThanphapBonus, event: target.eventThanphapBonus || 0, bone: 0 },
            luk: { base: target.luk || 0, equip: target.equipLukBuff || 0, skill: skillBuffs.luk, pet: petLukBonus, bone: 0 },
            hpMax: { base: target.hpMax || 100, equip: target.equipHpBuff || 0, skill: skillBuffs.hpMax, pet: petHpBonus, event: target.eventHpMaxBonus || 0, bone: 0 },
            mpMax: { base: target.mpMax || 50, equip: target.equipMpBuff || 0, skill: skillBuffs.mp, pet: petMpBonus, event: target.eventMpMaxBonus || 0, bone: 0 },
            staminaMax: { base: baseStamina, equip: 0, skill: 0, pet: 0 }
        };

        const preBoneAtk = breakdowns.atk.base + breakdowns.atk.equip + breakdowns.atk.skill + breakdowns.atk.pet + (target.eventAtkBonus || 0);
        const preBoneDef = breakdowns.def.base + breakdowns.def.equip + breakdowns.def.skill + breakdowns.def.pet + (target.eventDefBonus || 0);
        const preBoneThanphap = breakdowns.thanphap.base + breakdowns.thanphap.equip + breakdowns.thanphap.skill + breakdowns.thanphap.pet + (target.eventThanphapBonus || 0);
        const preBoneLuk = breakdowns.luk.base + breakdowns.luk.equip + breakdowns.luk.skill + breakdowns.luk.pet;
        const preBoneHpMax = breakdowns.hpMax.base + breakdowns.hpMax.equip + breakdowns.hpMax.skill + breakdowns.hpMax.pet + (target.eventHpMaxBonus || 0);
        const preBoneMpMax = breakdowns.mpMax.base + breakdowns.mpMax.equip + breakdowns.mpMax.skill + breakdowns.mpMax.pet + (target.eventMpMaxBonus || 0);

        const applyBoneBuff = (preVal, buffPercent) => {
            if (!buffPercent) return 0;
            return Math.floor(preVal * buffPercent);
        };

        const allBuff = boneStats.all || 0;
        breakdowns.atk.bone = applyBoneBuff(preBoneAtk, (boneStats.atk || 0) + allBuff);
        breakdowns.def.bone = applyBoneBuff(preBoneDef, (boneStats.def || 0) + allBuff);
        breakdowns.thanphap.bone = applyBoneBuff(preBoneThanphap, (boneStats.thanphap || 0) + allBuff);
        breakdowns.luk.bone = applyBoneBuff(preBoneLuk, (boneStats.luk || 0) + allBuff);
        breakdowns.hpMax.bone = applyBoneBuff(preBoneHpMax, (boneStats.hpMax || 0) + allBuff);
        breakdowns.mpMax.bone = applyBoneBuff(preBoneMpMax, (boneStats.mp || boneStats.mpMax || 0) + allBuff);
        breakdowns.staminaMax.bone = applyBoneBuff(breakdowns.staminaMax.base, (boneStats.staminaMax || 0) + allBuff);

        let preTitleAtk = preBoneAtk + breakdowns.atk.bone;
        let preTitleDef = preBoneDef + breakdowns.def.bone;
        let preTitleThanphap = preBoneThanphap + breakdowns.thanphap.bone;
        let preTitleLuk = preBoneLuk + breakdowns.luk.bone;
        let preTitleHpMax = preBoneHpMax + breakdowns.hpMax.bone;
        let preTitleMpMax = preBoneMpMax + breakdowns.mpMax.bone;
        let preTitleStaminaMax = breakdowns.staminaMax.base + breakdowns.staminaMax.equip + breakdowns.staminaMax.skill + breakdowns.staminaMax.bone;

        const applyTitleBuff = (preVal, buffPercent) => {
            if (!buffPercent) return 0;
            let bonus = Math.floor(preVal * buffPercent);
            if (buffPercent > 0 && bonus < 1) return 1;
            if (buffPercent < 0 && bonus > -1) return -1;
            return bonus;
        };

        breakdowns.atk.title = applyTitleBuff(preTitleAtk, titleBuff.atk);
        breakdowns.def.title = applyTitleBuff(preTitleDef, titleBuff.def);
        breakdowns.thanphap.title = applyTitleBuff(preTitleThanphap, titleBuff.thanphap);
        breakdowns.luk.title = applyTitleBuff(preTitleLuk, titleBuff.luk);
        breakdowns.hpMax.title = applyTitleBuff(preTitleHpMax, titleBuff.hpMax);
        breakdowns.mpMax.title = applyTitleBuff(preTitleMpMax, titleBuff.mp);
        breakdowns.staminaMax.title = applyTitleBuff(preTitleStaminaMax, titleBuff.staminaMax);

        if (titleBuff.petAtkBuff) breakdowns.atk.title += applyTitleBuff(breakdowns.atk.pet, titleBuff.petAtkBuff);
        if (titleBuff.petDefBuff) breakdowns.def.title += applyTitleBuff(breakdowns.def.pet, titleBuff.petDefBuff);

        const debuffMults = { atk: 1, def: 1, thanphap: 1 };
        if (target.activeDebuffs) {
            target.activeDebuffs.forEach(d => {
                if (d.type === "AtkDebuff" || d.type === "Weakness") debuffMults.atk *= 0.75;
                if (d.type === "ArmorBreak") debuffMults.def *= 0.5;
                if (d.type === "Freeze") debuffMults.def *= 0.8;
                if (d.type === "ThanphapDebuff") debuffMults.thanphap *= 0.7;
            });
        }

        // Thêm Buff từ chiến đấu (Tính dựa trên tổng chỉ số hiện tại)
        let battleBuffs = { atk: 0, def: 0, thanphap: 0, hpMax: 0, mpMax: 0, luk: 0 };
        if (target.activeBuffs) {
            const currentAtk = Math.floor(preTitleAtk + breakdowns.atk.title);
            const currentDef = Math.floor(preTitleDef + breakdowns.def.title);
            const currentThanphap = Math.floor(preTitleThanphap + breakdowns.thanphap.title);
            const currentHpMax = Math.floor((preTitleHpMax + breakdowns.hpMax.title) * (1 + (target.equipHpMult || 0)));
            const currentMpMax = Math.floor((preTitleMpMax + breakdowns.mpMax.title) * (1 + (target.equipMpMult || 0)));

            target.activeBuffs.forEach(b => {
                if (b.type === "AtkBuff") battleBuffs.atk += Math.floor(currentAtk * (b.value || 0.2));
                else if (b.type === "PowerAura") battleBuffs.atk += Math.floor(currentAtk * 0.2);
                else if (b.type === "BossOffenseAura") battleBuffs.atk += Math.floor(currentAtk * 0.3);

                if (b.type === "DefBuff") battleBuffs.def += Math.floor(currentDef * (b.value || 0.2));
                else if (b.type === "PowerAura") battleBuffs.def += Math.floor(currentDef * 0.2);
                else if (b.type === "BossDefenseAura") battleBuffs.def += Math.floor(currentDef * 0.3);

                if (b.type === "ThanphapBuff") battleBuffs.thanphap += Math.floor(currentThanphap * (b.value || 0.2));
                else if (b.type === "BossThanphapAura") battleBuffs.thanphap += Math.floor(currentThanphap * 0.45);

                if (b.type === "HpBuff") battleBuffs.hpMax += Math.floor(currentHpMax * (b.value || 0.2));
                if (b.type === "MpBuff") battleBuffs.mpMax += Math.floor(currentMpMax * (b.value || 0.2));
                if (b.type === "LukBuff") battleBuffs.luk += Math.floor(target.luk * (b.value || 0.2));
            });
        }

        const totalHpMax = Math.max(1, Math.floor((preTitleHpMax + breakdowns.hpMax.title) * (1 + (target.equipHpMult || 0))) + battleBuffs.hpMax);
        const maxMp = Math.max(1, Math.floor((preTitleMpMax + breakdowns.mpMax.title) * (1 + (target.equipMpMult || 0))) + battleBuffs.mpMax);
        const totalStaminaMax = Math.max(1, Math.floor((preTitleStaminaMax + breakdowns.staminaMax.title) * (1 + (target.equipStaMult || 0))));

        return {
            totalAtk: Math.max(0, Math.floor((preTitleAtk + breakdowns.atk.title + battleBuffs.atk) * debuffMults.atk)),
            totalDef: Math.max(0, Math.floor((preTitleDef + breakdowns.def.title + battleBuffs.def) * debuffMults.def)),
            totalThanphap: Math.max(0, Math.floor((preTitleThanphap + breakdowns.thanphap.title + battleBuffs.thanphap) * debuffMults.thanphap)),
            totalLuk: Math.max(0, preTitleLuk + breakdowns.luk.title + battleBuffs.luk),
            totalHpMax,
            maxMp,
            totalStaminaMax,
            breakdowns,
            power: Math.floor(
                Math.max(0, Math.floor((preTitleAtk + breakdowns.atk.title + battleBuffs.atk) * debuffMults.atk)) * 2.5 + 
                Math.max(0, Math.floor((preTitleDef + breakdowns.def.title + battleBuffs.def) * debuffMults.def)) * 1.8 + 
                Math.max(0, Math.floor((preTitleThanphap + breakdowns.thanphap.title + battleBuffs.thanphap) * debuffMults.thanphap)) * 4 + 
                (totalHpMax / 10) * 0.15 + 
                (maxMp / 10) * 0.15 + 
                (target.luk || 0) * 10 + 
                (skillPowerBonus || 0)
            )
        };
    };

    const checkTitles = () => {
        if (!proxyState) return;
        const unlocked = [...proxyState.unlockedTitles];
        let newlyUnlocked = [];

        const check = (id, condition) => {
            if (!unlocked.includes(id) && condition()) {
                unlocked.push(id);
                newlyUnlocked.push(id);
            }
        };

        // Điều kiện cho các danh hiệu
        check("novice", () => proxyState.rankIndex >= 1); // Luyện Khí Tầng 1
        check("slime_slayer", () => (proxyState.stats.monsterKills['slime'] || 0) >= 20);
        check("wolf_hunter", () => (proxyState.stats.monsterKills['wolf'] || 0) >= 20);
        check("rich_man", () => {
            const stones = (proxyState.inventory || []).reduce((sum, item) => item.id === 'spirit_stone' ? sum + item.count : sum, 0);
            return stones >= 1000;
        });
        check("destroyer", () => proxyState.power >= 10000);
        check("cultivation_genius", () => proxyState.rankIndex >= 14); // Kết Đan Sơ Kỳ
        check("sect_loyalist", () => proxyState.sectContribution >= 1000);
        check("blood_thirsty", () => proxyState.stats.totalKills >= 500);
        check("heaven_sovereign", () => proxyState.rankIndex >= 31); // Độ Kiếp Sơ Kỳ

        // New Titles
        check("monster_hunter", () => proxyState.stats.totalKills >= 1000);
        check("invincible", () => (proxyState.stats.winStreak || 0) >= 50);
        check("god_of_slaughter", () => proxyState.stats.totalKills >= 5000);
        check("pill_master", () => (proxyState.stats.pillsUsed || 0) >= 200);
        check("heaven_luck", () => proxyState.luk >= 50);
        check("wanderer", () => (proxyState.stats.exploreCount || 0) >= 100);
        check("sect_elder", () => proxyState.sectContribution >= 10000);
        check("rebel", () => (proxyState.stats.sectsLeft || 0) >= 3);
        check("beast_friend", () => (proxyState.pets || []).length >= 3);

        if (newlyUnlocked.length > 0) {
            proxyState.unlockedTitles = unlocked;
            newlyUnlocked.forEach(id => {
                const title = GameData.titles[id];
                if (title && typeof UI !== 'undefined') {
                    UI.addLog(`🏆 THÀNH TỰU: Đạo hữu đã đạt được danh hiệu <b>[${title.name}]</b>!`, true);
                }
            });
            if (gameMethods && gameMethods.saveGame) gameMethods.saveGame();
        }
    };

    const handler = {
        set(target, key, value) {
            const triggerKeys = [
                'atk', 'def', 'thanphap', 'luk', 'hpMax', 'mpMax', 'staminaMax', 'currentTitleId', 'currentMp', 'power',
                'petAtkBuff', 'petDefBuff', 'equipAtkBuff', 'equipDefBuff', 
                'equipThanphapBuff', 'equipLukBuff', 'equipHpBuff', 'equipMpBuff',
                'equipHpMult', 'equipMpMult', 'equipStaMult',
                'eventAtkBonus', 'eventDefBonus', 'eventThanphapBonus', 'eventHpMaxBonus', 'eventMpMaxBonus',
                'rankIndex', 'hp', 'mana', 'stamina', 'shield', 'currentSectMissions', 'lastCheckIn', 'checkInDay',
                'sectContribution', 'activeSectMission', 'sectReputation', 'sectCheckInDay', 'sectLastCheckIn', 'skills', 'inventory',
                'currentSectId', 'equipments', 'mapExploration', 'toggledSkills', 'activePetId', 'activeBuffs', 'activeDebuffs',
                'pillCooldowns', 'pillUsage'
            ];
            
            const isTriggerKey = triggerKeys.includes(key) || key === 'stats' || key === 'pets';
            let oldTotals = null;
            if (isTriggerKey) {
                oldTotals = calculateTotals(target);
            }

            if (key === 'mana') {
                const curRank = GameData.ranks[target.rankIndex];
                const isMaskEquipped = target.equipments && target.equipments.head && target.equipments.head.id === 'item_mask_mysterious';
                
                if (isMaskEquipped && target.rankIndex >= 5) {
                    // Nếu đeo mặt nạ và đã đạt Luyện Khí Tầng 5 (index 5), linh khí không thể vượt quá yêu cầu đột phá
                    value = Math.min(value, curRank.expReq);
                } else {
                    const maxAllowedMana = Math.floor(curRank.expReq * 1.5);
                    value = Math.min(value, maxAllowedMana);
                }
            }
            
            // Đảm bảo HP, MP, Thể lực, Hộ thể không vượt quá giới hạn khi set trực tiếp
            if (key === 'hp' || key === 'currentMp' || key === 'stamina' || key === 'shield') {
                const totals = calculateTotals(target);
                let maxVal = 0;
                if (key === 'hp') maxVal = totals.totalHpMax;
                if (key === 'currentMp') maxVal = totals.maxMp;
                if (key === 'stamina') maxVal = totals.totalStaminaMax;
                if (key === 'shield') maxVal = Math.floor(totals.maxMp * 0.5);

                // Đảm bảo giá trị luôn nằm trong khoảng [0, maxVal]
                value = Math.max(0, Math.min(value, maxVal));

                // Chặn hồi phục tự nhiên trong trận chiến hoặc khi bị khóa chỉ số
                // Tuy nhiên, 'shield' (Hộ thể) là chỉ số chiến đấu nên LUÔN cho phép cập nhật
                const inBattle = isInBattle;
                if ((inBattle || target.isStatsFrozen) && key !== 'shield') {
                    // Chỉ chặn nếu giá trị mới LỚN HƠN giá trị cũ VÀ giá trị cũ không bị âm
                    // (Nếu giá trị mới NHỎ HƠN giá trị cũ, đó là nhận sát thương, KHÔNG ĐƯỢC CHẶN)
                    if (value > target[key] && target[key] >= 0) {
                        // Cho phép tăng HP/MP nếu đang trong trận chiến (có thể từ kỹ năng/hút máu)
                        // Nhưng chặn nếu là hồi phục tự nhiên (isStatsFrozen thường dùng cho việc này)
                        if (target.isStatsFrozen && !inBattle) {
                            return true;
                        }
                    }
                }
            }

            target[key] = value;
            
            if (isTriggerKey) {
                // Tự động kiểm tra danh hiệu
                checkTitles();

                const newTotals = calculateTotals(target);
                const breakdowns = newTotals.breakdowns;
                const totalAtk = newTotals.totalAtk;
                const totalDef = newTotals.totalDef;
                const totalThanphap = newTotals.totalThanphap;
                const totalLuk = newTotals.totalLuk;
                const totalHpMax = newTotals.totalHpMax;
                const maxMp = newTotals.maxMp;
                const totalStaminaMax = newTotals.totalStaminaMax;
                target.power = newTotals.power;

                // Điều chỉnh HP/MP/Stamina thực tế khi tối đa thay đổi
                if (oldTotals) {
                    if (newTotals.totalHpMax !== oldTotals.totalHpMax) {
                        const diff = newTotals.totalHpMax - oldTotals.totalHpMax;
                        // Chỉ tăng HP nếu HP hiện tại > 0 để tránh tự hồi phục khi tử trận
                        // Chỉ tăng HP nếu không trong trận chiến và không bị khóa chỉ số
                        if (diff > 0 && target.hp > 0 && !target.isStatsFrozen && !isInBattle) {
                            target.hp = Math.max(0, target.hp + diff);
                        }
                    }
                    // Luôn đảm bảo không vượt quá max mới (quan trọng khi giảm max)
                    if (target.hp > newTotals.totalHpMax) target.hp = newTotals.totalHpMax;
                    // Bỏ ép HP về 1 để cho phép hiển thị 0/Max khi tử trận
                    // if (target.hp < 1 && newTotals.totalHpMax > 0 && !isInBattle) target.hp = 1;

                    if (newTotals.maxMp !== oldTotals.maxMp) {
                        const diff = newTotals.maxMp - oldTotals.maxMp;
                        // Chỉ tăng MP nếu không trong trận chiến để tránh reset MP khi vào trận
                        if (diff > 0 && !target.isStatsFrozen && !isInBattle) {
                            target.currentMp = Math.max(0, target.currentMp + diff);
                        }
                    }
                    if (target.currentMp > newTotals.maxMp) target.currentMp = newTotals.maxMp;

                    if (newTotals.totalStaminaMax !== oldTotals.totalStaminaMax) {
                        const diff = newTotals.totalStaminaMax - oldTotals.totalStaminaMax;
                        if (diff > 0) {
                            target.stamina = Math.max(0, target.stamina + diff);
                        }
                    }
                    if (target.stamina > newTotals.totalStaminaMax) target.stamina = newTotals.totalStaminaMax;
                }
                
                if (typeof UI !== 'undefined') {
                    UI.updateStat('power', target.power);
                    
                    UI.updateStat('atk', totalAtk, 0, breakdowns.atk);
                    UI.updateStat('def', totalDef, 0, breakdowns.def);
                    UI.updateStat('thanphap', totalThanphap, 0, breakdowns.thanphap);
                    UI.updateStat('luk', totalLuk, 0, breakdowns.luk);
                    
                    UI.updateStat('hp', `${Math.floor(target.hp)}/${totalHpMax}`, 0, breakdowns.hpMax);
                    UI.updateBar('hp', target.hp, totalHpMax);
                    
                    UI.updateStat('mp', `${Math.floor(target.currentMp)}/${maxMp}`, 0, breakdowns.mpMax);
                    UI.updateBar('mp', target.currentMp, maxMp);
                    
                    UI.updateStat('stamina', `${Math.floor(target.stamina)}/${totalStaminaMax}`, 0, breakdowns.staminaMax);
                    UI.updateBar('stamina', target.stamina, totalStaminaMax);
                    
                    // Cập nhật Linh lực hộ thể
                    const currentMaxMp = newTotals ? newTotals.maxMp : (calculateTotals(target).maxMp);
                    UI.updateBar('player-shield', target.shield || 0, Math.floor(currentMaxMp * 0.5));
                    
                    const totalSpiritStones = (target.inventory || []).reduce((sum, item) => {
                        return item.id === 'spirit_stone' ? sum + item.count : sum;
                    }, 0);
                    UI.updateStat('spiritStone', totalSpiritStones);
                    
                    if (key === 'mapExploration' && !gameMethods.isInitialLoading) {
                        UI.renderMapList(target);
                    }
                    
                    if (typeof GameData !== 'undefined' && GameData.ranks[target.rankIndex]) {
                        const curRank = GameData.ranks[target.rankIndex];
                        UI.updateBar('mana', target.mana, curRank.expReq);
                        UI.updateStat('mana', `${Math.floor(target.mana)}/${curRank.expReq}`);
                        const rankNameEl = document.getElementById('rank-name');
                        if (rankNameEl) rankNameEl.innerText = curRank.name;
                    }

                    const titleData = (GameData.titles[target.currentTitleId] || GameData.titles["none"]);
                    const mainTitleEl = document.getElementById('main-player-title');
                    if (mainTitleEl) {
                        mainTitleEl.innerText = `[${titleData.name}]`;
                        mainTitleEl.style.color = titleData.color || "#888";
                        
                        // Cập nhật hiệu ứng danh hiệu
                        mainTitleEl.className = ""; // Reset classes
                        if (titleData.animation) {
                            mainTitleEl.classList.add(titleData.animation);
                        }
                    }

                    const mainNameEl = document.getElementById('main-player-name');
                    if (mainNameEl) mainNameEl.innerText = target.name || "Đạo Hữu";

                    // Cập nhật danh sách môn phái khi chỉ số thay đổi
                    if (UI.renderSectList) UI.renderSectList(target);

                    // Cập nhật Buffs/Debuffs khi có thay đổi
                    if (key === 'activeBuffs' || key === 'activeDebuffs') {
                        UI.renderDebuffs('player', target.activeBuffs || [], target.activeDebuffs || []);
                    }

                    // Cập nhật giao diện linh thú nếu có thay đổi liên quan
                    if (key === 'activePetId' || key === 'pets') {
                        const activePet = target.pets.find(p => p.uid === target.activePetId);
                        UI.updatePetUI(activePet);
                        if (activePet) {
                            UI.renderDebuffs('pet', activePet.activeBuffs || [], activePet.activeDebuffs || []);
                        }
                    }
                }
            }

            if (key === 'inventory') {
                if (typeof BagSystem !== 'undefined') BagSystem.renderBag(target.inventory);
                else if (typeof UI !== 'undefined' && UI.renderInventory) UI.renderInventory(target.inventory);
            }

            if (key === 'equipments') {
                if (typeof UI !== 'undefined' && UI.updateEquipUI) UI.updateEquipUI(target.equipments);
            }

            if (key === 'skills') {
                if (typeof UI !== 'undefined' && UI.renderPlayerSkills) UI.renderPlayerSkills(target.skills);
            }

            return true;
        },
        get(target, key) {
            if (key === 'rankId') return (target.rankIndex || 0) + 1;
            if (key === 'rankName') {
                if (typeof GameData === 'undefined' || !GameData.ranks) return "Phàm Nhân";
                const r = GameData.ranks[target.rankIndex || 0];
                return r ? r.name : "Phàm Nhân";
            }
            return target[key];
        }
    };

    const proxyState = new Proxy(state, handler);

    // Khởi tạo các giá trị tính toán ban đầu để tránh lỗi hiển thị (như Lực chiến = 0)
    const initialTotals = calculateTotals(state);
    state.power = initialTotals.power;

    const gameMethods = {
        get isInBattle() { return isInBattle; },
        set isInBattle(val) { isInBattle = val; },
        isInitialLoading: false,
        getProxy: () => proxyState,
        getTotals: () => calculateTotals(state),
        
        /**
         * Tính toán chỉ số cơ bản của từng cảnh giới dựa trên hệ số tăng trưởng.
         */
        calculateRankBaseStats: function() {
            if (this._rankBases) return this._rankBases;

            const initialStats = {
                hpMax: 100,
                atk: 10,
                def: 5,
                thanphap: 5,
                luk: 1,
                mpMax: 50
            };
            
            let currentStats = { ...initialStats };
            const rankBases = [];
            
            if (typeof GameData !== 'undefined' && GameData.ranks) {
                GameData.ranks.forEach((rank, index) => {
                    if (index > 0) {
                        const multiplier = rank.mult || 1.2;
                        currentStats.atk = Math.floor(currentStats.atk * multiplier);
                        currentStats.def = Math.floor(currentStats.def * multiplier);
                        currentStats.thanphap = Math.floor(currentStats.thanphap * multiplier);
                        currentStats.luk = Math.floor(currentStats.luk * multiplier);
                        currentStats.hpMax = Math.floor(currentStats.hpMax * multiplier);
                        currentStats.mpMax = Math.floor(currentStats.mpMax * multiplier);
                    }
                    
                    // Tính toán "Lực chiến cơ bản" cho cảnh giới này (không tính kỹ năng/trang bị)
                    const basePower = Math.floor(
                        currentStats.atk * 2.5 + 
                        currentStats.def * 1.8 + 
                        currentStats.thanphap * 4 + 
                        (currentStats.hpMax / 10) * 0.15 + 
                        (currentStats.mpMax / 10) * 0.15 + 
                        currentStats.luk * 10
                    );
                    
                    rankBases.push({
                        atk: currentStats.atk,
                        def: currentStats.def,
                        thanphap: currentStats.thanphap,
                        hpMax: currentStats.hpMax,
                        mpMax: currentStats.mpMax,
                        luk: currentStats.luk,
                        power: basePower,
                        name: rank.name,
                        index: index
                    });
                });
            }
            
            this._rankBases = rankBases;
            return rankBases;
        },

        /**
         * Xác định cảnh giới thực tế của một thực thể dựa trên chỉ số của nó.
         * Nếu chỉ số > 90% chỉ số cơ bản của cảnh giới A, thực thể đó được xếp vào cảnh giới A.
         */
        getEffectiveRank: function(entityStats) {
            const rankBases = this.calculateRankBaseStats();
            if (!rankBases || rankBases.length === 0) return 0;

            // Tính lực chiến của thực thể (chỉ dựa trên chỉ số cơ bản)
            const entityPower = Math.floor(
                (entityStats.atk || 0) * 2.5 + 
                (entityStats.def || 0) * 1.8 + 
                (entityStats.thanphap || 0) * 4 + 
                ((entityStats.hp || entityStats.hpMax || 0) / 10) * 0.15 + 
                ((entityStats.mp || entityStats.mpMax || 0) / 10) * 0.15 + 
                (entityStats.luk || 0) * 10
            );
            
            let effectiveRankIndex = 0;
            // Duyệt từ cao xuống thấp để tìm cảnh giới cao nhất thỏa mãn điều kiện 90%
            for (let i = rankBases.length - 1; i >= 0; i--) {
                if (entityPower >= rankBases[i].power * 0.9) {
                    effectiveRankIndex = i;
                    break;
                }
            }
            return effectiveRankIndex;
        },

        /**
         * Lấy hệ số nhân tổng hợp của một cảnh giới so với Phàm Nhân.
         */
        getRankMultiplier: function(rankIndex) {
            const rankBases = this.calculateRankBaseStats();
            if (!rankBases || rankBases.length === 0) return 1.0;
            const targetRank = rankBases[rankIndex] || rankBases[rankBases.length - 1];
            const phamNhan = rankBases[0];
            return targetRank.hpMax / phamNhan.hpMax;
        },

        /**
         * Lấy chỉ số đại cảnh giới (0: Phàm Nhân, 1: Luyện Khí, 2: Trúc Cơ, ...)
         */
        getMajorRankIndex: getMajorRankIndex,

        recalculateStats: function() {
            const totals = calculateTotals(state);
            proxyState.power = totals.power;
            // The proxy set handler will update the UI
        },

        /**
         * Ghi lại một hành động của người chơi.
         * Nếu hành động có tác động đến linh thú (ví dụ: cho ăn, cưỡi, xuất chiến), 
         * linh thú đó sẽ được đánh dấu là "đã tương tác" trong chu kỳ 30 hành động.
         */
        recordAction: function(interactedPetUid = null) {
            if (interactedPetUid) {
                if (!proxyState.interactedPetUids.includes(interactedPetUid)) {
                    proxyState.interactedPetUids = [...proxyState.interactedPetUids, interactedPetUid];
                }
            }
            
            // Linh thú đang xuất chiến nhận linh khí từ hành động của chủ nhân
            if (proxyState.activePetId) {
                const activePet = proxyState.pets.find(p => p.uid === proxyState.activePetId);
                if (activePet) {
                    activePet.spirit = (activePet.spirit || 0) + 1;
                    // Cập nhật UI nếu đang ở tab pet
                    if (typeof UI !== 'undefined' && UI.lastTab === 'pet') {
                        UI.renderPetTab(proxyState);
                    }
                }
            }
            
            proxyState.neglectCount++;
            
            if (proxyState.neglectCount >= 30) {
                // Linh thú đang xuất chiến (activePetId) sẽ không bị giảm trung thành
                const neglectedPets = proxyState.pets.filter(p => 
                    !proxyState.interactedPetUids.includes(p.uid) && 
                    p.uid !== proxyState.activePetId
                );
                
                if (neglectedPets.length > 0) {
                    neglectedPets.forEach(p => {
                        const oldLoyalty = p.loyalty || 60;
                        p.loyalty = Math.max(0, oldLoyalty - 1);
                    });
                    
                    const petNames = neglectedPets.map(p => {
                        return `[${PetSystem.getPetDisplayName(p.uid, proxyState.pets)}]`;
                    }).join(", ");
                    UI.addLog(`⏳ Sau 30 hành động bỏ bê, linh thú ${petNames} cảm thấy bị bỏ rơi, trung thành giảm <b style="color:#ff4444">-1</b>.`);
                    
                    // Cập nhật lại mảng pets để trigger proxy
                    proxyState.pets = [...proxyState.pets];
                }
                
                // Reset chu kỳ
                proxyState.neglectCount = 0;
                proxyState.interactedPetUids = [];
            }
        },

        setActivePet: function(petIdOrUid, force = false) {
            if (!petIdOrUid) {
                proxyState.activePetId = null;
                this.recalculateStats();
                
                // Cập nhật UI nếu đang ở tab linh thú
                if (typeof UI !== 'undefined' && UI.renderPetTab) {
                    UI.renderPetTab(proxyState);
                }
                
                return true;
            }
            
            // Tìm linh thú cụ thể trong danh sách (hỗ trợ cả string ID cũ và object mới)
            const pet = proxyState.pets.find(p => {
                if (typeof p === 'string') return p === petIdOrUid;
                return p.uid === petIdOrUid || p.id === petIdOrUid;
            });
            
            if (pet) {
                // Ưu tiên sử dụng UID để tránh trùng lặp hiển thị khi có nhiều linh thú cùng loại
                const targetId = (typeof pet === 'object' && pet.uid) ? pet.uid : (typeof pet === 'string' ? pet : pet.id);
                
                // Kiểm tra cảnh giới nếu không phải force
                if (!force && typeof PetSystem !== 'undefined') {
                    const petRankIndex = PetSystem.getPetRankIndex(pet.id, pet.level, pet.statMultiplier || 1.0);
                    const playerRankIndex = proxyState.rankIndex || 0;
                    if (petRankIndex > playerRankIndex) {
                        // Nếu quá mạnh mà không force thì không cho xuất chiến (UI sẽ xử lý confirm)
                        return false;
                    }
                }

                // Nếu force xuất chiến khi quá mạnh, đánh dấu sẽ bỏ đi sau trận đấu
                if (force && typeof PetSystem !== 'undefined') {
                    const petRankIndex = PetSystem.getPetRankIndex(pet.id, pet.level, pet.statMultiplier || 1.0);
                    const playerRankIndex = proxyState.rankIndex || 0;
                    if (petRankIndex > playerRankIndex) {
                        pet.willLeaveAfterBattle = true;
                        UI.addLog(`⚠️ <b>${PetSystem.getPetData(pet.id).name}</b> đang rất không hài lòng, nó sẽ bỏ đi sau trận chiến tới!`, "red");
                    }
                }

                proxyState.activePetId = targetId;
                this.recalculateStats();
                
                // Ghi lại hành động tương tác với linh thú
                this.recordAction(targetId);
                
                // Cập nhật UI nếu đang ở tab linh thú
                if (typeof UI !== 'undefined' && UI.renderPetTab) {
                    UI.renderPetTab(proxyState);
                }
                
                return true;
            }
            return false;
        },

        toggleMount: function(petUid) {
            if (!petUid) return false;
            
            const pet = proxyState.pets.find(p => p.uid === petUid);
            if (!pet) return false;

            if (proxyState.mountedPetUid === petUid) {
                // Đang cưỡi con này -> Xuống thú
                proxyState.mountedPetUid = null;
                UI.addLog("🏇 Đạo hữu đã xuống thú.");
            } else {
                // Đang cưỡi con khác hoặc chưa cưỡi
                if (proxyState.mountedPetUid) {
                    const otherPetName = PetSystem.getPetDisplayName(proxyState.mountedPetUid, proxyState.pets);
                    UI.addLog(`❌ Đạo hữu đang cưỡi [${otherPetName}]. Hãy xuống thú trước khi cưỡi con khác.`);
                    return false;
                }
                
                proxyState.mountedPetUid = petUid;
                const petName = PetSystem.getPetDisplayName(petUid, proxyState.pets);
                UI.addLog(`🏇 Đạo hữu đã cưỡi lên [${petName}]. Tốc độ di chuyển tăng nhẹ!`);
                
                // Tăng trung thành khi cưỡi
                if (typeof PetSystem !== 'undefined') {
                    PetSystem.increaseLoyalty(proxyState, petUid, 2);
                }
                // Ghi lại hành động tương tác với linh thú
                this.recordAction(petUid);
            }
            
            this.recalculateStats();
            
            // Cập nhật UI nếu đang ở tab linh thú
            if (typeof UI !== 'undefined' && UI.renderPetTab) {
                UI.renderPetTab(proxyState);
            }
            
            return true;
        },

        setMountedPet: function(petUid) {
            if (!petUid) {
                if (proxyState.mountedPetUid) {
                    proxyState.mountedPetUid = null;
                    UI.addLog("🏇 Đạo hữu đã xuống thú.");
                    this.recalculateStats();
                    
                    // Cập nhật UI nếu đang ở tab linh thú
                    if (typeof UI !== 'undefined' && UI.renderPetTab) {
                        UI.renderPetTab(proxyState);
                    }
                }
                return true;
            }
            
            // Nếu truyền petUid, ta kiểm tra xem có đang cưỡi con đó không
            if (proxyState.mountedPetUid === petUid) {
                // Đang cưỡi -> Xuống thú
                proxyState.mountedPetUid = null;
                UI.addLog("🏇 Đạo hữu đã xuống thú.");
                this.recalculateStats();
                
                // Cập nhật UI nếu đang ở tab linh thú
                if (typeof UI !== 'undefined' && UI.renderPetTab) {
                    UI.renderPetTab(proxyState);
                }
                
                return true;
            } else {
                // Chưa cưỡi hoặc đang cưỡi con khác -> Gọi toggleMount để xử lý logic cưỡi mới
                return this.toggleMount(petUid);
            }
        },

        saveGame: function() {
            localStorage.setItem('TuTien_SaveData', JSON.stringify({ state }));
            if (typeof UI !== 'undefined') UI.addLog("Hệ thống: Đã ghi lại thần thức (Save)!", true);
        },

        loadGame: function() {
            const saved = localStorage.getItem('TuTien_SaveData');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    for (let key in data.state) {
                        proxyState[key] = data.state[key];
                    }
                    
                    // Migration for pets: Đảm bảo mọi linh thú đều có UID duy nhất và chỉ số riêng biệt
                    if (proxyState.pets && Array.isArray(proxyState.pets)) {
                        let changed = false;
                        const migratedPets = proxyState.pets.map((p, i) => {
                            let petObj = p;
                            if (typeof p === 'string') {
                                changed = true;
                                petObj = {
                                    uid: `pet_migrated_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
                                    id: p,
                                    level: 1,
                                    exp: 0,
                                    obtainTime: Date.now()
                                };
                            } else if (typeof p === 'object' && !p.uid) {
                                changed = true;
                                petObj = {
                                    ...p,
                                    uid: `pet_migrated_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`
                                };
                            }

                            // Đảm bảo có statMultiplier và isMutated
                            if (petObj.statMultiplier === undefined) {
                                changed = true;
                                petObj.statMultiplier = 0.95 + (Math.random() * 0.1);
                                if (petObj.isMutated === undefined) {
                                    petObj.isMutated = Math.random() < 0.1;
                                    if (petObj.isMutated) petObj.statMultiplier += 0.1;
                                }
                            }
                            return petObj;
                        });
                        
                        if (changed) {
                            proxyState.pets = migratedPets;
                            // Cập nhật activePetId nếu nó đang dùng ID cũ (string ID có trong GameData.pets)
                            if (proxyState.activePetId && typeof GameData !== 'undefined' && GameData.pets && GameData.pets[proxyState.activePetId]) {
                                const firstMatch = migratedPets.find(p => p.id === proxyState.activePetId);
                                if (firstMatch && firstMatch.uid) {
                                    console.log(`Migration: Cập nhật activePetId từ ${proxyState.activePetId} sang UID ${firstMatch.uid}`);
                                    proxyState.activePetId = firstMatch.uid;
                                }
                            }
                            this.saveGame();
                        }
                    }

                    if (!proxyState.sectReputation) proxyState.sectReputation = {};
                    if (proxyState.mpMax === undefined) {
                        proxyState.mpMax = (proxyState.rankIndex + 1) * 50;
                    }
                } catch (e) {
                    console.error("Lỗi nạp Save:", e);
                }
            }
        },

        _getRandom: (list) => list[Math.floor(Math.random() * list.length)],

        pickStartingGift: function(giftType) {
            console.log("Picking gift:", giftType, "Choices left:", proxyState.giftChoicesLeft);
            if (proxyState.giftChoicesLeft <= 0) return;
            if (proxyState.pickedGifts.includes(giftType)) return;

            if (proxyState.giftChoicesLeft === 2) {
                this.rollBoneQuality(false, 'start');
            }

            try {
                if (giftType === 'gift_pills') {
                    // Cân bằng: Tặng 5 Hồi Xuân Đan và 2 Tẩy Tủy Đan
                    this.addItems([
                        { id: 'hp_pill_1', count: 5 },
                        { id: 'item_tay_tuy_dan', count: 2 }
                    ]);
                } 
                else if (giftType === 'gift_equips') {
                    // Cân bằng: Tặng 1 Thanh Mộc Kiếm và 1 Giáp Da
                    // Đảm bảo ít nhất 1 trong 2 món có may mắn
                    const forceLuckIndex = Math.floor(Math.random() * 2);
                    this.addItems([
                        { id: 'weapon_wooden_sword', count: 1, forceLuck: forceLuckIndex === 0 },
                        { id: 'body_leather_armor', count: 1, forceLuck: forceLuckIndex === 1 }
                    ]);
                } 
                else if (giftType === 'gift_skills') {
                    // Cân bằng: Nhận cả 2 bí tịch cơ bản
                    this.addItems([
                        { id: 'book_tram_thien', count: 1 },
                        { id: 'book_aura_shield_low', count: 1 }
                    ]);
                }
                else if (giftType === 'gift_pets') {
                    // Nhận 2 Trứng linh thú (Linh cấp) và 2 Thức ăn linh thú
                    this.addItems([
                        { id: 'pet_egg_linh', count: 2 },
                        { id: 'pet_food_basic', count: 2 }
                    ]);
                    UI.addLog(`🐾 Đạo hữu nhận được <b>2 Trứng linh thú (Linh cấp)</b> và <b>2 Thức ăn linh thú</b> khởi đầu!`);
                }

                proxyState.pickedGifts = [...proxyState.pickedGifts, giftType];
                proxyState.giftChoicesLeft--;

                if (proxyState.giftChoicesLeft <= 0) {
                    this.generateDailyMissions();
                    UI.addLog("📅 Hệ thống nhiệm vụ hàng ngày đã được kích hoạt!", "info");
                }

                UI.renderStartScreen(proxyState);
                this.saveGame();
            } catch (e) {
                console.error("Error picking gift:", e);
            }
        },

        learnSkill: function(itemId) {
            const itemData = GameData.items[itemId];
            if (!itemData || itemData.type !== 'skill_book') return "❌ Bí tịch này không thể lĩnh ngộ!";

            const skillId = itemData.skillId; 
            return this.learnSkillById(skillId);
        },

        checkTitles: checkTitles,

        setPlayerTitle: function(titleId) {
            if (!proxyState.unlockedTitles.includes(titleId)) return false;
            proxyState.currentTitleId = titleId;
            UI.addLog(`🎭 Đạo hữu đã thay đổi danh hiệu thành <b>[${GameData.titles[titleId].name}]</b>.`);
            this.saveGame();
            return true;
        },

        joinSect: function(sectId) {
            const sect = GameData.sects[sectId];
            if (!sect) return;

            if (proxyState.currentSectId) {
                UI.openModal("GIA NHẬP MÔN PHÁI", `❌ Đạo hữu đã có môn phái, hãy xuất sư trước khi gia nhập phái mới!`, false);
                return;
            }

            if (proxyState.rankIndex < sect.reqRank) {
                UI.openModal("GIA NHẬP MÔN PHÁI", `❌ Cảnh giới không đủ!<br>Yêu cầu: <b style="color: #d4af37">${GameData.ranks[sect.reqRank].name}</b>.<br>Hiện tại: <b style="color: #aaa">${GameData.ranks[proxyState.rankIndex].name}</b>.`, false);
                return;
            }

            if (proxyState.power < sect.reqPower) {
                UI.openModal("GIA NHẬP MÔN PHÁI", `❌ Lực chiến không đủ!<br>Yêu cầu: <b style="color: #ff4500">${(sect.reqPower || 0).toLocaleString()}</b>.<br>Hiện tại: <b style="color: #aaa">${(proxyState.power || 0).toLocaleString()}</b>.`, false);
                return;
            }

            const repValue = proxyState.sectReputation[sectId] || 0;
            if (repValue < 0) {
                const repInfo = UI.getReputationInfo(repValue);
                UI.openModal("GIA NHẬP MÔN PHÁI", `❌ Môn phái này đang có ác cảm với đạo hữu (<b>${repInfo.name}</b>), không thể gia nhập!<br><br><small style="color: #888">Hãy làm nhiệm vụ hoặc tặng quà để cải thiện quan hệ.</small>`, false);
                return;
            }

            proxyState.currentSectId = sectId;
            proxyState.sectContribution = proxyState.sectContributions[sectId] || 0;
            
            // Khởi tạo danh vọng nếu chưa có
            if (proxyState.sectReputation[sectId] === undefined) {
                proxyState.sectReputation[sectId] = 0;
            }
            
            UI.addLog(`✨ Chúc mừng đạo hữu đã gia nhập <b>${sect.name}</b>!`, true);
            
            // Hiển thị modal thông báo thành công với nút Quay Lại đặc biệt
            const modal = document.getElementById('info-modal');
            if (modal) {
                document.getElementById('modal-title').innerHTML = "GIA NHẬP MÔN PHÁI";
                document.getElementById('modal-desc').innerHTML = `✨ Chúc mừng đạo hữu đã gia nhập <b style="color: #d4af37">${sect.name}</b>!<br><br>Bây giờ đạo hữu có thể thực hiện nhiệm vụ và học thần thông của môn phái.`;
                const ctrl = document.getElementById('modal-controls');
                if (ctrl) {
                    ctrl.innerHTML = '';
                    const backBtn = document.createElement('button');
                    backBtn.className = "btn-main btn-gray";
                    backBtn.style.flex = "1";
                    backBtn.style.padding = "6px 12px";
                    backBtn.style.fontSize = "0.75rem";
                    backBtn.innerText = "QUAY LẠI";
                    backBtn.onclick = () => {
                        UI.closeModal();
                        // Chuyển sang tab Môn Phái (Đại Điện)
                        if (UI.showTab) UI.showTab('sect');
                    };
                    ctrl.appendChild(backBtn);
                }
                modal.style.display = 'flex';
            }
            
            this.refreshSectMissions();
            this.saveGame();
        },

        leaveSect: function() {
            if (!proxyState.currentSectId) return;
            
            const sectId = proxyState.currentSectId;
            const sect = GameData.sects[sectId];
            
            // Lưu cống hiến hiện tại trước khi rời
            proxyState.sectContributions[sectId] = proxyState.sectContribution;
            
            // Giảm nhẹ danh vọng khi rời phái
            proxyState.sectReputation[sectId] = (proxyState.sectReputation[sectId] || 0) - 100;
            
            proxyState.currentSectId = null;
            proxyState.currentSectMissions = [];
            proxyState.activeSectMission = null;
            
            // Theo dõi số môn phái đã rời
            proxyState.stats.sectsLeft = (proxyState.stats.sectsLeft || 0) + 1;
            
            UI.addLog(`👋 Đạo hữu đã rời khỏi <b>${sect.name}</b>. Danh vọng tại đây giảm nhẹ! (-100 Danh vọng)`, true);
            checkTitles();
            this.saveGame();
        },

        giftToSect: function(itemId, amount = 1, targetSectId = null) {
            const sectId = targetSectId || proxyState.currentSectId;
            if (!sectId) {
                UI.addLog("❌ Đạo hữu cần chọn môn phái trước khi tặng quà!", false, "fail");
                return false;
            }

            const item = GameData.items[itemId];
            if (!item || item.type !== 'gift') {
                UI.addLog("❌ Vật phẩm này không thể dùng làm quà tặng!", false, "fail");
                return false;
            }

            const invItem = proxyState.inventory.find(i => i.id === itemId);
            if (!invItem || invItem.count < amount) {
                UI.addLog("❌ Đạo hữu không đủ vật phẩm!", false, "fail");
                return false;
            }

            // Tính toán danh vọng nhận được
            const repGain = (item.reputationValue || 10) * amount;
            
            // Cập nhật danh vọng
            if (proxyState.sectReputation[sectId] === undefined) {
                proxyState.sectReputation[sectId] = 0;
            }
            proxyState.sectReputation[sectId] += repGain;
            
            // Trừ vật phẩm
            invItem.count -= amount;
            if (invItem.count <= 0) {
                proxyState.inventory = proxyState.inventory.filter(i => i.id !== itemId);
            }

            this.incrementDailyMissionProgress('giveGift', 1);

            UI.addLog(`🎁 Đạo hữu đã tặng <b>${amount}x ${item.name}</b> cho <b>${GameData.sects[sectId].name}</b>. Nhận được <b>+${repGain}</b> Danh vọng!`, true, "success");
            this.saveGame();
            return true;
        },

        giftSpiritToSect: function(amount, targetSectId = null) {
            const sectId = targetSectId || proxyState.currentSectId;
            if (!sectId) {
                UI.addLog("❌ Đạo hữu cần chọn môn phái trước khi tặng linh thạch!", false, "fail");
                return false;
            }

            if (amount <= 0) return false;
            if (proxyState.spiritStone < amount) {
                UI.addLog("❌ Đạo hữu không đủ linh thạch!", false, "fail");
                return false;
            }

            const currentGifted = proxyState.sectSpiritGifts[sectId] || 0;
            const maxGift = 10000;
            const remaining = maxGift - currentGifted;

            if (remaining <= 0) {
                UI.addLog("❌ Đạo hữu đã tặng tối đa linh thạch cho môn phái này!", false, "fail");
                return false;
            }

            const actualGift = Math.min(amount, remaining);
            const contribGain = Math.floor(actualGift / 5);

            if (contribGain <= 0) {
                UI.addLog("❌ Số lượng linh thạch quá ít để đổi lấy cống hiến! (5 Linh thạch = 1 Cống hiến)", false, "fail");
                return false;
            }

            // Cập nhật trạng thái
            proxyState.spiritStone -= actualGift;
            
            if (proxyState.sectContributions[sectId] === undefined) {
                proxyState.sectContributions[sectId] = 0;
            }
            proxyState.sectContributions[sectId] += contribGain;

            if (sectId === proxyState.currentSectId) {
                proxyState.sectContribution = proxyState.sectContributions[sectId];
            }
            
            if (proxyState.sectSpiritGifts[sectId] === undefined) {
                proxyState.sectSpiritGifts[sectId] = 0;
            }
            proxyState.sectSpiritGifts[sectId] += actualGift;

            UI.addLog(`💎 Đạo hữu đã tặng <b>${(actualGift || 0).toLocaleString()}</b> Linh thạch cho <b>${GameData.sects[sectId].name}</b>. Nhận được <b>+${contribGain}</b> Cống hiến!`, true, "success");
            UI.addLog(`📊 Tổng linh thạch đã tặng: <b>${(proxyState.sectSpiritGifts[sectId] || 0).toLocaleString()} / ${(maxGift || 0).toLocaleString()}</b>`, false);
            
            this.saveGame();
            return true;
        },

        /**
         * Lấy class animation của danh hiệu hiện tại
         */
        getTitleAnimation: function() {
            if (!proxyState) return "";
            const title = GameData.titles[proxyState.currentTitleId];
            return title ? (title.animation || "") : "";
        },

        claimAttendanceReward: function() {
            const sectId = proxyState.currentSectId;
            if (!sectId) return;
            
            const now = new Date();
            const todayStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
            
            // Khởi tạo nếu chưa có
            if (!proxyState.sectLastCheckIn) proxyState.sectLastCheckIn = {};
            if (!proxyState.sectCheckInDay) proxyState.sectCheckInDay = {};

            const lastCheckIn = proxyState.sectLastCheckIn[sectId] || 0;
            const lastCheckInDate = new Date(lastCheckIn);
            const lastCheckInStr = lastCheckInDate.getFullYear() + '-' + (lastCheckInDate.getMonth() + 1) + '-' + lastCheckInDate.getDate();

            if (todayStr === lastCheckInStr) {
                UI.addLog("⏳ Hôm nay đạo hữu đã điểm danh rồi, hãy quay lại sau!");
                return;
            }

            // Increment day
            const currentDay = proxyState.sectCheckInDay[sectId] || 0;
            const nextDay = currentDay + 1;
            
            // Calculate rewards
            const rewardContrib = Math.floor(20 * Math.pow(1.5, nextDay - 1));
            const rewardMana = 50 + (proxyState.rankIndex * 20) + (nextDay * 10);
            const rewardStone = Math.floor(100 * Math.pow(1.2, nextDay - 1));
            
            // Update state
            const newLastCheckIn = { ...proxyState.sectLastCheckIn };
            newLastCheckIn[sectId] = Date.now();
            proxyState.sectLastCheckIn = newLastCheckIn;

            const newCheckInDay = { ...proxyState.sectCheckInDay };
            newCheckInDay[sectId] = nextDay;
            proxyState.sectCheckInDay = newCheckInDay;

            proxyState.mana += rewardMana;
            proxyState.sectContribution += rewardContrib;
            this.addItem('spirit_stone', rewardStone);
            
            UI.addLog(`✅ Điểm danh <b>Ngày ${nextDay}</b> thành công! Nhận được <b>${rewardMana} Linh khí</b>, <b>${rewardContrib} Cống hiến</b> và <b>${rewardStone} 💎 Linh Thạch</b>.`);
            
            // Reset if day 7
            if (nextDay >= 7) {
                const resetCheckInDay = { ...proxyState.sectCheckInDay };
                resetCheckInDay[sectId] = 0;
                proxyState.sectCheckInDay = resetCheckInDay;
                UI.addLog("✨ Đã hoàn thành tuần điểm danh! Tuần mới sẽ bắt đầu vào ngày mai.");
            }
            
            this.saveGame();
            
            // Refresh UI if open
            if (typeof UI !== 'undefined' && UI.showSectAttendance) {
                UI.showSectAttendance();
            }
        },

        refreshSectMissions: function() {
            if (!proxyState.currentSectId) return;

            const sect = GameData.sects[proxyState.currentSectId];
            const side = sect.side;

            const missionPool = [
                { id: "m1", name: "Tuần tra sơn môn", desc: "Đi dạo quanh môn phái để đảm bảo an ninh.", reward: 30, contrib: 15, time: 10, type: "normal", location: "internal" },
                { id: "m2", name: "Luyện đan giúp trưởng lão", desc: "Hỗ trợ luyện chế đan dược cơ bản.", reward: 50, contrib: 25, time: 15, type: "normal", location: "internal" },
                { id: "m3", name: "Quét dọn tàng kinh các", desc: "Làm sạch bụi bặm nơi lưu giữ bí tịch.", reward: 40, contrib: 20, time: 12, type: "normal", location: "internal" },
                { id: "m4", name: "Hái thuốc linh thảo", desc: "Tìm kiếm dược liệu quý trong rừng sâu.", reward: 60, contrib: 30, time: 20, type: "normal", location: "external" },
                { id: "m5", name: "Rèn luyện đệ tử mới", desc: "Hướng dẫn các đệ tử nhập môn luyện tập.", reward: 45, contrib: 22, time: 18, type: "normal", location: "internal" },
                { id: "m6", name: "Trừ khử yêu thú ngoại vi", desc: "Tiêu diệt đám yêu thú đang quấy nhiễu dân làng dưới núi.", reward: 80, contrib: 40, time: 25, type: "combat", location: "external" },
                { id: "m7", name: "Truy tìm phản đồ", desc: "Lùng sục tung tích của kẻ phản bội môn phái.", reward: 100, contrib: 50, time: 30, type: "combat", location: "external" },
                { id: "m8", name: "Trấn áp yêu ma", desc: "Vào trong yêu động để trấn áp lũ ma vật đang thức tỉnh.", reward: 120, contrib: 60, time: 30, type: "combat", location: "external" },
                { id: "m9", name: "Hộ tống linh xa", desc: "Bảo vệ xe chở linh thạch của môn phái khỏi đám thảo khấu.", reward: 70, contrib: 35, time: 22, type: "combat", location: "external" },
                { id: "m10", name: "Thanh trừng phỉ tặc", desc: "Dọn dẹp hang ổ của đám phỉ tặc chuyên cướp bóc người tu hành.", reward: 90, contrib: 45, time: 28, type: "combat", location: "external" }
            ];

            // Thêm nhiệm vụ theo phe
            if (side === "Chính phái") {
                missionPool.push(
                    { id: "m_righteous_1", name: "Tiêu diệt đệ tử Nhật Nguyệt Thần Giáo", desc: "Đám đệ tử Nhật Nguyệt Thần Giáo đang lảng vảng gần đây, hãy trừ khử chúng.", reward: 150, contrib: 75, time: 35, type: "combat", location: "external" },
                    { id: "m_righteous_2", name: "Phá hủy tế đàn tà ác", desc: "Một tế đàn tà ác vừa được dựng lên, hãy phá hủy nó ngay lập tức.", reward: 180, contrib: 90, time: 40, type: "combat", location: "external" }
                );
            } else if (side === "Tà phái") {
                missionPool.push(
                    { id: "m_evil_1", name: "Ám sát đệ tử Chính phái", desc: "Bọn đệ tử Chính phái đạo đức giả cần phải được thanh trừng.", reward: 150, contrib: 75, time: 35, type: "combat", location: "external" },
                    { id: "m_evil_2", name: "Cướp bóc linh thạch", desc: "Chặn đường cướp bóc đoàn xe linh thạch của bọn Chính phái.", reward: 180, contrib: 90, time: 40, type: "combat", location: "external" }
                );
            }
            
            // Lấy ngẫu nhiên 3 nhiệm vụ
            const shuffled = [...missionPool].sort(() => 0.5 - Math.random());
            proxyState.currentSectMissions = shuffled.slice(0, 3);
        },

        startSectMission: function(missionId) {
            // Kiểm tra trạng thái trọng thương (HP < 5%)
            const totals = this.getTotals();
            if (proxyState.hp < totals.totalHpMax * 0.05) {
                if (typeof UI !== 'undefined') {
                    UI.openModal("CẢNH BÁO TRỌNG THƯƠNG", `❌ Đạo hữu đang bị trọng thương (HP < 5%), hãy nghỉ ngơi dưỡng sức chút rồi hãy tiếp tục làm nhiệm vụ.`, false);
                }
                return;
            }

            if (proxyState.activeSectMission) {
                UI.addLog("❌ Đạo hữu đang thực hiện một nhiệm vụ khác!");
                return;
            }

            const mission = proxyState.currentSectMissions.find(m => m.id === missionId);
            if (!mission) return;

            let speedMod = 1;
            let mountBonusMsg = "";
            
            // Xử lý tiêu tốn thể lực linh thú và tốc độ nhiệm vụ
            if (proxyState.mountedPetUid && typeof PetSystem !== 'undefined') {
                const pet = proxyState.pets.find(p => p.uid === proxyState.mountedPetUid);
                if (pet) {
                    const petStats = PetSystem.getPetStats(pet.id, pet.level || 1, pet.statMultiplier || 1.0);
                    // Tiêu tốn 15 thể lực khi cưỡi
                    pet.stamina = Math.max(0, (pet.stamina || 0) - 15);
                    
                    // Tính toán giảm thời gian dựa trên tốc độ
                    const petSpeed = petStats.thanphap || 0;
                    let reduction = 0.1; // Mặc định 10%
                    if (petSpeed >= 100) reduction = 0.2; // 20%
                    else if (petSpeed >= 50) reduction = 0.15; // 15%
                    
                    speedMod = 1 - reduction;
                    mountBonusMsg = ` (🏇 Cưỡi thú: -${reduction * 100}% thời gian)`;
                    
                    // Tự động xuống thú nếu hết thể lực
                    if (pet.stamina <= 0) {
                        proxyState.mountedPetUid = null;
                        if (typeof UI !== 'undefined') {
                            UI.addLog(`🏇 Linh thú <b style="color:#ffeb3b">${PetSystem.getPetDisplayName(pet.uid, proxyState.pets)}</b> đã kiệt sức, đạo hữu phải xuống thú!`);
                            if (UI.renderPetTab) UI.renderPetTab(proxyState);
                        }
                    }
                    
                    // Cập nhật lại mảng pets để trigger proxy
                    proxyState.pets = [...proxyState.pets];
                }
            } else if (proxyState.activePetId && typeof PetSystem !== 'undefined') {
                const pet = proxyState.pets.find(p => p.uid === proxyState.activePetId);
                if (pet) {
                    // Tiêu tốn 5 thể lực khi xuất chiến nhưng không cưỡi
                    pet.stamina = Math.max(0, (pet.stamina || 0) - 5);
                    proxyState.pets = [...proxyState.pets];
                }
            }

            const actualTime = Math.max(1, Math.floor(mission.time * speedMod));

            proxyState.activeSectMission = {
                ...mission,
                progress: 0,
                combatCount: 0,
                objectiveMet: false,
                startTime: Date.now(),
                actualTime: actualTime
            };
            
            UI.addLog(`🚀 Bắt đầu nhiệm vụ: <b>${mission.name}</b>. Dự kiến hoàn thành sau ${actualTime} giây.${mountBonusMsg}`);
            if (UI.showSectMissions) UI.showSectMissions();
        },

        updateSectMission: function() {
            if (!proxyState.activeSectMission || this.isInBattle) return;

            // Tạm dừng nếu đang mở Modal
            if (typeof UI !== 'undefined' && UI.isModalOpen && UI.isModalOpen()) return;

            const mission = proxyState.activeSectMission;
            const actualTime = mission.actualTime || mission.time;
            mission.progress += (100 / actualTime);

            // Kiểm tra mục tiêu nhiệm vụ (Boss) khi đạt 90% tiến độ
            if (mission.type === 'combat' && mission.progress >= 90 && !mission.objectiveMet) {
                mission.objectiveMet = true;
                
                const monsterTypes = ["U Minh Lang", "Thiết Giáp Tê", "Thanh Xà", "Hắc Hổ", "Lôi Ưng", "Băng Chu", "Cuồng Ngưu"];
                const randomMonster = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
                
                const targets = {
                    "Trừ khử yêu thú ngoại vi": `Yêu Thú Ngoại Vi (${randomMonster})`,
                    "Truy tìm phản đồ": "Phản Đồ Môn Phái",
                    "Trấn áp yêu ma": "Yêu Ma Thức Tỉnh",
                    "Hộ tống linh xa": "Thảo Khấu Cướp Tiêu",
                    "Thanh trừng phỉ tặc": "Phỉ Tặc Hung Hãn",
                    "Săn lùng Linh Thú biến dị": `Linh Thú Biến Dị (${randomMonster})`,
                    "Giải cứu đệ tử": `Yêu Thú Vây Hãm (${randomMonster})`
                };
                
                const targetName = targets[mission.name] || "Mục Tiêu Nhiệm Vụ";
                const levelMult = proxyState.rankIndex + 1;
                
                UI.addLog(`🎯 [Mục Tiêu]: Đã tìm thấy <b>${targetName}</b>! Hãy tiêu diệt để hoàn thành nhiệm vụ.`);
                
                const bossEnemy = {
                    name: targetName,
                    hp: 200 * levelMult + Math.floor(Math.random() * 100),
                    atk: 15 * levelMult + Math.floor(Math.random() * 10),
                    def: 8 * levelMult,
                    thanphap: 10 * levelMult,
                    exp: 50 * levelMult,
                    desc: `Mục tiêu chính của nhiệm vụ: ${mission.name}.`
                };
                
                if (typeof BattleSystem !== 'undefined') {
                    BattleSystem.runBattleLoop(proxyState, bossEnemy);
                }
                return; // Dừng update để vào trận
            }

            // Ngẫu nhiên Kỳ Ngộ hoặc Sự Cố
            const rand = Math.random();
            const combatChance = mission.type === 'combat' ? 0.04 : 0.01;
            
            // Meeting Event for External Missions (10% chance per mission, but here we use per tick)
            if (mission.location !== "internal") {
                if (!mission.meetingCount) mission.meetingCount = 0;
                // 2% per tick is roughly 1-2 events per mission of 60-120s
                if (mission.meetingCount < 4 && Math.random() < 0.02) {
                    mission.meetingCount++;
                    const loc = { id: "map_sect_mission", name: "Ngoại Vi Môn Phái" };
                    if (typeof EventSystem !== 'undefined') {
                        EventSystem.triggerMeetingEvent(loc);
                    }
                }
            }

            if (rand < 0.01) {
                // Kỳ Ngộ - Chung
                const bonus = Math.floor(Math.random() * 20) + 10;
                proxyState.mana += bonus;
                UI.addLog(`✨ [Kỳ Ngộ]: Trong lúc làm nhiệm vụ, đạo hữu vô tình nhặt được một viên linh thạch! (+${bonus} Linh khí)`);
            } else if (rand < 0.02) {
                // Sự Cố - Trì trệ (Chung)
                mission.progress = Math.max(0, mission.progress - 10);
                UI.addLog(`⚠️ [Sự Cố]: Gặp phải rắc rối nhỏ, tiến độ nhiệm vụ bị trì trệ! (-10% tiến độ)`);
            } else if (rand < 0.03) {
                // Sự Cố - Đặc thù theo địa điểm
                if (mission.location === "internal") {
                    // Nội bộ: Trưởng lão kiểm tra
                    if (Math.random() < 0.5) {
                        mission.progress += 15;
                        UI.addLog(`👨‍🏫 [Sự Kiện]: Trưởng lão đi ngang qua chỉ điểm vài câu, tiến độ tăng mạnh! (+15% tiến độ)`);
                    } else {
                        const loss = 10;
                        proxyState.mana = Math.max(0, proxyState.mana - loss);
                        UI.addLog(`👨‍🏫 [Sự Kiện]: Trưởng lão phê bình thái độ làm việc, đạo hữu phải tốn sức sửa sai! (-${loss} Linh khí)`);
                    }
                } else {
                    // Ngoại vi: Lạc đường / Thời tiết
                    const loss = Math.floor(proxyState.mana * 0.05) + 5;
                    proxyState.mana = Math.max(0, proxyState.mana - loss);
                    UI.addLog(`⚠️ [Sự Cố]: Linh khí bị tiêu tán do môi trường khắc nghiệt! (-${loss} Linh khí)`);
                }
            } else if (rand < 0.04) {
                // Sự Cố - Đặc thù theo địa điểm
                if (mission.location === "internal") {
                    // Nội bộ: Đồng môn quấy rầy / giúp đỡ
                    if (Math.random() < 0.5) {
                        mission.progress += 10;
                        UI.addLog(`🤝 [Sự Kiện]: Có đồng môn đến giúp một tay, công việc trôi chảy hơn! (+10% tiến độ)`);
                    } else {
                        const loss = 5;
                        proxyState.stamina = Math.max(0, proxyState.stamina - loss);
                        UI.addLog(`😫 [Sự Kiện]: Đồng môn đến tán gẫu làm xao nhãng, tốn thêm thời gian! (-${loss} Thể lực)`);
                    }
                } else {
                    // Ngoại vi: Tâm thần bất định
                    const loss = 8;
                    proxyState.stamina = Math.max(0, proxyState.stamina - loss);
                    UI.addLog(`⚠️ [Sự Cố]: Đường xá xa xôi, tâm thần mệt mỏi! (-${loss} Thể lực)`);
                }
            } else if (rand < 0.04 + combatChance) {
                // Sự Cố - Chiến đấu (Tối đa 2 lần)
                if ((mission.combatCount || 0) < 2) {
                    mission.combatCount = (mission.combatCount || 0) + 1;
                    
                    let enemyName = "";
                    let enemyDesc = "";
                    
                    if (mission.location === "internal") {
                        const internalEnemies = [
                            { name: "Đệ Tử Khiêu Chiến", desc: "Một đệ tử đồng môn muốn so tài cao thấp với đạo hữu." },
                            { name: "Linh Thú Nổi Điên", desc: "Một con linh thú canh giữ sơn môn đột nhiên mất kiểm soát." },
                            { name: "Tâm Ma Ảo Ảnh", desc: "Ảo ảnh do tâm ma tạo ra quấy nhiễu tâm trí." },
                            { name: "Khôi Lỗi Mất Kiểm Soát", desc: "Khôi lỗi canh gác tàng kinh các gặp trục trặc kỹ thuật." }
                        ];
                        const picked = internalEnemies[Math.floor(Math.random() * internalEnemies.length)];
                        enemyName = picked.name;
                        enemyDesc = picked.desc;
                        UI.addLog(`⚔️ [Sự Cố]: ${enemyName} xuất hiện! Hãy giải quyết để tiếp tục. (Trận ${mission.combatCount}/2)`);
                    } else {
                        const externalEnemies = [
                            { name: "Thảo Khấu Cướp Đường", desc: "Đám thảo khấu chuyên chặn đường cướp bóc." },
                            { name: "Yêu Thú Chặn Đường", desc: "Yêu thú hung hãn tấn công người qua đường." },
                            { name: "Ma Tu Lai Vãng", desc: "Ma tu tà ác đang lảng vảng tìm kiếm con mồi." },
                            { name: "Phản Đồ Môn Phái", desc: "Kẻ phản bội môn phái đang âm mưu quấy phá." }
                        ];
                        const picked = externalEnemies[Math.floor(Math.random() * externalEnemies.length)];
                        enemyName = picked.name;
                        enemyDesc = picked.desc;
                        UI.addLog(`⚔️ [Sự Cố]: ${enemyName} tập kích! Hãy chiến đấu để tiếp tục. (Trận ${mission.combatCount}/2)`);
                    }
                    
                    // Tạo kẻ địch ngẫu nhiên dựa trên cảnh giới
                    const levelMult = proxyState.rankIndex + 1;
                    
                    const missionEnemy = {
                        name: enemyName,
                        hp: 100 * levelMult + Math.floor(Math.random() * 50),
                        atk: 10 * levelMult + Math.floor(Math.random() * 5),
                        def: 5 * levelMult,
                        thanphap: 8 * levelMult,
                        exp: 20 * levelMult,
                        desc: enemyDesc
                    };
                    
                    if (typeof BattleSystem !== 'undefined') {
                        BattleSystem.runBattleLoop(proxyState, missionEnemy);
                    }
                } else {
                    // Nếu đã đủ 2 trận, chuyển thành trì trệ nhẹ
                    mission.progress = Math.max(0, mission.progress - 5);
                    UI.addLog(`⚠️ [Sự Cố]: Gặp phải chướng ngại vật, tiến độ bị chậm lại.`);
                }
            }

            if (mission.progress >= 100) {
                this.completeSectMission();
            } else {
                // Cập nhật UI nếu đang mở tab nhiệm vụ
                if (UI.showSectMissions) UI.showSectMissions(true);
            }
        },

        completeSectMission: function() {
            if (!proxyState.activeSectMission) return;

            const mission = proxyState.activeSectMission;
            const sectId = proxyState.currentSectId;
            
            proxyState.mana += mission.reward;
            proxyState.sectContribution += mission.contrib;
            
            // Tăng danh vọng
            if (sectId) {
                proxyState.sectReputation[sectId] = (proxyState.sectReputation[sectId] || 0) + Math.floor(mission.contrib / 2);
            }
            
            this.incrementDailyMissionProgress('sectMission', 1);
            
            UI.addLog(`🎯 Hoàn thành nhiệm vụ <b>${mission.name}</b>! Nhận được <b>${mission.reward} Linh khí</b>, <b>${mission.contrib} Cống hiến</b> và <b>${Math.floor(mission.contrib / 2)} Danh vọng</b>.`, true);
            
            proxyState.activeSectMission = null;
            this.refreshSectMissions();
            this.saveGame();
            if (UI.showSectMissions) UI.showSectMissions(true);
        },

        failSectMission: function() {
            if (!proxyState.activeSectMission) return;

            const mission = proxyState.activeSectMission;
            const sectId = proxyState.currentSectId;
            const loss = Math.floor(mission.contrib * 0.2);
            
            proxyState.sectContribution = Math.max(0, proxyState.sectContribution - loss);
            
            // Giảm danh vọng khi thất bại
            if (sectId) {
                proxyState.sectReputation[sectId] = (proxyState.sectReputation[sectId] || 0) - 50;
            }
            
            UI.addLog(`❌ Nhiệm vụ <b>${mission.name}</b> thất bại do đạo hữu bại trận! Bị trừ <b>${loss} Cống hiến</b> và <b>50 Danh vọng</b>.`, true);
            
            proxyState.activeSectMission = null;
            this.refreshSectMissions();
            this.saveGame();
            if (UI.showSectMissions) UI.showSectMissions(true);
        },

        buySectItem: function(itemId, cost, reqReputation = 0, quantity = 1) {
            const sectId = proxyState.currentSectId;
            const currentRep = proxyState.sectReputation[sectId] || 0;

            if (currentRep < reqReputation) {
                UI.addLog(`❌ Danh vọng không đủ! Yêu cầu: ${reqReputation} (Hiện có: ${currentRep})`);
                return;
            }
            
            // Giảm giá dựa trên danh vọng (tối đa 50% tại 10000 danh vọng)
            const discount = Math.min(0.5, currentRep / 20000);
            const finalCostPerItem = Math.floor(cost * (1 - discount));
            const totalCost = finalCostPerItem * quantity;

            if (proxyState.sectContribution < totalCost) {
                UI.addLog(`❌ Điểm cống hiến không đủ! (Yêu cầu: ${totalCost})`);
                return;
            }
            
            proxyState.sectContribution -= totalCost;
            this.addItem(itemId, quantity);
            UI.addLog(`✅ Mua thành công <b>${quantity}x ${GameData.items[itemId].name}</b>. Tiêu tốn ${totalCost} cống hiến (Giảm giá: ${Math.floor(discount * 100)}%).`);
            this.saveGame();
            if (UI.showSectShop) UI.showSectShop();
        },

        learnSectSkill: function(skillId, cost, reqReputation = 0) {
            const sectId = proxyState.currentSectId;
            if (!sectId) {
                UI.addLog("❌ Đạo hữu chưa gia nhập môn phái này!");
                return;
            }
            const currentRep = proxyState.sectReputation[sectId] || 0;

            if (currentRep < reqReputation) {
                const errorMsg = `❌ Danh vọng không đủ! Yêu cầu: ${reqReputation} (Hiện có: ${currentRep})`;
                UI.addLog(errorMsg);
                
                if (typeof UI !== 'undefined') {
                    UI.openModal("THIẾU DANH VỌNG", `
                        <div style="text-align: center; padding: 10px;">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">🎖️</div>
                            <p style="color: #ff4444; font-weight: bold; margin-bottom: 10px;">DANH VỌNG KHÔNG ĐỦ</p>
                            <p style="font-size: 0.85rem; color: #ccc;">Đạo hữu cần đạt ít nhất <b>${reqReputation}</b> danh vọng tại môn phái để đổi thần thông này.</p>
                            <p style="font-size: 0.9rem; margin-top: 10px;">Hiện có: <b style="color: #d4af37;">${currentRep}</b> / Yêu cầu: <b style="color: #d4af37;">${reqReputation}</b></p>
                        </div>
                    `, false);
                }
                return;
            }

            if (proxyState.sectContribution < cost) {
                const errorMsg = "❌ Điểm cống hiến không đủ!";
                UI.addLog(errorMsg);
                
                if (typeof UI !== 'undefined') {
                    UI.openModal("THIẾU CỐNG HIẾN", `
                        <div style="text-align: center; padding: 10px;">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">💎</div>
                            <p style="color: #ff4444; font-weight: bold; margin-bottom: 10px;">KHÔNG ĐỦ CỐNG HIẾN</p>
                            <p style="font-size: 0.85rem; color: #ccc;">Đạo hữu cần thêm <b>${cost - proxyState.sectContribution}</b> điểm cống hiến để đổi thần thông này.</p>
                            <p style="font-size: 0.9rem; margin-top: 10px;">Hiện có: <b style="color: #d4af37;">${proxyState.sectContribution}</b> / Cần: <b style="color: #d4af37;">${cost}</b></p>
                        </div>
                    `, false);
                }
                return;
            }

            if (proxyState.skills.includes(skillId)) {
                const errorMsg = "❌ Đạo hữu đã học kỹ năng này rồi!";
                UI.addLog(errorMsg);
                
                if (typeof UI !== 'undefined') {
                    UI.openModal("ĐÃ LĨNH NGỘ", `
                        <div style="text-align: center; padding: 10px;">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">📜</div>
                            <p style="color: #ff9800; font-weight: bold; margin-bottom: 10px;">THẦN THÔNG ĐÃ CÓ</p>
                            <p style="font-size: 0.85rem; color: #ccc;">Đạo hữu đã lĩnh ngộ thần thông <b>${GameData.skills[skillId].name}</b> rồi, không cần đổi thêm.</p>
                        </div>
                    `, false);
                }
                return;
            }

            proxyState.sectContribution -= cost;
            const bookId = `book_${skillId.replace('skill_', '')}`;
            if (GameData.items[bookId]) {
                BagSystem.addItem(bookId, 1);
                UI.addLog(`✅ Đổi thành công <b>${GameData.items[bookId].name}</b>. Tiêu tốn ${cost} cống hiến.`);
            } else {
                // Nếu chưa có item book tương ứng, học trực tiếp (tạm thời) hoặc báo lỗi
                const msg = this.learnSkillById(skillId);
                UI.addLog(msg);
            }
            this.saveGame();
            if (UI.renderSectHall) UI.renderSectHall(proxyState);
        },

        toggleSkill: function(skillId) {
            let toggled = [...proxyState.toggledSkills];
            if (toggled.includes(skillId)) {
                toggled = toggled.filter(id => id !== skillId);
                UI.addLog(`🔕 Đã tắt tự động sử dụng thần thông!`);
            } else {
                if (toggled.length >= 6) {
                    UI.addLog(`⚠️ Cảnh báo: Chỉ có thể bật tối đa 6 thần thông tự động cùng lúc!`);
                    return;
                }
                toggled.push(skillId);
                UI.addLog(`🔔 Đã bật tự động sử dụng thần thông!`);
            }
            proxyState.toggledSkills = toggled;
            this.saveGame();
            if (UI.renderPlayerSkills) UI.renderPlayerSkills(proxyState.skills);
        },

        setSkillPriority: function(skillId, priority) {
            const priorities = { ...proxyState.skillPriorities };
            priorities[skillId] = priority;
            proxyState.skillPriorities = priorities;
            
            const priorityLabels = { 'high': 'CAO', 'medium': 'VỪA', 'low': 'THẤP', 'off': 'TẮT' };
            const skillName = (GameData.skills[skillId] || GameData.petSkills[skillId] || { name: skillId }).name;
            UI.addLog(`✨ Đã đặt mức ưu tiên của [${skillName}] thành: <b>${priorityLabels[priority]}</b>`);
            
            this.saveGame();
            if (UI.renderPlayerSkills) UI.renderPlayerSkills(proxyState.skills);
        },

        cycleSkillPriority: function(skillId) {
            const current = (proxyState.skillPriorities && proxyState.skillPriorities[skillId]) || 'medium';
            const order = ['high', 'medium', 'low', 'off'];
            const nextIndex = (order.indexOf(current) + 1) % order.length;
            this.setSkillPriority(skillId, order[nextIndex]);
        },

        learnSkillById: function(skillId, skipRankCheck = false) {
            const skillData = GameData.skills[skillId];
            if (!skillData) return "❌ Thần thông không tồn tại!";

            if (proxyState.skills.includes(skillId)) {
                const errorMsg = `Đạo hữu đã học [${skillData.name}] rồi.`;
                if (typeof UI !== 'undefined') {
                    UI.openModal("ĐÃ LĨNH NGỘ", `
                        <div style="text-align: center; padding: 10px;">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">📜</div>
                            <p style="color: #ff9800; font-weight: bold; margin-bottom: 10px;">THẦN THÔNG ĐÃ CÓ</p>
                            <p style="font-size: 0.85rem; color: #ccc;">Đạo hữu đã lĩnh ngộ thần thông <b>${skillData.name}</b> rồi.</p>
                        </div>
                    `, false);
                }
                return errorMsg;
            }

            // Kiểm tra cảnh giới yêu cầu
            const rankReqs = {
                "Phàm Cấp": 0,
                "Linh Cấp": 1,
                "Địa Cấp": 10,
                "Thiên Cấp": 13,
                "Thần Cấp": 16
            };

            const reqRankIndex = rankReqs[skillData.rank] || 0;
            
            if (!skipRankCheck && proxyState.rankIndex < reqRankIndex) {
                const reqRankName = GameData.ranks[reqRankIndex].name;
                const errorMsg = `❌ Cảnh giới không đủ! Cần đạt đến <b>${reqRankName}</b> mới có thể lĩnh ngộ thần thông này.`;
                
                // Tự động bật tab thông báo (Modal)
                if (typeof UI !== 'undefined') {
                    UI.openModal("KHÔNG ĐỦ ĐIỀU KIỆN", `
                        <div style="text-align: center; padding: 10px;">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">🚫</div>
                            <p style="color: #ff4444; font-weight: bold; margin-bottom: 10px;">LĨNH NGỘ THẤT BẠI</p>
                            <p style="font-size: 0.85rem; color: #ccc;">Cảnh giới hiện tại của đạo hữu chưa đủ để lĩnh ngộ thần thông <b>${skillData.name}</b>.</p>
                            <p style="font-size: 0.9rem; margin-top: 10px;">Yêu cầu: <b style="color: #d4af37;">${reqRankName}</b></p>
                        </div>
                    `, false);
                }
                
                return errorMsg;
            }

            if (skillData.type === 'passive') {
                const buffs = skillData.buff || skillData.stats || {};
                for (let stat in buffs) {
                    if (proxyState.hasOwnProperty(stat)) {
                        proxyState[stat] += buffs[stat];
                    }
                }
            }

            proxyState.skills = [...proxyState.skills, skillId];
            this.saveGame();
            if (typeof checkTitles === 'function') checkTitles(); // Kiểm tra danh hiệu khi học kỹ năng mới
            return `✨ THÔNG BÁO: Lĩnh ngộ thành công <b>${skillData.name}</b>!`;
        },

        init: function() {
            this.isInitialLoading = true;
            this.loadGame();
            this.isInitialLoading = false;
            
            // Kiểm tra reset nhiệm vụ hàng ngày
            this.checkDailyReset();

            // Cập nhật UI ban đầu
            if (typeof UI !== 'undefined') {
                UI.renderMapList(proxyState);
                UI.updateBar('bone', proxyState.boneQualityId);
            }

            let regenTick = 0;
            let loyaltyTick = 0;
            setInterval(() => {
                if (!this.isInBattle && !proxyState.isStatsFrozen) {
                    const totals = calculateTotals(proxyState);
                    const totalHpMax = totals.totalHpMax;
                    const maxMp = totals.maxMp;
                    const totalStaminaMax = totals.totalStaminaMax;

                    // Tăng trung thành khi cưỡi (mỗi 60 giây)
                    if (proxyState.mountedPetUid) {
                        loyaltyTick++;
                        if (loyaltyTick >= 60) {
                            if (typeof PetSystem !== 'undefined') {
                                PetSystem.increaseLoyalty(proxyState, proxyState.mountedPetUid, 1);
                            }
                            loyaltyTick = 0;
                        }
                    } else {
                        loyaltyTick = 0;
                    }

                    // Hồi phục 1% Thể lực mỗi giây theo yêu cầu mới
                    const staminaRegen = Math.max(1, Math.floor(totalStaminaMax * 0.01));
                    if (proxyState.stamina < totalStaminaMax) {
                        proxyState.stamina = Math.min(proxyState.stamina + staminaRegen, totalStaminaMax);
                    }

                    // Hồi phục Sinh lực, Linh lực và Thể lực cho Linh thú (mỗi giây)
                    if (proxyState.pets && proxyState.pets.length > 0 && typeof PetSystem !== 'undefined') {
                        let petChanged = false;
                        proxyState.pets.forEach(p => {
                            const pStats = PetSystem.getPetStats(p.id, p.level || 1, p.statMultiplier || 1.0);
                            if (pStats) {
                                // Hồi phục 1% HP và 1.5% MP mỗi giây cho pet khi không chiến đấu
                                const hpRegen = pStats.hpMax * 0.01;
                                const mpRegen = pStats.mpMax * 0.015;
                                const staminaRegen = pStats.stamina * 0.01;
                                
                                // Đảm bảo các chỉ số hiện tại tồn tại
                                if (typeof p.hp === 'undefined') p.hp = pStats.hpMax;
                                if (typeof p.mp === 'undefined') p.mp = typeof p.mana !== 'undefined' ? p.mana : pStats.mpMax;
                                if (typeof p.stamina === 'undefined') p.stamina = pStats.stamina;

                                if (p.hp < pStats.hpMax || p.mp < pStats.mpMax || p.stamina < pStats.stamina) {
                                    p.hp = Math.min(pStats.hpMax, p.hp + hpRegen);
                                    p.mp = Math.min(pStats.mpMax, p.mp + mpRegen);
                                    p.mana = p.mp; // Đồng bộ với mana cũ
                                    p.stamina = Math.min(pStats.stamina, p.stamina + staminaRegen);
                                    petChanged = true;
                                }
                            }
                        });
                        
                        if (petChanged) {
                            // Cập nhật UI nếu đang ở tab pet
                            if (typeof UI !== 'undefined') {
                                if (UI.lastTab === 'pet') {
                                    UI.renderPetTab(proxyState);
                                }
                                // Luôn cập nhật thanh chỉ số linh thú ở giao diện chính
                                const activePet = proxyState.pets.find(p => p.uid === proxyState.activePetId);
                                if (activePet) {
                                    UI.updatePetUI(activePet);
                                }
                            }
                        }
                    }

                    // Cập nhật ấp trứng linh thú
                    if (typeof PetSystem !== 'undefined') {
                        PetSystem.updateIncubation(proxyState);
                    }

                    // Cập nhật Buffs/Debuffs (mỗi giây)
                    const now = Date.now();
                    let statusChanged = false;
                    
                    if (proxyState.activeBuffs && proxyState.activeBuffs.length > 0) {
                        const originalCount = proxyState.activeBuffs.length;
                        proxyState.activeBuffs = proxyState.activeBuffs.filter(b => b.expiry > now);
                        if (proxyState.activeBuffs.length !== originalCount) statusChanged = true;
                    }
                    
                    if (proxyState.activeDebuffs && proxyState.activeDebuffs.length > 0) {
                        const originalCount = proxyState.activeDebuffs.length;
                        proxyState.activeDebuffs = proxyState.activeDebuffs.filter(d => d.expiry > now);
                        if (proxyState.activeDebuffs.length !== originalCount) statusChanged = true;
                    }
                    
                    // Cập nhật cho Linh thú đang xuất chiến
                    const activePet = proxyState.pets.find(p => p.uid === proxyState.activePetId);
                    if (activePet) {
                        if (activePet.activeBuffs && activePet.activeBuffs.length > 0) {
                            const originalCount = activePet.activeBuffs.length;
                            activePet.activeBuffs = activePet.activeBuffs.filter(b => b.expiry > now);
                            if (activePet.activeBuffs.length !== originalCount) statusChanged = true;
                        }
                        if (activePet.activeDebuffs && activePet.activeDebuffs.length > 0) {
                            const originalCount = activePet.activeDebuffs.length;
                            activePet.activeDebuffs = activePet.activeDebuffs.filter(d => d.expiry > now);
                            if (activePet.activeDebuffs.length !== originalCount) statusChanged = true;
                        }
                    }

                    // Luôn render lại nếu có buff/debuff để cập nhật thời gian đếm ngược
                    if (statusChanged || (proxyState.activeBuffs && proxyState.activeBuffs.length > 0) || (proxyState.activeDebuffs && proxyState.activeDebuffs.length > 0) || (activePet && ((activePet.activeBuffs && activePet.activeBuffs.length > 0) || (activePet.activeDebuffs && activePet.activeDebuffs.length > 0)))) {
                        if (typeof UI !== 'undefined' && UI.renderDebuffs) {
                            UI.renderDebuffs('player', proxyState.activeBuffs || [], proxyState.activeDebuffs || []);
                            if (activePet) {
                                UI.renderDebuffs('pet', activePet.activeBuffs || [], activePet.activeDebuffs || []);
                            }
                        }
                    }

                    regenTick++;
                    if (regenTick >= 2) {
                        regenTick = 0;
                        
                        // Hồi phục 1% HP và 1.5% MP mỗi 2 giây khi không chiến đấu
                        const hpRegen = totalHpMax * 0.01;
                        const mpRegen = maxMp * 0.015;

                        if (proxyState.hp < totalHpMax) proxyState.hp = Math.min(proxyState.hp + hpRegen, totalHpMax);
                        if (proxyState.currentMp < maxMp) proxyState.currentMp = Math.min(proxyState.currentMp + mpRegen, maxMp);
                    }
                    
                    // Cập nhật nhiệm vụ môn phái vẫn chạy mỗi giây để đảm bảo tiến độ mượt mà
                    this.updateSectMission();
                    
                    // Cập nhật ấp trứng linh thú
                    if (typeof PetSystem !== 'undefined') {
                        PetSystem.updateIncubation(proxyState);
                    }
                }
            }, 1000);
            
            if (typeof UI !== 'undefined') {
                UI.addLog("Hệ thống: Kính chào đạo hữu bước vào con đường tu tiên!");
                UI.renderStartScreen(proxyState);
                
                // Khởi tạo danh sách bản đồ
                if (typeof ExploreSystem !== 'undefined') {
                    ExploreSystem.render(proxyState);
                }

                // Trigger initial UI updates
                if (typeof BagSystem !== 'undefined') BagSystem.renderBag(proxyState.inventory);
                if (UI.updateEquipUI) UI.updateEquipUI(proxyState.equipments);
                if (UI.renderPlayerSkills) UI.renderPlayerSkills(proxyState.skills);
                if (UI.renderSectList) UI.renderSectList(proxyState);

                const nameEl = document.getElementById('main-player-name');
                if (nameEl) nameEl.innerText = proxyState.name || "Đạo Hữu";
                
                const titleData = GameData.titles[proxyState.currentTitleId] || GameData.titles["none"];
                const mainTitleEl = document.getElementById('main-player-title');
                if (mainTitleEl) {
                    mainTitleEl.innerText = `[${titleData.name}]`;
                    mainTitleEl.style.color = titleData.color || "#888";
                }
            }
        },

        addItem: function(itemId, count = 1, silent = false, force = false) {
            this.addItems([{ id: itemId, count: count }], silent, force);
        },

        /**
         * Thêm danh sách vật phẩm (gộp thông báo)
         */
        addItems: function(items, silent = false, force = false) {
            if (!force && typeof ExploreSystem !== 'undefined' && ExploreSystem.isExploring()) {
                for (const item of items) {
                    ExploreSystem.addLoot(item.id, item.count || 1);
                }
                return;
            }

            if (typeof BagSystem !== 'undefined') {
                BagSystem.addItems(items, silent);
            } else {
                // Fallback nếu không có BagSystem (thường không xảy ra)
                for (const item of items) {
                    const itemId = item.id;
                    const count = item.count || 1;
                    const STACK_LIMIT = 10000;
                    let inv = JSON.parse(JSON.stringify(proxyState.inventory));
                    
                    const itemData = GameData.items[itemId];
                    if (itemData && itemData.type !== 'equipment') {
                        let remaining = count;
                        for (let slot of inv) {
                            if (slot.id === itemId && slot.count < STACK_LIMIT) {
                                const canAdd = Math.min(remaining, STACK_LIMIT - slot.count);
                                slot.count += canAdd;
                                remaining -= canAdd;
                                if (remaining <= 0) break;
                            }
                        }
                        while (remaining > 0) {
                            const toAdd = Math.min(remaining, STACK_LIMIT);
                            inv.push({ id: itemId, count: toAdd });
                            remaining -= toAdd;
                        }
                    } else {
                        for (let i = 0; i < count; i++) {
                            inv.push({ id: itemId, count: 1 });
                        }
                    }
                    proxyState.inventory = inv;
                }
            }
        },

        removeItemsById: function(itemId, count = 1) {
            if (typeof BagSystem !== 'undefined') {
                return BagSystem.removeItemsById(itemId, count);
            } else {
                let inv = JSON.parse(JSON.stringify(proxyState.inventory));
                let remaining = count;
                for (let i = inv.length - 1; i >= 0; i--) {
                    if (inv[i].id === itemId) {
                        if (inv[i].count <= remaining) {
                            remaining -= inv[i].count;
                            inv.splice(i, 1);
                        } else {
                            inv[i].count -= remaining;
                            remaining = 0;
                        }
                    }
                    if (remaining <= 0) break;
                }
                proxyState.inventory = inv;
                return remaining === 0;
            }
        },

        canUsePill: function(pillId) {
            const data = GameData.items[pillId];
            if (!data || data.type !== 'pill' || !data.pillCategory) return true;
            
            const now = Date.now();
            const lastUse = proxyState.pillCooldowns[data.pillCategory] || 0;
            const cooldown = 6000; // 6 seconds
            return (now - lastUse >= cooldown);
        },

        useItem: function(index) {
            const item = proxyState.inventory[index];
            if (!item) return;
            
            const data = GameData.items[item.id];
            
            if (data.type === 'skill_book') {
                const resultMsg = this.learnSkill(item.id); 
                UI.addLog(resultMsg);
                if (resultMsg.includes("thành công")) {
                    this.removeItem(index, 1);
                    this.saveGame();
                    UI.closeModal();
                }
                // Nếu thất bại, không đóng modal để người chơi thấy thông báo lỗi từ learnSkillById
                return;
            }

            if (data.type === 'pill' && data.pillCategory) {
                const now = Date.now();
                const lastUse = proxyState.pillCooldowns[data.pillCategory] || 0;
                const cooldown = 6000; // 6 seconds
                if (now - lastUse < cooldown) {
                    const remaining = Math.ceil((cooldown - (now - lastUse)) / 1000);
                    UI.addLog(`❌ Đan dược cùng loại đang trong thời gian hồi! (Còn ${remaining}s)`);
                    return;
                }
                proxyState.pillCooldowns[data.pillCategory] = now;
            }

            if (data.effect) {
                const log = data.effect(proxyState);
                UI.addLog(log);
                
                // Only remove if it's not a permanent item
                let shouldConsume = true;
                if (data.consumeOnUse === false) {
                    shouldConsume = false;
                } else if (typeof data.consumeOnUse === 'function') {
                    shouldConsume = data.consumeOnUse(proxyState);
                }

                if (shouldConsume) {
                    this.removeItem(index, 1);
                }
                
                UI.closeModal();
                this.saveGame();
                return;
            }

            if (data.action && data.action.startsWith('hatch_pet')) {
                if (typeof PetSystem !== 'undefined') {
                    PetSystem.startIncubation(proxyState, item.id, index);
                } else if (window.PetSystem) {
                    window.PetSystem.startIncubation(proxyState, item.id, index);
                } else {
                    UI.addLog("Hệ thống: PetSystem chưa sẵn sàng!");
                }
                return;
            }
        },

        forgetSkill: function(skillId) {
            const skill = GameData.skills[skillId];
            if (!skill) return;
            
            proxyState.skills = proxyState.skills.filter(id => id !== skillId);
            UI.addLog(`✅ Đạo hữu đã lãng quên kỹ năng <b>${skill.name}</b>!`);
            this.saveGame();
        },

        removeItem: function(index, count) {
            let inv = [...proxyState.inventory];
            if (inv[index]) {
                inv[index].count -= count;
                if (inv[index].count <= 0) inv.splice(index, 1);
                proxyState.inventory = inv;
            }
        },

        resetGame: function() {
            localStorage.removeItem('TuTien_SaveData');
            location.reload();
        },

        cultivate: function() {
            if (this.isInBattle) return UI.addLog("Đang chiến đấu, không thể nhập định!");
            if (proxyState.stamina < 5) return UI.addLog("Thể lực cạn kiệt.", true);
            
            // Ghi lại hành động tu luyện
            this.recordAction();
            
            const boneData = GameData.boneQualities[proxyState.boneQualityId] || GameData.boneQualities["pham"];
            const cultBonus = boneData.cultRate || 1;

            proxyState.stamina -= 5; 
            const manaGain = Math.floor(15 * cultBonus);
            proxyState.mana += manaGain;

            // Increment daily mission progress
            this.incrementDailyMissionProgress('meditate', 1);

            // Kiểm tra sau khi bị Người Thần Bí đánh chết
            if (proxyState.mysteriousPersonKilledPlayer) {
                proxyState.meditationCountAfterDeath++;
                if (proxyState.meditationCountAfterDeath >= 3) {
                    proxyState.mysteriousPersonKilledPlayer = false;
                    proxyState.meditationCountAfterDeath = 0;
                    proxyState.mysteriousPersonMet = false; // Cho phép gặp lại
                    
                    setTimeout(() => {
                        if (typeof UI !== 'undefined' && UI.showMysteriousPerson) {
                            UI.addLog("✨ Sau 3 lần tĩnh tâm tu luyện, đạo hữu cảm thấy một luồng linh áp quen thuộc... Hắn lại xuất hiện!");
                            UI.showMysteriousPerson(() => {
                                proxyState.mysteriousPersonMet = true;
                            }, true);
                        }
                    }, 1000);
                } else {
                    UI.addLog(`🧘 Đạo hữu đang tĩnh tâm tu luyện để hồi phục tâm trí... (${proxyState.meditationCountAfterDeath}/3)`);
                }
            }

            // Linh thú xuất chiến và thú cưỡi nhận 50% linh khí khi tu luyện
            if (typeof PetSystem !== 'undefined' && (proxyState.activePetId || proxyState.mountedPetUid)) {
                const petSpiritGain = Math.floor(manaGain * 0.5);
                const processedUids = new Set();
                
                // Linh thú xuất chiến
                if (proxyState.activePetId) {
                    const activePet = proxyState.pets.find(p => p.uid === proxyState.activePetId);
                    if (activePet) {
                        activePet.spirit = (activePet.spirit || 0) + petSpiritGain;
                        processedUids.add(activePet.uid);
                    }
                }
                
                // Thú cưỡi (Có thể cộng dồn nếu là cùng 1 con)
                if (proxyState.mountedPetUid) {
                    const mountedPet = proxyState.pets.find(p => p.uid === proxyState.mountedPetUid);
                    if (mountedPet) {
                        mountedPet.spirit = (mountedPet.spirit || 0) + petSpiritGain;
                    }
                }
                
                // Cập nhật lại mảng pets để trigger proxy
                proxyState.pets = [...proxyState.pets];
            }

            this.saveGame();
        },

        handleBreakthroughClick: function() {
            if (this.isInBattle) return UI.addLog("Đang chiến đấu, không thể đột phá!");
            
            // Kiểm tra giới hạn cảnh giới của Mặt Nạ Vô Diện
            const isMaskEquipped = proxyState.equipments && proxyState.equipments.head && proxyState.equipments.head.id === 'item_mask_mysterious';
            if (isMaskEquipped && proxyState.rankIndex >= 5) { // Luyện Khí Tầng 5 là index 5
                return UI.openModal("GIỚI HẠN CẢNH GIỚI", `
                    <div style="text-align:center;">
                        <h3 style="color:#ff4444; font-size:1.2rem; margin-bottom:15px;">XIỀNG XÍCH VÔ DIỆN</h3>
                        <p style="color:#eee; margin-bottom:20px;">Sức mạnh của <b>Mặt Nạ Vô Diện</b> đang kìm hãm linh căn của đạo hữu. Ngươi không thể đột phá vượt qua <b>Luyện Khí Tầng 5</b> khi còn đeo nó!</p>
                        <p style="font-style:italic; color:#888; font-size:0.8rem;">"Hắn đã nói... đây là gông giềng xiềng xích..."</p>
                        <button onclick="UI.closeModal()" class="btn-main">ĐÃ HIỂU</button>
                    </div>
                `, false);
            }

            const curRank = GameData.ranks[proxyState.rankIndex];
            if (proxyState.mana < curRank.expReq) return;
            
            const tribulation = GameData.tribulations[proxyState.rankIndex];
            if (tribulation) {
                const nextRank = GameData.ranks[proxyState.rankIndex + 1];
                const nextRankName = nextRank ? nextRank.name : "Cảnh Giới Tiếp Theo";
                
                UI.openModal("THIÊN KIẾP GIÁNG THẾ", `
                    <div style="text-align:center;">
                        <h3 style="color:#ff4444; font-size:1.5rem; margin-bottom:15px;">THIÊN ĐẠO Ý NIỆM</h3>
                        <p style="font-style:italic; color:#aaa; margin-bottom:20px;">"Thiên đạo vô tình, vạn vật sô cẩu. Lôi đình giáng thế, thử thách căn cơ."</p>
                        <p style="margin-bottom:20px;">Đạo hữu đã đạt tới giới hạn của <b>${curRank.name}</b>. Để đột phá lên <b>${nextRankName}</b>, đạo hữu phải vượt qua thử thách của Thiên Đạo!</p>
                        <button onclick="UI.closeModal(); TribulationSystem.start(${proxyState.rankIndex})" style="background:#ff4444; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">ĐỐI MẶT THIÊN KIẾP</button>
                    </div>
                `, false);
            } else {
                this.doBreakthrough();
            }
        },

        doBreakthrough: function() {
            // Kiểm tra lại giới hạn của Mặt Nạ Vô Diện
            const isMaskEquipped = proxyState.equipments && proxyState.equipments.head && proxyState.equipments.head.id === 'item_mask_mysterious';
            if (isMaskEquipped && proxyState.rankIndex >= 5) {
                return UI.addLog("❌ Sức mạnh của Mặt Nạ Vô Diện ngăn cản đạo hữu đột phá!", false, "fail");
            }

            const curRank = GameData.ranks[proxyState.rankIndex];
            const excessMana = Math.max(0, proxyState.mana - curRank.expReq);
            const carriedMana = Math.floor(excessMana * 0.5); // 50% cộng vào cảnh giới tiếp theo
            
            proxyState.rankIndex++; 
            proxyState.mana = carriedMana;
            
            const nextRank = GameData.ranks[proxyState.rankIndex];
            const boneData = GameData.boneQualities[proxyState.boneQualityId] || GameData.boneQualities["pham"];
            const multiplier = (nextRank.mult || 1.2) * (boneData.growthMult || 1);
            
            proxyState.atk = Math.floor(proxyState.atk * multiplier);
            proxyState.def = Math.floor(proxyState.def * multiplier);
            proxyState.thanphap = Math.floor(proxyState.thanphap * multiplier);
            proxyState.luk = Math.floor(proxyState.luk * multiplier);
            proxyState.hpMax = Math.floor(proxyState.hpMax * multiplier);
            proxyState.mpMax = Math.floor(proxyState.mpMax * multiplier);
            
            UI.addLog(`✨ ĐỘT PHÁ: Chúc mừng đạo hữu đạt tới <b>${nextRank.name}</b>! Các chỉ số cơ bản tăng mạnh!`);
            if (carriedMana > 0) {
                UI.addLog(`✨ Linh khí dư thừa: 50% (${carriedMana}) được giữ lại, 50% tiêu tán.`);
            }
            
            // Đảm bảo mở khóa trạng thái trước khi hồi phục
            proxyState.isStatsFrozen = false;
            Game.isInBattle = false;

            // Hồi phục toàn bộ chỉ số và cập nhật lại UI
            // Sử dụng setTimeout để đảm bảo các thay đổi rankIndex đã được áp dụng và UI sẵn sàng
            setTimeout(() => {
                this.restoreAllStats();
                this.recalculateStats();
                this.saveGame();
            }, 100);
        },

        restoreAllStats: function() {
            const totals = calculateTotals(state);
            proxyState.hp = totals.totalHpMax;
            proxyState.currentMp = totals.maxMp;
            proxyState.stamina = totals.totalStaminaMax;
            if (typeof UI !== 'undefined') {
                UI.updateBar('hp', proxyState.hp, totals.totalHpMax);
                UI.updateBar('mp', proxyState.currentMp, totals.maxMp);
                UI.updateBar('stamina', proxyState.stamina, totals.totalStaminaMax);
            }
        },

        rollBoneQuality: function(silent = false, pool = 'normal') {
            const rand = Math.random() * 100;
            let id = "pham";
            
            if (pool === 'advanced') {
                // Tẩy Tủy Đan Cao Cấp: Địa 50%, Thiên 30%, Tiên 15%, Chí tôn 5%
                if (rand < 5) id = "chiton";
                else if (rand < 20) id = "tien";
                else if (rand < 50) id = "thien";
                else id = "dia";
            } else if (pool === 'start') {
                // Khởi đầu: Phàm -> Thiên
                // Tỉ lệ: Thiên 7%, Địa 13%, Linh 30%, Phàm 50%
                if (rand < 7) id = "thien";
                else if (rand < 20) id = "dia";
                else if (rand < 50) id = "linh";
                else id = "pham";
            } else {
                // Tẩy Tủy Đan thường: Phàm -> Chí Tôn
                // Tỉ lệ: Chí Tôn 0.5%, Tiên 1.5%, Thiên 5%, Địa 13%, Linh 30%, Phàm 50%
                if (rand < 0.5) id = "chiton";
                else if (rand < 2) id = "tien";
                else if (rand < 7) id = "thien";
                else if (rand < 20) id = "dia";
                else if (rand < 50) id = "linh";
                else id = "pham";
            }
            
            proxyState.boneQualityId = id;
            
            const auraSkills = [
                "skill_aura_shield",
                "skill_aura_evil_reflect",
                "skill_aura_vile_poison",
                "skill_aura_power"
            ];

            // Nếu là Chí Tôn Cốt, nhận 1 loại thần thông hào quang ngẫu nhiên
            if (id === "chiton") {
                // Kiểm tra xem đã có kỹ năng hào quang nào chưa
                const hasAura = proxyState.skills.some(sid => auraSkills.includes(sid));
                
                if (!hasAura) {
                    const randomAura = auraSkills[Math.floor(Math.random() * auraSkills.length)];
                    this.learnSkillById(randomAura, true);
                    if (!silent && typeof UI !== 'undefined') {
                        const skillData = GameData.skills[randomAura];
                        UI.addLog(`✨ <b>CHÍ TÔN CỐT:</b> Đạo hữu lĩnh ngộ được thần thông hào quang <b>${skillData.name}</b>!`, true);
                    }
                }
            } else {
                // Nếu không còn là Chí Tôn Cốt, xóa bỏ kỹ năng hào quang (nếu có)
                const existingAura = proxyState.skills.find(sid => auraSkills.includes(sid));
                if (existingAura) {
                    proxyState.skills = proxyState.skills.filter(sid => sid !== existingAura);
                    if (!silent && typeof UI !== 'undefined') {
                        const skillData = GameData.skills[existingAura];
                        UI.addLog(`⚠️ <b>MẤT ĐI CHÍ TÔN CỐT:</b> Thần thông hào quang <b>${skillData.name}</b> đã biến mất!`, true);
                    }
                }
            }

            if (!silent && typeof UI !== 'undefined') {
                const bone = GameData.boneQualities[id];
                UI.addLog(`✨ <b>THIÊN ĐẠO CHIẾU CỐ:</b> Đạo hữu thức tỉnh <b><span style="color:${bone.color}">${bone.name}</span></b>!`, true);
            }
            if (typeof UI !== 'undefined') {
                UI.updateBar('bone', id);
            }
        },

        getItemCount: function(itemId) {
            let count = 0;
            proxyState.inventory.forEach(item => {
                if (item.id === itemId) count += item.count;
            });
            return count;
        },

        rerollBone: function(isAdvanced = false) {
            const stoneCost = isAdvanced ? 5000 : 1000;
            const pillId = isAdvanced ? "item_tay_tuy_dan_cao_cap" : "item_tay_tuy_dan";
            const pillName = isAdvanced ? "Tẩy Tủy Đan Cao Cấp" : "Tẩy Tủy Đan";
            
            const stoneCount = proxyState.spiritStone;
            const pillCount = this.getItemCount(pillId);
            
            let missingItems = [];
            if (stoneCount < stoneCost) missingItems.push(`${stoneCost} Linh Thạch`);
            if (pillCount < 1) missingItems.push(`1 viên ${pillName}`);

            if (missingItems.length > 0) {
                UI.addLog(`❌ <b>Tẩy Tủy Thất Bại:</b> Đạo hữu còn thiếu: <b style="color:#ff4444">${missingItems.join(" và ")}</b>.`, true);
                return;
            }
            
            // Tiêu tốn tài nguyên
            proxyState.spiritStone -= stoneCost;
            this.removeItemsById(pillId, 1);
            
            // Thực hiện roll lại
            this.rollBoneQuality(false, isAdvanced ? 'advanced' : 'normal');
            
            UI.addLog(`✨ <b>Tẩy Tủy Thành Công:</b> Đạo hữu đã sử dụng ${pillName} và cải biến căn cốt!`, true);
            this.saveGame();
            
            // Cập nhật lại túi đồ nếu đang mở
            if (typeof BagSystem !== 'undefined') BagSystem.renderBag(proxyState.inventory);
            if (UI.updateBoneUI) UI.updateBoneUI(proxyState.boneQualityId);
        },

        toggleAutoCultivate: function() {
            state.autoCultivateEnabled = !state.autoCultivateEnabled;
            state.autoCultivatePaused = false;
            
            const mainBtn = document.getElementById('auto-cultivate-main-btn');
            if (mainBtn) {
                mainBtn.innerText = state.autoCultivateEnabled ? "TU LUYỆN TỰ ĐỘNG (ĐANG BẬT)" : "TU LUYỆN TỰ ĐỘNG";
            }

            if (state.autoCultivateEnabled) {
                this.startAutoCultivate();
            } else {
                this.stopAutoCultivate();
            }
            return state.autoCultivateEnabled;
        },

        setAutoCultivateThreshold: function(val) {
            state.autoCultivateThreshold = val;
        },

        toggleAutoSkill: function() {
            state.autoSkillEnabled = !state.autoSkillEnabled;
            return state.autoSkillEnabled;
        },

        toggleAutoExplore: function() {
            state.autoExploreEnabled = !state.autoExploreEnabled;
            return state.autoExploreEnabled;
        },

        isAutoSkillEnabled: function() {
            return state.autoSkillEnabled;
        },

        isAutoExploreEnabled: function() {
            return state.autoExploreEnabled;
        },

        getCombatTactic: function() {
            return state.combatTactic || 'balanced';
        },

        setCombatTactic: function(tactic) {
            state.combatTactic = tactic;
            this.saveGame();
        },

        getCustomTacticRules: function() {
            return state.customTacticRules || [];
        },

        setCustomTacticRules: function(rules) {
            state.customTacticRules = rules;
            this.saveGame();
        },

        getPotionSettings: function() {
            if (!state.potionSettings || !state.potionSettings.slots) {
                // Khởi tạo mặc định nếu chưa có hoặc cấu trúc cũ
                const oldSettings = state.potionSettings || {};
                state.potionSettings = {
                    slots: [
                        { enabled: oldSettings.autoHp !== undefined ? oldSettings.autoHp : true, pillId: 'hp_pill_1', condition: 'hp_low', threshold: oldSettings.hpThreshold || 30 },
                        { enabled: oldSettings.autoMp !== undefined ? oldSettings.autoMp : true, pillId: 'mp_pill_1', condition: 'mp_low', threshold: oldSettings.mpThreshold || 20 }
                    ]
                };
            } else {
                // Migration: Đảm bảo các slot cũ có condition và xử lý 'always'
                state.potionSettings.slots.forEach(slot => {
                    if (!slot.condition || slot.condition === 'always') {
                        if (slot.condition === 'always') {
                            slot.condition = 'interval';
                            slot.interval = 10;
                        } else {
                            slot.condition = slot.type === 'mp' ? 'mp_low' : 'hp_low';
                        }
                        delete slot.type;
                    }
                    if (slot.condition === 'interval' && !slot.interval) {
                        slot.interval = 10;
                    }
                });
            }
            return state.potionSettings;
        },

        setPotionSettings: function(settings) {
            state.potionSettings = settings;
            this.saveGame();
        },

        getSkillPriorities: function() {
            return state.skillPriorities || {};
        },

        setSkillPriority: function(skillId, priority) {
            if (!state.skillPriorities) state.skillPriorities = {};
            state.skillPriorities[skillId] = priority;
        },

        getToggledSkills: function() {
            return state.toggledSkills || [];
        },

        toggleSkillAutoUse: function(skillId) {
            if (!state.toggledSkills) state.toggledSkills = [];
            const index = state.toggledSkills.indexOf(skillId);
            if (index > -1) {
                state.toggledSkills.splice(index, 1);
            } else {
                state.toggledSkills.push(skillId);
            }
            return state.toggledSkills.includes(skillId);
        },

        startAutoCultivate: function() {
            if (state.autoCultivateInterval) clearInterval(state.autoCultivateInterval);
            state.autoCultivateInterval = setInterval(() => {
                if (!state.autoCultivateEnabled) return;

                const totals = calculateTotals(state);
                const threshold = totals.totalStaminaMax * state.autoCultivateThreshold;
                const resumeThreshold = totals.totalStaminaMax * 0.9;

                // Nếu đang tạm dừng, kiểm tra xem đã đủ 90% để tiếp tục chưa
                if (state.autoCultivatePaused) {
                    if (proxyState.stamina >= resumeThreshold) {
                        state.autoCultivatePaused = false;
                        UI.addLog(`Thể lực đã hồi phục trên 90%, tiếp tục tự động tu luyện.`);
                    } else {
                        return; // Vẫn đang tạm dừng
                    }
                }

                // Kiểm tra xem có cần tạm dừng không
                if (proxyState.stamina < threshold) {
                    state.autoCultivatePaused = true;
                    UI.addLog(`Tự động tu luyện tạm dừng do thể lực dưới ${Math.round(state.autoCultivateThreshold * 100)}%. Sẽ tiếp tục khi đạt 90%.`, true);
                    return;
                }
                
                // Nếu đang thám hiểm hoặc chiến đấu thì bỏ qua lượt này
                if (this.isExploring || this.isInBattle) return;
                
                // Nếu đủ linh khí để đột phá thì dừng hẳn
                const cur = GameData.ranks[proxyState.rankIndex];
                if (proxyState.mana >= cur.expReq && proxyState.rankIndex < GameData.ranks.length - 1) {
                    UI.addLog("✨ Linh khí đã tràn đầy, tự động tu luyện dừng lại để đạo hữu đột phá!", true);
                    this.stopAutoCultivate();
                    return;
                }

                // Thực hiện tu luyện
                this.cultivate();
            }, 1000);
        },

        generateDailyMissions: function() {
            const missions = {};
            const missionKeys = Object.keys(GameData.dailyMissions);
            
            // Shuffle and pick 8
            const shuffled = [...missionKeys].sort(() => 0.5 - Math.random());
            const selectedKeys = shuffled.slice(0, 8);
            
            selectedKeys.forEach(key => {
                const missionDef = GameData.dailyMissions[key];
                const level = Math.random() < 0.3 ? 2 : 1; // 30% chance for level 2
                const target = level === 1 ? missionDef.target1 : missionDef.target2;
                
                missions[key] = {
                    id: key,
                    progress: 0,
                    target: target,
                    level: level,
                    claimed: false
                };
            });
            
            proxyState.dailyMissions = missions;
            proxyState.dailyMissionLastReset = new Date().setHours(0, 0, 0, 0);
            this.saveGame();
        },

        checkDailyReset: function() {
            if (proxyState.giftChoicesLeft > 0) return;
            
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            
            if (!proxyState.dailyMissionLastReset || proxyState.dailyMissionLastReset < todayStart) {
                this.generateDailyMissions();
                UI.addLog("📅 Nhiệm vụ hàng ngày đã được làm mới!", "info");
            }
        },

        incrementDailyMissionProgress: function(missionId, amount = 1) {
            if (!proxyState.dailyMissions || !proxyState.dailyMissions[missionId]) return;
            
            const mission = proxyState.dailyMissions[missionId];
            if (mission.claimed) return;
            
            mission.progress = Math.min(mission.target, mission.progress + amount);
            proxyState.dailyMissions = { ...proxyState.dailyMissions }; // Trigger proxy
            
            if (mission.progress >= mission.target) {
                UI.addLog(`✅ Hoàn thành nhiệm vụ: <b>${GameData.dailyMissions[missionId].name}</b>!`, "success");
            }
        },

        generateEquipment: function() {
            const allEquips = Object.values(GameData.items).filter(item => item.type === 'equipment');
            const rankIndex = proxyState.rankIndex;
            
            // Filter by rarity based on rank
            let allowedRarities = ['common', 'uncommon'];
            if (rankIndex >= 5) allowedRarities.push('rare');
            if (rankIndex >= 10) allowedRarities.push('epic');
            if (rankIndex >= 15) allowedRarities.push('legendary');
            if (rankIndex >= 20) allowedRarities.push('mythic');
            
            const filtered = allEquips.filter(eq => allowedRarities.includes(eq.rarity));
            if (filtered.length === 0) return allEquips[0];
            
            return filtered[Math.floor(Math.random() * filtered.length)];
        },

        claimDailyMissionReward: function(missionId) {
            const mission = proxyState.dailyMissions[missionId];
            if (!mission || mission.progress < mission.target || mission.claimed) return;
            
            const missionDef = GameData.dailyMissions[missionId];
            const multiplier = mission.level === 2 ? 1.3 : 1.0;
            
            const reward = missionDef.baseReward;
            let rewardMsg = [];
            
            if (reward.spiritStone) {
                const stones = Math.floor(reward.spiritStone * multiplier);
                proxyState.spiritStone += stones;
                rewardMsg.push(`<b style="color:#ffd700">${stones} Linh Thạch</b>`);
            }
            
            if (reward.mana) {
                const mana = Math.floor(reward.mana * multiplier);
                proxyState.mana += mana;
                rewardMsg.push(`<b style="color:#4caf50">${mana} Linh khí</b>`);
            }

            if (reward.sectContribution) {
                const contrib = Math.floor(reward.sectContribution * multiplier);
                proxyState.sectContribution += contrib;
                if (proxyState.currentSectId) {
                    proxyState.sectContributions[proxyState.currentSectId] = (proxyState.sectContributions[proxyState.currentSectId] || 0) + contrib;
                }
                rewardMsg.push(`<b style="color:#2196f3">${contrib} Cống hiến</b>`);
            }

            if (reward.sectReputation) {
                const rep = Math.floor(reward.sectReputation * multiplier);
                if (proxyState.currentSectId) {
                    proxyState.sectReputation[proxyState.currentSectId] = (proxyState.sectReputation[proxyState.currentSectId] || 0) + rep;
                }
                rewardMsg.push(`<b style="color:#a335ee">${rep} Danh vọng</b>`);
            }

            // Extra items
            if (reward.items) {
                reward.items.forEach(itemInfo => {
                    const count = Math.floor(itemInfo.count * multiplier);
                    this.addItem(itemInfo.id, count);
                    const itemData = GameData.items[itemInfo.id];
                    rewardMsg.push(`<b style="color:#ff9800">${count} ${itemData ? itemData.name : itemInfo.id}</b>`);
                });
            }

            // Equipment chance
            if (reward.equipment) {
                const chance = mission.level === 2 ? 0.5 : 0.3; // 30% or 50% chance
                if (Math.random() < chance) {
                    const equip = this.generateEquipment();
                    if (equip) {
                        this.addItem(equip.id, 1);
                        rewardMsg.push(`<b style="color:#e91e63">1 ${equip.name}</b>`);
                    }
                }
            }
            
            mission.claimed = true;
            proxyState.dailyMissions = { ...proxyState.dailyMissions };
            
            UI.addLog(`🎁 Đã nhận thưởng nhiệm vụ: ${rewardMsg.join(", ")}`, "success");
            this.saveGame();
            if (UI.renderQuestTab) UI.renderQuestTab(proxyState);
        },

        stopAutoCultivate: function() {
            state.autoCultivateEnabled = false;
            state.autoCultivatePaused = false;
            if (state.autoCultivateInterval) {
                clearInterval(state.autoCultivateInterval);
                state.autoCultivateInterval = null;
            }
            const mainBtn = document.getElementById('auto-cultivate-main-btn');
            if (mainBtn) {
                mainBtn.innerText = "TU LUYỆN TỰ ĐỘNG";
            }
        }
    };

    // Khởi tạo UI sau khi Game đã sẵn sàng
    setTimeout(() => {
        if (typeof UI !== 'undefined') {
            if (UI.initAutoCultivate) UI.initAutoCultivate();
            if (UI.initBattleSettings) UI.initBattleSettings();
        }
    }, 100);

    return gameMethods;
})();

window.Game = Game;
