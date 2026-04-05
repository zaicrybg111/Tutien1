const PetSystem = {
    getSpeedModifier: function(proxy) {
        // Placeholder for pet speed bonus
        return 1;
    },

    /**
     * Kiểm tra linh thú có thể nhận thêm linh khí không
     */
    canPetGainExp: function(petUid, proxy) {
        if (!proxy) proxy = (window.Game && window.Game.getProxy) ? window.Game.getProxy() : null;
        if (!proxy) return true;
        
        const pet = proxy.pets.find(p => p.uid === petUid);
        if (!pet) return false;
        
        const petRankIndex = this.getPetRankIndex(pet.id, pet.level, pet.statMultiplier || 1.0, true); // true để lấy rank thực tế
        const playerRankIndex = proxy.rankIndex || 0;
        
        // Nếu cảnh giới pet >= cảnh giới người chơi + 3 thì không nhận exp nữa
        return petRankIndex < playerRankIndex + 3;
    },

    /**
     * Lấy chỉ số cảnh giới của pet (rank index)
     * @param {boolean} realRank Nếu true, lấy rank thực tế không bị phong ấn
     */
    getPetRankIndex: function(petId, petLevel, individualMultiplier = 1.0, realRank = false) {
        const stats = this.getPetStats(petId, petLevel, individualMultiplier, realRank);
        if (!stats) return 0;
        
        let effectiveRankIndex = Math.min(GameData.ranks.length - 1, (realRank ? petLevel : (stats.effectiveLevel || petLevel)) - 1);
        if (typeof Game !== 'undefined' && Game.getEffectiveRank) {
            const calculatedRankIndex = Game.getEffectiveRank(stats);
            if (calculatedRankIndex > effectiveRankIndex) {
                effectiveRankIndex = calculatedRankIndex;
            }
        }
        return effectiveRankIndex;
    },

    /**
     * Lấy dữ liệu pet từ ID hoặc UID
     */
    getPetData: function(petIdOrUid, petsList = null) {
        if (!petIdOrUid) return null;
        
        let petId = petIdOrUid;
        // Nếu là UID (thường chứa chuỗi dài và không có trực tiếp trong GameData.pets)
        if (!GameData.pets[petIdOrUid]) {
            // Thử tìm trong danh sách pet được cung cấp hoặc từ Game state
            const list = petsList || (window.Game && window.Game.getProxy ? window.Game.getProxy().pets : []);
            if (list && Array.isArray(list)) {
                const pet = list.find(p => p.uid === petIdOrUid);
                if (pet) petId = pet.id;
            }
        }
        
        const petData = GameData.pets[petId];
        if (!petData) {
            console.warn(`PetSystem: Không tìm thấy dữ liệu cho pet ID/UID "${petIdOrUid}".`);
            return null;
        }
        return petData;
    },

    /**
     * Lấy tên hiển thị của pet (có thêm số nếu trùng tên)
     */
    getPetDisplayName: function(petUid, petsList = null) {
        const list = petsList || (window.Game && window.Game.getProxy ? window.Game.getProxy().pets : []);
        if (!list || !Array.isArray(list)) return "Linh thú";
        
        const pet = list.find(p => p.uid === petUid);
        if (!pet) return "Linh thú";
        
        const petData = GameData.pets[pet.id];
        if (!petData) return "Linh thú";
        
        let name = petData.name;
        
        const sameNamePets = list.filter(p => {
            const pData = GameData.pets[p.id];
            return pData && pData.name === petData.name;
        });
        
        if (sameNamePets.length <= 1) return name;
        
        // Tìm vị trí của pet này trong danh sách các pet cùng tên
        const index = sameNamePets.findIndex(p => p.uid === petUid);
        return `${name} ${index + 1}`;
    },

    /**
     * Lấy chỉ số pet cho hiển thị UI
     * @param {boolean} ignoreSeal Nếu true, bỏ qua việc phong ấn cảnh giới (lấy chỉ số thực)
     */
    getPetStats: function(petId, petLevel, individualMultiplier = 1.0, ignoreSeal = false) {
        const petData = this.getPetData(petId);
        if (!petData) return null;
        
        // Ensure petLevel is a number
        let level = Number(petLevel) || 1;
        let isSealed = false;
        let originalLevel = level;

        // Kiểm tra phong ấn cảnh giới (giới hạn chênh lệch tối đa 3 tiểu cảnh giới so với người chơi)
        if (!ignoreSeal && typeof Game !== 'undefined' && Game.getProxy) {
            const proxy = Game.getProxy();
            const playerRankIndex = proxy.rankIndex || 0;
            
            // Tìm level tối đa mà pet có thể đạt được mà không vượt quá playerRankIndex + 3
            // Vì level pet tương ứng với rankIndex + 1
            const maxAllowedLevel = playerRankIndex + 4; // playerRankIndex + 1 (cùng cấp) + 3 (chênh lệch)
            
            if (level > maxAllowedLevel) {
                level = maxAllowedLevel;
                isSealed = true;
            }
        }
        
        // Lấy hệ số phát triển và hệ số cơ bản từ rank
        const rankInfo = (GameData.petRanks && GameData.petRanks[petData.rank]) || { growth: 1.1, baseMult: 1.0 };
        const growthCoeff = Number(rankInfo.growth) || 1.1;
        const baseMult = Number(rankInfo.baseMult) || 1.0;
        
        // Cân bằng lại chỉ số: Tăng trưởng theo level pet (Sử dụng lũy thừa/tích lũy để đạt hệ số 1.6 mỗi cấp, khớp với nhân vật)
        let levelMult = 1.0;
        if (typeof GameData !== 'undefined' && GameData.ranks) {
            for (let i = 1; i < level; i++) {
                const rank = GameData.ranks[i];
                levelMult *= (rank ? (rank.mult || growthCoeff) : growthCoeff);
            }
        } else {
            levelMult = Math.pow(growthCoeff, level - 1);
        }
        
        const safeIndividualMultiplier = Number(individualMultiplier) || 1.0;
        
        let finalMult = baseMult * levelMult * safeIndividualMultiplier;
        if (isNaN(finalMult) || finalMult <= 0) finalMult = 1.0;
        
        const stats = {
            hpMax: Math.max(100, Math.floor((Number(petData.hpBase) || 100) * finalMult)),
            atk: Math.max(10, Math.floor((Number(petData.atkBase) || 10) * finalMult)),
            def: Math.max(5, Math.floor((Number(petData.defBase) || 5) * finalMult)),
            thanphap: Math.max(5, Math.floor((Number(petData.thanphapBase) || 5) * finalMult)),
            luk: Math.max(0, Math.floor((Number(petData.lukBase) || 0) * finalMult)),
            mpMax: Math.max(60, Math.floor((Number(petData.mpBase) || 60) * finalMult)),
            stamina: 100 + ((typeof Game !== 'undefined' && Game.getMajorRankIndex) ? Game.getMajorRankIndex(level - 1) : 0) * 10,
            maxSpirit: Math.floor((GameData.ranks[(ignoreSeal ? originalLevel : level) - 1] ? GameData.ranks[(ignoreSeal ? originalLevel : level) - 1].expReq : 1000) * 1.5)
        };

        // --- DYNAMIC RANK SCALING ---
        let effectiveRankIndex = Math.min(GameData.ranks.length - 1, level - 1);
        if (typeof Game !== 'undefined' && Game.getEffectiveRank) {
            const calculatedRankIndex = Game.getEffectiveRank(stats);
            if (calculatedRankIndex > effectiveRankIndex) {
                effectiveRankIndex = calculatedRankIndex;
            }
        }
        
        // Lấy tên cảnh giới từ GameData.ranks
        let realmName = GameData.ranks[effectiveRankIndex] ? GameData.ranks[effectiveRankIndex].name : "Phàm Nhân";
        if (realmName === "Phàm Nhân") realmName = "Phàm Yêu";

        return {
            hpMax: stats.hpMax,
            atk: stats.atk,
            def: stats.def,
            thanphap: stats.thanphap,
            luk: stats.luk,
            mpMax: stats.mpMax,
            stamina: stats.stamina,
            maxSpirit: stats.maxSpirit,
            rank: petData.rank || "Phàm cấp",
            realm: realmName,
            isSealed: isSealed,
            effectiveLevel: level,
            originalLevel: originalLevel
        };
    },

    /**
     * Đột phá linh thú lên cấp mới
     */
    levelUpPet: function(petUid) {
        const proxy = Game.getProxy();
        const petIndex = proxy.pets.findIndex(p => p.uid === petUid);
        if (petIndex === -1) return;
        
        const pet = proxy.pets[petIndex];
        const petLevel = pet.level || 1;
        const stats = this.getPetStats(pet.id, petLevel, pet.statMultiplier || 1.0);
        
        if (pet.spirit >= stats.maxSpirit) {
            const oldLevel = petLevel;
            pet.spirit -= stats.maxSpirit;
            pet.level = petLevel + 1;
            
            // Hồi phục 100% mana và stamina khi lên cấp
            const newStats = this.getPetStats(pet.id, pet.level, pet.statMultiplier || 1.0);
            pet.mana = newStats.mpMax;
            pet.stamina = newStats.stamina;
            
            proxy.pets = [...proxy.pets];
            UI.addLog(`✨ Chúc mừng! Linh thú <b style="color:#ffeb3b">${this.getPetDisplayName(petUid)}</b> đã đột phá lên <b style="color:#00f2ff">${newStats.realm}</b>!`);
            
            // Kiểm tra mở khóa kỹ năng
            const petData = GameData.pets[pet.id];
            const signatureSkills = {
                "Thiên cấp": "skill_pet_thunder_strike",
                "Thần cấp": "skill_pet_phoenix_flame",
                "Cực phẩm cấp": "skill_pet_dragon_breath"
            };
            const signatureSkillId = signatureSkills[petData.rank];
            if (signatureSkillId) {
                const wasLocked = this.isSkillLocked(signatureSkillId, oldLevel, pet.skills);
                const isNowUnlocked = !this.isSkillLocked(signatureSkillId, pet.level, pet.skills);
                if (wasLocked && isNowUnlocked) {
                    UI.addLog(`🎊 TUYỆT VỜI! Linh thú đã mở khóa kỹ năng tối thượng: <b style="color:#ff4081">${GameData.petSkills[signatureSkillId].name}</b>!`);
                    UI.openModal("KỸ NĂNG MỚI", `
                        <div style="text-align:center; padding: 15px;">
                            <h3 style="color:#ffeb3b; margin-bottom:10px;">KHAI PHÁ TIỀM NĂNG</h3>
                            <p>Linh thú của đạo hữu đã đạt tới cảnh giới mới, khai mở kỹ năng tối thượng:</p>
                            <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:8px; margin:15px 0; border:1px solid #ffeb3b;">
                                <div style="font-size:1.5rem; margin-bottom:5px;">${GameData.petSkills[signatureSkillId].icon || '🐾'}</div>
                                <div style="color:#ffeb3b; font-weight:bold; font-size:1.1rem;">${GameData.petSkills[signatureSkillId].name}</div>
                                <div style="color:#aaa; font-size:0.85rem; margin-top:5px;">${GameData.petSkills[signatureSkillId].desc}</div>
                            </div>
                            <p style="color:#4caf50; font-size:0.9rem;">Buff bù đắp thân pháp sẽ không còn hiệu lực trong các trận chiến tới.</p>
                            <button onclick="UI.closeModal()" style="background:#4caf50; color:white; border:none; padding:8px 20px; border-radius:4px; cursor:pointer; margin-top:10px;">XÁC NHẬN</button>
                        </div>
                    `);
                }
            }
            
            // Refresh UI
            UI.showPetDetail(petUid, pet.id);
            UI.renderPetTab(proxy);
        } else {
            UI.addLog(`❌ Linh thú chưa đủ linh khí để đột phá! (Cần ${stats.maxSpirit - pet.spirit} linh khí nữa)`);
        }
    },

    /**
     * Kiểm tra kỹ năng pet có bị khóa không
     */
    isSkillLocked: function(skillId, petLevel, petSkills) {
        const skill = GameData.petSkills[skillId];
        if (!skill || !skill.lockRank) return false;
        if ((petLevel || 1) >= skill.lockRank) return false;
        
        // Nếu có danh sách kỹ năng, chỉ khóa kỹ năng có lockRank cao nhất chưa đạt được
        if (petSkills && Array.isArray(petSkills)) {
            const highestUnmet = this.getHighestUnmetLockRank(petSkills, petLevel);
            return skill.lockRank === highestUnmet;
        }
        
        return true;
    },

    /**
     * Lấy lockRank cao nhất chưa đạt được trong danh sách kỹ năng
     */
    getHighestUnmetLockRank: function(petSkills, petLevel) {
        if (!petSkills || !Array.isArray(petSkills)) return -1;
        let highest = -1;
        petSkills.forEach(skillId => {
            const skill = GameData.petSkills[skillId];
            if (skill && skill.lockRank) {
                const levelReq = Number(skill.lockRank) || 0;
                if (petLevel < levelReq) {
                    if (levelReq > highest) highest = levelReq;
                }
            }
        });
        return highest;
    },

    /**
     * Lấy mô tả khóa kỹ năng
     */
    getSkillLockDesc: function(skillId, petName) {
        const skill = GameData.petSkills[skillId];
        if (!skill || !skill.lockRank) return "";
        const rank = GameData.ranks.find(r => r.id === skill.lockRank);
        let desc = rank ? `Yêu cầu Linh thú đạt cảnh giới ${rank.name} để mở khóa kỹ năng này.` : "Đang bị khóa";
        if (petName) {
            desc += `<br/><span style="color:#4caf50; font-size: 0.7rem;">Trước khi kỹ năng này được mở khóa, linh thú ${petName} sẽ nhận được hiệu ứng tăng 10% Thân Pháp khi vào chiến đấu.</span>`;
        }
        return desc;
    },

    /**
     * Khởi tạo pet cho chiến đấu
     */
    initPetForBattle: function(petUid, playerLevel, petsList = null) {
        const proxy = window.Game && window.Game.getProxy ? window.Game.getProxy() : null;
        const list = petsList || (proxy ? proxy.pets : []);
        const petInstance = list.find(p => p.uid === petUid);
        
        // Nếu không tìm thấy instance (có thể petId là ID gốc), dùng playerLevel làm fallback
        const petLevel = petInstance ? (petInstance.level || 1) : (playerLevel + 1);
        const individualMultiplier = petInstance ? (petInstance.individualMultiplier || petInstance.statMultiplier || 1.0) : 1.0;
        
        const petData = this.getPetData(petUid, list);
        if (!petData) {
            console.error(`PetSystem: Không thể khởi tạo pet cho trận đấu với ID/UID "${petUid}".`);
            return null;
        }

        const stats = this.getPetStats(petData.id, petLevel, individualMultiplier) || {
            realm: "Phàm Nhân",
            hpMax: 100,
            mpMax: 100,
            stamina: 100,
            atk: 10,
            def: 5,
            thanphap: 5,
            luk: 0,
            maxSpirit: 1000
        };
        console.log(`PetSystem: Khởi tạo pet ${petData.name} (Cấp ${petLevel}) cho trận đấu.`, petData);
        
        const stamina = petInstance ? (typeof petInstance.stamina !== 'undefined' ? petInstance.stamina : stats.stamina) : stats.stamina;
        const debuffs = [];
        const buffs = [];
        
        // Kiểm tra thể lực để áp dụng debuff Suy Yếu
        if (stamina < 5) {
            const duration = 5000;
            debuffs.push({
                type: "PetWeakened",
                duration: duration, // 5 giây
                expiry: Date.now() + duration,
                startTime: Date.now(),
                name: "Suy Yếu (Linh Thú)",
                icon: "📉"
            });
            if (typeof UI !== 'undefined') {
                UI.addLog(`⚠️ Linh thú <b style="color:#ffeb3b">${this.getPetDisplayName(petUid, list)}</b> đang kiệt sức, nhận trạng thái Suy Yếu!`);
            }
        }

        // Kiểm tra kỹ năng bị khóa và áp dụng buff bù đắp
        let hasLockedSkill = false;
        let petSkills = petInstance ? (petInstance.skills || []) : (petData.skills || []);
        if (petSkills.length === 0 && petData.skills) {
            petSkills = petData.skills;
        }
        const highestUnmet = this.getHighestUnmetLockRank(petSkills, petLevel);
        
        if (highestUnmet !== -1) {
            hasLockedSkill = true;
        }

        if (hasLockedSkill) {
            const duration = 999999999; // Vô hạn trong trận đấu
            buffs.push({
                type: "PetCompensatoryBuff",
                duration: duration,
                expiry: Date.now() + duration,
                startTime: Date.now(),
                name: "Thân Pháp Linh Thú (Bù đắp)",
                icon: "⚡",
                stats: { thanphap: 0.1 }
            });
        }

        return {
            ...petData,
            uid: petUid,
            displayName: this.getPetDisplayName(petUid, list),
            realm: stats.realm,
            isPet: true,
            level: petLevel,
            hp: petInstance ? (typeof petInstance.hp !== 'undefined' ? petInstance.hp : (Math.floor(stats.hpMax) || 100)) : (Math.floor(stats.hpMax) || 100),
            hpMax: Math.floor(stats.hpMax) || 100,
            mp: petInstance ? (typeof petInstance.mana !== 'undefined' ? petInstance.mana : (Math.floor(stats.mpMax) || 60)) : (Math.floor(stats.mpMax) || 60),
            mpMax: Math.floor(stats.mpMax) || 60,
            stamina: Number(stamina) || 100,
            staminaMax: Math.floor(stats.stamina) || 100,
            shieldMax: Math.floor((Number(stats.mpMax) || 60) * 0.5),
            shield: Math.floor((Number(stats.mpMax) || 60) * 0.05),
            atk: Math.floor(stats.atk) || 10,
            def: Math.floor(stats.def) || 5,
            thanphap: Math.floor(stats.thanphap) || 5,
            spirit: petInstance ? (petInstance.spirit || 0) : 0,
            maxSpirit: stats.maxSpirit,
            currentCooldowns: {},
            activeBuffs: buffs,
            activeDebuffs: debuffs,
            isMutated: petInstance ? petInstance.isMutated : false,
            chargingSkill: null
        };
    },

    /**
     * Xử lý lượt của pet trong chiến đấu
     */
    processPetTurn: function(pet, enemy, battleLog, owner) {
        if (!pet || pet.hp <= 0) return null;

        // Kiểm tra trung thành
        const loyalty = pet.loyalty || 100;
        if (loyalty < 40 && Math.random() < 0.6) {
            battleLog.push(`<span style="color:#ff9800">${pet.displayName || pet.name}</span> tỏ ra bướng bỉnh, không chịu tấn công! (Trung thành thấp: ${loyalty}%)`);
            return null;
        }

        // Kiểm tra khống chế
        if (typeof BattleSystem !== 'undefined') {
            if (BattleSystem.isStunned(pet)) {
                // Nếu đang bị khống chế khi đang tụ lực, hủy chiêu
                if (pet.chargingSkill) {
                    battleLog.push(`<span style="color:#ffeb3b">${pet.displayName || pet.name}</span> bị khống chế, chiêu thức <span style="color:#ff4081">${pet.chargingSkill.name}</span> bị gián đoạn!`);
                    pet.chargingSkill = null;
                }
                return null;
            }
            
            // Kiểm tra Mù (Blind)
            if (BattleSystem.isBlind(pet) && Math.random() < 0.4) {
                battleLog.push(`<span style="color:#ffeb3b">${pet.displayName || pet.name}</span> bị Mù, đòn tấn công bị hụt!`);
                return null;
            }

            // Kiểm tra Hỗn Loạn (Confuse)
            if (BattleSystem.isConfused(pet)) {
                if (Math.random() < 0.5) {
                    const selfDmg = Math.max(1, Math.floor(pet.atk * 0.5));
                    if (BattleSystem.applyDamage) {
                        const shieldLog = BattleSystem.applyDamage(pet, selfDmg, "pet");
                        battleLog.push(`<span style="color:#ffeb3b">${pet.displayName || pet.name}</span> đang bị <b>Hỗn Loạn</b>, tâm trí bất định tự tấn công bản thân gây <b style="color:#ff4444">${selfDmg} ST</b>${shieldLog}!`);
                    }
                    // Nếu đang tụ lực bị hỗn loạn cũng hủy chiêu
                    if (pet.chargingSkill) {
                        pet.chargingSkill = null;
                    }
                    return null;
                } else {
                    battleLog.push(`<span style="color:#ffeb3b">${pet.displayName || pet.name}</span> đang bị <b>Hỗn Loạn</b>, đầu óc quay cuồng nhưng vẫn cố gắng hành động!`);
                }
            }
        }

        // Xử lý tụ lực kỹ năng
        if (pet.chargingSkill) {
            // Tụ lực theo thời gian thực tế được xử lý trong battle.js loop
            // Ở đây chỉ kiểm tra nếu đã xong
            if (pet.chargingSkill.timeLeft <= 0) {
                const usedSkill = pet.chargingSkill;
                pet.chargingSkill = null;
                return this.executePetSkill(pet, enemy, usedSkill, battleLog, owner);
            } else {
                battleLog.push(`đang tập trung linh khí, chuẩn bị thi triển <span style="color:#ff4081">${pet.chargingSkill.name}</span>... (Còn ${(pet.chargingSkill.timeLeft / 1000).toFixed(1)}s)`);
                return null;
            }
        }

        // Tính toán chỉ số thực tế (bao gồm buff/debuff)
        let petAtk = pet.atk;
        let petDef = pet.def;
        let petThanphap = pet.thanphap;

        if (pet.activeBuffs) {
            pet.activeBuffs.forEach(b => {
                if (b.type === "AtkBuff" || b.type === "PowerAura") petAtk += (pet.atk * 0.2);
                if (b.type === "DefBuff" || b.type === "PowerAura") petDef += (pet.def * 0.2);
                if (b.type === "SpdBuff") petThanphap += (pet.thanphap * 0.2);
                if (b.type === "PetCompensatoryBuff") petThanphap += (pet.thanphap * b.value);
            });
        }
        if (pet.activeDebuffs) {
            pet.activeDebuffs.forEach(d => {
                if (d.type === "Weakness") petAtk *= 0.75;
                if (d.type === "PetWeakened") petAtk *= 0.5;
                if (d.type === "ArmorBreak") petDef *= 0.5;
                if (d.type === "Freeze") petDef *= 0.8;
                if (d.type === "SpdDebuff") petThanphap *= 0.7;
            });
        }

        // Chọn kỹ năng dựa trên mức độ ưu tiên
        let selectedSkill = null;
        const isSilenced = typeof BattleSystem !== 'undefined' && BattleSystem.isSilenced(pet);
        const playerRankId = owner ? owner.rankId : 1;
        
        if (!isSilenced) {
            const sortedSkillIds = [...pet.skills].sort((a, b) => {
                const priorityMap = { 'high': 3, 'medium': 2, 'low': 1, 'off': 0 };
                const prioA = (owner && owner.skillPriorities && owner.skillPriorities[a]) || 'medium';
                const prioB = (owner && owner.skillPriorities && owner.skillPriorities[b]) || 'medium';
                return (priorityMap[prioB] || 0) - (priorityMap[prioA] || 0);
            });

            for (let skillId of sortedSkillIds) {
                const skill = GameData.petSkills[skillId];
                if (skill) {
                    // Kiểm tra kỹ năng bị khóa (Dùng cấp độ của pet)
                    if (this.isSkillLocked(skillId, pet.level || 1, pet.skills)) continue;

                    const priority = (owner && owner.skillPriorities && owner.skillPriorities[skillId]) || 'medium';
                    if (priority === 'off') continue;

                    const onCooldown = pet.currentCooldowns[skillId] && pet.currentCooldowns[skillId] > 0;
                    const enoughMana = pet.mp >= (skill.manaCost || 0);
                    
                    if (!onCooldown && enoughMana) {
                        selectedSkill = skill;
                        break;
                    }
                }
            }
        }

        if (selectedSkill) {
            // Trừ linh lực
            pet.mp -= (selectedSkill.manaCost || 0);
            
            // Nếu kỹ năng cần tụ lực
            if (selectedSkill.chargeTime) {
                pet.chargingSkill = { ...selectedSkill, timeLeft: selectedSkill.chargeTime, totalTime: selectedSkill.chargeTime };
                battleLog.push(`đang tập trung linh khí, chuẩn bị thi triển <span style="color:#ff4081">${selectedSkill.name}</span>... (Cần ${(selectedSkill.chargeTime / 1000).toFixed(1)}s)`);
                return null;
            } else {
                // Kích hoạt animation khi thi triển kỹ năng (không cần tụ lực)
                const isSupport = (selectedSkill.power || 0) === 0;
                if (typeof UI !== 'undefined' && !isSupport) UI.triggerAttackAnimation("pet");
                
                // Thiết lập cooldown cho kỹ năng không cần tụ lực
                pet.currentCooldowns[selectedSkill.id] = (selectedSkill.cooldown || 4) * 1000;
                return this.executePetSkill(pet, enemy, selectedSkill, battleLog, owner);
            }
        } else {
            // Tấn công thường
            if (typeof UI !== 'undefined') UI.triggerAttackAnimation("pet");
            
            let damage = Math.floor(petAtk * 0.8);
            damage = Math.max(1, damage - Math.floor(enemy.def * 0.3));
            battleLog.push(`tấn công, gây <span style="color:#f44336">${damage}</span> sát thương.`);
            return { damage, skill: null };
        }
    },

    /**
     * Thực hiện kỹ năng của pet
     */
    executePetSkill: function(pet, enemy, usedSkill, battleLog, owner) {
        // Kích hoạt animation khi thực thi kỹ năng (đã tụ lực xong hoặc không cần tụ lực)
        const isSupport = (usedSkill.power || 0) === 0;
        if (typeof UI !== 'undefined' && !isSupport) UI.triggerAttackAnimation("pet");

        // Thiết lập cooldown (nếu chưa thiết lập lúc bắt đầu tụ lực)
        if (!pet.currentCooldowns[usedSkill.id] || pet.currentCooldowns[usedSkill.id] <= 0) {
            pet.currentCooldowns[usedSkill.id] = (usedSkill.cooldown || 4) * 1000;
        }

        // Tính toán chỉ số thực tế (bao gồm buff/debuff)
        let petAtk = pet.atk;
        if (pet.activeBuffs) {
            pet.activeBuffs.forEach(b => {
                if (b.type === "AtkBuff" || b.type === "PowerAura") petAtk += (pet.atk * 0.2);
            });
        }
        if (pet.activeDebuffs) {
            pet.activeDebuffs.forEach(d => {
                if (d.type === "Weakness") petAtk *= 0.75;
                if (d.type === "PetWeakened") petAtk *= 0.5;
            });
        }

        // Tính sát thương
        let damage = Math.floor(petAtk * usedSkill.power);
        
        // Chỉ áp dụng sát thương tối thiểu 1 nếu kỹ năng có hệ số sát thương > 0
        if (usedSkill.power > 0) {
            damage = Math.max(1, damage - Math.floor(enemy.def * 0.5));
        } else {
            damage = 0;
        }
        
        // Xử lý hiệu ứng kỹ năng
        let effectMsg = "";
        if (usedSkill.effect) {
            const effectLogs = this.applySkillEffect(usedSkill.effect, enemy, [], owner, pet.name, usedSkill.name);
            if (effectLogs && effectLogs.length > 0) {
                effectMsg = ", " + effectLogs.join(", ");
            }
        }

        const skillIcon = usedSkill.icon || "🐾";
        const targetDisplayName = isSupport ? (owner ? "Bạn" : "Chủ nhân") : (enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name);
        
        if (damage > 0) {
            const enemyDisplayName = enemy.name.includes(' (') ? enemy.name.split(' (')[0] : enemy.name;
            battleLog.push(`thi triển <span style="color:#ff4081">${skillIcon} ${usedSkill.name}</span> lên <b style="color:#f44336">${enemyDisplayName}</b>, gây <span style="color:#f44336">${damage}</span> ST${effectMsg}.`);
        } else {
            battleLog.push(`Thi triển kỹ năng <span style="color:#ff4081">${skillIcon} ${usedSkill.name}</span> lên <b>${targetDisplayName}</b>${effectMsg}.`);
        }

        return { damage, skill: usedSkill };
    },

    applySkillEffect: function(effect, target, battleLog, owner, casterName, sourceName) {
        if (typeof BattleSystem === 'undefined') return [];
        const logs = [];

        if (effect.type === "debuff") {
            const res = BattleSystem.applyDebuff(target, { debuff: effect.debuff, duration: effect.duration }, true, casterName, sourceName);
            if (res && res.msg) {
                const targetName = target.name.includes(' (') ? target.name.split(' (')[0] : target.name;
                logs.push(`<b>${targetName}</b> bị hiệu ứng ${res.msg}`);
            }
        } else if (effect.type === "buff") {
            // Buff thường là cho chủ nhân (player)
            if (owner) {
                const msg = BattleSystem.applyBuff(owner, effect.buff, effect.duration, effect.value, true, casterName, sourceName);
                if (msg) logs.push(`<b>Bạn</b> nhận hiệu ứng ${msg}`);
            }
        } else if (effect.type === "stun") {
            if (Math.random() < effect.chance) {
                const res = BattleSystem.applyDebuff(target, { debuff: "Stun", duration: effect.duration }, true, casterName, sourceName);
                if (res && res.msg) {
                    const targetName = target.name.includes(' (') ? target.name.split(' (')[0] : target.name;
                    logs.push(`<b>${targetName}</b> bị hiệu ứng ${res.msg}`);
                }
            }
        }
        return logs;
    },

    /**
     * Bắt đầu ấp trứng
     */
    startIncubation: function(proxy, itemId, inventoryIndex) {
        const itemData = GameData.items[itemId];
        if (!itemData || itemData.type !== 'pet_egg') return false;

        // Kiểm tra số lượng trứng đang ấp (giới hạn 3 trứng chẳng hạn)
        if (proxy.incubatingEggs.length >= 3) {
            UI.addLog("<span style='color:#f44336'>Hệ thống: Lò ấp đã đầy, không thể ấp thêm trứng!</span>");
            return false;
        }

        // Tính toán thời gian ấp dựa trên phẩm chất
        let duration = 30; // Mặc định 30s
        
        if (itemId === 'pet_egg_random') {
            duration = 120; // Thời gian tối đa cho trứng ngẫu nhiên (2 phút)
        } else {
            // Các loại trứng khác tính theo phẩm chất
            const rarityDurations = {
                "common": 15,
                "uncommon": 20,
                "rare": 30,
                "epic": 45,
                "legendary": 60,
                "mythic": 90
            };
            duration = rarityDurations[itemData.rarity] || 30;
        }

        // Thêm vào danh sách ấp
        proxy.incubatingEggs = [...proxy.incubatingEggs, {
            itemId: itemId,
            startTime: Date.now(),
            duration: duration * 1000, // Chuyển sang ms
            action: itemData.action
        }];

        // Xóa trứng khỏi túi đồ
        Game.removeItem(inventoryIndex, 1);
        
        UI.addLog(`✨ Hệ thống: Đã đưa <b>${itemData.name}</b> vào lò ấp. Thời gian dự kiến: ${duration} giây.`);
        UI.closeModal();
        Game.saveGame();
        
        // Chuyển sang tab linh thú để xem
        if (typeof UI !== 'undefined' && UI.switchTab) {
            UI.switchTab('pet');
        }
        
        return true;
    },

    /**
     * Cập nhật trạng thái ấp trứng (gọi mỗi giây)
     */
    updateIncubation: function(proxy) {
        if (!proxy.incubatingEggs || proxy.incubatingEggs.length === 0) return;

        const now = Date.now();
        let hasFinished = false;
        const newIncubating = [];

        proxy.incubatingEggs.forEach(egg => {
            if (now - egg.startTime >= egg.duration) {
                // Ấp xong
                this.hatchEgg(proxy, egg);
                hasFinished = true;
            } else {
                newIncubating.push(egg);
            }
        });

        if (hasFinished) {
            proxy.incubatingEggs = newIncubating;
            Game.saveGame();
            if (typeof UI !== 'undefined' && UI.renderPetTab) {
                UI.renderPetTab(proxy);
            }
        }
    },

    /**
     * Tăng điểm trung thành sau trận đấu
     */
    increaseLoyalty: function(proxy, petUid, amount = 1) {
        if (!proxy.pets) return;
        const petIndex = proxy.pets.findIndex(p => p.uid === petUid);
        if (petIndex === -1) return;

        const pet = proxy.pets[petIndex];
        const oldLoyalty = pet.loyalty || 60;
        pet.loyalty = Math.min(100, oldLoyalty + amount);
        
        // Cập nhật lại mảng để trigger proxy
        proxy.pets = [...proxy.pets];
    },

    /**
     * Giảm điểm trung thành (ví dụ khi pet tử trận)
     */
    decreaseLoyalty: function(proxy, petUid, amount = 1) {
        if (!proxy.pets) return;
        const petIndex = proxy.pets.findIndex(p => p.uid === petUid);
        if (petIndex === -1) return;

        const pet = proxy.pets[petIndex];
        const oldLoyalty = pet.loyalty || 60;
        pet.loyalty = Math.max(0, oldLoyalty - amount);
        
        // Cập nhật lại mảng để trigger proxy
        proxy.pets = [...proxy.pets];
    },

    /**
     * Cho linh thú ăn để tăng trung thành hoặc hồi thể lực
     */
    feedPet: function(petUid, itemId = 'spirit_stone') {
        const proxy = Game.getProxy();
        if (!proxy.pets) return;
        
        const petIndex = proxy.pets.findIndex(p => p.uid === petUid);
        if (petIndex === -1) return;
        
        const pet = proxy.pets[petIndex];
        const petData = this.getPetData(pet.id);
        const itemData = GameData.items[itemId];

        if (!itemData) return;

        // Nếu là Linh Thạch
        if (itemId === 'spirit_stone') {
            const cost = 100;
            const currentStones = proxy.spiritStone || 0;
            if (currentStones < cost) {
                UI.addLog("❌ Không đủ Linh Thạch để mua thức ăn cho linh thú.");
                return;
            }

            // Kiểm tra mức độ ngán (boredom)
            pet.spiritStoneBoredom = pet.spiritStoneBoredom || 0;
            if (pet.spiritStoneBoredom >= 3) {
                UI.addLog(`🤢 <b>${petData.name}</b> đã quá ngán Linh Thạch rồi, không muốn ăn nữa! Hãy cho ăn thức ăn linh thú thật sự.`);
                UI.openModal("LINH THÚ CHÊ ĂN", `
                    <div style="text-align:center; padding: 20px;">
                        <div style="font-size:3rem; margin-bottom:15px;">🤢</div>
                        <h3 style="color:#ffeb3b;">LINH THÚ ĐÃ NGÁN</h3>
                        <p><b>${petData.name}</b> đã ăn quá nhiều Linh Thạch và cảm thấy ngán ngẩm. Hiện tại nó chỉ muốn ăn <b>Thức ăn linh thú</b> thực sự để tăng trung thành.</p>
                        <p style="color:#aaa; font-size:0.8rem;">(Linh thạch hiện tại chỉ giúp chống đói/hồi thể lực nhưng không tăng trung thành khi đã ngán)</p>
                        <button onclick="UI.closeModal()" style="background:#4caf50; color:white; border:none; padding:8px 20px; border-radius:4px; cursor:pointer; margin-top:10px;">ĐÃ HIỂU</button>
                    </div>
                `);
                return;
            }

            proxy.spiritStone = (proxy.spiritStone || 0) - cost;
            pet.spiritStoneBoredom++;
            
            // Linh thạch hồi thể lực và tăng ít trung thành
            const stats = this.getPetStats(pet.id, pet.level, pet.statMultiplier || 1.0);
            const staminaGain = Math.floor(stats.stamina * 0.2);
            pet.stamina = Math.min(stats.stamina, (pet.stamina || 0) + staminaGain);
            
            const loyaltyGain = 1 + Math.floor(Math.random() * 2); // 1-2 điểm
            const oldLoyalty = pet.loyalty || 60;
            pet.loyalty = Math.min(100, oldLoyalty + loyaltyGain);
            
            UI.addLog(`💎 Đạo hữu đã cho <b>${petData.name}</b> ăn Linh Thạch. Thể lực tăng <b style="color:#4caf50">+${staminaGain}</b>, Trung thành <b style="color:#4caf50">+${loyaltyGain}</b>. (Mức độ ngán: ${pet.spiritStoneBoredom}/3)`);
        } 
        // Nếu là Thức ăn linh thú
        else if (itemData.type === 'pet_food') {
            const invIndex = proxy.inventory.findIndex(i => i && i.id === itemId);
            if (invIndex === -1) {
                UI.addLog(`❌ Đạo hữu không có <b>${itemData.name}</b> trong túi đồ.`);
                return;
            }

            Game.removeItem(invIndex, 1);
            
            // Reset mức độ ngán linh thạch
            pet.spiritStoneBoredom = 0;
            
            const gainRange = itemData.loyaltyGain || [5, 10];
            const gain = gainRange[0] + Math.floor(Math.random() * (gainRange[1] - gainRange[0] + 1));
            const oldLoyalty = pet.loyalty || 60;
            pet.loyalty = Math.min(100, oldLoyalty + gain);
            
            // Hồi 50% thể lực khi ăn thức ăn xịn
            const stats = this.getPetStats(pet.id, pet.level, pet.statMultiplier || 1.0);
            pet.stamina = Math.min(stats.stamina, (pet.stamina || 0) + Math.floor(stats.stamina * 0.5));

            UI.addLog(`${itemData.icon} Đạo hữu đã cho <b>${petData.name}</b> ăn <b>${itemData.name}</b>. Điểm trung thành tăng <b style="color:#4caf50">+${gain}</b> (Hiện tại: ${pet.loyalty}%).`);
        }

        proxy.pets = [...proxy.pets];
        Game.recordAction(petUid);
        
        if (typeof UI !== 'undefined' && UI.showPetDetail) {
            UI.showPetDetail(petUid, pet.id);
        }
        if (typeof UI !== 'undefined' && UI.renderPetTab) {
            UI.renderPetTab(proxy);
        }

        // Increment daily mission progress
        Game.incrementDailyMissionProgress('feedPet', 1);

        Game.saveGame();
    },

    /**
     * Mở giao diện chọn thức ăn
     */
    openFeedMenu: function(petUid) {
        const proxy = Game.getProxy();
        const petIndex = proxy.pets.findIndex(p => p.uid === petUid);
        if (petIndex === -1) return;
        const pet = proxy.pets[petIndex];
        const petData = this.getPetData(pet.id);

        // Tìm tất cả thức ăn trong túi
        const foodInInv = {};
        proxy.inventory.forEach(item => {
            if (item && GameData.items[item.id] && GameData.items[item.id].type === 'pet_food') {
                foodInInv[item.id] = (foodInInv[item.id] || 0) + item.count;
            }
        });

        let foodHtml = `
            <div style="padding: 10px;">
                <p style="margin-bottom: 10px; font-size: 0.9rem;">Chọn loại thức ăn cho <b>${petData.name}</b>:</p>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <!-- Linh Thạch -->
                    <div onclick="PetSystem.feedPet('${petUid}', 'spirit_stone'); UI.closeModal();" 
                         style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.5rem;">💎</span>
                            <div>
                                <div style="font-weight: bold; color: #00f2ff;">Linh Thạch</div>
                                <div style="font-size: 0.75rem; color: #aaa;">hồi 20% thể lực, tăng 1-2 trung thành, nhưng rất nhanh chán ăn. (100 linh thạch)</div>
                            </div>
                        </div>
                        <div style="color: #ffeb3b; font-size: 0.85rem;">Linh thạch hiện có: ${(proxy.spiritStone || 0).toLocaleString()}</div>
                    </div>
        `;

        Object.keys(foodInInv).forEach(foodId => {
            const item = GameData.items[foodId];
            foodHtml += `
                <div onclick="PetSystem.feedPet('${petUid}', '${foodId}'); UI.closeModal();" 
                     style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">${item.icon}</span>
                        <div>
                            <div style="font-weight: bold; color: #4caf50;">${item.name}</div>
                            <div style="font-size: 0.75rem; color: #aaa;">Tăng trung thành, hồi thể lực</div>
                        </div>
                    </div>
                    <div style="color: #ffeb3b;">x${foodInInv[foodId]}</div>
                </div>
            `;
        });

        foodHtml += `
                </div>
            </div>
        `;

        UI.openModal("CHO LINH THÚ ĂN", foodHtml);
    },

    /**
     * Kiểm tra linh thú bỏ đi nếu trung thành quá thấp
     */
    checkPetLeaving: function(proxy) {
        if (!proxy.pets || proxy.pets.length === 0) return;
        
        const leavingPets = [];
        const remainingPets = [];
        let hasLeft = false;
        
        proxy.pets.forEach(pet => {
            const loyalty = pet.loyalty || 60;
            if (loyalty < 20 && Math.random() < 0.6) {
                leavingPets.push(pet);
                hasLeft = true;
            } else {
                remainingPets.push(pet);
            }
        });
        
        if (hasLeft) {
            leavingPets.forEach(pet => {
                const petData = this.getPetData(pet.id);
                UI.addLog(`⚠️ CẢNH BÁO: Linh thú <b>${petData.name}</b> vì quá thất vọng đã bỏ đi tìm chủ nhân mới!`, "red");
                
                if (proxy.activePetId === pet.uid) {
                    proxy.activePetId = "";
                }
            });
            
            proxy.pets = remainingPets;
            Game.saveGame();
            if (typeof UI !== 'undefined' && UI.renderPetTab) {
                UI.renderPetTab(proxy);
            }
        }
    },
    /**
     * Phóng sinh linh thú
     */
    releasePet: function(petUid) {
        const proxy = Game.getProxy();
        if (!proxy.pets) return;
        
        const petIndex = proxy.pets.findIndex(p => p.uid === petUid);
        if (petIndex === -1) return;
        
        const pet = proxy.pets[petIndex];
        const petData = this.getPetData(pet.id);
        
        if (proxy.activePetId === petUid) {
            proxy.activePetId = "";
        }
        
        if (proxy.mountedPetUid === petUid) {
            proxy.mountedPetUid = null;
        }
        
        proxy.pets = proxy.pets.filter(p => p.uid !== petUid);
        UI.addLog(`🍃 Đạo hữu đã phóng sinh <b>${petData.name}</b>. Nó đã quay trở lại với thiên nhiên.`);
        
        Game.saveGame();
        if (typeof UI !== 'undefined' && UI.renderPetTab) {
            UI.renderPetTab(proxy);
        }
    },

    /**
     * Nở trứng
     */
    hatchEgg: function(proxy, egg) {
        const itemData = GameData.items[egg.itemId];
        const eggName = itemData ? itemData.name : "Trứng linh thú";
        const rand = Math.random() * 100;
        let targetRank = null;
        let isRotten = false;

        // Xác định phẩm cấp mục tiêu dựa trên loại trứng và tỷ lệ
        if (egg.action === 'hatch_pet_linh') {
            if (rand < 40) targetRank = "Phàm cấp";
            else targetRank = "Linh cấp";
        } else if (egg.action === 'hatch_pet_dia') {
            if (rand < 30) targetRank = "Linh cấp";
            else targetRank = "Địa cấp";
        } else if (egg.action === 'hatch_pet_thien') {
            if (rand < 30) targetRank = "Địa cấp";
            else if (rand < 90) targetRank = "Thiên cấp";
            else targetRank = "Thần cấp";
        } else if (egg.action === 'hatch_pet_than') {
            if (rand < 30) targetRank = "Thiên cấp";
            else if (rand < 95) targetRank = "Thần cấp";
            else targetRank = "Cực phẩm cấp";
        } else if (egg.action === 'hatch_pet_random') {
            if (rand < 10) targetRank = "Phàm cấp";
            else if (rand < 20) targetRank = "Linh cấp";
            else if (rand < 30) targetRank = "Địa cấp";
            else if (rand < 40) targetRank = "Thiên cấp";
            else if (rand < 50) targetRank = "Thần cấp";
            else if (rand < 55) targetRank = "Cực phẩm cấp";
            else isRotten = true;
        }

        if (isRotten) {
            UI.addLog(`🥚 Thật đáng tiếc! <b>${eggName}</b> đã bị ung, không nở ra gì cả.`, "orange");
            UI.openModal("ẤP TRỨNG THẤT BẠI", `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px; filter: grayscale(1);">🥚💨</div>
                    <h2 style="color: #ff4444; margin-bottom: 10px;">TRỨNG BỊ UNG</h2>
                    <p style="color: #ccc;">Đạo hữu thật thiếu may mắn, <b>${eggName}</b> đã bị hỏng từ bên trong và không thể nở được.</p>
                </div>
            `, true);
            return;
        }

        if (!targetRank) return;

        // Lọc danh sách linh thú theo phẩm cấp mục tiêu
        const possiblePets = Object.values(GameData.pets).filter(p => p.rank === targetRank);
        if (possiblePets.length === 0) {
            console.error(`No pets found for rank: ${targetRank}`);
            return;
        }

        const petData = possiblePets[Math.floor(Math.random() * possiblePets.length)];
        const petId = petData.id;

        if (petData) {
            const uid = `pet_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            // Tính toán chỉ số ngẫu nhiên 95% - 105%
            let statMultiplier = 0.95 + (Math.random() * 0.1);
            
            // 10% cơ hội đột biến
            const isMutated = Math.random() < 0.1;
            if (isMutated) {
                statMultiplier += 0.1; // Tăng thêm 10% (tổng cộng 105% - 115%)
            }

            const stats = this.getPetStats(petId, 1, statMultiplier);
            proxy.pets = [...proxy.pets, {
                uid: uid,
                id: petId,
                level: 1,
                exp: 0,
                obtainTime: Date.now(),
                hp: stats.hpMax,
                hpMax: stats.hpMax,
                mp: stats.mpMax,
                mpMax: stats.mpMax,
                mana: stats.mpMax, // Compatibility
                stamina: stats.stamina,
                staminaMax: stats.stamina,
                spirit: 0,
                loyalty: 60, // Default loyalty 60%
                statMultiplier: statMultiplier,
                isMutated: isMutated
            }];

            UI.addLog(`🎊 CHÚC MỪNG: <b>${eggName}</b> đã nở! Đạo hữu nhận được linh thú <b>${petData.name}</b>!`);
            
            const rankColor = (GameData.petRanks[petData.rank] || { color: "#00f2ff" }).color;
            // Thông báo đặc biệt bằng Modal
            UI.openModal("LINH THÚ XUẤT THẾ", `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px; animation: bounce 1s infinite;">${isMutated ? '✨🥚✨' : '🥚✨'}</div>
                    <p style="color: #aaa; font-size: 0.8rem; margin-bottom: 5px;">Từ: ${eggName}</p>
                    <h2 style="color: #ffeb3b; margin-bottom: 10px;">${petData.name}</h2>
                    <p style="color: #ccc; font-style: italic; margin-bottom: 20px;">"${petData.desc}"</p>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; text-align: left;">
                        <p> Phẩm cấp: <b style="color: ${rankColor};">${petData.rank}</b></p>
                        <p> Hệ: <b>${petData.type ? petData.type.toUpperCase() : 'VÔ'}</b></p>
                        <p> Chỉ số tiềm năng: <b style="color: ${isMutated ? '#ffeb3b' : '#fff'};">${(statMultiplier * 100).toFixed(1)}%</b></p>
                        <p> Lực chiến tối đa: <b style="color: #ffeb3b;">${(petData.maxPower || 0).toLocaleString()}</b></p>
                    </div>
                </div>
            `, true);
        }
    }
};
window.PetSystem = PetSystem;
