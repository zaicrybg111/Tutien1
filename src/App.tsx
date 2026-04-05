/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Initialize game after DOM is ready
    const initGame = () => {
      if (typeof (window as any).Game !== 'undefined' && (window as any).Game.init) {
        (window as any).Game.init();
        console.log("Game initialized from React.");
      } else {
        // Retry if Game is not yet defined
        setTimeout(initGame, 100);
      }
    };
    initGame();
  }, []);

  return (
    <div className="game-container">
      {/* Start UI: Gift Selection */}
      <div id="start-ui">
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Đạo hữu hãy chọn <b id="gift-remaining" style={{ color: '#fff' }}>2</b> cơ duyên để bắt đầu hành trình.
        </p>
        
        <div id="gift-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="gift-card" id="gift-pills" onClick={() => (window as any).Game.pickStartingGift('gift_pills')}>
            <strong style={{ color: '#ffd700' }}>💊 TÚI ĐAN DƯỢC</strong>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>Nhận bộ đan dược hồi phục và 2 viên Tẩy Tủy Đan để thay đổi căn cốt.</p>
          </div>
          <div className="gift-card" id="gift-equips" onClick={() => (window as any).Game.pickStartingGift('gift_equips')}>
            <strong style={{ color: '#ffd700' }}>⚔️ TRANG BỊ KHỞI ĐẦU</strong>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>Sở hữu Thanh Mộc Kiếm và Giáp Da để hộ thân trong giai đoạn đầu.</p>
          </div>
          <div className="gift-card" id="gift-skills" onClick={() => (window as any).Game.pickStartingGift('gift_skills')}>
            <strong style={{ color: '#ffd700' }}>📜 BÍ TỊCH NHẬP MÔN</strong>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>Lĩnh ngộ cả 2 bí tịch thần thông (Trảm Thiên và Hào Quang).</p>
          </div>
          <div className="gift-card" id="gift-pets" onClick={() => (window as any).Game.pickStartingGift('gift_pets')}>
            <strong style={{ color: '#ffd700' }}>🐾 LINH THÚ KHỞI ĐẦU</strong>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>Nhận 2 Trứng linh thú (Linh cấp) và 2 Thức ăn linh thú để bắt đầu hành trình cùng bạn đồng hành.</p>
          </div>
        </div>
      </div>

      {/* Main Game UI */}
      <div id="ui-exp" style={{ display: 'none', padding: '10px', boxSizing: 'border-box', minHeight: '100vh', position: 'relative' }}>
        {/* Battle Transition Overlay */}
        <div id="battle-transition-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          zIndex: 10000,
          display: 'none',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.4s ease-in-out',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div id="battle-transition-text" style={{ color: '#ff4444', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '8px', textShadow: '0 0 20px #ff4444', opacity: 0, transform: 'scale(0.5)', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            QUYẾT CHIẾN
          </div>
        </div>

        <div id="character-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px', marginBottom: '10px', border: '1px solid rgba(212, 175, 55, 0.2)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)', position: 'relative' }}>
          <div id="main-player-avatar" onClick={() => (window as any).UI.showPlayerProfile()} style={{ width: '48px', height: '48px', background: '#1a1a1a', border: '2px solid #d4af37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 0 8px rgba(212, 175, 55, 0.2)', cursor: 'pointer' }}>
            🧑‍🌾
          </div>
          
          <div style={{ flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }} onClick={() => (window as any).UI.showPlayerProfile()}>
            <div id="title-display" className="clickable" onClick={(e) => { e.stopPropagation(); (window as any).UI.openTitleMenu(); }} style={{ cursor: 'pointer', display: 'flex' }}>
              <div id="main-player-title" style={{ color: '#888', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.5px', lineHeight: '1.2', padding: '1px 0' }}>[Vô Danh Tiểu Tốt]</div>
            </div>
            <div id="main-player-name" style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '1.15rem', textShadow: '0 0 5px rgba(212, 175, 55, 0.3)', lineHeight: '1.2' }}>Đạo Hữu</div>
            <div id="main-player-bone" style={{ fontSize: '0.7rem', fontWeight: 'bold', marginTop: '1px' }}>Phàm Cốt</div>
            <div style={{ color: '#aaa', fontSize: '0.65rem', opacity: 0.6, marginTop: '1px' }}>Nhấn để xem chi tiết</div>
          </div>
          
          {/* Top Right Resources & Actions */}
          <div style={{ position: 'absolute', top: '8px', right: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div 
              className="guide-link"
              style={{ color: '#4caf50', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', marginBottom: '2px', transition: 'all 0.2s' }} 
              onClick={() => { 
                (window as any).UI.showTab('guide');
                setTimeout(() => {
                  const el = document.getElementById('guide-ui');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              📖 HƯỚNG DẪN
            </div>
            <div style={{ color: '#ffd700', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
              💎 Linh Thạch: <span id="stat-spiritStone">0</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#444', cursor: 'pointer', opacity: 0.6 }} onClick={() => (window as any).UI.showPlayerProfile()}>🔍</div>
          </div>
        </div>

        <div className="header-box" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div className="clickable" onClick={() => (window as any).UI.showRankDetail()} style={{ cursor: 'help' }}>
              <span>Cảnh giới: <b id="rank-name">Phàm Nhân</b></span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
              <button id="breakthrough-btn" onClick={() => (window as any).Game.handleBreakthroughClick()} style={{ 
                display: 'none', 
                position: 'absolute', 
                top: '-32px', 
                right: '0', 
                background: 'linear-gradient(135deg, #d4af37, #ff4444)', 
                color: 'white', 
                border: '1px solid #fff', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                fontWeight: '900', 
                cursor: 'pointer', 
                animation: 'pulse 0.8s infinite', 
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.8)', 
                zIndex: 10,
                textShadow: '1px 1px 2px #000',
                letterSpacing: '1px'
              }}>ĐỘT PHÁ!</button>
              <span style={{ fontSize: '0.85rem' }}>Linh khí: <b id="stat-mana">0/100</b></span>
              <div style={{ width: '80px', background: '#333', height: '4px', borderRadius: '2px', overflow: 'hidden', border: '1px solid #444', marginTop: '2px' }}>
                <div id="mana-progress" style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #d4af37, #f1c40f)', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '2px' }}>
            <small className="clickable" style={{ color: '#aaa', fontSize: '0.75rem' }} onClick={() => (window as any).UI.showStatDetail('power')}>Lực chiến: <b id="stat-power" style={{ color: '#ff4500' }}>0</b></small>
            <div id="battle-status-indicator" onClick={() => (window as any).UI.showTab('battle')} style={{ display: 'none', background: '#800', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', animation: 'pulse 1.5s infinite' }}>
              ⚔️ ĐANG CHIẾN ĐẤU...
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <small style={{ color: '#888', fontSize: '0.6rem' }}>Tiến độ: <span id="exp-percent">0%</span></small>
            </div>
          </div>
        </div>

        <div id="stats-scroll-target" className="character-stats" style={{ marginBottom: '4px', display: 'flex', gap: '8px', width: '100%' }}>
          {/* Player Stats Column */}
          <div id="player-stats-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="stat-item" onClick={() => (window as any).UI.showStatDetail('hp')} style={{ cursor: 'help', padding: '4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.7rem' }}>🍎 Sinh lực:</span>
                <b id="stat-hp" style={{ fontSize: '0.7rem' }}>100/100</b>
              </div>
              <div style={{ width: '100%', background: '#333', height: '3px', borderRadius: '1.5px', marginTop: '2px', overflow: 'hidden' }}>
                <div id="hp-progress" style={{ width: '100%', height: '100%', background: '#ff4444', transition: 'width 0.3s' }}></div>
              </div>
            </div>

            <div className="stat-item" onClick={() => (window as any).UI.showStatDetail('mp')} style={{ cursor: 'help', padding: '4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.7rem' }}>🔷 Linh lực:</span>
                <b id="stat-mp" style={{ fontSize: '0.7rem' }}>50/50</b>
              </div>
              <div style={{ width: '100%', background: '#333', height: '3px', borderRadius: '1.5px', marginTop: '2px', overflow: 'hidden' }}>
                <div id="mp-progress" style={{ width: '0%', height: '100%', background: '#2196f3', transition: 'width 0.3s' }}></div>
              </div>
            </div>

            <div className="stat-item" onClick={() => (window as any).UI.showStatDetail('stamina')} style={{ cursor: 'help', padding: '4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.7rem' }}>⚡ Thể lực:</span>
                <b id="stat-stamina" style={{ fontSize: '0.7rem' }}>100/100</b>
              </div>
              <div style={{ width: '100%', background: '#333', height: '3px', borderRadius: '1.5px', marginTop: '2px', overflow: 'hidden' }}>
                <div id="stamina-progress" style={{ width: '100%', height: '100%', background: '#4caf50', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          </div>

          {/* Pet Stats Column - Hidden by default, shown when pet is active */}
          <div id="pet-stats-column" style={{ flex: 1, display: 'none', flexDirection: 'column', gap: '4px' }}>
            <div className="stat-item" onClick={() => (window as any).UI.showTab('pet')} style={{ cursor: 'pointer', padding: '4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.7rem', color: '#ff4081' }}>PET HP:</span>
                <b id="stat-pet-hp" style={{ fontSize: '0.7rem', color: '#ff4081' }}>0/0</b>
              </div>
              <div style={{ width: '100%', background: '#333', height: '3px', borderRadius: '1.5px', marginTop: '2px', overflow: 'hidden' }}>
                <div id="pet-hp-progress" style={{ width: '0%', height: '100%', background: '#ff4081', transition: 'width 0.3s' }}></div>
              </div>
            </div>

            <div className="stat-item" onClick={() => (window as any).UI.showTab('pet')} style={{ cursor: 'pointer', padding: '4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.7rem', color: '#2196f3' }}>PET MP:</span>
                <b id="stat-pet-mp" style={{ fontSize: '0.7rem', color: '#2196f3' }}>0/0</b>
              </div>
              <div style={{ width: '100%', background: '#333', height: '3px', borderRadius: '1.5px', marginTop: '2px', overflow: 'hidden' }}>
                <div id="pet-mp-progress" style={{ width: '0%', height: '100%', background: '#2196f3', transition: 'width 0.3s' }}></div>
              </div>
            </div>

            <div className="stat-item" onClick={() => (window as any).UI.showTab('pet')} style={{ cursor: 'pointer', padding: '4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.7rem', color: '#4caf50' }}>PET Thể Lực:</span>
                <b id="stat-pet-stamina" style={{ fontSize: '0.7rem', color: '#4caf50' }}>0/0</b>
              </div>
              <div style={{ width: '100%', background: '#333', height: '3px', borderRadius: '1.5px', marginTop: '2px', overflow: 'hidden' }}>
                <div id="pet-stamina-progress" style={{ width: '0%', height: '100%', background: '#4caf50', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div id="tab-nav-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', margin: '2px 0' }}>
          <button onClick={() => {
            (window as any).UI.showTab('cultivate');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-cultivate-btn" className="tab-btn" style={{ padding: '10px 4px', background: '#d4af37', border: '1px solid #d4af37', color: '#121212', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>TU LUYỆN</button>
          <button onClick={() => {
            (window as any).UI.showTab('map');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-map-btn" className="tab-btn" style={{ padding: '10px 4px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>BẢN ĐỒ</button>
          <button onClick={() => {
            (window as any).UI.showTab('sect');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-sect-btn" data-tab="sect" className="tab-btn" style={{ padding: '10px 4px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>MÔN PHÁI</button>
          <button onClick={() => {
            (window as any).UI.showTab('bag');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-bag-btn" className="tab-btn" style={{ padding: '10px 4px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>TÚI ĐỒ</button>
          <button onClick={() => { 
            (window as any).UI.showTab('pet');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-pet-btn" className="tab-btn" style={{ padding: '10px 4px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>LINH THÚ</button>
          <button onClick={() => {
            (window as any).UI.showTab('skill');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-skill-btn" className="tab-btn" style={{ padding: '10px 4px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>THẦN THÔNG</button>
          <button onClick={() => {
            (window as any).UI.showTab('quest');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-quest-btn" className="tab-btn" style={{ padding: '10px 4px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>NHIỆM VỤ</button>
          <button onClick={() => {
            (window as any).UI.showTab('battle-settings');
            setTimeout(() => {
              const el = document.getElementById('stats-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }} id="tab-battle-settings-btn" className="tab-btn" style={{ padding: '10px 4px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>CÀI ĐẶT</button>
        </div>

        <div id="battle-ui" style={{ 
          display: 'none', 
          background: 'radial-gradient(circle at center, #1a0505 0%, #050505 100%)', 
          padding: '10px 10px', 
          border: '2px solid #800', 
          borderRadius: '12px', 
          position: 'fixed', 
          top: '0', 
          left: '0', 
          width: '100vw', 
          height: '100vh', 
          zIndex: 9000, 
          overflowY: 'hidden',
          boxShadow: 'inset 0 0 50px rgba(255, 0, 0, 0.2)',
          flexDirection: 'column'
        }}>
          <div className="heavenly-intent-banner" style={{ position: 'sticky', top: '0', zIndex: 110 }}>THIÊN ĐẠO Ý NIỆM</div>
          
          {/* Close Button for Battle */}
          <button id="battle-close-btn" onClick={() => (window as any).UI.closeBattleUI()} style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.6)', 
            border: '1.5px solid rgba(255,255,255,0.4)', 
            color: '#fff', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 0 8px rgba(0,0,0,0.6)'
          }}>×</button>

          {/* Effect Layer - Higher z-index to be above units */}
          <div id="battle-effects-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100, overflow: 'visible' }}></div>

          <div className="battle-header" style={{ display: 'none', marginBottom: '10px', textAlign: 'center' }}>
            <h3 id="battle-title" style={{ margin: 0, fontSize: '1.2rem', color: '#ff4444', textTransform: 'uppercase', letterSpacing: '2px' }}>TRẬN CHIẾN</h3>
          </div>

          <div className="battle-units-container" style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'flex-start', marginBottom: '4px', position: 'relative', zIndex: 10, height: 'auto', minHeight: '200px' }}>
            {/* Player Side - Left */}
            <div id="player-side-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', minWidth: 0 }}>
              {/* Avatar Section - Fixed Height and Anchor for Debuffs */}
              <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                <div id="player-tribulation-defense-icon" onClick={() => (window as any).UI.showTribulationDefenseDetail()} style={{ display: 'none' }}>🛡️</div>
                <div id="player-avatar-container" onClick={() => (window as any).UI.showPlayerProfile()} className="avatar-box" style={{ width: '40px', height: '64px', background: '#1a1a1a', border: '2px solid #4caf50', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 0 10px rgba(76, 175, 80, 0.3)', cursor: 'pointer', position: 'relative', zIndex: 2 }}>
                  🧑‍🌾
                </div>
                {/* Buffs on Left, Debuffs on Right - 2 columns (40px width), 4 items vertically (80px height) */}
                <div id="ui-player-buffs" style={{ position: 'absolute', right: 'calc(50% + 22px)', top: '5px', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '80px', width: '52px', gap: '2px', zIndex: 3, alignItems: 'flex-end', alignContent: 'flex-end' }}></div>
                <div id="ui-player-debuffs" style={{ position: 'absolute', left: 'calc(50% + 22px)', top: '5px', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '80px', width: '52px', gap: '2px', zIndex: 3, alignItems: 'flex-start', alignContent: 'flex-start' }}></div>
              </div>

              {/* Stats Section - Fixed Height for alignment */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'center', gap: '1px', height: '140px', justifyContent: 'flex-start' }}>
                <span id="player-name-battle" onClick={() => (window as any).UI.showPlayerProfile()} style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', height: '1.2rem', display: 'block', marginBottom: '15px', textShadow: '0 0 5px rgba(76, 175, 80, 0.3)' }}>Đạo Hữu</span>
                
                {/* HP Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                    <span style={{ fontSize: '0.5rem', color: '#4caf50', fontWeight: 'bold' }}>❤️ Sinh lực</span>
                    <small style={{ color: '#eee', fontSize: '0.55rem', fontWeight: 'bold' }} id="stat-hp-battle">100/100</small>
                  </div>
                  <div style={{ width: '100%', background: '#222', height: '4px', borderRadius: '2px', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
                    <div id="hp-progress-battle" style={{ background: 'linear-gradient(90deg, #4caf50, #81c784)', width: '100%', height: '100%', transition: '0.3s' }}></div>
                  </div>
                </div>

                {/* Shield Bar */}
                <div id="player-shield-bar-container" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '1px auto 0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                    <span style={{ fontSize: '0.5rem', color: '#00e5ff', fontWeight: 'bold' }}>🛡️ Hộ thể</span>
                    <small style={{ color: '#00e5ff', fontSize: '0.55rem', fontWeight: 'bold' }} id="battle-player-shield-text">0/0</small>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', height: '5px', borderRadius: '2.5px', border: '1px solid rgba(0, 229, 255, 0.7)', overflow: 'hidden', position: 'relative', boxShadow: '0 0 8px rgba(0, 229, 255, 0.2)' }}>
                    <div id="player-shield-progress" style={{ background: 'linear-gradient(90deg, #00e5ff, #ffffff, #00e5ff)', width: '0%', height: '100%', transition: '0.3s', boxShadow: '0 0 12px rgba(0, 229, 255, 0.6)' }}></div>
                  </div>
                </div>
                
                {/* MP Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '1px auto 0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                    <span style={{ fontSize: '0.5rem', color: '#2196f3', fontWeight: 'bold' }}>🔷 Linh lực</span>
                    <small style={{ color: '#2196f3', fontSize: '0.55rem', fontWeight: 'bold' }} id="battle-player-mp-text">50/50</small>
                  </div>
                  <div style={{ width: '100%', background: '#222', height: '3px', borderRadius: '1.5px', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
                    <div id="battle-player-mp-bar" style={{ background: 'linear-gradient(90deg, #2196f3, #64b5f6)', width: '100%', height: '100%', transition: '0.3s' }}></div>
                  </div>
                </div>

                {/* Stamina Bar */}
                <div id="stamina-bar-battle-container" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '1px auto 0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                    <span style={{ fontSize: '0.5rem', color: '#ff9800', fontWeight: 'bold' }}>⚡ Thể lực</span>
                    <small style={{ color: '#ff9800', fontSize: '0.55rem', fontWeight: 'bold' }} id="stat-stamina-battle-text">100/100</small>
                  </div>
                  <div style={{ width: '100%', background: '#222', height: '4px', borderRadius: '2px', border: '1px solid #333', overflow: 'hidden' }}>
                    <div id="stamina-progress-battle" style={{ background: '#ff9800', width: '100%', height: '100%', transition: '0.3s' }}></div>
                  </div>
                </div>

                {/* Skill Status */}
                <div id="ui-player-skills-status" style={{ minHeight: '22px', display: 'flex', gap: '2px', marginTop: '6px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}></div>
              </div>

              {/* Pet Section - Below Player */}
              <div id="pet-battle-container" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                  <div id="pet-avatar-battle" className="avatar-box" style={{ width: '40px', height: '64px', background: '#1a1a1a', border: '2px solid #ff4081', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 0 10px rgba(255, 64, 129, 0.3)', position: 'relative', zIndex: 2 }}>
                    🐾
                  </div>
                  {/* Buffs on Left, Debuffs on Right */}
                  <div id="ui-pet-buffs" style={{ position: 'absolute', right: 'calc(50% + 22px)', top: '5px', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '80px', width: '52px', gap: '2px', zIndex: 10, alignItems: 'flex-end', alignContent: 'flex-end' }}></div>
                  <div id="ui-pet-debuffs" style={{ position: 'absolute', left: 'calc(50% + 22px)', top: '5px', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '80px', width: '52px', gap: '2px', zIndex: 10, alignItems: 'flex-start', alignContent: 'flex-start' }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'center', gap: '1px', height: '140px', justifyContent: 'flex-start' }}>
                  <span id="pet-name-battle" style={{ color: '#ff4081', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', height: '1.2rem', display: 'block', marginBottom: '15px', textShadow: '0 0 5px rgba(255, 64, 129, 0.3)' }}>Linh Thú</span>
                  
                  {/* HP Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                      <span style={{ fontSize: '0.5rem', color: '#ff4081', fontWeight: 'bold' }}>❤️ Sinh lực</span>
                      <small style={{ color: '#eee', fontSize: '0.55rem', fontWeight: 'bold' }} id="stat-pet-hp-battle">0/0</small>
                    </div>
                    <div style={{ width: '100%', background: '#222', height: '4px', borderRadius: '2px', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
                      <div id="pet-hp-progress-battle" style={{ background: 'linear-gradient(90deg, #ff4081, #ff80ab)', width: '0%', height: '100%', transition: '0.3s' }}></div>
                    </div>
                  </div>

                  {/* Shield Bar */}
                  <div id="pet-shield-bar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '1px auto 0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                      <span style={{ fontSize: '0.5rem', color: '#00e5ff', fontWeight: 'bold' }}>🛡️ Hộ thể</span>
                      <small style={{ color: '#00e5ff', fontSize: '0.55rem', fontWeight: 'bold' }} id="battle-pet-shield-text">0/0</small>
                    </div>
                    <div style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', height: '5px', borderRadius: '2.5px', border: '1px solid rgba(0, 229, 255, 0.7)', overflow: 'hidden', position: 'relative', boxShadow: '0 0 8px rgba(0, 229, 255, 0.2)' }}>
                      <div id="pet-shield-progress" style={{ background: 'linear-gradient(90deg, #00e5ff, #ffffff, #00e5ff)', width: '0%', height: '100%', transition: '0.3s', boxShadow: '0 0 12px rgba(0, 229, 255, 0.6)' }}></div>
                    </div>
                  </div>
                  
                  {/* MP Bar */}
                  <div id="pet-mp-bar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '1px auto 0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                      <span style={{ fontSize: '0.5rem', color: '#2196f3', fontWeight: 'bold' }}>🔷 Linh lực</span>
                      <small style={{ color: '#2196f3', fontSize: '0.55rem', fontWeight: 'bold' }} id="battle-pet-mp-text">0/0</small>
                    </div>
                    <div style={{ width: '100%', background: '#222', height: '3px', borderRadius: '1.5px', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
                      <div id="battle-pet-mp-bar" style={{ background: 'linear-gradient(90deg, #2196f3, #64b5f6)', width: '0%', height: '100%', transition: '0.3s' }}></div>
                    </div>
                  </div>

                  {/* Pet Skill Status */}
                  <div id="ui-pet-skills-status" style={{ minHeight: '22px', display: 'flex', gap: '2px', marginTop: '6px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* VS Text - Middle */}
            <div id="battle-vs-container" style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              margin: '0',
              gap: '10px',
              zIndex: 15,
              height: '90px'
            }}>
              <div id="vs-line-1" style={{ display: 'none' }}></div>
              <div id="battle-vs-text" style={{ 
                color: '#f44336', 
                fontWeight: '900', 
                fontSize: '1.2rem', 
                textShadow: '0 0 10px rgba(244, 67, 54, 0.8)',
                fontStyle: 'italic',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                VS
              </div>
              <div id="vs-line-2" style={{ display: 'none' }}></div>
            </div>

            {/* Enemy Side - Right */}
            <div id="enemy-side-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', minWidth: 0 }}>
              {/* Avatar Section - Fixed Height and Anchor for Debuffs */}
              <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                <div id="enemy-avatar-container" onClick={() => (window as any).UI.showEnemyDetail()} className="avatar-box" style={{ width: '40px', height: '64px', background: '#1a1a1a', border: '2px solid #f44336', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 0 10px rgba(244, 67, 54, 0.3)', cursor: 'pointer', position: 'relative', zIndex: 2 }}>
                  👾
                </div>
                {/* Buffs on Left, Debuffs on Right - 2 columns (40px width), 4 items vertically (80px height) */}
                <div id="ui-enemy-buffs" style={{ position: 'absolute', right: 'calc(50% + 22px)', top: '5px', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '80px', width: '52px', gap: '2px', zIndex: 3, alignItems: 'flex-end', alignContent: 'flex-end' }}></div>
                <div id="ui-enemy-debuffs" style={{ position: 'absolute', left: 'calc(50% + 22px)', top: '5px', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: '80px', width: '52px', gap: '2px', zIndex: 3, alignItems: 'flex-start', alignContent: 'flex-start' }}></div>
              </div>

              {/* Stats Section - Fixed Height for alignment */}
              <div id="enemy-stats-section" style={{ display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'center', gap: '1px', height: '140px', justifyContent: 'flex-start' }}>
                <span id="enemy-name" onClick={() => (window as any).UI.showEnemyDetail()} style={{ color: '#f44336', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', height: '1.2rem', display: 'block', marginBottom: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', textShadow: '0 0 5px rgba(244, 67, 54, 0.3)' }}>Kẻ Thù</span>
                <div id="enemy-rank-battle" style={{ display: 'none', fontSize: '0.65rem', color: '#aaa', marginBottom: '6px', fontStyle: 'italic' }}>Cảnh giới: ???</div>
                
                {/* HP Bar */}
                <div id="enemy-hp-bar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                    <span style={{ fontSize: '0.5rem', color: '#f44336', fontWeight: 'bold' }}>❤️ Sinh lực</span>
                    <small style={{ color: '#eee', fontSize: '0.55rem', fontWeight: 'bold', textAlign: 'right' }} id="stat-enemy-hp">0/0</small>
                  </div>
                  <div style={{ width: '100%', background: '#222', height: '4px', borderRadius: '2px', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
                    <div id="enemy-hp-progress" style={{ background: 'linear-gradient(90deg, #f44336, #ef5350)', width: '0%', height: '100%', transition: '0.3s' }}></div>
                  </div>
                </div>

                {/* Shield Bar */}
                <div id="enemy-shield-bar-container" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '1px auto 0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                    <span style={{ fontSize: '0.5rem', color: '#00e5ff', fontWeight: 'bold' }}>🛡️ Hộ thể</span>
                    <small style={{ color: '#00e5ff', fontSize: '0.55rem', fontWeight: 'bold', textAlign: 'right' }} id="battle-enemy-shield-text">0/0</small>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', height: '5px', borderRadius: '2.5px', border: '1px solid rgba(0, 229, 255, 0.7)', overflow: 'hidden', position: 'relative', boxShadow: '0 0 8px rgba(0, 229, 255, 0.2)' }}>
                    <div id="enemy-shield-progress" style={{ background: 'linear-gradient(90deg, #00e5ff, #ffffff, #00e5ff)', width: '0%', height: '100%', transition: '0.3s', boxShadow: '0 0 12px rgba(0, 229, 255, 0.6)' }}></div>
                  </div>
                </div>

                {/* MP Bar */}
                <div id="enemy-mp-bar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%', margin: '1px auto 0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: '0px' }}>
                    <span style={{ fontSize: '0.5rem', color: '#2196f3', fontWeight: 'bold' }}>🔷 Linh lực</span>
                    <small style={{ color: '#2196f3', fontSize: '0.55rem', fontWeight: 'bold', textAlign: 'right' }} id="battle-enemy-mp-text">0/0</small>
                  </div>
                  <div style={{ width: '100%', background: '#222', height: '3px', borderRadius: '1.5px', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
                    <div id="battle-enemy-mp-bar" style={{ background: 'linear-gradient(90deg, #2196f3, #64b5f6)', width: '0%', height: '100%', transition: '0.3s' }}></div>
                  </div>
                </div>

                {/* Skill Status */}
                <div id="ui-enemy-skills-status" style={{ minHeight: '26px', display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '6px', flexWrap: 'wrap', width: '100%' }}></div>
              </div>
              
              <div id="enemy-desc-container" style={{ display: 'none', width: '90%', margin: '5px auto', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid #333' }}>
                <p id="enemy-desc-text" style={{ fontSize: '0.55rem', color: '#aaa', fontStyle: 'italic', margin: 0, textAlign: 'center' }}></p>
              </div>
            </div>


          </div>
          
          <div id="battle-log-detail" style={{ flex: 1, overflowY: 'auto', background: '#0a0a0a', padding: '8px', border: '1px solid #444', borderRadius: '4px', fontSize: '0.65rem', color: '#ddd', lineHeight: '1.4', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)', marginBottom: '8px' }}>
          </div>

          {/* Close Button - Moved to bottom for better visibility */}
          <div id="battle-close-btn-container" style={{ width: '100%', marginTop: '5px', zIndex: 20, paddingBottom: '15px', display: 'flex', justifyContent: 'center' }}>
            <button id="battle-close-btn-result" onClick={() => (window as any).UI.closeBattleUI()} style={{ 
              display: 'none', 
              width: '80%', 
              padding: '10px', 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)', 
              border: '1.5px solid #d4af37', 
              color: '#d4af37', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              fontSize: '0.9rem', 
              textTransform: 'uppercase', 
              letterSpacing: '2px', 
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.2s'
            }}>ĐÓNG</button>
          </div>
        </div>

        {/* Tribulation UI - Separate from Battle UI */}
        <div id="tab-content">
          <div id="quest-ui" style={{ display: 'none', background: '#0c0a09', padding: '15px', borderRadius: '12px', border: '1px solid #d4af37', minHeight: '300px', maxHeight: '500px', overflowY: 'auto', boxShadow: '0 0 30px rgba(212, 175, 55, 0.15)' }}>
            <h4 style={{ color: '#d4af37', margin: '0 0 15px 0', textAlign: 'center', borderBottom: '2px solid #d4af37', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>📜 NHIỆM VỤ ĐANG CÓ</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#4caf50', fontSize: '0.8rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚔️ NHIỆM VỤ CHÍNH TUYẾN
              </h5>
              <div id="quest-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Quests will be rendered here */}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
              <h5 style={{ color: '#ffeb3b', fontSize: '0.8rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📅 NHIỆM VỤ HÀNG NGÀY
              </h5>
              <div id="daily-mission-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Daily missions will be rendered here */}
              </div>
            </div>
          </div>

          <div id="battle-settings-ui" style={{ display: 'none', background: '#111', padding: '15px', borderRadius: '12px', border: '1px solid #ff4444', boxShadow: '0 0 20px rgba(255, 68, 68, 0.1)' }}>
            <h4 style={{ color: '#ff4444', margin: '0 0 10px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>⚔️ CHIẾN THUẬT CHIẾN ĐẤU</h4>
            <p style={{ fontSize: '0.7rem', color: '#aaa', fontStyle: 'italic', marginBottom: '15px', textAlign: 'center', lineHeight: '1.4' }}>
              Chiến đấu thông minh hơn với các chiến thuật ưu tiên loại hình kỹ năng. Chú ý: cần vào tab Thần Thông và bật các kỹ năng chủ động bạn muốn sử dụng trước, các chế độ dưới đây chỉ gợi ý để giúp nhân vật của đạo hữu xử lý tình huống thông minh hơn trong các trận chiến.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div id="combat-tactics-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Sẽ được render bởi JS */}
              </div>

              <div id="potion-settings-container" style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '15px' }}>
                <h4 style={{ color: '#4caf50', margin: '0 0 10px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>💊 CÀI ĐẶT SỬ DỤNG ĐAN DƯỢC</h4>
                <div id="potion-settings-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Sẽ được render bởi JS */}
                </div>
              </div>

              <p style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                Tất nhiên để chiến thuật hoạt động trơn tru, đạo hữu phải đầy đủ các kỹ năng có đủ thành phần của chiến thuật thì mới ổn định được. <br/>
                <b style={{ color: '#d4af37' }}>Đặc biệt chú ý: đạo hữu nhớ bật kỹ năng trong tab Thần Thông trước nhé.</b>
              </p>
            </div>
          </div>

          <div id="guide-ui" style={{ display: 'none', background: '#0c0a09', padding: '15px', borderRadius: '12px', border: '1px solid #d4af37', maxHeight: '500px', overflowY: 'auto', boxShadow: '0 0 30px rgba(212, 175, 55, 0.15)' }}>
            <h4 style={{ color: '#d4af37', margin: '0 0 15px 0', textAlign: 'center', borderBottom: '2px solid #d4af37', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>📜 CẨM NANG TU TIÊN</h4>
            
            {/* Guide Navigation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '15px' }}>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-ranks')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>📜</span>
                <span>Cảnh Giới</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-cultivate')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>🧘</span>
                <span>Tu Luyện</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-bone')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>🦴</span>
                <span>Căn Cốt</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-pet')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>🐾</span>
                <span>Linh Thú</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-equip')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>⚔️</span>
                <span>Trang Bị</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-sect')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>🏰</span>
                <span>Môn Phái</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-faq')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>❓</span>
                <span>Hỏi & Đáp</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-overview')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>🌟</span>
                <span>Tổng Quan</span>
              </button>
              <button className="guide-nav-btn" onClick={() => document.getElementById('guide-mysterious')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>👤</span>
                <span>Người Thần Bí</span>
              </button>
            </div>

            <div className="guide-content">
              {/* Overview Section */}
              <div id="guide-overview" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🌟 Hành Trình Nghịch Thiên</div>
                  <p>Chào mừng đạo hữu đến với <b>Tu Tiên Lộ</b>. Đây là hành trình từ một phàm nhân nhỏ bé, thông qua tu luyện và chiến đấu để đạt đến đỉnh cao của tiên giới.</p>
                  <div className="guide-grid">
                    <div className="guide-card">
                      <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Cảnh Giới</div>
                      <p style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
                        {[
                          "Luyện Khí", "Trúc Cơ", "Kết Đan", "Nguyên Anh", "Hóa Thần", 
                          "Luyện Hư", "Hợp Thể", "Đại Thừa", "Độ Kiếp", "Thiên Tiên", 
                          "Kim Tiên", "Đại La", "Thánh Nhân"
                        ].map((r, i, arr) => (
                          <React.Fragment key={r}>
                            <span 
                              className="guide-link" 
                              style={{ color: '#d4af37', cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => (window as any).UI.showRealmGuide(r)}
                            >
                              {r}
                            </span>
                            {i < arr.length - 1 ? ' -> ' : ''}
                          </React.Fragment>
                        ))}
                      </p>
                      <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '4px' }}>
                        • Luyện Khí có 9 tầng.<br/>
                        • Các cảnh giới sau có 3 giai đoạn: Sơ Kỳ, Trung Kỳ, Viên Mãn.
                      </p>
                    </div>
                    <div className="guide-card">
                      <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Lực Chiến</div>
                      <p style={{ fontSize: '0.75rem' }}>Chỉ số tổng hợp từ Công, Thủ, Thân Pháp, Máu, Mana và các hiệu ứng từ Thần Thông, Linh Thú.</p>
                    </div>
                  </div>
                </div>
                <div className="guide-section">
                  <div className="guide-title">🎨 Phẩm Cấp & Màu Sắc</div>
                  <p>Màu sắc thể hiện độ hiếm và sức mạnh của vật phẩm, kỹ năng, và quái vật:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '0.75rem', padding: '2px 6px', background: '#333', borderRadius: '4px' }}>Phàm (Trắng)</span>
                    <span style={{ color: '#4caf50', fontSize: '0.75rem', padding: '2px 6px', background: '#1b5e20', borderRadius: '4px' }}>Linh (Xanh Lá)</span>
                    <span style={{ color: '#2196f3', fontSize: '0.75rem', padding: '2px 6px', background: '#0d47a1', borderRadius: '4px' }}>Địa (Xanh Dương)</span>
                    <span style={{ color: '#a335ee', fontSize: '0.75rem', padding: '2px 6px', background: '#6a1b9a', borderRadius: '4px' }}>Thiên (Tím)</span>
                    <span style={{ color: '#ff9800', fontSize: '0.75rem', padding: '2px 6px', background: '#e65100', borderRadius: '4px' }}>Thần (Cam)</span>
                    <span style={{ color: '#ff0000', fontSize: '0.75rem', padding: '2px 6px', background: '#8e0000', borderRadius: '4px' }}>Cực Phẩm (Đỏ)</span>
                  </div>
                </div>
              </div>

              {/* Mysterious Person Section */}
              <div id="guide-mysterious" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">👤 Người Thần Bí</div>
                  <p>Một nhân vật bí ẩn thường xuất hiện ngẫu nhiên trong hành trình tu tiên của đạo hữu.</p>
                  <div className="guide-grid">
                    <div className="guide-card">
                      <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Tương Tác</div>
                      <p style={{ fontSize: '0.75rem' }}>
                        • <b>Đàm Đạo:</b> Có thể nhận được thông tin hữu ích hoặc tăng tâm đắc.<br/>
                        • <b>Giao Dịch:</b> Hắn thường mang theo những bảo vật hiếm có từ thượng giới.<br/>
                        • <b>Khiêu Chiến:</b> Nếu đạo hữu tự tin vào sức mạnh của mình, có thể thử sức. Nhưng hãy cẩn thận, sức mạnh của hắn vượt xa những gì đạo hữu có thể tưởng tượng.
                      </p>
                    </div>
                    <div className="guide-card">
                      <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Lưu Ý</div>
                      <p style={{ fontSize: '0.75rem' }}>Người Thần Bí không thuộc về nhân giới, chiêu thức của hắn mang theo sức mạnh Hỗn Độn và Hư Vô, có thể bỏ qua phòng ngự hoặc gây ra các hiệu ứng khống chế cực mạnh.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ranks Section */}
              <div id="guide-ranks" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">📜 Chi Tiết Cảnh Giới</div>
                  <p style={{ fontSize: '0.8rem', marginBottom: '10px' }}>Hành trình tu tiên chia làm nhiều đại cảnh giới, mỗi đại cảnh giới lại có các tiểu giai đoạn khác nhau.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { name: "Phàm Nhân", levels: "Cơ Bản", desc: "Người bình thường chưa bước chân vào con đường tu tiên.", trib: "Không" },
                      { name: "Luyện Khí", levels: "9 Tầng", desc: "Giai đoạn cảm nhận linh khí, rèn luyện kinh mạch.", trib: "Thiên Đạo Ý Niệm" },
                      { name: "Trúc Cơ", levels: "Sơ - Trung - Viên Mãn", desc: "Xây dựng nền móng tu tiên, thọ nguyên tăng lên 200 năm.", trib: "Tam Lôi Thiên Kiếp" },
                      { name: "Kết Đan", levels: "Sơ - Trung - Viên Mãn", desc: "Ngưng tụ linh khí thành đan, chính thức bước vào con đường trường sinh.", trib: "Lục Lôi Thiên Kiếp" },
                      { name: "Nguyên Anh", levels: "Sơ - Trung - Viên Mãn", desc: "Phá đan thành anh, linh hồn có thể xuất khiếu.", trib: "Cửu Lôi Thiên Kiếp" },
                      { name: "Hóa Thần", levels: "Sơ - Trung - Viên Mãn", desc: "Thần thức hóa hình, có thể mượn sức mạnh thiên địa.", trib: "Tứ Tượng Thiên Kiếp" },
                      { name: "Luyện Hư", levels: "Sơ - Trung - Viên Mãn", desc: "Luyện giả thành chân, nắm giữ quy luật không gian.", trib: "Ngũ Hành Thiên Kiếp" },
                      { name: "Hợp Thể", levels: "Sơ - Trung - Viên Mãn", desc: "Thân thể và linh hồn hợp nhất, bất tử bất diệt.", trib: "Âm Dương Thiên Kiếp" },
                      { name: "Đại Thừa", levels: "Sơ - Trung - Viên Mãn", desc: "Cảnh giới đỉnh cao của nhân giới, chuẩn bị phi thăng.", trib: "Cửu Thiên Thiên Kiếp" },
                      { name: "Độ Kiếp", levels: "Sơ - Trung - Viên Mãn", desc: "Vượt qua sinh tử quan, rèn luyện tiên thể.", trib: "Hỗn Độn Thiên Kiếp" },
                      { name: "Thiên Tiên", levels: "Sơ - Trung - Viên Mãn", desc: "Chính thức thành tiên, thoát khỏi luân hồi.", trib: "Tiên Đạo Thử Thách" },
                      { name: "Kim Tiên", levels: "Sơ - Trung - Viên Mãn", desc: "Bất hủ kim thân, thọ cùng trời đất.", trib: "Vạn Kiếp Thiên Lôi" },
                      { name: "Đại La", levels: "Sơ - Trung - Viên Mãn", desc: "Vĩnh hằng tự tại, nhảy ra ngoài ngũ hành.", trib: "Đại La Hạo Kiếp" },
                      { name: "Thánh Nhân", levels: "Sơ - Trung - Viên Mãn", desc: "Đỉnh cao của vạn vật, nắm giữ thiên đạo.", trib: "Vô Thượng Thiên Kiếp" }
                    ].map((rank) => (
                      <div key={rank.name} id={`guide-rank-${rank.name.replace(/\s+/g, '')}`} className="guide-card" style={{ borderLeft: '3px solid #d4af37' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <strong style={{ color: '#d4af37', fontSize: '0.9rem' }}>{rank.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#888' }}>{rank.levels}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#ccc', marginBottom: '5px' }}>{rank.desc}</p>
                        <div style={{ fontSize: '0.65rem', color: '#ff4444', fontStyle: 'italic' }}>
                          ⚡ Thiên Kiếp: {rank.trib}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cultivate Section */}
              <div id="guide-cultivate" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🧘 Cơ Chế Tu Luyện</div>
                  <p>Tu luyện là cốt lõi để gia tăng Linh Khí và thăng tiến cảnh giới.</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px' }}>
                    <li><b>Tu Luyện:</b> Tiêu tốn <b>5 Thể Lực</b> để nhận <b>15 Linh Khí</b> (nhân thêm theo phẩm chất Căn Cốt).</li>
                    <li><b>Hồi Phục:</b> Thể lực hồi 1 điểm mỗi 2 giây. Sinh lực và Linh lực hồi 1% mỗi 2 giây khi không chiến đấu.</li>
                    <li><b>Đột Phá:</b> Khi Linh Khí đầy, nhấn Đột Phá. <b>50%</b> Linh Khí dư thừa sẽ được chuyển sang cảnh giới tiếp theo.</li>
                    <li><b>Thiên Kiếp:</b> Tại các mốc đột phá đại cảnh giới, đạo hữu phải vượt qua <span className="guide-link" style={{ color: '#ff4444', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => (window as any).UI.showRealmGuide('Luyện Khí')}>Thiên Lôi</span> để thăng cấp thành công.</li>
                  </ul>
                </div>
              </div>

              {/* Bone Quality Section */}
              <div id="guide-bone" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🦴 Căn Cốt (Bone Quality)</div>
                  <p>Căn cốt quyết định tốc độ hấp thụ linh khí và sức mạnh tiềm ẩn khi đột phá:</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px', fontSize: '0.75rem' }}>
                    <li><b>Phàm Cốt:</b> 1.0x Linh Khí | 1.0x Tăng trưởng</li>
                    <li><b>Linh Cốt:</b> 1.1x Linh Khí | 1.1x Tăng trưởng</li>
                    <li><b>Địa Cốt:</b> 1.2x Linh Khí | 1.2x Tăng trưởng (+5% Sinh lực/Phòng ngự)</li>
                    <li><b>Thiên Cốt:</b> 1.4x Linh Khí | 1.3x Tăng trưởng (+7% Toàn bộ chỉ số)</li>
                    <li><b>Tiên Cốt:</b> 1.6x Linh Khí | 1.4x Tăng trưởng (+10% Toàn bộ chỉ số)</li>
                    <li><b>Chí Tôn Cốt:</b> 2.0x Linh Khí | 1.5x Tăng trưởng (+20% Toàn bộ chỉ số)
                      <br/><span style={{ color: '#ffeb3b' }}>• Đặc biệt: Tự động thức tỉnh 1 Thần Thông Hào Quang và <b>bỏ qua yêu cầu cảnh giới</b> khi lĩnh ngộ.</span>
                    </li>
                  </ul>
                  <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '4px' }}>
                    * <b>Tăng trưởng:</b> Hệ số nhân thêm vào các chỉ số cơ bản mỗi khi đột phá thành công.
                  </p>
                </div>
              </div>

              {/* Map Section */}
              <div id="guide-map" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🗺️ Khám Phá & Chiến Đấu</div>
                  <p>Thế giới rộng lớn chứa đựng vô vàn cơ duyên và hiểm nguy.</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px' }}>
                    <li><b>Thám Hiểm:</b> Mỗi khu vực có yêu thú với cấp độ khác nhau. Hãy chọn nơi phù hợp với tu vi.</li>
                    <li><b>Chiến Lợi Phẩm:</b> Linh Thạch, Trang Bị, và Nguyên Liệu nâng cấp.</li>
                    <li><b>Boss Khu Vực:</b> Đánh bại Boss để nhận phần thưởng cực lớn và mở khóa bản đồ tiếp theo.</li>
                    <li><b>Boss & Kỳ Ngộ:</b> Chỉ số <b>May Mắn</b> ảnh hưởng đến tỉ lệ rớt đồ hiếm và xác suất gặp Kỳ Ngộ.</li>
                  </ul>
                </div>
                <div className="guide-section">
                  <div className="guide-title">⚔️ Quy Tắc Chiến Đấu</div>
                  <p>Chiến đấu diễn ra tự động theo lượt dựa trên <b>Thân Pháp</b>. Đạo hữu có thể thiết lập kỹ năng chủ động để sử dụng trong trận.</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px', fontSize: '0.75rem' }}>
                    <li><b>Thân Pháp:</b> Ảnh hưởng đến tốc độ tấn công (tần suất ra đòn) và khả năng né tránh đòn đánh của đối thủ.</li>
                    <li><b>May Mắn:</b> Ảnh hưởng đến tỉ lệ đánh chí mạng, sát thương chí mạng và các hiệu ứng kỹ năng đặc biệt.</li>
                  </ul>
                </div>
              </div>

              {/* Bag Section */}
              <div id="guide-bag" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🎒 Quản Lý Túi Đồ</div>
                  <p>Nơi chứa đựng tất cả tài sản và vật phẩm của đạo hữu.</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px' }}>
                    <li><b>Trang Bị:</b> Có 7 vị trí: Mũ, Giáp, Quần, Vũ Khí, Nhẫn, Trang Sức, Pháp Bảo.</li>
                    <li><b>Đan Dược:</b> Sử dụng để hồi phục Sinh lực hoặc tăng Linh Khí ngay lập tức.</li>
                    <li><b>Linh Thạch:</b> Tiền tệ dùng để mua vật phẩm, thăng chức môn phái và đổi bí tịch.</li>
                  </ul>
                </div>
              </div>

              {/* Equipment & Quality Section */}
              <div id="guide-equip" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">⚔️ Trang Bị & Phẩm Chất</div>
                  <p>Trang bị là nguồn sức mạnh quan trọng giúp đạo hữu vượt qua các thử thách cam go.</p>
                  
                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Vị Trí Trang Bị</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      Có tổng cộng 7 vị trí trang bị trên người:<br/>
                      • <b>Mũ (Head):</b> Tăng Phòng ngự, Máu.<br/>
                      • <b>Giáp (Body):</b> Tăng mạnh Phòng ngự.<br/>
                      • <b>Quần (Legs):</b> Tăng Phòng ngự, Thân pháp.<br/>
                      • <b>Vũ Khí (Weapon):</b> Tăng mạnh Tấn công.<br/>
                      • <b>Nhẫn (Ring):</b> Tăng Tấn công, Linh lực.<br/>
                      • <b>Trang Sức (Accessory):</b> Tăng Thân pháp, May mắn.<br/>
                      • <b>Pháp Bảo (Soul):</b> Tăng toàn diện các chỉ số đặc biệt.
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Phẩm Chất (Rarity)</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      Độ hiếm của trang bị được phân chia theo màu sắc:<br/>
                      • <span style={{ color: '#fff' }}>Phàm phẩm (Trắng)</span> | <span style={{ color: '#4caf50' }}>Linh phẩm (Xanh lá)</span><br/>
                      • <span style={{ color: '#2196f3' }}>Địa phẩm (Xanh dương)</span> | <span style={{ color: '#a335ee' }}>Huyền phẩm (Tím)</span><br/>
                      • <span style={{ color: '#ff9800' }}>Thiên phẩm (Cam)</span> | <span style={{ color: '#ff0000' }}>Thần phẩm (Đỏ)</span><br/>
                      Phẩm chất càng cao, chỉ số cơ bản của trang bị càng mạnh mẽ.
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Chất Lượng (Quality)</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      Mỗi món trang bị khi rơi ra sẽ có <b>Chất lượng</b> ngẫu nhiên từ <b>90% đến 110%</b>:<br/>
                      • <b style={{ color: '#ffeb3b' }}>(cực tốt):</b> Đạt mốc 110% chỉ số cơ bản. Cực kỳ hiếm.<br/>
                      • <b style={{ color: '#ffeb3b' }}>(tốt):</b> Chỉ số từ 101% - 109%.<br/>
                      • <b style={{ color: '#4caf50' }}>(bình thường):</b> Đúng 100% chỉ số cơ bản.<br/>
                      • <b style={{ color: '#ff4444' }}>(tệ):</b> Chỉ số từ 91% - 99%.<br/>
                      • <b style={{ color: '#ff4444' }}>(cực tệ):</b> Chỉ ở mức 90% chỉ số cơ bản.<br/>
                      <span style={{ color: '#ffeb3b', fontSize: '0.65rem' }}>* Lưu ý: Chỉ số May Mắn không ảnh hưởng và không bị ảnh hưởng bởi Chất lượng.</span><br/>
                      <span style={{ color: '#888', fontSize: '0.65rem' }}>* Nhấn vào dòng "Chất lượng" trong thông tin trang bị để xem chi tiết xê dịch.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Skill Section */}
              <div id="guide-skill" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🔮 Thần Thông & Bí Tịch</div>
                  <p>Kỹ năng là yếu tố then chốt để vượt cấp chiến đấu.</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px' }}>
                    <li><b>Chủ Động:</b> Tiêu tốn MP để thi triển. Cần bật "Tự động dùng" trong tab Thần Thông.</li>
                    <li><b>Bị Động:</b> Tăng vĩnh viễn các chỉ số thuộc tính. Càng nhiều bị động, thực lực càng thâm hậu.</li>
                    <li><b>Lĩnh Ngộ:</b> Sử dụng Bí Tịch thu thập được để học kỹ năng mới.</li>
                  </ul>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Phân Cấp & Yêu Cầu Cảnh Giới</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
                      Mỗi phẩm cấp Bí Tịch yêu cầu tu vi tối thiểu để có thể lĩnh ngộ:<br/>
                      • <b style={{ color: '#aaa' }}>Phàm Cấp:</b> Phàm Nhân (Tầng 0)<br/>
                      • <b style={{ color: '#4caf50' }}>Linh Cấp:</b> Luyện Khí Tầng 1<br/>
                      • <b style={{ color: '#2196f3' }}>Địa Cấp:</b> Trúc Cơ Sơ Kỳ<br/>
                      • <b style={{ color: '#a335ee' }}>Thiên Cấp:</b> Kết Đan Sơ Kỳ<br/>
                      • <b style={{ color: '#ff9800' }}>Thần Cấp:</b> Nguyên Anh Sơ Kỳ<br/>
                      <span style={{ color: '#888', fontSize: '0.65rem' }}>* Lưu ý: Nếu chưa đủ cảnh giới, đạo hữu sẽ không thể học được bí tịch dù có sở hữu chúng.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Pet Section */}
              <div id="guide-pet" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🐾 Linh Thú Đồng Hành</div>
                  <p>Linh thú là trợ thủ đắc lực, không chỉ tăng chỉ số mà còn trực tiếp tham chiến cùng đạo hữu.</p>
                  
                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Phẩm Cấp & Sức Mạnh</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      Mỗi phẩm cấp linh thú có hệ số tăng trưởng chỉ số khác nhau:<br/>
                      • <b>Phàm:</b> 1.1 | <b>Linh:</b> 1.2 | <b>Địa:</b> 1.35<br/>
                      • <b>Thiên:</b> 1.5 | <b>Thần:</b> 1.7 | <b>Cực Phẩm:</b> 2.0<br/>
                      Khi <b>Xuất Chiến</b>, linh thú cộng một phần chỉ số của nó cho chủ nhân:<br/>
                      • <b>20%</b> Công/Thủ, <b>10%</b> Máu/Mana/Thân pháp, <b>50%</b> May mắn.<br/>
                      (Số lượng thuộc tính cộng thêm tùy thuộc vào phẩm cấp linh thú)
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Tố Chất & Đột Biến</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      • <b>Tố chất (Potential):</b> Là hệ số nhân ẩn ảnh hưởng trực tiếp đến tất cả chỉ số cơ bản của linh thú. Tố chất càng cao, linh thú càng mạnh dù cùng cấp độ.<br/>
                      • <b>Tỷ lệ khi nở:</b> Khi trứng nở, linh thú sẽ nhận được tố chất ngẫu nhiên từ <b>95% đến 105%</b>.<br/>
                      • <b>Đột biến (Mutated):</b> Có <b>10% xác suất</b> linh thú khi nở sẽ bị đột biến. Linh thú đột biến sẽ được cộng thêm <b>10% Tố chất</b> (tổng cộng từ <b>105% đến 115%</b>).<br/>
                      • <b>Nhận biết:</b> Linh thú đột biến có thẻ <span style={{ color: '#ffeb3b', fontSize: '8px', fontWeight: 'bold' }}>ĐỘT BIẾN</span> trên ảnh đại diện.
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Kỹ Năng & Chiến Thuật</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      • <b>Kỹ năng:</b> Linh thú sở hữu các kỹ năng Tấn công, Buff (tăng chỉ số) hoặc Debuff (giảm chỉ số địch).<br/>
                      • <b>Hồi chiêu:</b> Thời gian hồi kỹ năng từ <b>8 đến 20 giây</b> tùy phẩm chất.<br/>
                      • <b>Thời gian hiệu ứng:</b> Các hiệu ứng Buff/Debuff tồn tại từ <b>4 đến 6 giây</b>.<br/>
                      • <b>Ưu tiên:</b> Đạo hữu có thể cài đặt mức độ ưu tiên (CAO, VỪA, THẤP, TẮT) cho từng kỹ năng.<br/>
                      • <b>Bật/Tắt:</b> Có thể nhanh chóng bật hoặc tắt kỹ năng bằng nút BẬT/TẮT.
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Khóa Kỹ Năng & Bù Đắp</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      • <b>Cơ chế khóa:</b> Mỗi linh thú chỉ bị khóa <b>duy nhất 1 kỹ năng</b> có yêu cầu cảnh giới cao nhất mà nó chưa đạt tới.<br/>
                      • <b>Mở khóa:</b> Khi linh thú đạt cảnh giới yêu cầu, kỹ năng đó sẽ mở khóa và linh thú sẽ chuyển sang khóa kỹ năng cao hơn tiếp theo (nếu có).<br/>
                      • <b>Bù đắp Thân pháp:</b> Trong thời gian có kỹ năng bị khóa, linh thú sẽ nhận được hiệu ứng tăng <b>10% Thân pháp</b> khi vào chiến đấu để bù đắp sức mạnh.
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Linh Khí & Cảnh Giới Linh Thú</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      • <b>Linh Khí (EXP):</b> Dùng để nâng cấp linh thú. Khi đủ linh khí, đạo hữu cần vào menu chi tiết linh thú để nhấn <b>Đột Phá</b>.<br/>
                      • <b>Cách kiếm Linh Khí:</b><br/>
                      - <b>Tu Luyện:</b> Khi chủ nhân tu luyện, linh thú xuất chiến và thú cưỡi nhận <b>50%</b> linh khí (có thể cộng dồn thành 100% nếu là cùng một con).<br/>
                      - <b>Chiến đấu:</b> Thắng trận giúp linh thú xuất chiến và thú cưỡi nhận <b>50%</b> linh khí nhân vật nhận được (có thể cộng dồn).<br/>
                      - <b>Hành động:</b> Mỗi hành động khác của chủ nhân giúp linh thú xuất chiến nhận <b>1 điểm</b> linh khí.<br/>
                      • <b>Cảnh Giới:</b> Linh thú có hệ thống cảnh giới tương tự tu sĩ (Phàm Yêu, Luyện Khí, Trúc Cơ...).<br/>
                      • <b>Sức mạnh:</b> Mỗi lần đột phá, các chỉ số (Sinh lực, Tấn công, Phòng ngự, Thân pháp) sẽ tăng mạnh dựa trên <b>Phẩm cấp</b> của linh thú:<br/>
                      - <b>Phàm cấp:</b> Cơ bản 105%, tăng trưởng 1.1<br/>
                      - <b>Linh cấp:</b> Cơ bản 110%, tăng trưởng 1.15<br/>
                      - <b>Địa cấp:</b> Cơ bản 115%, tăng trưởng 1.25<br/>
                      - <b>Thiên cấp:</b> Cơ bản 120%, tăng trưởng 1.35<br/>
                      - <b>Thần cấp:</b> Cơ bản 125%, tăng trưởng 1.5<br/>
                      - <b>Cực phẩm cấp:</b> Cơ bản 130%, tăng trưởng 1.7
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Lòng Trung Thành & Tọa Kỵ</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      • <b>Trung thành:</b> Quyết định sự gắn kết giữa chủ nhân và linh thú. Điểm trung thành tối đa là <b>100%</b>.<br/>
                      • <b>Tăng trung thành:</b> Chỉ có thể tăng thông qua việc cho ăn <b>Thức ăn linh thú</b> (Linh thạch không tăng trung thành).<br/>
                      • <b>Ảnh hưởng chiến đấu:</b> Nếu lòng trung thành <b>dưới 40%</b>, linh thú có 60% xác suất bướng bỉnh không chịu tấn công.<br/>
                      • <b>Rời bỏ:</b> Nếu trung thành <b>dưới 20%</b>, linh thú có nguy cơ cao sẽ bỏ đi tìm chủ nhân mới.<br/>
                      • <b>Tọa kỵ:</b> Linh thú có thể dùng làm thú cưỡi để giảm thời gian thám hiểm:<br/>
                      - Thân pháp pet &lt; 50: Giảm <b>10%</b> thời gian.<br/>
                      - Thân pháp pet ≥ 50: Giảm <b>15%</b> thời gian.<br/>
                      - Thân pháp pet ≥ 100: Giảm <b>20%</b> thời gian.<br/>
                      (Tiêu tốn <b>15 Thể Lực</b> linh thú mỗi lần thám hiểm)
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Thức Ăn & Thể Lực</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      • <b>Thể lực:</b> Linh thú tiêu tốn thể lực khi làm thú cưỡi (15 điểm/lần). Nếu thể lực <b>dưới 5</b>, linh thú sẽ bị [Suy Yếu] giảm 50% Tấn công.<br/>
                      • <b>Linh Thạch:</b> hồi 20% thể lực, tăng <b>1-2 trung thành</b>, nhưng rất nhanh chán ăn. (100 linh thạch). Tuy nhiên, nếu cho ăn liên tục (3 lần), linh thú sẽ bị <b>Ngán</b> và không thể ăn thêm Linh Thạch.<br/>
                      • <b>Thức ăn linh thú:</b> Là cách tốt nhất để tăng <b>Lòng trung thành</b> và reset trạng thái Ngán Linh Thạch:<br/>
                      - <b>Thường:</b> Tăng 10-15 trung thành, hồi 50% thể lực.<br/>
                      - <b>Cao cấp:</b> Tăng 20-30 trung thành, hồi 50% thể lực.<br/>
                      - <b>Quý hiếm:</b> Tăng 40-60 trung thành, hồi 50% thể lực.<br/>
                      • <b>Cách kiếm thức ăn:</b> Mua tại <b>Sảnh Môn Phái</b>, cửa hàng <b>Thương Nhân</b> hoặc nhận được từ <b>Kỳ Ngộ</b> khi thám hiểm.
                    </p>
                  </div>

                  <div className="guide-card" style={{ marginTop: '10px' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '4px' }}>Cách Tăng/Giảm Trung Thành</div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                      <b>Cách tăng trung thành:</b><br/>
                      • <b>Cho ăn (Khuyên dùng):</b> Sử dụng 100 Linh Thạch để cho ăn, tăng <b>5-10 điểm</b> trung thành.<br/>
                      • <b>Chiến thắng:</b> Mỗi trận thắng khi linh thú xuất chiến sẽ tăng <b>1 điểm</b>.<br/>
                      • <b>Cưỡi thú:</b> Duy trì cưỡi linh thú sẽ tăng <b>1 điểm</b> mỗi 60 giây.<br/>
                      <br/>
                      <b>Nguyên nhân giảm trung thành:</b><br/>
                      • <b>Tử trận:</b> Linh thú bị đánh bại trong chiến đấu sẽ giảm <b>1 điểm</b>.<br/>
                      • <b>Bỏ bê:</b> Nếu linh thú không xuất chiến và không được tương tác trong 30 hành động của chủ nhân, nó sẽ cảm thấy bị bỏ rơi và giảm <b>1 điểm</b>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sect Section */}
              <div id="guide-sect" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">🏰 Môn Phái & Cống Hiến</div>
                  <p>Gia nhập tông môn để nhận được sự bảo hộ và tài nguyên quý giá.</p>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px' }}>
                    <li><b>Nhiệm Vụ:</b> Làm nhiệm vụ tông môn để nhận <b>Điểm Cống Hiến</b> và Linh Thạch.</li>
                    <li><b>Thăng Chức:</b> Dùng điểm cống hiến để thăng tiến chức vụ (Ngoại Môn {'->'} Nội Môn {'->'} Trưởng Lão...).</li>
                    <li><b>Tàng Kinh Các:</b> Đổi điểm cống hiến lấy các Bí Tịch thần thông cao cấp.</li>
                    <li><b>Điểm Danh:</b> Nhận quà hàng ngày dựa trên chức vụ hiện tại.</li>
                  </ul>
                </div>
              </div>

              {/* Q&A Section */}
              <div id="guide-faq" className="guide-sub-section">
                <div className="guide-section">
                  <div className="guide-title">❓ Hỏi & Đáp (Q&A)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div className="guide-card" style={{ borderLeft: '3px solid #4caf50' }}>
                      <strong style={{ color: '#4caf50', fontSize: '0.8rem' }}>Q: Làm sao để tăng cảnh giới nhanh nhất?</strong>
                      <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '4px' }}>
                        A: Hãy tập trung vào việc <b>Tu Luyện</b> thường xuyên. Sử dụng <b>Tẩy Tủy Đan</b> để nâng cấp <b>Căn Cốt</b> sẽ giúp bạn nhận được nhiều Linh Khí hơn mỗi lần tu luyện. Ngoài ra, gia nhập Môn Phái và làm nhiệm vụ cũng cung cấp tài nguyên quan trọng.
                      </p>
                    </div>
                    <div className="guide-card" style={{ borderLeft: '3px solid #ff4444' }}>
                      <strong style={{ color: '#ff4444', fontSize: '0.8rem' }}>Q: Tại sao tôi đột phá thất bại?</strong>
                      <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '4px' }}>
                        A: Đột phá đại cảnh giới yêu cầu bạn phải vượt qua <b>Thiên Kiếp</b>. Nếu Sinh lực của bạn về 0 trong lúc chịu sấm sét, đột phá sẽ thất bại. Hãy đảm bảo bạn có đủ Sinh lực và trang bị phòng ngự tốt trước khi bắt đầu.
                      </p>
                    </div>
                    <div className="guide-card" style={{ borderLeft: '3px solid #2196f3' }}>
                      <strong style={{ color: '#2196f3', fontSize: '0.8rem' }}>Q: Linh thú có thực sự quan trọng không?</strong>
                      <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '4px' }}>
                        A: Rất quan trọng! Linh thú không chỉ cộng thêm chỉ số (Công, Thủ, Tốc...) cho bạn mà còn có kỹ năng riêng để hỗ trợ trong trận chiến. Một linh thú cấp cao có thể giúp bạn lật ngược thế cờ.
                      </p>
                    </div>
                    <div className="guide-card" style={{ borderLeft: '3px solid #ffd700' }}>
                      <strong style={{ color: '#ffd700', fontSize: '0.8rem' }}>Q: Làm sao để kiếm nhiều Linh Thạch?</strong>
                      <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '4px' }}>
                        A: Bạn có thể kiếm Linh Thạch thông qua việc <b>Thám Hiểm</b> bản đồ, đánh bại yêu thú, làm <b>Nhiệm Vụ Môn Phái</b>, hoặc nhận quà điểm danh hàng ngày tại tông môn.
                      </p>
                    </div>
                    <div className="guide-card" style={{ borderLeft: '3px solid #a335ee' }}>
                      <strong style={{ color: '#a335ee', fontSize: '0.8rem' }}>Q: Tôi nên ưu tiên nâng cấp gì trước?</strong>
                      <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '4px' }}>
                        A: Giai đoạn đầu hãy ưu tiên <b>Vũ Khí</b> để thám hiểm dễ dàng hơn. Sau đó là <b>Thần Thông</b> (Kỹ năng) và <b>Căn Cốt</b> để tăng tốc độ tu luyện lâu dài.
                      </p>
                    </div>
                    <div className="guide-card" style={{ borderLeft: '3px solid #ff4081' }}>
                      <strong style={{ color: '#ff4081', fontSize: '0.8rem' }}>Q: Làm sao để linh thú không bỏ đi?</strong>
                      <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '4px' }}>
                        A: Hãy duy trì điểm <b>Trung Thành</b> trên 20%. Cách tốt nhất là thường xuyên <b>Cho Ăn</b> bằng Linh Thạch trong menu chi tiết Linh Thú. Nếu bạn bỏ bê linh thú quá lâu (không cho xuất chiến), trung thành sẽ bị giảm dần.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                className="btn-main" 
                onClick={() => (window as any).UI.showTab('cultivate')} 
                style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'linear-gradient(to right, #d4af37, #b8962d)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)', textTransform: 'uppercase' }}
              >
                ĐÃ HIỂU, KHỞI ĐẦU TU TIÊN!
              </button>
            </div>
          </div>
          <div id="cultivate-ui">
            <div style={{ background: '#111', padding: '15px', borderRadius: '12px', border: '1px solid #333', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#d4af37', borderLeft: '3px solid #d4af37', paddingLeft: '10px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>HÀNH TRÌNH TU LUYỆN</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-main" onClick={() => (window as any).Game.cultivate()} style={{ width: '100%', padding: '12px', background: '#d4af37', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', color: '#121212', boxShadow: '0 4px 0 #b38f2d', transition: 'transform 0.1s' }}>🧘 TĨNH TÂM TU LUYỆN</button>
                <button id="auto-cultivate-main-btn" className="btn-main" onClick={() => (window as any).UI.showTab('auto')} style={{ width: '100%', padding: '12px', background: '#4caf50', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#fff', fontSize: '0.9rem', boxShadow: '0 4px 0 #388e3c', transition: 'transform 0.1s' }}>⚡ TU LUYỆN TỰ ĐỘNG</button>
                <button id="breakthrough-cultivate-btn" className="btn-main" onClick={() => (window as any).Game.handleBreakthroughClick()} style={{ display: 'none', width: '100%', padding: '12px', background: 'linear-gradient(135deg, #d4af37, #ff4444)', border: '1px solid #fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#fff', animation: 'pulse 0.8s infinite', boxShadow: '0 0 15px rgba(212, 175, 55, 0.8)', textShadow: '1px 1px 2px #000', fontSize: '0.9rem' }}>🔥 BẮT ĐẦU ĐỘT PHÁ</button>
              </div>
              <div id="bone-quality-container" style={{ marginTop: '20px' }}></div>
            </div>
          </div>
          <div id="auto-ui" style={{ display: 'none', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
            <h4 style={{ color: '#4caf50', margin: '0 0 10px 0', textAlign: 'center' }}>CÀI ĐẶT TỰ ĐỘNG TU LUYỆN</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', padding: '8px', borderRadius: '6px' }}>
                <span>Trạng thái:</span>
                <button id="auto-cultivate-toggle" className="btn-main" style={{ padding: '4px 12px', fontSize: '0.7rem' }}>TẮT</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', padding: '8px', borderRadius: '6px' }}>
                <span>Dừng khi thể lực dưới:</span>
                <select id="auto-cultivate-threshold" style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '2px 4px' }}>
                  <option value="0.5">50%</option>
                  <option value="0.2">20%</option>
                </select>
              </div>
              <p style={{ fontSize: '0.65rem', color: '#888', fontStyle: 'italic', marginBottom: '4px' }}>* Tự động tu luyện mỗi giây. Tiêu hao thể lực như bình thường.</p>
              <p style={{ fontSize: '0.6rem', color: '#666', lineHeight: 1.3 }}>
                * Chế độ này sẽ tạm dừng khi thể lực xuống dưới mức cài đặt, và tự động chạy lại khi thể lực hồi phục trên 90%. 
                Chỉ tắt hoàn toàn khi linh lực đầy (đủ đột phá) hoặc bạn chủ động tắt.
              </p>
            </div>
          </div>
          <div id="map-ui" style={{ display: 'none' }}>
            <div id="explore-ui" style={{ display: 'none', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #d4af37', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span id="explore-loc-name" style={{ color: '#d4af37', fontWeight: 'bold' }}>Đang thám hiểm...</span>
                <span id="explore-time-text" style={{ color: '#aaa', fontSize: '0.75rem' }}>0/0s</span>
              </div>
              <div style={{ width: '100%', background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #444' }}>
                <div id="explore-progress-bar" style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #d4af37, #f1c40f)', transition: 'width 0.1s linear' }}></div>
              </div>
            </div>
            <div id="map-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
            </div>
          </div>
          <div id="sect-ui" style={{ display: 'none' }}>
            <div id="sect-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
            </div>
          </div>
          <div id="pet-ui" style={{ display: 'none' }}>
            {/* Pet Hatchery Section */}
            <div style={{ background: '#111', padding: '15px', borderRadius: '12px', border: '1px solid #444', marginBottom: '15px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#ffd700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>🔥 LÒ ẤP LINH THÚ</h4>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>(0/3)</span>
              </div>
              <div id="pet-hatchery-list" style={{ textAlign: 'center', padding: '20px 0', color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>
                Chưa có trứng nào đang được ấp...
              </div>
            </div>

            {/* Owned Pets Section */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#4caf50', borderLeft: '3px solid #4caf50', paddingLeft: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>📜 LINH THÚ ĐANG SỞ HỮU</h4>
              <div id="pet-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div id="pet-display" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #444', textAlign: 'center' }}>
                  <div id="pet-avatar" style={{ fontSize: '3rem' }}>🥚</div>
                  <h4 id="pet-name" style={{ color: '#fff', margin: '5px 0' }}>Chưa có Linh Thú</h4>
                  <div id="pet-stats" style={{ fontSize: '0.75rem', color: '#aaa' }}>Đang chờ duyên phận...</div>
                </div>
              </div>
            </div>
          </div>
          <div id="skill-ui" style={{ display: 'none' }}>
            <div className="skill-grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#111', padding: '8px', borderRadius: '12px', border: '1px solid #333' }}>
              <div style={{ background: 'rgba(255,152,0,0.05)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,152,0,0.2)' }}>
                <h4 style={{ color: '#ff9800', fontSize: '0.65rem', textAlign: 'center', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>🔥 CHỦ ĐỘNG</h4>
                <div id="active-skills-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}></div>
              </div>
              <div style={{ background: 'rgba(76,175,80,0.05)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.2)' }}>
                <h4 style={{ color: '#4caf50', fontSize: '0.65rem', textAlign: 'center', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>🧘 BỊ ĐỘNG</h4>
                <div id="passive-skills-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}></div>
              </div>
            </div>
          </div>

          <div id="bag-ui" style={{ display: 'none' }}>
            <div id="equipment-ui-section" style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ffd700', borderLeft: '3px solid #ffd700', paddingLeft: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>TRANG BỊ HIỆN TẠI</h4>
              <div id="equipment-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px',
                background: 'rgba(255,255,255,0.03)',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #333'
              }}>
                <div className="equip-slot" id="slot-head">MŨ</div>
                <div className="equip-slot" id="slot-body">GIÁP</div>
                <div className="equip-slot" id="slot-legs">QUẦN</div>
                <div className="equip-slot" id="slot-weapon">VŨ KHÍ</div>
                <div className="equip-slot" id="slot-ring">NHẪN</div>
                <div className="equip-slot" id="slot-accessory">TRANG SỨC</div>
                <div className="equip-slot" id="slot-soul">PHÁP BẢO</div>
                <div style={{ height: '60px' }}></div>
              </div>
            </div>

            <div className="inventory-section" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                <h4 id="inventory-title" style={{ margin: 0, color: '#ffd700', borderLeft: '3px solid #ffd700', paddingLeft: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>TÚI ĐỒ</h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => (window as any).BagSystem.sortInventory('type')} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>Theo loại</button>
                  <button onClick={() => (window as any).BagSystem.sortInventory('rarity')} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>Theo phẩm cấp</button>
                </div>
              </div>
              <div id="inventory-list" className="inventory-grid">
              </div>
            </div>
          </div>
        </div>

        <div className="log-section">
          <div className="log-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4>📜 NHẬT KÝ TU TIÊN</h4>
              <button id="log-toggle-btn" onClick={() => (window as any).UI.toggleLog()} style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}>🔼</button>
              <button onClick={() => (window as any).UI.showFullLog()} style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', cursor: 'pointer', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '3px' }}>XEM HẾT</button>
            </div>
            <button className="clear-btn" onClick={() => {
              const log = document.getElementById('game-logs');
              if (log) log.innerHTML = '';
            }}>XÓA</button>
          </div>
          <div id="game-logs" className="log-container">
          </div>
        </div>

        <div id="system-management" style={{ display: 'flex', gap: '6px', borderTop: '1px solid #333', paddingTop: '8px' }}>
          <button className="btn-main btn-green" onClick={() => (window as any).Game.saveGame()} style={{ flex: 1 }}>LƯU TRỮ</button>
          <button className="btn-main btn-red" onClick={() => (window as any).UI.confirmReset()} style={{ flex: 1 }}>RESET</button>
        </div>
      </div>

      {/* Info Modal */}
      <div id="info-modal" onClick={(e) => { if (e.target === e.currentTarget) (window as any).UI.closeModal(); }} style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 2000000, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="modal-content" style={{ background: '#1a1a1a', border: '2px solid #8e24aa', padding: '12px', borderRadius: '12px', width: '95%', maxWidth: '320px', maxHeight: '85vh', boxShadow: '0 0 20px rgba(142, 36, 170, 0.3)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <button 
            onClick={() => {
              if ((window as any).UI.modalHistory && (window as any).UI.modalHistory.length > 0) {
                (window as any).UI.goBackModal();
              } else {
                (window as any).UI.closeModal();
              }
            }} 
            style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              background: 'transparent', 
              border: 'none', 
              color: '#888', 
              fontSize: '1.2rem', 
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              zIndex: 10
            }}
            className="hover:text-white"
          >
            ✕
          </button>
          <h3 id="modal-title" style={{ color: '#d4af37', marginTop: 0, textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '6px', fontSize: '1rem', flexShrink: 0 }}>Thông Tin</h3>
          <div id="modal-desc" style={{ color: '#ccc', margin: '8px 0', fontSize: '0.8rem', lineHeight: 1.4, minHeight: '40px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}></div>
          <div id="modal-controls" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '4px', flexShrink: 0, borderTop: '1px solid #333', paddingTop: '8px', justifyContent: 'center' }}></div>
        </div>
      </div>

      {/* Mod Manager Button */}
      <div className="mod-manager-btn" onClick={() => (window as any).ModSystem.showManager()}>
        🛠️
      </div>

      {/* Mod Manager Modal */}
      <div id="mod-manager-ui" className="fixed inset-0 bg-black/80 z-[10001] flex items-center justify-center p-4 hidden">
        <div className="modal-content bg-[#1a1a1a] border-2 border-yellow-600 rounded-xl w-full max-w-md overflow-hidden">
          <div className="p-4 border-b border-yellow-600 flex justify-between items-center bg-yellow-600/10">
            <h2 className="text-xl font-bold text-yellow-500">Quản lý Mod</h2>
            <button onClick={() => document.getElementById('mod-manager-ui')?.classList.add('hidden')} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="mod-list max-h-[60vh] overflow-y-auto">
            {/* Mod items will be injected here */}
          </div>
          <div className="p-4 bg-black/20 text-center">
            <p className="text-xs text-gray-500 italic">Một số Mod cần tải lại trang để áp dụng thay đổi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
