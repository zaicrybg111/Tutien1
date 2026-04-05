/**
 * bag.js - Quản lý túi đồ (Inventory)
 * Chuyên trách: Thêm, xóa, sắp xếp và xử lý hành động vật phẩm.
 * Cập nhật [2026-02-16]: Đồng bộ hoàn toàn với Proxy Core và UI Modal.
 */
const BagSystem = (function() {
    
    // Bảng màu quý hiếm (Đồng bộ với ui.js)
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

    return {
        /**
         * Tạo chỉ số ngẫu nhiên cho trang bị (90% - 110%)
         */
        generateEquipmentStats: function(itemData, forceLuck = false) {
            const equipItem = { id: itemData.id, count: 1, stats: {} };
            const targetVariance = 0.90 + Math.random() * 0.2; // 0.90 to 1.10
            
            let changed = false;
            let totalVariance = 0;
            let statCount = 0;

            for (let s in itemData.stats) {
                let val = itemData.stats[s];
                if (typeof val === 'number') {
                    // May mắn không tính vào chất lượng
                    if (s === 'luk') {
                        equipItem.stats[s] = val;
                        continue;
                    }

                    let newVal;
                    if (Math.abs(val) >= 1) {
                        newVal = Math.round(val * targetVariance);
                    } else {
                        newVal = parseFloat((val * targetVariance).toFixed(2));
                    }
                    
                    equipItem.stats[s] = newVal;
                    if (newVal !== val) changed = true;
                    
                    totalVariance += (newVal / val);
                    statCount++;
                } else {
                    equipItem.stats[s] = val;
                }
            }

            // Bắt buộc xê dịch nếu targetVariance != 1 và chưa có stat nào đổi
            if (!changed && Math.abs(targetVariance - 1.0) > 0.01 && statCount > 0) {
                const statsKeys = Object.keys(equipItem.stats).filter(k => k !== 'luk' && typeof itemData.stats[k] === 'number');
                if (statsKeys.length > 0) {
                    const randomKey = statsKeys[Math.floor(Math.random() * statsKeys.length)];
                    const baseVal = itemData.stats[randomKey];
                    
                    if (Math.abs(baseVal) >= 1) {
                        const diff = (targetVariance > 1.0 ? 1 : -1);
                        const potentialVal = baseVal + diff;
                        const potentialVar = potentialVal / baseVal;
                        
                        if (potentialVar <= 1.21 && potentialVar >= 0.79) {
                            equipItem.stats[randomKey] = potentialVal;
                        }
                    } else {
                        equipItem.stats[randomKey] = parseFloat((baseVal * (targetVariance > 1.0 ? 1.04 : 0.96)).toFixed(2));
                    }
                    
                    // Recalculate totalVariance
                    totalVariance = 0;
                    for (let s in itemData.stats) {
                        if (s !== 'luk' && typeof itemData.stats[s] === 'number') {
                            totalVariance += (equipItem.stats[s] / itemData.stats[s]);
                        }
                    }
                }
            }

            // Thêm may mắn ẩn (35% cơ hội hoặc bắt buộc)
            if (forceLuck || Math.random() < 0.35) {
                const luckRanges = {
                    "common": [1, 4],
                    "uncommon": [4, 10],
                    "rare": [10, 25],
                    "epic": [25, 50],
                    "legendary": [50, 80],
                    "mythic": [80, 150],
                    "chaos": [150, 300]
                };
                const range = luckRanges[itemData.rarity] || [1, 4];
                const luckVal = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                
                // Cộng dồn nếu đã có luk cơ bản, hoặc tạo mới
                equipItem.stats.luk = (equipItem.stats.luk || 0) + luckVal;
            }

            equipItem.variance = statCount > 0 ? Math.round((totalVariance / statCount) * 100) : 100;
            // Giới hạn hiển thị variance trong khoảng hợp lý
            equipItem.variance = Math.max(90, Math.min(110, equipItem.variance));
            
            return equipItem;
        },

        /**
         * Thêm vật phẩm vào túi đồ
         * Đảm bảo trigger Proxy bằng cách gán lại mảng mới
         */
        addItem: function(itemId, count = 1, silent = false) {
            this.addItems([{ id: itemId, count: count }], silent);
        },

        /**
         * Lấy giới hạn tối đa của túi đồ
         */
        getMaxInventory: function() {
            const proxy = Game.getProxy();
            return (proxy.maxInventory || 50) + (proxy.inventorySpaceBuff || 0);
        },

        /**
         * Thêm danh sách vật phẩm vào túi đồ và gộp thông báo
         */
        addItems: function(itemsToAdd, silent = false) {
            const proxy = Game.getProxy();
            let newInv = JSON.parse(JSON.stringify(proxy.inventory));
            let logParts = [];
            const maxInv = this.getMaxInventory();

            // Danh sách vật phẩm duy nhất
            const UNIQUE_ITEMS = ["item_mysterious_token", "item_mask_mysterious"];

            for (const item of itemsToAdd) {
                let itemId = item.id;
                let count = item.count || 1;
                const itemData = GameData.items[itemId];
                if (!itemData) continue;

                // Kiểm tra túi đầy (chỉ áp dụng cho vật phẩm mới, không áp dụng cho cộng dồn)
                // Tuy nhiên để đơn giản, ta sẽ kiểm tra trước khi thêm slot mới

                // Kiểm tra vật phẩm duy nhất
                if (UNIQUE_ITEMS.includes(itemId)) {
                    const alreadyInInv = newInv.some(slot => slot.id === itemId);
                    const alreadyEquipped = Object.values(proxy.equipments).some(eq => eq && eq.id === itemId);
                    
                    if (alreadyInInv || alreadyEquipped) {
                        // Nếu đã có thì không thêm nữa
                        continue;
                    }
                    // Nếu chưa có, chỉ cho phép thêm tối đa 1 cái
                    count = 1;
                }

                const STACK_LIMIT = itemData.stackLimit || 999;
                
                if (itemData.type !== 'equipment') {
                    let remaining = count;
                    // Tìm các slot đã có vật phẩm này và chưa đầy
                    for (let slot of newInv) {
                        if (slot.id === itemId && slot.count < STACK_LIMIT) {
                            const canAdd = Math.min(remaining, STACK_LIMIT - slot.count);
                            slot.count += canAdd;
                            remaining -= canAdd;
                            if (remaining <= 0) break;
                        }
                    }
                    
                    // Nếu vẫn còn dư, tạo các slot mới
                    while (remaining > 0) {
                        if (newInv.length >= maxInv) {
                            if (!silent) UI.addLog(`⚠️ Túi đồ đã đầy (${maxInv}/${maxInv}), không thể nhặt thêm ${itemData.name}!`, false, "fail");
                            break;
                        }
                        const toAdd = Math.min(remaining, STACK_LIMIT);
                        newInv.push({ id: itemId, count: toAdd });
                        remaining -= toAdd;
                    }
                } else {
                    // Trang bị không cộng dồn
                    for (let i = 0; i < count; i++) {
                        if (newInv.length >= maxInv) {
                            if (!silent) UI.addLog(`⚠️ Túi đồ đã đầy (${maxInv}/${maxInv}), không thể nhặt thêm ${itemData.name}!`, false, "fail");
                            break;
                        }
                        const equipItem = this.generateEquipmentStats(itemData, item.forceLuck);
                        newInv.push(equipItem);
                    }
                }

                if (!silent) {
                    const color = rarityColors[itemData.rarity] || '#fff';
                    logParts.push(`${itemData.icon || '📦'} <b style="color: ${color}">${itemData.name}</b> x${count}`);
                }
            }

            proxy.inventory = newInv;
            
            // Nhật ký tu tiên: Ghi lại vật phẩm thu được (gộp)
            if (!silent && logParts.length > 0 && typeof UI !== 'undefined') {
                UI.addLog(`📦 Nhặt được: ${logParts.join(", ")}.`);
            }
        },

        /**
         * Xóa vật phẩm khỏi túi
         */
        removeItem: function(index, count = 1) {
            const proxy = Game.getProxy();
            let newInv = [...proxy.inventory];
            
            if (newInv[index]) {
                const itemData = GameData.items[newInv[index].id];
                newInv[index].count -= count;
                if (newInv[index].count <= 0) {
                    newInv.splice(index, 1);
                }
                proxy.inventory = newInv;

                // Nhật ký tu tiên: Ghi lại vật phẩm mất đi/sử dụng
                if (typeof UI !== 'undefined' && itemData) {
                    UI.addLog(`📤 Mất đi: ${itemData.icon || '📦'} <b style="color: ${rarityColors[itemData.rarity] || '#fff'}">${itemData.name}</b> x${count}.`);
                }
            }
        },

        /**
         * Lấy tổng số lượng của một vật phẩm trong túi đồ
         */
        getItemCount: function(itemId) {
            const proxy = Game.getProxy();
            if (!proxy.inventory) return 0;
            return proxy.inventory
                .filter(item => item.id === itemId)
                .reduce((total, item) => total + item.count, 0);
        },

        /**
         * Xóa vật phẩm khỏi túi theo ID (dùng cho tiền tệ hoặc vật phẩm cộng dồn)
         */
        removeItemsById: function(itemId, count = 1) {
            const proxy = Game.getProxy();
            let newInv = JSON.parse(JSON.stringify(proxy.inventory));
            let remaining = count;

            // Xóa từ cuối lên để không làm xáo trộn index nếu lặp theo index (nhưng ở đây ta dùng filter/map hoặc lặp trực tiếp)
            for (let i = newInv.length - 1; i >= 0; i--) {
                if (newInv[i].id === itemId) {
                    const itemData = GameData.items[itemId];
                    const toRemove = Math.min(newInv[i].count, remaining);
                    
                    newInv[i].count -= toRemove;
                    remaining -= toRemove;
                    
                    if (newInv[i].count <= 0) {
                        newInv.splice(i, 1);
                    }

                    // Nhật ký tu tiên: Ghi lại vật phẩm tiêu hao
                    if (typeof UI !== 'undefined' && itemData) {
                        UI.addLog(`📤 Tiêu hao: <b style="color: ${rarityColors[itemData.rarity] || '#fff'}">${itemData.name}</b> x${toRemove}.`);
                    }
                }
                if (remaining <= 0) break;
            }

            if (remaining > 0) {
                console.warn(`Không đủ ${itemId} để xóa! Còn thiếu: ${remaining}`);
            }

            proxy.inventory = newInv;
            return remaining === 0;
        },

        /**
         * Bán vật phẩm lấy linh thạch
         */
        sellItem: function(index, count = 1) {
            const proxy = Game.getProxy();
            const item = proxy.inventory[index];
            if (!item) return;

            const data = GameData.items[item.id];
            if (!data) return;

            if (data.isSectBound) {
                UI.addLog("❌ Vật phẩm nhiệm vụ không thể giao dịch!");
                return;
            }

            const sellValue = data.value || 0;
            if (sellValue <= 0) {
                UI.addLog("❌ Vật phẩm này không có giá trị giao dịch!");
                return;
            }

            const totalGain = sellValue * count;
            proxy.spiritStone += totalGain;
            
            UI.addLog(`💰 Đã bán: <b style="color: ${rarityColors[data.rarity] || '#fff'}">${data.name}</b> x${count}, nhận được <b>${totalGain}</b> Linh Thạch.`);
            
            this.removeItem(index, count);
            Game.saveGame();
        },

        /**
         * Sắp xếp túi đồ theo tiêu chí
         */
        sortInventory: function(criteria) {
            const proxy = Game.getProxy();
            if (!proxy.inventory || proxy.inventory.length <= 1) return;

            let newInv = [...proxy.inventory];

            const typePriority = {
                'material': 1,
                'pill': 2,
                'equipment': 3,
                'skill_book': 4
            };

            const rarityPriority = {
                'common': 1,
                'uncommon': 2,
                'rare': 3,
                'epic': 4,
                'legendary': 5,
                'mythic': 6,
                'chaos': 7
            };

            newInv.sort((a, b) => {
                const dataA = GameData.items[a.id];
                const dataB = GameData.items[b.id];
                if (!dataA || !dataB) return 0;

                if (criteria === 'type') {
                    const pA = typePriority[dataA.type] || 99;
                    const pB = typePriority[dataB.type] || 99;
                    if (pA !== pB) return pA - pB;
                    // Nếu cùng loại, sắp xếp theo phẩm chất thấp đến cao
                    const rA = rarityPriority[dataA.rarity] || 0;
                    const rB = rarityPriority[dataB.rarity] || 0;
                    if (rA !== rB) return rA - rB;
                    // Cùng phẩm chất thì theo tên
                    return dataA.name.localeCompare(dataB.name);
                } else if (criteria === 'rarity') {
                    const rA = rarityPriority[dataA.rarity] || 0;
                    const rB = rarityPriority[dataB.rarity] || 0;
                    if (rA !== rB) return rA - rB; // Phẩm chất thấp lên trước
                    // Nếu cùng phẩm chất, sắp xếp theo loại
                    const pA = typePriority[dataA.type] || 99;
                    const pB = typePriority[dataB.type] || 99;
                    if (pA !== pB) return pA - pB;
                    // Cùng loại thì theo tên
                    return dataA.name.localeCompare(dataB.name);
                }
                return 0;
            });

            proxy.inventory = newInv;
            if (typeof UI !== 'undefined') {
                UI.addLog("✨ Đã sắp xếp túi đồ.");
            }
            Game.saveGame();
        },

        /**
         * Xử lý khi người dùng nhấn vào vật phẩm trong túi
         */
        handleItemAction: function(index) {
            const proxy = Game.getProxy();
            const item = proxy.inventory[index];
            if (!item) return;

            const data = GameData.items[item.id];
            console.log("BagSystem: Handling item", item.id, "Type:", data?.type);
            if (!data) return;

            // Đảm bảo tất cả trang bị đều có chất lượng (Lazy init cho đồ cũ/nhiệm vụ)
            if (data.type === 'equipment' && !item.variance) {
                const generated = this.generateEquipmentStats(data);
                item.stats = generated.stats;
                item.variance = generated.variance;
                Game.saveGame();
            }

            const color = rarityColors[data.rarity] || "#fff";
            let qualityLabel = "";
            if (data.type === 'equipment' && item.variance) {
                if (item.variance >= 110) qualityLabel = ` <span style="font-size: 0.55rem; color: #ffeb3b; vertical-align: middle; font-weight: bold;">&nbsp;(cực tốt)</span>`;
                else if (item.variance > 100) qualityLabel = ` <span style="font-size: 0.55rem; color: #ffeb3b; vertical-align: middle;">&nbsp;(tốt)</span>`;
                else if (item.variance === 100) qualityLabel = ` <span style="font-size: 0.55rem; color: #4caf50; vertical-align: middle;">&nbsp;(bình thường)</span>`;
                else if (item.variance <= 90) qualityLabel = ` <span style="font-size: 0.55rem; color: #ff4444; vertical-align: middle; font-weight: bold;">&nbsp;(cực tệ)</span>`;
                else qualityLabel = ` <span style="font-size: 0.55rem; color: #ff4444; vertical-align: middle; font-weight: bold;">&nbsp;(tệ)</span>`;
            }

            const title = `<span style="color: ${item.id === 'pet_egg_random' ? '#ff0000' : color}; font-weight: ${item.id === 'pet_egg_random' ? 'bold' : 'normal'}">${data.name}${qualityLabel}</span>`;
            
            let desc = `<div style="text-align: left; line-height: 1.6;">`;
            desc += `<div style="font-size: 0.7rem; color: #888; margin-bottom: 4px; text-transform: uppercase; cursor: pointer;" onclick="UI.showRarityInfo()">Phẩm chất: <span style="color: ${color}; font-weight: bold;">${UI.getRarityName(data.rarity)}</span></div>`;
            
            if (data.type === 'equipment' && item.variance) {
                desc += `<div style="font-size: 0.55rem; color: #aaa; margin-bottom: 4px; opacity: 0.7;">Chất lượng: <b style="color: ${item.variance >= 100 ? (item.variance > 100 ? '#ffeb3b' : '#4caf50') : '#ff4444'}">${item.variance}%</b> so với cơ bản</div>`;
            }

            desc += `<p style="color: #aaa; font-style: italic; margin-bottom: 10px;">"${data.desc}"</p>`;
            
            // Hiển thị giá bán nếu có
            if (data.value > 0 && !data.isSectBound) {
                desc += `<div style="font-size: 0.7rem; color: #ffeb3b; margin-bottom: 8px;">💰 Giá bán: <b>${data.value}</b> Linh Thạch</div>`;
            } else if (data.isSectBound) {
                desc += `<div style="font-size: 0.7rem; color: #ff4444; margin-bottom: 8px;">🚫 Vật phẩm nhiệm vụ (Không thể bán)</div>`;
            }

            if (data.type === 'equipment') {
                desc += `<div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; border: 1px solid #333;">`;
                desc += `<b style="color: #ffeb3b; display: block; margin-bottom: 5px;">THUỘC TÍNH:</b>`;
                desc += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;">`;
                
                // Sử dụng chỉ số đã xê dịch nếu có, nếu không dùng chỉ số gốc
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
                        hpMult: "Bội Số HP",
                        mpMult: "Bội Số MP",
                        staMult: "Bội Số Thể Lực"
                    }[s] || s.toUpperCase();
                    
                    const val = displayStats[s];
                    const statColor = "#4caf50"; // Giữ màu xanh trung tính cho chỉ số để tránh nhầm với phẩm chất

                    desc += `<div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                                <span style="color: #aaa;">${statName}:</span>
                                <b style="color: ${statColor};">${val > 0 ? '+' : ''}${val}${s.endsWith('Mult') ? '%' : ''}</b>
                             </div>`;
                }
                desc += `</div></div>`;
                UI.openModal(title, desc, true, index, 'equip', item.id);
            } 
            else if (data.type === 'skill_book') {
                const skill = GameData.skills[data.skillId];
                if (skill) {
                    const cd = skill.type !== 'passive' ? ` <span style="color:#f44336; font-size:0.6rem;">(Hồi chiêu: ${skill.cooldown || 0}s)</span>` : "";
                    desc += `<div style="width: 100%; background: rgba(0, 242, 255, 0.1); padding: 6px; border-radius: 6px; border: 1px solid #00f2ff44; margin-bottom: 10px;">
                        <b style="color: #00f2ff; font-size: 0.65rem; display: block; margin-bottom: 2px; border-bottom: 1px solid #00f2ff33; padding-bottom: 1px;">📜 THẦN THÔNG:</b>
                        <div style="color: #eee; font-size: 0.7rem; font-weight: bold;">${skill.name}${cd}</div>
                        <div style="color: #aaa; font-size: 0.6rem; margin-top: 0px;">${skill.desc}</div>
                    </div>`;
                }
                desc += `<p style="color: #00f2ff; font-size: 0.75rem; text-align: center;">✨ Sử dụng để lĩnh ngộ thần thông mới.</p>`;
                UI.openModal(title, desc, true, index, 'skill_book', item.id);
            }
            else if (data.type === 'pet_egg') {
                desc += `<p style="color: #ff9800; font-size: 0.75rem; text-align: center; margin-top: 10px;">🥚 Đây là một quả trứng linh thú. Hãy ấp nở để nhận được linh thú đồng hành!</p>`;
                UI.openModal(title, desc, true, index, 'hatch', item.id);
            }
            else if (data.type === 'pill') {
                desc += `<p style="color: #4caf50;">${data.desc}</p>`;
                UI.openModal(title, desc, true, index, 'use', item.id);
            }
            else if (data.type === 'quest_item') {
                desc += `<div style="font-size: 0.7rem; color: #ffeb3b; margin-bottom: 8px;">📜 Vật phẩm nhiệm vụ (Không thể vứt bỏ)</div>`;
                if (data.effect) {
                    UI.openModal(title, desc, true, index, 'use', item.id);
                } else {
                    UI.openModal(title, desc, false);
                }
            }
            else {
                UI.openModal(title, desc, false);
            }
        },

        /**
         * Sử dụng đan dược
         */
        usePill: function(index) {
            const proxy = Game.getProxy();
            const item = proxy.inventory[index];
            if (!item) return;

            const data = GameData.items[item.id];
            if (!data || data.type !== 'pill') return;

            // Xử lý hiệu ứng từ data.js
            if (data.effect) {
                const log = data.effect(proxy);
                UI.addLog(log);
                
                // Theo dõi số đan dược đã dùng
                if (!proxy.stats) proxy.stats = {};
                proxy.stats.pillsUsed = (proxy.stats.pillsUsed || 0) + 1;
                
                // Nếu đang trong thiên kiếp, tăng số lượng đan dược đã dùng trong trận này
                if (proxy.isInBattle && proxy.currentEnemy && proxy.currentEnemy.isTribulation) {
                    proxy.pillsUsedDuringTribulation = (proxy.pillsUsedDuringTribulation || 0) + 1;
                }

                proxy.stats = { ...proxy.stats };
                
                this.removeItem(index, 1);
                
                if (typeof Game !== 'undefined' && Game.checkTitles) {
                    Game.checkTitles();
                }
                
                Game.saveGame();
            }
        },

        /**
         * Hiển thị danh sách túi đồ lên UI
         */
        renderBag: function(inventory) {
            const container = document.getElementById('inventory-list');
            if (!container) return;

            // Cập nhật tiêu đề với số lượng vật phẩm
            const titleEl = document.getElementById('inventory-title');
            if (titleEl) {
                const max = this.getMaxInventory();
                const count = inventory ? inventory.length : 0;
                titleEl.innerHTML = `TÚI ĐỒ <span style="font-size: 0.65rem; color: ${count >= max ? '#ff4444' : '#aaa'}; margin-left: 5px;">(${count}/${max})</span>`;
            }

            container.innerHTML = "";

            if (!inventory || inventory.length === 0) {
                container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #444; padding: 20px; font-style: italic;">Túi đồ trống rỗng...</div>`;
                return;
            }

            inventory.forEach((item, index) => {
                const data = GameData.items[item.id];
                if (!data) return;

                const color = rarityColors[data.rarity] || "#fff";
                
                let displayCount = item.count;
                if (item.count >= 10000) displayCount = Math.floor(item.count / 1000) + "k";
                else if (item.count >= 1000) displayCount = (item.count / 1000).toFixed(1) + "k";
                
                const countBadge = item.count > 1 ? `<span class="item-count">${displayCount}</span>` : "";

                // Đặc biệt cho Trứng linh thú (Ngẫu nhiên)
                const isRandomEgg = item.id === 'pet_egg_random';
                const itemClass = isRandomEgg ? "inventory-item animate-border-flash" : "inventory-item";
                const nameColor = isRandomEgg ? "#ff0000" : color;
                const nameWeight = isRandomEgg ? "bold" : "normal";

                let qualityLabel = "";
                if (data.type === 'equipment' && item.variance) {
                    if (item.variance >= 110) qualityLabel = `<span style="font-size: 0.45rem; color: #ffeb3b; display: block; font-weight: bold;">&nbsp;(cực tốt)</span>`;
                    else if (item.variance > 100) qualityLabel = `<span style="font-size: 0.45rem; color: #ffeb3b; display: block;">&nbsp;(tốt)</span>`;
                    else if (item.variance === 100) qualityLabel = `<span style="font-size: 0.45rem; color: #4caf50; display: block;">&nbsp;(bình thường)</span>`;
                    else if (item.variance <= 90) qualityLabel = `<span style="font-size: 0.45rem; color: #ff4444; display: block; font-weight: bold;">&nbsp;(cực tệ)</span>`;
                    else qualityLabel = `<span style="font-size: 0.45rem; color: #ff4444; display: block; font-weight: bold;">&nbsp;(tệ)</span>`;
                }

                const itemHtml = `
                    <div class="${itemClass}" onclick="BagSystem.handleItemAction(${index})" 
                         style="border-color: ${isRandomEgg ? 'transparent' : color + '44'}; position: relative;">
                        <div class="item-icon" style="color: ${color}; text-shadow: 0 0 5px ${color}88;">
                            ${data.icon || '📦'}
                        </div>
                        ${countBadge}
                        <div class="item-name-mini" style="color: ${nameColor}; font-weight: ${nameWeight}">
                            ${data.name}
                            ${qualityLabel}
                        </div>
                    </div>`;
                
                container.innerHTML += itemHtml;
            });
        }
    };
})();

window.BagSystem = BagSystem;
