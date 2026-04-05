/**
 * event.js - Hệ thống sự kiện ngẫu nhiên
 * Chuyên trách: Xáo trộn và kiểm tra sự kiện khi thám hiểm.
 */
const EventSystem = (function() {
    
    return {
        /**
         * Kiểm tra và kích hoạt sự kiện
         * @param {Object} proxy - State của game
         * @param {Object} loc - Dữ liệu bản đồ hiện tại
         * @param {Object} options - Các thông số đếm sự kiện hiện tại
         */
        check: function(proxy, loc, options) {
            const { monsterCount, rareCount, incidentCount, meetingCount, lastEventWasBattle, firstMonsterType, onBattleComplete } = options;

            // 1. Ưu tiên Gặp mặt (Meeting Event) - 100% ở Tân thủ thôn
            const isNewbieVillage = loc.id === "map_forest";
            const meetingChance = isNewbieVillage ? 100 : 10;
            const maxMeetings = isNewbieVillage ? 10 : 4;

            if ((meetingCount || 0) < maxMeetings && Math.random() * 100 < meetingChance) {
                this.triggerMeetingEvent(loc);
                return { status: "MEETING_EVENT" };
            }

            const rand = Math.random() * 100;

            // 0. Kiểm tra Danh vọng "Không Chết Không Thôi" (< -2000)
            if (monsterCount < 2 && !lastEventWasBattle && proxy.sectReputation) {
                for (let sid in proxy.sectReputation) {
                    if (proxy.sectReputation[sid] < -2000) {
                        if (rand < 15) { // 15% tỷ lệ bị truy sát
                            const sect = GameData.sects[sid];
                            const enemyBase = GameData.enemies["sect_disciple"];
                            const enemy = JSON.parse(JSON.stringify(enemyBase));
                            enemy.name = `Sát Thủ ${sect.name}`;
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

                            const rankMult = (typeof Game !== 'undefined' && Game.getRankMultiplier) ? Game.getRankMultiplier(enemyRankIndex) : (1 + enemyRankIndex * 0.1);
                            enemy.hp = Math.floor(enemy.hp * rankMult);
                            enemy.atk = Math.floor(enemy.atk * rankMult);
                            enemy.def = Math.floor(enemy.def * rankMult);
                            enemy.thanphap = Math.floor(enemy.thanphap * rankMult);
                            enemy.exp = Math.floor(enemy.exp * rankMult);
                            
                            // --- XỬ LÝ KỸ NĂNG SÁT THỦ ---
                            const allSkills = Object.values(GameData.skills);
                            const sectSkills = sect.skills.map(skid => GameData.skills[skid]).filter(s => s && s.type === "active");
                            
                            let pickedSkills = [];
                            // Sát thủ thường mạnh như Đệ Tử Tinh Anh
                            const sectSkillCount = 2;

                            const rankMap = ["Phàm Cấp", "Linh Cấp", "Địa Cấp", "Thiên Cấp", "Thần Cấp"];
                            const rankMapLower = rankMap.map(r => r.toLowerCase());
                            
                            // Cân bằng lại: Luyện Khí (<11) -> Phàm/Linh, Trúc Cơ (11-13) -> Địa, Kết Đan (14-16) -> Thiên, Nguyên Anh+ (17+) -> Thần
                            let npcRankLevel = 0;
                            if (enemyRankIndex < 2) npcRankLevel = 0; // Phàm Nhân
                            else if (enemyRankIndex < 11) npcRankLevel = 1; // Luyện Khí
                            else if (enemyRankIndex < 14) npcRankLevel = 2; // Trúc Cơ
                            else if (enemyRankIndex < 17) npcRankLevel = 3; // Kết Đan
                            else npcRankLevel = 4; // Nguyên Anh trở lên

                            const targetRank = rankMap[npcRankLevel];

                            // Chọn kỹ năng môn phái (Lọc theo rank)
                            const availableSectSkills = sectSkills.filter(s => {
                                if (!s.rank) return true;
                                const skillLevel = rankMapLower.indexOf(s.rank.toLowerCase());
                                // Sát thủ mạnh hơn đệ tử thường, có thể dùng kỹ năng cao hơn 1 bậc
                                return skillLevel !== -1 && skillLevel <= npcRankLevel + 1;
                            });
                            
                            const sectPool = [...availableSectSkills];
                            for (let i = 0; i < sectSkillCount && sectPool.length > 0; i++) {
                                const idx = Math.floor(Math.random() * sectPool.length);
                                pickedSkills.push(sectPool.splice(idx, 1)[0]);
                            }
                            
                            const generalSkills = allSkills.filter(s => s.type === "active" && !s.sectId && s.id.startsWith("skill_") && !s.id.includes("pet_") && !s.id.includes("boss_") && !s.isMonsterSkill);
                            if (generalSkills.length > 0) {
                                const appropriateSkills = generalSkills.filter(s => {
                                    if (!s.rank) return true;
                                    const skillLevel = rankMapLower.indexOf(s.rank.toLowerCase());
                                    return skillLevel !== -1 && skillLevel <= npcRankLevel;
                                });
                                const finalPool = appropriateSkills.length > 0 ? appropriateSkills : generalSkills;
                                pickedSkills.push(finalPool[Math.floor(Math.random() * finalPool.length)]);
                            }
                            
                            if (pickedSkills.length > 0) {
                                // No longer need to ensure active skill as we only picked active ones
                            }
                            
                            enemy.skills = pickedSkills;
                            const baseStamina = 100 + ((typeof Game !== 'undefined' && Game.getMajorRankIndex) ? Game.getMajorRankIndex(enemyRankIndex) : 0) * 10;
                            enemy.maxStamina = baseStamina;
                            enemy.stamina = baseStamina;
                            enemy.rankIndex = enemyRankIndex; // Sát thủ có rank tương đương người chơi (có offset)
                            
                            // --- DYNAMIC RANK SCALING ---
                            if (typeof Game !== 'undefined' && Game.getEffectiveRank) {
                                const effectiveRankIndex = Game.getEffectiveRank(enemy);
                                if (effectiveRankIndex > enemy.rankIndex) {
                                    enemy.rankIndex = effectiveRankIndex;
                                    const effectiveRank = GameData.ranks[effectiveRankIndex];
                                    if (effectiveRank) {
                                        // Cập nhật tên hiển thị để phản ánh cảnh giới mới
                                        enemy.name = `Sát Thủ (${effectiveRank.name})`;
                                    }
                                }
                            }

                            enemy.desc = `Sát Thủ chính tông của môn phái ${sect.name} đang truy đuổi bạn vì mối thù Không Chết Không Thôi!`;
                            
                            const log = `⚠️ <b>TRUY SÁT:</b> Đệ tử <b>${sect.name}</b> đã tìm thấy bạn!`;
                            BattleSystem.start(proxy, enemy, (win) => {
                                if (onBattleComplete) onBattleComplete(win, enemy);
                            });
                            return { status: "BATTLE_STARTED_NORMAL", log };
                        }
                    }
                }
            }

            // Phân bổ tỷ lệ sự kiện (Tổng 100%)
            // 0-40: Quái vật
            // 40-70: Kỳ Ngộ (tăng theo May mắn)
            // 70-85: Sự Cố
            // 85-95: Gặp mặt NPC
            // 95-100: Không có gì

            // 1. Quái vật (40%)
            if (rand < 40) {
                let triggerBattle = false;
                let battleType = null; // 'normal', 'elite', 'boss'

                if (monsterCount === 0) {
                    triggerBattle = true;
                    const r = Math.random() * 100;
                    if (r < 5) battleType = 'boss';
                    else if (r < 20) battleType = 'elite';
                    else battleType = 'normal';
                } else if (monsterCount === 1 && !lastEventWasBattle) {
                    if (firstMonsterType === 'normal') {
                        if (Math.random() * 100 < 37.5) { // 15% of total (40% * 37.5% = 15%)
                            triggerBattle = true;
                            battleType = 'elite';
                        } else if (Math.random() * 100 < 12.5) { // 5% of total (40% * 12.5% = 5%)
                            triggerBattle = true;
                            battleType = 'boss';
                        }
                    } else if (firstMonsterType === 'elite') {
                        if (Math.random() * 100 < 50) { // 20% of total (40% * 50% = 20%)
                            triggerBattle = true;
                            battleType = 'normal';
                        } else if (Math.random() * 100 < 12.5) { // 5% of total (40% * 12.5% = 5%)
                            triggerBattle = true;
                            battleType = 'boss';
                        }
                    }
                }

                if (triggerBattle) {
                    const monsters = loc.monsters || [];
                    let enemyId = null;
                    
                    if (battleType === 'boss' && loc.boss) {
                        enemyId = loc.boss;
                    } else if (monsters.length > 0) {
                        enemyId = monsters[Math.floor(Math.random() * monsters.length)];
                    }

                    if (enemyId) {
                        const enemyData = GameData.enemies[enemyId];
                        if (enemyData) {
                            const enemy = JSON.parse(JSON.stringify(enemyData));
                            
                            if (battleType === 'elite') {
                                enemy.isElite = true;
                                enemy.name = `💀 [TINH ANH] ${enemy.name}`;
                                enemy.hp = Math.floor(enemy.hp * 1.3);
                                enemy.atk = Math.floor(enemy.atk * 1.1);
                                enemy.def = Math.floor(enemy.def * 1.1);
                                enemy.exp = Math.floor(enemy.exp * 2.5);
                            } else if (battleType === 'boss') {
                                enemy.isBoss = true;
                                enemy.name = `🔥 [BOSS] ${enemy.name}`;
                                enemy.hp = Math.floor(enemy.hp * 2.5);
                                enemy.atk = Math.floor(enemy.atk * 1.5);
                                enemy.def = Math.floor(enemy.def * 1.5);
                                enemy.exp = Math.floor(enemy.exp * 10);
                            }

                            // --- TÍNH TOÁN SCALE THEO CHỈ SỐ NGƯỜI CHƠI ---
                            const isNewbieMonster = ["slime", "wolf"].includes(enemyId);
                            if (isNewbieMonster || (loc.minPower && loc.maxPower)) {
                                const pTotals = (typeof Game !== 'undefined') ? Game.getTotals() : null;
                                
                                if (pTotals) {
                                    // Tỷ lệ ngẫu nhiên: Normal 110-115%, Elite 120-125%, Boss 130-135% (Dựa trên chỉ số cơ bản)
                                    let multiplier = 1.1 + Math.random() * 0.05; // Mặc định Normal: 1.1 ~ 1.15
                                    if (battleType === 'elite') multiplier = 1.2 + Math.random() * 0.05; // Elite: 1.2 ~ 1.25
                                    else if (battleType === 'boss') multiplier = 1.3 + Math.random() * 0.05; // Boss: 1.3 ~ 1.35
    
                                    // Nếu là quái tân thủ, scale theo chỉ số CƠ BẢN của người chơi
                                    if (isNewbieMonster) {
                                        // Lấy chỉ số cơ bản từ breakdowns
                                        const baseStats = pTotals.breakdowns;
                                        
                                        // Giới hạn sức mạnh tối đa ở mức Luyện Khí Tầng 5 (Chỉ số cơ bản)
                                        const cappedHp = Math.min(baseStats.hpMax.base, 450);
                                        const cappedAtk = Math.min(baseStats.atk.base, 45);
                                        const cappedDef = Math.min(baseStats.def.base, 30);
                                        const cappedSpd = Math.min(baseStats.thanphap.base, 25);
    
                                        enemy.hp = Math.max(20, Math.floor(cappedHp * multiplier));
                                        enemy.atk = Math.max(2, Math.floor(cappedAtk * multiplier));
                                        enemy.def = Math.floor(cappedDef * multiplier);
                                        enemy.thanphap = Math.max(2, Math.floor(cappedSpd * multiplier));
                                        enemy.exp = Math.max(5, Math.floor(enemy.exp * (Math.min(pTotals.power, 450) / 100 || 1)));
                                    } else {
                                        // Đối với quái map khác, vẫn dùng LC nhưng loại bỏ phần "ảo" từ skillPowerBonus nếu có thể
                                        // Hoặc đơn giản là dùng công thức LC chuẩn
                                        const playerPower = pTotals.power || 0;
                                        const rankMultiplier = Game.getRankMultiplier(proxy.rankIndex);
                                        
                                        // Đảm bảo quái ít nhất cũng mạnh theo rank của người chơi
                                        let targetPower = Math.max(10, playerPower * multiplier);
                                        
                                        // Nếu map có giới hạn, cho phép vượt giới hạn một chút dựa trên rank
                                        if (loc.maxPower) {
                                            const rankCap = 100 * rankMultiplier; // Ước tính power cơ bản của rank
                                            const finalCap = Math.max(loc.maxPower, rankCap);
                                            targetPower = Math.min(finalCap * 1.2, targetPower);
                                        }

                                        const currentPower = (enemy.atk * 2.5 + (enemy.def || 0) * 1.8 + (enemy.thanphap || 1) * 4 + (enemy.hp / 10) * 0.15);
                                        const scale = targetPower / currentPower;
                                        
                                        enemy.hp = Math.max(10, Math.floor(enemy.hp * scale));
                                        enemy.atk = Math.max(1, Math.floor(enemy.atk * scale));
                                        enemy.def = Math.floor(enemy.def * scale);
                                        enemy.thanphap = Math.max(1, Math.floor(enemy.thanphap * scale));
                                        enemy.exp = Math.max(1, Math.floor(enemy.exp * scale));
                                    }
    
                                    const baseStamina = 100 + ((typeof Game !== 'undefined' && Game.getMajorRankIndex) ? Game.getMajorRankIndex(proxy.rankIndex) : 0) * 10;
                                    enemy.maxStamina = baseStamina;
                                    enemy.stamina = baseStamina;
                                    
                                    // Thêm máu sau khi đã tính chỉ số
                                    if (battleType === 'elite') {
                                        enemy.hp = Math.floor(enemy.hp * 1.05); // +5% máu
                                    } else if (battleType === 'boss') {
                                        enemy.hp = Math.floor(enemy.hp * 1.10); // +10% máu
                                    }

                                    // --- DYNAMIC RANK SCALING ---
                                    if (typeof Game !== 'undefined' && Game.getEffectiveRank) {
                                        const effectiveRankIndex = Game.getEffectiveRank(enemy);
                                        enemy.rankIndex = effectiveRankIndex;
                                        const effectiveRank = GameData.ranks[effectiveRankIndex];
                                        if (effectiveRank) {
                                            // Cập nhật tên hiển thị để phản ánh cảnh giới mới
                                            const baseName = enemy.name.replace(/ \(.+\)$/, "");
                                            enemy.name = `${baseName} (${effectiveRank.name})`;
                                        }
                                    }
                                }
                            }

                            BattleSystem.start(proxy, enemy, (win) => {
                                if (onBattleComplete) onBattleComplete(win, enemy);
                            });
                            return { status: `BATTLE_STARTED_${battleType.toUpperCase()}` };
                        }
                    }
                }
            }
            
            // 2. Kỳ Ngộ (30% cơ bản, tăng theo May mắn) - Giới hạn 1 lần
            const luk = proxy.luk || 1;
            const rareChance = 30 + Math.min(20, luk / 50); // Tối đa 50%
            
            if (rand >= 40 && rand < (40 + rareChance)) {
                if (rareCount < 1) {
                    const rareEvents = GameData.events.filter(e => e.type === "rare");
                    if (rareEvents.length > 0) {
                        const ev = rareEvents[Math.floor(Math.random() * rareEvents.length)];
                        if (ev.effect) {
                            ev.effect(proxy);
                            const rewardText = typeof ev.rewardText === 'function' ? ev.rewardText(proxy) : ev.rewardText;
                            const log = `✨ <b>KỲ NGỘ:</b> ${ev.text} <span style="color: #4caf50;">(${rewardText})</span>`;
                            return { status: "RARE_TRIGGERED", log };
                        }
                    }
                }
            } 

            // 3. Sự Cố (15%) - Giới hạn 1 lần
            if (rand >= 70 && rand < 85) {
                if (incidentCount < 1) {
                    const incidentEvents = GameData.events.filter(e => e.type === "incident");
                    if (incidentEvents.length > 0) {
                        const ev = incidentEvents[Math.floor(Math.random() * incidentEvents.length)];
                        if (ev.effect) {
                            ev.effect(proxy);
                            const rewardText = typeof ev.rewardText === 'function' ? ev.rewardText(proxy) : ev.rewardText;
                            const log = `⚠️ <b>SỰ CỐ:</b> ${ev.text} <span style="color: #f44336;">(${rewardText})</span>`;
                            return { status: "INCIDENT_TRIGGERED", log };
                        }
                    }
                }
            }

            // 5. Không gặp gì
            return { status: "NOTHING" };
        },

        getRandomSectForMap: function(loc) {
            const sects = Object.values(GameData.sects);
            let maxReqRank = 2; // Tối thiểu là 2 để có các môn phái cơ bản
            if (loc.id === "map_forest") maxReqRank = 2;
            else if (loc.id === "map_cave") maxReqRank = 11;
            else if (loc.id === "map_mountain") maxReqRank = 14;
            else if (loc.id === "map_hell") maxReqRank = 17;
            else if (loc.id === "map_heaven") maxReqRank = 20;

            const filtered = sects.filter(s => s.reqRank <= maxReqRank);
            if (filtered.length === 0) return sects[0]; // Fallback
            return filtered[Math.floor(Math.random() * filtered.length)];
        },

        triggerMeetingEvent: function(loc) {
            const sect = this.getRandomSectForMap(loc);
            const npcName = UI.generateNPCName();
            
            let npcRank = "Đệ Tử";
            const randRank = Math.random();
            if (loc.id === "map_forest") {
                npcRank = "Đệ Tử";
            } else if (loc.id === "map_cave") {
                npcRank = randRank < 0.8 ? "Đệ Tử" : "Tinh Anh Đệ Tử";
            } else if (loc.id === "map_mountain") {
                npcRank = randRank < 0.5 ? "Đệ Tử" : (randRank < 0.9 ? "Tinh Anh Đệ Tử" : "Trưởng Lão");
            } else {
                npcRank = randRank < 0.3 ? "Đệ Tử" : (randRank < 0.7 ? "Tinh Anh Đệ Tử" : "Trưởng Lão");
            }

            const scenarios = ["cultivating", "passing", "fighting", "fleeing"];
            const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

            UI.showMeetingEvent(npcName, sect.name, scenario, npcRank, (choice) => {
                UI.handleMeetingInteraction(npcName, sect.name, scenario, npcRank, choice);
            });
        }
    };
})();

window.EventSystem = EventSystem;
