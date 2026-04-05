/**
 * cheat_mod.js - Mod gian lận cho Tu Tiên
 */
(function() {
    const CheatMod = {
        name: "Cheat Mod",
        description: "Tăng 💎 Linh Thạch, Danh Vọng và Linh Khí.",
        defaultSettings: { enabled: true },

        init: function(settings) {
            if (settings.enabled === false) return;
            console.log("🚀 Cheat Mod đã được kích hoạt.");
        },

        // Thêm các nút cheat vào giao diện Mod Manager
        onSettingsChange: function(settings) {
            // Logic if needed
        }
    };

    // Đăng ký mod
    window.ModSystem.register("cheat_mod", CheatMod);

    // Thêm các hàm cheat vào window để gọi từ UI
    window.Cheat = {
        addSpiritStones: function() {
            Game.addItem('spirit_stone', 10000);
            UI.addLog("✨ Đã nhận 10,000 💎 Linh Thạch!");
        },
        addAllReputation: function() {
            const proxy = Game.getProxy();
            Object.keys(GameData.sects).forEach(id => {
                proxy.sectReputation[id] = (proxy.sectReputation[id] || 0) + 10000;
            });
            UI.addLog("📜 Đã tăng 10,000 Danh Vọng cho tất cả môn phái!");
        },
        addMana: function() {
            const proxy = Game.getProxy();
            proxy.mana += 10000;
            UI.addLog("🌀 Đã nhận 10,000 Linh Khí!");
        },
        addContribution: function() {
            const proxy = Game.getProxy();
            proxy.sectContribution += 10000;
            UI.addLog("⭐ Đã nhận 10,000 Cống Hiến Môn Phái!");
        },
        unlockAllTitles: function() {
            const proxy = Game.getProxy();
            const allTitles = Object.keys(GameData.titles);
            proxy.unlockedTitles = allTitles;
            UI.addLog("✨ MOD: Đã mở khóa tất cả danh hiệu!");
            Game.saveGame();
        },
        learnAllSkills: function() {
            const allSkills = Object.keys(GameData.skills);
            allSkills.forEach(skillId => {
                Game.learnSkillById(skillId);
            });
            UI.addLog("✨ MOD: Đã lĩnh ngộ tất cả thần thông!");
            Game.saveGame();
        },
        setChitonBone: function() {
            const proxy = Game.getProxy();
            proxy.boneQualityId = "chiton";
            
            // Kích hoạt logic nhận aura ngẫu nhiên (giống trong rollBoneQuality)
            const auraSkills = [
                "skill_aura_shield",
                "skill_aura_evil_reflect",
                "skill_aura_vile_poison",
                "skill_aura_power"
            ];
            
            const hasAura = proxy.skills.some(sid => auraSkills.includes(sid));
            if (!hasAura) {
                const randomAura = auraSkills[Math.floor(Math.random() * auraSkills.length)];
                Game.learnSkillById(randomAura);
            }
            
            UI.addLog("✨ MOD: Đã nhận Chí Tôn Cốt!");
            UI.updateBar('bone', "chiton");
            Game.saveGame();
        },
        increaseRank: function() {
            const proxy = Game.getProxy();
            if (proxy.rankIndex < GameData.ranks.length - 1) {
                Game.doBreakthrough();
                UI.addLog("✨ MOD: Đã tăng 1 cấp cảnh giới!");
            } else {
                UI.addLog("❌ Đã đạt cảnh giới tối cao!");
            }
        },
        addPetEggs: function() {
            Game.addItem('pet_egg_linh', 5);
            Game.addItem('pet_egg_dia', 5);
            Game.addItem('pet_egg_thien', 5);
            Game.addItem('pet_egg_than', 5);
            Game.addItem('pet_egg_random', 10);
            UI.addLog("✨ MOD: Đã nhận các loại Trứng linh thú!");
        },
        addSectGifts: function() {
            Game.addItem('gift_wine', 10);
            Game.addItem('gift_tea', 10);
            Game.addItem('gift_painting', 5);
            Game.addItem('gift_jade', 2);
            UI.addLog("✨ MOD: Đã nhận các loại vật phẩm quà tặng môn phái!");
        },
        hatchAllEggs: function() {
            const proxy = Game.getProxy();
            if (!proxy.inventory || proxy.inventory.length === 0) return;
            
            let hatchedCount = 0;
            const newPets = [];
            
            for (let i = proxy.inventory.length - 1; i >= 0; i--) {
                const item = proxy.inventory[i];
                if (item && item.id) {
                    const itemData = GameData.items[item.id];
                    if (itemData && itemData.type === 'pet_egg') {
                        const rand = Math.random() * 100;
                        let targetRank = null;
                        const action = itemData.action;

                        if (action === 'hatch_pet_linh') {
                            if (rand < 40) targetRank = "Phàm cấp"; else targetRank = "Linh cấp";
                        } else if (action === 'hatch_pet_dia') {
                            if (rand < 30) targetRank = "Linh cấp"; else targetRank = "Địa cấp";
                        } else if (action === 'hatch_pet_thien') {
                            if (rand < 30) targetRank = "Địa cấp"; else if (rand < 90) targetRank = "Thiên cấp"; else targetRank = "Thần cấp";
                        } else if (action === 'hatch_pet_than') {
                            if (rand < 30) targetRank = "Thiên cấp"; else if (rand < 95) targetRank = "Thần cấp"; else targetRank = "Cực phẩm cấp";
                        } else if (action === 'hatch_pet_random') {
                            if (rand < 10) targetRank = "Phàm cấp"; else if (rand < 20) targetRank = "Linh cấp"; else if (rand < 30) targetRank = "Địa cấp"; else if (rand < 40) targetRank = "Thiên cấp"; else if (rand < 50) targetRank = "Thần cấp"; else if (rand < 55) targetRank = "Cực phẩm cấp";
                        }

                        if (targetRank) {
                            const possiblePets = Object.values(GameData.pets).filter(p => p.rank === targetRank);
                            if (possiblePets.length > 0) {
                                const petData = possiblePets[Math.floor(Math.random() * possiblePets.length)];
                                const uid = `pet_${Date.now()}_${Math.floor(Math.random() * 10000)}_${hatchedCount}`;
                                
                                // Tính toán chỉ số ngẫu nhiên 95% - 105% (giống PetSystem.hatchEgg)
                                let statMultiplier = 0.95 + (Math.random() * 0.1);
                                
                                // 10% cơ hội đột biến
                                const isMutated = Math.random() < 0.1;
                                if (isMutated) {
                                    statMultiplier += 0.1; // Tăng thêm 10% (tổng cộng 105% - 115%)
                                }

                                newPets.push({
                                    uid: uid,
                                    id: petData.id,
                                    level: 1,
                                    exp: 0,
                                    obtainTime: Date.now(),
                                    mana: petData.mpBase || 50,
                                    stamina: 100,
                                    spirit: 0,
                                    loyalty: 60,
                                    statMultiplier: statMultiplier,
                                    isMutated: isMutated
                                });
                                Game.removeItem(i, 1);
                                hatchedCount++;
                            }
                        }
                    }
                }
            }
            
            if (hatchedCount > 0) {
                proxy.pets = [...proxy.pets, ...newPets];
                UI.addLog(`✨ MOD: Đã nở thành công ${hatchedCount} quả trứng!`);
                Game.saveGame();
                if (UI.renderPetTab) UI.renderPetTab(proxy);
            } else {
                UI.addLog("❌ Không tìm thấy trứng linh thú nào hợp lệ!");
            }
        },
        levelUpAllPets: function() {
            const proxy = Game.getProxy();
            if (!proxy.pets || proxy.pets.length === 0) {
                UI.addLog("❌ Bạn chưa có linh thú nào!");
                return;
            }
            
            proxy.pets.forEach(pet => {
                pet.level = (pet.level || 1) + 1;
            });
            
            proxy.pets = [...proxy.pets];
            UI.addLog("✨ MOD: Tất cả linh thú đã tăng 1 cấp!");
            Game.saveGame();
            if (UI.renderPetTab) UI.renderPetTab(proxy);
        },
        decreaseAllPetsLoyalty: function() {
            const proxy = Game.getProxy();
            if (!proxy.pets || proxy.pets.length === 0) {
                UI.addLog("❌ Bạn chưa có linh thú nào!");
                return;
            }
            
            proxy.pets.forEach(pet => {
                const currentLoyalty = pet.loyalty || 60;
                pet.loyalty = Math.max(0, currentLoyalty - 10);
            });
            
            proxy.pets = [...proxy.pets];
            UI.addLog("✨ MOD: Tất cả linh thú đã giảm 10 điểm trung thành!");
            Game.saveGame();
            if (UI.renderPetTab) UI.renderPetTab(proxy);
        },
        perfectAllPets: function() {
            const proxy = Game.getProxy();
            if (!proxy.pets || proxy.pets.length === 0) {
                UI.addLog("❌ Bạn chưa có linh thú nào!");
                return;
            }
            
            proxy.pets.forEach(pet => {
                pet.statMultiplier = 1.15;
                pet.isMutated = true;
            });
            
            proxy.pets = [...proxy.pets];
            UI.addLog("✨ MOD: Tất cả linh thú đã đạt Tố chất tối đa (115% - Đột biến)!");
            Game.saveGame();
            if (UI.renderPetTab) UI.renderPetTab(proxy);
        }
    };
})();
