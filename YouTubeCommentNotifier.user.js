// ==UserScript==
// @name               YouTubeCommentNotifier.user.js
// @description        YouTubeのライブチャットのストリームで特定のメッセージを通知してくれるやつ
// @namespace          https://github.com/syusui-s/YouTubeCommentNotifier.user.js
// @version            1.0.0
// @match              https://www.youtube.com/live_chat*
// @match              https://gaming.youtube.com/live_chat*
// @run-at             document-end
// @downloadURL        https://syusui-s.github.io/YouTubeCommentNotifier.user.js/YouTubeCommentNotifier.user.js
// @updateURL          https://syusui-s.github.io/YouTubeCommentNotifier.user.js/YouTubeCommentNotifier.user.js
// @grant              GM.notification
// ==/UserScript==

const baseUrl = 'https://syusui-s.github.io/YouTubeCommentNotifier.user.js';

const workUrls = [
  'https://www.youtube.com/live_chat',
  'https://gaming.youtube.com/live_chat',
];

/**
 * 指定のミリ秒 ms だけ、何もしないで待機する
 *
 * @param {number} ms 待機ミリ秒
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 処理を再試行する async function
 *
 * @param {number}   count    再試行の最大回数
 * @param {number}   interval 次の再試行までの間隔をミリ秒で指定する
 * @param {function} fn       処理
 * @param {array}    args     処理への引数
 */
const retry = async (count, interval, fn, ...args) => {
  for (let i = 0; i < count; ++i) {
    const result = await fn(...args);

    if (result)
      return result;

    await sleep(interval);
  }
};

const notifySound = {
  audio: new Audio('data:audio/mp3;base64,//NExAANmAJeX0EQAPYpJqm5HQa3Pg/Eb4IRAcdLvtLggcdKOgg4EAQdKO/iM//KBj//ygY/lz/1AgA/xAGP//y/g+oKv/vry70DwEDwHgPobBpRKnCxUZEJ4FAKALyr//NExBwZJAqNlYdQAGrIBXBvzDWICxaeLjx+XAFgCxvt6FuBUBsb85/IzH9hEf////+ehL0M6kQxMTYt7AJj4kFsfl2/////+ur2/////+lf//6DwkqngR65QuV1JP////NExAoUFAqoAYJoAF68ZgEYVFsT8C/P5cE5E7PIooqSS/Wv9Zv+f9Sfb//+//yqFn/8Ros/8eoWAwf71of/X22/+Z//+xwpnv/6veYkD/9X1ZOqG+/24SlADg3qxwQh//NExAwUCm7qX8IoAs7ojDRnFAmB0dhUSESOLf/0EgGD4cEwOHw4OUw7/kOQ5isYxn//////////0MZhIPDRQeOFxAwoD44EAyIF7f////qIVQZYl9tgEBP+z/ZYFQHD//NExA4UeRa2+DAfINAeoDu7u7z3t+dlq3z9z/Fm1W7N0+g6hii/EIQkesQwXAegljCrw4b//MAqIQIPAgYWDDv//1TATATyQdCRkyZGp//auu1u2ALgAEhk6P9hwhbC//NExA8T8XruXhgTJjzz+SltQRGm/Tp//1v/tCgA0DoUFArCgfPhRkLisSLo0eqCgUJiiLahl3////////h1rAqAgkHjJkBhEiAwYJhiGt21kkACCD9jVlWEENUPL6Xy//NExBIWGbayXBnTZBlS8jJWvrsxxjKPnka///xDAcHiELAkCQJAkCRoQgiuCIeHgyNDYCAHEYODJMJAvIktgFwsA3hggQB9584fGyP/9UreueK1AFAAFikA/7D///5c//NExAwOqp72RggNUpF6O////+z+vPp8lnwONJESRJEcMJghaQQIRCzFE1mIGEHPsCAgfBAEAQBMH/y6v+32GAAoAFximAUJBM4sdymKowTYjUVSTt+dSJKv//////1///NExCQPO67+XigHzv9WJmUmNWVqjKhqFDVHEDiRQoSwzo4ABge3/fb/7XWi0Z2TYOysk+7i0aLrZMpscy7hnslQ0OwPMl+le/tSPNZeH5EzMJobPB1YGKhos6Vdfu6P//NExDoSaU7uXgmGEqlf/6ImMpc6pfFf/mqi8CI4v2QIkG4EBH0JPEcIe0JZYXiUlW0anDCzD4q8RyMMmK7vib5k+T/U1KQnwh//////6//9ssqKxikr//f////9WTyl//NExEMSC6KA8EBE/WDHEkDN1QkwBUFpH4MYnqgOIlJ6oxCla2OT2FDne43FhXiwiYSr/8mmpGszWGsNbDWGTBTJqTezUmsMBDAgaGjwq/////7No///7tX32gUyPVTP//NExE0SeXY0AHhG6Ov/+Kf7etv8WFf4q3i7MW4qKN/FhdmsW1inFhX9YqLdbKhZmsUb+LC7O3FRTi1MQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExFYMOAGgDAhEADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExHgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'),

  play() {
    this.audio.play();
  },
};

