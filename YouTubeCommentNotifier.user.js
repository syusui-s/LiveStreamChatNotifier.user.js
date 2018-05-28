// ==UserScript==
// @name               YouTubeCommentNotifier.user.js
// @description        YouTubeのライブチャットのストリームで特定のメッセージを通知してくれるやつ
// @namespace          https://github.com/syusui-s/YouTubeCommentNotifier.user.js
// @version            0.9.29
// @match              https://www.youtube.com/*
// @run-at             document-end
// @downloadURL        https://github.com/syusui-s/YouTubeCommentNotifier.user.js/raw/master/YouTubeCommentNotifier.user.js
// @updateURL          https://github.com/syusui-s/YouTubeCommentNotifier.user.js/raw/master/YouTubeCommentNotifier.user.js
// ==/UserScript==

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
 * ライブストリームに流れるメッセージ
 */
class Message {
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
   * メッセージの著者名に引数の正規表現が一致するならtrueを返す
   *
   * @param {RegExp} regex 正規表現
   * @return {boolean} 一致するかどうか
   */
  matchName(regex) {
    return regex.test(this.author);
  }

  matchNameSome(regexs) {
    return regexs.some(r => this.matchName(r));
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
}

/**
 * 通知されるメッセージ
 */
class NotificatonMessage {
  /**
   * メッセージから通知用のメッセージを生成する
   *
   * @param {Message} message メッセージ
   */
  static fromMessage(message) {
    return new this(
      message.author,
      message.iconUrl,
      message.body,
    );
  }

  /**
   * @param {string} title   通知のタイトル
   * @param {string} iconUrl 通知のアイコン
   * @param {string} body    通知の本文
   */
  constructor(title, iconUrl, body) {
    Object.assign(this, { title, iconUrl, body });
  }

  /**
   * Notification APIを用いて、通知する
   */
  async notify() {
    // TODO  直接依存しない形にする
    return new window.Notification(this.title || '', {
      icon: this.iconUrl,
      body: this.body,
    });
  }
}

/**
 * 通知に関する処理を置いておく Domain Service
 */
class NotificationService {
  /**
   * @param {object}        notifySound        通知音を鳴らしてくれるような仕組みを持つオブジェクト
   * @param {array<RegExp>} authorNamePatterns 通知したいメッセージの著者の名前にマッチするパターンの配列
   */
  constructor(notifySound, authorNamePatterns) {
    Object.assign(this, { notifySound, authorNamePatterns });
  }

  /**
   * 指定のメッセージを条件に従って通知します
   *
   * @param {Message} message
   */
  notify(message) {
    if (message.isModerator() || message.matchNameSome(this.authorNamePatterns)) {
      NotificatonMessage
        .fromMessage(message)
        .notify();

      this.notifySound.play();
    }
  }

  /**
   * 通知方式がサポートされているならば、true を返す。
   */
  supported() {
    return !! window.Notification;
  }

  /**
   * 通知方式がサポートされて**いない**ならば、true を返す。
   */
  notSupported() {
    return ! this.supported();
  }

