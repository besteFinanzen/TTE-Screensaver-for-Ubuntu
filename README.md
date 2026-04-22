# **Ubuntu TerminalTextEffects (TTE) Screensaver**

A fully automated, system-wide custom screensaver for Ubuntu (with the `ptyxis` terminal). This setup monitors your global idle time and launches a gorgeous, fullscreen, animated terminal dashboard displaying your OS, Battery level, and the current Time using massive ASCII art. It instantly dismisses itself the moment you move your mouse or press a key.

### **Features**

* **System-Wide Idle Tracking:** Uses GNOME's native gdbus to track exact idle time (mouse and keyboard).  
* **Instant Exit:** Closes immediately on any keypress or mouse movement.  
* **Cycling Display:** Rotates between displaying "Ubuntu", your battery percentage, and the current time.  
* **Classic ASCII Fonts:** Uses figlet to generate large, blocky text.  
* **Cinematic Animations:** Powered by terminaltexteffects (decrypt, matrix, burn, etc.).
* **Gnome Extension:** To quickly enable disable and pause the screensaver.

## **📦 1\. Dependencies**

Before placing the files, you need to install the required system packages and the Python effects engine.

**Install System Tools:**

We need figlet (for the large text), and pipx (to safely install the Python effects package).

```bash
sudo apt update  
sudo apt install figlet pipx  
pipx ensurepath
```

*(Note: You may need to close and reopen your terminal after this step so your system recognizes pipx commands).*

**Install TerminalTextEffects (TTE):**

```bash
pipx install terminaltexteffects
```

## **📂 2\. File Placement & Setup**

You should have 4 files for this setup. Move or copy them to the following exact locations on your system, replacing YOUR\_USERNAME with your actual Linux username where applicable (or just use the \~ shortcut in the terminal).

### **The Core Scripts**

To have the scripts well organized I suggest creating a new folder under your home directory:

```bash
mkdir -p ~/Scripts
```

Place these in the `Scripts` directory and make them executable.

1. **tte\_screensaver.sh** (The animation engine)  
   * **Location:** \~/Scripts/tte\_screensaver.sh  
   * **Required Action:** Make it executable by running:  
     `chmod +x ~/Scripts/tte\_screensaver.sh`

2. **screensaver\_watcher.sh** (The background idle monitor)  
   * **Location:** \~/Scripts/screensaver\_watcher.sh  
   * **Required Action:** Make it executable by running:  
     `chmod +x ~/Scripts/screensaver\_watcher.sh`

### **The System Shortcuts**

Place this file in their respective hidden system folders.

3. **tte-watcher.desktop** (Autostart Configuration)  
   * **Location:** \~/.config/autostart/tte-watcher.desktop  
   * *Note: If the autostart folder doesn't exist, create it first using `mkdir -p ~/.config/autostart`.*  
   * *Effect: This tells Ubuntu to silently start your background watcher every time you log in.*  

### **Install the extension**

Create folder and add respective extension files.

```bash
mkdir $HOME/.local/share/gnome-shell/extensions/tte-screensaver@nizent.local
```

4. **metadata.json** (Extension Configuration)
  * **Location:** \~/.local/share/gnome-shell/extensions/tte-screensaver@nizent.local/metadata.json
  * *Effect: This tells gnome what that the extension exists and a short description of it.*

5. **extension.js** (Extension Script)
  * **Location:** \~/.local/share/gnome-shell/extensions/tte-screensaver@nizent.local/extension.js
  * *Description: This creates the button and the required code to make it work.*

## **🚀 3\. How to Start & Control**

**Starting it right now:**

Because the autostart file only triggers when you log in, you can start the background watcher immediately without rebooting by running this in your terminal:

```bash
nohup ~/Scripts/screensaver\_watcher.sh \> /dev/null 2\>&1 &
```

**Stopping the watcher temporarily:**

If you want to disable the screensaver from triggering (e.g., if you are watching a movie outside of fullscreen mode), you can kill the background process:

```bash
pkill -f "screensaver\_watcher.sh"
```
