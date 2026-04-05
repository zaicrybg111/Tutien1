/**
 * explore.js - Hệ thống Thám Hiểm (Exploration System)
 * Chuyên trách: Tiến độ thám hiểm, sự kiện ngẫu nhiên và mốc phần thưởng.
 */
const ExploreSystem = (function() {
    
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

    let isExploring = false;
    let currentLoc = null;
    let triggeredMilestones = [];
    let battleCount = 0;
    let rareCount = 0;
    let incidentCount = 0;
    let meetingCount = 0;
    let lastEventWasBattle = false;
    let firstMonsterType = null; // 'normal', 'elite', 'boss'
    let eventLogs = [];
    let collectedLoot = {
        stones: 0,
        items: [] // { id, count }
    };

    /**
     * Thêm vật phẩm vào danh sách thu thập tạm thời
     */
    function addTempLoot(itemId, count = 1) {
        if (itemId === "spirit_stone") {
            collectedLoot.stones += count;
        } else {
            const existing = collectedLoot.items.find(i => i.id === itemId);
            if (existing) {
                existing.count += count;
            } else {
                collectedLoot.items.push({ id: itemId, count: count });
            }
        }
    }

    return {
        /**
         * Kiểm tra xem có đang thám hiểm không
         */
        isExploring: function() {
            return isExploring;
        },

        /**
         * Lấy thông tin bản đồ hiện tại
         */
        getCurrentLoc: function() {
            return currentLoc;
        },

        /**
         * Hiển thị danh sách bản đồ
         */
        render: function(proxy) {
            if (typeof UI !== 'undefined') UI.renderMapList(proxy);
        },

        /**
         * Bắt đầu thám hiểm
         */
        start: function(proxy, loc) {
            if (isExploring || (typeof Game !== 'undefined' && Game.isInBattle)) return;
            
            // Kiểm tra trạng thái trọng thương (HP < 5%)
            if (typeof Game !== 'undefined') {
                const totals = Game.getTotals();
                if (proxy.hp < totals.totalHpMax * 0.05) {
                    if (typeof UI !== 'undefined') {
                        UI.openModal("CẢNH BÁO TRỌNG THƯƠNG", `❌ Đạo hữu đang bị trọng thương (HP < 5%), hãy nghỉ ngơi dưỡng sức chút rồi hãy tiếp tục thám hiểm.`, false);
                    }
                    return;
                }
            }
            
            const startAction = () => {
                // Kiểm tra kỹ năng chủ động trước khi thám hiểm
                const activeSkills = proxy.skills.filter(sid => {
                    const s = GameData.skills[sid];
                    return s && s.type === 'active';
                });

                const toggledActiveSkills = proxy.toggledSkills.filter(sid => {
                    const s = GameData.skills[sid];
                    return s && s.type === 'active';
                });

                if (activeSkills.length > 0 && toggledActiveSkills.length === 0) {
                    if (typeof UI !== 'undefined' && UI.promptEnableSkills) {
                        UI.promptEnableSkills(() => this.executeStart(proxy, loc));
                        return;
                    }
                }

                this.executeStart(proxy, loc);
            };

            // Kiểm tra độ khó để hiện cảnh báo
            if (["Khó", "Cực Khó", "Tử Địa"].includes(loc.difficulty)) {
                if (typeof UI !== 'undefined' && UI.promptHighDifficulty) {
                    UI.promptHighDifficulty(loc, startAction);
                    return;
                }
            }

            startAction();
        },

        /**
         * Thực thi bắt đầu thám hiểm sau khi kiểm tra kỹ năng
         */
        executeStart: function(proxy, loc) {
            if (proxy.stamina < loc.stamina) {
                if (typeof UI !== 'undefined') UI.addLog("❌ Không đủ thể lực!");
                return;
            }

            isExploring = true;
            currentLoc = loc;
            triggeredMilestones = [];
            battleCount = 0;
            rareCount = 0;
            incidentCount = 0;
            meetingCount = 0;
            lastEventWasBattle = false;
            firstMonsterType = null;
            eventLogs = [];
            collectedLoot = { stones: 0, items: [] };
            proxy.stamina -= loc.stamina;

            // Ghi lại hành động thám hiểm
            if (typeof Game !== 'undefined') {
                Game.recordAction(proxy.activePetId);
            }
            
            // Theo dõi số lần thám hiểm tổng quát
            if (!proxy.stats) proxy.stats = {};
            proxy.stats.exploreCount = (proxy.stats.exploreCount || 0) + 1;
            proxy.stats = { ...proxy.stats };
            
            if (typeof Game !== 'undefined' && Game.checkTitles) {
                Game.checkTitles();
            }

            let speedMod = 1;
            let duration = loc.time * speedMod;

            // Kiểm tra xem lần này có phải là Boss không
            const completedCount = (proxy.mapExploration && proxy.mapExploration[loc.id]) || 0;
            const bossLossCount = (proxy.mapBossLosses && proxy.mapBossLosses[loc.id]) || 0;
            
            let isBossTime = false;
            if (bossLossCount > 0 && bossLossCount < 3) {
                // Boss đang tồn tại (đã thua nhưng chưa quá 3 lần)
                isBossTime = true;
            } else if (completedCount < 10) {
                // Đang trong quá trình thăm dò 10 lần đầu
                isBossTime = (completedCount + 1) === 10;
            } else {
                // Đã hoàn thành thăm dò, 40% cơ hội gặp lại Boss
                isBossTime = Math.random() < 0.4;
            }

            let mountBonusMsg = "";
            
            // Xử lý tiêu tốn thể lực linh thú và tốc độ thám hiểm
            if (proxy.mountedPetUid && typeof PetSystem !== 'undefined') {
                const pet = proxy.pets.find(p => p.uid === proxy.mountedPetUid);
                if (pet) {
                    const petStats = PetSystem.getPetStats(pet.id, pet.level || 1, pet.statMultiplier || 1.0);
                    // Tiêu tốn 15 thể lực khi cưỡi
                    pet.stamina = Math.max(0, (pet.stamina || 0) - 15);
                    
                    // Tính toán giảm thời gian dựa trên tốc độ
                    const petThanphap = petStats.thanphap || 0;
                    let reduction = 0.1; // Mặc định 10%
                    if (petThanphap >= 100) reduction = 0.2; // 20%
                    else if (petThanphap >= 50) reduction = 0.15; // 15%
                    
                    speedMod = 1 - reduction;
                    mountBonusMsg = ` (🏇 Cưỡi thú: -${reduction * 100}% thời gian)`;
                    
                    // Tự động xuống thú nếu hết thể lực
                    if (pet.stamina <= 0) {
                        proxy.mountedPetUid = null;
                        if (typeof UI !== 'undefined') {
                            UI.addLog(`🏇 Linh thú <b style="color:#ffeb3b">${PetSystem.getPetDisplayName(pet.uid, proxy.pets)}</b> đã kiệt sức, đạo hữu phải xuống thú!`);
                        }
                    }
                    
                    // Cập nhật lại mảng pets để trigger proxy
                    proxy.pets = [...proxy.pets];
                }
            } else if (proxy.activePetId && typeof PetSystem !== 'undefined') {
                const pet = proxy.pets.find(p => p.uid === proxy.activePetId);
                if (pet) {
                    // Tiêu tốn 5 thể lực khi xuất chiến nhưng không cưỡi
                    pet.stamina = Math.max(0, (pet.stamina || 0) - 5);
                    proxy.pets = [...proxy.pets];
                }
            }

            duration = loc.time * speedMod;

            if (typeof UI !== 'undefined') {
                UI.addLog(`🔍 Bắt đầu thám hiểm <b>${loc.name}</b>...${mountBonusMsg}`);
                if (["Khó", "Cực Khó", "Tử Địa"].includes(loc.difficulty)) {
                    UI.addLog(`⚠️ <b style="color:#ff9800">Cảnh báo:</b> Khu vực này cực kỳ nguy hiểm. Nếu thất bại, toàn bộ vật phẩm thu thập được sẽ bị mất!`);
                }
                if (isBossTime) {
                    const lossText = bossLossCount > 0 ? ` (Thử lại lần ${bossLossCount + 1}/3)` : "";
                    UI.addLog(`⚠️ Linh khí dao động mạnh! <b style="color:#ff4444">BOSS KHU VỰC</b> đang ở gần đây!${lossText}`);
                }
                UI.renderExploreUI(loc.name, duration);
                // Cập nhật lại danh sách map để hiện tiến độ mới (nếu cần)
                UI.renderMapList(proxy);
            }

            let elapsed = 0;
            const timer = setInterval(() => {
                if (!isExploring) {
                    clearInterval(timer);
                    return;
                }

                if (typeof Game !== 'undefined' && Game.isInBattle) return;

                if (proxy.hp <= 0) {
                    clearInterval(timer);
                    this.fail(proxy, loc, `đã tử trận`);
                    return;
                }

                // Tạm dừng thám hiểm nếu đang mở Modal (tránh sự kiện đè nhau)
                if (typeof UI !== 'undefined' && UI.isModalOpen && UI.isModalOpen()) return;

                elapsed += 100;
                const percent = (elapsed / duration) * 100;

                if (typeof UI !== 'undefined') {
                    UI.updateExploreProgress(elapsed, duration);
                }

                // Nếu là lần thứ 10, chỉ có 1 sự kiện duy nhất là Boss ở mốc 95%
                if (isBossTime) {
                    if (percent >= 95 && !triggeredMilestones.includes(95)) {
                        triggeredMilestones.push(95);
                        this.triggerBossFight(proxy, loc);
                    }
                } else {
                    const milestones = [10, 30, 65, 95];
                    for (const m of milestones) {
                        if (percent >= m && !triggeredMilestones.includes(m)) {
                            triggeredMilestones.push(m);
                            this.handleRandomEvent(proxy, loc, m);
                            break; // Chỉ xử lý tối đa 1 sự kiện mỗi tick để tránh đè nhau
                        }
                    }
                }

                if (elapsed >= duration) {
                    clearInterval(timer);
                    this.finish(proxy, loc);
                }
            }, 100);
        },

        /**
         * Kích hoạt trận đấu Boss khu vực
         */
        triggerBossFight: function(proxy, loc) {
            if (typeof GameData === 'undefined' || typeof BattleSystem === 'undefined') return;

            // Chọn quái mạnh nhất trong map để làm base cho Boss
            let baseMonsterId = loc.monsters[loc.monsters.length - 1];
            let baseMonster = GameData.enemies[baseMonsterId];

            if (!baseMonster) return;

            // Tạo Boss: Mạnh gấp 1.5 lần HP, 1.2 lần Công/Thủ
            const boss = {
                ...baseMonster,
                id: `boss_${loc.id}`,
                name: `👹 [BOSS] ${baseMonster.name} Vương`,
                hp: baseMonster.hp * 1.5,
                atk: baseMonster.atk * 1.2,
                def: baseMonster.def * 1.2,
                thanphap: baseMonster.thanphap * 1.5,
                exp: baseMonster.exp * 5,
                isBoss: true,
                // Boss có 2 kỹ năng
                skills: [...(baseMonster.skills || [])]
            };

            // --- TÍNH TOÁN SCALE THEO CHỈ SỐ NGƯỜI CHƠI ---
            const isNewbieMap = loc.id === "map_forest";
            if (isNewbieMap || (loc.minPower && loc.maxPower)) {
                const pTotals = (typeof Game !== 'undefined') ? Game.getTotals() : null;
                
                if (pTotals) {
                    // Boss scale theo 130~135% chỉ số cơ bản của người chơi
                    let multiplier = 1.3 + Math.random() * 0.05;

                    if (isNewbieMap) {
                        // Lấy chỉ số cơ bản từ breakdowns
                        const baseStats = pTotals.breakdowns;
                        
                        // Giới hạn sức mạnh tối đa ở mức Luyện Khí Tầng 5 (Chỉ số cơ bản)
                        const cappedHp = Math.min(baseStats.hpMax.base, 450);
                        const cappedAtk = Math.min(baseStats.atk.base, 45);
                        const cappedDef = Math.min(baseStats.def.base, 30);
                        const cappedSpd = Math.min(baseStats.thanphap.base, 25);

                        boss.hp = Math.max(30, Math.floor(cappedHp * multiplier));
                        boss.atk = Math.max(3, Math.floor(cappedAtk * multiplier));
                        boss.def = Math.floor(cappedDef * multiplier);
                        boss.thanphap = Math.max(3, Math.floor(cappedSpd * multiplier));
                        boss.exp = Math.max(10, Math.floor(boss.exp * (Math.min(pTotals.power, 450) / 100 || 1)));
                    } else {
                        const playerPower = pTotals.power || 0;
                        const rankMultiplier = Game.getRankMultiplier(proxy.rankIndex);

                        // Boss scale theo 130~135% chỉ số cơ bản của người chơi
                        let targetPower = Math.max(10, playerPower * multiplier);

                        // Nếu map có giới hạn, cho phép vượt giới hạn một chút dựa trên rank
                        if (loc.maxPower) {
                            const rankCap = 100 * rankMultiplier; // Ước tính power cơ bản của rank
                            const finalCap = Math.max(loc.maxPower, rankCap);
                            targetPower = Math.min(finalCap * 1.5, targetPower); // Boss cho phép vượt cap nhiều hơn
                        }

                        const currentPower = (boss.atk * 2.5 + (boss.def || 0) * 1.8 + (boss.thanphap || 1) * 4 + (boss.hp / 10) * 0.15);
                        const scale = targetPower / currentPower;
                        
                        boss.hp = Math.max(10, Math.floor(boss.hp * scale));
                        boss.atk = Math.max(1, Math.floor(boss.atk * scale));
                        boss.def = Math.floor(boss.def * scale);
                        boss.thanphap = Math.max(1, Math.floor(boss.thanphap * scale));
                        boss.exp = Math.max(1, Math.floor(boss.exp * scale));
                    }

                    // Thêm máu cộng thêm sau khi đã tính chỉ số (Tân Thủ Thôn: 30%, các map khác: 10%)
                    boss.hp = Math.floor(boss.hp * (isNewbieMap ? 1.30 : 1.10));

                    const baseStamina = 100 + ((typeof Game !== 'undefined' && Game.getMajorRankIndex) ? Game.getMajorRankIndex(proxy.rankIndex) : 0) * 10;
                    boss.maxStamina = baseStamina;
                    boss.stamina = baseStamina;

                    // --- DYNAMIC RANK SCALING ---
                    if (typeof Game !== 'undefined' && Game.getEffectiveRank) {
                        const effectiveRankIndex = Game.getEffectiveRank(boss);
                        boss.rankIndex = effectiveRankIndex;
                        const effectiveRank = GameData.ranks[effectiveRankIndex];
                        if (effectiveRank) {
                            // Cập nhật tên hiển thị để phản ánh cảnh giới mới
                            const baseName = boss.name.replace(/ \(.+\)$/, "");
                            boss.name = `${baseName} (${effectiveRank.name})`;
                        }
                    }
                }
            }

            // Nếu boss chưa đủ 2 kỹ năng, thêm 1 kỹ năng từ quái khác trong map
            if (boss.skills.length < 2 && loc.monsters.length > 1) {
                const otherMonsterId = loc.monsters[0];
                const otherMonster = GameData.enemies[otherMonsterId];
                if (otherMonster && otherMonster.skills && otherMonster.skills.length > 0) {
                    boss.skills.push(otherMonster.skills[0]);
                }
            }
            
            // Nếu vẫn chưa đủ, thêm kỹ năng mặc định
            if (boss.skills.length < 2) {
                boss.skills.push({ id: "skill_boss_roar", name: "Tiếng Gầm Uy Chấn", damageMult: 1.5, cooldown: 10 });
            }

            // Xác định loại boss dựa trên chỉ số cao nhất
            let bossType = "immune";
            if (boss.atk > boss.def * 1.5) bossType = "offense";
            else if (boss.def > boss.atk * 0.8) bossType = "defense";
            else if (boss.thanphap > 80) bossType = "speed";
            boss.bossType = bossType;

            UI.addLog(`🔥 <b style="color:#ff4444">${boss.name}</b> xuất hiện chặn đường!`);
            BattleSystem.start(proxy, boss, (win) => {
                if (win) {
                    // Reset số lần thua boss của map này
                    if (proxy.mapBossLosses) {
                        const newLosses = { ...proxy.mapBossLosses };
                        newLosses[loc.id] = 0;
                        proxy.mapBossLosses = newLosses;
                    }

                    // Thưởng cực lớn: Linh Thạch và vật phẩm hiếm
                    const bonusStones = Math.floor(Math.random() * 200) + 150; // Tăng mạnh linh thạch
                    let bossRewards = [];
                    
                    addTempLoot("spirit_stone", bonusStones);
                    bossRewards.push(`<b style="color:#ffd700">💎 ${bonusStones} Linh Thạch</b>`);
                    
                    // Rơi 1-2 vật phẩm xịn từ map với tỷ lệ cao
                    if (loc.drops && loc.drops.length > 0) {
                        // Chắc chắn rơi vật phẩm cuối cùng (thường là hiếm nhất)
                        const bestDrop = loc.drops[loc.drops.length - 1];
                        const bestDropData = GameData.items[bestDrop];
                        addTempLoot(bestDrop, 1);
                        if (bestDropData) {
                            const color = rarityColors[bestDropData.rarity] || "#fff";
                            bossRewards.push(`<b style="color:${color}">${bestDropData.name}</b>`);
                        }
                        
                        // 50% rơi thêm 1 món nữa
                        if (Math.random() < 0.5) {
                            const secondDrop = loc.drops[Math.floor(Math.random() * loc.drops.length)];
                            const secondDropData = GameData.items[secondDrop];
                            addTempLoot(secondDrop, 1);
                            if (secondDropData) {
                                const color = rarityColors[secondDropData.rarity] || "#fff";
                                bossRewards.push(`<b style="color:${color}">${secondDropData.name}</b>`);
                            }
                        }
                    }
                    
                    const rewardText = bossRewards.length > 0 ? ` Nhặt được: ${bossRewards.join(", ")}.` : "";
                    UI.addLog(`🏆 Bạn đã tiêu diệt được <b>${boss.name}</b>!${rewardText}`);
                } else {
                    // Thất bại: Kết thúc thám hiểm ngay lập tức và mất đồ
                    this.fail(proxy, loc, `bị <b>${boss.name}</b> đánh bại`);
                    
                    // Xử lý thua boss: Tăng số lần thua
                    if (!proxy.mapBossLosses) proxy.mapBossLosses = {};
                    const newLosses = { ...proxy.mapBossLosses };
                    newLosses[loc.id] = (newLosses[loc.id] || 0) + 1;
                    
                    if (newLosses[loc.id] >= 3) {
                        UI.addLog(`💀 Bạn đã thua <b>${boss.name}</b> 3 lần. Boss đã rời đi...`);
                        newLosses[loc.id] = 0;
                    } else {
                        UI.addLog(`⚠️ Bạn đã thất bại trước <b>${boss.name}</b>. Boss vẫn đang chờ đợi (Thua ${newLosses[loc.id]}/3)...`);
                    }
                    proxy.mapBossLosses = newLosses;
                }
            });
        },

        /**
         * Xử lý sự kiện ngẫu nhiên
         */
        handleRandomEvent: function(proxy, loc, milestone) {
            if (typeof EventSystem === 'undefined') return;
            
            const result = EventSystem.check(proxy, loc, {
                monsterCount: battleCount,
                rareCount: rareCount,
                incidentCount: incidentCount,
                meetingCount: meetingCount,
                lastEventWasBattle: lastEventWasBattle,
                firstMonsterType: firstMonsterType,
                onBattleComplete: (win, enemy) => {
                    if (!win) {
                        this.fail(proxy, loc, `bị <b>${enemy.name}</b> đánh bại`);
                    } else {
                        // Nếu thắng, có thể nhận thêm linh thạch/đồ từ quái (BattleSystem đã xử lý addItem trực tiếp, 
                        // nhưng để đúng yêu cầu "mất hết", ta cần BattleSystem cũng dùng addTempLoot)
                        // Tạm thời ta sẽ để BattleSystem xử lý, nhưng nếu chết thì fail() sẽ xóa sạch.
                    }
                }
            });

            const status = result.status;
            const log = result.log;

            if (log) eventLogs.push(log);

            if (proxy.hp <= 0) {
                this.fail(proxy, loc, `đã tử trận do sự cố`);
                return;
            }

            if (status === "MEETING_EVENT") {
                meetingCount++;
            } else if (status.startsWith("BATTLE_STARTED")) {
                battleCount++;
                lastEventWasBattle = true;
                if (battleCount === 1) {
                    if (status === "BATTLE_STARTED_NORMAL") firstMonsterType = 'normal';
                    else if (status === "BATTLE_STARTED_ELITE") firstMonsterType = 'elite';
                    else if (status === "BATTLE_STARTED_BOSS") firstMonsterType = 'boss';
                }
            } else if (status === "RARE_TRIGGERED") {
                rareCount++;
                lastEventWasBattle = false;
            } else if (status === "INCIDENT_TRIGGERED") {
                incidentCount++;
                lastEventWasBattle = false;
            } else {
                lastEventWasBattle = false;
            }
        },

        /**
         * Kết thúc thám hiểm thành công
         */
        finish: function(proxy, loc) {
            isExploring = false;
            
            // Tăng số lần thám hiểm HOÀN TẤT theo map
            if (!proxy.mapExploration) proxy.mapExploration = {};
            const currentMapExploration = { ...proxy.mapExploration };
            currentMapExploration[loc.id] = (currentMapExploration[loc.id] || 0) + 1;
            proxy.mapExploration = currentMapExploration; // Kích hoạt setter trong core.js

            const luk = proxy.luk || 1;
            // Thưởng Linh Thạch dựa trên độ khó (thể lực tiêu hao) và May mắn
            const baseStones = Math.max(10, loc.stamina * 3);
            const lukBonusStones = Math.floor(luk * 0.5);
            const randomStones = Math.floor(Math.random() * (loc.stamina + lukBonusStones));
            const totalStones = baseStones + randomStones;
            
            addTempLoot("spirit_stone", totalStones);

            // Tỉ lệ rơi vật phẩm hiếm dựa trên May mắn
            if (loc.drops && loc.drops.length > 0) {
                // Tính toán số lượng vật phẩm rơi (tối đa 3 món nếu cực kỳ may mắn)
                const dropChanceBase = 0.5;
                const lukDropBonus = Math.min(0.4, luk / 1000);
                const finalDropChance = dropChanceBase + lukDropBonus;
                
                let dropCount = 0;
                if (Math.random() < finalDropChance) dropCount++;
                if (Math.random() < finalDropChance * 0.5) dropCount++;
                if (Math.random() < finalDropChance * 0.2) dropCount++;

                for (let i = 0; i < dropCount; i++) {
                    // Ưu tiên vật phẩm hiếm hơn nếu May mắn cao
                    // loc.drops thường được sắp xếp từ thường đến hiếm
                    let dropIndex;
                    const rareRoll = Math.random() * 100;
                    const rareThreshold = 10 + (luk / 20); // May mắn 200 -> 20% tỉ lệ chọn món cuối
                    
                    if (rareRoll < rareThreshold) {
                        // Rơi món hiếm nhất (cuối danh sách)
                        dropIndex = loc.drops.length - 1;
                    } else {
                        // Rơi ngẫu nhiên các món còn lại
                        dropIndex = Math.floor(Math.random() * loc.drops.length);

                        // Cơ chế hỗ trợ đan dược: Nếu đang thiếu đan dược, có 20% cơ hội ép buộc rơi loại đó
                        if (typeof BagSystem !== 'undefined') {
                            const pills = ["hp_pill_1", "qi_pill", "mp_pill_1"];
                            for (const pillId of pills) {
                                if (loc.drops.includes(pillId) && BagSystem.getItemCount(pillId) < 1) {
                                    if (Math.random() < 0.2) {
                                        dropIndex = loc.drops.indexOf(pillId);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    const itemId = loc.drops[dropIndex];
                    addTempLoot(itemId, 1);
                }
            }

            // Thực sự thêm vật phẩm vào túi đồ
            let rewards = [];
            if (collectedLoot.stones > 0) {
                Game.addItem("spirit_stone", collectedLoot.stones, true, true);
                rewards.push(`<b style="color:#ffd700">💎 ${collectedLoot.stones} Linh Thạch</b>`);
            }
            
            collectedLoot.items.forEach(item => {
                Game.addItem(item.id, item.count, true, true);
                const itemData = GameData.items[item.id];
                if (itemData) {
                    const color = rarityColors[itemData.rarity] || "#fff";
                    rewards.push(`<b style="color:${color}">${itemData.name}</b> x${item.count}`);
                }
            });

            if (typeof UI !== 'undefined') {
                UI.hideExploreUI();
                
                // Hiển thị các sự kiện đã thu thập
                if (eventLogs.length > 0) {
                    eventLogs.forEach(log => UI.addLog(log));
                }

                const rewardText = rewards.length > 0 ? ` Nhặt được: ${rewards.join(", ")}.` : "";
                UI.addLog(`✨ Hoàn tất thám hiểm <b>${loc.name}</b>!${rewardText}`);
            }

            // Increment daily mission progress
            if (typeof Game !== 'undefined') {
                Game.incrementDailyMissionProgress('explore', 1);
                Game.saveGame();

                // Tự động thám hiểm lại nếu được bật
                if (Game.isAutoExploreEnabled()) {
                    setTimeout(() => {
                        if (!isExploring && !Game.isInBattle) {
                            this.start(proxy, loc);
                        }
                    }, 1500);
                }
            }
        },

        /**
         * Thất bại thám hiểm (chết)
         */
        fail: function(proxy, loc, reason) {
            isExploring = false;
            currentLoc = null;
            
            if (typeof UI !== 'undefined') {
                UI.hideExploreUI();
                UI.addLog(`💀 Thám hiểm thất bại! Đạo hữu ${reason}.`, true);
                
                // Liệt kê vật phẩm bị mất
                let lostItems = [];
                if (collectedLoot.stones > 0) lostItems.push(`<b style="color:#ffd700">${collectedLoot.stones} Linh Thạch</b>`);
                collectedLoot.items.forEach(item => {
                    const data = GameData.items[item.id];
                    if (data) {
                        const color = rarityColors[data.rarity] || "#ffffff";
                        lostItems.push(`<b style="color:${color}">${data.name}</b> x${item.count}`);
                    }
                });

                if (lostItems.length > 0) {
                    UI.addLog(`❌ Toàn bộ vật phẩm thu thập được đã bị mất: ${lostItems.join(", ")}`);
                }
            }

            collectedLoot = { stones: 0, items: [] };
            if (typeof Game !== 'undefined') Game.saveGame();
        },

        /**
         * Thất bại thám hiểm hiện tại (dùng cho các hệ thống bên ngoài)
         */
        failCurrent: function(proxy, reason) {
            if (isExploring && currentLoc) {
                this.fail(proxy, currentLoc, reason);
            }
        },

        /**
         * Thêm vật phẩm vào danh sách thu thập tạm thời (dùng cho BattleSystem hoặc EventSystem)
         */
        addLoot: function(itemId, count = 1) {
            if (isExploring) {
                addTempLoot(itemId, count);
            } else {
                // Nếu không thám hiểm (ví dụ chiến đấu tự do), thêm thẳng vào túi
                Game.addItem(itemId, count, false, true);
            }
        }
    };
})();

window.ExploreSystem = ExploreSystem;