  /**
   * 権限を要求する
   */
  async requestPermission() {
    const result = await Notification.requestPermission();

    if (result === 'granted') {
      return true;
    }

    window.alert('Notification APIで通知の許可がありません。通知を受け取るには、通知を許可してください。');
    return false;
  }
}

/**
 *
 */
async function main() {
  const regexps = [
    /^A\.I\.Channel|A\.I\.Games|Kaguya Luna Official|Mirai Akari Project|Siro Channel|ひなたチャンネル \(Hinata Channel\)|けもみみおーこく国営放送|月ノ美兎|萌実 & ヨメミ - Eilene|SoraCh\. ときのそらチャンネル|鳩羽つぐ|Shizuka Rin Official|樋口楓【にじさんじ所属】|バーチャルおばあちゃんねる|Aoi ch\.|ゲーム部プロジェクト|のらきゃっとチャンネル|♥️♠️物述有栖♦️♣️|【世界初\?!】男性バーチャルYouTuber ばあちゃる|薬袋カルテ - バーチャル診療所|エルフのえる【にじさんじ公式】|Azuma Lim Channel -アズマ リム-$/,
    /^Mari Channel|鈴鹿詩子|チャンネルコウノスケ|剣持刀也【にじさんじ所属】|《にじさんじ所属の女神》モイラ|Hacka Channel ハッカドール|ヒメ チャンネル|Official Mugi Ienaga|YUA\/藤崎由愛|ピーナッツくん!オシャレになりたい!$/,
    /^勇気ちひろ|Gengen Channel|宇志海いちご|乾ちゃんねる|甲賀流忍者！ぽんぽこ|さなちゃんねる|Laki Station ラキステーション|ベイレーンチャンネル \(Beilene Channel\)|アキくんちゃんネル|森中花咲|渋谷ハジメのはじめ支部$/,
    /^Uka's room|ウェザーロイド Airi（ポン子）|文野環【 にじさんじ所属の野良猫 】 文野環【 にじさんじ所属の野良猫 】|Zombi-Ko Channel|Yuhi Riri Official|もちひよこ|ケリン|あっくん大魔王|Roboco Ch\. - ロボ子|Kanae Channel|伏見ガク【にじさんじ所属】|おめがシスターズ \[Ω Sisters\]|さはな【VTuber】|Akabane Channel|バーチャルYouTuber万楽えね|MeguRoom|Gilzaren III Season1|ニーツちゃんねる|電脳少女シロGames|滓残|バーチャルゴリラ|DeepWebUnderground|Hibiki Ao|最果ての魔王ディープブリザード|みゅ みゅ|岩本町芸能社YouTube|春日部つくし|北上双葉|霊電カスカ|夜桜たま|ぱかチューブっ!|日雇礼子のドヤ街暮らしチャンネル|海月ねうmituki neu|Tsunohane Akagi Vtube|もこめめ\*channel|馬越健太郎チャンネル|カルロ ピノ|金剛いろは|小林幸子のさっちゃんねる|ちえり花京院|Kanata Hikari \/ LYTO【バーチャルYoutuber】|Hoonie friends|織田信姫|ミディ \/ 作曲バーチャルyoutuber|さょちゃんのVR図書室|虚拟DD|木曽あずき|バーチャル園児-めいちゃんねる|猫乃木もち|いるはーと|六道冥の地獄ちゃんねる|ぜったい天使くるみちゃん|異世界転生系魔王ヘルネス|ねむちゃんねる【バーチャル美少女YouTuber】|八重沢なとり|シロウケン Shiroken世紀末系バーチャルyoutuber|\/ ODDAIオッドアイ|Kuzuha Channel|ユキミお姉ちゃんねる|魔法少女ちあちあちゃんねる|牛巻 りこ|Channelパゲ美のバーチャルオカマ|珠根うたChannel|モスコミュール放送局|ico通夜の黄泉巡りch|poemcore tokyo|DOLL GAL millna|クゥChannel|あさひちゃん寝る【バーチャルYouTuber】|神楽すず|ヤマト イオリ|たかじんちゃんねる【バーチャルyoutuber】|ナイセンチャンネル naisen channel|天神 子兎音 Tenjin Kotone|スパイト-spite-【公式】|メイカちゃんねる|〜旅するバーチャルyoutuber〜動く城のフィオ|食虫植物TV -Carnivorous Plants videos-|イヌージョンCHANNEL|Arcadia L\.E\. Projectバリトンエルフ|かまってちゃんねる|あいえるちゃんねる\/株式会社インフィニットループ|リクビッツ \/ バーチャルYouTuber|\/食虫植物系VTuberネアちゃんねる|シテイルチャンネル|Reratan|デラとハドウ Channel|Channelれらたん|世界クルミ\/バーチャルYouTuber|白二郎\/VRアライグマ|Mel Channel 夜空メルチャンネル|ファイ博士φ電脳サイエンティスト|真空管ドールズ公式|2\.5次元バーチャルキャスター「獣音ロウ&式大元」チャンネル|ぼっちぼろまる|淫獣帝国|Kite Channel|すくろーるちゃんねる!!! ／ 巣黒るい$/,
    /^Kimino Yumeka Official|新川良|天野声太郎|Sophiaちゃんねる|人工知能AI ユニ|白鳥天羽【バーチャル百合お嬢様】|RAY WAKANA|ありしあちゃんねる|MIALチャンネル|クーテトラチャンネル|スズキセシル|バーチャルおじいちゃん \/ G3Games|ドットチャンネル\.\/DotChannel\.|星菜日向夏のゼロ時間目|魔王の息子わんわん|そらのももか|コハクのおうち|バーチャルYouTuber蟹|くのいち子バーチャルユーチューバー|姫宮縷愛|魔界四天王ださお|バーチャル美少女 ハラムちゃんねる$/
  ];
  const notificationService = new NotificationService(notifySound, regexps);

  if (notificationService.notSupported()) {
    window.console.error('Notification がサポートされていません');
    return;
  }

  if (! await notificationService.requestPermission()) {
    window.console.error('Notificatonの権限がありません');
    return;
  }

  const RETRY    = 30;  // 回
  const INTERVAL = 500; // ミリ秒

  const chatItemList = await retry(RETRY, INTERVAL, async () => {
    const chatIframe   = document.querySelector('#chatframe');
    const chatItemList = chatIframe && chatIframe.contentDocument.querySelector('#items.yt-live-chat-item-list-renderer');

    return chatItemList;
  });

  if (! chatItemList)
    return;

  const toMessage = chatItem => {
    const nameElem  = chatItem.querySelector('#author-name');
    const iconElem  = chatItem.querySelector('yt-img-shadow > img#img');
    const bodyElem  = chatItem.querySelector('#message');

    if (nameElem && iconElem) {
      const name      = nameElem.textContent;
      const iconUrl   = iconElem.src;
      const body      = bodyElem.textContent;
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

main();