/**
 * 内部実装としてMapを使うSet
 */
class MapSet/*::<T>*/ {
  /*::
  map: Map<T, boolean>
  */
  constructor(items/*: Iterable<T>*/) {
    const map = new Map();
    Array.from(items).forEach(item => map.set(item, true));

    this.map = map;
  }

  has(item/*: T */) {
    return this.map.has(item);
  }

  add(item) {
    this.map.set(item, true);
  }

  delete(item) {
    this.map.delete(item);
  }

  [Symbol.iterator]() {
    return (function *(map) {
      for (const [item] of map)
        yield item;
    })(this.map);
  }
}

class TimeoutError extends Error { }

class RemoteStorage {
  static async create(storageUrl, timeout) {
    const storage = new RemoteStorage(storageUrl);
    await storage.appendToWindow(timeout);

    return storage;
  }

  // https://syusui-s.github.io/YouTubeCommentNotifier.user.js/settings/storage.html
  /*::
    iframe: HTMLIFrameElement
    storageUrl: URL
    */
  constructor(storageUrl/*: URL */) {
    const iframe = document.createElement('iframe');
    iframe.src = storageUrl.toString();
    iframe.style.display = 'none';

    Object.assign(this, {
      iframe,
      storageUrl,
    });
  }

  async appendToWindow(timeout = 5000) {
    return new Promise((resolve, reject) => {
      this.iframe.addEventListener('load', () => resolve());
      window.document.body.appendChild(this.iframe);

      setTimeout(() => reject(new TimeoutError()), timeout);
    });
  }

  async request(message/* : { type: string, payload: {} } */, timeout = 5000) {
    const requestId = Math.random();
    const messageStr = JSON.stringify({ ...message, requestId });

    this.iframe.contentWindow.postMessage(messageStr, this.storageUrl.origin);

    return this.listen(requestId, timeout);
  }

  async listen(expectedRequestId, timeout) {
    return new Promise((resolve, reject) => {
      const listener = event => {
        if (event.origin !== this.storageUrl.origin)
          return;

        const data = JSON.parse(event.data);

        if (data.requestId !== expectedRequestId)
          return;

        window.removeEventListener('message', listener);
        resolve(data);
      };

      setTimeout(() => {
        reject(new TimeoutError());
        window.removeEventListener('message', listener);
      }, timeout);

      window.addEventListener('message', listener, false);
    });
  }

  async getItem(key) {
    const { type, payload } = await this.request({
      type: 'GET_ITEM',
      payload: { key },
    });

    switch (type) {
    case 'OK':
      return payload.value;
    default:
      throw new TypeError(`Unknown type '${type}'`);
    }
  }

  async setItem(key, value) {
    const { type } = await this.request({
      type: 'SET_ITEM',
      payload: { key, value },
    });

    switch (type) {
    case 'OK':
      return;
    default:
      throw new TypeError(`Unknown type '${type}'`);
    }
  }

}

class YouTubeSettings {
  static fromObject(obj) {
    const { channelNames } = obj;

    return new this(channelNames);
  }

