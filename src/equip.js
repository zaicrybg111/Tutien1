const EquipSystem = {
    equip: function(index) {
        const proxy = Game.getProxy();
        const item = proxy.inventory[index];
        if (!item) return;
        
        const data = GameData.items[item.id];
        if (!data || data.type !== 'equipment') return;
        
        // Đảm bảo trang bị có chất lượng trước khi mặc
        if (!item.variance) {
            const generated = BagSystem.generateEquipmentStats(data);
            item.stats = generated.stats;
            item.variance = generated.variance;
        }

        const slot = data.slot;
        const oldItem = proxy.equipments[slot];
        
        // Kiểm tra giới hạn cảnh giới của Mặt Nạ Vô Diện
        if (item.id === 'item_mask_mysterious' && proxy.rankIndex > 5) {
            UI.addLog("❌ Cảnh giới của đạo hữu quá cao, <b>Mặt Nạ Vô Diện</b> không thể dung nạp linh lực của ngươi!", false, "fail");
            return;
        }
        
        // Kiểm tra nếu đang đeo Mặt Nạ Vô Diện thì không cho thay thế
        if (oldItem && oldItem.id === 'item_mask_mysterious') {
            UI.addLog("❌ <b>Mặt Nạ Vô Diện</b> đã gắn chặt vào khuôn mặt đạo hữu, không thể tháo ra hay thay thế!", false, "fail");
            return;
        }

        // Create copies to work with
        let newInv = [...proxy.inventory];
        let newEquips = {...proxy.equipments};
        
        // Handle old equipment
        if (oldItem) {
            const oldData = GameData.items[oldItem.id];
            if (oldData && oldData.inventorySpace) {
                proxy.inventorySpaceBuff -= oldData.inventorySpace;
            }
            // Sử dụng stats đã lưu trong item, nếu không có thì dùng stats gốc
            const oldStats = oldItem.stats || GameData.items[oldItem.id].stats;
            for (let stat in oldStats) {
                const buffKey = `equip${stat.charAt(0).toUpperCase() + stat.slice(1)}Buff`;
                if (buffKey in proxy) proxy[buffKey] -= oldStats[stat];
                
                // Xử lý multipliers
                if (stat.endsWith('Mult')) {
                    const multKey = `equip${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
                    if (multKey in proxy) proxy[multKey] -= oldStats[stat];
                }
            }
            newInv.push(oldItem);
        }
        
        // Apply new equipment stats
        if (data.inventorySpace) {
            proxy.inventorySpaceBuff += data.inventorySpace;
        }
        const newStats = item.stats || data.stats;
        for (let stat in newStats) {
            const buffKey = `equip${stat.charAt(0).toUpperCase() + stat.slice(1)}Buff`;
            if (buffKey in proxy) proxy[buffKey] += newStats[stat];

            // Xử lý multipliers
            if (stat.endsWith('Mult')) {
                const multKey = `equip${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
                if (multKey in proxy) proxy[multKey] += newStats[stat];
            }
        }
        
        newEquips[slot] = { id: item.id, stats: item.stats, variance: item.variance };
        newInv.splice(index, 1);
        
        // Trigger proxy updates
        proxy.inventory = newInv;
        proxy.equipments = newEquips;
        
        const color = UI.getRarityColor(data.rarity);
        UI.addLog(`⚔️ Đã trang bị <b style="color: ${color}">${data.name}</b>.`);
        UI.closeModal();
        Game.saveGame();
    },
    
    unequip: function(slot) {
        const proxy = Game.getProxy();
        const item = proxy.equipments[slot];
        if (!item) return;
        
        const data = GameData.items[item.id];
        if (!data) return;

        // Kiểm tra Mặt Nạ Vô Diện
        if (item.id === 'item_mask_mysterious') {
            UI.addLog("❌ <b>Mặt Nạ Vô Diện</b> đã gắn chặt vào khuôn mặt đạo hữu, không thể tháo ra!", false, "fail");
            return;
        }

        // Remove stats
        if (data.inventorySpace) {
            proxy.inventorySpaceBuff -= data.inventorySpace;
        }
        const currentStats = item.stats || data.stats;
        for (let stat in currentStats) {
            const buffKey = `equip${stat.charAt(0).toUpperCase() + stat.slice(1)}Buff`;
            if (buffKey in proxy) proxy[buffKey] -= currentStats[stat];

            // Xử lý multipliers
            if (stat.endsWith('Mult')) {
                const multKey = `equip${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
                if (multKey in proxy) proxy[multKey] -= currentStats[stat];
            }
        }
        
        let newInv = [...proxy.inventory];
        let newEquips = {...proxy.equipments};
        
        newInv.push({ id: item.id, count: 1, stats: item.stats, variance: item.variance });
        newEquips[slot] = null;
        
        // Trigger proxy updates
        proxy.inventory = newInv;
        proxy.equipments = newEquips;
        
        UI.addLog(`🛡️ Đã tháo <b>${data.name}</b>.`);
        UI.closeModal();
        Game.saveGame();
    }
};
window.EquipSystem = EquipSystem;
