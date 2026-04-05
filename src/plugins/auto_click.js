/**
 * auto_click.js - Mod tự động tu luyện
 * Chuyên trách: Tự động nhấn nút tu luyện khi có thể lực.
 */
(function() {
    const modId = 'auto_click';
    let intervalId = null;

    const modObj = {
        name: "Tự Động Tu Luyện",
        description: "Tự động khai thông kinh mạch khi thể lực đủ (mỗi 1 giây).",
        defaultSettings: {
            enabled: false,
            interval: 1000,
            minStamina: 5
        },

        init: function(settings) {
            if (settings.enabled) {
                this.start(settings);
            }
        },

        onSettingsChange: function(settings) {
            if (settings.enabled) {
                this.start(settings);
            } else {
                this.stop();
            }
        },

        start: function(settings) {
            this.stop(); // Dọn dẹp trước khi bắt đầu mới
            intervalId = setInterval(() => {
                const proxy = window.proxyState;
                if (proxy && proxy.stamina >= settings.minStamina && window.Game && !window.Game.isInBattle) {
                    window.Game.cultivate();
                }
            }, settings.interval);
            console.log("🚀 Mod Tự Động Tu Luyện đã bắt đầu.");
        },

        stop: function() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
                console.log("🛑 Mod Tự Động Tu Luyện đã dừng.");
            }
        }
    };

    // Đăng ký mod vào hệ thống
    if (window.ModSystem) {
        ModSystem.register(modId, modObj);
    } else {
        console.error("ModSystem chưa được khởi tạo!");
    }
})();