  static default() {
    return new this([
      'A.I.Channel', 'A.I.Games', 'Kaguya Luna Official', 'Mirai Akari Project', 'Siro Channel', 'ひなたチャンネル (Hinata Channel)', 'けもみみおーこく国営放送', '月ノ美兎', '萌実 & ヨメミ - Eilene', 'SoraCh. ときのそらチャンネル', '鳩羽つぐ', 'Shizuka Rin Official', '樋口楓【にじさんじ所属】', 'バーチャルおばあちゃんねる', 'Aoi ch.', 'ゲーム部プロジェクト', 'のらきゃっとチャンネル', '♥️♠️物述有栖♦️♣️', '【世界初?!】男性バーチャルYouTuber ばあちゃる', '薬袋カルテ - バーチャル診療所', 'エルフのえる【にじさんじ公式】', 'Azuma Lim Channel -アズマ リム-',
      'Mari Channel', '鈴鹿詩子', 'チャンネルコウノスケ', '剣持刀也【にじさんじ所属】', '《にじさんじ所属の女神》モイラ', 'Hacka Channel ハッカドール', 'ヒメ チャンネル', 'Official Mugi Ienaga', 'YUA/藤崎由愛', 'ピーナッツくん!オシャレになりたい!',
      '勇気ちひろ', 'Gengen Channel', '宇志海いちご', '乾ちゃんねる', '甲賀流忍者！ぽんぽこ', 'さなちゃんねる', 'Laki Station ラキステーション', 'ベイレーンチャンネル (Beilene Channel)', 'アキくんちゃんネル', '森中花咲', '渋谷ハジメのはじめ支部',
      'Uka\'s room', 'ウェザーロイド Airi（ポン子）', '文野環【 にじさんじ所属の野良猫 】 文野環【 にじさんじ所属の野良猫 】', 'Zombi-Ko Channel', 'Yuhi Riri Official', 'もちひよこ', 'ケリン', 'あっくん大魔王', 'Roboco Ch. - ロボ子', '伏見ガク【にじさんじ所属】', 'おめがシスターズ [Ω Sister]', 'さはな【VTuber】', 'バーチャルYouTuber万楽えね', 'MeguRoom', 'Gilzaren III Season 1', 'ニーツちゃんねる', '電脳少女シロGames', '滓残', 'バーチャルゴリラ', 'DeepWebUnderground', 'Hibiki Ao', '最果ての魔王ディープブリザード', 'みゅ みゅ', '岩本町芸能社YouTube', '春日部つくし', '北上双葉', '霊電カスカ', '夜桜たま', 'ぱかチューブっ!', '日雇礼子のドヤ街暮らしチャンネル', '海月ねうmituki neu', 'Tsunohane Akagi Vtube', 'もこめめ*channel', '馬越健太郎チャンネル', 'カルロ ピノ', '金剛いろは', '小林幸子のさっちゃんねる', 'ちえり花京院', 'Kanata Hikari / LYTO【バーチャルYoutuber】', 'Hoonie friends', '織田信姫', 'ミディ / 作曲バーチャルyoutuber', 'さょちゃんのVR図書室', '虚拟DD', '木曽あずき', 'バーチャル園児-めいちゃんねる',
      '猫乃木もち', 'いるはーと', '地獄ちゃんねる', 'ぜったい天使くるみちゃん', '異世界転生系魔王ヘルネス', 'ねむちゃんねる【バーチャル美少女YouTuber】', '八重沢なとり', 'ネコケン Nekoken世紀末系猫耳幼女バーチャルYouTuber', '/ ODDAIオッドアイ', 'Kuzuha Channel', 'ユキミお姉ちゃんねる', '魔法少女ちあちあちゃんねる', '牛巻 りこ', 'Channelパゲ美のバーチャルオカマ', '珠根うたChannel', 'モスコミュール放送局', 'ico通夜の黄泉巡りch', 'poemcore tokyo', 'DOLL GAL millna', 'クゥChannel', 'あさひちゃん寝る【バーチャルYouTuber】', '神楽すず', 'ヤマト イオリ', 'たかじんちゃんねる【バーチャルyoutuber】', 'ナイセンチャンネル naisen channel', '天神 子兎音 Tenjin Kotone', 'スパイト-spite-【公式】', 'メイカちゃんねる', '〜旅するバーチャルyoutuber〜動く城のフィオ', '食虫植物TV -Carnivorous Plants videos-', 'イヌージョンCHANNEL', 'Arcadia L.E. Projectバリトンエルフ', 'かまってちゃんねる', 'あいえるちゃんねる/株式会社インフィニットループ', 'リクビッツ / バーチャルYouTuber', '/食虫植物系VTuberネアちゃんねる', 'シテイルチャンネル', 'Reratan', 'デラとハドウ Channel', 'Channelれらたん', '世界クルミ/バーチャルYouTuber', '白二郎/VRアライグマ', 'Mel Channel 夜空メルチャンネル', 'ファイ博士φ電脳サイエンティスト', '真空管ドールズ公式',
      '2.5次元バーチャルキャスター「獣音ロウ&式大元」チャンネル', 'ぼっちぼろまる', '淫獣帝国', 'Kite Channel', 'すくろーるちゃんねる!!! ／ 巣黒るい', 'Kimino Yumeka Official', '新川良', '天野声太郎', 'Sophiaちゃんねる', '人工知能AI ユニ', '白鳥天羽【バーチャル百合お嬢様】', 'RAY WAKANA', 'ありしあちゃんねる', 'MIALチャンネル', 'クーテトラチャンネル', 'スズキセシル', 'バーチャルおじいちゃん / G3Games', 'ドットチャンネル./DotChannel.', '星菜日向夏のゼロ時間目', '魔王の息子わんわん', 'そらのももか', 'コハクのおうち', 'バーチャルYouTuber蟹', 'くのいち子バーチャルユーチューバー', '姫宮縷愛', '魔界四天王ださお', 'バーチャル美少女 ハラムちゃんねる',
      // にじさんじ SEEDs
      '海夜叉神', 'ドーラ', '名伽尾アズマ☀️', '出雲 霞', '轟 京子', 'シスター・クレア', '花畑チャイカ', '社築', '安土桃', 'D.E.放送局【鈴木勝】', '緑仙channel', '卯月コウ', '八朔ゆず',
      // にじさんじ ゲーマーズ
      'Kanae Channel', 'Akabane Channel',
      'saku*channel', '闇夜乃モルル / Yamiyono Moruru', '本間ひまわり - Himawari Honma -',
      '魔界ノりりむ', 'Kuzuha Channel', '雪汝', '椎名唯華',
      // ホロライブ
      'フブキCh。白上フブキ', 'Aki Channel アキ・ローゼンタール', 'Kurisu Channel 人見クリス', 'Haato Channel 赤井はあと', 'Matsuri Channel 夏色まつり',
      // あにまーれ
      'Ichika Channel / 宗谷 いちか 【あにまーれ】', 'Ran Channel / 日ノ隈らん 【あにまーれ】', 'Hinako Channel / 宇森ひなこ 【あにまーれ】', 'Kuromu Channel / 稲荷くろむ 【あにまーれ】', 'Haneru Channel / 因幡はねる 【あにまーれ】', 'AniMare Official / あにまーれ公式',
    ]);
  }

