/**
 * Plugin: Save Manager - Hệ thống Save/Load thông minh
 */
export const SaveManager = {
    id: 'save_manager',
    saveKey: 'tu_tien_save_v1',
    
    init(core) {
        this.core = core;
        this.load();
        
        // Tự động lưu mỗi 30 giây
        setInterval(() => this.save(), 30000);
    },
    
    save() {
        const data = JSON.stringify(this.core.state);
        localStorage.setItem(this.saveKey, data);
        console.log("Game Saved");
    },
    
    load() {
        const data = localStorage.getItem(this.saveKey);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.core.loadSave(parsed);
                console.log("Game Loaded");
            } catch (e) {
                console.error("Failed to load save", e);
            }
        }
    },
    
    clear() {
        localStorage.removeItem(this.saveKey);
        this.core.reset();
        window.location.reload();
    }
};
