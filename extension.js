import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// Ein Name, der so spezifisch ist, dass er niemals kollidiert
const FINAL_ID = 'tte-screensaver-extension';

const TTEToggle = GObject.registerClass(
class TTEToggle extends QuickSettings.QuickMenuToggle {
    _init() {
        super._init({ title: 'TTE Screensaver', iconName: 'video-display-symbolic', toggleMode: true });
        this.set_name(FINAL_ID);
        this._update();
        this.connect('clicked', () => {
            const cmd = this.checked ? `nohup ${GLib.get_home_dir()}/Scripts/screensaver_watcher.sh > /dev/null 2>&1 &` : 'pkill -f screensaver_watcher.sh';
            GLib.spawn_command_line_async(`bash -c "${cmd}"`);
        });
    }
    _update() {
        try {
            let [res, out] = GLib.spawn_command_line_sync('pgrep -f screensaver_watcher.sh');
            this.checked = (out !== null && out.length > 0);
        } catch (e) { this.checked = false; }
    }
});

const TTEIndicator = GObject.registerClass(
class TTEIndicator extends QuickSettings.SystemIndicator {
    _init() {
        super._init();
        this._toggle = new TTEToggle();
        this.quickSettingsItems.push(this._toggle);
    }
});

export default class TTEScreensaverExtension extends Extension {
    enable() {
        this._startTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
            this._doRadicalCleanup();

            this._indicator = new TTEIndicator();
            Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
            
            this._startTimeout = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    _doRadicalCleanup() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        let actors = global.stage.get_children();
        this._findAndDestroy(global.stage);
        
        if (Main.panel.statusArea.quickSettings) {
            this._findAndDestroy(Main.panel.statusArea.quickSettings);
        }
    }

    _findAndDestroy(actor) {
        if (!actor || !actor.get_children) return;

        actor.get_children().forEach(child => {
            if (child.get_name && child.get_name() === FINAL_ID) {
                let p = child;
                while (p && !(p instanceof QuickSettings.SystemIndicator)) {
                    p = p.get_parent();
                }
                if (p) p.destroy();
                else child.destroy();
            } else {
                this._findAndDestroy(child);
            }
        });
    }

    disable() {
        if (this._startTimeout) {
            GLib.source_remove(this._startTimeout);
            this._startTimeout = null;
        }
        this._doRadicalCleanup();
    }
}