  /*::
  channelNames: MapSet<string>
  */
  constructor(channelNames) {
    Object.assign(this, {
      channelNames: new MapSet(channelNames),
    });
  }

  toObject() {
    const { channelNames } = this; 

    return {
      channelNames: [...channelNames]
    };
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
    if (! settingsJson) return;

    const settingsObj = JSON.parse(settingsJson);
    if (! settingsObj) return;

    return YouTubeSettings.fromObject(settingsObj);
  }

  async saveSettings(settings) {
    const settingsJson = JSON.stringify(settings.toObject());
    return this.store.setItem(this.constructor.keyName, settingsJson);
  }
}

/**
 * ライブストリームに流れるメッセージ
 */
class Message {
  /*::
  author: string
  iconUrl: string
  badgeType: ?string
  body: string
  */
  /**
   * @param {string}  author    投稿者名
   * @param {string}  iconUrl   投稿者のアイコン
   * @param {?string} badgeType 投稿者のバッジ
   * @param {string}  body      メッセージの本体
   */
  constructor(author, iconUrl, badgeType, body) {
    Object.assign(this, { author, iconUrl, badgeType, body, });
  }

  /**
   * メッセージの投稿者名が引数のMapSetに含まれているならtrueを返す
   *
   * @param {MapSet} names 投稿者名のMapSet
   * @return {boolean} 含まれているかどうか
   */
  hasNameSome(names) {
    return names.has(this.author);
  }


  /**
   * モデレータならばtrueを返す
   *
   * モデレータについてはこちら: https://support.google.com/youtube/answer/7023301?hl=ja
   *
   * 「にじさんじ」の放送では、他の配信者がモデレータになっていることが多い。
   */
  isModerator() {
    return this.badgeType === 'moderator';
  }

