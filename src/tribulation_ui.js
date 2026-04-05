/**
 * tribulation_ui.js - Giao diện Độ Kiếp mới
 * Thiết kế lại hoàn toàn từ đầu theo phong cách tối giản và hiện đại.
 */
const TribulationUI = (function() {
    let container = null;
    let lastLog = null;

    return {
        init: function(enemy) {
            lastLog = null;
            console.log("TribulationUI: Initializing...", enemy);
            try {
                const oldUI = document.getElementById('tribulation-ui-new');
                if (oldUI) oldUI.remove();

                container = document.createElement('div');
                container.id = 'tribulation-ui-new';
                container.className = 'tribulation-container';
                
                const enemyIcon = `<div class="eye-container" style="display: flex; align-items: center; gap: 8px; position: relative;">
                    <span class="eye-small side-eye-left" style="font-size: 1.2rem; opacity: 0.6; filter: hue-rotate(45deg);">👁️</span>
                    <span class="eye-main" style="font-size: 3rem; filter: drop-shadow(0 0 15px #ff0000); position: relative; z-index: 2;">👁️</span>
                    <span class="eye-small side-eye-right" style="font-size: 1.2rem; opacity: 0.6; filter: hue-rotate(-45deg);">👁️</span>
                </div>`;
                const enemyName = enemy.name || "THIÊN ĐẠO";

                // Thêm style cho hiệu ứng con mắt
                if (!document.getElementById('trib-eye-styles')) {
                    const style = document.createElement('style');
                    style.id = 'trib-eye-styles';
                    style.innerHTML = `
                        .eye-container::before {
                            content: '';
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 120%;
                            height: 120%;
                            background: radial-gradient(circle, rgba(255,0,0,0.25) 0%, transparent 70%);
                            z-index: 1;
                            animation: aura-pulse 6s infinite ease-in-out;
                            pointer-events: none;
                        }
                        @keyframes aura-pulse {
                            0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
                            50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.3); }
                        }
                        @keyframes eye-glance-main {
                            0%, 100% { transform: translate(0, 0) scale(1); }
                            20% { transform: translate(-4px, 2px) scale(1.02); }
                            40% { transform: translate(4px, -2px) scale(1.01); }
                            60% { transform: translate(-3px, -3px) scale(1.04); }
                            80% { transform: translate(3px, 3px) scale(1); }
                        }
                        @keyframes eye-glance-side {
                            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                            50% { transform: translate(0, -3px) scale(1.1); opacity: 0.8; }
                        }
                        @keyframes eye-glow {
                            0%, 100% { filter: drop-shadow(0 0 15px #ff0000) drop-shadow(0 0 5px #ff0000); }
                            50% { filter: drop-shadow(0 0 30px #ff4444) drop-shadow(0 0 10px #ff0000) brightness(1.3); }
                        }
                        .eye-main {
                            animation: eye-glance-main 7s infinite ease-in-out, eye-glow 3.5s infinite ease-in-out;
                            display: inline-block;
                        }
                        .eye-small {
                            animation: eye-glance-side 4.5s infinite ease-in-out;
                            display: inline-block;
                        }
                        .side-eye-left { animation-delay: -1.2s; }
                        .side-eye-right { animation-delay: -2.8s; }
                        
                        .trib-enemy-name {
                            text-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
                            letter-spacing: 0px;
                            animation: name-pulse 4s infinite ease-in-out;
                            font-weight: 900;
                            text-transform: uppercase;
                        }
                        @keyframes name-pulse {
                            0%, 100% { opacity: 0.85; transform: scale(1); filter: brightness(1); }
                            50% { opacity: 1; transform: scale(1.03); filter: brightness(1.2); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                container.innerHTML = `
                    <div id="trib-effects-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; overflow: visible"></div>
                    <div class="trib-header" style="margin-top: 0px; margin-bottom: 15px; padding-top: 5px; display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <div class="trib-enemy-name" style="font-size: 1.5rem; color: #ff3333; font-family: 'Cinzel', 'Georgia', serif;">${enemyName}</div>
                    </div>
                    
                    <div class="trib-battlefield">
                        <div class="trib-unit enemy" style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 5px;">
                            <div id="trib-enemy-avatar" class="avatar">${enemyIcon}</div>
                            <div style="display: flex; justify-content: center; width: 100%; align-items: baseline; gap: 5px; margin-top: 2px;">
                                <span style="font-size: 0.6rem; color: #f44336; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">⚡ Đợt sét</span>
                                <span id="trib-enemy-hp-text" style="color: #eee; font-size: 0.7rem; font-weight: 900; font-family: 'monospace';">0/0</span>
                            </div>
                        </div>
                        
                        <div class="trib-vs">VS</div>
                        
                        <div class="trib-unit player">
                            <div style="position: relative;">
                                <div id="trib-player-shield" style="display: none; position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px; border-radius: 50%; background: rgba(33, 150, 243, 0.3); border: 2px solid #2196f3; box-shadow: 0 0 20px #2196f3; z-index: 5; pointer-events: none;"></div>
                                <div id="trib-player-avatar" class="avatar">🧘</div>
                            </div>
                            <div class="stats-container" style="width: 85%; display: flex; flex-direction: column; gap: 1px;">
                                <div style="display: flex; flex-direction: column; width: 100%; margin-bottom: 2px;">
                                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: baseline; margin-bottom: 0px;">
                                        <span style="font-size: 0.5rem; color: #4caf50; font-weight: bold;">❤️ Sinh lực</span>
                                        <small id="trib-player-hp-text" style="color: #4caf50; font-size: 0.55rem; font-weight: bold;">0/0</small>
                                    </div>
                                    <div style="width: 100%; background: #222; height: 4px; borderRadius: 2px; border: 1px solid #333; overflow: hidden; position: relative;">
                                        <div id="trib-player-hp-bar-new" class="bar hp" style="background: linear-gradient(90deg, #4caf50, #81c784); width: 100%; height: 100%; transition: 0.3s;"></div>
                                    </div>
                                </div>
                                
                                <div id="trib-shield-row" style="display: flex; flex-direction: column; width: 100%; margin-bottom: 2px;">
                                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: baseline; margin-bottom: 0px;">
                                        <span style="font-size: 0.5rem; color: #00e5ff; font-weight: bold;">Hộ thể</span>
                                        <small id="trib-player-shield-text" style="color: #00e5ff; font-size: 0.55rem; font-weight: bold;">0</small>
                                    </div>
                                    <div style="width: 100%; background: rgba(0, 0, 0, 0.4); height: 5px; borderRadius: 2.5px; border: 1px solid rgba(0, 229, 255, 0.7); overflow: hidden; position: relative; boxShadow: 0 0 8px rgba(0, 229, 255, 0.2);">
                                        <div id="trib-player-shield-bar-new" class="bar shield" style="background: linear-gradient(90deg, #00e5ff, #ffffff, #00e5ff); width: 0%; height: 100%; transition: 0.3s; boxShadow: 0 0 12px rgba(0, 229, 255, 0.6);"></div>
                                    </div>
                                </div>

                                <div style="display: flex; flex-direction: column; width: 100%; margin-bottom: 2px;">
                                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: baseline; margin-bottom: 0px;">
                                        <span style="font-size: 0.5rem; color: #2196f3; font-weight: bold;">🔷 Linh lực</span>
                                        <small id="trib-player-mp-text" style="color: #2196f3; font-size: 0.55rem; font-weight: bold;">0/0</small>
                                    </div>
                                    <div style="width: 100%; background: #222; height: 3px; borderRadius: 1.5px; border: 1px solid #333; overflow: hidden; position: relative;">
                                        <div id="trib-player-mp-bar-new" class="bar mp" style="background: linear-gradient(90deg, #2196f3, #64b5f6); width: 100%; height: 100%; transition: 0.3s;"></div>
                                    </div>
                                </div>

                                <div style="display: flex; flex-direction: column; width: 100%; margin-bottom: 2px;">
                                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: baseline; margin-bottom: 0px;">
                                        <span style="font-size: 0.5rem; color: #ff9800; font-weight: bold;">⚡ Thể lực</span>
                                        <small id="trib-player-stamina-text" style="color: #ff9800; font-size: 0.55rem; font-weight: bold;">0/0</small>
                                    </div>
                                    <div style="width: 100%; background: #222; height: 4px; borderRadius: 2px; border: 1px solid #333; overflow: hidden;">
                                        <div id="trib-player-stamina-bar-new" class="bar stamina" style="background: #ff9800; width: 100%; height: 100%; transition: 0.3s;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="trib-actions">
                        <button id="trib-defend-btn-new" class="trib-btn defend">VẬN CÔNG PHÒNG THỦ</button>
                    </div>
                    
                    <div id="trib-log-new" class="trib-log"></div>
                    
                    <div id="trib-footer-new" class="trib-footer" style="display:none">
                        <button id="trib-close-btn-new" class="trib-btn close">RỜI KHỎI</button>
                    </div>
                `;

                document.body.appendChild(container);

                // Gán sự kiện
                const defendBtn = document.getElementById('trib-defend-btn-new');
                if (defendBtn) {
                    defendBtn.onclick = () => {
                        if (window.TribulationSystem) window.TribulationSystem.playerDefend();
                    };
                }

                const closeBtn = document.getElementById('trib-close-btn-new');
                if (closeBtn) {
                    closeBtn.onclick = () => {
                        TribulationUI.close();
                        if (window.UI) window.UI.closeBattleUI();
                    };
                }

                container.style.display = 'flex';
                document.body.classList.add('in-tribulation');
                if (window.UI) window.UI.isTribulation = true;
                console.log("TribulationUI: Init success");
            } catch (err) {
                console.error("TribulationUI: Init error", err);
            }
        },

        updateBar: function(type, current, max) {
            let barId = `trib-player-${type}-bar-new`;
            let textId = `trib-player-${type}-text`;
            if (type === 'enemy-hp') {
                barId = 'trib-enemy-hp-bar-new';
                textId = 'trib-enemy-hp-text';
            }
            
            const bar = document.getElementById(barId);
            if (bar) {
                const percent = Math.max(0, Math.min(100, (current / max) * 100));
                bar.style.width = percent + '%';
            }
            
            const text = document.getElementById(textId);
            if (text) {
                if (type === 'shield') {
                    text.innerText = Math.floor(current);
                } else {
                    text.innerText = `${Math.floor(current)}/${Math.floor(max)}`;
                }
            }

            if (type === 'shield') {
                // Shield row always visible during tribulation as per user request
                const row = document.getElementById('trib-shield-row');
                if (row) row.style.display = 'flex';
            }
        },

        addLog: function(msg, sender) {
            const log = document.getElementById('trib-log-new');
            if (log) {
                // Kiểm tra xem tin nhắn có giống hệt tin nhắn trước đó không để gộp lại
                if (lastLog && lastLog.msg === msg && lastLog.sender === sender) {
                    lastLog.count++;
                    const countBadge = lastLog.element.querySelector('.log-count');
                    if (countBadge) {
                        countBadge.innerText = ` x${lastLog.count}`;
                    } else {
                        const badge = document.createElement('span');
                        badge.className = 'log-count';
                        badge.style.color = '#ffeb3b';
                        badge.style.fontWeight = 'bold';
                        badge.style.marginLeft = '5px';
                        badge.style.fontSize = '0.75rem';
                        badge.innerText = ` x${lastLog.count}`;
                        lastLog.element.appendChild(badge);
                    }
                } else {
                    const item = document.createElement('div');
                    item.className = 'log-item';
                    item.innerHTML = `<span class="sender">${sender}:</span> <span class="msg">${msg}</span>`;
                    log.appendChild(item);
                    
                    lastLog = {
                        msg: msg,
                        sender: sender,
                        count: 1,
                        element: item
                    };
                }
                log.scrollTop = log.scrollHeight;
            }
        },

        showFinish: function(msg) {
            const footer = document.getElementById('trib-footer-new');
            const actions = document.querySelector('.trib-actions');
            if (footer) footer.style.display = 'block';
            if (actions) actions.style.display = 'none';
            
            if (msg) {
                this.addLog(msg, "Hệ Thống");
            }
        },

        showShield: function(duration) {
            const shield = document.getElementById('trib-player-shield');
            if (shield) {
                shield.style.display = 'block';
                shield.style.animation = 'pulse-shield 0.5s infinite alternate';
                
                if (!document.getElementById('shield-animation-style')) {
                    const style = document.createElement('style');
                    style.id = 'shield-animation-style';
                    style.innerHTML = `
                        @keyframes pulse-shield {
                            from { transform: scale(1); opacity: 0.3; }
                            to { transform: scale(1.1); opacity: 0.6; }
                        }
                    `;
                    document.head.appendChild(style);
                }

                setTimeout(() => {
                    shield.style.display = 'none';
                }, duration);
            }
        },

        showSpeechBubble: function(msg) {
            const enemyUnit = document.querySelector('.trib-unit.enemy');
            if (!enemyUnit) return;

            // Xóa bong bóng cũ nếu có
            const oldBubble = document.getElementById('trib-speech-bubble');
            if (oldBubble) oldBubble.remove();

            const bubble = document.createElement('div');
            bubble.id = 'trib-speech-bubble';
            bubble.innerHTML = msg;
            
            // Các dải màu huyền ảo (giảm độ đậm để tạo cảm giác hư ảo, mờ ảo hơn)
            const gradients = [
                'linear-gradient(135deg, rgba(20, 0, 40, 0.4) 0%, rgba(80, 0, 150, 0.3) 100%)', // Tím huyền bí
                'linear-gradient(135deg, rgba(0, 20, 20, 0.4) 0%, rgba(0, 120, 120, 0.3) 100%)', // Xanh u tối
                'linear-gradient(135deg, rgba(20, 10, 0, 0.4) 0%, rgba(150, 70, 0, 0.3) 100%)',  // Vàng đồng cổ xưa
                'linear-gradient(135deg, rgba(10, 10, 10, 0.4) 0%, rgba(50, 50, 50, 0.3) 100%)', // Đen xám lạnh lẽo
                'linear-gradient(135deg, rgba(30, 0, 0, 0.4) 0%, rgba(180, 0, 0, 0.3) 100%)'    // Đỏ máu cuồng bạo
            ];
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            const borderColor = randomGradient.includes('180, 0, 0') ? '#ff3333' : 
                                randomGradient.includes('80, 0, 150') ? '#a040ff' :
                                randomGradient.includes('0, 120, 120') ? '#00ffff' :
                                randomGradient.includes('150, 70, 0') ? '#ffaa00' : '#ffffff';

            // Xác định bên trái hay bên phải con mắt
            const side = Math.random() > 0.5 ? 'left' : 'right';
            
            // Vị trí ngang: Gần con mắt hơn một chút
            const posX = side === 'left' ? (Math.random() * 15 + 15) : (Math.random() * 15 + 70);
            
            // Vị trí dọc: Dao động xung quanh con mắt
            const posY = (Math.random() * 60 - 10);
            
            // Góc nghiêng sắc bén
            const randomRotate = (Math.random() * 30 - 15);

            // Chọn hình dạng ngẫu nhiên (Bỏ hình tam giác)
            const shapes = ['diamond', 'hexagon', 'pill', 'rect'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            let clipPath = 'none';
            let borderRadius = '2px';
            let padding = '4px 10px';

            switch(shape) {
                case 'diamond':
                    clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
                    padding = '10px 20px';
                    break;
                case 'hexagon':
                    clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                    padding = '6px 15px';
                    break;
                case 'pill':
                    borderRadius = '20px';
                    padding = '4px 12px';
                    break;
            }

            // Style cho bong bóng chat (Hư ảo, mờ ảo)
            Object.assign(bubble.style, {
                position: 'absolute',
                top: `${posY}px`,
                left: `${posX}%`,
                transform: `translateX(-50%) rotate(${randomRotate}deg) scale(0.5)`,
                background: randomGradient,
                backdropFilter: 'blur(6px)', // Tăng độ mờ ảo
                color: borderColor, // Màu chữ hư ảo theo tông màu
                padding: padding,
                borderRadius: borderRadius,
                clipPath: clipPath,
                border: `1px solid ${borderColor}44`, // Mờ hơn nữa
                fontSize: '0.45rem', // Nhỏ hơn nữa
                fontWeight: '900',
                letterSpacing: '-0.5px', // Ngắn lại tối đa
                textTransform: 'uppercase',
                fontStyle: 'italic',
                whiteSpace: 'nowrap',
                zIndex: '1000',
                boxShadow: `0 0 10px ${borderColor}22`,
                pointerEvents: 'none',
                opacity: '0',
                transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                textShadow: `0 0 4px ${borderColor}aa, 0 0 2px rgba(0,0,0,0.8)`, // Hào quang hư ảo
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '50px',
                minHeight: '20px',
                fontFamily: "'Cinzel', serif"
            });

            // Thêm mũi tên ngắn luôn chỉ về phía trung tâm
            const arrow = document.createElement('div');
            const distToCenter = side === 'left' ? (50 - posX) : (posX - 50);
            const arrowWidth = Math.max(15, distToCenter * 1.2); 
            
            // Tính toán góc để mũi tên luôn chỉ về tâm (50%, 50% của enemyUnit)
            // Vì bubble có rotate riêng, ta cần bù trừ lại
            const angleToCenter = side === 'left' ? 0 : 180;

            Object.assign(arrow.style, {
                position: 'absolute',
                top: '50%',
                [side === 'left' ? 'left' : 'right']: '100%',
                width: `${arrowWidth}px`, 
                height: '1px',
                background: `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, ${borderColor}88, transparent)`,
                // Bù trừ góc xoay của bubble để mũi tên luôn nằm ngang hướng về tâm
                transform: `translateY(-50%) rotate(${-randomRotate}deg)`,
                transformOrigin: side === 'left' ? 'left center' : 'right center',
                zIndex: '999',
                opacity: '0.5'
            });
            
            // Đầu mũi tên sắc nhọn
            const tip = document.createElement('div');
            Object.assign(tip.style, {
                position: 'absolute',
                [side === 'left' ? 'right' : 'left']: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '0',
                height: '0',
                borderTop: '2px solid transparent',
                borderBottom: '2px solid transparent',
                [side === 'left' ? 'borderLeft' : 'borderRight']: `5px solid ${borderColor}88`
            });
            arrow.appendChild(tip);
            bubble.appendChild(arrow);

            enemyUnit.appendChild(bubble);

            // Hiển thị với hiệu ứng mờ ảo dần hiện ra
            setTimeout(() => {
                bubble.style.opacity = '1';
                bubble.style.transform = `translateX(-50%) rotate(${randomRotate}deg) scale(1)`;
            }, 50);

            // Tự động biến mất
            setTimeout(() => {
                bubble.style.opacity = '0';
                bubble.style.transform = `translateX(-50%) rotate(${randomRotate}deg) scale(0.9) translateY(-5px)`;
                setTimeout(() => bubble.remove(), 500);
            }, 2300);
        },

        close: function() {
            lastLog = null;
            if (container) {
                container.remove();
                container = null;
            }
            document.body.classList.remove('in-tribulation');
            if (window.UI) window.UI.isTribulation = false;
        }
    };
})();

window.TribulationUI = TribulationUI;
