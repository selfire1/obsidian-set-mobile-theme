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
  mySetting: string;
}

const DEFAULT_SETTINGS: SetMobileThemeSettings = {
  mobileTheme: "Obsidian You",
  desktopTheme: "Minimal",
  themesObject: "none",
  mySetting: "default"
};

export default class MyPlugin extends Plugin {
  settings: SetMobileThemeSettings;

  async onload() {
    await this.loadSettings();
    this.loadThemeObject();
    this.setThemeByDevice();
    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        console.log("noticed change!")
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

  loadThemeObject() {
    // @ts-ignore
    const themeArr = this.app.customCss.themes;
    const themeObj = Object.assign({}, themeArr);
    this.settings.themesObject = themeObj;
    this.saveSettings();
    console.log("Set Mobile Theme: Saved loaded themes");
  }

  setThemeByDevice() {
    // @ts-ignore
    if (!this.app.isMobile) {
      console.log("Set to Desktop theme");
      // @ts-ignore
      this.app.customCss.setTheme(this.settings.desktopTheme);
    } else {
      console.log("Set to Mobile theme");
      // @ts-ignore
      this.app.customCss.setTheme(this.settings.mobileTheme);
    }
  }

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

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.createEl("h2", { text: "Set Mobile Theme: Settings" });
    
    containerEl.createEl("h3", { text: "Desktop 🖥" });
    new Setting(containerEl)
      .setName("Desktop Theme")
      .setDesc("Choose a theme for deskop")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(this.plugin.settings.themesObject)
          .setValue(
            // @ts-ignore
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
            // @ts-ignore
            this.plugin.getKeyByValue(
              this.plugin.settings.themesObject,
              this.plugin.settings.mobileTheme
            )
          )
          .onChange(async (value) => {
            const themeObj = this.plugin.settings.themesObject;
            this.plugin.settings.mobileTheme = themeObj[value];
            await this.plugin.saveSettings();
            this.plugin.setThemeByDevice();
          })
      );
    

    new Setting(containerEl)
    .addButton((cb) =>
      cb
        .setButtonText("Reload themes")
        .onClick(() => {
          this.plugin.loadThemeObject();
        })
    );
  }
}