  /**
   * ライブの配信者であればtrueを返す
   */
  isOwner() {
    return this.badgeType === 'owner';
  }
}

class NotifierGM {
  notify(message) {
    // HACK スパチャなどで本文が空の場合に備えて、各テキストに空白文字を追加している
    // GM.notification は、textが空だと通知してくれないんですよね
    GM.notification({
      title: message.author,
      text: `${message.body} `,
      image: message.iconUrl,
    });
  }

  async requestPermission() {
    return true;
  }

  supported() {
    return 'GM' in window && 'notification' in window.GM;
  }
}

class NotifierNotificationAPI {
  notify(message) {
    new Notification(message.author, {
      body: message.body,
      icon: message.iconUrl,
    });
  }

  async requestPermission() {
    const result = await Notification.requestPermission();

    return result === 'granted';
  }

  supported() {
    return 'Notification' in window;
  }
}

/**
 * 通知に関する処理を置いておく Domain Service
 */
class NotificationService {
  /*::
  notifier: NotifierGM | NotifierNotificationAPI
  notifySound: { play: function }
  authorNames: MapSet<string>
  */

  /**
   * @param {Notifier}      notifier           通知を提供するサービス
   * @param {object}        notifySound        通知音を鳴らしてくれるような仕組みを持つオブジェクト
   * @param {MapSet}        authorNames        通知したい投稿者名の配列
   */
  constructor(notifier, notifySound, authorNames) {
    Object.assign(this, { notifier, notifySound, authorNames });
  }

  /**
   * 指定のメッセージを条件に従って通知します
   *
   * @param {Message} message
   */
  notify(message) {
    if (message.isModerator() || message.isOwner() || message.hasNameSome(this.authorNames)) {
      this.notifier.notify(message);
      this.notifySound.play();
    }
  }

  /**
   * 権限を要求する
   */
  async requestPermission() {
    return this.notifier.requestPermission();
  }
}

async function main() {
  const storageUrl = new URL(`${baseUrl}/settings/storage.html`);

  const remoteStorage = await RemoteStorage.create(storageUrl);
  const repository = new YouTubeSettingsRepository(remoteStorage);
  const settings = await repository.getSettings() || YouTubeSettings.default();

  const notifier = [
    new NotifierGM(),
    new NotifierNotificationAPI(),
  ].find(notifier => notifier.supported());

  if (! notifier) {
    window.alert('ブラウザが通知機能に対応していません。この拡張機能を利用できません。');
    return;
  }

  const notificationService = new NotificationService(notifier, notifySound, settings.channelNames);

  if (! await notificationService.requestPermission()) {
    window.alert('Notificatonの権限がありません');
    return;
  }

  const RETRY    = 30;  // 回
  const INTERVAL = 500; // ミリ秒

  const chatItemList = await retry(RETRY, INTERVAL, async () =>
    document.querySelector('#items.yt-live-chat-item-list-renderer')
  );

  if (! chatItemList)
    return;

  const isEmoji = node =>
    node instanceof Image && node.classList.contains('emoji');

  const bodyElemToText = bodyElem =>
    Array.from(bodyElem.childNodes)
      .map(e => isEmoji(e) ? e.alt : e.textContent )
      .join('');

  const toMessage = chatItem => {
    const nameElem  = chatItem.querySelector('#author-name');
    const iconElem  = chatItem.querySelector('yt-img-shadow > img#img');
    const bodyElem  = chatItem.querySelector('#message');

    if (nameElem && iconElem) {
      const name      = nameElem.textContent;
      const iconUrl   = iconElem.src.replace(/[^/]*\/photo.jpg$/, '');
      const body      = bodyElemToText(bodyElem);
      const badgeType = nameElem.getAttribute('type');

      return new Message(name, iconUrl, badgeType, body);
    }
  };

  const observer = records => {
    records.forEach(record => {
      switch (record.type) {
      case 'childList':
        record.addedNodes.forEach(chatItem => {
          const messageOpt = toMessage(chatItem);
          if (messageOpt)
            notificationService.notify(messageOpt);
        });
        break;
      }
    });
  };

  const m = new MutationObserver(observer);
  m.observe(chatItemList, { childList: true });

  return m;
}

const isWorkUrl = url =>
  workUrls.some(workUrl => url.startsWith(workUrl));

if (isWorkUrl(window.location.href))
  main();
