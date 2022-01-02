import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";

interface SetMobileThemeSettings {
  mobileTheme: any;
  desktopTheme: any;
  themesObject: any;
}

const DEFAULT_SETTINGS: SetMobileThemeSettings = {
  desktopTheme: "Minimal",
  mobileTheme: "Obsidian You",
  themesObject: "none"
};

export default class SetMobileThemePlugin extends Plugin {
  settings: SetMobileThemeSettings;

  async onload() {
    await this.loadSettings();
    // Load installed themes
    this.loadThemeObject();
    // Set theme according to device (mobile or not)
    this.setThemeByDevice();
    // Add settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SetMobileThemeSettingTab(this.app, this));

    // Listen for CSS changes (installing a new plugin)
    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        console.log("Set Mobile Theme: Noticed CSS change")
        // @ts-ignore
        if (!this.app.isMobile) {
          // @ts-ignore
          this.settings.desktopTheme = this.app.customCss.theme;
          this.saveSettings();
        } else {
          // @ts-ignore
          this.settings.mobileTheme = this.app.customCss.theme;
          this.saveSettings();
        }
        })
    );

  }

  // Transformed installed plugins (array) into an object to work with a dropdown menu
  loadThemeObject() {
    // @ts-ignore
    const themeArr = ["none", ...this.app.customCss.themes];
    const themeObj = Object.assign({}, themeArr);
    this.settings.themesObject = themeObj;
    this.saveSettings();
    console.log("Set Mobile Theme: Saved loaded themes");
  }

  // Check if the user is on mobile or desktop and set theme accordingly
  setThemeByDevice() {
    // @ts-ignore
    if (!this.app.isMobile) {
      console.log(`Set to Desktop theme (${this.settings.desktopTheme})`);
      // @ts-ignore
      this.app.customCss.setTheme(this.settings.desktopTheme);
    } else {
      console.log(`Set to Mobile theme (${this.settings.mobileTheme})`);
      // @ts-ignore
      this.app.customCss.setTheme(this.settings.mobileTheme);
    }
  }

  // Simple function to get the key of a value in an object
  getKeyByValue(object: { [x: string]: any }, value: any) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SetMobileThemeSettingTab extends PluginSettingTab {
  plugin: SetMobileThemePlugin;

  constructor(app: App, plugin: SetMobileThemePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    
    containerEl.createEl("h2", { text: "Set Mobile Theme: Settings" });
    
    containerEl.createEl("h3", { text: "Desktop 🖥" });
    new Setting(containerEl)
      .setName("Desktop Theme")
      .setDesc("Choose a theme for desktop")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(this.plugin.settings.themesObject)
          .setValue(
            // Find the key to the desktop theme
            this.plugin.getKeyByValue(
              this.plugin.settings.themesObject,
              this.plugin.settings.desktopTheme
            )
          )
          .onChange(async (value) => {
            const themeObj = this.plugin.settings.themesObject;
            this.plugin.settings.desktopTheme = themeObj[value];
            
            await this.plugin.saveSettings();
            this.plugin.setThemeByDevice();
            this.display();
          })
      );
    
    containerEl.createEl("h3", { text: "Mobile 📱" });
    new Setting(containerEl)
      .setName("Mobile Theme")
      .setDesc("Choose a theme for mobile")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(this.plugin.settings.themesObject)
          .setValue(
            this.plugin.getKeyByValue(
              // Find the key to the mobile theme
              this.plugin.settings.themesObject,
              this.plugin.settings.mobileTheme
            )
          )
          .onChange(async (value) => {
            const themeObj = this.plugin.settings.themesObject;
            this.plugin.settings.mobileTheme = themeObj[value];
            await this.plugin.saveSettings();
            this.plugin.setThemeByDevice();
            this.display();
          })
      );
  }
}
