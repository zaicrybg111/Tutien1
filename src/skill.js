/**
 * skill.js - Hệ thống Thần Thông (Skills)
 * Chuyên trách: Lĩnh ngộ, hiển thị chi tiết và tính toán hiệu ứng kỹ năng.
 */
const SkillSystem = (function() {
    
    return {
        /**
         * Lĩnh ngộ kỹ năng từ bí tịch
         */
        learnSkill: function(itemId) {
            const itemData = GameData.items[itemId];
            if (!itemData || itemData.type !== 'skill_book') return "❌ Bí tịch này không thể lĩnh ngộ!";

            const skillId = itemData.skillId; 
            const skillData = GameData.skills[skillId];
            if (!skillData) return "❌ Thần thông không tồn tại!";

            const proxy = Game.getProxy();

            // Kiểm tra cảnh giới tối thiểu
            const minRank = itemData.minRank || skillData.minRank || 0;
            if (proxy.rankId < minRank) {
                const reqRank = GameData.ranks.find(r => r.id === minRank);
                return `❌ Cảnh giới của đạo hữu quá thấp (${proxy.rankName}). Cần đạt đến <b>${reqRank ? reqRank.name : 'Cảnh giới cao hơn'}</b> để lĩnh ngộ bí tịch này!`;
            }

            if (typeof Game !== 'undefined' && Game.learnSkillById) {
                return Game.learnSkillById(skillId);
            }
            
            // Kiểm tra đã học chưa
            if (proxy.skills.includes(skillId)) {
                return `Đạo hữu đã học [${skillData.name}] rồi.`;
            }

            // Nếu là kỹ năng bị động: Cộng thẳng chỉ số vào nhân vật
            if (skillData.type === 'passive') {
                const buffs = skillData.buff || skillData.stats || {};
                for (let stat in buffs) {
                    if (proxy.hasOwnProperty(stat)) {
                        proxy[stat] += buffs[stat];
                    }
                }
            }

            // Thêm vào danh sách kỹ năng
            proxy.skills = [...proxy.skills, skillId];
            
            return `✨ THÔNG BÁO: Lĩnh ngộ thành công <b>${skillData.name}</b>!`;
        },

        /**
         * Hiển thị chi tiết kỹ năng (Đồng bộ với UI)
         */
        showSkillDetail: function(skillId) {
            if (typeof UI !== 'undefined') UI.showSkillDetail(skillId);
        },

        /**
         * Áp dụng hiệu ứng đặc biệt của kỹ năng (Lifesteal, Debuff...)
         */
        applyEffect: function(skillId, attacker, defender, damage) {
            const skill = GameData.skills[skillId];
            if (!skill) return;

            // 1. Hút máu (Lifesteal)
            const lifesteal = skill.lifesteal || (skill.effect && skill.effect.type === 'lifesteal' ? skill.effect.value : 0);
            if (lifesteal) {
                const heal = Math.floor(damage * lifesteal);
                attacker.hp = Math.min(attacker.hpMax || attacker.maxHp || 100, attacker.hp + heal);
                UI.addBattleLog(`hồi <b style="color:#4caf50">${heal} HP</b> từ hút máu.`, attacker.name);
            }
            
            // Lưu ý: Debuff đã được BattleSystem xử lý trực tiếp để tránh trùng lặp và đảm bảo log chính xác
        },

        /**
         * Cập nhật danh sách kỹ năng trên UI
         */
        renderPlayerSkills: function(skillIds) {
            if (typeof UI !== 'undefined') UI.renderPlayerSkills(skillIds);
        }
    };
})();

window.SkillSystem = SkillSystem;
