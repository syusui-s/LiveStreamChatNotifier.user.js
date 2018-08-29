// ==UserScript==
// @name               OpenrecCommentNotifier.user.js
// @description        OPENREC.tvのライブチャットのストリームで特定のメッセージを通知してくれるやつ
// @namespace          https://github.com/syusui-s/OpenrecCommentNotifier.user.js
// @version            0.1.0
// @match              https://www.openrec.tv/*
// @run-at             document-end
// @downloadURL        https://syusui-s.github.io/YouTubeCommentNotifier.user.js/OpenrecCommentNotifier.user.js
// @updateURL          https://syusui-s.github.io/YouTubeCommentNotifier.user.js/OpenrecCommentNotifier.user.js
// @grant              GM.notification
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
 * 内部実装としてMapを使うSet
 */
class MapSet {
  constructor(...items) {
    const map = new Map();
    items.forEach(item => map.set(item, true));

    this.map = map;
  }

  has(item) {
    return this.map.has(item);
  }
}

/**
 * ライブストリームに流れるメッセージ
 */
class Message {
  /**
   * @param {string}  author    投稿者名
   * @param {string}  body      メッセージの本体
   */
  constructor(author, body) {
    Object.assign(this, { author, body, });
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
}

class NotifierGM {
  notify(message) {
    // HACK スパチャなどで本文が空の場合に備えて、各テキストに空白文字を追加している
    // GM.notification は、textが空だと通知してくれないんですよね
    GM.notification({
      title: message.author,
      text: `${message.body} `,
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
    if (message.hasNameSome(this.authorNames)) {
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

/**
 * メッセージプロバイダ
 *
 * メッセージを提供する仕組みを抽象化する基底クラス
 * この基底クラスは、メッセージのリスナーを登録する仕組みのみを提供する。
 * サブクラスは、canProvide、start、stopを適切に実装しなければならない。
 */
class MessageProvider {

  /**
   * 引数のメッセージプロバイダからプロバイド可能なものを返す。
   * 注意: タイムアウトは各プロバイダの canProvide の実装に依存する。
   *
   * @return 利用可能なプロバイダ または undefined を返すPromise
   */
  static async selectProvider(providers) {
    return Promise.race(providers.map(async provider =>
      await provider.canProvide() ? provider : undefined
    ));
  }

  constructor() {
    Object.assign(this, {
      listeners: []
    });
  }

  /**
   * メッセージをリッスンする関数を登録する。
   *
   * 関数は新しいメッセージが見つかった場合に、
   * そのメッセージを引数として呼び出されるようになる。
   *
   * @param {function} listener メッセージを受け取る関数
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * リスナーにメッセージを通知する
   * 注: 内部的に用いる関数なので、外部から呼び出さないこと
   */
  provideMessage(message) {
    this.listeners.forEach(listener =>
      listener(message)
    );
  }

  /**
   * プロバイダがメッセージを提供できる場合にtrueを返す
   *
   * @return {Promise} メッセージを提供できる場合に true を resolve するPromise
   */
  async canProvide() {
    throw new Error('NotImplemented');
  }

  /**
   * メッセージの提供を開始する
   *
   * この関数は次のような動作を行うことが期待される:
   * 方法は問わないが、例えば追加されるDOMノードを監視するなどの
   * 方法を用いて、新しいメッセージの監視を行う。
   * 新しいメッセージが見つかれば、そのメッセージを provideMessage により
   * リスナーに通知する。
   */
  start() {
    throw new Error('NotImplemented');
  }

  /**
   * メッセージの提供を終了する
   *
   * この関数は次のような動作を行うことが期待される:
   * startにより行われていた新しいメッセージの監視を停止し、
   * メッセージを通知することをやめる。
   */
  stop() {
    throw new Error('NotImplemented');
  }

}

/**
 * MutationObserverを用いたメッセージプロバイダ
 *
 * MutationObserverを用いて、
 * 監視対象のDOMの子要素（サブツリーを含む）に対するDOMの挿入を監視して、
 * 変更があった場合に parseMessage を用いて、メッセージへの変換を試みる。
 * もし、メッセージへの変換に成功すれば、メッセージをリスナーに通知する。
 *
 * サブクラスは、parseMessage、get observeTarget を適切に実装しなければならない。
 */
class MutationObserverMessageProvider extends MessageProvider {

  start() {
    if (this.observer)
      return;

    const observer = records => {
      records.forEach(record => {
        switch (record.type) {
        case 'childList':
          record.addedNodes && record.addedNodes.forEach(chatItem => {
            const messageOpt = this.parseMessage(chatItem);
            if (messageOpt)
              this.provideMessage(messageOpt);
          });
          break;
        }
      });
    };

    const m = new MutationObserver(observer);
    m.observe(this.observeTarget, { childList: true, subtree: true });

    this.observer = m;
  }

  stop() {
    if (this.observer)
      this.observer.disconnect();
  }

  /**
   * 引数のDOMノードをメッセージに変換する
   *
   * @param {HTMLElement} メッセージに変換したいDOMノード
   * @return {?Message} メッセージ。変換に失敗した場合は null を返す。
   */
  parseMessage() {
    throw new Error('NotImplemented');
  }

  /**
   * 監視対象のDOMノードを返す
   *
   * @param {HTMLElement} 監視対象のDOMノード
   */
  get observeTarget() {
    throw new Error('NotImplemented');
  }

}

/**
 * 通常表示時のメッセージプロバイダ
 */
class NormalMessageProvider extends MutationObserverMessageProvider {

  static get targetNodeSelector() {
    return '.chat-list-content';
  }

  async canProvide() {
    const RETRY    = 30;  // 回
    const INTERVAL = 500; // ミリ秒

    const commentNode = await retry(RETRY, INTERVAL, async () =>
      document.querySelector(this.constructor.targetNodeSelector)
    );

    return !! commentNode;
  }

  get observeTarget() {
    return document.querySelector(this.constructor.targetNodeSelector);
  }

  parseMessage(chatItem) {
    const nameElem  = chatItem.querySelector('.text-ellipsis');
    const bodyElem  = chatItem.querySelector('.chat-content');

    if (nameElem) {
      const name    = nameElem.textContent;
      const body    = bodyElem.textContent;

      return new Message(name, body);
    }
  }
}

/**
 *
 */
async function main() {
  const channels = new MapSet(
    // にじさんじ 1期生
    '月ノ美兎', '勇気ちひろ', 'える', '樋口楓', '静凛', '渋谷ハジメ', '鈴谷アキ', 'モイラ',
    // にじさんじ 2期生
    '鈴鹿詩子', '宇志海いちご', '家長むぎ', '夕陽リリ', '物述有栖', '文野環',
    '伏見ガク', 'ギルザレンⅢ世', '剣持刀也', '森中花咲',
    // にじさんじ COO
    'いわながちゃん',
    'にじさんじofficial',
    // にじさんじ ゲーマーズ
    '叶', '赤羽葉子', '笹木咲', '闇夜乃モルル', '本間ひまわり', '魔界ノりりむ', '葛葉',
    '雪汝', '椎名唯華', 'ChroNoiR',
    // にじさんじ SEEDs
    '出雲霞', '安土桃', '卯月コウ',
  );

  const notifier = [
    new NotifierGM(),
    new NotifierNotificationAPI(),
  ].find(notifier => notifier.supported());

  if (! notifier) {
    window.alert('ブラウザが通知機能に対応していません。この拡張機能を利用できません。');
    return;
  }

  const notificationService = new NotificationService(notifier, notifySound, channels);

  if (! await notificationService.requestPermission()) {
    window.alert('Notificatonの権限がありません');
    return;
  }

  const provider = await MessageProvider.selectProvider([
    new NormalMessageProvider(),
  ]);

  provider.start();
  provider.addListener(message =>
    notificationService.notify(message)
  );

}

main();
