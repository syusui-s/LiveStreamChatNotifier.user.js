// @flow

class YouTubeSettings {
  static fromObject(obj) {
    const { channelNames } = obj;

    return new this(channelNames);
  }

  /*::
  channelNames: Array<string>
  */
  constructor(channelNames) {
    Object.assign(this, {
      channelNames,
    });
  }
}

class YouTubeSettingsRepository {
  static get keyName() {
    return 'YouTubeSettings';
  }

  /*::
  store: Storage | RemoteStorage
  */
  constructor(store) {
    Object.assign(this, { store });
  }

  async getSettings() {
    const settingsJson = await this.store.getItem(this.constructor.keyName);
    const settingsObj = JSON.parse(settingsJson);

    return YouTubeSettings.fromObject(settingsObj);
  }

  async saveSettings(settings) {
    const settingsJson = JSON.stringify(settings);
    return this.store.setItem(this.constructor.keyName, settingsJson);
  }
}
