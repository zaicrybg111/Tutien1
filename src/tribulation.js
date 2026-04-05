/**
 * tribulation.js - Hệ thống Độ Kiếp (Tribulation System)
 * Chuyên trách: Xử lý thiên kiếp, lôi phạt khi đột phá cảnh giới.
 */
const TribulationSystem = (function() {
    const self = {
        strikeInterval: null,
        regenInterval: null,
        
        start: function(rankIndex) {
            // Loại bỏ phân loại theo cảnh giới: dùng chung logic cho tất cả các rank
            // Ngẫu nhiên từ 6 đến 9 đợt lôi kiếp cho mọi cảnh giới, riêng Phàm Nhân lên Luyện Khí cố định là 6
            const strikeCount = rankIndex === 0 ? 6 : Math.floor(Math.random() * 4) + 6; // 6, 7, 8, 9
            
            let tribName = "THIÊN KIẾP";
            if (strikeCount === 6) tribName = "TIỂU LÔI KIẾP";
            else if (strikeCount === 9) tribName = "ĐẠI LÔI KIẾP";
            else tribName = `${strikeCount} ĐẠO LÔI KIẾP`;
            
            UI.addLog(`⚡ <b>${tribName}:</b> Bầu trời đột nhiên tối sầm, sấm sét cuồng bạo giáng xuống!`, true);
            
            let currentStrike = 0;
            
            Game.isInBattle = true; // Chặn các hành động khác
            const proxyState = Game.getProxy();
            proxyState.isStatsFrozen = true;
            proxyState.pillsUsedDuringTribulation = 0; // Reset số đan dược dùng trong thiên kiếp
            proxyState.defenseAttempted = false; // Reset trạng thái thử vận công phòng thủ
            
            // Clear active buffs and debuffs for tribulation
            proxyState.activeBuffs = [];
            proxyState.activeDebuffs = [];
            
            const pStats = typeof BattleSystem !== 'undefined' ? BattleSystem.getPlayerTotalStats(proxyState) : { hpMax: proxyState.hpMax, mpMax: proxyState.mpMax, def: proxyState.def, staminaMax: proxyState.staminaMax };
            
            // Khởi tạo linh lực bảo hộ (Shield) nếu chưa có
            if (proxyState.shield === undefined || proxyState.shield <= 0) {
                const maxShield = Math.floor(pStats.mpMax * 0.5);
                proxyState.shield = Math.floor(maxShield * 0.1); // 10% của maxShield
            }

            const tribData = GameData.tribulations[rankIndex] || { 
                name: "THIÊN ĐẠO Ý NIỆM", 
                desc: "Thiên đạo vô tình, vạn vật sô cẩu. Lôi đình giáng thế, thử thách căn cơ." 
            };

            if (typeof TribulationUI !== 'undefined') {
                TribulationUI.init({ 
                    name: "THIÊN ĐẠO Ý NIỆM", // Giữ tên uy nghiêm này làm tiêu đề chính
                    hp: 1, 
                    maxHp: 1, 
                    desc: tribData.desc,
                    icon: "⚡",
                    isTribulation: true,
                    playerDef: pStats.def || 0
                });
                
                TribulationUI.updateBar('hp', proxyState.hp, pStats.hpMax);
                TribulationUI.updateBar('mp', proxyState.currentMp, pStats.mpMax);
                TribulationUI.updateBar('stamina', proxyState.stamina, pStats.staminaMax);
                TribulationUI.updateBar('shield', proxyState.shield, Math.floor(pStats.mpMax * 0.5));
                TribulationUI.updateBar('enemy-hp', 0, strikeCount);

                TribulationUI.addLog(`Cảnh báo: <b>${tribName}</b> đã bắt đầu!`, "Hệ thống");
                TribulationUI.addLog(`Ngươi cần chống chọi qua <b>${strikeCount}</b> đợt lôi kiếp!`, "Hệ thống");
            }

            const messages = [
                "Phàm nhân.... Trảm!!!",
                "Nghịch thiên ư?.. Chết!!!",
                "Căn cơ bạc nhược.. Tan biến!!!",
                "Thiên đạo bất dung.. Diệt!!!",
                "Kiến hôi vọng tưởng.. Giết!!!",
                "Trần thế vướng bận.. Đoạn!!!",
                "Lôi đình giáng thế.. Phạt!!!",
                "Vạn vật sô cẩu.. Diệt!!!",
                "Nghịch mệnh?.. Vô chi!!!",
                "Càn khôn nghịch chuyển.. Sát!!!"
            ];

            // Tạo bản sao và xáo trộn tin nhắn để không bị lặp
            let availableMessages = [...messages];
            const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            };
            shuffleArray(availableMessages);
            let messageIndex = 0;

            self.strikeInterval = setInterval(() => {
                currentStrike++;
                
                // Hiển thị câu nói kiêu ngạo của Thiên Đạo mỗi đợt sét qua bong bóng chat
                if (typeof TribulationUI !== 'undefined') {
                    const randomMsg = availableMessages[messageIndex % availableMessages.length];
                    TribulationUI.showSpeechBubble(randomMsg);
                    // Tăng index ngay sau khi hiện bong bóng
                    messageIndex = (messageIndex + 1) % availableMessages.length;
                    if (messageIndex === 0) {
                        shuffleArray(availableMessages);
                    }
                }

                // Reset defend flag for each strike (it only lasts for one strike)
                const isDefending = proxyState.isDefending;
                
                // Tính toán sát thương theo yêu cầu mới
                const rand = Math.random();
                let dmgPercent = 0.15; // Mặc định 15%
                let typeName = "THƯỜNG LÔI KIẾP";
                let color = "#00f2ff"; // Cyan
                let effectLabel = "⚡";

                if (rand < 0.10) { // 10% Tất sát
                    dmgPercent = 0.25;
                    typeName = "TẤT SÁT LÔI KIẾP";
                    color = "#ff0000"; // Red
                    effectLabel = "💀";
                } else if (rand < 0.30) { // 20% Biến dị
                    dmgPercent = 0.20;
                    typeName = "BIẾN DỊ LÔI KIẾP";
                    color = "#e040fb"; // Purple
                    effectLabel = "🔮";
                } else if (rand < 0.60) { // 30% Chí mạng
                    dmgPercent = 0.17;
                    typeName = "CHÍ MẠNG LÔI KIẾP";
                    color = "#ffeb3b"; // Yellow
                    effectLabel = "💥";
                }

                const dmgBase = Math.floor(pStats.hpMax * dmgPercent);
                
                // Áp dụng giảm sát thương từ phòng ngự (Giới hạn tối đa 40% cho Lôi Kiếp)
                const rawReduction = typeof BattleSystem !== 'undefined' ? BattleSystem.calcDamageReduction(pStats.def) : 0;
                const appliedReduction = Math.min(0.40, rawReduction);
                const reductionLog = rawReduction > 0.40 ? `40 % (tối đa)` : `${Math.round(appliedReduction * 100)} %`;
                
                // Áp dụng hình phạt dùng đan dược: +10% uy lực mỗi viên
                const pillPenalty = 1 + (proxyState.pillsUsedDuringTribulation || 0) * 0.1;

                const boneData = GameData.boneQualities[proxyState.boneQualityId] || GameData.boneQualities["pham"];
                const boneReduction = boneData.tribulationReduction || 0;
                const finalReduction = Math.min(0.80, appliedReduction + boneReduction); // Giới hạn tổng giảm sát thương 80%
                
                // Thể lực tiêu hao: 6% đến 9% thể lực tối đa theo yêu cầu mới
                const staminaLossPercent = 0.06 + (Math.random() * 0.03); 
                const staminaLoss = Math.max(3, Math.floor(pStats.staminaMax * staminaLossPercent)); 
                const oldStamina = proxyState.stamina;
                proxyState.stamina = Math.max(0, proxyState.stamina - staminaLoss);
                const actualStaminaLoss = oldStamina - proxyState.stamina;
                
                // Cập nhật thanh thể lực ngay lập tức
                if (typeof TribulationUI !== 'undefined') {
                    TribulationUI.updateBar('hp', proxyState.hp, pStats.hpMax);
                    TribulationUI.updateBar('mp', proxyState.currentMp, pStats.mpMax);
                    TribulationUI.updateBar('stamina', proxyState.stamina, pStats.staminaMax);
                    TribulationUI.updateBar('shield', proxyState.shield || 0, Math.floor(pStats.mpMax * 0.5));
                }

                const staminaPenaltyText = proxyState.stamina <= 0 ? ` <b style="color:#ff4444">+15% sát thương do không đủ thể lực chống đỡ</b>` : "";
                const staminaMultiplier = proxyState.stamina <= 0 ? 1.15 : 1.0;

                // Phòng thủ: Giảm 30% sát thương nếu đang vận công phòng thủ
                const dmgBeforeDefend = Math.max(1, Math.floor(dmgBase * (1 - finalReduction) * pillPenalty * staminaMultiplier));
                const finalDmg = isDefending ? Math.floor(dmgBeforeDefend * 0.7) : dmgBeforeDefend;
                const reducedDmg = dmgBeforeDefend - finalDmg;
                
                let defendText = "";
                if (isDefending) {
                    defendText = ` <b style="color:#2196f3">(Vận công phòng thủ thành công: Giảm ${reducedDmg} ST)</b>`;
                    proxyState.defenseAttempted = false; 
                } else if (proxyState.defenseAttempted) {
                    defendText = ` <b style="color:#ff4444">(Vận công phòng thủ thất bại)</b>`;
                    proxyState.defenseAttempted = false;
                }

                let remainingDmg = finalDmg;
                let absorbed = 0;
                if (proxyState.shield > 0) {
                    absorbed = Math.min(proxyState.shield, remainingDmg);
                    proxyState.shield -= absorbed;
                    remainingDmg -= absorbed;
                }
                
                if (remainingDmg > 0) {
                    proxyState.hp = Math.max(0, proxyState.hp - remainingDmg);
                }
                
                let penaltyText = "";
                if (proxyState.pillsUsedDuringTribulation > 0) {
                    penaltyText = ` <span style="color:#ff9800">(Uy lực +${Math.round((pillPenalty-1)*100)}% do dùng đan dược)</span>`;
                }

                // Ghi log tia sét giáng xuống trước
                if (typeof TribulationUI !== 'undefined') {
                    // Đảm bảo hiển thị HP thực tế, không bao gồm shield (hộ thể)
                    const realHp = Math.max(0, Math.floor(proxyState.hp));
                    const hpLeftText = ` (Sinh lực còn lại: <b style="color:#4caf50">${realHp} HP</b>)`;
                    
                    if (absorbed > 0) {
                        TribulationUI.addLog(`Đạo thứ ${currentStrike}: <b style="color:${color}">${typeName}</b> giáng xuống, gây <b style="color:#ff4444">${finalDmg} ST</b>. Tiêu tốn <b style="color:#ff9800">${actualStaminaLoss} thể lực</b>${penaltyText}${staminaPenaltyText}${defendText}!`, "⚡ Thiên Đạo");
                        TribulationUI.addLog(`🛡️ Linh lực hộ thể đã hấp thụ <b style="color:#2196f3">${absorbed}</b> sát thương!${hpLeftText}`, "⚖️ Thiên Phạt");
                        TribulationUI.updateBar('shield', proxyState.shield, Math.floor(pStats.mpMax * 0.5));
                    } else {
                        TribulationUI.addLog(`Đạo thứ ${currentStrike}: <b style="color:${color}">${typeName}</b> giáng xuống, gây <b style="color:#ff4444">${finalDmg} ST</b>. Tiêu tốn <b style="color:#ff9800">${actualStaminaLoss} thể lực</b>${penaltyText}${staminaPenaltyText}${defendText}!${hpLeftText}`, "⚡ Thiên Đạo");
                    }
                    
                    TribulationUI.updateBar('hp', proxyState.hp, pStats.hpMax);
                    TribulationUI.updateBar('stamina', proxyState.stamina, pStats.staminaMax);
                    // Hiển thị tiến trình độ kiếp trên thanh của "Thiên Đạo"
                    TribulationUI.updateBar('enemy-hp', currentStrike, strikeCount);
                }
                
                if (typeof UI !== 'undefined') {
                    UI.showBattleEffect('lightning', `${effectLabel} -${finalDmg}`, true, color);
                }

                // Kiểm tra kết thúc
                if (proxyState.hp <= 0 || currentStrike >= strikeCount) {
                    clearInterval(self.strikeInterval);
                    clearInterval(self.regenInterval);
                    
                    setTimeout(() => {
                        const isSuccess = proxyState.hp > 0;
                        const finalTribData = { name: "THIÊN ĐẠO Ý NIỆM" };
                        if (isSuccess) {
                            self.complete(finalTribData);
                        } else {
                            self.fail(finalTribData);
                        }
                        if (typeof TribulationUI !== 'undefined') {
                            // Không hiện log hệ thống ở đây nữa vì đã có log của Thiên Đạo nêu rõ kết quả
                            TribulationUI.showFinish(null);
                        }
                    }, 1000);
                } else {
                    // Không hiện lời phán xét trong nhật ký nữa theo yêu cầu người dùng
                }
            }, 2000); // Đánh 2 giây 1 lần

            // Hồi phục linh lực hộ thể, linh lực (mana) và thể lực mỗi giây
            self.regenInterval = setInterval(() => {
                // Chỉ hồi khi đang trong trận và chưa kết thúc
                if (Game.isInBattle && proxyState.hp > 0) {
                    // Cập nhật pStats để lấy max mới nếu có thay đổi
                    const currentTotals = typeof BattleSystem !== 'undefined' ? BattleSystem.getPlayerTotalStats(proxyState) : { hpMax: proxyState.hpMax, mpMax: proxyState.mpMax, def: proxyState.def, staminaMax: proxyState.staminaMax };
                    
                    // Hồi hộ thể 1% mỗi giây
                    const shieldRegen = Math.max(1, Math.floor(currentTotals.mpMax * 0.01));
                    proxyState.shield = Math.min(currentTotals.mpMax, (proxyState.shield || 0) + shieldRegen);
                    
                    // Hồi linh lực (mana) giống như chiến đấu bình thường (1% mỗi giây)
                    const mpRegen = Math.max(1, Math.floor(currentTotals.mpMax * 0.01));
                    proxyState.currentMp = Math.min(currentTotals.mpMax, (proxyState.currentMp || 0) + mpRegen);
    
                    // Hồi thể lực 0.5% mỗi giây theo yêu cầu mới
                    const staminaRegen = Math.max(1, Math.floor(currentTotals.staminaMax * 0.005));
                    proxyState.stamina = Math.min(currentTotals.staminaMax, (proxyState.stamina || 0) + staminaRegen);
    
                    if (typeof TribulationUI !== 'undefined') {
                        TribulationUI.updateBar('shield', proxyState.shield, Math.floor(currentTotals.mpMax * 0.5));
                        TribulationUI.updateBar('mp', proxyState.currentMp, currentTotals.mpMax);
                        TribulationUI.updateBar('stamina', proxyState.stamina, currentTotals.staminaMax);
                    }
                } else {
                    clearInterval(self.regenInterval);
                }
            }, 1000);
        },

        playerDefend: function() {
            if (!Game.isInBattle) return;
            const proxy = Game.getProxy();
            const pStats = typeof BattleSystem !== 'undefined' ? BattleSystem.getPlayerTotalStats(proxy) : { staminaMax: proxy.staminaMax, mpMax: proxy.mpMax };
            
            // Chi phí: 15 thể lực và 8-12% linh lực tối đa
            const manaCostPercent = 0.08 + Math.random() * 0.04;
            const manaCost = Math.floor(pStats.mpMax * manaCostPercent);
            const staminaCost = 15;

            if (proxy.stamina < staminaCost) {
                if (typeof TribulationUI !== 'undefined') {
                    TribulationUI.addLog(`Không đủ thể lực để vận công phòng thủ! (Cần ${staminaCost} Thể lực)`, "⚠️ Hệ Thống");
                }
                return;
            }

            if (proxy.currentMp < manaCost) {
                if (typeof TribulationUI !== 'undefined') {
                    TribulationUI.addLog(`Không đủ linh lực để vận công phòng thủ! (Cần ${manaCost} Linh lực)`, "⚠️ Hệ Thống");
                }
                return;
            }

            if (proxy.isDefending) {
                if (typeof TribulationUI !== 'undefined') {
                    TribulationUI.addLog("Bạn đã đang trong trạng thái phòng thủ!", "⚠️ Hệ Thống");
                }
                return;
            }

            proxy.isDefending = true;
            proxy.defenseAttempted = true;
            proxy.stamina -= staminaCost;
            proxy.currentMp -= manaCost;

            if (typeof TribulationUI !== 'undefined') {
                TribulationUI.updateBar('stamina', proxy.stamina, pStats.staminaMax);
                TribulationUI.updateBar('mp', proxy.currentMp, pStats.mpMax);
                TribulationUI.addLog(`Bạn đang vận công phòng thủ, tiêu tốn <b style="color:#ff9800">${staminaCost} thể lực</b>, <b style="color:#2196f3">${manaCost} linh lực</b>. Thời gian phòng thủ duy trì 1 giây.`, "🛡️ Bạn");
                TribulationUI.showShield(1000);
            }
            
            // Chỉ có tác dụng trong 1 giây
            setTimeout(() => {
                proxy.isDefending = false;
            }, 1000);

            if (typeof UI !== 'undefined') {
                UI.showBattleEffect('buff', "PHÒNG THỦ", true, "#2196f3");
            }
        },

        complete: function(tribulation) {
            const proxyState = Game.getProxy();
            proxyState.isStatsFrozen = false;
            Game.isInBattle = false; // Kết thúc trạng thái chiến đấu
            const msg = `🏆 <b>ĐỘ KIẾP THÀNH CÔNG:</b> Đạo hữu đã kiên cường vượt qua ${tribulation.name}!`;
            UI.addLog(msg, true, 'success');
            if (typeof TribulationUI !== 'undefined') {
                TribulationUI.addLog(msg, "⚡ Thiên Đạo");
            }
            if (typeof Game !== 'undefined' && Game.doBreakthrough) {
                Game.doBreakthrough();
            } else {
                Game.saveGame();
            }
        },

        fail: function(tribulation) {
            const proxyState = Game.getProxy();
            proxyState.isStatsFrozen = false;
            Game.isInBattle = false; // Kết thúc trạng thái chiến đấu
            const msg = `💀 <b>ĐỘ KIẾP THẤT BẠI:</b> Đạo hữu không thể chống đỡ ${tribulation.name}, tu vi bị tổn hại nặng nề!`;
            UI.addLog(msg, true, 'fail');
            if (typeof TribulationUI !== 'undefined') {
                TribulationUI.addLog(msg, "⚡ Thiên Đạo");
            }
            
            // Theo yêu cầu mới: Không bị hạ cấp, chỉ mất 90% linh lực (mana) tích lũy
            proxyState.mana = Math.floor(proxyState.mana * 0.1); // Mất 90% linh khí tích lũy
            proxyState.hp = 0;
            Game.saveGame();
        }
    };
    return self;
})();

window.TribulationSystem = TribulationSystem;
